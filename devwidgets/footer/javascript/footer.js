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

/*global $, Config, sdata */

var sakai = sakai || {};

/**
 * Initialize the footer widget
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.footer = function(tuid,showSettings){


    //////////////////////
    // Helper functions //
    //////////////////////

    /*
     * This helper function will
     */
    var getDocName = function() {
        var url = document.URL;
        var slash = "/";
        if (url.match(/\\/)) {
            slash = "\\";
        }
        return url.substring(url.lastIndexOf(slash) + 1);
    };

    var checkIndexPage = function(){
        return document.URL.match(/index.html[?a-zA-Z0-9=]*/);
    }

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var doc_name = getDocName();
    var $back_to_top_link = $("#footer_main .back-top");
    var $debug_info = $("#debug_info");
    var $footer_date_end = $("#footer_date_end");
    var $footer_root = $("#footer_main");
    var $footer_logo = $("#footer_logo");


    ////////////////////
    // Main functions //
    ////////////////////

    var renderDebugInfo = function(container) {

        // Construct debug info | TODO: get current running kernel version from a service, maybe svn version of UX as well
        var debug_text = "DEBUG:";
        debug_text += " UX git: <a href='http://github.com/oszkarnagy/3akai-ux/tree/v_0.4.0_release'>v_0.4.0_release</a>";
        debug_text += " | KERNEL git: <a href='http://github.com/ieb/open-experiments/tree/0.5' target='_blank'>0.5</a>";
        debug_text += " | DOC mod date: " + document.lastModified;
        debug_text += " | PLACE: " + doc_name;

        // Put text into holding tag
        container.html(debug_text);

    };

    /*
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

    var doInit = function(){

        // Display debug info if set in config
        if (sakai.config.displayDebugInfo === true) {

            // Render the debug info
            renderDebugInfo($debug_info);

            // Add binding to the image
            $footer_logo.bind("click", function(){

                // Make space for debug info
                $footer_root.height("65px");

                // Show the debug info
                $debug_info.show();

            }).addClass("footer_clickable");

        }

        // Set the height of the footer
        $footer_root.height("45px");

        // index.html mods
        if (checkIndexPage()) {
            $back_to_top_link.hide();
            $footer_root.css({'z-index' : '99', 'bottom' : '0', 'height' : '40px', 'background' : 'url(_images/footer_index.png) center bottom no-repeat', 'position' : 'fixed', 'clear' : 'both', 'margin-bottom' : '0'});
        }

        // Set the end year of the copyright notice
        var d = new Date();
        $footer_date_end.text(d.getFullYear());

    };

    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("footer");
