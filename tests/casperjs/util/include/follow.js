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
 */
var followUtil = (function() {
    /**
     * Follow a user
     *
     * @param  {String}      userId            Id of the user to follow
     * @param  {Function}    callback          Standard callback function
     * @param  {Object}      [callback.err]    Error object containing error code and error message
     */
    var follow = function(userId, callback) {
        var err = null;
        var done = null;

        mainUtil.callInternalAPI('follow', 'follow', [userId], function(_err) {
            if (_err) {
                casper.echo(
                    'Could not follow user ' +
                        userId +
                        '. Error ' +
                        _err.code +
                        ': ' +
                        _err.msg,
                    'ERROR',
                );
                err = _err;
            } else {
                done = true;
            }
        });

        casper.waitFor(
            function() {
                return done === true || err !== null;
            },
            function() {
                return callback(err);
            },
        );
    };

    /**
     * Unfollow a user you are already following
     *
     * @param  {String}      userId            Id of the user to unfollow
     * @param  {Function}    callback          Standard callback function
     * @param  {Object}      [callback.err]    Error object containing error code and error message
     */
    var unfollow = function(userId, callback) {
        var err = null;
        var done = null;

        mainUtil.callInternalAPI('follow', 'unfollow', [userId], function(
            _err,
        ) {
            if (_err) {
                casper.echo(
                    'Could not unfollow user ' +
                        userId +
                        '. Error ' +
                        _err.code +
                        ': ' +
                        _err.msg,
                    'ERROR',
                );
                err = _err;
            } else {
                done = true;
            }
        });

        casper.waitFor(
            function() {
                return done === true || err !== null;
            },
            function() {
                return callback(err);
            },
        );
    };

    return {
        follow: follow,
        unfollow: unfollow,
    };
})();
