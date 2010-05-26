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

/**
 * General Lister widget
 * This is a general widget which aims to display an arbitriary number of
 * spaces, sites or content, loading dynamically if the list is very long.
 */

/*global $, Config, sdata */

// Namespaces
var sakai = sakai || {};
sakai.api.UI.listGeneral = {};
sakai.api.UI.listGeneral.selected = {};
sakai.api.UI.listGeneral.currentElementCount = 0;

/**
 * Initialize the listgeneralwidget
 * This is the widget loader's default callback, executing when the widget
 * is loaded on a page
 * @param tuid {String} Unique id of the widget
 * @param showSettings {Boolean} Show the settings of the widget or not
 */
sakai.listgeneral = function(tuid, showSettings){

    // Config defaults
    var default_config = {
        "items": 25,
        "selectable": false,
        "sortOn": "lastName",
        "sortOrder": "ascending"
    };

    // Create a config object for this instance
    sakai.config.widgets.listgeneral = sakai.config.widgets.listgeneral || {};
    sakai.config.widgets.listgeneral[tuid] = default_config;

    // Reset to defaults
    sakai.api.UI.listGeneral.reset(tuid);

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code
    $(window).trigger("listgeneral_ready", [tuid]);
};


/**
 * Reset
 * Resets the general lister to a default state
 * @param tuid {String} Unique id of the widget
 * @returns void
 */
sakai.api.UI.listGeneral.reset = function(tuid) {

    sakai.api.UI.listGeneral.selected = {};

};

/**
 * Render
 * Renders the general lister with a specified set of data. The function uses
 * a search query initially, then does the paginating and subsequent requests
 * for data automatically
 * @param tuid {String} Unique id of the widget
 * @param iSearchQuery {String} A Sakai search query
 * @param iConfig {Object} Optional config overrides
 * @returns void
 */
sakai.api.UI.listGeneral.render = function(tuid, iSearchQuery, iConfig) {

    // Merge user defined config with defaults
    for (var element in iConfig) {
        if (iConfig.hasOwnProperty(element)) {
            sakai.config.widgets.listgeneral[tuid][element] = iConfig[element];
        }
    }

    // Parse search query
    var searchQuery = {};
    var main_parts = iSearchQuery.split("?");
    searchQuery.url = main_parts[0];
    var arguments = main_parts[1].split("&");
    for (var i=0, il = arguments.length; i < il; i++) {
        var kv_pair = arguments[i].split("=");
        searchQuery[kv_pair[0]] = kv_pair[1];
    }

    // Alter search query according to config
    searchQuery.items = sakai.config.widgets.listgeneral[tuid].items;

    // Add hash to search query in case it's not there to prevent caching
    if (!searchQuery["_"]) {
        searchQuery["_"] = (Math.random() * 100000000000000000);
    }

    // Deal with non logged in users
    

    // Render the first page of results
    sakai.api.UI.listGeneral.addPage(tuid, 0, searchQuery);

};

/**
 * addPage
 * Adds another page of search result to the People lister's result list
 * @param tuid {String} The instance ID of a widget
 * @pageNumber {Int} The page we want to load
 * @searchQuery {Object} An object containing the search query elements
 * @returns void
 */
sakai.api.UI.listGeneral.addPage = function(tuid, pageNumber, searchQuery) {

    // Create new container for the bit we load. This is then appended to the
    // main container

    // Aadd relevant config elements to the search query
    searchQuery.page = pageNumber;
    searchQuery.sortOn = sakai.config.widgets.listgeneral[tuid]["sortOn"];
    searchQuery.sortOrder = sakai.config.widgets.listgeneral[tuid]["sortOrder"];

    // Construct search query
    var sq = searchQuery.url + "?";
    for (var e in searchQuery) {
        if (searchQuery.hasOwnProperty(e) && e !== "url") {
            sq += e + "=" + searchQuery[e] + "&";
        }
    }

    // Display empty new container with loading anim
    //$pl_container.append($pl_pageContainer);


};



sdata.widgets.WidgetLoader.informOnLoad("listgeneral");
