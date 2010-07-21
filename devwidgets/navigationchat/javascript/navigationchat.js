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
/*global Config, $, jQuery, sdata, get_cookie, delete_cookie, set_cookie, window, alert */

var sakai = sakai || {};

sakai.flashChat = {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    flashing: [], // Array that contains all the uids of the users that need to flash
    // Links and labels
    onlineButton: "#online_button",
    chatWith: "#chat_with",

    // CSS Classes
    showOnlineVisibleClass: "show_online_visible",


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Scroll to the bottom of an element
     * @param {Object} el The element that needs to be scrolled down
     */
    scroll_to_bottom: function(el){
        el.attr("scrollTop", el.attr("scrollHeight"));
    },

    /////////////////////
    // Flash functions //
    /////////////////////

    /**
     * This will give the command to start the bar to flash
     * @param {String} uid
     *  The uid of the user which window needs to flash
     * @param {Boolean} openWindow
     *  true: Open the chat window during the flash
     *  false: Don't open the chat window
     */
    doFlash: function(uid, openWindow){

        var busy = false;

        for (var i = 0, j = sakai.flashChat.flashing.length; i < j; i++) {
            if (sakai.flashChat.flashing[i] === uid) {
                busy = true;
            }
        }

        if (!busy) {
            sakai.flashChat.startFlashing(uid, 0, openWindow);
        }

    },

    /**
     * This will start the flashing for a certain window
     * @param {String} uid
     *  The uid of the user which window needs to flash
     * @param {Integer} i
     *  The count of how many times it has flashed already
     * @param {Boolean} openWindow
     *  true: Open the chat window during the flashing
     *  false: Don't open the chat window
     */
    startFlashing: function(uid, i, openWindow){

        var till = 0;
        var el = $(sakai.flashChat.onlineButton + "_" + uid);

        // Check if the openWindow variable is true or false
        if (openWindow) {
            till = 9;
            // Open the window and show the chats for this user
            $(sakai.flashChat.chatWith + "_" + uid).show();

            // Scroll to the bottom of the content div
            var el_content = $(sakai.flashChat.chatWith + "_" + uid + "_content");
            sakai.flashChat.scroll_to_bottom(el_content);
        }
        else {
            till = 10;
        }

        // Check if the count is even or not
        if (i % 2 === 0) {

            el.removeClass(sakai.flashChat.showOnlineVisibleClass);
        }
        else {

            el.addClass(sakai.flashChat.showOnlineVisibleClass);
        }

        // Check whether it should stop flashing
        if (i < till) {
            i = i + 1;
            setTimeout("sakai.flashChat.startFlashing('" + uid + "'," + i + "," + openWindow + ")", 500);
        }
        else {
            // The box has flashed enough times.
            // Look for the uuid in the flashing array and remove it.
            var index = -1;
            for (var k = 0; k < sakai.flashChat.flashing.length; k++) {
                if (sakai.flashChat.flashing[k] === uid) {
                    index = k;
                }
            }
            sakai.flashChat.flashing.splice(index, 1);
        }
    }
};

