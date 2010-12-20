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

/*global $ */

sakai.createnewaccount = function(){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var defaultUserType = "default";
    var pagestemplate = "defaultuser";

    // Links and labels
    var checkUserNameLink = "#checkUserName";
    var buttonsContainer = ".create_account_button_bar";
    var successMessage = "#success_message";
    var successMessageTitle = "#success_message_title";
    var successMessageValue = "#success_message_value";

    // Input fields
    var usernameField = "#username";
    var firstNameField = "#firstName";
    var lastNameField = "#lastName";
    var emailField = "#email";
    var passwordField = "#password";
    var passwordRepeatField = "#passwordRepeat";
    var captchaField = "#uword";

    // Error fields
    var usernameTaken = "#username_taken";
    var usernameShort = "#username_short";
    var usernameSpaces = "#username_spaces";
    var usernameEmpty = "#username_empty";
    var firstNameEmpty = "#firstName_empty";
    var lastNameEmpty = "#lastName_empty";
    var emailEmpty = "#email_empty";
    var emailInvalid = "#email_invalid";
    var passwordEmpty = "#password_empty";
    var passwordShort = "#password_short";
    var passwordRepeatEmpty = "#password_repeat_empty";
    var passwordRepeatNoMatch = "#password_repeat_nomatch";
    var captchaEmpty = "#uword_empty";
    var captchaNoMatch = "#uword_nomatch";
    var errorFields = ".create_account_error_msg";
    var usernameLabel = "#username_label";
    var inputFields = ".create_account_input";
    var usernameAvailable = "#username_available";

    //CSS Classes
    var invalidFieldClass = "invalid";
    var formContainer = "#create_account_form";
    var inputFieldHoverClass = "input_field_hover";

    // Contains executable errors
    var errObj = [];

    var currentUserName = "";
    ///////////////////////
    // Utility functions //
    ///////////////////////


    /**
     * Get all of the values out of the form fields. This will return
     * a JSON object where the keys are the names of all of the form fields, and the values are
     * the values entered by the user in those fields.
     */
    var getFormValues = function(){
        // Get the values from the form.
        var values = $(formContainer).serializeObject();

        var nonEscaped = ["password", "username", "password_repeat", "recaptcha_response_field"];
        for (var i in values){
            if ($.inArray(i, nonEscaped) == -1) {
                values[i] = escape(values[i]);
            }
        }

        // Get the values from the captcha form.
        var captchaValues = sakai.captcha.getProperties();

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
    var doCreateUser = function(){
        var values = getFormValues();
        $("button").attr("disabled", "disabled");
        $("input").attr("disabled", "disabled");
        sakai.api.User.createUser(values.username, values.firstName, values.lastName, values.email, values.password, values.password,
                {
                    recaptcha: {challenge: values["recaptcha-challenge"], response: values["recaptcha-response"]}
                }, function(success, data) {
            if (success) {
                // This will hide the Create and Cancel button and offer a link back to the login page

                // Destroy the captcha
                sakai.captcha.destroy();

                sakai.api.Util.notification.show($(successMessageTitle).html(), $(successMessageValue).html());

                // Wait for 2 seconds
                setTimeout(function(){
                    // Relocate to the my log in page
                    document.location = sakai.config.URL.GATEWAY_URL;
                }, 2000);
            } else {
                $("button").removeAttr("disabled");
                $("input").removeAttr("disabled");
                if (data.status === 500 || data.status === 401) {
                    if (data.responseText.indexOf("Untrusted request") !== -1) {
                        $(captchaNoMatch).show();
                        sakai.captcha.reload();
                    }
                }
            }
        });
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
    var checkUserName = function(checkingOnly){

        $(usernameField).removeClass("error");
        $("#username_error_container label").hide();

        var values = getFormValues();
        var ret = false;
        // If we reach this point, we have a username in a valid format. We then go and check
        // on the server whether this eid is already taken or not. We expect a 200 if it already
        // exists and a 401 if it doesn't exist yet.
        if (errObj.length === 0) {
            $.ajax({
                // Replace the preliminary parameter in the service URL by the real username entered
                url: sakai.config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__/g, values.username),
                cache: false,
                async: false,
                error: function(xhr, textStatus, thrownError){
                    // SAKIII-1736 - IE will interpret the 204 returned by the server as a
                    // status code 1223, which will cause the error clause to activate
                    if (xhr.status === 1223){
                        ret = false;
                    } else {
                        ret = true;
                    }
                }
            });
        }
        return ret;
    };

    var initCaptcha = function() {
        sakai.api.Widgets.widgetLoader.insertWidgets("captcha_box", false);
    };


    ////////////////////
    // Event Handlers //
    ////////////////////


    /*
     * If the Cancel button is clicked, we redirect them back to the login page
     */
    var doBinding = function() {

        $("#cancel_button").bind("click", function(ev){
            document.location = sakai.config.URL.GATEWAY_URL;
        });

        $(checkUserNameLink).bind("click", function(){
            if(currentUserName !== $(usernameField).val() && $.trim($(usernameField).val()) !== "" && $(usernameField).val().length > 2) {
                currentUserName = $(usernameField).val();
                var success = checkUserName(true);
                if (success){
                    $(usernameAvailable).show();
                } else {
                    $(usernameField).addClass("error");
                    $(usernameTaken).show();
                }
            }
        });

        $(usernameField).bind("change keyup", function() {
            // if user name is entered enable button
            if ($(usernameField).val() !== "" && $.trim($(usernameField).val()).length > 2) {
                $(checkUserNameLink).removeAttr("disabled");
            } else {
                // disable button
                $(checkUserNameLink).attr("disabled","disabled");
            }
            if ($(usernameAvailable).is(":visible")) {
                $(usernameAvailable).hide();
            }
            $(usernameField).removeClass("error");
            $("#username_error_container label").hide();
        });

        /*
         * Once the user is trying to submit the form, we check whether all the fields have valid
         * input and try to create the new account
         */
        $.validator.addMethod("nospaces", function(value, element) {
            return this.optional(element) || (value.indexOf(" ") === -1);
        }, "* No spaces are allowed");

        $.validator.addMethod("validusername", function(value, element) {
            return this.optional(element) || (checkUserName());
        }, "* This username is already taken.");

        $.validator.addMethod("passwordmatch", function(value, element) {
            return this.optional(element) || (value === $(passwordField).val());
        }, "* The passwords do not match.");

        $("#create_account_form").validate({
            onclick:false,
            onkeyup:false,
            onfocusout:false,
            rules: {
                password: {
                    minlength: 4
                },
                password_repeat: {
                    passwordmatch: true
                },
                username: {
                    minlength: 3,
                    nospaces: true,
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
                    nospaces: $(usernameSpaces).text(),
                    validusername: $(usernameTaken).text()
                },
                password: {
                    required: $(passwordEmpty).text(),
                    minlength: $(passwordShort).text()
                },
                password_repeat:  {
                    required: $(passwordRepeatEmpty).text(),
                    passwordmatch: $(passwordRepeatNoMatch).text()
                }
            },
            submitHandler: function(form, validator) {
                doCreateUser();
            },
            errorPlacement: function(error, element) {
                error.appendTo(element.parent("td").parent("tr").next("tr").children("td")[1]);
            }
        });
    };

    var doInit = function(){
        // hide body first
        $('body').hide();

        // check if using internalaccountcreation is false if so redirect
        if (!sakai.config.Authentication.allowInternalAccountCreation && !sakai.config.Authentication.internal) {
            document.location = sakai.config.URL.GATEWAY_URL;
        }
        else {
            $('body').show();
        }
        // Input field hover
        // The jQuery hover strangely has a bug in FF 3.5 - fast mouse movement doesn't fire the out event...
        //$(".create_account_input").hover(function(ev) { $(ev.target).addClass(inputFieldHoverClass); }, function(ev) { $(ev.target).removeClass(inputFieldHoverClass); });
        // so we use this for now:

        $(inputFields).bind("mouseover", function(ev) { $(this).addClass(inputFieldHoverClass); });
        $(inputFields).bind("mouseout", function(ev) { $(this).removeClass(inputFieldHoverClass); });

        // Hide success message
        $(successMessage).hide();
        // Hide username available message
        $(usernameAvailable).hide();

        // Initialize the captcha widget.
        initCaptcha();
        doBinding();
    };

    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.createnewaccount");