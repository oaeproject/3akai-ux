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

/*global $, sdata */

var sakai = sakai || {};
sakai._navigation = {};

sakai.navigation = function(tuid, placement, showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	// - ID
	var navigation = "#navigation";
	var navigationName = "navigation";
	var navigationOutput = navigation + "_output";
	var navigationSettings = navigation + "_settings";
	
	// Template
	var navigationOutputTemplate = navigationName + "_output_template";


	///////////////////////
	// Utility functions //
	///////////////////////
	
	/**
	 * Get the level of a page id
	 * e.g. when the level of the page is main/test/hey, it will return 3
	 * @param {String} pageId The id of the page
	 * @return {Integer} The level of the page (0,1,...)
	 */
	var getLevel = function(pageId) {
		return pageId.split(/\//g).length - 1;
	};


	///////////////////////
	// Render navigation //
	///////////////////////

	var doSort = function(a,b){
		if (a.position > b.position){
			return 1;
		} else if (a.position < b.position){
			return -1;
		} else {
			return 0;
		}
	}

	/**
	 * Function that is available to other functions and called by site.js
	 * It fires the event to render the naviagation
	 * @param {Boolean|String} selected_page_id
	 * 	false: if there is no page selected
	 * 	pageid: when you select a page
	 * @param {Object[]} site_info_object Contains an array with all the pages, each page is an object.
	 */
	
	sakai._navigation.renderNavigation = function(selected_page_id, site_info_object){
		
		// Check if the selected page is false or undefined
		if (!selected_page_id){
			// Quit the function if the selected page is false or undefined
			return;
		}
		
		// Set variables
		var jsonNavigation = {};
		jsonNavigation.pages = [];
		
		for (var site_id in site_info_object) {
			
			// Get values which are important for the renderer
			var current_page = {};
			current_page.id = site_id;
			current_page.title = site_info_object[site_id].title;
			current_page.position = parseInt(site_info_object[site_id].position);
			
			// Mark selected page (for different icon)
			if (site_id === selected_page_id) {
				current_page.selected = true;
			} else {
				current_page.selected = false;
			}
			
			// The level of the page is multiplied by 10 pixels, the amount of identation on the left
			current_page.level = (getLevel(site_id) * 10);
			
			// Decide wether it is a root or a subpage (for icon purposes in nav)
			if (current_page.level === 0) {
				current_page.rootpage = true;
			} else {
				current_page.rootpage = false;
			}
			
			// Add current page data to the list of pages which will be displayed
			jsonNavigation.pages.push(current_page);
		};
		
		jsonNavigation.pages.sort(doSort);
		
		
		// Render the output template
		$(navigationOutput).html($.Template.render(navigationOutputTemplate,jsonNavigation));	
	};
	
	

	///////////////////////
	// Initial functions //
	///////////////////////

	// Hide or show the settings
	if (showSettings){
		$(navigationOutput).hide();
		$(navigationSettings).show();
	} else {
		$(navigationSettings).hide();
		$(navigationOutput).show();
	}

	sakai.site.onNavigationLoaded();
};

sdata.widgets.WidgetLoader.informOnLoad("navigation");