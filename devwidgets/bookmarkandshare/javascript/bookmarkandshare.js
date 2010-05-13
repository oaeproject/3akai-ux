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
    var $buttonTemplate = $("#bookmarkandshare_button_template");

    // Templateholders
    var $settingsContentHolder = $("#bookmarkandshare_settings_content", $rootel);
    var $shareButtonHolder = $("#bookmarkandshare_share_button_container");

    // Buttons
    var $popularButton = $("#bookmarkandshare_popular", $rootel);
    var $allButton = $("#bookmarkandshare_all", $rootel);
    var $settingsSubmitButton = $("#bookmarksandshare_settings_submit_button", $rootel);
    var $settingsCancelButton = $("#bookmarksandshare_settings_cancel_button", $rootel);
    var $shareButton = $("#bookmarkandshare_share_button");

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

    /**
     * Function that will close the container when the saving is done
     */
    var closeContainer = function(){
        sdata.container.informFinish(tuid);
    };

    /**
     * Function that will close the container when the cancel button is clicked
     */
    var cancelContainer = function(){
        sdata.container.informCancel(tuid);
    };

    /**
     * Function that will save the array of checked items to Sling
     * @param {Object} json Array containing objects that can be converted to JSON
     */
    var saveSettings = function(json){
        sakai.api.Widgets.saveWidgetData(tuid, json, closeContainer);
    }

    /**
     * Convert the form with selected popular services to JSON
     * Call function to save to Sling
     */
    var convertFormToJSON = function(){
        // Create a 1 level deep json file
        // This makes it possible to do json2form later on
        var jsonArr = [];
        jsonArr["services"] = sakai.api.UI.Forms.form2json($frmPopularServices);
        // Save the json
        saveSettings(jsonArr);
    }

    /**
     * Count the number of checked boxes for the popular services
     * return number (max 10)
     */
    var checkCount = function(){
        return $frmPopularServices.children("input:checked").length;
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
        $frmPopularServices.children("input").each(function(){
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
     * Function fills up the settings form
     * checks checkboxes that are marked as checked in the settings file
     * @param {Object} success boolean that tells if the load of the data was successful
     * @param {Object} results json results returned from data load
     */
    var checkPopularBoxes = function(success, results){
        if(success){
            sakai.api.UI.Forms.json2form($frmPopularServices, results.services);
        }else{
            fluid.log("no settings were previously saved.")
        }
    }

    /**
     * Show the 'Popular' page on the settings page of the widget
     */
    var showPopular = function(results){
        // Render the template
        $.TemplateRenderer($settingsPopularTemplate, results, $settingsContentHolder);
        // Fill variables that weren't present before so could not be filled
        $selectAllServices = $("#bookmarkandshare_select_all_services", $rootel);
        $settingsSubmitButton = $("#bookmarksandshare_settings_submit_button", $rootel);
        $settingsCancelButton = $("#bookmarksandshare_settings_cancel_button", $rootel);
        $frmPopularServices = $("#bookmarkandshare_frm_popular_services", $rootel);
        // Set clicks
        $settingsSubmitButton.bind("click", function(){
            convertFormToJSON();
        });
        $settingsCancelButton.bind("click", function(){
            cancelContainer();
        });
        $selectAllServices.bind("click", function(){
            if (allChecked) {
                checkPopularServices(0);
            }
            else {
                checkPopularServices(1)
            }
        });
        $popularService.bind("click", function(){
            checkPopularServices(2);
        });
        // Get data about the widget that might have been saved
        sakai.api.Widgets.loadWidgetData(tuid, checkPopularBoxes);
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
    var showSettingsScreen = function(){
        // Show the settings page
        $settings.show();
        // Show the the content of the first selected page
        getPopular();
    };

    /**
     * Fill the share button with services chosen through the settings screen
     * @param {Object} success boolean that tells if the load of the data was successful
     * @param {Object} results json results returned from data load
     */
    var populateShareButton = function(success, results){
        // Get the services that are selected in the settings screen
        // Dismiss the services that are not selected
        var obj = new Object();
        selectedServices = [];
        for (i in results.services){
            if (results.services[i][0] === "on"){
                selectedServices.push(i.split("bookmarkandshare_")[1]);
            }
        }
        obj.services = selectedServices;
        // Render the button template
        $.TemplateRenderer($buttonTemplate, obj, $shareButtonHolder);
        // get the button
        $shareButton = $("#bookmarkandshare_share_button");
        // Add rounded corners to button
        $shareButton.corners();
        // Set width of div by calculating it
        var divwidth = 90 + (selectedServices.length * 23);
        $shareButton.css("width", divwidth);
    }

    /**
     * Show the widget itself
     */
    var showWidget = function(){
        // Get the settings for the widget
        sakai.api.Widgets.loadWidgetData(tuid, populateShareButton);
    }

    /**
     * Function to init the bookmark and share widget
     * Checks if the widget is initted to show the settings page or not
     */
    var init = function(){
        // Check if the widget has just been placed on the page
        if (showSettings) {
            showSettingsScreen();
        }
        else {
            showWidget();
        }
    };
    
    init();
};

sdata.widgets.WidgetLoader.informOnLoad("bookmarkandshare");
