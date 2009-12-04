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

/*global sakai, Config, $, QueryString */

sakai.s23_site = sakai.s23_site || {};

sakai.s23_site = function(){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var qs = new Querystring(); // Get the current query string
	var completeJSON;

	// CSS selectors
	var s23Site = "#s23_site";
	var s23SiteTitle = $(s23Site + "_title");
	var s23SiteIframeContainer = $(s23Site + "_iframe_container");
	var s23SiteMenuContainer = $(s23Site + "_menu_container");
	
	// Templates
	var s23SiteIframeContainerTemplate = "s23_site_iframe_container_template";
	var s23SiteMenuContainerTemplate = "s23_site_menu_container_template";
	
	
	///////////////////////
	// General functions //
	///////////////////////
	
	/**
	 * Get all the information about a certain page
	 * @param {String} pageid The id of the page you want information for
	 * @return {Object} A page object containing the info about the page
	 */
	var getPageInfo = function(pageid){
		
		// Run over all the pages and return the page object that has the same
		// id as the pageid argument
		for (var i = 0, len = completeJSON.site.pages.length; i < len; i++) {
			if (completeJSON.site.pages[i].id === pageid) {
				return completeJSON.site.pages[i];
			}
		}

		// Log a message if the page with the given pageid was not found
		fluid.log("s23_site: the page with id'" + pageid + "' was not found in the json object");

	};
	
	/**
	 * Load the tools for a certain page
	 * @param {Object} pageid The id of the page you want the tools loaded for
	 */
	var loadPageTools = function(pageid){
		
		// Get the page info for a certain page and store it in a variable
		var page = getPageInfo(pageid);
		
		// Check if the page actually exists
		if(page){
			
			// Render the tools of the site
			s23SiteIframeContainer.html($.Template.render(s23SiteIframeContainerTemplate, page));
		}
		
	};
	
	/**
	 * Create an xid for every tool that exists
	 * We need this because the iframe looks at the parent frame with the xid
	 * An url could be 	0175d73d-741f-4fb3-94dc-9f8c1d4925a9
	 * An xid is		0175d73dx741fx4fb3x94dcx9f8c1d4925a9
	 */
	var createxids = function(){
		
		// Run over all the pages and then all the tools inside a page to modify the xid
		for (var i=0, len=completeJSON.site.pages.length; i<len; i++) {
			if (completeJSON.site.pages[i].tools && completeJSON.site.pages[i].tools.length>0) {
				for (var j = 0, toolslen = completeJSON.site.pages[i].tools.length; j < toolslen; j++) {
					completeJSON.site.pages[i].tools[j].xid = completeJSON.site.pages[i].tools[j].url.replace(/-/g, "x");
				}
			}
		}
		
	};
	
	/**
	 * Parse the site info that is in a JSON format
	 * to show it on the page
	 */
	var parseSakai2SiteInfo = function(){
	
		// Check if the title and the pages attribute exist
		if (completeJSON && completeJSON.site && completeJSON.site.title && completeJSON.site.pages) {
		
			// Set the title of the page
			s23SiteTitle.text(completeJSON.site.title);
			
			// Render the menu of the workspace
			s23SiteMenuContainer.html($.Template.render(s23SiteMenuContainerTemplate, completeJSON));
			
			// Create xid's
			createxids();
			
			// Check if there are any tools in the first page, if so parse them
			if(completeJSON.site.pages[0].tools && completeJSON.site.pages[0].tools.length > 0){
				
				// Load the tools for a specific page
				loadPageTools(completeJSON.site.pages[0].id);
				
			}
		}
		else {
			fluid.log("s23_site: An error occured when parsing the Sakai 2 site information");
		}
		
	};
	
	/**
	 * Get the information of a Sakai2 site
	 * @param {String} siteid The id of the Sakai2 site you want to
	 */
	var getSakai2SiteInfo = function(siteid){
		
		// Send an Ajax request to the sakai2 tools service
		$.ajax({
			url: Config.URL.SAKAI2_TOOLS_SERVICE.replace(/__SITEID__/, siteid),
			success: function(data){
			
				// Evaluate the data to JSON
				completeJSON = $.evalJSON(data);
				
				// Parse the Sakai2 info
				parseSakai2SiteInfo();
			},
			error: function(status){
				fluid.log("s23_site: It was not possible to get the information the Sakai 2 site with the id: " + siteid + " the error code is: " + status);
			}
		});
	};
	
	
	/////////////////////////////
	// Initialisation function //
	/////////////////////////////
	
	/**
	 * Function that get executed when the DOM is completely loaded
	 */
	var init = function(){
	
		// Check if the query string contains the parameter id
		if (qs.contains("id")) {
		
			// Get the value for the id parameter
			var siteid = qs.get("id");
			
			// Send an ajax request to the user
			getSakai2SiteInfo(siteid);
		}
		else {
		
			// Log an error message for the user
			fluid.log("s23site: This site needs to have an id parameter for a sakai2 site");
		}
	};
	init();
};
sdata.container.registerForLoad("sakai.s23_site");