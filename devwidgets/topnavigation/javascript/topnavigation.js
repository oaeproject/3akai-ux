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


        ////////////////////////
        ///// USER ACTIONS /////
        ////////////////////////

        /**
         * Fill in the user name
         */
        var setUserName = function(){
            $(topnavUserOptionsName).text(sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(sakai.data.me.profile), 100));
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
                "auth": auth
            }));
        };


        ////////////////////////
        /////// MESSAGES ///////
        ////////////////////////

        /**
         * Show the number of unread messages
         */
        var setCountUnreadMessages = function(){
            $(topnavUserInboxMessages).text("(" + sakai.data.me.messages.unread + ")");
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
                        var tempPerson = {
                            "dottedname": sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(data.results[i]), 100),
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
                        var mimeType = sakai.api.Content.getMimeTypeData(data.results[i]).cssClass;
                        var tempFile = {
                            "dottedname": sakai.api.Util.applyThreeDots(data.results[i]["sakai:pooled-content-file-name"], 100),
                            "name": data.results[i]["sakai:pooled-content-file-name"],
                            "url": "/content#p=" + data.results[i]["_path"] + "/" + data.results[i]["sakai:pooled-content-file-name"],
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
            temp.id = array[index].id;
            if (temp.id && temp.id == "subnavigation_hr") {
                temp = "hr";
            } else {
                if (sakai.data.me.user.anon && array[index].anonUrl) {
                    temp.url = array[index].anonUrl;
                } else {
                    temp.url = array[index].url;
                }
                temp.label = sakai.api.i18n.General.getValueForKey(array[index].label);
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
                        "label": category.title,
                        "url": "/create#l=categories/" + category.id
                    });
                }
            } else if (sakai.config.Navigation[i].id === "navigation_explore_link" || sakai.config.Navigation[i].id === "navigation_anon_explore_link"){
                for (var x = 0; x < sakai.config.worldTemplates.length; x++){
                    var categoryx = sakai.config.worldTemplates[x];
                    sakai.config.Navigation[i].subnav.push({
                        "id": "subnavigation_explore_" + categoryx.id + "_link",
                        "label": categoryx.title,
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
                            temp = createMenuList(i);
                            menulinks.push(temp);
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

        /**
         * Add binding to the elements
         */
        var addBinding = function(){
            // Navigation hover binding
            $(hasSubnav).hover(function(){
                var $li = $(this);
                $li.removeClass("topnavigation_close_override");
                $li.children(subnavtl).show();
                var $subnav = $li.children(navLinkDropdown);

                var pos = $li.position();
                $subnav.css("left", pos.left - 2);
                $subnav.show();
            }, function(){
                var $li = $(this);
                $li.children(subnavtl).hide();
                $li.children(navLinkDropdown).hide();
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

            // Search binding (don't fire on following keyup codes: shift)
            $("#topnavigation_search_input").focus(function(){
                $(this).keyup();
                if ($.trim($("#topnavigation_search_input").val())){
                    $("#topnavigation_search_results").show();
                }
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

            $(topnavUserLoginButton).bind("focus",function(){
                $(this).trigger("mouseover");
            });
            
            $("#topnavigation_search_input").bind("focus",function(evt){
                $(topnavUserLoginButton).trigger("mouseout");
            });

            $(topnavUserOptions).bind("click", decideShowLoginLogout);

            $(topnavUserOptionsLoginForm).submit(function(){
                $(topnavUserOptionsLoginButtonSigningIn).show();
                $(topnavUserOptionsLoginButtonCancel).hide();
                $(topnavuserOptionsLoginButtonLogin).hide();
                sakai.api.User.login({
                    "username": $(topnavUseroptionsLoginFieldsUsername).val(),
                    "password": $(topnavUseroptionsLoginFieldsPassword).val()
                }, function(success){
                    if (success) {
                        var qs = new Querystring();
                        // Go to You when you're on explore page
                        if (window.location.pathname === "/dev/explore.html" || window.location.pathname === "/register"
                            || window.location.pathname === "/index" || window.location.pathname === "/") {
                            window.location = "/me";
                        // 403/404 and not logged in
                        } else if (sakai_global.nopermissions && sakai.data.me.user.anon && !sakai_global.nopermissions.error500){
                            var url = qs.get("url");
                            if (url){
                                window.location = url;
                            } else {
                                location.reload(true);
                            }
                        // 500 not logged in
                        } else if (sakai_global.nopermissions && sakai.data.me.user.anon && sakai_global.nopermissions.error500){
                            window.location = "/me";
                        } else {
                            // Just reload the page
                            location.reload(true);
                        }
                    } else {
                        $(topnavUserOptionsLoginButtonSigningIn).hide();
                        $(topnavUserOptionsLoginButtonCancel).show();
                        $(topnavuserOptionsLoginButtonLogin).show();
                        $(topnavUserOptionsLoginForm).addClass("topnavigation_user_options_login_sign_in_error_margin");
                        $(topnavUserOptionsLoginError).show();
                        $(topnavUseroptionsLoginFieldsUsername).focus();
                    }
                });
                return false;
            });
            
            // Make up for IE8 to submit login on Enter
            // http://www.thefutureoftheweb.com/blog/submit-a-form-in-ie-with-enter
            $(topnavUserOptionsLoginForm + " input").keydown(function(e){
                if (e.keyCode === 13) {
                    $(this).parents('form').submit();
                    e.preventDefault();
                }
            });

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
            });

            $(topnavigationlogin).hover(function(){
                var $menu = $(this);
                if ($menu.children(topnavigationExternalLogin).length){
                    // adjust margin of external login menu to position correctly according to padding and width of menu
                    var $externalAuth = $menu.children(topnavigationExternalLogin);
                    var menuPadding = parseInt($menu.css("paddingRight").replace("px", ""))
                         + $menu.width()
                         - parseInt($externalAuth.css("paddingRight").replace("px", ""))
                         - parseInt($externalAuth.css("paddingLeft").replace("px", ""));

                    var margin = ($externalAuth.width() - menuPadding) * -1;
                    $externalAuth.css("margin-left", margin + "px");
                }
                $(topnavUserOptionsLoginFields).show();
            },
            function(){
                $(topnavUserOptionsLoginFields).hide();
            });

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
                var userNameArr = el.attr("sakai-entityname").split(",");
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
                    "username": el.attr("sakai-entityname"),
                    "picture": el.attr("sakai-entitypicture") || false
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


        /////////////////////////
        /////// INITIALISE //////
        /////////////////////////

        /**
         * Initialise the topnavigation widget
         */
        var doInit = function(){
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
