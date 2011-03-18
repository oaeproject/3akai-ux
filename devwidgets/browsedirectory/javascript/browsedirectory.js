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
 * /dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js (JsTree)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.browsedirectory
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
    sakai_global.browsedirectory = function(tuid, showSettings){

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
        var initiallySelect = "";


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
            // destroy any existing jstree instance
            $browsedirectoryTree.jstree("destroy");
            var browsedirectoryData = sakai.api.Util.getDirectoryStructure();

            // get item
            initiallySelect = browsedirectoryData[0].attr.id;
            // if id is passed set inital select as id
            if (id) {
                initiallySelect = id;
            }

            // set up new jstree for directory
            var pluginArray = [ "themes", "json_data", "ui", "cookies"];
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
                    "icons": false
                },
                "ui": {
                    "select_limit": 1,
                    "initially_select": [initiallySelect.toString()],
                    "preventDefault": false
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
                var directorystructure = link.split("#")[1];

                // get node at same level
                var sib = $("#"+selectedPageUrl).siblings();

                // check if node at same level is opened.
                // if it is open closed it.
                if ($browsedirectoryTree.jstree("is_open", sib)) {
                    $browsedirectoryTree.jstree("close_node", sib);
                }

                // if the node is root node
                if (directorystructure.split("/")[0] === selectedPageUrl) {
                    $browsedirectoryTree.jstree("open_node");

                } else {
                    $.each(directorystructure.split("/"), function(ind, directory){
                        $browsedirectoryTree.jstree("open_node", $("#"+directory));
                    });
                }
                if ($.bbq.getState("location") === "" || !$.bbq.getState("location")) {
                    $(window).trigger("hashchange", initiallySelect);
                    $(window).trigger("nohash.browsedirectory.sakai", initiallySelect);
                }
            });
        };

        var handleHashChange = function(e, node) {
            var nodeId = node || $.bbq.getState("location");
            if (nodeId) {
                nodeId = nodeId.split("/").reverse().shift();
                var $nodeToSelect = $browsedirectoryTree.find("#" + nodeId);
                if ($browsedirectoryTree.jstree("get_selected").attr("id") !== $nodeToSelect.attr("id")) {
                    $browsedirectoryTree.jstree("deselect_node", $browsedirectoryTree.jstree("get_selected"));
                    $browsedirectoryTree.jstree("select_node", $nodeToSelect);
                }
            } else {
                $(window).trigger("nohash.browsedirectory.sakai", initiallySelect);
            }
        };

        $(window).bind("hashchange nohash.browsedirectory.sakai", handleHashChange);

        /**
         * Function that is available to other functions and called by directory.js
         * It return the directorynode json object based on the id passed
         *
         * @param {String} id  the unique id for each node for example firstyearcourses
         */
        sakai_global.browsedirectory.getDirectoryNodeJson = function(id) {
            // call get_json from jstree with parameter selector object and attribute for li
            // id, title, data-url and data-description is passed when creating the jstree in buildNodeRecursive.
            var directoryNodeJsonObject = $browsedirectoryTree.jstree("get_json", $("#"+id),["id","title","data-url","data-description"]);
            return directoryNodeJsonObject;
        };

        ///////////////////////
        // Initial functions //
        ///////////////////////
        var doInit = function(){
            var id = $.bbq.getState("location");
            renderDirectories(id);
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("browsedirectory");
});
