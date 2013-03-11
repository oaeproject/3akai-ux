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

require(['jquery', 'underscore', 'oae.core', '/admin/js/admin.util.js', 'jquery.jeditable'], function($, _, oae, adminUtil) {

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
     *
     * @param  {Object}  e  The dispatched event
     *s
     */
    var toggleContainer = function(e) {
        var index = $(e.currentTarget).index();
        var container = $('#admin-modules-container');
        var module_container = $(container).children()[index + 1];
        $('#configuration-buttons-container').hide();
        $(container).find('.module-configuration-container').hide();
        $(module_container).show();
        clearConfigSearch();
    };

    /**
     * Initializes jEditable on fields throughout the UI
     * This initialization will also take care of the form submit to /api/tenant
     */
    var enableInlineEdit = function() {
        $('.jeditable-field').editable(function(value) {
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
        $('#admin-views > div').hide();
        $('#admin-lhnav-container li').removeClass('active');
        $('#admin-lhnav-container li#' + hash).addClass('active');

        switch (hash) {
            case 'configurationmodules':
                $('#admin-views > #admin-modules-container').show();
                break;
            default:
                $('#admin-views > #admin-tenants-container').show();
                break;
        };
    };

    /**
     * Toggles the view for adding a new tenant
     */

    var toggleAddTenantView = function(){
        $('.createtenant-container').slideToggle();
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
                'alias': $('#createtenant-alias').val(),
                'name': $('#createtenant-name').val(),
                'host': $('#createtenant-host').val()
            },
            'success': function() {
                adminUtil.showSuccess({
                    'title': 'Tenant created',
                    'message': 'The new tenant "' + $('#createtenant-name').val() + '" has been successfully created.'
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
        $('#admin-login-container').show();
        $('#admin-lhnav-container').hide();
        $('#admin-header-container').hide();
        oae.api.util.validation().validate($('#admin-login-form'), {'submitHandler': login});
    };

    /**
     * Set up the log in handler
     */
    var login = function() {
        oae.api.authentication.login($('#admin-login-form-name').val(), $('#admin-login-form-password').val(), function(err) {
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
    /////// TENANTS ////////
    ////////////////////////

    /**
     * When the inputfield dispatches a keyup event, the entry is used to look for corresponding tenants
     *
     * @param  {Object}     e          the dispatched event
     */

    var searchTenants = function(e) {
        var query = $(e.currentTarget).val().toString().toLowerCase();
        var rows = $('#tblTenants').find('.tenant-row');
        var no_results = $('.row-no-results');
        var img_search = $('.img-search-tenants');
        var img_clear = $('.clear-tenant-search');

        no_results.hide();
        if(query && query != "") {
            img_search.css('opacity','1');
            img_clear.fadeIn('fast');
            rows.hide();

            // Put results into array
            var results = [];
            for(var t=0; t<rows.length; t++) {
                var id = $(rows[t]).attr('id').toString().toLowerCase();
                if(id.indexOf(query) >= 0) results.push(rows[t]);
            }

            // Show results or empty message when no results
            if(results.length) for(var i=0; i<results.length; i++) $(results[i]).show();
            else no_results.show();
        }else{
            img_search.css('opacity','.5');
            img_clear.fadeOut('fast');
            rows.show();
        }
    };

    /**
     * Clears the inputfield of the tenant search
     */

    var clearTenantSearch = function() {
        $('#txtSearchTenants').val("");
        $('.img-search-tenants').css('opacity','.5');
        $('.clear-tenant-search').fadeOut('fast');
        $('#tblTenants').find('.tenant-row').show();
        $('.row-no-results').hide();
    };



    ////////////////////////
    //// CONFIGURATIONS ////
    ////////////////////////

    /**
     * When the inputfield dispatches a keyup event, the entry is used to look for corresponding tenants
     *
     * @param  {Object}     e          the dispatched event
     */

    var searchConfiguration = function(e) {
        var query = $(e.currentTarget).val().toString().toLowerCase();
        var searchlist = $('#config-searchresults');
        var buttons = $('.configuration-category-button');
        var img_search = $('.img-search-config');
        var img_clear = $('.clear-config-search');

        if(query && query != ""){
            img_search.css('opacity','1');
            img_clear.fadeIn('fast');

            // Find matching names from modules
            var module_results = [];
            for(var i=0; i<buttons.length; i++){
                if($(buttons[i]).attr('data-name').toLowerCase().indexOf(query) >= 0){
                    var obj = {};
                    obj.type = "module";
                    obj.title = $(buttons[i]).find('span.title').html();
                    obj.parent = $(buttons[i]).attr('data-name');
                    module_results.push(obj);
                }
            }

            // Find matching content in modules
            var content_results = [];
            var keys = $('.module-configuration-container').find('h4');
            $.each(keys, function(i){
                var match_string = $(keys[i]).context.innerText.replace(/\(.*?\)/gi, '' );
                if(match_string.toLowerCase().indexOf(query) >= 0){
                    var obj = {};
                    obj.type = "content";
                    obj.title = match_string;
                    obj.parent = $(keys[i]).attr('data-name');
                    obj.target = $(keys[i]).attr('data-origin');
                    content_results.push(obj);
                }
            });

            // Show/hide UI-elements
            //buttons.hide();
            searchlist.html('').show();

            // Fill and display the resultlist
            if(module_results.length || content_results.length){

                // Results from module names
                if(module_results.length){
                    for(var i=0; i<module_results.length; i++){
                        searchlist.append('<li><a href="#" data-type="' + module_results[i].type + '" data-name="' + module_results[i].parent + '">'+ module_results[i].title +'</a></li>');
                        $(module_results[i]).show();
                    }
                }

                // Show spacer between results if necessary
                if(module_results.length && content_results.length){
                    searchlist.append('<li class="spacer"><span></span></li>');
                }

                // Results from module content
                if(content_results.length){
                    for(var i=0; i<content_results.length; i++){
                        searchlist.append('<li><a href="#" data-type="' + content_results[i].type + '" data-name="' + content_results[i].parent + '" data-origin="' + content_results[i].target + '">' + content_results[i].title + '</a></li>');
                    }
                }

            }else{
                searchlist.append('<li class="no-results">no results</li>');
            }
        }else{
            //buttons.show();
            searchlist.hide();
            img_clear.fadeOut('fast');
            img_search.css('opacity','.5');
        }
    };

    /**
     * Shows the according container when clicking on the searchresultslist.
     *
     * @param e             the event
     * @return {Boolean}    stops the natural event when clicking on 'a'
     */

    var showResultsFromResultsList = function(e) {
        clearConfigSearch();
        showModuleContainer($(e.currentTarget).attr('data-name'));
        if($(e.currentTarget).attr('data-type') === "content"){
            var origin = $(e.currentTarget).attr('data-origin');
            var target = $('h4[data-origin="' + origin + '"]');
            $(target).parent('div').addClass('highlight');
            setTimeout(function(){$(target).parent('div').removeClass('highlight');},4000);
        }
        return false;
    };

    /**
     *
     * @param target     The container that needs to be displayed
     */

    var showModuleContainer = function(target){
        clearConfigSearch();
        $('#configuration-buttons-container').hide();
        $('.module-configuration-container').hide();
        var container = "#" + target + "-container";
        $(container).show();
    };

    /**
     * Clears the inputfield of the config search
     */

    var clearConfigSearch = function() {
        $('#txtSearchConfigurations').val("");
        $('.configuration-category-button').fadeIn('fast');
        $('.img-search-config').css('opacity','.5');
        $('.clear-config-search').fadeOut('fast');
        $('#config-searchresults').hide();
    };


    /**
     * Navigation within the configurationpanel
     */

    var showConfigurationButtons = function(e) {
        switch($(e.currentTarget).attr('href')){
            case '#configurationmodules':
                $('#configuration-buttons-container').show();
                $('#admin-modules-container').find('.module-configuration-container').hide();
                break;
        }
        return false;
    };

    /**
     * Triggers the "file" element in the hidden form
     */

    var triggerUploadSettings = function() {
        $('#config-settings-upload-form-file').trigger('click', function(){

            // TODO: Do something with the json.file :)

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
        $(document).on('click', '#admin-header-dropdown-logout', logout);
        // Toggles
        $(document).on('click', '#createtenant-toggle-button', toggleAddTenantView);
        $(document).on('click', '#createtenant-submit-button', createTenant);
        $(document).on('click', '.configuration-category-button', toggleContainer);
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
        // Search tenants
        $(document).on('keyup', '#txtSearchTenants', searchTenants);
        $(document).on('click', '.clear-tenant-search', clearTenantSearch);
        // Upload settings
        $(document).on('click', '#upload-settings-button', triggerUploadSettings);
        // Search configuration
        $(document).on('keyup', '#txtSearchConfigurations', searchConfiguration);
        $(document).on('click', '.clear-config-search', clearConfigSearch);
        $(document).on('click', '.searchresultslist a', showResultsFromResultsList);
        // Configuration navigation
        $(document).on('click', '.crumbs > a', showConfigurationButtons);
        // Left hand navigation switching
        $(window).hashchange(switchView);
    };

    /**
     * Initializes the header and set the document title
     */
    var initializeHeader = function() {
        oae.api.util.renderTemplate($('#admin-header-template'), {'context': currentContext}, $('#admin-header-container'));

        // Set the page title
        if (currentContext.isGlobalAdminServer && !currentContext.host) {
            oae.api.util.setBrowserTitle('Global Administration');
        } else {
            oae.api.util.setBrowserTitle('Tenant Administration');
        }
    };


     /**
     * Initializes the list of modules and renders them in a view
     */
    var initializeModules = function() {
        oae.api.util.renderTemplate($('#admin-modules-template'), {
            'schema': configurationSchema,
            'configuration': configuration,
            'context': currentContext
        }, $('#admin-modules-container'));
        $('#configuration-buttons-container').show();
        $('.module-configuration-container').hide();
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
        oae.api.util.renderTemplate($('#admin-tenants-template'), {
            'tenants': tenantsToRender,
            'hasStoppedServer': hasStoppedServer,
            'context': currentContext
        }, $('#admin-tenants-container'));
        enableInlineEdit();
        // Set up the validation for the create tenant form
        oae.api.util.validation().validate($('#createtenant-form'), {'submitHandler': createTenant});
    };

    /**
     * Initializes the left hand navigation
     */
    var initializeNavigation = function() {
        var container = $('#admin-lhnav-container');
        oae.api.util.renderTemplate($('#admin-lhnav-template'), {'context': currentContext}, container);
        container.show();
    };

    /**
     * Initializes the dropdown on top
     */
    var initializeDropDown = function() {
        $('#admin-header-user').css('display','block').on('click', function() {
            $('#admin-header-dropdown').find('.list-items').slideToggle('fast');
        }).find('span').attr('unselectable','on');
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

                if (oae.data.me.anon) {
                    setUpLogin();
                } else if (oae.data.me.isTenantAdmin || oae.data.me.isGlobalAdmin) {
                    // Get the configuration and continue rendering the page
                    getConfiguration(function() {
                        // Initialize left hand navigation
                        initializeNavigation();
                        // Initialize the dropdown menu
                        initializeDropDown();
                        // Initialize configurable modules
                        initializeModules();
                        // Initialize the tenants table (only 1 tenant if not on global server)
                        initializeTenants();
                        // Show requested view
                        switchView();
                    });
                } else {
                    // The user is not authorized to view the page
                    $('#admin-unauthorized-container').show();
                }
            });
        });
    };

    addBinding();
    doInit();

});
