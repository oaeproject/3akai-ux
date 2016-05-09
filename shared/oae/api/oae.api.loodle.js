/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is diKIND, either express
 * or implied. See the License for the specific lstributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY anguage governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery', 'oae.api.config'], function(exports, $, configAPI) {

    var LOODLE_ACTIVITY = exports.LOODLE_ACTIVITY = 'activity';

    var createLoodle = exports.createLoodle = function (displayName, description, visibility, managers, viewers, folders, callback) {

        if (!displayName) {
            throw new Error('A valid document name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'resourceSubType': 'loodle',
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'managers': managers,
            'viewers': viewers,
            'folders': folders
        };

        $.ajax({
            'url': '/api/content/create',
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
     * Add schedule to the specified loodle
     *
     * @param {String}   loodleId       Loodle identifier
     * @param {String}   begin_time     Schedule begin time
     * @param {String}   end_time       Schedule end time
     * @param {Function} callback       Standard callback function
     */
    var addSchedule = exports.addSchedule = function (loodleId, begin_time, end_time, callback) {

        var data = {
            'begin_time': begin_time,
            'end_time': end_time
        };

        $.ajax({
            'url': '/api/loodle/' + loodleId + '/schedule',
            'type': 'POST',
            'data': data,
            'success': function () {
                return callback();
            },
            'error': function (err) {
                return callback(err);
            }
        });

    };

    /**
     * Delete the specified schedule
     *
     * @param  {String}   loodleId      Loodle identifier
     * @param  {String}   scheduleId    Schedule identifier
     * @param  {Function} callback      Standard callback function
     */
    var deleteSchedule = exports.deleteSchedule = function (loodleId, scheduleId, callback) {

        $.ajax({
            'url': '/api/loodle/' + loodleId + '/schedule/' + scheduleId,
            'type': 'DELETE',
            'success': function () {
                return callback();
            },
            'error': function (err) {
                return callback(err);
            }
        });

    };

    /**
     * Update the votes of the current user on a loodle
     *
     * @param  {Object}   votes     Vote object with vote id as key and value of the vote as value
     * @param  {Function} callback  Standard callback function
     */
    var updateVotes = exports.updateVotes = function (votes, loodleId, callback) {

        $.ajax({
            'url': '/api/loodle/' + loodleId + '/votes',
            'type': 'PUT',
            'data': votes,
            'success': function () {
                return callback();
            },
            'error': function (xhr, status, error) {
                return callback(xhr.responseText);
            }
        });

    };

    /**
     * Send custom notifications concerning the loodle
     *
     * @param  {String}   contentId             Content identifier
     * @param  {String}   notificationType      The type of notifications to send
     * @param  {Function} callback              Standard callback function
     */
    var sendNotifications = exports.sendNotifications = function (contentId, notificationType, callback) {

        $.ajax({
            'url': '/api/loodle/' + contentId + '/notifications',
            'type': 'POST',
            'data': {'notificationType' : notificationType},
            'success': callback,
            'error': callback
        });

    };

    var getData = exports.getData = function (loodleId, callback) {

        $.ajax({
            'url': '/api/loodle/' + loodleId,
            'type': 'GET',
            'success': function (data) {
                return callback(null, data);
            },
            'error': callback
        });

    };

    var addMemberWithVotes = exports.addMemberWithVotes = function (loodleId, firstName, lastName, votes, callback) {

        var data = {
            'firstName': firstName,
            'lastName': lastName,
            'votes': JSON.stringify(votes)
        };

        $.ajax({
            'url': '/api/loodle/' + loodleId + '/user',
            'type': 'POST',
            'data': data,
            'success': function (data) {
                callback(null, data);
            },
            'error': function (xhr, status, error) {
                callback(xhr.responseText);
            }
        });

    };

    var isEnabled = exports.isEnabled = function () {
        return configAPI.getValue('oae-loodle', LOODLE_ACTIVITY, 'enabled');
    };
});
