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
 * @name sakai.browsedirectory
 *
 * @class browsedirectory
 *
 * @description
 * Initialize the browsedirectory widget
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
     * Converts directory array into a node structure
     * so that it can be rendered into the jstree.
     * 
     * @param {Object} directory list of directories
     * @return result the json object in the structure necessary to render in jstree
     */
    var convertToHierarchy = function(directory) {
        var item, path;

        var result = [];
        // loop through all the directory
        for (var item in directory) {
            // url for the first level nodes
            var url = "/dev/directory2.html#"+item;
            // call buildnoderecursive to get the node structure to render.
            result.push(buildNodeRecursive(item, directory, url));
        }
        return result;
    };

    /**
     * Recursive method that create the node structure
     * so that it can be rendered into the jstree.
     * 
     * @param {String} node_id  the unique id for each node for example firstyearcourses
     * @param {Object} directory directory list json object for example "collegeofengineering": { ... } 
     * @param {String} url the url of the page to render when directory node is clicked for example /dev/directory2.html#collegeofengineering
     *  
     * @return node the json object in the structure necessary to render in jstree
     */
    var buildNodeRecursive = function(node_id, directory ,url) {
        // node title
        var p_title = directory[node_id].title;
        // node id
        var p_id = node_id;
        // icon url
        var p_url = directory[node_id].icon;

        // create the node based on the parameters
        var node = {
            attr: { id: p_id ,"data-url":p_url },
            data: {
                title: p_title,
                attr: {"href": url, "title": p_title},
            },
            children:[]
        };

        // if current node has any children
        // call buildNoderecursive method create the node structure for
        // all level of child         
        for (child in directory[node_id].children) {
            // for each child node, call buildnoderecursive to build the node structure
            // pass current child(id), the list of all sibligs(json object) and url append/child
            // for example first level node /dev/directory2.html#courses/firstyearcourses
            // for second level node /dev/directory2.html#course/firstyearcourses/chemistry
            node.children.push(buildNodeRecursive(child, directory[node_id].children, url+"/"+child));
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
     * Initiates rendering directories in read-only view in the browsedirectory widget
     *
     * @param {String} id  the unique id for node to select on load for example firstyearcourses or empty
     */
    var renderDirectories = function (id) {
        // disable editing and render tree without drag-n-drop
        disableEditing();
        // create jstree instance for the directory
        renderDirectoryTree(id);
        // show directory tree
        $browsedirectoryTree.show();
        // show main view
        $mainView.show();
    };


    /**
     * Thie method create directory jstree.
     * It deletes existing jstree, create new jstree and bind event for the jstree nodes.
     * 
     * @param {String} id  the unique id for node to select on load for example firstyearcourses or empty
     */
    var renderDirectoryTree = function (id) {
        // get item 
        var initiallySelect = "firstyearcourses";
        // if id is passed set inital select as id
        if (id !== "") {
            initiallySelect = id;
        }
        // destroy any existing jstree instance
        $browsedirectoryTree.jstree("destroy");
        var browsedirectoryData = convertToHierarchy(sakai.config.Directory);

        // set up new jstree for directory 
        var pluginArray = [ "themes", "json_data", "ui", "cookies", "dnd" ];
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
            // get anchor tag href attribute that has been set in buildNodeRecursive method
            var link = $(data.rslt.obj[0]).children('a').attr("href");
            // redirect page to the link
            document.location.href = link;
            // get node at same level
            var sib = $("#"+selectedPageUrl).siblings();
            // check if node at same level is opened.
            // if it is open closed it.
            if ($browsedirectoryTree.jstree("is_open", sib)) {
                $browsedirectoryTree.jstree("close_node", sib);
            }
            var directorystructure = link.split("#")[1];
            // open the selected node
            $browsedirectoryTree.jstree("open_node");
            $(window).trigger("sakai-directory-selected", directorystructure);
        });
    };

    /**
     * Function that is available to other functions and called by directory2.js
     * It return the directorynode json object based on the id passed
     * 
     * @param {String} id  the unique id for each node for example firstyearcourses
     */
    sakai.browsedirectory.getDirectoryNodeJson = function(id) {
        // call get_json from jstree with parameter selector object and attribute for li
        // id, title and data-url is passed when creating the jstree in buildNodeRecursive.
        var directoryNodeJsonObject = $browsedirectoryTree.jstree("get_json", $("#"+id),["id","title","data-url"]);
        return directoryNodeJsonObject;        
    };

    ///////////////////////
    // Initial functions //
    ///////////////////////
    var doInit = function(){
        var url = document.location.toString();
        var id = (url.split("#").length < 2)?"":url.split("#")[1].split("/").reverse().shift();
        renderDirectories(id);
    };
    
    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("browsedirectory");
