/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/*global $, sdata */

var sakai = sakai || {};

/**
 *
 * @param {Object} tuid , unique id for the widget
 * @param {Object} showSettings boolean to check if the widget is in settingsmode or not
 */
sakai.bookmarkandshare = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var $rootel = $("#" + tuid);

    // Settings
    var $settings = $("#bookmarkandshare_settings", $rootel);

    // Templates
    var $settingsPopularTemplate = $("#bookmarkandshare_popular_template", $rootel);

    // Templateholders
    var $settingsContentHolder = $("#bookmarkandshare_settings_content", $rootel);

    // Buttons
    var $popularButton = $("#bookmarkandshare_popular", $rootel);
    var $allButton = $("#bookmarkandshare_all", $rootel);
    var $settingsSubmitButton = $("#bookmarksandshare_settings_submit_button", $rootel);
    var $settingsCancelButton = $("#bookmarksandshare_settings_cancel_button", $rootel);

    // Proxy
    sakai.config.URL.POPULAR_GET_URL = "/var/proxy/bookmarkandshare/popular.json";

    var $selectAllServices = $("#bookmarkandshare_select_all_services", $rootel);
    var $frmPopularServices = $("#bookmarkandshare_frm_popular_services", $rootel);
    var $popularService = $(".bookmarkandshare_popularchk", $rootel);

    // holds if the select all button has been clicked
    var allChecked = false;


    ///////////////////
    // Functionality //
    ///////////////////
    
    $settingsSubmitButton.live("click", function(){
        // convert form to JSON
        var json = sakai.api.UI.Forms.form2json($frmPopularServices);
        // Only keep data that needs to be saved
        $(json)[0].each(function(){
            if ($(this)[0] === "on"){
                console.log($(this));
            }
        });
    });

    /**
     * Count the number of checked boxes for the popular services
     * return number (max 10)
     */
    var checkCount = function(){
        return $popularServicesForm.children("input:checked").length;
    }

    /**
     * Set label when all checkboxes are checked
     */
    var allCheckedServiceLabel = function(){
        $selectAllServices.html("None");
        allChecked = true;
    }

    /**
     * Set label when not all checkboxes are checked
     */
    var uncheckedServiceLabel = function(){
        $selectAllServices.html("All");
        allChecked = false;
    }

    /**
     * Check or uncheck checkboxes depending on the boolean coming in
     * @param {Object} check Boolean to check or uncheck checkboxes
     */
    var checkBoxes = function(check){
        $popularServicesForm.children("input").each(function(){
            $(this)[0].checked = check;
        });
    }

    /**
     * Check or uncheck all checkboxes for the popular services at once
     * @param {Object} check variable that says to check or uncheck all checkboxes, when individual checkbox is clicked this var contains 'individualchk'
     */
    var checkPopularServices = function(check){
        switch (check) {
            case 0:
                if (checkCount() === 10) {
                    $selectAllServices.html("All");
                    allChecked = false;
                    // Uncheck everything
                    checkBoxes(check);
                }
                else {
                    allCheckedServiceLabel();
                }
                break;
            case 1:
                // Check everything
                checkBoxes(check);
                // Set label
                allCheckedServiceLabel();
                break;
            case 2:
                // If count == 10 then set label to 'all', else to 'none'
                // Change variable for state if needed
                if (checkCount() === 10) {
                    allCheckedServiceLabel();
                }
                else {
                    uncheckedServiceLabel();
                }
                break;
        }
    }

    /**
     * If the current state is that all checkboxes are checked uncheck all of them (send 0)
     * else check all of them (send 1)
     */
    $selectAllServices.live("click", function(){
        if (allChecked){
            checkPopularServices(0);
        }else{
            checkPopularServices(1)
        }
    });

    /**
     * Called when an individual checkbox from the popular list has been (un)checked
     */
    $popularService.live("click", function(){
        checkPopularServices(2);
    });

    /**
     * Show the 'Popular' page on the settings page of the widget
     */
    var showPopular = function(results){
        // Render the template
        $.TemplateRenderer($settingsPopularTemplate, results, $settingsContentHolder);
        // Fill variables that weren't present before so could not be filled
        $popularServicesForm = $("#bookmarkandshare_frm_popular_services", $rootel);
        $selectAllServices = $("#bookmarkandshare_select_all_services", $rootel);
        $settingsSubmitButton = $("#bookmarksandshare_settings_submit_button", $rootel);
        $settingsCancelButton = $("#bookmarksandshare_settings_cancel_button", $rootel);
        $frmPopularServices = $("#bookmarkandshare_frm_popular_services", $rootel);
    };

    /**
     * Get most popular services from the AddThis API
     */
    var getPopular = function(){
        //Make the ajax call
        $.ajax({
            url: sakai.config.URL.POPULAR_GET_URL,
            cache: false,
            success: function(data){
                showPopular(data);
            },
            error: function(){
                alert(error);
            }
        });
    }

    /**
     * Show the settings screen to initiate the widget
     */
    var showSettings = function(){
        // Show the settings page
        $settings.show();
        // Show the the content of the first selected page
        getPopular();
    };

    /**
     * Show the widget itself
     */
    var showWidget = function(){
    
    }

    /**
     * Function to init the bookmark and share widget
     * Checks if the widget is initted to show the settings page or not
     */
    var init = function(){
        // Check if the widget has just been placed on the page
        if (showSettings) {
            showSettings();
        }
        else {
            showWidget();
        }
    };
    
    init();
};

sdata.widgets.WidgetLoader.informOnLoad("bookmarkandshare");
