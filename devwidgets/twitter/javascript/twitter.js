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
/*global $, sdata, Config, addBinding */

var sakai = sakai || {};

sakai.twitter = function(tuid, showSettings){

    var currentSubContainer = ""; // The current subcontainer (get/set)
    var json = false; // json object
    var me; // me object
    var me_json; // json me object
    var rootel = $("#" + tuid);

    /**
     * Reset the values of the json object
     */
    var resetValues = function(){
        json = {};
        json.error = "";
        json.info = "";
        json.screen_name = "";
        json.password = "";
    };

    /**
     * Get the me object
     * @param {Boolean} refresh Refresh the me object or not
     */
    var getMe = function(){
        me = sakai.data.me;
        me_json = me.profile;
    };


    /**
     * Render the template of a container
     * @param {String} container Container that will be rendered
     */
    var renderTemplate = function(container){
        switch (container) {
            case "get_status":
                currentSubContainer = "get";
                $("#twitter_sub_container", rootel).html($.TemplateRenderer($("#twitter_template_get_status"), json));
                break;
            case "set_status":
                currentSubContainer = "set";
                $("#twitter_sub_container", rootel).html($.TemplateRenderer('twitter_template_set_status', json));
                break;
            case "message":
                $("#twitter_message_container", rootel).html($.TemplateRenderer('twitter_template_message', json));
                break;
        }
    };

    /**
     * Sets the error message to the json object and renders the template
     * @param {String} errorInput Error message
     */
    var setError = function(errorInput){
        json.error = errorInput;
        renderTemplate("message");
    };
    /**
     * Sets the info message to the json object and renders the template
     * @param {String} errorInput Error message
     */
    var setInfo = function(infoInput){
        json.info = infoInput;
        renderTemplate("message");
    };

    /**
     * Clears the error message
     */
    var clearError = function(){
        /** Only clear the error if there was one in the first place */
        if (json.error !== "") {
            setError("");
        }
    };

    /**
     * Clears the info message
     */
    var clearInfo = function(){
        /** Only clear the error if there was one in the first place */
        if (json.info !== "") {
            setInfo("");
        }
    };

    /**
     * Clear the info and error messages
     */
    var clearErrorAndInfo = function(){
        clearError();
        clearInfo();
    };

    /**
     * Change the status for the user
     */
    var changeLocalStatus = function(){
        if (json.status) {
            var basic = {};
            basic.status = json.status;

            var data = {
                "basic": $.toJSON(basic),
                "_charset_": "utf-8"
            };

            $.ajax({
                url: "/_user/public/" + sakai.data.me.user.userid + "/authprofile",
                type: "POST",
                data: data,
                success: function(data){
                    setInfo("Your status has been succesfully updated.");
                    var ev = {};
                    ev.value = json.status;
                },
                error: function(xhr, textStatus, thrownError){
                    setError("An error occurend when sending the status to the server.");
                }
            });
        }
        else {
            setError("No status from twitter found.");
        }
    };

    /**
     * Parse the twitter status object
     * @param {String} response Json response
     * @param {Boolean} exists Check if the discussion exists
     */
    var parseTwitterStatus = function(response, exists){
        var data = $.evalJSON(response);
        if (exists && data.length > 0) {
            json.status = "";
            json.status = data[0].text;
            changeLocalStatus();
        }
        else {
            setError("Could not find the last status for: " + json.screen_name);
        }
    };

    /**
     * Parse the response after the update
     * @param {Object} response
     * @param {Object} exists
     */
    var parseTwitterResponse = function(response, exists){
        if (exists) {
            //TODO check for a valid response in the json object
            //var data = $.evalJSON(response);
            setInfo("Your twitter status has been succesfully updated.");
        }
        else {
            setError("Could not update the twitter status.");
        }
    };

    /**
     * Set the screenname of the json object
     * @param {Boolean} check If true, perform a check if the field is empty or not
     */
    var setScreenName = function(check){
        var val = $("#twitter_input_screen_name", rootel).val();
        if (!check) {
            json.screen_name = val;
            return true;
        }
        else {
            if (!val || val.replace(/ /g, "") === "") {
                setError("Please insert your twitter name.");
                return false;
            }
            else {
                json.screen_name = val;
                return true;
            }
        }
    };

    /**
     * Set the password to the json object
     */
    var setPassword = function(){
        var val = $("#twitter_input_password", rootel).val();
        if (!val || val.replace(/ /g, "") === "") {
            setError("Please insert your password.");
            return false;
        }
        else {
            json.password = val;
            return true;
        }
    };

    /**
     * Get the status from twitter
     */
    var getStatusFromTwitter = function(){
        if (setScreenName(true)) {
            var oPostData = {
                user: json.screen_name
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
            var currentBasic = me_json.basic;
            if (currentBasic) {
                currentBasic = $.evalJSON(currentBasic);
            }
            if (currentBasic.status) {

                var oPostData = {
                    ":basic-user": json.screen_name,
                    ":basic-password": json.password,
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
                setError("Your sakai status is empty.");
            }
        }
    };

    /**
     * Show a sub container
     * @param {String} target Id of the container that needs to be shown
     */
    var showSubContainer = function(target){
        switch (target) {
            case "get":
                if (currentSubContainer != target) {
                    setScreenName(false);
                    renderTemplate("get_status");
                    addBinding("get_status");
                    clearErrorAndInfo();
                }
                break;
            case "set":
                if (currentSubContainer != target) {
                    setScreenName(false);
                    renderTemplate("set_status");
                    addBinding("set_status");
                    clearErrorAndInfo();
                }
                break;
        }
    };

    /**
     * Add binding
     * @param {String} container Container were the binding should be added
     */
    var addBinding = function(container){
        switch (container) {
            case "get_status":

                /**
             * TODO change the submit event to live("submit") as soon as jQuery supports it
             */
                $("#twitter_get_status").submit(function(){
                    clearErrorAndInfo();
                    getStatusFromTwitter();
                    return false;
                });
                $("#twitter_link_get_status", rootel).bind("click", function(e, ui){

                    // Execute the submit event on the parent form
                    $(this).parents().filter("form").trigger("submit");
                });

                renderTemplate("message");

                break;
            case "set_status":

                /**
             * TODO change the submit event to live("submit") as soon as jQuery supports it
             */
                $("#twitter_set_status").submit(function(){
                    clearErrorAndInfo();
                    setStatusToTwitter();
                    return false;
                });
                $("#twitter_input_password").bind("keypress", function(e){
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code === 13) { // Enter keycode
                        // Execute the submit event on the parent form
                        $(this).parents().filter("form").trigger("submit");
                    }
                });
                $("#twitter_link_set_status", rootel).bind("click", function(e, ui){

                    // Execute the submit event on the parent form
                    $(this).parents().filter("form").trigger("submit");
                });
                break;
        }

        /**
         * Bind the radiobuttons to switch between 2 views
         */
        $("input[name=twitter_input_get_set]").bind("click", function(e, ui){
            showSubContainer(e.target.id.replace("twitter_input_", ""));
        });
    };

    /**
     * Function that will be launched if the widget is loaded
     */
    var init = function(){
        getMe();
        resetValues();
        renderTemplate("get_status");
        addBinding("get_status");
        renderTemplate("error");

        $("#twitter_main_container").show();
    };
    init();
};

sdata.widgets.WidgetLoader.informOnLoad("twitter");