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

/*global $, Config, fluid, window */

var sakai = sakai || {};

/**
 * @name sakai.addcontent
 *
 * @class addcontent
 *
 * @description
 * Initialize the add content widget - This widget adds content to a site
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.addcontent = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////


    ///////////////////
    // CSS selectors //
    ///////////////////

    var $rootel = $("#" + tuid);
    var $addcontent_button = $("#addcontent_button", $rootel);
    var $addcontent_button_cancel = $("#addcontent_button_cancel", $rootel);
    var $addcontent_container_buttons = $("#addcontent_container_buttons", $rootel);
    var $addcontent_container = $("#addcontent_container", $rootel);
    var $addcontent_container_content = $("#addcontent_container_content", $rootel);
    var $addcontent_container_content_box_container = $(".addcontent_container_content_box_container", $rootel);
    var $addcontent_container_content_box_selected = $(".addcontent_container_content_box_selected", $rootel);
    var $addcontent_container_content_template = $("#addcontent_container_content_template", $rootel);
    var $addcontent_container_show = $("#addcontent_container_show", $rootel);
    var $addcontent_container_show_box_download = $("#addcontent_container_show_box_download", $rootel);
    var $addcontent_container_show_box_profile = $("#addcontent_container_show_box_profile", $rootel);
    var $addcontent_container_show_template = $("#addcontent_container_show_template", $rootel);

    var addcontent_container_content_box_selected = "addcontent_container_content_box_selected";
    var addcontent_container_place_selected = "addcontent_container_place_selected";


    //////////////////////
    // General function //
    //////////////////////

    /**
     * Render the general template
     * @param {Object} data A JSON object that is used by the main template
     */
    var renderTemplate = function(data){

        // Execute the render function
        $.TemplateRenderer($addcontent_container_content_template, data, $addcontent_container_content);

        // Show the content container
        $addcontent_container_content.show();

        // Show the buttons
        $addcontent_container_buttons.show();

    };

    /**
     * Render the show template (in non settings mode)
     * @param {Object} data The JSON data you get back from the server
     */
    var renderTemplateShow = function(data){

        // Execute the render function
        $.TemplateRenderer($addcontent_container_show_template, data, $addcontent_container_show);

        // Show the show container
        $addcontent_container_show.show();

    };

    /**
     * The general add binding function
     */
    var addBinding = function(){

        // Reinitialize the jQuery object(s)
        $addcontent_container_content_box_container = $($addcontent_container_content_box_container.selector);

        // Bind the click event to the content box container
        $addcontent_container_content_box_container.bind("click", function(){

            // Reinitialize the jQuery object(s)
            $addcontent_container_content_box_selected = $($addcontent_container_content_box_selected.selector);

            // Remove the previous selection(s)
            $addcontent_container_content_box_selected.removeClass(addcontent_container_content_box_selected);

            // Add the selected class
            $(this).addClass(addcontent_container_content_box_selected);
        });

        // Bind the add content button
        $addcontent_button.bind("click", function(){

            // Reinitialize the jQuery object(s)
            $addcontent_container_content_box_selected = $($addcontent_container_content_box_selected.selector);

            var data ={
                path: $addcontent_container_content_box_selected.find("img").attr("src")
            };

            // Save the widget data
            sakai.api.Widgets.saveWidgetData(tuid, data, function(success){
                if(success){
                    sakai.api.Widgets.Container.informFinish(tuid, "addcontent");
                }else{
                    // TODO show a valid error message to the user
                }
            });

        });

        // Bind the cancel buttons
        $addcontent_button_cancel.bind("click", function(){
            sakai.api.Widgets.Container.informCancel(tuid, "addcontent");
        });

    };

    /**
     * Add binding to the show container
     * @param {Object} json JSON object containing useful data
     */
    var addBindingShow = function(json){

        // Reinitialise the jQuery selectors
        $addcontent_container_show_box_download = $($addcontent_container_show_box_download.selector);
        $addcontent_container_show_box_profile = $($addcontent_container_show_box_profile.selector);

        // Add binding to the download button
        $addcontent_container_show_box_download.bind("click", function(){

            // Open a new window to download the actual resource
            window.open(json.url);

        });

        // Add binding to the profile button
        $addcontent_container_show_box_profile.bind("click", function(){

            // Redirect the user to the profile page
            document.location = "/dev/content_profile.html#content_path=" + json.url.replace(sakai.config.SakaiDomain, "/");

        });

    };

    var filesLoaded = function(bool, data){
        // Render the template for a file
        renderTemplate(data);
        
        // Add binding
        addBinding();
        
        // Show the container
        $addcontent_container.show();
    }

    /**
     * Load the files from a specific location
     * @param {String} location The location where you want to load the files from
     */
    var loadFiles = function(location){
        if(location === "myfiles"){
            var data = {
                q: "*",
                sortOn: "jcr:created",
                sortOrder: "descending"
            }
            sakai.api.Server.loadJSON("/var/search/pool/me/manager.1.json", filesLoaded, data);
        }

    };

    /**
     * Load the information about a file
     */
    var loadFileInfo = function(){

        // Load the widget data
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            // Only do something on success
            // TODO show a valid error message if something goes wrong
            if(success && data.path){

                // Get the latest information about the file
                $.ajax({
                    url: data.path + ".2.json",
                    success: function(requestdata){

                        // Construct the JSON object
                        var json = {
                            data: requestdata,
                            url: data.path
                        };

                        // Set the correct name
                        var splitslash = data.path.split("/");
                        json.data.name = splitslash[splitslash.length -1];

                        // Render the show template
                        renderTemplateShow(json);

                        // Add binding to the show container
                        addBindingShow(json);

                    }

                });

            }

        });

    };


    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * The main initialisation function
     */
    var init = function(){

        // Check whether it is in settings mode or not
        if (showSettings) {

            loadFiles("myfiles");

        }
        else {

            loadFileInfo();

        }

    };

    // Execute the init function
    init();
};
sakai.api.Widgets.widgetLoader.informOnLoad("addcontent");