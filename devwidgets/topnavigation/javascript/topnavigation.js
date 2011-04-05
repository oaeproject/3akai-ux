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

        // Classes
        var subnavtrClass = "hassubnav_tr";

        // Elements
        var subnavtl = ".hassubnav_tl";
        var navLinkDropdown = ".navigation_link_dropdown";
        var hasSubnav = ".hassubnav";
        var topnavExplore = ".topnavigation_explore";
        var topnavUserOptions = ".topnavigation_user_options";
        var topnavUserDropdown = ".topnavigation_user_dropdown";

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

        // Templates
        var navTemplate = "navigation_template";
        var searchTemplate = "search_template";
        var searchBottomTemplate = "search_bottom_template";
        var topnavUserTemplate = "topnavigation_user_template";


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
            $(topnavUserContainer).html(sakai.api.Util.TemplateRenderer(topnavUserTemplate, {"anon" : sakai.data.me.user.anon}));
        };

        ////////////////////////
        /////// MESSAGES ///////
        ////////////////////////

        /**
         * Show the number of unread messages
         */
        var setCountUnreadMessages = function(){
            $(topnavUserInboxMessages).text(sakai.data.me.messages.unread);
        };


        ////////////////////////
        //////// SEARCH ////////
        ////////////////////////

        /**
         * Execute the live search and render the results
         * @param {Object} searchText Trimmed query put in by the user
         */
        var doSearch = function(searchText){

            var renderObj = {
                "people":"",
                "groups":"",
                "files":"",
                "peopletotal":0,
                "groupstotal":0,
                "filestotal":0,
                "query":searchText
            };

            var filesUrl = sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json");
            var usersUrl = sakai.config.URL.SEARCH_USERS;
            var groupsUrl = sakai.config.URL.SEARCH_GROUPS;
            if (searchText === "*" || searchText === "**") {
                filesUrl = sakai.config.URL.SEARCH_ALL_FILES_ALL;
                usersUrl = sakai.config.URL.SEARCH_USERS_ALL;
                groupsUrl = sakai.config.URL.SEARCH_GROUPS_ALL;
            }

            // People Search
            $.ajax({
                cache: false,
                url: usersUrl,
                data: {
                    page: 0,
                    items: 4,
                    q: searchText,
                    sortOn: "lastName",
                    sortOrder: "asc"
                },
                success: function(data){
                    var people = [];
                    for(var i in data.results){
                        if(data.results.hasOwnProperty(i)){
                            var tempPerson = {
                                "dottedname" : sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(data.results[i]), 100),
                                "name" : sakai.api.User.getDisplayName(data.results[i]),
                                "url" : data.results[i].homePath
                            };
                            people.push(tempPerson);
                        }
                    }
                    renderObj.people = people;
                    renderObj.peopletotal = data.total;

                    $(topnavSearchResultsContainer).html(sakai.api.Util.TemplateRenderer(searchTemplate, renderObj));
                    $(topnavSearchResultsBottomContainer).html(sakai.api.Util.TemplateRenderer(searchBottomTemplate, renderObj));
                    $("#topnavigation_search_results").show();
                },
                error: function(xhr, textStatus, thrownError){
                    debug.log(xhr, textStatus, thrownError);
                }
            });

            // Groups Search
            $.ajax({
                cache: false,
                url: groupsUrl,
                data: {
                    page: 0,
                    items: 4,
                    q: searchText
                },
                success: function(data){
                    var groups = [];
                    for(var i in data.results){
                        if(data.results.hasOwnProperty(i)){
                            var tempGroup = {
                                "dottedname" : sakai.api.Util.applyThreeDots(data.results[i]["sakai:group-title"], 100),
                                "name" : data.results[i]["sakai:group-title"],
                                "url" : data.results[i].homePath
                            };
                            if(data.results[i]["sakai:group-visible"] == "members-only" || data.results[i]["sakai:group-visible"] == "logged-in-only"){
                                tempGroup["css_class"] = "topnavigation_group_private_icon";
                            }else{
                                tempGroup["css_class"] = "topnavigation_group_public_icon";
                            }
                            groups.push(tempGroup);
                        }
                    }
                    renderObj.groups = groups;
                    renderObj.groupstotal = data.total;

                    $(topnavSearchResultsContainer).html(sakai.api.Util.TemplateRenderer(searchTemplate, renderObj));
                    $(topnavSearchResultsBottomContainer).html(sakai.api.Util.TemplateRenderer(searchBottomTemplate, renderObj));
                    $("#topnavigation_search_results").show();
                },
                error: function(xhr, textStatus, thrownError){
                    debug.log(xhr, textStatus, thrownError);
                }
            });

            // Files Search
            $.ajax({
                cache: false,
                url: filesUrl,
                data: {
                    page: 0,
                    items: 4,
                    q: searchText
                },
                success: function(data){
                    var files = [];
                    for(var i in data.results){
                        if(data.results.hasOwnProperty(i)){
                            var tempFile = {
                                "dottedname" : sakai.api.Util.applyThreeDots(data.results[i]["sakai:pooled-content-file-name"], 100),
                                "name" : data.results[i]["sakai:pooled-content-file-name"],
                                "url" : "/content#content_path=/p/" + data.results[i]["jcr:name"],
                                "css_class" : sakai.config.MimeTypes[data.results[i]["_mimeType"]].cssClass
                            };
                            files.push(tempFile);
                        }
                    }
                    renderObj.files = files;
                    renderObj.filestotal = data.total;

                    $(topnavSearchResultsContainer).html(sakai.api.Util.TemplateRenderer(searchTemplate, renderObj));
                    $(topnavSearchResultsBottomContainer).html(sakai.api.Util.TemplateRenderer(searchBottomTemplate, renderObj));
                    $("#topnavigation_search_results").show();
                },
                error: function(xhr, textStatus, thrownError){
                    debug.log(xhr, textStatus, thrownError);
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
            // Get navigation and render menu template
            $(topnavExplore).html(sakai.api.Util.TemplateRenderer(navTemplate, obj));
        };


        /////////////////////////
        ///// BIND ELEMENTS /////
        /////////////////////////

        /**
         * Add binding to the elements
         */
        var addBinding = function(){
            // Navigation hover binding
            $(hasSubnav).hover(function(){
                var $li = $(this);
                $li.addClass(subnavtrClass);
                $li.children(subnavtl).show();
                var $subnav = $li.children(navLinkDropdown);

                var pos = $li.position();
                $subnav.css("left", pos.left - 8);
                $subnav.css("margin-top", "7px");
                $subnav.show();
            }, function(){
                var $li = $(this);
                $li.children(subnavtl).hide();
                $li.removeClass(subnavtrClass);
                $li.children(navLinkDropdown).hide();
            });

            // Search binding (don't fire on following keyup codes: shift)
            $("#topnavigation_search_input").focus(function(){
                $(this).keyup();
            });

            $("#subnavigation_preferences_link").live("click", function(){
                $(window).trigger("init.accountpreferences.sakai");
                return false;
            });

            $("#topnavigation_search_input").keyup(function(evt){
                var val = $.trim($(this).val());
                if (val && evt.keyCode != 16) {
                    doSearch(val);
                }else if(!val){
                    $("#topnavigation_search_results").hide();
                }
            });

            $(topnavUserOptions).bind("click", decideShowLoginLogout);

            $(topnavUserOptionsLoginForm).submit(function(){
                $(topnavUserOptionsLoginButtonSigningIn).show();
                $(topnavUserOptionsLoginButtonCancel).hide();
                $(topnavuserOptionsLoginButtonLogin).hide();
                $(topnavUserOptionsLoginError).hide();
                $(this).removeClass("topnavigation_user_options_login_sign_in_error_margin");
                sakai.api.User.login({
                    "username": $(topnavUseroptionsLoginFieldsUsername).val(),
                    "password": $(topnavUseroptionsLoginFieldsPassword).val()
                }, function(success){
                    if (success) {
                        // Go to You when you're on explore page
                        if (window.location.pathname === "/dev/directory2.html" || window.location.pathname === "/dev/create_new_account2.html") {
                            window.location = "/dev/user.html";
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
                    }
                });
                return false;
            });
        };

        //////////////
        // OVERLAYS //
        //////////////

        var renderOverlays = function(){
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
        };

        // Create a group

        $(window).bind("sakai.overlays.createGroup", function(ev){
            $("#creategroupcontainer").show();
            // Load the creategroup widget.
            $(window).trigger("init.creategroup.sakai");
        });

        $("#subnavigation_simple_group_link, .sakai_create_group_overlay").live("click", function(){
            $(window).trigger("sakai.overlays.createGroup");
        });

        // Add content

        $(".sakai_add_content_overlay, #subnavigation_add_content_link").live("click", function(ev) {
            //$(window).trigger("init.fileupload.sakai");
            $(window).trigger("init.newaddcontent.sakai");
        });

        // Send a message

        $(".sakai_sendmessage_overlay").live("click", function(ev){
            var el = $(this);
            var person = false;
            if (el.attr("sakai-entityid") && el.attr("sakai-entityname")){
                person = {
                    "uuid": el.attr("sakai-entityid"),
                    "username": el.attr("sakai-entityname"),
                    "type": el.attr("sakai-entitytype") || "user"
                };
            }
            $(window).trigger("initialize.sendmessage.sakai", [person]);
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
