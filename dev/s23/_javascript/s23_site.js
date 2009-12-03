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

$(document).ready(function(){
	sakai.s23_site = function(){
	
	
		/////////////////////////////
		// Configuration variables //
		/////////////////////////////
		
		// Get the current query string
		var qs = new Querystring();
		
		var s23Site = "#s23_site";
		var s23SiteTitle = $(s23Site + "_title");
		var s23SiteMenuContainer = $(s23Site + "_menu_container");
		
		// Templates
		var s23SiteMenuContainerTemplate = "s23_site_menu_container_template";
		
		
		///////////////////////
		// General functions //
		///////////////////////
		
		/**
		 * Parse the site info that is in a JSON format
		 * to show it on the page
		 * @param {Object} json A JSON object containing the site information
		 */
		var parseSakai2SiteInfo = function(json){
		
			// Check if the title and the pages attribute exist
			if (json && json.site && json.site.title && json.site.pages) {
			
				// Set the title of the page
				s23SiteTitle.text(json.site.title);
				
				// Render the tools of the site
				s23SiteMenuContainer.html($.Template.render(s23SiteMenuContainerTemplate, json));
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
			$.ajax({
				url: Config.URL.SAKAI2_TOOLS_SERVICE.replace(/__SITEID__/, siteid),
				success: function(data){
				
					// Evaluate the data to JSON
					var json = $.evalJSON(data);
					
					// Parse the Sakai2 info
					parseSakai2SiteInfo(json);
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
				
				/*
				 $("#s23_site_iframe_container").html('<iframe id="s23_site_iframe" frameborder="0"></iframe>');
				 $("#s23_site_iframe").attr("src", v1);
				 */
			}
			else {
			
				// Log an error message for the user
				fluid.log("s23site: This site needs to have an id parameter for a sakai2 site");
			}
		};
		init();
	};
	sakai.s23_site();
});