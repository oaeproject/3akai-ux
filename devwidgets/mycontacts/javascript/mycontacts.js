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
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.mycontacts
     *
     * @class mycontacts
     *
     * @description
     * Initialize the mycontacts widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.mycontacts = function(tuid,showSettings){

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var rootel = $("#" + tuid);
        var numberFriends = 8; // The number of contacts that will be shown

        // - ID
        var mycontacts = "#mycontacts";

        // Contact request
        var mycontactsRequests = mycontacts + "_requests";

        // Error
        var mycontactsError = mycontacts + "_error";
        var mycontactsErrorContactserver = mycontactsError + "_contactserver";

        // List
        var mycontactsList = mycontacts + "_list";

        // Templates
        var mycontactsListTemplate = "mycontacts_list_template";
        var mycontactsRequestsTemplate = "mycontacts_requests_template";


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Parse the name for a user
         * @param {String} uuid Uuid of the user
         * @param {String} firstName Firstname of the user
         * @param {String} lastName Lastname of the user
         */
        var parseName = function(uuid, profile){
            var displayName = sakai.api.User.getDisplayName(profile);
            if (displayName) {
                return displayName;
            }
            else {
                return uuid;
            }
        };

        /**
         * Parse the picture for a user
         * @param {Object} profile The users profile
         */
        var parsePicture = function(profile){
            var picture = sakai.api.Util.constructProfilePicture(profile);
            if (picture) {
                return picture;
            } else {
                return sakai.config.URL.USER_DEFAULT_ICON_URL;
            }
        };


        ///////////////////////////
        // Get & process contacts //
        ///////////////////////////

        /**
         * Process the information for each friend
         * @param {Object} contacts JSON object containing all the contacts the current user
         */
        var doProcessing = function(contacts){
            var jsonFriends = {};

            // Array that will contain a specified number of contacts of the current user
            jsonFriends.items = [];

            if (contacts.results) {
                // Run process each friend
                for (var i = 0, j = contacts.results.length; i < j; i++) {
                    if (i < numberFriends) {
                        var friend = contacts.results[i];

                        // Set the id of the friend
                        friend.id = friend.target;

                        // Parse the name of the friend
                        friend.name = parseName(friend.target, friend.profile);

                        // Parse the picture of the friend
                        friend.photo = parsePicture(friend.profile);

                        // Contact type
                        friend.type = friend.details["sakai:types"];

                        // Contact description
                        if (friend.profile.basic && friend.profile.basic.elements && friend.profile.basic.elements.description){
                            friend.extra = sakai.api.Util.applyThreeDots(friend.profile.basic.elements.description.value, $(".mycontacts_widget").width() + 120, {max_rows: 1,whole_word: false}, "search_result_course_site_excerpt");
                        }

                        // Contact tags
                        if (friend.profile["sakai:tags"]){
                            friend["sakai:tags"] = friend.profile["sakai:tags"];
                        }

                        // Add the friend to the array
                        jsonFriends.items.push(friend);
                    }
                }
            }
            // Render the template with the contacts
            $(mycontactsList).html(sakai.api.Util.TemplateRenderer(mycontactsListTemplate, jsonFriends));
        };


        /**
         * Get all the contacts for the current user.
         * It only gets the contacts that have an accepted status
         * and the request is ordered by the first and last name of the contacts
         */
        var getFriends = function(){
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_STATE + "?state=ACCEPTED&page=0&items=" + numberFriends,
                cache: false,
                success: function(data){

                    // Process the contacts: username, picture, ...
                    doProcessing(data);
                },
                error: function(xhr, textStatus, thrownError) {

                    // Show the contact error
                    $(mycontactsErrorContactserver, rootel).show();
                }
            });
        };


        //////////////////////
        // Contact requests //
        //////////////////////

        /**
         * Get all the contact request for the current user and show
         * them on the page.
         */
        var getContactRequests = function(){
            $(mycontactsRequests).html(sakai.api.Util.TemplateRenderer(mycontactsRequestsTemplate, sakai.data.me.contacts));
        };


        /////////////////////////////
        // Initialisation function //
        /////////////////////////////

        var doInit = function() {

            // Get the firends for the current user
            getFriends();

            // Get the contacts requests for the current user
            getContactRequests();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("mycontacts");
 
});