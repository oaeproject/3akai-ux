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
        'jquery',
        'config/config_custom',
        'sakai/sakai.api.server',
        'sakai/sakai.api.groups',
        'sakai/sakai.api.util',
        'sakai/sakai.api.i18n',
        'sakai/sakai.api.l10n',
        'sakai/sakai.api.user',
        'underscore',
        'misc/parseuri'
    ],
    function($, sakai_conf, sakai_serv, sakai_groups, sakai_util, sakai_i18n, sakai_l10n, sakai_user, _) {

    var sakai_content = {
        /**
         * Parses a full profile as received from the loadFullProfile function
         * @param {Object} data Object containing data as received from the loadFullProfile function.
         * @param {Function} callback Function to execute when the function finishes
         */
        parseFullProfile: function(data, callback) {
            // temporary object to store in parsedData
            var contentItem = {};
            // collection pseudoGroup info to retrieve
            var collectionGroup = false;

            var parseMembers = function(contentMembers, contentItem) {
                // results for members.json
                // Members are parsed an put into a .viewers, .editors and .managers object in tempItem
                contentMembers.viewers = contentMembers.viewers || {};
                // Parse the viewers and add them to the .viewers object.
                $.each(contentMembers.viewers, function(index, resultObject) {
                    contentMembers.viewers[index].picture = sakai_util.constructProfilePicture(contentMembers.viewers[index]);
                    if (contentMembers.viewers[index]['sakai:pseudoGroup']) {
                        contentMembers.viewers[index].pseudoGroup = true;
                        contentMembers.viewers[index]['sakai:group-title'] = contentMembers.viewers[index]['sakai:parent-group-title'] + ' (' + sakai_i18n.getValueForKey(contentMembers.viewers[index]['sakai:role-title-plural']) + ')';
                        contentMembers.viewers[index].parent = {};
                        contentMembers.viewers[index].parent['sakai:group-id'] = contentMembers.viewers[index]['sakai:parent-group-id'];
                        contentMembers.viewers[index].parent['sakai:group-title'] = contentMembers.viewers[index]['sakai:parent-group-title'];
                        contentMembers.viewers[index].parent['sakai:role-title'] = contentMembers.viewers[index]['sakai:group-title'];
                    }
                });

                contentMembers.editors = contentMembers.editors || {};
                // Parse the editors and add them to the .editors object.
                $.each(contentMembers.editors, function(index, resultObject) {
                    contentMembers.editors[index].picture = sakai_util.constructProfilePicture(contentMembers.editors[index]);
                    if (contentMembers.editors[index]['sakai:pseudoGroup']) {
                        contentMembers.editors[index].pseudoGroup = true;
                        contentMembers.editors[index]['sakai:group-title'] = contentMembers.editors[index]['sakai:parent-group-title'] + ' (' + sakai_i18n.getValueForKey(contentMembers.editors[index]['sakai:role-title-plural']) + ')';
                        contentMembers.editors[index].parent = {};
                        contentMembers.editors[index].parent['sakai:group-id'] = contentMembers.editors[index]['sakai:parent-group-id'];
                        contentMembers.editors[index].parent['sakai:group-title'] = contentMembers.editors[index]['sakai:parent-group-title'];
                        contentMembers.editors[index].parent['sakai:role-title'] = contentMembers.editors[index]['sakai:group-title'];
                    }
                });

                contentMembers.managers = contentMembers.managers || {};
                // Parse the managers and add them to the .managers object.
                $.each(contentMembers.managers, function(index, resultObject) {
                    contentMembers.managers[index].picture = sakai_util.constructProfilePicture(contentMembers.managers[index]);
                    if (contentMembers.managers[index]['sakai:excludeSearch'] === 'true') {
                        contentMembers.managers[index].pseudoGroup = true;
                        contentMembers.managers[index]['sakai:group-title'] = contentMembers.managers[index]['sakai:parent-group-title'] + ' (' + sakai_i18n.getValueForKey(contentMembers.managers[index]['sakai:role-title-plural']) + ')';
                        contentMembers.managers[index].parent = {};
                        contentMembers.managers[index].parent['sakai:group-id'] = contentMembers.managers[index]['sakai:parent-group-id'];
                        contentMembers.managers[index].parent['sakai:group-title'] = contentMembers.managers[index]['sakai:parent-group-title'];
                        contentMembers.managers[index].parent['sakai:role-title'] = contentMembers.managers[index]['sakai:group-title'];
                    }
                });

                // filter out the the everyone group and the anonymous user
                contentMembers.viewers = $.grep(contentMembers.viewers, function(resultObject, index) {
                    if (resultObject['sakai:group-id'] !== 'everyone' &&
                        resultObject['rep:userId'] !== 'anonymous') {
                        return true;
                    }
                    return false;
                });

                // Add counts for managers, editors and viewers
                contentMembers.counts = { people: 0, groups: 0, collections: 0};
                $.each(contentMembers.viewers.concat(contentMembers.managers, contentMembers.editors), function(i, member) {
                    if (member.hasOwnProperty('userid')) {
                        contentMembers.counts.people++;
                    } else if (sakai_content.Collections.isCollection(member)) {
                        contentMembers.counts.collections++;
                    } else {
                        contentMembers.counts.groups++;
                    }
                });
                // Add the members to the tempItem object
                contentItem.members = contentMembers;
            };

            // Loops over results and gets the data to put in tempItem
            // Each tempItem consists of 4 requests made by loadFullProfile, these are:
            //    - poolid.infinity.json -> Fetches all general data for a content item (description, tags, title,...)
            //    - members.json -> Fetches all viewers, editors and managers for a content item
            //    - versions.json -> Fetches all versions for a content item
            //    - activityfeed.json -> Fetches all activity for a content item
            $.each(data, function(i, dataItem) {
                // results for poolid.infinity.json
                if (dataItem.url.indexOf('.infinity.json') > -1) {

                    // Stores all general data on tempItem.data
                    contentItem = {};
                    contentItem.data = $.parseJSON(dataItem.body);
                    if (sakai_content.Collections.isCollection(contentItem.data)) {
                        collectionGroup = true;
                    }

                } else if (dataItem.url.indexOf('.members.json') > -1) {

                    // If this content item is a collection, retrieve the list of members
                    // behind the pseudoGroup
                    if (!collectionGroup) {
                        parseMembers($.parseJSON(dataItem.body), contentItem);
                    }

                }
            });

            // Add in some extra data on the object about the content
            // Is current user manager/editor/viewer
            contentItem.isManager = sakai_content.isUserAManager(contentItem.data, sakai_user.data.me);
            contentItem.isEditor = sakai_content.isUserAnEditor(contentItem.data, sakai_user.data.me);
            contentItem.isViewer = sakai_content.isUserAViewer(contentItem.data, sakai_user.data.me);

            // Set the mimetype of the content
            var mimeType = sakai_content.getMimeType(contentItem.data);
            contentItem.data.mimeType = mimeType;
            if (sakai_conf.MimeTypes[mimeType]) {
                contentItem.data.iconURL = sakai_conf.MimeTypes[mimeType].URL;
            } else {
                contentItem.data.iconURL = sakai_conf.MimeTypes['other'].URL;
            }

            // Add paths to the content item
            contentItem.content_path = '/p/' + contentItem.data._path;
            contentItem.smallPath = '/p/' + contentItem.data._path;
            contentItem.url = sakai_conf.SakaiDomain + '/p/' + contentItem.data._path + '/' + sakai_util.safeURL(contentItem.data['sakai:pooled-content-file-name']);
            contentItem.path = '/p/' + contentItem.data._path + '/' + sakai_util.safeURL(contentItem.data['sakai:pooled-content-file-name']);

            if (collectionGroup) {
                sakai_groups.getMembers(sakai_content.Collections.getCollectionGroupId(contentItem.data), function(success, members) {
                    members = members[sakai_content.Collections.getCollectionGroupId(contentItem.data)];
                    var editors = {};
                    if (members.editors) {
                        editors = members.editors.results;
                    }
                    parseMembers({
                        'viewers': members.members.results,
                        'editors': editors,
                        'managers': members.managers.results
                    }, contentItem);
                    // If callback is supplied it is executed
                    if ($.isFunction(callback)) {
                        callback(contentItem);
                    }
                }, false, true);
            } else {
                // If callback is supplied it is executed
                if ($.isFunction(callback)) {
                    callback(contentItem);
                }
            }

        },
        /**
         * Loads the full content profile containing:
         *    - poolid.infinity.json -> Fetches all general data for a content item (description, tags, title,...)
         *    - members.json -> Fetches all viewers, editors and managers for a content item
         *    - versions.json -> Fetches all versions for a content item
         *    - activityfeed.json -> Fetches all activity for a content item
         * and returns it in a callback function
         * @param {String}     Pooled content id for the item to load the content profile for
         * @param {Function}   callback Function that executes when all data thas been gathered,
         *                            passes through the unparsed results.
         */
        loadFullProfile: function(poolid, callback) {
            var batchRequests = [
                {
                    'url': poolid + '.infinity.json',
                    'method':'GET',
                    'cache':false,
                    'dataType':'json'
                },
                {
                    'url': poolid + '.members.json',
                    'method':'GET',
                    'cache':false,
                    'dataType':'json'
                }
            ];

            sakai_serv.batch(batchRequests, function(success, data) {
                if (success) {
                    if ($.isFunction(callback)) {
                        callback(success, data);
                    } else {
                        return data;
                    }
                } else if ($.isFunction(callback)) {
                    callback(success);
                }
                return success;
            });
        },
        /**
         * Set the permissions for an array of uploaded files or links
         * @param {String} permissionValue either 'public', 'everyone', 'group' or 'private'
         * @param {Array} filesArray Array of files containing the 'hashpath' property per file. This hashpath is the resourceID of the file
         * @param {Function} callback Function to call when the permissions have been saved or failed to save.
         *                   The callback function is provided with a Boolean. True = permissions successfully set, False = permissions not set (error)
         */
        setFilePermissions : function(filesArray, callback, groupID) {
            // Check which value was selected and fill in the data object accordingly
            var data = [];
            var file;
            for (file in filesArray) {
                if (filesArray.hasOwnProperty(file)) {
                    var contentPath = '/p/' + filesArray[file].hashpath;
                    var item;
                    switch (filesArray[file].permissions) {
                    // Logged in only
                    case 'everyone':
                        item = {
                            'url': contentPath + '.members.html',
                            'method': 'POST',
                            'parameters': {
                                ':viewer': 'everyone',
                                ':viewer@Delete': 'anonymous'
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'everyone',
                                'privilege@jcr:read': 'granted'
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'anonymous',
                                'privilege@jcr:read': 'denied'
                            }
                        };
                        data[data.length] = item;
                        break;
                    // Public
                    case 'public':
                        item = {
                            'url': contentPath + '.members.html',
                            'method': 'POST',
                            'parameters': {
                                ':viewer': ['everyone', 'anonymous']
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': ['everyone'],
                                'privilege@jcr:read': 'granted'
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': ['anonymous'],
                                'privilege@jcr:read': 'granted'
                            }
                        };
                        data[data.length] = item;
                        break;
                    // Managers, editors and viewers only
                    case 'private':
                        item = {
                            'url': contentPath + '.members.html',
                            'method': 'POST',
                            'parameters': {
                                ':viewer@Delete': ['anonymous', 'everyone']
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': ['everyone'],
                                'privilege@jcr:read': 'denied'
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': ['anonymous'],
                                'privilege@jcr:read': 'denied'
                            }
                        };
                        data[data.length] = item;
                        break;
                    case 'group':
                        item = {
                            'url': contentPath + '.members.html',
                            'method': 'POST',
                            'parameters': {
                                ':viewer': groupID
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': ['everyone'],
                                'privilege@jcr:read': 'denied'
                            }
                        };
                        data[data.length] = item;
                        item = {
                            'url': contentPath + '.modifyAce.html',
                            'method': 'POST',
                            'parameters': {
                                'principalId': ['anonymous'],
                                'privilege@jcr:read': 'denied'
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
                type: 'POST',
                cache: false,
                data: {
                    requests: JSON.stringify(data)
                },
                success: function(data) {
                    if (callback) {
                        callback(true);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    if (callback) {
                        callback(false);
                    }
                }
            });
        },

        /**
        * Sets the permissions of an Array of files to be the same as their parent
        * Order of execution:
        *       - Load parent permissions
        *       - Set parent permission parameter on content nodes
        *       - Set ACLs on content node
        *       - Callback if present
        * @param {Array} filesArray        Array of files (PoolIDs)
        * @param {String} parentSavePath   savePath of the parent
        * @param {Function} callback       Executed on completion of the function
        */
        setFilePermissionsAsParent: function(filesArray, parentSavePath, callback) {

            /**
             * Set parent permission parameter on content nodes
             * @param {Array} filesToSetPermissions     Array of files to set ACLs on
             * @param {Array} batchRequests             Array of requests to set permission parameter on content nodes
             */
            var setDataOnContent = function(filesToSetPermissions, batchRequests) {
                sakai_serv.batch(batchRequests, function(success) {
                    if (success) {
                        // Apply the same permissions to the filesArray
                        sakai_content.setFilePermissions(filesToSetPermissions, function(success) {
                            // Execute callback
                            if ($.isFunction(callback)) {
                                callback(success);
                            }
                        });
                    } else {
                        if ($.isFunction(callback)) {
                            callback(success);
                        }
                    }
                });
            };

            /**
             * Get the permissons set on the parent
             */
            var getParentPermissions = function() {
                sakai_serv.loadJSON(parentSavePath, function(success, data) {
                    if (success) {
                        var permissions = data['sakai:permissions'];
                        var filesToSetPermissions = [];
                        var batchRequests = [];
                        $.each(filesArray, function(index, item) {
                            filesToSetPermissions.push({
                                'hashpath': item,
                                'permissions': permissions
                            });
                            batchRequests.push({
                                'url': '/p/' + item,
                                'method': 'POST',
                                'parameters': {
                                    'sakai:permissions': permissions
                                }
                            });
                        });
                        setDataOnContent(filesToSetPermissions, batchRequests);
                    } else {
                        if ($.isFunction(callback)) {
                            callback(success);
                        }
                    }
                });
            };

            getParentPermissions();
        },

        /**
         * Sets ACLs on a specified path and executes a callback if specified.
         * @param {String} _path The path on which the ACLs need to be set or an array of paths on which to set ACLs
         * @param {String} _permission 'anonymous', 'everyone', 'contacts' or 'private' determining what ACLs need to be set
         *                 This should be an array of equal length of _path is an array
         * @param {String} me Userid of the currently logged in user
         * @param {Function} callback Function to execute when permissions have been set or failed to be set
         */
        setACLsOnPath: function(_path, _permission, me, callback) {
            var paths = []; var permissions = []; var ACLs = [];
            if (typeof _path === 'string') {
                paths.push(_path);
                permissions.push(_permission);
            } else {
                paths = _path;
                permissions = _permission;
            }
            for (var i = 0; i < paths.length; i++) {
                var path = paths[i] + '.modifyAce.html';
                var permission = permissions[i];
                switch (permission) {
                    case 'anonymous':
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'everyone',
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'anonymous',
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'g-contacts-' + me,
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        break;
                    case 'everyone':
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'g-contacts-' + me,
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'everyone',
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'anonymous',
                                'privilege@jcr:read': 'denied'
                            }
                        });
                        break;
                    case 'contacts':
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': me,
                                'privilege@jcr:write': 'granted',
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'g-contacts-' + me,
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'everyone',
                                'privilege@jcr:read': 'denied'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'anonymous',
                                'privilege@jcr:read': 'denied'
                            }
                        });
                        break;
                    case 'private':
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': me,
                                'privilege@jcr:write': 'granted',
                                'privilege@jcr:read': 'granted'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'g-contacts-' + me,
                                'privilege@jcr:read': 'denied'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'everyone',
                                'privilege@jcr:read': 'denied'
                            }
                        });
                        ACLs.push({
                            'url': path,
                            'method': 'POST',
                            'parameters': {
                                'principalId': 'anonymous',
                                'privilege@jcr:read': 'denied'
                            }
                        });
                        break;
                }

            }


            $.ajax({
                url: sakai_conf.URL.BATCH,
                traditional: true,
                type: 'POST',
                cache: false,
                data: {
                    requests: JSON.stringify(ACLs)
                },
                success: function(data) {
                    if ($.isFunction(callback)) {
                       callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    debug.error(xhr, textStatus, thrownError);
                    if ($.isFunction(callback)) {
                       callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Check whether a user has specific access to a piece of content, either by being a direct or
         * indirect (through group membership) manager/editor/viewer
         * @param {Object} content      content profile data as defined in loadContentProfile()
         * @param {Object} meObj        me object of the user you are checking permissions for
         * @param {String} permission   specifies the type of access to check (manager, editor or viewer)
         * @param {Object} directOnly   specifies whether or not the relationship needs to be direct
         */
        checkPermissions: function(content, meObj, permission, directOnly) {
            var authorizable = false;
            if (content && content['sakai:pooled-content-' + permission]) {
                for (var i = 0; i < content['sakai:pooled-content-' + permission].length; i++) {
                    authorizable = content['sakai:pooled-content-' + permission][i];
                    // Direct association
                    if (authorizable === meObj.user.userid) {
                        return true;
                    // Indirect association
                    } else if (!directOnly && sakai_groups.isCurrentUserAMember(authorizable, meObj)) {
                        return true;
                    }
                }
            }
            if (content && content.members && content.members[permission + 's']) {
                for (var j = 0; j < content.members[permission + 's'].length; j++) {
                    authorizable = content.members[permission + 's'][j];
                    // Check if this user/group library is a manager/editor/viewer
                    if (authorizable.groupid === meObj.user.userid || authorizable.userid === meObj.user.userid) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Check whether a user can manage a piece of content, either by being a direct or
         * indirect (through group membership) manager
         * @param {Object} content      content profile data as defined in loadContentProfile()
         * @param {Object} meObj        me object of the user you are checking manager permissions for
         * @param {Object} directOnly   specifies whether or not the manager relationship needs to be direct
         */
        isUserAManager: function(content, meObj, directOnly) {
            return sakai_content.checkPermissions(content, meObj, 'manager', directOnly);
        },

        /**
         * Check whether a user can edit a piece of content, either by being a direct or
         * indirect (through group membership) manager
         * @param {Object} content      content profile data as defined in loadContentProfile()
         * @param {Object} meObj        me object of the user you are checking manager permissions for
         * @param {Object} directOnly   specifies whether or not the manager relationship needs to be direct
         */
        isUserAnEditor: function(content, meObj, directOnly) {
            return sakai_content.checkPermissions(content, meObj, 'editor', directOnly);
        },

        /**
         * Check whether a user is a viewer of a piece of content, either by being a direct or
         * indirect (through group membership) viewer
         * @param {Object} content      content profile data as defined in loadContentProfile()
         * @param {Object} meObj        me object of the user you are checking manager permissions for
         * @param {Object} directOnly   specifies whether or not the manager relationship needs to be direct
         */
        isUserAViewer: function(content, meObj, directOnly) {
            return sakai_content.checkPermissions(content, meObj, 'viewer', directOnly);
        },

        /**
         * Check whether a given content item lives in a specific content library (either a
         * personal library or a group library
         * @param {Object} content    content profile data as defined in loadContentProfile()
         * @param {Object} userid     authorizable id for which we're checking presence in the library
         */
        isContentInLibrary: function(content, userid) {
            if (!content) {
                return false;
            }
            // check if the content is a collection and the ID is the same collection
            var collectionId = false;
            if (content.data && sakai_content.Collections.isCollection(content.data)) {
                collectionId = sakai_content.Collections.getCollectionGroupId(content.data);
            } else if (sakai_content.Collections.isCollection(content)) {
                collectionId = sakai_content.Collections.getCollectionGroupId(content);
            }
            if (collectionId === userid) {
                return true;
            }

            var fakeMeObj = {
                'user': {
                    'userid': userid
                }
            };
            return sakai_content.isUserAViewer(content, fakeMeObj, true) || sakai_content.isUserAnEditor(content, fakeMeObj, true) || sakai_content.isUserAManager(content, fakeMeObj, true);
        },

        /**
         * Checks if a user is allowed to share the specified content
         * @param {Object} content The content profile data as defined in loadContentProfile()
         */
        canCurrentUserShareContent: function(content) {
            var canShare = false;
            var contentPermission = '';
            var userRole = 'anon';
            if (!sakai_user.isAnonymous(sakai_user.data.me)) {
                userRole = 'everyone';
                if (sakai_content.isUserAManager(content, sakai_user.data.me)) {
                    userRole = 'manager';
                } else if (sakai_content.isUserAnEditor(content, sakai_user.data.me)) {
                    userRole = 'editor';
                } else if (sakai_content.isUserAViewer(content, sakai_user.data.me)) {
                    userRole = 'viewer';
                }
            }
            if (content['sakai:permissions']) {
                contentPermission = content['sakai:permissions'];
            } else if (content.data && content.data['sakai:permissions']) {
                contentPermission = content.data['sakai:permissions'];
            }
            if (userRole === 'manager' || (sakai_conf.roleCanShareContent && sakai_conf.roleCanShareContent[contentPermission] &&
            $.inArray(userRole, sakai_conf.roleCanShareContent[contentPermission]) !== -1)) {
                canShare = true;
            }
            return canShare;
        },

        /**
         * Shares content with a user and sets permissions for the user.
         * This function can handle single user/content or multiple user/content items in an array
         * @param {String|Array} contentId   Unique pool id or Array of IDs of the content being added to the library
         * @param {String} userId      Authorizable id of the library to add this content in
         * @param {String} role        The role the user should have with the content that's being shared, defaults to viewer
         * @param {Object} callBack    Function to call once the content has been added to the library
         */
        addToLibrary: function(contentId, userId, role, callBack) {
            var permission = !role ? 'viewer' : role;

            // content array
            var toAdd = [];
            if (_.isString(contentId)) {
                toAdd.push(contentId);
            } else {
                toAdd = contentId;
            }
            // user array
            var addTo = [];
            if (_.isString(userId)) {
                addTo.push(userId);
            } else {
                addTo = userId;
            }
            var batchRequests = [];
            for (var i = 0; i < addTo.length; i++) {
                var params = {};
                if (permission === 'manager') {
                    params = {
                        ':manager': addTo[i]
                    };
                } else if (permission === 'editor') {
                    params = {
                        ':editor': addTo[i]
                    };
                } else {
                    params = {
                        ':viewer': addTo[i]
                    };
                }
                for (var j = 0; j < toAdd.length; j++) {
                    batchRequests.push({
                        url: '/p/' + toAdd[j] + '.members.json',
                        parameters: params,
                        method: 'POST'
                    });
                }
            }
            if (batchRequests.length > 0) {
                sakai_serv.batch(batchRequests, function(success, data) {
                    if (success) {
                        // adjust content count in the UI so it accurately reflects the added content without needing a new request
                        $.each(sakai_user.data.me.groups, function(index, group) {
                            if (group && group.counts && group.groupid === userId) {
                                group.counts.contentCount += toAdd.length;
                            }
                        });
                        if (callBack) {
                            callBack(contentId, userId);
                        }
                    }
                    else {
                        debug.error('sharecontent failed to change content ' +
                        'permission to "viewer" for member: ' +
                        userId);
                        debug.error('xhr data returned: ' + data);
                    }
                }, true);
            } else {
                if (callBack) {
                    callBack(contentId, userId);
                }
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
        removeUser: function(role, contentId, userId, callback) {
            var batchRequests = [];
            var userIds = [];
            var contentIds = [];

            if (_.isString(userId)) {
                userIds.push(userId);
            } else if ($.isArray(userId)) {
                userIds = userId;
            }

            if (_.isString(contentId)) {
                contentIds.push(contentId);
            } else if ($.isArray(contentId)) {
                contentIds = contentId;
            }

            for (var c = 0; c < contentIds.length; c++) {
                for (var i = 0; i < userIds.length; i++) {
                    var parameter = {':viewer@Delete': userIds[i]};
                    if (role === 'editor') {
                        parameter = {':editor@Delete': userIds[i]};
                    } else if (role === 'manager') {
                        parameter = {':manager@Delete': userIds[i]};
                    }
                    batchRequests.push({
                        url: '/p/' + contentIds[c] + '.members.json',
                        parameters: parameter,
                        method: 'POST'
                    });
                }
            }

            sakai_serv.batch(batchRequests, function(success, data) {
                if ($.isFunction(callback)) {
                   callback(success);
                }
            });
        },

        /**
         * Object containing data for the page to edit
         * If the document hasn't been edited in the last 10 seconds it is safe to edit
         * @param {String} pagePath Path to the page to edit
         * @param {Function} callback The callback function
         * @param {String} uniqueModifierId fakes a session by comparing a cached variable to a property
                                            that is stored in the autosave data
         */
        checkSafeToEdit: function(pagePath, uniqueModifierId, callback) {
            sakai_serv.loadJSON(pagePath + '.infinity.json', function(success, data) {
                if ($.isFunction(callback)) {
                    // if there is an editing flag and it is less than 10 seconds ago, and you aren't the most recent editor, then
                    // someone else is editing the page right now.
                    data.safeToEdit = true;
                    if (data.editing &&
                        sakai_util.Datetime.getCurrentGMTTime() - data.editing.time < 10000 &&
                        (data.editing._lastModifiedBy !== sakai_user.data.me.user.userid ||
                        uniqueModifierId !== data.editing['sakai:modifierid'])) {
                        data.safeToEdit = false;
                    }
                    sakai_user.getUser(data._lastModifiedBy, function(success, userData) {
                        data.editor = userData;
                        callback(success, data);
                    });
                }
            });
        },

        /**
         * Checks for autosaved documents for a sakai doc and returns that data
         *
         * @param {Boolean} Indicating if the sakai doc is a new page that can't have a autosaved page yet
         * @param {String} Path to the sakai document in the system
         * @param {Function} Callback function to execute on finish
         */
         checkAutosave: function(newPage, pagePath, callback) {
             if (newPage) {
                 // a new page won't have an autosave yet
                 if ($.isFunction(callback)) {
                     callback(true, {'safeToEdit': true});
                 }
             } else {
                 sakai_serv.loadJSON(pagePath + '.infinity.json', function(success, data) {
                     if ($.isFunction(callback)) {
                         // if there is an editing flag and it is less than 10 seconds ago, and you aren't the most recent editor, then
                         // someone else is editing the page right now.
                         data.safeToEdit = true;
                         if (data.editing && sakai_util.Datetime.getCurrentGMTTime() - data.editing.time < 10000 && data.editing._lastModifiedBy !== sakai_user.data.me.user.userid) {
                             data.safeToEdit = false;
                         }
                         if (data.autosave && data.hasOwnProperty('page') && data.autosave._lastModified > data._lastModified) {
                             data.hasAutosave = true;
                         }
                         callback(success, data);
                     }
                 });
             }
         },


        /**
         * Returns a preview URL for known services, empty string otherwise
         *
         * @param url The url of the content in an external service that you'd like a preview of
         */
        getPreviewUrl : function(url) {
            var uri = parseUri(url);
            var result = {};
            result.type = 'iframe';
            result.url = url;
            if (/vimeo\.com$/.test(uri.host)) {
                if (uri.path !== '') {
                  result.url = 'http://player.vimeo.com/video' + uri.path;
                }
            } else if (/picasaweb\.google\.com$/.test(uri.host)) {
                var splitPath = uri.path.split('/');
                if (splitPath.length >= 3 && uri.anchor !== '') {
                    var userId = splitPath[1];
                    var albumName = splitPath[2];
                    var photoId = uri.anchor;

                    $.ajax({
                        url: '/var/proxy/google/picasaGetPhoto.json',
                        type: 'GET',
                        async: false,
                        cache: false,
                        data: {
                            'userId' : userId,
                            'albumName' : albumName,
                            'photoId' : photoId
                        },
                        success: function(data) {
                            var splitPath = data.feed.icon['$t'].split('/');
                            // insert the size we want as the second to last
                            // entry in the array
                            splitPath.splice(-2, 1, 's920');
                            result.url = splitPath.join('/');
                            result.type = 'image';
                        }
                    });
                }
            } else if (/youtube\.com$/.test(uri.host)) {
                if (uri.queryKey.v) {
                    result.url = url;
                    result.type = 'video';
                    result.avatar = '//img.youtube.com/vi/' + uri.queryKey.v + '/0.jpg';
                }
            } else if (/ted\.com$/.test(uri.host) && uri.directory === '/talks/') {
                var tedUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" +
                                url +
                                "%22%20and%20compat%3D%22html5%22%20and%20xpath%3D'%2F%2F*%5B%40id%3D%22pagetype%22%5D%2Fscript%5B5%5D'&format=json&callback=";
                var tedRegex = /download\/links\/slug\/([\s\S]+)\/type\/talks/g;
                var tedRegexThumbnail = /playlist\:\'([\s\S]+)thumbnailURL%22%3A%22([\s\S]+)%22%2C%22title/g;
                $.ajax({
                    'url': tedUrl,
                    'async': false,
                    'cache': false,
                    'dataType': 'json',
                    'success': function(data) {
                        if (data && data.query && data.query.results &&
                                data.query.results.script && data.query.results.script.content) {
                            var tedContent = data.query.results.script.content;
                            var tedURLArray = tedRegex.exec(tedContent);
                            var tedThumbnailArray = tedRegexThumbnail.exec(tedContent);
                            if (tedURLArray[1]) {
                                result.url = 'http://download.ted.com/talks/' + tedURLArray[1] + '.mp4';
                                result.type = 'video';
                            }
                            if (tedThumbnailArray[2]){
                                result.avatar = decodeURIComponent(tedThumbnailArray[2]).replace(/\\/g, '');
                            }
                        }
                    }
                });
            } else if (/amazon\.com$/.test(uri.host)) {
                var asin = uri.path.split('/');
                if (asin && asin[asin.indexOf('dp')] !== -1) {
                    asin = asin[asin.indexOf('dp')+1];
                    result.url = 'http://kindleweb.s3.amazonaws.com/app/1.0.11.053.093655/KindleReaderApp.html?asin=' + asin + '&containerID=kindleReaderDiv59&tophostname=localhost&iframeName=kindleReaderIFrame1300121366106&dp=0';
                    result.type = 'iframe';
                }
            } else if (/videolectures\.net$/.test(uri.host)) {
                var lectureId = uri.path.split('/')[1];
                if (lectureId) {
                    $.ajax({
                        url: '/var/proxy/videolectures/videoLecturesGetSnippet.json',
                        type: 'GET',
                        async: false,
                        cache: false,
                        data: {
                            'lectureId' : lectureId
                        },
                        success: function(data) {
                            result.url = $($(data).find('textarea').val()).find('img').attr('src');
                            result.type = 'image';
                        }
                    });
                }
            } else if (/flickr\.com$/.test(uri.host)) {
                var fPhotoId = uri.path.split('/')[3];
                if (fPhotoId) {
                    $.ajax({
                        url: '/var/proxy/flickr/flickrGetPhotoInfo.json',
                        type: 'GET',
                        async: false,
                        cache: false,
                        dataType: 'json',
                        data: {
                            'photoId': fPhotoId
                        },
                        success: function(data) {
                            result.url = 'http://farm' + data.photo.farm + '.static.flickr.com/' + data.photo.server + '/' + data.photo.id + '_' + data.photo.secret + '_b.jpg';
                            result.type = 'image';
                        }
                    });
                }
            } else if (/slideshare\.net$/.test(uri.host)) {
                if (uri.path !== '') {
                    $.ajax({
                        url: '/var/proxy/slideshare/slideshareGetSlideshow.json',
                        type: 'GET',
                        dataType: 'xml',
                        async: false,
                        cache: false,
                        data: {
                            'slideshow_url': uri.source
                        },
                        success: function(data) {
                            if (!$(data).find('SlideShareServiceError').text()) {
                                var embed = $($(data).find('Embed').text());
                                // resize to fit contentpreview
                                embed.find('*[style*="width"]').css('width', '100%');
                                embed.find('*[style*="height"]').css('height', '500px');
                                embed.find('*[width="425"]').attr('width', '100%');
                                embed.find('*[height="355"]').attr('height', '500');

                                result.url = embed.html();
                                result.type = 'embed';
                            }
                        }
                    });
                }
            } else if (/maps\.google\.com$/.test(uri.host)) {
                if (uri.path !== '') {
                    result.url = uri.source;
                    result.type = 'googlemap';
                }
            }
            return result;
        },

        /**
         * Returns an object with data for the provided mimetype
         *
         * @param mimetype  standard mimetype string (i.e. 'image/png', 'application/pdf', etc.)
         * @return if we have a match for the given mimetype, an Object with
         *     the following params will be returned:
         *      - cssClass: css class to assign a small (~16px) image as the background
         *            image for an element
         *      - URL: path to an image (~128px) that represents this content type
         *      - description: internationalizable bundle key for a short description
         *            for this content type (i.e. 'PDF document')
         *     If there is no match, a general 'Other document' object is returned
         */
        getMimeTypeData: function(mimetype) {
            if (mimetype && typeof(mimetype) === 'string') {
                var mimetypeObj = sakai_conf.MimeTypes[mimetype];
                if (mimetypeObj) {
                    return mimetypeObj;
                }
            }
            return sakai_conf.MimeTypes.other;
        },

        getMimeType : function(content) {
            var mimeType = 'other';
            if (content['_mimeType']) {
                mimeType = content['_mimeType'];
            } else if (content['mimeType']) {
                mimeType = content['mimeType'];
            }
            return mimeType;
        },

        getThumbnail : function(content) {
            var thumbnail = '';
            var mimeType = sakai_content.getMimeType(content);
            if (content['sakai:pagecount'] && content['sakai:pagecount'] !== '0') {
                thumbnail = '/p/' + content['_path'] + '/page1.small.jpg';
            } else if (mimeType.indexOf('image') !== -1 && mimeType !== 'image/tiff' && mimeType !== 'image/jp2') {
                thumbnail = '/p/' + content['_path'];
            } else if (content['sakai:preview-url']) {
                if (content['sakai:preview-avatar']) {
                    thumbnail = content['sakai:preview-avatar'];
                }
            }
            return thumbnail;
        },

        isJwPlayerSupportedVideo : function(mimeType) {
            var supported = false;
            if (mimeType && mimeType.substring(0, 6) === 'video/') {
                var mimeSuffix = mimeType.substring(6);
                if (mimeSuffix === 'x-flv' || mimeSuffix === 'mp4' || mimeSuffix === '3gpp' || mimeSuffix === 'quicktime') {
                    supported = true;
                }
            }
            return supported;
        },

        isJwPlayerSupportedAudio : function(mimeType) {
            var supported = false;
            if (mimeType && mimeType.substring(0, 6) === 'audio/') {
                supported = true;
            }
            return supported;
        },

        isKalturaPlayerSupported : function(mimeType) {
            return sakai_conf.kaltura && sakai_conf.kaltura.enabled && (mimeType === 'kaltura/video' || mimeType === 'kaltura/audio');
        },

        getCreatorProfile : function(content, callback) {
            $.ajax({
                url: '/~' + content['sakai:pool-content-created-for'] + '/public/authprofile.profile.json',
                success: function(profile) {
                    if ($.isFunction(callback)) {
                       callback(true, profile);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });

        },

        hasPreview : function(content) {
            var result = false;
            var mimeType = sakai_content.getMimeType(content);
            if (content['sakai:preview-url'] ||
                    sakai_content.getThumbnail(content) ||
                    (mimeType.substring(0,6) === 'image/' && mimeType !== 'image/tiff' && mimeType !== 'image/jp2') ||
                    mimeType.substring(0,5) === 'text/' ||
                    mimeType === 'application/x-shockwave-flash' ||
                    sakai_content.isKalturaPlayerSupported(mimeType) ||
                    sakai_content.isJwPlayerSupportedVideo(mimeType)  ||
                    sakai_content.isJwPlayerSupportedAudio(mimeType)) {
                result = true;
            }
            return result;
        },

        getCommentCount : function(content) {
            var count = 0;
            if (content.hasOwnProperty('commentCount')) {
                count = content.commentCount;
            } else if (content.hasOwnProperty('comments')) {
                $.each(content.comments, function(key, val) {
                    if ($.isPlainObject(val)) {
                        count++;
                    }
                });
            }
            return count;
        },

        getPlaceCount : function(content) {
            var count = 0;
            if (!sakai_content.Collections.isCollection(content)) {
                if (content['sakai:pooled-content-viewer']) {
                    $.each(content['sakai:pooled-content-viewer'], function(idx, member) {
                        if (member !== 'anonymous' && member !== 'everyone') {
                            count++;
                        }
                    });
                }
                if (content['sakai:pooled-content-editor']) {
                    $.each(content['sakai:pooled-content-editor'], function(idx, member) {
                        if (member !== 'anonymous' && member !== 'everyone') {
                            count++;
                        }
                    });
                }
                if (content['sakai:pooled-content-manager']) {
                    $.each(content['sakai:pooled-content-manager'], function(idx, member) {
                        if (member !== 'anonymous' && member !== 'everyone') {
                            count++;
                        }
                    });
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
         * @param {Function} callback Callback function executed at the end of the operation
         * @param {Object} threeDotsWidths Optional object to specify widths for applyThreeDots in the list view:
         *                              titleWidth {Integer} limit the title to this width in list view
         *                              descriptionWidth {Integer} limit the description to this width in list view
         *                              displayNameWidth {Integer} limit the owner display name to this width in list view
         * @returns void
         */
        prepareContentForRender : function(results, meData, callback, threeDotsWidths) {
            var userArray = [];
            $.each(results, function(i, contentItem) {
                if (contentItem['sakai:pooled-content-file-name']) {
                    contentItem.id = contentItem['_path'];
                    contentItem.link = '/content#p=' + sakai_util.safeURL(contentItem['_path']);
                    contentItem.canDelete = sakai_content.isContentInLibrary(contentItem, meData.user.userid) || (sakai_content.Collections.isCollection(contentItem) && sakai_content.Collections.isCollectionInMyLibrary(contentItem));
                    contentItem.numPlaces = sakai_content.getPlaceCount(contentItem);
                    contentItem.numComments = sakai_content.getCommentCount(contentItem);
                    // Only modify the description if there is one
                    if (contentItem['sakai:description']) {
                        var descWidth = 750;
                        if (threeDotsWidths && threeDotsWidths.descriptionWidth) {
                            descWidth = threeDotsWidths.descriptionWidth;
                        }
                        contentItem['sakai:description-shorter'] = sakai_util.applyThreeDots(contentItem['sakai:description'], 150, {
                            max_rows: 2,
                            whole_word: false
                        }, '');
                        contentItem['sakai:description-long'] = sakai_util.applyThreeDots(contentItem['sakai:description'], 1200, {
                            max_rows: 2,
                            whole_word: false
                        }, '');
                        contentItem['sakai:description'] = sakai_util.applyThreeDots(contentItem['sakai:description'], descWidth, {
                            max_rows: 2,
                            whole_word: false
                        }, '');
                    }
                    if (contentItem['sakai:pooled-content-file-name']) {
                        var fileNameWidth = 560;
                        if (threeDotsWidths && threeDotsWidths.titleWidth) {
                            fileNameWidth = threeDotsWidths.titleWidth;
                        }
                        contentItem['sakai:pooled-content-file-name-short'] = sakai_util.applyThreeDots(contentItem['sakai:pooled-content-file-name'], fileNameWidth, {
                            max_rows: 1,
                            whole_word: false
                        }, 's3d-bold');
                        contentItem['sakai:pooled-content-file-name-shorter'] = sakai_util.applyThreeDots(contentItem['sakai:pooled-content-file-name'], 150, {
                            max_rows: 1,
                            whole_word: false
                        }, 's3d-bold');
                    }
                    // Modify the tags if there are any
                    if (contentItem['sakai:tags']) {
                        if ( _.isString(contentItem['sakai:tags']) ) {
                            contentItem['sakai:tags'] = contentItem['sakai:tags'].split(',');
                        }
                        contentItem.tagsProcessed = sakai_util.formatTags(contentItem['sakai:tags']);
                    }
                    // set mimetype
                    var mimeType = sakai_content.getMimeType(contentItem);
                    var mimeTypeData = sakai_content.getMimeTypeData(mimeType);
                    contentItem.mimeType = mimeType;
                    contentItem.mimeTypeURL = mimeTypeData.URL;
                    contentItem.mimeTypeDescription = sakai_i18n.getValueForKey(mimeTypeData.description);
                    contentItem.thumbnail = sakai_content.getThumbnail(results[i]);
                    // if the content has an owner we need to add their ID to an array,
                    // so we can lookup the users display name in a batch req
                    if (contentItem['sakai:pool-content-created-for'] && !results.fetchMultipleUserDataInWidget) {
                        userArray.push(contentItem['sakai:pool-content-created-for']);
                    }
                    contentItem.hasPreview = sakai_content.hasPreview(contentItem);
                }
            });
            // Get displaynames for the users that created content
            if (userArray.length) {
                sakai_user.getMultipleUsers(userArray, function(users) {
                    var displayNameWidth = 580;
                    if (threeDotsWidths && threeDotsWidths.displayNameWidth) {
                        displayNameWidth = threeDotsWidths.displayNameWidth;
                    }
                    $.each(results, function(index, item) {
                        if (item && item['sakai:pooled-content-file-name']) {
                            var userid = item['sakai:pool-content-created-for'];
                            var displayName = sakai_user.getDisplayName(users[userid]);
                            item.ownerId = userid;
                            item.ownerDisplayName = displayName;
                            item.ownerDisplayNameShort = sakai_util.applyThreeDots(displayName, displayNameWidth, {max_rows: 1,whole_word: false}, 's3d-bold', true);
                            item.ownerDisplayNameShorter = sakai_util.applyThreeDots(displayName, 180, {max_rows: 1,whole_word: false}, 's3d-bold', true);
                        }
                    });
                    if ($.isFunction(callback)) {
                        callback(results);
                    }
                });
            } else if ($.isFunction(callback)) {
                callback(results);
            }
        },

        createContentURL: function(contentData) {
            var ret = '';
            if (contentData && contentData._path && contentData['sakai:pooled-content-file-name']) {
                ret = sakai_conf.SakaiDomain + '/p/' + contentData._path + '/' + sakai_util.safeURL(contentData['sakai:pooled-content-file-name']);
            }
            return ret;
        },

        /**
         * Set of API function around collection creation and management
         */
        Collections: {

            /**
             * Prefix that will be prepended to all pseudoGroups created
             * for collections
             */
            COLLECTION_GROUP_PREFIX: 'c-',

            /**
             * Create a new content collection. This includes the creation of a pooled content item and a pseudoGroup used to share
             * content with. The auth-all feed for that pseudoGroup is then used to retrieve the content of the collection
             * @param {Object} title            Title of the collection
             * @param {Object} description      Description of the collection
             * @param {Object} permissions      Permission to be set on the collection. Possible values are 'public', 'everyone'
             *                                  and 'private'
             * @param {Object} tags             Tags to be set on the collection
             * @param {Object} contentToAdd     Array of pooled content items that need to be added to the collection
             * @param {Object} usersToAdd       Array of {'id': authorizableId, 'role': 'member/manager'} objects that determines who
             *                                  can see and who can edit the collections
             * @param {Object} callback         Function to be called after the collections has been created. This will pass in a
             *                                  success parameter and
             */
            createCollection: function(title, description, permissions, tags, contentToAdd, usersToAdd, callback) {

                // 0. Help functions
                // 0a. Prepare arguments
                usersToAdd = usersToAdd || [];
                contentToAdd = contentToAdd || [];
                // 0b. Creating a group
                var createGroup = function(id, title, role) {
                    var fullId = role ? id + '-' + role : id;
                    var roleTitle = '';
                    var roleTitlePlural = '';
                    if (role && role === 'managers') {
                        roleTitle = 'MANAGER';
                        roleTitlePlural = 'MANAGERS';
                    } else if (role && role === 'editors') {
                        roleTitle = 'EDITOR';
                        roleTitlePlural = 'EDITORS';
                    } else if (role && role === 'members') {
                        roleTitle = 'MEMBER';
                        roleTitlePlural = 'MEMBERS';
                    }
                    var roles = [
                        {
                            'id': 'managers',
                            'title': 'MANAGER',
                            'titlePlural': 'MANAGERS',
                            'isManagerRole': true,
                            'manages': ['members','editors']
                        },
                        {
                            'id': 'editors',
                            'title': 'EDITOR',
                            'titlePlural': 'EDITORS',
                            'isManagerRole': false
                        },
                        {
                            'id':'members',
                            'title': 'MEMBER',
                            'titlePlural': 'MEMBERS',
                            'isManagerRole': false
                        }
                    ];
                    return {
                        'url': sakai_conf.URL.GROUP_CREATE_SERVICE,
                        'method': 'POST',
                        'parameters': {
                            ':name': fullId,
                            'sakai:group-title' : role ? '' : title,
                            'sakai:roles': role ? '' : JSON.stringify(roles),
                            'sakai:group-id': fullId,
                            'sakai:category': 'collection',
                            'sakai:excludeSearch': true,
                            'sakai:pseudoGroup': role ? true : false,
                            'sakai:pseudoGroup@TypeHint': 'Boolean',
                            'sakai:parent-group-title': role ? title : '',
                            'sakai:parent-group-id': role ? id : '',
                            'sakai:role-title': roleTitle,
                            'sakai:role-title-plural': roleTitlePlural
                        }
                    };
                };

                // 1. Create the pooled content item
                // 1a. Create the base node
                var refID = sakai_util.generateWidgetId();
                var collectionObject = {
                    'sakai:pooled-content-file-name': title,
                    'sakai:permissions': permissions,
                    'sakai:description': description,
                    'sakai:tags': tags,
                    'sakai:copyright': sakai_conf.Permissions.Copyright.defaults['collections'],
                    'mimeType': 'x-sakai/collection',
                    'sakai:allowcomments': 'true',
                    'sakai:showcomments': 'true',
                    'sakai:showalways': true,
                    'sakai:showalways@TypeHint': 'Boolean',
                    'sakai:schemaversion': sakai_conf.schemaVersion,
                    'structure0': JSON.stringify({
                        'main': {
                            '_ref': refID,
                            '_order': 0,
                            '_title': title,
                            '_nonEditable': true,
                            'main': {
                                '_ref': refID,
                                '_order': 0,
                                '_title': title,
                                '_nonEditable': true
                            }
                        }
                    })
                };
                $.ajax({
                    url: '/system/pool/createfile',
                    data: collectionObject,
                    type: 'POST',
                    dataType: 'json',
                    success: function(data) {

                        // 2. Tag the collection
                        var collectionId = data._contentItem.poolId;
                        sakai_util.tagEntity('/p/' + collectionId, collectionObject['sakai:tags'], false, function() {
                            // 3. Set the permissions on the pooled content item
                            sakai_content.setFilePermissions([{'hashpath': collectionId, 'permissions': collectionObject['sakai:permissions']}], function() {

                                // 4. Create the pseudoGroups
                                var groupId = sakai_content.Collections.getCollectionGroupId(collectionId);
                                var batchRequests = [];
                                var membershipsToProcess = [];
                                var managershipsToProcess = [];
                                // 4a. Create the collection managers group
                                batchRequests.push(createGroup(groupId, title, 'managers'));
                                // 4b(i). Create the collection editors group
                                batchRequests.push(createGroup(groupId, title, 'editors'));
                                // 4b. Create the collection members group
                                batchRequests.push(createGroup(groupId, title, 'members'));
                                // 4c. Create the main collections group
                                batchRequests.push(createGroup(groupId, title));
                                // 4d. Create the groups
                                sakai_serv.batch(batchRequests, function(success, response) {
                                    // 4e. Set the correct members and managers
                                    managershipsToProcess.push({
                                        'user': groupId + '-managers',
                                        'permission': 'managers'
                                    });
                                    managershipsToProcess.push({
                                        'user': groupId + '-managers',
                                        'permission': 'editors'
                                    });
                                    managershipsToProcess.push({
                                        'user': groupId + '-managers',
                                        'permission': 'members'
                                    });
                                    managershipsToProcess.push({
                                        'user': groupId + '-managers'
                                    });
                                    membershipsToProcess.push({
                                        'user': sakai_user.data.me.user.userid,
                                        'permission': 'managers'
                                    });
                                    membershipsToProcess.push({
                                        'user': groupId + '-managers'
                                    });
                                    membershipsToProcess.push({
                                        'user': groupId + '-members'
                                    });
                                    membershipsToProcess.push({
                                        'user': groupId + '-editors'
                                    });
                                    // 4f. Share the collections with the appropriate users
                                    // {'id': authorizableId, 'role': 'member/editor/manager'}
                                    $.each(usersToAdd, function(index, user) {
                                        var userRole = sakai_content.Collections.getCollectionRolePseudoGroup(user.role);
                                        membershipsToProcess.push({
                                            'user': user.id,
                                            'permission': userRole,
                                            'viewer': true
                                        });
                                    });

                                    sakai_groups.addUsersToGroup(groupId, managershipsToProcess, sakai_user.data.me, true, function() {
                                        sakai_groups.addUsersToGroup(groupId, membershipsToProcess, sakai_user.data.me, false, function() {
                                            // Add current user to the managers group for management functions before refresh
                                            sakai_user.data.me.user.subjects.push(groupId + '-managers');
                                            sakai_user.data.me.groups.push({
                                                'sakai:group-id': groupId + '-managers'
                                            });
                                            // 4g. Remove the creator as an explicit manager of all these groups
                                            batchRequests = [];
                                            var params = {
                                                '_charset_': 'utf-8',
                                                ':manager@Delete': sakai_user.data.me.user.userid
                                            };
                                            batchRequests.push({
                                                'url': '/system/userManager/group/' + groupId + '-members.update.json',
                                                'method': 'POST',
                                                'parameters': params
                                            });
                                            batchRequests.push({
                                                'url': '/system/userManager/group/' + groupId + '-editors.update.json',
                                                'method': 'POST',
                                                'parameters': params
                                            });
                                            batchRequests.push({
                                                'url': '/system/userManager/group/' + groupId + '-managers.update.json',
                                                'method': 'POST',
                                                'parameters': params
                                            });
                                            batchRequests.push({
                                                'url': '/system/userManager/group/' + groupId + '.update.json',
                                                'method': 'POST',
                                                'parameters': params
                                            });
                                            sakai_serv.batch(batchRequests, function(success, response) {

                                                // 5. Set the permissions on the pseudoGroups
                                                var visible = 'public';
                                                if (permissions === 'everyone') {
                                                    visible = 'logged-in-only';
                                                } else if (permissions === 'private') {
                                                    visible = 'members-only';
                                                }
                                                var roles = [{'id': 'managers'}, {'id': 'editors'}, {'id': 'members'}];
                                                sakai_groups.setPermissions(groupId, 'yes', visible, roles, function() {

                                                    // 6. Share the collection with the pseudoGroups and remove creator as manager
                                                    sakai_content.addToLibrary(collectionId, groupId + '-managers', 'manager', function() {
                                                        sakai_content.addToLibrary(collectionId, groupId + '-editors', 'editor', function() {
                                                            sakai_content.addToLibrary(collectionId, groupId + '-members', false, function() {
                                                                sakai_content.removeUser('manager', collectionId, sakai_user.data.me.user.userid, function() {

                                                                    // 7. Add the content to the collection
                                                                    var pooledContentToAdd = [];
                                                                    var collectionsToAdd = [];
                                                                    $.each(contentToAdd, function(index, item) {
                                                                        if (sakai_content.Collections.isCollection(item)) {
                                                                            collectionsToAdd.push(item['_path']);
                                                                        } else {
                                                                            pooledContentToAdd.push(item['_path']);
                                                                        }
                                                                    });
                                                                    sakai_content.addToLibrary(pooledContentToAdd, groupId, false, function() {
                                                                        sakai_content.Collections.shareCollection(collectionsToAdd, groupId, false, function() {

                                                                            //1b. Set the pagecontent to have the collectionviewer widget
                                                                            // We do this here so the collection itself is the item that is touched latest,
                                                                            // which it'll show on the top of the library listing
                                                                            var widgetId = sakai_util.generateWidgetId();
                                                                            var toSave = {};
                                                                            toSave[refID] = {
                                                                                'rows': [{
                                                                                    'id': sakai_util.generateWidgetId(),
                                                                                    'columns': [{
                                                                                        'width': 1,
                                                                                        'elements': [{
                                                                                            'id': widgetId,
                                                                                            'type': 'collectionviewer'
                                                                                        }]
                                                                                    }]
                                                                                }]
                                                                            };
                                                                            toSave[refID][widgetId] = {
                                                                                'collectionviewer': {
                                                                                    'groupid': groupId
                                                                                }
                                                                            };
                                                                            sakai_serv.saveJSON('/p/' + collectionId, toSave, function() {
                                                                                // 8. Add the new collection to your me-object
                                                                                sakai_user.data.me.groups.push({
                                                                                    'sakai:category': 'collection',
                                                                                    'sakai:group-title': title,
                                                                                    'sakai:group-id': groupId,
                                                                                    'sakai:pseudoGroup': false,
                                                                                    'groupid': groupId,
                                                                                    'sakai:excludeSearch': 'true',
                                                                                    'counts': {
                                                                                        'contentCount': contentToAdd.length,
                                                                                        'membersCount': usersToAdd.length
                                                                                    }
                                                                                });
                                                                                // 9. Execute the callback function
                                                                                callback(true, collectionId);
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            },

            /**
             * Add a number of content items to an existing collection
             * @param {Object} collectionId    Pooled content id that represents the collection
             * @param {Object} poolIds         Array of pooled content ids to be added to the collection
             * @param {Object} callback        Function to be called when the content has been added to the collection
             */
            addToCollection: function(collectionId, poolIds, callback) {
                poolIds = poolIds || [];
                if (_.isString(poolIds)) {
                    poolIds = [poolIds];
                }
                sakai_content.addToLibrary(poolIds, sakai_content.Collections.getCollectionGroupId(collectionId), false, callback);
            },

            /**
             * Remove a number of content items from an existing collection
             * @param {Object} collectionId    Pooled content id that represents the collection
             * @param {Object} poolIds         Array of pooled content ids to be removed from the collection
             * @param {Object} callback        Function to be called when the content has been removed from the collection
             */
            removeFromCollection: function(collectionId, poolIds, callback) {
                poolIds = poolIds || [];
                if (_.isString(poolIds)) {
                    poolIds = [poolIds];
                }
                sakai_content.removeUser('viewer', poolIds, sakai_content.Collections.getCollectionGroupId(collectionId), callback);
            },

            /**
             * Make a collection either public, private or only visible to the people it's shared with
             * @param {Object} collectionId    Pooled content id that represents the collection
             * @param {Object} permission      Permission to be set on the collection. Possible values are 'public', 'everyone'
             *                                 and 'private'
             * @param {Object} callback        Function to be called when the new permissions have been set on the collection
             */
            setCollectionPermissions: function(collectionId, permission, callback) {
                // Change the permissions of the Sakai Doc
                sakai_content.setFilePermissions([{'hashpath': collectionId, 'permissions': permission}], function() {
                    // Change the permissions of the Sakai Doc
                    var groupId = sakai_content.Collections.getCollectionGroupId(collectionId);
                    var visible = 'public';
                    if (permission === 'everyone') {
                        visible = 'logged-in-only';
                    } else if (permission === 'private') {
                        visible = 'members-only';
                    }
                    var roles = [{'id': 'managers'}, {'id': 'editors'}, {'id': 'members'}];
                    sakai_groups.setPermissions(groupId, 'yes', visible, roles, function() {
                         if ($.isFunction(callback)) {
                             callback();
                         }
                    });
                });
            },

            /**
             * Share a collection with a list of users/groups
             * @param {Object} collectionIds   Pooled content id(s) for the collection that's shared
             * @param {Object} authorizables   Array of authorizable ids to share the collection with
             * @param {String} role            The role the user should have with the collection that's being shared, defaults to member
             * @param {Object} callback        Function to call when the collection has been shared
             */
            shareCollection: function(collectionIds, authorizables, role, callback) {
                var userRole = sakai_content.Collections.getCollectionRolePseudoGroup(role);
                var permissionBatch = [];
                if (_.isString(authorizables)) {
                    authorizables = [authorizables];
                }
                if (_.isString(collectionIds)) {
                    collectionIds = [collectionIds];
                }
                $.each(collectionIds, function(index, collectionId) {
                    var groupID = sakai_content.Collections.getCollectionGroupId(collectionId);
                    $.each(authorizables, function(index, authorizable) {
                        permissionBatch.push({
                            'url': '/system/userManager/group/' + groupID + '-' + userRole + '.update.json',
                            'method': 'POST',
                            'parameters': {
                                ':member': authorizable,
                                ':viewer': authorizable
                            }
                        });
                        $.each(sakai_user.data.me.groups, function(index, group) {
                            if (group && group.counts && group.groupid === authorizable) {
                                group.counts.contentCount += 1;
                            }
                        });
                    });
                });
                sakai_serv.batch(permissionBatch, function(success, response) {
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            },

            /**
             * Returns the pseudo group the role belongs to
             * @param {String} role The role to check for
             */
            getCollectionRolePseudoGroup: function(role) {
                var pseudoGroup = 'members';
                if (role === 'manager') {
                    pseudoGroup = 'managers';
                } else if (role === 'editor') {
                    pseudoGroup = 'editors';
                }
                return pseudoGroup;
            },

            /**
             * Check whether the current user can manage a given collection
             * @param {Object} collectionid   Pseudogroup id of the collection
             * @param {String} role           The role to check for
             */
            currentUserHasCollectionRole: function(collectionid, role) {
                var hasRole = false;
                var userRole = sakai_content.Collections.getCollectionRolePseudoGroup(role);
                if (!sakai_user.data.me.user.anon) {
                    $.each(sakai_user.data.me.groups, function(idx, group) {
                        if (group['sakai:group-id'] === collectionid + '-' + userRole) {
                            hasRole = true;
                            return false;
                        }
                    });
                }
                return hasRole;
            },

            /**
             * Check whether the current user can manage a given collection
             * @param {Object} collectionid   Pseudogroup id of the collection
             */
            canCurrentUserManageCollection: function(collectionid) {
                return sakai_content.Collections.currentUserHasCollectionRole(collectionid, 'manager');
            },

            /**
             * Check whether the current user can edit a given collection
             * @param {Object} collectionid   Pseudogroup id of the collection
             */
            canCurrentUserEditCollection: function(collectionid) {
                var canEdit = sakai_content.Collections.currentUserHasCollectionRole(collectionid, 'manager');
                if (!canEdit) {
                    canEdit = sakai_content.Collections.currentUserHasCollectionRole(collectionid, 'editor');
                }
                return canEdit;
            },

            /**
             * Retrieve the number of collections that are in my library
             */
            getMyCollectionsCount: function() {
                var count = 0;
                var memberships = sakai_groups.getMemberships(sakai_user.data.me.groups, true);
                $.each(memberships.entry, function(index, membership) {
                    if (sakai_content.Collections.isCollection(membership)) {
                        count++;
                    }
                });
                return count;
            },

            /**
             * Get a list of the current user's collections in his library
             * @param {Object} page        The page number to retrieve
             * @param {Object} items       Number of items on each page
             * @param {Object} callback    Function to call when the collections have been retrieved
             * @param {Boolean} cache      Sets cache option for the ajax request
             */
            getMyCollections: function(page, items, callback, cache) {
                var cacheRequest = cache === false ? false : true;
                var data = {
                    'sortOn': '_lastModified',
                    'sortOrder': 'desc',
                    'userid': sakai_user.data.me.user.userid,
                    'items': items,
                    'page': page,
                    'mimetype': 'x-sakai/collection'
                };
                $.ajax({
                    'url': sakai_conf.URL.POOLED_CONTENT_SPECIFIC_USER,
                    'data': data,
                    'cache': cacheRequest,
                    'success': function(data) {
                        var batchRequest = [];
                        $.each(data.results, function(index, collection) {
                            collection.counts = collection.counts || {};
                            collection.counts.contentCount = sakai_content.Collections.getCollectionContentCount(collection);
                        });
                        if ($.isFunction(callback)) {
                            callback(data);
                        }
                    },
                    'error': function(status) {
                        debug.error('Loading the current user\'s collections did not succeed');
                        if ($.isFunction(callback)) {
                            callback(false);
                        }
                    }
                });
            },

            /**
             * Get the number of items that are part of a specific collection
             * @param {Object} collection    This can either be the pooled id of a collection object or the
             *                               full collection pooled content object
             */
            getCollectionContentCount: function(collection) {
                if ($.isPlainObject(collection)) {
                    collection = collection['_path'];
                }
                var groupId = sakai_content.Collections.getCollectionGroupId(collection);
                var count = 0;
                var memberships = sakai_groups.getMemberships(sakai_user.data.me.groups, true);
                $.each(memberships.entry, function(index, membership) {
                    if (sakai_content.Collections.isCollection(membership) && membership['sakai:group-id'] === groupId) {
                        count = membership.counts.contentCount || 0;
                    }
                });
                return count;
            },

            /**
             * Check whether a given object represents a collection
             * @param {Object} identifier    This can be a group id, a content object or a group object
             */
            isCollection: function(identifier) {
                // The identifier is a group id
                if (_.isString(identifier)) {
                    return identifier.substring(0, 2) === sakai_content.Collections.COLLECTION_GROUP_PREFIX;
                // The identifier is a collection pseudoGroup
                } else if (identifier['sakai:category'] === 'collection') {
                    return true;
                // The identifier is a content object
                } else if (identifier['_path']) {
                    return sakai_content.getMimeType(identifier) === 'x-sakai/collection';
                }
                return false;
            },

            /**
             * Check whether a collection is part of my library or not
             * @param {Object} collection    This can be the pooled content id of the collection or the
             *                               pooled content object of the collection
             */
            isCollectionInMyLibrary: function(collection) {
                if ($.isPlainObject(collection)) {
                    collection = collection['_path'];
                }
                var groupToCheck = sakai_content.Collections.getCollectionGroupId(collection);
                return sakai_groups.isCurrentUserAMember(groupToCheck, sakai_user.data.me);
            },

            /**
             * Get the group ID of the pseudoGroup that's associated to a collection
             * @param {Object} collection    This can be the pooled content id of the collection or the
             *                               pooled content object of the collection
             */
            getCollectionGroupId: function(collection) {
                if (_.isString(collection)) {
                    return sakai_content.Collections.COLLECTION_GROUP_PREFIX + collection;
                } else {
                    return sakai_content.Collections.COLLECTION_GROUP_PREFIX + collection['_path'];
                }
            },

            /**
             * Get the pool id of a collection pseudoGroup
             * @param {Object} collectionGroup    This can be the collection group id or the collection
             *                                    group object
             */
            getCollectionPoolId: function(collectionGroup) {
                if ($.isPlainObject(collectionGroup)) {
                    collectionGroup = collectionGroup['sakai:group-id'];
                }
                return collectionGroup.substring(2);
            }

        }
    };

    return sakai_content;
});
