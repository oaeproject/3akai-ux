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

sakai.sakai2tools = function(tuid,placement,showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var rootel = $("#" + tuid);

	// IDs
	var sakai2toolsListTemplate = "#sakai2tools_list_template";
	var sakai2tools_notools = "#sakai2tools_error_nosites";
	var sakai2toolsList = "#sakai2tools_list";


	///////////////////////
	// Utility functions //
	///////////////////////
	
	/**
	 * Takes a set of JSON and renders the sites.
	 * @param {Object} newjson
	 */
	var doRender = function(newjson){
		if (!newjson || !newjson.site.pages || newjson.site.pages.length === 0){
			$(sakai2toolsList, rootel).html($(sakai2tools_notools).html());
		} 
		else {
			$(sakai2toolsList, rootel).html($.Template.render(sakai2toolsListTemplate.replace(/#/,''), newjson.site));
		}
	};

	/**
	 * Get the tools for a sakai2 site
	 * @param {String} siteId The id of the site you want to get content from
	 */
	var getSakai2Tools = function(siteId) {
		$.ajax({
			url: Config.URL.SAKAI2_TOOLS_SERVICE.replace(/__SITEID__/, siteId),
			cache: false,
			success: function(data){
				doRender($.evalJSON(data));
			},
			error: function(status){
				doRender(false);
			}
		});			
	};
	
	/**
	 * Initialization
	 */
	var doInit = function() {
		getSakai2Tools("62d2dada-9022-45bc-9438-b0548e08b1ec");
	};
	
	doInit();
};
sdata.widgets.WidgetLoader.informOnLoad("sakai2tools");