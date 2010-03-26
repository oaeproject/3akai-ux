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

    // URLs
    Config.URL.DELICIOUS_NETWORK = "http://feeds.delicious.com/v2/json/network/";
    Config.URL.DELICIOUS_POPULAR = "http://feeds.delicious.com/v2/json/popular";
    Config.URL.DELICIOUS_PROXY = "/var/proxy/delicious/bookmarks.json";
    Config.URL.DELICIOUS_RECENT = "http://feeds.delicious.com/v2/json/recent";
    Config.URL.DELICIOUS_SUBSCRIPTIONS = "http://feeds.delicious.com/v2/json/subscriptions/";
    Config.URL.DELICIOUS_USER = "http://feeds.delicious.com/v2/json/";

    var deliciousSettingsReadURL = "/delicious/" + sdata.me.user.userid + "/delicious/delicious_settings.json";
    var deliciousSettingsSaveURL = "/delicious/" + sdata.me.user.userid + "/delicious";

    // Errors
    var $deliciousErrorNotConnected = $("#delicious_error_notconnected", rootel);

    // Content
    var $deliciousContainer = $("#delicious_container", rootel);
    var $deliciousContainerMain = $("#delicious_container_main", rootel);
    var $deliciousContainerSettings = $("#delicious_container_settings", rootel);

    // Settings
    var $deliciousSettingsInputUsername = $("#delicious_settings_input_username", rootel);
    var $deliciousSettingsInputPassword = $("#delicious_settings_input_password", rootel);

    // Templates
    var $deliciousTemplateMain = "delicious_template_main";
    var $deliciousTemplateSettings = "delicious_template_settings";

    // Buttons and links
    var $deliciousFilterOK = $("#delicious_filter_ok", rootel);
    var $deliciousMostRecentLink = $("#delicious_mostrecent_link", rootel);
    var $deliciousNetworkLink = $("#delicious_network_link", rootel);
    var $deliciousPopularLink = $("#delicious_popular_link", rootel);
    var $deliciousRefreshLink = $("#delicious_refresh_link", rootel);
    var $deliciousSettingsLink = $("#delicious_settings_link", rootel);
    var $deliciousSettingsButtonSave = $("#delicious_settings_button_save", rootel);
    var $deliciousSubscriptionsLink = $("#delicious_subscriptions_link", rootel);
    var $deliciousUserLink = $("#delicious_user_link", rootel);
    var deliciousButtonsArray = [$deliciousMostRecentLink,$deliciousNetworkLink,$deliciousPopularLink,$deliciousSubscriptionsLink,$deliciousUserLink];

    // Paging
    var $deliciousPaging = $("#delicious_paging", rootel);
    var pageCurrent = 0;
    var pageSize = 5; // Number of items to show at one page
    var jqPagerClass = ".jq_pager";
    var parseBookmarksGlobal = [];

    // Current bookmark mode (mostrecent / popular / user / network / subscriptions)
    var bookmarkMode = "mostrecent";

    // Filters
    var $deliciousMainFilter = $("#delicious_main_filter", rootel);
    var $deliciousFilterInputUser = $("#delicious_filter_input_user", rootel);
    var filterUser = "maxime_debosschere";


    //////////////////////
    // Render functions //
    //////////////////////

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

    /**
     * Render all bookmarks
     */
    var renderBookmarks = function(){
        // Array needed for slicing (paging)
        parseBookmarksArray = [];

        // Fill the array, excluding all irrelevant JSON objects
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

        // Render the main template
        $deliciousContainerMain.html($.Template.render($deliciousTemplateMain,pagingArray));

        if (parseBookmarksArray.length > pageSize) {
            $deliciousPaging.show();
            renderPaging(parseBookmarksArray.length);
        } else {
            $deliciousPaging.hide();
            if (parseBookmarksArray.length === 0) {
                // display 'no items' message
            }
        }

        // Hide the filter when irrelevant
        if (bookmarkMode == "mostrecent" || bookmarkMode == "popular") {
            $deliciousMainFilter = $("#delicious_main_filter", rootel);
            $deliciousMainFilter.hide();
        } else {
            // Otherwise fill in the correct username
            $deliciousFilterInputUser = $("#delicious_filter_input_user", rootel);
            $deliciousFilterInputUser.val(filterUser);
        }
    };


    /////////////////////
    // Parse functions //
    /////////////////////

    /**
     * Parse the twitter status object
     * @param {String} response: JSON response
     * @param {Boolean} exists: check if the data exists
     */
    var parseDeliciousBookmarks = function(response, exists){
        parseBookmarksGlobal = {
            all: $.evalJSON(response)
        };

        if (exists && response.length > 0) {
            // Display every bookmark
            renderBookmarks();
        } else {
            // Display error message
            fluid.log("ERROR at delicious.js, parseDeliciousBookmarks: " + thrownError);
        }
    };


    //////////////////////////
    // Connection functions //
    //////////////////////////

    /**
     * Get the Delicious bookmarks (public feed)
     */
    var getDeliciousBookmarks = function(){
        // Select the correct feed URL
        var feedURL;

        switch (bookmarkMode) {
            case "mostrecent":
                feedURL = Config.URL.DELICIOUS_RECENT;
                break;
            case "user":
                feedURL = Config.URL.DELICIOUS_USER + filterUser;
                break;
            case "popular":
                feedURL = Config.URL.DELICIOUS_POPULAR;
                break;
            case "network":
                feedURL = Config.URL.DELICIOUS_NETWORK + filterUser;
                break;
            case "subscriptions":
                feedURL = Config.URL.DELICIOUS_SUBSCRIPTIONS + filterUser;
                break;
            default:
                feedURL = Config.URL.DELICIOUS_RECENT;
        }

        var postData = {
            proxyEndpoint: feedURL + "?count=15"
        };

        // Get the public data
        $.ajax({
            cache: false,
            url: Config.URL.DELICIOUS_PROXY,
            success: function(data){
                parseDeliciousBookmarks(data, true);
            },
            error: function(xhr, textStatus, thrownError){
                parseDeliciousBookmarks(xhr.status, false);
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

        // Re-initialize
        $deliciousSettingsInputUsername = $("#delicious_settings_input_username", rootel);
        $deliciousSettingsInputPassword = $("#delicious_settings_input_password", rootel);

        $deliciousSettingsInputUsername.val(settings.username);
        $deliciousSettingsInputPassword.val(settings.password);
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


    //////////////////////
    // Filter functions //
    //////////////////////

    /**
     * Set global filter parameters and reload bookmarks
     */
    var updateDeliciousFilter = function(){
        filterUser = $("#delicious_filter_input_user", rootel).val();
        getDeliciousBookmarks();
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Get the stored widget settings
     */
    var getDeliciousSettings = function(){
        // Get the settings data
        // There is a standard function (sdata.widgets.WidgetPreference.get) to do this,
        // but as long as data is being stored at the modified location it can not be used.
        $.ajax({
            cache: false,
            url: deliciousSettingsReadURL,
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
        // Object to be saved at JCR
        var deliciousSettings = {
            "username" : $deliciousSettingsInputUsername.val(),
            "password" : $deliciousSettingsInputPassword.val()
        };

        // Create JSON data to send
        var jsonDeliciousSettings = $.toJSON(deliciousSettings);

        // Sava the JSON data to the widgets JCR
        sdata.widgets.WidgetPreference.save(deliciousSettingsSaveURL, "delicious_settings.json", jsonDeliciousSettings, savedDeliciousSettings);
    };


    ////////////////////
    // Initialization //
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
        var deliciousButtonsArrayLength = deliciousButtonsArray.length;
        for (var i = 0; i < deliciousButtonsArrayLength; i++) {
            deliciousButtonsArray[i].live('click', function(){
                bookmarkMode = $(this).attr("id").split("_")[1];
                getDeliciousBookmarks();
            });
            //deliciousButtonsArray[i].addClass('deliciousActiveMenuItem');
        }
        $deliciousRefreshLink.live('click', getDeliciousBookmarks);
        $deliciousFilterOK.live('click', updateDeliciousFilter);
        //$deliciousSettingsLink.live('click', reloadWidget);
        $deliciousSettingsButtonSave.live('click', saveDeliciousSettings);

        // Render
        $deliciousContainerSettings.html($.Template.render($deliciousTemplateSettings));

        // Get the bookmarks
        getDeliciousBookmarks();
    };

    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("delicious");