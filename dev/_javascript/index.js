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
    var usernameField = "username";
    var passwordField = "password";
    var failMessage = "#login-failed";
    var loadingMessage = "#login-loader";
    var registerLink = "#register_here";
    var loginButton = "#loginbutton";
    var loginForm = "#login-container";


    /////////////////////
    // Login functions //
    /////////////////////

    /**
     * This will determine whether there is a valid session. If there is, we'll
     * redirect to the URL requested or the personal dashboard if nothing has been provided.
     */
    var decideLoggedIn = function(data){

        var mejson = (data === undefined ? sakai.data.me : $.evalJSON(data));
        if (mejson.user.userid) {
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

    /**
     * This will be executed after the post to the login service has finished.
     * We send a new request to the Me service, explicity disabling cache by
     * adding a random number behind the URL, becasue otherwise it would get
     * the cached version of the me object which would still say I'm not logged
     * in.
     */
    var checkLogInSuccess = function(){

        $.ajax({
            url : Config.URL.ME_SERVICE,
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

        var values = $.FormBinder.serialize($(loginForm));

        $(failMessage).hide();
        $(loginButton).hide();
        $(registerLink).hide();
        $(loadingMessage).show();

        /*
         * a : set to FORM because we're trying to do a FORM based login
         * u : the username entered in the username textfield
         * p : the password entered in the password textfield
         * l : set to 1 because we want to perform a login action
         */
        // -Fsakaiauth:un=user -Fsakaiauth:pw=pass -Fsakaiauth:login=1
        var data = {"sakaiauth:login" : 1, "sakaiauth:un" : values[usernameField], "sakaiauth:pw" : values[passwordField], "_charset_":"utf-8"};

        $.ajax({
            url : Config.URL.LOGIN_SERVICE,
            type : "POST",
            success : checkLogInSuccess,
            error : checkLogInSuccess,
            data : data
        });

        return false;

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

        // Set the cursor in the username field
        $("#" + usernameField).focus();
        // Check whether we are already logged in
        decideLoggedIn();

    };

    doInit();

};

sdata.container.registerForLoad("sakai.index");
