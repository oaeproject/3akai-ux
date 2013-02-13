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

require(['jquery', 'underscore', 'oae.core', '/admin/js/admin.util.js', 'bootstrap', 'jquery.jeditable'], function($, _, oae, adminUtil) {

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
            if (!value) {
                adminUtil.showError({
                    'title': 'Invalid tenant name',
                    'message': 'Please enter a tenant name.'
                });
                return this.revert;
            } else {
                $.ajax({
                    'url': '/api/tenant',
                    'type': 'POST',
                    'data': {
                        'alias': $(this).attr('data-alias'),
                        'name': value
                    },
                    'success': function() {
                        adminUtil.showSuccess({
                            'title': 'Tenant name updated',
                            'message': 'The tenant name has been successfully updated.'
                        });
                    }
                });
                return value;
            }
        }, {
            'tooltip': 'Click to edit name'
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
        // Get the filled out values from the form
        var $form = $(this);
        var values = $form.serializeObject();

        var data = {};
        var module = $form.attr('data-module');
        // Run over all the old config values to check which ones have been modified
        $.each(configuration[module], function(option, optionValues) {
            $.each(optionValues, function(element, elementValue) {
                // Convert the value in case it's a checkbox
                var configPath = module + '/' + option + '/' + element;
                if (configurationSchema[module][option].elements[element].type === 'boolean') {
                    values[configPath] = values[configPath] ? true : false;
                }
                // Check if the value has changed and overwrite if it has
                if (values[configPath] !== elementValue) {
                    data[configPath] = values[configPath];
                    configuration[module][option][element] = values[configPath];
                }
            });
        });

        var url = '/api/config';
        // Tenant and global servers do not need the tenantId to be specified in the URL
        // If a tenant server is accessed through the global server the tenantId needs to be specified
        if (currentContext.isGlobalAdminServer && currentContext.host) {
            url += '/' + currentContext.alias;
        }

        // Only update when a change has actually been made
        if (!$.isEmptyObject(data)) {
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function() {
                    adminUtil.showSuccess({
                        'title': 'Configuration saved',
                        'message': 'The configuration was successfully saved.'
                    });
                }, error: function() {
                    adminUtil.showError({
                        'title': 'Configuration not saved',
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
            'url': '/api/tenant/create',
            'type': 'POST',
            'data': {
                'alias': $('#createtenant_alias').val(),
                'name': $('#createtenant_name').val(),
                'host': $('#createtenant_host').val()
            },
            'success': function() {
                adminUtil.showSuccess({
                    'title': 'Tenant created',
                    'message': 'The new tenant "' + $('#createtenant_name').val() + '" has been successfully created.'
                });
                reloadTenants()
            },
            'error': function(jqXHR, textStatus) {
                adminUtil.showError({
                    'title': 'Tenant could not be created',
                    'message': jqXHR.responseText
                });
            }
        });
        return false;
    };

    /**
     * Deletes one or more tenant servers
     * 
     * @param {String[]}    tenants       Array of tenant aliases that need to be deleted
     * @param {Function}    callback      Standard callback function
     * @param {Object}      callback.err  Error object containing error code and message
     */
    var deleteTenants = function(tenants, callback) {
        $.ajax({
            'url': '/api/tenant/delete',
            'type': 'POST',
            'data': {'aliases': tenants},
            'success': function(data) {
                reloadTenants();
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Starts one or more tenant servers
     * 
     * @param {String[]}    tenants       Array of tenant aliases that need to be started
     * @param {Function}    callback      Standard callback function
     * @param {Object}      callback.err  Error object containing error code and message
     */
    var startTenants = function(tenants, callback) {
        $.ajax({
            'url': '/api/tenant/start',
            'type': 'POST',
            'data': {'aliases': tenants},
            'success': function(data) {
                reloadTenants();
                callback(null);
            }, 
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Stops one or more tenant servers
     * 
     * @param {String[]}    tenants       Array of tenant aliases that need to be stopped
     * @param {Function}    callback      Standard callback function
     * @param {Object}      callback.err  Error object containing error code and message
     */
    var stopTenants = function(tenants, callback) {
        $.ajax({
            'url': '/api/tenant/stop',
            'type': 'POST',
            'data': {'aliases': tenants},
            'success': function(data) {
                reloadTenants();
                callback(null);
            }, 
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Starts all tenants in the system up, no exceptions, and shows a confirmation dialog.
     */
    var startAllTenantsHandler = function() {
        adminUtil.showConfirmationModal({
            'id': 'start_all_tenants_modal',
            'title': 'Start all tenants',
            'message': 'Are you sure you want to start ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start all tenants',
            'confirmclass': 'btn-success',
            'confirmed': function() {
                startTenants(_.keys(tenants), function(err) {
                    // Hide the dialog when done
                    $('#start_all_tenants_modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        adminUtil.showError({
                            'title': 'Tenants not started',
                            'message': 'Not all tenants could be started.'
                        });
                    } else {
                        adminUtil.showSuccess({
                            'title': 'Tenants started',
                            'message': 'All tenants where successfully started.'
                        });
                    }
                });
            }
        });
    };

    /**
     * Stops all tenants in the system, no exception, and shows a confirmation dialog.
     */
    var stopAllTenantsHandler = function() {
        adminUtil.showConfirmationModal({
            'id': 'stop_all_tenants_modal',
            'title': 'Stop all tenants',
            'message': 'Are you sure you want to stop ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop all tenants',
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                stopTenants(_.keys(tenants), function(err) {
                    // Hide the dialog when done
                    $('#stop_all_tenants_modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        adminUtil.showError({
                            'title': 'Tenants not stopped',
                            'message': 'Not all tenants could be stopped.'
                        });
                    } else {
                        adminUtil.showSuccess({
                            'title': 'Tenants stopped',
                            'message': 'All tenants where successfully stopped.'
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
        var tenantAlias = $(this).attr('data-alias');
        adminUtil.showConfirmationModal({
            'id': 'deletetenant_modal',
            'title': 'Delete tenant "' + tenantName + '"',
            'message': 'Are you sure you want to delete tenant "' + tenantName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, delete "' + tenantName + '"',
            'confirmclass': 'btn-danger',
            'confirmed': function() {
                deleteTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#deletetenant_modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        adminUtil.showError({
                            'title': 'Tenant not deleted',
                            'message': 'The tenant could not be deleted.'
                        });
                    } else {
                        adminUtil.showSuccess({
                            'title': 'Tenant deleted',
                            'message': 'Tenant ' + tenantName + ' was successfully deleted.'
                        });
                    }
                });
            }
        });
    };

    /**
     * Stops a single tenant and shows a confirmation message
     */
    var stopTenantHandler = function() {
        var tenantName = $(this).attr('data-name');
        var tenantAlias = $(this).attr('data-alias');
        adminUtil.showConfirmationModal({
            'id': 'stoptenant_modal',
            'title': 'Stop tenant "' + tenantName + '"',
            'message': 'Are you sure you want to stop tenant "' + tenantName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop "' + tenantName + '"',
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                stopTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#stoptenant_modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        adminUtil.showError({
                            'title': 'Tenant not stopped',
                            'message': 'The tenant could not be stopped.'
                        });
                    } else {
                        adminUtil.showSuccess({
                            'title': 'Tenant stopped',
                            'message': 'Tenant ' + tenantName + ' was successfully stopped.'
                        });
                    }
                });
            }
        });
    };

    /**
     * Starts a single tenant and shows a confirmation message
     */
    var startTenantHandler = function() {
        var tenantName = $(this).attr('data-name');
        var tenantAlias = $(this).attr('data-alias');
        adminUtil.showConfirmationModal({
            'id': 'starttenant_modal',
            'title': 'start tenant "' + tenantName + '"',
            'message': 'Are you sure you want to start tenant "' + tenantName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start ' + tenantName,
            'confirmclass': 'btn-success',
            'confirmed': function() {
                startTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#starttenant_modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        adminUtil.showError({
                            'title': 'Tenant not started',
                            'message': 'The tenant could not be started.'
                        });
                    } else {
                        adminUtil.showSuccess({
                            'title': 'Tenant started',
                            'message': 'Tenant ' + tenantName + ' was successfully started.'
                        });
                    }
                });
            }
        });
    };

    //////////////////////
    // LOGIN AND LOGOUT //
    //////////////////////

    /**
     * Show the login form and set up the login validation
     */
    var setUpLogin = function() {
        $('#admin_login_container').show();
        adminUtil.setUpValidation($('#admin_login_form'), login);
    };

    /**
     * Set up the log in handler
     */
    var login = function() {
        oae.api.authentication.login($('#admin_login_form_name').val(), $('#admin_login_form_password').val(), function(err) {
            if (err) {
                // Show the error message
                adminUtil.showError({
                    'title': 'Login failed',
                    'message': 'Invalid username or password.'
                });
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

    /**
     * As a global admin, log onto a tenant. If successful, the user will be redirected 
     * to the tenant where he should be logged in. If we were unable to retrieve a login 
     * token, a notification will be shown.
     */
    var loginOnTenantHandler = function() {
        var tenantAlias = $(this).attr('data-alias');
        getToken(tenantAlias, function(err, token) {
            if (err) {
                adminUtil.showError({
                    'title': 'Token error',
                    'message': 'Could not retrieve a token to log onto the tenant.'
                });
            } else {;
                // Fill in our hidden form and submit it. This is done because we are
                // dealing with a cross-domain request. The action should have the tenant URL.
                var $form = $('#admin_tenant_login_form');
                $form.attr('action', '//' + token.host + '/api/auth/signed');
                $('#admin_tenant_login_form_expires', $form).val(token.expires);
                $('#admin_tenant_login_form_signature', $form).val(token.signature);
                $('#admin_tenant_login_form_userid', $form).val(token.userId);
                $form.submit();
            }
        });
    };

    /**
     * Retrieves a signed token that can be used to log onto a tenant.
     *
     * @param  {String}     tenant          The tenant alias to log onto.
     * @param  {Function}   callback        Function to be executed after the context has been determined
     * @param  {Object}     callback.err    Standard error object
     * @param  {Object}     callback.token  A token that can be used to log onto the specified tenant.
     */
    var getToken = function(tenantAlias, callback) {
        $.ajax({
            'url': '/api/auth/signed',
            'data': {
                'tenant': tenantAlias
            },
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    ///////////////////////
    //// DATA FETCHING ////
    ///////////////////////

    /**
     * Reload the list of available tenants and re-render the footer
     * and tenant list
     */
    var reloadTenants = function() {
        getTenants(function() {
            initializeTenants();
            initializeFooter();
        });
    };

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

                // Check if we're currently on a tenant admin on the global server. In that
                // case, the URL should /tenant/<tenantAlias>
                if (window.location.pathname.split('/').length === 3) {
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
        // Logout
        $(document).on('click', '#admin_header_user_logout', logout);
        // Toggles
        $(document).on('click', '#createtenant_toggle_button', toggleContainer);
        $(document).on('click', '.module_configuration_toggle_button', toggleContainer);
        // Stop a tenant
        $(document).on('click', '.stop_tenant', stopTenantHandler);
        // Stop all tenants
        $(document).on('click', '.stop_all_tenants', stopAllTenantsHandler);
        // Start a tenant
        $(document).on('click', '.start_tenant', startTenantHandler);
        // Start all tenants
        $(document).on('click', '.start_all_tenants', startAllTenantsHandler);
        // Delete tenant
        $(document).on('click', '.delete_tenant', deleteTenantHandler);
        // Log onto a tenant.
        $(document).on('click', '.login_tenant', loginOnTenantHandler);
        // Change config value
        $(document).on('submit', '.module_configuration_form', writeConfig);
        // Left hand navigation switching
        $(window).hashchange(switchView);
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
        // Determine whether or not there is at least 
        var hasStoppedServer = _.find(tenants, function(tenant) { 
            return !tenant.active; 
        });
        oae.api.util.renderTemplate($('#admin_tenants_template'), {
            'tenants': tenantsToRender,
            'hasStoppedServer': hasStoppedServer,
            'context': currentContext
        }, $('#admin_tenants_container'));
        enableInlineEdit();
        // Set up the validation for the create tenant form
        adminUtil.setUpValidation($('#createtenant_form'), createTenant);
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
                    setUpLogin();
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
