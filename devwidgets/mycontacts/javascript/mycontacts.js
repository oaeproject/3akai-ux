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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.mycontacts
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
sakai.mycontacts = function(tuid,showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var numberFriends = 5; // The number of contacts that will be shown

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
     * @param {String} picture The picture path for a user
     * @param {String} userStoragePrefix The user's storage prefix
     */
    var parsePicture = function(profile, uuid){
        // Check if the picture is undefined or not
        // The picture will be undefined if the other user is in process of
        // changing his/her picture
        if (profile && profile.picture && $.parseJSON(profile.picture).name) {
            return "/~" + profile["rep:userId"] + "/public/profile/" + $.parseJSON(profile.picture).name;
        }
        return sakai.config.URL.USER_DEFAULT_ICON_URL;
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
                if (i <= numberFriends) {
                    var friend = contacts.results[i];
                    
                    // Set the id of the friend
                    friend.id = friend.target;

                    // Parse the name of the friend
                    friend.name = parseName(friend.target, friend.profile);

                    // Parse the picture of the friend
                    friend.photo = parsePicture(friend.profile, friend.target);
                    
                    // Add the friend to the array
                    jsonFriends.items.push(friend);
                }
            }
        }
        // Render the template with the contacts
        $(mycontactsList).html($.TemplateRenderer(mycontactsListTemplate, jsonFriends));
    };


    /**
     * Get all the contacts for the current user.
     * It only gets the contacts that have an accepted status
     * and the request is ordered by the first and last name of the contacts
     */
    var getFriends = function(){
        $.ajax({
            url: sakai.config.URL.CONTACTS_ACCEPTED + "?page=0&items=6",
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
        $(mycontactsRequests).html($.TemplateRenderer(mycontactsRequestsTemplate, sakai.data.me.contacts));
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
