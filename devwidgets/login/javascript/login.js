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

/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/misc/querystring.js (Querystring)
 */

/*global Querystring, Config, $,  set_cookie */


require(["jquery", "sakai/sakai.api.core", "/dev/lib/misc/querystring.js"], function($, sakai) {

    /**
     * @name sakai_global.login
     *
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.login = function(){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var redirectUrl = sakai.config.URL.MY_DASHBOARD_URL;
        var usernameField = "username";
        var passwordField = "password";
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
                if (sakai.config.Authentication.allowInternalAccountCreation){
                    $(registerLink).show();
                }

                if (sakai.config.Authentication.internal || sakai.config.Authentication.allowInternalAccountCreation) {
                    $(loginButton).show();
                    $(loginDefault).show();
                    if (data) {
                        $("#username").addClass("error");
                        $("#password").addClass("error");
                    }
                    // Set the cursor in the username field
                    $("#" + usernameField).focus();
                } else {
                    $("#login-external-container").html(sakai.api.Util.TemplateRenderer("login-external-template", sakai.config.Authentication));
                    $(loginExternal).show();
                }
            }
        };
    
        $("#username").bind("keydown", function(){
            $("#username").removeClass("error");
            $("#password").removeClass("error");
        });
        $("#password").bind("keydown", function(){
            $("#username").removeClass("error");
            $("#password").removeClass("error");
        });

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

            var values = $(loginForm).serializeObject();

            currentUserName = values[usernameField];
            currentPassword = values[passwordField];
            
            $("#username").removeClass("error");
            $("#password").removeClass("error");

            $(loginButton).hide();
            $(loadingMessage).css("display", "inline-block");
            var data = {
                "username": values[usernameField],
                "password": values[passwordField]
            };
            
            // Perform the login operation
            sakai.api.User.login(data, checkLogInSuccess);
        
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
                redirectUrl = decodeURIComponent(red);
            }

            // Check whether we are already logged in
            decideLoggedIn();

            $(window).trigger("ready.login.sakai");
        };

        doInit();
    };
    sakai.api.Widgets.Container.registerForLoad("login");
});
