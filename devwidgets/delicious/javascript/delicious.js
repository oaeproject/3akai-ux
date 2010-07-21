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

/*global $, sdata, fluid, doPaging, saveDeliciousSettings */

var sakai = sakai || {};

/**
 * @name sakai.delicious
 *
 * @class delicious
 *
 * @description
 * Initialize the Delicious widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.delicious = function(tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // URLs
    sakai.config.URL.DELICIOUS_PROXY = "/var/proxy/delicious/bookmarks.json";

    // Containers
    var $deliciousContainerMain = $("#delicious_container_main", rootel);
    var $deliciousContainerSettings = $("#delicious_container_settings", rootel);

    // Errors
    var $deliciousErrorNoItems = $("#delicious_error_noitems", rootel);
    var $deliciousErrorNoPersonalBookmarks = $("#delicious_error_nopersonalbookmarks", rootel);
    var $deliciousErrorNoPersonalNetworks = $("#delicious_error_nopersonalnetworks", rootel);
    var $deliciousErrorNoPersonalSubscriptions = $("#delicious_error_nopersonalsubscriptions", rootel);
    var $deliciousErrorNoUser = $("#delicious_error_nouser", rootel);

    // Settings
    var $deliciousSettingsSelectBookmarksInTotal = $("#delicious_settings_select_bookmarksInTotal", rootel);
    var $deliciousSettingsSelectBookmarksPerPage = $("#delicious_settings_select_bookmarksPerPage", rootel);
    var $deliciousSettingsCancel = $("#delicious_settings_cancel", rootel);
    var $deliciousSettingsInputUsername = $("#delicious_settings_input_username", rootel);
    var $deliciousSettingsLink = $("#delicious_settings_link", rootel);
    var $deliciousSettingsSave = $("#delicious_settings_save", rootel);

    // Templates
    var $deliciousMainBookmarksTemplate = "delicious_main_bookmarks_template";

    // Main menu
    var $deliciousMainMenuLink = $(".delicious_main_menu_link", rootel);
    var $deliciousRefreshLink = $("#delicious_refresh_link", rootel);

    // Paging
    var $deliciousPaging = $("#delicious_paging", rootel);
    var jqPagerClass = ".jq_pager";
    var pageCurrent = 0;
    var pageSize = 5; // Number of items to show at one page
    var parseBookmarksGlobal = [];

    // Filtering
    var $deliciousMainFilter = $("#delicious_main_filter", rootel);
    var $deliciousFilterInputUser = $("#delicious_filter_input_user", rootel);
    var $deliciousFilterShow = $("#delicious_filter_show", rootel);
    var filterUser = "";
    var filterUserDefault = "";

    // Bookmarks
    var $deliciousMainBookmarks = $("#delicious_main_bookmarks", rootel);
    var $deliciousMainBookmarkInfoLink = $(".delicious_main_bookmark_info_link", rootel);
    var $deliciousMainBookmarkUserLink = $(".delicious_main_bookmark_user_link", rootel);
    var bookmarkMode = 0;
    var bookmarkTotal = 15;

    // Mode Array
    // This array is for completing the correct URL in the proxy:
    // http://feeds.delicious.com/v2/json/${mode}?count=${count}"
    // The bookmarkMode serves as index
    // "" = personal bookmarks
    var modeArray = ["recent", "popular", "", "network/", "subscriptions/"];


    /////////////
    // Display //
    /////////////

    /**
     * Highlight the mode that is currently being used.
     */
    var highlightActiveMode = function() {

        // Remove the activeMenuItem CSS class of each link
        $deliciousMainMenuLink.removeClass("delicious_activeMenuItem");

        // Add the class to the active link
        $($deliciousMainMenuLink[bookmarkMode]).addClass("delicious_activeMenuItem");
    };

    /**
     * This will clean the date (for example 2010-03-29T10:30:25Z to 2010-03-29 10:30:25)
     * @param {Array} bookmark The bookmark of which the date has to be cleaned.
     */
    var cleanBookmarkDate = function(bookmark) {

        // Transform the date into the desired format
        bookmark.dt = bookmark.dt.replace("T"," ").replace("Z","");
    };

    /**
     * Display the correct error message, depending on the bookmarkMode.
     */
    var displayError = function() {
        var errorMessage;

        if ($.trim($deliciousFilterInputUser.val())) {
            switch (bookmarkMode) {
                case 0 || 1:
                    errorMessage = $deliciousErrorNoItems;
                    break;
                case 2:
                    errorMessage = $deliciousErrorNoPersonalBookmarks;
                    break;
                case 3:
                    errorMessage = $deliciousErrorNoPersonalNetworks;
                    break;
                case 4:
                    errorMessage = $deliciousErrorNoPersonalSubscriptions;
                    break;
                default:
                    errorMessage = $deliciousErrorNoItems;
            }
        } else {
            errorMessage = $deliciousErrorNoUser;
        }

        $deliciousMainBookmarks.html(sakai.api.Security.saneHTML(errorMessage));
    };


    ///////////////
    // Rendering //
    ///////////////

    /**
     * Render paging
     * @param {Integer} arraylength the total number of items
     */
    var renderPaging = function(arraylength) {
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: Math.ceil(arraylength / pageSize),
            buttonClickCallback: doPaging
        });
    };

    /**
     * Render bookmarks
     */
    var renderBookmarks = function() {

        // Array needed for slicing (paging)
        var parseBookmarksArray = [];

        // Fill the array, excluding all irrelevant JSON objects
        for (var b in parseBookmarksGlobal.all) {
            if (parseBookmarksGlobal.all.hasOwnProperty(b)){
                if (typeof(parseBookmarksGlobal.all[b]) === "object") {
                    cleanBookmarkDate(parseBookmarksGlobal.all[b]);
                    parseBookmarksArray.push(parseBookmarksGlobal.all[b]);
                }
            }
        }

        // Slice the items to show
        var pagingArray = {
            all: parseBookmarksArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
        };

        // Render the main bookmarks template
        $deliciousMainBookmarks.html($.TemplateRenderer($deliciousMainBookmarksTemplate,pagingArray));

        // Hide filtering options if irrelevant
        if (bookmarkMode === 0 || bookmarkMode === 1) {
            $deliciousMainFilter = $("#delicious_main_filter", rootel);
            $deliciousMainFilter.hide();
        } else {

            // Otherwise fill in the correct username
            $deliciousFilterInputUser = $("#delicious_filter_input_user", rootel);
            $deliciousFilterInputUser.val(filterUser);
            $deliciousMainFilter.show();
        }

        // Show or hide paging
        if (parseBookmarksArray.length > pageSize) {
            $deliciousPaging.show();
            renderPaging(parseBookmarksArray.length);
        } else {
            $deliciousPaging.hide();

            if (parseBookmarksArray.length === 0) {

                // Display an error
                displayError();
            }
        }
    };


    /////////////
    // Parsing //
    /////////////

    /**
     * Parse the Delicious bookmarks
     * @param {String} response JSON response
     * @param {Boolean} exists check if the data exists
     */
    var parseDeliciousBookmarks = function(response, exists) {

        if (exists) {
            parseBookmarksGlobal = {
                all: response
            };
            
            // Hide paging
            $deliciousPaging.hide();

            // Render the bookmarks
            renderBookmarks();
        } else {

            // Display error message
            fluid.log("ERROR at delicious.js, parseDeliciousBookmarks");
            displayError();
        }
    };


    //////////////////////////
    // Connection functions //
    //////////////////////////

    /**
     * Fetch the Delicious bookmarks (public feed)
     */
    var fetchDeliciousBookmarks = function() {

        // Retrieve the correct mode from the global array
        var mode = modeArray[bookmarkMode];

        // When needed, add the username (= the name to filter) to the mode
        if (bookmarkMode === 2 || bookmarkMode === 3 || bookmarkMode === 4) {
             mode += filterUser;
        }

        // Fill in the PostData
        var postData = {
            "mode": mode,
            "count": bookmarkTotal
        };

        // Get the public data
        $.ajax({
            cache: false,
            url: sakai.config.URL.DELICIOUS_PROXY,
            success: function(data){
                parseDeliciousBookmarks(data, true);
            },
            error: function(xhr, textStatus, thrownError) {
                parseDeliciousBookmarks(xhr.status, false);
            },
            data: postData
        });
    };


    ////////////
    // Paging //
    ////////////

    /**
     * Initializes the change of page
     * @param {Integer} clickedPage the page which has been clicked and should be displayed
     */
    var doPaging = function(clickedPage) {

        // Adjust pageCurrent (pageCurrent is zero-based)
        pageCurrent = clickedPage - 1;

        renderBookmarks();
    };


    ////////////
    // Filter //
    ////////////

    /**
     * Set global filter variable
     */
    var updateDeliciousFilter = function() {
        filterUser = $.trim($deliciousFilterInputUser.val());
    };

    /**
     * Returns Boolean: the username in the filter is valid (true) or invalid (false)
     */
    var isValidUser = function() {

        // If the username is empty
        if (!filterUser) {

            // Replace the filterUser with the default one (= from the settings)
            filterUser = filterUserDefault;
        }

        // If the username is still empty
        if (!filterUser) {
            return false;
        } else {

            // Valid username
            return true;
        }
    };


    ///////////////
    // Bookmarks //
    ///////////////

    /**
     * Show or hide additional bookmark information.
     */
    var showHideDeliciousBookmarkInfo = function() {

        // Re-initialization
        $deliciousMainBookmarkInfoLink = $(".delicious_main_bookmark_info_link", rootel);

        // Kill previous live events to prevent adding dupes
        $deliciousMainBookmarkInfoLink.die();

        $deliciousMainBookmarkInfoLink.live('click', function() {

            // Define unique info ID, based on link ID
            var elementID = '#' + $(this).attr("id") + '_info';

            // If visible: hide information and swap image
            if ($(this, rootel).hasClass("delicious_showArrowLeft"))
            {
                $(elementID, rootel).slideUp(150);
                $(this, rootel).removeClass("delicious_showArrowLeft");
            }

            // Else: show information and swap image
            else
            {
                $(elementID, rootel).slideDown(150);
                $(this, rootel).addClass("delicious_showArrowLeft");
            }
        });
    };

    /**
     * Get the Delicious bookmarks
     */
    var getDeliciousBookmarks = function() {

        // Set paging at first page
        pageCurrent = 0;

        // Check if the username in the filter is valid
        // Only check this when filtering is required: personal / network / subscriptions
        if (bookmarkMode < 2 || isValidUser()) {

            // Fetch bookmarks (-> parse -> render)
            fetchDeliciousBookmarks();
        } else {

            // Show the filter so the user can try a new user search
            $deliciousMainFilter.show();

            // Hide paging
            $deliciousPaging.hide();

            // Display an error message
            displayError();
        }

        // Highlight the mode currently being used in bold
        highlightActiveMode();

        // Show or hide the additional bookmark info
        showHideDeliciousBookmarkInfo();
    };


    //////////////
    // Settings //
    //////////////

    /**
     * Adds the retrieved settings to the right fields
     * @param {Object} data retrieved data
     */
    var fillInDeliciousSettings = function(data) {

        $deliciousSettingsInputUsername.val(data.username);
        $deliciousSettingsSelectBookmarksInTotal.val(data.bookmarksInTotal);
        $deliciousSettingsSelectBookmarksPerPage.val(data.bookmarksPerPage);

        filterUser = data.username;
        filterUserDefault = data.username;
        bookmarkTotal = parseInt(data.bookmarksInTotal,10);
        pageSize = parseInt(data.bookmarksPerPage,10);

        // If the mainview is shown, get the bookmarks from Delicious
        if (!showSettings){
            getDeliciousBookmarks();
        }
    };

    /**
     * Show or hide the settings view
     * @param {Boolean} show Show or hide the settings view
     */
    var showHideDeliciousSettings = function(show) {
        if (show) {

            // Show settings
            showSettings = true;
            $deliciousContainerMain.hide();
            $deliciousContainerSettings.show();
            $deliciousPaging.hide();
        } else {

            // Show main view
            showSettings = false;
            $deliciousContainerMain.show();
            $deliciousContainerSettings.hide();
        }
    };

    /**
     * Get the stored widget settings
     */
    var getDeliciousSettings = function() {

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
            if (success) {
                fillInDeliciousSettings(data);
            } else {

                // Save default settings so the error message wont appear again.
                saveDeliciousSettings();

                // Show error message
                fluid.log("sakai.delicious.getDeliciousSettings: Failed to load settings because no settings file was found. This occurs the first time the widget loads. Default settings have been saved and are now in usage.");
            }
        });
    };

    /**
     * Save the widget settings
     */
    var saveDeliciousSettings = function() {

        // Object to be saved at JCR
        var deliciousSettings = {
            "username" : $deliciousSettingsInputUsername.val(),
            "bookmarksInTotal" : $deliciousSettingsSelectBookmarksInTotal.val(),
            "bookmarksPerPage" : $deliciousSettingsSelectBookmarksPerPage.val()
        };

        sakai.api.Widgets.saveWidgetData(tuid, deliciousSettings, function(success, data) {
            if (success){

                // FIXME
                // sakai.api.Widgets.Container.informFinish(tuid,"delicious");
                // Problem: multiple instances of this widget show up

                // Get the settings from the server
                // This will also get and show the bookmarks
                getDeliciousSettings();

                // Show the main view
                showHideDeliciousSettings(false);
            } else {
                fluid.log("sakai.delicious.saveDeliciousSettings: Failed to save settings.");
            }

        });
    };


    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Add click events to all buttons and links
     */
    var addClickEvents = function() {

        // TEMPORARY solution to prevent multiple click events
        $deliciousRefreshLink.die();
        $deliciousMainMenuLink.die();
        $deliciousMainBookmarkUserLink.die();
        $deliciousFilterShow.die();
        $deliciousSettingsCancel.die();
        $deliciousSettingsSave.die();
        $deliciousSettingsLink.die();

        // Clicking on a menu item will change the bookmarkMode and fetch the correct bookmarks
        $deliciousRefreshLink.live('click', getDeliciousBookmarks);
        $deliciousMainMenuLink.live('click', function() {
            bookmarkMode = parseInt($(this).attr("id").split("_")[2],10);
            getDeliciousBookmarks();
        });

        // Clicking a username in the info of a bookmark will show his personal bookmarks
        $deliciousMainBookmarkUserLink.live('click', function() {
            bookmarkMode = 2;
            filterUser = $(this).attr("id");
            getDeliciousBookmarks();
        });

        // Button to filter by username, this will show all results by the given username
        $deliciousFilterShow.live('click', function() {
            updateDeliciousFilter();
            getDeliciousBookmarks();
        });

        // The cancel button from the settings screen shows the main view while hiding the settings
        // Clicking the save button will write the input to the server
        $deliciousSettingsCancel.live('click', function() {
            showHideDeliciousSettings(false);
            getDeliciousBookmarks();
        });

        $deliciousSettingsSave.live('click', saveDeliciousSettings);

        // Clicking the settings link will show and reload the widget settings
        $deliciousSettingsLink.live('click', function() {
            showHideDeliciousSettings(true);
            getDeliciousSettings();
        });
    };

    /**
     * Switch between main view and settings
     */
    var doInit = function(){

        // Add every required event
        addClickEvents();

        // Get the settings from the server
        getDeliciousSettings();

        // Hide or show the settings view
        if (showSettings){
            showHideDeliciousSettings(true);
        }else{
            showHideDeliciousSettings(false);
        }
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("delicious");