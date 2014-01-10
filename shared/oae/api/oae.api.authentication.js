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
     * Log in as an internal user using the local authentication strategy
     *
     * @param  {String}         username              Username for the user logging in
     * @param  {String}         password              The user's password
     * @param  {Function}       [callback]            Standard callback method
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @param  {User}           [callback.user]       User object representing the logged in user
     * @throws {Error}                                Error thrown when not all of the required parameters have been provided
     */
    var localLogin = exports.localLogin = function(username, password, callback) {
        if (!username) {
            throw new Error('A valid username should be provided');
        } else if (!password) {
            throw new Error('A valid password should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/auth/login',
            'type': 'POST',
            'data': {
                'username': username,
                'password': password
            },
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Log in using the LDAP authentication strategy
     *
     * @param  {String}         username              Username for the user logging in
     * @param  {String}         password              The user's password
     * @param  {Function}       [callback]            Standard callback method
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @param  {User}           [callback.user]       User object representing the logged in user
     * @throws {Error}                                Error thrown when not all of the required parameters have been provided
     */
    var LDAPLogin = exports.LDAPLogin = function(username, password, callback) {
        if (!username) {
            throw new Error('A valid username should be provided');
        } else if (!password) {
            throw new Error('A valid password should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/auth/ldap',
            'type': 'POST',
            'data': {
                'username': username,
                'password': password
            },
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Log out the currently signed in user
     *
     * @param  {Function}       [callback]            Standard callback method
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     */
    var logout = exports.logout = function(callback) {
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/auth/logout',
            'type': 'POST',
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Change the password of the currently logged in user
     *
     * @param  {String}         currentPassword       The user's current password
     * @param  {String}         newPassword           The user's new password
     * @param  {Function}       [callback]            Standard callback method
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @throws {Error}                                Error thrown when no new or current password has been provided
     */
    var changePassword = exports.changePassword = function(currentPassword, newPassword, callback) {
        if (!currentPassword) {
            throw new Error('A valid current password should be provided');
        } else if (!newPassword) {
            throw new Error('A valid new password should be provided');
        }

        var userId = require('oae.core').data.me.id;

        $.ajax({
            'url': '/api/user/' + userId + '/password',
            'type': 'POST',
            'data': {
                'oldPassword': currentPassword,
                'newPassword': newPassword
            },
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

});
