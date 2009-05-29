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
/*global $, Config, jQuery, sakai, sdata, Querystring */

var sakai = sakai || {};

sakai.site_appearance = function() {


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var siteId = "";
	var appearance = {};
	
	// Id
	var siteAppearance = "#site_appearance";
	var siteAppearanceStyleContainer = siteAppearance + "_style_container";
	var siteAppearanceTitle = siteAppearance + "_title";
	
	// Class
	var siteAppearanceClass = ".site_appearance";
	var siteAppearanceAppendIdToUrlClass = siteAppearanceClass + "_append_id_to_url";
	
	// Template
	var siteAppearanceTemplate = "site_appearance";
	var siteAppearanceStyleContainerTemplate = siteAppearanceTemplate + "_style_container_template";
	
	// Others
	var selectedClass = "selected";


	////////////////////////
	// Utility functions //
	////////////////////////
	
	/**
	 * Adds ?key=val to the url of ID of the DOM.
	 * @param {String} id The DOM id
	 * @param {String} key The key you wish to add
	 * @param {String} value The value for the key.
	 */
	var appendKeyToURL = function(id, key, value) {
		var url = $(id).attr('href');
		// If there is no question mark in the url we add it.
		url += (url.indexOf('?') === -1) ? "?" : "&";
		url += key + "=" + value;
		$(id).attr('href', url);
	};


	////////////////////
	// Main functions //
	////////////////////
	
	var addSiteStyles = function(){
		var json_styles = {};
		var styles = [];
		
		for (var i in Config.Site.Styles){
			if(Config.Site.Styles.hasOwnProperty(i)){
				var style = {};
				style.id = i;
				style.name = Config.Site.Styles[i].name;
				style.image = Config.Site.Styles[i].image;
				styles.push(style);
			}
		}
		json_styles.styles = styles;
		$.Template.render(siteAppearanceStyleContainerTemplate, json_styles, $(siteAppearanceStyleContainer));
	};

	/**
	 * This will fill in all the field settings for the site.
	 */
	var fillData = function() {
		$.ajax({
			url: "/_rest/site/get/" + siteId + "?sid=" + Math.random(),
			type: "GET",
			success: function(response) {
				var json = $.evalJSON(response);
				// Check if we are an owner for this site.
				// Otherwise we will redirect to the site page.
				if (json && json.owners && sdata.me.preferences.uuid && $.inArray(sdata.me.preferences.uuid, json.owners) !== -1) {				
					// Fill in the info.
					$(siteAppearanceTitle).text(json.name); 
				}
				else {
					// The user is not an owner for this site. we redirect him/her to the site page.
					document.location = Config.URL.SITE_URL_SITEID.replace(/__SITEID__/gi, siteId);
				}	  
			},
			error: function(status) {
				alert("Failed to get the site info.");
			}
		});
	};
	
	/**
	 * Save the site style to the local object
	 * @param {String} style The style id (you can find all styles in the configuration file)
	 */
	var saveSiteStyle = function(style){
		appearance.style = style;
	};


	////////////////////
	// Event Handlers //
	////////////////////

	/*
	 * Bind all the style elements when you click on them
	 */
	$(siteAppearanceStyleContainer + " li a").live("click",function(e,ui){
			
			// Get the id for the parentnode
			var id = e.target.parentNode.parentNode.id;

			// Remove all the the selected classes
			$(siteAppearanceStyleContainer + " ." + selectedClass).removeClass(selectedClass);
			
			// Save the polltype you clicked on to the json object
			saveSiteStyle(id);
			
			// Add the active class to the element you clicked on
			$("#"+id).addClass(selectedClass);
	});
	 
	//////////////////////////////
	// Initialisation functions //
	//////////////////////////////	
	
	/**
	 * Get the site id from the querystring in the browser
	 */
	var getSiteId = function(){
		var qs = new Querystring();
		siteId = qs.get("siteid", false); 
	};
	
	/**
	 * Append the site id to multiple urls
	 */
	var appendIdsToUrl = function(){
		// Add the site id to all the element with a specific class
		$(siteAppearanceAppendIdToUrlClass).each(function(i, el) {
			appendKeyToURL(el, 'siteid', siteId);
		});
	};
	
	/**
	 * initializes the site appearance page
   	 */
   	var doInit = function(){
		// Get the site id and append it to various links on the page
		getSiteId();
		appendIdsToUrl();
		
		// Fill in the site data (Title, ...)
		fillData();
		
		// Add the site styles
		addSiteStyles();
	};
	doInit();

};

sdata.container.registerForLoad("sakai.site_appearance");