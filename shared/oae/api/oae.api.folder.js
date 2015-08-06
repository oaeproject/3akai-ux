/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Get a full folder profile
     *
     * @param  {String}         folderId                Id of the folder we're trying to retrieve
     * @param  {Function}       callback                Standard callback function
     * @param  {Object}         callback.err            Error object containing error code and error message
     * @param  {Folder}         callback.folder         Folder object representing the retrieved folder
     * @throws {Error}                                  Error thrown when no folder id has been provided
     */
    var getFolder = exports.getFolder = function(folderId, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        }

        $.ajax({
            'url': '/api/folder/' + folderId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };


    /**
     * Create a new folder
     *
     * @param  {String}         displayName             Display title for the created folder
     * @param  {String}         [description]           The folder's description
     * @param  {String}         [visibility]            The folder's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]              Array of user/group ids that should be added as managers to the folder
     * @param  {String[]}       [viewers]               Array of user/group ids that should be added as viewers to the folder
     * @param  {Function}       [callback]              Standard callback function
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @param  {Folder}         [callback.folder]       Folder object representing the created folder
     * @throws {Error}                                  Error thrown when no valid display name has been provided
     */
    var createFolder = exports.createFolder = function(displayName, description, visibility, managers, viewers, callback) {
        if (!displayName) {
            throw new Error('A valid folder name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'managers': managers,
            'viewers': viewers
        };

        $.ajax({
            'url': '/api/folder',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update a folder's metadata
     *
     * @param  {String}       folderId                  Id of the folder we're trying to update
     * @param  {Object}       params                    JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]                Standard callback function
     * @param  {Object}       [callback.err]            Error object containing error code and error message
     * @param  {Folder}       [callback.folder]         Folder object representing the updated folder
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
     */
    var updateFolder = exports.updateFolder = function(folderId, params, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/folder/' + folderId,
            'type': 'POST',
            'data': params,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update the visibility of the content items inside a folder
     *
     * @param  {String}       folderId                      Id of the folder for which the visibility of its content items should be updated
     * @param  {Object}       visibility                    Visibility that should be applied to the items in the folder. One of `loggedin`, `private` and `public`
     * @param  {Function}     [callback]                    Standard callback function
     * @param  {Object}       [callback.err]                Error object containing error code and error message
     * @param  {Folder}       [callback.failedContent]      The content items for which the visibility could not be updated
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
    var updateFolderContentVisibility = exports.updateFolderContentVisibility = function(folderId, visibility, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        } else if (!visibility) {
            throw new Error('A valid visibility should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'visibility': visibility
        };

        $.ajax({
            'url': '/api/folder/' + folderId + '/contentvisibility',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data.failedContent);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Add existing content items to a folder
     *
     * @param  {String}        folderId                     Id of the folder to which we're adding content items
     * @param  {String[]}      contentIds                   Array of content ids that should be added to the folder
     * @param  {Function}      [callback]                   Standard callback function
     * @param  {Object}        [callback.err]               Error object containing error code and error message
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
    var addToFolder = exports.addToFolder = function(folderId, contentIds, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        } else if (!contentIds || contentIds.length === 0) {
            throw new Error('At least 1 content item should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'contentIds': contentIds
        };

        $.ajax({
            'url': '/api/folder/' + folderId + '/library',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Permanently delete a folder from the system. It is also possible to remove all of its content
     * at the same time
     *
     * @param  {String}        folderId                     Id of the folder we're trying to delete
     * @param  {Boolean}       deleteContent                Whether or not the content items in the folder should be deleted as well
     * @param  {Function}      [callback]                   Standard callback function
     * @param  {Object}        [callback.err]               Error object containing error code and error message
     * @param  {Content[]}     [callback.failedContent]     The content items that could not be deleted
     * @throws {Error}                                      Error thrown when no valid discussion id has been provided
     */
    var deleteFolder = exports.deleteFolder = function(folderId, deleteContent, callback) {
        if (!deleteFolder) {
            throw new Error('A valid folder id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'deleteContent': deleteContent
        };

        $.ajax({
            'url': '/api/folder/' + folderId,
            'type': 'DELETE',
            'data': data,
            'success': function(data) {
                callback(null, data.failedContent);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get all the invitations for a folder
     *
     * @param  {String}          folderId                       Id of the folder we're trying to retrieve the invitations for
     * @param  {Function}        callback                       Standard callback function
     * @param  {Object}          callback.err                   Error object containing error code and error message
     * @param  {Object}          callback.result                Response object containing the folder invitations
     * @param  {Invitation[]}    callback.result.results        Every invitation associated to the folder
     * @throws {Error}                                          Error thrown when no folder id has been provided
     */
    var getInvitations = exports.getInvitations = function(folderId, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        }

        $.ajax({
            'url': '/api/folder/' + folderId + '/invitations',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Resend an invitation that invites an email into a folder
     *
     * @param  {String}     folderId        Id of the folder whose invitation to resend
     * @param  {String}     email           The email of the invitation to resend
     * @param  {Function}   callback        Standard callback function
     * @param  {Object}     callback.err    Error object containing error code and error message
     * @throws {Error}                      Error thrown when no folder id has been provided
     */
    var resendInvitation = exports.resendInvitation = function(folderId, email, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        }

        $.ajax({
            'url': '/api/folder/' + folderId + '/invitations/' + email + '/resend',
            'type': 'POST',
            'success': function() {
                callback();
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the viewers and managers of a folder
     *
     * @param  {String}          folderId                       Id of the folder we're trying to retrieve the members for
     * @param  {String}          [start]                        The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}          [limit]                        The number of members to retrieve
     * @param  {Function}        callback                       Standard callback function
     * @param  {Object}          callback.err                   Error object containing error code and error message
     * @param  {Object}          callback.members               Response object containing the folders members and nextToken
     * @param  {User[]|Group[]}  callback.members.results       Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @param  {String}          callback.members.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no folder id has been provided
     */
    var getMembers = exports.getMembers = function(folderId, start, limit, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/folder/'+ folderId + '/members',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Change the members and managers of a folder
     *
     * @param  {String}       folderId              Id of the folder we're trying to update the members for
     * @param  {Object}       updatedMembers        JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]            Standard callback function
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(folderId, updatedMembers, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        } else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedMembers hash should contain at least 1 update');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/folder/'+ folderId + '/members',
            'type': 'POST',
            'data': updatedMembers,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Share a folder
     *
     * @param  {String}       folderId              Id of the folder we're trying to share
     * @param  {String[]}     principals            Array of principal ids with who the folder should be shared
     * @param  {Function}     [callback]            Standard callback function
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var shareFolder = exports.shareFolder = function(folderId, principals, callback) {
        if (!folderId) {
            throw new Error('A folder id should be provided');
        } else if (!principals.length) {
            throw new Error('A user or group to share with should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'viewers': principals
        };

        $.ajax({
            'url': '/api/folder/' + folderId + '/share',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the folder library for a given principal
     *
     * @param  {String}         principalId                     User or group id for who we want to retrieve the folder library
     * @param  {String}         [start]                         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}         [limit]                         The number of folders to retrieve
     * @param  {Function}       callback                        Standard callback function
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.folders                Response object containing the folders in the requested library and nextToken
     * @param  {Folder[]}       callback.folders.results        Array of folders representing the folders present in the library
     * @param  {String}         callback.folders.nextToken      The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no principal id has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, start, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/folder/library/' + principalId,
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete a folder from a folder library
     *
     * @param  {String}         principalId       User or group id for for the library from which we want to delete the folder
     * @param  {String}         folderId          Id of the folder we're trying to delete from the library
     * @param  {Function}       [callback]        Standard callback function
     * @param  {Object}         [callback.err]    Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var deleteFolderFromLibrary = exports.deleteFolderFromLibrary = function(principalId, folderId, callback) {
        if (!principalId) {
            throw new Error('A valid user or group id should be provided');
        } else if (!folderId) {
            throw new Error('A valid folder id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/folder/library/' + principalId + '/' + folderId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete a piece of content from a folder
     *
     * @param  {String}         folderId          Id of the folder from which we want to delete the content item
     * @param  {String}         contentId         Id of the content item we're trying to delete from the folder
     * @param  {Function}       [callback]        Standard callback function
     * @param  {Object}         [callback.err]    Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var deleteContentFromFolder = exports.deleteContentFromFolder = function(folderId, contentId, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        } else if (!contentId) {
            throw new Error('A valid content id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'contentIds': contentId
        };

        $.ajax({
            'url': '/api/folder/' + folderId + '/library',
            'type': 'DELETE',
            'data': data,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

});
