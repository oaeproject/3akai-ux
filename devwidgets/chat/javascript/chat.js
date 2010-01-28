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

/*global Config, $, jQuery, sdata, get_cookie, delete_cookie, set_cookie, window */

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
    showOnlineVisibleClass : "show_online_visible",


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

        for (var i = 0; i < sakai.flashChat.flashing.length; i++) {
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
        if(openWindow){
            till = 9;
            // Open the window and show the chats for this user
            $(sakai.flashChat.chatWith + "_" + uid).show();

            // Scroll to the bottom of the content div
            var el_content = $(sakai.flashChat.chatWith + "_" + uid + "_content");
            sakai.flashChat.scroll_to_bottom(el_content);
        }else {
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

sakai.chat = function(tuid, placement, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var currentChatStatus = "";
    var hasOpenChatWindow = false; // Does the current user has open chat windows
    var peopleFocus = false;
    var peopleShown = false;
    var personIconUrl = Config.URL.PERSON_ICON_URL;
    var pulltime = "2100-10-10T10:10:10.000Z";
    var sitesFocus = false;
    var sitesShown = false;
    var time = [];
    var sendMessages = []; // Array containing the id's of all the send messages

    // JSON
    var activewindows = {};
    activewindows.items = [];
    var allFriends = false;
    var defaultNav = false;
    var goBackToLogin = false;
    var online = false;

    // Links and labels
    var hiLabel = "#hispan";
    var myprofileName = "#myprofile_name";
    var onlineButton = "#online_button";
    var pictureHolder = "#picture_holder";
    var showOnlineLink = "#show_online";
    var userIdLabel = "#userid";
    var widgetCreateSite = "#widget_createsite";

    // Chat
    var chat = "#chat";
    var chatAvailable = chat + "_available";
    var chatAvailableMinimize = chatAvailable + "_minimize";
    var chatDropdownRecentSites = chat + "_dropdown_recent_sites";
    var chatOnline = chat + "_online";
    var chatOnlineConnectionsLink = chatOnline + "_connections_link";
    var chatUnreadMessages = chat + "_unreadMessages";
    var chatWindow = chat + "_window";
    var chatWindowChatstatus = chatWindow + "_chatstatus";
    var chatWindows = chat + "_windows";
    var chatWith = chat + "_with";

    // Courses & Sites
    var coursesSitesSearch = "#courses_sites_search";
    var coursesSitesSearchButton = coursesSitesSearch + "_button";

    // Dropdown: people
    var dropdownPeopleSearch = "#dropdown_people_search";
    var dropdownPeopleSearchButton = dropdownPeopleSearch + "_button";

    // My Sites
    var mySitesDropDown = "#mysites_dropdown";
    var mySitesDropDownMain = mySitesDropDown + "_main";
    var mySitesDropDownClose = mySitesDropDown + "_close";
    var mySitesDropDownCloseLink = mySitesDropDownClose + "_link";

    // Navigation
    var nav = "#nav";
    var navContentMediaLink = nav + "_content_media_link";
    var navCoursesSitesLink = nav + "_courses_sites_link";
    var navCoursesSitesLinkClass = "nav_courses_sites_link";
    var navCoursesSitesLinkClassSelector = $("#explore_nav_container .nav_courses_sites_link");
    var navPeopleLink = nav + "_people_link";
    var navPeopleLinkClass = "nav_people_link";
    var navMySakaiLink = nav + "_my_sakai_link";
    var navSearchLink = nav + "_search_link";
    var navProfileLink = nav + "_profile_link";

    // People
    var peopleDropDown = "#people_dropdown";
    var peopleDropDownMain = peopleDropDown + "_main";
    var peopleDropDownClose = peopleDropDown + "_close";
    var peopleDropDownMyContactsList = peopleDropDown + "_my_contacts_list";

    // Top Navigation
    var topNavigation = "#top_navigation";
    var topNavigationCreateSite = topNavigation + "_create_site";
    var topNavigationWidgets = topNavigation + "_widgets";
    var topNavigationMySitesList = topNavigation + "_my_sites_list";

    // User Link
    var userLinkContainer = "#user_link_container";
    var userLink = "#user_link";
    var userLinkMenu = userLink + "_menu";
    var userLinkMenuLink = userLink + "_menu" + " a";

    // CSS Classes
    var focussedFieldClass = "focussedInput";

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

    var exploreClass = ".explore";

    // Containers
    var chatMainContainer = "#chat_main_container";
    var createSiteContainer = "#createsitecontainer";
    var exploreNavigationContainer = "#explore_nav_container";

    // Templates
    var chatAvailableTemplate = "chat_available_template";
    var chatContentTemplate = "chat_content_template";
    var chatDropdownRecentSitesTemplate = "chat_dropdown_recent_sites_template";
    var chatWindowsTemplate = "chat_windows_template";
    var navSelectedPageTemplate = "nav_selected_page_template";
    var peopleDropDownMyContactsListTemplate = "people_dropdown_my_contacts_list_template";
    var topNavigationMySitesListTemplate = "top_navigation_my_sites_list_template";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /*
     * Placeholders that will be replaced by the real functions. This
     * is necessary to comply with the JSLint rules
     */
    sakai.chat.loadChatTextInitial = function(){};
    var doWindowRender = function(){};

    /*
     * Sort the sites by their name
     */
    var doSortSites = function(a, b){
        if (a.name > b.name) {
            return 1;
        }
        else {
            if (a.name === b.name) {
                return 0;
            }
            else {
                return -1;
            }
        }
    };

    /**
     * Clone a certain object.
     * We need this in activewindows, to not change the original object
     * @param {Object} obj Object that needs to be cloned
     */
    var clone = function(obj) {
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
     * Shorten a string and add 3 dots if the string is too long
     * @param {String} input The string you want to shorten
     * @param {Int} maxlength Maximum length of the string
     */
    var shortenString = function(input, maxlength){
        if(typeof input === "string" && input.length > maxlength){
            input = input.substr(0, maxlength) + "...";
        }
        return input;
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
            return shortenString(firstName + " " + lastName, 11);
        }
        else {
            return shortenString(uuid, 11);
        }
    };

    /**
     * Parse the picture for a user
     * @param {String} picture The picture path for a user
     * @param {String} userStoragePrefix The user's storage prefix
     */
    var parsePicture = function(picture, uuid){
        // Check if the picture is undefined or not
        // The picture will be undefined if the other user is in process of
        // changing his/her picture
        if (picture && $.evalJSON(picture).name) {
            return "/_user/public/" + uuid + "/" + $.evalJSON(picture).name;
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
            var base = $.evalJSON(basic);
            if(base.status){
                return shortenString(base.status, 20);
            }
        }
        return shortenString("No status message");
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


    //////////////////////////////
    // Courses & Sites dropdown //
    //////////////////////////////

    /**
     * Load the sites for the current user
     */
    var loadSites = function(){
        var el = $(widgetCreateSite);
        if (!el.get(0)) {
            /** TODO Remove the inline html */
            $(topNavigationWidgets).append("<div id='createsitecontainer' style='display:none'><div id='widget_createsite' class='widget_inline'></div></div>");
            sdata.widgets.WidgetLoader.insertWidgets("createsitecontainer");
        }
        $.ajax({
            url: Config.URL.SITES_SERVICE,
            cache: false,
            success: function(data){
                var json = {};
                json.entry = $.evalJSON(data) || [];
                for (var i = 0; i < json.entry.length; i++) {
                    json.entry[i] = json.entry[i].site;
                    json.entry[i].location = json.entry[i].id;
                }
                json.entry = json.entry.sort(doSortSites);
                if (json.entry.length > 5) {
                    json.entry = json.entry.splice(0, 5);
                }
                $(topNavigationMySitesList).html($.Template.render(topNavigationMySitesListTemplate, json));
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });
    };

    /**
     * Show the create new site lightbox
     */
    var createNewSite = function(){
        $(createSiteContainer).show();
        // Initialise the createsite widget.
        sakai.createsite.initialise();
    };

    /**
     * Search for the site(s) you putted in the input field
     */
    var doSitesSearch = function(){
        var tosearch = $(coursesSitesSearch).val();
        if (tosearch) {
            document.location = Config.URL.SEARCH_SITES_URL + "#1|" + tosearch;
        }
    };

    /**
     * Bind the create site button in the top navigation
     */
    $(topNavigationCreateSite).bind("click", function(ev){
        createNewSite();
    });

    /**
     * If this is the first time the field gets focus, we'll make his text color black
     * and remove the default value
     */
    $(coursesSitesSearch).bind("focus", function(ev){
        if (!sitesFocus) {
            var el = $(coursesSitesSearch);
            el.val("");
            el.addClass(focussedFieldClass);
            sitesFocus = true;
        }
    });

    /**
     * Check on every keypress whether the enter key has been pressed or not. If so,
     * search for sites
     */
    $(coursesSitesSearch).bind("keypress", function(ev){
        if (ev.which === 13) {
            doSitesSearch();
        }
    });

    $(coursesSitesSearchButton).bind("click", doSitesSearch);


    ////////////////////////////////////////////
    // Courses & Sites dropdown : Show & Hide //
    ////////////////////////////////////////////

    defaultNav = $(exploreClass).html();

    /**
     * Render the template to show on which page you are currently on.
     * You can see this by the dark border in the top navigation of a page
     * @param {String} value The value of the page name
     * @return {String} The result of the render
     */
    var renderSelectedPage = function(value, isDropdown){

        var page = {};
        page.value = value;
        page.dropdown = isDropdown || false;
        return $.Template.render(navSelectedPageTemplate, page);
    };

    /**
     * Select the page in the top navigation where you are currently on.
     * This will display a dark balloon around the page we are on now.
     * This is decided by looking at the current url.
     */
    var selectPage = function(){
        var windowLocationPath = window.location.pathname.toLowerCase();

        if (windowLocationPath.indexOf(Config.URL.MY_DASHBOARD) !== -1){
            $(navMySakaiLink).html(renderSelectedPage($.i18n.getValueForKey("MY_SAKAI")));
        } else if (windowLocationPath.indexOf(Config.URL.SEARCH_GENERAL_URL) !== -1 || windowLocationPath.indexOf(Config.URL.SEARCH_PEOPLE_URL) !== -1 || windowLocationPath.indexOf(Config.URL.SEARCH_SITES_URL) !== -1 || windowLocationPath.indexOf(Config.URL.SEARCH_CONTENT_URL) !== -1){
            $(navSearchLink).html(renderSelectedPage("Search"));
        } else if (windowLocationPath.indexOf(Config.URL.PEOPLE_URL) !== -1){
            $(navPeopleLink).html(renderSelectedPage("People"));
        } else if (windowLocationPath.indexOf(Config.URL.PROFILE_URL) !== -1){
            $(navProfileLink).html(renderSelectedPage("Profile"));
        } else if (windowLocationPath.indexOf(Config.URL.CONTENT_MEDIA_URL) !== -1){
            $(navContentMediaLink).html(renderSelectedPage("Content &amp; Media"));
        }

    };

    /**
     * Render the recent sites for the current user
     * @param {Object} json JSON object that contains the recent sites
     * and a count with how many there are
     */
    var renderRecentSites = function(json){
        $(chatDropdownRecentSites).append($.Template.render(chatDropdownRecentSitesTemplate,json));
    };

    /**
     * Load the recent sites that the current user has visited
     */
    var loadRecentSites = function(){
        var json = {};
        json.count = 0;

            $.ajax({
                url: Config.URL.RECENT_SITES_URL.replace(/__USERSTORAGEPREFIX__/, sdata.me.user.userStoragePrefix),
                cache: false,
                success: function(data){
                    // The response is a json object with an "items" array that contains the
                    // names for the recent sites.
                    var items = $.evalJSON(data);

                    // Do a request to the site service with all the names in it.
                    // This will give us the proper location, owner, siteid,..
                    var url = "/system/batch?";
                    var n_items = {};
                    n_items.items = [];

                    for (var i = 0; i < items.items.length; i++) {
                        n_items.items[i] = "resources=/sites/" + items.items[i] + ".json";
                    }
                    url += n_items.items.join("&");


                    $.ajax({
                        url: url,
                        cache: false,
                        success: function(data){
                            var response = $.evalJSON(data);
                            json = {};
                            json.items = [];
                            json.count = 0;

                            // We do a check for the number of sites we have.
                            // If we only have 1 site we will get a JSONObject
                            // If we have multiple it will be an array of JSONObjects.
                            for (var i = 0; i < response.length; i++) {
                                var el = {};
                                var site = $.evalJSON(response[i].data);
                                el.location = site.id;
                                el.name = site.name;
                                json.items[json.items.length] = el;
                                json.count++;
                            }
                            renderRecentSites(json);
                        },
                        error: function(xhr, textStatus, thrownError) {
                            renderRecentSites(json);
                        }
                    });

                },
                error: function(xhr, textStatus, thrownError) {
                    renderRecentSites(json);
                }
            });
    };

    /**
     * Drop down the sites container under the top navigation bar
     */
    navCoursesSitesLinkClassSelector.live("click", function(ev) {
        if ($(navCoursesSitesLink + " " + mySitesDropDownCloseLink).length === 0){

            // Hide the people dropdown
            $(peopleDropDownMain).hide();
            $(peopleDropDownClose).hide();

            // Show the courses and sites.

            $(mySitesDropDownMain).show();
            $(mySitesDropDownClose).show();

            $(exploreClass).html(defaultNav);
            $(navCoursesSitesLink).html(renderSelectedPage("Courses &amp; Sites", true));
            $(navCoursesSitesLink).removeClass(navCoursesSitesLinkClass);
            if (!sitesShown) {
                loadSites();
                loadRecentSites();
                sitesShown = true;
            }
        }
    });

    /*
     * Bind the close button for the sites container
     */
    $(mySitesDropDownCloseLink).live("click", function(ev){
        $(mySitesDropDownMain).hide();
        $(peopleDropDownMain).hide();
        $(exploreClass).html(defaultNav);
        selectPage();
        $(navPeopleLink).addClass(navPeopleLinkClass);
        $(navCoursesSitesLink).addClass(navCoursesSitesLink);
    });


    ///////////////////////////////
    // People dropdown : Handler //
    ///////////////////////////////

    /**
     * Load all the friends for the current user
     */
    var loadPeople = function(){
        $.ajax({
            url: Config.URL.FRIEND_ACCEPTED_SERVICE,
            data: {
                page: 0,
                items: 4
            },
            cache: false,
            success: function(data){
                var friends = $.evalJSON(data);

                var pOnline = {};
                pOnline.items = [];
                var total = 0;
                pOnline.showMore = false;

                if (friends.results) {
                    for (var i = 0; i < friends.results.length; i++) {
                        var isOnline = false;
                        if (!isOnline && total < 4) {
                            var item = friends.results[i];
                            item.id = item.target;
                            item.name = parseName(item.id, item.profile.firstName, item.profile.lastName);
                            item.photo = parsePicture(item.profile.picture, item.id);
                            item.online = false;
                            pOnline.items[pOnline.items.length] = item;
                            total++;
                        }
                    }
                }

                $(peopleDropDownMyContactsList).html($.Template.render(peopleDropDownMyContactsListTemplate, pOnline));

            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occurred. /n Please try again later");
            }
        });
    };

    /**
     * Perform a search for the people the user inserted in the input field
     */
    var doPeopleSearch = function(){
        var tosearch = $(dropdownPeopleSearch).val();
        if (tosearch) {
            document.location = Config.URL.SEARCH_PEOPLE_URL + "#1|" + tosearch;
        }
    };

    /*
     * If this is the first time the field gets focus, we'll make his text color black
     * and remove the default value
     */
    $(dropdownPeopleSearch).bind("focus", function(ev){
        if (!peopleFocus) {
            peopleFocus = true;
            var el = $(dropdownPeopleSearch);
            el.val("");
            el.addClass(focussedFieldClass);
        }
    });

    /*
     * Check on every keypress whether the enter key has been pressed or not. If so,
     * search for people
     */
    $(dropdownPeopleSearch).live("keypress", function(ev){
        if (ev.which === 13) {
            doPeopleSearch();
        }
    });

    $(dropdownPeopleSearchButton).live("click", doPeopleSearch);


    ////////////////////////////////////////////
    // Courses & Sites dropdown : Show & Hide //
    ////////////////////////////////////////////

    /*
     * Drop down the people container beneath the top navigation bar
     */
    $(".nav_people_link").live("click", function(ev) {
        $(mySitesDropDownMain).hide();
        $(peopleDropDownMain).show();
        $(exploreClass).html(defaultNav);
        $(navPeopleLink).html(renderSelectedPage("People", true));
        $("#nav_people_link").removeClass("nav_people_link");
        if (!peopleShown) {
            loadPeople();
            peopleShown = true;
        }
    });


    //////////////
    // Messages //
    //////////////

    /**
     * Get the number of messages that are unread and show it.
     */
    var getCountUnreadMessages = function() {
        // We only get the number of messages in our inbox folder that we havent read yet.
        $.ajax({
            url: Config.URL.MESSAGES_COUNT_SERVICE,
            success: function(data){
                var json = $.evalJSON(data);
                if (json.count){
                    $(chatUnreadMessages).text(json.count);
                }
            }
        });
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
        onlineWindow.css('bottom', 31 + onlineWindow.height() + "px");
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
        for(var i = 0; i < allFriends.users.length; i++){
            if(allFriends.users[i].userid === uuid){
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
        for (var i = 0; i < activewindows.items.length; i++) {
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
        switch(el.get(0).tagName.toLowerCase()){
            case "span":
                // To avoid flickering of the element we check if the element already has this value.
                // This improves the overall performance.
                if (el.text() !== value){
                    el.text(value);
                    updateActiveWindows(userid, item, value);
                }
                break;
            case "img":
                if (el.attr("src") !== value){
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
        element.addClass(chatAvailableStatusClass + "_"+ chatstatus);
    };

    /**
     * Update the chat status of a specific chat window
     * @param {Object} userid The user id of the user
     * @param {Object} value The status which should be updated if necessary
     */
    var updateChatWindowChatStatus = function(userid, value){
        var el = $(chatWindowChatstatus + "_" + userid);

        // Do a check to make sure that this element doesn't already have this class.
        if(!el.hasClass(chatAvailableStatusClass+"_"+value)){
            updateChatStatusElement(el, value);
            updateActiveWindows(userid, "chatstatus", value);
        }
    };

    /**
     * Update the chatwindow for a certain user
     * @param {Object} user Object that contains the user information
     */
    var updateChatWindow = function(user){
        if($(chatWith + "_"+user.userid).length > 0){
            updateChatWindowChatStatus(user.userid, user.chatstatus);
            updateChatWindowElement(user.userid, "photo", user.photo);
            updateChatWindowElement(user.userid, "name",  user.name);
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
            for (var i = 0; i < activewindows.items.length; i++) {
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
        for (var i = 0; i < activewindows.items.length; i++) {
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

        if(user !== null){
            activewindows.items[index].name = user.name;
            activewindows.items[index].photo = user.photo;
            activewindows.items[index].status = user.status;
            activewindows.items[index].statusmessage = user.statusmessage;
            activewindows.items[index].chatstatus = user.chatstatus;
        }else{
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
        var user ={};
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
            for (var i = 0; i < onlinefriends.length; i++) {
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

                // We check if the text is "userid is offline" because we don't want to delete it everytime
                if(isOnline){
                    if($(chatWith + "_" + friendId + "_txt").val() === friendName + " is offline"){
                        $(chatWith + "_" + friendId + "_txt").removeAttr("disabled");
                        $(chatWith + "_" + friendId + "_txt").val("");
                    }
                }else{
                    $(chatWith + "_" + friendId + "_txt").attr("disabled", true);
                    $(chatWith + "_" + friendId + "_txt").val(friendName + " is offline");
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
            for (var i = 0; i < json.contacts.length; i++) {
                if (typeof json.contacts[i].profile === "string") {
                    json.contacts[i].profile = $.evalJSON(json.contacts[i].profile);
                }
                json.contacts[i].chatstatus = parseChatStatus(json.contacts[i].profile.chatstatus);
                /** Check if a friend is online or not */
                if (json.contacts[i]["sakai:status"] === "online" && json.contacts[i].chatstatus !== "offline") {
                    total++;
                }

                json.contacts[i].name = parseName(json.contacts[i].userid, json.contacts[i].profile.firstName, json.contacts[i].profile.lastName);
                json.contacts[i].photo = parsePicture(json.contacts[i].profile.picture, json.contacts[i].profile["rep:userId"]);
                json.contacts[i].statusmessage = parseStatusMessage(json.contacts[i].profile.basic);

                saveToAllFriends(json.contacts[i]);
            }
        }
        if (!total || total === 0) {
            json.items = [];
            json.totalitems = total;
            $(chatOnline).html("(0)");
        }
        else {
            json.totalitems = total;
            $(chatOnline).html("<b>(" + total + ")</b>");
        }

        json.me = {};
        if (json.me){
            json.me.name = parseName(sdata.me.user.userid, sdata.me.profile.firstName, sdata.me.profile.lastName);
            json.me.photo = parsePicture(sdata.me.profile.picture, sdata.me.user.userid);
            json.me.statusmessage = parseStatusMessage(sdata.me.profile.basic);
            json.me.chatstatus = currentChatStatus;

            // We render the template, add it to a temporary div element and set the html for it.
            json.items = [];
            for (var j = 0; j < json.contacts.length; j++){
                if (json.contacts[j]['sakai:status'] == "online" && json.contacts[j].chatstatus != "offline"){
                    json.items.push(json.contacts[j]);
                }
            }
            var renderedTemplate = $.Template.render(chatAvailableTemplate, json).replace(/\r/g,'');
            var renderedDiv = $(document.createElement("div"));
            renderedDiv.html(renderedTemplate);

            // We only render the template when it's needed.
            // The main reason we do this is to improve performance.
            // It was not possible to compare the html from chatAvailable to the renderedTemplate (<br /> where replaced with <br>)
            // so we made the temporary div, added the rendered template html for it and compared that to the html from chatAvailable
            if($(chatAvailable).html() !== renderedDiv.html()){
                $(chatAvailable).html(renderedTemplate);
                var onlineWindow = $(showOnlineLink);
                onlineWindow.css('bottom', 31 + onlineWindow.height() + "px");
            }
        }

        enableDisableOnline();

    };

    /**
     * Show or hide the user link menu
     */
    var showHideUserLinkMenu = function(){


        if($(userLinkMenu).is(":visible")){
            $(userLinkMenu).hide();
        }else{
            $(userLinkMenu).css("left", Math.round($(userLink).offset().left) + "px");
            $(userLinkMenu).css("top", Math.round($(userLink).offset().top) + $(userLink).height() + "px");
            $(userLinkMenu).css("width", ($(userLink).width() + 10) + "px");
            $(userLinkMenu).show();
        }

    };

    /**
     * Link menu hover
     */
    $(userLinkMenuLink).hover(
        function() {
            $(this).css("color","#ddd");
        },
        function() {
            $(this).css("color","#fff");
        }
    );

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
            "chatstatus" : chatstatus,
            "_charset_":"utf-8"
        };

        $.ajax({
            url: Config.URL.PATCH_PROFILE_URL.replace(/__USERID__/, sdata.me.user.userid),
            type : "POST",
            data : data,
            success : function(data) {
                updateChatStatus();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error occurend when sending the status to the server.");
            }
        });
    };

    /**
     * Get the chat status for the current user
     */
    var getChatStatus = function(){
        $.ajax({
            url: Config.URL.ME_SERVICE,
            success: function(data){
                var me = $.evalJSON(data);
                if(me.profile){
                    currentChatStatus = parseChatStatus(me.profile.chatstatus);
                }else{
                    currentChatStatus = "online";
                }
                updateChatStatus();
            },
            error: function(xhr, textStatus, thrownError) {
                currentChatStatus = "online";
                updateChatStatus();
            }
        });
    };

    /**
     * Add binding to some elements
     */
    var addBinding = function(){
        $(userLink).bind("click", function(){
            showHideUserLinkMenu();
        });

        $(userLinkChatStatusClass).bind("click", function(ev){
            showHideUserLinkMenu();
            var clicked = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
            sendChatStatus(clicked);
        });
    };

    /**
     * Return the render of a certain chat message
     * @param {Object} message Message that needs to be rendered
     */
    var renderChatMessage = function(message){
        return $.Template.render(chatContentTemplate, message);
    };

    /**
     * Check the height of an element and add overflow or not
     * @param {Object} el Element that needs to be checked
     * @param {String} nooverflow Class that will be added if the height is not too big
     * @param {String} overflow Class that will be added it the height is too big
     */
    var checkHeight = function(el, nooverflow, overflow){
        if(el.hasClass(nooverflow)){
            var totalHeight = 0;
            el.children().each(function() {
                totalHeight += $(this).attr('scrollHeight');
                if(totalHeight >= el.height()){
                    el.removeClass(nooverflow);
                    el.addClass(overflow);
                }
            });
        }
    };

    /**
     * Add a chat message
     * @param {Object} el Elment where the element needs to be attached to
     * @param {Object} message Message that needs to be appended
     */
    var addChatMessage = function(el, message){
        if(el.length > 0){
            el.append(renderChatMessage(message));
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
        if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
        if (current_hour === 0){current_hour = 12;}
        if (current_hour > 12){current_hour = current_hour - 12;}

        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1){current_minutes = "0" + current_minutes;}

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
        /** Check if the message is from the other user */
        if(isMessageFromOtherUser){
            message.name = otherUserName;
        }else{
            message.name = "Me";
        }

        message.message = inputmessage;

        /** Parse the date to get the hours and minutes */
        //var messageDate = new Date(inputdate);
        //2009-07-27T13:48:47.999+01:00
        var messageDate = false;
        if (typeof inputdate === "string"){
            messageDate = new Date(parseInt(inputdate.substring(0,4), 10), parseInt(inputdate.substring(5,7), 10) - 1, parseInt(inputdate.substring(8,10), 10), parseInt(inputdate.substring(11,13), 10), parseInt(inputdate.substring(14,16), 10), parseInt(inputdate.substring(17,19), 10));
        } else {
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

        if (sdata.me.user.userid === undefined) {
            return;
        }

        if (special) {
            // We only add one extra chatbox
            // This value will be used to calculate the left value for the box
            special.special = activewindows.items.length - 1;
            $(chatWindows).append($.Template.render(chatWindowsTemplate, special));
            $("#chat_windows_container").append($.Template.render("chat_windows_windows_template", special));
        }
        else {
            // Render all the current chats.
            activewindows.special = false;
            $(chatWindows).html($.Template.render(chatWindowsTemplate, activewindows));
            $("#chat_windows_container").html($.Template.render("chat_windows_windows_template", activewindows));

        }

        enableDisableOnline();

        if (clicked) {
            hideOnline();
            var el = $(chatWith + "_" + clicked);
            var el_button = $(onlineButton + "_" + clicked);
            showOnlineWindow(el, el_button);
            hasOpenChatWindow = true;
        }

        // We don't use the live feature of jquery here.
        // Sometimes it gives an NSDocument exeption in firefox.

        // Every time we do this functions these events listeners will be binded.
        // So we have to remove them every time as well.
        $(userChatClass).unbind("click");
        $(userChatClass).bind("click", function(ev){
            var selected =  ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
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
            //$("#chat_windows_container").html($.Template.render("chat_windows_windows_template", activewindows));

            for (var j = 0; j < activewindows.items.length; j++) {
                $(chatWith + "_" + activewindows.items[j].userid).css("left", "" + (j * 150) + "px");
                if (j === 0){
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
                        "sakai:from": sdata.me.user.userid,
                        "sakai:subject": "",
                        "sakai:body":text,
                        "sakai:category":"chat",
                        "_charset_":"utf-8"
                    };

                    $.ajax({
                        url: Config.URL.MESSAGES_CREATE_SERVICE,
                        type: "POST",
                        success: function(data) {

                            // We evaluate the response after sending
                            // the message and store it in an object
                            var response = $.evalJSON(data);

                            // Add the id to the send messages object
                            // We need to do this because otherwise the user who
                            // sends the message, will see it 2 times
                            addToSendMessages(response.id);
                        },
                        error: function(xhr, textStatus, thrownError) {
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

    /*
     * Write a cookie with the current active windows when you go to another page
     */
    $(window).bind("unload", function(ev){
        if (sdata.me.user.userid === undefined) {
            return;
        }
        else {
            set_cookie('sakai_chat', $.toJSON(activewindows), null, null, null, "/", null, null);
        }
    });


    ///////////////////////
    // Initial functions //
    ///////////////////////

    if (sdata.me.user.userid === undefined) {
        return;
    }
    else {
        sdata.widgets.WidgetLoader.insertWidgets("chat_container");
    }


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

        // Send an ajax request to check if there are any new messages
        $.ajax({
            url: Config.URL.CHAT_UPDATE_SERVICE,
            data: data,
            success: function(data){

                // Parse the json data and get the time
                var json = $.evalJSON(data);
                time = json.time;

                if(json.update){
                    sakai.chat.loadChatTextInitial(false);
                }else {
                    setTimeout(sakai.chat.checkNewMessages, 5000);
                }
                pulltime = json.pulltime;
            }
        });
    };

    /**
     * Load the chat windows
     * @param {Boolean} initial
     *  true:    Load the initial chat (receive all the messages)
     *  false:    It's not an initial load
     * @param {Object} specialjson
     *  JSON object that contains information about the user window that
     *  needs to be loaded
     */
    sakai.chat.loadChatTextInitial = function(initial, specialjson, hasNew){

        // Check if the current user is anonymous.
        // If this is the case, exit this function
        if (sdata.me.user.userid === undefined) {
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
        var para = "unread";
        if (initial){
            para = "all";
        }
        $.ajax({
            url: Config.URL.CHAT_GET_SERVICE.replace(/__KIND__/, para),
            data: {
                "_from" : tosend,
                "items" : 1000,
                "t" : pulltime
            },
            cache: false,
            sendToLoginOnFail: true,
            success: function(data){
                var json = $.evalJSON(data);

                // Check if there are any messages inside the JSON object
                if(json.results){

                    var njson = {};
                    for(var i = json.results.length - 1; i >= 0; i--) {
                        var message = json.results[i];
                        var user = "";
                        if (message.userFrom["rep:userId"] === sdata.me.user.userid){
                            user = message.userTo["rep:userId"];
                        } else {
                            user = message.userFrom["rep:userId"];
                        }
                        var isIncluded = true;
                        if (hasNew){
                            var isIn = false;
                            for (var l = 0; l < specialjson.items.length; l++){
                                if (specialjson.items[l].userid == user){
                                    isIn = true;
                                }
                            }
                            if (!isIn){
                                isIncluded = false;
                            }
                        }
                        if (isIncluded){
                            if (!njson[user]){
                                njson[user] = {};
                                njson[user].messages = [];
                            }
                            njson[user].messages[njson[user].messages.length] = message;
                        }
                    }

                    for (var k in njson) {

                        // We need to add the hasOwnProperty to pass to JSLint and it is also a security issue
                        if(njson.hasOwnProperty(k)){
                            var isMessageFromOtherUser = false;

                            // Check if there exists a window for the user
                            if ($(chatWith + "_" + k).length > 0) {

                                // We check if the message is in the sendMessages array
                                if($.inArray(njson[k].messages[0].id, sendMessages) !== -1){
                                    continue;
                                }

                                var el = $(chatWith + "_" + k + "_content");
                                var chatwithusername = parseName(k, njson[k].messages[0].userFrom.firstName, njson[k].messages[0].userFrom.lastName);

                                // Create a message object
                                var chatmessage = {};

                                for(var j = 0; j < njson[k].messages.length; j++){
                                    // Check if the message is from the current user or from the friend you are talking to
                                    if (sdata.me.user.userid == njson[k].messages[j].userFrom["rep:userId"]) {
                                        isMessageFromOtherUser = false;
                                    }
                                    else {
                                        isMessageFromOtherUser = true;
                                    }

                                    // Create a chat message and add it
                                    chatmessage = createChatMessage(isMessageFromOtherUser, chatwithusername, njson[k].messages[j]["sakai:body"], njson[k].messages[j]["jcr:created"]);
                                    addChatMessage(el, chatmessage);
                                }

                            } else {

                                // Check whether there is a new message for this user
                                /*var cont = false;
                                for(var n = 0; n < njson[k].messages.length; n++){
                                    if (njson[k].messages[n]["sakai:read"] === "false"){
                                        cont = true;
                                    }
                                }*/

                                //if (cont){

                                    // Add the user information to the active windows
                                    var index = activewindows.items.length;
                                    activewindows.items[index] = {};
                                    activewindows.items[index].userid = k;
                                    activewindows.items[index].active = false;
                                    var friendProfile = njson[k].messages[0].userFrom;
                                    if (njson[k].messages[0].userFrom["rep:userId"] == sdata.me.user.userid){
                                        friendProfile = njson[k].messages[0].userTo;
                                    }

                                    // Parse the name, photo, statusmessage and chatstatus into the activewindows objects
                                    activewindows.items[index].name = parseName(k, friendProfile.firstName, friendProfile.lastName);
                                    activewindows.items[index].photo = parsePicture(friendProfile.picture, k);
                                    activewindows.items[index].statusmessage = parseStatusMessage(friendProfile.basic);
                                    activewindows.items[index].chatstatus = parseChatStatus(friendProfile.chatstatus);

                                    var togo = true;
                                    // Togo will be false if the userid is in the activewindows and it's window is active
                                    for (var o = 0; o < activewindows.items.length; o++) {
                                        if (activewindows.items[o].userid === k) {
                                            if (activewindows.items[o].active) {
                                                togo = false;
                                            }
                                        }
                                    }

                                    if (togo) {
                                        if (hasOpenChatWindow) {
                                            setTimeout("sakai.flashChat.doFlash('" + k + "', false)", 500);

                                        } else {
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

                                //}
                            }
                        }
                    }
                }

                if (doreload) {
                    setTimeout(sakai.chat.checkNewMessages, 5000);
                }
            },

            error: function(xhr, textStatus, thrownError) {

                //if (doreload) {
                // setTimeout("sakai.chat.loadChatTextInitial('" + false +"')", 5000);
                //}
            }
        });
    };

    /**
     * Check if there were any windows open during the last visit
     * and load the initial chat windows
     */
    var loadPersistence = function(){

        // Check if there is a cookie from a previous visit
        if (get_cookie('sakai_chat')) {
            activewindows = $.evalJSON(get_cookie('sakai_chat'));
            delete_cookie('sakai_chat');
            var toshow = false;
            for (var i = 0; i < activewindows.items.length; i++) {
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

        if (sdata.me.user.userid === undefined && goBackToLogin === false) {
            return;
        }

        var sendToLoginOnFail = false;
        if (goBackToLogin) {
            sendToLoginOnFail = true;
        }

        // Receive your online friends through an Ajax request
        $.ajax({
            url: Config.URL.PRESENCE_CONTACTS_SERVICE,
            cache: false,
            success: function(data){
                online = $.evalJSON(data);
                showOnlineFriends();
                setTimeout(checkOnline, 20000);
                goBackToLogin = true;
            },
            sendToLoginOnFail: sendToLoginOnFail
        });

    };

    /**
     * Contains all the functions and methods that need to be
     * executed on the initial load of the page
     */
    var doInit = function(){

        var person = sdata.me;

        // Check if it is possible to receive the uid for the
        // current user
        if (!person.user.userid) {
            return;
        }
        else {
            $(exploreNavigationContainer).show();
            $(chatMainContainer).show();
        }

        // Fill in the name of the user in the different fields
        if (person.profile.firstName || person.profile.lastName) {
            $(userIdLabel).text(person.profile.firstName + " " + person.profile.lastName);
            $(hiLabel).text(person.profile.firstName);
        }

        // Show the profile picture on the dashboard page
        /** TODO : Remove the lines beneath if this functionality is inside changepic.js */
        if (person.profile.picture) {
            var picture = $.evalJSON(person.profile.picture);
            if (picture.name) {
                $(pictureHolder).attr("src", "/_user/public/" + sdata.me.user.userid + "/" + picture.name);
            }
        }


           selectPage();
        getChatStatus();
        addBinding();
        getCountUnreadMessages();
        setPresence(true);
    };

    var setPresence = function(initial){
        var status = "online";
        var data = {};
        if (sdata.me.profile.chatstatus){
            status = sdata.me.profile.chatstatus;
        }
        var url = "/_user/presence.json";
        if (!initial){
            url = "/_user/presence.json";
            data["sakai:location"] = "none";
        } else {
            data["sakai:status"] = status;
        }
        data._charset_ = "utf-8";
        $.ajax({
            url: url,
            type: "POST",
            success: function(data){
                setTimeout(setPresence,60000);
            },
            data : data
        });
    };

    if (sdata.me.user.userid === undefined) {
        return;
    }
    else {
        //loadPersistence();
        //checkOnline();
        doInit();
    }

};

sdata.widgets.WidgetLoader.informOnLoad("chat");