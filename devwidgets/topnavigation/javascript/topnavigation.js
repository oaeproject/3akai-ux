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
/*global Config, $, jQuery, get_cookie, delete_cookie, set_cookie, window, alert */

var sakai = sakai || {};


/**
 * @name sakai.topnavigation
 *
 * @class topnavigation
 *
 * @description
 * Initialize the topnavigation widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.topnavigation = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var currentChatStatus = "";

    // Links and labels
    var hiLabel = "#hispan";
    var myprofileName = "#myprofile_name";
    var onlineButton = "#online_button";
    var pictureHolder = "#picture_holder";
    var showOnlineLink = "#show_online";
    var userIdLabel = "#userid";

    // User Link
    var userLink = "#user_link";
    var userLinkMenu = userLink + "_menu";
    var userLinkMenuLink = userLink + "_menu" + " a";

    // Navigation
    var nav = "#nav";
    var navContentMediaLink = "#nav_content_media_link";
    var navCoursesSitesLink = "#nav_courses_sites_link";
    var navCoursesSitesLinkClass = "#nav_courses_sites_link";
    var navPeopleLink = "#nav_people_link";
    var navPeopleLinkClass = "nav_people_link";
    var navMySakaiLink = "#nav_my_sakai_link";
    var navCalendarLink = "#nav_calendar_link";
    var navSelectedNavItemClass = "explore_nav_selected";

    // Messages
    var chatUnreadMessages = "#chat_unreadMessages";

    // Search
    var $general_search_form = $("#general_search_container form");
    var $general_search_input = $("#general_search_input");
    var $general_search_default_value = $("#general_search_default_value");
    var searchFocus = false;

    // Containers
    var exploreNavigationContainer = "#explore_nav_container";

    // CSS Classes
    var searchInputFocusClass = "search_input_focus";
    var chatAvailableStatusClass = "chat_available_status";
    var chatAvailableStatusClassOnline = chatAvailableStatusClass + "_online";
    var chatAvailableStatusClassBusy = chatAvailableStatusClass + "_busy";
    var chatAvailableStatusClassOffline = chatAvailableStatusClass + "_offline";

    var userLinkChatStatusClass = ".user_link_chat_status";

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Get the number of messages that are unread and show it.
     */
    var getCountUnreadMessages = function(){
        //we have the number of unread messages as a part of the me-feed
        //so get it directly from me object.
        $(chatUnreadMessages).text(sakai.data.me.messages.unread);
    };

    /**
     * Update a certain element with a specific chatstatus
     * @param {Object} element Element that needs to be updated
     * @param {String} chatstatus The chatstatus that needs to be added
     */
    var updateChatStatusElement = function(element, chatstatus){
        element.removeClass(chatAvailableStatusClassOnline);
        element.removeClass(chatAvailableStatusClassBusy);
        element.removeClass(chatAvailableStatusClassOffline);
        element.addClass(chatAvailableStatusClass + "_" + chatstatus);
    };

    /**
     * Update the status on the page by firing an event that handles this
     */
    var updateChatStatus = function(){
        // Trigger the chat_status_change event to update other widgets
        $(window).trigger("chat_status_change", currentChatStatus);
    };

    /**
     * Set the chatstatus of the user
     * @param {String} chatstatus The chatstatus which should be
     * online/offline or busy
     */
    var sendChatStatus = function(chatstatus){
        currentChatStatus = chatstatus;

        var data = {
            "chatstatus": chatstatus,
            "_charset_": "utf-8"
        };

        $.ajax({
            url: sakai.data.me.profile["jcr:path"],
            type: "POST",
            data: data,
            success: function(data){
                updateChatStatus();
            },
            error: function(xhr, textStatus, thrownError){
                alert("An error occurend when sending the status to the server.");
            }
        });
    };

    /**
     * Show or hide the user link menu
     * @param {Boolean} hideOnly
     *  true: Hide the menu only
     *  false: Show or hide the menu depending if it's already visible
     */
    var showHideUserLinkMenu = function(hideOnly){
        if ($(userLinkMenu).is(":visible") || hideOnly) {
            $(userLinkMenu).hide();
        }
        else {
            $(userLinkMenu).css("left", Math.round($(userLink).offset().left) + "px");
            $(userLinkMenu).css("top", (Math.round($(userLink).offset().top) + $(userLink).height() + 2) + "px");
            $(userLinkMenu).css("width", ($(userLink).width() + 10) + "px");
            $(userLinkMenu).show();
        }
    };

    /**
     * Add binding to some elements
     */
    var addBinding = function(){
        $(userLink).bind("click", function(){
            showHideUserLinkMenu(false);
        });

        $(userLinkChatStatusClass).bind("click", function(ev){
            showHideUserLinkMenu(false);
            var clicked = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
            sendChatStatus(clicked);
        });

        $(document).bind("click", function(e){
            var $clicked = $(e.target);

            // Check if one of the parents is the userLink
            if (!$clicked.parents().is(userLink)) {
                showHideUserLinkMenu(true);
            }
        });

        $(window).bind("chat_status_change", function(event, currentChatStatus){
            updateChatStatusElement($(userLink), currentChatStatus)
        });
    };

    ////////////////
    // NAVIGATION //
    ///////////////

    /**
     * Select the page in the top navigation where you are currently on.
     * This will apply a class to the selected navigation item based on the current URL
     * @returns void;
     */
    var determineCurrentNav = function(){
        var windowLocationPath = window.location.pathname.toLowerCase();

        // Remove all selected classes from nav elements
        $(nav + " " + navSelectedNavItemClass).removeClass(navSelectedNavItemClass);

        // My Sakai
        if ((windowLocationPath.indexOf(sakai.config.URL.MY_DASHBOARD_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.PUBLIC_MY_DASHBOARD_URL) !== -1)) {
            $(navMySakaiLink).addClass(navSelectedNavItemClass);
            return;
        }

        // Content & Media
        if ((windowLocationPath.indexOf(sakai.config.URL.CONTENT_MEDIA_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.PUBLIC_CONTENT_MEDIA_URL) !== -1)) {
            $(navContentMediaLink).addClass(navSelectedNavItemClass);
            return;
        }

        // People
        if ((windowLocationPath.indexOf(sakai.config.URL.PEOPLE_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.PUBLIC_PEOPLE_URL) !== -1)) {
            $(navPeopleLink).addClass(navSelectedNavItemClass);
            return;
        }

        // Courses & Sites
        if ((windowLocationPath.indexOf(sakai.config.URL.COURSES_SITES_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.PUBLIC_COURSES_SITES_URL) !== -1) || (windowLocationPath.indexOf("/sites/") !== -1)) {
            $(navCoursesSitesLink).addClass(navSelectedNavItemClass);
            return;
        }

        // Calendar
        if ((windowLocationPath.indexOf(sakai.config.URL.SEARCH_GENERAL_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.SEARCH_PEOPLE_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.SEARCH_SITES_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.SEARCH_CONTENT_URL) !== -1) || (windowLocationPath.indexOf(sakai.config.URL.PUBLIC_SEARCH_URL) !== -1)) {
            $(navCalendarLink).addClass(navSelectedNavItemClass);
            return;
        }

    };


    ////////////
    // SEARCH //
    ////////////

    /**
     * Execute the search for the value that is in the search input field
     */
    var doSearch = function(){
        var tosearch = $general_search_input.val();
        // Disable search button
        $("#general_search_submit_button").attr("disabled", true);
        if (tosearch) {
            // Redirecting back to the general search page. This expects the URL to be
            // in a format like this one: page.html#pageid|searchstring
            document.location = sakai.config.URL.SEARCH_GENERAL_URL + "#q=" + tosearch;
            // Only enable button if the location is the search page
            if (window.location.pathname.split("/")[2] === "search.html") {
                $("#general_search_submit_button").attr("disabled", false);
            }
        }
    };

    /**
     * If this is the first time the field gets focus, we'll make his text color black
     * and remove the default value
     */
    $general_search_input.bind("focus", function(ev){
        if (!searchFocus) {
            $general_search_input.val("").addClass(searchInputFocusClass);
            searchFocus = true;
        }
    });

    /**
     * If we leave the field without filling out anything, we'll reinsert the default
     * search inputbox value
     */
    $general_search_input.bind("blur", function(ev){

        if (!$general_search_input.val()) {
            $general_search_input.removeClass(searchInputFocusClass);
            $general_search_input.val($general_search_default_value.text());
            searchFocus = false;
        }
    });

    /**
     * Bind the submit event to the search form
     * This event is triggered when you hit enter in the input field and
     * when you click on the submit button
     */
    $general_search_form.bind("submit", function(){

        doSearch();
        return false;
    });

    /**
     * Switch navigation bar to anonymous mode
     * @returns void
     */
    var switchToAnonymousMode = function(){

        // Show Nav Container
        $(exploreNavigationContainer).show();

        // Hide things which are irrelvant for Anonymous user
        $(".personal .mail").hide();
        $(".personal .sign_out").hide();
        $("#user_link_container").hide();

        // Show anonymous elements
        $("#other_logins_button_container").show();
        $("#register_button_container").show();
        $("#login_button_container").show();

        // Set up public nav links
        $("#nav_my_sakai_link a").attr("href", sakai.config.URL.PUBLIC_MY_DASHBOARD_URL);
        $("#nav_content_media_link a").attr("href", sakai.config.URL.PUBLIC_CONTENT_MEDIA_URL_PAGE);
        $("#nav_people_link a").attr("href", sakai.config.URL.PUBLIC_PEOPLE_URL);
        $("#nav_courses_sites_link a").attr("href", sakai.config.URL.PUBLIC_COURSES_SITES_URL);
        $("#nav_search_link a").attr("href", sakai.config.URL.PUBLIC_SEARCH_URL_PAGE);

        // Make the login page redirect to the current page after login
        $(".log_in").attr("href", $(".log_in").attr("href") + "?url=" + escape(window.location.pathname + window.location.search + window.location.hash));

    };

    /**
     * Set the presence for the current user
     * We need to do this in order to let the server know the user is still available for chatting.
     */
    var setPresence = function(){

        var data = {
            "sakai:status": "online",
            "_charset_": "utf-8"
        };

        $.ajax({
            url: sakai.config.URL.PRESENCE_SERVICE,
            type: "POST",
            success: function(){
                setTimeout(setPresence, 120000);
            },
            data: data
        });
    };

    /**
     * Parse the chatstatus for a user
     * @param {String} chatStatus The chatstatus which should be
     * online, busy or offline
     */
    var parseChatStatus = function(chatStatus){
        // Check if the status is defined
        if (!chatStatus) {
            chatStatus = "online";
        }
        return chatStatus;
    };

    /**
     * Get the chat status for the current user
     */
    var getChatStatus = function(){
        if (sakai.data.me.profile) {
            currentChatStatus = parseChatStatus(sakai.data.me.profile.chatstatus);
        }
        else {
            currentChatStatus = "online";
        }
        updateChatStatus();
    };

    ///////////////////////
    // Initial functions //
    ///////////////////////

    /**
     * Contains all the functions and methods that need to be
     * executed on the initial load of the page
     */
    var doInit = function(){
        var obj = {};
        var menulinks = [];

        for (var i in sakai.config.Navigation) {
            var temp = new Object();
            temp.url = sakai.config.Navigation[i].url;
            temp.label = sakai.api.i18n.General.getValueForKey(sakai.config.Navigation[i].label);
            if (i == 0) {
                temp.firstlink = true;
            }
            else {
                temp.firstlink = false;
            }
            menulinks.push(temp);
        }
        obj.links = menulinks;
        // Get navigation and render menu template
        $(".explore").html($.TemplateRenderer("navigation_template", obj));

        var person = sakai.data.me;

        $(exploreNavigationContainer).show();

        // Fill in the name of the user in the different fields
        if (sakai.api.User.getDisplayName(person.profile) !== "") {
            $(userIdLabel).text(sakai.api.User.getDisplayName(person.profile));
            $(hiLabel).text(sakai.api.User.getProfileBasicElementValue(person.profile, "firstName"));
        }

        // Show the profile picture on the dashboard page
        /** TODO : Remove the lines beneath if this functionality is inside changepic.js */
        if (person.profile.picture) {
            var picture = $.parseJSON(person.profile.picture);
            if (picture.name) {
                $(pictureHolder).attr("src", "/~" + sakai.data.me.user.userid + "/public/" + picture.name);
            }
        }

        // Highlight current nav item
        determineCurrentNav();

        // Set presence and bind things
        addBinding();
        getCountUnreadMessages();
        setPresence();

        // Get chat status
        getChatStatus();
    };

    if (sakai.data.me.user.anon) {
        // If a user is not logged in -> switch to anonymous mode
        switchToAnonymousMode();
    }
    else {
        doInit();
    }

};
sakai.api.Widgets.widgetLoader.informOnLoad("topnavigation");