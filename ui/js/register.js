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

require(['jquery', 'oae/api/oae.core'], function($, oae) {

    // Redirect the user back to the landing page if he is already logged in or if
    // creating an internal account isn't allowed
    if (!oae.data.me.anon || !oae.api.config.getValue('oae-authentication', 'local', 'allowAccountCreation')) {
        document.location = '/';
    }

    // Set the browser title
    oae.api.util.setBrowserTitle('__MSG__REGISTER__');

    return;















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
        var values = $('#create_account_form').serializeObject();

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
                
                var msg = 'Couldn\'t create your account.';
                try {
                    var json = JSON.parse(data.responseText);
                    msg = json.msg;
                } catch (err) {
                    // Swallow exception,
                    // something else went really wrong.
                    }
   
                    if (msg === 'Invalid reCaptcha token.') {
                    sakai_global.captcha.reload();
                    sakai_global.captcha.showError('create_account_input_error');
                } else {
                    showCreateUserError(msg);
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
            oae.api.i18n.translate('__MSG__AN_ERROR_HAS_OCCURRED__'),
            oae.api.i18n.translate('__MSG__CREATE_ACCOUNT_FAILURE__') + ' ' + sakai.api.Security.safeOutput(errorMessage),
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
        var url = sakai.config.URL.USER_EXISTENCE_SERVICE.replace(/__USERNAME__/g, $.trim(values.username));
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
        return ret;
    };

    ////////////////////
    // Event Handlers //
    ////////////////////


    /*
     * If the Cancel button is clicked, we redirect them back to the login page
     */
    var doBinding = function() {

        $('#username').on('keyup blur', function() {
            var username = $.trim($('#username').val());
            if (usernameEntered !== username) {
                usernameEntered = username;
                if (username && username.length > 2 && username.indexOf(' ') === -1) {
                    $('#username').removeClass('signup_form_error');
                    checkUserName(true, function(success) {
                        $('#create_account_username_error').hide();
                        if (success) {
                            $('#username').removeClass('signup_form_error');
                            $('#username').addClass('username_available_icon');
                            $('.' + $('#username')[0].id).removeClass('signup_form_error_label');
                        } else {
                            $('#username').removeClass('username_available_icon');
                        }
                    });
                } else {
                    $('#username').removeClass('username_available_icon');
                }
            }
        });

        var validateOpts = {
            rules: {
                username: {
                    minlength: 3,
                    nospaces: true,
                    validchars: true,
                    validusername: true
                },
                password: {
                    minlength: 4
                },
                password_repeat: {
                    equalTo: '#password'
                }
            },
            messages: {
                firstName: oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_FIRST_NAME__'),
                lastName: oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_LAST_NAME__'),
                email: {
                    required: oae.api.i18n.translate('__MSG__PLEASE_ENTER_A_VALID_EMAIL_ADDRESS__'),
                    email: oae.api.i18n.translate('__MSG__THIS_IS_AN_INVALID_EMAIL_ADDRESS__'),
                },
                username: {
                    required: oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_USERNAME__'),
                    minlength: oae.api.i18n.translate('__MSG__THE_USERNAME_SHOULD_BE_AT_LEAST_THREE_CHARACTERS_LONG__'),
                    nospaces: oae.api.i18n.translate('__MSG__THE_USERNAME_SHOULDNT_CONTAIN_SPACES__')
                },
                password: {
                    required: oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_PASSWORD__'),
                    minlength: oae.api.i18n.translate('__MSG__YOUR_PASSWORD_SHOULD_BE_AT_LEAST_FOUR_CHARACTERS_LONG__')
                },
                password_repeat: {
                    required: oae.api.i18n.translate('__MSG__PLEASE_REPEAT_YOUR_PASSWORD__'),
                    passwordmatch: oae.api.i18n.translate('__MSG__THIS_PASSWORD_DOES_NOT_MATCH_THE_FIRST_ONE__')
                }
            },
            'methods': {
                'validusername': {
                    'method': function(value, element) {
                        return this.optional(element) || checkUserName();
                    },
                    'text': oae.api.i18n.translate('__MSG__THIS_USERNAME_HAS_ALREADY_BEEN_TAKEN__')
                },
                'validchars': {
                    'method': function(value, element) {
                        return this.optional(element) || !(/[\<\>\\\/{}\[\]!@#\$%^&\*,]+/i.test(value));
                    },
                    'text': oae.api.i18n.translate('__MSG__CREATE_ACCOUNT_INVALIDCHAR__')
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

    doBinding();

});
