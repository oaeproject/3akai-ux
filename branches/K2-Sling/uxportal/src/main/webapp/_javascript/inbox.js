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

/*global $, Config, sdata, opensocial */

var sakai = sakai || {};
sakai.inbox = function() {

    //////////////////////////////
    // Configuration variables 	//
    //////////////////////////////	
    
    var messagesPerPage = 5; //	The number of messages per page.
    var allMessages = []; //	Array that will hold all the messages.
    var me = sdata.me;
    var generalMessageFadeOutTime = 3000; //	The amount of time it takes till the general message box fades out
    var selectedMessage = {}; //	The current message
    var selectedType = 'inbox';
    var selectedCategory = "";
    var sortOrder = "descending";
    var sortBy = "date";
    var currentPage = 0;
    var messagesForTypeCat; //		The number of messages for this type/cat.
    
    
    //////////////////////////////
    // 		    CSS IDs    		//
    //////////////////////////////
    
    var inbox = "inbox";
    var inboxID = "#inbox";
    var inboxClass = ".inbox";
    
    //    global vars
    var inboxGeneralMessage = inboxID + "_general_message";
    var inboxMessageError = inbox + "_error_message";
    var inboxMessageNormal = inbox + "_normal_message";
    var inboxPager = inboxID + "_pager";
    var inboxResults = inboxID + "_results";
    var inboxArrow = inboxClass + "_arrow";
    var inboxFolders = inboxID + "_folders";
    
    //    Filters on the left side
    var inboxFilter = inboxID + "_filter";
    var inboxFilterClass = inboxClass + "_filter";
    var inboxFilterInbox = inboxFilter + "_inbox";
    var inboxFilterMessages = inboxFilter + "_messages";
    var inboxFilterAnnouncements = inboxFilter + "_announcements";
    var inboxFilterChats = inboxFilter + "_chats";
    var inboxFilterInvitations = inboxFilter + "_invitations";
    var inboxFilterSent = inboxFilter + "_sent";
    var inboxFilterTrash = inboxFilter + "_trash";
    var inboxFilterNrMessages = inboxFilterClass + "_nrMessages";
    var inboxBold = inbox + "_bold";
       
    //    Different panes (inbox, send message, view message, ..)
    var inboxPane = inboxID + "_pane";
    var inboxPaneClass = inboxClass + "_pane";
    var inboxPaneInbox = inboxPane + "_inbox";
    var inboxPaneCompose = inboxPane + "_compose";
    var inboxPaneMessage = inboxPane + "_message";
        
    //    Main inbox
    var inboxTable = inboxID + "_table";
    var inboxTablePreloader = inboxTable + "_preloader";
    var inboxTableHeader = inboxTable + "_header";
    var inboxTableHeaderFrom = inboxTableHeader + "_from";
    var inboxTableHeaderFromContent = inboxTableHeaderFrom + " span";
    var inboxTableMessage = inboxClass + "_message";    //    A row in the table
    var inboxTableMessageID = inboxTable + "_message_";
    var inboxTableMessagesTemplate = inbox + "_" + inbox + "_messages_template";
    var inboxTableSubject = inboxTable + "_subject_";
    var inboxTablesubjectReadClass = 'inbox-subject-read';
    var inboxTablesubjectUnreadClass = 'inbox-subject-unread';
    
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
    
    
    //    Specific message
    var inboxSpecificMessage = inboxID + "_message";
    var inboxSpecificMessageBackToInbox = inboxSpecificMessage + "_back_to_inbox";
    var inboxSpecificMessagePreviousMessages = inboxSpecificMessage + "_previous_messages";
    var inboxSpecificMessageOption = inboxSpecificMessage + "_option";
    var inboxSpecificMessageOptionReply = inboxSpecificMessageOption + "_reply";
    var inboxSpecificMessageOptionDelete = inboxSpecificMessageOption + "_delete";
    var inboxSpecificMessageBody = inboxSpecificMessage + "_body";
    var inboxSpecificMessageDate = inboxSpecificMessage + "_date";
    var inboxSpecificMessageFrom = inboxSpecificMessage + "_from";
    var inboxSpecificMessageSubject = inboxSpecificMessage + "_subject";
    var inboxSpecificMessagePicture = inboxSpecificMessage + "_picture";
    
    //    Reply on a message
    var inboxSpecificMessageReplies = inboxSpecificMessage + "_replies";
    var inboxSpecificMessageRepliesTemplate = inbox + "_message_replies_template";
    var inboxSpecificMessageRepliesTemplateChats = "inbox_compose_replies_template_chats";
    
    var inboxSpecificMessageCompose = inboxSpecificMessage + "_compose";
    var inboxSpecificMessageComposeSubject = inboxSpecificMessageCompose + "_subject";
    var inboxSpecificMessageComposeBody = inboxSpecificMessageCompose + "_body";
    var inboxSpecificMessageComposeSend = inboxSpecificMessageCompose + "_send";
    var inboxSpecificMessageComposeCancel = inboxSpecificMessageCompose + "_cancel";
    
    
    //    New message
    var inboxCompose = inboxID + "_compose";
    var inboxComposeCancel = "#send_message_cancel";
    var inboxComposeMessage = inboxCompose + "_message";
    var inboxComposeNew = inboxCompose + "_new";
    var inboxComposeNewContainer = inboxComposeNew + "_container";
    
    var inboxComposeNewPanel = inboxComposeNew + "_panel";
    
    //    Errors and messages
    var inboxGeneralMessages = inboxID + "_generalmessages";
    var inboxGeneralMessagesError = inboxGeneralMessages + "_error";
    var inboxGeneralMessagesErrorGeneral = inboxGeneralMessagesError + "_general";
    var inboxGeneralMessagesErrorReadFail = inboxGeneralMessagesError + "_read_fail";
    var inboxGeneralMessagesNrNewMessages = inboxGeneralMessages + "_nr_new_messages";
    var inboxGeneralMessagesDeleted = inboxGeneralMessages + "_deleted";
    var inboxGeneralMessagesSent = inboxGeneralMessages + "_sent";
    var inboxGeneralMessagesDeletedFailed = inboxGeneralMessagesDeleted + "_failed";
    var inboxGeneralMessagesSendFailed = inboxGeneralMessages + "_send_fail";
    
    //    other IDs
    var chatUnreadMessages = "#chat_unreadMessages";
    
    
    //    Keep JSLint.com happy...
    var pageMessages = function() {};
    var getCount = function() {};
    var getAllMessages = function() {};
    
    //////////////////////////////
    // 		Aid functions 		//
    //////////////////////////////	
    
    /**
     * This function will redirect the user to the login page.
     */
    var redirectToLoginPage = function() {
        document.location = Config.URL.GATEWAY_URL;
    };
    
    /**
     * This will show the preloader.
     */
    var showLoader = function() {
        $(inboxTable).append($.Template.render(inboxTablePreloader.substring(1), {}));
    };
    
    /** 
     * Scroll to a specific element in a page
     * @param {Object} element The element you want to scroll to
     */
    var scrollTo = function(element) {
        $('html, body').animate({
            scrollTop: element.offset().top
        }, 1);
    };
    
    /**
     * Shows a general message on the top screen
     * @param {String} msg	the message you want to display
     * @param {Boolean} isError	true for error (red block)/false for normal message(green block)
     * @param {Number} timeoutthe amout of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(msg, isError, timeout) {
        $(inboxGeneralMessage).html(msg);
        if (isError) {
            $(inboxGeneralMessage).addClass(inboxMessageError);
            $(inboxGeneralMessage).removeClass(inboxMessageNormal);
        }
        else {
            $(inboxGeneralMessage).removeClass(inboxMessageError);
            $(inboxGeneralMessage).addClass(inboxMessageNormal);
        }
        
        $(inboxGeneralMessage).show();
        if (typeof timeout === "undefined" || timeout !== 0) {
            $(inboxGeneralMessage).fadeOut(generalMessageFadeOutTime);
        }
    };
    
    /**
     * This will hide all the panes (the inbox, new reply, view message, etc..)
     */
    var hideAllPanes = function() {
        $(inboxPaneClass).hide();
    };
    
    /**
     * Will show the required pane and hide all the others.
     * @param {String} the Id of the pane you want to show
     */
    var showPane = function(pane) {
        //	We do a check to see if the pane isn't already visible
        //	Otherwise we get an annoying flicker.
        if (!$(pane).is(":visible")) {
            hideAllPanes();
            $(pane).show();
        }
    };
    
    /**
     * Check or uncheck all messages depending on the top checkbox.
     */
    var tickMessages = function() {
        $(inboxInboxCheckMessage).attr("checked", ($(inboxInboxCheckAll).is(':checked') ? 'checked' : ''));
    };
    
    /**
     * This will display the first page of the specified messages
     * @param {String} type The type of the messages (inbox, sent or trash or * for all of them)
     * @param {String} category The category of the messages (chat, invitation, ... or * for all of them)
     * @param {String} read Wether we should fetch messages that are read, unread or all of them. Option: true, false, all
     * @param {String} id The id of the filter that got clicked in the side panel.
     */
    var filterMessages = function(type, category, read, id) {
        $(inboxTableHeaderFromContent).text("From");
        
        //    The small header above the webpage
        $(inboxInboxHeader).hide();
        $(inboxID + "_" + type).show();        
        
        //    Remember the type and category we want to see.
        selectedType = type;
        selectedCategory = category;
        
        //	Display first page.
        getCount(read);
        
        //	show the inbox pane
        showPane(inboxPaneInbox);
        
        //	set the title bold
        $(inboxFilterClass).removeClass(inboxBold);
        $(id).addClass(inboxBold);
    };    
    
    /**
     * Removes all the messages out of the DOM.
     * It will also remove the preloader in the table.
     */
    var removeAllMessagesOutDOM = function() {
        $(inboxTableMessage).remove();
    };
    
    /**
     * This method will clear the input fields for the reply part of a specific message.
     * It will also hide the form again.
     */
    var clearInputFields = function() {        
        //	Clear all the input fields.
        $(inboxSpecificMessageComposeSubject + ", " + inboxSpecificMessageComposeBody).val('');
        
        //	Hide the reply form.
        $(inboxSpecificMessageCompose).hide();
    };
    
    
    ///////////////////////////
    //    RENDER MESSAGES    //
    ///////////////////////////
    
    
    //    TODO: Document properties.
    /**
     * Used for the date formatter.
     */
    var replaceChars = {
        date: new Date(),
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        
        // Day
        d: function() {
            return (replaceChars.date.getDate() < 10 ? '0' : '') + replaceChars.date.getDate();
        },
        D: function() {
            return replaceChars.shortDays[replaceChars.date.getDay()];
        },
        j: function() {
            return replaceChars.date.getDate();
        },
        l: function() {
            return replaceChars.longDays[replaceChars.date.getDay()];
        },
        N: function() {
            return replaceChars.date.getDay() + 1;
        },
        S: function() {
            return (replaceChars.date.getDate() % 10 === 1 && replaceChars.date.getDate() !== 11 ? 'st' : (replaceChars.date.getDate() % 10 === 2 && replaceChars.date.getDate() !== 12 ? 'nd' : (replaceChars.date.getDate() % 10 === 3 && replaceChars.date.getDate() !== 13 ? 'rd' : 'th')));
        },
        w: function() {
            return replaceChars.date.getDay();
        },
        z: function() {
            return "Not Yet Supported";
        },
        // Week
        W: function() {
            return "Not Yet Supported";
        },
        // Month
        F: function() {
            return replaceChars.longMonths[this.getMonth()];
        },
        m: function() {
            return (replaceChars.date.getMonth() < 11 ? '0' : '') + (replaceChars.date.getMonth() + 1);
        },
        M: function() {
            return replaceChars.shortMonths[replaceChars.date.getMonth()];
        },
        n: function() {
            return replaceChars.date.getMonth() + 1;
        },
        t: function() {
            return "Not Yet Supported";
        },
        // Year
        L: function() {
            return "Not Yet Supported";
        },
        o: function() {
            return "Not Supported";
        },
        Y: function() {
            return replaceChars.date.getFullYear();
        },
        y: function() {
            return ('' + replaceChars.date.getFullYear()).substr(2);
        },
        // Time
        a: function() {
            return replaceChars.date.getHours() < 12 ? 'am' : 'pm';
        },
        A: function() {
            return replaceChars.date.getHours() < 12 ? 'AM' : 'PM';
        },
        B: function() {
            return "Not Yet Supported";
        },
        g: function() {
            return replaceChars.date.getHours() % 12 || 12;
        },
        G: function() {
            return replaceChars.date.getHours();
        },
        h: function() {
            return ((replaceChars.date.getHours() % 12 || 12) < 10 ? '0' : '') + (replaceChars.date.getHours() % 12 || 12);
        },
        H: function() {
            return (replaceChars.date.getHours() < 10 ? '0' : '') + replaceChars.date.getHours();
        },
        i: function() {
            return (replaceChars.date.getMinutes() < 10 ? '0' : '') + replaceChars.date.getMinutes();
        },
        s: function() {
            return (replaceChars.date.getSeconds() < 10 ? '0' : '') + replaceChars.date.getSeconds();
        },
        // Timezone
        e: function() {
            return "Not Yet Supported";
        },
        I: function() {
            return "Not Supported";
        },
        O: function() {
            return (replaceChars.date.getTimezoneOffset() < 0 ? '-' : '+') + (replaceChars.date.getTimezoneOffset() / 60 < 10 ? '0' : '') + (replaceChars.date.getTimezoneOffset() / 60) + '00';
        },
        T: function() {
            return "Not Yet Supported";
        },
        Z: function() {
            return replaceChars.date.getTimezoneOffset() * 60;
        },
        // Full Date/Time
        c: function() {
            return "Not Yet Supported";
        },
        r: function() {
            return replaceChars.date.toString();
        },
        U: function() {
            return replaceChars.date.getTime() / 1000;
        }
    };
    
    
    /**
     * Format a date to a string.
     * See replaceChars for the specific options.
     * @param {Date} d
     * @param {String} format
     */
    var formatDate = function(d, format) {
        var returnStr = '';
        replaceChars.date = d;
        var replace = replaceChars;
        for (var i = 0; i < format.length; i++) {
            var curChar = format.charAt(i);
            if (replace[curChar]) {
                returnStr += replace[curChar].call(d);
            }
            else {
                returnStr += curChar;
            }
        }
        return returnStr;
    };
    
    /**
     * Adds the correct format to a message.
     * ex: parsing the date
     * @param {Object} message
     */
    var formatMessage = function(message) {
    
        var d = new Date(message.date);
        //Jan 22, 2009 10:25 PM
        message.date = formatDate(d, "M j, Y G:i A");
        
        if (!message.read) {
            message.read = false;
        }
        
        if (message.parts) {
            for (var i = 0; i < message.parts.length; i++) {
                message.parts[i] = formatMessage(message.parts[i]);
            }
        }        
        
        return message;
    };
    
    /**
     * Renders the messages.
     * @param {Object} The JSON response from the server. Make sure it has a .message array in it.
     */
    var renderMessages = function(response) {
         for (var i = 0; i < response.messages.length; i++) {
            //	temporary internal id.
            //	Use the name for the id.
            response.messages[i].id = response.messages[i].name;
            response.messages[i].nr = i;
            response.messages[i] = formatMessage(response.messages[i]);
        }
                        
        allMessages = response.messages;
                
        //	Show messages
        var tplData = {
            'messages': response.messages
        };
        
        //	remove previous messages
        removeAllMessagesOutDOM();
        
        //    Add them to the DOM
		$(inboxTable).children('tbody').append($.Template.render(inboxTableMessagesTemplate, tplData));
                                
        //	do checkboxes
        tickMessages();
    };
    
    /////////////////
    //    PAGER    //
    /////////////////
    
    /**
     * Show a certain page of messages.
     * @param {int} pageNumber The page number you want to display.
     */
    var showPage = function(pageNumber) {
        //    Remove all messages
        //    remove previous messages
        removeAllMessagesOutDOM();
        
        //    Set the pager
        pageMessages(pageNumber);
        
        //    Remember which page were on.
        currentPage = pageNumber - 1;
        
        //    Show set of messages
        getAllMessages();
    };
    
    /**
     * Draw up the pager at the bottom of the page.
     * @param {int} pageNumber The number of the current page
     */
    pageMessages = function(pageNumber) {
        $(inboxPager).pager({
            pagenumber: pageNumber,
            pagecount: Math.ceil(messagesForTypeCat / messagesPerPage),
            buttonClickCallback: showPage
        });
    };
       
    
    /////////////////////////
    //    JCR Functions    //
    /////////////////////////    
     
    
    /**
     * Gets all the messages from the JCR.
     */
    getAllMessages = function(callback) {
    
        var types = "&types=" + selectedType;
        if (typeof selectedType === "undefined" || selectedType === "") {
            types = "";
        }
        else if (typeof selectedType === "Array") {
            types = "&types=" + selectedType.join(",");
        }
        
        var cats = "&categories=" + selectedCategory;
        if (typeof selectedCategory === "undefined" || selectedCategory === "") {
            cats = "";
        }
        else if (typeof selectedCategory === "Array") {
            cats = "&categories=" + selectedCategory.join(",");
        }
        $.ajax({
            url: Config.URL.MESSAGES_MESSAGES_SERVICE + "?sort=" + sortBy + "&sortOrder=" + sortOrder + "&p=" + currentPage + "&n=" + messagesPerPage + types + cats,
			cache: false,
            success: function(data) {
                var json = $.evalJSON(data);
                if (json.response === "OK") {
                    if (json.messages) {
                        //    Render the messages
                        renderMessages(json);
                    }                    
                    
                    if (typeof callback !== "undefined") {
                        callback();
                    }
                }
                else {
                    showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text(), true);
                    $(inboxResults).html($(inboxGeneralMessagesErrorGeneral).text());
                }
            },
            error: function(status) {
                showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text(), true);
                $(inboxResults).html($(inboxGeneralMessagesErrorGeneral).text());
            }
        });
    };
    
    /**
     * Will do a count of all the unread messages and change the values in the DOM.
     * Note: This function will only check the nr of messages there are. It will not fetch them!
     */
    var showUnreadMessages = function() {
    
        var type = [Config.Messages.Types.inbox, Config.Messages.Types.inbox, Config.Messages.Types.inbox, Config.Messages.Types.inbox];
        var cats = [Config.Messages.Categories.message, Config.Messages.Categories.announcement, Config.Messages.Categories.chat, Config.Messages.Categories.invitation];
        var read = ["false", "false", "false", "false"];
        
        
        $.ajax({
            url: Config.URL.MESSAGES_COUNT_SERVICE + "?read=" + read.join(",") + "&types=" + type.join(",") + "&categories=" + cats.join(","),
			cache: false, 
            success: function(data) {
                var json = $.evalJSON(data);
                if (json.response === "OK") {
                    
                    //	Delete any previous ones.
                    $(inboxFilterNrMessages, inboxFolders).remove();
                    
                    var tpl = $(inboxGeneralMessagesNrNewMessages).html();
                    
                    if (json.count[0] !== 0) {
                        $(inboxFilterMessages).append(tpl.replace(/__NR__/gi, json.count[0]));
                    }
                    if (json.count[1] !== 0) {
                        $(inboxFilterAnnouncements).append(tpl.replace(/__NR__/gi, json.count[1]));
                    }
                    if (json.count[2] !== 0) {
                        $(inboxFilterChats).append(tpl.replace(/__NR__/gi, json.count[2]));
                    }
                    if (json.count[3] !== 0) {
                        $(inboxFilterInvitations).append(tpl.replace(/__NR__/gi, json.count[3]));
                    }
                }
            },
            error: function(data) {
                showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text(), true);
            }
        });
    };
    
    /**
     * This method will do a request to the messaging count service.
     * It will ask how many items there are for all the specified parameters.
     * It also takes in account the selectedtype and category. These come from module variables!
     * It will remove all messages in the dom, and start the request to fetch other ones.
     * 
     * @param {String} read all = all the message, true = the read messages, false = the unread messages. 
     *         (Comma seperated for every value you have in selectedtype and selectedcategory)
     */
    getCount = function(read) {
        //    Construct the URL.
        var types = "&types=" + selectedType;
        if (typeof selectedType === "undefined" || selectedType === "") {
            types = "&types=*";
        }
        else if (typeof selectedType === "Array") {
            types = "&types=" + selectedType.join(",");
        }
        
        var cats = "&categories=" + selectedCategory;
        if (typeof selectedCategory === "undefined" || selectedCategory === "") {
            cats = "&categories=*";
        }
        else if (typeof selectedCategory === "Array") {
            cats = "&categories=" + selectedCategory.join(",");
        }
		
        //	remove previous messages
        removeAllMessagesOutDOM();
		
        //	Show a preloader
        showLoader();
        
        $.ajax({
            url: Config.URL.MESSAGES_COUNT_SERVICE + "?read=" + read + types + cats,
            success: function(data) {
                var json = $.evalJSON(data);
                if (json.response === "OK") {
                    messagesForTypeCat = json.count[0];
                    if (json.count[0] === 0) {       
                        
                        json.messages = [];                 
                        renderMessages(json);
                        
                        //	Set the pager to page 1. The pager will be disabled because there is no data to page..
                        pageMessages(1);
                    }
                    else {
                        currentPage = 0;
                        showPage(currentPage + 1);
                    }
                }
            },
            error: function(data) {
                showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text(), true);
            }
        });
    };
    
    ////////////////////////////////////
    //    DISPLAY SPECIFIC MESSAGE    //
    ////////////////////////////////////
    
    
    /**
     * Get the message out of the list with the specific id.
     * @param {String} id    The id of a message
     */
    var getMessageWithId = function(id) {
        for (var i = 0; i < allMessages.length; i++) {
            if (allMessages[i].id === id) {
                return allMessages[i];
            }
        }
    };
    
    /**
     * Mark a message as read.
     * @param {Object} message The JSON object that represents the message.
     * @param {String} id The id for this message.
     */
    var markMessageRead = function(message, id) {
        var nodeNames = ["sakaijcr:messageRead"];
        var values = [true];
        var actions = ["r"];
        var items = [message.pathToMessage];
        
        var postParameters = {
            'name': nodeNames,
            "value": values,
            "action": actions,
            "item": items
        };
        //    To mark a message as read we do a request to the sdata functions.
        //    We use the Properties function to change the messageRead variable.
        $.ajax({
            type: "POST",
            url: Config.URL.SDATA_FUNCTION_PROPERTIES.replace(/__URL__/, message.pathToMessage),
            success: function(userdata) {
                allMessages[message.nr].read = true;
                //	mark the message in the inbox table as read.
                $(inboxTableSubject + id).addClass(inboxTablesubjectReadClass);
                $(inboxTableSubject + id).removeClass(inboxTablesubjectUnreadClass);
                
                //	Set the unread messages in the header.
                if ($.inArray(message.types,Config.Messages.Types.inbox) > -1) {
                    var unreadMessages = parseInt($(chatUnreadMessages).text(), 10);
                    $(chatUnreadMessages).text(unreadMessages - 1);
                }
                
                //	Edit the nr of messages
                var messId = inboxFilterMessages;
                if (message.category === Config.Messages.Categories.message) {
                    messId = inboxFilterMessages;
                }
                else if (message.category === Config.Messages.Categories.announcement) {
                    messId = inboxFilterAnnouncements;
                }
                else if (message.category === Config.Messages.Categories.chat) {
                    messId = inboxFilterChats;
                }
                else if (message.category === Config.Messages.Categories.invitation) {
                    messId = inboxFilterInvitations;
                }
                
                var nr = parseInt($(messId + " span").text().replace(/\(/gi, "").replace(/\)/gi, ""), 10);
                if ((nr - 1) === 0) {
                    //    If the number is 0 than we remove it.
                    $(messId + " span").remove();
                }
                else {
                    //    decrease the number by one.
                    $(messId + " span").text("(" + (nr - 1) + ")");
                }
            },
            error: function(status) {
                showGeneralMessage($(inboxGeneralMessagesErrorReadFail).text(), true);
            },
            data: postParameters
        });
    };
    
    /**
     * Displays only the message with that id.
     * @param {String} id    The id of a message
     */
    var displayMessage = function(id) {
		$(".message-options").show();
		$("#inbox_message_previous_messages").show();
		$("#inbox_message_replies").html("");
        showPane(inboxPaneMessage);
        var message = getMessageWithId(id);
        selectedMessage = message;
        if (typeof message !== "undefined") {
            //    Fill in this message values.
            $(inboxSpecificMessageSubject).text(message.subject);
            $(inboxSpecificMessageBody).html(message.bodyText.replace(/\n/gi, "<br />"));
            $(inboxSpecificMessageDate).text(message.date);
            $(inboxSpecificMessageFrom).text(message.userFrom.profile.firstName + ' ' + message.userFrom.profile.lastName);
            if (message.userFrom.profile.picture) {
                $(inboxSpecificMessagePicture).attr('src', Config.URL.SDATA_FETCH_PRIVATE_URL + "/" + message.userFrom.userStoragePrefix + message.userFrom.profile.picture._name);
            }
            else {
                $(inboxSpecificMessagePicture).attr('src', Config.URL.PERSON_ICON_URL);
            }
            
            //    Reply part.
            $(inboxSpecificMessageComposeSubject).val('Re: ' + message.subject);
            
            
            //    This message has some replies attached to it.           
            if (message.parts) {
                $(inboxSpecificMessagePreviousMessages).show();
                var replieshtml = "";
                var replies = {};
                //    We render the chat replies slightly differently.
                if (message.category === Config.Messages.Categories.chat) {
                    replies = {
                        "replies": message.parts
                    };
					$(".message-options").hide();
					$("#inbox_message_previous_messages").hide();
                    replieshtml += $.Template.render(inboxSpecificMessageRepliesTemplateChats, replies);
                    
                }
                else {
                    for (var i = 0; i < message.parts.length; i++) {
                        replies = {
                            "reply": message.parts[i]
                        };
                        replieshtml += $.Template.render(inboxSpecificMessageRepliesTemplate, replies);
                    }
                }
                $(inboxSpecificMessageReplies).html(replieshtml);
            }
            else {
                //    There are no replies hide the header that states 'Previous messages'.
                $(inboxSpecificMessagePreviousMessages).hide();
            }
            
            if (!message.read) {
                //    We haven't read this message yet. Mark it as read.
                markMessageRead(message, id);
            }
        }
        
    };
    
    ////////////////////////
    //    SEND MESSAGE    //
    ////////////////////////
    
    
    /**
     * When a message has been sent this function gets called.
     * @param {Object} data	A JSON object that contains the response from the server.
     */
    var sendMessageFinished = function(data) {
        if (data.response === "OK") {
            showGeneralMessage($(inboxGeneralMessagesSent).text(), false, 5000);
            
            clearInputFields();
            
            //	Show the sent inbox pane.
            filterMessages(Config.Messages.Types.sent, '', "all", inboxFilterSent);            
            $(inboxTableHeaderFromContent).text("To");
        }
        else {
            showGeneralMessage($(inboxGeneralMessagesSendFailed).text(), true);
        }
    };
    
    
    /**
     *
     * @param {Array} to	Array with the uuids of the users to post a message to.
     * @param {String} subject    The subject for this message.
     * @param {String} body    The text that this message will contain.
     */
    var sendMessage = function(to, subject, body, category, reply) {
        //	Construct the message.
        var openSocialMessage = new opensocial.Message(body, {
            "title": subject,
            "type": Config.Messages.Categories.message
        });
        var toSend = {
            "to": to,
            "message": $.toJSON(openSocialMessage)
        };
        
        if (typeof reply !== "undefined" && reply !== "") {
            toSend.reply = reply;
        }
        $.ajax({
            url: Config.URL.MESSAGES_SEND_SERVICE,
            type: "POST",
            success: function(data) {
                var json = $.evalJSON(data);                
                sendMessageFinished(json);
            },
            error: function(status) {
                showGeneralMessage($(inboxGeneralMessagesSendFailed).text(), true);
            },
            data: toSend
        });
    };
    
    
    
    ////////////////////////////
    //    Delete a message    //
    ////////////////////////////
    
    
    
    /**
     * Removes all the messages from memory that are in pathToMessages if success = true
     * success = false will show an error.
     * @param {String[]} pathToMessages
     * @param {Boolean} success
     */
    var deleteMessagesFinished = function(pathToMessages, success) {
        if (success) {
            //	pathToMessages[i] = "/_userprivate/DE/C2/c663d46a368c04608caf5f50697d668deeb4ad33/messages/2009/04/ee8f9453badb024a1703542ee32d5ed760d2687d"
            //	Final part is the id of our message.
            for (var i = 0; i < pathToMessages.length; i++) {
                var id = pathToMessages[i].substring(pathToMessages[i].lastIndexOf("/") + 1, pathToMessages[i].length);
                //	Delete the row in the inbox
                $(inboxTableMessageID + id).remove();
                
                //	Remove the message from memory.
                var message = getMessageWithId(id);
                
                //    This message hasn't been read yet.
                if (!message.read) {
                    showUnreadMessages();
                }
                
                allMessages.splice(allMessages.indexOf(message), 1);
            }
            //    Reset the counter.
            messagesForTypeCat -= pathToMessages.length;
            
            //	Repage the inbox
            showPage(currentPage);
            
            showGeneralMessage($(inboxGeneralMessagesDeleted).text(), false, 5000);
        }
        else {
            showGeneralMessage($(inboxGeneralMessagesDeletedFailed).text(), true);
        }
    };
    
    /**
     * This will do a DELETE request to the specified path and harddelete that message.
     * @param {String[]} path The message that you want to delete.
     * @param {int} index The index of the array that needs to be deleted.
     */
    var hardDeleteMessage = function(pathToMessages, index) {
        $.ajax({
            url: "/sdata/f/" + pathToMessages[index],
            type: "DELETE",
            success: function(data) {
                if (index === (pathToMessages.length - 1)) {
                    //    This was the last delete.
                    //    Although it is not sure this will be the last request that we handle, we assume it is.
                    deleteMessagesFinished(pathToMessages, true);
                }
            },
            error: function(status) {
                if (index === (pathToMessages.length - 1)) {
                    //    This was the last delete.
                    //    Although it is not sure this will be the last request that we handle, we assume it is.
                    deleteMessagesFinished(pathToMessages, false);
                }
            }
        });
    };
    
    /**
     * Delete all the messages that are in ids
     * @param {Array} ids	An array of ids that have to be deleted.
     */
    var deleteMessages = function(pathToMessages, hardDelete) {
        if (typeof hardDelete === "undefined") {
            hardDelete = false;
        }
        if (hardDelete) {
            //	We will have to do a hard delete to all the JCR files.
            for (var i = 0; i < pathToMessages.length; i++) {
                hardDeleteMessage(pathToMessages, i);
            }
        }
        else {
            var postParameters = {
                'messages': pathToMessages
            };
            $.ajax({
                url: Config.URL.MESSAGES_DELETE_SERVICE,
                type: "POST",
                success: function(data) {
                    var json = $.evalJSON(data);
                    if (json.response === "OK") {
                        deleteMessagesFinished(pathToMessages, true);
                    }
                    else {
                        deleteMessagesFinished(pathToMessages, false);
                    }
                },
                error: function(status) {
                    deleteMessagesFinished(pathToMessages, false);
                },
                data: postParameters
            });
        }
    };
    
    
    //////////////////////////
    //	Event handling		//
    //////////////////////////
    
    
    
    //	Compose a new message.
    $(inboxComposeNew).click(function() {
        //	show the selector
        $(inboxComposeNewPanel).toggle();
    });
    $(inboxComposeMessage).click(function() {
		showPane(inboxPaneCompose);
        
        //	initialise the sendmessage widget
        //	we tell it to show it in our id and NOT as a layover.
        sakai.sendmessage.initialise(null, true, inboxComposeNewContainer, sendMessageFinished);
    });
    
    //    This is the widget id!
    $(inboxComposeCancel).live("click", function() {
        //	Jump back to inbox
        showPane(inboxPaneInbox);
    });
    
    
    //	*****************************
    //	Show a specific message
    
    $(inboxInboxMessage).live("click", function(e, ui) {
        var id = e.target.id;
        id = id.split('_');
        displayMessage(id[id.length - 1]);
    });
    
    /*	Filter the messages. */
   
    $(inboxFilterMessages).click(function() {
        filterMessages(Config.Messages.Types.inbox, Config.Messages.Categories.message, "all", inboxFilterMessages);
    });
    $(inboxFilterAnnouncements).click(function() {
        filterMessages(Config.Messages.Types.inbox, Config.Messages.Categories.announcement, "all", inboxFilterAnnouncements);
    });
    $(inboxFilterChats).click(function() {
        filterMessages(Config.Messages.Types.inbox, Config.Messages.Categories.chat, "all", inboxFilterChats);
    });
    $(inboxFilterInvitations).click(function() {
        filterMessages(Config.Messages.Types.inbox, Config.Messages.Categories.invitation, "all", inboxFilterInvitations);
    });
    $(inboxFilterInbox).click(function() {
        filterMessages(Config.Messages.Types.inbox, '', "all", inboxFilterInbox);
    });
    
    $(inboxFilterSent).click(function() {        
        filterMessages(Config.Messages.Types.sent, '', "all", inboxFilterSent);
        
        //	Change header to 'to' instead of 'from'
        $(inboxTableHeaderFromContent).text("To");
    });
    
    $(inboxFilterTrash).click(function() {
        filterMessages(Config.Messages.Types.trash, '', "all", inboxFilterTrash);
        $(inboxTableHeaderFromContent).text("From/To");
    });
    
    
    
    
    //	Check all message
    $(inboxInboxCheckAll).change(function() {
        tickMessages();
    });
    $(inboxInboxDelete).click(function() {
        //	Delete all checked messages
        var pathToMessages = [];
        $(inboxInboxCheckMessage + ":checked").each(function() {
            var pathToMessage = $(this).val();
            pathToMessages.push(pathToMessage);
        });
        
        //	If we are in trash we hard delete the messages
        deleteMessages(pathToMessages, (selectedType === Config.Messages.Types.trash));
        
    });
    
    
    //	Sorters for the inbox.
    $(inboxTableHeaderSort).bind("mouseenter", function() {
        if (sortOrder === 'descending') {
            $(this).append($(inboxInboxSortUp).html());
        }
        else {
            $(this).append($(inboxInboxSortDown).html());
        }
    });
    $(inboxTableHeaderSort).bind("mouseout", function() {
        $(inboxTable + " " + inboxArrow).remove();
    });
    $(inboxTableHeaderSort).bind("click", function() {
        sortBy = $(this).attr('id').replace(/inbox_tableHeader_/gi, '');
        sortOrder = (sortOrder === 'descending') ? 'ascending' : 'descending';
        
        getAllMessages();
    });
    
    
    
    
    
    
    //	Specific message
    //	**********************************
    
    $(inboxSpecificMessageBackToInbox).click(function() {
        //    Show the inbox.
        showPane(inboxPaneInbox);
        
        //	Clear all the input fields
        clearInputFields();
    });
    
    $(inboxSpecificMessageOptionReply).click(function() {
        $(inboxSpecificMessageCompose).show();
        scrollTo($(inboxSpecificMessageCompose));
    });
    
    $(inboxSpecificMessageOptionDelete).click(function() {
        var harddelete = false;
        if ($.inArray(selectedMessage.types, "trash") > -1) {
            //	This is a trashed message, hard delete it.
            harddelete = true;
        }
        //	Delete the message
        deleteMessages([selectedMessage.pathToMessage], harddelete);
        
        //	Show the inbox
        showPane(inboxPaneInbox);
        
        //	Clear all the input fields
        clearInputFields();
    });
    
    $(inboxSpecificMessageComposeCancel).click(function() {
        //	Clear all the input fields
        clearInputFields();
    });
    
    $(inboxSpecificMessageComposeSend).click(function() {
        //	we want to send a message.
        var subject = $(inboxSpecificMessageComposeSubject).val();
        var body = $(inboxSpecificMessageComposeBody).val();
        sendMessage([selectedMessage.from], subject, body, Config.Messages.Categories.message, selectedMessage.pathToMessage);
        
        //	Clear all the input fields
        clearInputFields();
    });
    
    
    ///////////////////////////////////
    //    INITIALISATION FUNCTION    //
    ///////////////////////////////////
    
    
    var doInit = function() {
        //    Check if we are logged in our out.
        var uuid = sdata.me.user.userid;
		if (!uuid || uuid === "anon") {
			redirectToLoginPage();
		}
		else {
            //    We are logged in. Do all the nescecary stuff.
            //	load the list of messages.
            getCount("all");
            showUnreadMessages();
		}
        
    };
    
    doInit();   
};

sdata.container.registerForLoad("sakai.inbox");