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
sakai._navigation = {};

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
    start_level = 2; // The URL depth where the displayed hierarchy should start (currently after "/sites")


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
    var buildNodeRecursive = function(url_title, children) {

        // Navigation node data
        var p_title = "";
        if (sakai.site.site_info._pages[url_title]) {
            p_title = sakai.site.site_info._pages[url_title]["pageTitle"];
        } else {
            p_title = sakai.site.currentsite.name;
        }
        var node = {
            id: url_title,
            title: p_title,
            children:[]
        };
        for (var child in children[url_title]) {
            node.children.push(buildNodeRecursive(child, children));
        }
        return node;
    }



    /**
     * Function that is available to other functions and called by site.js
     * It fires the event to render the navigation
     * @param {Boolean|String} selected_page_id
     *     false: if there is no page selected
     *     pageid: when you select a page
     * @param {Object[]} site_info_object Contains an array with all the pages, each page is an object.
     */

    sakai._navigation.renderNavigation = function(selectedPageUrlTitle, site_info_object) {

        sakai.site.navigation_data = [];

        // Create navigation data object
        var cleaned_array_of_urls = cleanURLs(site_info_object);
        var navigation_data_raw = convertToHierarchy(cleaned_array_of_urls);
        sakai.site.navigation_data = navigation_data_raw[0];

        // Render navigation
        $("#navigation").tree({
            data: {
                type: "json",
                opts: {
                    static: sakai.site.navigation_data
                }
            }
        });

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
