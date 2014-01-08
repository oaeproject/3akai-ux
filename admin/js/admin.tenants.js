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

define(['exports', 'jquery', 'underscore', 'oae.core', '/admin/js/admin.util.js', 'jquery.jeditable'], function(exports, $, _, oae, adminUtil) {

    // Variable that will be used to keep track of the current tenant
    var currentContext = null;
    // Variable that will cache the list of available tenants
    var allTenants = null;
    // Regex used to validate a URL. jQuery validate can't be used in combination with jEditable, so this regex has to be copied in here
    var urlRegex = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

    /**
     * Initialize the tenant related functionality
     *
     * @param  {Tenant}    currentContext        The tenant for which the admin UI is displaying
     * @param  {Object}    [allTenants]          Object representing all available tenants. This will only be passed in when using the admin UI on the global admin tenant
     */
    var init = exports.init = function(_currentContext, _allTenants) {
        currentContext = _currentContext;
        allTenants = _allTenants;

        addBinding();
        renderTenants();
    };

    /**
     * Renders the list of tenants in both the overview and footer
     */
    var renderTenants = function() {
        // If we're on the global admin server, we can render all the tenants.
        // Otherwise we only render the current tenant.
        var tenantsToRender = currentContext.isGlobalAdminServer ? allTenants : [currentContext];

        // Determine whether or not there is at least one tenant server that has been
        // stopped. When that's the case, the 'Start all' button will be shown instead
        // of the 'Stop all' button.
        var hasStoppedServer = _.find(allTenants, function(tenant) {
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

        // Render the footer
        oae.api.util.template().render($('#admin-footer-template'), {
            'context': currentContext,
            'tenants': allTenants
        }, $('#admin-footer-container'));
    };

    /**
     * Check if a host name is valid using the jquery.validate URL regex
     *
     * @param  {String}    value    The string to be validated
     * @return {Boolean}            Whether or not the provided value is a valid host name
     */
    var checkValidHostname = function(value) {
        return urlRegex.test('http://' + value);
    };

    /**
     * Initializes jEditable fields in the tenant overview
     */
    var enableInlineEdit = function() {
        $('.jeditable-field').editable(function(value) {
            value = $.trim(value);
            var $inlineEdit = $(this);
            // Check which field is being updated
            var field = $inlineEdit.attr('data-field');
            // If no value has been provided, an error message is shown and the field is reset
            if (!value) {
                if (field === 'displayName') {
                    oae.api.util.notification('Invalid tenant name.', 'Please enter a tenant name.', 'error');
                } else if (field === 'host') {
                    oae.api.util.notification('Invalid host name.', 'Please enter a host name.', 'error');
                }
                return this.revert;
            } else if (field === 'host' && !checkValidHostname(value)) {
                oae.api.util.notification('Invalid host name.', 'Please enter a valid host name.', 'error');
                return this.revert;
            } else {
                updateTenant($inlineEdit.attr('data-alias'), field, value);
                // Update the link to the tenant's landing page
                $('a', $inlineEdit.parent().prev()).attr('href', '//' + value);
                return value;
            }
        }, {
            'tooltip': 'Click to edit name',
            'select' : true
        });
    };

    /**
     * Creates a new tenant and starts it up immediately. It will re-render the list of available
     * tenants in the main tenant view and in the footer
     */
    var createTenant = function() {
        $.ajax({
            'url': '/api/tenant/create',
            'type': 'POST',
            'data': {
                'alias': $.trim($('#createtenant-alias').val()),
                'displayName': $.trim($('#createtenant-displayName').val()),
                'host': $.trim($('#createtenant-host').val())
            },
            'success': function(tenant) {
                oae.api.util.notification('Tenant created.', 'The new tenant "' + tenant.displayName + '" has been successfully created.');
                // Add the created tenant to the list of available tenants
                allTenants[tenant.alias] = tenant;
                renderTenants();
            },
            'error': function(jqXHR, textStatus) {
                oae.api.util.notification('Tenant could not be created.', jqXHR.responseText, 'error');
            }
        });
        return false;
    };

    /**
     * Update a tenant's display name or host
     *
     * @param  {String}     tenantAlias         Alias for the tenant that needs to be updated
     * @param  {String}     field               The name of the tenant metadata field that needs to be updated. Accepted values are `displayName` and `host`
     * @param  {String}     value               The value the provided metadata field needs to be updated to
     */
    var updateTenant = function(tenantAlias, field, value) {
        // If we're making the change from the global admin tenant, the tenant alias
        // needs to be incorporated into the URL
        var url = '/api/tenant';
        if (currentContext.isGlobalAdminServer || currentContext.isTenantOnGlobalAdminServer) {
            url += '/' + tenantAlias;
        }

        // Post the update
        var data = {};
        data[field] = value;

        $.ajax({
            'url': url,
            'type': 'POST',
            'data': data,
            'success': function() {
                if (field === 'displayName') {
                    oae.api.util.notification('Tenant name updated.', 'The tenant name has been successfully updated.');
                } else if (field === 'host') {
                    oae.api.util.notification('Tenant host updated.', 'The tenant host has been successfully updated.');
                }
            }
        });
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
                // Remove the deleted tenant from the list of available tenants
                $.each(tenants, function(index, alias) {
                    delete allTenants[alias];
                });
                renderTenants();
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
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
                // Flag the provided tenants as started in the list of available tenants
                $.each(tenants, function(index, alias) {
                    allTenants[alias].active = true;
                });
                renderTenants();
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
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
                // Flag the provided tenants as stopped in the list of available tenants
                $.each(tenants, function(index, alias) {
                    allTenants[alias].active = false;
                });
                renderTenants();
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
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
                startTenants(_.keys(allTenants), function(err) {
                    // Hide the dialog when done
                    $('#start-all-tenants-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenants not started.', 'Not all tenants could be started.', 'error');
                    } else {
                        oae.api.util.notification('Tenants started.', 'All tenants where successfully started.');
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
                stopTenants(_.keys(allTenants), function(err) {
                    // Hide the dialog when done
                    $('#stop-all-tenants-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenants not stopped.', 'Not all tenants could be stopped.', 'error');
                    } else {
                        oae.api.util.notification('Tenants stopped.', 'All tenants where successfully stopped.');
                    }
                });
            }
        });
    };

    /**
     * Deletes a single tenant and shows a confirmation message
     */
    var deleteTenantHandler = function() {
        var tenantDisplayName = $(this).attr('data-displayName');
        var tenantAlias = $(this).attr('data-alias');
        adminUtil.showConfirmationModal({
            'id': 'deletetenant-modal',
            'title': 'Delete tenant "' + tenantDisplayName + '"',
            'message': 'Are you sure you want to delete tenant "' + tenantDisplayName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, delete "' + tenantDisplayName + '"',
            'confirmclass': 'btn-danger',
            'confirmed': function() {
                deleteTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#deletetenant-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenant not deleted.', 'The tenant could not be deleted.', 'error');
                    } else {
                        oae.api.util.notification('Tenant deleted.', 'Tenant ' + tenantDisplayName + ' was successfully deleted.');
                    }
                });
            }
        });
    };

    /**
     * Stops a single tenant and shows a confirmation message
     */
    var stopTenantHandler = function() {
        var tenantDisplayName = $(this).attr('data-displayName');
        var tenantAlias = $(this).attr('data-alias');
        adminUtil.showConfirmationModal({
            'id': 'stoptenant-modal',
            'title': 'Stop tenant "' + tenantDisplayName + '"',
            'message': 'Are you sure you want to stop tenant "' + tenantDisplayName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, stop "' + tenantDisplayName + '"',
            'confirmclass': 'btn-warning',
            'confirmed': function() {
                stopTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#stoptenant-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenant not stopped.', 'The tenant could not be stopped.', 'error');
                    } else {
                        oae.api.util.notification('Tenant stopped.', 'Tenant ' + tenantDisplayName + ' was successfully stopped.');
                    }
                });
            }
        });
    };

    /**
     * Starts a single tenant and shows a confirmation message
     */
    var startTenantHandler = function() {
        var tenantDisplayName = $(this).attr('data-displayName');
        var tenantAlias = $(this).attr('data-alias');
        adminUtil.showConfirmationModal({
            'id': 'starttenant-modal',
            'title': 'start tenant "' + tenantDisplayName + '"',
            'message': 'Are you sure you want to start tenant "' + tenantDisplayName + '"?',
            'cancel': 'Cancel',
            'confirm': 'Yes, start ' + tenantDisplayName,
            'confirmclass': 'btn-success',
            'confirmed': function() {
                startTenants([tenantAlias], function(err) {
                    // Hide the dialog when done
                    $('#starttenant-modal').modal('hide');
                    // Show a success or failure message
                    if (err) {
                        oae.api.util.notification('Tenant not started.', 'The tenant could not be started.', 'error');
                    } else {
                        oae.api.util.notification('Tenant started.', 'Tenant ' + tenantDisplayName + ' was successfully started.');
                    }
                });
            }
        });
    };

    /**
     * Log into a user tenant as a global admin. If successful, the user will be redirected
     * to the tenant where he should be logged in. If we were unable to retrieve a login
     * token, a notification will be shown.
     */
    var loginOnTenantHandler = function() {
        var tenantAlias = $(this).attr('data-alias');
        getToken(tenantAlias, function(err, token) {
            if (err) {
                oae.api.util.notification('Token error.', 'Could not retrieve a token to log onto the tenant.', 'error');
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
     * @param  {String}     tenantAlias     The tenant alias of the tenant to log onto
     * @param  {Function}   callback        Standard callback function
     * @param  {Object}     callback.err    Error object containing error code and message
     * @param  {Object}     callback.token  A token that can be used to log onto the specified tenant
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
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Add event binding for the tenant related functionality
     */
    var addBinding = function() {
        // Create tenant toggle
        $(document).on('click', '#createtenant-toggle-button', adminUtil.toggleContainer);
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
        // Log onto a tenant
        $(document).on('click', '.login-tenant', loginOnTenantHandler);
    };

});
