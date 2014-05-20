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

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Log in as the specified user and redirect to the `/me` page
     *
     * @param  {[type]}         userId                The ID of the user to become
     * @param  {Function}       [callback]            Standard callback method only executed on error. When becoming a user succeeds they the user is redirected to `/me` instead
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @throws {Error}                                Error thrown when no user ID has been provided
     */
    var becomeUser = exports.becomeUser = function(userId, callback) {
        $.ajax({
            'url': '/api/auth/signed/become',
            'data': {
                'becomeUserId': userId
            },
            'type': 'GET',
            'success': function(data) {
                $.ajax({
                    'url': data.url,
                    'data': data.body,
                    'type': 'POST',
                    'success': function(data) {
                        oae.api.util.redirect().me();
                    },
                    'error': function(jqXHR, textStatus) {
                        callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
                    }
                });
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Change the password of the specified user
     *
     * @param  {String}         userId                The ID of the user to change the password for.
     * @param  {String}         newPassword           The user's new password
     * @param  {Function}       [callback]            Standard callback method
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @throws {Error}                                Error thrown when no new passowrd or user ID has been provided
     */
    var changePassword = exports.changePassword = function(userId, newPassword, callback) {
        if (!userId) {
            throw new Error('A valid user ID should be provided');
        } else if (!newPassword) {
            throw new Error('A valid new password should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/user/' + userId + '/password',
            'type': 'POST',
            'data': {
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
     * @param  {String}         [tenantAlias]                   The alias of the tenant to create the user on. Only needs to be provided when creating a user from the global administration tenant
     * @param  {Function}       [callback]                      Standard callback method
     * @param  {Object}         [callback.err]                  Error object containing error code and error message
     * @param  {User}           [callback.response]             A User object representing the created user
     * @throws {Error}                                          Error thrown when not all of the required parameters have been provided
     */
    var createUser = exports.createUser = function(username, password, displayName, additionalOptions, tenantAlias, callback) {
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
            'visibility': additionalOptions.visibility,
            'email': additionalOptions.email,
            'locale': additionalOptions.locale,
            'timezone': additionalOptions.timezone,
            'publicAlias': additionalOptions.publicAlias,
            'acceptedTC': true
        };

        var url = '/api/user/create';
        // If a tenant alias is specified we change the URL to include the tenant
        if (tenantAlias) {
            url = '/api/user/' + tenantAlias + '/create';
        }

        // Create the user
        $.ajax({
            'url': url,
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
     * Edit a specified user's priviliges
     *
     * @param  {String}         userId                  The user ID of the user you're changing the priviliges of
     * @param  {Boolean}        isAdmin                 `true` if the user should be made an admin of the tenant, `false` if the user should not be a tenant
     * @param  {Boolean}        isGlobalAdminServer     `true` if it's a user on the global tenant, `false` if it's a user on any other tenant
     * @param  {Function}       [callback]              Standard callback method
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @throws {Error}                                  Error thrown when no user ID has been specified
     */
    var editUserPriviliges = exports.editUserPriviliges = function(userId, isAdmin, isGlobalAdminServer, callback) {
        if (!userId) {
            throw new Error('A valid user ID should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var url = '/api/user/' + userId + '/admin';
        if (isGlobalAdminServer) {
            url = '/api/user/' + userId + '/globaladmin';
        }

        $.ajax({
            'url': url,
            'type': 'POST',
            'data': {
                'admin': isAdmin
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
     * Reindex the search index
     *
     * @param  {Function}       [callback]              Standard callback method
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     */
    var reindexSearch = exports.reindexSearch = function(callback) {
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/search/reindexAll',
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
     * Reprocess previews
     *
     * @param  {Object}         reprocessParameters     Parameters that determine what content item previews need to be reprocessed
     * @param  {Function}       [callback]              Standard callback method
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     */
    var reprocessPreviews = exports.reprocessPreviews = function(reprocessParameters, callback) {
        if (!reprocessParameters || _.isEmpty(reprocessParameters)) {
            throw new Error('Valid reprocess parameters should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'type': 'POST',
            'url': '/api/content/reprocessPreviews',
            'data': reprocessParameters,
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update a user's basic profile
     *
     * @param  {String}         userId              Optional user ID of the user profile you wish to update
     * @param  {Object}         params              The profile fields to update
     * @param  {Function}       [callback]          Standard callback method
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @throws {Error}                              Error thrown when no update parameters have been provided
     */
    var updateUser = exports.updateUser = function(userId, params, callback) {
        if (!userId) {
            throw new Error('A valid user ID should be provided');
        } else if (!params || _.keys(params).length === 0) {
            throw new Error('At least 1 parameter should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

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

});
