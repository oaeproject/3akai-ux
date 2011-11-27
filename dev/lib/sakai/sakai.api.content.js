/*
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
 */
define(
    [
        "jquery",
        "config/config_custom",
        "sakai/sakai.api.server",
        "sakai/sakai.api.groups",
        "sakai/sakai.api.util",
        "sakai/sakai.api.i18n",
        "sakai/sakai.api.l10n",
        "sakai/sakai.api.user",
        "misc/parseuri"
    ],
    function($, sakai_conf, sakai_serv, sakai_groups, sakai_util, sakai_i18n, sakai_l10n, sakai_user) {

    var sakai_content = {
        /**
         * Parses a full profile as received from the loadFullProfile function
         * @param {Object} data Object containing data as received from the loadFullProfile function.
         * @param {Function} callback Function to execute when the function finishes
         */
        parseFullProfile: function(data, callback){
            // contains data to return in callback
            var parsedData = [];
            // temporary object to store in parsedData
            var tempItem = {};

            // Loops over results and gets the data to put in tempItem
            // Each tempItem consists of 4 requests made by loadFullProfile, these are:
            //    - poolid.infinity.json -> Fetches all general data for a content item (description, tags, title,...)
            //    - members.json -> Fetches all viewers and managers for a content item
            //    - versions.json -> Fetches all versions for a content item
            //    - activityfeed.json -> Fetches all activity for a content item
            $.each(data, function(i, dataItem){
                // results for poolid.infinity.json
                if(dataItem.url.indexOf(".infinity.json") > -1){

                    // Stores all general data on tempItem.data
                    tempItem = {};
                    tempItem.data = $.parseJSON(dataItem.body);

                } else if(dataItem.url.indexOf(".members.json") > -1){

                    // results for members.json
                    // Members are parsed an put into a .viewers and .managers object in tempItem
                    var contentMembers = $.parseJSON(dataItem.body);
                    contentMembers.viewers = contentMembers.viewers || {};
                    // Parse the viewers and add them to the .viewers object.
                    $.each(contentMembers.viewers, function(index, resultObject) {
                        if (contentMembers.viewers[index].hasOwnProperty("basic") &&
                            contentMembers.viewers[index].basic.hasOwnProperty("elements") &&
                            contentMembers.viewers[index].basic.elements.hasOwnProperty("picture") &&
                            contentMembers.viewers[index].basic.elements.picture.hasOwnProperty("value")) {
                                contentMembers.viewers[index].picture = $.parseJSON(contentMembers.viewers[index].basic.elements.picture.value);
                        }
                        if (contentMembers.viewers[index]["sakai:excludeSearch"] === "true"){
                            contentMembers.viewers[index].pseudoGroup = true;
                            contentMembers.viewers[index]["sakai:group-title"] = contentMembers.viewers[index]["sakai:parent-group-title"] + " (" + sakai_i18n.getValueForKey(contentMembers.viewers[index]["sakai:role-title-plural"]) + ")";
                            contentMembers.viewers[index].parent = {};
                            contentMembers.viewers[index].parent["sakai:group-id"] = contentMembers.viewers[index]["sakai:parent-group-id"];
                            contentMembers.viewers[index].parent["sakai:group-title"] = contentMembers.viewers[index]["sakai:parent-group-title"];
                            contentMembers.viewers[index].parent["sakai:role-title"] = contentMembers.viewers[index]["sakai:group-title"];
                        }
                    });

                    contentMembers.managers = contentMembers.managers || {};
                    // Parse the managers and add them to the .managers object.
                    $.each(contentMembers.managers, function(index, resultObject) {
                        if (contentMembers.managers[index].hasOwnProperty("basic") &&
                            contentMembers.managers[index].basic.hasOwnProperty("elements") &&
                            contentMembers.managers[index].basic.elements.hasOwnProperty("picture") &&
                            contentMembers.managers[index].basic.elements.picture.hasOwnProperty("value")) {
                                contentMembers.managers[index].picture = $.parseJSON(contentMembers.managers[index].basic.elements.picture.value);
                        }
                        if (contentMembers.managers[index]["sakai:excludeSearch"] === "true"){
                            contentMembers.managers[index].pseudoGroup = true;
                            contentMembers.managers[index]["sakai:group-title"] = contentMembers.managers[index]["sakai:parent-group-title"] + " (" + sakai_i18n.getValueForKey(contentMembers.managers[index]["sakai:role-title-plural"]) + ")";
                            contentMembers.managers[index].parent = {};
                            contentMembers.managers[index].parent["sakai:group-id"] = contentMembers.managers[index]["sakai:parent-group-id"];
                            contentMembers.managers[index].parent["sakai:group-title"] = contentMembers.managers[index]["sakai:parent-group-title"];
                            contentMembers.managers[index].parent["sakai:role-title"] = contentMembers.managers[index]["sakai:group-title"];
                        }
                    });

                    // filter out the the everyone group and the anonymous user
                    contentMembers.viewers = $.grep(contentMembers.viewers, function(resultObject, index){
                        if (resultObject['sakai:group-id'] !== 'everyone' &&
                            resultObject['rep:userId'] !== 'anonymous') {
                            return true;
                        }
                        return false;
                    });

                    // Add counts for managers and viewers
                    contentMembers.counts = { people: 0, groups: 0};
                    $.each(contentMembers.viewers.concat(contentMembers.managers), function(i, member) {
                        if (member.hasOwnProperty("userid")) {
                            contentMembers.counts.people++;
                        } else {
                            contentMembers.counts.groups++;
                        }
                    });

                    // Add the members to the tempItem object
                    tempItem.members = contentMembers;

                } else if(dataItem.url.indexOf(".versions.json") > -1){

                    // results for versions.json
                    // Parses all information related to versions and stores them on tempItem
                    var versionInfo =$.parseJSON(dataItem.body);
                    var versions = [];
                    for (var j in versionInfo.versions) {
                        if(versionInfo.versions.hasOwnProperty(j)){
                            var splitDate = versionInfo.versions[j]["_created"];
                            versionInfo.versions[j]["_created"] = sakai_l10n.transformDate(new Date(splitDate));
                            versions.push(versionInfo.versions[j]);
                        }
                    }
                    versionInfo.versions = versions.reverse();
                    // Add the versions to the tempItem object
                    tempItem.versions = versionInfo;

                }else if (dataItem.url.indexOf("activityfeed.json") > -1){

                    // results for activity.json
                    tempItem.activity = $.parseJSON(dataItem.body);

                    // Add in some extra data on the object about the content
                    // Is current user manager/viewer
                    tempItem.isManager = sakai_content.isUserAManager(tempItem.data, sakai_user.data.me);
                    tempItem.isViewer = sakai_content.isUserAViewer(tempItem.data, sakai_user.data.me);

                    // Directory location
                    tempItem.saveddirectory = [];
                    if (tempItem.data && tempItem.data['sakai:tags']) {
                        tempItem.saveddirectory = sakai_util.getDirectoryTags(tempItem.data["sakai:tags"].toString());
                    }

                    // Set the mimetype of the content
                    var mimeType = sakai_content.getMimeType(tempItem.data);
                    tempItem.data.mimeType = mimeType;
                    if (sakai_conf.MimeTypes[mimeType]) {
                        tempItem.data.iconURL = sakai_conf.MimeTypes[mimeType].URL;
                    } else {
                        tempItem.data.iconURL = sakai_conf.MimeTypes["other"].URL;
                    }

                    // Add paths to the content item
                    tempItem.content_path = "/p/" + tempItem.data._path;
                    tempItem.smallPath = "/p/" + tempItem.data._path;
                    tempItem.url = sakai_conf.SakaiDomain + "/p/" + tempItem.data._path + "/" + sakai_util.safeURL(tempItem.data["sakai:pooled-content-file-name"]);
                    tempItem.path = "/p/" + tempItem.data._path + "/" + sakai_util.safeURL(tempItem.data["sakai:pooled-content-file-name"]);

                    // All data gathered in the tempItem object so it's now pushed to parsedData
                    // and will be returned in the callback function.
                    parsedData.push(tempItem);

                }
            });

            // If callback is supplied it is executed
            // otherwise it will just return the data.
            if($.isFunction(callback)){
                callback(parsedData);
            } else {
                return parsedData;
            }

        },
        /**
         * Loads the full content profile containing:
         *    - poolid.infinity.json -> Fetches all general data for a content item (description, tags, title,...)
         *    - members.json -> Fetches all viewers and managers for a content item
         *    - versions.json -> Fetches all versions for a content item
         *    - activityfeed.json -> Fetches all activity for a content item
         * and returns it in a callback function
         * @param {Array} Array of content ID's to load the profile for
         * @param {Function} callback Function that executes when all data thas been gathered,
         *                            passes through the unparsed results.
         */
        loadFullProfile: function(idArray, callback){
            var batchRequests = [];
            $.each(idArray, function(i, poolid){
                batchRequests.push({
                        "url": poolid + ".infinity.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": poolid + ".members.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": poolid + ".versions.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": sakai_conf.URL.POOLED_CONTENT_ACTIVITY_FEED,
                        "method":"GET",
                        "cache":false,
                        "dataType":"json",
                        "parameters":{
                            "p":poolid,
                            "items":"1000"
                        }
                    }
                );
            });

            sakai_serv.batch(batchRequests, function(success, data) {
                if (success) {
                    if($.isFunction(callback)){
                        callback(success, data);
                    } else {
                        return data;
                    }
                } else {
                    if($.isFunction(callback)){
                        callback(success);
                    } else {
                        return success;
                    }
                }
            });
        },
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
                                "principalId": ["everyone"],
                                "privilege@jcr:read": "granted"
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": ["anonymous"],
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
                                "principalId": ["everyone"],
                                "privilege@jcr:read": "denied"
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": ["anonymous"],
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
                                "principalId": ["everyone"],
                                "privilege@jcr:read": "denied"
                            }
                        };
                        data[data.length] = item;
                        item = {
                            "url": contentPath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": {
                                "principalId": ["anonymous"],
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
         * Sets ACLs on a specified path and executes a callback if specified.
         * @param {String} _path The path on which the ACLs need to be set or an array of paths on which to set ACLs
         * @param {String} _permission 'anonymous', 'everyone', 'contacts' or 'private' determining what ACLs need to be set
         *                 This should be an array of equal length of _path is an array
         * @param {String} me Userid of the currently logged in user
         * @param {Function} callback Function to execute when permissions have been set or failed to be set
         */
        setACLsOnPath: function(_path, _permission, me, callback){
            var paths = []; var permissions = []; var ACLs = [];
            if (typeof _path === "string"){
                paths.push(_path);
                permissions.push(_permission);
            } else {
                paths = _path;
                permissions = _permission;
            }
            for (var i = 0; i < paths.length; i++){
                var path = paths[i] + ".modifyAce.html";
                var permission = permissions[i];
                switch (permission) {
                    case "anonymous":
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "everyone",
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "anonymous",
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "g-contacts-" + me,
                                "privilege@jcr:read": "granted"
                            }
                        });
                        break;
                    case "everyone":
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "g-contacts-" + me,
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "everyone",
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "anonymous",
                                "privilege@jcr:read": "denied"
                            }
                        });
                        break;
                    case "contacts":
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": me,
                                "privilege@jcr:write": "granted",
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "g-contacts-" + me,
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "everyone",
                                "privilege@jcr:read": "denied"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "anonymous",
                                "privilege@jcr:read": "denied"
                            }
                        });
                        break;
                    case "private":
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": me,
                                "privilege@jcr:write": "granted",
                                "privilege@jcr:read": "granted"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "g-contacts-" + me,
                                "privilege@jcr:read": "denied"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "everyone",
                                "privilege@jcr:read": "denied"
                            }
                        });
                        ACLs.push({
                            "url": path,
                            "method": "POST",
                            "parameters": {
                                "principalId": "anonymous",
                                "privilege@jcr:read": "denied"
                            }
                        });
                        break;
                }
                
            }
            

            $.ajax({
                url: sakai_conf.URL.BATCH,
                traditional: true,
                type: "POST",
                cache: false,
                data: {
                    requests: $.toJSON(ACLs)
                },
                success: function(data){
                    if ($.isFunction(callback)) {
                       callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    debug.error(xhr, textStatus, thrownError);
                    if ($.isFunction(callback)) {
                       callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Check whether a user can manage a piece of content, either by being a direct or
         * indirect (through group membership) manager
         * @param {Object} content      content profile data as defined in loadContentProfile()
         * @param {Object} meObj        me object of the user you are checking manager permissions for
         * @param {Object} directOnly   specifies whether or not the manager relationship needs to be direct
         */
        isUserAManager: function(content, meObj, directOnly) {
            if (content && content["sakai:pooled-content-manager"]) {
                for (var i = 0; i < content["sakai:pooled-content-manager"].length; i++) {
                    var authorizable = content["sakai:pooled-content-manager"][i];
                    // Direct association
                    if (authorizable === meObj.user.userid) {
                        return true;
                    // Indirect association
                    } else if (!directOnly && sakai_groups.isCurrentUserAMember(authorizable, meObj)) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Check whether a user is a viewer of a piece of content, either by being a direct or
         * indirect (through group membership) viewer
         * @param {Object} content      content profile data as defined in loadContentProfile()
         * @param {Object} meObj        me object of the user you are checking manager permissions for
         * @param {Object} directOnly   specifies whether or not the manager relationship needs to be direct
         */
        isUserAViewer: function(content, meObj, directOnly) {
            if (content && content["sakai:pooled-content-viewer"]) {
                for (var i = 0; i < content["sakai:pooled-content-viewer"].length; i++) {
                    var authorizable = content["sakai:pooled-content-viewer"][i];
                    // Direct association
                    if (authorizable === meObj.user.userid) {
                        return true;
                    // Indirect association
                    } else if (!directOnly && sakai_groups.isCurrentUserAMember(authorizable, meObj)) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Check whether a given content item lives in a specific content library (either a
         * personal library or a group library
         * @param {Object} content    content profile data as defined in loadContentProfile()
         * @param {Object} userid     authorizable id for which we're checking presence in the library
         */
        isContentInLibrary: function(content, userid){
            var fakeMeObj = {
                "user": {
                    "userid": userid
                }
            };
            return sakai_content.isUserAViewer(content, fakeMeObj, true) || sakai_content.isUserAManager(content, fakeMeObj, true);
        },

        /**
         * Shares content with a user and sets permissions for the user.
         * This function can handle single user/content or multiple user/content items in an array
         * @param {Object} contentId   Unique pool id of the content being added to the library
         * @param {Object} userId      Authorizable id of the library to add this content in
         * @param {Boolean} canManage    Set to true if the user that's being shared with should have managing permissions
         * @param {Object} callBack    Function to call once the content has been added to the library
         */
        addToLibrary: function(contentId, userId, canManage, callBack){
            // content array
            var toAdd = [];
            if (_.isString(contentId)){
                toAdd.push(contentId);
            } else {
                toAdd = contentId;
            }
            // user array
            var addTo = [];
            if (_.isString(userId)){
                addTo.push(userId);
            } else {
                addTo = userId;
            }
            var batchRequests = [];
            for (var i = 0; i < addTo.length; i++){
                var params = {};
                if (canManage){
                    params = {
                        ":manager": addTo[i]
                    };
                } else {
                    params = {
                        ":viewer": addTo[i]
                    };
                }
                for (var j = 0; j < toAdd.length; j++){
                    batchRequests.push({
                        url: "/p/" + toAdd[j] + ".members.json",
                        parameters: params,
                        method: "POST"
                    });
                }
            }
            if (batchRequests.length > 0) {
                sakai_serv.batch(batchRequests, function(success, data){
                    if (success) {
                        if (callBack) {
                            callBack(contentId, userId);
                        }
                    }
                    else {
                        debug.error("sharecontent failed to change content " +
                        "permission to 'viewer' for member: " +
                        userId);
                        debug.error("xhr data returned: " + data);
                    }
                }, null, true);
            }
        },

        /**
         * Removes multiple users from the specified role for multiple content items
         *
         * @param role  content profile data as defined in loadContentProfile()
         * @param {String} role The role to remove user(s) from
         * @param {String/Array} contentId The content to remove the user from
         * @param {String/Array} userId The user to remove
         * @param {Function} callback Callback function
         */
        removeUser: function(role, contentId, userId, callback){
            var batchRequests = [];
            var userIds = [];
            var contentIds = [];

            if (_.isString(userId)){
                userIds.push(userId);
            } else if (_.isArray(userId)){
                userIds = userId;
            }

            if (_.isString(contentId)){
                contentIds.push(contentId);
            } else if (_.isArray(contentId)){
                contentIds = contentId;
            }

            for (var c = 0; c < contentIds.length; c++) {
                for (var i = 0; i < userIds.length; i++) {
                    var parameter = {":viewer@Delete": userIds[i]};
                    if (role === "manager"){
                        parameter = {":manager@Delete": userIds[i]};
                    }
                    batchRequests.push({
                        url: "/p/" + contentIds[c] + ".members.json",
                        parameters: parameter,
                        method: "POST"
                    });
                }
            }

            sakai_serv.batch(batchRequests, function(success, data){
                if ($.isFunction(callback)) {
                   callback(success);
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
                    result.avatar = "//img.youtube.com/vi/" + uri.queryKey.v + "/0.jpg";
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
            }
            return mimeType;
        },

        getThumbnail : function(content){
            var thumbnail = "";
            var mimeType = sakai_content.getMimeType(content);
            if (content['sakai:pagecount'] && content['sakai:pagecount'] !== "0") {
                thumbnail = "/p/" + content['_path'] + "/page1.small.jpg";
            } else if (mimeType.indexOf("image") !== -1 && mimeType !== "image/tiff" && mimeType !== "image/jp2") {
                thumbnail = "/p/" + content['_path'];
            } else if (content["sakai:preview-url"]) {
                if (content["sakai:preview-avatar"]) {
                    thumbnail = content["sakai:preview-avatar"];
                }
            }
            return thumbnail;
        },

        isJwPlayerSupportedVideo : function(mimeType) {
            supported = false;
            if (mimeType && mimeType.substring(0, 6) === "video/"){
                var mimeSuffix = mimeType.substring(6);
                if (mimeSuffix === "x-flv" || mimeSuffix === "mp4" || mimeSuffix === "3gpp" || mimeSuffix === "quicktime") {
                    supported = true;
                }
            }
            return supported;
        },

        isJwPlayerSupportedAudio : function(mimeType) {
            supported = false;
            if (mimeType && mimeType.substring(0, 6) === "audio/"){
                supported = true;
            }
            return supported;
        },

        isKalturaPlayerSupported : function(mimeType) {
            return sakai_conf.kaltura.enabled && (mimeType === "kaltura/video" || mimeType === "kaltura/audio");
        },

        getCreatorProfile : function(content, callback) {
            $.ajax({
                url: "/~" + content["sakai:pool-content-created-for"] + "/public/authprofile.infinity.json",
                success: function(profile){
                    if ($.isFunction(callback)) {
                       callback(true, profile);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if ($.isFunction(callback)){
                        callback(false, xhr);
                    }
                }
            });

        },

        hasPreview : function(content){
            var result = false;
            var mimeType = sakai_content.getMimeType(content);
            if (content["sakai:preview-url"] ||
                    sakai_content.getThumbnail(content) ||
                    (mimeType.substring(0,6) === "image/" && mimeType !== "image/tiff" && mimeType !== "image/jp2") ||
                    mimeType.substring(0,5) === "text/" ||
                    mimeType === "application/x-shockwave-flash" ||
                    sakai_content.isKalturaPlayerSupported(mimeType) ||
                    sakai_content.isJwPlayerSupportedVideo(mimeType)  ||
                    sakai_content.isJwPlayerSupportedAudio(mimeType)) {
                result = true;
            }
            return result;
        },

        getCommentCount : function(content){
            var count = 0;
            if (content.hasOwnProperty("comments")) {
                $.each(content.comments, function(key, val){
                    if ($.isPlainObject(val)) {
                        count++;
                    }
                });
            }
            return count;
        },

        getPlaceCount : function(content){
            var count = 0;
            if (content["sakai:pooled-content-viewer"]) {
                for (var i in content["sakai:pooled-content-viewer"]) {
                    if (content["sakai:pooled-content-viewer"].hasOwnProperty(i)) {
                        if (content["sakai:pooled-content-viewer"][i] !== "anonymous" && content["sakai:pooled-content-viewer"][i] !== "everyone") {
                            count++;
                        }
                    }
                }
            }
            if (content["sakai:pooled-content-manager"]) {
                for (var ii in content["sakai:pooled-content-manager"]) {
                    if (content["sakai:pooled-content-manager"].hasOwnProperty(ii)) {
                        if (content["sakai:pooled-content-manager"][ii] !== "anonymous" && content["sakai:pooled-content-manager"][ii] !== "everyone") {
                            count++;
                        }
                    }
                }
            }
            return count;
        },

        /**
         * getNewList: get a new list of content based on newly uploaded or saved content
         *
         * @param {String} library The library to get the data for
         *
         * @return {Object} the passed-in data combined with the newly shared/uploaded content
         */
        getNewList : function(library) {
            var newData = [];
            if (sakai_global.newaddcontent && sakai_global.newaddcontent.getNewContent) {
                var newlyUploadedData = sakai_global.newaddcontent.getNewContent(library);
                $.merge(newData, newlyUploadedData);
            }
            if (sakai_global.savecontent && sakai_global.savecontent.getNewContent) {
                var newlySavedData = sakai_global.savecontent.getNewContent(library);
                $.merge(newData, newlySavedData);
            }
            return newData;
        },

        /**
         * Function to process search results for content
         *
         * @param {Object} results Search results to process
         * @param {Object} meData User object for the user
         * @param callback {Function} Callback function executed at the end of the operation
         * @returns void
         */
        prepareContentForRender : function(results, meData, callback) {
            var userArray = [];
            $.each(results, function(i, contentItem){
                if (contentItem['sakai:pooled-content-file-name']) {
                    contentItem.id = contentItem["_path"];
                    contentItem.link = "/content#p=" + sakai_util.safeURL(contentItem["_path"]);
                    contentItem.canDelete = sakai_content.isContentInLibrary(contentItem, meData.user.userid);
                    contentItem.numPlaces = sakai_content.getPlaceCount(contentItem);
                    contentItem.numComments = sakai_content.getCommentCount(contentItem);
                    // Only modify the description if there is one
                    if (contentItem["sakai:description"]) {
                        contentItem["sakai:description-shorter"] = sakai_util.applyThreeDots(contentItem["sakai:description"], 150, {
                            max_rows: 2,
                            whole_word: false
                        }, "");
                        contentItem["sakai:description-long"] = sakai_util.applyThreeDots(contentItem["sakai:description"], 1300, {
                            max_rows: 2,
                            whole_word: false
                        }, "");
                        contentItem["sakai:description"] = sakai_util.applyThreeDots(contentItem["sakai:description"], 580, {
                            max_rows: 2,
                            whole_word: false
                        }, "");
                    }
                    if (contentItem["sakai:pooled-content-file-name"]) {
                        contentItem["sakai:pooled-content-file-name-short"] = sakai_util.applyThreeDots(contentItem["sakai:pooled-content-file-name"], 560, {
                            max_rows: 1,
                            whole_word: false
                        }, "s3d-bold");
                        contentItem["sakai:pooled-content-file-name-shorter"] = sakai_util.applyThreeDots(contentItem["sakai:pooled-content-file-name"], 150, {
                            max_rows: 1,
                            whole_word: false
                        }, "s3d-bold");
                    }
                    // Modify the tags if there are any
                    if (contentItem["sakai:tags"]) {
                        if (typeof(contentItem["sakai:tags"]) === 'string') {
                            contentItem["sakai:tags"] = contentItem["sakai:tags"].split(",");
                        }
                        contentItem.tagsProcessed = sakai_util.shortenTags(sakai_util.formatTagsExcludeLocation(contentItem["sakai:tags"]));
                    }
                    // set mimetype
                    var mimeType = sakai_content.getMimeType(contentItem);
                    contentItem.mimeType = mimeType;
                    contentItem.mimeTypeURL = sakai_conf.MimeTypes["other"].URL;
                    contentItem.mimeTypeDescription = sakai_i18n.getValueForKey(sakai_conf.MimeTypes["other"].description);
                    if (sakai_conf.MimeTypes[mimeType]){
                        contentItem.mimeTypeDescription = sakai_i18n.getValueForKey(sakai_conf.MimeTypes[mimeType].description);
                        contentItem.mimeTypeURL = sakai_conf.MimeTypes[mimeType].URL;
                    }
                    contentItem.thumbnail = sakai_content.getThumbnail(results[i]);
                    // if the content has an owner we need to add their ID to an array,
                    // so we can lookup the users display name in a batch req
                    if (contentItem["sakai:pool-content-created-for"]) {
                        userArray.push(contentItem["sakai:pool-content-created-for"]);
                    }
                }
            });
            // Get displaynames for the users that created content
            if (userArray.length) {
                sakai_user.getMultipleUsers(userArray, function(users){
                    $.each(results, function(index, item){
                        if (item && item['sakai:pooled-content-file-name']) {
                            var userid = item["sakai:pool-content-created-for"];
                            var displayName = sakai_user.getDisplayName(users[userid]);
                            item.ownerId = userid;
                            item.ownerDisplayName = displayName;
                            item.ownerDisplayNameShort = sakai_util.applyThreeDots(displayName, 580, {max_rows: 1,whole_word: false}, "s3d-bold", true);
                            item.ownerDisplayNameShorter = sakai_util.applyThreeDots(displayName, 180, {max_rows: 1,whole_word: false}, "s3d-bold", true);
                        }
                    });
                    if ($.isFunction(callback)) {
                        callback(results);
                    }
                });
            } else if ($.isFunction(callback)) {
                callback(results);
            }
        }

    };
    return sakai_content;
});
