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
 * @name sakai.s23courses
 *
 * @class s23courses
 *
 * @description
 * Initialize the s23courses widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.s23courses = function(tuid, showSettings){

    sakai.config.URL.SAKAI2_MCP_URL = "/var/proxy/s23/sites.json";


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // Paging
    var pageCurrent = 0;        // The page you are currently on
    var pageSize = 10;            // How many items you want to see on 1 page

    var globalfeed = false;

    var parseglobal = false;
    var parsenormal = [];

    // CSS selectors
    var s23coursesId = "#s23courses";
    var $s23coursesContainer = $(s23coursesId + "_container");
    var $s23coursesSubcontainer = $(s23coursesId + "_subcontainer");
    var jqPagerClass = ".jq_pager";

    // Templates
    var s23coursesContainerTemplate = "s23courses_container_template";


    ///////////////////////////
    // General functionality //
    ///////////////////////////

    /**
     * Parse the templates with JST
     */
    var parseTemplates = function(){

        // Make an array that contains only the elements that will appear on one page
        var pagingArray;

        if (parseglobal.all) {
            pagingArray = {
                all: parseglobal.all.sites.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
            };
        }
        else {
            pagingArray = {
                all: false
            };
        }

        // Render the template and pass through the parseglobal object
        $.TemplateRenderer(s23coursesContainerTemplate, pagingArray, $s23coursesSubcontainer);

        //
        if(parseglobal.all.length >= pageSize){
            // Render paging
            renderPaging();
        }
    };

    /**
     * Split the global feed into normal and favourited projects
     */
    var splitGlobalFeed = function(){

        // Set the parse global object
        parseglobal = {
            all: globalfeed
        };

        // Parse the template with the new modified feeds
        parseTemplates();

        // Show the container for the courses and projects
        $s23coursesContainer.show();
    };


    ////////////
    // Paging //
    ////////////

    /**
     * Will be called when the pager is being clicked.
     * This will initiate a new search query and rerender
     * the current files
     * @param {Object} clickedPage
     */
    var doPaging = function(clickedPage){
        pageCurrent = clickedPage - 1;
        parseTemplates();
    };

    /**
     * Render the paging of the courses and projects widget
     */
    var renderPaging = function(){
        // Render paging
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: Math.ceil(parseglobal.all.length / pageSize),
            buttonClickCallback: doPaging
        });
    };


    ////////////////////////
    // Init functionality //
    ////////////////////////

    /**
     * Get the courses and projects for the user that is logged in.
     * This function sends a request to the proxy server that will then send a request to camtools.
     * Since there is single signon functionality, the user is automatically logged into camtools.
     */
    var getCoursesAndProjects = function(){
        $.ajax({
            url: sakai.config.URL.SAKAI2_MCP_URL,
            dataType: "json",
            success: function(data){
                globalfeed = $.extend(data, {}, true);
            },
            error: function(xhr, textStatus, thrownError) {
                debug.error("s23courses: Could not receive the courses and projects from the server.");
            },
            complete: function(){
                splitGlobalFeed();
            },
            cache: false
        });
    };

    /**
     * Execute this function when the widget get launched
     */
    var doInit = function(){

        // Get the courses and projects for the current user
        getCoursesAndProjects();
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("s23courses");