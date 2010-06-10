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
 * Initialize the Activitystream widget
 * @param {String} tuid unique id of the widget
 * @param {Boolean} showSettings show the settings of the widget or not
 */
sakai.activitystream = function(tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var activityData = {};
    var contactsData = {};
    var activityitemsCount = 10;
    var activityitemsSortOrder = "descending";

    // HTML elements
    var $rootel = $("#" + tuid);
    var $contentContainer = $("#as_content_container", $rootel);
    var $mainScreen = $("#as_main", $rootel);
    var $settingsScreen = $("#as_settings", $rootel);
    var $feedContainer = $("#as_feed", $rootel);
    var $feedTitle = $("#as_feed_title", $rootel);

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

        // Create an unordered list container element for the results
        var $resultContainer = $("<ul class=\"feed_list\"></ul>");

        // Go through the feed data
        for (var i = 0, il = activityData.results.length; i < il; i++) {

            // Get the contact's full name who created the activity item
            var contactFullName = "";
            var contactUserID = activityData.results[i]["sakai:activity-actor"];
            if (contactsData[contactUserID]) {
                var contactProfile = contactsData[contactUserID].profile;
                contactFullName = contactProfile.firstName + " " + contactProfile.lastName;
            } else if (contactUserID === sakai.data.me.profile["rep:userId"]) {
                contactFullName = sakai.data.me.profile.firstName + " " + sakai.data.me.profile.lastName;
            } else {
                contactFullName = "Unknown User";
            }

            // Create a list item element for each one of the feed items
            var $feedItem = $("<li><a href=\"/dev/profile.html?user=" + contactUserID + "\">" + contactFullName + "</a>: <br />" + activityData.results[i]["sakai:activityMessage"] + "<li>");

            // Append the list item to the list container
            $resultContainer.append($feedItem);
        }

        // Add result container to the DOM
        $feedContainer.html($resultContainer);


    }

    /**
     * Init function
     */
    var doInit = function(){

        // Which screen to show
        if (showSettings) {

            $settingsScreen.show();
            $mainScreen.hide();

        } else {

            $settingsScreen.hide();
            $mainScreen.show();

            // Get contacts
            getContactsData(function(contactsSuccess){

                if (contactsSuccess) {

                    // Get the activity feed data
                    getActivityData(function(activitySuccess){
                        if (activitySuccess) {

                            // Render the feed data
                            renderActivity();

                            // Set the title
                            $feedTitle.html("Last " + activityitemsCount + " activity items");


                        } else {
                            fluid.log("Could not fetch activity feed");
                        }
                    });
                } else {
                    fluid.log("Could not fetch contacts");
                }
            });

        }
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("activitystream");
