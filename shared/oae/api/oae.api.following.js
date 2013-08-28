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

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Follow a user
     *
     * @param  {String}      userId      The id of the user to follow
     * @param  {Function}    callback    Standard callback function
     */
    var follow = exports.follow = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        $.ajax({
            'url': '/api/following/' + userId + '/follow',
            'type': 'POST',
            success: function() {
                callback(null);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Unfollow a user you are already following
     *
     * @param  {String}      userId      The id of the user to unfollow
     * @param  {Function}    callback    Standard callback function
     */
    var unfollow = exports.unfollow = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        $.ajax({
            'url': '/api/following/' + userId + '/unfollow',
            'type': 'POST',
            success: function() {
                callback(null);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get the list of users you are following
     *
     * @param  {String}      userId      The id of the user to get the following list for
     * @param  {Function}    callback    Standard callback function
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get the list of users that are following you
     *
     * @param  {String}      userId      The id of the user to get the followers list for
     * @param  {Function}    callback    Standard callback function
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
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

});
