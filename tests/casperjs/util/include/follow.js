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

/**
 * Utility functions for following users
 *
 * @return  {Object}    Returns an object with referenced follow utility functions
 */
var followUtil = function() {

    /**
     * Follow a user
     *
     * @param  {String}      userId            Id of the user to follow
     * @param  {Function}    callback          Standard callback function
     */
    var follow = function(userId, callback) {
        casper.thenEvaluate(function(userId) {
            require('oae.core').api.follow.follow(userId);
        }, userId);
        casper.wait(configUtil().modalWaitTime, callback);
    };

    /**
     * Unfollow a user you are already following
     *
     * @param  {String}      userId            Id of the user to unfollow
     * @param  {Function}    callback          Standard callback function
     */
    var unfollow = function(userId, callback) {
        casper.thenEvaluate(function(userId) {
            require('oae.core').api.follow.unfollow(userId);
        }, userId);
        casper.wait(configUtil().modalWaitTime, callback);
    };

    return {
        'follow': follow,
        'unfollow': unfollow,
    };
};
