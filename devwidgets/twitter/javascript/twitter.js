/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/*global $, sdata, Config */

var sakai = sakai || {};

/**
 * @name sakai.twitter
 *
 * @class twitter
 *
 * @description
 * Twitter widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.twitter = function(tuid, showSettings){


    //////////////////////////////
    // Configuration Variables //
    /////////////////////////////

    var currentSubContainer = ""; // The current subcontainer (get/set)
    var twitterinfo; // JSON object containing all the settings + information for this widget


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $twitter_get_status =  $("#twitter_get_status", $rootel);
    var $twitter_main_container = $("#twitter_main_container", $rootel);
    var $twitter_message_container = $("#twitter_message_container", $rootel);
    var $twitter_set_status =  $("#twitter_set_status", $rootel);
    var $twitter_sub_container = $("#twitter_sub_container", $rootel);
    var $twitter_template_get_status = $("#twitter_template_get_status", $rootel);
    var $twitter_template_message = $("#twitter_template_message", $rootel);
    var $twitter_template_set_status = $("#twitter_template_set_status", $rootel);

    /**
     * Reset the values of the JSON object
     */
    var resetValues = function(){
        twitterinfo = {
            error: "",
            info: "",
            screen_name: "",
            password: ""
        };
    };

    /**
     * Render the template of a twitter container
     * @param {String} container Container that will be rendered
     */
    var renderTemplate = function(container){
        switch (container) {
            case "get_status":
                currentSubContainer = "get";
                $.TemplateRenderer($twitter_template_get_status, twitterinfo, $twitter_sub_container);
                break;
            case "set_status":
                currentSubContainer = "set";
                $.TemplateRenderer($twitter_template_set_status, twitterinfo, $twitter_sub_container);
                break;
            case "message":
                $.TemplateRenderer($twitter_template_message, twitterinfo, $twitter_message_container);
                break;
        }
    };

    /**
     * Sets the error message to the json object and renders the template
     * @param {String} errorInput Error message
     */
    var setError = function(errorInput){
        twitterinfo.error = errorInput;
        renderTemplate("message");
    };

    /**
     * Sets the info message to the json object and renders the template
     * @param {String} infoInput Info message
     */
    var setInfo = function(infoInput){
        twitterinfo.info = infoInput;
        renderTemplate("message");
    };

    /**
     * Clear the info and error messages
     */
    var clearErrorAndInfo = function(){
        setError("");
        setInfo("");
    };

    /**
     * Change the status for the user
     */
    var changeLocalStatus = function(){
        if (twitterinfo.status) {
            var basic = {
                "status": twitterinfo.status
            };

            var data = {
                "basic": $.toJSON(basic),
                "_charset_": "utf-8"
            };

            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/public/authprofile.json",
                type: "POST",
                data: data,
                success: function(data){
                    setInfo("successfullyupdated");
                },
                error: function(xhr, textStatus, thrownError){
                    setError("sendstatuserror");
                }
            });
        }
        else {
            setError("nostatusfound");
        }
    };

    /**
     * Parse the twitter status object
     * @param {String} response JSON response from the server
     * @param {Boolean} exists Check if the twitter status exists
     */
    var parseTwitterStatus = function(response, exists){
        if (exists && response.length > 0) {
            twitterinfo.status = response[0].text;
            changeLocalStatus();
        }
        else {
            setError("nolaststatus");
        }
    };

    /**
     * Parse the response after the update
     * @param {Object} response JSON response that you get back after updating the status on the server
     * @param {Boolean} exists Whether the update was successful or not
     */
    var parseTwitterResponse = function(response, exists){
        if (exists) {
            setInfo("successfullyupdatedtwitter");
        }
        else {
            setError("noupdate");
        }
    };

    /**
     * Set the screenname of the JSON object
     * @param {Boolean} check If true, perform a check if the field is empty or not
     */
    var setScreenName = function(check){
        var val = $("#twitter_input_screen_name", $rootel).val();
        if (!check) {
            twitterinfo.screen_name = val;
            return true;
        }
        else {
            if (!val || val.replace(/ /g, "") === "") {
                setError("inserttwittername");
                return false;
            }
            else {
                twitterinfo.screen_name = val;
                return true;
            }
        }
    };

    /**
     * Set the password to the json object
     */
    var setPassword = function(){
        var val = $("#twitter_input_password", $rootel).val();
        if (!val || val.replace(/ /g, "") === "") {
            setError("inserttwitterpassword");
            return false;
        }
        else {
            twitterinfo.password = val;
            return true;
        }
    };

    /**
     * Get the status from twitter
     */
    var getStatusFromTwitter = function(){
        if (setScreenName(true)) {
            var oPostData = {
                user: twitterinfo.screen_name
            };
            $.ajax({
                url: sakai.config.URL.TWITTER_GET_URL,
                success: function(data){
                    parseTwitterStatus(data, true);
                },
                error: function(xhr, textStatus, thrownError){
                    parseTwitterStatus(xhr.status, false);
                },
                data: oPostData
            });
        }
    };

    /**
     * Set the status to twitter
     */
    var setStatusToTwitter = function(){
        if (setScreenName(true) && setPassword()) {
            var currentBasic = sakai.data.me.profile.basic;
            if (currentBasic) {
                currentBasic = $.parseJSON(currentBasic);
            }
            if (currentBasic.status) {

                var oPostData = {
                    ":basic-user": twitterinfo.screen_name,
                    ":basic-password": twitterinfo.password,
                    status: currentBasic.status,
                    "_charset_": "utf-8"
                };

                $.ajax({
                    url: sakai.config.URL.TWITTER_POST_URL,
                    type: "POST",
                    success: function(data){
                        parseTwitterResponse(data, true);
                    },
                    error: function(xhr, textStatus, thrownError){
                        parseTwitterResponse(xhr.status, false);
                    },
                    data: oPostData
                });
            }
            else {
                setError("emptysakaistatus");
            }
        }
    };

    /**
     * Show a sub container
     * @param {String} target Id of the container that needs to be shown
     */
    var showSubContainer = function(target){
        if (currentSubContainer !== target) {
            setScreenName(false);
            switch (target) {
                case "get":
                    renderTemplate("get_status");
                    break;
                case "set":
                    renderTemplate("set_status");
                    break;
            }
            clearErrorAndInfo();
        }
    };

    /**
     * Add binding to the various elements in the twitter widget
     */
    var addBinding = function(){

        // Bind the submit event on the get status form
        $twitter_get_status.live("submit", function(){
            clearErrorAndInfo();
            getStatusFromTwitter();
            return false;
        });

        // Bind the submit event on the set status form
        $twitter_set_status.live("submit", function(){
            clearErrorAndInfo();
            setStatusToTwitter();
            return false;
        });

        // Bind the radiobuttons to switch between 2 views
        $("input[name=twitter_input_get_set]").bind("click", function(e, ui){
            showSubContainer(e.target.id.replace("twitter_input_", ""));
        });
    };

    /**
     * Function that will be launched if the widget is loaded
     */
    var init = function(){
        resetValues();
        renderTemplate("get_status");
        addBinding();
        renderTemplate("error");

        $twitter_main_container.show();
    };
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("twitter");