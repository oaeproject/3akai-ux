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

/*global $, Config, sdata */

sakai.accountPreferences =function(){
	
	var me = sdata.me;
	var languages = {};
	
	/////////////////////////////
	// Configuration variables //
	/////////////////////////////	
	
	var accountPref = "accountPref";
	var accountPrefID = "#accountPref";
	var accountPrefClass = ".accountPref";
	
	// Containers
	var passChangeContainer =  accountPrefID + "_changePassContainer";
	
	// Textboxes
	var currentPassTxt = "#curr_pass";
	var newPassTxt = "#new_pass";
	var newRetypePassTxt = "#retype_pass";
	
	// Buttons
	var saveNewPass = accountPrefID + "_saveNewPass";
	var saveRegional = accountPrefID + "_submitRegional";
	
	// classes
	var buttonDisabled = "button-disabled";
	
	// messages
	var generalMessageShowTime = 3000;
	var generalMessage = accountPrefClass + "_general_message";
	var generalMessageReg = accountPrefID + "_general_message_regional";
	var generalMessagePass = accountPrefID + "_general_message_pass";
	var errorMessage = accountPref + "_error_message";
	var normalMessage = accountPref + "_normal_message";
	
	// messages content
	var errorPassNotEqual = accountPrefID + "_error_passNotEqual";
	var errorIncorrectPass = accountPrefID + "_error_incorrectPass";
	var errorFailChangePass = accountPrefID + "_error_failChangePass";
	var messagePassChanged = accountPrefID + "_message_passChanged";
	var errorInvalidPass = accountPrefID + "_error_invalidPass";
	var errorFailChangeLang = accountPrefID + "_error_failChangeLang";
	var messageChangeLang = accountPrefID + "_message_ChangeLang";
	
	// Comboboxes
	var timezonesContainer = "#time_zone";
	var languagesContainer = "#pass_language";
	
	// templates
	var timezonesTemplate = accountPref + "_timezonesTemplate";
	var languagesTemplate = accountPref + "_languagesTemplate";
	
	
	///////////////////////
	// Utility functions //
	///////////////////////
	
	 /**
     * Shows a general message on the top screen
     * @param {String} msg	the message you want to display
     * @param {Boolean} isError	true for error (red block)/false for normal message(green block)
     * @param {Number} timeoutthe amout of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(msg, isError, hidebutton, generalMessage) {
        $(generalMessage).html(msg);
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
		
		if(newPass1 === newPass2){
			/*
			 * oldPassword : the original password
			 * password : the new password
			 */
			var requestbody = {"oldPassword" : pass, "password" : newPass1};
	
			$.ajax({
				url :Config.URL.USER_CHANGEPASS_SERVICE.replace(/__USERID__/, me.preferences.uuid),
				type : "POST",
				success : function(data) {
					// update the user of the successful password change
					showGeneralMessage($(messagePassChanged).html(), false, saveNewPass, generalMessagePass);
					// clear all the fields
					clearPassFields();
				},
				error : function(status) {
					// the old password was incorrect
					if(status === 409){
						showGeneralMessage($(errorIncorrectPass).html(), true, saveNewPass, generalMessagePass);
					}
					// the new password's format was incorrect
					else if(status === 400){
						showGeneralMessage($(errorInvalidPass).html(), true, saveNewPass, generalMessagePass);
					}
					// the user is logged out
					else if(status === 401){
						document.location = Config.URL.GATEWAY_URL;
					}
					// some other error
					else{
						showGeneralMessage($(errorFailChangePass).html(), true, saveNewPass, generalMessagePass);
					}
					// clear all the fields
					clearPassFields();
				},
				data : requestbody
			});
		}
		else{
			// check if the passwords are equal
			showGeneralMessage($(errorPassNotEqual).html(), true, saveNewPass, generalMessagePass);
			// clear all the fields
			clearPassFields();
		}
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
		$(timezonesContainer + " option[value=" + timezone + "]").attr("selected", true);
	};
	
	/**
	 * Puts the languages in a combobox
	 * @param {Object} languages
	 */
	var putLangsinCmb = function(languages){
		$(languagesContainer).html($.Template.render(languagesTemplate, languages));
		selectLanguage(me.locale.country, me.locale.language);
	};
	
	/**
	 * Gets all the languages supported and puts them in a combobox
	 */
	var getLanguages = function(){
		$.ajax({
			url : "/dev/_configuration/languages.json",
			success : function(data) {
				languages = $.evalJSON(data);	
				putLangsinCmb(languages);
			},
			error: function(status){
				alert("Failed to retrieve timezones.");
			}
		});
	};
	
	/**
	 * Saves the regional properties to JCR
	 */
	var saveRegionalToMe = function(){
		var language = $(languagesContainer + " option:selected").val();
		var locale = {"language" : language, "timezone" : $(timezonesContainer + " option:selected").val()};
		$.ajax({
			url : Config.URL.USER_CHANGELOCALE_SERVICE.replace(/__USERID__/, me.preferences.uuid),
			type : "POST",
			success : function(data) {
				// update the user of the successful password change
				showGeneralMessage($(messageChangeLang).html(), false, saveRegional, generalMessageReg);
			},
			error : function(status) {
				// the user is logged out
				if(status === 401){
					document.location = Config.URL.GATEWAY_URL;
				}
				// some other error
				else{
					showGeneralMessage($(errorFailChangeLang).html(), true, saveRegional, generalMessageReg);
				}
			},
			data : locale
		});
	};
	

	////////////////////
	// Event Handlers //
	////////////////////
	
	/** Binds the save new pass button **/
	$(saveNewPass).click(function(){
		// check if the user didn't just fill in some spaces
		if (checkIfInputValid()) {
			// change the pass
			changePass();
		}
	});
	/** Binds all the password boxes (keypress) **/
	$("input[type=password]", passChangeContainer).keypress(function(e){
		// check if the user didn't just fill in some spaces
		if(checkIfInputValid()){
			// check if the user pressed the enter-button
			if(e.which === 13){
				// change the pass
				changePass();
			}
		}
	});
	/** Binds all the password boxes (keyup) **/
	$("input[type=password]", passChangeContainer).keyup(function(e){
		// If we'd use keypress for this then the input fields wouldn't be updated yet
		// check if the user didn't just fill in some spaces
		if(checkIfInputValid()){
			// enable the change pass button
			$(saveNewPass).removeClass(buttonDisabled);
		}
		else{
			// disable the change pass button
			$(saveNewPass).addClass(buttonDisabled);
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
		getLanguages();
		selectTimezone(me.locale.timezone);
	};
	doInit();
	
};

sdata.container.registerForLoad("sakai.accountPreferences");