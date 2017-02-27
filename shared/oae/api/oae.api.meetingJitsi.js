/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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
     * Create a new meeting
     *
     * @param  {String}         displayName               Topic for the meeting
     * @param  {String}         [description]             The meeting's description
     * @param  {String}         [record]       		      Flag indicating that the meeting may be recorded
     * @param  {String}         [allModerators]           Flag indicating that all users join as moderators
     * @param  {String}         [waitModerator]           Flag indicating that viewers must wait until a moderator joins
     * @param  {String}         [visibility]              The meeting's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]                Array of user/group ids that should be added as managers to the meeting
     * @param  {String[]}       [members]                 Array of user/group ids that should be added as members to the meeting
     * @param  {Function}       [callback]                Standard callback function
     * @param  {Object}         [callback.err]            Error object containing error code and error message
     * @param  {Meeting}        [callback.meeting]        Meeting object representing the created meeting
     * @throws {Error}                                    Error thrown when no meeting topic has been provided
     */
    var createMeeting = exports.createMeeting = function (displayName, description, chat, contactList, visibility, managers, members, callback) {

        if (!displayName) {
            throw new Error('A valid display name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'displayName': displayName,
            'description': description,
            'chat': chat,
            'contactList': contactList,
            'visibility': visibility,
            'managers': managers,
            'members': members
        };

        $.ajax({
            'url': '/api/meeting-jitsi/create',
            'type': 'POST',
            'data': data,
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Get a full meeting profile
     *
     * @param  {String}       meetingId             Id of the meeting we're trying to retrieve
     * @param  {Function}     callback              Standard callback function
     * @param  {Object}       callback.err          Error object containing error code and error message
     * @param  {Meeting}      callback.meeting      Meeting object representing the retrieved meeting
     * @throws {Error}                              Error thrown when no meeting id has been provided
     */
    var getMeeting = exports.getMeeting = function (meetingId, callback) {

        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId,
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Get all the invitations for a meeting
     *
     * @param  {String}         meetingId                       Id of the meeting we're trying to retrieve the invitations for
     * @param  {Function}       callback                        Standard callback function
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.invitations            Response object containing the meeting invitations
     * @param  {Invitation[]}   callback.invitations.results    Every invitation associated to the meeting
     * @throws {Error}                                          Error thrown when no meeting id has been provided
     */
    var getInvitations = exports.getInvitations = function (meetingId, callback) {

        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId + '/invitations',
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Update a meeting's metadata
     *
     * @param  {String}       meetingId                   Id of the meeting we're trying to update
     * @param  {Object}       params                      JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     [callback]                  Standard callback function
     * @param  {Object}       [callback.err]              Error object containing error code and error message
     * @param  {Meeting}      [callback.meeting]          Meeting object representing the updated meeting
     * @throws {Error}                                    Error thrown when not all of the required parameters have been provided
     */
    var updateMeeting = exports.updateMeeting = function (meetingId, params, callback) {

        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least one update parameter should be updated');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId,
            'type': 'PUT',
            'data': params,
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Delete a meeting
     *
     * @param   {String}      meetingId         Id of the meeting we're trying to delete
     * @param   {function}    [callback]        Standard callback function
     * @throws  {Error}                         Error thrown when not all of the required parameters have been provided
     */
    var deleteMeeting = exports.deleteMeeting = function (meetingId, callback) {

        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId,
            'type': 'DELETE',
            'success': function () {
                return callback(null);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Delete a meeting from a meeting library
     *
     * @param   {String}      principalId 	        User or group id for the library from which we want to delete the meeting
     * @param   {String}      meetingId             Id of the meeting we're trying to delete from the library
     * @param   {Function}    [callback]            Standard callback function
     * @param   {Object}      [callback.err]        Error object containing error code and error message
     * @throws  {Error}                             Error thrown when not all of the required parameters have been provided
     */
    var deleteMeetingFromLibrary = exports.deleteMeetingFromLibrary = function (principalId, meetingId, callback) {

        if (!principalId) {
            throw new Error('A valid user or group id should be provided');
        } else if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/library/' + principalId + '/' + meetingId,
            'type': 'DELETE',
            'success': function () {
                return callback(null);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Change the members and managers of a meeting
     *
     * @param  {String}       meetingId             Id of the meeting we're trying to update the members of
     * @param  {Object}       updatedMembers        JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
     * @param  {Function}     [callback]            Standard callback function
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var updateMembers = exports.updateMembers = function (meetingId, updatedMembers, callback) {

        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }  else if (!updatedMembers || _.keys(updatedMembers).length === 0) {
            throw new Error('The updatedmembers hash should contain at least 1 update');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId + '/members',
            'type': 'PUT',
            'data': updatedMembers,
            'success': function () {
                return callback(null);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Start a meeting
     *
     * @param {any} meetingId
     * @param {any} callback
     */
    var startMeeting = exports.startMeeting = function (meetingId, callback) {

        if (!meetingId) {
            throw new Error('A valid meeting id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId + '/start',
            'type': 'GET',
            'success': function () {
                return callback(null);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
