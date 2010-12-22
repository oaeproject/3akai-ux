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

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.navigation
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
sakai.browsedirectory = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // DOM jQuery objects
    var $rootel = $("#" + tuid);
    var $browsedirectoryWidget = $(".browsedirectory_widget", $rootel);

    // Main view
    var $mainView = $("#browsedirectory_main", $rootel);
    var $browsedirectoryTree = $("#browsedirectory_tree", $rootel);
    var $browsedirectory_threedots = $("#browsedirectory_threedots", $rootel);

    // Errors
    var $browsedirectoryNoPages = $("#browsedirectory_no_pages", $rootel);
    var $browsedirectoryError = $("#browsedirectory_error", $rootel);

    ///////////////////////
    // Render Directory  //
    ///////////////////////

    /**
     * Get a Directory object by it's id
     *
     * @param {String} id id of the directory to select upon initial
     *   load of the directory structure. If null, a default page is selected.
     */
    var getDirectoryObject = function(id) {
        var return_object = {};
        for (var directory in sakai.config.Directory) {
            if (sakai.config.Directory.hasOwnProperty(directory)) {
                if (directory === id) {
                    return_object = sakai.config.Directory[id];
                }
                for (child in sakai.config.Directory[directory].children) {
                    return_object = getDirectoryObject(child);
                }
            }
        }
        return return_object;
    };

    // Converts array of directory array into a hierarchical structure hierarchical node structure
    var convertToHierarchy = function(directory) {
        var item, path;

        var result = [];
        for (var item in directory) {
            var url = "/dev/directory2.html#"+item;
            result.push(buildNodeRecursive(item, directory, url));
        }
        return result;
    };

    // Recursive helper to create URL hierarchy
    var buildNodeRecursive = function(url_fragment, directory ,url) {
        var p_title = directory[url_fragment].title;
        var p_title_short = directory[url_fragment].title;
        var p_id = url_fragment;
        var p_pagePosition;

        var node = {
            attr: { id: p_id },
            data: {
                title: p_title_short,
                attr: {"href": "#"+url, "title": p_title},
                pagePosition: p_pagePosition
            },
            children:[]
        };
        
        for (child in directory[url_fragment].children) {
            node.children.push(buildNodeRecursive(child, directory[url_fragment].children, url+"/"+child));
            
        }
        return node;
    };

    //////////////////////////////
    // Initialization Functions //
    //////////////////////////////


    /**
     * Removes all UI elements and functionality related to editing within the
     * navigation widget (create, delete, settings).
     */
    var disableEditing = function () {
        $browsedirectoryWidget.unbind();
    };


    /**
     * Renders no directory in the browsedirectory widget. 
     */
    var renderNoPages = function () {
        $browsedirectoryError.show();
        disableEditing();
        $browsedirectoryNoPages.show();
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
    var renderDirectories = function () {
        // disable editing and render tree without drag-n-drop
        disableEditing();
        renderPages();
        $browsedirectoryTree.show();
        $mainView.show();
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
    var renderPages = function () {
        var initiallySelect = "firstyearcourses";
        
        // destroy any existing jstree instance
        $browsedirectoryTree.jstree("destroy");
        var browsedirectoryData = convertToHierarchy(sakai.config.Directory);

        // set up new jstree navigation tree
        var pluginArray = false ?
            [ "themes", "json_data", "ui", "cookies", "dnd" ] :
            [ "themes", "json_data", "ui", "cookies" ];
            
        $browsedirectoryTree.jstree({
            "core": {
                "animation": 0,
                "html_titles": true
            },
            "cookies": {
                "save_selected": false
            },
            "json_data": {
                "data": browsedirectoryData
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
        $browsedirectoryTree.bind("select_node.jstree", function(e, data) {
            var selectedPageUrl = $(data.rslt.obj[0]).attr("id").replace("nav_","");
            $(window).trigger("sakai-directory-selected", {"id":selectedPageUrl});
        });
    };


    /**
     * It fires the event to render the navigation
     * @param {String} selectedPageUrlName id of the page to select upon initial
     *   load of the navigation tree. If null, a default page is selected.
     * @param {Object} site_info_object Contains an array with all the pages, each page is an object.
     */
    renderNavigation = function(selectedPages) {
        // check arguments
        renderDirectories(selectedPages);
    };

    ///////////////////////
    // Initial functions //
    ///////////////////////
    var doInit = function(){
        //var temp = "http://localhost:8080/directory2.html#test/test1/test2";
        //window.location.pathname.split("#")[1].split("/");
        
        renderDirectories();
    };
    
    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("browsedirectory");
