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

define(["jquery",
        "sakai/sakai.api.user",
        "sakai/sakai.api.util",
        "sakai/sakai.api.groups",
        "sakai/sakai.api.l10n",
        "/dev/configuration/config.js"],
        function($, sakai_user, sakai_util, sakai_groups, sakai_l10n, sakai_conf) {
    return {
        /**
         * Set the permissions for an array of uploaded files or links
         * @param {String} permissionValue either 'public', 'everyone', 'group' or 'private'
         * @param {Array} filesArray Array of files containing the 'hashpath' property per file. This hashpath is the resourceID of the file
         * @param {Function} callback Function to call when the permissions have been saved or failed to save.
         *                   The callback function is provided with a Boolean. True = permissions successfully set, False = permissions not set (error)
         */
        setFilePermissions : function(permissionValue, contentPaths, callback, groupID){
            // Check which value was selected and fill in the data object accordingly
            var data = [];
            $.each(contentPaths, function(i, contentPath) {
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
            });
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
         * Load the content profile for the current content path
         */
        loadContentProfile : function(content_path, callback){
            // Check whether there is actually a content path in the URL

            // http://localhost:8080/p/YjsKgQ8wNtTga1qadZwjQCe.2.json
            // http://localhost:8080/p/YjsKgQ8wNtTga1qadZwjQCe.members.json
            // http://localhost:8080/var/search/pool/activityfeed.json?p=/p/YjsKgQ8wNtTga1qadZwjQCe&items=1000

            if (content_path) {

                // Get the content information, the members and managers and version information
                var batchRequests = [
                    {
                        "url": content_path + ".2.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": content_path + ".members.detailed.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": content_path + ".versions.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": sakai_conf.URL.POOLED_CONTENT_ACTIVITY_FEED + "?p=" + content_path,
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    }
                ];

                var contentInfo = false;
                var contentMembers = false;
                var contentActivity = false;
                var versionInfo = false;

                // temporary request that returns data
                $.ajax({
                    url: sakai_conf.URL.POOLED_CONTENT_ACTIVITY_FEED + "?p=" + content_path  + "&items=1000",
                    type: "GET",
                    "async":false,
                    "cache":false,
                    "dataType":"json",
                    success: function(data){
                        if (data.results.hasOwnProperty(0)) {
                            contentActivity = data;
                        }
                    }
                });

                $.ajax({
                    url: sakai_conf.URL.BATCH,
                    type: "POST",
                    data: {
                        requests: $.toJSON(batchRequests)
                    },
                    success: function(data){

                        if (data.results.hasOwnProperty(0)) {
                            if (data.results[0]["status"] === 404){
                                if ($.isFunction(callback)){
                                    callback(false, {"error": 404});
                                }
                                return;
                            } else if (data.results[0]["status"] === 403){
                                if ($.isFunction(callback)){
                                    error = {"error": 403};
                                }
                                return;
                            } else {
                                contentInfo = $.parseJSON(data.results[0].body);
                            }
                        }

                        if (data.results.hasOwnProperty(1)) {
                            contentMembers = $.parseJSON(data.results[1].body);
                            contentMembers.viewers = contentMembers.viewers || {};
                            $.each(contentMembers.viewers, function(index, resultObject) {
                                contentMembers.viewers[index].picture = $.parseJSON(contentMembers.viewers[index].picture);
                            });
                            contentMembers.managers = contentMembers.managers || {};
                            $.each(contentMembers.managers, function(index, resultObject) {
                                contentMembers.managers[index].picture = $.parseJSON(contentMembers.managers[index].picture);
                            });
                        }

                        if (data.results.hasOwnProperty(2)) {
                            versionInfo =$.parseJSON(data.results[2].body);
                            var versions = [];
                            for (var i in versionInfo.versions) {
                                if(versionInfo.versions.hasOwnProperty(i)){
                                    var splitDate = versionInfo.versions[i]["created"];
                                    versionInfo.versions[i]["created"] = sakai_l10n.transformDate(new Date(splitDate));
                                    versions.push(versionInfo.versions[i]);
                                }
                            }
                            versionInfo.versions = versions.reverse();
                        }

                        var manager = false;
                        var anon = true;
                        var groups = [];
                        if (!sakai_user.data.me.user.anon){
                            for (var ii in contentMembers.managers) {
                                if (contentMembers.managers.hasOwnProperty(ii)) {
                                    if (contentMembers.managers[ii].hasOwnProperty("rep:userId")) {
                                        if (contentMembers.managers[ii]["rep:userId"] === sakai_user.data.me.user.userid) {
                                            manager = true;
                                        }
                                    } else if (contentMembers.managers[ii].hasOwnProperty("sakai:group-id")) {
                                        if (sakai_groups.isCurrentUserAMember(
                                            contentMembers.managers[ii]["sakai:group-id"],
                                            sakai_user.data.me)) {
                                            manager = true;
                                        }
                                    }
                                }
                            }
                        }

                        var directory = [];
                        // When only one tag is put in this will not be an array but a string
                        // We need an array to parse and display the results
                        if (contentInfo && contentInfo['sakai:tags']) {
                            directory = sakai_util.getDirectoryTags(contentInfo["sakai:tags"].toString());
                        }

                        var fullPath = content_path + "/" + contentInfo["sakai:pooled-content-file-name"];
                        if (contentInfo["sakai:pooled-content-file-name"].substring(contentInfo["sakai:pooled-content-file-name"].lastIndexOf("."), contentInfo["sakai:pooled-content-file-name"].length) !== contentInfo["sakai:fileextension"]) {
                            fullPath += contentInfo["sakai:fileextension"];
                        }

                        // filter out the the everyone group and the anonymous user
                        contentMembers.viewers = $.grep(contentMembers.viewers, function(resultObject, index){
                            if (resultObject['sakai:group-id'] !== 'everyone' &&
                                resultObject['rep:userId'] !== 'anonymous') {
                                return true;
                            }
                            return false;
                        });

                        json = {
                            data: contentInfo,
                            members: contentMembers,
                            activity: contentActivity,
                            mode: "content",
                            url: sakai_conf.SakaiDomain + fullPath,
                            path: fullPath,
                            saveddirectory : directory,
                            versions : versionInfo,
                            anon: anon,
                            isManager: manager
                        };

                        if ($.isFunction(callback)) {
                            callback(true, json);
                        }
                    }
                });

            } else {
               if ($.isFunction(callback)) {
                  callback(false, {error: 404});
               }
            }
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

        changePermission : function(contentPath, memberid, permission, callback) {
            var data = {};
            if (permission === "viewer") {
                data = {
                        ":viewer": memberid,
                        ":manager@Delete": memberid
                };
            } else {
                data = {
                        ":manager": memberid,
                        ":viewer@Delete": memberid
                };
            }
            $.ajax({
                url: contentPath + ".members.json",
                type: "POST",
                data: data,
                success: function () {
                    if ($.isFunction(callback)){
                        callback(true, data);
                    }
                },
                error: function (data) {
                    if ($.isFunction(callback)){
                        callback(false, data);
                    }
                }
            });
        }
    };
});
