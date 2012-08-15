/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
require(['jquery', 'sakai/sakai.api.core', 'misc/zxcvbn', '//www.google.com/recaptcha/api/js/recaptcha_ajax.js'], function($, sakai) {

    sakai_global.createnewaccount = function() {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var defaultUserType = 'default';
        var pagestemplate = 'defaultuser';

        // Links and labels
        var checkUserNameLink = '#checkUserName';
        var buttonsContainer = '.create_account_button_bar';

        // Input fields
        var usernameField = '#username';
        var firstNameField = '#firstName';
        var lastNameField = '#lastName';
        var emailField = '#email';
        var passwordField = '#password';
        var passwordRepeatField = '#passwordRepeat';
        var captchaField = '#uword';

        // Error fields
        var usernameTaken = '#username_taken';
        var usernameShort = '#username_short';
        var usernameSpaces = '#username_spaces';
        var usernameEmpty = '#username_empty';
        var firstNameEmpty = '#firstName_empty';
        var lastNameEmpty = '#lastName_empty';
        var emailEmpty = '#email_empty';
        var emailInvalid = '#email_invalid';
        var passwordEmpty = '#password_empty';
        var passwordShort = '#password_short';
        var passwordRepeatEmpty = '#password_repeat_empty';
        var passwordRepeatNoMatch = '#password_repeat_nomatch';
        var errorFields = '.create_account_error_msg';
        var usernameLabel = '#username_label';
        var inputFields = '.create_account_input';
        var usernameAvailable = '#username_available';


        //CSS Classes
        var invalidFieldClass = 'invalid';
        var formContainer = '#create_account_form';
        var inputFieldHoverClass = 'input_field_hover';

        // Contains executable errors
        var errObj = [];

        ///////////////////////
        // Utility functions //
        ///////////////////////

        var usernameEntered = '';

        /**
         * Get all of the values out of the form fields. This will return
         * a JSON object where the keys are the names of all of the form fields, and the values are
         * the values entered by the user in those fields.
         */
        var getFormValues = function() {
            // Get the values from the form.
            var values = $(formContainer).serializeObject();

            // Get the values from the captcha form.
            var captchaValues = sakai_global.captcha.getProperties();

            // Add them to the form values.
            values = $.extend(true, {}, values, captchaValues);

            return values;
        };

        ///////////////////////
        // Creating the user //
        ///////////////////////

        /*
         * Function that will actually collect all of the values out of the form and
         * will try to create the new user
         */
        var doCreateUser = function() {
            var values = getFormValues();
            $('button').attr('disabled', 'disabled');
            $('input').attr('disabled', 'disabled');
            sakai.api.User.createUser(values.username, values.firstName, values.lastName, values.email, values.password, values.password, {
                recaptcha: {
                    challenge: values['recaptcha-challenge'],
                    response: values['recaptcha-response']
                }
            }, function(success, data) {
                if (success) {
                    // This will hide the Create and Cancel button and offer a link back to the login page

                    // Destroy the captcha
                    sakai_global.captcha.destroy();

                    // Wait for 2 seconds
                    setTimeout(function() {
                        sakai.api.User.login({
                            'username': values.username,
                            'password': values.password
                        }, function() {
                            // Relocate to the user home space
                            document.location = '/me?welcome=true';
                        });
                    }, 2000);
                }
                else {
                    $('button').removeAttr('disabled');
                    $('input').removeAttr('disabled');
                    if (data.status === 500 || data.status === 401) {
                        if (data.responseText.indexOf('Untrusted request') !== -1) {
                            sakai_global.captcha.reload();
                            sakai_global.captcha.showError("create_account_input_error");
                        } else {
                            showCreateUserError($(data.responseText).find('#Message').text());
                        }
                    } else {
                        showCreateUserError($(data.responseText).find('#Message').text());
                    }
                }
            });
        };

        /**
         * Displays an error if the user creation failed
         * @param {String} errorMessage The error message to display
         */
        var showCreateUserError = function(errorMessage){
            sakai.api.Util.notification.show(
                sakai.api.i18n.getValueForKey('AN_ERROR_HAS_OCCURRED'),
                sakai.api.i18n.getValueForKey('CREATE_ACCOUNT_FAILURE') + ' ' + sakai.api.Security.safeOutput(errorMessage),
                sakai.api.Util.notification.type.ERROR, true);
        };

        //////////////////////////////
        // Check username existence //
        //////////////////////////////

        /*
         * Check whether the username (eid) is valid and then check
         * whether the username already exists in the system.
         * checkingOnly will define whether we are just checking the existence,
         * and don't want to do anything else afterwards if set to true. If set
         * to false, it will start doing the actual creation of the user once
         * the check has been completed.
         */
        var checkUserName = function(checkingOnly, callback) {
            var values = getFormValues();
            var ret = false;
            var async = false;
            if (callback) {
                async = true;
            }
            // If we reach this point, we have a username in a valid format. We then go and check
            // on the server whether this eid is already taken or not. We expect a 200 if it already
            // exists and a 401 if it doesn't exist yet.
            var url = sakai.config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__/g, $.trim(values.username));
            if (errObj.length === 0) {
                $.ajax({
                    // Replace the preliminary parameter in the service URL by the real username entered
                    url: url,
                    cache: false,
                    async: async,
                    success: function() {
                        if (callback) {
                            callback(false);
                        }
                    },
                    error: function(xhr, textStatus, thrownError) {
                        // SAKIII-1736 - IE will interpret the 204 returned by the server as a
                        // status code 1223, which will cause the error clause to activate
                        if (xhr.status === 1223 || xhr.status === 409) {
                            ret = false;
                        } else {
                            ret = true;
                        }
                        if (callback) {
                            callback(ret);
                        }
                    }
                });
            }
            return ret;
        };

        var initCaptcha = function() {
            sakai.api.Widgets.widgetLoader.insertWidgets('captcha_box', false);
        };

        /**
         * Uses zxcvbn.js to determine the password strength of the user's
         * password, and displays a message inline
         */
        var checkPasswordStrength = function() {
            var currentPw = $.trim($('#password').val());
            if (currentPw) {
                // Run the zxcvbn test on the currentPw, passing in all
                // the current input values to use them as data points
                var strength = zxcvbn(currentPw,
                    [
                        $('#username').val(),
                        $('#firstName').val(),
                        $('#lastName').val(),
                        $('#email').val()
                    ]);
                var $strength = $('#password_strength');
                var score = 'zero';
                var strengthPhrase = 'STRENGTH_WEAK';
                // Determine the strength phrasing and class
                switch (strength.score) {
                    case 1:
                        score = 'one';
                        break;
                    case 2:
                        strengthPhrase = 'STRENGTH_GOOD';
                        score = 'two';
                        break;
                    case 3:
                        strengthPhrase = 'STRENGTH_STRONG';
                        score = 'three';
                        break;
                    case 4:
                        strengthPhrase = 'STRENGTH_VSTRONG';
                        score = 'four';
                        break;
                    default:
                        break;
                }
                // Remove all the classes and add in the new classes and text
                $strength
                    .removeClass()
                    .addClass('strength_' + score)
                    .text(sakai.api.i18n.getValueForKey(strengthPhrase));
                $('#password_strength').show();
            } else {
                $('#password_strength').hide();
            }
        };



        ////////////////////
        // Event Handlers //
        ////////////////////


        /*
         * If the Cancel button is clicked, we redirect them back to the login page
         */
        var doBinding = function() {

            $('#cancel_button').on('click', function(ev) {
                document.location = sakai.config.URL.GATEWAY_URL;
            });

            $('#username').on('keyup blur', function() {
                var username = $.trim($(usernameField).val());
                if (usernameEntered !== username) {
                    usernameEntered = username;
                    if (username && username.length > 2 && username.indexOf(' ') === -1) {
                        $(usernameField).removeClass('signup_form_error');
                        checkUserName(true, function(success) {
                            $('#create_account_username_error').hide();
                            if (success) {
                                $(usernameField).removeClass('signup_form_error');
                                $(usernameField).addClass('username_available_icon');
                                $('.' + $(usernameField)[0].id).removeClass('signup_form_error_label');
                            } else {
                                $(usernameField).removeClass('username_available_icon');
                            }
                        });
                    } else {
                        $(usernameField).removeClass('username_available_icon');
                    }
                }
            });

            $('#password').on('keyup', checkPasswordStrength);

            var validateOpts = {
                rules: {
                    password: {
                        minlength: 4
                    },
                    password_repeat: {
                        equalTo: '#password'
                    },
                    username: {
                        minlength: 3,
                        nospaces: true,
                        validchars: true,
                        reservedprefix: true,
                        validfirstchar: true,
                        validusername: true
                    }
                },
                messages: {
                    firstName: $(firstNameEmpty).text(),
                    lastName: $(lastNameEmpty).text(),
                    email: {
                        required: $(emailEmpty).text(),
                        email: $(emailInvalid).text()
                    },
                    username: {
                        required: $(usernameEmpty).text(),
                        minlength: $(usernameShort).text(),
                        nospaces: $(usernameSpaces).text()
                    },
                    password: {
                        required: $(passwordEmpty).text(),
                        minlength: $(passwordShort).text()
                    },
                    password_repeat: {
                        required: $(passwordRepeatEmpty).text(),
                        passwordmatch: $(passwordRepeatNoMatch).text()
                    }
                },
                'methods': {
                    'validusername': {
                        'method': function(value, element) {
                            return this.optional(element) || checkUserName();
                        },
                        'text': sakai.api.i18n.getValueForKey('THIS_USERNAME_HAS_ALREADY_BEEN_TAKEN')
                    },
                    'validchars': {
                        'method': function(value, element) {
                            return this.optional(element) || !(/[\<\>\\\/{}\[\]!@#\$%^&\*,]+/i.test(value));
                        },
                        'text': sakai.api.i18n.getValueForKey('CREATE_ACCOUNT_INVALIDCHAR')
                    },
                    'reservedprefix': {
                        'method': function(value, element) {
                            return this.optional(element) || (value.substr(0, 11) !== 'g-contacts-');
                        },
                        'text': sakai.api.i18n.getValueForKey('CREATE_ACCOUNT_RESERVED_PREFIX')
                    },
                    'validfirstchar': {
                        'method': function(value, element) {
                            return this.optional(element) || (value.substr(0, 1) !== '_');
                        },
                        'text': sakai.api.i18n.getValueForKey('CREATE_ACCOUNT_START_WITH')
                    }
                },
                submitHandler: function(form, validator) {
                    doCreateUser();
                    return false;
                }
            };
            sakai.api.Util.Forms.validate($('#create_account_form'), validateOpts);
        };

        $('#save_account').click(function() {
            sakai_global.captcha.hideError();
            $('.signup_form_column_labels label').removeClass('signup_form_error_label');
            $('.create_account_input_error').hide('');
        });

        var doInit = function() {
            // hide body first
            $('body').hide();

            // check if using internalaccountcreation is false if so redirect
            if (!sakai.config.Authentication.allowInternalAccountCreation) {
                document.location = sakai.config.URL.GATEWAY_URL;
            }
            else {
                $('body').show();
            }

            $(inputFields).on('mouseenter mouseleave', function(ev) {
                $(this).toggleClass(inputFieldHoverClass);
            });

            // Initialize the captcha widget.
            initCaptcha();
            doBinding();
        };

        var renderEntity = function() {
            $(window).trigger('sakai.entity.init', ['newaccount']);
        };

        $(window).on('sakai.entity.ready', function() {
            renderEntity();
        });

        renderEntity();
        doInit();

    };

    sakai.api.Widgets.Container.registerForLoad('createnewaccount');
});
