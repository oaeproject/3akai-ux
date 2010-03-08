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

/*global $, sdata */

var sakai = sakai || {};
sakai.site = sakai.site || {};
sakai.site.navigation = sakai.site.navigation || {};


sakai.navigation = function(tuid, placement, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // - ID
    var navigation = "#navigation";
    var navigationName = "navigation";
    var navigationOutput = navigation + "_output";
    var navigationSettings = navigation + "_settings";

    // Template
    var navigationOutputTemplate = navigationName + "_output_template";

    // Hierachy
    start_level = 3; // The URL depth where the displayed hierarchy should start (currently after "/sites")


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

    // Create arrays of cleaned up URL elements
    var cleanURLs = function(site_object) {

        var cleaned_urls = [];

        for (var current_url_title in site_object) {

            if (site_object[current_url_title]["path"]) {

                var raw_path_elements = site_object[current_url_title]["path"].split("/");
                var path_elements = [];

                // Consider only elements below the start level, and discard "_pages" or empty entries
                for (var i=start_level, current_level = raw_path_elements.length; i<current_level; i++) {
                    if ((raw_path_elements[i] !== "_pages") && (raw_path_elements[i] !== "")) {
                        path_elements.push(raw_path_elements[i]);
                    }
                }

                cleaned_urls.push(path_elements);
            }
        }
        return cleaned_urls.sort();
    };

    // Get a page object by it's path's last element
    var getPageInfoByLastURLElement = function(i_url_element) {
        var return_object = {};
        for (var i in sakai.site.site_info._pages) {
            if (sakai.site.site_info._pages[i]["path"]) {
                var temp = sakai.site.site_info._pages[i]["path"].split("/");
                var last_url_element = temp[temp.length - 1];
            } else {
                continue;
            }
            if (last_url_element === i_url_element) {
                return_object = sakai.site.site_info._pages[i];
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
            var path = url_array[i];
            var parent = null;
            for (var k = 0, l = path.length; k<l; k++)
            {
                var item = path[k];
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
    }

    // Recursive helper to create URL hierarchy
    var buildNodeRecursive = function(url_fragment, children) {

        var page_info = getPageInfoByLastURLElement(url_fragment);

        // Navigation node data
        var p_title = "";
        var p_id = "";
        if (page_info["pageTitle"]) {
            p_title = page_info["pageTitle"];
            p_id = "nav_" + page_info["pageURLName"];
        }

        var node = {
            attributes: { id: p_id },
            data: {title: p_title, attributes: { "href": "" }},
            children:[]
        };
        for (var child in children[url_fragment]) {
            node.children.push(buildNodeRecursive(child, children));
        }
        return node;
    };



    /**
     * Function that is available to other functions and called by site.js
     * It fires the event to render the navigation
     * @param {Boolean|String} selected_page_id
     *     false: if there is no page selected
     *     pageid: when you select a page
     * @param {Object[]} site_info_object Contains an array with all the pages, each page is an object.
     */
    sakai.site.navigation.renderNavigation = function(selectedPageUrlName, site_info_object) {

        // Create navigation data object
        var cleaned_array_of_urls = cleanURLs(site_info_object);
        sakai.site.navigation.navigationData = [];
        sakai.site.navigation.navigationData = convertToHierarchy(cleaned_array_of_urls);

        var tree_type = {
            renameable: false,
            deletable: false,
            creatable: false,
            draggable: false,
            icon: {image: "/dev/_images/page_18.png", position: "0 -1px"}
        };

        // Enable dragging (moving) and renaming only for logged in collaborators
        if ((sakai._isAnonymous === false) && sakai.site.isCollaborator) {
            tree_type.renameable = true;
            tree_type.draggable = true;
        }

        // Main tree navigation object
        $("#nav_content").tree({
            data : {
                type : "json",
                opts : {
                    static : sakai.site.navigation.navigationData
                }
            },
            selected: "nav_"+selectedPageUrlName,
            opened: ["nav_"+selectedPageUrlName],
            ui: {
                dots: false,
                selected_parent_close: false
            },
            types: {
                "default": tree_type
            },
            callback: {

                // Callback for selecting a page node
                onselect: function(node, tree_object) {
                    var current_page_urlsafetitle = node.id.replace("nav_","");

                    // If page is not the current page load it
                    if (sakai.site.selectedpage !== current_page_urlsafetitle) {
                        sakai.site.openPageH(current_page_urlsafetitle);
                    }
                },

                beforemove: function(node, ref_node, type, tree_object) {
                    // Do nothing for now
                    return true;
                },

                // Callback for moving a page node
                onmove: function(node, ref_node, type, tree_object, rollback) {

                    // Source data
                    var src_url_name = node.id.replace("nav_","");
                    var src_url = sakai.site.site_info._pages[src_url_name]["path"];
                    var src_url_title = sakai.site.site_info._pages[src_url_name]["pageURLTitle"];
                    var src_url_depth = sakai.site.site_info._pages[src_url_name]["pageDepth"];

                    // Reference data (the previous or next element to the target)
                    var ref_url_name = ref_node.id.replace("nav_","");
                    var ref_url = sakai.site.site_info._pages[ref_url_name]["path"];
                    var ref_url_title = sakai.site.site_info._pages[ref_url_name]["pageURLTitle"];
                    var ref_url_depth = sakai.site.site_info._pages[ref_url_name]["pageDepth"];

                    // Construct target URL
                    var ref_url_elements = ref_url.split("/");

                    // If we are moving a page inside a page which does not have child pages yet add a "_pages" element to the url
                    // We check agains the number of child objects for now but probably a better solution will be needed
                    if ((type === "inside") && ($("#"+ref_node.id).children().length < 3)) {
                        ref_url_elements.push("_pages");
                    } else {
                        ref_url_elements.pop();
                    }

                    // Construct target URL
                    var tgt_url = ref_url_elements.join("/") + "/" + src_url_title;

                    // If there is a depth difference or putting a node inside another the move is a move within a hierarchy
                    if ((src_url_depth !== ref_url_depth) || (type === "inside")) {

                        // Move page
                        sakai.site.movePage(src_url, tgt_url, function(){
                            // Do nothing for now
                        });

                    } else {
                        // The move is a jsut a reordering

                    }


                },

                // Callback for renaming a page node
                onrename: function(node, ref_node, rollback) {

                }

            }

        });

        // Store a referecne to the tree navigation object
        sakai.site.navigation.treeNav = $.tree.reference("#nav_content");
    };




    ///////////////////////
    // Initial functions //
    ///////////////////////

    $("#navigation_settings_submit",rootel).click(function(){
        sdata.container.informFinish(tuid);
    });
    $("#navigation_settings_cancel",rootel).click(function(){
        sdata.container.informCancel(tuid);
    });

    // Hide or show the settings
    if (showSettings){
        $(navigationOutput,rootel).hide();
        $(navigationSettings,rootel).show();
    } else {
        $(navigationSettings,rootel).hide();
        $(navigationOutput,rootel).show();
    }

    sakai.site.onNavigationLoaded();
};

sdata.widgets.WidgetLoader.informOnLoad("navigation");
