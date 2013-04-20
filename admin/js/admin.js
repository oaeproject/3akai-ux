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

require(['jquery', 'underscore', 'oae.core', '/admin/js/admin.util.js', 'jquery.jeditable', 'jquery.spectrum'], function($, _, oae, adminUtil) {

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
        $('.jeditable-field').editable(function(value) {
            value = $.trim(value);
            if (!value) {
                oae.api.util.notification('Invalid tenant name', 'Please enter a tenant name.', 'error');
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
                        oae.api.util.notification('Tenant name updated', 'The tenant name has been successfully updated.');
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
     * Defaults to the Tenant configuration page when no or an invalid view querystring parameter is provided.
     */
    var switchView = function() {
        var view = History.getState().data.view || 'tenants';
        $('#admin-views > div').hide();
        $('#admin-lhnav-container li').removeClass('active');
        $('#admin-lhnav-container li[data-id="' + view + '"]').addClass('active');

        switch (view) {
            case 'modules':
                $('#admin-views > #admin-modules-container').show();
                break;
            case 'skinning':
                $('#admin-views > #admin-skinning-container').show();
                break;
            default:
                $('#admin-views > #admin-tenants-container').show();
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
                    oae.api.util.notification('Configuration saved', 'The configuration was successfully saved.');
                }, error: function() {
                    oae.api.util.notification('Configuration not saved', 'The configuration could not be saved successfully.', 'error');
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
                'alias': $.trim($('#createtenant-alias').val()),
                'name': $.trim($('#createtenant-name').val()),
                'host': $.trim($('#createtenant-host').val())
            },
            'success': function() {
                oae.api.util.notification('Tenant created', 'The new tenant "' + $('#createtenant-name').val() + '" has been successfully created.');
                reloadTenants()
            },
            'error': function(jqXHR, textStatus) {
                oae.api.util.notification('Tenant could not be created', jqXHR.responseText, 'error');
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
            'id': 'start-all-tenants-modal',
            'title': 'Start all tenants',
            'message': 'Are you sure you want to start ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start all tenants',
            'confirmclass': 'btn-success',
            'confirmed': function() {
                startTenants(_.keys(tenants), function(err) {
                    // Hide the dialog when done
                    $('#start-all-tenants-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenants not started', 'Not all tenants could be started.', 'error');
                    } else {
                        oae.api.util.notification('Tenants started', 'All tenants where successfully started.');
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
            'id': 'stop-all-tenants-modal',
            'title': 'Stop all tenants',
            'message': 'Are you sure you want to stop ALL tenants?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop all tenants',
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                stopTenants(_.keys(tenants), function(err) {
                    // Hide the dialog when done
                    $('#stop-all-tenants-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenants not stopped', 'Not all tenants could be stopped.', 'error');
                    } else {
                        oae.api.util.notification('Tenants stopped', 'All tenants where successfully stopped.');
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
            'id': 'deletetenant-modal',
            'title': 'Delete tenant "' + tenantName + '"',
            'message': 'Are you sure you want to delete tenant "' + tenantName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, delete "' + tenantName + '"',
            'confirmclass': 'btn-danger',
            'confirmed': function() {
                deleteTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#deletetenant-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenant not deleted', 'The tenant could not be deleted.', 'error');
                    } else {
                        oae.api.util.notification('Tenant deleted', 'Tenant ' + tenantName + ' was successfully deleted.');
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
            'id': 'stoptenant-modal',
            'title': 'Stop tenant "' + tenantName + '"',
            'message': 'Are you sure you want to stop tenant "' + tenantName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop "' + tenantName + '"',
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                stopTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#stoptenant-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenant not stopped', 'The tenant could not be stopped.', 'error');
                    } else {
                        oae.api.util.notification('Tenant stopped', 'Tenant ' + tenantName + ' was successfully stopped.');
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
            'id': 'starttenant-modal',
            'title': 'start tenant "' + tenantName + '"',
            'message': 'Are you sure you want to start tenant "' + tenantName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start ' + tenantName,
            'confirmclass': 'btn-success',
            'confirmed': function() {
                startTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#starttenant-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenant not started', 'The tenant could not be started.', 'error');
                    } else {
                        oae.api.util.notification('Tenant started', 'Tenant ' + tenantName + ' was successfully started.');
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
        $('#admin-login-container').show();
        oae.api.util.validation().validate($('#admin-login-form'), {'submitHandler': login});
    };

    /**
     * Set up the log in handler
     */
    var login = function() {
        oae.api.authentication.login($('#admin-login-form-name').val(), $('#admin-login-form-password').val(), function(err) {
            if (err) {
                // Show the error message
                oae.api.util.notification('Login failed', 'Invalid username or password.', 'error');
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
                oae.api.util.notification('Token error', 'Could not retrieve a token to log onto the tenant.', 'error');
            } else {
                // Fill in our hidden form and submit it. This is done because we are
                // dealing with a cross-domain request. The action should have the tenant URL.
                var $form = $('#admin-tenant-login-form');
                $form.attr('action', '//' + token.host + '/api/auth/signed');
                $('#admin-tenant-login-form-expires', $form).val(token.expires);
                $('#admin-tenant-login-form-signature', $form).val(token.signature);
                $('#admin-tenant-login-form-userid', $form).val(token.userId);
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

    //////////////
    // SKINNING //
    //////////////

    /**
     * Initialize the list of available skinning variables and their values
     */
    var initializeSkinning = function() {
        // Only show the skinning variables when we are looking at a specific tenant.
        // It is currently not desired to change skin values for the global tenant, as the
        // values wouldn't flow through to the tenants appropriately if both of them have
        // skinning values stored.
        if (currentContext.host) {
            $.ajax({
                'url': '/api/ui/skin/variables',
                'data': {
                    'tenant': currentContext.alias
                },
                'success': function(data) {
                    // The stored skin values for the current tenant can be found in the configuration
                    // object. This will be stored as a stringified JSON object, so we need to parse this first.
                    var configuredSkin = {};
                    if (configuration['oae-ui'].skin.variables) {
                        configuredSkin = JSON.parse(configuration['oae-ui'].skin.variables);
                    }

                    // For all of the values in the available skin variables, we check if the current tenant
                    // has a stored value that overrides the default value. If the tenant doesn't have a value
                    // for a variable, the default value will be used
                    $.each(data.results, function(configSectionIndex, configSection) {
                        $.each(configSection.subsections, function(configSubsectionIndex, configSubsection) {
                            $.each(configSubsection.variables, function(variableIndex, variable) {
                                variable.value = configuredSkin[variable.name] || variable.defaultValue;
                            });
                        });
                    });

                    // Render the template that lists all of the configuration sections and subsections, their variables and their values
                    oae.api.util.template().render($('#admin-skinning-template'), data, $('#admin-skinning-container'));

                    // Initialize the jQuery.spectrum color pickers
                    $('[data-type="color"]').spectrum({
                        'preferredFormat': 'rgb',
                        'showAlpha': true,
                        'showButtons': false,
                        'showInitial': true,
                        'showInput': true
                    });
                }
            });
        }
    };

    /**
     * Save the new skin values. The back-end requires us to send all of
     * the skin variables at once in a stringified JSON object.
     */
    var saveSkin = function() {
        // Serializing the form gives us all of the current values,
        // including the latest selected colors
        var values = $('#admin-skinning-form').serializeObject();
        var data = {
            'oae-ui/skin/variables': JSON.stringify(values)
        }

        // When we are on the tenant server itself, we don't have
        // to append the tenant alias to the endpoint
        var url = '/api/config';
        if (currentContext.isGlobalAdminServer) {
            url += '/' + currentContext.alias;
        }

        // Save the skin values
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function() {
                oae.api.util.notification('Skin saved', 'The skin has been successfully saved.');
            }, error: function() {
                oae.api.util.notification('Skin not saved', 'The skin could not be saved successfully.', 'error');
            }
        });
        return false;
    };

    /**
     * Revert a skin value back to its original value as defined in the
     * base less file. Therefore, this will not necessarily revert the 
     * value back to its previous value.
     */
    var revertSkinValue = function() {
        var $input = $('input', $(this).parent());
        // The original value is stored in a data attribute on the input field
        var defaultValue = $input.attr('data-defaultvalue');
        // If the variable is a color, we use the set method provided by jQuery spectrum
        if ($input.attr('data-type') === 'color') {
            $input.spectrum('set', defaultValue);
        } else {
            $input.val(defaultValue);
        }
    };

    ///////////////////
    // DATA FETCHING //
    ///////////////////

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

                // Remove the OAE UI module from the schema to avoid it being rendered
                // as a module, because skinning will be handled in a separate page.
                delete configurationSchema['oae-ui'];

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

    //////////////////////////
    // LEFT HAND NAVIGATION //
    //////////////////////////

    /**
     * Initializes the left hand navigation
     */
    var initializeNavigation = function() {
        oae.api.util.template().render($('#admin-lhnav-template'), {'context': currentContext}, $('#admin-lhnav-container'));
        $('#admin-lhnav-container').show();

        // Extract the currently selected view from the URL. We parse the URL fragment that's 
        // inside of the current History.js state. The expected URL structure is `...?view=<view>`.
        // It is not possible to use cleaner `/view` URLs, as the admin UI can be found at `/` and 
        // `/tenant/<tenantAlias>` on the global admin server and `/admin` on the tenant servers.
        var selectedView = $.url().param().view;
        // Replace the current History.js state to have the selected view. This is necessary 
        // because a newly loaded page will not contain the data object in its state. Calling the 
        // replaceState function will automatically trigger the statechange event, which will take care 
        // of showing the correct view. However, we also need to add a random number to the data object 
        // to make  sure that the statechange event is triggered after a page reload.
        History.replaceState({
            'view': selectedView,
            '_': Math.random()
        });
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
        }, null, $('a', $(this)).attr('href'));
        return false;
    };

    ////////////////////////
    //// INITIALIZATION ////
    ////////////////////////

    /**
     * Adds binding to various elements in the admin UI
     */
    var addBinding = function() {
        // Logout
        $(document).on('click', '#admin-header-user-logout', logout);
        // Toggles
        $(document).on('click', '#createtenant-toggle-button', toggleContainer);
        $(document).on('click', '.admin-module-configuration-toggle-button', toggleContainer);
        // Stop a tenant
        $(document).on('click', '.stop-tenant', stopTenantHandler);
        // Stop all tenants
        $(document).on('click', '.stop-all-tenants', stopAllTenantsHandler);
        // Start a tenant
        $(document).on('click', '.start-tenant', startTenantHandler);
        // Start all tenants
        $(document).on('click', '.start-all-tenants', startAllTenantsHandler);
        // Delete tenant
        $(document).on('click', '.delete-tenant', deleteTenantHandler);
        // Log onto a tenant.
        $(document).on('click', '.login-tenant', loginOnTenantHandler);
        // Change config value
        $(document).on('submit', '.admin-module-configuration-form', writeConfig);
        // Revert skin value
        $(document).on('click', '.admin-skinning-revert', revertSkinValue);
        // Change skin
        $(document).on('submit', '#admin-skinning-form', saveSkin);
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
        oae.api.util.template().render($('#admin-footer-template'), {
            'context': currentContext,
            'tenants': tenants
        }, $('#admin-footer-container'));
    };

    /**
     * Initializes the list of modules and renders them in a view
     */
    var initializeModules = function() {
        oae.api.util.template().render($('#admin-modules-template'), {
            'schema': configurationSchema,
            'configuration': configuration,
            'context': currentContext
        }, $('#admin-modules-container'));
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
        oae.api.util.template().render($('#admin-tenants-template'), {
            'tenants': tenantsToRender,
            'hasStoppedServer': hasStoppedServer,
            'context': currentContext
        }, $('#admin-tenants-container'));
        enableInlineEdit();
        // Set up the validation for the create tenant form
        oae.api.util.validation().validate($('#createtenant-form'), {'submitHandler': createTenant});
    };

    /**
     * Initializes the admin UI
     */
    var doInit = function() {
        // Redirect to the 'Access denied' page if the user is logged in
        // but not the tenant or global admin
        if (!oae.data.me.anon && (!oae.data.me.isTenantAdmin && !oae.data.me.isGlobalAdmin)) {
            return oae.api.util.redirect().accessdenied();
        }

        // Fetch the list of available tenants
        getTenants(function() {

            // Determine for which tenant we want to see the admin UI
            getCurrentContext(function() {

                // Render the header and the footer
                initializeHeader();
                initializeFooter();
    
                if (oae.data.me.anon) {
                    setUpLogin();
                } else {
                    // Get the configuration and continue rendering the page
                    getConfiguration(function() {
                        // Initialize left hand navigation
                        initializeNavigation();
                        // Initialize the tenants table (only 1 tenant if not on global server)
                        initializeTenants();
                        // Initialize configurable modules
                        initializeModules();
                        // Initialize the skinning UI
                        initializeSkinning();
                    });
                }
            });
        });
    };

    addBinding();
    doInit();

});
