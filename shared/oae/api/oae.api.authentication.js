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

define(['exports', 'jquery', 'oae.api.config', 'oae.api.i18n', 'oae.api.user', 'oae.api.util'], function(exports, $, configAPI, i18nAPI, userAPI, utilAPI) {

    var STRATEGY_CAS = exports.STRATEGY_CAS = 'cas';
    var STRATEGY_FACEBOOK = exports.STRATEGY_FACEBOOK = 'facebook';
    var STRATEGY_GOOGLE = exports.STRATEGY_GOOGLE = 'google';
    var STRATEGY_GOOGLE_APPS = exports.STRATEGY_GOOGLE_APPS = 'googleApps';
    var STRATEGY_LDAP = exports.STRATEGY_LDAP = 'ldap';
    var STRATEGY_LOCAL = exports.STRATEGY_LOCAL = 'local';
    var STRATEGY_SHIBBOLETH = exports.STRATEGY_SHIBBOLETH = 'shibboleth';
    var STRATEGY_TWITTER = exports.STRATEGY_TWITTER = 'twitter';

    // Classify all known authentication strategies
    var STRATEGIES_LOCAL = [STRATEGY_LOCAL, STRATEGY_LDAP];
    var STRATEGIES_EXTERNAL = [
        STRATEGY_CAS,
        STRATEGY_FACEBOOK,
        STRATEGY_GOOGLE,
        STRATEGY_GOOGLE_APPS,
        STRATEGY_SHIBBOLETH,
        STRATEGY_TWITTER
    ];
    var STRATEGIES_INSTITUTIONAL = [
        STRATEGY_CAS,
        STRATEGY_GOOGLE_APPS,
        STRATEGY_SHIBBOLETH
    ];

    /**
     * Use the known authentication strategies to determine some important characteristics about how
     * to offer a user their authentication method
     *
     * @param  {String}     [contextLabel]                                      Specifies in which context the strategy info is being requested. It's used to identify the context-specific i18n key for the strategy info. Either "SIGN_IN" or "SIGN_UP" are acceptable (Default: SIGN_IN)
     * @return {Object}     authStrategyInfo                                    Authentication strategy information
     * @return {Boolean}    authStrategyInfo.allowAccountCreation               True if users are allowed to create their own accounts. False otherwise
     * @return {Object}     authStrategyInfo.enabledExternalStrategies          All the enabled external strategies keyed by strategy id
     * @return {Object}     authStrategyInfo.enabledInstitutionalStrategies     All the enabled institutional strategies keyed by strategy id
     * @return {Object}     authStrategyInfo.enabledStrategies                  All the enabled strategies keyed by strategy id
     * @return {Boolean}    authStrategyInfo.hasExternalAuth                    True if there is at least one external (e.g., cas, shibboleth, twitter, etc...) authentication method enabled
     * @return {Boolean}    authStrategyInfo.hasInstitutionalAuth               True if there is at least one institutional (e.g., shibboleth, cas, google apps) authentication method enabled
     * @return {Boolean}    authStrategyInfo.hasLocalAuth                       True if there is at least one local (e.g., username and password, ldap) authentication method enabled
     * @return {Boolean}    authStrategyInfo.hasSingleExternalAuth              True if there is only one authentication method enabled and it is external
     * @return {Boolean}    authStrategyInfo.hasSingleInstitutionalAuth         True if there is only one authentication method enabled and it is institutional
     */
    var getStrategyInfo = exports.getStrategyInfo = function(contextLabel) {
        var enabledStrategies = getEnabledStrategies(contextLabel);
        var enabledStrategyNames = _.keys(enabledStrategies);

        var hasLocalAuth = (!_.chain(enabledStrategyNames).intersection(STRATEGIES_LOCAL).isEmpty().value());
        var hasExternalAuth = (!_.chain(enabledStrategyNames).intersection(STRATEGIES_EXTERNAL).isEmpty().value());
        var hasInstitutionalAuth = (!_.chain(enabledStrategyNames).intersection(STRATEGIES_INSTITUTIONAL).isEmpty().value());

        var hasSingleAuth = (_.size(enabledStrategyNames) === 1);
        var hasSingleExternalAuth = (hasSingleAuth && hasExternalAuth);
        var hasSingleInstitutionalAuth = (hasSingleAuth && hasInstitutionalAuth);

        return {
            'allowAccountCreation': configAPI.getValue('oae-authentication', STRATEGY_LOCAL, 'allowAccountCreation'),
            'enabledExternalStrategies': _.pick(enabledStrategies, STRATEGIES_EXTERNAL),
            'enabledInstitutionalStrategies': _.pick(enabledStrategies, STRATEGIES_INSTITUTIONAL),
            'enabledStrategies': enabledStrategies,
            'hasExternalAuth': hasExternalAuth,
            'hasInstitutionalAuth': hasInstitutionalAuth,
            'hasLocalAuth': hasLocalAuth,
            'hasSingleExternalAuth': hasSingleExternalAuth,
            'hasSingleInstitutionalAuth': hasSingleInstitutionalAuth
        };
    };

    /**
     * Get the translated strategy name given the strategy id and the `contextLabel` in which it is
     * being requested. An organization-specific name of the authentication can be configured with
     * a tenancy, and that name is taken into consideration here.
     *
     * @param  {String}     strategyId      The id of the strategy whose translated name to get
     * @param  {String}     contextLabel    The context label in which the strategy name is being requested
     * @return {String}                     The i18n translated name of this authentication strategy
     * @api private
     */
    var strategyName = function(strategyId, contextLabel) {
        var translatedName = i18nAPI.translate('__MSG__' + contextLabel + '_WITH_STRATEGY__', null, {
            'strategyName': configAPI.getValue('oae-authentication', strategyId, 'name')
        });
        return translatedName;
    };

    /**
     * Get a user's login ids
     *
     * @param  {String}     userId              The id of the user to return the login ids for
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.err        Error object containing error code and error message
     * @param  {Object}     callback.loginIds   Hash object containing the user's login ids
     * @throws {Error}                          Error thrown when not all of the required parameters have been provided
     */
    var getAuthLoginIds = exports.getAuthLoginIds = function(userId, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        $.ajax({
            'url': '/api/auth/loginIds/' + userId,
            'type': 'GET',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the list of all enabled authentication strategies for the current tenant
     *
     * @param  {String}     [contextLabel]  Specifies in which context the strategy info is being requested. Either "SIGN_IN" or "SIGN_UP" (Default: SIGN_IN)
     * @return {Object}                     List of all enabled authentication strategies for the current tenant keyed by authentication strategy id. Each enabled authentication strategy will contain a `url` property with the URL to which to POST to initiate the authentication process for that strategy and a `name` property with the custom configured name for that strategy
     */
    var getEnabledStrategies = exports.getEnabledStrategies = function(contextLabel) {
        contextLabel = contextLabel || 'SIGN_IN';

        /*!
         * Between the different context label and authentication strategy permutations, we have the
         * following possible permutations of i18n message keys for strategy name:
         *
         *  * __MSG__SIGN_IN_WITH_STRATEGY
         *  * __MSG__SIGN_IN_WITH_FACEBOOK
         *  * __MSG__SIGN_IN_WITH_GOOGLE
         *  * __MSG__SIGN_IN_WITH_TWITTER
         *  * __MSG__SIGN_UP_WITH_STRATEGY
         *  * __MSG__SIGN_UP_WITH_FACEBOOK
         *  * __MSG__SIGN_UP_WITH_GOOGLE
         *  * __MSG__SIGN_UP_WITH_TWITTER
         *
         * In the case of `__MSG__*_WITH_STRATEGY` keys, the `strategyName` method is used to
         * determine the organization-specific name for their authentication strategy to get a more
         * context-sensitive strategy name.
         */

        var enabledStrategies = {};

        // CAS authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_CAS, 'enabled')) {
            enabledStrategies[STRATEGY_CAS] = {
                'id': STRATEGY_CAS,
                'name': strategyName(STRATEGY_CAS, contextLabel),
                'url': '/api/auth/cas'
            };
        }

        // Facebook authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_FACEBOOK, 'enabled')) {
            enabledStrategies[STRATEGY_FACEBOOK] = {
                'id': STRATEGY_FACEBOOK,
                'icon': 'facebook',
                'name': i18nAPI.translate('__MSG__' + contextLabel + '_WITH_FACEBOOK__'),
                'url': '/api/auth/facebook'
            };
        }

        // Google authentication. This will only be enabled when no Google Apps domain has been configured.
        if (configAPI.getValue('oae-authentication', STRATEGY_GOOGLE, 'enabled') && !configAPI.getValue('oae-authentication', STRATEGY_GOOGLE, 'domains')) {
            enabledStrategies[STRATEGY_GOOGLE] = {
                'id': STRATEGY_GOOGLE,
                'icon': 'google-plus',
                'name': i18nAPI.translate('__MSG__' + contextLabel + '_WITH_GOOGLE__'),
                'url': '/api/auth/google'
            };
        }

        // Google Apps authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_GOOGLE, 'enabled') && configAPI.getValue('oae-authentication', STRATEGY_GOOGLE, 'domains')) {
            enabledStrategies[STRATEGY_GOOGLE_APPS] = {
                'id': STRATEGY_GOOGLE_APPS,
                'icon': 'google-plus',
                'name': i18nAPI.translate('__MSG__' + contextLabel + '_WITH_GOOGLE__'),
                'url': '/api/auth/google'
            };
        }

        // LDAP authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_LDAP, 'enabled')) {
            enabledStrategies[STRATEGY_LDAP] = {
                'id': STRATEGY_LDAP,
                'url': '/api/auth/ldap'
            };
        }

        // Shibboleth authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_SHIBBOLETH, 'enabled')) {
            enabledStrategies[STRATEGY_SHIBBOLETH] = {
                'id': STRATEGY_SHIBBOLETH,
                'name': strategyName(STRATEGY_SHIBBOLETH, contextLabel),
                'url': '/api/auth/shibboleth'
            };
        }

        // Twitter authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_TWITTER, 'enabled')) {
            enabledStrategies[STRATEGY_TWITTER] = {
                'id': STRATEGY_TWITTER,
                'icon': 'twitter',
                'name': i18nAPI.translate('__MSG__' + contextLabel + '_WITH_TWITTER__'),
                'url': '/api/auth/twitter'
            };
        }

        // Local authentication
        if (configAPI.getValue('oae-authentication', STRATEGY_LOCAL, 'enabled')) {
            enabledStrategies[STRATEGY_LOCAL] = {
                'id': STRATEGY_LOCAL,
                'url': '/api/auth/login'
            };
        }

        return enabledStrategies;
    };

    /**
     * Determine if there is a login redirect url available for the current page
     *
     * @return {String}     The login redirect url, if any
     */
    var getLoginRedirectUrl = exports.getLoginRedirectUrl = function() {
        return utilAPI.url().param('url');
    };

    /**
     * Perform a login with an external authentication strategy
     *
     * @param  {String}     strategyId              The id of the strategy with which to authenticate. It must be a strategy that is enabled in the list of `enabledExternalStrategies` from the strategy info
     * @param  {Object}     [opts]                  Optional arguments
     * @param  {String}     [opts.redirectUrl]      The redirect url to follow after authentication success
     * @param  {String}     [opts.invitationToken]  The invitation token from which the login originates, if any
     */
    var externalLogin = exports.externalLogin = function(strategyId, opts) {
        if (!strategyId) {
            throw new Error('A valid strategy id should be provided');
        }

        // Ensure we were provided an enabled external strategy
        var strategyInfo = getStrategyInfo();
        var strategy = strategyInfo.enabledExternalStrategies[strategyId];
        if (!strategy) {
            throw new Error('Strategy id must be an enabled external strategy');
        }

        opts = opts || {};

        // Use the `auth.html` `authExternalButton` macro to create a form that performs this
        // authentication
        var $template = $('<div><!--'
                          +   '<div class="hide" id="oae-auth-external">'
                          +     '${authExternalButton(strategy, opts)}'
                          +   '</div>'
                          + '--></div>');
        var form = utilAPI.template().render($template, {
            'strategy': strategyInfo.enabledExternalStrategies[strategyId],
            'opts': {
                'data': {
                    'redirectUrl': opts.redirectUrl,
                    'invitationToken': opts.invitationToken
                }
            }
        });

        // Submit the form
        $($.trim(form)).appendTo('body');
        $('#oae-auth-external').find('.btn-external-auth').click();
    };

    /**
     * Log in as an internal user using the local authentication strategy
     *
     * @param  {String}         username                Username for the user logging in
     * @param  {String}         password                The user's password
     * @param  {Function}       [callback]              Standard callback function
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @param  {User}           [callback.user]         User object representing the logged in user
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
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
     * @param  {String}         username                Username for the user logging in
     * @param  {String}         password                The user's password
     * @param  {Function}       [callback]              Standard callback function
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @param  {User}           [callback.user]         User object representing the logged in user
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
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
