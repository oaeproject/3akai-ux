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

define(['jquery', 'underscore', 'oae.core', 'iso3166', 'jquery.jeditable', 'jquery.history'], function($, _, oae, iso3166) {

    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable to cache the list of retrieved tenants
        var tenantsCache = {};

        // Variable used to keep track of the current infinite scroll
        var infinityScroll = null;

        // Variable used to index countries by their country code
        var countriesByCode = null;

        // Variable used to cache the full jeditable list of country code
        // options for jeditable
        var countryOptions = null;

        /**
         * Create the HTML content used to embed the flag icon into the country
         * column in the tenants table
         *
         * @param  {String}     countryCode     The ISO-3166-1 country code of the flag to embed
         * @return {String}                     The HTML content to embed
         */
        var createFlagHtml = function(countryCode) {
            if (countryCode) {
                return oae.api.util.template().render($('#tenants-flag-template', $rootel), {
                    'country': countriesByCode[countryCode]
                });
            } else {
                return '';
            }
        };

        /**
         * Create the "JSON-serialized-array" (a PHP concept?) of the data that
         * should be added to the country drop down. This format is specifically
         * required by jeditable to populate a select list.
         *
         * @see http://www.appelsiini.net/projects/jeditable
         *
         * @param  {String}     selectedCountryCode     The ISO-3166-1 country code of the selected country
         * @return {String}                             The select options data that contains all countries for a jeditable country selection
         */
        var createCountryCodeJeditableData = function(selectedCountryCode) {
            var options = countryOptions;
            if (selectedCountryCode) {
                options += ', \'selected\':\'' + selectedCountryCode + '\'';
            }

            return '{' + options + '}';
        };

        /**
         * Stop the tenant server
         *
         * @param {String}      alias           Alias of the tenant to stop
         * @param {Function}    callback        Standard callback function
         * @param {Object}      callback.err    Error object containing error code and message
         */
        var stopTenant = function(alias, callback) {
            $.ajax({
                'url': '/api/tenant/stop',
                'type': 'POST',
                'data': {'aliases': [alias]},
                'success': function(data) {
                    // Flag the tenant as being inactive and refresh it in the list
                    var tenant = tenantsCache[alias];
                    tenant.active = false;
                    renderTenant(tenant);
                    callback();
                },
                'error': function(jqXHR, textStatus) {
                    callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
                }
            });
        };

        /**
         * Confirm whether or not a tenant should be stopped. If so, the tenant will be stopped
         */
        var stopTenantHandler = function() {
            var tenantDisplayName = $(this).attr('data-displayName');
            var tenantAlias = $(this).attr('data-alias');
            $(document).trigger('oae.trigger.confirmdialog', {
                'title': oae.api.i18n.translate('__MSG__STOP_TENANT__', 'tenants', {'displayName': tenantDisplayName}),
                'message': oae.api.i18n.translate('__MSG__STOP_TENANT_DESCRIPTION__', 'tenants', {'displayName': tenantDisplayName}),
                'confirm': oae.api.i18n.translate('__MSG__STOP_TENANT_CONFIRM__', 'tenants', {'displayName': tenantDisplayName}),
                'confirmclass': 'btn-warning',
                'confirmed': function() {
                    stopTenant(tenantAlias, function(err) {
                        // Show a success or failure message
                        if (err) {
                            oae.api.util.notification(
                                oae.api.i18n.translate('__MSG__TENANT_NOT_STOPPED__', 'tenants'),
                                oae.api.i18n.translate('__MSG__TENANT_COULD_NOT_BE_STOPPED__', 'tenants'),
                                'error');
                        } else {
                            oae.api.util.notification(
                                oae.api.i18n.translate('__MSG__TENANT_STOPPED__', 'tenants'),
                                oae.api.i18n.translate('__MSG__TENANT_STOPPED_SUCCESSFULLY__', 'tenants', {'displayName': tenantDisplayName}));
                        }
                    });
                }
            });
        };

        /**
         * Start the tenant server
         *
         * @param {String}      alias           Alias of the tenant to start
         * @param {Function}    callback        Standard callback function
         * @param {Object}      callback.err    Error object containing error code and message
         */
        var startTenant = function(alias, callback) {
            $.ajax({
                'url': '/api/tenant/start',
                'type': 'POST',
                'data': {'aliases': [alias]},
                'success': function(data) {
                    // Flag the tenant as being active and update it in the list
                    var tenant = tenantsCache[alias];
                    tenant.active = true;
                    renderTenant(tenant);
                    callback();
                },
                'error': function(jqXHR, textStatus) {
                    callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
                }
            });
        };

        /**
         * Start a single tenant and show a confirmation message
         */
        var startTenantHandler = function() {
            var tenantDisplayName = $(this).attr('data-displayName');
            var tenantAlias = $(this).attr('data-alias');
            $(document).trigger('oae.trigger.confirmdialog', {
                'title': oae.api.i18n.translate('__MSG__START_TENANT__', 'tenants', {'displayName': tenantDisplayName}),
                'message': oae.api.i18n.translate('__MSG__START_TENANT_DESCRIPTION__', 'tenants', {'displayName': tenantDisplayName}),
                'confirm': oae.api.i18n.translate('__MSG__START_TENANT_CONFIRM__', 'tenants', {'displayName': tenantDisplayName}),
                'confirmclass': 'btn-success',
                'confirmed': function() {
                    startTenant(tenantAlias, function(err) {
                        // Show a success or failure message
                        if (err) {
                            oae.api.util.notification(
                                oae.api.i18n.translate('__MSG__TENANT_NOT_STARTED__', 'tenants'),
                                oae.api.i18n.translate('__MSG__TENANT_COULD_NOT_BE_STARTED__', 'tenants'),
                                'error');
                        } else {
                            oae.api.util.notification(
                                oae.api.i18n.translate('__MSG__TENANT_STARTED__', 'tenants'),
                                oae.api.i18n.translate('__MSG__TENANT_STARTED_SUCCESSFULLY__', 'tenants', {'displayName': tenantDisplayName}));
                        }
                    });
                }
            });
        };

        /**
         * Retrieve a signed authentication request that will authenticate the global admin user
         * to a user tenant
         *
         * @param  {String}     tenantAlias                 The tenant alias of the tenant to log onto
         * @param  {Function}   callback                    Standard callback function
         * @param  {Object}     callback.err                Error object containing error code and message
         * @param  {Object}     callback.requestInfo        The signed data for the authentication request
         * @param  {String}     callback.requestInfo.url    The URL to which to POST the authentication request
         * @param  {Object}     callback.requestInfo.body   The data to include as the POST body of the authentication request
         */
        var getSignedTenantRequestInfo = function(tenantAlias, callback) {
            $.ajax({
                'url': '/api/auth/signed/tenant',
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
         * Log into a user tenant as a global admin. If successful, the user will be redirected
         * to the tenant where they should be logged in. If we were unable to retrieve signed
         * login request info, a notification will be shown
         */
        var loginOnTenantHandler = function() {
            var tenantAlias = $(this).attr('data-alias');
            getSignedTenantRequestInfo(tenantAlias, function(err, data) {
                if (err) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__TOKEN_ERROR__', 'tenants'),
                        oae.api.i18n.translate('__MSG__COULD_NOT_SIGN_INTO_TENANT__', 'tenants'),
                        'error');
                } else {
                    // Fill in our hidden form and submit it. A form is being used because it is a cross-domain request
                    oae.api.util.template().render($('#tenants-login-template', $rootel), data, $('#tenants-login-container', $rootel));
                    $('#tenants-login-form').submit();
                }
            });
        };


        /**
         * Update a tenant's display name or host
         *
         * @param  {String}     tenantAlias         Alias for the tenant that needs to be updated
         * @param  {String}     field               The name of the tenant metadata field that needs to be updated. Accepted values are `displayName` and `host`
         * @param  {String}     value               The value the provided metadata field needs to be updated to
         * @param  {Function}   callback            Standard callback function
         * @param  {Object}     callback.err        An error that occurred, if any
         */
        var updateTenant = function(tenantAlias, field, value, callback) {
            // Set a default callback function in case no callback function has been provided
            callback = callback || function() {};

            // If we're making the change from the global admin tenant, the tenant alias
            // needs to be incorporated into the URL
            var url = '/api/tenant';
            if (widgetData.context.isGlobalAdminServer || widgetData.context.isTenantOnGlobalAdminServer) {
                url += '/' + tenantAlias;
            }

            // Post the update
            var data = {};
            data[field] = value;

            // Derive the i18n message label for the updated field for messaging
            var fieldLabel = null;
            if (field === 'displayName') {
                fieldLabel = 'NAME';
            } else if (field === 'host') {
                fieldLabel = 'HOST';
            } else if (field === 'emailDomains') {
                fieldLabel = 'EMAIL_DOMAIN';
                data[field] = _.map(data[field].split(','), function(s) {
                    return s.trim();
                });
            } else if (field === 'countryCode') {
                fieldLabel = 'COUNTRY';
            }

            $.ajax({
                'url': url,
                'type': 'POST',
                'data': data,
                'success': function() {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__TENANT_' + fieldLabel + '_UPDATED__', 'tenants'),
                        oae.api.i18n.translate('__MSG__TENANT_' + fieldLabel + '_UPDATE_SUCCESS__', 'tenants'));

                    callback();
                },
                'error': function(jqXHR, textStatus) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__TENANT_' + fieldLabel + '_NOT_UPDATED__', 'tenants'),
                        oae.api.i18n.translate('__MSG__TENANT_' + fieldLabel + '_UPDATE_FAILED__', 'tenants'),
                        'error');

                    callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
                }
            });
        };

        /**
         * Perform the update requests and DOM updates necessary to update (or
         * revert) a field after it has been updated VIA jeditable
         *
         * @param  {Element}    inlineEdit  The inline edit DOM element that was updated
         * @param  {String}     value       The new value of the jeditable field
         */
        var handleJeditableUpdate = function(inlineEdit, value) {
            // Check which field is being updated
            var $inlineEdit = $(inlineEdit);
            var field = $inlineEdit.attr('data-field');

            // Resolve the previous value. For the case of select lists, the
            // previous value will in the `data-value` parameter. Use that first
            // and fall back to the standard jeditable `revert`, which is just
            // the `$(this).text()`
            var revert = $inlineEdit.attr('data-value') || inlineEdit.revert;

            // Trim the previous and new values
            revert = $.trim(revert);
            value = $.trim(value);

            // Don't do anything if the field value didn't change
            if (value === revert) {
                return revert;
            }

            // Validate each potential field update
            if (field === 'displayName') {
                if (!value) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__INVALID_TENANT_NAME__', 'tenants'),
                        oae.api.i18n.translate('__MSG__PLEASE_ENTER_A_TENANT_NAME__'),
                        'error');
                    return revert;
                }
            } else if (field === 'host') {
                if (!value || !oae.api.util.validation().isValidHost(value)) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__INVALID_HOST_NAME__', 'tenants'),
                        oae.api.i18n.translate('__MSG__PLEASE_ENTER_A_HOST_NAME__'),
                        'error');
                    return revert;
                }
            } else if (field === 'emailDomains') {
                if (value) {
                    var hasBadEmailDomain = false;
                    _.each(value.split(','), function(emailDomain) {
                        emailDomain = emailDomain.trim();
                        if (!oae.api.util.validation().isValidHost(emailDomain)) {
                            hasBadEmailDomain = true;
                        }
                    });
                    if (hasBadEmailDomain) {
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__INVALID_EMAIL_DOMAIN__', 'tenants'),
                            oae.api.i18n.translate('__MSG__PLEASE_ENTER_VALID_EMAIL_DOMAINS__'),
                            'error');
                        return revert;
                    }
                }
            }

            // If we get here, we have successfully validated. Go ahead and update the tenant
            updateTenant($inlineEdit.attr('data-alias'), field, value, function(err, tenant) {
                if (err) {
                    // Revert the field if updating failed
                    if (revert) {
                        $inlineEdit.html(revert);
                    } else {
                        $inlineEdit.html('<i>' + oae.api.i18n.translate('__MSG__CLICK_TO_EDIT__', 'tenants') + '</i>');
                    }

                    // Advanced reverts to the table
                    if (field === 'host') {
                        // Revert the link to the tenant landing page if the
                        // host was updated
                        $('a', $inlineEdit.parent().prev()).attr('href', '//' + revert);
                    } else if (field === 'countryCode') {
                        // Revert the effective country code value and icon
                        // template
                        $inlineEdit.attr('data-value', revert);
                        $inlineEdit.html(createFlagHtml(revert));
                    }
                }
            });

            // Advanced updates to the table
            if (field === 'host') {
                // Update the link to the tenant's landing page
                $('a', $inlineEdit.parent().prev()).attr('href', '//' + value);
            } else if (field === 'countryCode') {
                // Update the effective country code value
                $inlineEdit.attr('data-value', value);
            }

            return value;
        };

        /**
         * Initialize jEditable fields in the tenant overview
         *
         * @param  {jQuery}     $el     The element in which jeditable items may exist
         */
        var enableInlineEdit = function($el) {
            var placeholderContent = '<i>' + oae.api.i18n.translate('__MSG__CLICK_TO_EDIT__', 'tenants') + '</i>';

            $el.find('.jeditable-field').editable(function(value) {
                return handleJeditableUpdate(this, value);
            }, {
                'data': $.trim,
                'onblur': 'submit',
                'placeholder': placeholderContent,
                'select' : true,
                'tooltip': oae.api.i18n.translate('__MSG__CLICK_TO_EDIT__', 'tenants')
            });

            $el.find('.jeditable-countryCode').editable(function(value) {
                var inlineEdit = this;
                return handleJeditableUpdate(this, value);
            }, {
                'type': 'select',
                'onblur': 'submit',
                'placeholder': placeholderContent,
                'select': true,
                'tooltip': oae.api.i18n.translate('__MSG__CLICK_TO_EDIT__', 'tenants'),
                'data': function(content, settings) {
                    return createCountryCodeJeditableData($(this).attr('data-value'));
                },
                'callback': function(result) {
                    $(this).html(createFlagHtml(result));
                }
            });
        };

        /**
         * Initialize a new infinite scroll for the tenant list
         */
        var setUpInfiniteScroll = function() {
            // Kill the infinite scroll if there is one
            if (infinityScroll) {
                infinityScroll.kill();
                tenantsCache = {};
            }

            var url = '/api/search/tenants?disabled=true';
            if (History.getState().data.query) {
                url += '&q=' + encodeURIComponent(History.getState().data.query);
            }

            // Set up the infinite scroll for tenants
            infinityScroll = $('#tenants-table', $rootel).infiniteScroll(url, {'limit': 50}, $('#tenants-table-row-template', $rootel), {
                'postProcessor': function(data) {
                    _.extend(tenantsCache, _.indexBy(data.results, 'alias'));
                    return _.extend({}, data, {
                        'context': widgetData.context,
                        'countriesByCode': countriesByCode
                    });
                },
                'emptyListProcessor': function() {
                    oae.api.util.template().render($('#tenants-noresults-template', $rootel), null, $('#tenants-table', $rootel));
                },
                'initialContent': function() {
                    return oae.api.util.template().render($('#tenants-table-header-template', $rootel), {
                        'context': widgetData.context
                    });
                },
                'postRenderer': function(data, $templateOutput) {
                    enableInlineEdit($templateOutput);
                }
            });
        };

        /**
         * Render the list of tenants
         */
        var renderTenants = function() {
            var context = widgetData.context;

            // Only show the option to create a tenant if we're on the global admin server
            var listHeaderActions = null;
            if (context.isGlobalAdminServer) {
                listHeaderActions = [
                    {
                        'icon': 'fa-plus',
                        'label': oae.api.i18n.translate('__MSG__CREATE_TENANT__'),
                        'trigger': 'oae-trigger-createtenant'
                    }
                ];
            }

            // Render the header for the tenants page
            oae.api.util.template().render($('#tenants-header-template', $rootel), {
                'context': context,
                'actions': listHeaderActions,
                'showSearch': context.isGlobalAdminServer
            }, $('#tenants-header-container', $rootel));

            // We ensure the create tenant action is always enabled since it is not bound to having
            // selected tenants
            $('#tenants-header-container .oae-list-header-actions button').prop('disabled', false);

            // Get the current search query from the History.js data object and put it in the search
            // field, if any
            var query = History.getState().data.query;
            $('.search-query').val(query);

            // Only render a single tenant when we're looking at a specific tenant
            if (widgetData.context.isGlobalAdminServer) {
                setUpInfiniteScroll();
            } else {
                resetTenantTable();
                renderTenant(widgetData.context);
                enableInlineEdit($('#tenants-table', $rootel));
            }
        };

        /**
         * Add event binding for the tenant related functionality
         */
        var addBinding = function() {
            // Stop a tenant
            $rootel.on('click', '.tenants-stop', stopTenantHandler);
            // Start a tenant
            $rootel.on('click', '.tenants-start', startTenantHandler);
            // Log onto a tenant
            $rootel.on('click', '.tenants-login', loginOnTenantHandler);
            // Listen to History.js state changes
            $(window).on('statechange', renderTenants);
            // Listen to the `oae.createtenant.done` event to refresh the tenant list after a new
            // tenant has been created
            $(document).on('oae.createtenant.done', function(ev, createdTenant) {
                renderTenants();
            });
        };

        /**
         * Render the tenants table header. This is used to manually apply the tenant table header
         * in the case that infinite scroll isn't being used.
         */
        var resetTenantTable = function() {
            var headerContent = oae.api.util.template().render($('#tenants-table-header-template', $rootel), {
                'context': widgetData.context
            });
            $('#tenants-table', $rootel).html(headerContent);
        };

        /**
         * Render a single tenant row
         *
         * @param  {Tenant}     tenant     The tenant to render
         */
        var renderTenant = function(tenant) {
            var liSelector = '#tenants-table > li[data-alias=' + oae.api.util.security().encodeForHTMLAttribute(tenant.alias) + ']';
            var $target = $(liSelector, $rootel);
            var rowContent = oae.api.util.template().render($('#tenants-table-row-template', $rootel), {
                'context': widgetData.context,
                'countriesByCode': countriesByCode,
                'results': [tenant]
            });
            if ($target.length > 0) {
                $target.replaceWith(rowContent);
            } else {
                $('#tenants-table', $rootel).append(rowContent);
            }

            // Refresh inline editing of the row
            enableInlineEdit($(liSelector, $rootel));
        };

        /**
         * Initialize the tenants widget
         */
        var init = function() {
            countriesByCode = _.indexBy(iso3166.countries, 'code');

            // Cache the country options as we don't want to populate the bulk
            // country array each time the editable country flag is clicked
            countryOptions = _.map(iso3166.countries, function(country) {
                // Escape ' characters with \' so it is properly escaped for
                // this data. jeditable is just terrible.
                var countryName = country.name.replace(/'/g, '\\\'');
                return '\'' + country.code + '\':\'' + countryName + '\'';
            });

            // Start with an empty element so the value can be cleared, as
            // country code is optional
            countryOptions = '\'\': \'\',' + countryOptions.join(',');
        };

        init();
        addBinding();
        renderTenants();
    };
});
