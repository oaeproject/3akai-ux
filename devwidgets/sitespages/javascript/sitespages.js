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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.ba-bbq.js (BBQ)
 * /dev/lib/tinymce/tiny_mce.js (tinyMCE)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.sitespages
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
    sakai_global.sitespages = function(tuid,showSettings){

        //////////////////////////
        // CONFIG and HELP VARS //
        //////////////////////////

        sakai_global.sitespages.minHeight = 400;
        sakai_global.sitespages.autosaveinterval = 17000;

        var $rootel = $("#" + tuid);

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
        var $sitespages_page_options = $("#sitespages_page_options");
        var $more_revision_history = $("#more_revision_history");
        var $more_save_as_template = $("#more_save_as_template");
        var $more_change_layout = $("#more_change_layout");


        sakai_global.sitespages.site_info = {};
        sakai_global.sitespages.site_info._pages = {};
        sakai_global.sitespages.selectedpage = false;
        sakai_global.sitespages.pagetypes = {};
        sakai_global.sitespages.pagecontents = {};
        sakai_global.sitespages.versionHistoryNeedsReset = false;

        //////////////////////////
        // CONFIG and HELP VARS //
        //////////////////////////

        var config = {};
        var insertDropdownPositionSet = false;
        var bookmark = false;

        var doInit = function(basepath, fullpath, url, editMode, homepage, pageEmbedProperty, dashboardEmbedProperty){
            config.basepath = basepath;
            config.startlevel = config.basepath.split("/").length;
            config.fullpath = fullpath;
            config.url = url;
            config.editMode = editMode;
            config.homepage = homepage;
            config.pageEmbedProperty = pageEmbedProperty;
            config.dashboardEmbedProperty = dashboardEmbedProperty;
            sakai_global.sitespages.config = config;
            sakai.api.Widgets.widgetLoader.insertWidgets("#"+tuid);
            loadControl();
        };

        $(window).bind("init.sitespages.sakai", function(e, basepath, fullpath, url, editMode, homepage, pageEmbedProperty, dashboardEmbedProperty) {
            doInit(basepath, fullpath, url, editMode, homepage, pageEmbedProperty, dashboardEmbedProperty);
        });

        var loadControl = function(){
            if (sakai.data.me.user.userid){
                sakai._isAnonymous = false;
            } else {
                sakai._isAnonymous = true;
            }
            if (config.editMode) {
                showAdminElements();
                sakai_global.sitespages.refreshSiteInfo();
            } else {
                sakai_global.sitespages.refreshSiteInfo();
            }
        };

        var showAdminElements = function(){
            // Show admin elements
            $li_edit_page_divider.show();
            $li_more_link.show();
            admin_init();
        };

        /**
         * Load Templates. This function is no longer used within this js file. It
         * is global and used by outside scripts. This, along with a number of other
         * functions from this file should probably be moved into a Page-related api
         * @return void
         */
        sakai_global.sitespages.loadTemplates = function() {
            if (sakai_global.sitespages.versionHistoryNeedsReset) {
                sakai_global.sitespages.resetVersionHistory();
                sakai_global.sitespages.versionHistoryNeedsReset = false;
            }

            // Load template configuration file
            sakai.api.Server.loadJSON("/~" + sakai.data.me.user.userid + "/private/templates", function(success, pref_data){
                if (success) {
                    sakai_global.sitespages.mytemplates = pref_data;
                } else {
                    sakai_global.sitespages.mytemplates = {};
                }
            });

        };

        /**
         * Function which (re)-loads the information available on a site (async)
         * @param pageToOpen {String} URL safe title of a page which we want to open after the site info object refresh (optional)
         * @return void
         */
        sakai_global.sitespages.refreshSiteInfo = function(pageToOpen, loadNav) {
            var doLoadNav = true;
            if (loadNav !== undefined) {
                doLoadNav = loadNav;
            }

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
                    sakai_global.sitespages.site_info["_pages"] = {};
                    for (var i=0, j=response.length; i<j; i++) {

                        if (typeof response[i] !== "undefined") {

                            // Save page data and add some helper attributes

                            // URL safe title
                            var url_safe_title = "";
                            var url_elements = response[i]["jcr:path"].split("/");
                            url_safe_title = url_elements[url_elements.length - 1];
                            response[i]["pageURLTitle"] = url_safe_title;

                            // URL safe name
                            var url_safe_name = sakai_global.sitespages.createURLName(response[i]["jcr:path"]);
                            response[i]["pageURLName"] = url_safe_name;

                            // Page depth
                            response[i]["pageDepth"] = url_elements.length;

                            // Page base folder
                            url_elements.pop();
                            response[i]["pageFolder"] = url_elements.join("/");

                            // Main page data
                            sakai_global.sitespages.site_info["_pages"][url_safe_name] = response[i];
                        }
                    }

                    // Create a helper function which returns the number of pages
                    sakai_global.sitespages.site_info.number_of_pages = function() {
                        var counter = 0;
                        for (var i in sakai_global.sitespages.site_info._pages) {
                            if (sakai_global.sitespages.site_info._pages.hasOwnProperty(i)) {
                                counter++;
                            }
                        }
                        return counter;
                    };

                    // Open page if necessary
                    if (pageToOpen && pageToOpen !== "") {
                        sakai_global.sitespages.openPage(pageToOpen);
                    }

                    // Load site navigation
                    if (doLoadNav) {
                        sakai_global.sitespages.loadSiteNavigation();
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.site.site_info = {};
                    debug.error("site.js: Could not load site info. \n HTTP status code: " + xhr.status);

                }

            });
        };

        /**
         * Creates a unique name based on a URL
         * @param i_url {String} The URL the name is based on
         * @returns {String} A URLsafe name string
         */
        sakai_global.sitespages.createURLName = function(i_url) {
            var urlName = "";
            if ((typeof i_url === "string") & (i_url !== "")) {
                i_url = i_url.replace(/\/_pages/g, "");
                urlName = i_url.replace(/[\/]/g, "").replace(/[~]/g,"");
            }
            return urlName;
        };

        // Load Navigation
        sakai_global.sitespages.loadSiteNavigation = function() {

            // Load site navigation
            $.ajax({
                  url: config.basepath + "_navigation/content.json",
                  cache: false,
                  async: false,
                  success: function(response){
                    sakai_global.sitespages.pagecontents._navigation = response["sakai:pagenavigationcontent"];
                    $page_nav_content.html(sakai.api.Security.saneHTML(sakai_global.sitespages.pagecontents._navigation));
                    sakai.api.Widgets.widgetLoader.insertWidgets("page_nav_content", null, config.basepath + "_widgets/");
                    $(window).trigger('hashchange');
                },
                error: function(xhr, textStatus, thrownError) {
                  $(window).trigger('hashchange');
                  debug.error("sitespages.js: Could not load site navigation content. \n HTTP status code: " + xhr.status);
                }
            });

        };

    /*
        $("#more_make_full_width").bind("click", function(ev){
            $("#more_make_full_width").hide();
            $("#more_make_two_column").show();
            sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].fullwidth = true;
            sakai_global.sitespages.openPageH(sakai_global.sitespages.selectedpage);
            sakai_global.sitespages.savePage(sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"], sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageType"], sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"], sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"], sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pagePosition"], "parent", true, function(success, return_data){});
        });

        $("#more_make_two_column").bind("click", function(ev){
            $("#more_make_two_column").hide();
            $("#more_make_full_width").show();
            sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].fullwidth = false;
            sakai_global.sitespages.openPageH(sakai_global.sitespages.selectedpage);
            sakai_global.sitespages.savePage(sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"], sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageType"], sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"], sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"], sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pagePosition"], "parent", false, function(success, return_data){});
        });
    */
        /**
         * Open page H
         * @param {String} pageid
         * @return void
         */
        sakai_global.sitespages.openPageH = function(pageUrlName){

            // Vars
            var pageType = false;

            // Reset version history, but only if version version history has been opened
            if (sakai_global.sitespages.versionHistoryNeedsReset) {
                sakai_global.sitespages.resetVersionHistory();
                sakai_global.sitespages.versionHistoryNeedsReset = false;
            }

            // Reset flags
            sakai_global.sitespages.inEditView = false;


            // If no pageUrlName is supplied, default to the about page
            if (!pageUrlName) {
                pageUrlName = determineLowestPositionPage();
            }

            // Store currently selected page
            sakai_global.sitespages.selectedpage = pageUrlName;

            /* Full Width handling
             * Taken out for now, put back in once we have a design and implementation of a full width pages widget
            if (sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage] && sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].fullwidth){
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

            if (sakai_global.sitespages.site_info._pages[pageUrlName] !== undefined) {
              // Get page type
              pageType = sakai_global.sitespages.site_info._pages[pageUrlName]["pageType"];

              // Set page title
              $pagetitle.html(sakai.api.Security.saneHTML(sakai_global.sitespages.site_info._pages[pageUrlName]["pageTitle"]));
            }

            // UI setup
            $webpage_edit.hide();
            $tool_edit.hide();
            $insert_more_menu.hide();
            $more_menu.hide();
            $sidebar_content_pages.show();
            $main_content_div.children().css("display","none");

            if ($("#main-content-div #" + sakai_global.sitespages.selectedpage).length > 0) {

                // If page has been opened

                // Show page
                $("#" + sakai_global.sitespages.selectedpage).show();
            }
            else {

                // If page has not been opened

                // Show 404 error if page type can not be determined, else store page type
                if (pageType === false) {
                    $("#error_404").show();
                } else {
                    sakai_global.sitespages.pagetypes[sakai_global.sitespages.selectedpage] = pageType;
                }
                if (sakai_global.sitespages.site_info._pages[pageUrlName]) {
                    $.ajax({
                        url: sakai_global.sitespages.site_info._pages[pageUrlName]["jcr:path"] + "/pageContent.infinity.json",
                        type: "GET",
                        cache: false,
                        success: function(data) {

                            sakai_global.sitespages.pagecontents[pageUrlName] = data;

                            // TO DO: See if we need to run the content through sakai.site.ensureProperWidgetIDs - would be good if we could skip this step and make sure widget IDs are correct from the beginning
                            var pagecontent = sakai_global.sitespages.pagecontents[pageUrlName]["sakai:pagecontent"] || "";
                            displayPage(pagecontent, true);

                         },
                         error: function(xhr, status, e) {
                            debug.error("site.js: Could not load page content for webpage!");
                         }
                    });
                } else {
                    $.bbq.removeState("page");
                }
            }

            if (!config.editMode) {
                $content_page_options.hide();
                $(".sakai_site .content_top").addClass("content_top_rounded");
            } else {
                $("#sitespages_page_options #page_save_options").hide();
                $("#sitespages_page_options #page_options").show().html(sakai.api.Util.TemplateRenderer("#sitespages_page_options_container", {})); // todo don't do this
                $more_revision_history = $($more_revision_history.selector);
                $more_save_as_template = $($more_save_as_template.selector);
				$more_change_layout = $($more_change_layout.selector);
                if (pageType === "webpage") {
                    $(".sakai_site .content_top").removeClass("content_top_rounded");
                    $content_page_options.show();
                    $li_edit_page_divider.show();
                    $sitespages_page_options.show();
                    $more_revision_history.show();
                    $more_change_layout.hide();
                    $more_save_as_template.show();
                    $more_change_layout.hide();
                } else if (pageType === "dashboard") {
                    $(".sakai_site .content_top").removeClass("content_top_rounded");
                    $sitespages_page_options.show();
                    $more_revision_history.hide();
                    $content_page_options.show();
                    $li_edit_page_divider.show();
                    $more_save_as_template.hide();
                    $more_change_layout.show();
                } else if (pageType === "profile") {
                    $(".sakai_site .content_top").addClass("content_top_rounded");
                    $sitespages_page_options.hide();
                    $content_page_options.hide();
                    $li_edit_page_divider.hide();
                }
            }

        };

        /**
         * Opens a page
         * @param {String} pageid
         * @return void
         */
        sakai_global.sitespages.openPage = function(pageid){

            // If page is not the current page load it
            if (sakai_global.sitespages.selectedpage !== pageid) {
                sakai_global.sitespages.selectedpage = pageid;
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
                var element_to_test = $("#" + sakai_global.sitespages.selectedpage);
                if (element_to_test.length > 0){
                    element_to_test.show();
                } else
                    {
                        // Create element
                        var $el = $("<div id=\""+ sakai_global.sitespages.selectedpage +"\" class=\"content\"></div>");

                        // Add sanitized content
                        var sanitizedContent = sakai.api.Security.saneHTML(response);
                        $el.html(sanitizedContent);

                        // Add element to the DOM
                        $main_content_div.append($el);

                        // Tell MathJax the element is updated
                        sakai.api.Util.renderMath(sakai_global.sitespages.selectedpage);
                    }

                // Insert widgets
                sakai.api.Widgets.widgetLoader.insertWidgets(sakai_global.sitespages.selectedpage,null, config.basepath + "_widgets/");

            }
            else {
                // Page does not exist

                // Create error element
                sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage] = {};
                var $errorel = $("<div id=\""+ sakai_global.sitespages.selectedpage +"\" class=\"content\"></div>");

                // Add error element to the DOM
                $main_content_div.append($errorel);
            }

        };

        var determineLowestPositionPage = function(){
            var lowest = 9999999999999999;
            var ret = false;
            for (var i in sakai_global.sitespages.site_info._pages){
                if (sakai_global.sitespages.site_info._pages.hasOwnProperty(i) && sakai_global.sitespages.site_info._pages[i]["pagePosition"] && parseInt(sakai_global.sitespages.site_info._pages[i]["pagePosition"], 10) < lowest) {
                    lowest = parseInt(sakai_global.sitespages.site_info._pages[i]["pagePosition"], 10);
                    ret = i;
                }
            }
            return ret;
        };

        /**
         * Cretes URL safe page title
         * @param title {String} The title of a page
         * @returns {String} URL safe title
         */
        sakai_global.sitespages.createURLSafeTitle = function(title) {
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

        $(window).bind("ready.dashboard.sakai", function(e, tuid) {
            var split = $(sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"]).attr("id").split("_");
            var entityID = false;
            if (sakai_global.profile.main.data["rep:userId"]) {
                entityID = sakai_global.profile.main.data["rep:userId"];
            } else if (sakai_global.currentgroup && sakai_global.currentgroup.id && !$.isEmptyObject(sakai_global.currentgroup.id)) {
                entityID = sakai_global.currentgroup.id;
            }
            // make sure the dashboard that said it's ready is the one we just got the data for
            if (split[2] === tuid) {
                if (config.editMode) {
                    $(window).trigger("init.dashboard.sakai", [sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/_widgets/", true, config.dashboardEmbedProperty, false]);
                } else {
                    $(window).trigger("init.dashboard.sakai", [sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/_widgets/", false, config.dashboardEmbedProperty, false]);
                }
            }
        });

        /**
         * Reset version history
         * @return void
         */
        sakai_global.sitespages.resetVersionHistory = function(){

            if (sakai_global.sitespages.selectedpage) {
                $("#revision_history_container").hide();
                $content_page_options.show();
                var pagecontent = sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"] || "";
                $("#" + sakai_global.sitespages.selectedpage).html(pagecontent);
                sakai.api.Widgets.widgetLoader.insertWidgets(sakai_global.sitespages.selectedpage, null, config.basepath);
                sakai.api.Util.renderMath(sakai_global.sitespages.selectedpage);
            }

        };

        /////////////////////////////
        // ADMIN  (previously sitespages_admin.js)
        /////////////////////////////


        /////////////////////////////
        // CONFIG and HELP VARS
        /////////////////////////////

        sakai_global.sitespages.toolbarSetupReady = false;
        sakai_global.sitespages.autosavecontent = false;
        sakai_global.sitespages.isShowingDropdown = false;
        sakai_global.sitespages.isShowingContext = false;
        sakai_global.sitespages.newwidget_id = false;
        sakai_global.sitespages.newwidget_uid = false;
        sakai_global.sitespages.isEditingNewPage = false;
        sakai_global.sitespages.oldSelectedPage = false;
        sakai_global.sitespages.mytemplates = false;
        sakai_global.sitespages.updatingExistingWidget = false;

        // Cache all the jQuery selectors we can
        var $elm1_ifr = $("#elm1_ifr");
        var $elm1_toolbar1 = $("#elm1_toolbar1");
        var $elm1_toolbar2 = $("#elm1_toolbar2");
        var $elm1_toolbar3 = $("#elm1_toolbar3");
        var $elm1_toolbar4 = $("#elm1_toolbar4");
        var $elm1_external = $("#elm1_external");
        var $toolbarplaceholder = $("#toolbarplaceholder");
        var $toolbarcontainer = $("#toolbarcontainer");
        var $placeholderforeditor = $("#placeholderforeditor");
        var $context_menu = $("#context_menu");
        var $context_settings = $("#context_settings");
        var $title_input_container = $("#title-input-container");
        var $fl_tab_content_editor = $("#fl-tab-content-editor");

        // TinyMCE selectors, please note that it is not possible to cache these
        // since they get created at runtime
        var elm1_menu_formatselect = "#menu_elm1_elm1_formatselect_menu";
        var elm1_menu_fontselect = "#menu_elm1_elm1_fontselect_menu";
        var elm1_menu_fontsizeselect = "#menu_elm1_elm1_fontsizeselect_menu";

        // Untitled page title
        var untitled_page_title = $("#edit_untitled_page").html();

        /////////////////////////////
        // PAGE UTILITY FUNCTIONS
        /////////////////////////////

        /**
         * Create unique elements for a new page such as url safe title, name and url
         * @param i_title {String} The title of the new page
         * @param i_base_folder {String} The base folder of where the new page will be created
         * @returns {Object} Returns an object with 3 properties: urlTitle, urlName, url or false otherwise
         */
        sakai_global.sitespages.createPageUniqueElements = function(i_title, i_base_folder) {

            var return_object = {};

            if (!i_title) {
                return false;
            }
            var title = i_title;
            var base_folder = i_base_folder || sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageFolder"];

            // Generate new page id
            var new_urlsafe_name = false;
            var urlsafe_title = sakai_global.sitespages.createURLSafeTitle(title);
            var counter = 0;
            while (!new_urlsafe_name){
                if (counter > 0){
                    urlsafe_title += "-" + counter;
                }
                var test_url_safe_name = sakai_global.sitespages.createURLName(base_folder + "/" + urlsafe_title);
                counter++;
                if (!sakai_global.sitespages.site_info._pages[test_url_safe_name]) {
                    new_urlsafe_name = test_url_safe_name;
                }
            }

            return_object = {
                "urlTitle": urlsafe_title,
                "urlName": new_urlsafe_name,
                "url": base_folder + "/" + urlsafe_title
            };

            return return_object;

        };


        /**
         * Moves a page within a Sakai site
         * @param src_url {String} The URL of the the page we want to move
         * @param tgt_url {String} The URL of the new page location
         * @param callback {Function} Callback function which is called when the operation is successful
         */
        sakai_global.sitespages.movePage = function(src_url, tgt_url, callback) {

            var new_src_url = src_url.replace(sakai_global.sitespages.config.basepath,sakai_global.sitespages.config.fullpath);
            var new_tgt_url = tgt_url.replace(sakai_global.sitespages.config.basepath,sakai_global.sitespages.config.fullpath);

            var src_urlsafe_name = sakai_global.sitespages.createURLName(src_url);
            var tgt_urlsafe_name = sakai_global.sitespages.createURLName(tgt_url);

            $.ajax({
                url: src_url,
                type: "POST",
                data: {
                    ":operation" : "move",
                    ":dest" : new_tgt_url
                },
                success: function(data) {
                    var movedPageTitle = sakai_global.sitespages.site_info._pages[src_urlsafe_name]["pageTitle"];

                    // Remove content html tags
                    $("#" + sakai_global.sitespages.selectedpage).remove();
                    $("#" + src_urlsafe_name).remove();

                    // Remove old + new from sakai_global.sitespages.pagecontents array
                    delete sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage];
                    delete sakai_global.sitespages.pagecontents[src_urlsafe_name];

                    // Check in new page content to revision history
                    $.ajax({
                        url: tgt_url + "/pageContent.save.html",
                        type: "POST"
                    });

                    // Refresh site info
                    sakai_global.sitespages.refreshSiteInfo(tgt_urlsafe_name, false);

                    // Call callback function
                    callback(tgt_urlsafe_name);
                },
                error: function(xhr, text, thrown_error) {
                    debug.error("sitespages_admin.js/movePage(): Failed to move page node!");
                }
            });
        };

        /**
         * Save page
         * General function which saves content and metadata of a page
         * @param url {String} URL of the page which needs to be saved
         * @param type {String} type of page ( "webpage", "dashboard" )
         * @param title {String} title of the page
         * @param content {String} content of the page
         * @param position {Int} Position value of the page
         * @param acl {String} Access Control ("parent" to inherit parent node's ACLs)
         * @param callback {Function} Callback function which is executed at the end of the operation (data/xhr,true/false)
         * @returns void
         */
        sakai_global.sitespages.savePage = function(i_url, type, title, content, position, acl, fullwidth, callback) {

            var page_data = $.toJSON({
                "sling:resourceType": "sakai/page",
                "pageTitle": title,
                "pageType": type,
                "fullwidth": fullwidth,
                "pagePosition": position,
                "_pages": {}
            });

            var handleError = function (xhr, textStatus, thrownError) {
                callback(false, xhr);
            };

            $.ajax({
                url: i_url,
                type: "POST",
                data: {
                    ":operation": "import",
                    ":contentType": "json",
                    ":content": page_data,
                    ":replace": true,
                    ":replaceProperties": true,
                    "_charset_": "utf-8"
                },
                success: function(data) {
                    // add pageContent in non-replace mode to support versioning
                    $.ajax({
                        url: i_url + "/pageContent",
                        type: "POST",
                        data: {
                            "sling:resourceType": "sakai/pagecontent",
                            "sakai:pagecontent": content
                        },
                        success: function (data) {
                            callback(true, data);
                        },
                        error: handleError
                    });
                },
                error: handleError
            });

        };

        /**
         * Updates the content node of a page
         * @param url {String} URL of the page node we are updating
         * @param content {String} The new content
         * @param callback {Function} Callback function which is called at the end of the operation
         * @returns void
         */
        sakai_global.sitespages.updatePageContent = function(url, content, callback) {

            var jsonString = $.toJSON({
                "pageContent": { "sling:resourceType": "sakai/pagecontent", "sakai:pagecontent": content }});

            $.ajax({
                url: url,
                type: "POST",
                data: {
                    ":operation": "import",
                    ":contentType": "json",
                    ":content": jsonString,
                    ":replace": false,
                    ":replaceProperties": true,
                    "_charset_": "utf-8"
                },
                success: function(data) {

                    callback(true, data);
                },
                error: function(xhr, textStatus, thrownError) {
                    callback(false, xhr);
                }
            });
        };


        /**
         * Updates the revision history for the given pageUrl
         */
        var updateRevisionHistory = function (pageUrl, callback) {
            $.ajax({
                url: pageUrl + "/pageContent.save.json",
                type: "POST",
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        };


        /**
         * Shows or hides the insert dropdown menu
         */
        var showHideInsertDropdown = function(hideOnly){
            var el = $("#sitepages_insert_dropdown");
            if (el) {
                if ((el.css("display") && el.css("display").toLowerCase() !== "none") || hideOnly) {
                    $("#sitepages_insert_dropdown_button").removeClass("clicked");
                    el.hide();
                } else if (el.css("display")) {
                    $("#sitepages_insert_dropdown_button").addClass("clicked");
                    if (!insertDropdownPositionSet) {
                        var x = $("#sitepages_insert_dropdown_button").position().left;
                        var y = $("#sitepages_insert_dropdown_button").position().top;
                        el.css({
                            "top": y + 28 + "px",
                            "left": x + "px"
                        }).show();
                        insertDropdownPositionSet = true;
                    }
                    el.show();
                }
            }
        };

        /**
         * Renders the insert dropdown menu
         */
        var renderInsertDropdown = function(){
            // Vars for media and goodies
            var media = {}; media.items = [];
            var goodies = {}; goodies.items = [];
            var sidebar = {}; sidebar.items = [];

            // Fill in media and goodies
            for (var i in sakai.widgets){
                if (i) {
                    var widget = sakai.widgets[i];
                    if (widget[sakai_global.sitespages.config.pageEmbedProperty] && widget.showinmedia) {
                        media.items.push(widget);
                    }
                    if (widget[sakai_global.sitespages.config.pageEmbedProperty] && widget.showinsakaigoodies) {
                        goodies.items.push(widget);
                    }
                    if (widget[sakai_global.sitespages.config.pageEmbedProperty] && widget.showinsidebar){
                        sidebar.items.push(widget);
                    }
                }
            }

            var currenthash = "#";
            if (window.location.hash){
                currenthash = window.location.hash;
            }

            var jsonData = {
                "media": media,
                "goodies": goodies,
                "sidebar": sidebar,
                "currenthash": currenthash
            };

            // Renderer dropdown list
            sakai.api.Util.TemplateRenderer($("#sitepages_insert_dropdown_template"), jsonData, $("#sitepages_insert_dropdown_container"));

            // Event handler
            $('#insert_dialog').jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                onHide: hideSelectedWidget
            });

            // add bindings
            $("#sitepages_insert_dropdown_button").bind("click", function(){
                // hide dropdown
                showHideInsertDropdown();
            });

            $(".insert_dropdown_widget_link").live("click", function(){
                // hide dropdown
                showHideInsertDropdown(true);

                // restore the cursor position in the editor
                if (bookmark) {
                    tinyMCE.get("elm1").focus();
                    tinyMCE.get("elm1").selection.moveToBookmark(bookmark);
                }
                bookmark = false;

                var id = $(this).attr("id");
                if (id==="link") {
                    $('#link_dialog').jqmShow();
                } else if (id==="hr") {
                    tinyMCE.get("elm1").execCommand('InsertHorizontalRule');
                } else {
                    renderSelectedWidget(id);
                }
            });
        };


        /////////////////////////////
        // tinyMCE FUNCTIONS
        /////////////////////////////

        /**
         * Initialise tinyMCE and run sakai_global.sitespages.startEditPage() when init is complete
         * @return void
         */

        function init_tinyMCE() {

            // Creates a new plugin class and a custom listbox for the insert more menu
            tinymce.create('tinymce.plugins.InsertMorePlugin', {
                createControl: function(n, cm) {
                    if ( n === 'insertmore' ) {
                            var insertMoreBox = cm.createListBox('insertmore', {
                             title : 'Insert More',
                             onselect : function(v) {
                                 if (v==="link") {
                                     $('#link_dialog').jqmShow();
                                 } else if (v==="hr") {
                                     tinyMCE.get("elm1").execCommand('InsertHorizontalRule');
                                 } else {
                                     renderSelectedWidget(v);
                                 }
                                 $("#elm1_insertmore").get(0).selectedIndex = 0;
                             }
                        });

                        insertMoreBox.add("Page Link", 'link');
                        insertMoreBox.add("Horizontal Line", 'hr');

                        // Vars for media and goodies
                        var media = {}; media.items = [];
                        var goodies = {}; goodies.items = [];
                        var sidebar = {}; sidebar.items = [];

                        // Fill in media and goodies
                        for (var i in sakai.widgets){
                            if (i) {
                                var widget = sakai.widgets[i];
                                if (widget[sakai_global.sitespages.config.pageEmbedProperty] && widget.showinmedia) {
                                    media.items.push(widget);
                                }
                                if (widget[sakai_global.sitespages.config.pageEmbedProperty] && widget.showinsakaigoodies) {
                                    goodies.items.push(widget);
                                }
                                if (widget[sakai_global.sitespages.config.pageEmbedProperty] && widget.showinsidebar){
                                    sidebar.items.push(widget);
                                }
                            }
                        }

                        $(media.items).each(function(i,val) {
                            insertMoreBox.add(val.name, val.id);
                        });
                        $(goodies.items).each(function(i,val) {
                            insertMoreBox.add(val.name, val.id);
                        });
                        $(sidebar.items).each(function(i,val) {
                            insertMoreBox.add(val.name, val.id);
                        });

                        // Event handler
                        $('#insert_dialog').jqm({
                            modal: true,
                            overlay: 20,
                            toTop: true,
                            onHide: hideSelectedWidget
                        });

                        // Return the new listbox instance
                        return insertMoreBox;
                    }

                    return null;
                }
            });

            // Register plugin
            tinymce.PluginManager.add('insertmore', tinymce.plugins.InsertMorePlugin);

            // Init tinyMCE
            tinyMCE.init({

                // General options
                mode : "exact",
                elements : "elm1",
                theme: "advanced",

                // For a built-in list of plugins with doc: http://wiki.moxiecode.com/index.php/TinyMCE:Plugins
                //plugins: "safari,advhr,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template,table,insertmore,autoresize",
                plugins: "safari,advhr,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template,table,autoresize",

                // Context Menu
                //theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,table,link,insertmore",
                theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,table,link",
                theme_advanced_buttons2:"",
                theme_advanced_buttons3:"",
                // set this to external|top|bottom
                theme_advanced_toolbar_location: "top",
                theme_advanced_toolbar_align: "left",
                theme_advanced_statusbar_location: "none",
                handle_node_change_callback: "sakai_global.sitespages.mySelectionEvent",
                init_instance_callback: "sakai_global.sitespages.startEditPage",

                // Example content CSS (should be your site CSS)
                content_css: sakai.config.URL.TINY_MCE_CONTENT_CSS,

                // Editor CSS - custom Sakai Styling
                editor_css: sakai.config.URL.TINY_MCE_EDITOR_CSS,

                // Drop lists for link/image/media/template dialogs
                template_external_list_url: "lists/template_list.js",
                external_link_list_url: "lists/link_list.js",
                external_image_list_url: "lists/image_list.js",
                media_external_list_url: "lists/media_list.js",

                // Use the native selects
                use_native_selects : true,

                // Replace tabs by spaces.
                nonbreaking_force_tab : true,

                // Security
                verify_html : true,
                cleanup : true,
                entity_encoding : "named",
                invalid_elements : "script",
                valid_elements : ""+
                    "@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],"+
                    "a[href|rel|rev|target|title|type],"+
                    "address[],"+
                    "b[],"+
                    "blink[],"+
                    "blockquote[align|cite|clear|height|type|width],"+
                    "br[clear],"+
                    "caption[align|height|valign|width],"+
                    "center[align|height|width],"+
                    "col[align|bgcolor|char|charoff|span|valign|width],"+
                    "colgroup[align|bgcolor|char|charoff|span|valign|width],"+
                    "comment[],"+
                    "em[],"+
                    "embed[src|class|id|autostart]"+
                    "font[color|face|font-weight|point-size|size],"+
                    "h1[align|clear|height|width],"+
                    "h2[align|clear|height|width],"+
                    "h3[align|clear|height|width],"+
                    "h4[align|clear|height|width],"+
                    "h5[align|clear|height|width],"+
                    "h6[align|clear|height|width],"+
                    "hr[align|clear|color|noshade|size|width],"+
                    "i[],"+
                    "img[align|alt|border|height|hspace|src|vspace|width],"+
                    "li[align|clear|height|type|value|width],"+
                    "marquee[behavior|bgcolor|direction|height|hspace|loop|scrollamount|scrolldelay|vspace|width],"+
                    "maction[],"+
                    "maligngroup[],"+
                    "malignmark[],"+
                    "math[],"+
                    "menclose[],"+
                    "merror[],"+
                    "mfenced[],"+
                    "mfrac[],"+
                    "mglyph[],"+
                    "mi[],"+
                    "mlabeledtr[],"+
                    "mlongdiv[],"+
                    "mmultiscripts[],"+
                    "mn[],"+
                    "mo[],"+
                    "mover[],"+
                    "mpadded[],"+
                    "mphantom[],"+
                    "mroot[],"+
                    "mrow[],"+
                    "ms[],"+
                    "mscarries[],"+
                    "mscarry[],"+
                    "msgroup[],"+
                    "msline[],"+
                    "mspace[],"+
                    "msqrt[],"+
                    "msrow[],"+
                    "mstack[],"+
                    "mstyle[],"+
                    "msub[],"+
                    "msup[],"+
                    "msubsup[],"+
                    "mtable[],"+
                    "mtd[],"+
                    "mtext[],"+
                    "mtr[],"+
                    "munder[],"+
                    "munderover[],"+
                    "ol[align|clear|height|start|type|width],"+
                    "p[align|clear|height|width],"+
                    "pre[clear|width|wrap],"+
                    "s[],"+
                    "semantics[],"+
                    "small[],"+
                    "span[align],"+
                    "strike[],"+
                    "strong[],"+
                    "sub[],"+
                    "sup[],"+
                    "table[align|background|bgcolor|border|bordercolor|bordercolordark|bordercolorlight|"+
                           "bottompadding|cellpadding|cellspacing|clear|cols|height|hspace|leftpadding|"+
                           "rightpadding|rules|summary|toppadding|vspace|width],"+
                    "tbody[align|bgcolor|char|charoff|valign],"+
                    "td[abbr|align|axis|background|bgcolor|bordercolor|"+
                       "bordercolordark|bordercolorlight|char|charoff|headers|"+
                       "height|nowrap|rowspan|scope|valign|width],"+
                    "tfoot[align|bgcolor|char|charoff|valign],"+
                    "th[abbr|align|axis|background|bgcolor|bordercolor|"+
                       "bordercolordark|bordercolorlight|char|charoff|headers|"+
                       "height|nowrap|rowspan|scope|valign|width],"+
                    "thead[align|bgcolor|char|charoff|valign],"+
                    "tr[align|background|bgcolor|bordercolor|"+
                       "bordercolordark|bordercolorlight|char|charoff|"+
                       "height|nowrap|valign],"+
                    "tt[],"+
                    "u[],"+
                    "ul[align|clear|height|start|type|width]"+
                    "video[src|class|autoplay|controls|height|width|preload|loop]"
            });
        }

        /**
         * Sets up the tinyMCE toolbar
         * @return void
         */
         /*
        var setupToolbar = function(){
            try {

                var $external_toolbar = $(".mceExternalToolbar");

                // Adjust iFrame
                $elm1_ifr.css({'overflow':'hidden', 'height':'auto'});
                $elm1_ifr.attr({'scrolling':'no','frameborder':'0'});

                if (!sakai_global.sitespages.toolbarSetupReady) {
                    $(".mceToolbarEnd").before(sakai.api.Util.TemplateRenderer("editor_extra_buttons", {}));
                    $(".insert_more_dropdown_activator").bind("click", function(ev){ toggleInsertMore(); });
                }

                $external_toolbar.parent().appendTo(".mceToolbarExternal");
                $external_toolbar.show().css({"position":"static", 'border':'0px solid black'});
                $(".mceExternalClose").hide();

                $external_toolbar.show();

                // Position toolbar
                //placeToolbar();
            }
            catch (err) {
                // Firefox throws strange error, doesn't affect anything
                // Ignore
            }
        };
    */

        /**
         * Position tinyMCE toolbar
         * @return void
         */
         /*
        var placeToolbar = function(){
            sakai_global.sitespages.curScroll = document.body.scrollTop;

            if (sakai_global.sitespages.curScroll === 0) {
                if (window.pageYOffset) {
                    sakai_global.sitespages.curScroll = window.pageYOffset;
                } else {
                    sakai_global.sitespages.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
                }
            }
            var barTop = sakai_global.sitespages.curScroll;
            $toolbarcontainer.css("width", ($("#toolbarplaceholder").width()) + "px");

            // Variable that contains the css for the tinyMCE menus
            var tinyMCEmenuCSS = {};
            var textColorMenu, backColorMenu;
            // Check if the current scroll position is smaller then the top position of the toolbar
            if (barTop <= sakai_global.sitespages.minTop) {

                // Set the position of the toolbar
                $toolbarcontainer.css({"position":"absolute", "top": sakai_global.sitespages.minTop + "px"});

                // Set the position of the Insert more menu
                $insert_more_menu.css({"position": "absolute", "top":(sakai_global.sitespages.minTop + 28) + "px"});

                // Set the positions of the native tinyMCE menus
                tinyMCEmenuCSS = {"position":"absolute", "top":(sakai_global.sitespages.minTop + 30) + "px"};
                $(elm1_menu_formatselect).css(tinyMCEmenuCSS);
                $(elm1_menu_fontselect).css(tinyMCEmenuCSS);
                $(elm1_menu_fontsizeselect).css(tinyMCEmenuCSS);

                // Set the position for the text color menu
                textColorMenu = $("#elm1_forecolor_menu");
                if (textColorMenu.css("position") === "fixed"){
                    textColorMenu.css("position", "absolute");
                    textColorMenu.css("top", "334px");
                };

                // Set the position for the background-color menu
                backColorMenu = $("#elm1_backcolor_menu");
                if (backColorMenu.css("position") === "fixed"){
                    backColorMenu.css("position", "absolute");
                    backColorMenu.css("top", "334px");
                };

            }
            else {

                // Set the position: fixed when you scroll down a site page
                tinyMCEmenuCSS = {"position":"fixed", "top":"30px"};
                $(elm1_menu_formatselect).css(tinyMCEmenuCSS);
                $(elm1_menu_fontselect).css(tinyMCEmenuCSS);
                $(elm1_menu_fontsizeselect).css(tinyMCEmenuCSS);

                $toolbarcontainer.css({"position":"fixed", "top":"0px"});
                $insert_more_menu.css({"position": "fixed", "top":"28px"});

                // Set the position for the text color menu
                textColorMenu = $("#elm1_forecolor_menu");
                if (textColorMenu.css("position") === "absolute"){
                    textColorMenu.css("position", "fixed");
                    textColorMenu.css("top", "30px");
                };

                // Set the position for the background-color menu
                backColorMenu = $("#elm1_backcolor_menu");
                if (backColorMenu.css("position") === "absolute"){
                    backColorMenu.css("position", "fixed");
                    backColorMenu.css("top", "30px");
                };

            }

            var $insert_more_dropdown_main = $("#insert_more_dropdown_main");
            if($insert_more_dropdown_main.length > 0){
                $insert_more_menu.css("left",$insert_more_dropdown_main.position().left + $("#toolbarcontainer").position().left + 10 + "px");
            }

            sakai_global.sitespages.last = new Date().getTime();
        };
    */

        /**
         * tinyMCE selection event handler
         * @retun void
         */
        sakai_global.sitespages.mySelectionEvent = function(){
            var ed = tinyMCE.get('elm1');
            $context_menu.hide();
            var selected = ed.selection.getNode();
            if (selected && selected.nodeName.toLowerCase() === "img") {
                if ($(selected).hasClass("widget_inline")){
                    $context_settings.show();
                } else {
                    $context_settings.hide();
                }
                var pos = tinymce.DOM.getPos(selected);
                $context_menu.css({"top": pos.y + $("#elm1_ifr").position().top + 15 + "px", "left": pos.x + $("#elm1_ifr").position().left + 15 + "px", "position": "absolute"}).show();
            }

            // save the cursor position in the editor
            bookmark = tinyMCE.get("elm1").selection.getBookmark(1);
        };

        // hide the context menu when it is shown and a click happens elsewhere on the document
        $(document).bind("click", function(e) {
            if ($context_menu.is(":visible") && $(e.target).parents($context_menu.selector).length === 0) {
                $context_menu.hide();
            }
            if (!($(e.target).is("#sitepages_insert_dropdown_button") || $(e.target).parents("#sitepages_insert_dropdown_button").length || $(e.target).is(".sitepages_insert_dropdown_header") || $(e.target).parents(".sitepages_insert_dropdown_header").length)) {
                showHideInsertDropdown(true);
            }
        });


        //--------------------------------------------------------------------------------------------------------------
        //
        // EDIT PAGE
        //
        //--------------------------------------------------------------------------------------------------------------


        /////////////////////////////
        // EDIT PAGE: FUNCTIONALITY
        /////////////////////////////

        /**
         * Edit a page defined by its URL safe title
         * @param {String} pageid
         * @return void
         */
        var editPage = function(pageUrlName){

            registerWidgetFunctions();

            // Init
            var hasopened = false;
            var pagetitle = "";
            sakai_global.sitespages.inEditView = true;
            $("#sitespages_page_options #page_options").hide();
            $("#sitespages_page_options #page_save_options").show().html(sakai.api.Util.TemplateRenderer("#edit_page_action_buttons_template", {}));
            // Edit page title
            document.title = document.title.replace(sakai.api.i18n.General.getValueForKey("SITE_VIEW"), sakai.api.i18n.General.getValueForKey("PAGE_EDIT"));

            // UI init
            $more_menu.hide();
            $("#" + pageUrlName).html("");
            $main_content_div.children().css("display","none");

            // See if we are editing Navigation, if yes hide title bar
            if (pageUrlName === "_navigation"){
                $title_input_container.hide();
                sakai_global.sitespages.isEditingNavigation = true;
            } else {
                $title_input_container.show();
                sakai_global.sitespages.isEditingNavigation = false;
            }

            // Refresh site_info object
            sakai_global.sitespages.refreshSiteInfo("", false);

            // Get title
            pagetitle = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"];


            // Prefill page title -- $("<div></div>").append(pagetitle).text(): getting rid of HTML special entities on display - there might be better ways...
            $("#title-input").val($("<div></div>").append(pagetitle).text());

            // Generate the page location
            showPageLocation();

            // Put content in editor
            var content = "";
            if (pageUrlName === "_navigation") {
                content = sakai_global.sitespages.pagecontents[pageUrlName];
            }
            else {
                content = sakai_global.sitespages.pagecontents[pageUrlName]["sakai:pagecontent"] || "";
            }

            tinyMCE.get("elm1").setContent(content, {format : 'raw'});

            $("#messageInformation").hide();

            // Switch to edit view
            $("#show_view_container").hide();
            $("#edit_view_container").show();

            // Setup tinyMCE Toolbar
            //setupToolbar();
            sakai_global.sitespages.toolbarSetupReady = true;

            if (sakai_global.sitespages.isEditingNavigation){
                $("#insert_more_media").hide();
                $("#insert_more_goodies").hide();
                $("#insert_more_sidebar").show();
            } else if (!sakai_global.sitespages.isEditingNavigation){
                $("#insert_more_media").show();
                $("#insert_more_goodies").show();
                $("#insert_more_sidebar").hide();
            }

            // Show the autosave dialog if a previous autosave version is available
            $.ajax({
                url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/pageContentAutoSave.json",
                cache: false,
                success: function(data){

                    if ((data["sakai:pagecontent"] !== "") && (sakai_global.sitespages.pagecontents[pageUrlName] !== data["sakai:pagecontent"])){
                        sakai_global.sitespages.autosavecontent = data["sakai:pagecontent"];
                        $('#autosave_dialog').jqmShow();
                    } else {
                        sakai_global.sitespages.timeoutid = setInterval(sakai_global.sitespages.doAutosave, sakai_global.sitespages.autosaveinterval);
                    }

                },
                error: function(xhr, textStatus, thrownError) {
                    sakai_global.sitespages.timeoutid = setInterval(sakai_global.sitespages.doAutosave, sakai_global.sitespages.autosaveinterval);
                }
            });
        };


        /////////////////////////////
        // EDIT PAGE: CANCEL
        /////////////////////////////

        var cancelEdit = function() {

            clearInterval(sakai_global.sitespages.timeoutid);

            $(window).trigger("exitedit.sitespages.sakai");

            $context_menu.hide();
            sakai_global.sitespages.inEditView = false;

            // Edit page title
            document.title = document.title.replace(sakai.api.i18n.General.getValueForKey("PAGE_EDIT"), sakai.api.i18n.General.getValueForKey("SITE_VIEW"));
            $("#sitespages_page_options #page_save_options").hide();
            $("#sitespages_page_options #page_options").show().html(sakai.api.Util.TemplateRenderer("#sitespages_page_options_container", {}));
            if (sakai_global.sitespages.isEditingNewPage) {

                // Display previous page content
                $("#" + sakai_global.sitespages.selectedpage).show();

                // Delete the folder that has been created for the new page
                $.ajax({
                    url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"],
                    data: {
                        ":operation":"delete"
                    },
                    type: "POST",
                    success: function(data) {
                        // Delete page from site_info if exists
                        if (sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]) {
                            delete sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage];
                        }

                        // Delete page from pagecontents if exists
                        if (sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]) {
                            delete sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage];
                        }

                        // Delete page from navigation widget
                        sakai_global.sitespages.navigation.deleteNode(sakai_global.sitespages.selectedpage);

                        // Adjust selected page back to the old page
                        sakai_global.sitespages.navigation.deselectCurrentNode();
                        sakai_global.sitespages.selectedpage = sakai_global.sitespages.oldSelectedPage;
                        sakai_global.sitespages.navigation.selectNode(sakai_global.sitespages.selectedpage);

                        // Switch back to view
                        viewSelectedPage();
                    }
                });

            } else {

                // Switch to text editor
                switchToTextEditor();

                // Switch back to view
                viewSelectedPage();
            }
        };


        /////////////////////////////
        // EDIT PAGE: SAVE
        /////////////////////////////

        /**
         * Determine the highest position number of a page
         * @returns {Int} The highest page position number in the cached site info object
         */
        var determineHighestPosition = function(){
            var highest = 0;
            for (var i in sakai_global.sitespages.site_info._pages){
                if (sakai_global.sitespages.site_info._pages[i]["pagePosition"] && parseInt(sakai_global.sitespages.site_info._pages[i]["pagePosition"], 10) > highest){
                    highest = parseInt(sakai_global.sitespages.site_info._pages[i]["pagePosition"], 10);
                }
            }
            return highest;
        };

        /**
         * Check if the content is empty or not
         * @param {String} content The content of the WYSIWYG editor
         */
        var checkContent = function(content){
            if (content) {
                return true;
            } else {
                return false;
            }
        };


        /**
         * Get the content inside the TinyMCE editor
         */
        var getContent = function(){
            return tinyMCE.get("elm1").getContent({format : 'raw'}).replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
        };


        /**
         * Shows the selected page in view mode
         */
        var viewSelectedPage = function () {
            // show newly updated title and content
            var pagecontent = sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"] || "";
            $("#" + sakai_global.sitespages.selectedpage).html(sakai.api.Security.saneHTML(pagecontent));
            $("#" + sakai_global.sitespages.selectedpage).show();
            sakai.api.Util.renderMath(sakai_global.sitespages.selectedpage);
            if (sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageType"] === "webpage") {
                $("#webpage_edit").show();
            }
            $("#pagetitle").html(sakai.api.Security.saneHTML(sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"]));

            // load any widgets that may be on this page
            sakai.api.Widgets.widgetLoader.insertWidgets(sakai_global.sitespages.selectedpage,null,sakai_global.sitespages.config.basepath + "_widgets/");

            // switch back to view mode
            $("#edit_view_container").hide();
            $("#show_view_container").show();

            // update the URL
            History.addBEvent(sakai_global.sitespages.selectedpage);
        };


        /**
         * Saves edits to the current page
         */
        var saveEdit = function() {

            // Clear timeout
            clearInterval(sakai_global.sitespages.timeoutid);
            $("#context_menu").hide();

            // Remove autosave
            removeAutoSaveFile();

            $(window).trigger("exitedit.sitespages.sakai");

            $("#sitespages_page_options #page_save_options").hide();
            $("#sitespages_page_options #page_options").show().html(sakai.api.Util.TemplateRenderer("#sitespages_page_options_container", {}));
            // Edit page title
            document.title = document.title.replace(sakai.api.i18n.General.getValueForKey("PAGE_EDIT"), sakai.api.i18n.General.getValueForKey("SITE_VIEW"));

            // Switch to Text Editor tab (as opposed to HTML or Preview)
            switchToTextEditor();

            // check if user is editing navigation or a standard page
            if (sakai_global.sitespages.isEditingNavigation) {
                saveEdit_Navigation();
            } else {
                // Check whether pagetitle and content exist
                var newpagetitle = $.trim($("#title-input").val());
                if (!newpagetitle.replace(/ /g,"%20")) {
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PLEASE_SPECIFY_A_PAGE_TITLE"),"",sakai.api.Util.notification.type.ERROR);
                    $("#title-input").focus();
                    return;
                }
                var newcontent = getContent() || "";  // Get the content from tinyMCE
                if (!checkContent(newcontent)) {
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PLEASE_ENTER_SOME_CONTENT"),"",sakai.api.Util.notification.type.ERROR);
                    return;
                }

                // User has entered title and content, are they different from before?
                var titleChanged = false;    // default is unchanged title
                var contentChanged = false;  // default is unchanged content
                if (newpagetitle !== sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"]) {
                    sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"] = newpagetitle;
                    titleChanged = true;
                }
                if (newcontent !== sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"]) {
                    sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"] = newcontent;
                    contentChanged = true;
                }

                // proceed to save changes, if any
                if (titleChanged || contentChanged) {
                    // save page node and switch back to viewing
                    var thisPage = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage];
                    sakai_global.sitespages.savePage(thisPage["jcr:path"], thisPage["pageType"], newpagetitle,
                        newcontent, thisPage["pagePosition"], "parent", (thisPage.fullwidth || false),
                        function (success, return_data) {

                        if (success) {
                            viewSelectedPage();
                            updateRevisionHistory(sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"]);
                        } else {
                            // Page node save wasn't successful
                            debug.error("sitepages_admin.js/saveEdit(): Failed to update page content while saving existing page: " + sakai_global.sitespages.config.basepath);
                        }
                    });

                    // if title has changed, refresh the navigation tree
                    if (titleChanged) {
                        sakai_global.sitespages.navigation.renameNode(sakai_global.sitespages.selectedpage, newpagetitle);
                    }
                } else {
                    // nothing has changed, switch back to viewing
                    viewSelectedPage();
                }
            }

            sakai_global.sitespages.inEditView = false;
        };


        var saveEdit_Navigation = function() {

            // Navigation
            sakai_global.sitespages.pagecontents._navigation = getContent();
            $("#page_nav_content").html(sakai_global.sitespages.pagecontents._navigation);

            document.getElementById(sakai_global.sitespages.selectedpage).style.display = "block";

            $("#edit_view_container").hide();
            $("#show_view_container").show();

            sakai.api.Widgets.widgetLoader.insertWidgets("page_nav_content",null,sakai_global.sitespages.config.basepath + "_widgets/");

            var jsontosave = {};
            jsontosave["sakai:pagenavigationcontent"] = sakai_global.sitespages.pagecontents._navigation;

            sakai.api.Server.saveJSON(sakai_global.sitespages.urls.SITE_NAVIGATION(), jsontosave);

            document.getElementById(sakai_global.sitespages.selectedpage).style.display = "block";
            sakai.api.Widgets.widgetLoader.insertWidgets(sakai_global.sitespages.selectedpage, null, sakai_global.sitespages.config.basepath + "_widgets/");

            // Create an activity item for the page edit
            /*
            var nodeUrl = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"];
            var activityData = {
                "sakai:activityMessage": "The navigationbar of page <a href=\"/sites/"+sakai_global.sitespages.currentsite.id + "#" + sakai_global.sitespages.selectedpage + "\">" + sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].pageTitle + "</a> in site \"" + sakai_global.sitespages.currentsite.name + "\" has been updated"
            }
            sakai.api.Activity.createActivity(nodeUrl, "site", "default", activityData); */

        };

        /////////////////////////////
        // EDIT PAGE: GENERAL
        /////////////////////////////

        var didInit = false;
        // Bind Edit page link click event
        $("#edit_page").bind("click", function(ev){
            sakai_global.sitespages.isEditingNewPage = false;
            sakai_global.sitespages.inEditView = true;

            //Check if tinyMCE has been loaded before - probably a more robust check will be needed
            if (sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageType"] === "dashboard") {
                var dashboardTUID = $("#" + sakai_global.sitespages.selectedpage).children("div").attr("id");
                $(window).trigger("showAddWidgetDialog.dashboard.sakai", dashboardTUID);
            } else {
                if (tinyMCE.activeEditor === null) {
                    init_tinyMCE();
                } else {
                    if (tinyMCE.activeEditor.id !== "elm1" && didInit === false) {
                      tinyMCE.remove(tinyMCE.activeEditor.id);
                      init_tinyMCE();
                      didInit = true;
                    }
                    editPage(sakai_global.sitespages.selectedpage);
                }
            }

            return false;
        });

        var didInsertDropdownInit = false;
        var addEditPageBinding = function(){
            // Bind cancel button click
            $(".cancel-button").live("click", function(ev){
                cancelEdit();
            });

            // Bind Save button click
            $(".save_button").live("click", function(ev){
                saveEdit();
            });

            // Bind insert dropdown
            if (!didInsertDropdownInit) {
                renderInsertDropdown();
                didInsertDropdownInit = true;
            }
        };

        /**
         * Callback function to trigger editPage() when tinyMCE is initialised
         * @return void
         */
        sakai_global.sitespages.startEditPage = function() {

            // Check wether we will edit navigation bar or normal page
            if (sakai_global.sitespages.isEditingNavigation)
                {
                    editPage("_navigation");
                } else {
                    editPage(sakai_global.sitespages.selectedpage);
            }
            addEditPageBinding();

        };

        //--------------------------------------------------------------------------------------------------------------
        //
        // PAGE LOCATION
        //
        //--------------------------------------------------------------------------------------------------------------

        /**
         * Displays current page's location within a site, also adds a 'Move...' button
         * @return void
         */
        var showPageLocation = function(){
            //http://localhost:8080/~resources#page=resourcespagesthird-page
            if (!$.isEmptyObject(sakai_global.currentgroup.id)){
                $("#new_page_path").html(sakai.api.Security.saneHTML("<span>Page location: </span>" + sakai.config.SakaiDomain + "/~" + sakai_global.currentgroup.id + "#page=" + sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].pageURLName));
            } else {
                $("#new_page_path").html(sakai.api.Security.saneHTML("<span>Page location: </span>" + sakai.config.SakaiDomain + "/~" + sakai.data.me.user.userid + "#page=" + sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].pageURLName));
            }

        };


        //--------------------------------------------------------------------------------------------------------------
        //
        // AUTOSAVE
        //
        //--------------------------------------------------------------------------------------------------------------

        /**
         * Autosave functionality
         * @return void
         */
        sakai_global.sitespages.doAutosave = function(){

            var tosave = "";

            //Get content to save according to which view (tab) is the editor in
            if (!sakai_global.sitespages.currentEditView){
                tosave = tinyMCE.get("elm1").getContent();
            } else if (sakai_global.sitespages.currentEditView === "html"){
                tosave = $("#html-editor-content").val();
            }

            // Save the data
            var jsonString = $.toJSON({"pageContentAutoSave": { "sakai:pagecontent": tosave }});
            $.ajax({
                url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"],
                type: "POST",
                data: {
                    ":operation": "import",
                    ":contentType": "json",
                    ":content": jsonString,
                    ":replace": true,
                    ":replaceProperties": true,
                    "_charset_": "utf-8"
                },
                success: function(data) {
                    sakai_global.sitespages.autosavecontent = tosave;
                }
            });

            // Update autosave indicator
            $("#realtime").text(sakai.api.l10n.transformTime(new Date()));
            $("#messageInformation").show();

        };


        /**
         * Hide Autosave
         * @param {Object} hash
         * @return void
         */
        var hideAutosave = function(hash){

            hash.w.hide();
            hash.o.remove();
            sakai_global.sitespages.timeoutid = setInterval(sakai_global.sitespages.doAutosave, sakai_global.sitespages.autosaveinterval);
            removeAutoSaveFile();

        };

        /**
         * Remove autosave file from JCR
         * @return void
         */
        var removeAutoSaveFile = function(){

            // Remove autosave file
            if (sakai_global.sitespages.autosavecontent) {
                $.ajax({
                    url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/pageContentAutoSave",
                    type: 'POST',
                    data: {
                        ":operation":"delete"
                    }
                });
            }

        };


        // Bind autosave click
        $("#autosave_revert").bind("click", function(ev){
            tinyMCE.get("elm1").setContent(sakai_global.sitespages.autosavecontent, {format : 'raw'});
            $('#autosave_dialog').jqmHide();
        });


        // Init autosave dialogue modal
        $('#autosave_dialog').jqm({
            modal: true,
            trigger: $('.autosave_dialog'),
            overlay: 20,
            toTop: true,
            onHide: hideAutosave
        });

        //--------------------------------------------------------------------------------------------------------------
        //
        // WIDGET CONTEXT MENU
        //
        //--------------------------------------------------------------------------------------------------------------


        //////////////////////////////////////
        // WIDGET CONTEXT MENU: SETTINGS
        //////////////////////////////////////


        // Bind Widget Context Settings click event
        $("#context_settings").bind("click", function(ev){
            var ed = tinyMCE.get('elm1');
            var selected = ed.selection.getNode();
            $("#dialog_content").hide();
            if (selected && selected.nodeName.toLowerCase() === "img" && $(selected).hasClass("widget_inline")) {
                sakai_global.sitespages.updatingExistingWidget = true;
                $("#context_settings").show();
                var id = selected.getAttribute("id");
                var split = id.split("_");
                var type = split[1];
                var uid = split[2];
                var length = split[0].length + 1 + split[1].length + 1 + split[2].length + 1;
                var placement = id.substring(length);
                var widgetSettingsWidth = 650;
                sakai_global.sitespages.newwidget_id = type;
                $("#dialog_content").hide();
                if (sakai.widgets[type]) {
                    if (sakai.widgets[type].settingsWidth) {
                        widgetSettingsWidth = sakai.widgets[type].settingsWidth;
                    }
                    var nuid = "widget_" + type + "_" + uid;
                    if (placement){
                        nuid += "_" + placement;
                    }
                    sakai_global.sitespages.newwidget_uid = nuid;
                    $("#dialog_content").html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>'));
                    $("#dialog_title").html(sakai.widgets[type].name);
                    sakai.api.Widgets.widgetLoader.insertWidgets("dialog_content", true,sakai_global.sitespages.config.basepath + "_widgets/");
                    $("#dialog_content").show();
                    $('#insert_dialog').css({'width':widgetSettingsWidth + "px", 'margin-left':-(widgetSettingsWidth/2) + "px"}).jqmShow();
                }
            }

            $("#context_menu").hide();

        });

        // Bind Context menu settings hover event
        $("#context_settings").hover(
            function(over){
                $("#context_settings").addClass("selected_option");
            },
            function(out){
                $("#context_settings").removeClass("selected_option");
            }
        );

        //////////////////////////////////////
        // WIDGET CONTEXT MENU: REMOVE
        //////////////////////////////////////

        // Bind Widget Context Remove click event
        $("#context_remove").bind("mousedown", function(ev){
            tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
        });


        // Bind Context menu remove hover event
        $("#context_remove").hover(
            function(over){
                $("#context_remove").addClass("selected_option");
            },
            function(out){
                $("#context_remove").removeClass("selected_option");
            }
        );

        //////////////////////////////////////
        // WIDGET CONTEXT MENU: WRAPPING
        //////////////////////////////////////

        /**
         * Show wrapping dialog
         * @param {Object} hash
         * @return void
         */
        var showWrappingDialog = function(hash){
            $("#context_menu").hide();
            window.scrollTo(0,0);
            hash.w.show();
        };

        /**
         * Create a new style
         * @param {Object} toaddin
         * @return void
         */
        var createNewStyle = function(toaddin){
            var ed = tinyMCE.get('elm1');
            var selected = ed.selection.getNode();
            if (selected && selected.nodeName.toLowerCase() === "img") {
                var style = selected.getAttribute("style").replace(/ /g, "");
                var splitted = style.split(';');
                var newstyle = '';
                for (var i = 0, j = splitted.length; i < j; i++) {
                    var newsplit = splitted[i].split(":");
                    if (newsplit[0] && newsplit[0] !== "display" && newsplit[0] !== "float") {
                        newstyle += splitted[i] + ";";
                    }
                }
                newstyle += toaddin;
                newstyle.replace(/[;][;]/g,";");

                var toinsert = '<';
                toinsert += selected.nodeName.toLowerCase();
                for (i = 0, j = selected.attributes.length; i<j; i++){
                    if (selected.attributes[i].nodeName.toLowerCase() === "style") {
                        toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + newstyle + '"';
                    } else if (selected.attributes[i].nodeName.toLowerCase() === "mce_style") {
                        toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + newstyle + '"';
                    } else {
                        toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + selected.attributes[i].nodeValue + '"';
                    }
                }
                toinsert += '/>';

                //sakai.api.Util.notification.show(ed.selection.getContent() + "\n" + selected.getAttribute("style"),"",sakai.api.Util.notification.type.ERROR);

                tinyMCE.get("elm1").execCommand('mceInsertContent', true, toinsert);
            }
        };

        var setNewStyleClass = function(classToAdd) {
            var ed = tinyMCE.get('elm1');
            var $selected = $(ed.selection.getNode());
            $selected.removeClass("block_image").removeClass("block_image_right").removeClass("block_image_left");
            $selected.addClass(classToAdd);
        };

        // Bind wrapping_no click event
        $("#wrapping_no").bind("click",function(ev){
            setNewStyleClass("block_image");
            $('#wrapping_dialog').jqmHide();
        });

        // Bind wrapping left click event
        $("#wrapping_left").bind("click",function(ev){
            setNewStyleClass("block_image_left");
            $('#wrapping_dialog').jqmHide();
        });

        // Bind wrapping right click event
        $("#wrapping_right").bind("click",function(ev){
            setNewStyleClass("block_image_right");
            $('#wrapping_dialog').jqmHide();
        });

        // Init wrapping modal
        $('#wrapping_dialog').jqm({
                modal: true,
                trigger: $('#context_appearance_trigger'),
                overlay: 20,
                toTop: true,
                onShow: showWrappingDialog
            });


        //////////////////////////////////////
        // WIDGET CONTEXT MENU: GENERAL
        //////////////////////////////////////


        // Bind Context menu appereance hover event
        $("#context_appearance").hover(
            function(over){
                $("#context_appearance").addClass("selected_option");
            },
            function(out){
                $("#context_appearance").removeClass("selected_option");
            }
        );


        //--------------------------------------------------------------------------------------------------------------
        //
        // TABS
        //
        //--------------------------------------------------------------------------------------------------------------

        /////////////////////////////
        // TABS: TEXT EDITOR
        /////////////////////////////

        /**
         * Switch to Text Editor tab
         * @return void
         */
        var switchToTextEditor = function(){
            $fl_tab_content_editor.show();
            $toolbarplaceholder.show();
            $toolbarcontainer.show();
            $("#title-input").show();
            if (sakai_global.sitespages.currentEditView === "preview"){
                $("#page_preview_content").hide().html("");
                $("#new_page_path").show();
                switchtab("preview","Preview","text_editor","Text Editor");
            } else if (sakai_global.sitespages.currentEditView === "html"){
                var value = $("#html-editor-content").val();
                tinyMCE.get("elm1").setContent(value, {format : 'raw'});
                $("#html-editor").hide();
                switchtab("html","HTML","text_editor","Text Editor");
            }
            sakai_global.sitespages.currentEditView = false;
        };

        // Bind Text Editor tab click event
        $("#tab_text_editor").bind("click", function(ev){
            switchToTextEditor();
        });


        /////////////////////////////
        // TABS: HTML
        /////////////////////////////

        // Bind HTML tab click event
        $("#tab_html").bind("click", function(ev){
            $("#context_menu").hide();
            $("#fl-tab-content-editor").hide();
            $("#toolbarplaceholder").hide();
            $("#toolbarcontainer").hide();
            if (!sakai_global.sitespages.currentEditView){
                switchtab("text_editor","Text Editor","html","HTML");
            } else if (sakai_global.sitespages.currentEditView === "preview"){
                $("#page_preview_content").hide().html("");
                $("#new_page_path").show();
                switchtab("preview","Preview","html","HTML");
            }
            var value = tinyMCE.get("elm1").getContent();
            $("#html-editor-content").val(value);
            $("#html-editor").show();
            $("#title-input").show();
            sakai_global.sitespages.currentEditView = "html";
        });



        /////////////////////////////
        // TABS: PREVIEW
        /////////////////////////////

        // Bind Preview tab click event
        $("#tab_preview").bind("click", function(ev){
            $("#context_menu").hide();
            $("#new_page_path").hide();
            $("#html-editor").hide();
            $("#title-input").hide();
            $("#toolbarcontainer").hide();
            $("#fl-tab-content-editor").hide();
            $("#page_preview_content").html("").show();
            $("#toolbarplaceholder").hide();
            if (!sakai_global.sitespages.currentEditView) {
                switchtab("text_editor","Text Editor","preview","Preview");
            } else if (sakai_global.sitespages.currentEditView === "html"){
                var value = sakai.api.Security.saneHTML($("#html-editor-content").val());
                tinyMCE.get("elm1").setContent(value, {format : 'raw'});
                switchtab("html","HTML","preview","Preview");
            }
            $("#page_preview_content").html(sakai.api.Security.saneHTML("<h1 style='padding-bottom:10px'>" + $("#title-input").val() + "</h1>" + getContent()));
            sakai.api.Widgets.widgetLoader.insertWidgets("page_preview_content",null,sakai_global.sitespages.config.basepath + "_widgets/");
            sakai_global.sitespages.currentEditView = "preview";
        });

        $("#sitespages_embed_content_button").live("click", function(e) {
            renderSelectedWidget("embedcontent");
        });



        /////////////////////////////
        // TABS: GENERAL
        /////////////////////////////

        /**
         * Switch between tabs
         * @param {String} inactiveid
         * @param {String} inactivetext
         * @param {String} activeid
         * @param {String} activetext
         * @return void
         */
        var switchtab = function(inactiveid, inactivetext, activeid, activetext){
            //$("#tab_" + inactiveid + " button").removeClass("s3d-button-primary");
            //$("#tab_" + activeid + " button").addClass("s3d-button-primary");
        };


        //--------------------------------------------------------------------------------------------------------------
        //
        // INSERT MORE
        //
        //--------------------------------------------------------------------------------------------------------------


        /////////////////////////////
        // INSERT MORE: INSERT LINK
        /////////////////////////////

        /**
         * Insert Link functionality - inserts a link into a page
         * @return void
         */
        var insertLink = function() {

            var editor = tinyMCE.get("elm1");
            var selection = editor.selection.getContent();

            var $choosen_links = $("#insert_links_availablelinks li.selected");

            // If user selected some text to link
            if (selection) {
                // At the moment insert only first link, should disable multiple selection at the end
                editor.execCommand('mceInsertContent', false, '<a href="#page=' + $($choosen_links[0]).data("link") + '"  class="contauthlink">' + selection + '</a>');
            } else if ($choosen_links.length > 1) {
                // If we are inserting multiple links
                var toinsert = "<ul>";
                for (var i=0, j=$choosen_links.length; i<j; i++) {
                    toinsert += '<li><a href="#page=' + $($choosen_links[i]).data("link") + '" class="contauthlink">' + $($choosen_links[i]).text() + '</a></li>';
                }
                toinsert += "</ul>";
                editor.execCommand('mceInsertContent', false, toinsert);
            } else {
                // If we are insertin 1 link only, without selection
                editor.execCommand('mceInsertContent', false, '<a href="#page=' + $($choosen_links[0]).data("link") + '"  class="contauthlink">' + $($choosen_links[0]).text() + '</a>');
            }

            $('#link_dialog').jqmHide();

            return true;
        };

        // overtake the click action for the inserted links to make the navigation work properly
        $('.contauthlink').die("click");
        $('.contauthlink').live("click", function() {
            var id = $(this).attr("href").split("#page=")[1];
            sakai_global.sitespages.navigation.deselectCurrentNode();
            sakai_global.sitespages.navigation.selectNode(id);
            return false;
        });

        // Bind Insert link confirmation click event
        $("#insert_link_confirm").bind("click", function(ev){
            insertLink();
        });


        // Init Insert link modal
        $('#link_dialog').jqm({
            modal: true,
            overlay: 20,
            onShow: function(hash) {

                var $links = $('<ul id="insert_links_availablelinks"></ul>');
                var toggleSelectedOn = function(e) {
                    $(this).addClass("selected");
                };
                var toggleSelectedOff = function(e) {
                    $(this).removeClass("selected");
                };
                // Create clickable page links
                for (var urlname in sakai_global.sitespages.site_info._pages) {
                    if (sakai_global.sitespages.site_info._pages[urlname]) {
                        var $link = $('<li id="linksel_'+ urlname +'">' + sakai_global.sitespages.site_info._pages[urlname]["pageTitle"] + '</li>')
                            .data("link", urlname)
                            .css({"padding-left": ((parseInt(sakai_global.sitespages.site_info._pages[urlname]["pageDepth"],10) - 4) * 3) + "px"})
                            .toggle(toggleSelectedOn, toggleSelectedOff);
                        $links.append($link);
                    }
                }

                $("#link_container").html($links);

                $("#insert_more_menu").hide();

                hash.w.show();
            },
            toTop: true
        });

        /**
         * Show or hide the more menu
         * @param {Boolean} hideOnly
         *  true: Hide the menu only
         *  false: Show or hide the menu depending if it's already visible
         */
        var showHideMoreMenu = function(hideOnly){
            var el = $("#more_menu");
            if (el) {
                if ((el.css("display") && el.css("display").toLowerCase() !== "none") || hideOnly) {
                    $("#more_link").removeClass("clicked");
                    el.hide();
                } else {
                    $("#more_link").addClass("clicked");
                    var x = $("#more_link").position().left;
                    var y = $("#more_link").position().top;
                    el.css(
                            {
                              "top": y + 28 + "px",
                              "left": x + 2 + "px"
                            }
                        ).show();
                }
            }
        };

        // Bind Insert Link click event
        $("#more_link").live("click", function(ev){
            showHideMoreMenu(false);
        });
        // Bind mousedown and mouseup to give an optional clicking effect via css
        $("#more_link").live("mousedown", function(e) {
            $("#more_link").addClass("clicking");
        });
        $("#more_link").live("mouseup", function(e) {
            $("#more_link").removeClass("clicking");
        });

        /////////////////////////////
        // INSERT MORE: ADD HORIZONTAL LINE
        /////////////////////////////

        // Bind Insert horizontal line click event
        $("#horizontal_line_insert").bind("click", function(ev){
            tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<hr/>');
        });


        /////////////////////////////
        // INSERT MORE: ADD SELECTED WIDGET
        /////////////////////////////


        /**
         * Render selected widget
         * @param {Object} hash
         * @return void
         */
        var renderSelectedWidget = function(widgetid) {
            var $dialog_content = $("#dialog_content"),
                widgetSettingsWidth = 650;
            $dialog_content.hide();
            if (sakai.widgets[widgetid]){
                sakai_global.sitespages.newwidget_id = widgetid;
                var tuid = "id" + Math.round(Math.random() * 1000000000);
                var id = "widget_" + widgetid + "_" + tuid;
                sakai_global.sitespages.newwidget_uid = id;
                $dialog_content.html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>'));
                $("#dialog_title").html(sakai.widgets[widgetid].name);
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid,true,sakai_global.sitespages.config.basepath + "_widgets/");
                if (sakai.widgets[widgetid].settingsWidth) {
                    widgetSettingsWidth = sakai.widgets[widgetid].settingsWidth;
                }
                $dialog_content.show();
                window.scrollTo(0,0);
            } else if (!widgetid){
                window.scrollTo(0,0);
            }
            $('#insert_dialog').css({'width':widgetSettingsWidth + "px", 'margin-left':-(widgetSettingsWidth/2) + "px"}).jqmShow();
        };


        /**
         * Hide selected widget
         * @param {Object} hash
         * @return void
         */
        var hideSelectedWidget = function(hash){
            hash.w.hide();
            hash.o.remove();
            sakai_global.sitespages.newwidget_id = false;
            sakai_global.sitespages.newwidget_uid = false;
            $("#dialog_content").html("").hide();
        };

        /**
         * Insert widget modal Cancel button - hide modal
         * @param {Object} tuid
         * @retuen void
         */
        sakai_global.sitespages.widgetCancel = function(tuid){
            $('#insert_dialog').jqmHide();
        };


        /**
         * Widget finish - add widget to editor, hide modal
         * @param {Object} tuid
         * @return void
         */
        sakai_global.sitespages.widgetFinish = function(tuid){
            // Add widget to the editor
            $("#insert_screen2_preview").html("");
            if (!sakai_global.sitespages.updatingExistingWidget) {
                tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + sakai.widgets[sakai_global.sitespages.newwidget_id].img + '" id="' + sakai_global.sitespages.newwidget_uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
            }
            sakai_global.sitespages.updatingExistingWidget = false;
            $('#insert_dialog').jqmHide();
        };

        //--------------------------------------------------------------------------------------------------------------
        //
        // ADD NEW...
        //
        //--------------------------------------------------------------------------------------------------------------



        /////////////////////////////
        // ADD NEW: BLANK PAGE
        /////////////////////////////


        /**
         * Create a new page
         * @param {String} [title] Optional title of the new page. Default is 'Untitled'
         * @param {String} [content] Optional TinyMCE HTML content of the new page.
         *   Default is empty content.
         * @param {Function} [callback] Optional callback function once the page is
         *   created. One argument, success, is sent to the callback function -
         *   true if the page was created successfully, false otherwise
         * @return void
         */
        sakai_global.sitespages.createNewPage = function(title, content, callback) {
            var pageTitle = (title && typeof(title) === "string") ?
                sakai.api.Security.saneHTML(title) : untitled_page_title;
            sakai_global.sitespages.isEditingNewPage = true;

            // Create unique page items
            var pageUniques = sakai_global.sitespages.createPageUniqueElements(pageTitle.toLowerCase(), sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageFolder"]);

            // Assign the content to the sakai_global.sitespages.pagecontents array
            if (sakai_global.sitespages.pagecontents[pageUniques.urlName]) {
                sakai_global.sitespages.pagecontents[pageUniques.urlName]["sakai:pagecontent"] = content;
            } else {
                sakai_global.sitespages.pagecontents[pageUniques.urlName] = {};
                sakai_global.sitespages.pagecontents[pageUniques.urlName]["sakai:pagecontent"] = content;
            }

            // save the new page
            var newPosition = determineHighestPosition() + 100000;
            sakai_global.sitespages.savePage(pageUniques.url, "webpage", pageTitle,
                content, newPosition, "parent", false,
                function(success, data){

                if (success) {

                    // Store page selected and old IDs
                    sakai_global.sitespages.oldSelectedPage = sakai_global.sitespages.selectedpage;
                    sakai_global.sitespages.selectedpage = pageUniques.urlName;

                    sakai_global.sitespages.navigation.addNode(sakai_global.sitespages.selectedpage, pageTitle, newPosition);

                    // Init tinyMCE if needed
                    if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
                        init_tinyMCE();
                        $("#sitespages_page_options #page_options").hide();
                        $("#sitespages_page_options #page_save_options").show().html(sakai.api.Util.TemplateRenderer("#edit_page_action_buttons_template", {}));
                    } else {
                        editPage(pageUniques.urlName);
                    }

                    // run callback
                    if ($.isFunction(callback)) {
                        callback(true);
                    }

                } else {
                    debug.error("site_admin.js/sakai_global.sitespages.createNewPage(): Could not create page node for page!");
                    // run callback
                    if ($.isFunction(callback)) {
                        callback(false);
                    }
                }

            });
        };


        /////////////////////////////
        // ADD NEW: DASHBOARD
        /////////////////////////////

        /**
         * Adds a dashboard page to the site.
         * @param {Object} title
         * @param {Function} [callback] Optional callback function once the page is
         *   created. One argument, success, is sent to the callback function -
         *   true if the page was created successfully, false otherwise
         */
        sakai_global.sitespages.addDashboardPage = function(title, callback){
            var pageTitle = (title && typeof(title) === "string") ?
                sakai.api.Security.saneHTML(title) : untitled_page_title;

            // Create unique page elements
            var pageUniques = sakai_global.sitespages.createPageUniqueElements(pageTitle.toLowerCase(), sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageFolder"]);

            // Assign the content to the sakai_global.sitespages.pagecontents array
            if (sakai_global.sitespages.pagecontents[pageUniques.urlName]) {
                sakai_global.sitespages.pagecontents[pageUniques.urlName]["sakai:pagecontent"] = content;
            } else {
                sakai_global.sitespages.pagecontents[pageUniques.urlName] = {};
                sakai_global.sitespages.pagecontents[pageUniques.urlName]["sakai:pagecontent"] = content;
            }
            // Default dasboard content
            var dashboardUID = 'sitedashboard' + Math.round(Math.random() * 10000000000000);
            var defaultDashboardContent = '<div id="widget_dashboard_' + dashboardUID + '_' + sakai_global.sitespages.config.basepath + "_widgets/" + '" class="widget_inline"></div>';

            // Create page node for dashboard page
            var newPosition = determineHighestPosition() + 200000;
            sakai_global.sitespages.savePage(pageUniques.url, "dashboard", title, defaultDashboardContent, newPosition, "parent", false, function(success, data){

                // If page save was successful
                if (success) {

                    // Close this popup and show the new page.
                    //sakai_global.sitespages.selectedpage = pageUniques.urlName;

                    $("#createpage_container").jqmHide();

                    // Refresh site_info object and open page
                    sakai_global.sitespages.refreshSiteInfo(pageUniques.urlName, false);
                    sakai_global.sitespages.navigation.addNode(sakai_global.sitespages.selectedpage, title, newPosition);
                    // Check in new page content to revision history
                    $.ajax({
                        url: pageUniques.url + "/pageContent.save.html",
                        type: "POST"
                    });

                    // run callback
                    if ($.isFunction(callback)) {
                        callback(true);
                    }

                    // Create an activity item for the page edit
                    /* var nodeUrl = pageUniques.url;
                    var activityData = {
                        "sakai:activityMessage": "A new <a href=\"/sites/" + sakai_global.sitespages.currentsite["jcr:name"] + "#" + pageUniques.urlName + "\">dashboard page</a> was created in site \"" + sakai_global.sitespages.currentsite.name + "\"",
                        "sakai:activitySiteName": sakai_global.sitespages.currentsite.name,
                        "sakai:activitySiteId": sakai_global.sitespages.currentsite["jcr:name"]
                    }
                    sakai.api.Activity.createActivity(nodeUrl, "site", "default", activityData); */

                } else {
                    debug.error("site_admin.js/sakai_global.sitespages.addDashboardPage(): Could not create page node for dashboard page!");

                    // run callback
                    if ($.isFunction(callback)) {
                        callback(false);
                    }
                }

            });
        };

        //--------------------------------------------------------------------------------------------------------------
        //
        // MORE MENU
        //
        //--------------------------------------------------------------------------------------------------------------

        ////////////////////////////////////////
        // MORE: PERMISSIONS
        ////////////////////////////////////////
        /**
         * Not included as part of Q1 - see http://jira.sakaiproject.org/browse/SAKIII-717
        $("#more_permissions").bind("click", function(e) {
            $("#more_menu").hide();
            sakai.api.Util.notification.show("Page permissions", "This feature is not implemented yet!", sakai.api.Util.notification.type.ERROR);
        });
        */


        ////////////////////////////////////////
        // MORE: REVISION HISTORY
        ////////////////////////////////////////

        // Bind Revision history click event
        $("#more_revision_history").live("click", function(ev){
            // UI Setup
            $("#content_page_options").hide();
            $("#revision_history_container").show();
            $("#more_menu").hide();

            // fetch data
            $.ajax({
                url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/pageContent.versions.json",
                cache: false,
                success : function(data) {

                    // Populate the select box
                    var select = $("#revision_history_list").get(0);
                    $(select).unbind("change",changeVersionPreview);

                    select.options.length = 0;
                    for (var ver in data.versions){

                        if ((data.versions[ver]) && (ver !== "jcr:rootVersion")) {

                            var name = "Version " + (ver);

                            // Transform date
                            var date = data.versions[ver]["created"];
                            var datestring = sakai.api.l10n.transformDateTimeShort(new Date(date));

                            name += " - " + datestring;

                            if (data.versions[ver]["sakai:savedBy"]) {
                                name += " - " + sakai.api.User.getDisplayName(data.versions[ver]["sakai:savedBy"]);
                            }
                            var id = ver;
                            var option = new Option(name, id);
                            select.options[select.options.length] = option;

                            $(select).bind("change", changeVersionPreview);

                            // Signal that a page reload will be needed when we go back
                            sakai_global.sitespages.versionHistoryNeedsReset = true;

                        }

                    }

                },
                error: function(xhr, textStatus, thrownError) {
                    debug.error("site_admin.js:Revision History: An error has occured while fetching the revision history");
                    sakai_global.sitespages.versionHistoryNeedsReset = true;
                }
            });
        });


        // Bind Revision history cancel click event
        $("#revision_history_cancel").bind("click", function(ev){
            sakai_global.sitespages.resetVersionHistory();
        });

        // Bind Revision History - Revert click event
        $("#revision_history_revert").bind("click", function(ev){

            var select = $("#revision_history_list").get(0);
            var version = select.options[select.selectedIndex].value;

            $.ajax({
                url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/pageContent.version.," + version + ",.json",
                success : function(data) {

                    var type = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageType"];
                    var pagecontent = data["sakai:pagecontent"] || "";
                    if (type === "webpage") {
                        $("#" + sakai_global.sitespages.selectedpage).html(sakai.api.Security.saneHTML(pagecontent));
                        sakai.api.Util.renderMath(sakai_global.sitespages.selectedpage);
                        sakai.api.Widgets.widgetLoader.insertWidgets(sakai_global.sitespages.selectedpage, null, sakai_global.sitespages.config.basepath + "_widgets/");
                        sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"] = pagecontent;

                        // Create an activity item for the page edit
                        /* var nodeUrl = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"];
                        var activityData = {
                            "sakai:activityMessage": "The  page <a href=\"/sites/"+sakai_global.sitespages.currentsite.id + "#" + sakai_global.sitespages.selectedpage + "\">" + sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].pageTitle + "</a> in site \"" + sakai_global.sitespages.currentsite.name + "\" has been reverted to version: " + version
                        }
                        sakai.api.Activity.createActivity(nodeUrl, "site", "default", activityData); */

                    }
                    else if (type === "dashboard") {
                        // Remove previous dashboard
                        $("#" + sakai_global.sitespages.selectedpage).remove();
                        // Render new one
                        sakai_global.sitespages._displayDashboard(pagecontent, true);
                    }

                    // Save new version of this page
                    sakai_global.sitespages.updatePageContent(sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"], pagecontent, function(success, data) {

                        if (success) {

                            // Check in the page for revision control
                            $.ajax({
                                url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/pageContent.save.html",
                                type: "POST"
                            });

                            // Reset versiopn history
                            sakai_global.sitespages.resetVersionHistory();

                        } else {
                            debug.error("site_admin.js: Failed to save new version of page content while applying new revision of content!");
                        }

                    });
                },
                error: function(xhr, textStatus, thrownError) {
                    debug.error("site_admin.js: Failed to fetch new version of page content while applying new revision of content!");
                }
            });
        });


        /**
         * Change Version Preview
         * @return void
         */
        var changeVersionPreview = function(){
            var select = $("#revision_history_list").get(0);
            var version = select.options[select.selectedIndex].value;

            $.ajax({
                url: sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"] + "/pageContent.version.," + version + ",.json",
                success : function(data) {

                    var type = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageType"];
                    var pagecontent = data["sakai:pagecontent"] || "";
                    if (type === "webpage") {
                        $("#" + sakai_global.sitespages.selectedpage).html(sakai.api.Security.saneHTML(pagecontent));
                        sakai.api.Util.renderMath(sakai_global.sitespages.selectedpage);
                        sakai.api.Widgets.widgetLoader.insertWidgets(sakai_global.sitespages.selectedpage, null, sakai_global.sitespages.config.basepath + "_widgets/");
                    } else if (type === "dashboard") {
                        $("#" + sakai_global.sitespages.selectedpage).remove();
                        sakai_global.sitespages._displayDashboard(pagecontent, true);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    debug.error("site_admin.js: An error has occured while trying to change version preview");
                }
            });
        };



        /////////////////////////////
        // MORE: MOVE
        /////////////////////////////

        $("#more_move").live("click", function() {

            $("#more_menu").hide();
            sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PAGE_MOVE"), sakai.api.i18n.General.getValueForKey("TO_MOVE_PAGE_JUST_DRAG_AND_DROP_IN_NAVIGATION"), sakai.api.Util.notification.type.INFORMATION);
        });

        $('#more_change_layout').live("click", function(){
            // get page title
            var title = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"];
            $(window).trigger("changeLayout.dashboard.sakai", title);
        });


        /////////////////////////////////
        // MORE: SAVE PAGE AS TEMPLATE //
        /////////////////////////////////

        /**
         * Start Save As Template
         * @param {Object} hash
         * @return void
         */
        var startSaveAsTemplate = function(hash){
            $("#more_menu").hide();
            hash.w.show();
        };

        // Init Save as Template modal
        $("#save_as_template_container").jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onShow: startSaveAsTemplate
        });

        $('#more_save_as_template').live("click", function(){
            $("#save_as_template_container").jqmShow();
        });

        // Bind Save as Template click event
        $("#save_as_page_template_button").bind("click", function(ev){
            var name = $("#template_name").val();
            var description = $("#template_description").val() || "";
            if (name){

                var newid = Math.round(Math.random() * 100000000);

                var obj = {};
                obj.name = name;
                obj.description = description;

                // Load template configuration file
                sakai.api.Server.loadJSON("/~" + sakai.data.me.user.userid + "/private/templates", function(success, pref_data){
                    if (success) {
                        updateTemplates(obj, newid, pref_data);
                    } else {
                        var empty_templates = {};
                        updateTemplates(obj, newid, empty_templates);
                    }
                });
            }
        });

        /**
         * Update templates in JCR
         * @param {Object} obj
         * @param {Object} newid
         * @param {Object} templates
         * @return void
         */
        var updateTemplates = function(obj, newid, templates){

            templates[newid] = obj;
            templates[newid]["_charset_"] = "utf-8";
            templates[newid]["sling:resourceType"] = "sakai/pagetemplate";
            templates[newid]["pageContent"] = {};
            templates[newid]["pageContent"]["_charset_"] = "utf-8";
            templates[newid]["pageContent"]["sling:resourceType"] = "sakai/pagetemplatecontent";
            templates[newid]["pageContent"]["sakai:pagecontent"] = sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage]["sakai:pagecontent"] || "";

            sakai.api.Server.saveJSON("/~" + sakai.data.me.user.userid + "/private/templates", templates, function(success, response) {

                if (success) {

                    sakai_global.sitespages.mytemplates = templates;

                    $("#save_as_template_container").jqmHide();
                    $("#template_name").val("");
                    $("#template_description").val("");
                } else {
                    debug.error("site_admin.js/updateTemplates(): Could not save page template!");
                }

            });

        };


        ///////////////////////
        // MORE: DELETE PAGE //
        ///////////////////////

        /**
         * This function will update the pageSize when the user deletes a page
         * @param {Object} node, the page that has to be updated
         */
        var updatePagePosition = function(node){
            $.ajax({
                url: node['jcr:path'],
                type: "POST",
                data: {
                    'pagePosition': node.pagePosition
                },
                success: $.noop(),
                error: function(xhr, status, e){
                    debug.error('Error at updatePagePosition');
                }
            });
        };


        /**
         * This function will update the pagePositions when a page is deleted
         * @param selectedpage, this will contain the page that will be updated
         */
        var updatePagePositions = function(selectedPage){
            // Loop over all the pages
            for (var c in sakai_global.sitespages.site_info._pages) {
                //Check if the page position is greater than the page position of the deleted page, if so the pagePosition has to be 2000000 less
                if(parseFloat(sakai_global.sitespages.site_info._pages[c].pagePosition,10) >= parseFloat(selectedPage.pagePosition,10)){
                    sakai_global.sitespages.site_info._pages[c].pagePosition = parseFloat(sakai_global.sitespages.site_info._pages[c].pagePosition) - 200000;
                    updatePagePosition(sakai_global.sitespages.site_info._pages[c]);
                }
            }
        };

        /**
         * Deletes a page
         * @return void
         */
        var deletePage = function() {

            var selectedPage = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage];

            // Delete autosave
            $.ajax({
                url: selectedPage["jcr:path"],
                type: 'POST',
                data: {
                    ":operation":"delete"
                },
                success: function(data){

                    // Create an activity item for the page delete
                    /*var nodeUrl = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"];
                    var activityData = {
                        "sakai:activityMessage": "The page <a href=\"/sites/"+sakai_global.sitespages.currentsite["jcr:name"] + "#" + sakai_global.sitespages.selectedpage + "\">" + sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].pageTitle + "</a> in site \"" + sakai_global.sitespages.currentsite.name + "\" has been deleted",
                        "sakai:activitySiteName": sakai_global.sitespages.currentsite.name,
                        "sakai:activitySiteId": sakai_global.sitespages.currentsite["jcr:name"]
                    }
                    sakai.api.Activity.createActivity(nodeUrl, "site", "default", activityData);
                    */
                    delete sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage];
                    delete sakai_global.sitespages.pagecontents[sakai_global.sitespages.selectedpage];
                    sakai_global.sitespages.navigation.deleteNode(sakai_global.sitespages.selectedpage);
                    sakai_global.sitespages.autosavecontent = false;
                    updatePagePositions(selectedPage);
                    $('#delete_dialog').jqmHide();
                },
                error: function(xhr, textStatus, thrownError) {

                    debug.error("site_admin.js/deletePage(): Could not delete page node at " + sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["jcr:path"]);
                }
            });
        };

        // Init delete dialog
        $('#delete_dialog').jqm({
            modal: true,
            trigger: $('.delete_dialog'),
            overlay: 20,
            toTop: true
        });

        $("#no_delete_dialog").jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

        // Bind delete page click event
        $("#more_delete").live("click", function(){
            $('#delete_dialog').jqmShow();
        });

        // Bind delete page confirmation click event
        $("#delete_confirm").bind("click", function(){
            deletePage();
        });

        //--------------------------------------------------------------------------------------------------------------
        //
        // GLOBAL EVENT LISTENERS
        //
        //--------------------------------------------------------------------------------------------------------------

        // Bind title input change event
        $("#title-input").bind("change", function(){
            $("#new_page_path_current").text(sakai.api.Security.saneHTML($("#title-input").val()));
        });

        // Bind resize event
        $(window).bind("resize", function(){
            $("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() + "px");
        });

        // Bind scroll event
        $(window).bind("scroll", function(e){
            try {
                //placeToolbar();
            } catch (err){
                // Ignore
            }
        });

        // Bind click event to hide menus

        $(document).bind("click", function(e){
            var $clicked = $(e.target);
            // Check if one of the parents is the element container
            if(!$clicked.is("#more_link") && $clicked.parents("#more_link").length === 0){
                showHideMoreMenu(true);
            }
        });

        //////////////////
        // EDIT SIDEBAR //
        //////////////////

        // Bind edit sidebar click
        $("#edit_sidebar").bind("click", function(ev){
            // Init tinyMCE if needed
            if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
                sakai_global.sitespages.isEditingNavigation = true;
                init_tinyMCE();
              } else {
                editPage("_navigation");
            }

            return false;
        });

        //--------------------------------------------------------------------------------------------------------------
        //
        // INIT
        //
        //--------------------------------------------------------------------------------------------------------------

        /**
         * Register the appropriate widget cancel and save functions
         */
        var registerWidgetFunctions = function(){
            sakai.api.Widgets.Container.registerFinishFunction(sakai_global.sitespages.widgetFinish);
            sakai.api.Widgets.Container.registerCancelFunction(sakai_global.sitespages.widgetCancel);
        };

        /**
         * Initialise Admin part
         * @return void
         */
        var admin_init = function() {
            sakai_global.sitespages.adminReady = true;
        };


        // INIT CODE
        $(window).trigger("ready.sitespages.sakai");
        sakai_global.sitespages.isReady = true;
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("sitespages");
});
