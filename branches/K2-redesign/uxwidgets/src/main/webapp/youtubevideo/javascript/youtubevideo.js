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
/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring */

var sakai = sakai || {};

/**
 * Initialize the youtubevideo widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement The place of the widget - usualy the location of the site
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.youtubevideo = function(tuid, placement, showSettings){
	
	
    /////////////////////////////
    // Configuration variables //
    /////////////////////////////
	
	var rootel = $("#" + tuid);
	
	// Main-ids
	var youtubevideo = "#youtubevideo";
	
	// Containers
	var youtubevideoMain = youtubevideo + "_content";
	var youtubevideoSettings = youtubevideo + "_settings";
	
	var youtubevideoVideo = youtubevideo + "_video";
	var youtubevideoSettingsVideo = youtubevideo + "_videoSettings";
	var youtubevideoSettingsPage1 = youtubevideo + "_settingsPage1";
	var youtubevideoSettingsPage2 = youtubevideo + "_settingsPage2";
	
	// Textbox
	var youtubevideoUrl = youtubevideo + "_youtubeurl";
	
	// Buttons
	var youtubevideoSubmit = youtubevideo + "_savepreferences";
	var youtubevideoPreview = youtubevideo + "_preview";
	var youtubevideoBack = youtubevideo + "_back";


	//////////////////////
    // Shared functions //
    //////////////////////

	/**
	 * Displays the youtubevideo-widget
	 * @param {Object} response: the data for the youtubevideo-widget
	 * @param {Object} exists: does the video-widget exists or not
	 * @param {Object} container: the container where the output-vide or the preview-video needs to be shown
	 * @param {Object} settings: true if you need to see the settings(page1), false for the video output
	 */
	var showVideo = function(response, exists, container, settings){
		if (exists){
			try {
				// If settings is true you only need to fill in the textbox
				if(settings){
					$(youtubevideoUrl).attr("value", response);
				}
				// Else you need to load the video
				else{
					// a youtube url should look like this:
					// http://www.youtube.com/watch?v=AOWbGfPU5uQ&feature=fvst, you need to get the id (v=)
					// make an object of a the queryString
					var qs = new Querystring(response.split("?")[1]);
					// get the id (default false)
					var id = qs.get("v",false);
					// if the id is false, give a warning the the user
					if (id === false){
						$(container, rootel).text("No valid video found");
					} 
					// show the video
					else {
						$(container, rootel).html('<object width="425" height="344"><param name="movie" value="http://www.youtube.com/v/' + id + '&hl=en&fs=1"></param><param name="allowFullScreen" value="true"></param><embed src="http://www.youtube.com/v/' + id + '&hl=en&fs=1" type="application/x-shockwave-flash" allowfullscreen="true" width="425" height="344"></embed></object>');
					}
				}
				
			} catch (err){
				// If anything goes wrong during this function, the url wasn't valid
				$(container, rootel).text("No valid video found");
			}
		} else {
			// The requested data wsn't found in JCR
			$(container, rootel).text("No video found");
		}
	};


    ////////////////////////
    // Settings functions //
    ////////////////////////

	/**
	 * Saves the settings
	 */
	var saveNewSettings = function(){
		var val = $(youtubevideoUrl ,rootel).attr("value");
	 	var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
		sdata.widgets.WidgetPreference.save(saveUrl, "youtubeurl", val, sdata.container.informFinish(tuid));
	};
	/**
	 * Shows the preview of the video
	 */
	var showPreview = function(){
		var val = $(youtubevideoUrl,rootel).attr("value");
		// Go to a different page
		$(youtubevideoSettingsPage1, rootel).hide();
		$(youtubevideoSettingsPage2, rootel).show();
		showVideo(val, true, youtubevideoSettingsVideo, false);
	};

	
    ////////////////////
    // Event Handlers //
    ////////////////////
	
	/** Binds the submit button */
	$(youtubevideoSubmit, rootel).bind("click",function(e,ui){
		saveNewSettings();
	});
	/** Binds the preview button */
	$(youtubevideoPreview, rootel).bind("click",function(e,ui){
		showPreview();
	});
	/** Binds the back button */
	$(youtubevideoBack, rootel).bind("click",function(e,ui){
		// Change the page
		$(youtubevideoSettingsPage2, rootel).hide();
		$(youtubevideoSettingsPage1, rootel).show();
	});


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////
	
	/**
	 * Retrieves the youtubevideo-widget data and display's it
	 * @param {Object} settings
	 */
	var displayYouTubeVideo = function(settings){
		var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "youtubeurl") + "?sid=" + Math.random();
		sdata.Ajax.request({
			url :url,
			httpMethod : "GET",
			onSuccess : function(data) {
				showVideo(data,true, youtubevideoVideo, settings);
			},
			onFail : function(status) {
				showVideo(status,false, youtubevideoVideo, settings);
			}
		});
	};
	
	if (showSettings){
		$(youtubevideoMain, rootel).hide();
		$(youtubevideoSettings, rootel).show();
	} else {
		$(youtubevideoSettings, rootel).hide();
		$(youtubevideoMain, rootel).show();
	}
	displayYouTubeVideo(showSettings);
};

sdata.widgets.WidgetLoader.informOnLoad("youtubevideo");