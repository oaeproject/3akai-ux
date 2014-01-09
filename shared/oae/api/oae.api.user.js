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

define(['exports', 'jquery', 'underscore', 'oae.api.config'], function(exports, $, _, configAPI) {

    /**
     * Creates a new user with an internal login strategy
     *
     * @param  {String}         username                        The username this user can login with
     * @param  {String}         password                        The password for this user
     * @param  {String}         displayName                     The display name for the user
     * @param  {Object}         [additionalOptions]             Additional optional parameters that need to be passed
     * @param  {String}         [additionalOptions.visibility]  The user's visibility setting. This can be public, loggedin or private
     * @param  {String}         [additionalOptions.email]       The user's email address
     * @param  {String}         [additionalOptions.locale]      The user's locale
     * @param  {String}         [additionalOptions.timezone]    The user's timezone
     * @param  {String}         [additionalOptions.publicAlias] The publically-available alias for users to see when the user's display name is protected
     * @param  {String}         recaptchaChallenge              The identifier of the recaptcha challenge that has been presented to the user
     * @param  {String}         recaptchaResponse               The response for the presented recaptcha challenge
     * @param  {Function}       [callback]                      Standard callback method
     * @param  {Object}         [callback.err]                  Error object containing error code and error message
     * @param  {User}           [callback.response]             A User object representing the created user
     * @throws {Error}                                          Error thrown when not all of the required parameters have been provided
     */
    var createUser = exports.createUser = function(username, password, displayName, additionalOptions, recaptchaChallenge, recaptchaResponse, callback) {
        if (!username) {
            throw new Error('A username should be provided');
        } else if (!password) {
            throw new Error('A password should be provided');
        } else if (!displayName) {
            throw new Error('A display name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        additionalOptions = additionalOptions || {};

        var data = {
            'username': username,
            'password': password,
            'displayName': displayName,
            'recaptchaChallenge': recaptchaChallenge,
            'recaptchaResponse': recaptchaResponse,
            'visibility': additionalOptions.visibility,
            'email': additionalOptions.email,
            'locale': additionalOptions.locale,
            'timezone': additionalOptions.timezone,
            'publicAlias': additionalOptions.publicAlias
        };

        // If the tenant requires the terms and conditions to be accepted, add it on the data object
        if (configAPI.getValue('oae-principals', 'termsAndConditions', 'enabled') === true) {
            data.acceptedTC = true;
        }

        // Create the user
        $.ajax({
            'url': '/api/user/create',
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
     * Gets the currently logged in user. A cached copy of this object will be available on oae.data.me when requiring
     * `oae.api!` in your widget
     *
     * @param  {Function}       callback            Standard callback method takes arguments `err` and `resp`
     * @param  {Object}         callback.err        Error object containing error code and error message
     * @param  {Object}         callback.response   The user's me feed
     */
    var getMe = exports.getMe = function(callback) {
        $.ajax({
            'url': '/api/me',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get a user's basic profile
     *
     * @param  {String}         userId              User id of the profile you wish to retrieve
     * @param  {Function}       callback            Standard callback method
     * @param  {Object}         callback.err        Error object containing error code and error message
     * @param  {User}           callback.response   The user's basic profile
     * @throws {Error}                              Error thrown when no userId has been provided
     */
    var getUser = exports.getUser = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        $.ajax({
            'url': '/api/user/' + userId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update the current user's basic profile
     *
     * @param  {Object}         params              Object representing the profile fields that need to be updated. The keys are the profile fields, the values are the profile field values
     * @param  {Function}       [callback]          Standard callback method
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @throws {Error}                              Error thrown when no update parameters have been provided
     */
    var updateUser = exports.updateUser = function(params, callback) {
        if (!params || _.keys(params).length === 0) {
            throw new Error('At least 1 parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Get the current user to construct the endpoint url.
        var userId = require('oae.core').data.me.id;

        // Update all places that are showing the current user's display name
        if (params['displayName']) {
            $('.oae-my-displayname').text(params['displayName']);
        }

        $.ajax({
            'url': '/api/user/' + userId,
            'type': 'POST',
            'data': params,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get the Terms and Conditions
     *
     * @param  {Object}         params              Object representing the profile fields that need to be updated. The keys are the profile fields, the values are the profile field values
     * @param  {Function}       callback            Standard callback method
     * @param  {Object}         callback.err        Error object containing error code and error message
     * @throws {Error}                              Error thrown when no update parameters have been provided
     */
    var getTC = exports.getTC = function(callback) {
        $.ajax({
            'url': '/api/user/termsAndConditions',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Accept the Terms and Conditions
     *
     * @param  {Object}         params              Object representing the profile fields that need to be updated. The keys are the profile fields, the values are the profile field values
     * @param  {Function}       [callback]          Standard callback method
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @throws {Error}                              Error thrown when no update parameters have been provided
     */
    var acceptTC = exports.acceptTC = function(callback) {
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Get the current user to construct the endpoint url
        var userId = require('oae.core').data.me.id;

        $.ajax({
            'url': '/api/user/' + userId + '/termsAndConditions',
            'type': 'POST',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
