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
/*global $, sdata, fluid */

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
    var $settingsSubmitButton = $("#bookmarksandshare_settings_submit_button", $rootel);
    var $settingsCancelButton = $("#bookmarksandshare_settings_cancel_button", $rootel);
    var $shareButton = $("#bookmarkandshare_share_button");
    var $selectAllServices = $("#bookmarkandshare_select_all_services", $rootel);

    // Proxy
    sakai.config.URL.POPULAR_GET_URL = "/var/proxy/bookmarkandshare/popular.json";

    // Forms
    var $frmPopularServices = $("#bookmarkandshare_frm_popular_services", $rootel);
    var $popularService = $(".bookmarkandshare_popularchk", $rootel);

    // Errors
    var $noPopularError = $("#bookmarkandshare_error_nopopular", $rootel);
    var $settingsNotSavedError = $("#bookmarkandshare_error_settings_save", $rootel);
    var $settingsNotLoadedError = $("#bookmarkandshare_error_settings_load", $rootel);
    var $selectServiceError = $("#bookmarkandshare_error_select_service", $rootel);

    // Internationalization
    var $allInternationalization = $("#bookmarkandshare_internationalization_all", $rootel).html();
    var $noneInternationalization = $("#bookmarkandshare_internationalization_none", $rootel).html();

    // holds if the select all button has been clicked
    var allChecked = false;


    ///////////////////
    // Functionality //
    ///////////////////

    /**
     * Remove the default settings error message
     * This messages is shown when a new widget is created as well as when settings could not be loaded.
     */
    var removeDefaultSettingsError = function(){
        $($settingsNotLoadedError, $settingsContentHolder).remove();
    };

    /**
     * Remove the error indicating the user should select at least one service before submitting
     */
    var removeSelectServiceError = function(){
        $($selectServiceError, $settingsContentHolder).remove();
    };

    /**
     * Remove the error indicating the settings have not been saved
     */
    var removeNotSavedError = function(){
        $($settingsNotSavedError, $settingsContentHolder).remove();
    };

    /**
     * Function that removes all error messages that can be thrown at e certain point
     * Bundles all functions in one function
     */
    var removeErrorMessages = function(){
        removeDefaultSettingsError();
        removeSelectServiceError();
        removeNotSavedError();
    };

    /**
     * Function that will close the container when the saving is done
     * @param {Boolean} success Boolean indicating if the save has been successful
     */
    var closeContainer = function(success){
        if (success) {
            sakai.api.Widgets.Container.informFinish(tuid);
        }else{
            $settingsContentHolder.append(sakai.api.Security.saneHTML($settingsNotSavedError));
        }
    };

    /**
     * Function that will close the container when the cancel button is clicked
     */
    var cancelContainer = function(){
        sakai.api.Widgets.Container.informCancel(tuid);
    };

    /**
     * Function that will save the array of checked items to Sling
     * @param {Object} json Array containing objects that can be converted to JSON
     */
    var saveSettings = function(json){
        sakai.api.Widgets.saveWidgetData(tuid, json, closeContainer);
    };

    /**
     * Count the number of checked boxes for the popular services
     * @returns {Number} return a number with a maximum of 10.
     */
    var checkCount = function(){
        return $frmPopularServices.children("input:checked").length;
    };

    /**
     * Convert the form with selected popular services to JSON
     * Call function to save to Sling
     */
    var convertFormToJSON = function(){
        // First check if the form may be submitted
        // at least one checkbox has to be checked
        if (checkCount() > 0) {
            // Create a 1 level deep json file
            // This makes it possible to do json2form later on
            var jsonArr = [];
            jsonArr.services = sakai.api.UI.Forms.form2json($frmPopularServices);
            // Save the json
            saveSettings(jsonArr);
        } else {
            fluid.log("Bookmark and share - Select at least one service.");
            $settingsContentHolder.append(sakai.api.Security.saneHTML($selectServiceError));
        }
    };

    /**
     * Set label when all checkboxes are checked
     */
    var allCheckedServiceLabel = function(){
        $selectAllServices.html(sakai.api.Security.saneHTML($noneInternationalization));
        allChecked = true;
    };

    /**
     * Set label when not all checkboxes are checked
     */
    var uncheckedServiceLabel = function(){
        $selectAllServices.html(sakai.api.Security.saneHTML($allInternationalization));
        allChecked = false;
    };

    /**
     * Check or uncheck checkboxes depending on the boolean coming in
     * @param {Boolean} check Boolean to check or uncheck checkboxes
     */
    var checkBoxes = function(check){
        $frmPopularServices.children("input").attr("checked", check);
    };

    /**
     * Check or uncheck all checkboxes for the popular services at once
     * @param {Number} Number from 0 to 2. 0 unchecks everything, 1 checks everything and 2 (un)checks single box and checks labels
     */
    var checkPopularServices = function(check){
        removeErrorMessages();
        switch (check) {
            case 0:
                // Uncheck boxes and set labels accordingly
                if (checkCount() === 10) {
                    $selectAllServices.html(sakai.api.Security.saneHTML($allInternationalization));
                    allChecked = false;
                    // Uncheck everything
                    checkBoxes(check);
                }
                else {
                    allCheckedServiceLabel();
                }
                break;
            case 1:
                // Check boxes and set labels accordingly
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
    };

    /**
     * Function fills up the settings form
     * checks checkboxes that are marked as checked in the settings file
     * @param {Boolean} success Boolean that tells if the load of the data was successful
     * @param {Object} results json results returned from data load
     */
    var checkPopularBoxes = function(success, results){
        if(success){
            sakai.api.UI.Forms.json2form($frmPopularServices, results.services);
            if (checkCount() === 10){
                // Set label
                allCheckedServiceLabel();
            }
        }else{
            fluid.log("Bookmark and share - No settings could be loaded.");
            $settingsContentHolder.append(sakai.api.Security.saneHTML($settingsNotLoadedError));
        }
    };

    /**
     * Show the 'Popular' page on the settings page of the widget
     * @param {Object} results contains results from the Ajax call with popular services
     */
    var showPopular = function(results){
        if (results) {
            $($noPopularError, $settingsContentHolder).remove();
            // Render the template
            $.TemplateRenderer($settingsPopularTemplate, results, $settingsContentHolder);
            // Fill variables that weren't present before so could not be filled
            $selectAllServices = $("#bookmarkandshare_select_all_services", $rootel);
            $settingsSubmitButton = $("#bookmarksandshare_settings_submit_button", $rootel);
            $settingsCancelButton = $("#bookmarksandshare_settings_cancel_button", $rootel);
            $frmPopularServices = $("#bookmarkandshare_frm_popular_services", $rootel);
            $popularService = $(".bookmarkandshare_popularchk", $rootel);
            // Set clicks
            $settingsSubmitButton.bind("click", function(){
                // Remove error message that can be present
                removeErrorMessages();
                // Create JSON
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
                    checkPopularServices(1);
                }
            });
            $popularService.bind("click", function(){
                removeErrorMessages();
                checkPopularServices(2);
            });
            // Get data about the widget that might have been saved
            sakai.api.Widgets.loadWidgetData(tuid, checkPopularBoxes);
        }else{
            $settingsContentHolder.append(sakai.api.Security.saneHTML($noPopularError));
        }
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
                fluid.log("Bookmark and share - Could not retrieve popular services from AddThis.");
                $settingsContentHolder.append(sakai.api.Security.saneHTML($noPopularError));
            }
        });
    };

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
     * @param {Boolean} success boolean that tells if the load of the data was successful
     * @param {Object} results json results returned from data load
     */
    var populateShareButton = function(success, results){
        // Get the services that are selected in the settings screen
        // Dismiss the services that are not selected
        var obj = {};
        var selectedServices = [];
        for (var i in results.services){
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
        // Set width of share button div by calculating it
        var divwidth = 90 + (selectedServices.length * 23);
        $shareButton.css("width", divwidth);
    };

    /**
     * Show the widget itself
     */
    var showWidget = function(){
        // Get the settings for the widget
        sakai.api.Widgets.loadWidgetData(tuid, populateShareButton);
    };

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

sakai.api.Widgets.widgetLoader.informOnLoad("bookmarkandshare");