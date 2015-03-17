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

define(['exports', 'jquery', 'oae.api.config'], function(exports, $, configAPI) {

    /**
     * Get the list of all enabled authentication strategies for the current tenant
     *
     * @return {Object}                List of all enabled authentication strategies for the current tenant keyed by authentication strategy id. Each enabled authentication strategy will contain a `url` property with the URL to which to POST to initiate the authentication process for that strategy and a `name` property with the custom configured name for that strategy
     */
    var getEnabledStrategies = exports.getEnabledStrategies = function() {
        var enabledStrategies = {};

        // CAS authentication
        if (configAPI.getValue('oae-authentication', 'cas', 'enabled')) {
            enabledStrategies['cas'] = {
                'name': configAPI.getValue('oae-authentication', 'cas', 'name'),
                'url': '/api/auth/cas'
            };
        }

        // Facebook authentication
        if (configAPI.getValue('oae-authentication', 'facebook', 'enabled')) {
            enabledStrategies['facebook'] = {'url': '/api/auth/facebook'};
        }

        // Google authentication. This will only be enabled when no Google Apps domain has been configured.
        if (configAPI.getValue('oae-authentication', 'google', 'enabled') && !configAPI.getValue('oae-authentication', 'google', 'domains')) {
            enabledStrategies['google'] = {'url': '/api/auth/google'};
        }

        // Google Apps authentication
        if (configAPI.getValue('oae-authentication', 'google', 'enabled') && configAPI.getValue('oae-authentication', 'google', 'domains')) {
            enabledStrategies['googleApps'] = {'url': '/api/auth/google'};
        }

        // LDAP authentication
        if (configAPI.getValue('oae-authentication', 'ldap', 'enabled')) {
            enabledStrategies['ldap'] = {'url': '/api/auth/ldap'};
        }

        // Shibboleth authentication
        if (configAPI.getValue('oae-authentication', 'shibboleth', 'enabled')) {
            enabledStrategies['shibboleth'] = {
                'name': configAPI.getValue('oae-authentication', 'shibboleth', 'name'),
                'url': '/api/auth/shibboleth'
            };
        }

        // Twitter authentication
        if (configAPI.getValue('oae-authentication', 'twitter', 'enabled')) {
            enabledStrategies['twitter'] = {'url': '/api/auth/twitter'};
        }

        // Local authentication
        if (configAPI.getValue('oae-authentication', 'local', 'enabled')) {
            enabledStrategies['local'] = {'url': '/api/auth/login'};
        }

        return enabledStrategies;
    };

    /**
     * Log in as an internal user using the local authentication strategy
     *
     * @param  {String}         username              Username for the user logging in
     * @param  {String}         password              The user's password
     * @param  {Function}       [callback]            Standard callback function
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
     * Log out of an internal user using the local authentication strategy
     */
    var logout = exports.logout = function(callback) {
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
     * Log in using the LDAP authentication strategy
     *
     * @param  {String}         username              Username for the user logging in
     * @param  {String}         password              The user's password
     * @param  {Function}       [callback]            Standard callback function
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
     * Change the password of the currently logged in user
     *
     * @param  {String}         currentPassword       The user's current password
     * @param  {String}         newPassword           The user's new password
     * @param  {Function}       [callback]            Standard callback function
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
