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
require(["jquery", "sakai/sakai.api.core"], function($, sakai){
    sakai_global.inbox = function(){

        /**
         *
         * Configuration
         *
         */
        var messagesPerPage = 13; // The number of messages per page.
        var allMessages = []; // Array that will hold all the messages.
        var me = sakai.data.me;
        var generalMessageFadeOutTime = 3000; // The amount of time it takes till the general message box fades out
        var selectedMessage = {}; // The current message
        var selectedType = 'inbox';
        var selectedCategory = "";
        var sortOrder = "desc";
        var sortBy = "date";
        var currentPage = 0;
        var messagesForTypeCat; // The number of messages for this type/cat.
        var box = "";
        var cats = "";
        var inboxComposeNewPanelOpen = false;
        var getAll = true;

        var openedBox = false;

        var filters = {filters : ["messages", "announcements", "invitations"]};

        /**
         *
         * CSS IDs
         *
         */
        var inbox = "inbox";
        var inboxID = "#inbox";
        var inboxClass = ".inbox";

        // global vars
        var inboxGeneralMessage = inboxID + "_general_message";
        var inboxMessageError = inbox + "_error_message";
        var inboxMessageNormal = inbox + "_normal_message";
        var inboxPager = inboxID + "_pager";
        var inboxResults = inboxID + "_results";
        var inboxArrow = inboxClass + "_arrow";
        var inboxFolders = inboxID + "_folders";
        var inboxProgress = inbox + "_progress";
        var inboxLoadingProgress = inboxID + "_loading_progress";

        // Filters on the left side
        var inboxFilter = inboxID + "_filter";
        var inboxFilterClass = inboxClass + "_filter";
        var inboxFilterInbox = inboxFilter + "_inbox";
        var inboxFilterMessages = inboxFilter + "_messages";
        var inboxFilterAnnouncements = inboxFilter + "_announcements";
        var inboxFilterInvitations = inboxFilter + "_invitations";
        var inboxFilterSent = inboxFilter + "_sent";
        var inboxFilterTrash = inboxFilter + "_trash";
        var inboxFilterNrMessages = inboxFilterClass + "_nrMessages";
        var inboxBold = inbox + "_bold";

        // Different panes (inbox, send message, view message, ..)
        var inboxPane = inboxID + "_pane";
        var inboxPaneClass = inboxClass + "_pane";
        var inboxPaneInbox = inboxPane + "_inbox";
        var inboxPaneCompose = inboxPane + "_compose";
        var inboxPaneMessage = inboxPane + "_message";

        // Main inbox
        var inboxTable = inboxID + "_table";
        var inboxTablePreloader = inboxTable + "_preloader";
        var inboxTableHeader = inboxTable + "_header";
        var inboxTableHeaderFrom = inboxTableHeader + "_from";
        var inboxTableHeaderFromContentFrom = inboxTableHeader + "_from_content_from";
        var inboxTableHeaderFromContentTo = inboxTableHeader + "_from_content_to";
        var inboxTableHeaderFromContentFromTo = inboxTableHeader + "_from_content_from_to";
        var inboxTableHeaderFromContent = inboxTableHeaderFrom + " span";
        var inboxTableMessage = inboxClass + "_message"; //    A row in the table
        var inboxTableMessageID = inboxTable + "_message_";
        var inboxTableMessagesTemplate = inbox + "_" + inbox + "_messages_template";
        var inboxTableSubject = inboxTable + "_subject_";
        var inboxTablesubjectReadClass = 'inbox-subject-read';
        var inboxTablesubjectUnreadClass = 'inbox-subject-unread';

        // subfolder labels
        var inboxSubfolderClass = ".inbox_subfolder";
        var inboxSubfolder = inboxID + "_subfolder";
        var inboxSubfolderMessages = inboxSubfolder + "_messages";
        var inboxSubfolderInvitations = inboxSubfolder + "_invitations";
        var inboxSubfolderAnnouncements = inboxSubfolder + "_announcements";

        var inboxInbox = inboxID + "_inbox";
        var inboxInboxClass = inboxClass + "_inbox";

        var inboxInboxSortUp = inboxInbox + "_sort_up";
        var inboxInboxSortDown = inboxInbox + "_sort_down";

        var inboxInboxCheckAll = inboxInbox + "_checkAll";
        var inboxInboxDelete = inboxInbox + "_delete";

        var inboxInboxMessage = inboxInboxClass + "_message";
        var inboxInboxHeader = inboxInboxClass + "_header";
        var inboxInboxCheckMessage = inboxInboxClass + '_check_message';

        var inboxTableHeaderSort = inboxInboxClass + "_table_header_sort";


        // Specific message
        var inboxSpecificMessage = inboxID + "_message";
        var inboxSpecificMessageBackToInbox = inboxSpecificMessage + "_back_to_inbox";
        var inboxSpecificMessagePreviousMessages = inboxSpecificMessage + "_previous_messages";
        var inboxSpecificMessageOption = inboxSpecificMessage + "_option";
        var inboxSpecificMessageOptionReply = inboxSpecificMessageOption + "_reply";
        var inboxSpecificMessageOptionDelete = inboxSpecificMessageOption + "_delete";
        var inboxSpecificMessageBody = inboxSpecificMessage + "_body";
        var inboxSpecificMessageDate = inboxSpecificMessage + "_date";
        var inboxSpecificMessageFrom = inboxSpecificMessage + "_from";
        var inboxSpecificMessageFromPicture = inboxSpecificMessageFrom + "_picture";
        var inboxSpecificMessageSubject = inboxSpecificMessage + "_subject";
        var inboxSpecificMessagePicture = inboxSpecificMessage + "_picture";

        // Reply on a message
        var inboxSpecificMessageReplies = inboxSpecificMessage + "_replies";
        var inboxSpecificMessageRepliesTemplate = inbox + "_message_replies_template";

        var inboxSpecificMessageCompose = inboxSpecificMessage + "_compose";
        var inboxSpecificMessageComposeSubject = inboxSpecificMessageCompose + "_subject";
        var inboxSpecificMessageComposeBody = inboxSpecificMessageCompose + "_body";
        var inboxSpecificMessageComposeSend = inboxSpecificMessageCompose + "_send";
        var inboxSpecificMessageComposeCancel = inboxSpecificMessageCompose + "_cancel";


        // New message
        var inboxCompose = inboxID + "_compose";
        var inboxComposeCancel = "#send_message_cancel";
        var inboxComposeMessage = inboxCompose + "_message";
        var inboxComposeNew = inboxCompose + "_new";
        var inboxComposeNewContainer = inboxComposeNew + "_container";

        var inboxComposeNewPanel = inboxComposeNew + "_panel";
        var inboxComposeForm = ".compose-form";

        // Errors and messages
        var inboxGeneralMessages = inboxID + "_generalmessages";
        var inboxGeneralMessagesError = inboxGeneralMessages + "_error";
        var inboxGeneralMessagesErrorGeneral = inboxGeneralMessagesError + "_general";
        var inboxGeneralMessagesErrorReadFail = inboxGeneralMessagesError + "_read_fail";
        var inboxGeneralMessagesNrNewMessages = inboxGeneralMessages + "_nr_new_messages";
        var inboxGeneralMessagesDeleted = inboxGeneralMessages + "_deleted";
        var inboxGeneralMessagesDeleted_1 = inboxGeneralMessagesDeleted + "_1";
        var inboxGeneralMessagesDeleted_x = inboxGeneralMessagesDeleted + "_x";
        var inboxGeneralMessagesSent = inboxGeneralMessages + "_sent";
        var inboxGeneralMessagesDeletedFailed = inboxGeneralMessagesDeleted + "_failed";
        var inboxGeneralMessagesSendFailed = inboxGeneralMessages + "_send_fail";

        // Keep JSLint.com happy...
        var pageMessages = function(){
        };
        var getCount = function(){
        };
        var getAllMessages = function(){
        };

        /**
         *
         * Aid Functions
         *
         */
        var unreadMessages = 0;
        var unreadInvitations = 0;
        var unreadAnnouncements = 0;

        /**
         * This function will redirect the user to the login page.
         */
        var redirectToLoginPage = function(){
            document.location = sakai.config.URL.GATEWAY_URL;
        };

        /**
         * This will show the preloader.
         */
        var showLoader = function(){
            $(inboxTable).append(sakai.api.Util.TemplateRenderer(inboxTablePreloader.substring(1), {}));
        };

        /**
         * Scroll to a specific element in a page
         * @param {Object} element The element you want to scroll to
         */
        var scrollTo = function(element){
            $("html, body").animate({
                scrollTop: element.offset().top
            }, 1);
        };

        /**
         * Shows a general message on the top screen
         * @param {String} msg    the message you want to display
         * @param {Boolean} isError    true for error (red block)/false for normal message(green block)
         */
        var showGeneralMessage = function(msg, isError){

            // Check whether to show an error type message or an information one
            var type = isError ? sakai.api.Util.notification.type.ERROR : sakai.api.Util.notification.type.INFORMATION;

            // Show the message to the user
            sakai.api.Util.notification.show("", msg, type);

        };

        /**
         * This will hide all the panes (the inbox, new reply, view message, etc..)
         */
        var hideAllPanes = function(){
            $(inboxPaneClass).hide();
        };

        /**
         * Will show the required pane and hide all the others.
         * @param {String} the Id of the pane you want to show
         */
        var showPane = function(pane){
            //    We do a check to see if the pane isn't already visible
            //    Otherwise we get an annoying flicker.
            if (!$(pane).is(":visible")) {
                hideAllPanes();
                $(pane).show();
            }
        };

        /**
         * Check or uncheck all messages depending on the top checkbox.
         */
        var tickMessages = function(){
            $(inboxInboxCheckMessage).attr("checked", ($(inboxInboxCheckAll).is(":checked") ? "checked" : ''));
        };

        /**
         * This will display the first page of the specified messages
         * @param {String} type The type of the messages (inbox, sent or trash or * for all of them)
         * @param {String} category The category of the messages (chat, invitation, ... or * for all of them)
         * @param {String} read Wether we should fetch messages that are read, unread or all of them. Option: true, false, all
         * @param {String} id The id of the filter that got clicked in the side panel.
         */
        var filterMessages = function(type, category, read, id){
            $(inboxTableHeaderFromContent).text($(inboxTableHeaderFromContentFrom).html());

            // The small header above the webpage
            $(inboxInboxHeader).hide();
            $(inboxID + "_" + type).show();

            // Remember the type and category we want to see.
            selectedType = type;
            selectedCategory = category;

            // Display first page.
            //getCount(read);
            getAllMessages();

            // Show the inbox pane
            showPane(inboxPaneInbox);

            // Set the title bold
            $(inboxFilterClass).removeClass(inboxBold);
            $(id).addClass(inboxBold);
        };

        /**
         * Removes all the messages out of the DOM.
         * It will also remove the preloader in the table.
         */
        var removeAllMessagesOutDOM = function(){
            $(inboxTableMessage).remove();
        };

        /**
         * This method will clear the input fields for the reply part of a specific message.
         * It will also hide the form again.
         */
        var clearInputFields = function(){
            // Clear all the input fields.
            $(inboxSpecificMessageComposeSubject + ", " + inboxSpecificMessageComposeBody).val('');

            // Hide the reply form.
            $(inboxSpecificMessageCompose).hide();
        };


        /**
         *
         * Render messages
         *
         */
        /**
         * Adds the correct format to a message.
         * ex: parsing the date
         * @param {Object} message
         */
        var formatMessage = function(message){

            // 2010-10-06T14:45:54+01:00
            var dateLong = message["_created"];
            var d = sakai.api.l10n.parseDateLong(dateLong, sakai.data.me);
            //Jan 22, 2009 10:25 PM
            message.date = sakai.api.l10n.transformDateTimeShort(d);

            if (message["sakai:read"] === "true" || message["sakai:read"] === true) {
                message.read = true;
            }
            else {
                message.read = false;
            }

            if (message["sakai:category"] === "message" || message["sakai:category"] === undefined) {
                message.category = "Message";
            }
            else
                if (message["sakai:category"] === "announcement") {
                    message.category = "Announcement";
                }
                else
                    if (message["sakai:category"] === "invitation") {
                        message.category = "Invitation";
                    }

            if (message.previousMessage) {
                message.previousMessage = formatMessage(message.previousMessage);
            }

            // pictures
            if (message.userFrom && $.isArray(message.userFrom)) {
                for (var i = 0, il = message.userFrom.length; i < il; i++) {
                    if (message.userFrom[i].picture && $.parseJSON(message.userFrom[i].picture).name) {
                        message.userFrom[i].photo = $.parseJSON(message.userFrom[i].picture).name;
                    }
                }
            }

            if (message.userTo && $.isArray(message.To)) {
                for (var j = 0, jl = message.userTo.length; j < jl; j++) {
                    if (message.userTo[j].picture && $.parseJSON(message.userTo[j].picture).name) {
                        message.userTo[j].photo = $.parseJSON(message.userTo[j].picture).name;
                    }
                }
            }

            return message;
        };

        /**
         * Renders the messages.
         * @param {Object} The JSON response from the server. Make sure it has a .message array in it.
         */
        var renderMessages = function(response){
            for (var j = 0, l = response.results.length; j < l; j++) {
                // temporary internal id.
                // Use the name for the id.
                response.results[j] = formatMessage(response.results[j]);
                response.results[j].nr = j;
                var messageSubject = response.results[j]["sakai:subject"] + "";
                if (messageSubject) {
                    var key = messageSubject.substr(0, messageSubject.lastIndexOf(","));
                    comment = messageSubject.substr(messageSubject.lastIndexOf(",") + 1, messageSubject.length);

                    // title , groupid from pickeruser
                    if (key) {
                        response.results[j].subject = sakai.api.Security.escapeHTML(sakai.api.i18n.General.process(key) + " " + comment);
                        // just title with ${user} add to contacts
                    }
                    else
                        if (sakai.api.i18n.General.process(response.results[j]["sakai:subject"])) {
                            response.results[j]["sakai:subject"] = sakai.api.Security.saneHTML(sakai.api.i18n.General.process(response.results[j]["sakai:subject"]).replace(/\$\{user\}/gi, sakai.api.User.getDisplayName(response.results[j].userFrom[0])));
                        }
                        else {
                            response.results[j]["sakai:subject"] = messageSubject;
                        }
                }
                response.results[j].body = response.results[j]["sakai:body"];
                response.results[j].messagebox = response.results[j]["sakai:messagebox"];
                response.results[j] = formatMessage(response.results[j]);
            }

            allMessages = response.results;

            // Show messages
            var tplData = {
                "messages": response.results,
                sakai: sakai
            };

            // remove previous messages
            removeAllMessagesOutDOM();

            // Add them to the DOM
            $(inboxTable).children("tbody").append(sakai.api.Util.TemplateRenderer(inboxTableMessagesTemplate, tplData));

            messagesForTypeCat = response.total;
            pageMessages(currentPage + 1);

            // do checkboxes
            tickMessages();
        };

        /**
         *
         * Pager
         *
         */
        /**
         * Show a certain page of messages.
         * @param {int} pageNumber The page number you want to display.
         */
        var showPage = function(pageNumber){
            // Remove all messages
            // remove previous messages
            removeAllMessagesOutDOM();
            // Set the pager
            pageMessages(pageNumber);
            // Remember which page were on.
            currentPage = pageNumber - 1;
            // Show set of messages
            getAllMessages();
        };

        /**
         * Draw up the pager at the bottom of the page.
         * @param {int} pageNumber The number of the current page
         */
        pageMessages = function(pageNumber){
            // show pager only when there are more than one pages
            if (Math.ceil(messagesForTypeCat / messagesPerPage) > 1) {
                $(inboxPager).pager({
                    pagenumber: pageNumber,
                    pagecount: Math.ceil(messagesForTypeCat / messagesPerPage),
                    buttonClickCallback: showPage
                });
                $(inboxPager).show();
            }
            else {
                // hide pager less than one page
                $(inboxPager).hide();
            }
        };

        /**
         * Toggle loading animation and tbody.
         */
        toggleLoading = function(checking){
            // if checking is true
            // show the animation and hide tbody
            if (checking) {
                $("tbody").hide();
                $(inboxLoadingProgress).addClass(inboxProgress);
                // hide animation and show tbody.
            }
            else {
                $("tbody").show();
                $(inboxLoadingProgress).removeClass(inboxProgress);

            }
        };

        /**
         *
         * Server functions
         *
         */
        /**
         * Gets all the messages from the JCR.
         */
        getAllMessages = function(callback, isDirectMessage){
            toggleLoading(true);
            box = "inbox";
            if (selectedType === "sent") {
                box = "outbox";
            } else if (selectedType === "trash") {
                box = "trash";
            }

            var types = "&types=" + selectedType;
            if (typeof selectedType === "undefined" || selectedType === "") {
                types = "";
            }
            else
                if (typeof selectedType === "Array") {
                    types = "&types=" + selectedType.join(",");
                }

            cats = "*";
            if (selectedCategory) {
                if (selectedCategory === "Message") {
                    cats = "message";
                } else if (selectedCategory === "Announcement") {
                    cats = "announcement";
                } else if (selectedCategory === "Invitation") {
                    cats = "invitation";
                }
            }

            switch (sortBy) {
                case "date":
                    sortBy = "sakai:created";
                    break;
                case "type":
                    sortBy = "sakai:category";
                    break;
                case "to":
                    sortBy = "sakai:to";
                    break;
                case "from":
                    sortBy = "sakai:from";
                    break;
                case "subject":
                    sortBy = "sakai:subject";
                    break;
            }

            sakai.api.Communication.getAllMessages(box, cats, messagesPerPage, currentPage, sortBy, sortOrder, function(success, data){
                if (success){
                    if (data.results) {
                        toggleLoading();
                        // Render the messages
                        renderMessages(data);
                        showUnreadMessages();
                    }
                    if (typeof callback !== "undefined") {
                        callback();
                    }

                } else {
                    showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text());
                    $(inboxResults).html(sakai.api.Security.saneHTML($(inboxGeneralMessagesErrorGeneral).text()));
                }
            });
        };

        /**
         * Will do a count of all the unread messages and change the values in the DOM.
         * Note: This function will only check the nr of messages there are. It will not fetch them!
         */
        var showUnreadMessages = function(){

            sakai.api.Communication.getUnreadMessageCount("inbox", function(success, data){
                if (success) {

                    var totalcount = 0;
                    unreadMessages = 0;
                    unreadAnnouncements = 0;
                    unreadInvitations = 0;

                    for (var i = 0, j = data.count.length; i < j; i++) {
                        if (data.count[i].group === "message") {
                            unreadMessages = data.count[i].count;
                        } else if (data.count[i].group === "announcement") {
                            unreadAnnouncements = data.count[i].count;
                        } else if (data.count[i].group === "invitation") {
                            unreadInvitations = data.count[i].count;
                        }
                        totalcount += data.count[i].count;
                    }

                    updateUnreadNumbers();
                } else {
                    showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text());
                }
            });
        };

        var updateUnreadNumbers = function(){

            if (unreadMessages > 0) {
                $("#inbox_unread_nr_messages").text(sakai.api.Security.saneHTML("(" + unreadMessages + ")"));
            }
            else {
                $("#inbox_unread_nr_messages").text("");
            }

            if (unreadAnnouncements > 0) {
                $("#inbox_unread_nr_announcements").text(sakai.api.Security.saneHTML("(" + unreadAnnouncements + ")"));
            }
            else {
                $("#inbox_unread_nr_announcements").text("");
            }

            if (unreadInvitations > 0) {
                $("#inbox_unread_nr_invitations").text(sakai.api.Security.saneHTML("(" + unreadInvitations + ")"));
            }
            else {
                $("#inbox_unread_nr_invitations").text("");
            }

            var totalUnread = 0 + unreadMessages + unreadInvitations + unreadAnnouncements;

            // if unread messages return minus value set to 0.
            if (totalUnread < 0) {
                totalUnread = 0;
            }
            $("#chat_unreadMessages").text(totalUnread);
        };

        /**
         *
         * Display specific message
         *
         */
        /**
         * Get the message out of the list with the specific id.
         * @param {String} id    The id of a message
         */
        var getMessageWithId = function(id){

            for (var i = 0, j = allMessages.length; i < j; i++) {
                if (allMessages[i]["jcr:name"] === id) {
                    renderMessage(allMessages[i]);
                    return;
                }
            }

            sakai.api.Communication.getMessage(id, function(message){
                renderMessage(formatMessage(message));
            });

        };

        /**
         * Mark a message as read.
         * @param {Object} message The JSON object that represents the message.
         * @param {String} id The id for this message.
         */
        var markMessageRead = function(message, id){
            sakai.api.Communication.markMessagesAsRead(message["jcr:path"] || message["_path"].replace("a:","/~"), function(success, userdata){
                if (success) {
                    if (allMessages && allMessages.length) {
                        for (var i = 0, j = allMessages.length; i < j; i++) {
                            if (allMessages[i].id === message.id) {
                                allMessages[i]["sakai:read"] = true;
                                break;
                            }
                        }
                    }
                    // Mark the message in the inbox table as read.
                    $(inboxTableMessageID + id).addClass(inboxTablesubjectReadClass);
                    $(inboxTableMessageID + id).removeClass(inboxTablesubjectUnreadClass);

                    if (message["sakai:category"] === "message") {
                        unreadMessages -= 1;
                    } else if (message["sakai:category"] === "invitation") {
                        unreadInvitations -= 1;
                    } else if (message["sakai:category"] === "announcement") {
                        unreadAnnouncements -= 1;
                    }

                    updateUnreadNumbers();

                } else {
                    showGeneralMessage($(inboxGeneralMessagesErrorReadFail).text());
                }
            });
        };

        /**
         * Displays only the message with that id.
         * @param {String} id    The id of a message
         */
        var displayMessage = function(id) {
            var message = getMessageWithId(id);
        };

        var renderMessage = function(message) {
            selectedMessage = message;
            if (typeof message !== "undefined" && !$.isEmptyObject(message)) {
                $(".message-options").show();
                $("#inbox_message_previous_messages").hide();
                $("#inbox_message_replies").html("");

                // Hide invitation links
                $("#inbox-invitation-accept").hide();
                $("#inbox-invitation-already").hide();
                $("#inbox-invitation-ignore").hide();
                $("#inbox-sitejoin-accept").hide();
                $("#inbox-sitejoin-deny").hide();
                $("#inbox-sitejoin-already").hide();

                showPane(inboxPaneMessage);
                // if reply form if visible reset reply form and hide it
                if ($(inboxSpecificMessageCompose).is(":visible")) {
                    $(".compose-form")[0].reset();
                    $(inboxSpecificMessageCompose).hide();
                }
                // Fill in this message values.
                $(inboxSpecificMessageSubject).text(sakai.api.Security.saneHTML(message["sakai:subject"]));
                var messageBody = ""+message["sakai:body"],
                    key = ""; // coerce to string in case the body is all numbers
                $(inboxSpecificMessageBody).html(sakai.api.Security.replaceURL(sakai.api.Security.saneHTML(messageBody.replace(/\n/gi, " <br />"))));
                $(inboxSpecificMessageDate).text(sakai.api.Security.saneHTML(message.date));

                if (message.userFrom) {
                    for (var i = 0, j = message.userFrom.length; i < j; i++) {
                        // in chat message message subject is in subject not in sakai:subject
                        var messageSubject = message["sakai:subject"] + "";
                        key = messageSubject.substr(0, messageSubject.lastIndexOf(","));
                        comment = messageSubject.substr(messageSubject.lastIndexOf(",") + 1, messageSubject.length);
                        // title , groupid from pickeruser
                        if (key) {
                            message["sakai:subject"] = sakai.api.i18n.General.process(key) + " " + comment;
                            // just title with ${user} add to contacts
                        }
                        else
                            if (sakai.api.i18n.General.process(message["sakai:subject"])) {
                                message["sakai:subject"] = sakai.api.i18n.General.process(message["sakai:subject"]).replace(/\$\{user\}/gi, sakai.api.User.getDisplayName(message.userFrom[0]));
                            }
                        messageBody = message["sakai:body"] + "";
                        key = messageBody.substr(0, messageBody.lastIndexOf(","));
                        comment = messageBody.substr(messageBody.lastIndexOf(",") + 1, messageBody.length);
                        if (key && sakai.api.i18n.General.process(key)) {
                            message["sakai:body"] = sakai.api.i18n.General.process(key).replace(/\$\{comment\}/gi, comment).replace(/\$\{user\}/gi, sakai.api.User.getDisplayName(message.userFrom[i]));
                        } else {
                            message["sakai:body"] = key.replace(/\$\{comment\}/gi, comment).replace(/\$\{user\}/gi, sakai.api.User.getDisplayName(message.userFrom[i]));
                        }
                        var obj = {
                            "from_href" : "/~" + message.userFrom[i].userid,
                            "from_name" : sakai.api.User.getDisplayName(message.userFrom[i]),
                            "message_date" : sakai.api.Security.saneHTML(message.date)
                        };
                        if (message.userFrom[i].photo) {
                            obj["picture"] = "/~" + message.userFrom[i]["userid"] + "/public/profile/" + message.userFrom[i].photo;
                        } else {
                            obj["picture"] = sakai.config.URL.USER_DEFAULT_ICON_URL;
                        }
                        $(".sender_details").html(sakai.api.Util.TemplateRenderer("sender_details_template",obj));
                    }
                }
                else {
                    var obj1 = {
                        "from_name": sakai.api.Security.saneHTML(message["sakai:from"]),
                        "picture": sakai.config.URL.USER_DEFAULT_ICON_URL
                    };
                    $(".sender_details").html(sakai.api.Util.TemplateRenderer("sender_details_template",obj1));
                }

                // Fill in this message values.
                $(inboxSpecificMessageSubject).text(sakai.api.Security.saneHTML(message["sakai:subject"]));
                messageBody = ""+message["sakai:body"]; // coerce to string in case the body is all numbers

                // Reply part.
                $(inboxSpecificMessageComposeSubject).val("Re: " + message["sakai:subject"]);

                if (message["sakai:category"] === "invitation") {
                    if (message["sakai:subcategory"] === "joinrequest") {
                        $.getJSON(message["sakai:sitepath"] + '/joinrequests/' + message.userFrom[0].hash + '.json', function(data){
                            var siteJoinRequestIsPending = (data["sakai:requestState"] && data["sakai:requestState"] === "pending");
                            if (siteJoinRequestIsPending) {
                                $("#inbox-sitejoin-accept").show();
                                $("#inbox-sitejoin-deny").show();
                            }
                            else {
                                $("#inbox-sitejoin-already").show();
                            }
                        });
                    }
                    else {
                        // Check whether this request is still pending
                        $.ajax({
                            url: sakai.config.URL.CONTACTS_FIND_STATE + "?state=INVITED&page=0&items=100",
                            success: function(data){
                                var pending = false;
                                for (var i = 0; i < data.results.length; i++) {
                                    if (data.results[i].target === message["sakai:from"]) {
                                        // Still a pending invitation
                                        pending = true;
                                    }
                                }
                                if (pending) {
                                    $("#inbox-invitation-accept").show();
                                    $("#inbox-invitation-ignore").show();
                                }
                                else {
                                    $("#inbox-invitation-already").show();
                                }
                            }
                        });
                    }
                }

                // This message has some replies attached to it.
                if (message["sakai:previousmessage"] && message["previousMessage"]) {
                    $(inboxSpecificMessagePreviousMessages).show();
                    var replieshtml = "";
                    var replies = {};
                    var json = {
                        "message": message,
                        sakai: sakai
                    };
                    replieshtml += sakai.api.Util.TemplateRenderer(inboxSpecificMessageRepliesTemplate, json);
                    $(inboxSpecificMessageReplies).html(replieshtml);
                }
                else {
                    // There are no replies hide the header that states 'Previous messages'.
                    $(inboxSpecificMessagePreviousMessages).hide();
                }

                if (message["sakai:read"] === false) {
                    // We haven't read this message yet. Mark it as read.
                    markMessageRead(message, message["sakai:id"]);
                }
            }
            else {
                $.bbq.removeState("message");
            }

        };

        /**
         *
         * ACCEPT INVITATION
         *
         */
        $("#inbox_message_accept_invitation").live("click", function(ev){
            sakai.api.User.acceptContactInvite(selectedMessage["sakai:from"], sakai.data.me.user.userid, function(success) {
                if (success) {
                    $("#inbox-invitation-accept").hide();
                    $("#inbox-invitation-ignore").hide();
                    $("#inbox-invitation-already").show();
                }
            });
        });

        /**
         *
         * IGNORE INVITATION
         *
         */
        $("#inbox_message_ignore_invitation").live("click", function(ev){
            sakai.api.User.ignoreContactInvite(selectedMessage["sakai:from"], sakai.data.me.user.userid, function(success) {
                if (success) {
                    $("#inbox-invitation-accept").hide();
                    $("#inbox-invitation-ignore").hide();
                    $("#inbox-invitation-already").show();
                }
            });
        });

        /**
         *
         * ACCEPT SITE JOIN REQUEST
         *
         */
        $("#inbox_message_accept_sitejoin").live("click", function(ev){
            var from = selectedMessage["sakai:from"];
            var sitePath = selectedMessage["sakai:sitepath"];
            sakai.api.User.respondToSiteJoinRequest(from, sitePath, true, function(success) {
                if (success) {
                    $("#inbox-sitejoin-accept").hide();
                    $("#inbox-sitejoin-deny").hide();
                    $("#inbox-sitejoin-already").show();
                }
            });
        });

        /**
         *
         * DENY SITE JOIN REQUEST
         *
         */
        $("#inbox_message_deny_sitejoin").live("click", function(ev){
            var from = selectedMessage["sakai:from"];
            var sitePath = selectedMessage["sakai:sitepath"];
            sakai.api.User.respondToSiteJoinRequest(from, sitePath, false, function(success) {
                $("#inbox-sitejoin-accept").hide();
                $("#inbox-sitejoin-deny").hide();
                $("#inbox-sitejoin-already").show();
            });
        });

        /**
         *
         * SEND MESSAGE
         *
         */
        /**
         * When a message has been sent this function gets called.
         * @param {Object} data A JSON object that contains the response from the server.
         */
        var sendMessageFinished = function(success, data){
            clearInputFields();
            // Show the sent inbox pane.
            $.bbq.pushState({
                "box": openedBox
            }, 2);
        };


        /**
         *
         * Delete a message
         *
         */
        /**
         * Removes all the messages from memory that are in pathToMessages if success = true
         * success = false will show an error.
         * @param {String[]} pathToMessages
         * @param {Boolean} success
         */
        var deleteMessagesFinished = function(pathToMessages, success){
            if (success) {
                // Repage the inbox
                currentPage = currentPage + 1;
                messagesForTypeCat--;
                showPage(currentPage);

                var txt = "";
                if (pathToMessages.length === 1) {
                    txt = $(inboxGeneralMessagesDeleted_1).text();
                }
                else {
                    txt = pathToMessages.length + $(inboxGeneralMessagesDeleted_x).text();
                }

                showGeneralMessage(txt, false);
            }
            else {
                showGeneralMessage($(inboxGeneralMessagesDeletedFailed).text());
            }
        };

        /**
         * Delete all the messages that are in ids
         * @param {Array} ids    An array of ids that have to be deleted.
         */
        var deleteMessages = function(pathToMessages, hardDelete){

            if (typeof hardDelete === "undefined") {
                hardDelete = false;
            }
            $("#inbox_table input[type='checkbox']").removeAttr("checked");
            if (hardDelete) {
                // We will have to do a hard delete to all the JCR files.
                sakai.api.Communication.deleteMessages(pathToMessages, true, function(success) {
                    deleteMessagesFinished(pathToMessages, success);
                });
            } else {
                var toDelete = pathToMessages.length;
                var deleted = 0;

                // Update unread number on left hand side
                var deletedUnreadMessages = 0;
                var deletedUnreadAnnouncements = 0;
                var deletedUnreadInvitations = 0;

                for (var i = 0, j = allMessages.length; i < j; i++) {
                    for (var m = 0, n = pathToMessages.length; m < n; m++) {
                        if (allMessages[i]["jcr:path"] === pathToMessages[m]) {
                            if (allMessages[i]["sakai:read"] === false && allMessages[i]["sakai:category"]) {
                                if (allMessages[i]["sakai:category"] === "message") {
                                    deletedUnreadMessages++;
                                }
                                else
                                    if (allMessages[i]["sakai:category"] === "invitation") {
                                        deletedUnreadInvitations++;
                                    }
                                    else
                                        if (allMessages[i]["sakai:category"] === "announcement") {
                                            deletedUnreadAnnouncements++;
                                        }
                            }
                        }
                    }
                }
                unreadMessages -= deletedUnreadMessages;
                unreadAnnouncements -= deletedUnreadAnnouncements;
                unreadInvitations -= deletedUnreadInvitations;
                updateUnreadNumbers();
                $.bbq.removeState("message");
                sakai.api.Communication.deleteMessages(pathToMessages, false, function(success) {
                    deleteMessagesFinished(pathToMessages, success);
                });
            }
        };


        /**
         *
         * Event Handling
         *
         */
        $(inboxComposeMessage).click(function(){
            $.bbq.pushState({
                "action": "composenew"
            }, 2);
        });

        //    This is the widget id!
        $(inboxComposeCancel).live("click", function(){
            //    Jump back to inbox
            $.bbq.pushState({
                "box": openedBox
            }, 2);
        });

        $("#top_navigation .mail").live("click", function(){
            $.bbq.pushState({
                "box": "inbox"
            }, 2);
        });

        /**
         *
         * Show a specific message
         *
         */
        $(inboxInboxMessage).live("click", function(e, ui){

            var id = e.target.id;
            id = id.split('_');
            $.bbq.pushState({
                "message": id[id.length - 1]
            }, 2);
        });

        /* Filter the messages. */

        $(inboxFilterMessages).live("click", function(){
            openedBox = "messages";
            $.bbq.pushState({
                "box": "messages"
            }, 2);
        });
        $(inboxFilterAnnouncements).live("click", function(){
            openedBox = "announcements";
            $.bbq.pushState({
                "box": "announcements"
            }, 2);
        });
        $(inboxFilterInvitations).live("click", function(){
            openedBox = "invitations";
            $.bbq.pushState({
                "box": "invitations"
            }, 2);
        });
        $(inboxFilterInbox).live("click", function(){
            openedBox = "inbox";
            $.bbq.pushState({
                "box": "inbox"
            }, 2);
        });
        $(inboxFilterSent).live("click", function(){
            openedBox = "sent";
            $.bbq.pushState({
                "box": "sent"
            }, 2);
        });
        $(inboxFilterTrash).live("click", function(){
            openedBox = "trash";
            $.bbq.pushState({
                "box": "trash"
            }, 2);
        });

        // Check all message
        $(inboxInboxCheckAll).change(function(){
            tickMessages();
        });
        $(inboxInboxDelete).click(function(){
            // Delete all checked messages
            var pathToMessages = [];
            $(inboxInboxCheckMessage + ":checked").each(function(){
                var pathToMessage = $(this).val();
                pathToMessages.push(pathToMessage);
            });

            // If we are in trash we hard delete the messages
            deleteMessages(pathToMessages, (selectedType === sakai.config.Messages.Types.trash));

        });

        $(inboxTableHeaderSort).bind("click", function(){
            $(inboxTable + " " + inboxArrow).remove();
            sortBy = $(this).attr("id").replace(/inbox_table_header_/gi, "");
            sortOrder = (sortOrder === "desc") ? "asc" : "desc";
            if (sortOrder === "desc") {
                $(this).append(sakai.api.Security.saneHTML($(inboxInboxSortDown).html()));
            }
            else {
                $(this).append(sakai.api.Security.saneHTML($(inboxInboxSortUp).html()));
            }
            getAllMessages();
        });

        /**
         *
         * Specific message
         *
         */
        $(inboxSpecificMessageBackToInbox).click(function(){
            // Show the inbox.
            $.bbq.pushState({
                "box": openedBox
            }, 2);

            // Clear all the input fields
            clearInputFields();
        });

        $(inboxSpecificMessageOptionReply).click(function(){
            $(inboxSpecificMessageCompose).show();
            scrollTo($(inboxSpecificMessageCompose));
        });

        $(inboxSpecificMessageOptionDelete).click(function(){
            var harddelete = false;
            if ($.inArray(selectedMessage.types, "trash") > -1) {
                // This is a trashed message, hard delete it.
                harddelete = true;
            }
            // Delete the message
            deleteMessages([selectedMessage["jcr:path"]], harddelete);

            // Show the inbox
            showPane(inboxPaneInbox);

            // Clear all the input fields
            clearInputFields();
        });

        $(inboxSpecificMessageComposeCancel).click(function(){
            // Clear all the input fields
            clearInputFields();
        });

        $(inboxComposeForm).bind("submit", function(){
            return false;
        });

        $(inboxSpecificMessageComposeSend).click(function(){
            // We want to send a message.
            var subject = $(inboxSpecificMessageComposeSubject).val();
            var body = $(inboxSpecificMessageComposeBody).val();

            sakai.api.Communication.sendMessage(selectedMessage["sakai:from"], me, subject, body, "message", selectedMessage["sakai:id"], sendMessageFinished);
            showGeneralMessage($(inboxGeneralMessagesSent).text());
            // Clear all the input fieldst
            clearInputFields();
        });

        var getCurrentBox = function(){
            var box = $.bbq.getState("box");
            if (box) {
                openedBox = box;
            } else if (!openedBox) {
                openedBox = "inbox";
            }
            return box;
        };

        $(window).bind('hashchange', function(e){
            $(inboxTable + " " + inboxArrow).remove();
            $("#inbox_table_header_date").append(sakai.api.Security.saneHTML($(inboxInboxSortDown).html()));
            var box = getCurrentBox();
            var msg = $.bbq.getState("message");
            var action = $.bbq.getState("action");
            if (action && action === "composenew") {
                showPane(inboxPaneCompose);
                // initialise the sendmessage widget
                // we tell it to show it in our id and NOT as a layover.
                $(window).trigger("initialize.sendmessage.sakai", [null, true, inboxComposeNewContainer, sendMessageFinished]);
            } else if (msg) {
                displayMessage(msg);
            } else if (box) {
                        switch (box) {
                            case "inbox":
                                $(inboxSubfolderClass).hide();
                                filterMessages(sakai.config.Messages.Types.inbox, "*", "all", inboxFilterInbox);
                                break;
                            case "messages":
                                $(inboxSubfolderClass).hide();
                                filterMessages(sakai.config.Messages.Types.inbox, sakai.config.Messages.Categories.message, "all", inboxFilterMessages);
                                $(inboxSubfolderMessages).show();
                                break;
                            case "announcements":
                                $(inboxSubfolderClass).hide();
                                filterMessages(sakai.config.Messages.Types.inbox, sakai.config.Messages.Categories.announcement, "all", inboxFilterAnnouncements);
                                $(inboxSubfolderAnnouncements).show();
                                break;
                            case "invitations":
                                filterMessages(sakai.config.Messages.Types.inbox, sakai.config.Messages.Categories.invitation, "all", inboxFilterInvitations);
                                $(inboxSubfolderClass).hide();
                                $(inboxSubfolderInvitations).show();
                                break;
                            case "sent":
                                $(inboxSubfolderClass).hide();
                                filterMessages(sakai.config.Messages.Types.sent, "*", "all", inboxFilterSent);
                                $(inboxTableHeaderFromContent).text($(inboxTableHeaderFromContentTo).html());
                                break;
                            case "trash":
                                $(inboxSubfolderClass).hide();
                                filterMessages(sakai.config.Messages.Types.trash, "*", "all", inboxFilterTrash);
                                $(inboxTableHeaderFromContent).text($(inboxTableHeaderFromContentFromTo).html());
                                break;
                        }
            } else { // show the inbox
                $(inboxSubfolderClass).hide();
                filterMessages(sakai.config.Messages.Types.inbox, "*", "all", inboxFilterInbox);
            }
        });


        /**
         *
         * Init
         *
         */
        var doInit = function(){

            // Render the filter buttons
            filters.sakai = sakai;
            sakai.api.Util.TemplateRenderer($("#inbox_inbox_filters_template"), filters, $("#inbox_filters"));

            var isDirectMessage = $.bbq.getState("message") ? true : false;
            var isNewMessage = $.bbq.getState("action") ? true : false;
            $(window).bind("ready.sendmessage.sakai", function(){
                  $(window).trigger("hashchange");
                  if (isDirectMessage || isNewMessage){
                      showUnreadMessages();
                  }
            });

        };


        doInit();
    };
    sakai.api.Widgets.Container.registerForLoad("inbox");
});
