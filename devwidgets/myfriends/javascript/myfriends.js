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

/*global $, Config, sdata */

var sakai = sakai || {};

sakai.myfriends = function(tuid,showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var numberFriends = 5; // The number of friends that will be shown

    // - ID
    var myfriends = "#myfriends";

    // Contact request
    var myfriendsRequests = myfriends + "_requests";

    // Error
    var myfriendsError = myfriends + "_error";
    var myfriendsErrorContactserver = myfriendsError + "_contactserver";

    // List
    var myfriendsList = myfriends + "_list";

    // Templates
    var myfriendsListTemplate = "myfriends_list_template";
    var myfriendsRequestsTemplate = "myfriends_requests_template";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Parse the name for a user
     * @param {String} uuid Uuid of the user
     * @param {String} firstName Firstname of the user
     * @param {String} lastName Lastname of the user
     */
    var parseName = function(uuid, firstName, lastName){
        if (firstName && lastName) {
            return firstName + " " + lastName;
        }
        else {
            return uuid;
        }
    };

    /**
     * Parse the picture for a user
     * @param {String} picture The picture path for a user
     * @param {String} userStoragePrefix The user's storage prefix
     */
    var parsePicture = function(profile, uuid){
        // Check if the picture is undefined or not
        // The picture will be undefined if the other user is in process of
        // changing his/her picture
        if (profile && $.evalJSON(profile.picture).name) {
            return "/_user" + profile.path + "/public/profile/" + $.evalJSON(profile.picture).name;
        }
        return sakai.config.URL.USER_DEFAULT_ICON_URL;
    };


    ///////////////////////////
    // Get & process friends //
    ///////////////////////////

    /**
     * Process the information for each friend
     * @param {Object} friends JSON object containing all the friends the current user
     */
    var doProcessing = function(friends){
        var jsonFriends = {};

        // Array that will contain a specified number of friends of the current user
        jsonFriends.items = [];

        if (friends.results) {

            // Run process each friend
            for (var i = 0, j = friends.results.length; i < j; i++) {
                if (i <= numberFriends) {
                    var friend = friends.results[i];

                    // Set the id of the friend
                    friend.id = friend.target;

                    // Parse the name of the friend
                    friend.name = parseName(friend.target, friend.profile.firstName, friend.profile.lastName);

                    // Parse the picture of the friend
                    friend.photo = parsePicture(friend.profile, friend.target);

                    // Add the friend to the array
                    jsonFriends.items.push(friend);
                }
            }
        }

        // Render the template with the friends
        $(myfriendsList).html($.TemplateRenderer(myfriendsListTemplate, jsonFriends));
    };


    /**
     * Get all the friends for the current user.
     * It only gets the friends that have an accepted status
     * and the request is ordered by the first and last name of the friends
     */
    var getFriends = function(){
        $.ajax({
            url: sakai.config.URL.CONTACTS_ACCEPTED + "?page=0&items=6",
            cache: false,
            success: function(data){

                // Parse the data into a JSON object
                var friends = $.evalJSON(data);

                // Process the friends: username, picture, ...
                doProcessing(friends);
            },
            error: function(xhr, textStatus, thrownError) {

                // Show the contact error
                $(myfriendsErrorContactserver, rootel).show();
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
        $.ajax({
            url: sakai.config.URL.CONTACTS_INVITED,
            cache: false,
            success: function(data){
                var contactrequests = $.evalJSON(data);
                var jsonTotal = {};
                jsonTotal.total = 0;

                // Check if the array contains any friends
                if (contactrequests.total){

                    // Only count the contacts which status is Invited
                    jsonTotal.total += contactrequests.total;
                }

                // Render the requests on the page
                $(myfriendsRequests).html($.TemplateRenderer(myfriendsRequestsTemplate, jsonTotal));
            }
        });
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

sdata.widgets.WidgetLoader.informOnLoad("myfriends");
