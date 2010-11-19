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
sakai.api.Groups = sakai.api.Groups || {};


/**
 * Create a group
 * @param {String} id the id of the group that's being created
 * @param {String} title the title of the group that's being created
 * @param {String} description the description of the group that's being created
 * @param {Function} callback the callback function for when the group save is complete. It will pass
 *                            two params, success {Boolean} and nameTaken {Boolean}
*/
sakai.api.Groups.createGroup = function(id, title, description, callback) {
    /**
     * Check if the group is created correctly and exists
     * @param {String} groupid
     */
    var groupExists = function(groupid){
        // Check if the group exists.
        var groupExists = false;
        $.ajax({
            url: "/~" + groupid + ".json",
            type: "GET",
            async: false,
            success: function(data, textStatus) {
                groupExists = true;
            }
        });
        return groupExists;
    };

    /**
     * Create the group.
     * @param {String} groupid the id of the group that's being created
     * @param {String} grouptitle the title of the group that's being created
     * @param {String} groupdescription the description of the group that's being created
     * @param {Function} callback the callback function for when the group save is complete. It will pass
     *                            two params, success {Boolean} and nameTaken {Boolean}
    */
    var saveGroup = function(groupid, grouptitle, groupdescription, callback){
        $.ajax({
            url: sakai.config.URL.GROUP_CREATE_SERVICE,
            data: {
                "_charset_":"utf-8",
                ":name": groupid,
                ":sakai:manager": sakai.data.me.user.userid,
                "sakai:group-title" : grouptitle,
                "sakai:group-description" : groupdescription,
                "sakai:group-id": groupid,
                ":sakai:pages-template": "/var/templates/site/" + sakai.config.defaultGroupTemplate,
                "sakai:pages-visible": sakai.config.Permissions.Groups.visible["public"]
            },
            type: "POST",
            success: function(data, textStatus) {
                // set default permissions for this group
                sakai.api.Groups.setPermissions(groupid,
                    sakai.config.Permissions.Groups.joinable.manager_add,
                    sakai.config.Permissions.Groups.visible["public"],
                    function (success, errorMessage) {
                        if(success) {
                            if ($.isFunction(callback)) {
                                callback(true, false);
                            }
                        } else {
                            debug.error("doSaveGroup failed to set group permissions: " + errorMessage);
                            if ($.isFunction(callback)) {
                                callback(false, false);
                            }
                        }
                    }
                );
            },
            error: function(xhr, textStatus, thrownError) {
                debug.error("An error has occurred: " + xhr.status + " " + xhr.statusText);
                if ($.isFunction(callback)) {
                    callback(false, false);
                }
            }
        });
    };

    // check if the group exists
    if (!groupExists(id)) {
        saveGroup(id, title, description, callback);
    } else {
        if ($.isFunction(callback)) {
            callback(false, true);
        }
    }
};

/**
 * Public function used to set joinability and visibility permissions for a
 * group with groupid.
 *
 * @param {String} groupid The id of the group that needs permissions set
 * @param {String} joinable The joinable state for the group (from sakai.config.Permissions.Groups)
 * @param {String} visible The visibile state for the group (from sakai.config.Permissions.Groups)
 * @param {Function} callback Function to be called on complete - callback
 *   args: (success, errorMessage)
 * @return None
 */
