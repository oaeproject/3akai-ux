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

/*global $, Config */

sakai.account_preferences = function(){

    var me = sakai.data.me;
    var languages = {};


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var accountPreferences = "account_preferences";
    var accountPreferencesID = "#account_preferences";
    var accountPreferencesClass = ".account_preferences";

    // Containers
    var passChangeContainer =  accountPreferencesID + "_changePassContainer";

    // Forms
    var accountPreferencesPasswordChange = accountPreferencesID + "_password_change";

    // Textboxes
    var currentPassTxt = "#curr_pass";
    var newPassTxt = "#new_pass";
    var newRetypePassTxt = "#retype_pass";

    // Buttons
    var saveNewPass = accountPreferencesID + "_saveNewPass";
    var saveRegional = accountPreferencesID + "_submitRegional";

    // classes
    var buttonDisabled = "s3d-disabled";

    // messages
    var generalMessageShowTime = 3000;
    var generalMessage = accountPreferencesClass + "_general_message";
    var generalMessageReg = accountPreferencesID + "_general_message_regional";
    var generalMessagePass = accountPreferencesID + "_general_message_pass";
    var errorMessage = accountPreferences + "_error_message";
    var normalMessage = accountPreferences + "_normal_message";

    // messages content
    var errorPassNotEqual = accountPreferencesID + "_error_passNotEqual";
    var errorIncorrectPass = accountPreferencesID + "_error_incorrectPass";
    var errorFailChangePass = accountPreferencesID + "_error_failChangePass";
    var errorFailChangePassBody = accountPreferencesID + "_error_failChangePassBody";
    var messagePassChanged = accountPreferencesID + "_message_passChanged";
    var messagePassChangedBody = accountPreferencesID + "_message_passChangedBody";
    var errorInvalidPass = accountPreferencesID + "_error_invalidPass";
    var errorFailChangeLang = accountPreferencesID + "_error_failChangeLang";
    var messageChangeLang = accountPreferencesID + "_message_ChangeLang";
    var errorPassSame = accountPreferencesID + "_error_passSame";

    // Comboboxes
    var timezonesContainer = "#time_zone";
    var languagesContainer = "#pass_language";

    // templates
    var languagesTemplate = accountPreferences + "_languagesTemplate";

    ///////////////////////
    // Utility functions //
    ///////////////////////

     /**
     * Shows a general message on the top screen
     * @param {String} msg    the message you want to display
     * @param {Boolean} isError    true for error (red block)/false for normal message(green block)
     * @param {Number} timeoutthe amout of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(msg, isError, hidebutton, generalMessage) {
        $(generalMessage).html(sakai.api.Security.saneHTML(msg));
        if (isError) {
            $(generalMessage).addClass(errorMessage);
            $(generalMessage).removeClass(normalMessage);
        }
        else {
            $(generalMessage).removeClass(errorMessage);
            $(generalMessage).addClass(normalMessage);
        }
        $(hidebutton).hide();
        $(generalMessage).show();
        window.setTimeout(function(){
            $(generalMessage).hide();
            $(hidebutton).show();
        },generalMessageShowTime);
    };


    /////////////////
    // Change pass //
    /////////////////

    /**
     * Check if the input given by the user is valid
     * @return {Boolean} true if input is valid
     */
    var checkIfInputValid =function(){
        var pass = $(currentPassTxt).val();
        var newPass1 = $(newPassTxt).val();
        var newPass2 = $(newRetypePassTxt).val();

        // check if the user didn't just fill in some spaces
        return (pass.replace(/ /g, "") !== "" && newPass1.replace(/ /g, "") !== "" && newPass2.replace(/ /g, "") !== "");
    };

    /**
     * Clears all the password fields
     */
    var clearPassFields = function(){
        $(currentPassTxt).val("");
        $(newPassTxt).val("");
        $(newRetypePassTxt).val("");
    };

    /**
     * Makes all the checks
     * are the new passwords equal
     *
     */
    var changePass = function(){
        var pass = $(currentPassTxt).val();
        var newPass1 = $(newPassTxt).val();
        var newPass2 = $(newRetypePassTxt).val();

            /*
             * oldPassword : the original password
             * password : the new password
             */
            var requestbody = {"oldPwd" : pass, "newPwd" : newPass1, "newPwdConfirm" : newPass2, "_charset_": "utf-8"};

            $.ajax({
                url :sakai.config.URL.USER_CHANGEPASS_SERVICE.replace(/__USERID__/, sakai.data.me.user.userid),
                type : "POST",
                data : requestbody,
                success : function(data) {

                    // show successful password change message through gritter
                    sakai.api.Util.notification.show($(messagePassChanged).html(), $(messagePassChangedBody).html());
                    // clear all the fields
                    clearPassFields();
                },
                error: function(xhr, textStatus, thrownError) {

                    // show error message through gritter
                    sakai.api.Util.notification.show($(errorFailChangePass).html(), $(errorFailChangePassBody).html());
                    // clear all the fields
                    clearPassFields();
                }
            });

    };


    //////////////////////////////
    // Change Country, Timezone //
    //////////////////////////////

    /**
     * Selects the language from the combobox based on the country and the language
     * @param {String} countrycode: ISO3 code of the country
     * @param {String} languageCode: ISO3 code of the language
     */
    var selectLanguage= function(countrycode, languageCode){
        $(languagesContainer + " option[value=" + languageCode + "_" + countrycode + "]").attr("selected", true);
    };

    /**
     * Selects the timezone from the combobox
     * @param {String} timezone: timezone
     */
    var selectTimezone= function(timezone){
        $(timezonesContainer + " option[value=" + timezone.name + "]").attr("selected", true);
    };

    /**
     * Puts the languages in a combobox
     * @param {Object} languages
     */
    var putLangsinCmb = function(languages){
        $(languagesContainer).html($.TemplateRenderer(languagesTemplate, languages));
        selectLanguage(me.user.locale.country, me.user.locale.language);
    };

    /**
     * Gets all the languages supported and puts them in a combobox
     */
    var getLanguages = function(){
        $.ajax({
            url : "/dev/_configuration/languages.json",
            success : function(data) {
                languages = $.extend(data, {}, true);
                putLangsinCmb(languages);
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to retrieve the language list.");
            }
        });
    };

    /**
     * Saves the regional properties to JCR
     */
    var saveRegionalToMe = function(){
        var language = $(languagesContainer).val();
        var locale = {"locale" : language, "timezone" : $(timezonesContainer).val(), "_charset_":"utf-8"};

        // if regional Setting and langauge is changed only then save the changes
        if (me.user.locale.timezone.name !== $(timezonesContainer).val() || language !== me.user.locale.language+"_"+me.user.locale.country) {
            $.ajax({
                data: locale,
                url: "/system/userManager/user/" + me.user.userid + ".update.html",
                type: "POST",
                success: function(data){

                    if (language !== me.user.locale.language + "_" + me.user.locale.country) {
                        // Reload the page if the language for a user has changed
                        sakai.api.Util.notification.show($(messageChangeLang).html(), $(messageChangeLang).html());
                            window.setTimeout(function(){
                            document.location.reload();
                        },2000);
                    }
                    else {
                        // Show successful regional setting change through gritter
                        sakai.api.Util.notification.show($(messageChangeLang).html(), $(messageChangeLang).html());
                        me.user.locale.timezone.name = $(timezonesContainer).val();
                    }

                },
                error: function(xhr, textStatus, thrownError){
                    // show regional setting error message through gritter
                    sakai.api.Util.notification.show($(errorFailChangeLang).html(), $(errorFailChangeLang).html());
                }
            });
        }
    };

    /**
     * Initialise form validation
     */
    var initValidation = function(){
        $(accountPreferencesPasswordChange).validate({
            errorClass: "account_preferences_error",
            errorElement:"div",
            rules:{
                curr_pass:{
                    required: true,
                    minlength: 4
                },
                new_pass:{
                    required: true,
                    minlength: 4
                },
                retype_pass:{
                    required: true,
                    minlength: 4,
                    equalTo: "#new_pass"
                }
            },
            messages: {
                retype_pass:{
                    "equalTo": "Please enter the same password twice."
                }
            },
            debug:true

        });
    }

    /**
     * Disable or enable elements
     * can take a single or multivalue jQuery obj
     */
    var enableElements = function (jQueryObj) {
        jQueryObj.removeAttr("disabled");
        jQueryObj.removeClass(buttonDisabled);
    };

    var disableElements = function (jQueryObj) {
        jQueryObj.attr("disabled", "disabled");
        jQueryObj.addClass(buttonDisabled);
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Binds the submit function on the password change form **/
    $(accountPreferencesPasswordChange).submit(function(){

        var pass = $(currentPassTxt).val();
        var newPass1 = $(newPassTxt).val();
        var newPass2 = $(newRetypePassTxt).val();

        if (pass === newPass1) {
            // Notify the user that he/she is trying to use the same pasword
            sakai.api.Util.notification.show("", $(errorPassSame).html());

            return false;
        }


        // check if the user enter valid data for old and new passwords
        if ($(accountPreferencesPasswordChange).valid()) {

            // change the password
            changePass();
        }
    });

    /** Binds all the regional settings select box change **/
    $("#time_zone, #pass_language").change(function(e){
        // enable the change regional setting button
        enableElements($(saveRegional));
    });

    /** Binds all the password boxes (keyup) **/
    $("input[type=password]", passChangeContainer).keyup(function(e){

        // If we'd use keypress for this then the input fields wouldn't be updated yet
        // check if the user didn't just fill in some spaces
        if(checkIfInputValid()){
            // enable the change pass button
            enableElements($(saveNewPass));
        }
        else{
            // disable the change pass button
            disableElements($(saveNewPass));
        }
    });

    /** Binds the save regional button **/
    $(saveRegional).click(function(){
        saveRegionalToMe();
    });


    /////////////////////////////
    // INITIALISATION FUNCTION //
    /////////////////////////////

    var doInit = function(){

        // An anonymous user shouldn't have access to this page
        if(me.user.anon){
            document.location = sakai.config.URL.GATEWAY_URL;
        } else {
            disableElements($(saveNewPass));
            disableElements($(saveRegional));
            selectTimezone(me.user.locale.timezone);
            getLanguages();
            initValidation();
        }

        // if allowpasswordchange is false then hide the regional setting
        if(!sakai.config.allowPasswordChange){
            $(passChangeContainer).hide();
        }
    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.account_preferences");
