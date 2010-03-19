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

/*global $, Config, sdata, Querystring, DOMParser */

var sakai = sakai || {};

/**
 * Initialize the rss widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.rss = function(tuid, placement, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    Config.URL.PROXY_RSS = "/var/proxy/rss.xml?rss=";

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

    // Buttons
    var rssAddUrl = rssClass + "_settings_btnAddUrl";
    var rssCancel = rssId + "_setting_cancel";
    var rssSubmit = rssId + "_setting_finish";
    var rssRemove = rssClass + "_settings_removeFeed";
    var rssOrderBySource = rssId + "_output_order_source";
    var rssOrderByDate = rssId + "_output_order_date";
    var rssSendToFriend = rssClass + "_sendToFriend";

    //Buttons (no dot)
    var rssRemoveNoDot = rssName + "_settings_removeFeed";
    var rssSendToFriendNoDot = rssName + "_sendToFriend";


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
     * Formats a dateobject to
     * @param {Object} date-object
     * @return {String} date in the following format: 20/3/2009 10:20 AM
     */
    var formatDate = function(d){
        var am_or_pm = "";

        var current_hour = d.getHours();
        if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
        if (current_hour === 0){current_hour = 12;}
        if (current_hour > 12){current_hour = current_hour - 12;}

        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1){current_minutes = "0" + current_minutes;}
        // make a string out of a date in the correct format
        return(d.getDate() + "/" + (d.getMonth() + 1) + "/" +  d.getFullYear() + " " + current_hour + ":" + current_minutes +  " " + am_or_pm);
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
            rss.title = getContent(channel.find("title")[0]);
            rss.link = getContent(channel.find("link")[0]);
            rss.id = feedUrl;
            rss.description = getContent(channel.find("description")[0]);
            $(xmlobject).find("item").each(function() {
                var item = $(this);
                var parsedDate = "";
                if (item.find("pubDate")[0]){
                    parsedDate = formatDate(new Date(getContent(item.find("pubDate")[0])));
                }
                  rss.items.push({
                    "title" : getContent(item.find("title")[0]),
                    "link" : getContent(item.find("link")[0]),
                    "description" : getContent(item.find("description")[0]),
                    "pubDate" : Date.parse(getContent(item.find("pubDate")[0])),
                    "guid" : getContent(item.find("guid")[0]),
                    "parsedDate" : parsedDate
                });
          });
          return rss;
        }
        catch(ex){
            alert("Incorrect rss-feed");
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
           url : Config.URL.PROXY_RSS +  url,
           type : "GET",
           success : function(data) {
                   onResponse(printFeed(data));
           },
           error: function(xhr, textStatus, thrownError) {
                   alert("Unable to connect to the rss feed.");
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
     * sorts an array of feeds on the pubDate, this can be used with the javascript sort function
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
    var pagerClickHandler = function(pageClicked){
        // first get the entries that need to be shown on this page
        resultJSON.shownEntries = getShownEntries(pageClicked);
        // render these entries
        $(rssOutput, rootel).html($.TemplateRenderer(rssOutputTemplate, resultJSON));
        // change the pageNumeber
        $(rssPager,rootel).pager({
            pagenumber: pageClicked,
            pagecount: Math.ceil(resultJSON.entries.length / 3),
            buttonClickCallback: pagerClickHandler
        });
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
            if($.trim(resultJSON.feeds[i].id) === $.trim(rssFeedUrl)){
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
                $(rssFeedListContainer, rootel).html($.TemplateRenderer(rssFeedListTemplate, resultJSON));
            });
        }
    };

    /**
     * adds a feed to the widget
     */
    var addRssFeed = function(){
        var rssURL = $(rssTxtUrl,rootel).val().replace('http://','');
        if(!checkIfRssAlreadyAdded(rssURL)){
            getFeed(rssURL, getFeedResponse);
        }
        else{
            alert("This rss-feed is already added to the widget");
        }
        $(rssTxtUrl,rootel).val("");
    };

    /**
     * gets the settings object
     */
    var getSettingsObject = function(){
        resultJSON.feeds = resultJSON.feeds || [];
        if(resultJSON.feeds.length === 0){
            alert("You haven't added any feeds");
            return false;
        }
        resultJSON.title = $(rssTxtTitle,rootel).val();
        resultJSON.numEntries = parseInt($(rssNumEntries,rootel).val(),10);
        if((resultJSON.numEntries + "") === "NaN"){
            alert("Number of entries should be a number");
            return false;
        }
        else if(resultJSON.numEntries < 1){
            alert("Pages should be bigger then 0");
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


    ////////////////////
    // Event Handlers //
    ////////////////////

    $(rssAddUrl,rootel).bind("click", function(e, ui){
        addRssFeed();
    });
    $(rssTxtUrl, rootel).bind("keydown", function(e, ui) {
        if (e.keyCode === 13) {
            addRssFeed();
        }
    });
    $(rssCancel, rootel).bind("click",function(e,ui){
        sdata.container.informCancel(tuid, "rss");
    });
    $(rssSubmit, rootel).bind("click",function(e,ui){
        var object = getSettingsObject();
        if(object !== false){
            var tostring = $.toJSON(object);
            var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
            sdata.widgets.WidgetPreference.save(saveUrl, "rss", tostring, function(){
                if ($(".sakai_dashboard_page").is(":visible")) {
                    showSettings = false;
                    showHideSettings(showSettings);
                }
                else {
                    sdata.container.informFinish(tuid);
                }
            });
        }
    });

    $(rssSendToFriend, rootel).live("click", function(e, ui){
        var index = parseInt(e.target.id.replace(rssSendToFriendNoDot, ""), 10);
        // retrieve the title and body of the entry
        var subject = resultJSON.entries[index].title;
        var body = resultJSON.entries[index].description + "\n";
        body += "read more: " + resultJSON.entries[index].link;
        // Show the sendmessage widget
        //$(rssSendMessage).show();
        // initialize the sendmessage-widget
        var o = sakai.sendmessage.initialise(null, true, false);
        o.setSubject(subject);
        o.setBody(body);
    });

    $(rootel + " " + rssOrderBySource).bind("click", function(e,ui){
        if (currentSort === "sourceD"){
            currentSort = "sourceA";
        } else {
            currentSort = "sourceD";
        }
        resultJSON.entries.sort(sortBySourcefunction);
        pagerClickHandler(1);
    });
    $(rootel + " " + rssOrderByDate).bind("click", function(e,ui){
        if (currentSort === "dateD"){
            currentSort = "dateA";
        } else {
            currentSort = "dateD";
        }
        resultJSON.entries.sort(sortByDatefunction);
        pagerClickHandler(1);
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Shows or hides the settings screen
     * @param {Object} show
     */
    var showHideSettings = function(show){
        var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "rss");
        if(show){
            $.ajax({
                url: url,
                cache: false,
                success: function(data) {
                    resultJSON = $.evalJSON(data);
                    loadSettings(true);
                },
                error: function(xhr, textStatus, thrownError) {
                    loadSettings(false);
                }
            });
        }
        else{
            $(rssSettings,rootel).hide();
            $(rssOutput,rootel).show();

            $.ajax({
                url: url,
                cache: false,
                success: function(data) {
                    resultJSON = $.evalJSON(data);
                    resultJSON.entries = [];
                    resultJSON.feeds = [];
                    fillRssOutput();
                },
                error: function(xhr, textStatus, thrownError) {
                    $("#rss_no_feeds").show();

                }
            });
        }
    };

    showHideSettings(showSettings);

    // Inserts the sendmessage-widget
    sdata.widgets.WidgetLoader.insertWidgets(tuid);
};


sdata.widgets.WidgetLoader.informOnLoad("rss");