sakai.api.Groups.setPermissions = function(groupid, joinable, visible, callback) {
    if(groupid && typeof(groupid) === "string" &&
       sakai.api.Security.isValidPermissionsProperty(sakai.config.Permissions.Groups.joinable, joinable) &&
       sakai.api.Security.isValidPermissionsProperty(sakai.config.Permissions.Groups.visible, visible)) {

        // issue a BATCH POST to update Jackrabbit group & Home Folder group
        var batchRequests = [];
        var jackrabbitUrl = "/system/userManager/group/" + groupid + ".update.html";
        var homeFolderUrl = "/~" + groupid + ".modifyAce.html";

        // determine visibility state
        if(visible == sakai.config.Permissions.Groups.visible.managers) {
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
        } else if(visible == sakai.config.Permissions.Groups.visible.members) {
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
        } else if(visible == sakai.config.Permissions.Groups.visible.allusers) {
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
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type: "POST",
            data: {
                requests: $.toJSON(batchRequests)
            },
            success: function(data){
                // update group context and call callback
                if(sakai.currentgroup && sakai.currentgroup.data && sakai.currentgroup.data.authprofile) {
                    sakai.currentgroup.data.authprofile["sakai:group-joinable"] = joinable;
                    sakai.currentgroup.data.authprofile["sakai:group-visible"] = visible;
                }
                if(typeof(callback) === "function") {
                    callback(true, null);
                }
            },
            error: function(xhr, textStatus, thrownError){
                // Log an error message
                debug.error("sakai.grouppermissions.setPermissions - batch post failed");

                if(typeof(callback) === "function") {
                    callback(false, textStatus);
                }
            }
        });
    } else {
        if(typeof(callback) === "function") {
            callback(false, "Invalid arguments sent to sakai.api.Groups.setPermissions");
        }
    }
};


/**
 * Determines whether the current user is a manager of the given group.
 *
 * @param groupid {String} id of the group to check
 * @return true if the current user is a manager, false otherwise
 */
sakai.api.Groups.isCurrentUserAManager = function (groupid) {
    if(!groupid || typeof(groupid) !== "string") {
        return false;
    }

    var managersGroupId = groupid + "-managers";
    if($.inArray(managersGroupId, sakai.data.me.user.subjects) !== -1) {
        // current user is a group manager
        return true;
    } else {
        return false;
    }
};


/**
 * Determines whether the current user is a member of the given group.
 * Managers are considered members of a group. If the current user is a manager
 * of the group, this function will return true.
 *
 * @param groupid {String} id of the group to check
 * @return true if the current user is a member or manager, false otherwise
 */
sakai.api.Groups.isCurrentUserAMember = function (groupid) {
    if(!groupid || typeof(groupid) !== "string") {
        return false;
    }

    if($.inArray(groupid, sakai.data.me.user.subjects) !== -1) {
        // current user is a group member
        return true;
    } else {
        return false;
    }
};


/**
 * Adds the specified user to a specified group
 *
 * @param {String} userID The ID of the user to add to the group
 * @param {String} groupID The ID of the group to add the user to
 * @param {Function} callback Callback function executed at the end of the
 * operation - callback args:
 * -- {Boolean} success true if the operation succeeded, false if it failed
 * -- {Object} data data returned on successful operation, xhr on failed operation
 */
sakai.api.Groups.addToGroup = function(userID, groupID, callback) {
    if (userID && typeof(userID) === "string" &&
        groupID && typeof(groupID) === "string") {
        // add user to group
        $.ajax({
            url: "/system/userManager/group/" + groupID + ".update.json",
            data: {
                "_charset_":"utf-8",
                ":member": userID
            },
            type: "POST",
            success: function (data) {
                if (typeof(callback) === "function") {
                    callback(true, data);
                }
            },
            error: function (xhr, textStatus, thrownError) {
                if (typeof(callback) === "function") {
                    callback(false, xhr);
                }
            }
        });
    } else {
        if (typeof(callback) === "function") {
            callback(false, {"textStatus": "Invalid arguments sent to sakai.api.Groups.addToGroup()"});
        }
    }
};


/**
 * Removes the specified user from a specified group
 *
 * @param {String} userID The ID of the user to remove from the group
 * @param {String} groupID The ID of the group to remove the user from
 * @param {Function} callback Callback function executed at the end of the
 * operation - callback args:
 * -- {Boolean} success true if the operation succeeded, false if it failed
 * -- {Object} data data returned on successful operation, xhr on failed operation
 */
