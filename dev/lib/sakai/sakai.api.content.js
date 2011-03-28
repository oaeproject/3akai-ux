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
    return {
        /**
         * Set the permissions for an array of uploaded files or links
         * @param {String} permissionValue either 'public', 'everyone', 'group' or 'private'
         * @param {Array} filesArray Array of files containing the 'hashpath' property per file. This hashpath is the resourceID of the file
         * @param {Function} callback Function to call when the permissions have been saved or failed to save.
         *                   The callback function is provided with a Boolean. True = permissions successfully set, False = permissions not set (error)
         */
        setFilePermissions : function(permissionValue, filesArray, callback, groupID){
            // Check which value was selected and fill in the data object accordingly
            var data = [];
            var file;
            for (file in filesArray) {
                if (filesArray.hasOwnProperty(file)) {
                    var contentPath = "/p/" + filesArray[file].hashpath;
                    var item;
                    switch (permissionValue) {
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
                    callback(true);
                },
                error: function(xhr, textStatus, thrownError){
                    callback(false);
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
                        if (userid === content.members.viewers[i].userid) {
                            return true;
                        }
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
                        if (userid === content.members.managers[i].userid) {
                            return true;
                        }
                    }
                }
            }
            return false;
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
                result.url = "http://player.vimeo.com/video" + uri.path;
            } else if (/picasaweb\.google\.com$/.test(uri.host)) {
                var userId = uri.path.split('/')[1];
                var albumName = uri.path.split('/')[2];
                var photoId = uri.anchor;
                result.url = "https://picasaweb.google.com/data/feed/base/user/" + userId + "/album/" + albumName + "/photoid/" + photoId + "?alt=json";
                result.type = "image";
            } else if (/youtube\.com$/.test(uri.host)) {
                result.url = url;
                result.type = "video";
            } else if (/amazon\.com$/.test(uri.host)) {
                var asin = uri.path.split("/");
                asin = bookId[bookId.indexOf('dp')+1];
                result.url = "http://kindleweb.s3.amazonaws.com/app/1.0.11.053.093655/KindleReaderApp.html?asin=" + asin + "&containerID=kindleReaderDiv59&tophostname=localhost&iframeName=kindleReaderIFrame1300121366106&dp=0";
                result.type = "iframe";
            }
            return result;
        }
    };
});
