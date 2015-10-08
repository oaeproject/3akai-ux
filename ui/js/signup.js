/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
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

require(['jquery', 'underscore', 'oae.core', 'iso3166'], function($, _, oae, iso3166) {

    var DEFAULT_SIGN_UP_REDIRECT_URL = '/';

    // Variable that indicates where to redirect the user to after sign up
    var signUpRedirectUrl = null;

    // Variable that indicates what invitation info, if any, is available (e.g., email and
    // invitation token)
    var invitationInfo = null;

    // Variable that holds the configured auth strategy information for the tenant
    var authStrategyInfo = null;

    // Variable that specifies if recaptcha should be enabled or disabled
    var recaptchaEnabled = null;

    // Variable that holds the recaptcha service public key, if any
    var recaptchaPublicKey = oae.api.config.getValue('oae-principals', 'recaptcha', 'publicKey');

    // Variable that specifies if the terms and conditions are enabled
    var termsAndConditionsEnabled = oae.api.config.getValue('oae-principals', 'termsAndConditions', 'enabled');

    /**
     * Convenience function to get the desired redirect URL after signup
     *
     * @return {String}     The URL to which to redirect the user after signing up
     */
    var getSignUpRedirectUrl = function() {
        return oae.api.authentication.getLoginRedirectUrl() || DEFAULT_SIGN_UP_REDIRECT_URL;
    };

    /**
     * Get the invitation information (token and email) from the query string, if any
     *
     * @return {Object}     invitationInfo          The invitation information in the sign up request
     * @return {String}     [invitationInfo.token]  If specified, indicates an invitation was followed, and this is the token of authenticity
     * @return {String}     [invitationInfo.email]  If specified, indicates an invitation was followed, and this is the referrer email address
     */
    var getInvitationInfo = function() {
        var parsedSignUpRedirectUrl = oae.api.util.url(signUpRedirectUrl);
        return {
            'token': parsedSignUpRedirectUrl.param('invitationToken'),
            'email': parsedSignUpRedirectUrl.param('invitationEmail'),
        };
    };

    /**
     * Get the context-specific page title (e.g., activation or sign up)
     *
     * @return {String}     The page title for this context
     */
    var getPageTitle = function() {
        var title = '__MSG__SIGN_UP__';
        if (invitationInfo.token) {
            title = '__MSG__ACTIVATE_YOUR_ACCOUNT__';
        }

        return oae.api.i18n.translate(title);
    };

    /**
     * Verify whether or not the entered username already exists as a login id on the current tenant.
     * The ajax request in this function executes synchronously to allow a username to be checked for
     * existence before the user is created.
     *
     * @param  {String}     username                The username we want to check the existence of
     * @param  {Function}   callback                Standard callback function.
     * @param  {Boolean}    callback.available      Whether or not the username is available
     */
    var isUserNameAvailable = function(username, callback) {
        $.ajax({
            url: '/api/auth/exists/' + username,
            async: false,
            success: function() {
                // The username already exists
                callback(false);
            },
            error: function(xhr, textStatus, thrownError) {
                // The username is still available
                callback(true);
            }
        });
    };

    /**
     * Show a validation message for reCaptcha
     */
    var showRecaptchaError = function() {
        // Set the aria attributes on the main recaptcha input field
        $('#recaptcha_response_field').attr({
            'aria-invalid': 'true',
            'aria-describedby': 'signup-createaccount-recaptcha-error'
        });
        $('#signup-createaccount-recaptcha-container').addClass('has-error');
        $('#signup-createaccount-recaptcha-error').show();
    };

    /**
     * Hide the reCaptcha validation message
     */
    var hideRecaptchaError = function() {
        // Remove the aria attributes on the main recaptcha input field
        $('#recaptcha-response-field').removeAttr('aria-invalid aria-describedby');
        $('#signup-createaccount-recaptcha-error').hide();
        $('#signup-createaccount-recaptcha-container').removeClass('has-error');
    };

    /**
     * Create the new user. This will be called after validation has succeeded
     */
    var createUser = function() {
        // Hide the recaptcha validation
        hideRecaptchaError();

        // Get the form values
        var values = $('#signup-createaccount-form').serializeObject();
        // Collect the recaptcha values
        if (recaptchaEnabled) {
            values['recaptchaChallenge'] = Recaptcha.get_challenge();
            values['recaptchaResponse'] = Recaptcha.get_response();
        }

        // Disable the form during user creation, so it can't be submitted multiple times
        $('#signup-createaccount-form *').prop('disabled', true);

        // Create the user
        var displayName = values.firstName + ' ' + values.lastName;
        var additionalOptions = {
            'invitationToken': invitationInfo.token
        };

        oae.api.user.createUser(values.username, values.password, displayName, values.email, additionalOptions, values.recaptchaChallenge, values.recaptchaResponse, function(err, createdUser) {
            if (err) {
                if (recaptchaEnabled) {
                    // Refresh reCaptcha
                    Recaptcha.reload();
                }

                // The user entered an invalid reCaptcha token
                if (err.msg === 'Invalid reCaptcha token') {
                    showRecaptchaError();
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__ACCOUNT_NOT_CREATED__'),
                        oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_WHILE_CREATING_THE_ACCOUNT__'),
                        'error'
                    );
                }

                // Unlock the sign up button
                $('#signup-createaccount-form *').prop('disabled', false);
            } else {
                oae.api.authentication.localLogin(values.username, values.password, function() {
                    // Relocate to the destination
                    window.location = signUpRedirectUrl;
                });
            }
        });
    };

    /**
     * Initialize the basic page set up
     *
     * @return {Boolean}    Whether or not page setup should continue
     */
    var init = function() {
        signUpRedirectUrl = getSignUpRedirectUrl();

        // Authenticated users should just be sent to their redirect destination
        if (!oae.data.me.anon) {
            window.location = signUpRedirectUrl;
        }

        invitationInfo = getInvitationInfo();
        authStrategyInfo = oae.api.authentication.getStrategyInfo('SIGN_UP');

        // Auto-signin if there is only one external signin method available
        if (authStrategyInfo.hasSingleExternalAuth) {
            oae.api.authentication.externalLogin(_.keys(authStrategyInfo.enabledExternalStrategies)[0], {
                'redirectUrl': signUpRedirectUrl,
                'invitationToken': invitationInfo.token
            });
            return;
        }

        // Don't run recaptcha if the tenant doesn't have it enabled or if local auth is disabled,
        // but also don't require recaptcha if an invitation token is provided, as it will validate
        // user account creation on its own
        recaptchaEnabled = (
            !invitationInfo.token &&
            authStrategyInfo.hasLocalAuth &&
            oae.api.config.getValue('oae-principals', 'recaptcha', 'enabled')
        );
    };

    /**
     * Render the title of the page for both the browser and page
     */
    var renderPageTitle = function() {
        var pageTitle = getPageTitle();

        // Set the browser and page title
        oae.api.util.setBrowserTitle(pageTitle);
        oae.api.util.template().render($('#signup-title-template'), {
            'title': pageTitle
        }, $('#signup-title-container'));
    };

    /**
     * Set up the validation on the create account form, including the error messages
     */
    var setUpCreateAccountValidation = function() {
        var validateOpts = {
            'rules': {
                'username': {
                    'minlength': 3,
                    'nospaces': true,
                    'validchars': true,
                    'usernameavailable': true
                },
                'password': {
                    'minlength': 6
                },
                'password_repeat': {
                    'equalTo': '#signup-createaccount-password'
                }
            },
            'messages': {
                'firstName': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_FIRST_NAME__')
                },
                'lastName': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_LAST_NAME__')
                },
                'email': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_A_VALID_EMAIL_ADDRESS__'),
                    'email': oae.api.i18n.translate('__MSG__THIS_IS_AN_INVALID_EMAIL_ADDRESS__')
                },
                'username': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_USERNAME__'),
                    'minlength': oae.api.i18n.translate('__MSG__THE_USERNAME_SHOULD_BE_AT_LEAST_THREE_CHARACTERS_LONG__'),
                    'nospaces': oae.api.i18n.translate('__MSG__THE_USERNAME_SHOULDNT_CONTAIN_SPACES__')
                },
                'password': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_PASSWORD__'),
                    'minlength': oae.api.i18n.translate('__MSG__YOUR_PASSWORD_SHOULD_BE_AT_LEAST_SIX_CHARACTERS_LONG__')
                },
                'password_repeat': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_REPEAT_YOUR_PASSWORD__'),
                    'passwordmatch': oae.api.i18n.translate('__MSG__THIS_PASSWORD_DOES_NOT_MATCH_THE_FIRST_ONE__')
                },
                'termsandconditions': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ACCEPT_THE_TERMS_AND_CONDITIONS__')
                }
            },
            'methods': {
                'validchars': {
                    'method': function(value, element) {
                        return this.optional(element) || !(/[<>\\\/{}\[\]!#\$%\^&\*,:]+/i.test(value));
                    },
                    'text': oae.api.i18n.translate('__MSG__ACCOUNT_INVALIDCHAR__')
                },
                'usernameavailable': {
                    'method': function(value, element) {
                        var response = false;
                        isUserNameAvailable(value, function(available) {
                            response = available;
                            // Show the available icon if the username is available, otherwise show the unavailable icon
                            if (available) {
                                $('#signup-createaccount-username-available').removeClass('fa-times').addClass('fa-check');
                            } else {
                                $('#signup-createaccount-username-available').removeClass('fa-check').addClass('fa-times');
                            }
                        });
                        return response;
                    },
                    'text': oae.api.i18n.translate('__MSG__THIS_USERNAME_HAS_ALREADY_BEEN_TAKEN__')
                },
                'emaildomain': {
                    'method': function(value, element) {
                        var configuredEmailDomain = oae.data.me.tenant.emailDomain;

                        // If the tenant has not been configured with an email domain, any email address
                        // can be used to sign up
                        if (!configuredEmailDomain) {
                            return true;
                        }

                        // Only accept email addresses that are either an exact match or have the
                        // configured email domain as the suffix
                        var enteredEmailDomain = value.split('@').pop();
                        var exactMatch = (enteredEmailDomain === configuredEmailDomain);
                        var emailDomainSuffix = '.' + configuredEmailDomain;
                        var suffixPosition = enteredEmailDomain.indexOf(emailDomainSuffix);
                        var suffixMatch = (suffixPosition > 0 && suffixPosition === (enteredEmailDomain.length - emailDomainSuffix.length));

                        // Verify the entered email address matches the configured email domain
                        return (exactMatch || suffixMatch);
                    },
                    'text': oae.api.i18n.translate('__MSG__YOU_CAN_ONLY_REGISTER_WITH_A_TENANT_EMAIL_ADDRESS__', null, {'emailDomain': oae.data.me.tenant.emailDomain})
                }
            },
            'submitHandler': createUser
        };

        oae.api.util.validation().validate($('#signup-createaccount-form'), validateOpts);
    };

    /**
     * Set up a reCaptcha container that will used to verify
     * that the current user is a real human
     */
    var setUpReCaptcha = function() {
        if (recaptchaEnabled) {
            // Only require the recaptcha library when recaptcha has been enabled
            require(['//www.google.com/recaptcha/api/js/recaptcha_ajax.js'], function() {
                var captchaContainer = $('#signup-createaccount-recaptcha-container')[0];
                Recaptcha.create(recaptchaPublicKey, captchaContainer, {theme: 'custom'});
            });

            // Hide the Recaptcha error when text is entered
            $('#recaptcha_response_field').on('keyup', hideRecaptchaError);
        } else {
            $('#signup-createaccount-recaptcha-container').hide();
        }
    };

    /**
     * Return a tenant that contains the specified tenant values as well as the
     * country info to which the tenant is associated, if known
     *
     * @param  {Tenant}     tenant                  The tenant whose country info to apply
     * @return {Tenant}     tenant                  The tenant object with the country info applied
     * @return {String}     [tenant.countryName]    The name of the country to which the tenant belongs, if known
     * @return {String}     [tenant.countryFlag]    The absolute url path to the flag image associated to the country to which the tenant belongs, if known
     */
    var withCountryInfo = function(tenant) {
        var countryInfo = _.findWhere(iso3166.countries, {'code': tenant.countryCode});
        return _.extend({}, tenant, {
            'countryName': (countryInfo && countryInfo.name),
            'countryFlag': (countryInfo && countryInfo.icon)
        });
    };

    /**
     * Enable or disable the signup options by enabling/disabling the elements
     * and using transparency
     *
     * @param  {Boolean}    enable  Whether to enable or disable the signup options
     */
    var toggleSignupOptions = function(enable) {
        var $signupOptions = $('#signup-options');
        if (enable) {
            $signupOptions.removeClass('signup-options-disabled');
            $signupOptions.find('*').prop('disabled', false);
        } else {
            $signupOptions.addClass('signup-options-disabled');
            $signupOptions.find('*').prop('disabled', true);
        }
    };

    /**
     * Cancel the currently selected institution in the auto-suggest control
     */
    var cancelInstitutionSelect = function() {
        $('#signup-institution-search ul.as-selections').removeClass('signup-institution-search-selected');
        $('#signup-institution-search ul.as-selections .as-input').focus();
        toggleSignupOptions(true);
        return false;
    };

    /**
     * Initialize the signup institution search template
     */
    var renderSignUpInstitutionSearch = function() {
        if (!oae.data.me.tenant.isGuestTenant) {
            // Don't render institution search at all if we're not on the guest
            // tenant
            return;
        }

        // Render the tenant search container
        oae.api.util.template().render($('#signup-institution-template'),
            null, $('#signup-institution-container'));

        // Initialize the tenant search auto-suggest
        oae.api.util.autoSuggest().setup($('#signup-institution-search-field'), {
            'url': '/api/search/tenants',
            'searchObjProps': 'alias',
            'formatList': function(data, $el) {
                oae.api.util.template().render($('#signup-as-tenant-template'), {
                    'tenant': withCountryInfo(data)
                }, $el);
                return $el;
            },
            'selectionAdded': function(el) {
                // When a selection is added by choosing a tenant, we don't add
                // an item to the auto-suggest selection, instead we redirect
                // to the equivalent page on that tenant
                var tenant = $(el).data().originalData;
                var $selections = $('#signup-institution-search ul.as-selections');
                var $selection = $('#signup-as-selection');

                // Render the tenant template into the selected item
                oae.api.util.template().render($('#signup-as-selection-template'), {
                    'tenant': withCountryInfo(tenant)
                }, $selection);

                // Put the tenant data on the selection item
                $selection.data().tenant = tenant;

                // Remove the element value since we would want it to be able to
                // appear in the results again, and add the previous back into
                // the field
                $('#signup-institution-search ul.as-selections .as-values').val('');
                $('#signup-institution-search ul.as-selections .as-input').val(tenant.query);

                // Toggle the template into selected mode and disable the signup
                // options
                $selections.addClass('signup-institution-search-selected');
                toggleSignupOptions(false);

                $('#signup-as-go > button').focus();
            }
        }, null, function() {
            // Add the action items to the autosuggest field
            var actionItems = oae.api.util.template().render($('#signup-as-actions-template'));
            $('#signup-institution-search ul.as-selections').append(actionItems);

            // Add keyboard bindings to cancel the selection and re-reveals the
            // signup options
            $('#signup-as-selection').on('click keydown', cancelInstitutionSelect);
            $('#signup-as-go > button').keydown(function(evt) {
                // Cancel selection if the user hits escape, delete or backspace
                // on the "Go" button
                var isDeleteKey = (evt.keyCode === 46);
                var isEscapeKey = (evt.keyCode === 27);
                var isBackspaceKey = (evt.keyCode === 8);
                if (isEscapeKey || isBackspaceKey || isDeleteKey) {
                    return cancelInstitutionSelect();
                }
            });

            // When the "Go" button is pressed, go to the equivalent page of the
            // selected tenant
            $('#signup-as-go > button').click(function() {
                oae.api.util.redirect().tenant($('#signup-as-selection').data().tenant);
            });

            // Show the container now that everything is initialized
            $('#signup-institution-container').show();
        });
    }

    /**
     * Initialize the signup options template
     */
    var renderSignUpOptions = function() {
        var externalAuthOpts = {
            'data': {
                'invitationToken': invitationInfo.token,
                'redirectUrl': signUpRedirectUrl
            }
        };

        // Render the signup options
        oae.api.util.template().render($('#signup-options-template'), {
            'authStrategyInfo': authStrategyInfo,
            'externalAuthOpts': externalAuthOpts,
            'invitationInfo': invitationInfo,
            'recaptchaEnabled': recaptchaEnabled,
            'termsAndConditionsEnabled': termsAndConditionsEnabled
        }, $('#signup-options-container'));

        // For IE9, since we can't use flexbox, we need to have an explicit height to have a full-
        // height vertical "OR" divider. Using `height: 100%` doesn't work because then all parents
        // will need an explicit height, which means we have to set `height: 100%` all the way up
        // to the `html` tag. If we set `height: 100%` on the HTML tag, then the document doesn't
        // appear to become taller than the browser viewport, and it breaks the rendering
        var $ieLt10SignUpOptionsLocal = $('.ie-lt10 #signup-options-local:visible');
        if ($ieLt10SignUpOptionsLocal.length > 0) {
            $('#signup-options-container').css('height', $ieLt10SignUpOptionsLocal.height());
        }

        setUpCreateAccountValidation();
        setUpReCaptcha();
    };

    init();
    renderPageTitle();
    renderSignUpOptions();
    renderSignUpInstitutionSearch();
});
