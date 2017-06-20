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

require(['jquery','oae.core'], function($, oae) {

    // Set the page title
    oae.api.util.setBrowserTitle('__MSG__RESET_PASSWORD__');

    /**
     * SubmitFormResetPassword: emit the submit event so the form gets submitted
     */
    var submitFormResetPassword = function() {
        $('#resetpassword-input-password').unbind().submit();
    };

    /**
     * ResetPassword: Last Step for resetting password
     */
    var resetPassword = function() {
        $(document).on('submit','#resetpassword-input-password', function(event) {
            // disable redirect to other page
            event.preventDefault();

            // get the path of url
            var urlPath = location.pathname;

            // get value of url in a array
            var urlArray = urlPath.split("/");

            // get the length of urlArray
            var urlLength = urlArray.length;

            var username = urlArray[2];
            var secret = urlArray[3];
            var password = $.trim($('#resetpassword-new-password', $(this)).val());

            $.ajax({
                'url': '/api/auth/local/reset/password/' + username,
                'type': 'POST',
                'data': {
                    'newPassword': password,
                    'secret': secret
                },
                'success': function(data) {
                    //callback(null, data);
                    oae.api.util.notification(oae.api.i18n.translate('__MSG__CONGRATULATIONS__'), oae.api.i18n.translate('__MSG__YOUR_PASSWORD_HAS_BEEN_UPDATED__'));

                    // wait for 3 seconds and redirect the user to mainpage
                    setTimeout(
                        function() {
                            window.location.href = '/';
                        }, 3000);
                    },
                'error': function(data) {
                    oae.api.util.notification(oae.api.i18n.translate('__MSG__SORRY__'), oae.api.i18n.translate('__MSG__COULDNT_UPDATE_PASSWORD__'));
                }
            });
        });
    };


    /**
     * Set up the validation on the reset password form, including the error messages
     */
    var setUpResetPasswordValidation = function() {

        var validateOpts = {
            'rules': {
                'resetpassword-new-password': {
                    'minlength': 6
                },
                'resetpassword-retype-password': {
                    'equalTo': '#resetpassword-new-password'
                }
            },
            'messages': {
                'resetpassword-new-password': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_PASSWORD__'),
                    'minlength': oae.api.i18n.translate('__MSG__YOUR_PASSWORD_SHOULD_BE_AT_LEAST_SIX_CHARACTERS_LONG__')
                },
                'resetpassword-retype-password': {
                    'required': oae.api.i18n.translate('__MSG__PLEASE_REPEAT_YOUR_PASSWORD__'),
                    'passwordmatch': oae.api.i18n.translate('__MSG__THIS_PASSWORD_DOES_NOT_MATCH_THE_FIRST_ONE__')
                }
            },
            'methods': {
                'validchars': {
                    'method': function(value, element) {
                        return this.optional(element) || !(/[<>\\\/{}\[\]!#\$%\^&\*,:]+/i.test(value));
                    },
                    'text': oae.api.i18n.translate('__MSG__ACCOUNT_INVALIDCHAR__')
                }
            },
            'submitHandler': submitFormResetPassword
        };

        oae.api.util.validation().validate($('#resetpassword-input-password'), validateOpts);
    };

    resetPassword();
    setUpResetPasswordValidation();
});
