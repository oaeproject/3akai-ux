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


/*global Querystring, Config, $,  set_cookie */


var sakai = sakai || {};

sakai.login = function(){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var redirectUrl = sakai.config.URL.MY_DASHBOARD_URL;
    var usernameField = "username";
    var passwordField = "password";
    var failMessage = "#login-failed";
    var loadingMessage = "#login-loader";
    var registerLink = "#register_here";
    var loginButton = "#loginbutton";
    var loginDefault = "#login-default";
    var loginExternal = "#login-external";
    var loginExternalSystem = loginExternal + "-system";
    var loginExternalButton = loginExternal + "-button";
    var loginForm = "#login-container";

    var currentUserName; 
    var currentPassword;

    /////////////////////
    // Login functions //
    /////////////////////

    /**
     * This will determine whether there is a valid session. If there is, we'll
     * redirect to the URL requested or the personal dashboard if nothing has been provided.
     */
    var decideLoggedIn = function(data){

        var mejson = (data === undefined ? sakai.data.me : data);
        if (mejson.user.userid) {
            document.location = redirectUrl;
        } else {
            $(loadingMessage).hide();
            
            // check if internal is true or internal account creation is true show login
            if (sakai.config.Authentication.internal || sakai.config.Authentication.allowInternalAccountCreation) {
                $(loginButton).show();
                $(registerLink).show();
                $(loginDefault).show();
                if (data) {
                    $(failMessage).show();
                    $("#username").addClass("error");
                    $("#password").addClass("error");
                }
                // Set the cursor in the username field
                $("#" + usernameField).focus();
            } else {
                // loop through and render each external authentication system
                $.each(sakai.config.Authentication.external, function(index, value) {
                    var curNum = $('.login-external-system').length - 1;
                    var newNum = curNum + 1;
                    var newElem = $(loginExternalSystem + '0').clone().attr('id', 'login-external-system' + newNum);
                    newElem.children(':first').attr('id', 'login-external-button' + newNum).attr('login-external-button', 'login-external-button' + newNum);
                    $(loginExternalSystem + curNum).after(newElem);
                    $(loginExternalSystem + newNum + ' .login-external-label').text(sakai.api.Security.saneHTML(value.label));
                    if (value.description) {
                        $(loginExternalSystem + newNum + ' .login-external-description').text(sakai.api.Security.saneHTML(value.description));                    
                    }
                    $(loginExternalSystem + newNum + ' .login-external-url').text(sakai.api.Security.saneHTML(value.url));
                    $(loginExternalSystem + newNum).show();
                    
                    // bind external url
                    $(loginExternalButton + newNum).bind("click", function(){
                        document.location = value.url;
                    });
                });
                $(loginExternal).show();
            }
        }

    };

    /**
     * This will be executed after the post to the login service has finished.
     * We send a new request to the Me service, explicity disabling cache by
     * adding a random number behind the URL, becasue otherwise it would get
     * the cached version of the me object which would still say I'm not logged
     * in.
     */
    var checkLogInSuccess = function(){

        $.ajax({
            url : sakai.config.URL.ME_SERVICE,
            cache : false,
            success : decideLoggedIn,
            error: function(xhr, textStatus, thrownError) {
                throw "Me service has failed";
            }
        });

    };

    /**
     * This will extract the username and password entered by the user, will hide the
     * login button and the register here link andwill put up a Signing in ... message
     * It will then call the login service and attempt to log you in. Once the login request
     * has completed, we'll do a new request to the me service and check whether we're
     * logged in
     */
    var performLogIn = function(){

        var values = sakai.api.UI.Forms.form2json($(loginForm));

        if (currentUserName !== values[usernameField] || currentPassword !== values[passwordField]) {
            currentUserName = values[usernameField];
            currentPassword = values[passwordField];
            
            $("#username").removeClass("error");
            $("#password").removeClass("error");

            $(failMessage).hide();
            $(loginButton).hide();
            $(registerLink).hide();
            $(loadingMessage).show();
            var data = {
                "username": values[usernameField],
                "password": values[passwordField]
            };
            
            // Perform the login operation
            sakai.api.User.login(data, checkLogInSuccess);
            
        }
        return false;

    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * When the user is trying to initiate the form submission,
     * we initiate the login function
     */
    $(loginForm).submit(performLogIn);


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
            redirectUrl = $.URLDecode(red);
        }

        // Check whether we are already logged in
        decideLoggedIn();
    };

    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.login");