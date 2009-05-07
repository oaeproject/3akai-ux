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

var Config = Config || function(){ throw "Config file not available"; };
var $ = $ || function(){ throw "JQuery not available"; };
var sdata = sdata || function(){ throw "SData.js not available"; };
var json_parse = json_parse || function(){ throw "SData.js not available"; };
var jcap = jcap || function(){ throw "JCap (JavaScripts Captcha) is not available"; };

var sakai = sakai || {};

sakai.newaccount = function(){
	
	
	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var defaultUserType = "default";
	
	// Links and labels
	var checkUserNameLink = "#checkUserName";
	var buttonsContainer = "#buttons";
	var successMessage = "#success_message";
	
	// Input fields
	var userNameField = "#username";
	var firstnameField = "#firstname";
	var lastnameField = "#lastname";
	var emailField = "#email";
	var passwordField = "#password";
	var passwordRepeatField = "#password_repeat";
	var captchaField = "#uword";
	
	// Error fields
	var usernameTaken = userNameField + "_taken";
	var usernameShort = userNameField + "_short";
	var usernameSpaces = userNameField + "_spaces";
	var usernameEmpty = userNameField + "_empty";
	var firstnameEmpty = firstnameField + "_empty";
	var lastnameEmpty = lastnameField + "_empty";
	var emailEmpty = emailField + "_empty";
	var emailInvalid = emailField + "_invalid";
	var passwordEmpty = passwordField + "_empty";
	var passwordShort = passwordField + "_short";
	var passwordRepeatEmpty = passwordRepeatField + "_empty";
	var passwordRepeatNoMatch = passwordRepeatField + "_nomatch";
	var captchaEmpty = captchaField + "_empty";
	var captchaNoMatch = captchaField + "_nomatch";
	var errorFields = ".create-account-notification";
	var usernameLabel = "#username_label";
	
	//CSS Classes
	var invalidFieldClass = "invalid";
	var invalidLabelClass = "invalid_label";
	var validLabelClass = "valid_label";
	
	
	///////////////////////
	// Utility functions //
	///////////////////////
	
	/*
	 * Placeholder that will be replaced by the real checkUserName function. This
	 * is necessairy to comply with the JSLint rules
	 */
	var checkUserName = function(){};
	
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
	
	
	////////////////////
	// Error handling //
	////////////////////
	
	var resetErrorFields = function(){
		$("input").removeClass(invalidFieldClass);
		$(usernameLabel).removeClass(invalidLabelClass);
		$(usernameLabel).removeClass(validLabelClass);
		$(errorFields).hide();
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
		
		var firstname = $(firstnameField).val();
		var lastname = $(lastnameField).val();
		var email = $(emailField).val();
		var username = $(userNameField).val();
		var password = $(passwordField).val();
		var data = {"userType": defaultUserType, "firstName": firstname, "lastName": lastname, "email": email, "password": password, "eid": username};
		
		sdata.Ajax.request({
        	url : Config.URL.CREATE_USER_SERVICE,
        	httpMethod : "POST",
        	postData : data,
        	contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				// This will hide the Create and Cancel button and offer a link back to the login page
				$(buttonsContainer).hide();
				$(successMessage).show();
			},
			onFail: function(data){
				resetErrorFields();
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
		var totalEmpty = 0;
		for (var i = 0; i < fields.length; i++){
			if (checkEmpty(fields[i].id)){
				totalEmpty++;
				setError(fields[i].id,fields[i].error,true);	
			}
		}
		return totalEmpty;
	};
	
	/*
	 * Validate whether all of the fields have been filled out correctly
	 * (Empty, non matching fields, length, ...)
	 */
	var validateFields = function(){
		
		resetErrorFields();
		
		var fields = [{id: firstnameField, error: firstnameEmpty},{id: lastnameField, error: lastnameEmpty},{id: emailField, error: emailEmpty},
					  {id: userNameField, error: usernameEmpty},{id: passwordField, error: passwordEmpty},
					  {id: passwordRepeatField, error: passwordRepeatEmpty},{id: captchaField, error: captchaEmpty}];
		
		var totalEmpty = checkAllFieldsForEmpty(fields);
		// If totalEmpty is higher than 0, that means we have at least 1 field that is empty so we need to stop
		// executing the code.
		if (totalEmpty > 0){
			return false;
		}
		
		// Check whether the Captcha value entered is valid
		if (!jcap()){
			setError(captchaField, captchaNoMatch, true);
			return false;
		}
		
		// Check whether the entered email address has a valid format
		if (!echeck($(emailField).val())){
			setError(emailField, emailInvalid, true);
			return false;
		}
		
		// Check whether the length of the password is at least 4, which is the minimum expected by the backend
		var pass = $(passwordField).val();
		if (pass.length < 4){
			setError(passwordField, passwordShort, true);
			return false;
		}
		
		// Check whether the 2 entered passwords match
		var pass2 = $(passwordRepeatField).val();
		if (pass !== pass2){
			setError(passwordRepeatField, passwordRepeatNoMatch, true);
			return false;
		}
		
		// Everything is valid. Now go and check whether the username already exists in the system
		if (!checkUserName()){
			return false;
		}
		
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
	checkUserName = function(checkingOnly){
		
		var username = $(userNameField).val();
		// Check whether the username is an empty string or contains of spaces only
		if (checkEmpty(userNameField)){
			setError(userNameField,usernameEmpty);
			return false;
		}
		
		// Check whether the username contains spaces
		if (username.indexOf(" ") !== -1){
			setError(userNameField,usernameSpaces);
			return false;
		}
		
		// Check whether the length of the username is at least 3, which is the minimum length
		// required by the backend
		if (username.length < 3){
			setError(userNameField,usernameShort);
			return false;
		}
		
		// If we reach this point, we have a username in a valid format. We then go and check
		// on the server whether this eid is already taken or not. We expect a 200 if it already
		// exists and a 401 if it doesn't exist yet.
		sdata.Ajax.request({
            httpMethod: "GET",
			// Replace the preliminary parameter in the service URL by the real username entered
            url: Config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__/g,username) + "?sid=" + Math.random(),
            onSuccess: function(data){
				setError(userNameField,usernameTaken);
				return false;
			}, 
			onFail : function(data){
				if (checkingOnly){
					resetErrorFields();
					$(usernameLabel).addClass(validLabelClass);
					return true;
				} else {
					doCreateUser();
				}	
			}	
		});
		
	};
	
	
	////////////////////
	// Event Handlers //
	////////////////////
	
	/*
	 * Check on every keypress whether the enter key has been pressed or not. If so,
	 * we check whether all the fields have valid input and try to create the new account
	 */
	$("input").keypress(function(e){
		if (e.which === 13){
			validateFields();
		}
	});
	
	$("#save_account").bind("click", validateFields);
	
	/*
	 * If the Cancel button is clicked, we redirect them back to the login page
	 */
	$("#cancel_button").bind("click", function(ev){
		document.location = Config.URL.GATEWAY_URL;
	});
	
	$(checkUserNameLink).bind("click", function(){
		resetErrorFields();
		checkUserName(true);
	});
	
};

sdata.registerForLoad("sakai.newaccount");