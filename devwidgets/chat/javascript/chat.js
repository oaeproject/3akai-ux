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
/**
 * @name sakai.flashChat
 *
 * @class flashChat
 *
 * @description
 * Namespace used for the flash functionality for chat
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
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

/**
 * @name sakai.chat
 *
 * @class chat
 *
 * @description
 * Initialize the chat widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.chat = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var MAX_NO_OF_WINDOWS = 5; // maximum number of chat conversations open

    var currentChatStatus = "";

    var hasOpenChatWindow = false; // Does the current user has open chat windows
    var personIconUrl = sakai.config.URL.USER_DEFAULT_ICON_URL;
    var pulltime = "2100-10-10T10:10:10.000Z";
    var initialtime = "2100-10-10T10:10:10.000Z";
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
    var next = "#next";
    var prev = "#prev";

    // Chat
    var chatAvailable = "#chat_available";
    var chatAvailableName = ".chat_available_name";
    var chatAvailableMinimize = chatAvailable + "_minimize";
    var chatOnline = "#chat_online";
    var chatOnlineConnectionsLink = chatOnline + "_connections_link";
    var chatWindow = "#chat_window";
    var chatWindowChatstatus = chatWindow + "_chatstatus";
    var chatWindows = "#chat_windows";
    var chatWith = "#chat_with";

    // CSS Classes
    var chatWithContentClass = "chat_with_content";
    var chatWithContentNooverflowClass = chatWithContentClass + "_nooverflow";
    var chatWithContentOverflowClass = chatWithContentClass + "_overflow";
    var chatAvailableStatusClass = "chat_available_status";
    var chatAvailableStatusClassOnline = chatAvailableStatusClass + "_online";
    var chatAvailableStatusClassBusy = chatAvailableStatusClass + "_busy";
    var chatAvailableStatusClassOffline = chatAvailableStatusClass + "_offline";

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

    // Templates
    var chatAvailableTemplate = "chat_available_template";
    var chatContentTemplate = "chat_content_template";
    var chatWindowsTemplate = "chat_windows_template";
    var timer = false;

    ///////////////////////
    // Utility functions //
    ///////////////////////

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
        else {
            return personIconUrl;
        }
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

        /*
     * Placeholders that will be replaced by the real functions. This
     * is necessary to comply with the JSLint rules
     */

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
     * Parse the name for a user
     * @param {String} uuid Uuid of the user
     * @param {String} firstName Firstname of the user
     * @param {String} lastName Lastname of the user
     */
    var parseName = function(uuid, profile){
        var displayName = sakai.api.User.getDisplayName(profile);

        // if display name/uuid is 14 character
        // display name/uuid
        // otherwise display name/uuid[11]...
        if (displayName) {
            if (displayName.lengt > 14) {
                return sakai.api.Util.shortenString(displayName, 11);
            }
            else {
                return displayName;
            }
        }
        else {
            if (uuid.length > 14) {
                return sakai.api.Util.shortenString(uuid, 11);
            }
            else {
                return uuid;
            }
        }
    };

    /**
     * Parse the status message for a user
     * @param {Object} basic JSON basic variable inside the profile information
     */
    var parseStatusMessage = function(status){
        if (status) {
            return sakai.api.Util.shortenString(status, 20);
        }
        return sakai.api.Util.shortenString("No status message");
    };

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

            // if there are more than 5 chat conversation open
            // hide the new chat conversation
            if (activewindows.items.length > MAX_NO_OF_WINDOWS) {
                activewindows.items[index].windowstatus = false;
            }
            else {
                // show new chat conversation
                activewindows.items[index].windowstatus = true;
            }
        }
        else {
            alert("An error has occured");
        }

        var specialjson = {};
        specialjson.items = [];
        specialjson.items[0] = clone(activewindows.items[index]);

        doWindowRender(clicked, specialjson);

        sakai.chat.loadChatTextInitial(true, activewindows);
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

                json.contacts[i].name = parseName(json.contacts[i].userid, json.contacts[i].profile);
                json.contacts[i].photo = parsePicture(json.contacts[i].profile, json.contacts[i].profile["rep:userId"]);
                json.contacts[i].statusmessage = parseStatusMessage(json.contacts[i].profile.status);

                saveToAllFriends(json.contacts[i]);
            }
        }

        if (!total || total === 0) {
            json.items = [];
            json.totalitems = total;
            $(chatOnline).html("(0)");
            timer = false;
        }
        else {
            json.totalitems = total;
            $(chatOnline).html("<b>(" + total + ")</b>");

            if(!timer) {
                timer = true;
                sakai.chat.checkNewMessages();

            }
        }

        json.me = {};
        if (json.me) {
            json.me.name = parseName(sakai.data.me.user.userid, sakai.data.me.profile);
            json.me.photo = parsePicture(sakai.data.me.profile, sakai.data.me.user.userid);
            json.me.statusmessage = parseStatusMessage(sakai.data.me.profile.status);
            json.me.chatstatus = currentChatStatus || "online";

            // We render the template, add it to a temporary div element and set the html for it.
            json.items = [];
            for (var z = 0, k = json.contacts.length; z < k; z++) {
                if (json.contacts[z]["sakai:status"] == "online" && json.contacts[z].chatstatus !== "offline") {
                    json.items.push(json.contacts[z]);
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
        // show/hide next/previous
        checkPaging();

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
            // show one hidden chat window
            showChatWindow();

            activewindows.items.splice(toremove, 1);

            // show/hide next/previous
            checkPaging();
            $(onlineButton + "_" + selected).parent().remove();
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
                        url: "/~" + sakai.data.me.user.userid + "/message.create.html",
                        type: "POST",
                        success: function(data){

                            // Add the id to the send messages object
                            // We need to do this because otherwise the user who
                            // sends the message, will see it 2 times
                            if (sendMessages.length == 0) {
                                var temptime = data.message["sakai:created"];
                                var temp = temptime.indexOf("+");
                                initialtime = temptime.substring(0,temp)+".000"+temptime.substring(temp,temptime.length);
                            }

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
    sakai.chat.checkNewMessages = function(){

        // Create a data object
        var data = {};

        // Check if the time is not 0, if so set the current time
        if (time.length !== 0) {
            data.t = time;
        }

        // Send an Ajax request to check if there are any new messages, but only if there are contacts online
        if ((onlineFriends) && (onlineFriends.length > 0)) {
            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/message.chatupdate.json",
                data: data,
                success: function(data){

                    // Get the time
                    time = data.time;
                    pulltime = data.pulltime;

                    if (data.update) {
                        sakai.chat.loadChatTextInitial(false);
                    }
                    else {
                        if(timer) {
                            setTimeout(sakai.chat.checkNewMessages, 5000);
                        }

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
    sakai.chat.loadChatTextInitial = function(initial, specialjson, hasNew){

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

        var retrievaltime = "2100-10-10T10:10:10.000Z";

        // if window is jused opened, use initial time
        // to retrieve all previous messagess
        if(initial && !hasNew)
            retrievaltime = initialtime;
        else
            retrievaltime = pulltime;
        // Combine all the online users with a comma
        var tosend = onlineUsers.join(",");

        // Send and Ajax request to get the chat messages
        $.ajax({
            url: sakai.config.URL.CHAT_GET_SERVICE.replace(/__KIND__/, "unread"),
            data: {
                "_from": tosend,
                "items": 1000,
                "t": retrievaltime,
                "sortOn": "sakai:created",
                "sortOrder": "descending"
            },
            cache: false,
            sendToLoginOnFail: true,
            success: function(data){

                // Check if there are any messages inside the JSON object
                if (data.results) {

                    //display image of the friend you are talking to
                    //without this line it takes time to load the image
                    showOnlineFriends();

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
                                if ($.inArray(njson[k].messages[0].id, sendMessages) !== -1 && !initial) {
                                    continue;
                                }

                                var el = $(chatWith + "_" + k + "_content");
                                var chatwithusername = parseName(k, njson[k].messages[0].userFrom[0]);

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
                                activewindows.items[index].name = parseName(k, friendProfile);
                                activewindows.items[index].photo = parsePicture(friendProfile, k);
                                activewindows.items[index].statusmessage = parseStatusMessage(friendProfile.status);
                                activewindows.items[index].chatstatus = parseChatStatus(friendProfile.chatstatus);
                                activewindows.items[index].windowstatus = true;

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
                                sakai.chat.loadChatTextInitial(true, newactivewindows, true);

                            }
                        }
                    }
                }

                if (doreload) {
                    if(timer) {
                        setTimeout(sakai.chat.checkNewMessages, 5000);
                    }
                }
            },

            error: function(xhr, textStatus, thrownError){

                //if (doreload) {
                // setTimeout("sakai.chat.loadChatTextInitial('" + false +"')", 5000);
                //}
            }
        });
    };

    /**
     * This function will check if there are more than 5 open conversations.
     * If so, show previous/next icon
     */
    var checkPaging = function(){
        // all the open chat conversation
        var chatWindow = $('.active_window');
        // all the visible chat conversation
        var chatWindowVisible = $('.active_window:visible');

        // if open chat conversations are more than 5
        if (chatWindow.length >= MAX_NO_OF_WINDOWS) {
            // if there are more hidden chat conversation after the last visible window
            if($(chatWindow[(chatWindow.index($(chatWindowVisible[(chatWindowVisible.length-1)]))) + 1]).length){
                // show next >> link
                $(next).show();
            }else{
                // hide next >> link
                $(next).hide();
            }

            // if there are more hidden chat conversation before firt visible window
            if($(chatWindow[(chatWindow.index($(chatWindowVisible[0]))) - 1]).length){
                // show previous << link
                $(prev).show();
            }else{
                // show previous << link
                $(prev).hide();
            }
        // there is no more than 5 chat conversations
        }else{
            // hide next >> link
            $(next).hide();
            // hide previous << link
            $(prev).hide();
        }
    };

    /**
     * This function will check if there are more chat conversation hidden after last
     * visible chat window. If so, show the hidden chat conversation after last one and
     * hide the first visible chat conversation
     */
    var showNextChat = function(){
        // all the open chat conversation
        var chatWindow = $('.active_window');
        // all the visible chat conversation
        var chatWindowVisible = $('.active_window:visible');

        // the index of last visible chat window
        var lastVisibleIndex = chatWindow.index($(chatWindowVisible[(chatWindowVisible.length-1)]));
        // if there are more chat conversation hidden after last visible window
        if (chatWindow.length - 1 > lastVisibleIndex) {
            // show next chat conversation after last window
            $(chatWindow[(lastVisibleIndex+1)]).removeClass("hidden");
            // set window status in activewindows
            activewindows.items[(lastVisibleIndex+1)].windowstatus = true;

            // get the index of first visible chat window
            var firstVisibleIndex = chatWindow.index($(chatWindowVisible[0]));
            // hide the first visible window
            $(chatWindow[firstVisibleIndex]).addClass("hidden");
            // set window status in actviewindows
            activewindows.items[firstVisibleIndex].windowstatus = false;
        }
        // show/hide prev/next icon
        checkPaging();
    };

    /**
     * This function will check if there are more chat conversation hidden before first
     * visible chat window. If so, show the hidden chat conversation before first one and
     * hide the last visible chat conversation
     */
    var showPreviousChat = function(){
        // all the open chat conversation
        var chatWindow = $('.active_window');
        // all the visible chat conversation
        var chatWindowVisible = $('.active_window:visible');

        // get the index of first visible chat window
        var firstVisibleIndex = chatWindow.index((chatWindowVisible[0]));

        // if there are more chat conversation hidden before first visible window
        if (firstVisibleIndex > 0) {
            // show previous chat conversation before first visible window
            $(chatWindow[(firstVisibleIndex-1)]).removeClass("hidden");
            // set window status in activewindows
            activewindows.items[(firstVisibleIndex-1)].windowstatus = true;

            // the index of last visible chat window
            var lastVisibleIndex = chatWindow.index($(chatWindowVisible[(chatWindowVisible.length-1)]));
            // hide the last visible window
            $(chatWindow[lastVisibleIndex]).addClass("hidden");
            // set window status in actviewindows
            activewindows.items[lastVisibleIndex].windowstatus = false;
        }
        // show/hide prev/next icon
        checkPaging();
    };

    /**
     * This function show the next available hidden chat conversation.
     * @param {int} toRemoveIndex
     *  The index of the closed chat window.
     */
    var showChatWindow = function(toRemoveIndex){
        // all the open chat conversation
        var chatWindow = $('.active_window');
        // all the visible chat conversation
        var chatWindowVisible = $('.active_window:visible');

        // get the index of first visible chat window
        var firstVisibleIndex = chatWindow.index((chatWindowVisible[0]));
        // the index of last visible chat window
        var lastVisibleIndex = chatWindow.index($(chatWindowVisible[(chatWindowVisible.length-1)]));

        // if there are windows after last visible window show the next available one
        if (lastVisibleIndex < chatWindow.length - 1) {
            // show next chat conversation after last window
            $(chatWindow[(lastVisibleIndex+1)]).removeClass("hidden");
            // set window status in activewindows
            activewindows.items[(lastVisibleIndex+1)].windowstatus = true;
        }
        // if there are window before first visible window shoe the previous available one
        else if(firstVisibleIndex > 0) {
            // show previous chat conversation before first visible window
            $(chatWindow[(firstVisibleIndex-1)]).removeClass("hidden");
            // set window status in activewindows
            activewindows.items[(firstVisibleIndex-1)].windowstatus = true;
        }

        // show/hide prev/next icon
        checkPaging();
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

        sakai.chat.loadChatTextInitial(true);
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
     * Contains all the functions and methods that need to be
     * executed on the initial load of the page
     */
    var doInit = function(){
        currentChatStatus = sakai.data.me.profile.chatstatus

        // define next/prev events
        $(next).bind("click",showNextChat);
        $(prev).bind("click",showPreviousChat);

        $(chatMainContainer).show();

        // Add binding to catch event fire by a chat status change
        $(window).bind("chat_status_change", function(event, newChatStatus){
            currentChatStatus = newChatStatus;
            updateChatStatusElement($(chatAvailableName), newChatStatus)
        });

        //Add a binding to catch event fire by change of status message
        $(window).bind("chat_status_message_change", function(event, currentChatStatus){
            showOnlineFriends();
        });
    };

    if (sakai.data.me.user.anon) {
        // If a user is not logged in -> switch to anonymous mode
        // This is handled in the topnavigation widget
    }
    else {
        loadChatWindows();
        checkOnline();
        doInit();
    }
};

sakai.api.Widgets.widgetLoader.informOnLoad("chat");