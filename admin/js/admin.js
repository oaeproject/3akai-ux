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

require(['jquery', 'underscore', 'oae.core', '/admin/js/admin.tenants.js', '/admin/js/admin.config.js', 'jquery.history'], function($, _, oae, adminTenants, adminConfig) {

    // Variable that will be used to keep track of the current tenant
    var currentContext = null;
    // Variable that will cache the list of available tenants
    var allTenants = null;


    /////////////////
    //  NAVIGATION //
    /////////////////

    /**
     * Initializes the left hand navigation
     */
    var initializeNavigation = function() {
        oae.api.util.template().render($('#admin-lhnav-template'), {'context': currentContext}, $('#admin-lhnav-container'));
        $('#admin-lhnav-container').show();

        // Extract the currently selected view from the URL by parsing the URL fragment that's
        // inside of the current History.js hash. The expected URL structure is `...?view=<view>`.
        // It is not possible to use cleaner `/view` URLs, as the admin UI can be found at `/` and
        // `/tenant/<tenantAlias>` on the global admin server and `/admin` on the tenant servers.
        var selectedView = $.url().param().view;
        // When the page loads, the History.js state data object will either be empty (when having
        // followed a link or entering the URL directly) or will contain the previous state data when
        // refreshing the page. This is why we use the URL to determine the initial state. We want
        // to replace the initial state with all of the required state data for the requested URL so
        // we have the correct state data in all circumstances. Calling the `replaceState` function
        // will automatically trigger the statechange event, which will take care of showing the correct view.
        // However, as the page can already have the History.js state data when only doing a page refresh,
        // we need to add a random number to make sure that History.js recognizes this as a new state and
        // triggers the `statechange` event.
        var url = $.url(History.getState().hash).attr('path');
        if (selectedView) {
            url += '?view=' + selectedView;
        }
        History.replaceState({
            'view': selectedView,
            '_': Math.random()
        }, $('title').text(), url);
    };

    /**
     * Every time an item in the left hand navigation is clicked, we push a new state using
     * History.js, containing the id of the view that should be shown next.
     */
    var selectView = function() {
        // Push the state, This will trigger the statechange event, which will then
        // take care of showing of the selected view
        History.pushState({
            'view': $(this).attr('data-id')
        }, $('title').text(), $('a', $(this)).attr('href'));
        return false;
    };

    /**
     * Switches the view when a left hand navigation link is clicked or when the page loads.
     * Defaults to the Tenant configuration page when no or an invalid view querystring parameter is provided.
     */
    var switchView = function() {
        var view = History.getState().data.view || 'tenants';
        // Hide the previous view
        $('#admin-views > div').hide();
        // Select the corresponding item in the left hand navigation
        $('#admin-lhnav-container li').removeClass('active');
        $('#admin-lhnav-container li[data-id="' + view + '"]').addClass('active');
        // Show the corresponding view
        $('#admin-views > #admin-' + view + '-container').show();
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
     * Add binding to the core admin UI functionality
     */
    var addBinding = function() {
        // Logout
        $(document).on('click', '#admin-header-user-logout', logout);
        // Left hand navigation switching
        $(document).on('click', '#admin-lhnav-container ul li', selectView);
        $(window).on('statechange', switchView);
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

            // Initialize the tenants related functionality
            adminTenants.init(currentContext, allTenants);

            if (oae.data.me.anon) {
                setUpLogin();
            } else {
                // Initialize left hand navigation
                initializeNavigation();

                // Initialize the config related functionality. This will also initialize the
                // skinning functionality
                adminConfig.init(currentContext);
            }
        });
    };

    addBinding();
    initializeAdminUI();

});
