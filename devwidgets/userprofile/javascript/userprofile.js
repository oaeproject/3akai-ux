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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 * /dev/lib/misc/querystring.js (Querystring)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.userprofile
     *
     * @class userprofile
     *
     * @description
     * Initialize the userprofile widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.userprofile = function(tuid,showSettings){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var userprofile;
        var querystring; // Variable that will contain the querystring object of the page
        var authprofileURL;
        var readySections = []; // Profile sections that have saved their data to sakai_global.profile.main

        ///////////////////
        // CSS SELECTORS //
        ///////////////////

        var $rootel = $("#" + tuid);
        var $profile_actions = $("#userprofile_actions", $rootel);
        var $profile_actions_button_edit = $("#userprofile_actions_button_edit", $rootel);
        var $profile_actions_template = $("#userprofile_actions_template", $rootel);
        var $profile_error = $("#userprofile_error", $rootel);
        var $profile_error_form_error_server = $("#userprofile_error_form_error_server", $profile_error);
        var $profile_error_form_errors = $("#userprofile_error_form_errors", $profile_error);
        var $profile_field_default_template = $("#userprofile_field_default_template", $rootel);
        var $profile_form = $("#userprofile_form", $rootel);
        var $profile_footer = $("#userprofile_footer", $rootel);
        var $profile_footer_button_update = $("#userprofile_footer_button_update", $rootel);
        var $profile_footer_button_dontupdate = $("#userprofile_footer_button_dontupdate", $rootel);
        var $profile_footer_template = $("#userprofile_footer_template", $rootel);
        var $profile_message = $("#userprofile_message", $rootel);
        var $profile_message_form_successful = $("#userprofile_message_form_successful", $profile_message);
        var $profile_sectionwidgets_container = $("#userprofile_sectionwidgets_container", $rootel);
        var $profile_sectionwidgets_container_template = $("#userprofile_sectionwidgets_container_template", $rootel);


        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        /**
         * Change the mode of the current profile
         * @param {String} mode The mode for the profile (view | edit)
         */
        var setProfileMode = function(mode){

            // Check the mode parameter
            if ($.inArray(mode, sakai_global.profile.main.mode.options) !== -1) {

                // Set the correct profile mode
                sakai_global.profile.main.mode.value = mode;

            }
            else {

                // Use the standard profile mode
                sakai_global.profile.main.mode.value = sakai_global.profile.main.mode.options[0];

                // Print a log message that the supplied mode isn't valid
                debug.info("profile - setProfileMode - the supplied mode '" + mode + "' is not a valid profile mode. Using the default mode instead");

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
            if ($.inArray(mode, sakai_global.profile.main.mode.options) !== -1) {

                // Perform the redirect
                //window.location = window.location.pathname + "?mode=" + mode; // TODO fix this, jquery.bbq it, and do not force a refresh

                switch (mode) {
                    case "edit":
                        window.location = sakai.config.URL.PROFILE_EDIT_URL + "?user=" + sakai_global.profile.main.currentuser;
                        break;
                    case "view":
                        window.location = "/~" + sakai_global.profile.main.currentuser;
                        break;
                }
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
                sakai_global.profile.main.isme = false;
                sakai_global.profile.main.currentuser = querystring.get("user");
            }
            else {
                sakai_global.profile.main.isme = true;
                sakai_global.profile.main.currentuser = sakai.data.me.user.userid;
            }

        };

        /**
         * Checks if the user has a custom profile type set
         */
        var checkProfileType = function() {
            var userType = sakai_global.profile.main.data.userType;
            if (userType && sakai.config.Profile.configuration[userType]) {
                sakai_global.profile.main.config = sakai.config.Profile.configuration[userType];
            }
        };

        /**
         * Construct the ACL list
         */
        var constructACL = function(){

            sakai_global.profile.main.acls = {
                "options": {
                    "everybody": {
                        "label": "__MSG__EVERYBODY__",
                        "postparams": [{
                            "principalId": "anonymous",
                            "privilege@jcr:read": "granted"
                        }, {
                            "principalId": "everyone",
                            "privilege@jcr:read": "granted"
                        }, {
                            "principalId": "g-contacts-" + sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "granted"
                        }, {
                            "principalId": sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "granted",
                            "privilege@jcr:write": "granted"
                        }]
                    },
                    "institution": {
                        "label": "__MSG__INSTITUTION_ONLY__",
                        "postparams": [{
                            "principalId": "anonymous",
                            "privilege@jcr:read": "denied"
                        }, {
                            "principalId": "everyone",
                            "privilege@jcr:read": "granted"
                        }, {
                            "principalId": "g-contacts-" + sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "none"
                        }, {
                            "principalId": sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "granted",
                            "privilege@jcr:write": "granted"
                        }]
                    },
                    "contacts": {
                        "label": "__MSG__CONTACTS_ONLY__",
                        "postparams": [{
                            "principalId": "anonymous",
                            "privilege@jcr:read": "denied"
                        }, {
                            "principalId": "everyone",
                            "privilege@jcr:read": "denied"
                        }, {
                            "principalId": "g-contacts-" + sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "granted"
                        }, {
                            "principalId": sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "granted",
                            "privilege@jcr:write": "granted"
                        }]
                    },
                    "onlyme": {
                        "label": "__MSG__ONLY_ME__",
                        "postparams": [{
                            "principalId": "anonymous",
                            "privilege@jcr:read": "denied"
                        }, {
                            "principalId": "everyone",
                            "privilege@jcr:read": "denied"
                        }, {
                            "principalId": "g-contacts-" + sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "denied"
                        }, {
                            "principalId": sakai_global.profile.main.currentuser,
                            "privilege@jcr:read": "granted",
                            "privilege@jcr:write": "granted"
                        }]
                    }
                }
            };

        };

        /**
         * Check whether there is a valid picture for the user
         * @param {Object} profile The profile object that could contain the profile picture
         * @return {String}
         * The complete URL of the profile picture
         * Will be an empty string if there is no picture
         */
        var constructProfilePicture = function(profile){

            if (profile.basic.elements.picture && profile.basic.elements.picture.value && profile["rep:userId"]) {
                return "/~" + profile["rep:userId"] + "/public/profile/" + profile.basic.elements.picture.value.name;
            }
            else {
                return "";
            }

        };

        /**
         * Filter some JCR properties, we need to do this because some properties
         * can not be used by the import operation in Slin
         * @param {Object} i_object The object you want to filter
         */
        var filterJCRProperties = function(i_object){

            // Remove the "rep:policy" property
            if (i_object["rep:policy"]) {
                delete i_object["rep:policy"];
            }

            // Also run over the other objects within this object
            for (var i in i_object) {
                if (i_object.hasOwnProperty(i) && $.isPlainObject(i_object[i])) {
                  filterJCRProperties(i_object[i]);
                }
            }

        };


        /**
         * Save the Access control list for the profile
         */
        var saveProfileACL = function(){

            var requests = []; // Variable used to contain all the information we need to send to the batch post

            // Remove the ACL's on the authprofile URL
            requests[requests.length] = {
                // Construct the right URL
                "url": authprofileURL + ".deleteAce.html",
                "method": "POST",
                "parameters": {
                    ":applyTo": [sakai_global.profile.main.currentuser, "anonymous", "everyone"]
                }
            };

            // Run over all the elements in the config file
            for (var i in sakai_global.profile.main.config) {
                if (sakai_global.profile.main.config.hasOwnProperty(i) && $.isPlainObject(sakai_global.profile.main.config[i])) {

                    // Create a sectionobject for caching purposes
                    var sectionObject = sakai_global.profile.main.data[i];

                    // Check whether it is also in the data object
                    if (sakai_global.profile.main.data[i] && $.isPlainObject(sakai_global.profile.main.data[i])) {

                        // Array containing the postparams for the specific access property
                        var aclArray = sakai_global.profile.main.acls.options[sectionObject.access].postparams;

                        // Run over all the elements in the array
                        for (var j = 0, jl = aclArray.length; j < jl; j++) {

                            // Add the object to the requests array
                            requests[requests.length] = {
                                // Construct the right URL
                                "url": authprofileURL + "/" + i + ".modifyACE.json", // Todo change to JSON
                                "method": "POST",
                                "parameters": aclArray[j]
                            };

                        }

                    }

                }
            }

            // Send the Ajax request to the batch servlet
            // depends on KERN-909
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                success: function(data){

                    // Show a successful notification to the user
                    sakai.api.Util.notification.show("", $profile_message_form_successful.text() , sakai.api.Util.notification.type.INFORMATION);

                    // Wait for 2 seconds
                    setTimeout(
                        function(){
                            // Change the profile mode if the save was successful
                            changeProfileMode("view");
                        }, 2000);

                },
                error: function(xhr, textStatus, thrownError){

                    // Show an error message to the user
                    sakai.api.Util.notification.show("", $profile_error_form_error_server.text() , sakai.api.Util.notification.type.ERROR);

                    // Log an error message
                    debug.error("sakai_global.profile - saveProfileACL - the profile ACL's couldn't be saved successfully");

                }
            });

        };

        /**
         * Save the current profile data to the repository
         */
        var saveProfileData = function(){

            // Trigger the profile save method, this is event is bound in every sakai section
            $(window).trigger("save.profile.sakai");
            return false;
        };

        $(window).bind("ready.data.profile.sakai", function(e, sectionName) {

            // keep track of all the sections that are ready
            if ($.inArray(sectionName, readySections) < 0) {
                readySections.push(sectionName);
            }

            // if all sections are ready, we'll pass over this loop. otherwise, return and wait
            for (var i in sakai_global.profile.main.config) {
                if (sakai_global.profile.main.config.hasOwnProperty(i)) {
                    if ($.inArray(i, readySections) < 0) {
                        return;
                    }
                }
            }

            // Filter some JCR properties
            filterJCRProperties(sakai_global.profile.main.data);

            // Save the profile properties
            sakai.api.Server.saveJSON(authprofileURL, sakai_global.profile.main.data, function(success, data){

                // Check whether is was successful
                if (success) {

                    // Save the profile acl
                    saveProfileACL();

                }
                else {

                    // Show an error message to the user
                    sakai.api.Util.notification.show("", $profile_error_form_error_server.text() , sakai.api.Util.notification.type.ERROR);

                    // Log an error message
                    debug.error("sakai_global.profile - saveProfileData - the profile data couldn't be saved successfully");

                }

            });
        });


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
                changeProfileMode("view");

            });

        };

        /**
         * Add binding to the action elements
         */
        var addBindingActions = function(){

            // Reinitialise jQuery objects
            $profile_actions_button_edit = $($profile_actions_button_edit.selector);

            // Bind the edit button
            $profile_actions_button_edit.live("click", function(){

                // Change the profile mode
                changeProfileMode("edit");

            });

        };

        /**
         * Add binding to the profile form
         */
        var addBindingForm = function(){
    /*
            // Reinitialize the jQuery form selector
            $profile_form = $($profile_form.selector);

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
                ignore: ".profile_validation_ignore", // Class
                errorClass: "profilesection_validation_error",
                validClass: "profilesection_validation_valid",
                ignoreTitle: true // Ignore the title attribute, this can be removed as soon as we use the data-path attribute
            });
    */
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
         * Insert a profile section widget
         * @param {String} sectionname The name of the section e.g. basic/talks/aboutme
         */
        var insertProfileSectionWidget = function(sectionname) {

            // Create a JSON object to pass the sectionname along
            // Trimpath needs an object to be passed (not only a variable)
            var sectionobject = {
                "sectionname": "profilesection-" + sectionname,
                sakai: sakai
            };

            // Construct the html for the widget
            var toAppend = sakai.api.Util.TemplateRenderer($profile_sectionwidgets_container_template, sectionobject);
            $profile_sectionwidgets_container.append(toAppend);

            // Bind a global event that can be triggered by the profilesection widgets
            $(window).bind(sectionobject.sectionname + ".sakai", function(eventtype, callback){

                if ($.isFunction(callback)) {
                    callback(sectionname);
                }

            });

        };

        /**
         * Insert the profile section widgets
         */
        var insertProfileSectionWidgets = function(){

            for(var i in sakai_global.profile.main.config){
                if(sakai_global.profile.main.config.hasOwnProperty(i)){

                    // Insert a separate widget for each profile section widget
                    insertProfileSectionWidget(i);

                }
            }
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false);
        };

        /**
         * Render the footer for profile
         */
        var renderTemplateFooter = function(){

            // Render the profile footer
            $profile_footer.html(sakai.api.Util.TemplateRenderer($profile_footer_template, sakai_global.profile.main));

        };

        var renderTemplateActions = function(){

            // Render the actions for the profile
            sakai.api.Util.TemplateRenderer($profile_actions_template, sakai_global.profile.main, $profile_actions);

        };

        /**
         * Parse and render all the templates on the page
         */
        var renderTemplates = function(){

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

            // Construct the authprofile URL
            authprofileURL = "/~" + sakai_global.profile.main.currentuser + "/public/authprofile";

            // Construct the ACL list
            constructACL();

            // Check user profile type
            checkProfileType();

            renderTemplates();

            insertProfileSectionWidgets();

            addBinding();


        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("userprofile");
});
