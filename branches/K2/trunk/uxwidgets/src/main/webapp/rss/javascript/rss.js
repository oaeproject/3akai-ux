var sakai = sakai || {};
var $ = $ ||
function() {
    throw "JQuery undefined";
};
var sdata = sdata ||
function() {
    throw "sdata undefined";
};
var json_parse = json_parse || 
function(){
	throw "json_parse undefined";
};
var DOMParser = DOMParser || 
function(){
	throw "DOMParser undefined";
};


sakai.getRssFeed = function(){

	
	var feedUrl = "";
	
	/**
	 * Gets the content of an xml node
	 * return "" if undefined
	 * @param {Object} node
	 */
	var getContent = function(node){
		if(typeof node !== "undefined"){
			return node.textContent;
		}
		return "";
	};
	/**
	 * Formats a dateobject to
	 * 20/3/2009 10:20 AM
	 * @param {Object} d
	 */
	var formatDate = function(d){
		var am_or_pm = "";
		
		var current_hour = d.getHours();
		if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
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
			var rss = {"items" : []};
			var xmlobject = (new DOMParser()).parseFromString(feed, "text/xml");
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
	
	return{
		/**
		 * gets the json-object of a feed
		 * @param {Object} url to the feed
		 * @param {Object} onResponse, function that catches the feed object
		 */
		getFeed : function(url, onResponse){
			feedUrl = url;
			var oPostData = {"method" : "GET", "url" : feedUrl};
 			sdata.Ajax.request({
            url :"/proxy/proxy",
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
		}
	};
	
	
};

sakai.rss = function(tuid, placement, showSettings){
	var rootel = "#" + tuid;
	var json={};
	
	/**
	 * Is executed when a feed responses
	 * @param {Object} rssFeed
	 */
	var getFeedResponseOutput = function(rssFeed){
		if(rssFeed !== false){
			json.feeds = json.feeds || [];
			json.feeds.push(rssFeed);
			$("#rss_settings_rssFeedList", rootel).html(sdata.html.Template.render('rss_settings_rssFeedListTemplate', json));
		}
	};
	/**
	 * Clones an object
	 * @param {Object} object
	 */
	var cloneObject = function(object) {
        var clonedObject = {};
        $.extend(clonedObject, object);
        return clonedObject;
    };
	/**
	 * returns an array of all the entries that are shown on this page
	 * @param {Object} page
	 */
	var getShownEntries = function(page){
		page= page -1;
		var shownEntries = [];
		
		for(var i=(page*3);i< ((page*3)+3) && i< json.entries.length; i++){
			shownEntries.push(json.entries[i]);
		}
		return shownEntries;
	};
	
	/**
	 * Is executed when a different page is clicked
	 * @param {Object} pageClicked
	 */
	var pagerClickHandler = function(pageClicked){
		json.shownEntries = getShownEntries(pageClicked);
				$("#rss_output", rootel).html(sdata.html.Template.render('rss_output_template', json));
				$(".rss_jq_pager",rootel).pager({
                            pagenumber: pageClicked,
                            pagecount: Math.ceil(json.entries.length / 3),
                            buttonClickCallback: pagerClickHandler
                });
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
	
	/**
	 * gets the rntries from all subscribed feeds
	 * @param {Object} json
	 */
	var fillRssOutput = function(json){
		sakai.getRssFeed().getFeed(json.urlFeeds[json.feeds.length], function(rssFeed){
			for (var i = 0; i < rssFeed.items.length; i++) {
				rssFeed.items[i].feed = {};
				rssFeed.items[i].feed.title = rssFeed.title;
				rssFeed.items[i].feed.link = rssFeed.link;
				rssFeed.items[i].feed.id = rssFeed.id;
				rssFeed.items[i].feed.description = rssFeed.description;
				json.entries.push(rssFeed.items[i]);
			}
			json.feeds.push(rssFeed);
			if(json.feeds.length < json.urlFeeds.length){
				fillRssOutput(json);
			}
			else{
				json.entries.sort(sortByDatefunction);
				json.entries.splice(json.numEntries,json.entries.length - json.numEntries);
				pagerClickHandler(1);
			}
		});
	};
	
	/**
	 * gets al the feeds and puts the in the settings list
	 * @param {Object} urlFeeds
	 */
	var fillRssFeed = function(urlFeeds){
		sakai.getRssFeed().getFeed(json.urlFeeds[json.feeds.length], function(rssFeed){
			json.feeds.push(rssFeed);
			if(json.feeds.length < json.urlFeeds.length){
				fillRssFeed(json);
			}
			else{
				$("#rss_settings_rssFeedList", rootel).html(sdata.html.Template.render('rss_settings_rssFeedListTemplate', json));
			}		
		});
	};
	
	/**
	 * Loads the settings screen
	 * @param {Object} exists
	 */
	var loadSettings = function(exists){
		$("#rss_output",rootel).hide();
		$("#rss_settings",rootel).show();
		
		if(exists){
			json.feeds = json.feeds || [];
			$("#rss_settings_txtTitle",rootel).val(json.title);
			$("#rss_settings_numEntries",rootel).val(json.numEntries);
		 	$('#rss_setting_displaySource', rootel).attr("checked", json.displaySource);
		 	$('#rss_setting_displayHeadlines', rootel).attr("checked", json.displayHeadlines);
			json.feeds = [];
			fillRssFeed(json.urlFeeds);	
		}
		
	};
	
	/**
	 * Shows or hides the settings screen
	 * @param {Object} show
	 */
	var showHideSettings = function(show){
		if(show){
			sdata.Ajax.request({
	            url: "/sdata/f/" + placement + "/" + tuid + "/rss?sid=" + Math.random(),
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
			$("#rss_settings",rootel).hide();
			$("#rss_output",rootel).show();
			
			sdata.Ajax.request({
	            url: "/sdata/f/" + placement + "/" + tuid + "/rss?sid=" + Math.random(),
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
	
	/**
	 * checks if a feed is already added
	 * @param {Object} rssFeedUrl
	 */
	var checkIfRssAlreadyAdded = function(rssFeedUrl){
		json.feeds = json.feeds || [];
		for(var i = 0; i < json.feeds.length; i++){
			if(json.feeds[i].id === rssFeedUrl){
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
			$("#rss_settings_rssFeedList", rootel).html(sdata.html.Template.render('rss_settings_rssFeedListTemplate', json));
			
		}
	};
	
	/**
	 * adds a feed to the widget
	 */
	var addRssFeed = function(){
		if(!checkIfRssAlreadyAdded($("#rss_settings_txtUrl",rootel).val())){
			sakai.getRssFeed().getFeed($("#rss_settings_txtUrl",rootel).val(), getFeedResponse);
		}
		else{
			alert("This rss-feed is already added to the widget");
		}
		$("#rss_settings_txtUrl",rootel).val("");
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
		json.title = $("#rss_settings_txtTitle",rootel).val();
		json.numEntries = parseInt($("#rss_settings_numEntries",rootel).val(),10);
		if((json.numEntries + "") === "NaN"){
			alert("Number of entries should be a number");
			return false;
		}
		json.displaySource =  $('#rss_setting_displaySource', rootel).attr("checked");
		json.displayHeadlines =  $('#rss_setting_displayHeadlines', rootel).attr("checked");
		json.urlFeeds = [];
		for(var i= 0; i< json.feeds.length;i++){
			json.urlFeeds.push(json.feeds[i].id);
		}	
		json.feeds = [];
		return json;
	};
	
		
	
	$(".rss_settings_btnAddUrl",rootel).bind("click", function(e, ui){
		addRssFeed();
	});
	 $("#rss_settings_txtUrl", rootel).bind("keydown",
        function(e, ui) {
            if (e.keyCode === 13) {
               addRssFeed();
        }
    });
	$("#rss_setting_cancel", rootel).bind("click",function(e,ui){
		sdata.container.informCancel(tuid);
	});
	var finishNewSettings = function() {
        sdata.container.informFinish(tuid);
    };
	$("#rss_setting_finish", rootel).bind("click",function(e,ui){
		var object = getSettingsObject();
		if(object !== false){
			var tostring = sdata.JSON.stringify(object);
    		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "rss", tostring, finishNewSettings);
		}
	});
	$(rootel + " .rss_settings_removeFeed").live("click", function(e,ui){
		var index = parseInt(e.target.parentNode.id.replace("rss_settings_removeFeed", ""),10);
		json.feeds.splice(index,1);
		$("#rss_settings_rssFeedList", rootel).html(sdata.html.Template.render('rss_settings_rssFeedListTemplate', json));
	});
	$(rootel + " #rss_output_order_source").live("click", function(e,ui){
		json.entries.sort(sortBySourcefunction);
		pagerClickHandler(1);
	});
	$(rootel + " #rss_output_order_date").live("click", function(e,ui){
		json.entries.sort(sortByDatefunction);
		pagerClickHandler(1);
	});
	$(rootel + " .rss_sendToFriend").live("click", function(e,ui){
		var index = parseInt(e.target.id.replace("rss_sendToFriend",""),10);
		
	})
	
};


sdata.widgets.WidgetLoader.informOnLoad("rss");