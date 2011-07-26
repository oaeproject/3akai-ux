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
define(
    [
        "jquery",
        "config/config_custom",
        "sakai/sakai.api.server",
        "sakai/sakai.api.util",
        "sakai/sakai.api.i18n",
        "sakai/sakai.api.user",
        "sakai/sakai.api.communication"
    ],
    function($, sakai_conf, sakai_serv, sakai_util, sakai_i18n, sakai_user, sakai_comm){

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
         * Get the data for the specified group
         *
         * @param {String} groupid The ID of the group
         * @param {Function} callback Callback function, passes (success, (data|xhr))
         * @param {Boolean} async If this call should be ascynronous, defaults to true
         */
        getGroupAuthorizableData : function(groupid, callback, async, cache) {
            if (async === null || async === undefined) {
                async = true;
            }
            if (cache !== false) {
                cache = true;
            }
            $.ajax({
                url: "/system/userManager/group/" + groupid + ".json",
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
        createGroup : function(id, title, description, meData, template, category, callback) {
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
                };
                if (!group.isSubgroup){
                    data["sakai:category"] = group.category;
                    data["sakai:templateid"] = group.template.id;
                    data["sakai:joinRole"] = group.template.joinRole;
                    data["sakai:roles"] = $.toJSON(group.template.roles);
                } else {
                    data["sakai:excludeSearch"] = true;
                    data["sakai:pseudoGroup"] = true;
                    data["sakai:pseudogroupparent"] = group.parentgroup;
                }
                $.ajax({
                    url: sakai_conf.URL.GROUP_CREATE_SERVICE,
                    data: data,
                    type: "POST",
                    success: function(_data, textStatus){
                        callback(true, data);
                    },
                    error: function(){
                        callback(false, data);
                    }
                });
            };

            var toProcess = [];
            var membershipsToProcess = [];
            var managershipsToProcess = [];
            var mainCallback = false;
            var mainGroupId = false;

            var fillToProcess = function(groupid, grouptitle, groupdescription, meData, template, category, callback){
                mainCallback = callback;
                mainGroupId = groupid;
                // Get list of all manager groups
                var managerGroups = [],
                    managerGroupRoleIDs = [],
                    memberGroups = [];
                for (var i = 0; i < template.roles.length; i++){
                    if (template.roles[i].allowManage){
                        managerGroups.push(groupid + "-" + template.roles[i].id);
                        managerGroupRoleIDs.push(template.roles[i].id);
                    } else {
                        memberGroups.push(groupid + "-" + template.roles[i].id);
                    }
                }
                for (var j = 0; j < template.roles.length; j++){
                    for (var m = 0; m < managerGroups.length; m++) {
                        managershipsToProcess.push({
                            "user": managerGroups[m],
                            "permission": template.roles[j].id
                        });
                    }
                }
                for (var k = 0; k < managerGroups.length; k++) {
                    managershipsToProcess.push({
                        "user": managerGroups[k],
                        "permission": ""
                    });
                }

                // Get list of all subgroups
                var subGroups = [];
                for (var z = 0; z < template.roles.length; z++){
                    subGroups.push(groupid + "-" + template.roles[z].id);
                }

                // First do the main maintenance groups
                for (var q = 0; q < template.roles.length; q++){
                    if (template.roles[q].id === template.creatorRole){
                        var group = {
                            groupid: groupid + "-" + template.roles[q].id,
                            grouptitle: grouptitle + " (" + template.roles[q].roleTitle + ")",
                            groupdescription: "",
                            basedGroup: groupid,
                            template: template,
                            category: category,
                            parentgroup: groupid,
                            isSubgroup: true
                        };
                        toProcess.push(group);
                        membershipsToProcess.push({
                            "user": meData.user.userid,
                            "permission": template.roles[q].id
                        });
                    }
                }

                // Other maintenance groups
                for (var n = 0; n < template.roles.length; n++) {
                    if (template.roles[n].allowManage && template.roles[n].id !== template.creatorRole) {
                        var gr = {
                            groupid: groupid + "-" + template.roles[n].id,
                            grouptitle: grouptitle + " (" + template.roles[n].roleTitle + ")",
                            groupdescription: "",
                            basedGroup: groupid,
                            category: category,
                            template: template,
                            parentgroup: groupid,
                            isSubgroup: true
                        };
                        toProcess.push(gr);
                    }
                }

                // Other Subgroups
                for (var o = 0; o < template.roles.length; o++) {
                    if (!template.roles[o].allowManage) {
                        var gr1 = {
                            groupid: groupid + "-" + template.roles[o].id,
                            grouptitle: grouptitle + " (" + template.roles[o].roleTitle + ")",
                            groupdescription: "",
                            basedGroup: groupid,
                            category: category,
                            template: template,
                            parentgroup: groupid,
                            isSubgroup: true
                        };
                        toProcess.push(gr1);
                    }
                }

                // Main group
                var gr2 = {
                    groupid: groupid,
                    grouptitle: grouptitle,
                    groupdescription: groupdescription,
                    category: category,
                    template: template,
                    isSubgroup: false
                };
                toProcess.push(gr2);
                for (var b = 0; b < template.roles.length; b++) {
                    membershipsToProcess.push({
                        "user": groupid + "-" + template.roles[b].id,
                        "permission": ""
                    });
                }
                $.each(memberGroups, function(i, memGr) {
                    $.each(managerGroupRoleIDs, function(i, manGr) {
                        membershipsToProcess.push({
                            "user": memGr,
                            "permission": manGr,
                            "viewer": true
                        });
                    });
                });

                saveGroup(true);
            };

            /**
             * Create the group.
             * @param {String} groupid the id of the group that's being created
             * @param {String} grouptitle the title of the group that's being created
             * @param {String} groupdescription the description of the group that's being created
             * @param {Object} meData the data from sakai.api.User.data.me
             * @param {Function} callback the callback function for when the group save is complete. It will pass
             *                            two params, success {Boolean} and nameTaken {Boolean}
            */
            var saveGroup = function(success, data){
                if (toProcess.length > 0){
                    var group = $.extend(true, {}, toProcess[0]);
                    toProcess.splice(0, 1);
                    createGroup(group, saveGroup);
                } else {
                    sakaiGroupsAPI.addUsersToGroup(mainGroupId, managershipsToProcess, meData, true, function(){
                        sakaiGroupsAPI.addUsersToGroup(mainGroupId, membershipsToProcess, meData, false, function(){
                            if (mainCallback){
                                mainCallback(true, data, false);
                            }
                        });
                    });
                }
            };

            // check if the group exists
            if (!groupExists(id)) {
                fillToProcess(id, title, description, meData, template, category, callback);
            } else {
                if ($.isFunction(callback)) {
                    callback(false, null, true);
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
         * @param {Array} roles The roles for this group, from the "sakai:roles" property of the group
         * @param {Function} callback Function to be called on complete - callback
         *   args: (success)
         * @return None
         */
        setPermissions : function(groupid, joinable, visible, roles, callback) {
            if(groupid && typeof(groupid) === "string" &&
               this.isValidPermissionsProperty(sakai_conf.Permissions.Groups.joinable, joinable) &&
               this.isValidPermissionsProperty(sakai_conf.Permissions.Groups.visible, visible)) {

                // issue a BATCH POST to update Jackrabbit group & Home Folder group
                var batchRequests = [];
                // add in the main group, we need to modify their permissions too
                roles.push({id:groupid});
                $.each(roles, function(i, role) {
                    var groupURL = groupid;
                    if (role.id !== groupid) {
                        groupURL += "-" + role.id;
                    }
                    var groupUpdateURL = "/system/userManager/group/" + groupURL + ".update.html";

                    // determine visibility state
                    if (visible === sakai_conf.Permissions.Groups.visible.members) {
                        // visible to members only
                        // also remove everyone & anonymous, as they're not a member
                        batchRequests.push({
                            "url": groupUpdateURL,
                            "method": "POST",
                            "parameters": {
                                ":viewer": groupid,
                                ":viewer@Delete":
                                [
                                    "everyone",
                                    "anonymous"
                                ],
                                "sakai:group-visible": visible,
                                "sakai:group-joinable": joinable
                            }
                        });
                    } else if (visible === sakai_conf.Permissions.Groups.visible.allusers) {
                        // visible to all logged in users
                        // remove anonymous, as this is only for logged in users
                        batchRequests.push({
                            "url": groupUpdateURL,
                            "method": "POST",
                            "parameters": {
                                ":viewer": "everyone",
                                ":viewer@Delete": "anonymous",
                                "sakai:group-visible": visible,
                                "sakai:group-joinable": joinable
                            }
                        });
                    } else {
                        // visible to the public
                        // all logged in users 'everyone'
                        // all non-logged in users 'anonymous'
                        batchRequests.push({
                            "url": groupUpdateURL,
                            "method": "POST",
                            "parameters": {
                                ":viewer":
                                [
                                    "everyone",
                                    "anonymous"
                                ],
                                "sakai:group-visible": visible,
                                "sakai:group-joinable": joinable
                            }
                        });
                    }
                });


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
        isCurrentUserAManager : function(groupid, meData, groupinfo) {
            if (groupinfo) {
                var managementRoles = [];
                var roles = $.parseJSON(groupinfo["sakai:roles"]);
                for (var r = 0; r < roles.length; r++) {
                    if (roles[r].allowManage) {
                        managementRoles.push(roles[r].id);
                    }
                }
                var canManage = false;
                for (var i = 0; i < meData.groups.length; i++) {
                    for (var mr = 0; mr < managementRoles.length; mr++) {
                        if (meData.groups[i]["sakai:group-id"] === groupinfo["sakai:group-id"] + "-" + managementRoles[mr]) {
                            canManage = true;
                        }
                    }
                }
                return canManage;
            } else {
                if (!groupid || typeof(groupid) !== "string") {
                    return false;
                }
                var managersGroupId = groupid + "-manager";
                return $.inArray(managersGroupId, meData.user.subjects) !== -1;
            }
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
         * @param {Object} meData User object for the user that wants to join the group
         * @param {String} groupID ID of the group to the user wants to join
         * @param {Object} groupData Optional group data object containing profile and managers for the group
         * @param {Boolean} notifyManagers Optional notify managers of the group of the join request by sending a message
         * @param {Function} callback Callback function executed at the end of the
         * operation - callback args:
         *  -- {Boolean} success True if operation succeeded, false otherwise
         */
        addJoinRequest : function(meData, groupID, groupData, notifyManagers, callback) {
            var groupProfile = false;
            var groupManagers = false;

            /**
             * Sends a join request message to the managers
             * @return None
             */
            var sendJoinRequestMessage = function() {
                var managerArray = [];
                for (var i in groupManagers){
                    if (groupManagers.hasOwnProperty(i)) {
                        managerArray.push(groupManagers[i].userid);
                    }
                }
                var userString = sakai_user.getDisplayName(meData.profile);
                var groupString = groupProfile["sakai:group-title"];
                var systemString = sakai_i18n.General.getValueForKey("SAKAI");
                var profileLink = sakai_conf.SakaiDomain + "/~" + sakai_util.urlSafe(meData.user.userid);
                var acceptLink = sakai_conf.SakaiDomain + "/~" + groupProfile["sakai:group-id"];
                var subject = sakai_i18n.General.getValueForKey("GROUP_JOIN_REQUEST_TITLE")
                     .replace(/\$\{sender\}/g, userString)
                     .replace(/\$\{group\}/g, groupString);
                var body = sakai_i18n.General.getValueForKey("GROUP_JOIN_REQUEST_BODY")
                     .replace(/\$\{sender\}/g, userString)
                     .replace(/\$\{group\}/g, groupString)
                     .replace(/\$\{system\}/g, systemString)
                     .replace(/\$\{profilelink\}/g, profileLink)
                     .replace(/\$\{acceptlink\}/g, acceptLink)
                    .replace(/\$\{br\}/g,"\n");
                sakai_comm.sendMessage(managerArray, meData, subject, body, false,false,false,false,"join_request");
            };

            /**
             * Retrieves the join role for the group
             *
             * @param {String} groupID the group id for the join role to fetch
             * @param {Function} callback Callback function
             */
            var getJoinRole = function(groupID, callback){
                sakaiGroupsAPI.getGroupAuthorizableData(groupID, function(success, data){
                    if (success && data && data.properties && data.properties["sakai:joinRole"] && $.isFunction(callback)) {
                        callback(true, data.properties["sakai:joinRole"]);
                    } else if ($.isFunction(callback)) {
                        callback(false);
                    }
                });
            };

            if (groupData && groupData.groupMembers && groupData.groupMembers.Manager){
                groupProfile = groupData.groupProfile;
                groupManagers = groupData.groupMembers.Manager.results;
            }

            var userID = meData.user.userid;
            if (userID && typeof(userID) === "string" &&
                groupID && typeof(groupID) === "string") {

                getJoinRole(groupID, function(success, joinRole){
                    if (success) {
                        var pseudoGroupID = groupID + "-" + joinRole;

                        $.ajax({
                            url: "/~" + pseudoGroupID + "/joinrequests.create.html",
                            type: "POST",
                            data: {
                                userid: userID
                            },
                            success: function (data) {
                                meData.user.subjects.push(groupID, pseudoGroupID);

                                if (notifyManagers) {
                                    if (groupProfile && groupManagers && groupProfile["sakai:group-id"] === groupID) {
                                        sendJoinRequestMessage();
                                    } else {
                                        sakaiGroupsAPI.getMembers(groupID, false, function(success, members){
                                            if (success) {
                                                sakaiGroupsAPI.getGroupData(groupID, function(success, groupData){
                                                    if (success) {
                                                        groupProfile = groupData.authprofile;
                                                        groupManagers = members.Manager.results;
                                                        sendJoinRequestMessage();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

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
                    } else if ($.isFunction(callback)) {
                        callback(false);
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
                    url: "/~" + groupID + "/joinrequests/" + sakai_util.urlSafe(userID),
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
            if (_.isString(groupID)) {
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
         * @param {Boolean} everyone If we should return managers + members (useful for pseudoGroups)
         *
         */
        getMembers : function(groupID, query, callback, everyone) {
            var searchquery = query || "*";
            var groupInfo = sakaiGroupsAPI.getGroupAuthorizableData(groupID, function(success, data){
                if (success){
                    var roles = $.parseJSON(data.properties["sakai:roles"]);
                    var batchRequests = [];
                    var dataToReturn = {};
                    for (var i = 0; i < roles.length; i++) {
                        //var url = "/var/search/groupmembers-all.json";
                        //var parameters = {
                        //    group: groupID + "-" + roles[i].id,
                        //    q: searchquery
                        //};
                        //if (searchquery !== "*"){
                        //    url = "/var/search/groupmembers.json?group=" + groupID + "-" + roles[i].id;
                        //}
                        var selector = "members";
                        if (everyone) {
                            selector = "everyone";
                        }
                        var url = "/system/userManager/group/" + groupID + "-" + roles[i].id + "." + selector + ".json";
                        batchRequests.push({
                            "url": url,
                            "method": "GET"
                        //  "parameters": parameters
                        });
                    }
                    sakai_serv.batch(batchRequests, function(success, data){
                        if (success) {
                            for (var i = 0; i < roles.length; i++) {
                                if (data.results.hasOwnProperty(i)) {
                                    var members = $.parseJSON(data.results[i].body);
                                    dataToReturn[roles[i].title] = {};
                                    dataToReturn[roles[i].title].results = members;
                                }
                            }
                            if ($.isFunction(callback)) {
                                callback(true, dataToReturn);
                            }
                        }
                    }, false, true);
                } else {
                    debug.error("Could not get members group info for " + groupID);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        getRole : function(userId, groupID, callback){
            var groupInfo = sakaiGroupsAPI.getGroupAuthorizableData(groupID, function(success, data){
                if (success){
                    var roles = $.parseJSON(data.properties["sakai:roles"]);
                    var batchRequests = [];
                    var role;
                    for (var i = 0; i < roles.length; i++) {
                        var url = "/system/userManager/group/" + groupID + "-" + roles[i].id + ".everyone.json";
                        batchRequests.push({
                            "url": url,
                            "method": "GET"
                        });
                    }
                    sakai_serv.batch(batchRequests, function(success, data){
                        if (success) {
                            var isMatch = function(user, index){
                                return user.userid === userId;
                            };

                            for (var i = 0; i < roles.length; i++) {
                                if (data.results.hasOwnProperty(i)) {
                                    var members = $.parseJSON(data.results[i].body);
                                    if ($.grep(members, isMatch).length > 0){
                                        role = roles[i].id;
                                        break;
                                    }
                                }
                            }
                            if ($.isFunction(callback)) {
                                callback(true, role);
                            }
                        }
                    }, false, true);
                } else {
                    debug.error("Could not get members group info for " + groupID);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        leave : function(groupId, role, meData, callback){
            $.ajax({
                url: "/system/userManager/group/"+ groupId + "-" + role + ".leave.json",
                type: "POST",
                success: function(){
                    var pseudoGroupID = groupId + "-" + role;
                    var index = meData.user.subjects.indexOf(groupId);
                    meData.user.subjects.splice(index, 1);
                    index = meData.user.subjects.indexOf(pseudoGroupID);
                    meData.user.subjects.splice(index, 1);
                    if ($.isFunction(callback)){
                        callback(true);
                    }
                },
                error: function() {
                    if ($.isFunction(callback)){
                        callback(false);
                    }
                }
            });
        },

        /**
         * Retrieves the profile picture for the group
         *
         * @param {Object} profile the groups profile (data.me.profile for the current user)
         * @return {String} the url for the profile picture
         */
        getProfilePicture : function(profile) {
            return sakai_util.constructProfilePicture(profile, "group");
        },

        /**
         * Add users to the specified group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {Array} users Array of user/group IDs to add to the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Function} callback Callback function
         */
        addUsersToGroup : function(groupID, users, medata, managerShip, callback) {
            var reqData = [];
            var currentUserIncluded = false;

            // Construct the batch requests
            $.each(users, function(index, user) {
                var url = "/system/userManager/group/" + groupID + ".update.json";
                if (user.permission){
                    url = "/system/userManager/group/" + groupID + "-" + user.permission.toLowerCase() + ".update.json";
                }
                var data = {};
                if (managerShip){
                    data[":manager"] = user.user;
                } else if (user.viewer === true) { // user is only a viewer, not a member
                    data[":viewer"] = user.user;
                } else {
                    data[":member"] = user.user;
                    data[":viewer"] = user.user;
                }
                reqData.push({
                    "url": url,
                    "method": "POST",
                    "parameters": data
                });
                if (user.user === medata.user.userid){
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
         * @param {Array} users Array of user/group IDs to remove from the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Function} callback Callback function
         */
        removeUsersFromGroup : function(groupID, users, medata, callback) {
            var reqData = [];
            var currentUserIncluded = false;

            $.each(users, function(index, user) {
                reqData.push({
                    "url": "/system/userManager/group/" + groupID + "-" + user.permission + ".update.json",
                    "method": "POST",
                    "parameters": {
                        "_charset_":"utf-8",
                        ":member@Delete": user.userid,
                        ":viewer@Delete": user.userid
                    }
                });
                if (user.userid === medata.user.userid){
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
            newjson.entry.sort(function(a, b){
                return a["sakai:group-title"] > b["sakai:group-title"];
            });
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
            for (var w = 0; w < category.templates.length; w++){
                if (category.templates[w].id === id){
                    template = category.templates[w];
                    break;
                }
            }
            return template;
        }

    };
    return sakaiGroupsAPI;
});
