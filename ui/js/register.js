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

require(['jquery', 'oae.core', '//www.google.com/recaptcha/api/js/recaptcha_ajax.js'], function($, oae) {

    var recaptchaEnabled = oae.api.config.getValue('oae-principals', 'recaptcha', 'enabled') === true;

    // Redirect the user back to the landing page if he is already logged in or if
    // creating an internal account isn't allowed
    if (!oae.data.me.anon || !oae.api.config.getValue('oae-authentication', 'local', 'allowAccountCreation')) {
        oae.api.util.redirect().redirectToLogin();
    }

    // Set the browser title
    oae.api.util.setBrowserTitle('__MSG__REGISTER__');

    ////////////////
    // Re-captcha //
    ////////////////

    /**
     * Set up a reCaptcha container that will used to verify
     * that the current user is a real human
     */
    var setUpCaptcha = function() {
        var captchaContainer = $('#register_captcha_container')[0];
        Recaptcha.create(oae.api.config.getValue('oae-principals', 'recaptcha', 'publicKey'), captchaContainer, {theme: 'clean'});
    };

    /**
     * Show a validation message for reCaptcha
     */
    var hideRecaptchaError = function() {
        // Remove the aria attributes on the main recaptcha input field
        $('#recaptcha_response_field').removeAttr('aria-invalid aria-describedby');
        $('#register_captcha_error').hide();
        $('#register_captcha_container').removeClass('oae-error');
    };

    /**
     * Show a validation message for reCaptcha
     */
    var showRecaptchaError = function() {
        // Set the aria attributes on the main recaptcha input field
        $('#recaptcha_response_field').attr({
            'aria-invalid': 'true',
            'aria-describedby': 'register_captcha_error'
        });
        $('#register_captcha_error').show();
        $('#register_captcha_container').addClass('oae-error');
    };

    /*!
     * Hide the recaptcha validation error when clicking submit
     */
    $('#register_create_account').click(hideRecaptchaError);

    ///////////////////
    // Register form //
    ///////////////////

    /**
     * Verify whether or not the entered username already exists as a login id on the
     * current tenant. This will happen synchronously when it is part of the form
     * validation
     * 
     * @param  {Function}   [callback]              Standard callback function.
     * @param  {Boolean}    [callback.available]    Whether or not the username is available
     * @return {Boolean}                            When no callback is provided, this function will be synchronous and will return whether or not the username is available
     */
    var isUserNameAvailable = function(callback) {
        // If we reach this point, we have a username in a valid format.
        var username = $.trim($('#username').val());

        // We check if the userid is still available on the current tenant. 
        // We expect a 200 if it already exists and a 404 if it doesn't exist yet.
        var available = false;
        $.ajax({
            url: '/api/auth/exists/' + username,
            async: callback ? true : false,
            success: function() {
                // The username already exists
                if (callback) {
                    callback(false);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                // The username is still available
                if (callback) {
                    callback(true);
                } else {
                    available = true;
                }
            }
        });
        return available;
    };

    /**
     * Set up the validation on the register form, including the error messages
     */
    setUpValidation = function() {
        var validateOpts = {
            'rules': {
                'username': {
                    'minlength': 3,
                    'nospaces': true,
                    'validchars': true,
                    'validusername': true
                },
                'password': {
                    'minlength': 6
                },
                'password_repeat': {
                    'equalTo': '#password'
                }
            },
            'messages': {
                'firstName': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_FIRST_NAME__'),
                'lastName': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_LAST_NAME__'),
                'email': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_A_VALID_EMAIL_ADDRESS__'),
                    'email': oae.api.i18n.translate('__MSG__THIS_IS_AN_INVALID_EMAIL_ADDRESS__'),
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
                }
            },
            'methods': {
                'validusername': {
                    'method': function(value, element) {
                        return this.optional(element) || isUserNameAvailable();
                    },
                    'text': oae.api.i18n.translate('__MSG__THIS_USERNAME_HAS_ALREADY_BEEN_TAKEN__')
                },
                'validchars': {
                    'method': function(value, element) {
                        return this.optional(element) || !(/[\<\>\\\/{}\[\]!@#\$%^&\*,:]+/i.test(value));
                    },
                    'text': oae.api.i18n.translate('__MSG__CREATE_ACCOUNT_INVALIDCHAR__')
                }
            },
            'submitHandler': createUser
        };
        oae.api.util.validation().validate($('#register_form'), validateOpts);
    };

    /**
     * Set up the check that verifies whether or not the entered username is still availble. This will
     * be done every time the user changes the username
     */
    var setUpUsernameCheck = function() {
        // Keep track of the previously entered username, so we don't send
        // unneccesary requests when the username hasn't actually changed
        var previousUsername = '';

        $('#username').on('keyup blur', function() {
            var username = $.trim($('#username').val());
            if (previousUsername !== username) {
                previousUsername = username;
                // Make sure that the username is acceptable
                if (username.length > 2 && username.indexOf(' ') === -1) {
                    isUserNameAvailable(function(available) {
                        // Show the available icon if the username is available, otherwise show the unavailable icon
                        available ? $('#username').addClass('register-username-available-icon') : $('#username').removeClass('register-username-available-icon');
                    });
                } else {
                    $('#username').removeClass('register-username-available-icon');
                }
            }
        });
    };

    /////////////////
    // Create user //
    /////////////////

    /**
     * Create the new user. This will be called after validation has succeeded
     */
    var createUser = function() {
        // Get the form values
        var values = $('#register_form').serializeObject();
        // Collect the recaptcha values
        if (recaptchaEnabled) {
            values['recaptchaChallenge'] = Recaptcha.get_challenge();
            values['recaptchaResponse'] = Recaptcha.get_response();
        }

        // Disable the register button during creation, so it can't be clicked
        // multiple times
        $('button, input').attr('disabled', 'disabled');

        // Create the user
        var displayName = values.firstName + ' ' + values.lastName;
        oae.api.user.createUser(values.username, values.password, displayName, null, values.recaptchaChallenge, values.recaptchaResponse, function(err, createdUser) {
            if (!err) {
                oae.api.authentication.login(values.username, values.password, function() {
                    // Relocate to the user home space
                    document.location = '/me?welcome=true';
                });
            } else {
                // Refresh recaptcha
                if (recaptchaEnabled) {
                    Recaptcha.reload();
                    showRecaptchaError();
                }
                // Unlock the register button again
                $('button, input').removeAttr('disabled');
            }
        });
    };

    if (recaptchaEnabled) {
        setUpCaptcha();
    } else {
        $('#register_create_account').addClass('no-recaptcha');
    }
    setUpValidation();
    setUpUsernameCheck();

});
