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
     * Highlight the mode that is currently being used.
     */
    var highlightActiveMode = function(){
        // There is no need to remove all classes before adding a new one
        // The template render has done this al ready
        // The downside of this: link re-initializations are a necessity

        switch (bookmarkMode) {
            case "mostrecent":
                $deliciousMostRecentLink = $("#delicious_mostrecent_link", rootel);
                $deliciousMostRecentLink.addClass("activeMenuItem");
                break;
            case "user":
                $deliciousUserLink = $("#delicious_user_link", rootel);
                $deliciousUserLink.addClass("activeMenuItem");
                break;
            case "popular":
                $deliciousPopularLink = $("#delicious_popular_link", rootel);
                $deliciousPopularLink.addClass("activeMenuItem");
                break;
            case "network":
                $deliciousNetworkLink = $("#delicious_network_link", rootel);
                $deliciousNetworkLink.addClass("activeMenuItem");
                break;
            case "subscriptions":
                $deliciousSubscriptionsLink = $("#delicious_subscriptions_link", rootel);
                $deliciousSubscriptionsLink.addClass("activeMenuItem");
                break;
            default:
        }
    };

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

        // Highlight the mode currently is being used
        highlightActiveMode();
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

        // Add click event to buttons
        var deliciousButtonsArrayLength = deliciousButtonsArray.length;
        for (var i = 0; i < deliciousButtonsArrayLength; i++) {
            deliciousButtonsArray[i].live('click', function(){
                bookmarkMode = $(this).attr("id").split("_")[1];
                pageCurrent = 0; // go to first page
                getDeliciousBookmarks();
            });
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

//{"u":"http:\/\/www.zazzle.com\/","d":"Zazzle | Custom T-Shirts, Personalized Gifts, Posters, Art, and more","t":["custom","t-shirts"],"dt":"2010-03-29T10:30:25Z","n":"","a":"emmfoster"},{"u":"http:\/\/larienelengasse.livejournal.com\/789969.html","d":"Twice or Thrice Had I Loved Thee","t":["supernatural","wincest","bottom!sam","underage"],"dt":"2010-03-29T10:30:23Z","n":"","a":"tempest_tempestuous"},{"u":"http:\/\/secrettibet.rsfblog.org\/","d":"The Secret Tibet (The Forbidden world)","t":["blogs","tibet","activism"],"dt":"2010-03-29T10:30:22Z","n":"","a":"sduba2271"},{"u":"http:\/\/www.youtube.com\/watch?v=0-X3yXOknJQ","d":"YouTube - Wrestler interrupted by a fan 4GIFs.com","t":["via:packrati.us"],"dt":"2010-03-29T10:30:22Z","n":"","a":"codepo8"},{"u":"http:\/\/www.gloriad.org\/gloriaddrupal\/","d":"Global Ring Network for Advanced Application Development (GLORIAD)","t":["GSR","collaboration"],"dt":"2010-03-29T10:30:22Z","n":"","a":"sciencepolicycentre"},{"u":"http:\/\/vietnamcentrepoint.edu.vn\/nus\/","d":"Th\u00f4ng tin c\u1eed nh\u00e2n NUS","t":["nus"],"dt":"2010-03-29T10:30:22Z","n":"","a":"nhanitvn"},{"u":"http:\/\/trailheadapp.com\/","d":"Welcome to Trailhead!","t":["design"],"dt":"2010-03-29T10:30:22Z","n":"","a":"byaco"},{"u":"http:\/\/nlp.stanford.edu\/IR-book\/html\/htmledition\/support-vector-machines-and-machine-learning-on-documents-1.html","d":"Support vector machines and machine learning on documents","t":["SVM","machine","learning"],"dt":"2010-03-29T10:30:20Z","n":"","a":"capslockwizard"},{"u":"http:\/\/mashable.com\/2008\/07\/10\/how-to-develop-a-social-media-plan\/","d":"How to Develop a Social Media Plan for Your Business in 5 Steps","t":[],"dt":"2010-03-29T10:30:20Z","n":"","a":"goncalves.monique"},{"u":"http:\/\/www.eonet.ne.jp\/~senyou-mondai\/","d":"\u5973\u6027\u5c02\u7528\u8eca\u4e21\u306b\u53cd\u5bfe\u3059\u308b\u4f1a","t":["politics","life"],"dt":"2010-03-29T10:30:20Z","n":"","a":"Kintahakoneyama"},{"u":"http:\/\/www.bgfl.org\/bgfl\/custom\/resources_ftp\/client_ftp\/ks2\/maths\/fractions\/index.htm","d":"Fractions \u2013 A Booster Activity","t":["maths2:","topic","3,","fractions"],"dt":"2010-03-29T10:30:19Z","n":"","a":"xanny"},{"u":"http:\/\/www.webdesigncore.com\/2010\/03\/27\/22-most-unusal-google-earth-photos\/","d":"twenty two Most Uncommon Yahoo and google Earth Photos","t":["unusual","pictures","photos","Earth","world"],"dt":"2010-03-29T10:30:19Z","n":"","a":"BeachBum22"},{"u":"http:\/\/www.youtube.com\/","d":"YouTube","t":[],"dt":"2010-03-29T10:30:19Z","n":"","a":"yentldewolf"},{"u":"http:\/\/www.japantrends.com\/","d":"JAPAN TRENDS \u2013 LIVE FROM TOKYO | Marketing, Lifestyle, Fashion, Gadgets and Product Innovations","t":["japan","trends","blog"],"dt":"2010-03-29T10:30:19Z","n":"","a":"andrewjohn73"},{"u":"http:\/\/sixrevisions.com\/tutorials\/web-development-tutorials\/code-clean-professional-web-design\/","d":"Coding a Clean and Professional Web Design","t":["webdesign","tutorials"],"dt":"2010-03-29T10:30:18Z","n":"","a":"datzer0x"}