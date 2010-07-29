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
/*global $, QueryString */

var sakai = sakai || {};

sakai.profile = function(){


    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    sakai.profile.main = {
        chatstatus: "",
        config: sakai.config.Profile.configuration,
        data: {},
        isme: false,
        currentuser: "",
        mode: {
            options: ["viewmy", "view", "edit"],
            value: "viewmy"
        },
        acls: {
            options: ["public", "institution", "contacts", "noone"],
            value: "public"
        },
        picture: "",
        status: "",
        validation: {}
    };

    var userprofile;
    var querystring; // Variable that will contain the querystring object of the page

    ///////////////////
    // CSS SELECTORS //
    ///////////////////

    var profile_class = ".profile";
    var $profile_actions = $("#profile_actions", profile_class);
    var $profile_actions_button_edit = $("#profile_actions_button_edit", profile_class);
    var $profile_actions_template = $("#profile_actions_template", profile_class);
    var $profile_error = $("#profile_error", profile_class);
    var $profile_error_form_errors = $("#profile_error_form_errors", $profile_error);
    var $profile_field_default_template = $("#profile_field_default_template", profile_class);
    var $profile_form = $("#profile_form", profile_class);
    var $profile_footer = $("#profile_footer", profile_class);
    var $profile_footer_button_update = $("#profile_footer_button_update", profile_class);
    var $profile_footer_button_dontupdate = $("#profile_footer_button_dontupdate", profile_class);
    var $profile_footer_template = $("#profile_footer_template", profile_class);
    var $profile_heading = $("#profile_heading", profile_class);
    var $profile_heading_template = $("#profile_heading_template", profile_class);
    var $profile_sectionwidgets_container = $("#profile_sectionwidgets_container", profile_class);
    var $profile_sectionwidgets_container_template = $("#profile_sectionwidgets_container_template", profile_class);


    ////////////////////
    // UTIL FUNCTIONS //
    ////////////////////

    /**
     * Change the mode of the current profile
     * @param {String} mode The mode for the profile (view | viewmy | edit)
     */
    var setProfileMode = function(mode){

        // Check the mode parameter
        if ($.inArray(mode, sakai.profile.main.mode.options) !== -1) {

            // Set the correct profile mode
            sakai.profile.main.mode.value = mode;

        }
        else {

            // Use the standard profile mode
            sakai.profile.main.mode.value = sakai.profile.main.mode.options[0];

            // Print a log message that the supplied mode isn't valid
            fluid.log("profile - changeProfileMode - the supplied mode '" + mode + "' is not a valid profile mode. Using the default mode instead");

        }

    };

    /**
     * Get the profile mode from the querystring
     */
    var getProfileMode = function(){

        if (querystring.contains("mode")) {
            return querystring.get("mode");
        }
        return false;

    };

    /**
     * Change the profile mode
     * This will fire a redirect
     * @param {String} mode The mode you want to change to
     */
    var changeProfileMode = function(mode){

         // Check the mode parameter
        if ($.inArray(mode, sakai.profile.main.mode.options) !== -1) {

            // Perform the redirect
            window.location = window.location.pathname + "?mode=" + mode;

        }

    };


    /**
     * Check whether the user is editing/looking at it's own profile or not
     * We do this because if it is the current user, we don't need to perform an extra search
     */
    var setIsMe = function(){

        // Check whether there is a user parameter in the querystring,
        // if so, check whether the userid is not the same as the user parameter
        if (querystring.contains("user") && querystring.get("user") !== sakai.data.me.user.userid) {
            sakai.profile.main.isme = false;
            currentuser = querystring.get("user");
        }
        else {
            sakai.profile.main.isme = true;
            currentuser = sakai.data.me.user.userid;
        }

    };

    /**
     * Check whether there is a valid picture for the user
     * @param {Object} profile The profile object that could contain the profile picture
     * @return {String}
     * The complete URL of the profile picture
     * Will be an empty string if there is no picture
     */
    var constructProfilePicture = function(profile){

        if (profile.basic.elements.picture && profile["rep:userId"]) {
            return "/~" + profile["rep:userId"] + "/public/profile/" + profile.basic.elements.picture.value.name;
        }
        else {
            return "";
        }

    };

    /**
     * Set the profile data for the user such as the status and profile picture
     */
    var setProfileData = function(callback){

        // Check whether the user is looking/editing it's own profile
        if (sakai.profile.main.isme) {

            // Set the profile picture for the user you are looking at
            // The actual location of the picture could be something like this: /~admin/public/profile/256x256_profilepicture
            sakai.profile.main.picture = constructProfilePicture(sakai.data.me.profile);

            // Set the status for the user you want the information from
            if(sakai.data.me.profile.basic && sakai.data.me.profile.basic.elements.status){
                sakai.profile.main.status = sakai.data.me.profile.basic.elements.status.value;
            }

            // Set the profile data object
            sakai.profile.main.data = $.extend(true, {}, sakai.data.me.profile);

            // Execute the callback function
            if (callback && typeof callback === "function") {
                callback();
            }

        }
        else {

            // We need to fire an Ajax GET request to get the profile data for the user
            $.ajax({
                data: {
                    "q": querystring.get("user")
                },
                url: sakai.config.URL.SEARCH_USERS,
                success: function(data){

                    // Check whether there are any results
                    if(data.results[0]){

                        // Set the correct userprofile data
                        userprofile = data.results[0];

                        // Set the profile picture
                        sakai.profile.main.picture = constructProfilePicture(userprofile);

                        // Set the status for the user you want the information from
                        if(userprofile.basic && userprofile.basic.elements.status){
                            sakai.profile.main.status = userprofile.basic.elements.status.value;
                        }

                        // Set the profile data object
                        sakai.profile.main.data = $.extend(true, {}, sakai.data.me.profile);
                    }

                },
                error: function(){
                    fluid.log("setProfilePicture: Could not find the user");
                },
                complete: function(data){

                    // Execute the callback function
                    if (callback && typeof callback === "function") {
                        callback();
                    }

                }
            });

        }

    };


    /**
     * Save the current profile data to the repository
     */
    var saveProfileData = function(){

        sakai.api.Server.saveJSON("/~" + currentuser + "/public/authprofile", sakai.profile.main.data, function(success, data){

            // Check whether is was successful
            if (success) {

                alert(success);

            }
            else {

                // Log an error message
                fluid.log("sakai.profile - saveProfileData - the profile data couldn't be saved successfully");

            }

        });

    };


    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to the footer elements
     */
    var addBindingFooter = function(){

        // Reinitialise jQuery objects
        $profile_footer_button_dontupdate = $($profile_footer_button_dontupdate.selector);
        //$profile_footer_button_update = $($profile_footer_button_update.selector);

        // Bind the don't update
        $profile_footer_button_dontupdate.bind("click", function(){

            // Change the profile mode
            changeProfileMode("viewmy");

        });

        // Bind the update method
        //$profile_footer_button_update.bind("click", function(){



            // Validate the profile data
            //validateProfileData();

            // Save the current profile data
            //saveProfileData();

            // Change the profile mode if the save was successful
            // changeProfileMode("viewmy");

        //});

    };

    /**
     * Add binding to the action elements
     */
    var addBindingActions = function(){

        // Reinitialise jQuery objects
        $profile_actions_button_edit = $($profile_actions_button_edit.selector);

        // Bind the edit button
        $profile_actions_button_edit.bind("click", function(){

            // Change the profile mode
            changeProfileMode("edit");

        });

    };

    /**
     * Add binding to the profile form
     */
    var addBindingForm = function(){

        // Reinitialize the jQuery form selector
        $profile_form = $($profile_form.selector);

        $profile_form.bind("submit", function(){

        });

        // Initialize the validate plug-in
        $profile_form.validate({
            debug: true,
            messages: {
                required: "test"
            },
            submitHandler: saveProfileData,
            invalidHandler: function(form, validator){

                // Remove all the current notifications
                sakai.api.Util.notification.removeAll();

                // Show a notification which states that you have errors
                sakai.api.Util.notification.show("", $profile_error_form_errors.text(), sakai.api.Util.notification.type.ERROR);
            },
            ignore: ".profilesection_validation_ignore", // Class
            errorClass: "profilesection_validation_error",
            validClass: "profilesection_validation_valid",
            ignoreTitle: true // Ignore the title attribute, this can be removed as soon as we use the data-path attribute
        });

    };

    /**
     * Add binding to all the elements on the page
     */
    var addBinding = function(){

        // Add binding to the actions elements
        addBindingActions();

        // Add binding to the profile form
        addBindingForm();

        // Add binding to footer elements
        addBindingFooter();

    };


    ////////////////////////
    // TEMPLATE FUNCTIONS //
    ////////////////////////

    /**
     * Render the profile site heading
     */
    var renderTemplateSiteHeading = function(){

        // Render the profile site heading
        $.TemplateRenderer($profile_heading_template, sakai.profile.main, $profile_heading);

    };

    var renderTemplateActions = function(){

        // Render the actions for the profile
        $.TemplateRenderer($profile_actions_template, sakai.profile.main, $profile_actions);

    };

    /**
     * Insert a profile section widget
     * @param {String} sectionname The name of the section e.g. basic/talks/aboutme
     */
    var insertProfileSectionWidget = function(sectionname) {

        // Create a JSON object to pass the sectionname along
        // Trimpath needs an object to be passed (not only a variable)
        var sectionobject = {
            "sectionname": "profilesection-" + sectionname
        };

        // Construct the html for the widget
        $profile_sectionwidgets_container.append($.TemplateRenderer($profile_sectionwidgets_container_template, sectionobject));

        // Bind a global event that can be triggered by the profilesection widgets
        $(window).bind("sakai-" + sectionobject.sectionname, function(eventtype, callback){

            if(callback && typeof callback === "function"){
                callback(sectionname);
            }

        });

    };

    /**
     * Insert the profile section widgets
     */
    var insertProfileSectionWidgets = function(){

        for(var i in sakai.profile.main.config){
            if(sakai.profile.main.config.hasOwnProperty(i)){

                // Insert a separate widget for each profile section widget
                insertProfileSectionWidget(i);

            }
        }

    };

    /**
     * Render the footer for profile
     */
    var renderTemplateFooter = function(){

        // Render the profile footer
        $profile_footer.html($.TemplateRenderer($profile_footer_template, sakai.profile.main));

    };

    /**
     * Parse and render all the templates on the page
     */
    var renderTemplates = function(){

        // Render the site heading
        renderTemplateSiteHeading();

        // Render the profile actions
        renderTemplateActions();

        // Render the footer buttons
        renderTemplateFooter();

    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    var doInit = function(){

        // Set the querystring object variable
        // We use the following parameters:
        //    mode -> mode of the profile
        //    user -> the id of the user for which you want to see the profile
        querystring = new Querystring();

        // Get and set the profile mode
        var profilemode = getProfileMode();
        if (profilemode) {
            setProfileMode(profilemode);
        }

        // Check if you are looking at the logged-in user
        setIsMe();

        // Set the profile data
        setProfileData(function(){

            // Initialise the entity widget
            $(window).bind("sakai.api.UI.entity.ready", function(e){

                // Check whether we need to load the myprofile or the profile mode
                var whichprofile = sakai.profile.main.isme ? "myprofile" : "profile";

                // Check which data we need to send
                var data = sakai.profile.main.isme ? false : userprofile;

                // Render the entity widget
                sakai.api.UI.entity.render(whichprofile, data);

            });

            // Render all the templates
            renderTemplates();

            // Insert the profile section widgets
            insertProfileSectionWidgets();

            // Add binding to all the elements
            addBinding();

        });

    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.profile");