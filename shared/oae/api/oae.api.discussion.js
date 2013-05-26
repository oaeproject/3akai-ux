/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
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
     * @param  {String}         displayName             Topic for the discussion
     * @param  {String}         [description]           The discussion's description
     * @param  {String}         [visibility]            The discussion's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]              Array of user/group ids that should be added as managers to the discussion
     * @param  {String[]}       [members]               Array of user/group ids that should be added as members to the discussion
     * @param  {Function}       [callback]              Standard callback method
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @param  {Discussion}     [callback.discussion]   Discussion object representing the created discussion
     * @throws {Error}                                  Error thrown when no discussion topic has been provided
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
     * @param  {String}       discussionId        Id of the discussion we're trying to update
     * @param  {Object}       params              JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateDiscussion = exports.updateDiscussion = function(discussionId, params, callback) {
        if (!discussionId) {
            throw new Error('A valid discussion id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be provided');
        }

        $.ajax({
            'url': '/api/discussion/' + discussionId,
            'type': 'POST',
            'data': params,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Delete a discussion.
     *
     * @param  {String}        discussionId        Id of the discussion we're trying to delete
     * @param  {Function}      callback            Standard callback method
     * @param  {Object}        callback.err        Error object containing error code and error message
     */
    var deleteDiscussion = exports.deleteDiscussion = function(discussionId, callback) {};

    /**
     * Get the viewers and managers of a discussion.
     *
     * @param  {String}          discussionId        Id of the discussion we're trying to retrieve the members for
     * @param  {String}          [start]             The principal id to start from (this will not be included in the response)
     * @param  {Number}          [limit]             The number of members to retrieve.
     * @param  {Function}        callback            Standard callback method
     * @param  {Object}          callback.err        Error object containing error code and error message
     * @param  {User[]|Group[]}  callback.members    Array that contains an object for each member. Each object has a role property that contains the role of the member and a profile property that contains the principal profile of the member
     * @throws {Error}                               Error thrown when no discussion ID has been provided
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
     * @param  {String}       discussionId        Id of the discussion we're trying to update the members of
     * @param  {Object}       updatedMembers      JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(discussionId, updatedMembers, callback) {
        if (!discussionId) {
            throw new Error('A valid discussion id should be provided');
        } else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedMembers hash should contain at least 1 update.');
        }

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
     * @param  {String}       discussionId        Id of the discussion we're trying to share
     * @param  {String[]}     principals          Array of principal ids with who the discussion should be shared
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when no discussion ID or Array of principal IDs has been provided
     */
    var shareDiscussion = exports.shareDiscussion = function(discussionId, principals, callback) {
        if (!discussionId) {
            throw new Error('A discussion ID should be provided');
        } else if (!principals.length) {
            throw new Error('A user or group to share with should be provided');
        }

        var data = {
            'viewers': principals
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
     * @param  {String}         principalId         User or group id for who we want to retrieve the discussions library
     * @param  {String}         [nextToken]         The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the nextToken will be included in the feed from the previous page
     * @param  {Number}         [limit]             The number of discussions to retrieve
     * @param  {Function}       callback            Standard callback method
     * @param  {Object}         callback.err        Error object containing error code and error message
     * @param  {Discussion[]}   callback.results    Array of discussions representing the discussions present in the library
     * @param  {String}         callback.nextToken  Token that should be used to retrieved the next set of discussions in the library
     * @throws {Error}                              Error thrown when no principal ID has been provided
     */
    var getLibrary = exports.getLibrary = function(principalId, nextToken, limit, callback) {
        if (!principalId) {
            throw new Error('A user or group ID should be provided');
        }

        var data = {
            'start': nextToken,
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

});
