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

/*global $, Config, jQuery, sakai, sdata */

sakai.sites = function(tuid,placement,showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var rootel = $("#" + tuid);

	// IDs
	var sitesMainContainer = "#mainSitesContainer";
	var sitesList = "#sites_list";
	var sitesListTemplate = "#sites_list_template";
	var sitesErrorNoSites = "#sites_error_nosites";
	var sitesErrorNoSettings = "#sites_error_nosettings";
	var sitesCreateNewSite = "#create_new_site_link";	
	var createSiteContainer = "#createsitecontainer";


	///////////////////////
	// Utility functions //
	///////////////////////

	/**
	 * Compare the names of 2 objects
	 * @param {Object} a
	 * @param {Object} b
	 * @return 1, 0 or -1
	 */
	var doSort = function(a,b){
		if (a.name > b.name) {
			return 1;
		} else if (a.name === b.name) {
			return 0;
		} else {
			return -1;
		}
	};

	/**
	 * Show the popup to create a new site.
	 */
	var createNewSite = function(){
		$(createSiteContainer, rootel).show();
		
		// Load the createsite widget.
		sakai.createsite.initialise();
	};
	
	/**
	 * Takes a set of json and renders the sites.
	 * @param {Object} newjson
	 */
	var doRender = function(newjson){
		for (var i = 0; i < newjson.entry.length; i++){
			newjson.entry[i].location = newjson.entry[i].location.substring(1);
		}
		
		// If the user is not registered for any sites, show the no sites error.
		if (newjson.entry.length === 0){
			$(sitesList, rootel).html($(sitesErrorNoSites).text());
		} 
		else {
			// Sort the sites by their name
			newjson.entry = newjson.entry.sort(doSort);
			$(sitesList, rootel).html($.Template.render(sitesListTemplate.replace(/#/,''), newjson));
		}
	};
	
	/**
	 * Takes the json info from the server places it in a useable format and execute the doRender method
	 * @param {Object} response	response from the server
	 * @param {Boolean} succes did the request succeed or did it fail.
	 */
	var loadSiteList = function(response, succes){
		// Check if the request was ok
		if (succes) {
			var json = $.evalJSON(response);
			var newjson = {};
			newjson.entry = [];
			// If the response contained any entries.
			if (json.entry) {
				for (var i = 0; i < json.entry.length; i++) {
					var site = json.entry[i];
					// If this is a valid site
					if (site.id.substring(0, 1) !== "~") {
						// Add this site to the list of sites we wish to display.
						newjson.entry.push(site);
					}
				}
			}			
			// Render all the sites.
			doRender(newjson);		
		}
	};

	/**
	 * Will initiate a request to the site service.
	 */
	var doInit = function() {
		$.ajax({
			url: Config.URL.SITES_SERVICE,
			cache: false,
			success: function(data){
				loadSiteList(data, true);
			},
			error: function(status){
				loadSiteList("", false);
			}
		});
	};
	
	
	////////////////////
	// Event Handlers //
	////////////////////

	$(sitesCreateNewSite, rootel).bind("click", function(ev){
		createNewSite();
	});
	
	if (showSettings) {
		$(sitesMainContainer, rootel).html(sitesErrorNoSettings);
	}
	else {
		sdata.widgets.WidgetLoader.insertWidgets(tuid);
		// Start the request
		doInit();
	}
};
sdata.widgets.WidgetLoader.informOnLoad("sites");