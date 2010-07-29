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

/*global $, Config, History, Querystring, sdata, jQuery, Widgets */
var sakai = sakai || {};
sakai.site = function(){


    /////////////////////////////
    // CONFIG and HELP VARS
    /////////////////////////////

    var currentSettingsOpen = false;
    var startSaving = true;

    // Config variables
    sakai.site.minHeight = 400;
    sakai.site.autosaveinterval = 17000;
    sakai.site.createChildPageByDefault = false;
    sakai.site.siteAdminJS = "/dev/_javascript/site_admin.js";

    // Help variables - public as some of these needs to be shared with admin section
    sakai.site.cur = 0;
    sakai.site.curScroll = false;
    sakai.site.minTop = false;
    sakai.site.last = 0;
    sakai.site.currentsite = false;
    sakai.site.meObject = false;
    sakai.site.isCollaborator = false;
    sakai.site.site_info = {};
    sakai.site.site_info._pages = {};
    /*sakai.site.pages = false;
    sakai.site.pageconfiguration = false;*/
    sakai.site.pagetypes = {};
    sakai.site.pagecontents = {};
    sakai.site.portaljson = false;
    sakai.site.portaljsons = {};
    sakai.site.isEditingNavigation = false;
    sakai.site.currentEditView = false;
    sakai.site.timeoutid = 0;
    sakai.site.selectedpage = false;
    sakai.site.showingInsertMore = false;
    sakai.site.inEditView = false;
    sakai.site.versionHistoryNeedsReset = false;

    // Add Goodies related fields
    var addGoodiesDialog = "#add_goodies_dialog";
    var addGoodiesTrigger = '#add-goodies';
    var addGoodiesListContainer = "#add_goodies_body";
    var addGoodiesListTemplate = "add_goodies_body_template";
    var goodiesAddButton = ".goodies_add_button";
    var goodiesRemoveButton = ".goodies_remove_button";
    var addRow = "#row_add_";
    var removeRow = "#row_remove_";

    // URLs
    sakai.site.urls = {
        CURRENT_SITE_ROOT: function() { return sakai.config.URL.SDATA_FETCH + "/sites/" + sakai.site.currentsite.id + "/"; },
        CURRENT_SITE_PAGES: function() { return sakai.config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")); },
        WEBPAGE_CONTENT: function() { return sakai.config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")) + "/content"; },
        WEBPAGE_CONTENT_AUTOSAVE_FULL: function() { return sakai.config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")) + "/_content"; },
        PAGE_CONFIGURATION: function() { return sakai.config.URL.SITE_PAGECONFIGURATION.replace(/__SITEID__/, sakai.site.currentsite.id); },
        SITE_NAVIGATION: function() { return sakai.config.URL.SITE_NAVIGATION.replace(/__SITEID__/, sakai.site.currentsite.id); },
        SITE_NAVIGATION_CONTENT : function() { return sakai.config.URL.SITE_NAVIGATION_CONTENT.replace(/__SITEID__/, sakai.site.currentsite.id); },
        LOGIN : function() { return sakai.config.URL.GATEWAY_URL + "?url=" + $.URLEncode(document.location.pathname + document.location.search + document.location.hash); },
        PRINT_PAGE: function() { sakai.config.URL.SITE_PRINT_URL.replace(/__CURRENTSITENAME__/, sakai.site.currentsite.name); },
        SITE_URL: function() { return sakai.config.URL.SITE_URL_SITEID.replace(/__SITEID__/,sakai.site.currentsite.id); },
        PAGE_CONFIGURATION_PREFERENCE: function() { return sakai.config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, sakai.site.currentsite.id); }
    };


    // Cache all HTML elements which are ID lookups in jQuery
    // This has several advantages:
    //    -it allows remapping of html IDs easily
    //    -ensures that only one DOM access is made for each element
    //    -$ in the beginning reminds us that it is a jQuery wrapped set

    var $site_management = $("#site_management");
    var $site_management_members_link = $("#site_management_members_link");
    var $site_management_basic_link = $("#site_management_basic_link");
    var $site_management_appearance_link = $("#site_management_appearance_link");
    var $site_management_files_link = $("#site_management_files_link");
    var $site_settings_link = $("#site_settings_link");
    var $li_edit_page_divider = $("#li_edit_page_divider");
    var $li_edit_page = $("#li_edit_page");
    var $add_a_new = $("#add_a_new");
    var $initialcontent = $("#initialcontent");
    var $page_nav_content = $("#page_nav_content");
    var $sitetitle = $("#sitetitle");
    var $site_join_button = $("#site_join_button");
    var $widget_chat = $("#widget_chat");
    var $loginLink = $("#loginLink");
    var $insert_more_menu = $("#insert_more_menu");
    var $more_menu = $("#more_menu");
    var $pagetitle = $("#pagetitle");
    var $webpage_edit = $("#webpage_edit");
    var $tool_edit = $("#tool_edit");
    var $sidebar_content_pages = $("#sidebar-content-pages");
    var $main_content_div = $("#main-content-div");
    var $more_link = $("#more_link");


    /////////////////////////////
    // HELP FUNCTIONS
    /////////////////////////////

    /**
     * Get document height
     * @param {Object} doc
     * @return {Int} height of supplied document
     */
    sakai.site.getDocHeight = function(doc){
        var docHt = 0, sh, oh;
        if (doc.height) {
            docHt = doc.height;
        } else {
            if (doc.body) {
                if (doc.body.scrollHeight) {
                    docHt = sh = doc.body.scrollHeight;
                }
                if (doc.body.offsetHeight) {
                    docHt = oh = doc.body.offsetHeight;
                }
                if (sh && oh) {
                    docHt = Math.max(sh, oh);
                }
            }
        }

        return docHt;
    };


    /**
     * Clone an object
     * @param {Object} obj
     * @return {Object} cloned object
     */
    sakai.site.clone =  function(obj){
        if (obj === null || typeof(obj) !== 'object') {
            return obj;
        }
        else {
            return jQuery.extend(true, {}, obj);
        }
    };

    /**
     * Transform a date into more readable date string
     * @param {Object} day
     * @param {Object} month
     * @param {Object} year
     * @param {Object} hour
     * @param {Object} minute
     * @return {String} formatted date string
     */
    sakai.site.transformDate = function(day, month, year, hour, minute){
        var string = "";
        var months_lookup = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"};
        string += months_lookup[month] + " " + day + ", " + year + " " + ("00" + hour).slice(-2) + ":" + ("00" + minute).slice(-2);
        return string;
    };

    /**
     * Cretes URL safe page title
     * @param title {String} The title of a page
     * @returns {String} URL safe title
     */
    sakai.site.createURLSafeTitle = function(title) {
        var url_safe_title = title.toLowerCase();
        url_safe_title = url_safe_title.replace(/ /g,"-");
        url_safe_title = url_safe_title.replace(/'/g,"");
        url_safe_title = url_safe_title.replace(/"/g,"");
        url_safe_title = url_safe_title.replace(/[:]/g,"");
        url_safe_title = url_safe_title.replace(/[?]/g,"");
        url_safe_title = url_safe_title.replace(/[=]/g,"");

        var regexp = new RegExp("[^a-z0-9_-]", "gi");
        url_safe_title = url_safe_title.replace(regexp,"-");

        return url_safe_title;
    };

    /**
     * Creates a unique name based on a URL
     * @param i_url {String} The URL the name is based on
     * @returns {String} A URLsafe name string
     */
    sakai.site.createURLName = function(i_url) {
        var urlName = "";
        if ((typeof i_url === "string") & (i_url !== "")) {
            i_url = i_url.replace(/\/_pages/g, "");
            urlName = i_url.replace(/[\/]/g, "");
        }
        return urlName;
    };

    var showAdminElements = function() {

        // Show admin elements
        $li_edit_page_divider.show();
        $li_edit_page.show();
        $add_a_new.show();
        $site_management.show();

        // Load admin part from a separate file
        $.getScript(sakai.site.siteAdminJS);
        
    }

    /////////////
    // LOADING //
    /////////////

    /**
     * Main load flow - loads up all the data needed for sites and sets the visibility of html elements
     * @return void
     */
    var loadControl = function() {

        var siteid = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];
        sakai.site.currentsite = siteid.split(".")[0];

        $.ajax({
            url: "/sites/" + sakai.site.currentsite + ".json",
            dataType: "json",
            cache: false,
            success: function(response){

                if (response){
                    sakai.site.currentsite = response;
                }

                // Adjust links if not on dev
                if (!sakai.site.currentsite) {
                    document.location = "/dev/";
                } else {
                    var sitepath = sakai.site.currentsite.id;
                    $site_management_members_link.attr("href", $site_management_members_link.attr("href") + sitepath);
                    $site_management_basic_link.attr("href", $site_management_basic_link.attr("href") + sitepath);
                    $site_management_appearance_link.attr("href", $site_management_appearance_link.attr("href") + sitepath);
                    $site_settings_link.attr("href", $site_settings_link.attr("href") + "?site=" + sitepath);
                    $site_management_files_link.attr("href", $site_management_files_link.attr("href") + sitepath);
                    $more_link.attr("href", $more_link.attr("href") + "?url=" +location.pathname);
                }

                // Determine whether the user is maintainer, if yes show and load admin elements
                sakai.site.isCollaborator = sakai.lib.site.authz.isUserMaintainer(sakai.site.currentsite);
                if (sakai.site.isCollaborator) {
                    showAdminElements();
                }

                // Check user's login status
                if (sakai.data.me.user.userid){
                    $("#loginLink").hide();
                    sakai._isAnonymous = false;
                } else {
                    sakai._isAnonymous = true;
                    $loginLink.show();
                }

                // Show initial content and display site title
                $initialcontent.show();
                $sitetitle.text(sakai.api.Security.saneHTML(sakai.site.currentsite.name));

                // Setting up the Join this site button
                if (shouldShowJoinButton()) {
                    if (shouldDisableJoinButton()) {
                        $site_join_button.find("span").text("Request for membership pending approval").show().attr('disabled','disabled');
                    } else {
                        if (joinRequiresApproval()) {
                            $site_join_button.find("span").text("Request to join this site");
                        }
                        // Bind 'Join this site' button
                        $site_join_button.live("click", function(ev){
                            requestJoin();
                        });
                    }
                    $site_join_button.show();
                }

                // Refresh site_info object
                sakai.site.refreshSiteInfo();

                // Load site navigation
                sakai.site.loadSiteNavigation();

            },
            error: function(xhr, textStatus, thrownError) {

                fluid.log("site.js: Could not load site object. \n HTTP status code: " + xhr.status);

            }
        });
    };
    
    var shouldShowJoinButton = function() {
        return ((sakai.site.currentsite["sakai:joinable"] === "yes" 
            || sakai.site.currentsite["sakai:joinable"] === "withauth")
        && !sakai.site.isCollaborator);
    }
    
    var shouldDisableJoinButton = function() {
        return sakai.site.currentsite[":isPendingApproval"] === true;
    }
    
    var joinRequiresApproval = function() {
        return sakai.site.currentsite["sakai:joinable"] === "withauth";
    }


    /**
     * Function which (re)-loads the information available on a site (async)
     * @param pageToOpen {String} URL safe title of a page which we want to open after the site info object refresh (optional)
     * @return void
     */
    sakai.site.refreshSiteInfo = function(pageToOpen) {

        // Load site information
        $.ajax({
            url: sakai.config.URL.SEARCH_PAGES,
            cache: false,
            async: false,
            data: {
                "path": "/sites/" + sakai.site.currentsite.id,
                "items": 255
            },
            success: function(response) {

                // Init
                response = response.results;

                // Sort site objects by their path
                var compareURL = function(a,b) {
                    return a.path>b.path ? 1 : a.path<b.path ? -1 : 0;
                };
                response.sort(compareURL);

                // Create site_info object, the unique key being the partial path of the page from the root of the site
                // This will also keep the alphabetical order
                sakai.site.site_info["_pages"] = {};
                for (var i=0, j=response.length; i<j; i++) {

                    if (typeof response[i] !== "undefined") {

                        // Save page data and add some helper attributes

                        // URL safe title
                        var url_safe_title = "";
                        var url_elements = response[i]["jcr:path"].split("/");
                        url_safe_title = url_elements[url_elements.length - 1];
                        response[i]["pageURLTitle"] = url_safe_title;

                        // URL safe name
                        var url_safe_name = sakai.site.createURLName(response[i]["jcr:path"]);
                        response[i]["pageURLName"] = url_safe_name;

                        // Page depth
                        response[i]["pageDepth"] = url_elements.length;

                        // Page base folder
                        url_elements.pop();
                        response[i]["pageFolder"] = url_elements.join("/");

                        // Main page data
                        sakai.site.site_info["_pages"][url_safe_name] = response[i];
                    }
                }

                // Create a helper function which returns the number of pages
                sakai.site.site_info.number_of_pages = function() {
                    var counter = 0;
                    for (var i in sakai.site.site_info._pages) {
                        counter++;
                    }
                    return counter;
                };

                // Refresh navigation
                if (sakai.site.navigation) {
                    sakai.site.navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
                }

                // Open page if necessary
                if (pageToOpen){
                    sakai.site.openPage(pageToOpen);
                }


            },
            error: function(xhr, textStatus, thrownError) {
                sakai.site.site_info = {};
                fluid.log("site.js: Could not load site info. \n HTTP status code: " + xhr.status);

            }

        });
    };

    /**
     * Checks the content html string for any widget's who still have an id0 in their id.
     * If they do, then they get a new proper ID and the original data in the repository is adjusted.
     * @param {String} content The HTML to check.
     * @param {String} url The url into JCR where the content originates from.
     */
    /*
    sakai.site.ensureProperWidgetIDs = function(content, url) {
        var adjusted = false;
        var moveWidgets = [];

        // Wrap the content in a dummy div so we don't lose anything.
        var $el = $("<div>" + content + "</div>");
        $(".widget_inline", $el).each(function(){
            var splittedId = this.id.split("_");
            if (splittedId.length > 1 && splittedId[2] === "id0") {
                this.id = splittedId[0] + "_" + splittedId[1] + "_id" + Math.floor((Math.random() * 10000000));
                adjusted = true;
            }
            if (splittedId.length > 2 && splittedId[3] === "hasData") {
                // There is some existing data for this widget.
                var widgetID = "id" + Math.floor((Math.random() * 10000000));
                this.id = splittedId[0] + "_" + splittedId[1] + "_" + widgetID;
                adjusted = true;
                moveWidgets.push({
                    'from': splittedId[2],
                    'to': widgetID
                });
            }
        });
        // If we are not a collaborator we can't change files (duh)
        if (sakai.site.isCollaborator) {
            if (adjusted) {
                // We had to do some manipulation, save the content.
                sdata.widgets.WidgetPreference.save(url.replace("/content", ""), "content", $el.html(), null);
                for (var i = 0, j = moveWidgets.length; i < j; i++) {
                    // Move all the widgets.
                    var m_url = sakai.site.urls.CURRENT_SITE_ROOT() + "_widgets/" + moveWidgets[i].from;
                    var m_dest = sakai.site.urls.CURRENT_SITE_ROOT() + "_widgets/" + moveWidgets[i].to;
                    $.ajax({
                        url: m_url,
                        data: {
                            ":operation" : "move",
                            ":dest" : m_dest,
                            "_charset_":"utf-8"
                        },
                        cache: false,
                        type: "POST",
                        success: function(response) {
                        },
                        error: function(xhr, textStatus, thrownError) {
                            alert("Failed to move a widget: " + xhr.status);
                        }
                    });
                }
            }
        }
        return $el.html();
    };

    */

    // Load Navigation
    sakai.site.loadSiteNavigation = function() {

        // Load site navigation
        $.ajax({
              url: sakai.site.urls.SITE_NAVIGATION_CONTENT(),
              cache: false,
              async: false,
              success: function(response){
                sakai.site.pagecontents._navigation = response["sakai:pagenavigationcontent"];
                $page_nav_content.html(sakai.api.Security.saneHTML(sakai.site.pagecontents._navigation));
                sakai.api.Widgets.widgetLoader.insertWidgets("page_nav_content",null,sakai.site.currentsite.id + "/_widgets/");
                $(window).trigger('hashchange');
            },
            error: function(xhr, textStatus, thrownError) {
              $(window).trigger('hashchange');
              console.log(sakai.site.urls.SITE_NAVIGATION_CONTENT());
              alert("site.js: Could not load site navigation content. \n HTTP status code: " + xhr.status);
            }
        });

    };

    /**
     * Callback function to inform when admin part is loaded
     * @return void
     */
    sakai.site.onAdminLoaded = function(){
        // Init site admin
        sakai.site.site_admin();

    };


    /////////////////////
    // VERSION HISTORY //
    /////////////////////

    /**
     * Reset version history
     * @return void
     */
    sakai.site.resetVersionHistory = function(){

        if (sakai.site.selectedpage) {
            $("#revision_history_container").hide();
            $("#content_page_options").show();
            $("#" + sakai.site.selectedpage).html(sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"]);
            sakai.api.Widgets.widgetLoader.insertWidgets(sakai.site.selectedpage, null, sakai.site.currentsite.id + "/_widgets/");
        }

    };


    /////////////////////////////////////
    // PAGE OPEN AND DISPLAY FUNCTIONS //
    /////////////////////////////////////

    /**
     * Open page H
     * @param {String} pageid
     * @return void
     */
    sakai.site.openPageH = function(pageUrlName){

        // Vars
        var pageType = false;

        // Reset version history, but only if version version history has been opened
        if (sakai.site.versionHistoryNeedsReset) {
            sakai.site.resetVersionHistory();
            sakai.site.versionHistoryNeedsReset = false;
        }

        // Reset flags
        sakai.site.showingInsertMore = false;
        sakai.site.inEditView = false;


        // If no pageUrlName is supplied, default to the first available page
        if (!pageUrlName) {
            var lowest = false;
            for (var i in sakai.site.site_info._pages) {
                if (lowest === false || parseInt(sakai.site.site_info._pages[i]["pagePosition"], 10) < lowest){
                    pageUrlName = i;
                    lowest = parseInt(sakai.site.site_info._pages[i]["pagePosition"], 10);
                }
            }
        }


        //Store currently selected page
        sakai.site.selectedpage = pageUrlName;

        if (sakai.site.site_info._pages[pageUrlName] != undefined) {
          // Get page type
          pageType = sakai.site.site_info._pages[pageUrlName]["pageType"];

          // Set page title
          $pagetitle.text(sakai.api.Security.saneHTML(sakai.site.site_info._pages[pageUrlName]["pageTitle"]));
        }

        // Set login link
        $loginLink.attr("href", sakai.site.urls.LOGIN());

        // UI setup
        $webpage_edit.hide();
        $tool_edit.hide();
        $insert_more_menu.hide();
        $more_menu.hide();
        $sidebar_content_pages.show();
        $main_content_div.children().css("display","none");

        if ($("#main-content-div #" + sakai.site.selectedpage).length > 0) {

            // If page has been opened

            // Show page
            $("#" + sakai.site.selectedpage).show();

            // Re-render Site Navigation to reflect changes if navigation widget is already loaded
            if (sakai.site.navigation) {
                sakai.site.navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
            }
        }
        else {

            // If page has not been opened

            // Show 404 error if page type can not be determined, else store page type
            if (pageType === false) {
                $("#error_404").show();
            } else {
                sakai.site.pagetypes[sakai.site.selectedpage] = pageType;
            }

            switch (pageType) {

                // is a Dashboard
                case "dashboard":

                    // Load content of the dashboard page
                    $.ajax({
                        url: sakai.site.site_info._pages[pageUrlName]["jcr:path"] + "/pageContent.infinity.json",
                        type: "GET",
                        success: function(data) {
                            sakai.site.pagecontents[pageUrlName] = $.extend(data, {}, true);
                            displayPage(sakai.site.pagecontents[pageUrlName]["sakai:pagecontent"], true);
                        },
                        error: function(xhr, status, e) {
                            fluid.log("site.js: Could not load page content for dashboard!");
                        }
                    });
                    break;

                // is a Webpage
                case "webpage":

                    // Load contents of a webpage
                    $.ajax({
                        url: sakai.site.site_info._pages[pageUrlName]["jcr:path"] + "/pageContent.infinity.json",
                        type: "GET",
                        success: function(data) {

                            sakai.site.pagecontents[pageUrlName] = data;

                            // TO DO: See if we need to run the content through sakai.site.ensureProperWidgetIDs - would be good if we could skip this step and make sure widget IDs are correct from the beginning
                            displayPage(sakai.site.pagecontents[pageUrlName]["sakai:pagecontent"], true);

                            if (sakai.site.isCollaborator) {
                                $li_edit_page_divider.show();
                                $li_edit_page.show();
                            }

                        },
                        error: function(xhr, status, e) {
                            fluid.log("site.js: Could not load page content for webpage!");
                        }
                    });
                    break;
            }
        }

    };

    $(window).bind("sakai.dashboard.ready", function(e, tuid) {
        var split = $(sakai.site.pagecontents[sakai.site.selectedpage]["sakai:pagecontent"]).attr("id").split("_");
        // make sure the dashboard that said it's ready is the one we just got the data for
        if (split[2] == tuid) {
            if (sakai.site.isCollaborator) {
                sakai.dashboard.init(split[3] + "_" + split[4] + tuid + "/dashboardwidgets/", true, "siteportal", false);
                $li_edit_page_divider.hide();
                $li_edit_page.hide();
            } else {
                sakai.dashboard.init(split[3] + "_" + split[4] + tuid + "/dashboardwidgets/", false, "siteportal", false);
            }
        }
    });

    /**
     * Opens a page
     * @param {String} pageid
     * @return void
     */
    sakai.site.openPage = function(pageid){

        document.location = "#" + pageid;
    };



    /**
     * Displays a page
     * @param {Object} response
     * @param {Boolean} exists
     * @return void
     */
    var displayPage = function(response, exists){

        if (exists) {
            // Page exists

            // Store page content
            //sakai.site.pagecontents[sakai.site.selectedpage] = response;

            // If page already exists in DOM just show it, else create it
            var element_to_test = $("#" + sakai.site.selectedpage);
            if (element_to_test.length > 0){
                element_to_test.show();
            } else
                {
                    // Create element
                    var $el = $("<div id=\""+ sakai.site.selectedpage +"\" class=\"content\"></div>");

                    // Add sanitized content
                    var sanitizedContent = sakai.api.Security.saneHTML(response);
                    $el.html(sanitizedContent);

                    // Add element to the DOM
                    $main_content_div.append($el);
                }

            // Insert widgets
            sakai.api.Widgets.widgetLoader.insertWidgets(sakai.site.selectedpage,null,sakai.site.currentsite.id + "/_widgets/");

            // (Re)-Render Navigation widget
            if (sakai.site.navigation) {
                sakai.site.navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
            }

        }
        else {
            // Page does not exist

            // Create error element
            sakai.site.pagecontents[sakai.site.selectedpage] = {};
            var $errorel = $("<div id=\""+ sakai.site.selectedpage +"\" class=\"content\"></div>");

            // Add error element to the DOM
            $main_content_div.append($errorel);
        }

    };

    /////////////////////////////
    // Request Site Join
    /////////////////////////////
    var requestJoin = function() {
        $site_join_button.find("span").text("Submitting request…").attr('disabled','disabled');
        $.ajax({
            url: "/sites/" + sakai.site.currentsite.id + ".join.html",
            type: "POST",
            data: {
                "targetGroup": sakai.site.currentsite["sakai:rolemembers"][1]
            },
            success: function(data){
                if (sakai.site.currentsite["sakai:joinable"] === "withauth") {
                     $site_join_button.find("span").text("Site join request pending approval");
                } else if (sakai.site.currentsite["sakai:joinable"] === "yes") {
                     $site_join_button.hide();
                     showAdminElements();
                }
            },
            error: function(xhr, textStatus, thrownError) {
                $site_join_button.find("span").text("Unable to submit request. Contact site maintainer for membership.");
                fluid.log("site.js: Could not submit request to join site. \n HTTP status code: " + xhr.status);
            }
        });
    };


    /////////////////////////////
    // PRINT PAGE
    /////////////////////////////

    /**
     * Bring up a print page popup window for printing
     * @retun void
     */
    var printPage = function(){

        // Save page to be printed into my personal space
        var content = $("#" + sakai.site.selectedpage + ".content").html();
        content = "<div class='content'>" + content + "</div>";
        var links = $("link");
        var css = "";
        for (var i = 0, j = links.length; i < j; i++){
            if (links[i].type === "text/css"){
                css += links[i].href + ",";
            }
        }
        $.ajax({
            url: "/~" + sakai.data.me.user.userid + "/private/print",
            type: "POST",
            data: {
                "css": css,
                "content": content,
                "_charset_":"utf-8"
            },
            success: function(data){
                // Open a popup window with printable content
                var day = new Date();
                var id = day.getTime();
                window.open("/dev/print.html", id, "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=664,height=600,left=320,top=150");
            }
        });

    };


    /////////////////////////////
    // GLOBAL EVENT LISTENERS
    /////////////////////////////

    // Bind print page click
    $("#print_page").bind("click", function(ev){
        printPage();
    });


    //////////
    // INIT //
    //////////
    sakai.site.doInit = function() {

        // Start loading page
        loadControl();

    };

    // Start
    sakai.site.doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.site");
