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
    var pagestemplate = "defaultuser";

    // Links and labels
    var checkUserNameLink = "#checkUserName ";
    var buttonsContainer = ".create_account_button_bar";
    var successMessage = "#success_message";
    var successMessageTitle = "#success_message_title";
    var successMessageValue = "#success_message_value";

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
    var usernameEmpty = usernameField + "_empty";
    var firstNameEmpty = firstNameField + "_empty";
    var lastNameEmpty = lastNameField + "_empty";
    var emailEmpty = emailField + "_empty";
    var emailInvalid = emailField + "_invalid";
    var passwordEmpty = passwordField + "_empty";
    var passwordShort = passwordField + "_short";
    var passwordRepeatEmpty = passwordRepeatField + "_empty";
    var passwordRepeatNoMatch = passwordRepeatField + "_nomatch";
    var captchaEmpty = captchaField + "_empty";
    var captchaNoMatch = captchaField + "_nomatch";
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

    var currentUserName;
    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Function that will check whether an email address is valid
     * @param String email
     *  The email address we want to check
     * @return boolean
     *  true:  the email address is valid.
     *  false: the email address is invalid.
     */
    var echeck = function(email) {
        var at="@";
        var dot=".";
        var lat=email.indexOf(at);
        var lstr=email.length;
        var ldot=email.indexOf(dot);

        // Check whether there is an @ sign in the email address, whether the first letter
        // is an @ sign or whether the last character of the email address is an @ sign
        if (email.indexOf(at)===-1 || email.indexOf(at)===0 || email.indexOf(at)===lstr){
           return false;
        }

        // Check whether there is a . sign in the email address, whether the first letter
        // is a . sign or whether the last character of the email address is a . sign
        if (email.indexOf(dot)===-1 || email.indexOf(dot)===0 || email.indexOf(dot)===lstr){
            return false;
        }

        // Check whether there is only 1 @ sign
        if (email.indexOf(at,(lat+1))!==-1){
            return false;
        }

        // Check whether there is no . directly behind the @ sign
        if (email.substring(lat-1,lat)===dot || email.substring(lat+1,lat+2)===dot){
            return false;
        }

        // Check whether there is a . sign behind the @ sign somewhere
        if (email.indexOf(dot,(lat+2))===-1){
            return false;
        }

        // Check whether there are no spaces in the email address
        if (email.indexOf(" ")!==-1){
            return false;
         }

         return true;
    };

    /**
     * Function that will check whether a field is empty or contains spaces only
     * @param String field
     *  ID of the field we would like to check
     * @return boolean
     *  true:  the field is empty or contains spaces only
     *  false: the field contains real input
     */
    var checkEmpty = function(field){
        var value = $(field).val();
        if (!value || value.replace(/ /g,"") === ""){
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get all of the values out of the form fields. This will return
     * a JSON object where the keys are the names of all of the form fields, and the values are
     * the values entered by the user in those fields.
     */
    var getFormValues = function(){
        // Get the values from the form.
        var values = sakai.api.UI.Forms.form2json($(formContainer));

        var nonEscaped = ["password", "username", "password_repeat", "recaptcha_response_field"];
        for (var i in values){
            if ($.inArray(i, nonEscaped) == -1) {
                values[i] = escape(values[i]);
            }
        };

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
            ":sakai:profile-import": $.toJSON(profileData),
            ":sakai:pages-template": "/var/templates/site/" + pagestemplate
        };
        $.ajax ({
            url : sakai.config.URL.CREATE_USER_SERVICE,
            type : "POST",
            data : data,
            success : function(data) {
                // This will hide the Create and Cancel button and offer a link back to the login page
                $(buttonsContainer).hide();
                // Destroy the captcha
                sakai.captcha.destroy();
                
                sakai.api.Util.notification.show($(successMessageTitle).html(), $(successMessageValue).html());
                
                // Wait for 2 seconds
                setTimeout(function(){
                    // Relocate to the my log in page
                    document.location = sakai.config.URL.GATEWAY_URL;
                }, 2000);
 
            },
            error: function(xhr, textStatus, thrownError) {
                if (xhr.status === 500 || xhr.status === 401) {
                    if (xhr.responseText.indexOf("Untrusted request") !== -1) {
                        setError(captchaField, captchaNoMatch, true);
                    }
                }
            }
        });

    };

    /**
     * Function that will take in a bunch of input fields and will check whether they
     * are empty. For all of those that are empty, we'll set the appropriate visual warning
     * @param Array fields
     *  Array of input fields we want to check in the form of
     *  [{id: "#field1", error: "#field1_error"},{id: "#field2", error: "#field2_error"},...]
     */
    var checkAllFieldsForEmpty = function(fields){
        for (var i = 0, j = fields.length; i < j; i++){
            if (checkEmpty(fields[i].id)){
                setError(fields[i].id,fields[i].error,true);
            }
        }
    };

    /*
     * Validate whether all of the fields have been filled out correctly
     * (Empty, non matching fields, length, ...)
     */
    var validateFields = function(){

        resetErrorFields();

        var fields = [{id: firstNameField, error: firstNameEmpty},{id: lastNameField, error: lastNameEmpty},{id: emailField, error: emailEmpty},
                      {id: usernameField, error: usernameEmpty},{id: passwordField, error: passwordEmpty},
                      {id: passwordRepeatField, error: passwordRepeatEmpty}];

        checkAllFieldsForEmpty(fields);

        // Check whether the entered email address has a valid format
        if (!echeck($(emailField).val())){
            errObj.push(function(){
                setError(emailField, emailInvalid)
            });
        }

        // Check whether the length of the password is at least 4, which is the minimum expected by the backend
        var pass = $(passwordField).val();
        if (pass.length < 4){
            errObj.push(function(){
                setError(passwordField, passwordShort)
            });
        }

        // Check whether the 2 entered passwords match
        var pass2 = $(passwordRepeatField).val();
        if (pass !== pass2){
            errObj.push(function(){
                setError(passwordRepeatField, passwordRepeatNoMatch)
            });
        }

        checkUserName();

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

        // Check whether the username is an empty string or contains of spaces only
        if (checkEmpty(usernameField)){
            errObj.push(function(){
                setError(usernameField, usernameEmpty)
            });
        }

        // Check whether the username contains spaces
        if (usernameEntered.indexOf(" ") !== -1){
            errObj.push(function(){
                setError(usernameField, usernameSpaces)
            });
        }

        // Check whether the length of the username is at least 3, which is the minimum length
        // required by the backend
        if (usernameEntered.length < 3){
            errObj.push(function(){
                setError(usernameField, usernameShort)
            });
        }

        // If we reach this point, we have a username in a valid format. We then go and check
        // on the server whether this eid is already taken or not. We expect a 200 if it already
        // exists and a 401 if it doesn't exist yet.
        if (errObj.length === 0) {
            $.ajax({
                // Replace the preliminary parameter in the service URL by the real username entered
                url: sakai.config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__/g, values[username]),
                cache: false,
                success: function(data){
                    setError(usernameField, usernameTaken);
                },
                error: function(xhr, textStatus, thrownError){
                    if (checkingOnly) {
                        resetErrorFields();
                        $(usernameAvailable).show();
                    }
                    else {
                        doCreateUser();
                    }
                }
            });
        } else{
            for(var i = 0; i < errObj.length; i++){
                errObj[i]();
            }
        }

        // Reset error Object
        errObj = [];
    };

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
        if(currentUserName !== $("#username").val()) {
            currentUserName = $("#username").val();
            resetErrorFields();
            checkUserName(true);
        }
    });

    // Hide error fields at start
    $(errorFields).hide();

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
};

sakai.api.Widgets.Container.registerForLoad("sakai.newaccount");