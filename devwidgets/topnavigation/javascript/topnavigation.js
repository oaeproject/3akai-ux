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
/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.fieldselection.js (fieldselection)
 */
/*global Config, $, jQuery, get_cookie, delete_cookie, set_cookie, window, alert */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {


    /**
     * @name sakai_global.topnavigation
     *
     * @class topnavigation
     *
     * @description
     * Initialize the topnavigation widget
     *
     * @version 0.0.2
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.topnavigation = function(tuid, showSettings){


        ///////////////////
        // CONFIGURATION //
        ///////////////////

        // Elements
        var subnavtl = ".hassubnav_tl";
        var navLinkDropdown = ".s3d-dropdown-container";
        var hasSubnav = ".hassubnav";
        var topnavExplore = ".topnavigation_explore";
        var topnavUserOptions = ".topnavigation_user_options";
        var topnavUserDropdown = ".topnavigation_user_dropdown";
        var topnavigationlogin = "#topnavigation_user_options_login_wrapper";
        var topnavigationExternalLogin= ".topnavigation_external_login";
        var topnavUserLoginButton = "#topnavigation_user_options_login";

        // Form
        var topnavUserOptionsLoginForm = "#topnavigation_user_options_login_form";
        var topnavUseroptionsLoginFieldsUsername = "#topnavigation_user_options_login_fields_username";
        var topnavUseroptionsLoginFieldsPassword = "#topnavigation_user_options_login_fields_password";
        var topnavuserOptionsLoginButtonLogin = "#topnavigation_user_options_login_button_login";
        var topnavUserOptionsLoginButtonSigningIn = "#topnavigation_user_options_login_button_signing_in";
        var topnavUserOptionsLoginButtonCancel = "#topnavigation_user_options_login_button_cancel";

        // Containers
        var topnavSearchResultsContainer = "#topnavigation_search_results_container";
        var topnavSearchResultsBottomContainer = "#topnavigation_search_results_bottom_container";
        var topnavUserInboxMessages = "#topnavigation_user_inbox_messages";
        var topnavUserOptionsName = "#topnavigation_user_options_name";
        var topnavUserContainer = ".topnavigation_user_container";
        var topnavUserOptionsLoginFields = "#topnavigation_user_options_login_fields";
        var topnavUserOptionsLoginError = "#topnavigation_user_options_login_error";

        // Classes
        var topnavigationForceSubmenuDisplay = "topnavigation_force_submenu_display";
        var topnavigationForceSubmenuDisplayTitle = "topnavigation_force_submenu_display_title";

        // Templates
        var navTemplate = "navigation_template";
        var searchTemplate = "search_template";
        var searchBottomTemplate = "search_bottom_template";
        var topnavUserTemplate = "topnavigation_user_template";

        var renderObj = {
            "people":"",
            "groups":"",
            "files":"",
            "peopletotal":0,
            "groupstotal":0,
            "filestotal":0
        };

        var lastSearchVal = "",
            searchTimeout = false;

        var $openMenu = false;


        ////////////////////////
        ///// USER ACTIONS /////
        ////////////////////////

        /**
         * Fill in the user name
         */
        var setUserName = function(){
            $(topnavUserOptionsName).html(sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(sakai.data.me.profile), 100, null, null, true));
        };

        /**
         * Show the logout element
         */
        var showLogout = function(){
            if ($(topnavUserDropdown).is(":visible")) {
                $(topnavUserDropdown).hide();
            } else {
                $(topnavUserDropdown).show();
                $(topnavUserDropdown).css("display", "inline");
            }
        };

        /**
         * Show the login element
         */
        var showLogin = function(){
            if ($(topnavUserOptionsLoginFields).is(":visible")) {
                $(topnavUserOptionsLoginFields).hide();
            } else {
                $(topnavUserOptionsLoginFields).show();
                $(topnavUseroptionsLoginFieldsUsername).focus();
            }
        };

        /**
         * Decide to show login or logout option
         */
        var decideShowLoginLogout = function(){
            if(sakai.data.me.user.anon){
                showLogin();
            }else{
                showLogout();
            }
        };


        var renderUser = function(){
            var externalAuth = false;
            if (!sakai.config.Authentication.internal && !sakai.config.Authentication.allowInternalAccountCreation) {
                externalAuth = true;
            }
            var auth = {
                "externalAuth": externalAuth,
                "Authentication": sakai.config.Authentication
            };
            $(topnavUserContainer).html(sakai.api.Util.TemplateRenderer(topnavUserTemplate, {
                "anon" : sakai.data.me.user.anon,
                "auth": auth,
                "displayName": sakai.api.User.getDisplayName(sakai.data.me.profile),
                "sakai": sakai
            }));
            if (externalAuth){
                setExternalLoginRedirectURL();
            };
        };

        var setExternalLoginRedirectURL = function(){
            var redirectURL = getRedirectURL();
            $(".topnavigation_external_login_link").each(function(index, item){
                $(item).attr('href', $.param.querystring($(item).attr('href'), {"url": redirectURL}));
            });
        };

        var getRedirectURL = function(){
            var redirectURL = window.location.pathname + window.location.search + window.location.hash;
            var qs = new Querystring();
            // Check whether we require a redirect
            if (qs.get("url")) {
                redirectURL = qs.get("url");;
            // Go to You when you're on explore page
            } else if (window.location.pathname === "/dev/explore.html" || window.location.pathname === "/register" ||
                window.location.pathname === "/index" || window.location.pathname === "/" || window.location.pathname === "/dev") {
                redirectURL = "/me";
            // 500 not logged in
            } else if (sakai_global.nopermissions && sakai.data.me.user.anon && sakai_global.nopermissions.error500){
                redirectURL = "/me";
            }
            return redirectURL;
        }

       /**
         * Check if a redirect should be performed
         */
        var checkForRedirect = function() {
            var qs = new Querystring();
            // Check for url param, path and if user is logged in
            if (qs.get("url") && !sakai.api.User.isAnonymous(sakai.data.me) &&
                (window.location.pathname === "/" || window.location.pathname === "/dev/explore.html" ||
                  window.location.pathname === "/index" || window.location.pathname === "/dev")) {
                    window.location = qs.get("url");
            }
        };

        ////////////////////////
        /////// MESSAGES ///////
        ////////////////////////

        /**
         * Show the number of unread messages
         */
        var setCountUnreadMessages = function(){
            $(topnavUserInboxMessages).text(sakai.api.User.data.me.messages.unread);
        };

        var renderResults = function(){
            renderObj.sakai = sakai;
            $(topnavSearchResultsContainer).html(sakai.api.Util.TemplateRenderer(searchTemplate, renderObj));
            $(topnavSearchResultsBottomContainer).html(sakai.api.Util.TemplateRenderer(searchBottomTemplate, renderObj));
            $("#topnavigation_search_results").show();
        };

        var renderPeople = function(data) {
            var people = [];
            if (data) {
                for (var i in data.results) {
                    if (data.results.hasOwnProperty(i)) {
                        var displayName = sakai.api.User.getDisplayName(data.results[i]);
                        var dottedName = sakai.api.Util.applyThreeDots(displayName, 100, null, null, true);
                        var tempPerson = {
                            "dottedname": dottedName,
                            "name": sakai.api.User.getDisplayName(data.results[i]),
                            "url": data.results[i].homePath
                        };
                        people.push(tempPerson);
                    }
                }
                renderObj.people = people;
                renderObj.peopletotal = data.total;
                renderResults();
            }
        };

        var renderGroups = function(data, category) {
            var groups = [];
            if (data) {
                for (var i in data.results) {
                    if (data.results.hasOwnProperty(i)) {
                        var tempGroup = {
                            "dottedname": sakai.api.Util.applyThreeDots(data.results[i]["sakai:group-title"], 100),
                            "name": data.results[i]["sakai:group-title"],
                            "url": data.results[i].homePath
                        };
                        if (data.results[i]["sakai:group-visible"] == "members-only" || data.results[i]["sakai:group-visible"] == "logged-in-only") {
                            tempGroup["css_class"] = "topnavigation_group_private_icon";
                        } else {
                            tempGroup["css_class"] = "topnavigation_group_public_icon";
                        }
                        groups.push(tempGroup);
                    }
                }
                renderObj.groups = renderObj.groups ||
                {};
                renderObj.groups[category] = groups;
                renderObj.groups[category + "total"] = data.total;
                renderResults();
            }
        };

        var renderContent = function(data) {
            var files = [];
            if (data) {
                for (var i in data.results) {
                    if (data.results.hasOwnProperty(i)) {
                        var mimeType = sakai.api.Content.getMimeTypeData(sakai.api.Content.getMimeType(data.results[i])).cssClass;
                        var tempFile = {
                            "dottedname": sakai.api.Util.applyThreeDots(data.results[i]["sakai:pooled-content-file-name"], 100),
                            "name": data.results[i]["sakai:pooled-content-file-name"],
                            "url": "/content#p=" + sakai.api.Util.safeURL(data.results[i]["_path"]) + "/" + sakai.api.Util.safeURL(data.results[i]["sakai:pooled-content-file-name"]),
                            "css_class": mimeType
                        };
                        files.push(tempFile);
                    }
                }
                renderObj.files = files;
                renderObj.filestotal = data.total;
                renderResults();
            }
        };


        ////////////////////////
        //////// SEARCH ////////
        ////////////////////////

        /**
         * Execute the live search and render the results
         */
        var doSearch = function(){
            var searchText = $.trim($("#topnavigation_search_input").val());
            var filesUrl = sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json");
            var usersUrl = sakai.config.URL.SEARCH_USERS;
            var groupsUrl = sakai.config.URL.SEARCH_GROUPS;
            if (searchText === "*" || searchText === "**") {
                filesUrl = sakai.config.URL.SEARCH_ALL_FILES_ALL;
                usersUrl = sakai.config.URL.SEARCH_USERS_ALL;
                groupsUrl = sakai.config.URL.SEARCH_GROUPS_ALL;
            }

            renderObj.query = searchText;
            searchText = sakai.api.Server.createSearchString(searchText);
            var requests = [];
            requests.push({
                "url": filesUrl,
                "method": "GET",
                "parameters": {
                    "page": 0,
                    "items": 3,
                    "q": searchText
                }
            });
            requests.push({
                "url": usersUrl,
                "method": "GET",
                "parameters": {
                    "page": 0,
                    "items": 3,
                    "sortOn": "lastName",
                    "sortOrder": "asc",
                    "q": searchText
                }
            });
            for (var c = 0; c < sakai.config.worldTemplates.length; c++){
                var category = sakai.config.worldTemplates[c];
                requests.push({
                    "url": groupsUrl,
                    "method": "GET",
                    "parameters": {
                        "page": 0,
                        "items": 3,
                        "q": searchText,
                        "category": category.id
                    }
                });
            }
            

            sakai.api.Server.batch(requests, function(success, data) {
                renderContent($.parseJSON(data.results[0].body));
                renderPeople($.parseJSON(data.results[1].body));
                for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
                    renderGroups($.parseJSON(data.results[2 + c].body), sakai.config.worldTemplates[c].id);
                }
            });
        };


        ////////////////////////
        ////// NAVIGATION //////
        ////////////////////////

        /**
         * Generate a subnavigation item
         * @param {integer} index Index of the subnavigation item in the array
         * @param {Array} array Array of subnavigation items
         */
        var getNavItem = function(index, array){
            var temp = {};
            var item = array[index];
            temp.id = item.id;
            if (temp.id && temp.id == "subnavigation_hr") {
                temp = "hr";
            } else {
                if (sakai.data.me.user.anon && item.anonUrl) {
                    temp.url = item.anonUrl;
                } else {
                    temp.url = item.url;
                    if(item.append){
                        temp.append = item.append;
                    }
                }
                temp.label = sakai.api.i18n.getValueForKey(item.label);
            }
            return temp;
        };

        /**
         * Create a list item for the topnavigation menu including the subnavigation
         * @param {integer} i index of the current item in the loop
         */
        var createMenuList = function(i){
            var temp = getNavItem(i, sakai.config.Navigation);
            // Add in the template categories
            if (sakai.config.Navigation[i].id === "navigation_create_and_add_link"){
                for (var c = 0; c < sakai.config.worldTemplates.length; c++){
                    var category = sakai.config.worldTemplates[c];
                    sakai.config.Navigation[i].subnav.push({
                        "id": "subnavigation_" + category.id + "_link",
                        "label": category.menuLabel || category.title,
                        "url": "/create#l=" + category.id
                    });
                }
            } else if (sakai.config.Navigation[i].id === "navigation_explore_link" || sakai.config.Navigation[i].id === "navigation_anon_explore_link"){
                for (var x = 0; x < sakai.config.worldTemplates.length; x++){
                    var categoryx = sakai.config.worldTemplates[x];
                    sakai.config.Navigation[i].subnav.push({
                        "id": "subnavigation_explore_" + categoryx.id + "_link",
                        "label": categoryx.titlePlural,
                        "url": "/search#l=" + categoryx.id
                    });
                }
            }

            if (sakai.config.Navigation[i].subnav) {
                temp.subnav = [];
                for (var ii in sakai.config.Navigation[i].subnav) {
                    if (sakai.config.Navigation[i].subnav.hasOwnProperty(ii)) {
                        temp.subnav.push(getNavItem(ii, sakai.config.Navigation[i].subnav));
                    }
                }
            }
            return temp;
        };

        /**
         * Initialise the rendering of the topnavigation menu
         */
        var renderMenu = function(){
            var obj = {};
            var menulinks = [];

            for (var i in sakai.config.Navigation) {
                if (sakai.config.Navigation.hasOwnProperty(i)) {
                    var temp = "";
                    if (sakai.data.me.user.anon) {
                        if (sakai.config.Navigation[i].anonymous) {
                            if (sakai.config.Navigation[i].id !== "navigation_anon_signup_link") {
                                temp = createMenuList(i);
                                menulinks.push(temp);
                            } else if (sakai.config.Authentication.allowInternalAccountCreation) {
                                temp = createMenuList(i);
                                menulinks.push(temp);
                            }
                        }
                    } else {
                        if (!sakai.config.Navigation[i].anonymous) {
                            temp = createMenuList(i);
                            menulinks.push(temp);
                        }
                    }
                }
            }
            obj.links = menulinks;
            obj.selectedpage = true;
            obj.sakai = sakai;
            // Get navigation and render menu template
            $(topnavExplore).html(sakai.api.Util.TemplateRenderer(navTemplate, obj));
        };


        /////////////////////////
        ///// BIND ELEMENTS /////
        /////////////////////////

        var handleArrowKeyInSearch = function(up) {
            if ($(topnavSearchResultsContainer).find("li").length) {
                var currentIndex = 0,
                    next = 0;
                if ($(topnavSearchResultsContainer).find("li.selected").length) {
                    currentIndex = $(topnavSearchResultsContainer).find("li").index($(topnavSearchResultsContainer).find("li.selected")[0]);
                    next = up ? (currentIndex - 1 >= 0 ? currentIndex-1 : -1) : (currentIndex + 1 >= $(topnavSearchResultsContainer).find("li").length ? $(topnavSearchResultsContainer).find("li").length-1 : currentIndex +1);
                    $(topnavSearchResultsContainer).find("li.selected").removeClass("selected");
                }
                if (next !== 0 && next === currentIndex){
                    next = 0;
                } else if (next === -1){
                    next = $(topnavSearchResultsContainer).find("li").length - 1;
                }
                if (next !== -1) {
                    $(topnavSearchResultsContainer).find("li:eq(" + next + ")").addClass("selected");
                }
                return false;
            }
        };

        var handleEnterKeyInSearch = function() {
            if ($(topnavSearchResultsContainer).find("li.selected").length) {
                document.location = $(topnavSearchResultsContainer).find("li.selected a").attr("href");
            } else {
                document.location = "/search#q=" + $.trim($("#topnavigation_search_input").val());
            }
        };

        var hideMessageInlay = function(){
            $("#topnavigation_user_messages_container .s3d-dropdown-menu").hide();
            $("#topnavigation_messages_container").removeClass("selected");
        };

        /**
         * Add binding to the elements
         */
        var addBinding = function(){

            sakai.api.Util.hideOnClickOut("#topnavigation_user_messages_container .s3d-dropdown-menu", "", function(){
                hideMessageInlay();
            });

            // Navigation hover binding
            var closeMenu = function(e){
                if ($openMenu.length){
                    $openMenu.children("a").removeClass(topnavigationForceSubmenuDisplayTitle);
                    $openMenu.children(subnavtl).hide();
                    $openMenu.children(navLinkDropdown).children("ul").attr("aria-hidden", "true");
                    $openMenu.children(navLinkDropdown).hide();
                    $openMenu = false;
                }
            };
            var openMenu = function(){
                $("#topnavigation_search_results").hide();
                if ($("#navigation_anon_signup_link:focus").length){
                    $("#navigation_anon_signup_link:focus").blur();
                }

                // close another sub menu if ones open
                closeMenu();

                $openMenu = $(this);
                $openMenu.removeClass("topnavigation_close_override");
                $openMenu.children(subnavtl).show();
                $openMenu.children(navLinkDropdown).children("ul").attr("aria-hidden", "false");
                var $subnav = $openMenu.children(navLinkDropdown);

                var pos = $openMenu.position();
                $subnav.css("left", pos.left - 2);
                $subnav.show();

                if ($openMenu.children(topnavigationExternalLogin).length){
                    // adjust margin of external login menu to position correctly according to padding and width of menu
                    var menuPadding = parseInt($openMenu.css("paddingRight").replace("px", ""), 10) +
                         $openMenu.width() -
                         parseInt($subnav.css("paddingRight").replace("px", ""), 10) -
                         parseInt($subnav.css("paddingLeft").replace("px", ""), 10);
                    var margin = ($subnav.width() - menuPadding) * -1;
                    $subnav.css("margin-left", margin + "px");
                }
            };

            $(hasSubnav).hover(openMenu, closeMenu);

            // remove focus of menu item if mouse is used
            $(hasSubnav + " div").find("a").hover(function(){
                if ($openMenu.length) {
                    $openMenu.find("a").blur();
                }
            });

            // bind down/left/right keys for top menu
            $("#topnavigation_container .s3d-dropdown-menu").keydown(function(e) {
                if (e.which === $.ui.keyCode.DOWN && $(this).hasClass("hassubnav")) {
                    $(this).find("div a:first").focus();
                    return false; // prevent browser page from scrolling down
                } else if (e.which === $.ui.keyCode.LEFT && $(this).attr("id") !== "topnavigation_user_options_login_wrapper") {
                    if ($(this).prevAll("li:first").length > 0){
                        $(this).prevAll("li:first").children("a").focus();
                    } else {
                        $(this).nextAll("li:last").children("a").focus();
                    }
                    return false;
                } else if (e.which === $.ui.keyCode.RIGHT && $(this).attr("id") !== "topnavigation_user_options_login_wrapper") {
                    if ($(this).nextAll("li:first").length > 0){
                        $(this).nextAll("li:first").children("a").focus();
                    } else {
                        $(this).prevAll("li:last").children("a").focus();
                    }
                    return false;
                } else if ($(this).hasClass("hassubnav") && $(this).children("a").is(":focus")) {
                    // if a letter was pressed, search for the first menu item that starts with the letter
                    var keyPressed = String.fromCharCode(e.which).toLowerCase();
                    $(this).find("ul:first").children().each(function(index, item){
                        var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                        if (keyPressed === firstChar){
                            $(item).find("a").focus();
                            return false;
                        }
                    });
                }
            });

            $("#topnavigation_user_inbox_container").keydown(function(e) {
                if (e.which == $.ui.keyCode.LEFT) {
                    if ($("#topnavigation_search_input").length) {
                        // focus on search input
                        $("#topnavigation_search_input").focus();
                    }
                } else if (e.which == $.ui.keyCode.RIGHT) {
                    if ($("#topnavigation_user_options_name").length) {
                        // focus on user options menu
                        $("#topnavigation_user_options_name").focus();
                    }
                }
            });

            // bind up/down/escape keys in sub menu
            $(hasSubnav + " div a").keydown(function(e) {
                if (e.which === $.ui.keyCode.DOWN) {
                    if ($(this).parent().nextAll("li:first").length > 0){
                        $(this).parent().nextAll("li:first").children("a").focus();
                    } else {
                        $(this).parent().prevAll("li:last").children("a").focus();
                    }
                    return false; // prevent browser page from scrolling down
                } else if (e.which === $.ui.keyCode.UP) {
                    if ($(this).parent().prevAll("li:first").length > 0) {
                        $(this).parent().prevAll("li:first").children("a").focus();
                    } else {
                        $(this).parent().nextAll("li:last").children("a").focus();
                    }
                    return false;
                } else if (e.which === $.ui.keyCode.ESCAPE) {
                    $(this).parent().parents("li:first").find("a:first").focus();
                } else {
                    // if a letter was pressed, search for the next menu item that starts with the letter
                    var keyPressed = String.fromCharCode(e.which).toLowerCase();
                    var $activeItem = $(this).parents("li:first");
                    var $menuItems = $(this).parents("ul:first").children();
                    var activeIndex = $menuItems.index($activeItem);
                    var itemFound = false;
                    $menuItems.each(function(index, item){
                        var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                        if (keyPressed === firstChar && index > activeIndex){
                            $(item).find("a").focus();
                            itemFound = true;
                            return false;
                        }
                    });
                    if (!itemFound) {
                        $menuItems.each(function(index, item){
                            var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                            if (keyPressed === firstChar) {
                                $(item).find("a").focus();
                                return false;
                            }
                        });
                    }
                }
            });

            $(hasSubnav + " a").bind("focus",function(){
                if ($(this).parent().hasClass("hassubnav")) {
                    $(this).trigger("mouseover");
                    $(this).parents(".s3d-dropdown-menu").children("a").addClass(topnavigationForceSubmenuDisplayTitle);
                }
            });

            $("#navigation_anon_signup_link").live("hover",function(evt){
                closeMenu();
            });

            // hide the menu after an option has been clicked
            $(hasSubnav + " a").live("click", function(){
                var $parentMenu = $(this).parents(hasSubnav);
                var $parent = $(this).parent(hasSubnav);
                if ($parent.length) {
                    $parentMenu.addClass("topnavigation_close_override");
                }
                $parentMenu.children(subnavtl).hide();
                $parentMenu.children(navLinkDropdown).hide();
            });

            // Make sure that the results only disappear when you click outside
            // of the search box and outside of the results box
            sakai.api.Util.hideOnClickOut("#topnavigation_search_results", "#topnavigation_search_results_container,#topnavigation_search_results_bottom_container,#topnavigation_search_input");

            $("#subnavigation_preferences_link").live("click", function(){
                $(window).trigger("init.accountpreferences.sakai");
                return false;
            });

            $("#topnavigation_search_input").keyup(function(evt){
                var val = $.trim($(this).val());
                if (val !== "" && evt.keyCode !== 16 && val !== lastSearchVal) {
                    if (searchTimeout) {
                        clearTimeout(searchTimeout);
                    }
                    searchTimeout = setTimeout(function() {
                        doSearch();
                        lastSearchVal = val;
                    }, 200);
                } else if (val === "") {
                    lastSearchVal = val;
                    $("#topnavigation_search_results").hide();
                }
            });

            $(".topnavigation_search .s3d-search-button").bind("click", handleEnterKeyInSearch);

            $("#topnavigation_search_input").keydown(function(evt){
                var val = $.trim($(this).val());
                // 40 is down, 38 is up, 13 is enter
                if (evt.keyCode === 40 || evt.keyCode === 38) {
                    handleArrowKeyInSearch(evt.keyCode === 38);
                    evt.preventDefault();
                } else if (evt.keyCode === 13) {
                    handleEnterKeyInSearch();
                    evt.preventDefault();
                }
            });

            $(".topnavigation_user_dropdown a, .topnavigation_external_login a").keydown(function(e) {
                // if user is signed in and tabs out of user menu, or the external auth menu, close the sub menu
                if (!e.shiftKey && e.which == $.ui.keyCode.TAB) {
                    closeMenu();
                }
            });

            $("#topnavigation_user_options_login_external").click(function(){return false;});

            $("#topnavigation_user_options_login_button_login").keydown(function(e) {
                // if user is not signed in we need to check when they tab out of the login form and close the login menu
                if (!e.shiftKey && e.which == $.ui.keyCode.TAB) {
                    mouseOverSignIn = false;
                    $(topnavUserLoginButton).trigger("mouseout");
                    $("html").trigger("click");
                }
            });

            $("#topnavigation_user_options_name, #topnavigation_user_options_login_external").keydown(function(e) {
                // hide signin or user options menu when tabbing out of the last menu option
                if (!e.shiftKey && e.which == $.ui.keyCode.TAB) {
                    closeMenu();
                }
            });

            $(topnavUserOptions).bind("click", decideShowLoginLogout);

            var doLogin = function(){
                $(topnavUserOptionsLoginButtonSigningIn).show();
                $(topnavUserOptionsLoginButtonCancel).hide();
                $(topnavuserOptionsLoginButtonLogin).hide();
                sakai.api.User.login({
                    "username": $(topnavUseroptionsLoginFieldsUsername).val(),
                    "password": $(topnavUseroptionsLoginFieldsPassword).val()
                }, function(success){
                    if (success) {
                        var redirectURL = getRedirectURL();
                        if (redirectURL === window.location.pathname + window.location.search + window.location.hash) {
                            window.location.reload(true);
                        } else {
                            window.location = redirectURL;
                        }
                    } else {
                        $(topnavUserOptionsLoginButtonSigningIn).hide();
                        $(topnavUserOptionsLoginButtonCancel).show();
                        $(topnavuserOptionsLoginButtonLogin).show();
                        $(topnavUseroptionsLoginFieldsPassword).val("");
                        $(topnavUseroptionsLoginFieldsUsername).focus();
                        $(topnavUseroptionsLoginFieldsUsername).addClass("failedloginusername");
                        $(topnavUseroptionsLoginFieldsPassword).addClass("failedloginpassword");
                        $(topnavUserOptionsLoginForm).valid();
                        $(topnavUseroptionsLoginFieldsUsername).removeClass("failedloginusername");
                        $(topnavUseroptionsLoginFieldsPassword).removeClass("failedloginpassword");
                    }
                });
            };

            $.validator.addMethod("failedloginusername", function(value, element){
                return false;
            }, sakai.api.i18n.getValueForKey("INVALID_USERNAME_OR_PASSWORD"));
            $.validator.addMethod("failedloginpassword", function(value, element){
                return false;
            }, "");
            var validateOpts = {
                submitHandler: function(form){
                    doLogin();
                }
            };
            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($(topnavUserOptionsLoginForm), validateOpts, true);

            // Make sure that the sign in dropdown does not disappear after it has
            // been clicked
            var mouseOverSignIn = false;
            var mouseClickedSignIn = false;
            $(topnavUserOptionsLoginFields).live('mouseenter', function(){
                mouseOverSignIn = true; 
            }).live('mouseleave', function(){ 
                mouseOverSignIn = false; 
            });
            $(topnavUserOptionsLoginFields).click(function(){
                mouseClickedSignIn = true;
                $(topnavUserOptionsLoginFields).addClass(topnavigationForceSubmenuDisplay);
                $(topnavigationlogin).addClass(topnavigationForceSubmenuDisplayTitle);
            });
            $("html").click(function(){ 
                if (!mouseOverSignIn) {
                    mouseClickedSignIn = false;
                    $(topnavUserOptionsLoginFields).removeClass(topnavigationForceSubmenuDisplay);
                    $(topnavigationlogin).removeClass(topnavigationForceSubmenuDisplayTitle);
                }
                closeMenu();
            });

            $(topnavUserLoginButton).bind("focus",function(){
                $(this).trigger("mouseover");
                mouseOverSignIn = true;
                $(topnavUserOptionsLoginFields).trigger('click');
                $(topnavigationlogin).addClass(topnavigationForceSubmenuDisplayTitle);
            });

            $("#topnavigation_search_input,#navigation_anon_signup_link,#topnavigation_user_inbox_container").bind("focus",function(evt){
                mouseOverSignIn = false;
                $(topnavUserLoginButton).trigger("mouseout");
                $("html").trigger("click");

                if ($(this).attr("id") === "topnavigation_search_input") {
                // Search binding (don't fire on following keyup codes: shift)
                    $(this).keyup();
                    if ($.trim($("#topnavigation_search_input").val())) {
                        $("#topnavigation_search_results").show();
                    }
                }
            });

            $(topnavigationlogin).hover(function(){
                if ($("#navigation_anon_signup_link:focus").length){
                    $("#navigation_anon_signup_link:focus").blur();
                }
                closeMenu();
                $(topnavUserOptionsLoginFields).show();
            },
            function(){
                $(topnavUserOptionsLoginFields).hide();
                if ($(this).children(topnavigationExternalLogin).length) {
                    $(this).children(topnavigationExternalLogin).find("ul").attr("aria-hidden", "true");
                }
            });
            
            $("#topnavigation_message_reply").live("click", hideMessageInlay);
            $("#topnavigation_message_readfull").live("click", hideMessageInlay);
            $(".no_messages .s3d-no-results-container a").live("click", hideMessageInlay);

            $(window).bind("updated.messageCount.sakai", setCountUnreadMessages);
        };


        //////////////
        // OVERLAYS //
        //////////////

        var renderOverlays = function(){
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
        };

        // Add content

        $(".sakai_add_content_overlay, #subnavigation_add_content_link").live("click", function(ev) {
            $(window).trigger("init.newaddcontent.sakai");
            return false;
        });

        // Send a message

        $(".sakai_sendmessage_overlay").live("click", function(ev){
            var el = $(this);
            var person = false;
            var people = [];
            if (el.attr("sakai-entityid") && el.attr("sakai-entityname")){
                var userIDArr = el.attr("sakai-entityid").split(",");
                var userNameArr = sakai.api.Security.safeOutput(el.attr("sakai-entityname")).split(",");
                for(var i = 0; i < userNameArr.length; i++){
                    people.push({
                        "uuid": userIDArr[i],
                        "username": userNameArr[i],
                        "type": el.attr("sakai-entitytype") || "user"
                    });
                }
            }
            $(window).trigger("initialize.sendmessage.sakai", [people]);
        });

        // Add to contacts

        $(".sakai_addtocontacts_overlay").live("click", function(ev){
            var el = $(this);
            if (el.attr("sakai-entityid") && el.attr("sakai-entityname")){
                var person = {
                    "uuid": el.attr("sakai-entityid"),
                    "displayName": el.attr("sakai-entityname"),
                    "pictureLink": el.attr("sakai-entitypicture") || false
                };
                $(window).trigger("initialize.addToContacts.sakai", [person]);
            }
        });

        // Join group

        $(".sakai_joingroup_overlay").live("click", function(ev){
            var el = $(this);
            if (el.attr("data-groupid")){
                $(window).trigger("initialize.joingroup.sakai", [el.attr("data-groupid"), el]);
            }
        });
        $("#topnavigation_scroll_to_top").live("click", function(ev){
            $("html:not(:animated),body:not(:animated)").animate({
                scrollTop: $("html").offset().top
            }, 500 );
        });

        $(window).scroll(function(ev){
            if($(window).scrollTop() > 800){
                $("#topnavigation_scroll_to_top").show("slow");
            } else {
                $("#topnavigation_scroll_to_top").hide("slow");
            }
        });


        $("#topnavigation_messages_container").live("click", function(){
            sakai.api.Communication.getAllMessages("inbox", false, false, 1, 0, "_created", "desc", function(success, data){
                var dataPresent = false;
                if (data.results && data.results[0]) {
                    dataPresent = true;
                }
                $("#topnavigation_messages_container").addClass("selected");
                var $messageContainer = $("#topnavigation_user_messages_container .s3d-dropdown-menu");
                $messageContainer.html(sakai.api.Util.TemplateRenderer("topnavigation_messages_dropdown_template", {data: data, sakai: sakai, dataPresent: dataPresent}));
                $messageContainer.show();
            });
        }); 


        /////////////////////////
        /////// INITIALISE //////
        /////////////////////////

        /**
         * Initialise the topnavigation widget
         */
        var doInit = function(){
            checkForRedirect();
            renderMenu();
            renderUser();
            setCountUnreadMessages();
            setUserName();
            addBinding();
            renderOverlays();
        };

        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("topnavigation");
});
