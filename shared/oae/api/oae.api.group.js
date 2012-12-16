/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
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
     * Creates a group.
     * 
     * @param  {String}            alias                    The alias for this group
     * @param  {String}            name                     The name for this group
     * @param  {String}            [description]            The description for this group
     * @param  {String}            [visibility]             The visibility for this group
     * @param  {String}            [joinable]               Whether or not this group is joinable
     * @param  {String[]}          [managers]               An array of userIds that should be made managers
     * @param  {String[]}          [members]                An array of userIds that should be made members
     * @param  {Function}          [callback]               Standard callback method
     * @param  {Object}            [callback.err]           Error object containing error code and error message
     * @param  {Group}             [callback.response]      A Group object representing the created group
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
    var createGroup = exports.createGroup = function (alias, name, description, visibility, joinable, managers, members, callback) {
        if (!alias) {
             throw new Error('A group alias should be provided');
        } else if (!name) {
             throw new Error('A group name should be provided');
        }

        var data = {
            'alias': alias,
            'name': name,
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };
       
    /**
     * Get a group.
     * 
     * @param  {String}       groupId             The id of the group you wish to retrieve.
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Group}        callback.response   The group object representing the requested group
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };
    
    /**
     * Updates a group.
     * 
     * @param  {String}       groupId                       The id of the group you wish to update
     * @param  {Object}       profileFields                 Object where the keys represent the profile fields that need to be updated and the values represent the new values for those profile fields.
     * @param  {String}       [profileFields.name]          New name for the group
     * @param  {String}       [profileFields.description]   New description for the group
     * @param  {String}       [profileFields.visibility]    New visibility setting for the group. The possible values are 'private', 'loggedin' and 'public'
     * @param  {String}       [profileFields.joinable]      New joinability setting for the group. The possible values are 'yes', 'no' and 'request'
     * @param  {Function}     [callback]                    Standard callback method
     * @param  {Object}       [callback.err]                Error object containing error code and error message
     */
    var updateGroup = exports.updateGroup = function (groupId, profileFields, callback) {};

    /**
     * Get the members of a group.
     * 
     * @param  {String}             groupId             The id of the group you wish to update
     * @param  {String}             [start]             The principal id to start from (this will not be included in the response)
     * @param  {Number}             [limit]             The number of members to retrieve.
     * @param  {Function}           callback            Standard callback method
     * @param  {Object}             callback.err        Error object containing error code and error message
     * @param  {User[]|Group[]}     callback.response   Array of principals representing the group members
     */
    var getGroupMembers = exports.getGroupMembers = function(groupId, start, limit, callback) {
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
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
     */
    var setGroupMembers = exports.setGroupMembers = function(groupId, members, callback) {};

    /**
     * Returns all of the groups that a user is a direct and indirect member of.
     * 
     * @param  {String}       [userId]            The user id for which we want to get all of the memberships. If this is not provided, the current user's id will be used.
     * @param  {String}       [start]             The group id to start from (this will not be included in the response)
     * @param  {Number}       [limit]             The number of members to retrieve
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Group[]}      callback.response   An array of groups representing the direct and indirect memberships of the provided user
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var memberOf = exports.memberOf = function(userId, start, limit, callback) {
        // Default values
        userId = userId || require('oae/api/oae.core').data.me.userId;
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

});
