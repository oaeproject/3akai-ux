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

require(['jquery', 'sakai/sakai.api.core', '/shared/js/bootstrap.js'], function($, sakai) {

    //////////
    //////////
    // UTIL //
    //////////
    //////////

    /**
     * Shows a message to logged in users when they are not authorized to view a page
     */
    var showUnauthorized = function() {
        sakai.api.Util.TemplateRenderer('admin_unauthorized_template', null, $('#admin_unauthorized_container'));
    };

    /**
     * Shows an error to the user
     * usage:
     * showError({
     *     'title': 'Operation failed',
     *     'message' (required): 'The tenant could not be deleted.'
     * });
     * @param {Object}   data                        Data object used to render the warning. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Object}   $outputElement (optional)   Element to render the warning in. By default the container renders on top of the page in absolute position.
     */
    var showError = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin_error_container');
        }
        sakai.api.Util.TemplateRenderer('admin_error_template', {
            'error': data
        }, $outputElement);
    };

    /**
     * Shows a warning to the user
     * usage:
     * showWarning({
     *     'title': 'Are you sure?',
     *     'message' (required): 'Are you sure you want to delete this tenant?'
     * });
     * @param {Object}   data                        Data object used to render the warning. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Object}   $outputElement (optional)   Element to render the warning in. By default the container renders on top of the page in absolute position.
     */
    var showWarning = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin_warning_container');
        }
        sakai.api.Util.TemplateRenderer('admin_warning_template', {
            'warning': data
        }, $outputElement);
    };

    /**
     * Shows a success message to the user
     * usage:
     * showSuccess({
     *     'title': 'Tenant deleted.',
     *     'message' (required): 'The tenant was successfully deleted',
     *     'sticky': true
     * });
     * @param {Object}   data                        Data object used to render the success message. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Object}   $outputElement (optional)   Element to render the success message in. By default the container renders on top of the page in absolute position.
     */
    var showSuccess = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin_success_container');
        }
        sakai.api.Util.TemplateRenderer('admin_success_template', {
            'success': data
        }, $outputElement);
        if (!data.sticky) {
            window.setTimeout( function(){
                $outputElement.fadeOut('slow', function() {
                    $outputElement.html('');
                    $outputElement.show();
                });
            }, 2500);
        }
    };

    /**
     * Shows a confirmation dialog to the user using predefined data
     * usage
     * showConfirmationModal({
     *     'id' (required): 'deletetenant_modal',
     *     'title' (required): 'Delete tenant Cambridge University',
     *     'message' (required): 'You cannot undo this operation. Are you sure you want to delete this tenant?',
     *     'cancel': 'Cancel',
     *     'confirm' (required): 'Yes, delete tenant',
     *     'confirmclass': (optional): 'danger' (for possible values see http://twitter.github.com/bootstrap/base-css.html#buttons)
     *     'confirmed' (required): function() {
     *         // Add handling for confirmation
     *         // Hide the dialog when done (optionally show a success message)
     *         $('#deletetenant_modal').modal('hide');
     *     }
     * });
     * @param {Object} data Data object used to render the modal dialog. All required elements are shown above in 'usage' and should be provided
     */
    var showConfirmationModal = function(data) {
        var $outputElement = $('#admin_confirmation_container');
        sakai.api.Util.TemplateRenderer('admin_confirmation_template', {
            'modal': data
        }, $outputElement);
        $('#' + data.id).modal();
        $('#' + data.id + '_confirm', $('#' + data.id)).click(data.confirmed);
    };

    /**
     * Toggles containers to show or hide
     */
    var toggleContainer = function() {
        $(this).next().toggle(400);
    };

    /**
     * When logged out, the UI presents tabs with available log in strategies.
     * This function switches the view to another strategy when a tab is clicked.
     */
    var switchLoginStrategy = function() {
        var tab = $(this).attr('data-strategy');

        $('.admin_login_tab').removeClass('active');
        $(this).addClass('active');

        $('.admin_login_container').hide();
        $('#' + tab).show();
    };


    /* The following log in and log out functions will be moving to the 3akai API */

    /**
     * Logs the current user out of the admin ui
     */
    var doLogOut = function() {
        $.ajax({
            url: '/api/auth/logout',
            type: 'POST',
            success: function(data) {
                document.location.reload(true);
            }
        });
    };

    /**
     * Submits the login form to log a user into the admin ui
     */
    var doLogin = function() {
        if ($(this).hasClass('external_login')) {
            $.ajax({
                url: $(this).attr('action'),
                type: 'GET'
            });
        } else {
            $.ajax({
                url: '/api/auth/login',
                type: 'POST',
                data: {
                    'username': $('#admin_login_form_name').val(),
                    'password': $('#admin_login_form_password').val()
                },
                success: function(data) {
                    document.location.reload(true);
                }
            });
        }
        return false;
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
                        'port': $(this).attr('id'),
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
     * Renders the login view according to the available login strategies
     * @param {Object} strategies the available login strategies
     */
    var showLogin = function(adminContext, configuration) {
        sakai.api.Util.TemplateRenderer('admin_login_template', {
            'strategies': configuration['oae-authentication'],
            'context': adminContext
        }, $('#admin_login_container'));
    };

    /**
     * Switches the view when a left hand navigation link is clicked or when the page loads.
     * Defaults to the Tenant configuration page when no or an invalid hash is provided.
     * @param {String}    hash    hash as returned by `window.location.hash`
     */
    var switchView = function(hash) {
        hash = hash || '#configurationtenants';
        hash = hash.replace('#', '');
        $('#admin_views > div').hide();
        $('#admin_lhnav_container li').removeClass('active');
        $('#admin_lhnav_container li#' + hash).addClass('active');

        switch (hash) {
            case 'configurationtenants':
                $('#admin_views > #admin_tenants_container').show();
                return;
            case 'configurationmodules':
                $('#admin_views > #admin_modules_container').show();
                return;
        }

        // Default when incorrect page is specified
        switchView('#configurationtenants');
    };
    
    //////////
    //////////
    // UTIL //
    //////////
    //////////

    ///////////////////
    ///////////////////
    // CONFIGURATION //
    ///////////////////
    ///////////////////

    //////////////////////
    //// DATA STORING ////
    //////////////////////

    /**
     * Writes the configuration changes for a tenant/global to Cassandra
     */
    var writeConfig = function(form, adminContext) {
        var data = {};
        $.each($(form).context, function(index, item) {
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
     * Creates a new tenant and starts it up immediately
     * @param  {Function}  callback  A function that executes after the tenant has been created.
     */
    var createTenant = function(callback) {
        $.ajax({
            url: '/api/tenant/create',
            type: 'POST',
            data: {
                'alias': $('#createtenant_alias').val(),
                'name': $('#createtenant_name').val(),
                'host': $('#createtenant_host').val()
            },
            success: function(data) {
                if ($.isFunction(callback)) {
                    callback(data);
                }
            }
        });
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


    ///////////////////////
    //// DATA FETCHING ////
    ///////////////////////

    /**
     * Gets the configuration for the tenant (includes all module and tenant configuration)
     * @param {Function} callback Callback function executed after the request completes. Passes through the returned data
     */
    var getConfiguration = function(adminContext, callback) {
        var url = '/api/config';
        // Tenant and global servers do not need the tenantId to be specified in the URL
        // If a tenant server is accessed through the global server the tenantId needs to be specified
        if (!adminContext.tenant.isMainTenantServer) {
            url += '/' + adminContext.tenant.tenantId;
        }

        $.ajax({
            url: url,
            success: function(data) {
                if ($.isFunction(callback)) {
                    callback(data);
                }
            }
        });
    };

    /**
     * Gets the data for tenants
     * @param {Function} callback Callback function executed after the request completes. Passes through the returned data
     */
    var getTenants = function(callback) {
        $.ajax({
            url: '/api/tenants',
            success: function(data) {
                if ($.isFunction(callback)) {
                    callback(data);
                }
            }
        });
    };

    ///////////////////
    ///////////////////
    // CONFIGURATION //
    ///////////////////
    ///////////////////

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
        sakai.api.Util.TemplateRenderer('admin_header_template', {
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
            sakai.api.Util.TemplateRenderer('admin_footer_template', {
                'tenants': cachedTenants,
                'context': adminContext
            }, $('#admin_footer_container'));

            $('#admin_content').css('padding-bottom', $('#admin_footer_container').height());
        } else if (adminContext.tenant.context === 'admin') {
            getTenants(function(tenants) {
                preProcessTenants(tenants, function(tenants) {
                    cachedTenants = tenants;
                    sakai.api.Util.TemplateRenderer('admin_footer_template', {
                        'tenants': tenants,
                        'context': adminContext
                    }, $('#admin_footer_container'));

                    $('#admin_content').css('padding-bottom', $('#admin_footer_container').height());
                });
            });
        } else {
            sakai.api.Util.TemplateRenderer('admin_footer_template', {
                'tenants': [],
                'context': adminContext
            }, $('#admin_footer_container'));
        }
    };

    /**
     * Initializes the list of modules and renders them in a view
     */
    var initializeModules = function() {
        sakai.api.Util.TemplateRenderer('admin_modules_template', {
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
                    sakai.api.Util.TemplateRenderer('admin_tenants_template', {
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
                sakai.api.Util.TemplateRenderer('admin_tenants_template', {
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
        sakai.api.Util.TemplateRenderer('admin_lhnav_template', {
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
