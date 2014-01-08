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
    // Variable that will cache the skin values before user requests changes
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
                    // for a variable, the default value will be used. In all cases we cache the currently
                    // active value.
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
        // Get the form input fields
        var formFields = $('#admin-skinning-form input');
        var nondefaultValues = {};
        var revertedValues = [];

        // Loop over the form input fields to see which values
        // need to be returned to the server
        $.each(formFields, function(i, input) {
            // Get the ID and data type of the skin element
            var name = $(input).attr('name');
            var type = $(input).attr('data-type');

            // If the field is a color, match as colors
            if (type === 'color') {
                // Get the default, initial, and form colors
                var defaultColor = defaultSkin[name];
                var activeColor = activeSkin[name];
                var selectedColor = $(formFields[i]).val();
                // If the user changed a color back to the default
                // value, then its name is added to the reverted list
                if (!tinycolor.equals(activeColor, selectedColor) &&
                     tinycolor.equals(defaultColor, selectedColor)) {
                    revertedValues.push(name);
                }
                // If the color (regardless of whether or not the user
                // changed it) isn't the default, then its name and
                // current value are added to the non-default list.
                if (!tinycolor.equals(defaultColor, selectedColor)) {
                    nondefaultValues[name] = selectedColor;
                }
            // The only other choice is an input field, handle as string
            } else {
                // Get the current, default, and form text
                var activeSkinText = activeSkin[name];
                var defaultSkinText = defaultSkin[name];
                var formValueText = $.trim($(formFields[i]).val());
                if ((activeSkinText !== formValueText) && (defaultSkinText === formValueText)) {
                    revertedValues.push(name);
                }
                if (defaultSkinText !== formValueText) {
                    nondefaultValues[name] = formValueText;
                }
            }
        });

        // Returns the object of skin values to be saved and reverted
        return {
            'nondefaultValues': nondefaultValues,
            'revertedValues': revertedValues
        };
    };

    /**
     * Revert skin values
     *
     * @param  {String[]}    revertedValues    Array of skin values to be reverted to the default
     * @param  {Function}    callback          Standard callback function
     */
    var revertSkin = function(revertedValues, callback) {
        var data = [];

        // When we are on the tenant server itself, we don't need
        // to add the tenant alias to the endpoint
        var url = '/api/config/clear';
        if (currentContext.isTenantOnGlobalAdminServer) {
            url = '/api/config/' + currentContext.alias + '/clear';
        }

        $.each(revertedValues, function(propertyIndex, property) {
            data.push('oae-ui/skin/variables/' + property);
        });

        // Revert the skin values
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                'configFields': data
            },
            success: function() {
                callback(false);
            }, error: function() {
                callback(true);
            }
        });
    };

    /**
     * Save the new skin values. The back-end requires us to send all skin values
     * that are different than the default values at once in a stringified JSON object.
     *
     * @param  {String[]}    nondefaultValues   Array of skin values that aren't default
     * @param  {Function}    callback           Standard callback function
     */
    var saveSkin = function(nondefaultValues, callback) {
        var data = {};
        // Create the JSON only containing the values that have changed to send to the server
        $.each(nondefaultValues, function(propertyChanged, change) {
            data['oae-ui/skin/variables/' + propertyChanged] = change;
        });

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
                callback(false);
            }, error: function() {
                callback(true);
            }
        });
    };

    /**
     * Update active skin values to match page settings
     */
    var refreshActiveSkins = function() {
        $('#admin-skinning-form input').each(function(i, input) {
            activeSkin[$(input).attr('name')] = $.trim($(input).val());
        });
    };

    /**
     * Persist skin changes if any values have been changed or reverted
     *
     * @return {Boolean}    Returns false to avoid default form submit behaviour
     */
    var applySkinChanges = function() {
        // Retrieve the skin changes
        var skinChanges = getSkinChanges();
        var toDo = 0;
        var done = 0;
        var hasError = false;

        /**
         * Show a notification when all skin changes have been applied
         *
         * @param {Boolean}    err    True when an error occurred while saving the skin values
         */
        var skinChangesApplied = function(err) {
            done++;
            hasError = hasError || err;
            if (done === toDo) {
                // Finished applying all changes, update state and show a notification message
                if (!hasError) {
                    refreshActiveSkins();
                    oae.api.util.notification('Skin saved.', 'The skin has been successfully saved.');
                } else {
                    // Without tracking the multiple API calls independently, there's no
                    // way to know the current server state reliably
                    oae.api.util.notification('Skin not saved.', 'The skin could not be saved. Please refresh page.', 'error');
                }
            }
        };

        // If any values are not default, save the them
        if (_.keys(skinChanges.nondefaultValues).length) {
            toDo++;
            saveSkin(skinChanges.nondefaultValues, skinChangesApplied);
        }

        // If values were reverted, delete the configuration for them
        if (skinChanges.revertedValues.length) {
            toDo++;
            revertSkin(skinChanges.revertedValues, skinChangesApplied);
        }

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
        $(document).on('submit', '#admin-skinning-form', applySkinChanges);
    };

});
