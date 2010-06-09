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


sakai.navigation = function(tuid, showSettings){

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

    // Create arrays of full URL elements
    var fullURLs = function(site_object) {

        var full_urls = [];

        for (var current_url_title in site_object) {

            if (site_object[current_url_title]["jcr:path"]) {

                var raw_path_elements = site_object[current_url_title]["jcr:path"].split("/");
                var path_elements = [];
                var raw_path_element = "";

                for (var j=1; j<start_level; j++) {
                    raw_path_element += "/" + raw_path_elements[j];
                }

                // Consider only elements below the start level, and discard "_pages" or empty entries
                for (var i=start_level, current_level = raw_path_elements.length; i<current_level; i++) {
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
        var return_object = {};
        for (var i in sakai.site.site_info._pages) {
            if (sakai.site.site_info._pages[i]["jcr:path"]) {
                var jcr_path = sakai.site.site_info._pages[i]["jcr:path"];
            } else {
                continue;
            }
            if (jcr_path === i_jcr_path) {
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
        var p_pagePosition;
        if (page_info["pageTitle"]) {
            p_title = page_info["pageTitle"];
            p_id = "nav_" + page_info["pageURLName"];
            p_pagePosition = page_info.pagePosition;
        }

        var node = {
            attributes: { id: p_id },
            data: {title: p_title, attributes: { "href": "" },pagePosition:p_pagePosition},
            children:[]
        };
        for (var child in children[url_fragment]) {
            node.children.push(buildNodeRecursive(child, children));
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
                "data": {
                        'pagePosition':this.pagePosition
                }
            };
            ajaxArray.push(ajaxObject);
        });
        sakai.lib.batchPosts(ajaxArray);
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

        var full_array_of_urls = fullURLs(site_info_object);
        sakai.site.navigation.navigationData = [];
        sakai.site.navigation.navigationData = convertToHierarchy(full_array_of_urls);
        sortOnPagePosition(sakai.site.navigation.navigationData);

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
                    "static" : sakai.site.navigation.navigationData
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
                        History.addBEvent(current_page_urlsafetitle);
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
                    var src_url = sakai.site.site_info._pages[src_url_name]["jcr:path"];
                    var src_url_title = sakai.site.site_info._pages[src_url_name]["pageURLTitle"];
                    var src_url_depth = sakai.site.site_info._pages[src_url_name]["pageDepth"];

                    // Reference data (the previous or next element to the target)
                    var ref_url_name = ref_node.id.replace("nav_","");
                    var ref_url = sakai.site.site_info._pages[ref_url_name]["jcr:path"];
                    var ref_url_title = sakai.site.site_info._pages[ref_url_name]["pageURLTitle"];
                    var ref_url_depth = sakai.site.site_info._pages[ref_url_name]["pageDepth"];
                   // var ref_url_pagePosition = sakai.site.site_info._pages[ref_url_name].pagePosition;

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

                    var changeNextNodes = false;

                    // If there is a depth difference or putting a node inside another the move is a move within a hierarchy
                    if ((src_url_depth !== ref_url_depth) || (type === "inside")) {
                        // Move page
                        sakai.site.movePage(src_url, tgt_url, function(){
                            // Do nothing for now
                        });


                    } else if((type ==='before') ||(type ==='after')){
                                    var currentNodePage = parseFloat(sakai.site.site_info._pages[src_url_name].pagePosition, 10);
                                    var referenceNodePage = parseFloat(sakai.site.site_info._pages[ref_url_name].pagePosition, 10);

                                   var toUpdatePages = [];

                                    //check if the node has been dropped infront of the reference node or behind
                                    if((type ==='before')){
                                          //Check if the user dragged the node to another node which is higher in the list or not
                                          if (currentNodePage < referenceNodePage) {
                                            // Loop over all the nodes
                                            for (var c in sakai.site.site_info._pages) {
                                                var nodePage = parseFloat(sakai.site.site_info._pages[c].pagePosition, 10);
                                                // make sure that the dropped node isn't in this list, because it has to be updated speratly
                                                if (sakai.site.site_info._pages[c].pageTitle !== sakai.site.site_info._pages[src_url_name].pageTitle) {
                                                    // Check if the node in the list is smaller than the current node (dragged node) and the smaller than the reference node. Because these will have to get a lower position value
                                                    // These are in fact the nodes that are in front of the reference node
                                                    if ((nodePage > currentNodePage) && (nodePage < referenceNodePage)) {
                                                        sakai.site.site_info._pages[c].pagePosition = nodePage - 200000;
                                                        toUpdatePages.push(sakai.site.site_info._pages[c])
                                                    }
                                                    // IF this is not the case this means that the node will be after the reference node and it just has to be parsed
                                                    else {
                                                        sakai.site.site_info._pages[c].pagePosition = nodePage;
                                                        toUpdatePages.push(sakai.site.site_info._pages[c]);
                                                    }
                                                }
                                            }
                                            // The node will get the value of the reference node - 2000000, because the node is dragged from underneath the reference node which means that all the nodes 
                                            // underneath the referance node will have received a lower value because 1 is gone. 
                                            sakai.site.site_info._pages[src_url_name].pagePosition = referenceNodePage - 200000;
                                            toUpdatePages.push(sakai.site.site_info._pages[src_url_name]);
                                            updatePagePosition(toUpdatePages);
                                        }
                                        else {
                                            // This happends when a user drags a node from the top, this means that nothing will change to the nodes that are under the reference node,only the nodes above the reference node will have to be updated
                                            sakai.site.site_info._pages[src_url_name].pagePosition = referenceNodePage;
                                            //updateSite(sakai.site.site_info._pages[src_url_name]);
                                            toUpdatePages.push(sakai.site.site_info._pages[src_url_name]);
                                            for (var c in sakai.site.site_info._pages) {
                                                var nodePage = parseFloat(sakai.site.site_info._pages[c].pagePosition,10);
                                                if(nodePage >= parseFloat(sakai.site.site_info._pages[src_url_name].pagePosition,10)&&(sakai.site.site_info._pages[c].pageTitle !==sakai.site.site_info._pages[src_url_name].pageTitle )){
                                                    sakai.site.site_info._pages[c].pagePosition = nodePage + 200000;
                                                    toUpdatePages.push(sakai.site.site_info._pages[c])
                                                }
                                            }
                                                updatePagePosition(toUpdatePages);
                                        }
                                    }else{
                                        // This is almost exactly the same as the "before" part, there are small diffrences because the reference node is in front of the node when it is dropped
                                        // This means that the nodes before the reference node will have an extra node and the nodes after the reference node will have one less
                                        if (currentNodePage < referenceNodePage) {
                                            for (var c in sakai.site.site_info._pages) {
                                                var nodePage = parseFloat(sakai.site.site_info._pages[c].pagePosition, 10);
                                                if (sakai.site.site_info._pages[c].pageTitle !== sakai.site.site_info._pages[src_url_name].pageTitle) {
                                                    if ((nodePage > currentNodePage) && (nodePage <= referenceNodePage)) {
                                                        sakai.site.site_info._pages[c].pagePosition = nodePage - 200000;
                                                        //updateSite(sakai.site.site_info._pages[c]);
                                                        toUpdatePages.push(sakai.site.site_info._pages[c]);
                                                    }
                                                    else {
                                                        sakai.site.site_info._pages[c].pagePosition = nodePage;
                                                        toUpdatePages.push(sakai.site.site_info._pages[c]);
                                                    }
                                                }
                                            }
                                            sakai.site.site_info._pages[src_url_name].pagePosition = referenceNodePage + 200000;
                                            toUpdatePages.push(sakai.site.site_info._pages[src_url_name]);
                                            updatePagePosition(toUpdatePages);
                                        }
                                        else {
                                            // This is the part where the user drags a node from the top of the list, which again means that only the nodes after the reference node will have to be updated
                                            sakai.site.site_info._pages[src_url_name].pagePosition = referenceNodePage + 200000;
                                            //updateSite(sakai.site.site_info._pages[src_url_name]);
                                            toUpdatePages.push(sakai.site.site_info._pages[src_url_name]);
                                            for (var c in sakai.site.site_info._pages) {
                                                if(parseFloat(sakai.site.site_info._pages[c].pagePosition,10) >= parseFloat(sakai.site.site_info._pages[src_url_name].pagePosition,10)&&(sakai.site.site_info._pages[c].pageTitle !==sakai.site.site_info._pages[src_url_name].pageTitle )){
                                                    sakai.site.site_info._pages[c].pagePosition = parseFloat(sakai.site.site_info._pages[c].pagePosition,10) + 200000;
                                                    //updateSite(sakai.site.site_info._pages[c]);
                                                    toUpdatePages.push(sakai.site.site_info._pages[c]);
                                                }
                                            }
                                                updatePagePosition(toUpdatePages);
                                        }
                                    }
                    }
                },

                // Callback for renaming a page node
                onrename: function(node, ref_node, rollback) {

                }

            }

        });

        // Store a reference to the tree navigation object
        sakai.site.navigation.treeNav = $.tree.reference("#nav_content");
    };




    ///////////////////////
    // Initial functions //
    ///////////////////////

    $("#navigation_settings_submit",rootel).click(function(){
        sakai.api.Widgets.Container.informFinish(tuid);
    });
    $("#navigation_settings_cancel",rootel).click(function(){
        sakai.api.Widgets.Container.informCancel(tuid);
    });

    // Hide or show the settings
    if (showSettings){
        $(navigationOutput,rootel).hide();
        $(navigationSettings,rootel).show();
    } else {
        $(navigationSettings,rootel).hide();
        $(navigationOutput,rootel).show();
    }

    // Render navigation when navigation widget is loaded
    if (sakai.site.navigation) {
        sakai.site.navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
    }
};

sakai.api.Widgets.widgetLoader.informOnLoad("navigation");
