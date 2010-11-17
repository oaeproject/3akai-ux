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

/*global $, Config, Querystring, DOMParser */

var sakai = sakai || {};

/**
 * @name sakai.rss
 *
 * @class rss
 *
 * @description
 * Initialize the rss widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.rss = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    sakai.config.URL.PROXY_RSS = "/var/proxy/rss.xml?rss=";

    var rootel = "#" + tuid;
    var resultJSON={};
    var feedUrl = "";

    // Main ids
    var rssId= "#rss";
    var rssName= "rss";
    var rssClass= ".rss";

    // Containers
    var rssFeedListContainer = rssId + "_settings_rssFeedList";
    var rssOutput = rssId + "_output";
    var rssSettings = rssId + "_settings";
    var rssSendMessage = rssId + "_sendmessagecontainer";

    // Textboxes
    var rssTxtTitle = rssId + "_settings_txtTitle";
    var rssNumEntries = rssId + "_settings_numEntries";
    var rssTxtUrl = rssId + "_settings_txtUrl";

    // Checkboxes
    var rssDisplaySource = rssId + "_setting_displaySource";
    var rssDisplayHeadlines = rssId + "_setting_displayHeadlines";

    // Templates
    var rssFeedListTemplate = rssName + "_settings_rssFeedListTemplate";
    var rssOutputTemplate = rssName + "_output_template";

    // Paging
    var rssPager = rssClass + "_jq_pager";
    var pageClicked = 1;

    // Buttons
    var rssAddUrl = rssClass + "_settings_btnAddUrl";
    var rssCancel = rssId + "_setting_cancel";
    var rssSubmit = rssId + "_setting_finish";
    var rssRemove = rssClass + "_settings_removeFeed";
    var rssOrderBySource = rssId + "_output_order_source";
    var rssOrderByDate = rssId + "_output_order_date";
    var rssSendToFriend = rssClass + "_sendToFriend";
    var rssRemoveFeed = "#rss_settings_removeFeed";

    // Buttons (no dot)
    var rssRemoveNoDot = rssName + "_settings_removeFeed";
    var rssSendToFriendNoDot = rssName + "_sendToFriend";

    // Messages
    var rssCannotConnectToRssFeed = "#rss_cannot_connect_to_rss_feed";
    var rssFeedAlreadyEntered = "#rss_feed_already_entered";
    var rssPasteValidRssAddress = "#rss_paste_valid_rss_address";
    var rssIncorrectRssFeed = "#rss_incorrect_rss_feed";
    var rssUnableToConnect = "#rss_unable_to_connect";
    var rssFeedAlreadyAdded = "#rss_feed_already_added";
    var rssNumberOfItemsShouldBeNumber = "#rss_number_of_items_should_be_number";
    var rssPagesShouldBeBiggerThan = "#rss_pages_should_be_bigger_than";
    var rssAddedNoFeeds = "#rss_added_no_feeds";


    ////////////////////
    // Event Handlers //
    ////////////////////
    var addBinding = function(){
        $(rssAddUrl,rootel).bind("click", function(e, ui){
            addRssFeed();
        });
        $(rssTxtUrl, rootel).bind("keydown", function(e, ui) {
            if (e.keyCode === 13) {
                addRssFeed();
            }
        });
        $(rssCancel, rootel).bind("click",function(e,ui){
            sakai.api.Widgets.Container.informCancel(tuid, "rss");
        });
        $(rssSubmit, rootel).bind("click",function(e,ui){
            var object = getSettingsObject();
            if(object !== false){
                sakai.api.Widgets.saveWidgetData(tuid, object, function(success, data){
                    if ($(".sakai_dashboard_page").is(":visible")) {
                        showSettings = false;
                        showHideSettings(showSettings);
                    }
                    else {
                        sakai.api.Widgets.Container.informFinish(tuid, "rss");
                    }
                });
            }
        });

        $(rssSendToFriend, rootel).bind("click", function(e, ui){
            var index = parseInt(e.target.id.replace(rssSendToFriendNoDot, ""), 10);
            // retrieve the title and body of the entry
            var subject = resultJSON.entries[((pageClicked - 1) * 3) + index].title;
            var body = resultJSON.entries[((pageClicked - 1) * 3) + index].description + "\n";
            body += "read more: " + resultJSON.entries[((pageClicked - 1) * 3) + index].link;
            // initialize the sendmessage-widget
            var o = sakai.sendmessage.initialise(null, true, false);
            o.setSubject(subject);
            o.setBody(body);
        });

        $(rootel + " " + rssOrderBySource).bind("click", function(e, ui){
            if (currentSort === "sourceD") {
                currentSort = "sourceA";
            }
            else {
                currentSort = "sourceD";
            }
            resultJSON.entries.sort(sortBySourcefunction);
            pagerClickHandler(1);
        });
        $(rootel + " " + rssOrderByDate).bind("click", function(e, ui){
            if (currentSort === "dateD") {
                currentSort = "dateA";
            }
            else {
                currentSort = "dateD";
            }
            resultJSON.entries.sort(sortByDatefunction);
            pagerClickHandler(1);
        });
    };


    ////////////////////////
    // Utility  functions //
    ////////////////////////

    /**
     * Gets the content of an xml node
     * return "" if undefined
     * @param {XMLNode} node
     */
    var getContent = function(node){
        // checks if the node isn't undefined
        if(node){
            return node.textContent;
        }
        return "";
    };

    /**
     * converts the xml-feed to a json-object
     * @param {Object} feed
     */
    var printFeed = function(feed){

        try{

            // Make the json-object where the rss-data will be saved
            var rss = {"items" : []};
            var xmlobject = feed;

            // retrieve data from the xmlobject and put it in the JSON-object
            var channel = $(xmlobject).find("channel");

            // put all the nodes in JSON-props
            rss.title = $("title",channel).text();
            rss.link = $("link",channel).text();
            rss.id = feedUrl;
            rss.description = $("description",channel).text();
            $(xmlobject).find("item").each(function() {
                var item = $(this);
                var pubDate = "";
                var timeNow = new Date();
                var parseDate = formatDate(timeNow);
                if ($("pubDate",item).length > 0){

                    // We have to parse the RFC 822 date to help IE understand it, as it is something dodgy there...
                    pubDate = sakai.api.l10n.transformDateTimeShort(sakai.api.Util.parseRFC822Date($("pubDate",item).text()));

                }
                  rss.items.push({
                    "title" : $("title",item).text(),
                    "link" : $("link",item).text(),
                    "description" : $("description",item).text(),
                    "pubDate" : pubDate,
                    "guid" : $("guid",item).text(),
                    "parsedDate" : parseDate
                });
          });
          return rss;
        }
        catch(ex){
            sakai.api.Util.notification.show($(rssIncorrectRssFeed).html(), $(rssPasteValidRssAddress).html());
        }
        // return false if some kind of error occured
        // this will be mostly rss format errors and will also work as a tester to see if the rss format is correct
        return false;
    };

    /**
     * Request a feed
     * @param {String} url: the url for the rss-feed
     * @param {function} The function where the response will be send to;
     */
    var getFeed = function(url, onResponse){
        // put the url to a module variable
        // later on this will also be added to the json-object
        // See if we have http:// in url
        if (url.search("http://") === -1) {
            url = "http://" + url;
        }

        feedUrl = url;

        $.ajax({
           url : sakai.config.URL.PROXY_RSS +  url,
           type : "GET",
           success : function(data) {
                onResponse(printFeed(data));
           },
           error: function(xhr, textStatus, thrownError) {
               sakai.api.Util.notification.show($(rssUnableToConnect).html(), $(rssCannotConnectToRssFeed).html());
           }
        });
    };

    /**
     * Clones an object
     * @param {Object} object
     */
    var cloneObject = function(object) {
        return $.extend(true, {}, object);
    };

    var currentSort = "dateA";

    /**
     * sorts an array of feeds on the pubDate, this can be used with the JavaScript sort function
     * @param {Object} a
     * @param {Object} b
     */
    var sortByDatefunction = function(a, b){

        var ret = -1;
        if (currentSort === "dateD") {
            ret = 1;
        }

        if(a.pubDate >  b.pubDate){
            return ret;
        }
        else if(b.pubDate >  a.pubDate){
            return -(ret);
        }
        return 0;
    };

    /**
     * sorts an array of feeds on the source, this can be used with the javascript sort function
     * @param {Object} a
     * @param {Object} b
     */
    var sortBySourcefunction =  function(a, b){

        var ret = -1;
        if (currentSort === "sourceD"){
            ret = 1;
        }

        if(a.feed.title >  b.feed.title){
            return -(ret);
        }
        else if(b.feed.title >  a.feed.title){
            return ret;
        }
        return 0;
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * gets al the feeds and puts the in the settings list
     * @param {Object} urlFeeds
     */
    var fillRssFeed = function(){
        getFeed(resultJSON.urlFeeds[resultJSON.feeds.length], function(rssFeed){
            resultJSON.feeds.push(rssFeed);
            // if not all the feeds are retrieve call this function again
            if(resultJSON.feeds.length < resultJSON.urlFeeds.length){
                fillRssFeed();
            }
            // if all the feed are retrieved render the rss
            else{
                $(rssFeedListContainer, rootel).html($.TemplateRenderer(rssFeedListTemplate, resultJSON));
                $(rootel + " " + rssRemove).bind("click", function(e,ui){
                    var index = parseInt(e.target.parentNode.id.replace(rssRemoveNoDot, ""),10);
                    resultJSON.feeds.splice(index,1);
                    $(rssRemoveFeed + index).parent().remove();
                });
            }
        });
    };


    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * returns an array of all the entries that are shown on this pagenumber
     * @param {int} pagenumber
     * @return {array} entries
     */
    var getShownEntries = function(page){
        page = page-1;
        // if you don't make a clone, the splice-method will also remove entries form the original JSON-object
        var shownEntries = cloneObject(resultJSON);
        // only 3 entries per page
        shownEntries.entries = shownEntries.entries.splice(page*3, 3);

        return shownEntries.entries;
    };

    /**
     * Is executed when the user navigates to a different page in the rss widget
     * Will the entries of the page where the user is currently at,
     * and connects the pager again
     * @param {Object} pageClicked
     */
    var pagerClickHandler = function(clicked){
        pageClicked = parseInt(clicked, 10);
        // first get the entries that need to be shown on this page
        resultJSON.shownEntries = getShownEntries(clicked);
        // render these entries
        $(rssOutput, rootel).html($.TemplateRenderer(rssOutputTemplate, resultJSON));
        // change the pageNumeber
        $(rssPager,rootel).pager({
            pagenumber: clicked,
            pagecount: Math.ceil(resultJSON.entries.length / 3),
            buttonClickCallback: pagerClickHandler
        });
        addBinding();
    };

    /**
     * gets the entries from all subscribed feeds
     * @param {Object} json
     */
    var fillRssOutput = function(){
        // retrieve the rss-feeds
        getFeed(resultJSON.urlFeeds[resultJSON.feeds.length], function(rssFeed){
            for (var i = 0; i < rssFeed.items.length; i++) {
                // Some info needs to be shown in every entry
                rssFeed.items[i].feed = {};
                rssFeed.items[i].feed.title = rssFeed.title;
                rssFeed.items[i].feed.link = rssFeed.link;
                rssFeed.items[i].feed.id = rssFeed.id;
                rssFeed.items[i].feed.description = rssFeed.description;
                resultJSON.entries.push(rssFeed.items[i]);
            }
            resultJSON.feeds.push(rssFeed);
            // not all the feeds have been retrieved so call this function again
            if(resultJSON.feeds.length < resultJSON.urlFeeds.length){
                fillRssOutput();
            }
            // all the feeds have been retrieved
            else{
                // sort by date
                resultJSON.entries.sort(sortByDatefunction);
                // make sure the array only has the requesten number of entries (example : 20 latest entries)
                resultJSON.entries.splice(resultJSON.numEntries,resultJSON.entries.length - resultJSON.numEntries);
                // show the first page only
                pagerClickHandler(1);
            }
        });
    };


    /**
     * Loads the settings screen
     * @param {Object} exists
     */
    var loadSettings = function(exists){
        $(rssOutput,rootel).hide();
        $(rssSettings,rootel).show();

        if(exists){
            resultJSON.feeds = resultJSON.feeds || [];
            $(rssTxtTitle,rootel).val(resultJSON.title);
            $(rssNumEntries,rootel).val(resultJSON.numEntries);
            $(rssDisplaySource, rootel).attr("checked", resultJSON.displaySource);
            $(rssDisplayHeadlines, rootel).attr("checked", resultJSON.displayHeadlines);
            resultJSON.feeds = [];
            fillRssFeed(resultJSON.urlFeeds);
        }

    };


    /**
     * checks if a feed is already added
     * @param {Object} rssFeedUrl
     */
    var checkIfRssAlreadyAdded = function(rssFeedUrl){
        resultJSON.feeds = resultJSON.feeds || [];
        for(var i = 0; i < resultJSON.feeds.length; i++){
            if($.trim(resultJSON.feeds[i].id).replace("http://", "") === $.trim(rssFeedUrl)){
                return true;
            }
        }
        return false;
    };
    /**
     * executed when feed-request responses
     * @param {Object} rssFeed
     */
    var getFeedResponse = function(rssFeed){
        if(rssFeed !== false){
            resultJSON.feeds = resultJSON.feeds || [];
            resultJSON.feeds.push(rssFeed);
            $(rssFeedListContainer, rootel).html($.TemplateRenderer(rssFeedListTemplate, resultJSON));
            $(rootel + " " + rssRemove).bind("click", function(e,ui){
                var index = parseInt(e.target.parentNode.id.replace(rssRemoveNoDot, ""),10);
                resultJSON.feeds.splice(index,1);
                $(rssRemoveFeed + index).parent().remove();
            });
        }
    };

    /**
     * adds a feed to the widget
     */
    var addRssFeed = function(){
        var rssURL = $(rssTxtUrl,rootel).val().replace("http://","");
        if(!checkIfRssAlreadyAdded(rssURL)){
            getFeed(rssURL, getFeedResponse);
        }
        else{
            sakai.api.Util.notification.show($(rssFeedAlreadyAdded).html(), $(rssFeedAlreadyEntered).html());
        }
        $(rssTxtUrl,rootel).val("");
    };

    /**
     * gets the settings object
     */
    var getSettingsObject = function(){
        resultJSON.feeds = resultJSON.feeds || [];
        if(resultJSON.feeds.length === 0){
            sakai.api.Util.notification.show("", $(rssPasteValidRssAddress).html());
            return false;
        }
        resultJSON.title = $(rssTxtTitle,rootel).val();
        resultJSON.numEntries = parseInt($(rssNumEntries,rootel).val(),10);
        if((resultJSON.numEntries + "") === "NaN"){
            sakai.api.Util.notification.show("", $(rssNumberOfItemsShouldBeNumber).html());
            return false;
        }
        else if(resultJSON.numEntries < 1){
            sakai.api.Util.notification.show("", $(rssPagesShouldBeBiggerThan).html() + resultJSON.numEntries);
            return false;
        }
        resultJSON.displaySource =  $(rssDisplaySource, rootel).attr("checked");
        resultJSON.displayHeadlines =  $(rssDisplayHeadlines, rootel).attr("checked");
        resultJSON.urlFeeds = [];
        for(var i= 0; i< resultJSON.feeds.length;i++){
            resultJSON.urlFeeds.push(resultJSON.feeds[i].id);
        }
        resultJSON.feeds = [];
        return resultJSON;
    };


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Shows or hides the settings screen
     * @param {Object} show
     */
    var showHideSettings = function(show){

        if(show){

            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    resultJSON = data;
                    loadSettings(true);
                } else {
                    loadSettings(false);
                }
            });

        }
        else{
            $(rssSettings,rootel).hide();
            $(rssOutput,rootel).show();

            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    resultJSON = data;
                    resultJSON.entries = [];
                    resultJSON.feeds = [];
                    fillRssOutput();
                } else {
                    $("#rss_no_feeds").show();
                }
            });
        }
    };

    showHideSettings(showSettings);

    addBinding();

    // Inserts the sendmessage-widget
    sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
};


sakai.api.Widgets.widgetLoader.informOnLoad("rss");
