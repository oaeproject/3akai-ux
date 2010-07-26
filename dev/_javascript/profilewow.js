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
/*global $, sdata, QueryString */

var sakai = sakai || {};

sakai.profilewow = function(){


    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    sakai.profilewow.profile = {
        chatstatus: "",
        config: sakai.config.Profile.configuration,
        data: {},
        isme: false,
        mode: {
            options: ["viewmy", "view", "edit"],
            value: "viewmy"
        },
        acls: {
            options: ["public", "institution", "contacts", "noone"],
            value: "public"
        },
        picture: "",
        status: ""
    };

    var userprofile;
    var querystring; // Variable that will contain the querystring object of the page


    ///////////////////
    // CSS SELECTORS //
    ///////////////////

    var profilewow_class = ".profilewow";
    var $profilewow_actions = $("#profilewow_actions", profilewow_class);
    var $profilewow_actions_template = $("#profilewow_actions_template", profilewow_class);
    var $profilewow_field_default_template = $("#profilewow_field_default_template", profilewow_class);
    var $profilewow_footer = $("#profilewow_footer", profilewow_class);
    var $profilewow_footer_button_dontupdate = $("#profilewow_footer_button_dontupdate", profilewow_class);
    var $profilewow_footer_button_edit = $("#profilewow_footer_button_edit", profilewow_class);
    var $profilewow_footer_template = $("#profilewow_footer_template", profilewow_class);
    var $profilewow_heading = $("#profilewow_heading", profilewow_class);
    var $profilewow_heading_template = $("#profilewow_heading_template", profilewow_class);
    var $profilewow_sectionwidgets_container = $("#profilewow_sectionwidgets_container", profilewow_class);
    var $profilewow_sectionwidgets_container_template = $("#profilewow_sectionwidgets_container_template", profilewow_class);


    ////////////////////
    // UTIL FUNCTIONS //
    ////////////////////

    /**
     * Change the mode of the current profile
     * @param {String} mode The mode for the profile (view | viewmy | edit)
     */
    var setProfileMode = function(mode){

        // Check the mode parameter
        if ($.inArray(mode, sakai.profilewow.profile.mode.options) !== -1) {

            // Set the correct profile mode
            sakai.profilewow.profile.mode.value = mode;

        }
        else {

            // Use the standard profile mode
            sakai.profilewow.profile.mode.value = sakai.profilewow.profile.mode.options[0];

            // Print a log message that the supplied mode isn't valid
            fluid.log("Profilewow - changeProfileMode - the supplied mode '" + mode + "' is not a valid profile mode. Using the default mode instead");

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
        if ($.inArray(mode, sakai.profilewow.profile.mode.options) !== -1) {

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
            sakai.profilewow.profile.isme = false;
        }
        else {
            sakai.profilewow.profile.isme = true;
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
        if (sakai.profilewow.profile.isme) {

            // Set the profile picture for the user you are looking at
            // The actual location of the picture could be something like this: /~admin/public/profile/256x256_profilepicture
            sakai.profilewow.profile.picture = constructProfilePicture(sakai.data.me.profile);

            // Set the status for the user you want the information from
            if(sakai.data.me.profile.basic && sakai.data.me.profile.basic.elements.status){
                sakai.profilewow.profile.status = sakai.data.me.profile.basic.elements.status.value;
            }

            // Set the profilewow data object
            sakai.profilewow.profile.data = $.extend(true, {}, sakai.data.me.profile);

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
                        sakai.profilewow.profile.picture = constructProfilePicture(userprofile);

                        // Set the status for the user you want the information from
                        if(sakai.data.me.profile.basic){
                            sakai.profilewow.profile.status = $.parseJSON(userprofile.basic).status;
                        }

                        // Set the profilewow data object
                        sakai.profilewow.profile.data = $.extend(true, {}, sakai.data.me.profile);
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


    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to the footer elements
     */
    var addBindingFooter = function(){

        // Reinitialise jQuery objects
        $profilewow_footer_button_dontupdate = $($profilewow_footer_button_dontupdate.selector);

        // Bind the don't update
        $profilewow_footer_button_dontupdate.bind("click", function(){

            // Change the profile mode
            changeProfileMode("viewmy");

        });

    };

    /**
     * Add binding to the action elements
     */
    var addBindingActions = function(){

        // Reinitialise jQuery objects
        $profilewow_footer_button_edit = $($profilewow_footer_button_edit.selector);

        // Bind the edit button
        $profilewow_footer_button_edit.bind("click", function(){

            // Change the profile mode
            changeProfileMode("edit");

        });

    };

    /**
     * Add binding to all the elements on the page
     */
    var addBinding = function(){

        // Add binding to the actions elements
        addBindingActions();

        // Add binding to footer elements
        addBindingFooter();

    };


    ////////////////////////
    // TEMPLATE FUNCTIONS //
    ////////////////////////

    /**
     * Render the profilewow site heading
     */
    var renderTemplateSiteHeading = function(){

        // Render the profilewow site heading
        $.TemplateRenderer($profilewow_heading_template, sakai.profilewow.profile, $profilewow_heading);

    };

    var renderTemplateActions = function(){

        // Render the actions for the profile
        $.TemplateRenderer($profilewow_actions_template, sakai.profilewow.profile, $profilewow_actions);

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
        $profilewow_sectionwidgets_container.append($.TemplateRenderer($profilewow_sectionwidgets_container_template, sectionobject));

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

        for(var i in sakai.profilewow.profile.config){
            if(sakai.profilewow.profile.config.hasOwnProperty(i)){

                // Insert a separate widget for each profile section widget
                insertProfileSectionWidget(i);

            }
        }

    };

    /**
     * Render the footer for profilewow
     */
    var renderTemplateFooter = function(){

        // Render the profilewow footer
        $profilewow_footer.html($.TemplateRenderer($profilewow_footer_template, sakai.profilewow.profile));

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
                var whichprofile = sakai.profilewow.profile.isme ? "myprofile" : "profile";

                // Check which data we need to send
                var data = sakai.profilewow.profile.isme ? false : userprofile;

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

sakai.api.Widgets.Container.registerForLoad("sakai.profilewow");