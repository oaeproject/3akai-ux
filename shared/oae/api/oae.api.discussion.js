/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Get a full discussion profile.
     *
     * @param  {String}       discussionId          Id of the discussion we're trying to retrieve
     * @param  {Function}     callback              Standard callback method
     * @param  {Object}       callback.err          Error object containing error code and error message
     * @param  {Discussion}   callback.discussion   Discussion object representing the retrieved discussion
     * @throws {Error}                              Error thrown when no discussion id has been provided
     */
    var getDiscussion = exports.getDiscussion = function(discussionId, callback) {
        if (!discussionId) {
            throw new Error('A valid discussion id should be provided');
        }

        $.ajax({
            'url': '/api/discussion/' + discussionId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Create a new discussion.
     *
     * @param  {String}         displayName               Topic for the discussion
     * @param  {String}         [description]             The discussion's description
     * @param  {String}         [visibility]              The discussion's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]                Array of user/group ids that should be added as managers to the discussion
     * @param  {String[]}       [members]                 Array of user/group ids that should be added as members to the discussion
     * @param  {Function}       [callback]                Standard callback method
     * @param  {Object}         [callback.err]            Error object containing error code and error message
     * @param  {Discussion}     [callback.discussion]     Discussion object representing the created discussion
     * @throws {Error}                                    Error thrown when no discussion topic has been provided
     */
    var createDiscussion = exports.createDiscussion = function(displayName, description, visibility, managers, members, callback) {
        if (!displayName) {
            throw new Error('A valid description topic should be provided');
        }

        var data = {
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'managers': managers,
            'members': members
        };

        $.ajax({
            'url': '/api/discussion/create',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Update a discussion's metadata.
     *
     * @param  {String}       discussionId                Id of the discussion we're trying to update
     * @param  {Object}       params                      JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]                  Standard callback method
     * @param  {Object}       [callback.err]              Error object containing error code and error message
     * @param  {Discussion}   [callback.discussion]       Discussion object representing the updated discussion
     * @throws {Error}                                    Error thrown when not all of the required parameters have been provided
     */
    var updateDiscussion = exports.updateDiscussion = function(discussionId, params, callback) {
        if (!discussionId) {
            throw new Error('A valid discussion id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/discussion/' + discussionId,
            'type': 'POST',
            'data': params,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Permanently delete a discussion from the system.
     *
     * @param  {String}        discussionId          Id of the discussion we're trying to delete
     * @param  {Function}      [callback]            Standard callback method
     * @param  {Object}        [callback.err]        Error object containing error code and error message
     * @throws {Error}                               Error thrown when no valid discussion id has been provided
     */
    var deleteDiscussion = exports.deleteDiscussion = function(discussionId, callback) {
        if (!discussionId) {
            throw new Error('A valid discussion id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/discussion/' + discussionId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get the viewers and managers of a discussion.
     *
     * @param  {String}          discussionId                   Id of the discussion we're trying to retrieve the members for
     * @param  {String}          [start]                        The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}          [limit]                        The number of members to retrieve
     * @param  {Function}        callback                       Standard callback method
     * @param  {Object}          callback.err                   Error object containing error code and error message
     * @param  {Object}          callback.members               Response object containing the discussion members and nextToken
     * @param  {User[]|Group[]}  callback.members.results       Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @param  {String}          callback.members.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no discussion ID has been provided
     */
    var getMembers = exports.getMembers = function(discussionId, start, limit, callback) {
        if (!discussionId) {
            throw new Error('A discussion ID should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/discussion/'+ discussionId + '/members',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Change the members and managers of a discussion.
     *
     * @param  {String}       discussionId          Id of the discussion we're trying to update the members of
     * @param  {Object}       updatedMembers        JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]            Standard callback method
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(discussionId, updatedMembers, callback) {
        if (!discussionId) {
            throw new Error('A valid discussion id should be provided');
        } else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedMembers hash should contain at least 1 update.');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/discussion/'+ discussionId + '/members',
            'type': 'POST',
            'data': updatedMembers,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Share a discussion.
     *
     * @param  {String}       discussionId          Id of the discussion we're trying to share
     * @param  {String[]}     principals            Array of principal ids with who the discussion should be shared
     * @param  {Function}     [callback]            Standard callback method
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when no discussion ID or Array of principal IDs has been provided
     */
    var shareDiscussion = exports.shareDiscussion = function(discussionId, principals, callback) {
        if (!discussionId) {
            throw new Error('A discussion ID should be provided');
        } else if (!principals.length) {
            throw new Error('A user or group to share with should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'members': principals
        };

        $.ajax({
            'url': '/api/discussion/' + discussionId + '/share',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get the discussion library for a given principal.
     *
     * @param  {String}         principalId                     User or group id for who we want to retrieve the discussions library
     * @param  {String}         [start]                         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}         [limit]                         The number of discussions to retrieve
     * @param  {Function}       callback                        Standard callback method
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.discussions            Response object containing the discussions in the requested library and nextToken
     * @param  {Discussion[]}   callback.discussions.results    Array of discussions representing the discussions present in the library
     * @param  {String}         callback.discussions.nextToken  The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                          Error thrown when no principal ID has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, start, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group ID should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/discussion/library/' + principalId,
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Delete a discussion from a discussion library.
     *
     * @param  {String}         principalId       User or group id for for the library from which we want to delete the content
     * @param  {String}         discussionId      Id of the discussion we're trying to delete from the library
     * @param  {Function}       [callback]        Standard callback method
     * @param  {Object}         [callback.err]    Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var deleteDiscussionFromLibrary = exports.deleteDiscussionFromLibrary = function(principalId, discussionId, callback) {
        if (!principalId) {
            throw new Error('A valid user or group ID should be provided');
        } else if (!discussionId) {
            throw new Error('A valid discussion ID should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/discussion/library/' + principalId + '/' + discussionId,
            'type': 'DELETE',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };
});
