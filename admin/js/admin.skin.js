/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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
                        configuredSkin = JSON.parse(configuration['oae-ui'].skin.variables);
                    }

                    // For all of the values in the available skin variables, we check if the current tenant
                    // has a stored value that overrides the default value. If the tenant doesn't have a value
                    // for a variable, the default value will be used
                    $.each(data.results, function(configSectionIndex, configSection) {
                        $.each(configSection.subsections, function(configSubsectionIndex, configSubsection) {
                            $.each(configSubsection.variables, function(variableIndex, variable) {
                                variable.value = configuredSkin[variable.name] || variable.defaultValue;
                                defaultSkin[variable.name] = variable.defaultValue;
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
        // Get the form input fields
        var formFields = $('#admin-skinning-form input');
        var changedValues = {};

        // Loop over the form input fields and match their value with their default value.
        // If the default is equal to the selected value, the value was not changed and doesn't need to be returned.
        $.each(formFields, function(i, input) {
            // Get the ID and data type of the skin element
            var name = $(input).attr('name');
            var type = $(input).attr('data-type');

            // If the field is a color, match as colors
            if (type === 'color') {
                // Get the default and form colors
                var defaultColor = defaultSkin[name];
                var selectedColor = $(formFields[i]).val();

                // If the default and form colors don't match, the value was changed and
                // is added to the cached values to return
                if (!tinycolor.equals(defaultColor, selectedColor)) {
                    changedValues[name] = selectedColor;
                }
            // The only other choice is an input field, handle as string
            } else {
                // Get the default and form text
                var defaultSkinText = defaultSkin[name];
                var formValueText = $.trim($(formFields[i]).val());

                // If the default and form text don't match, the value was changed and
                // is added to the cached values to return
                if (defaultSkinText !== formValueText) {
                    changedValues[name] = formValueText;
                }
            }
        });

        // Returns the object of skin values to be saved
        return changedValues;
    };

    /**
     * Save the new skin values. The back-end requires us to send all skin values
     * that are different than the default values at once in a stringified JSON object.
     */
    var saveSkin = function() {
        // Create the JSON only containing the values that have changed to send to the server
        var data = {
            'oae-ui/skin/variables': JSON.stringify(getSkinChanges())
        }

        // When we are on the tenant server itself, we don't have
        // to append the tenant alias to the endpoint
        var url = '/api/config';
        if (currentContext.isTenantOnGlobalAdminServer) {
            url += '/' + currentContext.alias;
        }

        // Save the skin values
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function() {
                oae.api.util.notification('Skin saved.', 'The skin has been successfully saved.');
            }, error: function() {
                oae.api.util.notification('Skin not saved.', 'The skin could not be saved successfully.', 'error');
            }
        });

        // Return false to avoid default form submit behavior.
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

    /**
     * Add event binding for the skinning related functionality
     */
    var addBinding = function() {
        // Revert skin value
        $(document).on('click', '.admin-skinning-revert', revertSkinValue);
        // Change skin
        $(document).on('submit', '#admin-skinning-form', saveSkin);
    };

});
