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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.sitespages
 *
 * @class sitespages
 *
 * @description
 * Initialize the sitespages widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.sitespages = function(tuid,showSettings){

    //////////////////////////
    // CONFIG and HELP VARS //
    //////////////////////////

    sakai.sitespages.siteAdminJS = "/devwidgets/sitespages/javascript/sitespages_admin.js";

    sakai.sitespages.minHeight = 400;
    sakai.sitespages.autosaveinterval = 17000;

    var $li_edit_page_divider = $("#li_edit_page_divider");
    var $li_edit_page = $("#li_edit_page");

    var $page_nav_content = $("#page_nav_content");
    var $pagetitle = $("#pagetitle");
    var $webpage_edit = $("#webpage_edit");
    var $tool_edit = $("#tool_edit");
    var $insert_more_menu = $("#insert_more_menu");
    var $more_menu = $("#more_menu");
    var $sidebar_content_pages = $("#sidebar-content-pages");
    var $main_content_div = $("#main-content-div");
    var $more_link = $("#more_link");
    var $li_more_link = $("#li_more_link");
    var $print_page = $("#print_page");
    var $content_page_options = $("#content_page_options");

    sakai.sitespages.site_info = {};
    sakai.sitespages.site_info._pages = {};
    sakai.sitespages.selectedpage = false;
    sakai.sitespages.pagetypes = {};
    sakai.sitespages.pagecontents = {};
    sakai.sitespages.versionHistoryNeedsReset = false;
    sakai.sitespages.selectedpage = false;

    //////////////////////////
    // CONFIG and HELP VARS //
    //////////////////////////

    var config = {};

    sakai.sitespages.doInit = function(basepath, fullpath, url, editMode, homepage, pageEmbedProperty, dashboardEmbedProperty){
        config.basepath = basepath;
        config.startlevel = config.basepath.split("/").length;
        config.fullpath = fullpath;
        config.url = url;
        config.editMode = editMode;
        config.homepage = homepage;
        config.pageEmbedProperty = pageEmbedProperty;
        config.dashboardEmbedProperty = dashboardEmbedProperty;
        sakai.sitespages.config = config;
        loadControl();
    }

    var loadControl = function(){
        if (config.editMode) {
            showAdminElements();
        }
        if (sakai.data.me.user.userid){
            sakai._isAnonymous = false;
        } else {
            sakai._isAnonymous = true;
        }
        // Refresh site_info object
        sakai.sitespages.refreshSiteInfo();
    }

    var showAdminElements = function(){

        // Show admin elements
        $li_edit_page_divider.show();
        $li_more_link.show();
        $print_page.removeClass("print_page_view");
        $print_page.addClass("print_page_admin")

        // Load admin part from a separate file
        $.getScript(sakai.sitespages.siteAdminJS);

    }

    /**
     * Function which (re)-loads the information available on a site (async)
     * @param pageToOpen {String} URL safe title of a page which we want to open after the site info object refresh (optional)
     * @return void
     */
    sakai.sitespages.refreshSiteInfo = function(pageToOpen) {

        // Load site information
        $.ajax({
            url: sakai.config.URL.SEARCH_PAGES,
            cache: false,
            async: false,
            data: {
                "path": config.fullpath + "_pages/",
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
                sakai.sitespages.site_info["_pages"] = {};
                for (var i=0, j=response.length; i<j; i++) {

                    if (typeof response[i] !== "undefined") {

                        // Save page data and add some helper attributes

                        // URL safe title
                        var url_safe_title = "";
                        var url_elements = response[i]["jcr:path"].split("/");
                        url_safe_title = url_elements[url_elements.length - 1];
                        response[i]["pageURLTitle"] = url_safe_title;

                        // URL safe name
                        var url_safe_name = sakai.sitespages.createURLName(response[i]["jcr:path"]);
                        response[i]["pageURLName"] = url_safe_name;

                        // Page depth
                        response[i]["pageDepth"] = url_elements.length;

                        // Page base folder
                        url_elements.pop();
                        response[i]["pageFolder"] = url_elements.join("/");

                        // Main page data
                        sakai.sitespages.site_info["_pages"][url_safe_name] = response[i];
                    }
                }

                // Create a helper function which returns the number of pages
                sakai.sitespages.site_info.number_of_pages = function() {
                    var counter = 0;
                    for (var i in sakai.sitespages.site_info._pages) {
                        counter++;
                    }
                    return counter;
                };

                // Open page if necessary
                if (pageToOpen){
                    sakai.sitespages.openPage(pageToOpen);
                }

                // Load page templates
                sakai.sitespages.loadTemplates();
                // Load site navigation
                sakai.sitespages.loadSiteNavigation();

            },
            error: function(xhr, textStatus, thrownError) {
                sakai.site.site_info = {};
                fluid.log("site.js: Could not load site info. \n HTTP status code: " + xhr.status);

            }

        });
    };

    /**
     * Creates a unique name based on a URL
     * @param i_url {String} The URL the name is based on
     * @returns {String} A URLsafe name string
     */
    sakai.sitespages.createURLName = function(i_url) {
        var urlName = "";
        if ((typeof i_url === "string") & (i_url !== "")) {
            i_url = i_url.replace(/\/_pages/g, "");
            urlName = i_url.replace(/[\/]/g, "").replace(/[~]/g,"");
        }
        return urlName;
    };


    // Load Navigation
    sakai.sitespages.loadSiteNavigation = function() {

        // Load site navigation
        $.ajax({
              url: config.basepath + "_navigation/content.json",
              cache: false,
              async: false,
              success: function(response){
                sakai.sitespages.pagecontents._navigation = response["sakai:pagenavigationcontent"];
                $page_nav_content.html(sakai.api.Security.saneHTML(sakai.sitespages.pagecontents._navigation));
                sakai.api.Widgets.widgetLoader.insertWidgets("page_nav_content", null, config.basepath + "_widgets/");
                $(window).trigger('hashchange');
            },
            error: function(xhr, textStatus, thrownError) {
              $(window).trigger('hashchange');
              console.log(sakai.site.urls.SITE_NAVIGATION_CONTENT());
              alert("site.js: Could not load site navigation content. \n HTTP status code: " + xhr.status);
            }
        });

    };

/*
    $("#more_make_full_width").bind("click", function(ev){
        $("#more_make_full_width").hide();
        $("#more_make_two_column").show();
        sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage].fullwidth = true;
        sakai.sitespages.openPageH(sakai.sitespages.selectedpage);
        sakai.sitespages.savePage(sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["jcr:path"], sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["pageType"], sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["pageTitle"], sakai.sitespages.pagecontents[sakai.sitespages.selectedpage]["sakai:pagecontent"], sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["pagePosition"], "parent", true, function(success, return_data){});
    });

    $("#more_make_two_column").bind("click", function(ev){
        $("#more_make_two_column").hide();
        $("#more_make_full_width").show();
        sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage].fullwidth = false;
        sakai.sitespages.openPageH(sakai.sitespages.selectedpage);
        sakai.sitespages.savePage(sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["jcr:path"], sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["pageType"], sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["pageTitle"], sakai.sitespages.pagecontents[sakai.sitespages.selectedpage]["sakai:pagecontent"], sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage]["pagePosition"], "parent", false, function(success, return_data){});
    });
*/
    /**
     * Open page H
     * @param {String} pageid
     * @return void
     */
    sakai.sitespages.openPageH = function(pageUrlName){

        // Vars
        var pageType = false;

        // Reset version history, but only if version version history has been opened
        if (sakai.sitespages.versionHistoryNeedsReset) {
            sakai.sitespages.resetVersionHistory();
            sakai.sitespages.versionHistoryNeedsReset = false;
        }

        // Reset flags
        sakai.sitespages.showingInsertMore = false;
        sakai.sitespages.inEditView = false;


        // If no pageUrlName is supplied, default to the first available page
        if (!pageUrlName) {
            var lowest = false;
            for (var i in sakai.sitespages.site_info._pages) {
                if (lowest === false || parseInt(sakai.sitespages.site_info._pages[i]["pagePosition"], 10) < lowest){
                    pageUrlName = i;
                    lowest = parseInt(sakai.sitespages.site_info._pages[i]["pagePosition"], 10);
                }
            }
        }


        //Store currently selected page
        sakai.sitespages.selectedpage = pageUrlName;

        /* Full Width handling
         * Taken out for now, put back in once we have a design and implementation of a full width pages widget
        if (sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage] && sakai.sitespages.site_info._pages[sakai.sitespages.selectedpage].fullwidth){
            $(".content_container").addClass("sitepages_fullwidth");
            $("#page_nav_content").hide();
            $("#more_make_full_width").hide();
            $("#more_make_two_column").show();
        } else {
            $(".content_container").removeClass("sitepages_fullwidth");
            $("#page_nav_content").show();
            $("#more_make_full_width").show();
            $("#more_make_two_column").hide();
        }
        */

        if (sakai.sitespages.site_info._pages[pageUrlName] != undefined) {
          // Get page type
          pageType = sakai.sitespages.site_info._pages[pageUrlName]["pageType"];

          // Set page title
          $pagetitle.text(sakai.api.Security.saneHTML(sakai.sitespages.site_info._pages[pageUrlName]["pageTitle"]));
        }

        // UI setup
        $webpage_edit.hide();
        $tool_edit.hide();
        $insert_more_menu.hide();
        $more_menu.hide();
        $sidebar_content_pages.show();
        $main_content_div.children().css("display","none");

        if ($("#main-content-div #" + sakai.sitespages.selectedpage).length > 0) {

            // If page has been opened

            // Show page
            $("#" + sakai.sitespages.selectedpage).show();

            // Re-render Site Navigation to reflect changes if navigation widget is already loaded
            if (sakai.sitespages.navigation) {
//                sakai.sitespages.navigation.renderNavigation(sakai.sitespages.selectedpage, sakai.sitespages.site_info._pages);
            }
        }
        else {

            // If page has not been opened

            // Show 404 error if page type can not be determined, else store page type
            if (pageType === false) {
                $("#error_404").show();
            } else {
                sakai.sitespages.pagetypes[sakai.sitespages.selectedpage] = pageType;
            }

            $.ajax({
                url: sakai.sitespages.site_info._pages[pageUrlName]["jcr:path"] + "/pageContent.infinity.json",
                type: "GET",
                success: function(data) {

                    sakai.sitespages.pagecontents[pageUrlName] = data;

                    // TO DO: See if we need to run the content through sakai.site.ensureProperWidgetIDs - would be good if we could skip this step and make sure widget IDs are correct from the beginning
                    displayPage(sakai.sitespages.pagecontents[pageUrlName]["sakai:pagecontent"], true);

                 },
                 error: function(xhr, status, e) {
                    fluid.log("site.js: Could not load page content for webpage!");
                 }
            });
        }

        if (pageType === "webpage" && config.editMode) {
            $content_page_options.show();
            $li_edit_page_divider.show();
            $li_edit_page.show();
        } else if (pageType === "dashboard") {
            $content_page_options.show();
            $li_edit_page_divider.hide();
            $li_edit_page.hide();
        } else if (pageType === "profile") {
            $content_page_options.hide();
            $li_edit_page_divider.hide();
            $li_edit_page.hide();
        }

    };

    /**
     * Opens a page
     * @param {String} pageid
     * @return void
     */
    sakai.sitespages.openPage = function(pageid){

        // If page is not the current page load it
        if (sakai.sitespages.selectedpage !== pageid) {
            History.addBEvent(pageid);
        }

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
            var element_to_test = $("#" + sakai.sitespages.selectedpage);
            if (element_to_test.length > 0){
                element_to_test.show();
            } else
                {
                    // Create element
                    var $el = $("<div id=\""+ sakai.sitespages.selectedpage +"\" class=\"content\"></div>");

                    // Add sanitized content
                    var sanitizedContent = sakai.api.Security.saneHTML(response);
                    $el.html(sanitizedContent);

                    // Add element to the DOM
                    $main_content_div.append($el);
                }

            // Insert widgets
            sakai.api.Widgets.widgetLoader.insertWidgets(sakai.sitespages.selectedpage,null, config.basepath + "_widgets/");

            // (Re)-Render Navigation widget
            if (sakai.sitespages.navigation) {
//                sakai.sitespages.navigation.renderNavigation(sakai.sitespages.selectedpage, sakai.sitespages.site_info._pages);
            }

        }
        else {
            // Page does not exist

            // Create error element
            sakai.sitespages.pagecontents[sakai.sitespages.selectedpage] = {};
            var $errorel = $("<div id=\""+ sakai.sitespages.selectedpage +"\" class=\"content\"></div>");

            // Add error element to the DOM
            $main_content_div.append($errorel);
        }

    };

    /**
     * Callback function to inform when admin part is loaded
     * @return void
     */
    sakai.sitespages.onAdminLoaded = function(){
        // Init site admin
        sakai.sitespages.site_admin();

    };

    /**
     * Get document height
     * @param {Object} doc
     * @return {Int} height of supplied document
     */
    sakai.sitespages.getDocHeight = function(doc){
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
     * Cretes URL safe page title
     * @param title {String} The title of a page
     * @returns {String} URL safe title
     */
    sakai.sitespages.createURLSafeTitle = function(title) {
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

    $(window).bind("sakai.dashboard.ready", function(e, tuid) {
        var split = $(sakai.sitespages.pagecontents[sakai.sitespages.selectedpage]["sakai:pagecontent"]).attr("id").split("_");
        var entityID = false;
        if (sakai.currentgroup) {
            entityID = sakai.currentgroup.id;
        } else if (sakai.profile.main.data["rep:userId"]) {
            entityID = sakai.profile.main.data["rep:userId"];
        }
        // make sure the dashboard that said it's ready is the one we just got the data for
        if (split[2] === tuid) {
            if (config.editMode) {
                sakai.dashboard.init("/~" + entityID + "/" + sakai.sitespages.selectedpage + "/" + tuid + "/dashboardwidgets/", true, config.dashboardEmbedProperty, false);
            } else {
                sakai.dashboard.init("/~" + entityID + "/" + sakai.sitespages.selectedpage + "/" + tuid + "/dashboardwidgets/", false, config.dashboardEmbedProperty, false);
            }
        }
    });

    /**
     * Transform a date into more readable date string
     * @param {Object} day
     * @param {Object} month
     * @param {Object} year
     * @param {Object} hour
     * @param {Object} minute
     * @return {String} formatted date string
     */
    sakai.sitespages.transformDate = function(day, month, year, hour, minute){
        var string = "";
        var months_lookup = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"};
        string += months_lookup[month] + " " + day + ", " + year + " " + ("00" + hour).slice(-2) + ":" + ("00" + minute).slice(-2);
        return string;
    };

    /**
     * Reset version history
     * @return void
     */
    sakai.sitespages.resetVersionHistory = function(){

        if (sakai.sitespages.selectedpage) {
            $("#revision_history_container").hide();
            $content_page_options.show();
            $("#" + sakai.sitespages.selectedpage).html(sakai.sitespages.pagecontents[sakai.sitespages.selectedpage]["sakai:pagecontent"]);
            sakai.api.Widgets.widgetLoader.insertWidgets(sakai.sitespages.selectedpage, null, config.basepath);
        }

    };

    $(window).trigger("sakai.sitespages.ready");

};

sakai.api.Widgets.widgetLoader.informOnLoad("sitespages");