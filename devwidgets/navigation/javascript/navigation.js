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
 * /dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js (jstree)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai.site
     *
     * @description
     * Contains the functionality for sites
     */
    sakai_global.sitespages = sakai_global.sitespages || {};

    /**
     * @name sakai_global.sitespages.navigation
     *
     * @description
     * Contains public functions for the navigation widget
     */
    sakai_global.sitespages.navigation = sakai_global.sitespages.navigation || {};

    /**
     * @name sakai_global.navigation
     *
     * @class navigation
     *
     * @description
     * Initialize the navigation widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.navigation = function(tuid, showSettings){

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // global pagecount variable
        sakai_global.sitespages.navigation.pagecount = 0;

        // DOM jQuery objects
        var $rootel = $("#" + tuid);
        var $navigationWidget = $(".navigation_widget", $rootel);

        // Main view
        var $mainView = $("#navigation_main", $rootel);
        var $pageCount = $("#navigation_page_count", $rootel);
        var $navigationTree = $("#navigation_tree", $rootel);
        var $createPageLink = $("#navigation_create_page", $rootel);
        var $deletePageLink = $("#navigation_delete_page", $rootel);
        var $deleteDialog = $("#delete_dialog");  // careful! coming from sitespages.html
        var $nodeleteDialog = $("#no_delete_dialog"); // ^^
        var $deleteConfirmPageTitle = $(".sitespages_delete_confirm_page_title");  // careful! coming from sitespages.html
        var $navigation_delete_confirm_title = $("#navigation_delete_confirm_title");
        var $navigation_admin_options = $("#navigation_admin_options", $rootel);
        var $navigation_footer_edit = $("#navigation_footer_edit", $rootel);
        var $navigation_footer_noedit = $("#navigation_footer_noedit", $rootel);
        var $navigation_threedots = $("#navigation_threedots", $rootel);

        // Settings view
        var $settingsView = $("#navigation_settings", $rootel);
        var $settingsIcon = $("#navigation_settings_icon", $rootel);
        var $settingsLink = $("#settings_settings_link", $rootel);
        var $settingsMenu = $("#widget_settings_menu", $rootel);
        var $settingsForm = $("#navigation_settings_form", $rootel);
        var $settingsCancel = $("#navigation_settings_cancel", $rootel);

        // Errors
        var $navigationNoPages = $("#navigation_no_pages", $rootel);
        var $navigationNotAllowed = $("#navigation_not_allowed", $rootel);
        var $navigationError = $("#navigation_error", $rootel);

        // trimpath Templates
        var $navigationSettingsTemplate = $("#navigation_settings_template", $rootel);


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
        * Get the level of a page id
        * e.g. when the level of the page is main/test/hey, it will return 3
        * @param {String} pageId The id of the page
        * @return {Integer} The level of the page (0,1,...)
        */
        var getLevel = function(pageId) {
            return pageId.split(/\//g).length - 1;
        };


        ///////////////////////
        // Render navigation //
        ///////////////////////

        var sortByURL = function(a,b){
            if (a.path > b.path){
                return 1;
            } else if (a.path < b.path){
                return -1;
            } else {
                return 0;
            }
        };

        // Create arrays of full URL elements
        var fullURLs = function(site_object) {

            var full_urls = [];

            for (var current_url_title in site_object) {

                if (site_object[current_url_title]["jcr:path"]) {

                    var raw_path_elements = site_object[current_url_title]["jcr:path"].split("/");
                    var path_elements = [];
                    var raw_path_element = "";

                    for (var j=1; j<sakai_global.sitespages.config.startlevel; j++) {
                        raw_path_element += "/" + raw_path_elements[j];
                    }

                    // Consider only elements below the start level, and discard "_pages" or empty entries
                    for (var i=sakai_global.sitespages.config.startlevel , current_level = raw_path_elements.length; i<current_level; i++) {
                        raw_path_element += "/" + raw_path_elements[i];
                        if ((raw_path_elements[i] !== "_pages") && (raw_path_elements[i] !== "")) {
                            path_elements.push(raw_path_element);
                        }
                    }

                    full_urls.push(path_elements);
                }
            }
            return full_urls.sort();
        };

        // Get a page object by it's jcr path
        var getPageInfoByLastURLElement = function(i_jcr_path) {
            var return_object = {},
                jcr_path;
            for (var i in sakai_global.sitespages.site_info._pages) {
                if (sakai_global.sitespages.site_info._pages.hasOwnProperty(i)) {
                    if (sakai_global.sitespages.site_info._pages[i]["jcr:path"]) {
                        jcr_path = sakai_global.sitespages.site_info._pages[i]["jcr:path"];
                    } else {
                        continue;
                    }
                    if (jcr_path === i_jcr_path) {
                        return_object = sakai_global.sitespages.site_info._pages[i];
                    }
                }
            }
            return return_object;
        };

        // Converts array of URL elements to a hierarchical structure
        var convertToHierarchy = function(url_array) {
            var item, path;

            // Discard duplicates and set up parent/child relationships
            var children = {};
            var hasParent = {};
            for (var i = 0, j = url_array.length; i<j; i++) {
                path = url_array[i];
                var parent = null;
                for (var k = 0, l = path.length; k<l; k++)
                {
                    item = path[k];
                    if (!children[item]) {
                        children[item] = {};
                    }
                    if (parent) {
                        children[parent][item] = true; /* dummy value */
                        hasParent[item] = true;
                    }
                    parent = item;
                }
            }

            // Now build the hierarchy
            var result = [];
            for (item in children) {
                if (!hasParent[item]) {
                    result.push(buildNodeRecursive(item, children));
                }
            }
            return result;
        };

        // Recursive helper to create URL hierarchy
        var buildNodeRecursive = function(url_fragment, children) {

            var page_info = getPageInfoByLastURLElement(url_fragment);

            // Navigation node data
            var p_title = "";
            var p_title_short = "";
            var p_id = "";
            var p_pagePosition;
            if (page_info["pageTitle"]) {
                p_title = sakai.api.Security.saneHTML(page_info["pageTitle"]);
                p_id = "nav_" + page_info["pageURLName"];
                p_pagePosition = parseInt(page_info.pagePosition, 10);
                p_title_short = p_title;
                if (p_title_short.length > 25){
                    p_title_short = p_title_short.substr(0, 24) + $navigation_threedots.text();
                }
            }

            var node = {
                attr: { id: p_id },
                data: {
                    title: p_title_short,
                    attr: {"href": "#", "title": p_title},
                    pagePosition: p_pagePosition
                },
                children:[]
            };
            for (var child in children[url_fragment]) {
                if (children[url_fragment].hasOwnProperty(child)) {
                    node.children.push(buildNodeRecursive(child, children));
                }
            }
            return node;
        };


        /**
        * This function will sort the pages based on pagePosition
        * @param {Object} site_objects, the page array
        */
        var sortOnPagePosition = function(site_objects){

            // Bublesort to srt the pages
            for (var x = 0,l = site_objects.length ; x < l; x++) {
                for (y = 0; y < (l - 1); y++) {
                    if (parseFloat(site_objects[y].data.pagePosition,10) > parseFloat(site_objects[y + 1].data.pagePosition ,10)) {
                        holder = site_objects[y + 1];
                        site_objects[y + 1] = site_objects[y];
                        site_objects[y] = holder;
                    }
                }
            }
            return site_objects;
        };

        var updatePagePosition = function (pagesArray){
            ajaxArray = [];
            $(pagesArray).each(function(){
                var ajaxObject = {
                    "url": this['jcr:path'],
                    "method": "POST",
                    "parameters": {
                        'pagePosition':this.pagePosition
                    }
                };
                ajaxArray.push(ajaxObject);
            });
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type : "POST",
                cache: false,
                data: {
                    requests: $.toJSON(ajaxArray),
                    ":replace": true,
                    ":replaceProperties": true
                },
                success: function(data){}
            });
        };

        ////////////////////
        // EVENT HANDLING //
        ////////////////////

        // Show the Create Page widget overlay when the user clicks 'Create page'
        $createPageLink.click(function () {
            sakai_global.createpage.initialise();
        });

        // Show the Delete confirmation window when the user clicks 'Delete page'
        var deletePage = function () {
            if (!sakai_global.sitespages.selectedpage ||
                !sakai_global.sitespages.site_info.hasOwnProperty("_pages") ||
                !sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]) {
                alert("no page is selected");
                return false;
            }
            var pageTitle = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].pageTitle;
            if(pageTitle) {
                $deleteConfirmPageTitle.html("&quot;" + pageTitle + "&quot;");
            } else {
                $deleteConfirmPageTitle.html($navigation_delete_confirm_title.html());
            }
            if (sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage].deletable === false) {
                $nodeleteDialog.jqmShow();
            } else {
                $deleteDialog.jqmShow();
            }
        };
        $deletePageLink.click(deletePage);


        //////////////////////////
        // MANAGING SETTINGS    //
        //////////////////////////

        /**
         * Switches from the Settings view to the Main view
         */
        var showMainView = function () {
            $settingsView.hide();
            $navigationTree.show();
            $mainView.show();
            $navigation_footer_edit.show();
            $navigation_footer_noedit.hide();
        };


        /**
         * Switches from the Main view to the Settings view
         */
        var showSettingsView = function () {
            // set up the template with data from current group's context
            var json = {
                groupname: sakai_global.currentgroup.data.authprofile["sakai:group-title"],
                visible: sakai_global.currentgroup.data.authprofile["sakai:pages-visible"],
                sakai: sakai
            };
            $settingsView.html(sakai.api.Util.TemplateRenderer($navigationSettingsTemplate, json));
            $mainView.hide();
            $settingsMenu.hide();
            $settingsIcon.hide();
            $navigation_footer_edit.hide();
            $navigation_footer_noedit.show();
            $settingsView.show();
        };

        /*** Settings-related Events ***/

        // Show the settings menu icon when the user hovers over the widget
        $navigationWidget.hover(
            function () {
                $settingsIcon.show();
            },
            function () {
                // only hide icon if menu is also hidden
                if($settingsMenu.is(":hidden")) {
                    $settingsIcon.hide();
                }
            }
        );
        // don't want to stop propogation, just in case something else needs the click event
        // so instead we'll use this justShown variable to locally control propogation
        var justShown = false;

        // Toggle the settings menu when the user clicks on the settings menu icon
        $settingsIcon.click(function () {
            if($settingsMenu.is(":visible")) {
                $settingsMenu.hide();
            } else {
                var x = $("#navigation_settings_icon").position().left;
                var y = $("#navigation_settings_icon").position().top;
                $settingsMenu.css(
                    {
                      "top": y + 12 + "px",
                      "left": x + 4 + "px"
                    }
                ).show();
                justShown = true;
            }

        });

        $(document).bind("click", function(e) {
            if (!justShown) {
                var $clicked = $(e.target);
                // Check if one of the parents is the element container
                if(!$clicked.is($settingsMenu.selector) && $settingsMenu.is(":visible")){
                    $settingsMenu.hide();
                }
            } else {
                justShown = false;
            }
        });

        // Toggle settings view when the user clicks 'Settings' in settings menu
        $settingsLink.click(function () {
            showSettingsView();
        });

        // Update group settings when the settings form is submit
        $settingsForm.live("submit", function () {
            // manual selector necessary since this is a templated field
            var selectedValue = $("#navigation_pages_visibility").val();

            // only update if value has changed
            if(selectedValue !== sakai_global.currentgroup.data.authprofile["sakai:pages-visible"]) {
                sakai_global.currentgroup.data.authprofile["sakai:pages-visible"] = selectedValue;
                // update group on the server
                $.ajax({
                    url: "/system/userManager/group/" + sakai_global.currentgroup.id + ".update.html",
                    data: {
                        "sakai:pages-visible": selectedValue
                    },
                    type: "POST",
                    error: function(xhr, textStatus, thrownError) {
                        debug.error("ERROR-navigation.js settings update: " + xhr.status + " " + xhr.statusText);
                    }
                });
            }

            // settings are up to date, back to main view
            showMainView();

            // prevent any further form processing
            return false;
        });

        // Back to main view if cancel button clicked in settings view
        $settingsCancel.live("click", function () {
            showMainView();
        });


        /**
         * Removes all UI elements and functionality related to editing within the
         * navigation widget (create, delete, settings).
         */
        var disableEditing = function () {
            $navigation_footer_edit.remove();
            $navigation_footer_noedit.show();
            $settingsIcon.remove();
            $settingsMenu.remove();
            $navigationWidget.unbind();
        };


        /**
         * Handles enabling or hiding the delete page action
         *
         * @param pagecount  the number of pages currently displayed
         */
        var handleDeleteLink = function (pagecount) {
            if (pagecount === 0) {
                // disable delete link
                $deletePageLink.css({
                    cursor: "default",
                    color: "#999"
                }).hover(function () {
                    $(this).css("text-decoration", "none");
                }).unbind("click");
            } else {
                // enable delete link
                $deletePageLink.css({
                    cursor: "pointer",
                    color: "#666"
                }).hover(function () {
                    $(this).css("text-decoration", "underline");
                }, function () {
                    $(this).css("text-decoration", "none");
                }).click(deletePage);
            }
        };


        /**
         * Renders no pages in the navigation widget along with a message explaining
         * why no pages are viewable.
         *
         * @param {Boolean} error true if pages are not visible due to an error in
         * loading pages, false if pages are not visible because the current user
         * has insufficient privileges
         * @return None
         */
        var renderNoPages = function (error) {
            if(error) {
                $navigationError.show();
            } else {
                $navigationNotAllowed.show();
                // show the message with the lowest level of security
                switch(sakai_global.currentgroup.data.authprofile["sakai:pages-visible"]) {
                    case sakai.config.Permissions.Groups.visible.allusers:
                        $("#navigation_no_pages_unless_loggedin", $rootel).show();
                        break;
                    case sakai.config.Permissions.Groups.visible.members:
                        $("#navigation_no_pages_unless_member", $rootel).show();
                        break;
                    default:
                        $("#navigation_no_pages_unless_manager", $rootel).show();
                        break;
                }
            }
            disableEditing();
            $navigationNoPages.show();
            $mainView.show();
        };


        /**
         * Initiates rendering pages in read-only view in the navigation widget
         *
         * @param {String} selectedPageUrlName id of the page to select upon initial
         *   load of the navigation tree. If null, a default page is selected.
         * @param {Object} site_info_object Contains an array with all the pages, each page is an object.
         * @return None
         */
        var renderReadOnlyPages = function (selectedPageUrlName, site_info_object) {
            // disable editing and render tree without drag-n-drop
            disableEditing();
            renderPages(selectedPageUrlName, site_info_object, false);
            $navigationTree.show();
            $mainView.show();
        };


        /**
         * Initiates rendering pages that are both viewable and editable in the navigation widget
         *
         * @param {String} selectedPageUrlName id of the page to select upon initial
         *   load of the navigation tree. If null, a default page is selected.
         * @param {Object} site_info_object Contains an array with all the pages, each page is an object.
         * @return None
         */
        var renderReadWritePages = function (selectedPageUrlName, site_info_object) {
            // render tree with drag-n-drop
            renderPages(selectedPageUrlName, site_info_object, true);
            $navigation_footer_edit.show();
            $navigation_footer_noedit.hide();
            // Hide or show the settings
            if (showSettings) {
                showSettingsView();
            } else {
                showMainView();
            }
        };


        /**
         * Renders the pages navigation tree that is the core of the navigation widget
         *
         * @param {String} selectedPageUrlName id of the page to select upon initial
         *   load of the navigation tree. If null, a default page is selected.
         * @param {Object} site_info_object Contains an array with all the pages, each page is an object.
         * @param {Boolean} allowDnd true if drag-and-drop editing should be enabled,
         *   false if it should be disabled.
         * @return None
         */
        var renderPages = function (selectedPageUrlName, site_info_object, allowDnd) {
            var pagecount = sakai_global.sitespages.site_info.number_of_pages();
            // set the number of pages
            $pageCount.html("(" + pagecount + ")");
            handleDeleteLink(pagecount);

            var navigationData = [];
            var initiallySelect = "";

            if (pagecount) {
                // Create navigation data object
                navigationData = convertToHierarchy(fullURLs(site_info_object));
                sortOnPagePosition(navigationData);

                // determine which page to initially select
                initiallySelect = navigationData[0].attr.id;
                if(selectedPageUrlName) {
                    initiallySelect = "nav_" + selectedPageUrlName;
                }

                for(var i in navigationData){
                    if (navigationData.hasOwnProperty(i)) {
                        navigationData[i].data.attr.href = "#page=" + navigationData[i].attr.id.split("nav_")[1];
                    }
                }
            }

            // destroy any existing jstree instance
            $navigationTree.jstree("destroy");

            // set up new jstree navigation tree
            var pluginArray = allowDnd ?
                [ "themes", "json_data", "ui", "cookies", "dnd" ] :
                [ "themes", "json_data", "ui", "cookies" ];
            $navigationTree.jstree({
                "core": {
                    "animation": 0,
                    "html_titles": true
                },
                "cookies": {
                    "save_selected": false
                },
                "json_data": {
                    "data": navigationData
                },
                "themes": {
                    "dots": false,
                    "icons": true
                },
                "ui": {
                    "select_limit": 1,
                    "initially_select": [initiallySelect.toString()]
                },
                "plugins" : pluginArray
            });

            // set up new jstree event bindings
            addJstreeBindings();
        };


        /**
         * Add event bindings for the jstree pages navigation tree
         */
        var addJstreeBindings = function () {
            /**
             * When a page is selected in the navigation tree, show it
             */
            $navigationTree.bind("select_node.jstree", function(e, data) {
                var selectedPageUrl = $(data.rslt.obj[0]).children("a").attr("href").split("#page=")[1];
                // If page is not the current page load it
                if (sakai_global.sitespages.selectedpage !== selectedPageUrl) {
                    History.addBEvent(selectedPageUrl);
                }
            });


            /**
             * When a page is moved, update its position
             */
            $navigationTree.bind("move_node.jstree", function (e, data) {
                var $moved_node = $(data.rslt.o[0]);      // the moved node
                var $reference_node = $(data.rslt.r[0]);  // the node moved next to
                var position = data.rslt.p;               // either: "before", "after", "inside"

                // the $moved_node has been moved <position = before | after | inside> the $reference_node

                // Source data - the element being moved
                var src_url_name = $moved_node.attr("id").replace("nav_","");
                var src_url = sakai_global.sitespages.site_info._pages[src_url_name]["jcr:path"];
                var src_url_title = sakai_global.sitespages.site_info._pages[src_url_name]["pageURLTitle"];
                var src_url_depth = sakai_global.sitespages.site_info._pages[src_url_name]["pageDepth"];

                // Reference data - the element being moved next to
                var ref_url_name = $reference_node.attr("id").replace("nav_","");
                var ref_url = sakai_global.sitespages.site_info._pages[ref_url_name]["jcr:path"];
                var ref_url_title = sakai_global.sitespages.site_info._pages[ref_url_name]["pageURLTitle"];
                var ref_url_depth = sakai_global.sitespages.site_info._pages[ref_url_name]["pageDepth"];

                // Construct target URL
                var ref_url_elements = ref_url.split("/");

                // If we are moving a page inside a page add a "_pages" element to the url
                if (position === "inside")  {
                    ref_url_elements.push("_pages");
                } else {
                    ref_url_elements.pop();
                }

                // Construct target URL
                var tgt_url = ref_url_elements.join("/") + "/" + src_url_title;

                var changeNextNodes = false;

                // If there is a depth difference or putting a node inside another the move is a move within a hierarchy
                if ((src_url_depth !== ref_url_depth) || (position === "inside")) {
                    // Move page
                    sakai_global.sitespages.movePage(src_url, tgt_url, function(newName){
                        // update reference to the page in the nav
                        var newID = "nav_" + newName;
                        $moved_node.attr("id", newID);
                        $navigationTree.jstree("open_node", $reference_node);
                        $navigationTree.jstree("select_node", $moved_node);
                    });

                } else if((position ==='before') ||(position ==='after')){
                    var currentNodePage = parseFloat(sakai_global.sitespages.site_info._pages[src_url_name].pagePosition, 10);
                    var referenceNodePage = parseFloat(sakai_global.sitespages.site_info._pages[ref_url_name].pagePosition, 10);

                    var toUpdatePages = [],
                        nodePage;

                    //check if the node has been dropped infront of the reference node or behind
                    if((position ==='before')){
                        //Check if the user dragged the node to another node which is higher in the list or not
                        if (currentNodePage < referenceNodePage) {
                            // Loop over all the nodes
                            for (var c in sakai_global.sitespages.site_info._pages) {
                                if (sakai_global.sitespages.site_info._pages.hasOwnProperty(c)) {
                                    nodePage = parseFloat(sakai_global.sitespages.site_info._pages[c].pagePosition, 10);
                                    // make sure that the dropped node isn't in this list, because it has to be updated speratly
                                    if (sakai_global.sitespages.site_info._pages[c].pageTitle !== sakai_global.sitespages.site_info._pages[src_url_name].pageTitle) {
                                        // Check if the node in the list is smaller than the current node (dragged node) and the smaller than the reference node. Because these will have to get a lower position value
                                        // These are in fact the nodes that are in front of the reference node
                                        if ((nodePage > currentNodePage) && (nodePage < referenceNodePage)) {
                                            sakai_global.sitespages.site_info._pages[c].pagePosition = nodePage - 200000;
                                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[c]);
                                        }
                                        // IF this is not the case this means that the node will be after the reference node and it just has to be parsed
                                        else {
                                            sakai_global.sitespages.site_info._pages[c].pagePosition = nodePage;
                                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[c]);
                                        }
                                    }
                                }
                            }
                            // The node will get the value of the reference node - 2000000, because the node is dragged from underneath the reference node which means that all the nodes
                            // underneath the referance node will have received a lower value because 1 is gone.
                            sakai_global.sitespages.site_info._pages[src_url_name].pagePosition = referenceNodePage - 200000;
                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[src_url_name]);
                            updatePagePosition(toUpdatePages);
                        } else {
                            // This happends when a user drags a node from the top, this means that nothing will change to the nodes that are under the reference node,only the nodes above the reference node will have to be updated
                            sakai_global.sitespages.site_info._pages[src_url_name].pagePosition = referenceNodePage;
                            //updateSite(sakai_global.sitespages.site_info._pages[src_url_name]);
                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[src_url_name]);
                            for (var k in sakai_global.sitespages.site_info._pages) {
                                if (sakai_global.sitespages.site_info._pages.hasOwnProperty(k)) {
                                    nodePage = parseFloat(sakai_global.sitespages.site_info._pages[k].pagePosition,10);
                                    if(nodePage >= parseFloat(sakai_global.sitespages.site_info._pages[src_url_name].pagePosition,10)&&(sakai_global.sitespages.site_info._pages[k].pageTitle !==sakai_global.sitespages.site_info._pages[src_url_name].pageTitle )){
                                        sakai_global.sitespages.site_info._pages[k].pagePosition = nodePage + 200000;
                                        toUpdatePages.push(sakai_global.sitespages.site_info._pages[k]);
                                    }
                                }
                            }
                            updatePagePosition(toUpdatePages);
                        }
                    } else {
                        // This is almost exactly the same as the "before" part, there are small diffrences because the reference node is in front of the node when it is dropped
                        // This means that the nodes before the reference node will have an extra node and the nodes after the reference node will have one less
                        if (currentNodePage < referenceNodePage) {
                            for (var z in sakai_global.sitespages.site_info._pages) {
                                if (sakai_global.sitespages.site_info._pages.hasOwnProperty(z)) {
                                    nodePage = parseFloat(sakai_global.sitespages.site_info._pages[z].pagePosition, 10);
                                    if (sakai_global.sitespages.site_info._pages[z].pageTitle !== sakai_global.sitespages.site_info._pages[src_url_name].pageTitle) {
                                        if ((nodePage > currentNodePage) && (nodePage <= referenceNodePage)) {
                                            sakai_global.sitespages.site_info._pages[z].pagePosition = nodePage - 200000;
                                            //updateSite(sakai_global.sitespages.site_info._pages[c]);
                                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[z]);
                                        }
                                        else {
                                            sakai_global.sitespages.site_info._pages[z].pagePosition = nodePage;
                                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[z]);
                                        }
                                    }
                                }
                            }
                            sakai_global.sitespages.site_info._pages[src_url_name].pagePosition = referenceNodePage + 200000;
                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[src_url_name]);
                            updatePagePosition(toUpdatePages);
                        }
                        else {
                            // This is the part where the user drags a node from the top of the list, which again means that only the nodes after the reference node will have to be updated
                            sakai_global.sitespages.site_info._pages[src_url_name].pagePosition = referenceNodePage + 200000;
                            //updateSite(sakai_global.sitespages.site_info._pages[src_url_name]);
                            toUpdatePages.push(sakai_global.sitespages.site_info._pages[src_url_name]);
                            for (var t in sakai_global.sitespages.site_info._pages) {
                                if(parseFloat(sakai_global.sitespages.site_info._pages[t].pagePosition,10) >= parseFloat(sakai_global.sitespages.site_info._pages[src_url_name].pagePosition,10)&&(sakai_global.sitespages.site_info._pages[t].pageTitle !==sakai_global.sitespages.site_info._pages[src_url_name].pageTitle )){
                                    sakai_global.sitespages.site_info._pages[t].pagePosition = parseFloat(sakai_global.sitespages.site_info._pages[t].pagePosition,10) + 200000;
                                    //updateSite(sakai_global.sitespages.site_info._pages[c]);
                                    toUpdatePages.push(sakai_global.sitespages.site_info._pages[t]);
                                }
                            }
                            updatePagePosition(toUpdatePages);
                        }
                    }
                }
                $navigationTree.jstree("deselect_all");
                $navigationTree.jstree("select_node", $moved_node);
            });
        };


        /**
         * Function used to get the number of pages within the navigation
         * tree. The updated pagecount is stored in the
         * sakai_global.sitespages.navigation.pagecount global variable and
         * returned by this function.
         */
        var get_pagecount = function () {

            /**
             * Function used to recursively count the number of pages in the tree
             *
             * @param tree  JSON object representing the tree
             * @param start_index  the top-level page index of the tree to start at
             */
            var count_pages = function (tree, start_index) {
                if (start_index < tree.length) {
                    var page = tree[start_index];
                    sakai_global.sitespages.navigation.pagecount++;
                    if (page.hasOwnProperty("children")) {
                        count_pages(page["children"], 0);
                    }
                    if (start_index + 1 < tree.length) {
                        count_pages(tree, start_index + 1);
                    }
                }
            };

            sakai_global.sitespages.navigation.pagecount = 0;
            count_pages($navigationTree.jstree("get_json", -1), 0);
            return sakai_global.sitespages.navigation.pagecount;
        };


        /**
         * Function used to update the number of pages within the navigation
         * tree.
         */
        var update_pagecount = function () {
            var pagecount = get_pagecount();
            $pageCount.html("(" + pagecount + ")");
            handleDeleteLink(pagecount);
        };


        /**
         * Function that is available to other functions and called by site.js
         * It fires the event to render the navigation
         * @param {String} selectedPageUrlName id of the page to select upon initial
         *   load of the navigation tree. If null, a default page is selected.
         * @param {Object} site_info_object Contains an array with all the pages, each page is an object.
         */
        sakai_global.sitespages.navigation.renderNavigation = function(selectedPageUrlName, site_info_object) {
            // check arguments
            if(!site_info_object || site_info_object.length === 0) {
                renderNoPages(true);
                return;
            }

            // determine what the current user is allowed to see
            // only managers are allowed to edit pages
            var pagesVisibility;
            if ($.isEmptyObject(sakai_global.currentgroup.data)) {
                pagesVisibility = sakai.config.Permissions.Groups.visible["public"];
                $settingsIcon.remove();
                $settingsMenu.remove();
            } else {
                pagesVisibility = sakai_global.currentgroup.data.authprofile["sakai:pages-visible"];
            }

            if (sakai_global.show.canEdit() === true) {
                // current user is a manager
                renderReadWritePages(selectedPageUrlName, site_info_object);
            } else if(pagesVisibility === sakai.config.Permissions.Groups.visible["public"] ||
                (pagesVisibility === sakai.config.Permissions.Groups.visible.allusers && !sakai.data.me.user.anon) ||
                (pagesVisibility === sakai.config.Permissions.Groups.visible.members && sakai.api.Groups.isCurrentUserAMember(sakai_global.currentgroup.id, sakai.data.me))) {
                // we have a non-manager that can only view pages, not edit
                renderReadOnlyPages(selectedPageUrlName, site_info_object);
            } else {
                // we have a non-manager that is not allowed to view pages
                renderNoPages(false);
            }
        };

        sakai_global.sitespages.navigation.addNode = function(nodeID, nodeTitle, nodePosition) {
            if (nodeID && nodeTitle && nodePosition) {
                var newNode = {
                    "children": [],
                    "data": {
                        "attr": {
                            "href": "#page=" + nodeID
                        },
                        "pagePosition": nodePosition,
                        "title": nodeTitle
                    },
                    "attr": {
                        "id": "nav_" + nodeID
                    }
                };
                var $refNode = $navigationTree;
                if (sakai_global.sitespages.site_info.number_of_pages()) {
                    $refNode = $navigationTree.find("ul.jstree-no-dots > li").last();
                }
                $navigationTree.jstree("create_node", $refNode, "after", newNode, function (e) {
                    $refNode = $navigationTree.find("ul.jstree-no-dots > li").last();
                    $navigationTree.jstree("deselect_node", $navigationTree.jstree("get_selected"));
                    $navigationTree.jstree("select_node", $refNode);
                });
                update_pagecount();
            }
        };

        sakai_global.sitespages.navigation.deleteNode = function(nodeID) {
            if (nodeID) {
                var $nodeToDelete = $navigationTree.find("#nav_" + nodeID);
                var $nodeBelow = $nodeToDelete.next();
                $navigationTree.jstree("delete_node", $nodeToDelete);
                if (!$navigationTree.jstree("get_selected").length &&
                    $nodeBelow.length) {
                    $navigationTree.jstree("select_node", $nodeBelow);
                }
                update_pagecount();
            }
        };

        sakai_global.sitespages.navigation.renameNode = function(nodeID, newLabel) {
            if (nodeID && newLabel) {
                var $nodeToRename = $navigationTree.find("#nav_" + nodeID);
                $navigationTree.jstree("rename_node", $nodeToRename, newLabel);
            }
        };

        sakai_global.sitespages.navigation.selectNode = function(nodeID) {
            if (nodeID) {
                var $nodeToSelect = $navigationTree.find("#nav_" + nodeID);
                $navigationTree.jstree("select_node", $nodeToSelect);
            }
        };

        sakai_global.sitespages.navigation.deselectCurrentNode = function() {
            $navigationTree.jstree("deselect_node", $navigationTree.jstree("get_selected"));
        };


        ///////////////////////
        // Initial functions //
        ///////////////////////

        // Render navigation when navigation widget is loaded
        if (sakai_global.sitespages.isReady) {
            sakai_global.sitespages.navigation.renderNavigation(sakai_global.sitespages.selectedpage, sakai_global.sitespages.site_info._pages);
        } else {
            $(window).bind("ready.sitespages.sakai", function() {
                sakai_global.sitespages.navigation.renderNavigation(sakai_global.sitespages.selectedpage, sakai_global.sitespages.site_info._pages);
            });
        }

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("navigation");
});
