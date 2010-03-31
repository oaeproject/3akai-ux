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
    Config.URL.DELICIOUS_PROXY = "/var/proxy/delicious/bookmarks.json";
    var deliciousSettingsReadURL = "/delicious/" + sdata.me.user.userid + "/delicious/delicious_settings.json";
    var deliciousSettingsSaveURL = "/delicious/" + sdata.me.user.userid + "/delicious";

    // Containers
    var $deliciousContainer = $("#delicious_container", rootel);
    var $deliciousContainerMain = $("#delicious_container_main", rootel);
    var $deliciousContainerSettings = $("#delicious_container_settings", rootel);

    // Errors
    var $deliciousErrorNotConnected = $("#delicious_error_notconnected", rootel);

    // Settings
    var $deliciousSettingsSelectBookmarksInTotal = $("#delicious_settings_select_bookmarksInTotal", rootel);
    var $deliciousSettingsSelectBookmarksPerPage = $("#delicious_settings_select_bookmarksPerPage", rootel);
    var $deliciousSettingsCancel = $("#delicious_settings_cancel", rootel);
    var $deliciousSettingsInputUsername = $("#delicious_settings_input_username", rootel);
    var $deliciousSettingsLink = $("#delicious_settings_link", rootel);
    var $deliciousSettingsSave = $("#delicious_settings_save", rootel);

    // Templates
    var $deliciousTemplateMainBookmarks = "delicious_template_main_bookmarks";
    var $deliciousTemplateSettings = "delicious_template_settings";

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
    var modeArray = ["recent", "popular", "", "network/", "subscriptions/"];
    

    /////////////
    // Display //
    /////////////

    /**
     * Highlight the mode that is currently being used.
     */
    var highlightActiveMode = function(){
        // Remove the activeMenuItem CSS class of each link
        $deliciousMainMenuLink.removeClass("delicious_activeMenuItem");

        // Add the class to the active link
        $($deliciousMainMenuLink[bookmarkMode]).addClass("delicious_activeMenuItem");
    };


    ///////////////
    // Rendering //
    ///////////////

    /**
     * Render paging
     * @param {Object} arraylength: the total number of items
     */
    var renderPaging = function(arraylength){
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: Math.ceil(arraylength / pageSize),
            buttonClickCallback: doPaging
        });
    };

    /**
     * Render bookmarks
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

        // Slice the items to show
        var pagingArray = {
            all: parseBookmarksArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
        };

        // Render the main bookmarks template
        $deliciousMainBookmarks.html($.Template.render($deliciousTemplateMainBookmarks,pagingArray));

        // Show or hide paging
        if (parseBookmarksArray.length > pageSize) {
            $deliciousPaging.show();
            renderPaging(parseBookmarksArray.length);
        } else {
            $deliciousPaging.hide();
            if (parseBookmarksArray.length === 0) {
                // Display 'no items' message
            }
        }

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
    };


    /////////////
    // Parsing //
    /////////////

    /**
     * Parse the Delicious bookmarks
     * @param {String} response: JSON response
     * @param {Boolean} exists: check if the data exists
     */
    var parseDeliciousBookmarks = function(response, exists){
        parseBookmarksGlobal = {
            all: $.evalJSON(response)
        };
        if (exists && response.length > 0) {
            // Render the bookmarks
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
     * Fetch the Delicious bookmarks (public feed)
     */
    var fetchDeliciousBookmarks = function(){
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


    ////////////
    // Paging //
    ////////////

    /**
     * Initializes the change of page
     * @param {Integer} clickedPage: the page which has been clicked and should be displayed
     */
    var doPaging = function(clickedPage){
        pageCurrent = clickedPage - 1;
        renderBookmarks();
    };


    ////////////
    // Filter //
    ////////////

    /**
     * Set global filter parameters and reload bookmarks
     */
    var updateDeliciousFilter = function(){
        filterUser = $("#delicious_filter_input_user", rootel).val();
        getDeliciousBookmarks();
    };


    //////////////
    // Settings //
    //////////////

    /**
     * Save the widget settings
     */
    var saveDeliciousSettings = function(){
        // Object to be saved at JCR
        var deliciousSettings = {
            "username" : $deliciousSettingsInputUsername.val(),
            "bookmarksInTotal" : $deliciousSettingsSelectBookmarksInTotal.val(),
            "bookmarksPerPage" : $deliciousSettingsSelectBookmarksPerPage.val()
        };

        // Create JSON data to send
        var jsonDeliciousSettings = $.toJSON(deliciousSettings);

        // Sava the JSON data to the widgets JCR
        sdata.widgets.WidgetPreference.save(deliciousSettingsSaveURL, "delicious_settings.json", jsonDeliciousSettings, savedDeliciousSettings);
    };

    /**
     * Adds the retrieved settings to the right fields
     * @param {Object} data: retrieved data
     */
    var fillInDeliciousSettings = function(data){
        var settings = $.evalJSON(data);

        $deliciousSettingsInputUsername.val(settings.username);
        $deliciousSettingsSelectBookmarksInTotal.val(settings.bookmarksInTotal);
        $deliciousSettingsSelectBookmarksPerPage.val(settings.bookmarksPerPage);

        filterUser = settings.username;
        bookmarkTotal = parseInt(settings.bookmarksInTotal,10);
        pageSize = parseInt(settings.bookmarksPerPage,10);
    };

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
     * Show or hide the settings view
     * @param {Object} show: boolean
     */
    var showHideDeliciousSettings = function(show){
        if (show) {
            // Show settings
            $deliciousContainerMain.hide();
            $deliciousContainerSettings.show();
            $deliciousPaging.hide();

            // Get settings
            getDeliciousSettings();
        } else {
            // Show main view
            $deliciousContainerMain.show();
            $deliciousContainerSettings.hide();
            $deliciousPaging.show();

            // Get bookmarks
            getDeliciousBookmarks();
        }
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
            showHideDeliciousSettings(false);
        } else {
            // Display error message
            fluid.log("ERROR at delicious.js, savedDeliciousSettings");
        }
    };


    ///////////////
    // Bookmarks //
    ///////////////

    /**
     * Show or hide additional bookmark information.
     */
    var showHideDeliciousBookmarkInfo = function(){
        // Re-initialization
        $deliciousMainBookmarkInfoLink = $(".delicious_main_bookmark_info_link", rootel);

        // Kill previous live events to prevent adding dupes
        $deliciousMainBookmarkInfoLink.die();

        $deliciousMainBookmarkInfoLink.live('click', function(){
            // Define unique info ID, based on link ID
            var elementID = '#' + $(this).attr("id") + '_info';

            // If visible: hide information and swap image
            if ($(this, rootel).hasClass("delicious_showArrowLeft"))
            {
                $(elementID, rootel).hide();
                $(this, rootel).removeClass("delicious_showArrowLeft");
            }
            // Else: show information and swap image
            else
            {
                $(elementID, rootel).show();
                $(this, rootel).addClass("delicious_showArrowLeft");
            }
        });
    };

    /**
     * Get the Delicious bookmarks
     */
    var getDeliciousBookmarks = function(){
        // Set paging at first page
        pageCurrent = 0;

        // Fetch bookmarks (-> parse -> render)
        fetchDeliciousBookmarks();

        // Highlight the mode currently being used in bold
        highlightActiveMode();

        // Show or hide the additional bookmark info
        showHideDeliciousBookmarkInfo();
    };


    ////////////////////
    // Initialization //
    ////////////////////

    /**
     * Add click events to all buttons and links
     */
    var addClickEvents = function(){
        // Clicking on a menu item will change the bookmarkMode and fetch the correct bookmarks
        $deliciousRefreshLink.live('click', getDeliciousBookmarks);
        $deliciousMainMenuLink.live('click', function(){
            bookmarkMode = parseInt($(this).attr("id").split("_")[1],10);
            getDeliciousBookmarks();
        });

        // Clicking a username in the info of a bookmark will show his personal bookmarks
        $deliciousMainBookmarkUserLink.live('click', function(){
            bookmarkMode = 2;
            filterUser = $(this).attr("id");
            getDeliciousBookmarks();
        });

        // Button to filter by username, this will show all results by the given username
        $deliciousFilterShow.live('click', updateDeliciousFilter);

        // The cancel button from the settings screen shows the main view while hiding the settings
        // Clicking the save button will write the input to the server
        $deliciousSettingsCancel.live('click', function(){
            showHideDeliciousSettings(false);
        });
        $deliciousSettingsSave.live('click', saveDeliciousSettings);
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

sdata.widgets.WidgetLoader.informOnLoad("delicious");

//{"u":"http:\/\/www.zazzle.com\/","d":"Zazzle | Custom T-Shirts, Personalized Gifts, Posters, Art, and more","t":["custom","t-shirts"],"dt":"2010-03-29T10:30:25Z","n":"","a":"emmfoster"},{"u":"http:\/\/larienelengasse.livejournal.com\/789969.html","d":"Twice or Thrice Had I Loved Thee","t":["supernatural","wincest","bottom!sam","underage"],"dt":"2010-03-29T10:30:23Z","n":"","a":"tempest_tempestuous"},{"u":"http:\/\/secrettibet.rsfblog.org\/","d":"The Secret Tibet (The Forbidden world)","t":["blogs","tibet","activism"],"dt":"2010-03-29T10:30:22Z","n":"","a":"sduba2271"},{"u":"http:\/\/www.youtube.com\/watch?v=0-X3yXOknJQ","d":"YouTube - Wrestler interrupted by a fan 4GIFs.com","t":["via:packrati.us"],"dt":"2010-03-29T10:30:22Z","n":"","a":"codepo8"},{"u":"http:\/\/www.gloriad.org\/gloriaddrupal\/","d":"Global Ring Network for Advanced Application Development (GLORIAD)","t":["GSR","collaboration"],"dt":"2010-03-29T10:30:22Z","n":"","a":"sciencepolicycentre"},{"u":"http:\/\/vietnamcentrepoint.edu.vn\/nus\/","d":"Th\u00f4ng tin c\u1eed nh\u00e2n NUS","t":["nus"],"dt":"2010-03-29T10:30:22Z","n":"","a":"nhanitvn"},{"u":"http:\/\/trailheadapp.com\/","d":"Welcome to Trailhead!","t":["design"],"dt":"2010-03-29T10:30:22Z","n":"","a":"byaco"},{"u":"http:\/\/nlp.stanford.edu\/IR-book\/html\/htmledition\/support-vector-machines-and-machine-learning-on-documents-1.html","d":"Support vector machines and machine learning on documents","t":["SVM","machine","learning"],"dt":"2010-03-29T10:30:20Z","n":"","a":"capslockwizard"},{"u":"http:\/\/mashable.com\/2008\/07\/10\/how-to-develop-a-social-media-plan\/","d":"How to Develop a Social Media Plan for Your Business in 5 Steps","t":[],"dt":"2010-03-29T10:30:20Z","n":"","a":"goncalves.monique"},{"u":"http:\/\/www.eonet.ne.jp\/~senyou-mondai\/","d":"\u5973\u6027\u5c02\u7528\u8eca\u4e21\u306b\u53cd\u5bfe\u3059\u308b\u4f1a","t":["politics","life"],"dt":"2010-03-29T10:30:20Z","n":"","a":"Kintahakoneyama"},{"u":"http:\/\/www.bgfl.org\/bgfl\/custom\/resources_ftp\/client_ftp\/ks2\/maths\/fractions\/index.htm","d":"Fractions \u2013 A Booster Activity","t":["maths2:","topic","3,","fractions"],"dt":"2010-03-29T10:30:19Z","n":"","a":"xanny"},{"u":"http:\/\/www.webdesigncore.com\/2010\/03\/27\/22-most-unusal-google-earth-photos\/","d":"twenty two Most Uncommon Yahoo and google Earth Photos","t":["unusual","pictures","photos","Earth","world"],"dt":"2010-03-29T10:30:19Z","n":"","a":"BeachBum22"},{"u":"http:\/\/www.youtube.com\/","d":"YouTube","t":[],"dt":"2010-03-29T10:30:19Z","n":"","a":"yentldewolf"},{"u":"http:\/\/www.japantrends.com\/","d":"JAPAN TRENDS \u2013 LIVE FROM TOKYO | Marketing, Lifestyle, Fashion, Gadgets and Product Innovations","t":["japan","trends","blog"],"dt":"2010-03-29T10:30:19Z","n":"","a":"andrewjohn73"},{"u":"http:\/\/sixrevisions.com\/tutorials\/web-development-tutorials\/code-clean-professional-web-design\/","d":"Coding a Clean and Professional Web Design","t":["webdesign","tutorials"],"dt":"2010-03-29T10:30:18Z","n":"","a":"datzer0x"}