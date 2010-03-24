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

/*global $, sdata, Config*/

var sakai = sakai || {};

/**
 * Initialize the Delicious widget
 * @param {String} tuid: unique id of the widget
 * @param {String} placement: the place of the widget
 * @param {Boolean} showSettings: show the settings of the widget or not
 */
sakai.delicious = function(tuid, placement, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // Errors
    var $deliciousErrorNotConnected = $("#delicious_error_notconnected", rootel);

    // Content
    var $deliciousContainer = $("#delicious_container", rootel);
    var $deliciousContainerMain = $("#delicious_container_main", rootel);
    var $deliciousContainerSettings = $("#delicious_container_settings", rootel);

    // Settings
    //var $deliciousSettingsInputUsername = $("#delicious_settings_input_username", rootel);
    //var $deliciousSettingsInputPassword = $("#delicious_settings_input_password", rootel);

    // Templates
    var $deliciousTemplateMain = "delicious_template_main";
    var $deliciousTemplateSettings = "delicious_template_settings";

    // Buttons and links
    var $deliciousSettingsLink = $("#delicious_settings_link", rootel);
    var $deliciousSettingsButtonSave = $("#delicious_settings_button_save", rootel);

    // Paging
    var $deliciousPaging = $("#delicious_paging", rootel);

    var pageCurrent = 0;
    var pageSize = 5; // Number of items to show at one page
    var jqPagerClass = ".jq_pager";
    var parseBookmarksGlobal = [];


    /////////////////////
    // Parse functions //
    /////////////////////

    /**
     * Parse the twitter status object
     * @param {String} response: JSON response
     * @param {Boolean} exists: check if the data exists
     */
    var parseDeliciousRecentBookmarks = function(response, exists){
        parseBookmarksGlobal = {
            all: $.evalJSON(response)
        };

        if(exists && response.length > 0){
            // Display every bookmark
            renderBookmarks();
        }else{
            // Display error message
            fluid.log("ERROR at delicious.js, parseDeliciousRecentBookmarks: " + thrownError);
        }
    };


    //////////////////////
    // Render functions //
    //////////////////////

    /**
     * Render all bookmarks
     */
    var renderBookmarks = function(){
        // Array needed for slicing (paging)
        parseBookmarksArray = [];

        // Filling the array, excluding all irrelevant JSON objects
        for (var b in parseBookmarksGlobal.all) {
            if (parseBookmarksGlobal.all.hasOwnProperty(b)) {
                if (typeof(parseBookmarksGlobal.all[b]) === "object") {
                    parseBookmarksArray.push(parseBookmarksGlobal.all[b]);
                }
            }
        }

        var pagingArray = {
            all: parseBookmarksArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
        };

        // Rendering the list
        $deliciousContainerMain.html($.Template.render($deliciousTemplateMain,pagingArray));

        if (parseBookmarksArray.length > pageSize) {
            document.getElementById('delicious_paging').style.visibility = "visible";
            renderPaging(parseBookmarksArray.length);
        }else{
            document.getElementById('delicious_paging').style.visibility = "hidden";
            if(parseBookmarksArray.length === 0){
                // display 'no items' message
            }
        }
    };

    /**
     * Render paging
     * @param {Object} arraylength: the number of items
     */
    var renderPaging = function(arraylength){
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: Math.ceil(arraylength / pageSize),
            buttonClickCallback: doPaging
        });
    };


    //////////////////////////
    // Connection functions //
    //////////////////////////

    /**
     * Get the most recent Delicious bookmarks (public feed)
     */
    var getDeliciousRecentBookmarks = function(){
        // Selecting the format (json/xml)
        var postData = {
            format: "json"
        };

        // Getting the public data
        $.ajax({
            url: "/var/proxy/delicious/recent.json",
            success: function(data){
                parseDeliciousRecentBookmarks(data, true);
            },
            error: function(xhr, textStatus, thrownError){
                parseDeliciousRecentBookmarks(xhr.status, false);
            },
            data: postData
        });
    };


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Adds the retrieved settings to the right fields
     * @param {Object} data: retrieved data
     */
    var fillInDeliciousSettings = function(data){
        var settings = $.evalJSON(data);

        // GLOBAL VAR DOESN'T WORK
        $("#delicious_settings_input_username", rootel).val(settings.username);
        $("#delicious_settings_input_password", rootel).val(settings.password);
    };


    //////////////////////
    // Paging functions //
    //////////////////////

    /**
     * Initializes the change of page
     * @param {Integer} clickedPage: the page which has been clicked and should be displayed
     */
    var doPaging = function(clickedPage){
        pageCurrent = clickedPage - 1;
        renderBookmarks();
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Get the stored widget settings
     */
    var getDeliciousSettings = function(){
        var url = "/delicious/" + sdata.me.user.userid + "/delicious/delicious_settings.json";

        // Getting the settings data
        // There is a standard function (sdata.widgets.WidgetPreference.get) to do this,
        // but as long as data is being stored at the modified location it can not be used.
        $.ajax({
            cache: false,
            url: url,
            success: function(data){
                // Fill in the retrieved data
                fillInDeliciousSettings(data);
            },
            error: function(xhr, textStatus, thrownError) {
                // Display error message
                fluid.log("ERROR at delicious.js, getDeliciousSettings: " + thrownError);
            }
        });
    };

    /**
     * Callback function. Once the settings have been saved, hide the settings page and show the main view
     */
    var savedDeliciousSettings = function(success){
        if (success) {
            // Preference saved

            // FIXME
            // sdata.container.informFinish(tuid,"delicious");
            // Problem: multiple instances of this widget show up

            // This is a temporary solution
            $deliciousContainerMain.show();
            $deliciousPaging.show();
            $deliciousContainerSettings.hide();
        } else {
            // Display error message
            fluid.log("ERROR at delicious.js, savedDeliciousSettings");
        }
    };

    /**
     * Save the widget settings
     */
    var saveDeliciousSettings = function(){
        // Concatinate the URL where the settings should be saved
        var saveUrl = "/delicious/" + sdata.me.user.userid + "/delicious";

        // Object to be saved at JCR
        var deliciousSettings = {
            "username" : $("#delicious_settings_input_username", rootel).val(),
            "password" : $("#delicious_settings_input_password", rootel).val()
        };

        // Create JSON data to send
        var jsonDeliciousSettings = "";
        jsonDeliciousSettings = $.toJSON(deliciousSettings);

        // Sava the JSON data to the widgets JCR
        sdata.widgets.WidgetPreference.save(saveUrl, "delicious_settings.json", jsonDeliciousSettings, savedDeliciousSettings);
    };


    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * Switch between main view and settings
     */
    var doInit = function(){
        if (showSettings) {
            // Get settings
            getDeliciousSettings();

            // Show settings
            $deliciousContainerMain.hide();
            $deliciousPaging.hide();
            $deliciousContainerSettings.show();
        } else {
            // Show main view
            $deliciousContainerMain.show();
            $deliciousPaging.show();
            $deliciousContainerSettings.hide();
        }

        // Buttons
        //$deliciousSettingsLink.live('click', reloadWidget);
        $deliciousSettingsButtonSave.live('click', saveDeliciousSettings);

        // Render
        //$deliciousContainerMain.html($.Template.render($deliciousTemplateMain));
        $deliciousContainerSettings.html($.Template.render($deliciousTemplateSettings));

        // Get most recent bookmarks
        getDeliciousRecentBookmarks();
    };

    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("delicious");