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

require(['jquery', 'underscore', 'oae.core', 'jquery.history'], function($, _, oae) {

    // Variable that will be used to keep track of the current tenant
    var currentContext = null;
    // Variable that will cache the list of available tenants
    var allTenants = null;
    // Variable that will cache the config schema
    var configurationSchema = null;
    // Variable that will cache the configuration for the current tenant
    var configuration = null;


    /////////////////
    //  NAVIGATION //
    /////////////////

    /**
     * Initializes the left hand navigation
     */
    var initializeNavigation = function() {
        // Structure that will be used to construct the left hand navigation pages
        var lhNavPages = [
            {
                'id': 'admintenants',
                'title': oae.api.i18n.translate('__MSG__TENANTS__'),
                'icon': 'icon-dashboard',
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'id': 'admintenants',
                                'settings': {
                                    'context': currentContext,
                                    'tenants': allTenants
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'adminmodules',
                'title': oae.api.i18n.translate('__MSG__MODULES__'),
                'icon': 'icon-cogs',
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'id': 'adminmodules',
                                'settings': {
                                    'configuration': configuration,
                                    'configurationSchema': configurationSchema,
                                    'context': currentContext,
                                    'tenants': allTenants
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'adminusermanagement',
                'title': oae.api.i18n.translate('__MSG__USER_MANAGEMENT__'),
                'icon': 'icon-user',
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'id': 'adminusermanagement',
                                'settings': {
                                    'context': currentContext
                                }
                            }
                        ]
                    }
                ]
            }
        ];
        if (!currentContext.isGlobalAdminServer) {
            lhNavPages.push({
                'id': 'adminskinning',
                'title': oae.api.i18n.translate('__MSG__SKINNING__'),
                'icon': 'icon-tint',
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'id': 'adminskinning',
                                'settings': {
                                    'configuration': configuration,
                                    'context': currentContext,
                                    'tenants': allTenants
                                }
                            }
                        ]
                    }
                ]
            });
        }

        var baseURL = '/';
        if (!currentContext.isGlobalAdminServer) {
            baseURL = '/tenant/' + currentContext.alias;
        }

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, null, baseURL]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, null, baseURL]);
        });
    };


    //////////////////////
    // LOGIN AND LOGOUT //
    //////////////////////

    /**
     * Show the login form and set up the login validation
     */
    var setUpLogin = function() {
        $('#admin-login-container').show();
        oae.api.util.validation().validate($('#admin-login-form'), {'submitHandler': login});
    };

    /**
     * Set up the log in handler
     */
    var login = function() {
        oae.api.authentication.localLogin($('#admin-login-form-username').val(), $('#admin-login-form-password').val(), function(err) {
            if (err) {
                // Show the error message
                oae.api.util.notification('Login failed.', 'Invalid username or password.', 'error');
            } else {
                window.location.reload(true);
            }
        });
        return false;
    };

    /**
     * Set up the log out button
     */
    var logout = function() {
        oae.api.authentication.logout(function() {
            window.location.reload(true);
        });
    };


    ////////////////////
    // INITIALIZATION //
    ////////////////////

    /**
     * Get all of the available tenants and cache them. This can only be run on the global admin tenant,
     * as there is no endpoint that allows for fetching the full list of available tenants from a user
     * tenant
     *
     * @param  {Function}    callback        Standard callback function
     */
    var getTenants = function(callback) {
        $.ajax({
            url: '/api/tenants',
            success: function(data) {
                allTenants = data;
                callback();
            }
        });
    };

    /**
     * Gets the configuration schema and the configuration for the current tenant.
     *
     * @param  {Function}    callback        Standard callback function
     */
    var loadConfiguration = function(callback) {
        // Get the config schema
        $.ajax({
            'url': '/api/config/schema',
            'success': function(data) {
                configurationSchema = data;

                // Remove the OAE UI module from the schema to avoid it being rendered
                // as a module, because skinning will be handled in a separate page
                delete configurationSchema['oae-ui'];

                // Get the tenant configuration values
                var url = '/api/config';
                if (currentContext.isTenantOnGlobalAdminServer) {
                    url += '/' + currentContext.alias;
                }

                // We explicitly cache bust this request, as the caching headers will be
                // set to cache the config feed for 15 minutes. This is done because the
                // endpoint is used on tenants by end-users, as we don't want to re-fetch the
                // config feed on every page load for every user. However, we don't want to serve
                // cached configs to the administrator in the administration UI, as that could
                // cause configuration changes not to appear immediately.
                $.ajax({
                    'url': url,
                    'cache': false,
                    'success': function(data) {
                        configuration = data;
                        callback();
                    }
                });
            }
        });
    };

    /**
     * Determine whether or not we're currently on the global admin server and whether or not we need the UI for
     * the global admin tenant or for a user tenant. This will then be stored in the `currentContext` variable.
     *
     * @param  {Function}    callback        Standard callback function
     */
    var getCurrentContext = function(callback) {
        // Get information about the current tenant
        $.ajax({
            'url': '/api/tenant',
            'success': function(data) {
                currentContext = data;

                // If we are on the global admin tenant, we load the full list of available tenants for rendering
                // the tenant view and the footer
                if (currentContext.isGlobalAdminServer) {
                    getTenants(function() {
                        // Check if we're currently on a user admin on the global admin tenant. In that
                        // case, the URL should be /tenant/<tenantAlias>
                        var tenantAlias = $.url().segment(2);
                        if (tenantAlias) {
                            currentContext = allTenants[tenantAlias];
                            currentContext.isTenantOnGlobalAdminServer = true;
                        }
                        callback();
                    });
                } else {
                    callback();
                }
            }
        });
    };

    /**
     * Initializes the header and set the document title
     */
    var initializeHeader = function() {
        oae.api.util.template().render($('#admin-header-template'), {'context': currentContext}, $('#admin-header-container'));

        // Set the page title
        if (currentContext.isGlobalAdminServer) {
            oae.api.util.setBrowserTitle('Global Administration');
        } else {
            oae.api.util.setBrowserTitle('Tenant Administration');
        }
    };

    /**
     * Initializes the footer and render the available tenants in the footer
     */
    var initializeFooter = function() {
        // Render the footer
        oae.api.util.template().render($('#admin-footer-template'), {
            'context': currentContext,
            'tenants': allTenants
        }, $('#admin-footer-container'));
    };

    /**
     * Initializes the admin UI
     */
    var initializeAdminUI = function() {
        // Redirect to the 'Access denied' page if the user is logged in
        // but not the tenant or global admin
        if (!oae.data.me.anon && (!oae.data.me.isTenantAdmin && !oae.data.me.isGlobalAdmin)) {
            return oae.api.util.redirect().accessdenied();
        }

        // Determine the tenant for which we want to see the admin UI
        getCurrentContext(function() {
            // Render the header and the footer
            initializeHeader();
            initializeFooter();

            if (oae.data.me.anon) {
                setUpLogin();
            } else {
                // We're logged in, bind the logout handler
                $(document).on('click', '#admin-header-user-logout', logout);
                // Load the configuration and configuration schema
                loadConfiguration(function() {
                    // Initialize left hand navigation
                    initializeNavigation();
                });
            }
        });
    };

    initializeAdminUI();

});
