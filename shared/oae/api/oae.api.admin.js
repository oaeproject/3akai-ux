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


    /////////////
    // TENANTS //
    /////////////

    /**
     * Create a new tenant
     *
     * @param  {String}         alias                               The alias of the tenant to create
     * @param  {String}         displayName                         The display name of the tenant to create
     * @param  {String}         host                                The host name of the tenant to create
     * @param  {Object}         [opts]                              Optional arguments
     * @param  {String}         [opts.emailDomain]                  The email domain to assign to the tenant
     * @param  {String}         [opts.countryCode]                  The ISO-3166-1 Country Code to which the tenant belongs
     * @param  {Function}       [callback]                          Standard callback method
     * @param  {Object}         [callback.err]                      Error object containing error code and error message
     * @param  {Tenant}         [callback.tenant]                   A Tenant object representing the created tenant
     */
    var createTenant = exports.createTenant = function(alias, displayName, host, opts, callback) {
        if (!alias) {
            throw new Error('A tenant alias should be provided');
        } else if (!displayName) {
            throw new Error('A display name should be provided');
        } else if (!host) {
            throw new Error('A host should be provided');
        }

        // Set a default optional arguments object in case no optional arguments object has been provided
        opts = opts || {};

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'alias': alias,
            'displayName': displayName,
            'host': host
        };

        if (opts.emailDomain) {
            data.emailDomain = opts.emailDomain;
        }

        if (opts.countryCode) {
            data.countryCode = opts.countryCode;
        }

        // Create the tenant
        $.ajax({
            'url': '/api/tenant/create',
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
     * Get a tenant by alias
     *
     * @param  {String}      [alias]            The alias of the tenant to get, if falsy the current tenant will be returned
     * @param  {Function}    callback           Standard callback method
     * @param  {Object}      callback.err       Error object containing error code and error message
     * @param  {Tenant}      callback.tenant    The requested tenant
     */
    var getTenant = exports.getTenant = function(alias, callback) {
        var url = '/api/tenant';
        if (alias) {
            url += '/' + alias;
        }
        $.ajax({
            'url': url,
            'type': 'GET',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };


    /////////////////////
    // USER MANAGEMENT //
    /////////////////////

    /**
     * Create a new user with an internal login strategy
     *
     * @param  {String}         [tenantAlias]                       The alias of the tenant to create the user on. Only needs to be provided when creating a user from the global administration tenant
     * @param  {String}         username                            The username this user can login with
     * @param  {String}         password                            The password for this user
     * @param  {String}         displayName                         The display name for the user
     * @param  {String}         email                               The email for the user
     * @param  {Object}         [additionalOptions]                 Additional optional parameters that need to be passed in
     * @param  {String}         [additionalOptions.visibility]      The user's visibility setting. This can be public, loggedin or private
     * @param  {String}         [additionalOptions.locale]          The user's locale
     * @param  {String}         [additionalOptions.publicAlias]     The publically-available alias for users to see when the user's display name is protected
     * @param  {Boolean}        [additionalOptions.isGlobalAdmin]   Whether or not the new user should be a global admin
     * @param  {Boolean}        [additionalOptions.isTenantAdmin]   Whether or not the new user should be a tenant admin
     * @param  {Function}       [callback]                          Standard callback function
     * @param  {Object}         [callback.err]                      Error object containing error code and error message
     * @param  {User}           [callback.user]                     The created user
     * @throws {Error}                                              Error thrown when not all of the required parameters have been provided
     */
    var createUser = exports.createUser = function(tenantAlias, username, password, displayName, email, additionalOptions, callback) {
        if (!username) {
            throw new Error('A username should be provided');
        } else if (!password) {
            throw new Error('A password should be provided');
        } else if (!displayName) {
            throw new Error('A display name should be provided');
        } else if (!email) {
            throw new Error('An email address should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        additionalOptions = additionalOptions || {};

        var data = {
            'username': username,
            'password': password,
            'displayName': displayName,
            'email': email,
            'visibility': additionalOptions.visibility,
            'locale': additionalOptions.locale,
            'publicAlias': additionalOptions.publicAlias
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
     * Create a new global administrator with an internal login strategy
     *
     * @param  {String}         username                            The username the global administrator can log in with
     * @param  {String}         password                            The password for the global administrator
     * @param  {String}         displayName                         The display name for the global administrator
     * @param  {String}         email                               The email for the global administrator
     * @param  {Object}         [additionalOptions]                 Additional optional parameters that need to be passed in
     * @param  {String}         [additionalOptions.locale]          The global administrator's locale
     * @param  {String}         [additionalOptions.publicAlias]     The publically-available alias for users to see when the global administrator's display name is protected
     * @param  {Function}       [callback]                          Standard callback function
     * @param  {Object}         [callback.err]                      Error object containing error code and error message
     * @param  {User}           [callback.user]                     The created global administrator user
     * @throws {Error}                                              Error thrown when not all of the required parameters have been provided
     */
    var createGlobalAdminUser = exports.createGlobalAdminUser = function(username, password, displayName, email, additionalOptions, callback) {
        if (!username) {
            throw new Error('A username should be provided');
        } else if (!password) {
            throw new Error('A password should be provided');
        } else if (!displayName) {
            throw new Error('A display name should be provided');
        } else if (!email) {
            throw new Error('An email address should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        additionalOptions = additionalOptions || {};

        var data = {
            'username': username,
            'password': password,
            'displayName': displayName,
            'email': email,
            'locale': additionalOptions.locale,
            'publicAlias': additionalOptions.publicAlias
        };

        // Create the global administrator
        $.ajax({
            'url': '/api/user/createGlobalAdminUser',
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
     * Create a new tenant administrator with an internal login strategy
     *
     * @param  {String}         [tenantAlias]                       The alias of the tenant to create the tenant administrator on. Only needs to be provided when creating a tenant admin from the global administration tenant
     * @param  {String}         username                            The username the tenant administrator can log in with
     * @param  {String}         password                            The password for the tenant administrator
     * @param  {String}         displayName                         The display name for the tenant administrator
     * @param  {String}         email                               The email for the tenant administrator
     * @param  {Object}         [additionalOptions]                 Additional optional parameters that need to be passed in
     * @param  {String}         [additionalOptions.locale]          The tenant administrator's locale
     * @param  {String}         [additionalOptions.publicAlias]     The publically-available alias for users to see when the tenant administrator's display name is protected
     * @param  {Function}       [callback]                          Standard callback function
     * @param  {Object}         [callback.err]                      Error object containing error code and error message
     * @param  {User}           [callback.user]                     The created tenant administrator user
     * @throws {Error}                                              Error thrown when not all of the required parameters have been provided
     */
    var createTenantAdminUser = exports.createTenantAdminUser = function(tenantAlias, username, password, displayName, email, additionalOptions, callback) {
        if (!username) {
            throw new Error('A username should be provided');
        } else if (!password) {
            throw new Error('A password should be provided');
        } else if (!displayName) {
            throw new Error('A display name should be provided');
        } else if (!email) {
            throw new Error('An email address should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        additionalOptions = additionalOptions || {};

        var data = {
            'username': username,
            'password': password,
            'displayName': displayName,
            'email': email,
            'locale': additionalOptions.locale,
            'publicAlias': additionalOptions.publicAlias
        };

        var url = '/api/user/createTenantAdminUser';
        // If a tenant alias is specified we change the URL to include the tenant
        if (tenantAlias) {
            url = '/api/user/' + tenantAlias + '/createTenantAdminUser';
        }

        // Create the tenant administrator
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
     * Update a user's basic profile
     *
     * @param  {String}         userId              User id of the user for who the basic profile is being updated
     * @param  {Object}         params              Object representing the profile fields that need to be updated
     * @param  {Function}       [callback]          Standard callback function
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @param  {User}           [callback.user]     The updated user profile
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var updateUser = exports.updateUser = function(userId, params, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
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

    /**
     * Delete a user. The user will be marked as deleted but will still be accessible in the system
     * in lists such as members listings. The user can then be restored using the
     * `POST /api/user/:userId/restore` endpoint, however this functionality is not currently
     * exposed in the 3akai-ux JS API
     *
     * @param  {String}         userId              User id of the user to delete
     * @param  {Function}       [callback]          Standard callback function
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var deleteUser = exports.deleteUser = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/user/' + userId,
            'type': 'DELETE',
            'success': function() {
                callback();
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Change the password of the specified user
     *
     * @param  {String}         userId                The is of the user to change the password for
     * @param  {String}         newPassword           The user's new password
     * @param  {Function}       [callback]            Standard callback function
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @throws {Error}                                Error thrown when not all of the required parameters have been provided
     */
    var changePassword = exports.changePassword = function(userId, newPassword, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
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
            'success': function() {
                callback();
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };


    //////////////////
    // USER ACTIONS //
    //////////////////

    /**
     * Edit a specified user's privileges
     *
     * @param  {String}         userId                  The user id of the user for which the admin privileges are changed
     * @param  {Boolean}        isAdmin                 Whether or not the user should be made an admin
     * @param  {Boolean}        isGlobalAdminServer     Whether or not the user is on the global admin tenant
     * @param  {Function}       [callback]              Standard callback function
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @throws {Error}                                  Error thrown when no user id has been specified
     */
    var editPrivileges = exports.editPrivileges = function(userId, isAdmin, isGlobalAdminServer, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
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
                callback();
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Retrieve the signed authentication request info that will allow the admin user
     * to impersonate another user
     *
     * @param  {String}         userId                The id of the user to become
     * @param  {Function}       [callback]            Standard callback function
     * @param  {Object}         [callback.err]        Error object containing error code and error message
     * @throws {Error}                                Error thrown when no user id has been provided
     */
    var getSignedBecomeRequestInfo = exports.getSignedBecomeRequestInfo = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/auth/signed/become',
            'data': {
                'becomeUserId': userId
            },
            'type': 'GET',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };


    /////////////////
    // MAINTENANCE //
    /////////////////

    /**
     * Reindex the search index
     *
     * @param  {Function}       [callback]              Standard callback function
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
     * Reprocess content previews
     *
     * @param  {Object}      reprocessParameters                              Parameters that determine what content item previews need to be reprocessed
     * @param  {String[]}    [reprocessParameters.revision_mime]              An array of mimetypes to be reprocessed (e.g., `application/pdf`)
     * @param  {String[]}    [reprocessParameters.content_resourceSubType]    An array of content types to be reprocessed. Can contain `collabdoc`, `file` or `link`
     * @param  {String[]}    [reprocessParameters.revision_previewStatus]     An array of preview statuses that need to be reprocessed. Can contain `error` or `ignored`
     * @param  {Date}        [reprocessParameters.revision_createdAfter]      A date after which content previews need to be reprocessed
     * @param  {Date}        [reprocessParameters.revision_createdBefore]     A date before which content previews need to be reprocessed
     * @param  {String[]}    [reprocessParameters.revision_createdBy]         An array of user IDs for which to reprocess the content previews
     * @param  {Function}    [callback]                                       Standard callback function
     * @param  {Object}      [callback.err]                                   Error object containing error code and error message
     * @throws {Error}                                                        Error thrown when no valid content reprocessing parameters have been provided
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

});
