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

define(['exports', 'jquery', 'underscore', 'oae.core', 'jquery.spectrum'], function(exports, $, _, oae) {

    // Variable that will be used to keep track of the current tenant
    var currentContext = null;
    // Variable that will cache the configuration for the current tenant, as the configured
    // skin values are stored as part of the general configuration
    var configuration = null;
    // Variable that will cache the default skin for the current tenant
    var defaultSkin = {};
    // Variable that will cache the current skin values
    var activeSkin = {};

    /**
     * Initialize the skinning related functionality
     *
     * @param  {Tenant}    currentContext        The tenant for which the admin UI is displaying
     * @param  {Object}    configuration         The configuration for the current tenant
     */
    var init = exports.init = function(_currentContext, _configuration) {
        currentContext = _currentContext;
        configuration = _configuration;

        addBinding();
        loadSkin();
    };

    /**
     * Initialize the list of available skinning variables and their values
     */
    var loadSkin = function() {
        // Only show the skinning variables when we are looking at a specific tenant.
        // It is currently not desired to change skin values for the global tenant, as the
        // values wouldn't flow through to the tenants appropriately if both of them have
        // skinning values stored.
        if (currentContext.isTenantOnGlobalAdminServer || !currentContext.isGlobalAdminServer) {
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
                        configuredSkin = configuration['oae-ui'].skin.variables;
                    }

                    // For all of the values in the available skin variables, we check if the current tenant
                    // has a stored value that overrides the default value. If the tenant doesn't have a value
                    // for a variable, the default value will be used
                    $.each(data.results, function(configSectionIndex, configSection) {
                        $.each(configSection.subsections, function(configSubsectionIndex, configSubsection) {
                            $.each(configSubsection.variables, function(variableIndex, variable) {
                                variable.value = configuredSkin[variable.name] || variable.defaultValue;
                                defaultSkin[variable.name] = variable.defaultValue;
                                activeSkin[variable.name] = variable.value;
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
     * Compares the selected skin values against the default skin and returns the changed values only.
     *
     * @return {Object}    The skinning values that have been changed (i.e. are different to the default skin)
     */
    var getSkinChanges = function() {
        var nonDefaultValues = {};
        var revertedValues = [];

        // Loop over the form input fields to see which values need to be stored or reverted
        $('#admin-skinning-form input').each(function(index, input) {

            // Get the ID and data type of the skin element
            var name = $(input).attr('name');
            var type = $(input).attr('data-type');

            // Get the default, active, and new values
            var defaultValue = defaultSkin[name];
            var activeValue = activeSkin[name];
            var newValue = $.trim($(input).val());

            // If the field is a color, match as colors
            if (type === 'color') {
                // If the color is different to the default skin color, its name and
                // current value are added to the non-default list
                if (!tinycolor.equals(newValue, defaultValue)) {
                    nonDefaultValues[name] = newValue;
                // If the user changed a non-default color back to the default
                // value, its name is added to the reverted list
                } else if (!tinycolor.equals(activeValue, defaultValue)) {
                    revertedValues.push(name);
                }
            // The only other choice is an input field, handle as string
            } else {
                // If the value is different to the default value, its name and current
                // value are added to the non-default list
                if (newValue !== defaultValue) {
                    nonDefaultValues[name] = newValue;
                // If the user changed a non-default value back to the default
                // value, its name is added to the reverted list
                } else if (activeValue !== defaultValue) {
                    revertedValues.push(name);
                }
            }
        });

        // Returns the object of skin values to be saved and reverted
        return {
            'nonDefaultValues': nonDefaultValues,
            'revertedValues': revertedValues
        };
    };

    /**
     * Update active skin values to match the entered values
     */
    var refreshActiveSkin = function() {
        $('#admin-skinning-form input').each(function(input, input) {
            activeSkin[$(input).attr('name')] = $.trim($(input).val());
        });
    };

    /**
     * Persist the new skin. All values that override default skin values will be saved as the
     * skin overrides. All values that have been reverted back to the default value will be reverted.
     */
    var applySkinChanges = function() {
        // Retrieve the skin changes
        var skinChanges = getSkinChanges();

        // Save the skin overrides
        saveSkin(skinChanges.nonDefaultValues, function(saveSkinErr) {
            // Revert the reverted skin values
            revertSkin(skinChanges.revertedValues, function(revertSkinErr) {
                // Show a success/error notification and update state
                if (saveSkinErr || revertSkinErr) {
                    oae.api.util.notification('Skin not saved.', 'The skin could not be saved.', 'error');
                } else {
                    refreshActiveSkin();
                    oae.api.util.notification('Skin saved.', 'The skin has been successfully saved.');
                }
            });
        });

        // Return false to avoid default form submit behavior
        return false;
    };

    /**
     * Save the new skin values. The back-end requires us to send all skin values
     * that are different than the default values at once in a stringified JSON object.
     *
     * @param  {String[]}    nonDefaultValues   Array of skin values that override default skin values
     * @param  {Function}    callback           Standard callback function
     */
    var saveSkin = function(nonDefaultValues, callback) {
        // Return straight away when no overrides have been provided
        if (_.keys(nonDefaultValues).length === 0) {
            return callback();
        }

        var data = {};
        // Create the JSON only containing the values that have changed to send to the server
        $.each(nonDefaultValues, function(propertyChanged, change) {
            data['oae-ui/skin/variables/' + propertyChanged] = change;
        });

        var url = '/api/config';
        // Append the tenant alias when we're not on the tenant server itself
        if (currentContext.isTenantOnGlobalAdminServer) {
            url += '/' + currentContext.alias;
        }

        // Save the skin values
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function() {
                callback();
            }, error: function() {
                callback(true);
            }
        });
    };

    /**
     * Revert all skin values that have been reverted/changed back to the default skin value
     *
     * @param  {String[]}    revertedValues    Array of skin values to be reverted to the default
     * @param  {Function}    callback          Standard callback function
     */
    var revertSkin = function(revertedValues, callback) {
        // Return straight away when no reverted values have been provided
        if (revertedValues.length === 0) {
            return callback();
        }

        var data = [];
        $.each(revertedValues, function(propertyIndex, property) {
            data.push('oae-ui/skin/variables/' + property);
        });

        // When we are on the tenant server itself, we don't need
        // to add the tenant alias to the endpoint
        var url = '/api/config/clear';
        if (currentContext.isTenantOnGlobalAdminServer) {
            url = '/api/config/' + currentContext.alias + '/clear';
        }

        // Revert the skin values
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                'configFields': data
            },
            success: function() {
                callback();
            }, error: function() {
                callback(true);
            }
        });
    };

    /**
     * Revert a skin value back to its original value as defined in the
     * base less file. Therefore, this will not necessarily revert the
     * value back to its previous value.
     */
    var revertSkinValue = function() {
        var $input = $('input', $(this).parent());
        var defaultValue = defaultSkin[$input.attr('name')];
        // If the variable is a color, we use the set method provided by jQuery spectrum
        if ($input.attr('data-type') === 'color') {
            $input.spectrum('set', defaultValue);
        } else {
            $input.val(defaultValue);
        }
    };

    /**
     * Add event binding for the skinning related functionality
     */
    var addBinding = function() {
        // Revert skin value
        $(document).on('click', '.admin-skinning-revert', revertSkinValue);
        // Change skin
        $(document).on('submit', '#admin-skinning-form', applySkinChanges);
    };

});
