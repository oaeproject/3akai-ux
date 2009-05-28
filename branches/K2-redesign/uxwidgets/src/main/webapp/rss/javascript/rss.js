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

/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring, DOMParser */

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

	var rootel = "#" + tuid;
	var json={};
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
		if(typeof node !== "undefined"){
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
		if (current_hour < 12) {am_or_pm = "PM";} else{am_or_pm = "AM";}
		if (current_hour === 0){current_hour = 12;}
		if (current_hour > 12){current_hour = current_hour - 12;}
		
		var current_minutes = d.getMinutes() + "";
		if (current_minutes.length === 1){current_minutes = "0" + current_minutes;}
		
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
			// parse the feed-string to an xml-Object
			var xmlobject = (new DOMParser()).parseFromString(feed, "text/xml");
			// retrieve data from the xmlobject and put it in the JSON-object
			var channel = $(xmlobject).find("channel");
			rss.title = getContent(channel.find("title")[0]);
			rss.link = getContent(channel.find("link")[0]);
			rss.id = feedUrl;
			rss.description = getContent(channel.find("description")[0]);
			$(xmlobject).find("item").each(function() {
				var item = $(this);
			  	rss.items.push({
					"title" : getContent(item.find("title")[0]),
					"link" : getContent(item.find("link")[0]),
					"description" : getContent(item.find("description")[0]),
					"pubDate" : Date.parse(getContent(item.find("pubDate")[0])),
					"guid" : getContent(item.find("guid")[0]),
					"parsedDate" : formatDate(new Date(getContent(item.find("pubDate")[0])))
				});
		  });
		  return rss;
		}
		catch(ex){
			alert("Incorrect rss-feed");
		}
		return false;
	};

	/**
	 * Request a feed
	 * @param {String} url: the url for the rss-feed
	 * @param {function} The function where the response will be send to;
	 */
	var getFeed = function(url, onResponse){
			feedUrl = url;
			var oPostData = {"method" : "GET", "url" : feedUrl};
 			sdata.Ajax.request({
			url :Config.URL.PROXY_SERVICE,
			httpMethod : "POST",
			onSuccess : function(data) {
					onResponse(printFeed(data));
			},
			onFail : function(status) {
					alert("Unable to contact the rss feed.");
			},
			postData : oPostData,
			contentType : "application/x-www-form-urlencoded"
 		});
	};
	
	/**
	 * Clones an object
	 * @param {Object} object
	 */
	var cloneObject = function(object) {
		return $.extend(true, {}, object);
	};

	/**
	 * sorts an array of feeds on the pubDate;
	 * @param {Object} a
	 * @param {Object} b
	 */
	var sortByDatefunction = function(a, b){
		if(a.pubDate >  b.pubDate){
			return -1;
		}
		else if(b.pubDate >  a.pubDate){
			return 1;
		}
		return 0;
	};
	
	/**
	 * sorts an array of feeds on the source;
	 * @param {Object} a
	 * @param {Object} b
	 */
	var sortBySourcefunction =  function(a, b){
		if(a.feed.title >  b.feed.title){
			return 1;
		}
		else if(b.feed.title >  a.feed.title){
			return -1;
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
	var fillRssFeed = function(urlFeeds){
		getFeed(json.urlFeeds[json.feeds.length], function(rssFeed){
			json.feeds.push(rssFeed);
			// if not all the feeds are retrieve call this function again
			if(json.feeds.length < json.urlFeeds.length){
				fillRssFeed(json);
			}
			// if all the feed are retrieved render the rss
			else{
				$(rssFeedListContainer, rootel).html(sdata.html.Template.render(rssFeedListTemplate, json));
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
		var shownEntries = cloneObject(json);
		// only 3 entries per page
		shownEntries.entries = shownEntries.entries.splice(page*3, 3);
		
		return shownEntries.entries;
	};
	
	/**
	 * Is executed when a different page is clicked
	 * @param {Object} pageClicked
	 */
	var pagerClickHandler = function(pageClicked){
		// first get the entries that need to be shown on this page
		json.shownEntries = getShownEntries(pageClicked);
		// render these entries
		$(rssOutput, rootel).html(sdata.html.Template.render(rssOutputTemplate, json));
		// change the pageNumeber
		$(rssPager,rootel).pager({
			pagenumber: pageClicked,
			pagecount: Math.ceil(json.entries.length / 3),
			buttonClickCallback: pagerClickHandler
		});
	};
	
	/**
	 * gets the entries from all subscribed feeds
	 * @param {Object} json
	 */
	var fillRssOutput = function(json){
		// retrieve the rss-feeds
		getFeed(json.urlFeeds[json.feeds.length], function(rssFeed){
			for (var i = 0; i < rssFeed.items.length; i++) {
				// Some info needs to be shown in every entry
				rssFeed.items[i].feed = {};
				rssFeed.items[i].feed.title = rssFeed.title;
				rssFeed.items[i].feed.link = rssFeed.link;
				rssFeed.items[i].feed.id = rssFeed.id;
				rssFeed.items[i].feed.description = rssFeed.description;
				json.entries.push(rssFeed.items[i]);
			}
			json.feeds.push(rssFeed);
			// not all the feeds have been retrieved so call this function again
			if(json.feeds.length < json.urlFeeds.length){
				fillRssOutput(json);
			}
			// all the feeds have been retrieved
			else{
				// sort by date
				json.entries.sort(sortByDatefunction);
				// make sure the array only has the requesten number of entries (example : 20 latest entries)
				json.entries.splice(json.numEntries,json.entries.length - json.numEntries);
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
			json.feeds = json.feeds || [];
			$(rssTxtTitle,rootel).val(json.title);
			$(rssNumEntries,rootel).val(json.numEntries);
		 	$(rssDisplaySource, rootel).attr("checked", json.displaySource);
		 	$(rssDisplayHeadlines, rootel).attr("checked", json.displayHeadlines);
			json.feeds = [];
			fillRssFeed(json.urlFeeds);	
		}
		
	};
	
	
	/**
	 * checks if a feed is already added
	 * @param {Object} rssFeedUrl
	 */
	var checkIfRssAlreadyAdded = function(rssFeedUrl){
		json.feeds = json.feeds || [];
		for(var i = 0; i < json.feeds.length; i++){
			if($.trim(json.feeds[i].id) === $.trim(rssFeedUrl)){
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
			json.feeds = json.feeds || [];
			json.feeds.push(rssFeed);
			$(rssFeedListContainer, rootel).html(sdata.html.Template.render(rssFeedListTemplate, json));
			
		}
	};
	
	/**
	 * adds a feed to the widget
	 */
	var addRssFeed = function(){
		if(!checkIfRssAlreadyAdded($(rssTxtUrl,rootel).val())){
			getFeed($(rssTxtUrl,rootel).val(), getFeedResponse);
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
		json.feeds = json.feeds || [];
		if(json.feeds.length === 0){
			alert("You haven't added any feeds");
			return false;
		}
		json.title = $(rssTxtTitle,rootel).val();
		json.numEntries = parseInt($(rssNumEntries,rootel).val(),10);
		if((json.numEntries + "") === "NaN"){
			alert("Number of entries should be a number");
			return false;
		}
		else if(json.numEntries < 1){
			alert("Pages should be bigger then 0");
			return false;
		}
		json.displaySource =  $(rssDisplaySource, rootel).attr("checked");
		json.displayHeadlines =  $(rssDisplayHeadlines, rootel).attr("checked");
		json.urlFeeds = [];
		for(var i= 0; i< json.feeds.length;i++){
			json.urlFeeds.push(json.feeds[i].id);
		}	
		json.feeds = [];
		return json;
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
		sdata.container.informCancel(tuid);
	});
	$(rssSubmit, rootel).bind("click",function(e,ui){
		var object = getSettingsObject();
		if(object !== false){
			var tostring = sdata.JSON.stringify(object);
			var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
			sdata.widgets.WidgetPreference.save(saveUrl, "rss", tostring, sdata.container.informFinish(tuid));
		}
	});
	$(rootel + " " + rssRemove).live("click", function(e,ui){
		var index = parseInt(e.target.parentNode.id.replace(rssRemoveNoDot, ""),10);
		json.feeds.splice(index,1);
		$(rssFeedListContainer, rootel).html(sdata.html.Template.render(rssFeedListTemplate, json));
	});
	$(rootel + " " + rssOrderBySource).live("click", function(e,ui){
		json.entries.sort(sortBySourcefunction);
		pagerClickHandler(1);
	});
	$(rootel + " " + rssOrderByDate).live("click", function(e,ui){
		json.entries.sort(sortByDatefunction);
		pagerClickHandler(1);
	});
	$(rootel + " " + rssSendToFriend).live("click", function(e,ui){
		var index = parseInt(e.target.id.replace(rssSendToFriendNoDot,""),10);
		// retrieve the title and body of the entry
		var subject = json.entries[index].title;
		var body = json.entries[index].description + "\n";
		body += "read more: " + json.entries[index].link;
		// Show the sendmessage widget
		$(rssSendMessage).show();
		// initialize the sendmessage-widget
		var o = sakai.sendmessage.initialise(null, true);
		o.setSubject(subject);
		o.setBody(body);
	});


	/////////////////////////////
	// Initialisation function //
	/////////////////////////////	
	
	/**
	 * Shows or hides the settings screen
	 * @param {Object} show
	 */
	var showHideSettings = function(show){
		var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "rss") + "?sid=" + Math.random();
		if(show){
			sdata.Ajax.request({
				url: url,
				httpMethod: "GET",
				onSuccess: function(data) {
					json = json_parse(data);
					loadSettings(true);
				},
				onFail: function(status) {
					loadSettings(false);
				}
			});
		}
		else{
			$(rssSettings,rootel).hide();
			$(rssOutput,rootel).show();
			
			sdata.Ajax.request({
				url: url,
				httpMethod: "GET",
				onSuccess: function(data) {
					json = json_parse(data);
					json.entries = [];
					json.feeds = [];
					fillRssOutput(json);
				},
				onFail: function(status) {
					alert("Failed to retrieve rss feeds");
				}
			});
		}
	};
		
	showHideSettings(showSettings);
	
	// Inserts the sendmessage-widget
	sdata.widgets.WidgetLoader.insertWidgets(tuid);	
};


sdata.widgets.WidgetLoader.informOnLoad("rss");