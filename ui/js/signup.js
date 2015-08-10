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

require(['jquery','oae.core'], function($, oae) {

    var DEFAULT_SIGN_UP_REDIRECT_URL = '/me';

    var signUpRedirectUrl = null;
    var invitationInfo = null;
    var pageTitle = null;
    var authStrategyInfo = null;
    var recaptchaEnabled = null;
    var recaptchaPublicKey = null;
    var termsAndConditionsEnabled = null;

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
     * Get the terms and conditions if applicable
     *
     * @param  {Function}   callback        Standard callback function
     * @param  {String}     callback.text   The terms and conditions content, if any
     */
    var getTermsAndConditions = function(callback) {
        if (!termsAndConditionsEnabled) {
            // Terms and conditions are not enabled, so just callback with nothing
            return callback();
        }

        // Get the terms and conditions from the server
        oae.api.user.getTC(function(err, data) {
            return callback(data.text);
        });
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
            'aria-describedby': 'signup-createaccount-captcha-error'
        });
        $('#signup-createaccount-captcha-column').addClass('has-error');
        $('#signup-createaccount-captcha-error').show();
    };

    /**
     * Hide the reCaptcha validation message
     */
    var hideRecaptchaError = function() {
        // Remove the aria attributes on the main recaptcha input field
        $('#recaptcha-response-field').removeAttr('aria-invalid aria-describedby');
        $('#signup-createaccount-captcha-error').hide();
        $('#signup-createaccount-captcha-column').removeClass('has-error');
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
            'email': values.email,
            'invitationToken': invitationInfo.token
        };

        oae.api.user.createUser(values.username, values.password, displayName, additionalOptions, values.recaptchaChallenge, values.recaptchaResponse, function(err, createdUser) {
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
        pageTitle = getPageTitle();
        authStrategyInfo = oae.api.authentication.getStrategyInfo('SIGN_UP');

        recaptchaEnabled = (authStrategyInfo.hasLocalAuth && oae.api.config.getValue('oae-principals', 'recaptcha', 'enabled'));
        recaptchaPublicKey = oae.api.config.getValue('oae-principals', 'recaptcha', 'publicKey');
        termsAndConditionsEnabled = oae.api.config.getValue('oae-principals', 'termsAndConditions', 'enabled');
    };

    /**
     * Render the title of the page for both the browser and page
     */
    var renderPageTitle = function() {
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
                var captchaContainer = $('#signup-createaccount-captcha-container')[0];
                Recaptcha.create(recaptchaPublicKey, captchaContainer, {theme: 'custom'});
            });

            // Hide the Recaptcha error when text is entered
            $('#recaptcha_response_field').on('keyup', hideRecaptchaError);

            // Add a consistent height to the bottom row containers
            $('#signup-createaccount-usercheck-container').addClass('signup-createaccount-captcha-create-has-captcha');
        } else {
            $('#signup-createaccount-captcha-container').hide();
        }
    };

    /**
     * Initialize the signup options template
     */
    var renderSignUpOptions = function() {
        // Render the signup options
        oae.api.util.template().render($('#signup-options-template'), {
            'authStrategyInfo': authStrategyInfo,
            'invitationInfo': invitationInfo,
            'recaptchaEnabled': recaptchaEnabled,
            'redirectUrl': signUpRedirectUrl,
            'termsAndConditionsEnabled': termsAndConditionsEnabled
        }, $('#signup-options-container'));

        setUpCreateAccountValidation();
        setUpReCaptcha();
    };

    init();
    renderPageTitle();
    renderSignUpOptions();
});
