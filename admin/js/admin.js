/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'sakai/sakai.api.core', '/shared/js/bootstrap.js', '/admin/js/util.js', '/admin/js/configuration.js'], function($, sakai) {

    var adminContext = {};
    var cachedTenants = [];
    var configuration = {};

    /////////////////
    //// UTILITY ////
    /////////////////


    /**
     * Preprocesses tenants retrieved form the server and sets some global variables
     * that can be used when rendering views.
     * Variables set are:
     * - tenants.info.hasTenants (true or false)  If there are tenants in the system
     * - tenants.info.allActive (true or false)   If all tenants are active or not
     * @param {Object}   tenants    The tenant data coming back from the server
     * @param {Function} callback   Executed when the tenants have been preprocessed
     */
    var preProcessTenants = function(tenants, callback) {
        var hasTenants = false;
        var allActive = true;
        $.each(tenants, function(i, tenant) {
            hasTenants = true;
            !tenant.active ? allActive = false : '';
        });

        tenants.info = {
            'hasTenants': hasTenants,
            'allActive': allActive,
            'canStopTenant': false,
            'canChangeDetails': false
        };

        // Check if the tenant can stop the server
        if (configuration['oae-tenants'] &&
            configuration['oae-tenants'].config &&
            configuration['oae-tenants'].config.options &&
            configuration['oae-tenants'].config.options['allow-tenant-stop'] &&
            configuration['oae-tenants'].config.options['allow-tenant-stop'].elements &&
            configuration['oae-tenants'].config.options['allow-tenant-stop'].elements['allow-tenant-stop-enabled']) {
                tenants.info.canStopTenant = configuration['oae-tenants'].config.options['allow-tenant-stop'].elements['allow-tenant-stop-enabled'].value;
        }

        callback(tenants);
    };

    /**
     * Starts all tenants in the system up, no exceptions, and shows a confirmation dialog.
     */
    var startAllTenantsHandler = function() {
        showConfirmationModal({
            'id': 'start_all_tenants_modal',
            'title': 'Start all tenants',
            'message': 'Are you sure you want to start ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start all tenants',
            'confirmclass': 'btn-success',
            'confirmed': function() {
                startStopTenant(cachedTenants, true, function(success) {
                    // Hide the dialog when done
                    $('#start_all_tenants_modal').modal('hide');
                    // Show a success or failure message
                    if (success) {
                        showSuccess({
                            'title': 'Tenants started.',
                            'message': 'All tenants where successfully started.'
                        });
                        initializeTenants();
                    } else {
                        showError({
                            'title': 'Tenants not started.',
                            'message': 'Not all tenants could be started'
                        });
                        initializeTenants();
                    }
                });
            }
        });
    };

    /**
     * Stops all tenants in the system, no exception, and shows a confirmation dialog.
     */
    var stopAllTenantsHandler = function() {
        showConfirmationModal({
            'id': 'stop_all_tenants_modal',
            'title': 'Stop all tenants',
            'message': 'Are you sure you want to stop ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop all tenants',
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                startStopTenant(cachedTenants, false, function(success) {
                    // Hide the dialog when done
                    $('#stop_all_tenants_modal').modal('hide');
                    // Show a success or failure message
                    if (success) {
                        showSuccess({
                            'title': 'Tenants stopped.',
                            'message': 'All tenants where successfully stopped.'
                        });
                        initializeTenants();
                    } else {
                        showError({
                            'title': 'Tenants not stopped.',
                            'message': 'Not all tenants could be stopped.'
                        });
                    }
                });
            }
        });
    };

    /**
     * Deletes all tenants and shows a confirmation message
     */
    var deleteAllTenantsHandler = function() {
        showConfirmationModal({
            'id': 'delete_all_tenants_modal',
            'title': 'Delete all tenants',
            'message': 'Are you sure you want to delete ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, delete all tenants',
            'confirmclass': 'btn-danger',
            'confirmed': function() {
                deleteTenant(cachedTenants, function(success) {
                    // Hide the dialog when done
                    $('#delete_all_tenants_modal').modal('hide');
                    // Show a success or failure message
                    if (success) {
                        showSuccess({
                            'title': 'Tenants deleted.',
                            'message': 'All tenants where successfully deleted.'
                        });
                        initializeTenants();
                    } else {
                        showError({
                            'title': 'Tenants not deleted.',
                            'message': 'Not all tenants could be deleted.'
                        });
                    }
                });
            }
        });
    };

    /**
     * Deletes a single tenant and shows a confirmation message
     */
    var deleteTenantHandler = function() {
        var tenantName = $(this).attr('data-name');
        showConfirmationModal({
            'id': 'deletetenant_modal',
            'title': 'Delete tenant ' + tenantName,
            'message': 'Are you sure you want to delete tenant ' + tenantName + '?',
            'cancel': 'Cancel',
            'confirm': 'Yes, delete ' + tenantName,
            'confirmclass': 'btn-danger',
            'confirmed': function() {
                var tenant = [{
                    'alias': $(this).attr('data-alias'),
                    'name': $(this).attr('data-name'),
                    'host': $(this).attr('data-host')
                }];
                deleteTenant(tenant, function(success) {
                    // Hide the dialog when done
                    $('#deletetenant_modal').modal('hide');
                    // Show a success or failure message
                    if (success) {
                        showSuccess({
                            'title': 'Tenant deleted.',
                            'message': 'Tenant ' + tenantName + ' was successfully deleted.'
                        });
                        initializeTenants();
                    } else {
                        showError({
                            'title': 'Tenant not deleted.',
                            'message': 'The tenant could not be deleted.'
                        });
                    }
                });
            },
            confirmdata: {
                'alias': $(this).attr('data-alias'),
                'name': $(this).attr('data-name'),
                'host': $(this).attr('data-host')
            }
        });
    };

    /**
     * Stops a single tenant and shows a confirmation message
     */
    var stopTenantHandler = function() {
        var tenantName = $(this).attr('data-name');
        showConfirmationModal({
            'id': 'stoptenant_modal',
            'title': 'Stop tenant ' + tenantName,
            'message': 'Are you sure you want to stop tenant ' + tenantName + '?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop ' + tenantName,
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                var tenant = [{
                    'alias': $(this).attr('data-alias'),
                    'name': $(this).attr('data-name'),
                    'host': $(this).attr('data-host')
                }];
                startStopTenant(tenant, false, function(success) {
                    // Hide the dialog when done
                    $('#stoptenant_modal').modal('hide');
                    // Show a success or failure message
                    if (success) {
                        showSuccess({
                            'title': 'Tenant stopped.',
                            'message': 'Tenant ' + tenantName + ' was successfully stopped.'
                        });
                        initializeTenants();
                    } else {
                        showError({
                            'title': 'Tenant not stopped.',
                            'message': 'The tenant could not be stopped.'
                        });
                    }
                });
            },
            confirmdata: {
                'alias': $(this).attr('data-alias'),
                'name': $(this).attr('data-name'),
                'host': $(this).attr('data-host')
            }
        });
    };

    /**
     * Starts a single tenant and shows a confirmation message
     */
    var startTenantHandler = function() {
        var tenantName = $(this).attr('data-name');
        showConfirmationModal({
            'id': 'starttenant_modal',
            'title': 'start tenant ' + tenantName,
            'message': 'Are you sure you want to start tenant ' + tenantName + '?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start ' + tenantName,
            'confirmclass': 'btn-success',
            'confirmed': function() {
                var tenant = [{
                    'alias': $(this).attr('data-alias'),
                    'name': $(this).attr('data-name'),
                    'host': $(this).attr('data-host')
                }]
                startStopTenant(tenant, true, function(success) {
                    // Hide the dialog when done
                    $('#starttenant_modal').modal('hide');
                    // Show a success or failure message
                    if (success) {
                        showSuccess({
                            'title': 'Tenant started.',
                            'message': 'Tenant ' + tenantName + ' was successfully started.'
                        });
                        initializeTenants();
                    } else {
                        showError({
                            'title': 'Tenant not started.',
                            'message': 'The tenant could not be started.'
                        });
                    }
                });
            },
            confirmdata: {
                'alias': $(this).attr('data-alias'),
                'name': $(this).attr('data-name'),
                'host': $(this).attr('data-host')
            }
        });
    };

    /**
     * Gets the current user's information
     * @param {Function} callback Function to be executed after the request completes.
     */
    var getMe = function(callback) {
        $.ajax({
            url: '/api/me',
            success: function(meData) {
                callback(false, meData);
            }, error: function(err) {
                callback(err);
            }
        });
    };

    /**
     * Gets more information about the current context and stores it in a variable `adminContext`
     * @param  {Object}    meData    Data returned in the `getMe` function, contains data on the current user
     * @param  {Function}  callback  Function to be executed after the request completes.
     */
    var getCtx = function(meData, callback) {
        adminContext = {
            'me': meData,
            'tenant': {}
        };

        var path = window.location.pathname.split('/');
        var url = '/api/tenant';
        var isMainTenantServer = true;

        // If path looks like `/admin/cam` POSTS the url needs to reflect that (e.g. `/api/tenant/cam`)
        if (path.length > 2) {
            url += '/' + path[2];
            isMainTenantServer = false;
        }

        $.ajax({
            url: url,
            success: function(data) {
                adminContext.tenant = {
                    'context': 'tenant',
                    'tenantId': data.alias,
                    'active': data.active,
                    'host': data.host,
                    'name': data.name || '',
                    'isMainTenantServer': isMainTenantServer
                };

                callback(adminContext);
            }
        });
    };


    ////////////////////////
    //// INITIALIZATION ////
    ////////////////////////

    /**
     * Adds binding to various elements in the admin UI
     */
    var addBinding = function() {
        var $adminTenantsContainer = $('#admin_tenants_container');
        var $adminModulesContainer = $('#admin_modules_container');
        var $adminHeaderContainer = $('#admin_header_container');
        var $adminLoginContainer = $('#admin_login_container');

        $adminHeaderContainer.on('click', '#admin_header_user_logout', doLogOut);
        $adminLoginContainer.on('submit', '#admin_login_form', doLogin);
        $adminLoginContainer.on('click', '.admin_login_tab', switchLoginStrategy);
        $adminTenantsContainer.on('click', '.createtenant_toggle_button', toggleContainer);
        $adminTenantsContainer.on('click', '#createtenant_submit_button', function() {
            createTenant(function() {
                initializeTenants(initializeFooter);
            });
        });
        $adminTenantsContainer.on('click', '.stop_tenant', stopTenantHandler);
        $adminTenantsContainer.on('click', '.stop_all_tenants', stopAllTenantsHandler);
        $adminTenantsContainer.on('click', '.start_tenant', startTenantHandler);
        $adminTenantsContainer.on('click', '.start_all_tenants', startAllTenantsHandler);
        $adminTenantsContainer.on('click', '.delete_tenant', deleteTenantHandler);
        $adminTenantsContainer.on('click', '.delete_all_tenants', deleteAllTenantsHandler);
        $adminModulesContainer.on('click', '.module_configuration_toggle_button', toggleContainer);
        $adminModulesContainer.on('submit', '.module_configuration_form', function(ev) {
            ev.preventDefault();
            writeConfig(this, adminContext);
        });
        $(window).hashchange(function() {
            switchView(window.location.hash);
        });
    };

    /**
     * Initializes the header and sets the document title
     */
    var initializeHeader = function() {
        renderTemplate('admin_header_template', {
            'context': adminContext
        }, $('#admin_header_container'));

        // Set the page title
        if (adminContext.tenant.context === 'tenant') {
            document.title = 'Tenant Administration UI - Sakai OAE';
        } else {
            document.title = 'Global Administration UI - Sakai OAE';
        }
    };

    /**
     * Initializes the footer that shows links to other tenants.
     * If the tenants have not been retrieved yet it does that first, otherwise it used the cached tenants.
     */
    var initializeFooter = function() {
        if (cachedTenants.length) {
            renderTemplate('admin_footer_template', {
                'tenants': cachedTenants,
                'context': adminContext
            }, $('#admin_footer_container'));

            $('#admin_content').css('padding-bottom', $('#admin_footer_container').height());
        } else if (adminContext.tenant.context === 'admin') {
            getTenants(function(tenants) {
                preProcessTenants(tenants, function(tenants) {
                    cachedTenants = tenants;
                    renderTemplate('admin_footer_template', {
                        'tenants': tenants,
                        'context': adminContext
                    }, $('#admin_footer_container'));

                    $('#admin_content').css('padding-bottom', $('#admin_footer_container').height());
                });
            });
        } else {
            renderTemplate('admin_footer_template', {
                'tenants': [],
                'context': adminContext
            }, $('#admin_footer_container'));
        }
    };

    /**
     * Initializes the list of modules and renders them in a view
     */
    var initializeModules = function() {
        renderTemplate('admin_modules_template', {
            'modules': configuration,
            'context': adminContext
        }, $('#admin_modules_container'));
    };

    /**
     * Initializes the list of tenants and renders them in a view
     */
    var initializeTenants = function(callback) {
        if (adminContext.tenant.tenantId === 'admin') {
            getTenants(function(tenants) {
                preProcessTenants(tenants, function(tenants) {
                    cachedTenants = tenants;
                    console.log(tenants);
                    renderTemplate('admin_tenants_template', {
                        'tenants': tenants,
                        'context': adminContext
                    }, $('#admin_tenants_container'));

                    enableInlineEdit();

                    if ($.isFunction(callback)) {
                        callback();
                    }
                });
            });
        } else {
            preProcessTenants([{
                'active': adminContext.tenant.active,
                'alias': adminContext.tenant.tenantId,
                'host': adminContext.tenant.host,
                'name': adminContext.tenant.name,
                'port': adminContext.tenant.port
            }], function(tenants) {
                renderTemplate('admin_tenants_template', {
                    'tenants': tenants,
                    'context': adminContext
                }, $('#admin_tenants_container'));

                enableInlineEdit();

                if ($.isFunction(callback)) {
                    callback();
                }
            });
        }
    };

    /**
     * Initializes the left hand navigation
     */
    var initializeNavigation = function() {
        renderTemplate('admin_lhnav_template', {
            'context': adminContext
        }, $('#admin_lhnav_container'));

        $('#admin_lhnav_container').show();
    };

    /**
     * Initializes the admin UI
     */
    var doInit = function() {
        addBinding();

        // Get the data on the current user
        getMe(function(err, meData){
            if (err) {
                return showError({
                    'title': 'Data not retrieved.',
                    'message': 'Some data cannot be retrieved at this time. Try again later.'
                });
            }

            if (meData.anon) {
                getCtx(meData, function(ctx) {
                    getConfiguration(adminContext, function(config) {
                        configuration = config;
                        // The anonymous user needs to log in
                        showLogin(adminContext, configuration);
                    });
                });
            } else if (meData.isTenantAdmin || meData.isGlobalAdmin) {
                // Get contextual data and continue rendering the page
                getCtx(meData, function(ctx) {
                    initializeNavigation();
                    // Initialize the header
                    initializeHeader();
                    // Get the configuration and continue rendering the page
                    getConfiguration(adminContext, function(config) {
                        configuration = config;
                        // Initialize configurable modules
                        initializeModules();
                        // Initialize the tenants table (only 1 tenant if not on global server)
                        initializeTenants(initializeFooter);
                        // Show requested view
                        switchView(window.location.hash);
                    });
                });
            } else {
                // The user is not authorized to view the page
                showUnauthorized();
            }
        });
    };

    doInit();

});
