/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, sdata, Config */

var sakai = sakai || {};

sakai.camtoolscourses = function(tuid, placement, showSettings){
	
	Config.URL.CAMTOOLS_MCP_URL = "/var/proxy/sakai2/mcp.json";
	Config.URL.CAMTOOLS_MCPFAVOURITE_URL = "/var/proxy/sakai2/mcp_favourite.json";


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var rootel = $("#" + tuid);
	
	var globalfeed = false;
	var favouritefeed = false;
	
	var parseglobal = false;
	var parsenormal = [];
	var parsefavourites = [];

	// CSS selectors
	var camtoolscoursesId = "#camtoolscourses";
	var $camtoolscoursesContainer = $(camtoolscoursesId + "_container");
	
	// Templates
	var camtoolscoursesContainerTemplate = "camtoolscourses_container_template";


	///////////////////////////
	// General functionality //
	///////////////////////////
	
	/**
	 * Parse the templates with JST
	 */
	var parseTemplates = function(){
		
		// Set the parse global object
		parseglobal = {
			normal: parsenormal,
			favourites: parsefavourites
		};

		// Render the template and pass through the parseglobal object
		$.Template.render(camtoolscoursesContainerTemplate, parseglobal, $camtoolscoursesContainer);
	};

	/**
	 * Split the global feed into normal and favourited projects
	 */
	var splitGlobalFeed = function(){
		if(favouritefeed && favouritefeed.items && favouritefeed.items.length > 0){
			for(var i = 0; i < globalfeed.items.length; i++){
				if($.inArray(globalfeed.items[i].id, favouritefeed.items) !== -1){
					parsefavourites.push(globalfeed.items[i]);
				}else{
					parsenormal.push(globalfeed.items[i]);
				}
			}
		}else{
			if(globalfeed){
				for (var j = 0; j < globalfeed.items.length; j++) {
					parsenormal.push(globalfeed.items[j]);
				}
			}
		}
		
		// Parse the template with the new modified feeds
		parseTemplates();
	};


	////////////////////////
	// Init functionality //
	////////////////////////

	/**
	 * Get the favourite courses and projects for the current user
	 */
	var getFavouriteCoursesAndProjects = function(){
		$.ajax({
			url: Config.URL.CAMTOOLS_MCPFAVOURITE_URL,
			success: function(data){
				
				/** TODO replace with $.evalJSON. The problem is that this doesn'work 
				 * with the latest Firefox build-in parser. The line beneath is against
				 * everything I stand for, but it was to only way to make it work. The
				 * output of Camtools 2008 code is simply not valid JSON.
				 */
				favouritefeed =  eval('(' + data + ')');
				splitGlobalFeed();
			},
			error: function(status){
				splitGlobalFeed();
			},
			cache: false
		});
	};

	/**
	 * Get the courses and projects for the user that is logged in.
	 * This function sends a request to the proxy server that will then send a request to camtools.
	 * Since there is single signon functionality, the user is automatically logged into camtools.
	 */
	var getCoursesAndProjects = function(){
		$.ajax({
			url: Config.URL.CAMTOOLS_MCP_URL,
			success: function(data){
				globalfeed = $.evalJSON(data);
				getFavouriteCoursesAndProjects();
			},
			error: function(status){
				fluid.log("Camtoolscourses: Could not receive the courses and projects from the server.");
			},
			cache: false
		});
	};

	/**
	 * Execute this function when the widget get launched
	 */
	var doInit = function(){
		
		// Get the courses and projects for the current user
		getCoursesAndProjects();
	};

	doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("camtoolscourses");