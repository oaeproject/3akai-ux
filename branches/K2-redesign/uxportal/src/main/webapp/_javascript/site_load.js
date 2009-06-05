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

var sakai = sakai || {};

sakai.site_load = function(){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var siteId = null;


	///////////////////////
	// Utility functions //
	///////////////////////

	var redirectToDashboardPage = function(){
		document.location = Config.URL.GATEWAY_URL;
	};


	////////////////////
	// Main functions //
	////////////////////

	/**
	 * Get the site id from the querystring in the browser
	 */
	var getSiteId = function(){
		var qs = new Querystring();
		siteId = qs.get("siteid", false); 
	};
	
	/**
	 * Check if there is a site id in the querystring
	 */
	var checkSiteId = function(){
		if(!siteId){
			redirectToDashboardPage();
		}
	};
	
	/**
	 * Get the first site style in the config file
	 */
	var getFirstSiteStyle = function(){		
		// Run over it with a for loop and return the first element
		for (var i in Config.Site.Styles){
			
			// We need to use hasOwnProperty when we use for ... in to parse with JSLint
			// More information: http://ajaxian.com/archives/fun-with-browsers-for-in-loop
			if(Config.Site.Styles.hasOwnProperty(i)){
				
				// As soon as we found a valid element, we return it.
				return i;
			}
		}
	};
	
	var locateTagAndRemove = function(content, tagName, URLIdentifier){
		var returnObject = {};
		returnObject.URL = [];
		returnObject.content = content;
		var regexp = new RegExp('<'+tagName+'.*?'+URLIdentifier+'\\s?=\\s?["|'+'\''+']([^"]*)["|'+'\''+'].*/.*?>', "gi");
		var regexp_match_result = regexp.exec(content);			
		while (regexp_match_result !== null) {
			returnObject.URL[returnObject.URL.length] = regexp_match_result[1]; // value of URLIdentifier attrib
			returnObject.content = content.replace(regexp_match_result[0],""); // whole tag
			regexp_match_result = regexp.exec(content);
		}
		return returnObject;
	};
	
	/**
	 * Load all the CSS files from the theme
	 * @param {String} response The complete response/page from the template
	 */
	var loadCSS = function(response){
		var CSSTags = locateTagAndRemove(response, "link", "href");
		response = CSSTags.content;
		
		for (var i = 0; i < CSSTags.URL.length; i++){
			$.Load.requireCSS(CSSTags.URL[i]);
		}	
	};
	
	/**
	 * Load all the JS files from the theme
	 * @param {String} response The complete response/page from the template
	 */
	var loadJS = function(response){
		
	};
	
	/**
	 * We load the body from the template in the body of the site.html
	 * @param {String} response The response from the tempate
	 */
	var loadContent = function(response){

		// We remove all the \n in the response to make the next regular expression work
		response = response.replace(/[\n]/gi, "");
		
		// A regular expression that gets everything between the body tags
		var regexp = new RegExp('<BODY[^>]*>(.*?)</BODY>', "gi");
		
		// Execute the regular expression
		var regexp_match_result = regexp.exec(response);
		
		// Add everything to the current body of the site.html page
		$('body').html(regexp_match_result[1]);
	};
	
	/**
	 * Load the site style
	 * @param {String|undefined} siteStyle The site style you want to load or not
	 */
	var loadSiteStyle = function(siteStyle){

		// Check whether the current site has a style
		if(!siteStyle){
			
			// If there is no style defined, we load the first style defined in the config file
			siteStyle = getFirstSiteStyle();
		}
		
		// Send an ajax request to get the template
		$.ajax({
			url: "/dev/_skins/"  + siteStyle + "/" + siteStyle + ".html",
			type: "GET",
			success: function(response) {
				loadCSS(response);
				
				var JSTags = locateTagAndRemove(response, "script", "src");
				response = JSTags.content;
				
				loadContent(response);
				
				for (var i = 0; i < JSTags.URL.length; i++){
					//$.Load.requireJS(JSTags.URL[i]);
				}
				
				sakai.site();
				sdata.widgets.WidgetLoader.insertWidgets(null, false);
			},
			error: function(status) {
				
				// If we don't find or we are not able to get information about the current site id,
				// we redirect the user to the dashboard page.
				redirectToDashboardPage();
			}
		});
	};
	
	/**
	 * Get the site information from the site rest service
	 */
	var getSiteInformation = function() {
		$.ajax({
			url: Config.URL.SITE_GET_SERVICE  + "/" + siteId,
			cache: false,
			type: "GET",
			success: function(response) {
				
				// Parse the json response
				var json = $.evalJSON(response);

				// Check if it is a valid JSON response
				if (json) {

					// Load the site style
					loadSiteStyle(json.style);
				}
				else {
					
					// If there is no valid JSON object, we redirect the user to the dashboard page
					redirectToDashboardPage();
				}	  
			},
			error: function(status) {
				
				// If we don't find or we are not able to get information about the current site id,
				// we redirect the user to the dashboard page.
				redirectToDashboardPage();
			}
		});
	};
	
	

	/////////////////////////////
	// Initialisation function //
	/////////////////////////////

	/**
	 * initializes the site appearance page
   	 */
   	var doInit = function(){
		
		// Get the site id and check whether there is a site id or not
		getSiteId();
		checkSiteId();
		
		// Get the site information depending on the site id
		getSiteInformation();
	};
	doInit();
};

sdata.container.registerForLoad("sakai.site_load");