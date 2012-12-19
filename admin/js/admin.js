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

require(['jquery', 'oae/api/oae.core', '/admin/js/admin.util.js', 'vendor/js/bootstrap', 'jquery-plugins/jquery.jeditable.sakai-edited'], function($, oae, adminUtil) {

    // Variable that will be used to keep track of current tenant
    var currentContext = null;
    // Variable that will cache the list of available tenants
    var tenants = null;
    // Variable that will cache the config schema
    var configurationSchema = null;
    // Variable that will cache the configuration for the current tenant
    var configuration = null;

    /**
     * Toggles containers to show or hide
     */
    var toggleContainer = function() {
        $(this).next().toggle(400);
    };

    /**
     * Initializes jEditable on fields throughout the UI
     * This initialization will also take care of the form submit to /api/tenant
     */
    var enableInlineEdit = function() {
        $('.jeditable_field').editable(function(value) {
            $.ajax({
                url: '/api/tenant',
                type: 'POST',
                data: {
                    'alias': $(this).attr('data-alias'),
                    'name': value
                }
            });
            return(value);
        }, {
            indicator: 'Saving...',
            tooltip: 'Click to edit name',
            id: 'port',
            name: 'name',
            callback: function(value, settings) {
                $(this).text(value);
            }
        });
    };

    /**
     * Switches the view when a left hand navigation link is clicked or when the page loads.
     * Defaults to the Tenant configuration page when no or an invalid hash is provided.
     */
    var switchView = function(hash) {
        hash = window.location.hash || '#configurationtenants';
        hash = hash.replace('#', '');
        $('#admin_views > div').hide();
        $('#admin_lhnav_container li').removeClass('active');
        $('#admin_lhnav_container li#' + hash).addClass('active');

        switch (hash) {
            case 'configurationmodules':
                $('#admin_views > #admin_modules_container').show();
                break;
            default:
                $('#admin_views > #admin_tenants_container').show();
                break;
        };
    };

    //////////////////////
    //// DATA STORING ////
    //////////////////////

    /**
     * Persists the configuration changes for a tenant/global admin
     */
    var writeConfig = function() {
        var data = {};
        var values = $form.serializeObject();

        var module = $form.attr('data-module');
        $.each(configuration[module], function(option, optionValues) {
            $.each(optionValues, function(element, elementValue) {
                // Convert the value in case it's a checkbox
                if (configurationSchema[module][option].elements[element].type === 'boolean') {
                    values[module + '/' + option + '/' + element] ? true : false;
                }
                // Check if the value has changed and overwrite
                if (elementValue !== configuration[module][option][element]) {
                    data
                }
            });
        });
        $.each($form.context, function(index, item) {
            if ($(item).attr('data-tenantId')) {
                if ($(item).attr('type') === "text") {
                    data[$(item).attr('id')] = $(item).val();
                } else if ($(item).attr('type') === "checkbox") {
                    if ($(item).is(':checked') + '' != $(item).attr('data-originalvalue')) {
                        data[$(item).attr('id')] = $(item).is(':checked');
                    }
                } else if ($(item).attr('type') === "radio") {
                    if ($(item).is(':checked')) {
                        data[$(item).attr('data-id')] = $(item).val();
                    }
                } else if ($(item).children('option').length) {
                    data[$(item).attr('id')] = $(item).val();
                }
            }
        });

        var url = '/api/config';
        // Tenant and global servers do not need the tenantId to be specified in the URL
        // If a tenant server is accessed through the global server the tenantId needs to be specified
        if (!adminContext.tenant.isMainTenantServer) {
            url += '/' + adminContext.tenant.tenantId;
        }

        if (!$.isEmptyObject(data)) {
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function() {
                    $.each(data, function(i, item){
                        $('#' + i.replace(/\//g, '\\/')).attr('data-originalvalue', item);
                    });
                    showSuccess({
                        'title': 'Configuration saved.',
                        'message': 'The configuration was successfully saved.'
                    });
                }, error: function() {
                    showError({
                        'title': 'Configuration not saved.',
                        'message': 'The configuration could not be saved successfully.'
                    });
                }
            });
        }
        return false;
    };

    /**
     * Creates a new tenant and starts it up immediately. It will re-render the list of available
     * tenants in the main content and in the footer
     * 
     * @param  {Function}  callback  A function that executes after the tenant has been created.
     */
    var createTenant = function() {
        $.ajax({
            url: '/api/tenant/create',
            type: 'POST',
            data: {
                'alias': $('#createtenant_alias').val(),
                'name': $('#createtenant_name').val(),
                'host': $('#createtenant_host').val()
            },
            success: function(data) {
                getTenants(function() {
                    initializeTenants();
                    initializeFooter();
                });
            }
        });
        return false;
    };

    /**
     * Deletes a tenant server
     * @param {Object}    tenants    Array of tenants to be deleted
     * @param {Function}  callback   Executed after the tenants have been deleted
     */
    var deleteTenant = function(tenants, callback) {
        var aliases = [];
        $.each(tenants, function(index, tenant) {
            aliases.push(tenant.alias);
        });

        $.ajax({
            url: '/api/tenant/delete',
            type: 'POST',
            data: {
                'aliases': aliases
            },
            success: function(data) {
                if ($.isFunction(callback)) {
                    callback(true);
                }
            }, error: function() {
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        });
    };

    /**
     * Starts or stops a tenant server
     * @param {Object}    tenants   Array of tenants to be started/stopped
     * @param {Boolean}   isStart   If set to true the tenants need to be started
     * @param {Function}  callback  Executed after the tenants have been started/stopped
     */
    var startStopTenant = function(tenants, isStart, callback) {
        var aliases = [];
        $.each(tenants, function(index, tenant) {
            aliases.push(tenant.alias);
        });

        var url = '/api/tenant/stop';
        if (isStart) {
            url = '/api/tenant/start';
        }

        $.ajax({
            url: url,
            type: 'POST',
            data: {
                'aliases': aliases
            },
            success: function(data) {
                if ($.isFunction(callback)) {
                    callback(true);
                }
            }, error: function() {
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        });
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

    //////////////////////
    // LOGIN AND LOGOUT //
    //////////////////////

    /**
     * Set up the log in handler
     */
    var login = function() {
        oae.api.authentication.login($('#admin_login_form_name').val(), $('#admin_login_form_password').val(), function(err) {
            if (err) {
                // TODO: Show error message
            } else {
                document.location.reload(true);
            }
        });
        return false;
    };

    /**
     * Set up the log out button
     */
    var logout = function() {
        oae.api.authentication.logout(function() {
            document.location.reload(true);
        });
    };

    ///////////////////////
    //// DATA FETCHING ////
    ///////////////////////

    /**
     * Gets the configuration schema and the configuration for the current tenant.
     * 
     * @param {Function}    callback        Standard callback function
     */
    var getConfiguration = function(callback) {
        // Get the config schema
        $.ajax({
            'url': '/api/config/schema',
            'success': function(data) {
                configurationSchema = data;

                // Get the tenant configuration values
                var url = '/api/config';
                if (currentContext.isGlobalAdminServer && currentContext.alias) {
                    url += '/' + currentContext.alias;
                }

                $.ajax({
                    url: url,
                    success: function(data) {
                        configuration = data;
                        callback();
                    }
                });
            }
        });
    };

    /**
     * Get all of the available tenants and cache them
     * 
     * @param {Function}    callback        Standard callback function
     */
    var getTenants = function(callback) {
        $.ajax({
            url: '/api/tenants',
            success: function(data) {
                tenants = data;
                callback();
            }
        });
    };

    /**
     * Determine whether or not we're current on the global admin server and whether or not we need the UI for
     * the global admin or for an admin. This will then be stored in the `currentContext` variable.
     * 
     * @param  {Function}  callback  Function to be executed after the context has been determined
     */
    var getCurrentContext = function(callback) {
        // Get information about the current tenant
        $.ajax({
            'url': '/api/tenant',
            'success': function(data) {
                currentContext = data;

                // Check if we're currently on a tenant admin on the global server
                if (window.location.pathname.split('/') > 2) {
                    var tenantAlias = window.location.pathname.split('/').pop();
                    $.extend(currentContext, tenants[tenantAlias]);
                }
                callback();
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
        // Login
        $(document).on('submit', '#admin_login_form', login);
        // Logout
        $(document).on('click', '#admin_header_user_logout', logout);
        // Toggles
        $(document).on('click', '#createtenant_toggle_button', toggleContainer);
        $(document).on('click', '.module_configuration_toggle_button', toggleContainer);
        // Create new tenant
        $(document).on('submit','#createtenant_form', createTenant);
        // Change config value
        $(document).on('submit', '.module_configuration_form', writeConfig);
        // Left hand navigation switching
        $(window).hashchange(switchView);

/*       
        $adminTenantsContainer.on('click', '.stop_tenant', stopTenantHandler);
        $adminTenantsContainer.on('click', '.stop_all_tenants', stopAllTenantsHandler);
        $adminTenantsContainer.on('click', '.start_tenant', startTenantHandler);
        $adminTenantsContainer.on('click', '.start_all_tenants', startAllTenantsHandler);
        $adminTenantsContainer.on('click', '.delete_tenant', deleteTenantHandler);
        $adminTenantsContainer.on('click', '.delete_all_tenants', deleteAllTenantsHandler);
*/
    };

    /**
     * Initializes the header and set the document title
     */
    var initializeHeader = function() {
        oae.api.util.renderTemplate($('#admin_header_template'), {'context': currentContext}, $('#admin_header_container'));

        // Set the page title
        if (currentContext.isGlobalAdminServer && !currentContext.host) {
            oae.api.util.setBrowserTitle('Global Administration');
        } else {
            oae.api.util.setBrowserTitle('Tenant Administration');
        }
    };

    /**
     * Initializes the footer that shows links to other tenants.
     */
    var initializeFooter = function() {
        oae.api.util.renderTemplate($('#admin_footer_template'), {
            'context': currentContext,
            'tenants': tenants
        }, $('#admin_footer_container'));
    };

    /**
     * Initializes the list of modules and renders them in a view
     */
    var initializeModules = function() {
        oae.api.util.renderTemplate($('#admin_modules_template'), {
            'schema': configurationSchema,
            'configuration': configuration,
            'context': currentContext
        }, $('#admin_modules_container'));
    };

    /**
     * Initializes the list of tenants and renders them in a view
     */
    var initializeTenants = function() {
        var tenantsToRender = tenants;
        // Tenant admin UI
        if (currentContext.host) {
            tenantsToRender = [tenants[currentContext.alias]];
        }
        oae.api.util.renderTemplate($('#admin_tenants_template'), {
            'tenants': tenantsToRender,
            'context': currentContext
        }, $('#admin_tenants_container'));
        enableInlineEdit();
    };

    /**
     * Initializes the left hand navigation
     */
    var initializeNavigation = function() {
        oae.api.util.renderTemplate($('#admin_lhnav_template'), {'context': currentContext}, $('#admin_lhnav_container'));
        $('#admin_lhnav_container').show();
    };

    /**
     * Initializes the admin UI
     */
    var doInit = function() {
        // Fetch the list of available tenants
        getTenants(function() {

            // Determine for which tenant we want to see the admin UI
            getCurrentContext(function() {

                // Render the header and the footer
                initializeHeader();
                initializeFooter();
    
                if (oae.data.me.anon) {
                    $('#admin_login_container').show();
                } else if (oae.data.me.isTenantAdmin || oae.data.me.isGlobalAdmin) {
                    // Get the configuration and continue rendering the page
                    getConfiguration(function() {
                        // Initialize left hand navigation
                        initializeNavigation();
                        // Initialize configurable modules
                        initializeModules();
                        // Initialize the tenants table (only 1 tenant if not on global server)
                        initializeTenants();
                        // Show requested view
                        switchView();
                    });
                } else {
                    // The user is not authorized to view the page
                    $('#admin_unauthorized_container').show();
                }
            });
        });
    };

    addBinding();
    doInit();

});
