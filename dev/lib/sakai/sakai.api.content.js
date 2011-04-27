/**
 *
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */

define(["jquery", "/dev/configuration/config.js", "/dev/lib/misc/parseuri.js"],function($, sakai_conf) {
    var sakai_content = {
        /**
         * Set the permissions for an array of uploaded files or links
         * @param {String} permissionValue either 'public', 'everyone', 'group' or 'private'
         * @param {Array} filesArray Array of files containing the 'hashpath' property per file. This hashpath is the resourceID of the file
         * @param {Function} callback Function to call when the permissions have been saved or failed to save.
         *                   The callback function is provided with a Boolean. True = permissions successfully set, False = permissions not set (error)
         */
        setFilePermissions : function(filesArray, callback, groupID){
            // Check which value was selected and fill in the data object accordingly
            var data = [];
            var file;
            for (file in filesArray) {
                if (filesArray.hasOwnProperty(file)) {
                    var contentPath = "/p/" + filesArray[file].hashpath;
                    var item;
                    switch (filesArray[file].permissions) {
                    // Logged in only
                    case "everyone":
                        item = {
                            "url": contentPath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": "everyone",
                                ":viewer@Delete": "anonymous"
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": "everyone",
                                "privilege@jcr:read": "granted"
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": "anonymous",
                                "privilege@jcr:read": "denied"
                            }
                        };
                        data[data.length] = item;
                        break;
                    // Public
                    case "public":
                        item = {
                            "url": contentPath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": ["everyone", "anonymous"]
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": ["everyone", "anonymous"],
                                "privilege@jcr:read": "granted"
                            }
                        };
                        data[data.length] = item;
                        break;
                    // Managers and viewers only
                    case "private":
                        item = {
                            "url": contentPath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer@Delete": ["anonymous", "everyone"]
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": ["everyone", "anonymous"],
                                "privilege@jcr:read": "denied"
                            }
                        };
                        data[data.length] = item;
                        break;
                    case "group":
                        item = {
                            "url": contentPath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": groupID
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": ["everyone", "anonymous"],
                                "privilege@jcr:read": "denied"
                            }
                        };
                        data[data.length] = item;
                        break;
                    }
                }
            }
            $.ajax({
                url: sakai_conf.URL.BATCH,
                traditional: true,
                type: "POST",
                cache: false,
                data: {
                    requests: $.toJSON(data)
                },
                success: function(data){
                    if (callback) {
                        callback(true);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if (callback) {
                        callback(false);
                    }
                }
            });
        },

        /**
         * Returns true if the user is a viewer for the given content item,
         * false otherwise.
         *
         * @param content  content profile data as defined in loadContentProfile()
         *   of /dev/javascript/content_profile.js
         * @param userid   the id of the user to search for
         */
        isUserAViewer: function (content, userid) {
            if (content && userid && content.hasOwnProperty("members") &&
                content.members.hasOwnProperty("viewers")) {
                for (var i in content.members.viewers) {
                    if (content.members.viewers.hasOwnProperty(i)) {
                        if (userid === content.members.viewers[i].userid || userid === content.members.viewers[i].groupid) {
                            return true;
                        }
                    }
                }
            }
            if (content && userid && content.hasOwnProperty("sakai:pooled-content-viewer")) {
                for (var i = 0; i < content["sakai:pooled-content-viewer"].length; i++) {
                    if (userid === content["sakai:pooled-content-viewer"][i]) {
                        return true;
                    }
                }
            }
            return false;
        },


        /**
         * Returns true if the user is a manager for the given content item,
         * false otherwise.
         *
         * @param content  content profile data as defined in loadContentProfile()
         *   of /dev/javascript/content_profile.js
         * @param userid  the id of the user to search for
         */
        isUserAManager: function (content, userid) {
            if (content && userid && content.hasOwnProperty("members") &&
                content.members.hasOwnProperty("managers")) {
                for (var i in content.members.managers) {
                    if (content.members.managers.hasOwnProperty(i)) {
                        if (userid === content.members.managers[i].userid || userid === content.members.managers[i].groupid) {
                            return true;
                        }
                    }
                }
            }
            if (content && userid && content.hasOwnProperty("sakai:pooled-content-manager")) {
                for (var i = 0; i < content["sakai:pooled-content-manager"].length; i++) {
                    if (userid === content["sakai:pooled-content-manager"][i]) {
                        return true;
                    }
                }
            }
            return false;
        },

        addToLibrary: function(contentId, userId, callBack){
            $.ajax({
                url: "/p/" + contentId + ".members.json",
                type: "POST",
                data: {
                    ":viewer": userId
                },
                success: function () {
                    if (callBack){
                        callBack(contentId, userId);
                    }
                },
                error: function (data) {
                    debug.error("sharecontent failed to change content " +
                        "permission to 'viewer' for member: " + userId);
                    debug.error("xhr data returned: " + data);
                }
            });
        },

        /**
         * Returns a preview URL for known services, empty string otherwise
         *
         * @param url The url of the content in an external service that you'd like a preview of
         */
        getPreviewUrl : function(url) {
            var uri = parseUri(url);
            var result = {};
            result.type = "iframe";
            result.url = url;
            if (/vimeo\.com$/.test(uri.host)) {
                if (uri.path !== "") {
                  result.url = "http://player.vimeo.com/video" + uri.path;
                }
            } else if (/picasaweb\.google\.com$/.test(uri.host)) {
                var splitPath = uri.path.split('/');
                if (splitPath.length >= 3 && uri.anchor !== "") {
                    var userId = splitPath[1];
                    var albumName = splitPath[2];
                    var photoId = uri.anchor;

                    $.ajax({
                        url: "/var/proxy/google/picasaGetPhoto.json",
                        type: "GET",
                        async: false,
                        cache: false,
                        data: {
                            "userId" : userId,
                            "albumName" : albumName,
                            "photoId" : photoId
                        },
                        success: function(data){
                            var splitPath = data.feed.icon["$t"].split('/');
                            // insert the size we want as the second to last
                            // entry in the array
                            splitPath.splice(-2, 1, "s920");
                            result.url = splitPath.join('/');
                            result.type = "image";
                        }
                    });
                }
            } else if (/youtube\.com$/.test(uri.host)) {
                if (uri.queryKey.v){
                    result.url = url;
                    result.type = "video";
                    result.avatar = "http://img.youtube.com/vi/" + uri.queryKey.v + "/0.jpg";
                }
            } else if (/amazon\.com$/.test(uri.host)) {
                var asin = uri.path.split("/");
                if (asin && asin[asin.indexOf('dp')] !== -1){
                    asin = asin[asin.indexOf('dp')+1];
                    result.url = "http://kindleweb.s3.amazonaws.com/app/1.0.11.053.093655/KindleReaderApp.html?asin=" + asin + "&containerID=kindleReaderDiv59&tophostname=localhost&iframeName=kindleReaderIFrame1300121366106&dp=0";
                    result.type = "iframe";
                }
            } else if (/videolectures\.net$/.test(uri.host)) {
                var lectureId = uri.path.split('/')[1];
                if (lectureId) {
                    $.ajax({
                        url: "/var/proxy/videolectures/videoLecturesGetSnippet.json",
                        type: "GET",
                        async: false,
                        cache: false,
                        data: {
                            "lectureId" : lectureId
                        },
                        success: function(data){
                            result.url = $($(data).find("textarea").val()).find("img").attr("src");
                            result.type = "image";
                        }
                    });
                }
            } else if (/flickr\.com$/.test(uri.host)) {
                var fPhotoId = uri.path.split('/')[3];
                if (fPhotoId) {
                    $.ajax({
                        url: "/var/proxy/flickr/flickrGetPhotoInfo.json",
                        type: "GET",
                        async: false,
                        cache: false,
                        dataType: "json",
                        data: {
                            "photoId": fPhotoId
                        },
                        success: function(data){
                            result.url = "http://farm" + data.photo.farm + ".static.flickr.com/" + data.photo.server + "/" + data.photo.id + "_" + data.photo.secret + "_b.jpg";
                            result.type = "image";
                        }
                    });
                }
            } else if (/slideshare\.net$/.test(uri.host)) {
                if (uri.path !== "") {
                    $.ajax({
                        url: "/var/proxy/slideshare/slideshareGetSlideshow.json",
                        type: "GET",
                        dataType: "xml",
                        async: false,
                        cache: false,
                        data: {
                            "slideshow_url": uri.source
                        },
                        success: function(data){
                            if (!$(data).find("SlideShareServiceError").text()){
                                var embed = $($(data).find("Embed").text());
                                // resize to fit contentpreview
                                embed.find('*[style*="width"]').css("width", "100%");
                                embed.find('*[style*="height"]').css("height", "500px");
                                embed.find('*[width="425"]').attr("width", "100%");
                                embed.find('*[height="355"]').attr("height", "500");

                                result.url = embed.html();
                                result.type = "embed";
                            }
                        }
                    });
                }
            } else if (/maps\.google\.com$/.test(uri.host)) {
                if (uri.path !== "") {
                    result.url = uri.source;
                    result.type = "googlemap";
                }
            }
            return result;
        },

        /**
         * Returns an object with data for the provided mimetype
         *
         * @param mimetype  standard mimetype string (i.e. "image/png", "application/pdf", etc.)
         * @return if we have a match for the given mimetype, an Object with
         *     the following params will be returned:
         *      - cssClass: css class to assign a small (~16px) sprite image as the background
         *            image for an element
         *      - URL: path to an image (~128px) that represents this content type
         *      - description: internationalizable bundle key for a short description
         *            for this content type (i.e. "PDF document")
         *     If there is no match, a general "Other document" object is returned
         */
        getMimeTypeData: function (mimetype) {
            if (mimetype && typeof(mimetype) === "string") {
                var mimetypeObj = sakai_conf.MimeTypes[mimetype];
                if (mimetypeObj) {
                    return mimetypeObj;
                }
            }
            return sakai_conf.MimeTypes.other;
        },

        getMimeType : function(content){
            var mimeType = "other";
            if (content['_mimeType']){
                mimeType = content['_mimeType'];
            } else if (content['sakai:custom-mimetype']){
                mimeType = content['sakai:custom-mimetype'];
            }
            return mimeType;
        },

        getThumbnail : function(content){
            var thumbnail = "";
            if (content['_mimeType/page1-small']) {
                thumbnail="/p/" + content['jcr:name'] + ".page1-small.jpg";
            }
            return thumbnail;
        },

        isJwPlayerSupportedVideo : function(mimeType) {
            supported = false;
            if (mimeType && mimeType.substring(0, 6) === "video/" ){
                var mimeSuffix = mimeType.substring(6);
                if (mimeSuffix === "x-flv" || mimeSuffix === "mp4" || mimeSuffix === "3gpp" || mimeSuffix === "quicktime") {
                    supported = true;
                }
            }
            return supported;
        },

        hasPreview : function(content){
            var result = false;
            var mimeType = sakai_content.getMimeType(content);
            if (content["sakai:preview-url"] ||
                    sakai_content.getThumbnail(content) ||
                    mimeType.substring(0,6) === "image/" ||
                    mimeType === "text/html" ||
                    sakai_content.isJwPlayerSupportedVideo(mimeType)) {
                result = true;
            }
            return result;
        },

        getCommentCount : function(content){
            var count = 0;
            $.each(content[content["jcr:path"] + "/comments"], function(key, val){
                var regex = new RegExp(content["jcr:path"] + "/comments/");
                if (key.match(regex)){
                    count++;
                }
            });
            return count;
        }
    };
    return sakai_content;
});
