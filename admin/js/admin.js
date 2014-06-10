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
    // Variable that will cache the configuration schema
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
        var lhNavPages = null;
        if (oae.data.me.anon) {
            lhNavPages = [{
                'id': 'adminlogin',
                'title': oae.api.i18n.translate('__MSG__SIGN_IN__'),
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'adminlogin'
                            }
                        ]
                    }
                ]
            }];
        } else {
            lhNavPages = [
                {
                    'id': 'tenants',
                    'icon': 'icon-dashboard',
                    'closeNav': true,
                    'title': currentContext.isGlobalAdminServer ? oae.api.i18n.translate('__MSG__TENANTS__') : oae.api.i18n.translate('__MSG__TENANT__'),
                    'layout': [
                        {
                            'width': 'col-md-12',
                            'widgets': [
                                {
                                    'name': 'tenants',
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
                    'id': 'modules',
                    'icon': 'icon-cogs',
                    'closeNav': true,
                    'title': oae.api.i18n.translate('__MSG__MODULES__'),
                    'layout': [
                        {
                            'width': 'col-md-12',
                            'widgets': [
                                {
                                    'name': 'modules',
                                    'settings': {
                                        'configuration': configuration,
                                        'configurationSchema': configurationSchema,
                                        'context': currentContext
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    'id': 'usermanagement',
                    'icon': 'icon-user',
                    'closeNav': true,
                    'title': oae.api.i18n.translate('__MSG__USER_MANAGEMENT__'),
                    'layout': [
                        {
                            'width': 'col-md-12',
                            'widgets': [
                                {
                                    'name': 'usermanagement',
                                    'settings': {
                                        'context': currentContext
                                    }
                                }
                            ]
                        }
                    ]
                }
            ];

            // Only expose the maintenance functionality when the admin is looking at the global admin
            // tenant. The maintenance functionality impacts system wide resources and is not implemented
            // for individual tenants.
            if (currentContext.isGlobalAdminServer) {
                lhNavPages.push({
                    'id': 'maintenance',
                    'icon': 'icon-wrench',
                    'closeNav': true,
                    'title': oae.api.i18n.translate('__MSG__MAINTENANCE__'),
                    'layout': [
                        {
                            'width': 'col-md-12',
                            'widgets': [
                                {
                                    'name': 'maintenance'
                                }
                            ]
                        }
                    ]
                });
            // Only expose the skinning functionality when the admin is looking at an individual tenant.
            // The global tenant does not require skinning as the values wouldn't flow through
            // to the tenants appropriately if both of them have skinning values stored.
            } else {
                lhNavPages.push({
                    'id': 'skinning',
                    'icon': 'icon-tint',
                    'closeNav': true,
                    'title': oae.api.i18n.translate('__MSG__SKINNING__'),
                    'layout': [
                        {
                            'width': 'col-md-12',
                            'widgets': [
                                {
                                    'name': 'skinning',
                                    'settings': {
                                        'configuration': configuration,
                                        'context': currentContext
                                    }
                                }
                            ]
                        }
                    ]
                });
            }
        }

        var baseURL = '/';
        // Individual tenant on the global admininstration UI
        if (currentContext.isTenantOnGlobalAdminServer) {
            baseURL = '/tenant/' + currentContext.alias;
        // Administration UI on a user tenant
        } else if (!currentContext.isGlobalAdminServer) {
            baseURL = '/admin';
        }

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, null, baseURL]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, null, baseURL]);
        });
    };


    ////////////////////
    // INITIALIZATION //
    ////////////////////

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
     * Get the configuration schema and the configuration for the current tenant.
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
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (regular or global tenant). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, {
                    'currentContext': currentContext
                });
            } else {
                $(document).trigger('oae.context.send', {
                    'currentContext': currentContext
                });
            }
        });
        $(document).trigger('oae.context.send', {
            'currentContext': currentContext
        });
    };

    /**
     * Initialize the admin UI
     */
    var initializeAdminUI = function() {
        // Redirect to the 'Access denied' page if the user is logged in
        // but not the tenant or global admin
        if (!oae.data.me.anon && (!oae.data.me.isTenantAdmin && !oae.data.me.isGlobalAdmin)) {
            return oae.api.util.redirect().accessdenied();
        }

        // Determine the tenant for which we want to see the admin UI
        getCurrentContext(function() {
            // Set up the context event
            setUpContext();

            if (!oae.data.me.anon) {
                // Load the configuration and configuration schema
                // and set up the navigation
                loadConfiguration(initializeNavigation);
            } else {
                // Set up the navigation
                initializeNavigation();
            }
        });
    };

    initializeAdminUI();

});
