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

/*global $, sdata, fluid, doPaging, saveDeliciousSettings */

var sakai = sakai || {};

/**
 * @name sakai.activitystream
 *
 * @class activitystream
 *
 * @description
 * Initialize the activitystream widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.activitystream = function(tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var activityData = {};
    var contactsData = {};
    var activityitemsCount = 10;
    var activityitemsSortOrder = "ascending";
    var displayMe = true;

    // HTML elements
    var $rootel = $("#" + tuid);
    var $contentContainer = $("#as_content_container", $rootel);
    var $mainScreen = $("#as_main", $rootel);
    var $settingsScreen = $("#as_settings", $rootel);

    var $settingsItemCountInput = $("#as_item_count", $rootel);
    var $settingsDisplayMeInput = $("#as_display_me", $rootel);
    var $settingsCancelButton = $("#as_settings_cancel");
    var $settingsOkButton = $("#as_settings_ok");

    var $feedContainer = $("#as_feed", $rootel);
    var $feedTitle = $("#as_feed_title", $rootel);

    /////////////////
    // Main screen //
    /////////////////

    /**
     * getContacts
     * Fetches the logged in user's contacts
     * @returns void
     */
    var getContactsData = function(callback) {

        $.ajax({
            url: sakai.config.URL.CONTACTS_ACCEPTED,
            success: function(rawReturnedData) {

                // Store the contacts' information
                for (var i = 0, il = rawReturnedData.results.length; i < il; i++) {
                    contactsData[rawReturnedData.results[i]["profile"]["rep:userId"]] = rawReturnedData.results[i];
                }

                //If there is a callback function in the arguments, excute it
                if (typeof callback === "function") {
                    callback(true);
                }

            },
            error: function(xhr, status, thrown) {

                if (typeof callback === "function") {
                    callback(false, xhr);
                }

            }
        });

    }

    /**
     * getActivityData
     * Fetches activity data from the back-end
     * @param callback {Function} Optional callback function which is executed at when the data is returned from the server
     * @returns void
     */
    var getActivityData = function(callback) {

        $.ajax({
            url: sakai.config.URL.ACTIVITY_PERSONAL,
            traditional: true,
            data: {
                "items": activityitemsCount,
                "sortOrder": activityitemsSortOrder
            },
            success: function(rawReturnedData) {

                // Store fetched data in place where it is accesible for other widget functions
                activityData = rawReturnedData;

                if (typeof callback === "function") {
                    callback(true);
                }

            },
            error: function(xhr, status, thrownError) {

                if (typeof callback === "function") {
                    callback(false);
                }

            }
        });

    };

    /**
     * renderActivity
     * Renders the activity feed on screen based on the feed data JSON
     * @returns void
     */
    var renderActivity = function() {

        // Deal with the case when there are no activities to display
        if (activityData.results.length === 0) {
            $feedContainer.html("There are no activity items to display");
            $feedTitle.html("");
            return;
        }

        // Create a result container object
        var $resultContainer = $("<ul class=\"feed_list\"></ul>");

        // Set the title
        $feedTitle.html(sakai.api.Security.saneHTML("Last " + activityitemsCount + " activity items"));

        // Go through the feed data
        for (var i = 0, il = activityData.results.length; i < il; i++) {

            // Get the contact's full name who created the activity item
            var contactFullName = "";
            var contactUserID = activityData.results[i]["sakai:activity-actor"];
            if (contactsData[contactUserID]) {
                var contactProfile = contactsData[contactUserID].profile;
                contactFullName = sakai.api.User.getDisplayName(contactProfile);
            } else if (contactUserID === sakai.data.me.profile["rep:userId"]) {

                // Skip item if display me is turned off in the configuration
                if (displayMe === false) {
                    continue;
                }

                contactFullName = sakai.api.User.getDisplayName(sakai.data.me.profile);
            } else {
                contactFullName = "Unknown User";
            }

            // Create a list item element for each one of the feed items
            var $feedItem = $(sakai.api.Security.saneHTML("<li><a href=\"/dev/profile.html?user=" + contactUserID + "\">" + contactFullName + "</a>: <br />" + activityData.results[i]["sakai:activityMessage"] + "<li>"));

            // Append the list item to the list container
            $resultContainer.append($feedItem);
        }

        // Add result container to the DOM
        $feedContainer.html($resultContainer);

    };


    /////////////////////
    // Settings screen //
    /////////////////////


    /**
     * displaySettingsScreen
     * Prepares and display the settings screen
     * @returns void
     */
    var displaySettingsScreen = function() {
        // Load widget settings from back-end
        sakai.api.Widgets.loadWidgetData(tuid, function(settingsLoadSuccess, loadedSettings){

            // Store loaded settings locally
            displayMe = loadedSettings.displayMe;
            activityitemsCount = loadedSettings.activityitemsCount;

            // Wire functionality to OK and Cancel buttons
            wireSettingsButtons();

            // Set settings screen values
            $settingsItemCountInput.val(activityitemsCount);
            if (displayMe) {
                $settingsDisplayMeInput.attr("checked", true);
            } else {
                $settingsDisplayMeInput.attr("checked", false);
            }

            // Show appropriate screen container
            $settingsScreen.show();
            $mainScreen.hide();
        });
    };

    /**
     * wireSettingsButtons
     * Adds functionality to the settings screen's OK and Cancel button
     * @returns void
     */
    var wireSettingsButtons = function() {

        // Wire up OK Button on settings screen
        $settingsOkButton.bind("click", function(e){

            // Create a settings object which we will store
            var settingsObject = {};

            // Populate settings object from settings form values
            settingsObject.activityitemsCount = parseInt($settingsItemCountInput.val(), 10);
            if ($settingsDisplayMeInput.is(":checked")) {
                settingsObject.displayMe = true;
            } else {
                settingsObject.displayMe = false;
            }

            // Store new settings locally
            activityitemsCount = settingsObject.activityitemsCount;
            displayMe = settingsObject.displayMe;

            // Save settings object to the back end
            sakai.api.Widgets.saveWidgetData(tuid, settingsObject);

            // Init main screen with new settings
            showSettings = false;
            $settingsScreen.hide();
            $mainScreen.show();
            doInit();

        });

        // Wire up Cancel button on settings screen
        $settingsCancelButton.bind("click", function(e){
            showSettings = false;
            $settingsScreen.hide();
            $mainScreen.show();
            doInit();
        });

    };


    /**
     * doInit
     * Initialisation, and starting the main functions
     * @returns void
     */
    var doInit = function(){

        // If we need to show the settings screen...
        if (showSettings) {

            displaySettingsScreen();

        } else {

            // Show main screen container
            $settingsScreen.hide();
            $mainScreen.show();

            // 1. Load widget settings from the back-end
            sakai.api.Widgets.loadWidgetData(tuid, function(settingsLoadSuccess, loadedSettings){

                if (settingsLoadSuccess) {

                    // Store loaded settings locally
                    displayMe = loadedSettings.displayMe;
                    activityitemsCount = loadedSettings.activityitemsCount;

                }

                // 2. Get contacts
                getContactsData(function(contactsSuccess){

                    if (contactsSuccess) {

                        // 3. Get the activity feed data
                        getActivityData(function(activitySuccess){

                            if (activitySuccess) {

                                    // 4. Render the feed data
                                    renderActivity();

                            } else {
                                fluid.log("Could not fetch activity feed");
                            }
                        });
                    } else {
                        fluid.log("Could not fetch contacts");
                    }
                });
            });

        }
    };

    // Call the init function first
    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("activitystream");
