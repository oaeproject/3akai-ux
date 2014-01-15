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

define(['exports', 'jquery', 'underscore', 'oae.core', '/admin/js/admin.skin.js', '/admin/js/admin.util.js'], function(exports, $, _, oae, adminSkin, adminUtil) {

    // Variable that will be used to keep track of the current tenant
    var currentContext = null;
    // Variable that will cache the config schema
    var configurationSchema = null;
    // Variable that will cache the configuration for the current tenant
    var configuration = null;

    /**
     * Initialize the config related functionality
     *
     * @param  {Tenant}    currentContext        The tenant for which the admin UI is displaying
     */
    var init = exports.init = function(_currentContext) {
        currentContext = _currentContext;

        loadConfiguration(function() {
            renderModules();
            // Initialize the skinning related functionality
            adminSkin.init(currentContext, configuration);
        });
        addBinding();
    };

    /**
     * Render the available configuration modules and their configured values
     */
    var renderModules = function() {
        var schema = [];

        // Convert the configuration schema to an array as we can't sort a dictionary
        _.each(configurationSchema, function(module, moduleName) {
            schema.push({'module': module, 'moduleName': moduleName});
        });

        // Sort the array based on the module title.
        schema = schema.sort(function(a, b) {
            if (a.module.title > b.module.title) {
                return 1;
            }
            if (a.module.title < b.module.title) {
                return -1;
            }
            return 0;
        });
        oae.api.util.template().render($('#admin-modules-template'), {
            'schema': schema,
            'configuration': configuration,
            'context': currentContext,
            'languages': configurationSchema['oae-principals'].user.elements.defaultLanguage.list
        }, $('#admin-modules-container'));
    };

    /**
     * Gets the configuration schema and the configuration for the current tenant.
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
     * Persists the configuration changes for the current tenant
     */
    var updateConfiguration = function() {
        // Get the filled out values from the form
        var $form = $(this);
        var values = $form.serializeObject();

        // Object that will be used to construct the POST data
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

                // Go one level deeper if it's an internationalizableText field
                if (configurationSchema[module][option].elements[element].type === "internationalizableText") {
                    // Check if the default language changed
                    if (values[configPath + '/default'] !== configuration[module][option][element].default) {
                        data[configPath + '/default'] = values[configPath + '/default'];
                        configuration[module][option][element].default = values[configPath + '/default'];
                    }

                    // Loop over the list of available languages
                    $.each(configurationSchema['oae-principals'].user.elements.defaultLanguage.list, function(i, i18n) {
                        // Continue if the value has changed
                        if (values[configPath + '/' + i18n.value] !== configuration[module][option][element][i18n.value]) {
                            // We shouldn't submit empty values
                            if (values[configPath + '/' + i18n.value] !== '') {
                                data[configPath + '/' + i18n.value] = values[configPath + '/' + i18n.value];
                                configuration[module][option][element][i18n.value] = values[configPath + '/' + i18n.value];
                            }
                        }
                    });
                }

                // Check if the value has changed and overwrite if it has
                if ((values[configPath] !== elementValue) &&
                    configurationSchema[module][option].elements[element].type !== "internationalizableText") {
                    data[configPath] = values[configPath];
                    configuration[module][option][element] = values[configPath];
                }
            });
        });

        var url = '/api/config';
        // Tenant and global servers do not need the tenantId to be specified in the URL
        // If a tenant server is accessed through the global server the tenantId needs to be specified
        if (currentContext.isTenantOnGlobalAdminServer) {
            url += '/' + currentContext.alias;
        }

        // Only update when a change has actually been made
        if (!$.isEmptyObject(data)) {
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function() {
                    oae.api.util.notification('Configuration saved.', 'The configuration was successfully saved.');
                }, error: function() {
                    oae.api.util.notification('Configuration not saved.', 'The configuration could not be saved successfully.', 'error');
                }
            });
        }
        return false;
    };

    /**
     * Add event binding to the module related functionality
     */
    var addBinding = function() {
        // Modules toggle
        $(document).on('click', '.admin-module-configuration-toggle-button', adminUtil.toggleContainer);
        // Change config values
        $(document).on('submit', '.admin-module-configuration-form', updateConfiguration);
        // Toggle internationalizable field containers
        $(document).on('change', '.admin-internationalizabletext-language-picker', adminUtil.toggleInternationalizableFieldContainer);
    };

});
