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

/*global $, sakai */

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

    ///////////////////////////
    // Configuration Options //
    ///////////////////////////

    var loadOnlineContactsInterval = 20000;
    var loadNewMessagesInterval = 5000;

    ////////////////////
    // Timer Pointers //
    ////////////////////

    var loadOnlineContactsTimer = false;
    var loadNewMessagesTimer = false;

    ////////////////
    // Data Cache //
    ////////////////

    var globalOnlineContacts = [];
    var globalOnlineContactsLookup = {};
    var globalChatWindows = [];
    var globalMessages = []; // globalMessages include saved messages
    var allMessages = {}; // allMessages are messages from this refresh - to keep track of read/unread
    var supportsSessionStorage = false;

    var acceptedContactList = false; // to store accepted contact list

    ///////////////////////
    ///////////////////////
    // Chat Working Code //
    ///////////////////////
    ///////////////////////

    /**
     * Make the chat bar visible after we have
     * detected that the current user is logged in
     */
    var showChatBar = function(){
        $("#chat_main_container").show();
    };

    /////////////////////////////
    // List of online contacts //
    /////////////////////////////

    /**
     * Load the list of your online contacts
     * make batch request for accepted friend and presence online
     * and close the chat window if contact has been deleted.
     * @param {Object} initial Whether or not this is the first time
     * the online friends are requested
     */
    var loadOnlineContacts = function(callback){
        var batchRequests = [];
        
        // accepted contacts
        var acceptedContacts = {
            "url":sakai.config.URL.CONTACTS_ACCEPTED + "?page=0&items=6",
            "method":"GET",
            "cache":false,
            "dataType":"json" 
        };

        // contacts online
        var contactsOnline = {
            "url":sakai.config.URL.PRESENCE_CONTACTS_SERVICE,
            "method":"GET",
            "cache":false,
            "dataType":"json" 
        };
        
        batchRequests.push(acceptedContacts);
        batchRequests.push(contactsOnline);

        $.ajax({
        url: sakai.config.URL.BATCH,
            type: "POST",
            data: {
                requests: $.toJSON(batchRequests)
            },
            success: function(data){
                // contact list
                if (data.results.hasOwnProperty(0)) {
                    acceptedContactList = $.parseJSON(data.results[0].body);
                }

                // presence contacts
                if (data.results.hasOwnProperty(1)) {
                    // load the list of contact onlines
                    loadContactFinished($.parseJSON(data.results[1].body));
                }
            },
            complete: function(){
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        });

    };

    /**
     * Load the list of your online contacts
     * @param {Object} initial Whether or not this is the first time
     * the online friends are requested
     */
    var loadContactFinished = function(data) {
        // Render the list of your online friends
        renderOnlineContacts(data);
        // Start polling regurarly to get your online friends
        if (!loadOnlineContactsTimer) {
            loadOnlineContactsTimer = setInterval(loadOnlineContacts, loadOnlineContactsInterval);
            checkNewMessages();
        }
        $(window).trigger("sakai-chat-update");
        
    };

    /**
     * Transform the JSON object received from the online contacts
     * service into a trimmed down version that will be used to store
     * and retrieve the chatwindows
     * @param {Object} onlineContacts   Object received from the online
     * contacts service
     */
    var transformContactsObject = function(onlineContacts){
        var contactList = [];
        for (var i = 0; i < onlineContacts.contacts.length; i++){
            if (onlineContacts.contacts[i]["sakai:status"] !== "offline" && onlineContacts.contacts[i].profile.chatstatus !== "offline") {
                var contact = {};
                contact.profile = {
                    "userid": onlineContacts.contacts[i].user,
                    "name": sakai.api.User.getDisplayName(onlineContacts.contacts[i].profile),
                    "status": onlineContacts.contacts[i].profile.status,
                    "chatstatus": onlineContacts.contacts[i].profile.chatstatus || onlineContacts.contacts[i]["sakai:status"]
                };
                if (onlineContacts.contacts[i].profile.picture && $.parseJSON(onlineContacts.contacts[i].profile.picture).name) {
                    contact.profile.picture = "/~" + onlineContacts.contacts[i].user + "/public/profile/" + $.parseJSON(onlineContacts.contacts[i].profile.picture).name;
                }
                contactList.push(contact);
                globalOnlineContactsLookup[contact.profile.userid] = contact.profile;
            }
        }
        globalOnlineContacts = {"contacts": contactList, "sakaistatus": sakai.data.me.profile.chatstatus || onlineContacts["sakai:status"]};
        return globalOnlineContacts;
    };

    /**
     * Render the list of your online friends if it has changed
     * since the last time
     * @param {Object} onlineContacts  JSON Object containing the list
     * of your online contacts
     */
    var renderOnlineContacts = function(onlineContacts){
        // Prepare the online contacts for template rendering
        onlineContacts = transformContactsObject(onlineContacts);

        $("#chat_online").text("(" + onlineContacts.contacts.length + ")");
        updateChatWindows();

        var renderedContacts = $.TemplateRenderer("chat_available_template", onlineContacts).replace(/\r/g, '');
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedContacts);

        // We only render the template when it has changed since the last time
        if ($("#chat_available").html() !== renderedDiv.html()) {
            $("#chat_available").html(renderedContacts);
            var onlineWindow = $("#chat_show_online");
            onlineWindow.css("bottom", 31 + onlineWindow.height() + "px");
        }
    };

    /**
     * Hide or show the list of online contacts depending on whether
     * it's currently shown or not
     */
    var toggleOnlineContactsList = function(){
        $("#chat_show_online").toggle();
        var onlineListActivator = $("#chat_online_button");
        if (onlineListActivator.hasClass("chat_show_online_visible")){
            onlineListActivator.removeClass("chat_show_online_visible");
        } else {
            onlineListActivator.addClass("chat_show_online_visible");
        }
    };

    /**
     * Hide the list of online contacts
     */
    var closeOnlineContactsList = function(){
        $("#chat_show_online").hide();
        $("#chat_online_button").removeClass("chat_show_online_visible");
    };

    /**
     * Get an online contact and his profile details
     * @param {Object} userid   User id of the requested contact
     */
    var getOnlineContact = function(userid){
        for (var i = 0; i < globalOnlineContacts.contacts.length; i++){
            if (globalOnlineContacts.contacts[i].profile.userid === userid){
                return globalOnlineContacts.contacts[i];
            }
        }
        return false;
    };

    //////////////////////////
    // Chat window handling //
    //////////////////////////

    /**
     * Get the reduced object with the necessary profile
     * information for an online contact
     * @param {Object} userid   The user id from the requested user
     */
    var getOnlineContactObject = function(userid){
        for (var i = 0; i < globalOnlineContacts.contacts.length; i++){
            if (globalOnlineContacts.contacts[i].profile.userid === userid){
                return globalOnlineContacts.contacts[i];
            }
        }
        return false;
    };

    /**
     * Check whether a chat window already exists for a given
     * user and return its profile object
     * @param {Object} userid    User we are checking for
     */
    var getChatWindow = function(userid){
        for (var i = 0; i < globalChatWindows.length; i++){
            if (globalChatWindows[i].profile.userid === userid){
                return globalChatWindows[i];
            }
        }
        return false;
    };

    /**
     * Keep the object that keeps the current chat window state
     * up to date. This will be used to save the current layout
     * to a persistent cookie
     * @param {Object} userid    Userid of the window that is currently open
     */
    var setOpenWindows = function(userid){
        for (var i = 0; i < globalChatWindows.length; i++) {
            globalChatWindows[i].open = false;
        }
        if (userid){
            var window = getChatWindow(userid);
            window.open = true;
        }
    };

    /**
     * Close all chat windows
     */
    var closeAllChatWindows = function(){
        setOpenWindows();
        $(".user_chat").removeClass("chat_online_button_visible");
        $(".chat_with_user").hide();
    };

    /**
     * Public method to return a contact
     */
    sakai.chat.getOnlineContact = function(userid){
        return getOnlineContactObject(userid);
    };

    /**
     * Public method to open contact list
     */
    sakai.chat.openContactsList = function(){
        closeAllChatWindows();
        toggleOnlineContactsList();
    };

    /**
     * Open the chat window for a given user that already has a chat
     * window open
     * @param {Object} userid    Userid of the user for which a
     * chat window should be opened
     */
    var openChatWindow = function(userid){
        setOpenWindows(userid);
        $("#chat_online_button_" + userid).addClass("chat_online_button_visible");
        $("#chat_with_" + userid).show();
        $("#chat_with_" + userid + "_txt").focus();
        // Scroll to the bottom
        var chatwindow = $("#chat_with_" + userid + "_content");
        chatwindow.attr("scrollTop", chatwindow.attr("scrollHeight"));
        if (allMessages[userid] && allMessages[userid].length) {
            var bulkRequests = [];
            for (var i=0, j=allMessages[userid].length; i<j; i++) {
                var message = allMessages[userid][i];
                if (message["sakai:read"] === false) {
                    bulkRequests.push(createBatchReadObject(message));
                }
            }
            for (var k=0, m=globalMessages.length; k<m; k++) {
                var msg = globalMessages[k];
                if (msg["userFrom"][0].userid === userid) {
                    msg["sakai:read"] = true;
                }
            }
            sendBatchReadRequests(bulkRequests);
        }
    };

    /**
     * Add a new chat window to the list of existing ones
     * @param {Object} contactObject    Object describing the user for which we want a new chat window
     * @param {Boolean} openWindow       Whether to open the newly created window or not
     */
    var appendChatWindow = function(contactObject, openWindow){
        // Check whether there already is a chat window for the current user
        var chatWindowExists = getChatWindow(contactObject.profile.userid);
        if (chatWindowExists && openWindow){
            openChatWindow(contactObject.profile.userid);
        } else if (!chatWindowExists) {
            var window = contactObject;
            window.open = openWindow;
            window.index = globalChatWindows.length;
            globalChatWindows.push(window);
            $("#chat_windows").append($.TemplateRenderer("chat_windows_template", window));
            $("#chat_windows_container").append($.TemplateRenderer("chat_windows_windows_template", window));
            // Position the chat window as the last chat window in the row
            $("#chat_with_" + window.profile.userid).css("left", (window.index * 150) + "px");
            if (openWindow) {
                closeAllChatWindows();
                openChatWindow(contactObject.profile.userid);
            }
        }
    };

    /**
     * Remove a chat window and its corresponding button in the
     * bottom bar
     * @param {Object} userid    Userid of the user for which
     * we want to remove the chat window
     */
    var removeChatWindow = function(userid){
        var toremoveIndex = -1;
        for (var i = 0; i < globalChatWindows.length; i++){
            if (globalChatWindows[i].profile.userid === userid){
                $("#chat_online_button_" + userid).remove();
                $("#chat_with_" + userid).remove();
                toremoveIndex = i;
            } else if (toremoveIndex >= 0){
                $("#chat_with_" + globalChatWindows[i].profile.userid).css("left", (150 * (i - 1)) + "px");
            }
        }
        globalChatWindows.splice(toremoveIndex, 1);
    };

    /**
     *  Check if user is still in contact list
     * @param {Object} userId  User id of the contact the icon should be adjusted for
     */
    var isContactExists = function(userId) {
        // check to see if user is still in contact list
        for (var i = 0; i<acceptedContactList.results.length; i++){
            if(acceptedContactList.results[i].profile['rep:userId'] === userId){
                return true;
            }    
        }
        return false;
    };

    /**
     * Update the chat windows so that the chat status and status
     * message of their contacts is up to date. Also, disable all
     * chat windows for which the contact is not online
     */
    var updateChatWindows = function(){
        for (var i = 0; i < globalChatWindows.length; i++){
            var contact = getOnlineContact(globalChatWindows[i].profile.userid);
            var chatInputBox = $("#chat_with_" + globalChatWindows[i].profile.userid + "_txt");
            // if contact has been deleted remove the chat window
            if(!isContactExists(globalChatWindows[i].profile.userid)){
                removeChatWindow(globalChatWindows[i].profile.userid);
            // The contact is offline. Disable the chat window and update the chat status
            }else if (!contact || contact.profile.chatstatus === "offline"){
                // Set the chat status to offline
                setWindowChatStatus(globalChatWindows[i].profile.userid, "offline");
                // Disable the input box
                chatInputBox.attr("disabled", true);
                chatInputBox.val(globalChatWindows[i].profile.name + " is offline");
            } else {
                // Check whether the chat status changed
                if (globalChatWindows[i].profile.chatstatus != contact.profile.chatstatus){
                    // Make sure the input box is enabled
                    if (globalChatWindows[i].profile.chatstatus === "offline") {
                        chatInputBox.removeAttr("disabled").val("");
                    }
                    setWindowChatStatus(globalChatWindows[i].profile.userid, contact.profile.chatstatus);
                }
                // Check whether the statusmessage changed
                if (globalChatWindows[i].profile.status != contact.profile.status){
                    setWindowStatusmessage(globalChatWindows[i].profile.userid, contact.profile.status);
                }
            }
        }
    };

    /**
     * Update the chat availability icon for a given chat window
     * @param {Object} userid   User id of the contact the icon should be adjusted for
     * @param {Object} chatstatus   Chat status (online, busy, offline) to be changed to
     */
    var setWindowChatStatus = function(userid, chatstatus){
        var bottomName = $("#chat_window_chatstatus_" + userid);
        // Add the new chat status
        sakai.api.Util.updateChatStatusElement(bottomName, "chat_available_status_" + chatstatus);
        // Update the global chat window object
        getChatWindow(userid).profile.chatstatus = chatstatus;
    };

    /**
     * Update the status message for a given chat window
     * @param {Object} userid  User id of the contact the message should be adjusted for
     * @param {Object} status  Status message to be changed to
     */
    var setWindowStatusmessage = function(userid, status){
        getChatWindow(userid).profile.status = status;
        if (!status){
            status = i18n.General.getValueForKey("NO_STATUS_MESSAGE");
        }
        var windowStatusMessage = $("#chat_window_statusmessage_" + userid);
        windowStatusMessage.text(sakai.api.Util.shortenString(status, 20));
    };

    ///////////////////////////
    // Chat message handling //
    ///////////////////////////

    /**
     * Create an object indicating the message has been read
     * @param {Object} message The message
     * @return {Object} request object for BATCH
     */
    var createBatchReadObject = function(message) {
        return {
            "url": message["jcr:path"],
            "method": "POST",
            "parameters": {
                "sakai:read": true
            }
        };
    };

    /**
     * Send the batch request saying these messages have been read
     * @param {Array} batchRequests List of requests to send out
     */
    var sendBatchReadRequests = function(batchRequests) {
        // send the 'this message has been read' requests
        if (batchRequests && batchRequests.length > 0) {
            $.ajax({
                url: sakai.config.URL.BATCH,
                type: "POST",
                data: {
                    requests: $.toJSON(batchRequests)
                }
            });
        }
    };

    /**
     * Detect when a user wants to send a message to a user
     * @param {Object} event
     */
    $(".chat_with_txt").live("keypress", function(event){
        // Has the user pressed enter
        if (event.keyCode == '13') {
            var messageField = $(this);
            var message = $.trim(messageField.val());
            // Check whether the user is trying to send a valid message
            if (message){
                var userid = messageField.attr("id").substring(10);
                userid = userid.substring(0, userid.length - 4);
                message = replaceURL(message); 
                sendMessage(userid, message);
                messageField.val("");
            }
        }
    });

    /**
     * Represent URL if any in an anchor tag.
     * @param {Object} message Message that user has entered.
     */
    var replaceURL = function(message){
        // get the regex code from
        // http://www.codeproject.com/KB/scripting/replace_url_in_ajax_chat.aspx
        return message.replace(/(\w+):\/\/[\S]+(\b|$)/gim,'<a href="$&" class="my_link" target="_blank">$&</a>');
    };

    /**
     * Send a chat message to a given contact
     * @param {Object} to    User id of the contact you are sending to
     * @param {Object} messageText    Text of the message being sent
     */
    var sendMessage = function(to, messageText){
        var date = new Date( );
        var timestamp = date.getTime();
        // Send a message to the other user
        var message = {
            "sakai:type": "chat",
            "sakai:sendstate": "pending",
            "sakai:messagebox": "outbox",
            "sakai:to": "chat:" + to,
            "sakai:from": sakai.data.me.user.userid,
            "sakai:subject": "",
            "sakai:body": messageText,
            "sakai:category": "chat",
            "sakai:timestamp": timestamp,
            "_charset_": "utf-8"
        };
        $.ajax({
            url: "/~" + sakai.data.me.user.userid + "/message.create.html",
            data: message,
            type: "POST"
        });
        // Append my message to the chat window
        var sentDate = new Date();
        // Localize date
        sentDate.setTime(sentDate.getTime() + sentDate.getTimezoneOffset() * 60 * 1000);
        sentDate.setTime(sentDate.getTime() + sakai.data.me.user.locale.timezone.GMT*60*60*1000);
        appendMessage(sakai.data.me.user.userid, to, messageText, sentDate);

        // save the message data
        message["userFrom"] = [];
        message["userFrom"].push(sakai.data.me.profile);
        message["userTo"] = [];
        message["userTo"].push(globalOnlineContactsLookup[to]);
        message["sentDate"] = sentDate;
        globalMessages.push(message);
    };

    /**
     * Append a message to a given chatwindow
     * @param {Object} from    User id from the person sending the message
     * @param {Object} window  User id of the user in which chat window the
     * message should be appended
     * @param {Object} messageText   Body text of the message
     * @param {Object} sentDate      Date in which the message was sent (localized)
     */
    var appendMessage = function(from, window, messageText, sentDate){
        var message = {};
        if (from === sakai.data.me.user.userid){
            message.name = "Me";
        } else {
            message.name = getChatWindow(window).profile.name;
        }
        message.time = sakai.api.l10n.transformTime(sentDate);
        message.message = messageText;
        var chatwindow = $("#chat_with_" + window + "_content");
        chatwindow.append($.TemplateRenderer("chat_content_template", message));
        // Scroll to the bottom
        chatwindow.attr("scrollTop", chatwindow.attr("scrollHeight"));
    };

    /**
     * Function that will initiate the check for new messages at regular
     * intervals
     */
    var checkNewMessages = function(){
        // Only check for new messages when you have online contacts
        if (globalOnlineContacts.contacts.length > 0){
            loadNewMessages();
        }
        // Start polling regurarly to get new messages
        if (!loadNewMessagesTimer) {
	        loadNewMessagesTimer = setInterval(checkNewMessages, loadNewMessagesInterval);
        }
    };

    // Variable that keeps track of when we last checked for new messages
    var lastCheckDate = new Date().getTime();

    /**
     * Check whether there are new unread chat messages waiting
     */
    var loadNewMessages = function(){
        $.ajax({
            url: "/~" + sakai.data.me.user.userid + "/message.chatupdate.json",
            cache: false,
            data: {
                "t": lastCheckDate
            },
            success: function(resp1){
                // If there are new messages waiting, retrieve them
                if (resp1.update) {
                    $.ajax({
                        url: sakai.config.URL.CHAT_GET_SERVICE.replace(/__KIND__/, "unread"),
                        data: {
                            "_from": "*",
                            "items": 1000,
                            "t": resp1.pulltime,
                            "sortOn": "sakai:created",
                            "sortOrder": "descending"
                        },
                        cache: false,
                        success: function(data){
                            // Add the messages to the appropriate windows
                            insertNewMessages(data);
                            lastCheckDate = resp1.time;
                        }
                    });
                }
            }
        });
    };

    /**
     * Callback function to sort messages based on timestamp
     */
    var sortMessages = function(a, b){
        return a["sakai:timestamp"] > b["sakai:timestamp"] ? 1 : -1;
    };

    /**
     * Once we know that there are new messages, we add them into
     * the appropriate chat windows
     * @param {Object} messages    List of new chat messages
     */
    var insertNewMessages = function(messages){
        if (messages.results) {
            // Sort messages based on timestamp
            messages.results.sort(sortMessages);
            var bulkRequests = [];
            for (var i = 0; i < messages.results.length; i++) {
                var message = messages.results[i];
                var from = message.userFrom[0];
                // We don't add in our own messages as they are already in there.
                if (from.userid !== sakai.data.me.user.userid){
                    // Check whether there is already a chatwindow for it
                    var chatWindow = getChatWindow(from.userid);
                    var sentDate = sakai.api.l10n.parseDateString(message["sakai:created"]);
                    var messageText = message["sakai:body"];
                    if (!chatWindow) {
                        // If not, create a new chat window
                        var contact = {};
                        contact.profile = {
                            "userid": from.userid,
                            "name": sakai.api.User.getDisplayName(from),
                            "status": from.status,
                            "chatstatus": from.chatstatus || from["sakai:status"]
                        };
                        if (from.picture && $.parseJSON(from.picture).name) {
                            from.picture = "/~" + from.userid + "/public/profile/" + $.parseJSON(from.picture).name;
                        }
                        appendChatWindow(contact, false);
                    }
                    // Append the message
                    appendMessage(from.userid, from.userid, messageText, sentDate);
                    // Pulse if it is not currently open
                    chatWindow = getChatWindow(from.userid);
                    if (!chatWindow.open && message["sakai:read"] === false) {
                        $("#chat_online_button_" + from.userid).effect("pulsate", {times: 5}, 500);
                    } else if (message["sakai:read"] !== true) {
                        // the window is open, lets mark the message as read
                        message["sakai:read"] = true;
                        bulkRequests.push(createBatchReadObject(message));
                    }
                    allMessages[from.userid] = allMessages[from.userid] || [];
                    allMessages[from.userid].push(message);
                }
                globalMessages.push(message);
            }
            // sent out the batch request saying the read messages are read
            sendBatchReadRequests(bulkRequests);
        }
    };

    /**
     * Insert saved messages for this chat session, so they can persist across refreshes
     * @param {Array} messages  the saved messages to insert into the chat windows
     * @param {Array} validWindows  a list of windows to open if messages exist for them.
     *                              if insertOwn === true and validWindows is present it'll only insert messages for the valid windows
     */
    var insertSavedMessages = function(messages, validWindows) {
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            var from = message.userFrom[0];
            if (from["rep:userId"] === sakai.data.me.user.userid) {
                from = message["userTo"][0];
                messageFrom = sakai.data.me.user.userid;
            }
            var chatWindow = getChatWindow(from.userid);
            var sentDate;
            if (message["sakai:created"]) {
                sentDate = sakai.api.l10n.parseDateString(message["sakai:created"]);
            } else if (message["sentDate"]) {
                sentDate = new Date(message["sentDate"]);
            }
            if (validWindows && validWindows.length && $.inArray(from.userid, validWindows) > -1) {
                if (!chatWindow) {
                    // If not, create a new chat window
                    var contact = {};
                    contact.profile = {
                        "userid": from.userid,
                        "name": from.name || sakai.api.User.getDisplayName(from),
                        "status": from.status,
                        "chatstatus": from.chatstatus || from["sakai:status"]
                    };
                    if (from.picture && $.parseJSON(from.picture).name) {
                        from.picture = "/~" + from.userid + "/public/profile/" + $.parseJSON(from.picture).name;
                    }
                    appendChatWindow(contact, false);
                }
                // Append the message
                var messageText = message["sakai:body"];
                appendMessage(from.userid, from.userid, messageText, sentDate);
                // Pulse if it is not currently open
                chatWindow = getChatWindow(from.userid);
                if (!chatWindow.open && message["sakai:read"] === false) {
                    $("#chat_online_button_" + from.userid).effect("pulsate", {times: 5}, 500);
                } else if (message["sakai:read"] !== true) {
                    // the window is open, lets mark the message as read
                    message["sakai:read"] = true;
                }
                globalMessages.push(message); // only push if this window is valid, so once they close it, its gone
            }
        }
    };

    var updateChatStatusMessage = function(chatStatusMessage){
        $("#chat_mystatusmessage").html(chatStatusMessage);
    };

    ////////////////////////
    // Cookie Persistency //
    ////////////////////////

    /**
     * Write a cookie with the current active windows when you go to another page
     */
    $(window).bind("unload", function(ev){
        if (! sakai.data.me.user.anon) {
            $.cookie('sakai_chat', $.toJSON({"windows": globalChatWindows}));
            // if the browser supports html5 local sessionStorage, utilize it and save the messages from this session
            if (supportsSessionStorage) {
                sessionStorage.setItem('messages', $.toJSON(globalMessages));
            }
        }
    });

    /**
     * Restore the state from the chat windows as specified in the persistent
     * cookie
     */
    var restoreChatWindows = function(){
        if ($.cookie('sakai_chat') && $.parseJSON($.cookie('sakai_chat'))) {
            var storedState = $.parseJSON($.cookie('sakai_chat'));
            var chatWindows = storedState.windows;
            var validWindows = [];
            for (var i = 0; i < chatWindows.length; i++) {
	            appendChatWindow({"profile": chatWindows[i].profile}, chatWindows[i].open);
	            validWindows.push(chatWindows[i].profile.userid);
            }
            // grab the session's saved chat messages if they exist
            if (supportsSessionStorage) {
                var messages = $.parseJSON(sessionStorage.getItem('messages'));
                if (messages && messages.length) {
                    insertSavedMessages(messages, validWindows);
                }
            }
        }
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    $("#chat_online_list_activator").live("click", function(){
        closeAllChatWindows();
        toggleOnlineContactsList();
    });

    $("#chat_available_minimize").live("click", function(){
        closeOnlineContactsList();
    });

    $(".chat_available_friend").live("click", function(){
        var clicked = $(this).attr("id").substring(22);
        appendChatWindow(getOnlineContactObject(clicked), true);
        closeOnlineContactsList();
    });

    $(window).bind("chat_status_message_change", function(event,newChatStatusMessage){
        updateChatStatusMessage(newChatStatusMessage);
    });

    // Add binding to set the status
    $(window).bind("chat_status_change", function(event, currentChatStatus){
        sakai.api.Util.updateChatStatusElement($(".chat_available_name"), currentChatStatus);
    });

    $(".user_chat").live("click", function(){
        var clicked = $(this).attr("id").substring(19);
        var active = $(this).hasClass("chat_online_button_visible");
        closeOnlineContactsList();
        closeAllChatWindows();
        if (active) {
            closeAllChatWindows();
        } else {
            openChatWindow(clicked);
        }
    });

    $(".chat_minimize").live("click", function(){
        closeAllChatWindows();
    });

    $(".chat_close").live("click", function(){
        var clicked = $(this).attr("id").substring(11);
        removeChatWindow(clicked);
    });

    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * Initialisation code. Only load the list of online
     * contacts and show the chat bar if the user is
     * authenticated
     */
    if (!sakai.data.me.user.anon){
        showChatBar();
        // the following line is from Modernizr http://www.modernizr.com/, licensed under a dual MIT-BSD license
        supportsSessionStorage = ('sessionStorage' in window) && window['sessionStorage'] !== null;
        loadOnlineContacts(function() {
            restoreChatWindows();
        });
    }

};

sakai.api.Widgets.widgetLoader.informOnLoad("chat");