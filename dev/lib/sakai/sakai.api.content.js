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

define(["jquery", "/dev/configuration/config.js"],function($, sakai_conf) {
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
         * Returns true if the user is a viewer for the current content item,
         * false otherwise. This function should be called after content profile
         * data has been loaded for the current content item.
         *
         * @param userid  the id of the user to search for
         */
        isUserAViewer: function (userid) {
            if (sakai_global.content_profile.hasOwnProperty("content_data") &&
                sakai_global.content_profile.content_data.hasOwnProperty("members") &&
                sakai_global.content_profile.content_data.members.hasOwnProperty("viewers")) {
                var viewers = sakai_global.content_profile.content_data.members.viewers;
                for (var i in viewers) {
                    if (viewers.hasOwnProperty(i)) {
                        if (userid === viewers[i].userid) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },


        /**
         * Returns true if the user is a manager for the current content item,
         * false otherwise. This function should be called after content profile
         * data has been loaded for the current content item.
         *
         * @param userid  the id of the user to search for
         */
        isUserAManager: function (userid) {
            if (sakai_global.content_profile.hasOwnProperty("content_data") &&
                sakai_global.content_profile.content_data.hasOwnProperty("members") &&
                sakai_global.content_profile.content_data.members.hasOwnProperty("managers")) {
                var managers = sakai_global.content_profile.content_data.members.managers;
                for (var i in managers) {
                    if (managers.hasOwnProperty(i)) {
                        if (userid === managers[i].userid) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    };
});
