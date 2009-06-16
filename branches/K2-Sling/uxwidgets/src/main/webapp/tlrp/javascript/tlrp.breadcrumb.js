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
/*global $, Config, jQuery, json_parse, sakai, sdata, Querystring, DOMParser */

sakai.tlrp.breadcrumb = function(tuid, parent, titleLength) {

    var rootel = "#" + tuid;
    if (!titleLength) {
        titleLength = -1;
    }
    var json = {
        "titleLength": titleLength,
        "breadcrumbs": []
    };
    
	
    /////////////////////////////
    // Configuration variables //
    /////////////////////////////	
	
    var tlrpBreadCrumbTemplate = "tlrpBreadCrumbTemplate";
    var tlrpBreadCrumbItem = "tlrpBreadCrumb";
    var tlrpBreadCrumbItemClass = ".tlrpBreadCrumb";
    
	
    ///////////////////////
    // Private functions //
    ///////////////////////
    
	/**
	 * Add a new item to the breadcrumber
	 * @param {Object} breadCrumb: string to be added
	 * @param {Object} clickHandler: the function to call if this is clicked
	 * @param {Object} level: the level
	 */
    var addItemToBreadCrumps = function(breadCrumb, clickHandler, level) {
		// make a breadcrumb object
        var jsonBC = {};
        jsonBC.title = breadCrumb;
        jsonBC.clickHandler = clickHandler;
		// if a level is specified splice the breadcrumber to that level
        if (level) {
            json.breadcrumbs.splice(level);
        }
		// add the new breadcrumb
        json.breadcrumbs.push(jsonBC);
		// render the breadcrumber items
        $(rootel).html($.Template.render(tlrpBreadCrumbTemplate, json));
        
    };
    
    
    ////////////////////
    // Event Handlers //
    ////////////////////
	
	/**
	 * Is called whenm a breadcrumb is clicked
	 * @param {Object} e
	 */
    var doBreadCrumb = function(e) {
		// get the index of the breadcrumb
        var index = parseInt(e.target.id.replace(tlrpBreadCrumbItem, ""), 10);
		// check if the breadcrumber has a eventhandler
		// if so calll it and put the index as a parameter
        if (typeof json.breadcrumbs[index].clickHandler !== "undefined") {
            json.breadcrumbs[index].clickHandler(index);
        }
		// splice the breadcrumbs to the clicked breadcrumb
        json.breadcrumbs.splice(index + 1);
		// rerender
        $(rootel).html($.Template.render(tlrpBreadCrumbTemplate, json));
    };
    
    $(tlrpBreadCrumbItemClass, rootel).live("click", doBreadCrumb);
    
    var getJson = function() { return json; };
    
    //////////////////////
    // Public functions //
    //////////////////////
    
    return {
        getJson : getJson,
        add: addItemToBreadCrumps,
        clear: function() {
            json.breadcrumbs = [];
        }
    };
    
};
sdata.widgets.WidgetLoader.informOnLoad("tlrp");

