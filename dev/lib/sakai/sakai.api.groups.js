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

/**
 * @class Groups
 *
 * @description
 * Group related convenience functions. This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Group related convenience functions
 */
define(["jquery", "/dev/configuration/config.js", "sakai/sakai.api.server"], function($, sakai_conf, sakai_serv){
    var sakaiGroupsAPI = {
        /**
         * Get the data for the specified group
         *
         * @param {String} groupid The ID of the group
         * @param {Function} callback Callback function, passes (success, (data|xhr))
         * @param {Boolean} async If this call should be ascynronous, defaults to true
         */
        getGroupData : function(groupid, callback, async, cache) {
            if (async === null || async === undefined) {
                async = true;
            }
            if (cache !== false) {
                cache = true;
            }
            $.ajax({
                url: "/~" + groupid + "/public.infinity.json",
                async: async,
                cache: cache,
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    debug.error("Could not get data for group " + groupid);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Create a group
         * @param {String} id the id of the group that's being created
         * @param {String} title the title of the group that's being created
         * @param {String} description the description of the group that's being created
         * @param {Function} callback the callback function for when the group save is complete. It will pass
         *                            two params, success {Boolean} and nameTaken {Boolean}
        */
        createGroup : function(id, title, description, meData, template, callback) {
            /**
             * Check if the group is created correctly and exists
             * @param {String} groupid
             */
            var groupExists = function(groupid){
                // Check if the group exists.
                var groupExists = false,
                created = false;
                $.ajax({
                    url: "/~" + groupid + ".json",
                    type: "GET",
                    async: false,
                    success: function(data, textStatus) {
                        groupExists = true;
                        created = true;
                    }
                });
                return groupExists;
            };

            var createGroup = function(group, callback){
                var data = {
                    "_charset_":"utf-8",
                    ":name": group.groupid,
                    "sakai:group-title" : group.grouptitle,
                    "sakai:group-description" : group.groupdescription,
                    "sakai:group-id": group.groupid
                }
                if (!group.isSubgroup){
                    data["sakai:category"] = group.category;
                    data["sakai:templateid"] = group.template.id;
                    data["sakai:joinRole"] = group.template.joinRole;
                    data["sakai:roles"] = $.toJSON(group.template.roles);
                } else {
                    data["sakai:excludeSearch"] = true;
                }
                $.ajax({
                    url: sakai_conf.URL.GROUP_CREATE_SERVICE,
                    data: data,
                    type: "POST",
                    success: function(data, textStatus){
                        callback(true);
                    },
                    error: function(){
                        callback(false);
                    }
                });
            }
            
            var toProcess = [];
            var membershipsToProcess = [];
            var managershipsToProcess = [];
            var mainCallback = false;
            var mainGroupId = false;
            
            var fillToProcess = function(groupid, grouptitle, groupdescription, meData, template, callback){
                mainCallback = callback;
                mainGroupId = groupid;
                // Get list of all manager groups
                var managerGroups = [];
                for (var i = 0; i < template.roles.length; i++){
                    if (template.roles[i].allowManage){
                        managerGroups.push(groupid + "-" + template.roles[i].id);
                    }
                }
                for (var i = 0; i < template.roles.length; i++){
                    for (var m = 0; m < managerGroups.length; m++) {
                        managershipsToProcess.push({
                            "user": managerGroups[m],
                            "permission": template.roles[i].id
                        });
                    }
                }
                for (var m = 0; m < managerGroups.length; m++) {
                    managershipsToProcess.push({
                        "user": managerGroups[m],
                        "permission": ""
                    });
                }
                
                // Get list of all subgroups
                var subGroups = [];
                for (var i = 0; i < template.roles.length; i++){
                    subGroups.push(groupid + "-" + template.roles[i].id);
                }
                
                // First do the main maintenance groups
                for (var i = 0; i < template.roles.length; i++){
                    if (template.roles[i].id === template.creatorRole){
                        var group = {
                            groupid: groupid + "-" + template.roles[i].id,
                            grouptitle: grouptitle + " " + template.roles[i].title,
                            groupdescription: "",
                            basedGroup: groupid,
                            template: template,
                            isSubgroup: true
                        }
                        toProcess.push(group);
                        membershipsToProcess.push({
                            "user": meData.user.userid,
                            "permission": template.roles[i].id
                        });
                    }
                }
                
                // Other maintenance groups
                for (var i = 0; i < template.roles.length; i++) {
                    if (template.roles[i].allowManage && template.roles[i].id !== template.creatorRole) {
                        var group = {
                            groupid: groupid + "-" + template.roles[i].id,
                            grouptitle: grouptitle + " " + template.roles[i].title,
                            groupdescription: "",
                            basedGroup: groupid,
                            template: template,
                            isSubgroup: true
                        }
                        toProcess.push(group);
                    }
                }
                
                // Other Subgroups
                for (var i = 0; i < template.roles.length; i++) {
                    if (!template.roles[i].allowManage) {
                        var group = {
                            groupid: groupid + "-" + template.roles[i].id,
                            grouptitle: grouptitle + " " + template.roles[i].title,
                            groupdescription: "",
                            basedGroup: groupid,
                            template: template,
                            isSubgroup: true
                        }
                        toProcess.push(group);
                    }
                }
                
                // Main group
                var group = {
                    groupid: groupid,
                    grouptitle: grouptitle,
                    groupdescription: groupdescription,
                    template: template,
                    isSubgroup: false
                }
                toProcess.push(group);
                for (var i = 0; i < template.roles.length; i++) {
                    membershipsToProcess.push({
                        "user": groupid + "-" + template.roles[i].id,
                        "permission": ""
                    });
                }
                
                saveGroup(true);
            }

            /**
             * Create the group.
             * @param {String} groupid the id of the group that's being created
             * @param {String} grouptitle the title of the group that's being created
             * @param {String} groupdescription the description of the group that's being created
             * @param {Object} meData the data from sakai.api.User.data.me
             * @param {Function} callback the callback function for when the group save is complete. It will pass
             *                            two params, success {Boolean} and nameTaken {Boolean}
            */
            saveGroup = function(success){
                if (toProcess.length > 0){
                    var group = $.extend(true, {}, toProcess[0]);
                    toProcess.splice(0, 1);
                    createGroup(group, saveGroup);
                } else {
                    sakaiGroupsAPI.addUsersToGroup(mainGroupId, true, managershipsToProcess, true, function(){
                        sakaiGroupsAPI.addUsersToGroup(mainGroupId, false, membershipsToProcess, false, function(){
                            if (mainCallback){
                                mainCallback(true, false);
                            }
                        });
                    });
                }
            };

            // check if the group exists
            if (!groupExists(id)) {
                fillToProcess(id, title, description, meData, template, callback);
            } else {
                if ($.isFunction(callback)) {
                    callback(false, true);
                }
            }
        },

        /**
         * Update group basic information
         *
         * @param {String} id The id of the group to update
         * @param {String} title The new title of the group
         * @param {String} description The new description of the group
         * @param {String} kind The kind of group, defined in (TODO define this somewhere, currently only in groupbasicinfo.html)
         * @param {Function} callback Callback function, passes (success)
         */
        updateGroupInfo : function(id, title, description, kind, callback) {
            var groupProfileURL = "/~" + id + "/public/authprofile";

            $.ajax({
                url: groupProfileURL,
                data: {
                    "_charset_":"utf-8",
                    "sakai:group-title" : title,
                    "sakai:group-description" : description,
                    "sakai:group-kind" : kind
                },
                type: "POST",
                error: function(xhr, textStatus, thrownError){
                    debug.error("Unable to update group information.");
                },
                complete: function(xhr, textStatus) {
                    if ($.isFunction(callback)) {
                        callback(textStatus === "success");
                    }
                }
            });
        },

        /**
         * Update group profile
         *
         * @param {String} id The id of the group to update
         * @param {Object} profile The group's profile
         * @param {Function} callback Callback function, passes (success)
         */
        updateGroupProfile : function(id, profile, callback) {
            var groupProfileURL = "/~" + id + "/public/authprofile";
            sakai_serv.saveJSON(groupProfileURL, profile, function(success, data) {
                if ($.isFunction(callback)) {
                    callback(success);
                }
            });
        },

        /**
         * Checks whether the given value is valid as defined by the given
         * permissionsProperty.
         *
         * @param {Object} permissionsProperty Permissions property object
         *   (i.e. sakai.config.Permissions.Groups.joinable) with valid values to check
         *   against
         * @param {Object} value Value to investigate
         * @return true if the value has a valid property value, false otherwise
         */
        isValidPermissionsProperty : function(permissionsProperty, value) {
            if(!value || value === "") {
                // value is empty - not valid
                return false;
            }
            for(var index in permissionsProperty) {
                if(permissionsProperty.hasOwnProperty(index)) {
                    if(value === permissionsProperty[index]) {
                        // value is valid
                        return true;
                    }
                }
            }
            // value is not valid
            return false;
        },

        /**
         * Public function used to set joinability and visibility permissions for a
         * group with groupid.
         *
         * @param {String} groupid The id of the group that needs permissions set
         * @param {String} joinable The joinable state for the group (from sakai.config.Permissions.Groups)
         * @param {String} visible The visibile state for the group (from sakai.config.Permissions.Groups)
         * @param {Function} callback Function to be called on complete - callback
         *   args: (success)
         * @return None
         */
        setPermissions : function(groupid, joinable, visible, callback) {
            if(groupid && typeof(groupid) === "string" &&
               this.isValidPermissionsProperty(sakai_conf.Permissions.Groups.joinable, joinable) &&
               this.isValidPermissionsProperty(sakai_conf.Permissions.Groups.visible, visible)) {

                // issue a BATCH POST to update Jackrabbit group & Home Folder group
                var batchRequests = [];
                var jackrabbitUrl = "/system/userManager/group/" + groupid + ".update.html";
                var homeFolderUrl = "/~" + groupid + ".modifyAce.html";

                // determine visibility state
                if(visible == sakai_conf.Permissions.Groups.visible.managers) {
                    // visible to managers only
                    batchRequests.push({
                        "url": jackrabbitUrl,
                        "method": "POST",
                        "parameters": {
                            ":viewer": groupid + "-managers",
                            ":viewer@Delete": "everyone",
                            "sakai:group-visible": visible,
                            "sakai:group-joinable": joinable
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "everyone",
                            "privilege@jcr:read": "denied"
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "anonymous",
                            "privilege@jcr:read": "denied"
                        }
                    });
                } else if(visible == sakai_conf.Permissions.Groups.visible.members) {
                    // visible to members only
                    batchRequests.push({
                        "url": jackrabbitUrl,
                        "method": "POST",
                        "parameters": {
                            ":viewer": groupid,
                            ":viewer@Delete": "everyone",
                            "sakai:group-visible": visible,
                            "sakai:group-joinable": joinable
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "everyone",
                            "privilege@jcr:read": "denied"
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "anonymous",
                            "privilege@jcr:read": "denied"
                        }
                    });
                } else if(visible == sakai_conf.Permissions.Groups.visible.allusers) {
                    // visible to all logged in users
                    batchRequests.push({
                        "url": jackrabbitUrl,
                        "method": "POST",
                        "parameters": {
                            ":viewer": "everyone",
                            "sakai:group-visible": visible,
                            "sakai:group-joinable": joinable
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "everyone",
                            "privilege@jcr:read": "granted"
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "anonymous",
                            "privilege@jcr:read": "denied"
                        }
                    });
                } else {
                    // visible to the public
                    batchRequests.push({
                        "url": jackrabbitUrl,
                        "method": "POST",
                        "parameters": {
                            "rep:group-viewers@Delete": "",
                            "sakai:group-visible": visible,
                            "sakai:group-joinable": joinable
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "everyone",
                            "privilege@jcr:read": "granted"
                        }
                    });
                    batchRequests.push({
                        "url": homeFolderUrl,
                        "method": "POST",
                        "parameters": {
                            "principalId": "anonymous",
                            "privilege@jcr:read": "granted"
                        }
                    });
                }

                // issue the BATCH POST
                sakai_serv.batch(batchRequests, function(success, data) {
                    if (success) {
                        // update group context and call callback
                        if(sakai_global.currentgroup && sakai_global.currentgroup.data && sakai_global.currentgroup.data.authprofile) {
                            sakai_global.currentgroup.data.authprofile["sakai:group-joinable"] = joinable;
                            sakai_global.currentgroup.data.authprofile["sakai:group-visible"] = visible;
                        }
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    } else {
                        // Log an error message
                        debug.error("Setting permissions on the group failed");
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn("Invalid arguments sent to sakai.api.Groups.setPermissions");
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        },


        /**
         * Determines whether the current user is a manager of the given group.
         *
         * @param groupid {String} id of the group to check
         * @param {Object} meData the data from sakai.api.User.data.me
         * @return true if the current user is a manager, false otherwise
         */
        isCurrentUserAManager : function(groupid, meData) {
            if(!groupid || typeof(groupid) !== "string") {
                return false;
            }

            var managersGroupId = groupid + "-managers";
            return $.inArray(managersGroupId, meData.user.subjects) !== -1;
        },


        /**
         * Determines whether the current user is a member of the given group.
         * Managers are considered members of a group. If the current user is a manager
         * of the group, this function will return true.
         *
         * @param groupid {String} id of the group to check
         * @param {Object} meData the data from sakai.api.User.data.me
         * @return true if the current user is a member or manager, false otherwise
         */
        isCurrentUserAMember : function(groupid, meData) {
            if(!groupid || typeof(groupid) !== "string") {
                return false;
            }

            return $.inArray(groupid, meData.user.subjects) !== -1;
        },

        /**
         * Creates a join request for the given user for the specified group
         *
         * @param {String} userID ID of the user that wants to join the group
         * @param {String} groupID ID of the group to the user wants to join
         * @param {Function} callback Callback function executed at the end of the
         * operation - callback args:
         *  -- {Boolean} success True if operation succeeded, false otherwise
         */
        addJoinRequest : function(userID, groupID, callback) {
            if (userID && typeof(userID) === "string" &&
                groupID && typeof(groupID) === "string") {
                $.ajax({
                    url: "/~" + groupID + "/joinrequests.create.html",
                    type: "POST",
                    data: {
                        userid: userID
                    },
                    success: function (data) {
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    },
                    error: function (xhr, textStatus, thrownError) {
                        debug.error("Could not process join request");
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn("Invalid arguments passed to addJoinRequest");
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        },

        /**
         * Removes a join request for the given user for the specified group
         *
         * @param {String} userID ID of the user that wants to join the group
         * @param {String} groupID ID of the group to the user wants to join
         * @param {Function} callback Callback function executed at the end of the
         * operation - callback args:
         *  -- {Boolean} success True if operation succeeded, false otherwise
         */
        removeJoinRequest : function(userID, groupID, callback) {
            if (userID && typeof(userID) === "string" &&
                groupID && typeof(groupID) === "string") {
                $.ajax({
                    url: "/~" + groupID + "/joinrequests/" + userID,
                    data: {
                        ":operation": "delete"
                    },
                    type: "POST",
                    success: function (data) {
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    },
                    error: function (xhr, textStatus, thrownError) {
                        debug.error("Could not remove join request");
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn("Invalid arguments sent to sakai.api.Groups.removeJoinRequest()");
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        },

        /**
         * Returns all join requests for the specified group
         *
         * @param {String} groupID ID of the group to fetch join requests for
         * @param {Function} callback Callback function executed at the end of the
         * @param {Boolean} async Optional argument to set whether this operation is
         *   asynchronous or not. Default is true.
         * operation - callback args:
         *  -- {Boolean} success true if operation succeeded, false otherwise
         *  -- {Object} joinrequest data if successful
         */
        getJoinRequests : function(groupID, callback, async) {
            if (groupID && typeof(groupID) === "string") {
                if (async === null || async === undefined) {
                    async = true;
                }
                $.ajax({
                    url: "/var/joinrequests/list.json?groupId=" + groupID,
                    type: "GET",
                    async: async,
                    success: function (data) {
                        if ($.isFunction(callback)) {
                            callback(true, data);
                        }
                    },
                    error: function (xhr, textStatus, thrownError) {
                        debug.error("Request to get join requests failed");
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn("Invalid arguments sent to sakai.api.Groups.getJoinRequests()");
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        },

        /**
         * Returns all the users who are member of a certain group
         *
         * @param {String} groupID The ID of the group we would like to get the members of
         * @param {Function} callback Callback function, passes (success, (data|xhr))
         *
         */
        getMembers : function(groupID, callback) {
            $.ajax({
                url: "/system/userManager/group/" + groupID + ".members.json",
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus) {
                    debug.error("Could not get members group info for " + groupID);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Returns all the users who are managers of a certain group
         *
         * @param {String} groupID The ID of the group we would like to get the managers of
         * @param {Function} callback Callback function, passes (success, (data|xhr))
         *
         */
        getManagers : function(groupID, callback) {
            $.ajax({
                url: "/system/userManager/group/" + groupID + "-managers.members.json",
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus) {
                    debug.error("Could not get managers group info for " + groupID);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Add users to the specified group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {String} list Either 'members' or 'managers'
         * @param {Array} users Array of user/group IDs to add to the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Function} callback Callback function
         */
        addUsersToGroup : function(groupID, list, users, medata, managerShip, callback) {
            var reqData = [];
            var currentUserIncluded = false;

            // Construct the batch requests
            $.each(users, function(index, user) {
                var url = "/system/userManager/group/" + groupID + "-" + user.permission + ".update.json";
                if (!user.permission){
                    url = "/system/userManager/group/" + groupID + ".update.json";
                }
                var data = {};
                if (managerShip){
                    data[":manager"] = user.user;
                } else {
                    data[":member"] = user.user;
                }
                reqData.push({
                    "url": url,
                    "method": "POST",
                    "parameters": data
                });
                if (user === medata.user.userid){
                    currentUserIncluded = true;
                }
            });

            if (reqData.length > 0) {
                // batch request to add users to group
                sakai_serv.batch(reqData, function(success, data) {
                    if (!success) {
                        debug.error("Could not add users to group");
                    } else if (currentUserIncluded) {
                        medata.user.subjects.push(groupID);
                    }
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            } else {
                if ($.isFunction(callback)) {
                    callback(true);
                }
            }
        },

        /**
         * Add content items to the specified group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {Array} contentList Array of content IDs to add to the group
         * @param {Function} callback Callback function
         */
        addContentToGroup : function(groupID, contentIDs, callback) {
            var reqData = [];

            $(contentIDs).each(function(i, contentID) {
                reqData.push({
                    "url": "/p/" + contentID + ".members.json",
                    "method": "POST",
                    "parameters": {
                        ":viewer": groupID
                    }
                });
            });

            if (reqData.length > 0) {
                // batch request to add content to group
                sakai_serv.batch(reqData, function(success, data) {
                    if (!success) {
                        debug.error("Error adding content to the group");
                    }
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            }
        },

        /**
         * Remove users from the specified group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {String} list Either 'members' or 'managers'
         * @param {Array} users Array of user/group IDs to remove from the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Function} callback Callback function
         */
        removeUsersFromGroup : function(groupID, list, users, medata, callback) {
            var reqData = [];
            var currentUserIncluded = false;

            if (list === 'managers') {
                groupID = groupID + '-managers';
            }

            $.each(users, function(index, user) {
                reqData.push({
                    "url": "/system/userManager/group/" + groupID + ".update.json",
                    "method": "POST",
                    "parameters": {
                        "_charset_":"utf-8",
                        ":member@Delete": user
                    }
                });
                if (user === medata.user.userid){
                    currentUserIncluded = true;
                }
            });

            if (reqData.length > 0) {
                // batch request to remove users from group
                sakai_serv.batch(reqData, function(success, data) {
                    if (!success) {
                        debug.error("Error removing users from the group");
                    } else if (currentUserIncluded){
                        // remove the group from medata.subjects
                        var index = medata.user.subjects.indexOf(groupID);
                        medata.user.subjects.splice(index, 1);
                    }
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            }
        },

        /**
         * Add users to the specified group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {Array} content Array of content IDs to remove from the group
         * @param {Function} callback Callback function
         */
        removeContentFromGroup : function(groupID, contentIDs, callback) {
            var reqData = [];

            $.each(contentIDs, function(index, contentID) {
                if (contentID) {
                    reqData.push({
                        "url": "/p/" + contentID + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":viewer@Delete": groupID
                        }
                    });
                }
            });

            if (reqData.length > 0) {
                // batch request to remove content from group
                sakai_serv.batch(reqData, function(success, data) {
                    if (!success) {
                        debug.error("Error removing content from the group");
                    }
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            }
        },
        
        filterGroup: function(group){
            if (!group["sakai:group-title"] || group["sakai:excludeSearch"]) {
                return false;
            } else {
                if (group.groupid === "everyone") {
                    return false;
                } else {
                    return true;
                }
            } 
        },
        
        getMemberships : function(groups){
            var newjson = {entry: []};
            for (var i = 0, il = groups.length; i < il; i++) {
                if (sakaiGroupsAPI.filterGroup(groups[i])) {
                    newjson.entry.push(groups[i]);
                }
            }
            return newjson;
        },
        
        getTemplate: function(cat, id){
            var category = false;
            for (var i = 0; i < sakai_conf.worldTemplates.length; i++){
                if (sakai_conf.worldTemplates[i].id === cat){
                    category = sakai_conf.worldTemplates[i];
                    break;
                }
            }
            var template = false;
            for (var i = 0; i < category.templates.length; i++){
                if (category.templates[i].id === id){
                    template = category.templates[i];
                    break;
                }
            }
            return template;
        }
        
    };
    return sakaiGroupsAPI;
});
