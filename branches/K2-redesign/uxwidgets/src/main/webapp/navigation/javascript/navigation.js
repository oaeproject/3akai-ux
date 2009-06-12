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
	 * Check if an id starts with a certain string
	 * @param {String} nodeId The id of the node
	 * @param {String} input The string to check
	 * @return
	 * 	true: The node id starts with the input string
	 * 	false: The node id doesn't start with the input string
	 */
	var startsWith = function(nodeId, input){
		return (input === nodeId.substring(0, input.length));
	};
	
	/**
	 * Get the level of a page id
	 * e.g. when the level of the page is main/test/hey, it will return 3
	 * @param {String} pageId The id of the page
	 * @return {Integer} The level of the page (0,1,...)
	 */
	var getLevel = function(pageId) {
		return pageId.split(/\//g).length-1;
	};
	
	/**
	 * Get the parent id of a specific page id
	 * @param {String} pageId The id of the page
	 * @return {String} The id of the parent page
	 * 	This will be an empty string if there is no parent
	 */
	var getParentId = function(pageId) {
		return pageId.substring(0, pageId.lastIndexOf("/"));
	};
	
	/**
	 * Get the title for a page.
	 * This function is used to get the title of the parent id when rendering
	 * the navigation.
	 * @param {Object[]} pages Array containing all the pages
	 * @param {String} pageId The id of the page you want the title of
	 */
	var getTitle = function(pages, pageId){
		
		// Run over all the pages and check if the page you are
		// running over is the same as the parameter.
		for (var i = 0; i < pages.items.length; i++) {
			if (pages.items[i].id === pageId){
				return pages.items[i].title;
			}
		}
		return null;
	};


	///////////////////////
	// Render navigation //
	///////////////////////

	/**
	 * Function that is available to other functions and called by site.js
	 * It fires the event to render the naviagation
	 * @param {Boolean|String} selectedPageId
	 * 	false: if there is no page selected
	 * 	pageid: when you select a page
	 * @param {Object[]} pages Contains an array with all the pages, each page is an object.
	 * 	An page object has the following structure:
	 * 	{id: "test-1/dddd", title: "dddd", type: "webpage"}
	 * 	The page structure is defined by the id (seperated with slashes)
	 */
	sakai._navigation.renderNavigation = function(selectedPageId, pages){
		
		// Check if the selected page is false or undefined
		if (!selectedPageId){
			
			// Quit the function if the selected page is false or undefined
			return;
		}
		
		// Set variables
		var jsonNavigation = {};
		jsonNavigation.pages = [];
		
		// The parent of the selected page
		// This will be an empty string if there is no parent
		var selectedPageParentId = getParentId(selectedPageId);
		
		// Get the current level by counting the number of forward
		// slashes in the selected page id.
		var selectedPageLevel = getLevel(selectedPageId);
		
		// Check if the level is 0
		if (selectedPageLevel === 0){
			
			// If the level is 0, it means that there are no pages above it
			jsonNavigation.toppage = true;
		} else {
			
			// If the level isn't 0, there is/are page(s) above the current page
			jsonNavigation.toppage = false;
			
			// Get the page that is just above the current page
			jsonNavigation.parent = {};
			jsonNavigation.parent.id = selectedPageParentId;
			jsonNavigation.parent.title = getTitle(pages, jsonNavigation.parent.id);
		}
		
		// Get all the pages on the current level and beneath the current page
		// Run over all the pages
		for(var i = 0; i < pages.items.length; i++){
			var page = pages.items[i];
			var pageId = page.id;
			
			// Get the level for the page you are running through
			var pageLevel = getLevel(pageId);
			
			// Get the id for the parent page
			var pageParentId = getParentId(pageId);
			
			// Check if the page level is the same as the current page and if the parent id's
			if(pageLevel === selectedPageLevel && selectedPageParentId === pageParentId){
				
				// Check if the current page id is the same as the selected page id
				if(pageId === selectedPageId){
					
					// If so, we set the property selected to true and get the children of that page
					page.selected = true;
					
					page.multiple = false;
					page.pages = [];
					
					// Get all child pages of the selected page
					for (var k = 0; k < pages.items.length; k++) {
						var pageChild = pages.items[k];
						var pageChildId = pageChild.id;

						if(startsWith(pageChildId, selectedPageId + "/")){
							
							// We get the child level after the starts with check for
							// performance reasons
							var pageChildLevel = getLevel(pageChildId);
							
							if(pageChildLevel === pageLevel + 1){
								page.pages.push(pageChild);
							
								// Set the variable multiple to true: the selected page has child pages
								page.multiple = true;
							}
						}
					}
				}
				else{
					
					// The current page is not the selected page
					page.selected = false;
				}
				
				// Add the current page to the global array
				jsonNavigation.pages.push(page);
			}
		}
		
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