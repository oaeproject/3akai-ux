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


/*global Querystring, Config, $, sdata, set_cookie */


var sakai = sakai || {};

sakai.index = function(){
	
	
	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var redirectUrl = Config.URL.MY_DASHBOARD;
	var loginButton = "#loginbutton";
	var usernameField = "#username";
	var passwordField = "#password";
	var failMessage = "#failed";
	var loadingMessage = "#loginloader";
	var registerLink = "#register_here";
	
	
	/////////////////////
	// Login functions //
	/////////////////////
	
	/*
	 * This will determine whether there is a valid session. If there is, we'll
	 * redirect to the URL requested or the personal dashboard if nothing has been provided. 
	 */
	var decideLoggedIn = function(data){
		var mejson = (data === undefined ? sdata.me : json_parse(data));
		if (mejson.preferences.uuid !== "anon" && mejson.preferences.uuid !== undefined) {
			document.location = redirectUrl;
		} else {
			$(loadingMessage).hide();
			$(loginButton).show();
			$(registerLink).show();
			if (data) {
				$(failMessage).show();
			}
		} 
	};
	
	/*
	 * This will be executed after the post to the login service has finished. 
	 * We send a new request to the Me service, explicity disabling cache by
	 * adding a random number behind the URL, becasue otherwise it would get
	 * the cached version of the me object which would still say I'm not logged
	 * in.
	 */
	var checkLogInSuccess = function(response, exists){
		
		sdata.Ajax.request({
			url : Config.URL.ME_SERVICE + "?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				decideLoggedIn(data,true);
			},
			onFail : function(data){
				throw "Me service has failed";
			}
		});
	
	};
	
	var performLogIn = function(){

		var username = $(usernameField).val();
		var password = $(passwordField).val();

		/*
		 * We check whether the username and password are empty (including trimming). If one of them is,
		 * we ignore this request to login and wait unti something has been filled out in both fields.
		 */
		if (!(!username || !password || username.replace(/ /g,"") === "" || password.replace(/ /g,"") === "")){

			$(failMessage).hide();
			$(loadingMessage).show();
			$(loginButton).hide();
			$(registerLink).hide();

			/*
			 * u : the username entered in the username textfield
			 * p : the password entered in the password textfield
			 * l : set to 1 because we want to perform a login action
			 * a : the login method set to FORM because we are doing a FORM-based login
			 */
			var requestbody = {"l":1, "a":"FORM", "u" : username, "p" : password};
	
			sdata.Ajax.request({
				url :Config.URL.LOGIN_SERVICE,
				httpMethod : "POST",
				onSuccess : function(data) {
					checkLogInSuccess(data,true);
				},
				onFail : function(status) {
					checkLogInSuccess(status,false);
				},
				postData : requestbody,
				contentType : "application/x-www-form-urlencoded"
			});

		}

	};
	
	
	//////////
	// Chat //
	//////////
	
	/*
	 * The chat bar keeps a cookie during your session that remembers which
	 * chat windows were open or active, so that state can be restored across
	 * all of the pages. When we have reached this page, it means that our
	 * session has ended and we can remove this cookie.
	 */
	set_cookie('sakai_chat','', null, null, null, "/", null, null );
	
	
	////////////////////
	// Event Handlers //
	////////////////////
	
	/*
	 * Check on every keypress whether the enter key has been pressed or not. If so,
	 * we initiate the login function
	 */
	$("input").bind("keydown", function(e){
		if (e.keyCode === 13){
			performLogIn();
		}
	});
	
	$(loginButton).bind("click", performLogIn);
	

	/////////////////////////////
	// Initialisation function //
	/////////////////////////////

	var doInit = function(){

		/*
		 * If you were logged in to the system, and the session has expired,
		 * it will redirect you to the login page with the URL of the page you
		 * were on encoded into a "url" querystring variable. We check whether
		 * the "url" querystring parameter is there, and if it is, we'll decode
		 * that URL and redirect to that location on successful login. If it isn't
		 * set, we'll redirect to the personal dashboard 
		 */
		var qs = new Querystring();
		var red = qs.get("url", false);
		if (red !== false){
			redirectUrl = sdata.util.URL.decode(red);
		}
		
		$(usernameField).focus();
		decideLoggedIn();

	};

	doInit();

};

sdata.registerForLoad("sakai.index");