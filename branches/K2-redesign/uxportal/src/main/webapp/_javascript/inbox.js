var sakai = sakai ||
{};
var $ = $ ||
function(){
    throw "JQuery undefined";
};
var jQuery = jQuery ||
function(){
    throw "JQuery undefined";
};
var sdata = sdata ||
function(){
    throw "SDATA undefined";
};
var json_parse = json_parse ||
function(){
    throw "json_parse undefined";
};

sakai.inbox = function(){
    var messagesPerPage = 5; //	The number of messages per page.
    var allMessages = []; //	Array that will hold all the messages.
    var messages = []; //	Array that will hold the messages that have to be displayed (include the paged ones!).
    //	Type of messages.
    var CATEGORIES = {
        'message': 'Message',
        'announcement': 'Announcement',
        'chat': 'Chat',
        'invitation': 'Invitation'
    };
    var TYPES = {
        'inbox': 'inbox',
        'sent': 'sent',
        'trash': 'trash'
    };
    var me = sdata.me;
    var allFriends = [];
    var selectedFriendsToPostTo = [];
    var selectedEmailsToPostTo = [];
    var generalMessageFadeOutTime = 5000; //	The amount of time it takes till the general message box fades out
    var selectedMessage = {}; //	The current message
    var selectedType = 'inbox';
    var selectedCategory = "";
    var sortOrder = "descending";
    var sortBy = "date";
    var currentPage = 0;
    var messagesForTypeCat; //		The number of messages for this type/cat.
    /** 
     * Scroll to a specific element in a page
     * @param {Object} element The element you want to scroll to
     */
    var scrollTo = function(element){
        $('html, body').animate({
            scrollTop: element.offset().top
        }, 1);
    };
    
    /**
     * Will fetch all the friends of this user.
     */
    var getAllFriends = function(){
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/friend/status",
            onSuccess: function(data){
                var json = json_parse(data);
                if (json.response === "OK") {
                    json = json.status;
                    allFriends = [];
                    if (json.friends) {
                        var searchArray = [];
                        for (var i = 0; i < json.friends.length; i++) {
                            //	We only want accepted friends.
                            if (json.friends[i].status.toUpperCase() === "ACCEPTED") {
                            
                                //	add it too the array.
                                allFriends.push(json.friends[i]);
                            }
                        }
                        //	for the result matching see lower end of doc.
                        
                        $("#inbox_compose_to").autocomplete(allFriends, {
                            minChars: 1,
                            matchContains: true,
                            multiple: true,
                            width: 490,
                            bindTo: "#inbox_compose_to_container",
                            
                            formatMatch: function(row){
                                return row.profile.firstName + ' ' + row.profile.lastName;
                            },
                            
                            formatItem: function(row){
                                var s = '<img src="_images/profile_icon.png" alt="" width="24" height="24" /> ';
                                if (row.profile.picture) {
                                    s = '<img src="/sdata/f/_private' + row.properties.userStoragePrefix + row.profile.picture.name + '" alt="" width="24" height="24" /> ';
                                }
                                return s + row.profile.firstName + ' ' + row.profile.lastName;
                            }
                        });
                        
                    }
                }
                else {
                    showGeneralMessage("Failed to retrieve your friends.", true);
                }
                
                
            },
            onFail: function(status){
                showGeneralMessage("Failed to retrieve your friends.", true);
            }
        });
    };
    
    
    /**
     * Gets all the messages from the JCR.
     */
    var getAllMessages = function(callback){
    
        var types = "&types=" + selectedType;
        if (typeof selectedType === "undefined" || selectedType === "") {
            types = "";
        }
        else 
            if (typeof selectedType === "Array") {
                types = "&types=" + selectedType.join(",");
            }
        
        var cats = "&categories=" + selectedCategory;
        if (typeof selectedCategory === "undefined" || selectedCategory === "") {
            cats = "";
        }
        else 
            if (typeof selectedCategory === "Array") {
                cats = "&categories=" + selectedCategory.join(",");
            }
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/_rest/messages/messages?sort=" + sortBy + "&sortOrder=" + sortOrder + "&p=" + currentPage + "&n=" + messagesPerPage + types + cats + "&cacheid=" + Math.random(),
            onSuccess: function(data){
                var json = json_parse(data);
                if (json.response == "OK") {
                    if (json.messages) {
                        for (var i = 0; i < json.messages.length; i++) {
                        
                            //	temporary internal id.
                            //	Use the name for the id.
                            json.messages[i].id = json.messages[i].name;
                            json.messages[i].nr = i;
                            json.messages[i] = formatMessage(json.messages[i]);
                        }
                        
                        allMessages = json.messages;
                        messages = json.messages;
                        
                        //	Show messages
                        var tplData = {
                            'messages': messages
                        };
                        //	remove previous messages
                        $(".inbox_message").remove();
                        //	show new messages.
                        $("#inbox_table").children('tbody').append(sdata.html.Template.render('inbox_messageTemplate', tplData));
                        
                        //	do checkboxes
                        tickMessages();
                        
                        
                        //	Add events
                        //	Show a specific message
                        $(".inbox_inbox_message").live("click", function(){
                            var id = $(this).attr('id').replace(/inbox_inbox_message_/, '');
                            displayMessage(id);
                        });
                    }
                    
                    
                    if (typeof callback != "undefined") {
                        callback();
                    }
                }
                else {
                    showGeneralMessage("<b>An error has occurred.</b> Please try again later.", true);
                    $("#inbox_results").html("<b>An error has occurred.</b> Please try again later.");
                }
            },
            onFail: function(status){
                showGeneralMessage("<b>An error has occurred.</b> Please try again later.", true);
                $("#inbox_results").html("<b>An error has occurred.</b> Please try again later.");
            }
        });
    };
    
    var getCount = function(read){
        var types = "&types=" + selectedType;
        if (typeof selectedType === "undefined" || selectedType === "") {
            types = "&types=*";
        }
        else 
            if (typeof selectedType === "Array") {
                types = "&types=" + selectedType.join(",");
            }
        
        var cats = "&categories=" + selectedCategory;
        if (typeof selectedCategory === "undefined" || selectedCategory === "") {
            cats = "&categories=*";
        }
        else 
            if (typeof selectedCategory === "Array") {
                cats = "&categories=" + selectedCategory.join(",");
            }
        
        //	remove previous messages
        $(".inbox_message").remove();
		//	Show a preloader
		showLoader();
		
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/_rest/messages/count?read=" + read + types + cats,
            onSuccess: function(data){
                var json = json_parse(data);
                if (json.response === "OK") {
                    if (json.count[0] === 0) {
						//	remove preloader
        				$(".inbox_message").remove();
						
                        //	There are no messages
                        var tplData = {
                            'messages': []
                        };
                        //	show new messages.
                        $("#inbox_table").append(sdata.html.Template.render('inbox_messageTemplate', tplData));
                    }
                    else {
                        messagesForTypeCat = json.count[0];
                        currentPage = 0;
                        showPage(currentPage + 1);
                    }
                }
            },
            onFail: function(data){
                console.log("Count failed.");
            }
        });
    };
    
    var showLoader = function(){
        $("#inbox_table").append('<tr class="inbox_message"><td colspan="5" style="text-align:center;"><img src="_images/ajax-loader-gray.gif" alt="Loading, please hold on." /></td></tr>');
    };
    
    //	TODO: Document properties.
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
        d: function(){
            return (replaceChars.date.getDate() < 10 ? '0' : '') + replaceChars.date.getDate();
        },
        D: function(){
            return replaceChars.shortDays[replaceChars.date.getDay()];
        },
        j: function(){
            return replaceChars.date.getDate();
        },
        l: function(){
            return replaceChars.longDays[replaceChars.date.getDay()];
        },
        N: function(){
            return replaceChars.date.getDay() + 1;
        },
        S: function(){
            return (replaceChars.date.getDate() % 10 == 1 && replaceChars.date.getDate() != 11 ? 'st' : (replaceChars.date.getDate() % 10 == 2 && replaceChars.date.getDate() != 12 ? 'nd' : (replaceChars.date.getDate() % 10 == 3 && replaceChars.date.getDate() != 13 ? 'rd' : 'th')));
        },
        w: function(){
            return replaceChars.date.getDay();
        },
        z: function(){
            return "Not Yet Supported";
        },
        // Week
        W: function(){
            return "Not Yet Supported";
        },
        // Month
        F: function(){
            return replaceChars.longMonths[this.getMonth()];
        },
        m: function(){
            return (replaceChars.date.getMonth() < 11 ? '0' : '') + (replaceChars.date.getMonth() + 1);
        },
        M: function(){
            return replaceChars.shortMonths[replaceChars.date.getMonth()];
        },
        n: function(){
            return replaceChars.date.getMonth() + 1;
        },
        t: function(){
            return "Not Yet Supported";
        },
        // Year
        L: function(){
            return "Not Yet Supported";
        },
        o: function(){
            return "Not Supported";
        },
        Y: function(){
            return replaceChars.date.getFullYear();
        },
        y: function(){
            return ('' + replaceChars.date.getFullYear()).substr(2);
        },
        // Time
        a: function(){
            return replaceChars.date.getHours() < 12 ? 'am' : 'pm';
        },
        A: function(){
            return replaceChars.date.getHours() < 12 ? 'AM' : 'PM';
        },
        B: function(){
            return "Not Yet Supported";
        },
        g: function(){
            return replaceChars.date.getHours() % 12 || 12;
        },
        G: function(){
            return replaceChars.date.getHours();
        },
        h: function(){
            return ((replaceChars.date.getHours() % 12 || 12) < 10 ? '0' : '') + (replaceChars.date.getHours() % 12 || 12);
        },
        H: function(){
            return (replaceChars.date.getHours() < 10 ? '0' : '') + replaceChars.date.getHours();
        },
        i: function(){
            return (replaceChars.date.getMinutes() < 10 ? '0' : '') + replaceChars.date.getMinutes();
        },
        s: function(){
            return (replaceChars.date.getSeconds() < 10 ? '0' : '') + replaceChars.date.getSeconds();
        },
        // Timezone
        e: function(){
            return "Not Yet Supported";
        },
        I: function(){
            return "Not Supported";
        },
        O: function(){
            return (replaceChars.date.getTimezoneOffset() < 0 ? '-' : '+') + (replaceChars.date.getTimezoneOffset() / 60 < 10 ? '0' : '') + (replaceChars.date.getTimezoneOffset() / 60) + '00';
        },
        T: function(){
            return "Not Yet Supported";
        },
        Z: function(){
            return replaceChars.date.getTimezoneOffset() * 60;
        },
        // Full Date/Time
        c: function(){
            return "Not Yet Supported";
        },
        r: function(){
            return replaceChars.date.toString();
        },
        U: function(){
            return replaceChars.date.getTime() / 1000;
        }
    };
    
    
    /**
     * Format a date to a string.
     * See replaceChars for the specific options.
     * @param {Object} d
     * @param {Object} format
     */
    var formatDate = function(d, format){
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
    var formatMessage = function(message){
    
        var d = new Date(message.date);
        //Jan 22, 2009 10:25 PM
        message.date = formatDate(d, "M j, Y G:i A");
        
        if (!message.read) {
            message.read = false;
        }
        
        if (message.parts) {
            message.parts[0] = formatMessage(message.parts[0]);
        }
        
        
        return message;
    };
    
    /**
     * Draw up the pager at the bottom of the page.
     * @param {Object} clickedNumber
     */
    var pageMessages = function(pageNumber){
        $("#inbox_pager").pager({
            pagenumber: pageNumber,
            pagecount: Math.ceil(messagesForTypeCat / messagesPerPage),
            buttonClickCallback: showPage
        });
    };
    
    var showPage = function(pageNumber){
        //	Remove all messages
        //	remove previous messages
        $(".inbox_message").remove();
        
        pageMessages(pageNumber);
        
        currentPage = pageNumber - 1;
        
        //	Show next set of messages
        getAllMessages();
    };
    
    /**
     * Get the message out of the list with the specific id.
     * @param {Object} id
     */
    var getMessageWithId = function(id){
        for (var i = 0; i < allMessages.length; i++) {
            if (allMessages[i].id === id) {
                return allMessages[i];
            }
        }
    };
    
    /**
     * Displays only the message with that id.
     * @param {Object} id
     */
    var displayMessage = function(id){
        showPane("#inbox_pane_message");
        var message = getMessageWithId(id);
        selectedMessage = message;
        if (typeof message !== "undefined") {
            $("#inbox_message_subject").text(message.subject);
            $("#inbox_message_body").text(message.bodyText.replace(/\n/gi, "<br />"));
            $("#inbox_message_date").text(message.date);
            $("#inbox_message_from").text(message.userFrom.profile.firstName + ' ' + message.userFrom.profile.lastName);
            
            
            $("#inbox_message_compose_subject").val('Re: ' + message.subject);
            
            
            if (message.userFrom.profile.picture) {
                $("#inbox_message_picture").attr('src', "/sdata/f/_private/" + message.userFrom.userStoragePrefix + message.userFrom.profile.picture._name);
            }
            else {
                $("#inbox_message_picture").attr('src', '_images/profile_picture.gif');
            }
            
            if (message.parts) {
                var replies = {
                    "reply": message.parts[0]
                };
                $("#inbox_compose_replies").html(sdata.html.Template.render('inbox_compose_replies_template', replies));
            }
            
            if (!message.read) {
                //	If this message is unread, then do a request to mark it read.
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
                sdata.Ajax.request({
                    httpMethod: "POST",
                    url: "/sdata/f" + message.pathToMessage + "?f=pr",
                    onSuccess: function(userdata){
                        var json = json_parse(userdata);
                        allMessages[message.nr].read = true;
                        //	mark the message in the list as read
                        $("#inbox_inbox_subject_" + id).addClass('inbox-subject-read');
                        $("#inbox_inbox_subject_" + id).removeClass('inbox-subject-unread');
						
						//	Set the unread messages in the header.
						if (message.types.contains(TYPES.inbox)) {
							var i = $("#chat_unreadMessages").text();
							$("#chat_unreadMessages").text(i-1);
						}
						
                        //	Edit the nr of messages
						var messId = "#inbox_filter_messages";
						if (message.category === CATEGORIES.message) {
							messId = "#inbox_filter_messages";
						}
						else if (message.category === CATEGORIES.announcement) {
							messId = "#inbox_filter_announcements";
						}
						else if (message.category === CATEGORIES.chat) {
							messId = "#inbox_filter_chats";
						}
						else if (message.category === CATEGORIES.invitation) {
							messId = "#inbox_filter_invitations";
						}
						var i = parseInt($(messId + " span").text().replace(/\(/gi,"").replace(/\)/gi,""), 10);
						if ((i-1) === 0) {
							$(messId + " span").remove();
						}
						else {
							$(messId + " span").text("(" + (i-1) + ")");
						}
                    },
                    onFail: function(status){
                        showGeneralMessage("Failed to mark this message as read.", true);
                    },
                    postData: postParameters,
                    contentType: "application/x-www-form-urlencoded"
                });
            }
        }
        
    };    
    
    /**
     * Check or uncheck all messages depending on the top checkbox.
     */
    var tickMessages = function(){
        $('.inbox_inbox_check_message').attr("checked", ($('#inbox_checkAll').is(':checked') ? 'checked' : ''));
    };
    
    /**
     * Will do a count of all the unread messages and change the values in the DOM.
     */
    var showUnreadMessages = function(){
        
		var type = [TYPES.inbox, TYPES.inbox, TYPES.inbox, TYPES.inbox];
		var cats = [CATEGORIES.message, CATEGORIES.announcement, CATEGORIES.chat, CATEGORIES.invitation];
		var read = ["false","false","false","false"];
	
		
		
		sdata.Ajax.request({
            httpMethod: "GET",
            url: "/_rest/messages/count?read=" + read.join(",") + "&types=" + type.join(",") + "&categories=" + cats.join(","),
            onSuccess: function(data){
                var json = json_parse(data);
                if (json.response === "OK") {
                    //	Delete any previous ones.
			        $(".inbox_newMessage").remove();
			        
			        if (json.count[0] !== 0) {
			            $("#inbox_filter_messages").append(' <span style="font-weight:bold;" class="inbox_newMessage">(' + json.count[0] + ')</span>');
			        }
			        if (json.count[1] !== 0) {
			            $("#inbox_filter_announcements").append(' <span style="font-weight:bold;" class="inbox_newMessage">(' + json.count[1] + ')</span>');
			        }
			        if (json.count[2] !== 0) {
			            $("#inbox_filter_chats").append(' <span style="font-weight:bold;" class="inbox_newMessage">(' + json.count[2] + ')</span>');
			        }
			        if (json.count[3] !== 0) {
			            $("#inbox_filter_invitations").append(' <span style="font-weight:bold;" class="inbox_newMessage">(' + json.count[3] + ')</span>');
			        }
                }
            },
            onFail: function(data){
                console.log("Count failed.");
            }
        });
    };
    
    
    /**
     *
     * @param {Array} to	Array with the uuids of the users to post a message to.
     * @param {String} subject
     * @param {String} body
     */
    var sendMessage = function(to, subject, body, category, reply){
        var fields = {
            "TITLE": subject,
            "TYPE": category,
            "BODY": body
        };
        var message = sdata.JSON.stringify({
            "fields_": fields
        });
        
        var postParameters = {
            'to': to,
            'message': message
        };
        if (typeof reply !== "undefined" && reply !== "") {
            postParameters.reply = reply;
        }
        sdata.Ajax.request({
            url: "/_rest/messages/send",
            httpMethod: "POST",
            onSuccess: function(data){
                var json = json_parse(data);
                
                sendMessageFinished(json);
            },
            onFail: function(status){
                showGeneralMessage("Unable to send message.", true);
            },
            postData: postParameters,
            contentType: "application/x-www-form-urlencoded"
        });
    };
    
    
    /**
     * When a message has been sent this function gets called.
     * @param {Object} data	A JSON object that contains the response from the server.
     */
    var sendMessageFinished = function(data){
        if (data.response == "OK") {
            showGeneralMessage("Your message has been sent.", false, 5000);
            
            //	Clear the input boxes
            $("#inbox_compose_to, #inbox_compose_subject, #inbox_compose_body").val('');
            $(".inbox_compose_to_result").remove();
            selectedFriendsToPostTo = [];
			//	Show the sent part
			filterMessages(TYPES.sent, '', "all", "#inbox_filter_sent");
        }
        else {
            showGeneralMessage("Something went wrong trying to send your message.", true);
        }
    };
    
    
    /**
     * Delete all the messages that are in ids
     * @param {Array} ids	An array of ids that have to be deleted.
     */
    var deleteMessages = function(pathToMessages, hardDelete){
        if (typeof hardDelete === "undefined") {
            hardDelete = false;
        }
        if (hardDelete) {
            //	We will have to do a hard delete to all the JCR files.
            for (var i = 0; i < pathToMessages.length; i++) {
                sdata.Ajax.request({
                    url: "/sdata/f/" + pathToMessages[i],
                    httpMethod: "DELETE",
                    onSuccess: function(data){
                        deleteMessagesFinished(pathToMessages, true);
                    },
                    onFail: function(status){
                        deleteMessagesFinished(pathToMessages, false);
                    }
                });
            }
        }
        else {
            var postParameters = {
                'messages': pathToMessages
            };
            sdata.Ajax.request({
                url: "/_rest/messages/delete",
                httpMethod: "POST",
                onSuccess: function(data){
                    var json = json_parse(data);
                    if (json.response === "OK") {
                        deleteMessagesFinished(pathToMessages, true);
                    }
                    else {
                        deleteMessagesFinished(pathToMessages, false);
                    }
                },
                onFail: function(status){
                    deleteMessagesFinished(pathToMessages, false);
                },
                postData: postParameters,
                contentType: "application/x-www-form-urlencoded"
            });
        }
    };
    
    /**
     * Removes all the messages from memory that are in pathToMessages if success = true
     * success = false will show an error.
     * @param {Object} pathToMessages
     * @param {Object} success
     */
    var deleteMessagesFinished = function(pathToMessages, success){
        if (success) {
            //	pathToMessages[i] = "/_userprivate/DE/C2/c663d46a368c04608caf5f50697d668deeb4ad33/messages/2009/04/ee8f9453badb024a1703542ee32d5ed760d2687d"
            //	Final part is the id of our message.
            for (var i = 0; i < pathToMessages.length; i++) {
                var id = pathToMessages[i].substring(pathToMessages[i].lastIndexOf("/") + 1, pathToMessages[i].length);
                //	Delete the row in the inbox
                $("#inbox_message_" + id).remove();
                //	Remove the message from memory.
                var message = getMessageWithId(id);
                allMessages.splice(message, 1);
                messages.splice(message, 1);
            }
            //	Repage the inbox
            pageMessages(currentPage);
            
            showGeneralMessage("The message(s) has/have been deleted.", false, 5000);
        }
        else {
            showGeneralMessage("Unable to delete message(s).", true);
        }
    };
    
    
    
    
    
    
    /**
     * Shows a general message on the top screen
     * @param {String} msg	the message you want to display
     * @param {Boolean} isError	true for error (red block)/false for normal message(green block)
     * @param {Number} timeoutthe amout of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(msg, isError, timeout){
        $("#inbox_general_message").html(msg);
        if (isError) {
            $("#inbox_general_message").addClass('inbox_error_message');
            $("#inbox_general_message").removeClass('inbox_normal_message');
        }
        else {
            $("#inbox_general_message").removeClass('inbox_error_message');
            $("#inbox_general_message").addClass('inbox_normal_message');
        }
        if (typeof timeout === "undefined" || timeout !== 0) {
            $("#inbox_general_message").fadeOut(generalMessageFadeOutTime);
        }
        else {
            $("#inbox_general_message").show();
        }
    };
    
    /**
     * This will hide all the panes (the inbox, new reply, view message, etc..)
     */
    var hideAllPanes = function(){
        $(".inbox_pane").hide();
    };
    /**
     * Will show the required pane and hide all the others.
     * @param {Object} the Id of the pane you want to show
     */
    var showPane = function(pane){
        //	We do a check to see if the pane isn't already visible
        //	Otherwise we get an annoying flicker.
        if (!$(pane).is(":visible")) {
            hideAllPanes();
            $(pane).show();
        }
    };
    var createToBox = function(name, uid, IsFriend){
        //	Create box
        var box = '<span class="inbox_compose_to_result" id="inbox_compose_to_result_' + uid.replace(/@|\./gi, '') + '">' + name;
        box += ' <img src="/dev/img/m2-header3-up.png" alt="X" width="15" height="15" ';
        box += 'onmouseover="this.src=\'/dev/img/m2-header4-up.png\'" ';
        box += 'onmouseout="this.src=\'/dev/img/m2-header3-up.png\'" ';
        box += 'id="' + uid + '" /></span>';
        
        //	Add it too the DOM tree.
        $("#inbox_compose_to").before(box);
        
        //	Add some nice corners
        jQuery("#inbox_compose_to_result_" + uid.replace(/@|\./gi, '')).corners();
        
        //	Clear the input box
        $("#inbox_compose_to").val('');
        
        if (IsFriend) {
            //	This is a friend
            
            //	add it too the selected list.
            selectedFriendsToPostTo.push(uid);
            //	If we delete a user
            $("#inbox_compose_to_result_" + uid + " img").click(function(){
                selectedFriendsToPostTo.splice($(this).attr('id'), 1);
                $(this).parent().remove();
            });
        }
        else {
            //	This is an email
            
            //	add it too the selected list.
            selectedEmailsToPostTo.push(uid);
            //	If we delete a user
            $("#inbox_compose_to_result_" + uid.replace(/@|\./gi, '') + " img").click(function(){
                selectedEmailsToPostTo.splice($(this).attr('id'), 1);
                $(this).parent().remove();
            });
        }
    };
    
    
    
    //	Event handling
    //	*********************************
    
    
    //	Compose events
    //***********************
    
    
    $("#inbox_compose_to").result(function(event, data, formatted){
        if (!selectedFriendsToPostTo.contains(data.friendUuid)) {
            createToBox(data.profile.firstName + ' ' + data.profile.lastName, data.friendUuid, true);
        }
        $(this).val('');
    });
    
    //	Compose a new message.
    $("#inbox_compose_new").click(function(){
        //	show the selector
        $("#inbox_compose_new_panel").toggle();
    });
    $("#inbox_compose_message").click(function(){
        showPane("#inbox_pane_compose");
    });
    $("#inbox_compose_to_container").click(function(){
        $("#inbox_compose_to").focus();
    });
    $("#inbox_compose_to").blur(function(){
        $("#inbox_compose_to_what").fadeOut("normal");
        var val = $(this).val();
        var reg = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        if (val.match(reg)) {
            createToBox(val, val, false);
        }
        $(this).val('');
    }); //	Clear the input box
    $("#inbox_compose_me").text(me.profile.firstName + ' ' + me.profile.lastName); //	Set the current user's name
    $("#inbox_compose_to").focus(function(){
        $("#inbox_compose_to_what").show();
    });
    $("#inbox_compose_to").keydown(function(e){
        if ($("#inbox_compose_to").val() !== '') {
            if (e.which == 13) {
                //	The user pushed return. Check to see if this is an email address.
                $("#inbox_compose_to").blur(); //	Trigger the blur event, we check the email there
                $("#inbox_compose_to").focus(); //	Re focus to the input box
            }
            $("#inbox_compose_to_what").fadeOut("normal");
        }
        else {
            $("#inbox_compose_to_what").show();
        }
        return true;
    });
    
    $("#inbox_compose_send").click(function(){
        var subject = $("#inbox_compose_subject").val();
        var body = $("#inbox_compose_body").val();
        
        //	validation
        var s = '';
        var error = false;
        if (subject === "") {
            s += 'Please enter a subject.<br />';
            error = true;
        }
        if (body === "") {
            s += 'Please enter a message body.<br />';
            error = true;
        }
        
        if (selectedFriendsToPostTo.length === 0) {
            s += 'You have to enter at least one person to send a message to.<br />';
            error = true;
        }
        
        if (error) {
            showGeneralMessage(s, true, 0);
        }
        else {
            var sTo = selectedFriendsToPostTo.join(",");
            sendMessage(sTo, subject, body, CATEGORIES.message);
        }
    });
    $("#inbox_compose_cancel").click(function(){
        //	Clear all the input fields
        $("#inbox_compose_to, #inbox_compose_subject, #inbox_compose_body").val('');
        $(".inbox_compose_to_result").remove();
        selectedFriendsToPostTo = [];
        selectedEmailsToPostTo = [];
        
        //	Jump back to inbox
        showPane('#inbox_pane_inbox');
    });
    
    
    //	Inbox
    //	*****************************
    
    //	Filter the messages.
    $("#inbox_filter_messages").click(function(){
        $("#inbox_tableHeader_from span").text("From");
		filterMessages(TYPES.inbox, CATEGORIES.message, "all", "#inbox_filter_messages");
    });
    $("#inbox_filter_announcements").click(function(){
        $("#inbox_tableHeader_from span").text("From");
		filterMessages(TYPES.inbox, CATEGORIES.announcement, "all", "#inbox_filter_announcements");
    });
    $("#inbox_filter_chats").click(function(){
        $("#inbox_tableHeader_from span").text("From");
		filterMessages(TYPES.inbox, CATEGORIES.chat, "all", "#inbox_filter_chats");
    });
    $("#inbox_filter_invitations").click(function(){
        $("#inbox_tableHeader_from span").text("From");
		filterMessages(TYPES.inbox, CATEGORIES.invitation, "all", "#inbox_filter_invitations");
    });
    $("#inbox_filter_inbox").click(function(){
        $("#inbox_tableHeader_from span").text("From");
        filterMessages(TYPES.inbox, '', "all", "#inbox_filter_inbox");
    });
    
    $("#inbox_filter_sent").click(function(){
        //	Change header to 'to' instead of 'from'
        $("#inbox_tableHeader_from span").text("To");
		
        filterMessages(TYPES.sent, '', "all", "#inbox_filter_sent");
    });
    
    $("#inbox_filter_trash").click(function(){
        $("#inbox_tableHeader_from span").text("From/To");
        filterMessages(TYPES.trash, '', "all", "#inbox_filter_trash");
    });
    
	var filterMessages = function(type, category, read, id) {
		selectedType = type;
        selectedCategory = category;
                
        //	Display first page.
        getCount(read);
        
		//	show the inbox pane
        showPane("#inbox_pane_inbox");
		
		//	set the title bold
        $(".inbox_filter").css('font-weight', 'normal');
        $(id).css('font-weight', 'bold');
	};
    
    
    
    //	Check all message
    $("#inbox_checkAll").change(function(){
        tickMessages();
    });
    $("#inbox_delete").click(function(){
        //	Delete all checked messages
        var pathToMessages = [];
        $(".inbox_inbox_check_message:checked").each(function(){
            var pathToMessage = $(this).val();
            pathToMessages.push(pathToMessage);
        });
        
        //	If we are in trash we hard delete the messages
        deleteMessages(pathToMessages, (selectedType === TYPES.trash));
        
    });
	
	
    //	Sorters
    $(".inbox_tableHeader_sort").bind("mouseenter", function(){
		if (sortOrder === 'descending') {
			$(this).append('<img src="_images/arrow_up_inbox.png" alt="UP" class="inbox_arrow" />');
		}
		else {
			$(this).append('<img src="_images/arrow_down_inbox.png" alt="DOWN" class="inbox_arrow" />');
		}
		
		$(this).style.cursor = "hand";
    });
    $(".inbox_tableHeader_sort").bind("mouseout", function(){
        $(".inbox_arrow").remove();
    });
    $(".inbox_tableHeader_sort").bind("click", function(){
        sortBy = $(this).attr('id').replace(/inbox_tableHeader_/gi, '');
        sortOrder = (sortOrder === 'descending') ? 'ascending' : 'descending';
        
		getAllMessages();
    });
    
    
    
    
    
    
    //	Specific message
    //	**********************************
    
    $("#inbox_message_back_to_inbox").click(function(){
        showPane("#inbox_pane_inbox");
        //	Clear all the input fields
        $("#inbox_message_compose_subject, #inbox_message_compose_body").val('');
        
        //	Hide form
        $("#inbox_message_compose").hide();
    });
    $("#inbox_message_option_reply").click(function(){
        $("#inbox_message_compose").show();
    });
    $("#inbox_message_option_delete").click(function(){
		var harddelete = false;
		if (selectedMessage.types.contains("trash")) {
			//	This is a trash message, hard delete it.
			harddelete = true;
		}
        //	Delete the message
        deleteMessages([selectedMessage.pathToMessage], harddelete);
        //	Show the inbox
        showPane("#inbox_pane_inbox");
        //	Clear all the input fields
        $("#inbox_message_compose_subject, #inbox_message_compose_body").val('');
    });
    $("#inbox_message_compose_cancel").click(function(){
        //	Clear all the input fields
        $("#inbox_message_compose_subject, #inbox_message_compose_body").val('');
        
        //	Hide form
        $("#inbox_message_compose").hide();
    });
    $("#inbox_message_compose_send").click(function(){
        //	we want to send a message.
        var subject = $("#inbox_message_compose_subject").val();
        var body = $("#inbox_message_compose_body").val();
        
        sendMessage([selectedMessage.from], subject, body, CATEGORIES.message, selectedMessage.pathToMessage);
    });
    
    
    
    
    
    
    getAllFriends();
    //	load the list of messages.
    getCount("all");
	showUnreadMessages();
};
sdata.registerForLoad("sakai.inbox");