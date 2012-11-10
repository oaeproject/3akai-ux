/*
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
