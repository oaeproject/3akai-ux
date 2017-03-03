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
     * End a meetup
     *
     * @param  {String}            displayName              The displayName for this group
     * @param  {String}            [description]            The description for this group
     * @param  {String}            [visibility]             The visibility for this group
     * @param  {String}            [joinable]               Whether or not this group is joinable
     * @param  {String[]}          [managers]               An array of userIds that should be made managers
     * @param  {String[]}          [members]                An array of userIds that should be made members
     * @param  {Function}          [callback]               Standard callback function
     * @param  {Object}            [callback.err]           Error object containing error code and error message
     * @param  {Group}             [callback.group]         A Group object representing the created group
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
    var endMeetup = exports.endMeetup = function (meetupId, callback) {

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if(!meetupId) {
            callback(null);
        }

        $.ajax({
            'url': '/api/meetup/' + meetupId + '/end' ,
            'type': 'POST',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    var isMeetingRunning = exports.isMeetingRunning = function(meetupId, callback) {
         // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if(!meetupId) {
            callback(null);
        }

        $.ajax({
            'url': '/api/meetup/' + meetupId + '/isMeetingRunning' ,
            'type': 'GET',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

});
