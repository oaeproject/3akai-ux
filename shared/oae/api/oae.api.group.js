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

define(['exports', 'jquery', 'underscore', 'oae.api.util'], function(exports, $, _, utilAPI) {

    /**
     * Creates a group.
     *
     * @param  {String}            displayName              The displayName for this group
     * @param  {String}            [description]            The description for this group
     * @param  {String}            [visibility]             The visibility for this group
     * @param  {String}            [joinable]               Whether or not this group is joinable
     * @param  {String[]}          [managers]               An array of userIds that should be made managers
     * @param  {String[]}          [members]                An array of userIds that should be made members
     * @param  {Function}          [callback]               Standard callback method
     * @param  {Object}            [callback.err]           Error object containing error code and error message
     * @param  {Group}             [callback.group]         A Group object representing the created group
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
    var createGroup = exports.createGroup = function (displayName, description, visibility, joinable, managers, members, callback) {
        if (!displayName) {
             throw new Error('A group displayName should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'joinable': joinable,
            'managers': managers,
            'members': members
        };

        $.ajax({
            'url': '/api/group/create',
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
     * Get a group.
     *
     * @param  {String}       groupId             The id of the group you wish to retrieve.
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Group}        callback.group      The group object representing the requested group
     * @throws {Error}                            Error thrown when no group id has been provided
     */
    var getGroup = exports.getGroup = function(groupId, callback) {
        if (!groupId) {
            throw new Error('A valid group id should be provided');
        }

        $.ajax({
            'url': '/api/group/' + groupId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Updates a group.
     *
     * @param  {String}       groupId                         The id of the group you wish to update
     * @param  {Object}       profileFields                   Object where the keys represent the profile fields that need to be updated and the values represent the new values for those profile fields.
     * @param  {String}       [profileFields.displayName]     New displayName for the group
     * @param  {String}       [profileFields.description]     New description for the group
     * @param  {String}       [profileFields.visibility]      New visibility setting for the group. The possible values are 'private', 'loggedin' and 'public'
     * @param  {String}       [profileFields.joinable]        New joinability setting for the group. The possible values are 'yes', 'no' and 'request'
     * @param  {Function}     [callback]                      Standard callback method
     * @param  {Object}       [callback.err]                  Error object containing error code and error message
     * @param  {Group}        [callback.group]                The group object representing the updated group
     * @throws {Error}                                        Error thrown when not all of the required parameters have been provided
     */
    var updateGroup = exports.updateGroup = function (groupId, profileFields, callback) {
        if (!groupId) {
            throw new Error('A valid group id should be provided');
        } else if (!profileFields || _.keys(profileFields).length === 0) {
            throw new Error('At least one parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Only send those things that are truly supported.
        var data = _.pick(profileFields, 'displayName', 'description', 'visibility', 'joinable');

        $.ajax({
            'url': '/api/group/' + groupId,
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
     * Get the members of a group.
     *
     * @param  {String}             groupId                        The id of the group you wish to update
     * @param  {String}             [start]                        The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}             [limit]                        The number of members to retrieve
     * @param  {Function}           callback                       Standard callback method
     * @param  {Object}             callback.err                   Error object containing error code and error message
     * @param  {Object}             callback.members               Response object containing the group members and nextToken
     * @param  {User[]|Group[]}     callback.members.results       Array of principals representing the group members
     * @param  {String}             callback.members.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                             Error thrown when no group id has been provided
     */
    var getMembers = exports.getMembers = function(groupId, start, limit, callback) {
        if (!groupId) {
            throw new Error('A valid group id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/group/'  + groupId + '/members',
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
     * Update the members of a group.
     *
     * @param  {String}       groupId             The id of the group you wish to update
     * @param  {Object}       members             A hash object where each key is the id of a user or group and the value is one of 'manager', 'member' or false. In case the value is false, the member will be deleted.
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function(groupId, members, callback) {
        if (!groupId) {
            throw new Error('A valid group id should be provided');
        } else if (!members || _.keys(members).length === 0) {
            throw new Error('At least one member should be speficied.');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/group/'  + groupId + '/members',
            'type': 'POST',
            'data': members,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Returns all of the groups that a user is a direct and indirect member of.
     *
     * @param  {String}       [userId]                           The user id for which we want to get all of the memberships. If this is not provided, the current user's id will be used.
     * @param  {String}       [start]                            The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}       [limit]                            The number of memberships to retrieve
     * @param  {Function}     callback                           Standard callback method
     * @param  {Object}       callback.err                       Error object containing error code and error message
     * @param  {Object}       callback.memberships               Response object containing the groups the provided user is a member of and nextToken
     * @param  {Group[]}      callback.memberships.results       An array of groups representing the direct and indirect memberships of the provided user
     * @param  {String}       callback.memberships.nextToken     The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                           Error thrown when not all of the required parameters have been provided
     */
    var memberOf = exports.memberOf = function(userId, start, limit, callback) {
        // Default values
        userId = userId || require('oae.core').data.me.id;
        limit = limit || 10;

        // Parameter validation
        if (!_.isNumber(limit)) {
            throw new Error('A valid limit should be provided');
        }

        $.ajax({
            'url': '/api/user/' + userId + '/memberships',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Join a group as the currently authenticated user.
     *
     * @param  {String}       groupId             The id of the group that should be joined
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when no groupid has been provided.
     */
    var joinGroup = exports.joinGroup = function(groupId, callback) {
        if (!groupId) {
            throw new Error('A valid group id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/group/' + groupId + '/join',
            'type': 'POST',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Leave a group as the currently authenticated user.
     *
     * @param  {String}       groupId             The id of the group that should be left
     * @param  {Function}     [callback]          Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @throws {Error}                            Error thrown when no group id has been provided
     */
    var leaveGroup = exports.leaveGroup = function(groupId, callback) {
        if (!groupId) {
            throw new Error('A valid group id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/group/' + groupId + '/leave',
            'type': 'POST',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
