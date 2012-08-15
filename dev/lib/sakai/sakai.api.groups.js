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
        'jquery',
        'config/config_custom',
        'sakai/sakai.api.server',
        'sakai/sakai.api.util',
        'sakai/sakai.api.i18n',
        'sakai/sakai.api.user',
        'sakai/sakai.api.communication',
        'underscore'
    ],
    function($, sakai_conf, sakai_serv, sakai_util, sakai_i18n, sakai_user, sakai_comm, _) {

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
                url: '/~' + groupid + '/public.infinity.json',
                async: async,
                cache: cache,
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    debug.error('Could not get data for group ' + groupid);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        groupData : {},

        /**
         * Gets information for specified group
         *
         * @param {Object} options Contains function parameters
         * @param {Function} callback Callback function, passes ( {Boolean} success, {Object} data )
         *
        */
        getGroupInformation: function(options, callback) {
            if (!options || !options.groupId) {
                throw 'getGroupInformation: The options object is empty or no groupId was provided.';
            }
            var groupId = options.groupId;
            var groupData = {};
            sakai_serv.loadJSON('/system/userManager/group/' + groupId + '.json', function(success, data) {
                if (success) {
                    groupData.authprofile = data.properties;
                    groupData.authprofile.picture = sakaiGroupsAPI.getProfilePicture(groupData.authprofile);

                    // Cache the response
                    sakaiGroupsAPI.groupData[groupId] = data;
                }
                if ($.isFunction(callback)) {
                    callback(success, groupData);
                }
            });
        },

        /**
         * Get the data for the specified group
         *
         * @param {Object} groupids The ID of the group or an array of group IDs
         * @param {Function} callback Callback function, passes (success, (data|xhr))
         * @param {Boolean} async If this call should be ascynronous, defaults to true
         */
        getGroupAuthorizableData : function(groupids, callback) {
            var toReturn = {};
            var batchRequest = [];
            if (_.isString(groupids)) {
                groupids = [groupids];
            }
            $.each(groupids, function(index, groupid) {
                if ($.isPlainObject(sakaiGroupsAPI.groupData[groupid])) {
                    toReturn[groupid] = sakaiGroupsAPI.groupData[groupid];
                } else {
                    batchRequest.push({
                        url: '/system/userManager/group/' + groupid + '.json',
                        method: 'GET'
                    });
                }
            });
            sakai_serv.batch(batchRequest, function(success, response) {
                $.each(response.results, function(index, item) {
                    var group = $.parseJSON(item.body);
                    if (group && group.properties) {
                        sakaiGroupsAPI.groupData[group.properties['sakai:group-id']] = group;
                        toReturn[group.properties['sakai:group-id']] = group;
                    }
                });
                if ($.isFunction(callback)) {
                    callback(true, toReturn);
                }
            });
        },

        checkIfGroupExists : function(groupid) {
            // Check if the group exists.
            var groupExists = false;
            $.ajax({
                url: '/~' + groupid + '.json',
                type: 'GET',
                async: false,
                success: function(data, textStatus) {
                    groupExists = true;
                }
            });
            return groupExists;
        },

        /**
         * Create a group
         * @param {String} id the id of the group that's being created
         * @param {String} title the title of the group that's being created
         * @param {String} description the description of the group that's being created
         * @param {Array} tags The tags to tag the group with on creation
         * @param {Array} users An array of users of the format:
         *  'name': user name
         *  'firstName': user's first name
         *  'userid': user's userid
         *  'role': the permission to give the user (manager, member, ta)
         *  'roleString': The translated role string to give the user ('Member', 'Manager', 'Teaching Assistant')
         *  'creator': true | false (if this user is the creator of the group)
         * @param {String} joinability The joinability of the group (yes, no, withauth)
         * @param {String} visibility The visibility of the group (members-only, logged-in-only, public)
         * @param {String} templatePath The path in the /var/templates/worlds space for this template, without .json (/var/templates/worlds/group/basic-group)
         * @param {String} subject The tokenized subject of the message (translated) to send to the users joined to this group
         * @param {String} body The body of the aforementioned message in the same format
         * @param {Object} meData The sakai.data.me object
         * @param {Function} callback the callback function for when the group save is complete. It will pass
         *                            two params, success {Boolean} and nameTaken {Boolean}
        */
        createGroup : function(id, title, description, tags, users, joinability, visibility, templatePath, subject, body, meData, callback) {
            var data = {
                'id' : id,
                'title' : title,
                'tags' : tags,
                'description' : description,
                'visibility' : visibility,
                'joinability' : joinability,
                'worldTemplate' : templatePath,
                'schemaVersion': sakai_conf.schemaVersion,
                'message' : {
                    'body' : body,
                    'subject' : subject,
                    'creatorName' : sakai_user.getDisplayName(meData.profile),
                    'groupName' : title,
                    'system' : sakai_i18n.getValueForKey('SAKAI'),
                    'link' : sakai_conf.SakaiDomain + '/~' + id,
                    'toSend' : []
                },
                'usersToAdd' : []
            };
            $.each(users, function(i,user) {
                data.usersToAdd.push({
                    'userid': user.userid,
                    'role': user.role
                });
                if (!user.creator) {
                    data.message.toSend.push({
                        'userid': user.userid,
                        'firstName': user.firstName,
                        'role': user.roleString,
                        'messageMode': 'both'
                    });
                }
            });

            $.ajax({
                url: sakai_conf.URL.WORLD_CREATION_SERVICE,
                data: {data: JSON.stringify(data)},
                type: 'POST',
                success: function(_data, textStatus) {
                    var success = true;
                    if (_data && _data.results && _data.results[0] && _data.results[0].error) {
                        success = false;
                        if (_data.results[0].error === "Invalid group id") {
                            data.errorMessage = "GROUP_CREATION_ERROR_INVALID_ID";
                        }
                    }
                    callback(success, data);
                },
                error: function() {
                    callback(false, data);
                }
            });
        },

        /**
         * Delete a group
         * @param {String} id the id of the group that's being deleted
         * @param {Function} callback the callback function for when the group delete is complete.
        */
        deleteGroup : function(groupID, meData, callback) {
            sakaiGroupsAPI.getGroupAuthorizableData(groupID, function(success, groupAuthData) {
                if (success && groupAuthData) {
                    groupAuthData = groupAuthData[groupID];
                    var groupArray = [groupID];

                    // delete any pseudo groups
                    if (groupAuthData.properties['sakai:roles']) {
                        var roles = $.parseJSON(groupAuthData.properties['sakai:roles']);
                        if (roles && roles.length > 0) {
                            for (var r = 0; r < roles.length; r++) {
                                groupArray.push(groupID + '-' + roles[r].id);
                            }
                        }
                    }

                    // delete the group
                    $.ajax({
                        url: '/system/userManager.delete.json',
                        type: 'POST',
                        traditional: true,
                        data: {
                            ':applyTo': groupArray
                        },
                        success: function(data) {
                            if ($.isFunction(callback)) {
                                callback(true);
                            }
                        },
                        error: function() {
                            if ($.isFunction(callback)) {
                                callback(false);
                            }
                        }
                    });
                } else if ($.isFunction(callback)) {
                    callback(false);
                }
            });
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
            var groupProfileURL = '/~' + id + '/public/authprofile.profile.json';

            $.ajax({
                url: groupProfileURL,
                data: {
                    '_charset_':'utf-8',
                    'sakai:group-title' : title,
                    'sakai:group-description' : description,
                    'sakai:group-kind' : kind
                },
                type: 'POST',
                error: function(xhr, textStatus, thrownError) {
                    debug.error('Unable to update group information.');
                },
                complete: function(xhr, textStatus) {
                    if ($.isFunction(callback)) {
                        callback(textStatus === 'success');
                    }
                }
            });
        },

        /**
         * Update group profile
         *
         * @param {String} id The id of the group to update
         * @param {Object} profile The group's profile
         * @param {Array} tags The group's tags
         * @param {Object} groupData The group's authprofile data - need this for role extraction
         * @param {Function} callback Callback function, passes (success, updated)
         */
        updateGroupProfile : function(id, profile, tags, groupData, callback) {
            var groupProfileURL = '/~' + id + '/public/authprofile';
            var groupProfileSaveURL = groupProfileURL + '.profile.json';
            var batch = [];
            var doProfilePost = false,
                doTagsPost = false,
                doPermissionPost = false;

            var updatePermissions = function(_callback) {
                var roles = $.parseJSON(groupData['sakai:roles']);
                sakaiGroupsAPI.setPermissions(id, profile[ 'sakai:group-joinable' ], profile[ 'sakai:group-visible' ], roles, function( success, data ) {
                    if ( $.isFunction( _callback ) ) {
                        _callback( success );
                    }
                });
            };

            var updateProfile = function(_callback) {
                sakai_serv.batch( batch, function( success, data ) {
                    if ( $.isFunction( _callback ) ) {
                        _callback( success );
                    }
                });
            };

            // Get the difference of the tags arrays. If there is one, then we should update it
            groupData[ 'sakai:tags' ] = groupData[ 'sakai:tags' ] || [];
            var merged = _.uniq( $.merge( $.merge( [], tags ), groupData[ 'sakai:tags' ] ) );
            if ( merged.length !== tags.length || merged.length !== groupData[ 'sakai:tags' ].length ) {
                doTagsPost = true;
            }

            if ( groupData[ 'sakai:group-joinable' ] !== profile[ 'sakai:group-joinable' ] || groupData[ 'sakai:group-visible' ] !== profile[ 'sakai:group-visible' ] ) {
                doPermissionPost = true;
            }

            $.each( profile, function(i, data) {
                if ( groupData[i] !== data ) {
                    doProfilePost = true;
                    // Update the group data immediately
                    groupData[i] = data;
                }
            });

            if ( doProfilePost || doTagsPost || doPermissionPost ) {
                if ( doProfilePost ) {
                    batch.push({
                        'url': groupProfileSaveURL,
                        'method': 'POST',
                        'parameters': profile
                    });
                    // Also update the pseudo-groups sakai:parent-group-title property
                    var roles = $.parseJSON(groupData['sakai:roles']);
                    $.each(roles, function(i, role) {
                        batch.push({
                            'url': '/system/userManager/group/' + id + '-' + role.id + '.update.json',
                            'method': 'POST',
                            'parameters': {
                                'sakai:parent-group-title': profile['sakai:group-title']
                            }
                        });
                    });
                }

                // Always call tagEntity, it has it's own internal 'no POSTing if no changes' mechanism
                sakai_util.tagEntity( groupProfileURL, tags, groupData[ 'sakai:tags' ], function( success, newTags ) {
                    groupData[ 'sakai:tags' ] = newTags;

                    if ( doProfilePost ) {
                        updateProfile(function(success, data) {
                            if ( doPermissionPost ) {
                                updatePermissions(function(success, data) {
                                    if ( $.isFunction( callback ) ) {
                                        callback( success );
                                    }
                                });
                            } else {
                                if ( $.isFunction( callback ) ) {
                                    callback( success );
                                }
                            }
                        });
                    } else if ( doPermissionPost ) {
                        updatePermissions(function(success, data) {
                            if ( $.isFunction( callback ) ) {
                                callback( success );
                            }
                        });
                    } else {
                        if ( $.isFunction( callback ) ) {
                            callback( success );
                        }
                    }
                });
            } else {
                callback( true );
            }
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
            if (!value || value === '') {
                // value is empty - not valid
                return false;
            }
            for(var index in permissionsProperty) {
                if (permissionsProperty.hasOwnProperty(index)) {
                    if (value === permissionsProperty[index]) {
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
         * @param {Array} roles The roles for this group, from the 'sakai:roles' property of the group
         * @param {Function} callback Function to be called on complete - callback
         *   args: (success)
         * @return None
         */
        setPermissions : function(groupid, joinable, visible, roles, callback) {
            if ( groupid && _.isString(groupid) &&
               this.isValidPermissionsProperty(sakai_conf.Permissions.Groups.joinable, joinable) &&
               this.isValidPermissionsProperty(sakai_conf.Permissions.Groups.visible, visible)) {

                // issue a BATCH POST to update Jackrabbit group & Home Folder group
                var batchRequests = [];
                // add in the main group, we need to modify their permissions too
                roles.push({id:groupid});
                $.each(roles, function(i, role) {
                    var groupURL = groupid;
                    if (role.id !== groupid) {
                        groupURL += '-' + role.id;
                    }
                    var groupUpdateURL = '/system/userManager/group/' + groupURL + '.update.html';

                    // determine visibility state
                    if (visible === sakai_conf.Permissions.Groups.visible.members) {
                        // visible to members only, so remove everyone & anonymous, as they're not a member
                        batchRequests.push({
                            'url': groupUpdateURL,
                            'method': 'POST',
                            'parameters': {
                                ':viewer@Delete':
                                [
                                    'everyone',
                                    'anonymous'
                                ],
                                'sakai:group-visible': visible,
                                'sakai:group-joinable': joinable
                            }
                        });
                    } else if (visible === sakai_conf.Permissions.Groups.visible.allusers) {
                        // visible to all logged in users
                        // remove anonymous, as this is only for logged in users
                        batchRequests.push({
                            'url': groupUpdateURL,
                            'method': 'POST',
                            'parameters': {
                                ':viewer': 'everyone',
                                ':viewer@Delete': 'anonymous',
                                'sakai:group-visible': visible,
                                'sakai:group-joinable': joinable
                            }
                        });
                    } else {
                        // visible to the public
                        // all logged in users 'everyone'
                        // all non-logged in users 'anonymous'
                        batchRequests.push({
                            'url': groupUpdateURL,
                            'method': 'POST',
                            'parameters': {
                                ':viewer':
                                [
                                    'everyone',
                                    'anonymous'
                                ],
                                'sakai:group-visible': visible,
                                'sakai:group-joinable': joinable
                            }
                        });
                    }
                });


                // issue the BATCH POST
                sakai_serv.batch(batchRequests, function(success, data) {
                    if (success) {
                        // update group context and call callback
                        if (sakai_global.currentgroup && sakai_global.currentgroup.data && sakai_global.currentgroup.data.authprofile) {
                            sakai_global.currentgroup.data.authprofile['sakai:group-joinable'] = joinable;
                            sakai_global.currentgroup.data.authprofile['sakai:group-visible'] = visible;
                        }
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    } else {
                        // Log an error message
                        debug.error('Setting permissions on the group failed');
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn('Invalid arguments sent to sakai.api.Groups.setPermissions');
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
                var roles = $.parseJSON(groupinfo['sakai:roles']);
                for (var r = 0; r < roles.length; r++) {
                    if (roles[r].isManagerRole) {
                        managementRoles.push(roles[r].id);
                    }
                }
                var canManage = false;
                for (var i = 0; i < meData.groups.length; i++) {
                    for (var mr = 0; mr < managementRoles.length; mr++) {
                        if (meData.groups[i]['sakai:group-id'] === groupinfo['sakai:group-id'] + '-' + managementRoles[mr]) {
                            canManage = true;
                        }
                    }
                }
                return canManage;
            } else {
                if (!groupid || typeof(groupid) !== 'string') {
                    return false;
                }
                var managersGroupId = groupid + '-manager';
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
            if (!groupid || typeof(groupid) !== 'string') {
                return false;
            }
            return $.inArray(groupid, meData.user.subjects) !== -1;
        },


        /**
         * Determines whether the current user is allowed to leave the group
         *
         * @param groupid {String} id of the group to check
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Function} callback Function to be called on complete - callback
         */
        isAllowedToLeave : function(groupids, meData, callback) {
            sakaiGroupsAPI.getGroupAuthorizableData(groupids, function(groupSuccess, groupData) {
                var toReturn = {};
                var groupDataCache = {};
                var toCheck = [];
                $.each(groupData, function(groupid, group) {
                    if (sakaiGroupsAPI.isCurrentUserAManager(groupid, meData, group.properties)) {
                        // Check if there is more then one manager in the group
                        toCheck.push(groupid);
                        groupDataCache[groupid] = group.properties;
                    } else {
                        // Members are always allowed to leave the group, managers should always be present and cannot leave when they are the last one in the group
                        toReturn[groupid] = true;
                    }
                });
                sakaiGroupsAPI.getMembers(toCheck, function(membersSuccess, memberData) {
                    $.each(memberData, function(groupid, members) {
                        var numManagers = sakaiGroupsAPI.getManagerCount(groupDataCache[groupid], members);
                        toReturn[groupid] = numManagers > 1;
                    });
                    if ($.isFunction(callback)) {
                        callback(toReturn);
                    }
                });
            });
        },

        /**
         * Get the number of managers in the group
         *
         * @param {Object} groupdata The data from the group's authprofile
         * @param {Object} members The result of sakai.api.Groups.getMembers()
         */
        getManagerCount : function(groupdata, members) {
            var managers = 0;
            if (groupdata['sakai:roles']) {
                var roles = [],
                    managerRoles = [];
                if (_.isString(groupdata['sakai:roles'])) {
                    roles = $.parseJSON(groupdata['sakai:roles']);
                }
                $.each(roles, function(i, role) {
                    if (role.isManagerRole) {
                        managerRoles.push(role.id);
                    }
                });
                $.each(members, function(i, member) {
                    member = member.results ? member.results : member;
                    if ($.inArray(i, managerRoles) > -1 && member.length) {
                        managers += member.length;
                    }
                });
            }
            return managers;
        },

        /**
         * Creates a join request for the current user for a given group
         * @param {String} groupID     ID of the group to the user wants to join
         * @param {Function} callback  Callback function executed at the end of the
         *                             operation - callback args:
         *  -- {Boolean} success       True if operation succeeded, false otherwise
         */
        addJoinRequest : function(groupID, callback) {
            sakaiGroupsAPI.getGroupAuthorizableData(groupID, function(success, groupData) {
                groupData = groupData[groupID];
                sakaiGroupsAPI.getMembers(groupID, function(success, groupMembers) {
                    groupMembers = groupMembers[groupID];

                    // Function used to send the join request message to the managers of the
                    // group that's being joined
                    var sendJoinRequestMessage = function(managerArray) {
                        var userString = sakai_user.getDisplayName(sakai_user.data.me.profile);
                        var groupString = groupData.properties['sakai:group-title'];
                        var systemString = sakai_i18n.getValueForKey('SAKAI');
                        var profileLink = sakai_conf.SakaiDomain + '/~' + sakai_util.safeURL(sakai_user.data.me.user.userid);
                        var acceptLink = sakai_conf.SakaiDomain + '/~' + groupData.properties['sakai:group-id'] + '#e=joinrequests';
                        var subject = '',
                            body = '';
                        if (groupData.properties['sakai:group-joinable'] === 'withauth') {
                            subject = sakai_i18n.getValueForKey('GROUP_JOIN_REQUEST_TITLE')
                                      .replace(/\$\{sender\}/g, userString)
                                      .replace(/\$\{group\}/g, groupString);
                            body = sakai_i18n.getValueForKey('GROUP_JOIN_REQUEST_BODY')
                                   .replace(/\$\{sender\}/g, userString)
                                   .replace(/\$\{group\}/g, groupString)
                                   .replace(/\$\{system\}/g, systemString)
                                   .replace(/\$\{profilelink\}/g, profileLink)
                                   .replace(/\$\{acceptlink\}/g, acceptLink)
                                   .replace(/\$\{br\}/g,'\n');
                        } else {
                            subject = sakai_i18n.getValueForKey('GROUP_JOINED_TITLE')
                                     .replace(/\$\{sender\}/g, userString)
                                     .replace(/\$\{group\}/g, groupString);
                            body = sakai_i18n.getValueForKey('GROUP_JOINED_BODY')
                                   .replace(/\$\{sender\}/g, userString)
                                   .replace(/\$\{group\}/g, groupString)
                                   .replace(/\$\{system\}/g, systemString)
                                   .replace(/\$\{profilelink\}/g, profileLink)
                                   .replace(/\$\{br\}/g,'\n');
                        }
                        sakai_comm.sendMessage(managerArray, sakai_user.data.me, subject, body, false, false, false, true, 'join_request');
                    };

                    // User id to send the join request for
                    var userID = sakai_user.data.me.user.userid;
                    // Retrieve the join role for the current group
                    var roles = $.parseJSON(groupData.properties['sakai:roles']);
                    var joinRole = groupData.properties['sakai:joinRole'];
                    var pseudoGroupID = groupID + '-' + joinRole;
                    // Send the join request
                    $.ajax({
                        url: '/~' + pseudoGroupID + '/joinrequests.create.html',
                        type: 'POST',
                        data: {
                            userid: userID
                        },
                        success: function(data) {
                            // Adjust the cached me-object to reflect the pending request
                            sakai_user.data.me.user.subjects.push(groupID, pseudoGroupID);
                            // Send a message to the managers of the group
                            var managers = [];
                            for (var r = 0; r < roles.length; r++) {
                                if (roles[r].isManagerRole && groupMembers[roles[r].id] && groupMembers[roles[r].id].results) {
                                    for (var m = 0; m < groupMembers[roles[r].id].results.length; m++) {
                                        managers.push(groupMembers[roles[r].id].results[m].userid);
                                    }
                                }
                            }
                            sendJoinRequestMessage(managers);
                            if ($.isFunction(callback)) {
                                callback(true);
                            }
                        },
                        error: function(status) {
                            debug.error('Could not process join request');
                            if ($.isFunction(callback)) {
                                callback(false);
                            }
                        }
                    });
                });
            });
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
            if (userID && typeof(userID) === 'string' &&
                groupID && typeof(groupID) === 'string') {
                $.ajax({
                    url: '/~' + groupID + '/joinrequests/' + sakai_util.safeURL(userID),
                    data: {
                        ':operation': 'delete'
                    },
                    type: 'POST',
                    success: function(data) {
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    },
                    error: function(xhr, textStatus, thrownError) {
                        debug.error('Could not remove join request');
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn('Invalid arguments sent to sakai.api.Groups.removeJoinRequest()');
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
                    url: '/var/joinrequests/list.json?groupId=' + groupID,
                    type: 'GET',
                    async: async,
                    success: function(data) {
                        if ($.isFunction(callback)) {
                            callback(true, data);
                        }
                    },
                    error: function(xhr, textStatus, thrownError) {
                        debug.error('Request to get join requests failed');
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            } else {
                debug.warn('Invalid arguments sent to sakai.api.Groups.getJoinRequests()');
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        },

        /**
         * Searches through managers and members of a group and returns the results
         * @param {String} groupId Id of the group to search in
         * @param {String} query Query put in by the user, if empty a search for all participants is executed
         * @param {Number} num The number of items to search for (page size)
         * @param {Number} page The current page (0-indexed)
         * @param {String} sort The parameter to sort on (firstName or lastName)
         * @param {String} sortOrder The direction of the sort (desc or asc)
         * @param {Function} callback Function executed on success or error
         * @param {Boolean} roleCache Flag to get group role data from cache if available
         */
        searchMembers: function(groupId, query, num, page, sort, sortOrder, callback, roleCache) {
            if (groupId) {
                var url = '';
                if (query && query !== '*') {
                    url = sakai_conf.URL.SEARCH_GROUP_MEMBERS + '?group=' + groupId + '&q=' + query;
                } else {
                    url = sakai_conf.URL.SEARCH_GROUP_MEMBERS_ALL + '?group=' + groupId;
                }
                if (num !== undefined) {
                    url += '&items=' + num;
                }
                if (page !== undefined) {
                    url += '&page=' + page;
                }
                if (sort) {
                    url += '&sortOn=' + sort;
                }
                if (sortOrder) {
                    url += '&sortOrder=' + sortOrder;
                }
                $.ajax({
                    url: url,
                    type: 'GET',
                    cache: 'false',
                    success: function(data) {
                        var participantCount = 0;
                        if (data.results.length) {
                            // Do a couple requests first so the group data is cached
                            sakaiGroupsAPI.getGroupAuthorizableData(groupId, function() {
                                sakaiGroupsAPI.getRole(data.results[0].userid, groupId, function(success, role) {
                                    $.each(data.results, function(index, user) {
                                        sakaiGroupsAPI.getRole(user.userid, groupId, function(success, role) {
                                            user.role = role;
                                            participantCount++;
                                            if (participantCount === data.results.length) {
                                                if ($.isFunction(callback)) {
                                                    callback(true, data);
                                                }
                                            }
                                        });
                                    });
                                }, roleCache);
                            });
                        } else {
                            if ($.isFunction(callback)) {
                                callback(true, {});
                            }
                        }
                    },
                    error: function(err) {
                        debug.error(err);
                        if ($.isFunction(callback)) {
                            callback(false, err);
                        }
                    }
                });
            } else {
                if ($.isFunction(callback)) {
                    callback(false, false);
                }
            }
        },
        /**
         * Returns all the users who are member of a certain group
         *
         * @param {String} groupids The ID of the group we would like to get the members of or an array of group IDs
         * @param {Function} callback Callback function, passes (success, (data|xhr))
         * @param {Boolean} everyone If we should return managers + members (useful for pseudoGroups)
         * @param {Boolean} noCache Whether or not to refresh the cache
         */
        getMembers : function(groupids, callback, everyone, noCache) {
            var dataToReturn = {};
            var toCheck = [];
            if (_.isString(groupids)) {
                groupids = [groupids];
            }
            $.each(groupids, function(index, groupid) {
                if (sakaiGroupsAPI.groupData[groupid] && sakaiGroupsAPI.groupData[groupid].membersPerRole && !noCache) {
                    dataToReturn[groupid] = sakaiGroupsAPI.groupData[groupid].membersPerRole;
                } else {
                    toCheck.push(groupid);
                }
            });
            sakaiGroupsAPI.getGroupAuthorizableData(toCheck, function(success, groupData) {
                if (success) {
                    var batchRequests = [];
                    var urlToGroupMapping = {};
                    $.each(groupData, function(groupid, group) {
                        var roles = $.parseJSON(group.properties['sakai:roles']);
                        for (var i = 0; i < roles.length; i++) {
                            var selector = 'members';
                            if (everyone) {
                                selector = 'everyone';
                            }
                            var url = '/system/userManager/group/' + groupid + '-' + roles[i].id + '.' + selector + '.json';
                            urlToGroupMapping[url] = {
                                'groupid': groupid,
                                'role': roles[i].id
                            };
                            batchRequests.push({
                                'url': url,
                                'method': 'GET',
                                'parameters': {
                                    items: 1000
                                }
                            });
                        }
                    });
                    sakai_serv.batch(batchRequests, function(success, data) {
                        if (success) {
                            $.each(data.results, function(m, membershiplist) {
                                // Retrieve the group and role id from the URL
                                var groupid = urlToGroupMapping[membershiplist.url].groupid;
                                var roleid = urlToGroupMapping[membershiplist.url].role;
                                // Add the members to the response
                                var members = [];
                                if (membershiplist.status === 200) {
                                    members = $.parseJSON(membershiplist.body);
                                }
                                dataToReturn[groupid] = dataToReturn[groupid] || {};
                                dataToReturn[groupid][roleid] = {'results': members};
                                if (sakaiGroupsAPI.groupData[groupid]) {
                                    sakaiGroupsAPI.groupData[groupid].membersPerRole = sakaiGroupsAPI.groupData[groupid].membersPerRole || {};
                                    sakaiGroupsAPI.groupData[groupid].membersPerRole[roleid] = {'results': members};
                                }
                            });
                            if ($.isFunction(callback)) {
                                callback(true, dataToReturn);
                            }
                        }
                    }, true);
                } else {
                    debug.error('Could not get members group info for ' + groupids);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        groupRoleData : {},

        getRoles : function(groupData, translate) {
            var roles = [];
            groupData.roles = groupData.roles || groupData['sakai:roles'];
            if ( _.isString( groupData.roles ) ) {
                groupData.roles = $.parseJSON( groupData.roles );
            }
            $.each(groupData.roles, function(i,role) {
                if (_.isString(role)) {
                    role = $.parseJSON(role);
                }
                if (translate) {
                    role.title = sakai_i18n.getValueForKey(role.title);
                    role.titlePlural = sakai_i18n.getValueForKey(role.titlePlural);
                }
                roles.push(role);
            });
            return roles;
        },

        getRole : function(userId, groupID, callback, roleCache) {
            var cache = roleCache === false ? false : true;
            var groupInfo = sakaiGroupsAPI.getGroupAuthorizableData(groupID, function(success, data) {
                if (success) {
                    data = data[groupID];
                    var roles = $.parseJSON(data.properties['sakai:roles']);
                    var batchRequests = [];
                    var role;
                    for (var i = 0; i < roles.length; i++) {
                        var url = '/system/userManager/group/' + groupID + '-' + roles[i].id + '.everyone.json';
                        batchRequests.push({
                            'url': url,
                            'method': 'GET',
                            'parameters': {
                                items: 10000
                            }
                        });
                    }
                    var parseRoles = function(data) {
                        var isMatch = function(user, index) {
                            return user.userid === userId;
                        };

                        for (var i = 0; i < roles.length; i++) {
                            if (data.results.hasOwnProperty(i)) {
                                var members = $.parseJSON(data.results[i].body);
                                if (members === null) {
                                  continue;
                                }
                                if ($.grep(members, isMatch).length > 0) {
                                    role = roles[i];
                                    break;
                                }
                            }
                        }
                        if ($.isFunction(callback)) {
                            callback(true, role);
                        }
                    };

                    if (cache && $.isPlainObject(sakaiGroupsAPI.groupRoleData[groupID])) {
                        parseRoles(sakaiGroupsAPI.groupRoleData[groupID]);
                    } else {
                        sakai_serv.batch(batchRequests, function(success, data) {
                            if (success) {
                                sakaiGroupsAPI.groupRoleData[groupID] = data;
                                parseRoles(data);
                            }
                        }, true);
                    }

                } else {
                    debug.error('Could not get members group info for ' + groupID);
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Checks if one role managers the other, returns true if the role has management rights
         *
         * @param {Object} parentRoleObject The role we want to check if it has management rights on the other
         * @param {String} roleIdToCheck The role to check if it can be managed by
         */
        hasManagementRights : function(parentRoleObject, roleIdToCheck) {
            var manages = false;
            if (parentRoleObject.manages) {
                $.each(parentRoleObject.manages, function(i, childRole) {
                    if (childRole === roleIdToCheck) {
                        manages = true;
                        return false;
                    }
                });
            }
            return manages;
        },

        leave : function(groupId, role, meData, callback) {
            var reqs = [
                {
                    url: '/system/userManager/group/'+ groupId + '-' + role.id + '.leave.json',
                    method: 'POST'
                },
                {
                    url: '/system/userManager/group/'+ groupId + '.leave.json',
                    method: 'POST'
                }
            ];
            sakai_serv.batch(reqs, function(success) {
                var pseudoGroupID = groupId + '-' + role;
                var index = meData.user.subjects.indexOf(groupId);
                meData.user.subjects.splice(index, 1);
                index = meData.user.subjects.indexOf(pseudoGroupID);
                meData.user.subjects.splice(index, 1);
                if ($.isFunction(callback)) {
                    callback(success);
                }
            });
        },

        /**
         * Retrieves the profile picture for the group
         *
         * @param {Object} profile the groups profile
         * @return {String} the url for the profile picture
         */
        getProfilePicture : function(profile) {
            return sakai_util.constructProfilePicture(profile, 'group');
        },

        /**
         * Function to process search results for groups
         *
         * @param {Object} results Search results to process
         * @param {Object} meData User object for the user
         * @returns {Object} results Processed results
         */
        prepareGroupsForRender: function(results, meData) {
            $.each(results, function(i, group) {
                if (group['sakai:group-id']) {
                    group.id = group['sakai:group-id'];
                    if (group['sakai:group-title']) {
                        group['sakai:group-title-short'] = sakai_util.applyThreeDots(group['sakai:group-title'], 550, {max_rows: 1,whole_word: false}, 's3d-bold');
                        group['sakai:group-title-shorter'] = sakai_util.applyThreeDots(group['sakai:group-title'], 130, {max_rows: 1,whole_word: false}, 's3d-bold');
                    }

                    if (group['sakai:group-description']) {
                        group['sakai:group-description-short'] = sakai_util.applyThreeDots(group['sakai:group-description'], 580, {max_rows: 2,whole_word: false});
                        group['sakai:group-description-shorter'] = sakai_util.applyThreeDots(group['sakai:group-description'], 150, {max_rows: 2,whole_word: false});
                    }

                    var groupType = sakai_i18n.getValueForKey('OTHER');
                    if (group['sakai:category']) {
                        sakai_util.getTemplates(function(success, templates) {
                            if (success) {
                                for (var c = 0; c < templates.length; c++) {
                                    if (templates[c].id === group['sakai:category']) {
                                        groupType = sakai_i18n.getValueForKey(templates[c].title);
                                    }
                                }
                            } else {
                                debug.error('Could not get the group templates');
                            }
                        });
                    }
                    // Modify the tags if there are any
                    if (group['sakai:tags']) {
                        group.tagsProcessed = sakai_util.formatTags(group['sakai:tags']);
                    } else if (group.basic && group.basic.elements && group.basic.elements['sakai:tags']) {
                        group.tagsProcessed = sakai_util.formatTags(group.basic.elements['sakai:tags'].value);
                    }
                    group.groupType = groupType;
                    group.lastModified = group.lastModified;
                    group.picPath = sakaiGroupsAPI.getProfilePicture(group);
                    group.userMember = false;
                    if (sakaiGroupsAPI.isCurrentUserAManager(group['sakai:group-id'], meData) || sakaiGroupsAPI.isCurrentUserAMember(group['sakai:group-id'], meData)) {
                        group.userMember = true;
                    }
                    // use large default group icon on search page
                    if (group.picPath === sakai_conf.URL.GROUP_DEFAULT_ICON_URL) {
                        group.picPathLarge = sakai_conf.URL.GROUP_DEFAULT_ICON_URL_LARGE;
                    }
                }
            });
            return results;
        },

        /**
         * Change the permission of some users on a group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {Array} rolesToAdd Array of user/group IDs to add to the group
         * @param {Array} rolesToDelete Array of user/group IDs to remove from the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Boolean} managerShip if the user should be added as a manager of the group (almost never is the case)
         * @param {Function} callback Callback function
         */
        changeUsersPermission : function(groupID, rolesToAdd, rolesToDelete, medata, managerShip, callback) {
            var addUserReqs = sakaiGroupsAPI.addUsersToGroup(groupID, rolesToAdd, medata, managerShip, false, true);
            var removeUserReqs = sakaiGroupsAPI.removeUsersFromGroup(groupID, rolesToDelete, medata, false, true);
            $.merge(addUserReqs, removeUserReqs);
            sakai_serv.batch(addUserReqs, function(success, data) {
                if ($.isFunction(callback)) {
                    callback(success, data);
                }
            });
        },

        /**
         * Add users to the specified group
         *
         * @param {String} groupID the ID of the group to add members to
         * @param {Array} users Array of user/group IDs to add to the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Boolean} managerShip if the user should be added as a manager
         * @param {Function} callback Callback function
         * @param {Boolean} onlyReturnRequests only return the requests, don't make them
         */
        addUsersToGroup : function(groupID, users, medata, managerShip, callback, onlyReturnRequests) {
            var reqData = [];
            var currentUserIncluded = false;

            // Construct the batch requests
            $.each(users, function(index, user) {
                var url = '/system/userManager/group/' + groupID + '.update.json';
                if (user.permission) {
                    url = '/system/userManager/group/' + groupID + '-' + user.permission.toLowerCase() + '.update.json';
                }
                var data = {};
                if (managerShip) {
                    data[':manager'] = user.user;
                } else if (user.viewer === true) { // user is only a viewer, not a member
                    data[':viewer'] = user.user;
                } else {
                    data[':member'] = user.user;
                    data[':viewer'] = user.user;
                }
                reqData.push({
                    'url': url,
                    'method': 'POST',
                    'parameters': data
                });
                if (user.user === medata.user.userid) {
                    currentUserIncluded = true;
                }
            });
            if (reqData.length > 0) {
                // batch request to add users to group
                if (onlyReturnRequests) {
                    return reqData;
                } else {
                    sakai_serv.batch(reqData, function(success, data) {
                        if (!success) {
                            debug.error('Could not add users to group');
                        } else if (currentUserIncluded) {
                            medata.user.subjects.push(groupID);
                        }
                        // Add this to the members of the groups in the cache
                        if (sakaiGroupsAPI.groupData[groupID] && sakaiGroupsAPI.groupData[groupID].membersPerRole) {
                            $.each(users, function(index, user) {
                                sakaiGroupsAPI.groupData[groupID].membersPerRole[user.permission] = sakaiGroupsAPI.groupData[groupID].membersPerRole[user.permission] || {'results': []};
                                sakaiGroupsAPI.groupData[groupID].membersPerRole[user.permission].results.push({
                                    'rep:userId': user.user
                                });
                            });
                        }
                        if ($.isFunction(callback)) {
                            callback(success);
                        }
                    });
                }
            } else {
                if ($.isFunction(callback)) {
                    callback(true);
                }
            }
            return true;
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
                    'url': '/p/' + contentID + '.members.json',
                    'method': 'POST',
                    'parameters': {
                        ':viewer': groupID
                    }
                });
            });

            if (reqData.length > 0) {
                // batch request to add content to group
                sakai_serv.batch(reqData, function(success, data) {
                    if (!success) {
                        debug.error('Error adding content to the group');
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
         * @param {String} groupID the ID of the group to remove members from
         * @param {Array} users Array of user/group IDs to remove from the group
         * @param {Object} meData the data from sakai.api.User.data.me
         * @param {Function} callback Callback function
         * @param {Boolean} onlyReturnRequests only return the requests, don't make them
         */
        removeUsersFromGroup : function(groupID, users, medata, callback, onlyReturnRequests) {
            var reqData = [];
            var currentUserIncluded = false;

            $.each(users, function(index, user) {
                var params = {
                    '_charset_':'utf-8',
                    ':manager@Delete': user.userid
                };
                if ((user.hasOwnProperty('removeManagerOnly') && user.removeManagerOnly === false) || !user.hasOwnProperty('removeManagerOnly')) {
                    params[':member@Delete'] = user.userid;
                    params[':viewer@Delete'] = user.userid;
                }
                if (user.permission) {
                    reqData.push({
                        'url': '/system/userManager/group/' + groupID + '-' + user.permission + '.update.json',
                        'method': 'POST',
                        'parameters': params
                    });
                } else {
                    reqData.push({
                        'url': '/system/userManager/group/' + groupID + '.update.json',
                        'method': 'POST',
                        'parameters': params
                    });
                }
                if (user.userid === medata.user.userid) {
                    currentUserIncluded = true;
                }
            });

            if (reqData.length > 0) {
                if (onlyReturnRequests) {
                    return reqData;
                } else {
                    // batch request to remove users from group
                    sakai_serv.batch(reqData, function(success, data) {
                        if (!success) {
                            debug.error('Error removing users from the group');
                        } else if (currentUserIncluded) {
                            // remove the group from medata.subjects
                            var index = medata.user.subjects.indexOf(groupID);
                            medata.user.subjects.splice(index, 1);
                        }
                        if ($.isFunction(callback)) {
                            callback(success);
                        }
                    });
                }
            }
            return true;
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
                        'url': '/p/' + contentID + '.members.json',
                        'method': 'POST',
                        'parameters': {
                            ':viewer@Delete': groupID
                        }
                    });
                }
            });

            if (reqData.length > 0) {
                // batch request to remove content from group
                sakai_serv.batch(reqData, function(success, data) {
                    if (!success) {
                        debug.error('Error removing content from the group');
                    }
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            }
        },

        filterGroup: function(group, includeCollections) {
            if (includeCollections && group['sakai:category'] && group['sakai:category'] === 'collection' && group['sakai:group-title']) {
                return true;
            } else if (!group['sakai:group-title'] || group['sakai:excludeSearch']) {
                return false;
            } else {
                if (group.groupid === 'everyone') {
                    return false;
                } else {
                    return true;
                }
            }
        },

        getMemberships : function(groups, includeCollections) {
            var newjson = {entry: []};
            for (var i = 0, il = groups.length; i < il; i++) {
                if (sakaiGroupsAPI.filterGroup(groups[i], includeCollections)) {
                    newjson.entry.push(groups[i]);
                }
            }
            newjson.entry.sort(function(a, b) {
                if (a['sakai:category'] === 'collection' && b['sakai:category'] === 'collection') {
                    return sakai_util.Sorting.naturalSort(a['sakai:group-title'], b['sakai:group-title']);
                } else if (a['sakai:category'] === 'collection') {
                    return 1;
                } else if (b['sakai:category'] === 'collection') {
                    return -1;
                } else {
                    return sakai_util.Sorting.naturalSort(a['sakai:group-title'], b['sakai:group-title']);
                }
            });
            return newjson;
        },

        getTemplate: function(cat, id, callback) {
            sakai_util.getTemplates(function(success, templates) {
                if (success) {
                    var category = false;
                    for (var i = 0; i < templates.length; i++) {
                        if (templates[i].id === cat) {
                            category = templates[i];
                            break;
                        }
                    }
                    var template = false;
                    if (category && category.templates && category.templates.length) {
                        for (var w = 0; w < category.templates.length; w++) {
                            if (category.templates[w].id === id) {
                                template = category.templates[w];
                                break;
                            }
                        }
                    }
                    if ($.isFunction(callback)) {
                        callback(success, template, templates);
                    }
                } else {
                    debug.error('Could not get the template for ' + id);
                    if ($.isFunction(callback)) {
                        callback(false);
                    }
                }
            });
        }

    };
    return sakaiGroupsAPI;
});
