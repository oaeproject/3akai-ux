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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.footer
 *
 * @class footer
 *
 * @description
 * Initialize the footer widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.footer = function(tuid,showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var doc_name;
    var $back_to_top_link = $(".footer_main .back-top");
    var $footer_debug_info = $("#footer_debug_info");
    var $footer_date_end = $("#footer_date_end");
    var $footer_root = $(".footer_main");
    var $footer_logo = $("#footer_logo");


    //////////////////////
    // Helper functions //
    //////////////////////

    /**
     * This helper function will return the name of the current document (e.g. my_sakai.html)
     * @return {String} The name of the current document
     */
    var getDocName = function() {
        var url = document.URL;
        var slash = "/";
        if (url.match(/\\/)) {
            slash = "\\";
        }
        return url.substring(url.lastIndexOf(slash) + 1);
    };

    /**
     * Check whether this is the index page or not
     * @return {Boolean} True when it is the index page
     */
    var checkIndexPage = function(){
        return document.URL.match(/index.html[?a-zA-Z0-9=]*/);
    };


    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Render the debug info
     * @param {Object} container jQuery selector where you want the debug info to appear in
     */
    var renderDebugInfo = function(container) {
        
        $.ajax({
            url: "/var/scm-version.json",
            type: "GET",
            dataType: "json",
            success: function(data){
                // Construct debug info | TODO: get current running kernel version from a service, maybe svn version of UX as well
                var debug_text = "DEBUG:";
                debug_text += " Nakamura Version: " + data["sakai:nakamura-version"];
                debug_text += " | UX Code Timestamp: " + data["jcr:created"];
                debug_text += "<br/>DOC mod date: " + document.lastModified;
                debug_text += " | PLACE: " + (doc_name || "index.html");

                // Put text into holding tag
                container.html(sakai.api.Security.saneHTML(debug_text));
            }
        });

    };

    /**
     * This event handler will make sure that the Top link
     * that's available in every page footer will scroll back
     * to the top of the page
     */
    $(".back-top").live("click", function(ev){
        window.scrollTo(0,0);
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Main initialization function for the footer widget
     */
    var doInit = function(){

        // Get the name of the current document
        doc_name = getDocName();

        // Display debug info if set in config
        if (sakai.config.displayDebugInfo === true) {

            // Render the debug info
            renderDebugInfo($footer_debug_info);

            // Add binding to the image
            $footer_logo.toggle(function(){

                // Show the debug info
                $footer_debug_info.show();

            },function(){

                // Hide the debug info
                $footer_debug_info.hide();

            }).addClass("footer_clickable");

        }

        // index.html mods
        if (checkIndexPage() || doc_name === "") {
            $back_to_top_link.hide();
            $footer_root.addClass("footer_index");
        }

        // Set the end year of the copyright notice
        var d = new Date();
        $footer_date_end.text(d.getFullYear());

    };

    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("footer");