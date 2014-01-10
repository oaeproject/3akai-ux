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
     * Follow a user
     *
     * @param  {String}      userId            Id of the user to follow
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing error code and error message
     * @throws {Error}                         Error thrown when no user id has been provided
     */
    var follow = exports.follow = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/following/' + userId + '/follow',
            'type': 'POST',
            success: function() {
                callback(null);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Unfollow a user you are already following
     *
     * @param  {String}      userId            Id of the user to unfollow
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing error code and error message
     * @throws {Error}                         Error thrown when no user id has been provided
     */
    var unfollow = exports.unfollow = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/following/' + userId + '/unfollow',
            'type': 'POST',
            success: function() {
                callback(null);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the list of users that a given user is following
     *
     * @param  {String}      userId            Id of the user for which to get the following list
     * @param  {Function}    callback          Standard callback function
     * @param  {Object}      callback.err      Error object containing error code and error message
     * @throws {Error}                         Error thrown when no user id has been provided
     */
    var getFollowing = exports.getFollowing = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        $.ajax({
            'url': '/api/following/' + userId + '/following',
            success: function(data) {
                callback(null, data);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the list of users following a given user
     *
     * @param  {String}      userId            Id of the user for which to get the list of followers
     * @param  {Function}    callback          Standard callback function
     * @param  {Object}      callback.err      Error object containing error code and error message
     * @throws {Error}                         Error thrown when no user id has been provided
     */
    var getFollowers = exports.getFollowers = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        $.ajax({
            'url': '/api/following/' + userId + '/followers',
            success: function(data) {
                callback(null, data);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
