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


require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.profile = function(){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////
        sakai_global.profile.main = {
            chatstatus: "",
            config: sakai.config.Profile.configuration.defaultConfig,
            data: {},
            isme: false,
            currentuser: "",
            mode: {
                options: ["view", "edit"],
                value: "edit"
            },
            acls: {},
            picture: "",
            status: "",
            validation: {}
        };

        var userprofile;
        var querystring; // Variable that will contain the querystring object of the page
        var authprofileURL;
        var readySections = []; // Profile sections that have saved their data to profile.main
        var currentTags = [];
        var editProfileTour = false;

        ///////////////////
        // CSS SELECTORS //
        ///////////////////

        var profile_class = ".profile";
        var $profile_actions = $("#profile_actions", profile_class);
        var $profile_actions_button_edit = $("#profile_actions_button_edit", profile_class);
        var $profile_actions_template = $("#profile_actions_template", profile_class);
        var $profile_error = $("#profile_error", profile_class);
        var $profile_error_form_error_server = $("#profile_error_form_error_server", $profile_error);
        var $profile_error_form_errors = $("#profile_error_form_errors", $profile_error);
        var $profile_field_default_template = $("#profile_field_default_template", profile_class);
        var $profile_form = $("#profile_form", profile_class);
        var $profile_footer = $("#profile_footer", profile_class);
        var $profile_footer_button_update = $("#profile_footer_button_update", profile_class);
        var $profile_footer_button_dontupdate = $("#profile_footer_button_dontupdate", profile_class);
        var $profile_footer_template = $("#profile_footer_template", profile_class);
        var $profile_heading = $("#profile_heading", profile_class);
        var $profile_heading_template = $("#profile_heading_template", profile_class);
        var $profile_message = $("#profile_message", profile_class);
        var $profile_message_form_successful = $("#profile_message_form_successful", $profile_message);
        var $profile_sectionwidgets_container = $("#profile_sectionwidgets_container", profile_class);
        var $profile_sectionwidgets_container_template = $("#profile_sectionwidgets_container_template", profile_class);


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
                debug.warn("profile - changeProfileMode - the supplied mode '" + mode + "' is not a valid profile mode. Using the default mode instead");

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
         * Construct the ACL list
         */
        var constructACL = function(){

            sakai_global.profile.main.acls = {
                "options": {
                    "everybody": {
                        "label": "__MSG__PUBLIC__",
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
                        "label": "__MSG__LOGGED_IN_USERS__",
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
                        "label": "__MSG__MY_CONTACTS__",
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
         * Checks if the user has a custom profile type set
         */
        var checkProfileType = function() {
            var userType = sakai_global.profile.main.data.userType;
            if (userType && sakai.config.Profile.configuration[userType]) {
                sakai_global.profile.main.config = sakai.config.Profile.configuration[userType];
            }
        };

        /**
         * Set the profile data for the user such as the status and profile picture
         */
        var setProfileData = function(callback){

            // Check whether the user is looking/editing it's own profile
            if (sakai_global.profile.main.isme) {

                // Set the profile picture for the user you are looking at
                // The actual location of the picture could be something like this: /~admin/public/profile/256x256_profilepicture
                sakai_global.profile.main.picture = constructProfilePicture(sakai.data.me.profile);

                // Set the status for the user you want the information from
                if(sakai.data.me.profile.basic && sakai.data.me.profile.basic.elements.status){
                    sakai_global.profile.main.status = sakai.data.me.profile.basic.elements.status.value;
                }

                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, sakai.data.me.profile);

                // Check user profile type
                checkProfileType();

                if (sakai_global.profile.main.data.activity) {
                    delete sakai_global.profile.main.data.activity;
                }

                // Execute the callback function
                if ($.isFunction(callback)) {
                    callback();
                }

            }
            else {
                sakai.api.Server.loadJSON(authprofileURL, function(success, data) {
                    if (success && data) {
                        // Set the correct userprofile data
                        userprofile = $.extend(true, {}, data);

                        // Set the profile picture
                        sakai_global.profile.main.picture = constructProfilePicture(userprofile);

                        // Set the status for the user you want the information from
                        if(userprofile.basic && userprofile.basic.elements.status){
                            sakai_global.profile.main.status = userprofile.basic.elements.status.value;
                        }

                        // Set the profile data object
                        sakai_global.profile.main.data = $.extend(true, {}, userprofile);

                        // Check user profile type
                        checkProfileType();
                    } else {
                        debug.error("setProfileData: Could not find the user's profile");
                    }
                    if ($.isFunction(callback)) {
                        callback();
                    }
                });
            }

        };

        /**
         * Filter some the tags properties, as they cannot be imported into Sling this way
         * @param {Object} i_object The object you want to filter
         */
        var filterTagsProperties = function(i_object) {
            // filter out the tags, they don't save this way
            if (i_object["sakai:tags"]) {
                delete i_object["sakai:tags"];
            }
            if (i_object["sakai:tag-uuid"]) {
                delete i_object["sakai:tag-uuid"];
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
                                "url": authprofileURL + "/" + i + ".modifyAce.json", // Todo change to JSON
                                "method": "POST",
                                "parameters": aclArray[j]
                            };

                        }

                    }

                }
            }

            // Send the Ajax request to the batch servlet
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                complete: function() {
                    $("#profile_footer_button_update").removeAttr("disabled");
                },
                success: function(data){

                    // Show a successful notification to the user
                    sakai.api.Util.notification.show("", $profile_message_form_successful.text() , sakai.api.Util.notification.type.INFORMATION);

                },
                error: function(xhr, textStatus, thrownError){

                    // Show an error message to the user
                    sakai.api.Util.notification.show("", $profile_error_form_error_server.text() , sakai.api.Util.notification.type.ERROR);

                    // Log an error message
                    debug.error("sakai.profile - saveProfileACL - the profile ACL's couldn't be saved successfully");

                }
            });

        };

        /**
         * Checks if user is in the edit profile tour and displays tooltips
         */
        var checkEditProfileTour = function(){
            var querystring = new Querystring();
            if (querystring.contains("editprofiletour") && querystring.get("editprofiletour") === "true") {
                editProfileTour = true;
                // display tooltip
                var tooltipData = {
                    "tooltipSelector":"#entity_container",
                    "tooltipTitle":"TOOLTIP_EDIT_MY_PROFILE",
                    "tooltipDescription":"TOOLTIP_EDIT_MY_PROFILE_P2",
                    "tooltipArrow":"",
                    "tooltipTop":0,
                    "tooltipLeft":700
                };
                if (!sakai.tooltip || !sakai.tooltip.isReady) {
                    $(window).bind("ready.tooltip.sakai", function() {
                        $(window).trigger("init.tooltip.sakai", tooltipData);
                    });
                } else {
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                }
            }
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

            // determine how much profile data has been entered
            var elementItemCount = 0;
            var dataItemCount = 0;
            for (var prop in sakai_global.profile.main.config) {
                if (sakai_global.profile.main.config.hasOwnProperty(prop)) {
                    if (sakai_global.profile.main.config[prop].elements && prop !== "publications") {
                        for (var ii in sakai_global.profile.main.config[prop].elements) {
                            if (sakai_global.profile.main.config[prop].elements.hasOwnProperty(ii)) {
                                elementItemCount++;
                                if (sakai_global.profile.main.data[prop] && sakai_global.profile.main.data[prop].elements && sakai_global.profile.main.data[prop].elements[ii]) {
                                    dataItemCount++;
                                }
                            }
                        }
                    }
                }
            }

            var profilePercentageComplete = dataItemCount / elementItemCount * 100;

            readySections = [];
            // Filter some JCR properties
            sakai.api.Server.filterJCRProperties(sakai_global.profile.main.data);

            // Filter out the tags
            filterTagsProperties(sakai_global.profile.main.data);

            // Save the profile properties
            sakai.api.Server.saveJSON(authprofileURL, sakai_global.profile.main.data, function(success, data){

                // Check whether is was successful
                if (success) {

                    // Save the profile acl
                    saveProfileACL();

                    // update entity widget
                    sakai.data.me.profile = $.extend(true, {}, sakai_global.profile.main.data);
                    $(window).trigger("render.entity.sakai", ["myprofile", sakai_global.profile.main.data]);

                    // scroll to top of the page
                    $(window).scrollTop(0);

                    // if user has completed over half their profile add user progress
                    if (profilePercentageComplete > 0){
                        sakai.api.User.addUserProgress("halfCompletedProfile");
                    }

                    // display help tooltip
                    var tooltipData = {
                        "tooltipSelector":"#navigation_my_sakai_link",
                        "tooltipTitle":"TOOLTIP_EDIT_MY_PROFILE",
                        "tooltipDescription":"TOOLTIP_EDIT_MY_PROFILE_P3",
                        "tooltipArrow":"top",
                        "tooltipTop":5,
                        "tooltipLeft":15
                    };
                    $(window).trigger("update.tooltip.sakai", tooltipData);

                    // append tour progress to home link
                    if (editProfileTour && $("#navigation_my_sakai_link").attr("href") && $("#navigation_my_sakai_link").attr("href").indexOf("editprofiletour") === -1) {
                        $("#navigation_my_sakai_link").attr("href", $("#navigation_my_sakai_link").attr("href") + "?editprofiletour=true");
                    }
                }
                else {
                    $("#profile_footer_button_update").removeAttr("disabled");
                    // Show an error message to the user
                    sakai.api.Util.notification.show("", $profile_error_form_error_server.text() , sakai.api.Util.notification.type.ERROR);

                    // Log an error message
                    debug.error("sakai.profile - saveProfileData - the profile data couldn't be saved successfully");

                }

            }, true);
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
                window.location.reload();

            });

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

        jQuery.validator.addMethod("appendhttp", function(value, element) {
            if(value.substring(0,7) !== "http://" &&
            value.substring(0,6) !== "ftp://" &&
            value.substring(0,8) !== "https://" &&
            $.trim(value) !== "") {
                $(element).val("http://" + value);
            }
            return true;
        }, "No error message, this is just an appender");
        /**
         * Add binding to the profile form
         */
        var addBindingForm = function(){

            // Reinitialize the jQuery form selector
            $profile_form = $($profile_form.selector);

            // Initialize the validate plug-in
            $profile_form.validate({
                submitHandler: function(form, validator) {
                    $("#profile_footer_button_update").attr("disabled", "disabled");
                    // Trigger the profile save method, this is event is bound in every sakai section
                    $(window).trigger("save.profile.sakai");
                    return false;
                },
                onclick:false,
                onkeyup:false,
                onfocusout:false,
                invalidHandler: function(form, validator){
                    // Remove all the current notifications
                    sakai.api.Util.notification.removeAll();

                    // Show a notification which states that you have errors
                    sakai.api.Util.notification.show("", $profile_error_form_errors.text(), sakai.api.Util.notification.type.ERROR);
                },
                ignore: ".profile_validation_ignore", // Class
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
            sakai.api.Util.TemplateRenderer($profile_heading_template, sakai_global.profile.main, $profile_heading);

        };

        var renderTemplateActions = function(){

            // Render the actions for the profile
            sakai.api.Util.TemplateRenderer($profile_actions_template, sakai_global.profile.main, $profile_actions);

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

        };

        /**
         * Render the footer for profile
         */
        var renderTemplateFooter = function(){

            // Render the profile footer
            $profile_footer.html(sakai.api.Util.TemplateRenderer($profile_footer_template, sakai_global.profile.main));

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
            var profilemode = "edit";
            if (profilemode) {
                setProfileMode(profilemode);
            }

            // Check if you are looking at the logged-in user
            setIsMe();

            // Construct the authprofile URL
            authprofileURL = "/~" + sakai_global.profile.main.currentuser + "/public/authprofile";

            // Construct the ACL list
            constructACL();

            // Set the profile data
            setProfileData(function(){

                // Initialise the entity widget
                $(window).bind("ready.entity.sakai", function(e){

                    // Check whether we need to load the myprofile or the profile mode
                    var whichprofile = sakai_global.profile.main.isme ? "myprofile" : "profile";

                    // Check which data we need to send
                    var data = sakai_global.profile.main.isme ? false : userprofile;

                    // Render the entity widget
                    $(window).trigger("render.entity.sakai", [whichprofile, data]);

                });

                // Render all the templates
                renderTemplates();

                // Insert the profile section widgets
                insertProfileSectionWidgets();

                // Add binding to all the elements
                addBinding();

                if (sakai_global.entity && sakai_global.entity.isRendered) {
                    // check for edit profile tour in progress
                    checkEditProfileTour();
                } else {
                    $(window).bind("rendered.entity.sakai", function(){
                        // check for edit profile tour in progress
                        checkEditProfileTour();
                    });
                }
            });
        };

        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("profile");
});