sakai.api.Groups.removeFromGroup = function(userID, groupID, callback) {
    if (userID && typeof(userID) === "string" &&
        groupID && typeof(groupID) === "string") {
        $.ajax({
            url: "/system/userManager/group/" + groupID + ".update.json",
            data: {
                "_charset_":"utf-8",
                ":member@Delete": userID
            },
            type: "POST",
            success: function (data) {
                if (typeof(callback) === "function") {
                    callback(true, data);
                }
            },
            error: function (xhr, textStatus, thrownError) {
                if (typeof(callback) === "function") {
                    callback(false, xhr);
                }
            }
        });
    } else {
        if (typeof(callback) === "function") {
            callback(false, {"textStatus": "Invalid arguments sent to sakai.api.Groups.removeFromGroup()"});
        }
    }
};


/**
 * Creates a join request for the given user for the specified group
 *
 * @param {String} userID ID of the user that wants to join the group
 * @param {String} groupID ID of the group to the user wants to join
 * @param {Function} callback Callback function executed at the end of the
 * operation - callback args:
 *  -- {Boolean} success True if operation succeeded, false otherwise
 *  -- {Object} error null if successful, xhr data otherwise
 */
sakai.api.Groups.addJoinRequest = function (userID, groupID, callback) {
    if (userID && typeof(userID) === "string" &&
        groupID && typeof(groupID) === "string") {
        $.ajax({
            url: "/~" + groupID + "/joinrequests.create.html?userid=" + userID,
            type: "POST",
            success: function (data) {
                if (typeof(callback) === "function") {
                    callback(true, null);
                }
            },
            error: function (xhr, textStatus, thrownError) {
                if (typeof(callback) === "function") {
                    callback(false, xhr);
                }
            }
        });
    } else {
        if (typeof(callback) === "function") {
            callback(false, {"textStatus": "Invalid arguments sent to sakai.api.Groups.addJoinRequest()"});
        }
    }
};


sakai.api.Groups.removeJoinRequest = function (userID, groupID, callback) {
    if (userID && typeof(userID) === "string" &&
        groupID && typeof(groupID) === "string") {
        $.ajax({
            url: "/~" + groupID + "/joinrequests/" + userID,
            data: {
                ":operation": "delete"
            },
            type: "POST",
            success: function (data) {
                if (typeof(callback) === "function") {
                    callback(true, null);
                }
            },
            error: function (xhr, textStatus, thrownError) {
                if (typeof(callback) === "function") {
                    callback(false, xhr);
                }
            }
        });
    } else {
        if (typeof(callback) === "function") {
            callback(false, {"textStatus": "Invalid arguments sent to sakai.api.Groups.removeJoinRequest()"});
        }
    }
};


/**
 * Returns all join requests for the specified group
 *
 * @param {String} groupID ID of the group to fetch join requests for
 * @param {Function} callback Callback function executed at the end of the
 * @param {Boolean} async Optional argument to set whether this operation is
 *   asynchronous or not. Default is true.
 * operation - callback args:
 *  -- {Boolean} success true if operation succeeded, false otherwise
 *  -- {Object} joinrequest data if successful, xhr data otherwise
 */
sakai.api.Groups.getJoinRequests = function (groupID, callback, async) {
    if (groupID && typeof(groupID) === "string") {
        if (async === null) {
            async = true;
        }
        $.ajax({
            url: "/var/joinrequests/list.json?groupId=" + groupID,
            type: "GET",
            async: async,
            success: function (data) {
                if (typeof(callback) === "function") {
                    callback(true, data);
                }
            },
            error: function (xhr, textStatus, thrownError) {
                if (typeof(callback) === "function") {
                    callback(false, xhr);
                }
            }
        });
    } else {
        if (typeof(callback) === "function") {
            callback(false, {"textStatus": "Invalid arguments sent to sakai.api.Groups.getJoinRequests()"});
        }
    }
};


/**
 * Returns all the users who are member of a certain group
 *
 * @param {String} groupID The ID of the group we would like to get the members
 * of
 * @param {Function} callback Callback function executed at the end of the
 * operation, containing the member user's data
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.getMembers = function(groupID, callback) {

};