sakai.navigationchat = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var currentChatStatus = "";
    var hasOpenChatWindow = false; // Does the current user has open chat windows
    var personIconUrl = sakai.config.URL.USER_DEFAULT_ICON_URL;
    var pulltime = "2100-10-10T10:10:10.000Z";
    var time = [];
    var sendMessages = []; // Array containing the id's of all the send messages

    // JSON
    var activewindows = {
        "items" : []
    };
    var allFriends = false;
    var onlineFriends = [];
    var goBackToLogin = false;
    var online = false;

    // Links and labels
    var hiLabel = "#hispan";
    var myprofileName = "#myprofile_name";
    var onlineButton = "#online_button";
    var pictureHolder = "#picture_holder";
    var showOnlineLink = "#show_online";
    var userIdLabel = "#userid";

    // Chat
    var chatAvailable = "#chat_available";
    var chatAvailableMinimize = chatAvailable + "_minimize";
    var chatOnline = "#chat_online";
    var chatOnlineConnectionsLink = chatOnline + "_connections_link";
    var chatUnreadMessages = "#chat_unreadMessages";
    var chatWindow = "#chat_window";
    var chatWindowChatstatus = chatWindow + "_chatstatus";
    var chatWindows = "#chat_windows";
    var chatWith = "#chat_with";

    // Navigation
    var nav = "#nav";
    var navContentMediaLink = "#nav_content_media_link";
    var navCoursesSitesLink = "#nav_courses_sites_link";
    var navPeopleLink = "#nav_people_link";
    var navMySakaiLink = "#nav_my_sakai_link";
    var navCalendarLink = "#nav_calendar_link";
    var navSelectedNavItemClass = "explore_nav_selected";

    // Seach
    var $general_search_form = $("#genaral_search_container form");
    var $general_search_input = $("#general_search_input");
    var searchFocus = false;

    // User Link
    var userLink = "#user_link";
    var userLinkMenu = userLink + "_menu";
    var userLinkMenuLink = userLink + "_menu" + " a";

    // Login
    var $login_error_message = $("#login_error_message");
    var $login_container = $("#login_container");
    var $login_submit_button = $("#login_submit_button");
    var $login_cancel_button = $("#login_cancel_button");
    var $login_busy = $("#login_busy");

    // CSS Classes
    var searchInputFocusClass = "search_input_focus";

    var chatAvailableStatusClass = "chat_available_status";
    var chatAvailableStatusClassOnline = chatAvailableStatusClass + "_online";
    var chatAvailableStatusClassBusy = chatAvailableStatusClass + "_busy";
    var chatAvailableStatusClassOffline = chatAvailableStatusClass + "_offline";

    var chatWithContentClass = "chat_with_content";
    var chatWithContentNooverflowClass = chatWithContentClass + "_nooverflow";
    var chatWithContentOverflowClass = chatWithContentClass + "_overflow";

    var showOnlineVisibleClass = "show_online_visible";

    // CSS Classes with .
    var initiateWindowClass = ".initiate_chat_window";
    var userLinkChatStatusClass = ".user_link_chat_status";
    var userChatClass = ".user_chat";

    var chatClass = ".chat";
    var chatCloseClass = chatClass + "_close";
    var chatMinimizeClass = chatClass + "_minimize";
    var chatWithTxtClass = chatClass + "_with_txt";

    // Containers
    var chatMainContainer = "#chat_main_container";
    var exploreNavigationContainer = "#explore_nav_container";

    // Templates
    var chatAvailableTemplate = "chat_available_template";
    var chatContentTemplate = "chat_content_template";
    var chatWindowsTemplate = "chat_windows_template";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /*
     * Placeholders that will be replaced by the real functions. This
     * is necessary to comply with the JSLint rules
     */
    sakai.navigationchat.loadChatTextInitial = function(){};
    var doWindowRender = function(){};

    /**
     * Clone a certain object.
     * We need this in activewindows, to not change the original object
     * @param {Object} obj Object that needs to be cloned
     */
    var clone = function(obj){
        return jQuery.extend(true, {}, obj);
    };

    /**
     * Scroll to the bottom of an element
     * @param {Object} el The element that needs to be scrolled down
     */
    var scroll_to_bottom = function(el){
        el.attr("scrollTop", el.attr("scrollHeight"));
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
     * Parse the name for a user
     * @param {String} uuid Uuid of the user
     * @param {String} firstName Firstname of the user
     * @param {String} lastName Lastname of the user
     */
    var parseName = function(uuid, firstName, lastName){
        if (firstName && lastName) {
            return sakai.api.Util.shortenString(firstName + " " + lastName, 11);
        }
        else {
            return sakai.api.Util.shortenString(uuid, 11);
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
            return "/_user" + profile.path + "/public/profile/" + $.parseJSON(profile.picture).name;
        }
        else {
            return personIconUrl;
        }
    };

    /**
     * Parse the status message for a user
     * @param {Object} basic JSON basic variable inside the profile information
     */
    var parseStatusMessage = function(basic){
        if (basic) {
            var base = $.parseJSON(basic);
            if (base.status) {
                return sakai.api.Util.shortenString(base.status, 20);
            }
        }
        return sakai.api.Util.shortenString("No status message");
    };

    /**
     * Add the id of the message to the array of send messages
     * We needed to know which messages were send because otherwise
     * the person who sended the message saw it 2 times
     * @param {String} messageid The id of the message that was send
     */
    var addToSendMessages = function(messageid){

        // Add the id of the message to the sendmessages array
        sendMessages.push(messageid);
    };

    /**
     * Get the number of messages that are unread and show it.
     */
    var getCountUnreadMessages = function(){
        // We only get the number of messages in our inbox folder that we havent read yet.
        $.ajax({
            url: sakai.config.URL.MESSAGE_BOX_SERVICE + "?box=inbox",
            success: function(data){

                // Count unread messages
                var unread_message_count = 0;
                for (var i = 0; i < data.results.length; i++) {
                    if (data.results[i]["sakai:read"] === false) {
                        unread_message_count++;
                    }
                }

                // Update display
                $(chatUnreadMessages).text(unread_message_count);
            },
            error: function(xhr, status, thrown) {
                fluid.log("Navigationchat widget - it was not possible to get the unread messages from the server.");
            }
        });
    };


    ////////////////
    // NAVIGATION //
    ///////////////

    /**
     * Keep focus above chat panel for keyboard navigation
     */
    $("a, input, select, textarea").focus(function(ev) {
        var chatHeight = $(".chat_main_container").height();
        //var scrOfY = $(window).scrollTop(); // broken in IE
        var scrOfY = 0;
        if( typeof( window.pageYOffset ) === 'number' ) {
            //Mozilla compliant
            scrOfY = window.pageYOffset;
        } else if( document.body && ( document.body.scrollTop ) ) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
        } else if( document.documentElement && ( document.documentElement.scrollTop ) ) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
        }

        if ((this.offsetTop + $(this).height() + chatHeight) > (scrOfY + $(window).height())){
            window.scrollBy(0,100);
        }
    });

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

        if (tosearch) {
            // Redirecting back to the general search page. This expects the URL to be
            // in a format like this one: page.html#pageid|searchstring
            document.location = sakai.config.URL.SEARCH_GENERAL_URL + "#q=" + tosearch;
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
     * Bind the submit event to the search form
     * This event is triggered when you hit enter in the input field and
     * when you click on the submit button
     */
    $general_search_form.bind("submit", function(){
        doSearch();
        return false;
    });


    //////////
    // Chat //
    //////////

    /**
     * Hide the container with your online friends
     */
    var hideOnline = function(){
        $(showOnlineLink).hide();
        $(onlineButton).removeClass(showOnlineVisibleClass);
    };

    /**
     * Show the container with your online friends
     */
    var showOnline = function(){
        var onlineWindow = $(showOnlineLink);
        onlineWindow.css("bottom", 31 + onlineWindow.height() + "px");
        $(showOnlineLink).show();
        $(onlineButton).addClass(showOnlineVisibleClass);
    };

    /**
     * Hide/Show the container with your online friends
     */
    var showHideOnline = function(){
        if ($(showOnlineLink).is(":visible")) {
            hideOnline();
        }
        else {
            showOnline();
        }
    };

    /**
     * Get a user from the all friends object
     * @param {Object} uuid Uid of the user you want to get
     * @return
     *  Will return a userobject matching the uuid
     *  Will return null if no match is found
     */
    var getUserFromAllFriends = function(uuid){
        for (var i = 0, j = allFriends.users.length; i < j; i++) {
            if (allFriends.users[i].userid === uuid) {
                return allFriends.users[i];
            }
        }
        return null;
    };

    /**
     * Update an item in the activewindow
     * @param {String} userid User id of the user
     * @param {String} item Item that needs to be updated
     * @param {String} value Value of the item that needs to be updated
     */
    var updateActiveWindows = function(userid, item, value){
        for (var i = 0, j = activewindows.items.length; i < j; i++) {
            if (activewindows.items[i].userid === userid) {
                activewindows.items[i][item] = value;
            }
        }
    };

    /**
     * Update and element (only if it has to) with a value
     * @param {String} userid The user id of the user
     * @param {String} item Item that needs to be updated
     * @param {String} value Value in the element that needs to be updated
     */
    var updateChatWindowElement = function(userid, item, value){
        var el = $(chatWindow + "_" + item + "_" + userid);
        switch (el.get(0).tagName.toLowerCase()) {
            case "span":
                // To avoid flickering of the element we check if the element already has this value.
                // This improves the overall performance.
                if (el.text() !== value) {
                    el.text(sakai.api.Security.saneHTML(value));
                    updateActiveWindows(userid, item, value);
                }
                break;
            case "img":
                if (el.attr("src") !== value) {
                    el.attr("src", value);
                    updateActiveWindows(userid, item, value);
                }
                break;
        }
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
     * Update the chat status of a specific chat window
     * @param {Object} userid The user id of the user
     * @param {Object} value The status which should be updated if necessary
     */
    var updateChatWindowChatStatus = function(userid, value){
        var el = $(chatWindowChatstatus + "_" + userid);

        // Do a check to make sure that this element doesn't already have this class.
        if (!el.hasClass(chatAvailableStatusClass + "_" + value)) {
            updateChatStatusElement(el, value);
            updateActiveWindows(userid, "chatstatus", value);
        }
    };

    /**
     * Update the chatwindow for a certain user
     * @param {Object} user Object that contains the user information
     */
    var updateChatWindow = function(user){
        if ($(chatWith + "_" + user.userid).length > 0) {
            updateChatWindowChatStatus(user.userid, user.chatstatus);
            updateChatWindowElement(user.userid, "photo", user.photo);
            updateChatWindowElement(user.userid, "name", user.name);
            updateChatWindowElement(user.userid, "statusmessage", user.statusmessage);
        }
    };

    /**
     * Hide the chat window for a specific element and button
     * @param {Object} elementWindow The element that contains the window
     * @param {Object} elementButton The button of the window
     */
    var hideOnlineWindow = function(elementWindow, elementButton){
        elementWindow.hide();
        elementButton.removeClass(showOnlineVisibleClass);
    };

    /**
     * Show the chat window for a specific element and button
     * @param {Object} elementWindow The element that contains the window
     * @param {Object} elementButton The button of the window
     */
    var showOnlineWindow = function(elementWindow, elementButton){
        elementWindow.show();
        elementButton.addClass(showOnlineVisibleClass);
    };

    /**
     * Toggle a certain chat window
     * @param {String} selected The uuid of the user's window that
     * needs to be toggled
     */
    var toggleChatWindow = function(selected){
        var el = $(chatWith + "_" + selected);
        var el_content = $(chatWith + "_" + selected + "_content");
        var el_button = $(onlineButton + "_" + selected);

        if (!el.is(":visible")) {

            // Run over all the activewindows and set their active property on false
            // Only if the activewindow is from the 'selected' userid, the active property should be true
            for (var i = 0, j = activewindows.items.length; i < j; i++) {
                hideOnlineWindow($(chatWith + "_" + activewindows.items[i].userid), $(onlineButton + "_" + activewindows.items[i].userid));
                activewindows.items[i].active = false;
                if (activewindows.items[i].userid === selected) {
                    activewindows.items[i].active = true;
                }
            }

            // Hide the window containing all the online friends
            hideOnline();

            // Show the selected window
            showOnlineWindow(el, $(onlineButton + "_" + selected));
            hasOpenChatWindow = true;
        }
        else {

            // If the selected element is visible, hide all the windows
            for (var k = 0; k < activewindows.items.length; k++) {
                if (activewindows.items[k].userid === selected) {
                    activewindows.items[k].active = false;
                }
            }
            hideOnlineWindow(el, el_button);
            hasOpenChatWindow = false;
        }

        /** Scroll to the bottom of the content div */
        scroll_to_bottom(el_content);
    };

    /**
     * Open the chat window and execute some functions for a specific user
     * @param {String} clicked The uid of the user's window that needs to
     * be opened
     */
    var openChat = function(clicked){

        // Close the other chat windows
        for (var i = 0, j = activewindows.items.length; i < j; i++) {
            if (activewindows.items[i].userid === clicked) {
                toggleChatWindow(clicked);
                return;
            }
        }

        hasOpenChatWindow = true;

        var index = activewindows.items.length;
        activewindows.items[index] = {};
        activewindows.items[index].userid = clicked;
        activewindows.items[index].active = true;

        // To limit the requests (and so have less load on the server and client) we
        // just get the user from an object we created from a previous requests.
        var user = getUserFromAllFriends(clicked);

        if (user !== null) {
            activewindows.items[index].name = user.name;
            activewindows.items[index].photo = user.photo;
            activewindows.items[index].status = user.status;
            activewindows.items[index].statusmessage = user.statusmessage;
            activewindows.items[index].chatstatus = user.chatstatus;
        }
        else {
            alert("An error has occured");
        }

        var specialjson = {};
        specialjson.items = [];
        specialjson.items[0] = clone(activewindows.items[index]);

        doWindowRender(clicked, specialjson);

        sakai.navigationchat.loadChatTextInitial(true, activewindows);
    };

    /**
     * Add binding to the chat windows
     */
    var addChatBinding = function(){
        $(chatAvailableMinimize).live("click", function(){
            hideOnline();
        });

        $(initiateWindowClass).live("click", function(ev){
            var clicked = this.id.split("_")[this.id.split("_").length - 1];
            openChat(clicked);
        });
    };
    addChatBinding();

    /**
     * Save the json object containing all friends
     * to an easier to read friends object
     * @param {Object} jsonitem
     */
    var saveToAllFriends = function(jsonitem){
        var user = {};
        user.userid = jsonitem.user;
        user.name = jsonitem.name;
        user.photo = jsonitem.photo;
        user.chatstatus = jsonitem.chatstatus;
        user.status = jsonitem.status;
        user.statusmessage = jsonitem.statusmessage;
        allFriends.users.push(user);
        updateChatWindow(user);
    };

    /**
     * Check if a certain user is online or not
     * @param {Array} onlinefriends Array that contains all the friends
     * @param {String} userid Userid of the user
     * @return Boolean true if the user is online
     */
    var checkOnlineFriend = function(onlinefriends, userid){
        var isOnline = false;
        if (onlinefriends) {
            for (var i = 0, j = onlinefriends.length; i < j; i++) {
                if (onlinefriends[i].user === userid) {
                    isOnline = true;
                }
            }
        }
        return isOnline;
    };

    /**
     * Enable / disable the chat input for online / offline users
     */
    var enableDisableOnline = function(){
        if (activewindows.items) {
            for (var i = 0; i < activewindows.items.length; i++) {

                var friendId = activewindows.items[i].userid;
                var friendName = activewindows.items[i].name;
                var isOnline = checkOnlineFriend(online.items, friendId);

                // We check if the text is "userid is offline" because we don't want to delete other text
                if (isOnline) {
                    if ($(chatWith + "_" + friendId + "_txt").val() === friendName + " is offline") {
                        $(chatWith + "_" + friendId + "_txt").removeAttr("disabled");
                        $(chatWith + "_" + friendId + "_txt").val("");
                    }
                }
                else {
                    $(chatWith + "_" + friendId + "_txt").attr("disabled", true);
                    $(chatWith + "_" + friendId + "_txt").val(friendName + " is offline");
                    updateChatWindowChatStatus(friendId, "offline");
                }

            }
        }
    };

    /**
     * Show the friends that are online (status and chatstatus)
     */
    var showOnlineFriends = function(){
        var json = online;
        var total = 0; //Total online friends
        allFriends = {};
        allFriends.users = [];
        if (json.contacts !== undefined) {
            for (var i = 0, j = json.contacts.length; i < j; i++) {
                if (typeof json.contacts[i].profile === "string") {
                    json.contacts[i].profile = $.parseJSON(json.contacts[i].profile);
                }
                json.contacts[i].chatstatus = parseChatStatus(json.contacts[i].profile.chatstatus);
                /** Check if a friend is online or not */
                if (json.contacts[i]["sakai:status"] === "online" && json.contacts[i].chatstatus !== "offline") {
                    total++;
                    onlineFriends.push(json.contacts[i]);
                }

                json.contacts[i].name = parseName(json.contacts[i].userid, json.contacts[i].profile.firstName, json.contacts[i].profile.lastName);
                json.contacts[i].photo = parsePicture(json.contacts[i].profile, json.contacts[i].profile["rep:userId"]);
                json.contacts[i].statusmessage = parseStatusMessage(json.contacts[i].profile.basic);

                saveToAllFriends(json.contacts[i]);
            }
        }

        if (!total || total === 0) {
            json.items = [];
            json.totalitems = total;
            $(chatOnline).html("(0)");
        } else {
            json.totalitems = total;
            $(chatOnline).html("<b>(" + total + ")</b>");
        }

        json.me = {};
        if (json.me) {
        json.me.name = parseName(sakai.data.me.user.userid, sakai.data.me.profile.firstName, sakai.data.me.profile.lastName);
        json.me.photo = parsePicture(sakai.data.me.profile, sakai.data.me.user.userid);
        json.me.statusmessage = parseStatusMessage(sakai.data.me.profile.basic);
        json.me.chatstatus = currentChatStatus;

        // We render the template, add it to a temporary div element and set the html for it.
        json.items = [];
        for (var j = 0, k = json.contacts.length; j < k; j++) {
            if (json.contacts[j]["sakai:status"] == "online" && json.contacts[j].chatstatus !== "offline") {
                json.items.push(json.contacts[j]);
            }
        }
        var renderedTemplate = $.TemplateRenderer(chatAvailableTemplate, json).replace(/\r/g, '');
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedTemplate);

        // We only render the template when it's needed.
        // The main reason we do this is to improve performance.
        // It was not possible to compare the html from chatAvailable to the renderedTemplate (<br /> where replaced with <br>)
        // so we made the temporary div, added the rendered template html for it and compared that to the html from chatAvailable
        if ($(chatAvailable).html() !== renderedDiv.html()) {
            $(chatAvailable).html(renderedTemplate);
            var onlineWindow = $(showOnlineLink);
            onlineWindow.css("bottom", 31 + onlineWindow.height() + "px");
        }
        }

        enableDisableOnline();

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
     * Update the status on the page
     */
    var updateChatStatus = function(){
        updateChatStatusElement($(userLink), currentChatStatus);
        if ($(myprofileName)) {
            updateChatStatusElement($(myprofileName), currentChatStatus);
        }
        showOnlineFriends();
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
            if(!$clicked.parents().is(userLink)){
                showHideUserLinkMenu(true);
            }
        });
    };

    /**
     * Return the render of a certain chat message
     * @param {Object} message Message that needs to be rendered
     */
    var renderChatMessage = function(message){
        return $.TemplateRenderer(chatContentTemplate, message);
    };

    /**
     * Check the height of an element and add overflow or not
     * @param {Object} el Element that needs to be checked
     * @param {String} nooverflow Class that will be added if the height is not too big
     * @param {String} overflow Class that will be added it the height is too big
     */
    var checkHeight = function(el, nooverflow, overflow){
        if (el.hasClass(nooverflow)) {
            var totalHeight = 0;
            el.children().each(function(){
                totalHeight += $(this).attr('scrollHeight');
                if (totalHeight >= el.height()) {
                    el.removeClass(nooverflow);
                    el.addClass(overflow);
                }
            });
        }
    };

    /**
     * Add a chat message
     * @param {Object} el Element where the element needs to be attached to
     * @param {Object} message Message that needs to be appended
     */
    var addChatMessage = function(el, message){
        if (el.length > 0) {
            el.append(sakai.api.Security.saneHTML(renderChatMessage(message)));
            checkHeight(el, chatWithContentNooverflowClass, chatWithContentOverflowClass);
            scroll_to_bottom(el);
        }
    };

    /**
     * Format the input date to a AM/PM Date
     * @param {Date} d Date that needs to be formatted
     */
    var parseToAMPM = function(d){
        var current_hour = d.getHours();
        var am_or_pm = "";
        if (current_hour < 12) {
            am_or_pm = "AM";
        }
        else {
            am_or_pm = "PM";
        }
        if (current_hour === 0) {
            current_hour = 12;
        }
        if (current_hour > 12) {
            current_hour = current_hour - 12;
        }

        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1) {
            current_minutes = "0" + current_minutes;
        }

        return current_hour + ":" + current_minutes + am_or_pm;
    };

    /**
     * Create a chat message
     * @param {Object} isMessageFromOtherUser Is the message from another user
     * @param {Object} otherUserName The name of the other user
     * @param {Object} inputmessage The text that needs to be added to the message
     * @param {Object} inputdate The date of the message
     */
    var createChatMessage = function(isMessageFromOtherUser, otherUserName, inputmessage, inputdate){
        var message = {};

        // Check if the message is from the other user
        if (isMessageFromOtherUser) {
            message.name = otherUserName;
        }
        else {
            message.name = "Me";
        }

        message.message = inputmessage;

        /** Parse the date to get the hours and minutes */
        //var messageDate = new Date(inputdate);
        //2009-07-27T13:48:47.999+01:00
        var messageDate = false;
        if (typeof inputdate === "string") {
            messageDate = new Date(parseInt(inputdate.substring(0, 4), 10), parseInt(inputdate.substring(5, 7), 10) - 1, parseInt(inputdate.substring(8, 10), 10), parseInt(inputdate.substring(11, 13), 10), parseInt(inputdate.substring(14, 16), 10), parseInt(inputdate.substring(17, 19), 10));
        }
        else {
            messageDate = new Date(inputdate);
        }
        message.time = parseToAMPM(messageDate);

        return message;
    };

    /**
     * Render all the chat windows on the bottom of the page
     * @param {String} clicked The uuid of the friend that needs to be rendered
     * @param {Object} special JSON Object containing information about the user(s)
     * that need to be rendered seperately without rendering everything
     */
    doWindowRender = function(clicked, special){

        if (sakai.data.me.user.anon) {
            return;
        }

        if (special) {
            // We only add one extra chatbox
            // This value will be used to calculate the left value for the box
            special.special = activewindows.items.length - 1;
            $(chatWindows).append($.TemplateRenderer(chatWindowsTemplate, special));
            $("#chat_windows_container").append($.TemplateRenderer("chat_windows_windows_template", special));
        }
        else {
            // Render all the current chats.
            activewindows.special = false;
            $(chatWindows).html($.TemplateRenderer(chatWindowsTemplate, activewindows));
            $("#chat_windows_container").html($.TemplateRenderer("chat_windows_windows_template", activewindows));

        }

        enableDisableOnline();

        if (clicked) {
            hideOnline();
            var el = $(chatWith + "_" + clicked);
            var el_button = $(onlineButton + "_" + clicked);
            showOnlineWindow(el, el_button);
            hasOpenChatWindow = true;
        }

        // We don't use the live feature of jQuery here.
        // Sometimes it gives an NSDocument exception in firefox.

        // Every time we do this functions these events listeners will be binded.
        // So we have to remove them every time as well.
        $(userChatClass).unbind("click");
        $(userChatClass).bind("click", function(ev){
            var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
            toggleChatWindow(selected);
        });

        $(chatMinimizeClass).unbind("click");
        $(chatMinimizeClass).bind("click", function(ev){
            var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
            toggleChatWindow(selected);
        });


        $(chatCloseClass).unbind("click");
        $(chatCloseClass).bind("click", function(ev){
            var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
            var toremove = -1;
            for (var i = 0; i < activewindows.items.length; i++) {
                if (activewindows.items[i].userid === selected) {
                    toremove = i;
                }
            }
            activewindows.items.splice(toremove, 1);

            $(onlineButton + "_" + selected).remove();
            $(chatWith + "_" + selected).remove();

            //hasOpenChatWindow = false;
            //$("#chat_windows_container").html($.TemplateRenderer("chat_windows_windows_template", activewindows));

            for (var j = 0; j < activewindows.items.length; j++) {
                $(chatWith + "_" + activewindows.items[j].userid).css("left", "" + (j * 150) + "px");
                if (j === 0) {
                    $("#online_button_" + activewindows.items[j].userid).parent().addClass("user_chat_first");
                }
            }
        });

        $(chatWithTxtClass).unbind("keydown");
        $(chatWithTxtClass).bind("keydown", function(ev){
            if (ev.keyCode === 13) {

                // Get the id of the user you are chatting with
                var currentuser = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 2];

                // Get the message/text you just wrote to him/her
                var text = $(chatWith + "_" + currentuser + "_txt").val();

                // Check if the text is not empty
                if (text !== "") {

                    // Create a chat message object
                    var message = {};

                    // Fill in the object with the appropriate data
                    message = createChatMessage(false, "", text, new Date());

                    // Add the chat message to the window
                    addChatMessage($(chatWith + "_" + currentuser + "_content"), message);

                    // Clear the input box
                    $(chatWith + "_" + currentuser + "_txt").val("");

                    var data = {
                        "sakai:type": "chat",
                        "sakai:sendstate": "pending",
                        "sakai:messagebox": "outbox",
                        "sakai:to": "chat:" + currentuser,
                        "sakai:from": sakai.data.me.user.userid,
                        "sakai:subject": "",
                        "sakai:body": text,
                        "sakai:category": "chat",
                        "_charset_": "utf-8"
                    };

                    $.ajax({
                        url: "/_user" + sakai.data.me.profile.path + "/message.create.html",
                        type: "POST",
                        success: function(data){

                            // Add the id to the send messages object
                            // We need to do this because otherwise the user who
                            // sends the message, will see it 2 times
                            addToSendMessages(data.id);
                        },
                        error: function(xhr, textStatus, thrownError){
                            alert("An error has occured when sending the message.");
                        },
                        data: data
                    });

                }
            }
        });
    };

    /**
     * Bind the connectionslink button
     */
    $(chatOnlineConnectionsLink).bind("click", function(ev){
        for (var i = 0; i < activewindows.items.length; i++) {
            hideOnlineWindow($(chatWith + "_" + activewindows.items[i].userid), $(onlineButton + "_" + activewindows.items[i].userid));
        }
        showHideOnline();
    });

    /**
     * Write a cookie with the current active windows when you go to another page
     */
    $(window).bind("unload", function(ev){
        if (sakai.data.me.user.anon) {
            return;
        }
        else {
            $.cookie('sakai_chat', $.toJSON(activewindows));
        }
    });


    /**
     * Check if there are any new chat messages for the current user
     * A response could look like this:
     * {
     *    update: true,
     *    time: 1255947464940
     * }
     * The update variable will be true
     */
    sakai.navigationchat.checkNewMessages = function(){

        // Create a data object
        var data = {};

        // Check if the time is not 0, if so set the current time
        if (time.length !== 0) {
            data.t = time;
        }

        // Send an Ajax request to check if there are any new messages, but only if there are contacts online
        if ((onlineFriends) && (onlineFriends.length > 0)) {
            $.ajax({
                url: "/_user" + sakai.data.me.profile.path + "/message.chatupdate.json",
                data: data,
                success: function(data){

                    // Get the time
                    time = data.time;
                    pulltime = data.pulltime;

                    if (data.update) {
                        sakai.navigationchat.loadChatTextInitial(false);
                    }
                    else {
                        setTimeout(sakai.navigationchat.checkNewMessages, 5000);
                    }
                }
            });
        }
    };

    /**
     * Load the chat windows
     * @param {Boolean} initial
     *  true: Load the initial chat (receive all the messages)
     *  false: It's not an initial load
     * @param {Object} specialjson
     *  JSON object that contains information about the user window that
     *  needs to be loaded
     */
    sakai.navigationchat.loadChatTextInitial = function(initial, specialjson, hasNew){

        // Check if the current user is anonymous.
        // If this is the case, exit this function
        if (sakai.data.me.user.anon) {
            return;
        }

        // Only completely reload everything if we didn't got a specialjson object
        var doreload = false;
        if (!specialjson) {
            specialjson = activewindows;
            doreload = true;
        }

        // Onlineusers is an array containing the uids that are in the specialjson.items
        var onlineUsers = [];
        if (specialjson.items) {
            for (var i = 0; i < specialjson.items.length; i++) {
                onlineUsers[onlineUsers.length] = specialjson.items[i].userid;
            }
        }

        // Combine all the online users with a comma
        var tosend = onlineUsers.join(",");

        // Send and Ajax request to get the chat messages
        $.ajax({
            url: sakai.config.URL.CHAT_GET_SERVICE.replace(/__KIND__/, "unread"),
            data: {
                "_from": tosend,
                "items": 1000,
                "t": pulltime,
                "sortOn": "sakai:created",
                "sortOrder": "descending"
            },
            cache: false,
            sendToLoginOnFail: true,
            success: function(data){

                // Check if there are any messages inside the JSON object
                if (data.results) {

                    var njson = {};
                    for (var i = data.results.length - 1; i >= 0; i--) {
                        var message = data.results[i];
                        var user = "";
                        if (message.userFrom[0].userid === sakai.data.me.user.userid) {
                            user = message.userTo[0].userid;
                        }
                        else {
                            user = message.userFrom[0].userid;
                        }
                        var isIncluded = true;
                        if (hasNew) {
                            var isIn = false;
                            for (var l = 0; l < specialjson.items.length; l++) {
                                if (specialjson.items[l].userid === user) {
                                    isIn = true;
                                }
                            }
                            if (!isIn) {
                                isIncluded = false;
                            }
                        }
                        if (isIncluded) {
                            if (!njson[user]) {
                                njson[user] = {};
                                njson[user].messages = [];
                            }
                            njson[user].messages[njson[user].messages.length] = message;
                        }
                    }

                    for (var k in njson) {

                        // We need to add the hasOwnProperty to pass to JSLint and it is also a security issue
                        if (njson.hasOwnProperty(k)) {
                            var isMessageFromOtherUser = false;

                            // Check if there exists a window for the user
                            if ($(chatWith + "_" + k).length > 0) {

                                // We check if the message is in the sendMessages array
                                if ($.inArray(njson[k].messages[0].id, sendMessages) !== -1) {
                                    continue;
                                }

                                var el = $(chatWith + "_" + k + "_content");
                                var chatwithusername = parseName(k, njson[k].messages[0].userFrom[0].firstName, njson[k].messages[0].userFrom[0].lastName);

                                // Create a message object
                                var chatmessage = {};

                                for (var j = 0; j < njson[k].messages.length; j++) {
                                    // Check if the message is from the current user or from the friend you are talking to
                                    if (sakai.data.me.user.userid == njson[k].messages[j].userFrom[0].userid) {
                                        isMessageFromOtherUser = false;
                                    }
                                    else {
                                        isMessageFromOtherUser = true;
                                    }

                                    // Create a chat message and add it
                                    chatmessage = createChatMessage(isMessageFromOtherUser, chatwithusername, njson[k].messages[j]["sakai:body"], njson[k].messages[j]["sakai:created"]);
                                    addChatMessage(el, chatmessage);
                                }

                            }
                            else {

                                // Add the user information to the active windows
                                var index = activewindows.items.length;
                                activewindows.items[index] = {};
                                activewindows.items[index].userid = k;
                                activewindows.items[index].active = false;
                                var friendProfile = njson[k].messages[0].userFrom[0];
                                if (njson[k].messages[0].userFrom[0].userid === sakai.data.me.user.userid) {
                                    friendProfile = njson[k].messages[0].userTo[0];
                                }

                                // Parse the name, photo, statusmessage and chatstatus into the activewindows objects
                                activewindows.items[index].name = parseName(k, friendProfile.firstName, friendProfile.lastName);
                                activewindows.items[index].photo = parsePicture(friendProfile, k);
                                activewindows.items[index].statusmessage = parseStatusMessage(friendProfile.basic);
                                activewindows.items[index].chatstatus = parseChatStatus(friendProfile.chatstatus);

                                var togo = true;
                                // Togo will be false if the userid is in the activewindows and it's window is active
                                for (var q = 0; q < activewindows.items.length; q++) {
                                    if (activewindows.items[q].userid === k) {
                                        if (activewindows.items[q].active) {
                                            togo = false;
                                        }
                                    }
                                }

                                if (togo) {
                                    if (hasOpenChatWindow) {
                                        setTimeout("sakai.flashChat.doFlash('" + k + "', false)", 500);

                                    }
                                    else {
                                        setTimeout("sakai.flashChat.doFlash('" + k + "', true)", 500);
                                    }
                                }

                                // Extract existing windows
                                var newactivewindows = {};
                                newactivewindows.items = [];
                                for (var p = 0; p < activewindows.items.length; p++) {
                                    if ($(chatWith + "_" + activewindows.items[p].userid).length === 0) {
                                        newactivewindows.items[newactivewindows.items.length] = activewindows.items[p];
                                    }
                                }

                                // Render the windows and load the initial chat text function again
                                doWindowRender(null, newactivewindows);
                                sakai.navigationchat.loadChatTextInitial(true, newactivewindows, true);

                            }
                        }
                    }
                }

                if (doreload) {
                    setTimeout(sakai.navigationchat.checkNewMessages, 5000);
                }
            },

            error: function(xhr, textStatus, thrownError){

                //if (doreload) {
                // setTimeout("sakai.navigationchat.loadChatTextInitial('" + false +"')", 5000);
                //}
            }
        });
    };

    /**
     * Check if there were any windows open during the last visit
     * and load the initial chat windows
     */
    var loadChatWindows = function(){

        // Check if there is a cookie from a previous visit
        if ($.cookie('sakai_chat')) {
            activewindows = $.parseJSON($.cookie("sakai_chat"));
            $.cookie("sakai_chat", null);
            var toshow = false;
            for (var i = 0, j = activewindows.items.length; i < j; i++) {
                if (activewindows.items[i].active === true) {
                    toshow = activewindows.items[i].userid;
                }
            }
            doWindowRender(toshow);
        }

        sakai.navigationchat.loadChatTextInitial(true);
    };

    /**
     * Check who of your friends is online or not
     * This function is executed every 20 seconds
     */
    var checkOnline = function(){

        // Receive your online friends through an Ajax request
        $.ajax({
            url: sakai.config.URL.PRESENCE_CONTACTS_SERVICE,
            cache: false,
            success: function(data){
                online = data;
                showOnlineFriends();
                setTimeout(checkOnline, 20000);
                goBackToLogin = true;
            }
        });

    };

    /**
     * This will determine whether there is a valid session. If there is, we'll
     * redirect to the URL requested or the personal dashboard if nothing has been provided.
     */
    var decideLoggedIn = function(data){

        var mejson = (data === undefined ? sakai.data.me : data);
        if (mejson.user.userid) {

            // We are logged in, reload page
            document.location.reload();
        }
        else {

            // Show buttons
            $login_submit_button.show();
            $login_cancel_button.show();

            // Show ajax loader
            $login_busy.hide();

            $login_error_message.show();
        }

    };

    /**
     * This will be executed after the post to the login service has finished.
     * We send a new request to the Me service, explicity disabling cache by
     * adding a random number behind the URL, because otherwise it would get
     * the cached version of the me object which would still say I'm not logged
     * in.
     */
    var checkLogInSuccess = function(){

        $.ajax({
            url: sakai.config.URL.ME_SERVICE,
            cache: false,
            success: decideLoggedIn,
            error: function(xhr, textStatus, thrownError){

                // This executes a couple of times after log in, but then login
                // will be successful. Does not affect experience, but at some
                // point this needs to be looked at.

                //throw "Me service has failed! ("+xhr.status+")";

            }
        });

    };

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

        // Set institutional login page link
        $("#other_logins_container .other_logins").attr("href", sakai.config.URL.PUBLIC_INSTITUTIONAL_LOGIN_URL);

        // Set up public nav links
        $("#nav_my_sakai_link a").attr("href", sakai.config.URL.PUBLIC_MY_DASHBOARD_URL);
        $("#nav_content_media_link a").attr("href", sakai.config.URL.PUBLIC_CONTENT_MEDIA_URL_PAGE);
        $("#nav_people_link a").attr("href", sakai.config.URL.PUBLIC_PEOPLE_URL);
        $("#nav_courses_sites_link a").attr("href", sakai.config.URL.PUBLIC_COURSES_SITES_URL);
        $("#nav_search_link a").attr("href", sakai.config.URL.PUBLIC_SEARCH_URL_PAGE);

        // Bind Log in button
        $("#login_button_container .log_in").bind("click", function(){
            $login_container.show();
        });

        var personal_container_position = $("#explore_nav_container .personal-container").position();

        // Adjust width of login container
        $login_container.css({
            "width": ($("#explore_nav_container .personal-container").innerWidth() - 19) + "px",
            "left": (personal_container_position.left - 8) + "px"
        });

        // Adjust width of inputs
        $("#login_container input").css({
            "width": ($("#explore_nav_container .personal-container").innerWidth() - 30) + "px"
        });

        // Bind Log in submit button
        $login_submit_button.bind("click", function(){

            // Hide any previous login error msgs
            $login_error_message.hide();

            // Check if fileds are empty
            if (($("#login_username").val() === "") || ($("#login_password").val() === "")) {
                $login_error_message.show();
                return;
            }
            else {
                // Start logging in

                // Hide buttons
                $login_submit_button.hide();
                $login_cancel_button.hide();

                // Show ajax loader
                $login_busy.show();

                var data = {
                    "sakaiauth:login": 1,
                    "sakaiauth:un": $("#login_username").val(),
                    "sakaiauth:pw": $("#login_password").val(),
                    "_charset_": "utf-8"
                };
                $.ajax({
                    url: sakai.config.URL.LOGIN_SERVICE,
                    type: "POST",
                    success: checkLogInSuccess,
                    error: checkLogInSuccess,
                    data: data
                });

            }
        });

        // Cancel button
        $login_cancel_button.bind("click", function(){

            // Hide error msg
            $login_error_message.hide();

            // Hide login container
            $login_container.hide();
        });

        // Bind Enter key to Login form
        $(window).keypress(function(event){

            if (event.keyCode === 13) {
                if ($login_container.is(":visible")) {
                    $login_submit_button.trigger("click");
                }
            }
        });

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


    ///////////////////////
    // Initial functions //
    ///////////////////////

    /**
     * Contains all the functions and methods that need to be
     * executed on the initial load of the page
     */
    var doInit = function(){

        var person = sakai.data.me;

        $(exploreNavigationContainer).show();
        $(chatMainContainer).show();

        // Fill in the name of the user in the different fields
        if (person.profile.firstName || person.profile.lastName) {
            $(userIdLabel).text(sakai.api.Security.saneHTML(person.profile.firstName + " " + person.profile.lastName));
            $(hiLabel).text(sakai.api.Security.saneHTML(person.profile.firstName));
        }

        // Show the profile picture on the dashboard page
        /** TODO : Remove the lines beneath if this functionality is inside changepic.js */
        if (person.profile.picture) {
            var picture = $.parseJSON(person.profile.picture);
            if (picture.name) {
                $(pictureHolder).attr("src", "/_user" + sakai.data.me.profile.path + "/public/" + picture.name);
            }
        }

        // Highlight current nav item
        determineCurrentNav();

        // Get chat status
        getChatStatus();

        // Set presence and bind things
        addBinding();
        getCountUnreadMessages();
        setPresence();
    };

    if (sakai.data.me.user.anon) {

        // If a user is not logged in -> switch to anonymous mode
        switchToAnonymousMode();
    }
    else {
        loadChatWindows();
        checkOnline();
        doInit();
    }

};
sakai.api.Widgets.widgetLoader.informOnLoad("navigationchat");
