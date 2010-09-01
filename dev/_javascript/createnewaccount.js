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


/*global Config, $ */


var sakai = sakai || {};

sakai.newaccount = function(){


    /*global checkUserName */

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var defaultUserType = "default";

    // Links and labels
    var checkUserNameLink = "#checkUserName ";
    var buttonsContainer = ".create_account_button_bar";
    var successMessage = "#success_message";

    // Input fields
    var username = "username";
    var firstName = "firstName";
    var lastName = "lastName";
    var email = "email";
    var password = "password";
    var passwordRepeat = "password_repeat";
    var captcha = "uword";
    var usernameField = "#" + username;
    var firstNameField = "#" + firstName;
    var lastNameField = "#" + lastName;
    var emailField = "#" + email;
    var passwordField = "#" + password;
    var passwordRepeatField = "#" + passwordRepeat;
    var captchaField = "#" + captcha;

    // Error fields
    var usernameTaken = usernameField + "_taken";
    var usernameShort = usernameField + "_short";
    var usernameSpaces = usernameField + "_spaces";
    var usernameInvalid = usernameField + "_invalid";
    var usernameEmpty = usernameField + "_empty";
    var firstNameEmpty = firstNameField + "_empty";
    var firstNameInvalid = firstNameField + "_invalid";
    var lastNameEmpty = lastNameField + "_empty";
    var lastNameInvalid = lastNameField + "_invalid";
    var emailEmpty = emailField + "_empty";
    var emailInvalid = emailField + "_invalid";
    var passwordEmpty = passwordField + "_empty";
    var passwordShort = passwordField + "_short";
    var passwordSpaces = passwordField + "_spaces";
    var passwordRepeatEmpty = passwordRepeatField + "_empty";
    var passwordRepeatNoMatch = passwordRepeatField + "_nomatch";
    var captchaEmpty = captchaField + "_empty";
    var captchaNoMatch = captchaField + "_nomatch";
    var errorFields = ".create_account_error_msg";
    var usernameLabel = "#username_label";
    var inputFields = ".create_account_input";
    var usernameAvailable = "#username_available";

    //CSS Classes
    var invalidFieldClass = "invalid_field";
    var formContainer = "#create_account_form";
    var inputFieldHoverClass = "input_field_hover";


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
        var values = sakai.api.UI.Forms.form2json($(formContainer));

        // Get the values from the captcha form.
        var captchaValues = sakai.captcha.getProperties();

        // Add them to the form values.
        jQuery.extend(values, captchaValues);

        return values;
    };


    ////////////////////
    // Error handling //
    ////////////////////

    var resetErrorFields = function(){
        $("input").removeClass(invalidFieldClass);
        $(errorFields).hide();
        $(usernameAvailable).hide();
    };

    /**
     * Function that will visually mark a form field as an
     * invalid field.
     * @param String field
     *  JQuery selector of the input box we want to show as invalid
     * @param String errorField
     *  JQuery selector of the error message that needs to be shown.
     * @param boolean noReset
     *  Parameter that specifies whether we need to make all of the
     *  fiels valid again first
     */
    var setError = function(field,errorField, noReset){
        if (!noReset) {
            resetErrorFields();
        }
        $(field).addClass(invalidFieldClass);
        $(errorField).show();
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
        var profileData = {}; profileData.basic = {}; profileData.basic.elements = {};
        var keys = ["firstName", "lastName", "email"];
        $(keys).each(function(i, key) {
            profileData.basic.elements[key] = {};
            profileData.basic.elements[key].value = values[key];
        });
        profileData.basic.access = "everybody";
        var data = {
            ":create-auth": "reCAPTCHA.net",
            ":recaptcha-challenge": values["recaptcha-challenge"],
            ":recaptcha-response": values["recaptcha-response"],
            "email": values[email],
            "pwd": values[password],
            "pwdConfirm": values[password],
            ":name": values[username],
            "_charset_": "utf-8",
            ":sakai:profile-import": $.toJSON(profileData)
        };
        $.ajax ({
            url : sakai.config.URL.CREATE_USER_SERVICE,
            type : "POST",
            data : data,
            success : function(data) {
                // This will hide the Create and Cancel button and offer a link back to the login page
                $(buttonsContainer).hide();
                $(successMessage).show();

                // Destroy the captcha
                sakai.captcha.destroy();
            },
            error: function(xhr, textStatus, thrownError) {
                if (xhr.status === 500) {
                    if (xhr.responseText.indexOf("Untrusted request") !== -1) {
                        setError(captchaField, captchaNoMatch, true);
                    }
                }
            }
        });

    };

    /*
     * Validate whether all of the fields have been filled out correctly
     * (Empty, non matching fields, length, ...)
     */
    var validateFields = function(){

        resetErrorFields();

        // if all fields in form is valid
        // check if user name is valid
        if ($("#create_account_form").valid()) {
            checkUserName();
        }

        return false;

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

        var values = getFormValues();
        var usernameEntered = values[username];

        // if user name is not valid format
        // do not check user name
        if (!$("#username").valid()) {
            return false;
        }

        // If we reach this point, we have a username in a valid format. We then go and check
        // on the server whether this eid is already taken or not. We expect a 200 if it already
        // exists and a 401 if it doesn't exist yet.
        $.ajax({
            // Replace the preliminary parameter in the service URL by the real username entered
            url: sakai.config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__/g,values[username]),
            cache : false,
            success: function(data){
                setError(usernameField,usernameTaken);
            },
            error: function(xhr, textStatus, thrownError) {
                if (checkingOnly){
                    resetErrorFields();
                    $(usernameAvailable).show();
                } else {
                    doCreateUser();
                }
            }
        });

        return false;

    };

    /**
     * Use jquery validation plugin to define rules and message to display if error occur.
     *
     */
    var initValidation = function(){

        // Check if there are spaces in user name
        $.validator.addMethod("noSpace",function(value){
            return value.indexOf(" ") === -1;
        });

        // Check whether the username contains illegal characters
        $.validator.addMethod("invalid",function(value){
            return value.match(/^([\w\-\@]+)$/) && value.match(/^(?=.*[\w]).*$/) && (value.substr(0,2) !== 'g-');
        });

        // Check whether the value contains at least one alphabet
        $.validator.addMethod("containAlphabet",function(value) {
            return value.match(/^(?=.*[\a-zA-Z]).*$/);            
        });

        // define rules and messages
        $("#create_account_form").validate({

            // set error element to div tag
            errorElement: "div",

            // place error div in next row and second column of error element
            errorPlacement: function(error, element) {
               error.appendTo( element.parents("tr").next("tr").children("td").get(1) );
            },

            // if there is an error, highlight the textbox
            highlight: function(element, errorClass) {
                $(element).addClass(invalidFieldClass);
            },

            // remove highlight once value becomes valid
            unhighlight: function(element, errorClass) {
                $(element).removeClass(invalidFieldClass);
            },

            // add error class to div tag which display error
            errorClass:"create_account_error_msg",

            // define validation rules
            rules: {

                // first name must not be empty and must contain at least one alphabet
                firstName: {
                    required: true,
                    containAlphabet: "required"
                },

                // last name must not be empty and must contain at least one alphabet
                lastName: {
                    required: true,
                    containAlphabet: "required"
                },

                // email validation rules
                email: {

                    // email must not be empty
                    required: true,

                    // validate email format
                    email: true
                },

                // define user name validation rules
                username: {

                    // user name must not be empty
                    required: true,

                    // the length of user name must be at least 3
                    minlength: 3,

                    // user name must not contain spaces
                    // use of custom method
                    noSpace: "required",

                    // user name must not contain illegal characters
                    // use of custom method
                    invalid: "required"
                },

                // define password validation rules
                password: {

                    // password must not be empty
                    required: true,

                    // password should not contain space
                    noSpace: "required",

                    // the length of password must be at least 4 characters
                    minlength: 4
                },

                // define confirm password validation rules
                password_repeat: {

                    // confirm password must not be empty
                    required: true,

                    // confirm passwrod must equal to password
                    equalTo : "#password"
                }

            },
            // define messages to display if values are invalid
            messages: {

                // if firt name is empty, display message
                // Please enter your first name
                firstName: {
                    "required": $(firstNameEmpty).text(),
                    "containAlphabet": $(firstNameInvalid).text()
                },

                lastName: {
                    // if last name is empty, display message
                    // Please enter your last name
                    "required": $(lastNameEmpty).text(),
                    "containAlphabet": $(lastNameInvalid).text()
                },

                email: {

                    // if last name is empty, display message
                    // Please enter your email address
                    required: $(emailEmpty).text(),

                    // if email is empty, display message
                    // This is an invalid email address
                    email: $(emailInvalid).text()
                },
                username: {

                    // if user name is empty display message
                    // Please enter your username
                    required: $(usernameEmpty).text(),

                    // if length of user name is less than 3 characters, display
                    // The username should be at least 3 characters long
                    minlength: $(usernameShort).text(),

                    // if username contain spaces, display
                    // The username shouldn't contain spaces
                    noSpace: $(usernameSpaces).text(),

                    // if username contain spaces, display
                    // The username contains invalid characters
                    invalid: $(usernameInvalid).text()
                },
                password: {

                    // if username contain spaces, display
                    // Please repeat your password
                    required: $(passwordEmpty).text(),

                    // if username contain spaces, display
                    // The username shouldn't contain spaces
                    noSpace: $(passwordSpaces).text(),

                    // if password is less than 4 characters
                    // Your password should be 4 characters long
                    minlength: $(passwordShort).text()
                },
                password_repeat: {

                    // if confirm password is empty, display
                    // Please repeat your password
                    required: $(passwordRepeatEmpty).text(),

                    // if confirm password is not equal to password, display
                    // This password does not match the first one
                    equalTo: $(passwordRepeatNoMatch).text()
                }
            }
        });
    }

    var initCaptcha = function() {
        sakai.api.Widgets.widgetLoader.insertWidgets("captcha_box", false);
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Once the user is trying to submit the form, we check whether all the fields have valid
     * input and try to create the new account
     */
    $("#create_account_form").submit(validateFields);

    /*
     * If the Cancel button is clicked, we redirect them back to the login page
     */
    $("#cancel_button").bind("click", function(ev){
        document.location = sakai.config.URL.GATEWAY_URL;
    });

    $(checkUserNameLink).bind("click", function(){
        resetErrorFields();
        checkUserName(true);
    });

    // Hide error fields at start
    $(errorFields).hide();

    // Input field hover
    // The jQuery hover strangely has a bug in FF 3.5 - fast mouse movement doesn't fire the out event...
    //$(".create_account_input").hover(function(ev) { $(ev.target).addClass(inputFieldHoverClass); }, function(ev) { $(ev.target).removeClass(inputFieldHoverClass); });
    // so we use this for now:

    $(inputFields).bind("mouseover", function(ev) { $(ev.target).addClass(inputFieldHoverClass); });
    $(inputFields).bind("mouseout", function(ev) { $(ev.target).removeClass(inputFieldHoverClass); });

    // Hide success message
    $(successMessage).hide();

    // Hide username available message
    $(usernameAvailable).hide();

    // Initialize the captcha widget.
    initCaptcha();

    // Validate the form when submitted
    // define validation rules for elements in the form
    // also define messages to be displayed when value is not valid
    initValidation();
};

sakai.api.Widgets.Container.registerForLoad("sakai.newaccount");