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

/*global $, Config */

// Namespaces
var sakai = sakai || {};

/**
 * @name sakai.api.UI.listPeople
 *
 * @description
 * Public functions for the people lister widget
 */
sakai.api.UI.listPeople = {};

/**
 * @name sakai.listpeople
 *
 * @class listpeople
 *
 * @description
 * People Lister widget<br />
 * This is a general widget which aims to display an arbitriary number of
 * people, loading dynamically if the list is very long.
 * Also this is a first attempt at implementing a general UI component which
 * needs to be part of the frontend API as a widget.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.listpeople = function(tuid, showSettings){

    // Config defaults
    var default_config = {
        "items": 25,
        "selectable": false,
        "sortOn": "lastName",
        "sortOrder": "ascending",
        "function": "getSelection"
    };

    // Create a config object for this instance
    sakai.config.widgets.listpeople = sakai.config.widgets.listpeople || {};
    sakai.config.widgets.listpeople[tuid] = default_config;

    // Create data object for this instance
    sakai.data.listpeople = sakai.data.listpeople || {};
    sakai.data.listpeople[tuid] = {};
    sakai.data.listpeople[tuid].objects = {};
    sakai.data.listpeople[tuid].selected = {};
    sakai.data.listpeople[tuid].currentElementCount = 0;
    sakai.data.listpeople[tuid].selectCount = 0;

    // Reset to defaults
    sakai.api.UI.listPeople.reset(tuid);

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code
    $(window).trigger("listpeople_ready", [tuid]);
};


/**
 * Reset
 * Resets the people lister to a default state
 * @param tuid {String} Unique id of the widget
 * @returns void
 */
sakai.api.UI.listPeople.reset = function(tuid) {

    $("#" + tuid + " .listpeople_content").html("");
    $("#" + tuid + " .listpeople_count").html("0");
    $("#" + tuid + " .listpeople_count_items").show();
    $("#" + tuid + " .listpeople_count_of").hide();
    $("#" + tuid + " .listpeople_count_total").hide();
    $("#" + tuid + " .listpeople_count_selected").hide();
    $("#" + tuid + " .listpeople_content").unbind("scroll");
    $("#" + tuid + " .listpeople_sort_order").unbind("click");
    sakai.data.listpeople[tuid].selected = {};
    sakai.data.listpeople[tuid].currentElementCount = 0;
    sakai.data.listpeople[tuid].selectCount = 0;

};

/**
 * Render
 * Renders the people lister with a specified set of data. The function uses
 * a search query initially, then does the paginating and subsequent requests
 * for data automatically
 * @param tuid {String} Unique id of the widget
 * @param iSearchQuery {String} A Sakai search query
 * @param iConfig {Object} Optional config overrides
 * @returns void
 */
sakai.api.UI.listPeople.render = function(tuid, iSearchQuery, iConfig, objects) {

    sakai.api.UI.listPeople.reset(tuid);

    // Init
    var $pl_container = $("#" + tuid + " .listpeople_content");

    // Merge user defined config with defaults
    for (var element in iConfig) {
        if (iConfig.hasOwnProperty(element)) {
            sakai.config.widgets.listpeople[tuid][element] = iConfig[element];
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
    searchQuery.items = sakai.config.widgets.listpeople[tuid].items;

    // Add hash to search query in case it's not there to prevent caching
    if (!searchQuery["_"]) {
        searchQuery["_"] = (Math.random() * 100000000000000000);
    }


    if($.isEmptyObject(objects)){
        // Render the first page of results
        sakai.api.UI.listPeople.addSearchPage(tuid, 0, searchQuery);
    } else {
    
        sakai.api.UI.listPeople.addToList(tuid, 0, objects);
    }

};



sakai.api.UI.listPeople.addToList = function(tuid, pageNumber, objects) {

    var rawData = objects;

    // main container
    var $pl_pageContainer = $("<ul id=\"listpeople_page_" + pageNumber + "\" class=\"listpeople_page loadinganim\"></ul>");
    var $pl_container = $("#" + tuid + " .listpeople_content");

    // Display empty new container with loading anim
    $pl_container.append($pl_pageContainer);

    for (var i = 0, il = rawData.results.length; i < il; i++) {
        var resultObject = rawData.results[i];

        // Eval json strings if any
        for (var j in resultObject) {
            if (resultObject.hasOwnProperty(j) && typeof resultObject[j] === "string" && resultObject[j].charAt(0) === "{") {
                rawData.results[i][j] = $.parseJSON(resultObject[j]);
            }
        }

        // Determine what to put under the name. See if specified key exists in main object or under basic profile info
        var subNameInfo = "";
        var iSubNameInfo = sakai.config.widgets.listpeople[tuid]["subNameInfo"];
        if (iSubNameInfo !== "" && typeof iSubNameInfo === "string") {
            if (rawData.results[i][iSubNameInfo]) {
                subNameInfo = rawData.results[i][iSubNameInfo];
            } else if (rawData.results[i]["basic"][iSubNameInfo]) {
                subNameInfo = rawData.results[i]["basic"][iSubNameInfo];
            }
        }
        rawData.results[i]["subNameInfo"] = subNameInfo;
    }

    var json_data = {
        "rawData" : rawData,
        "selectable" : sakai.config.widgets.listpeople[tuid].selectable
    };


    // Render the results data template
    var pageHTML = $.TemplateRenderer("#" + tuid + " .listpeople_content_pagetemplate", json_data);

    // Remove loading animation
    $pl_pageContainer.removeClass("loadinganim");

    // Inject results into DOM
    $pl_pageContainer.html(pageHTML);

    // Wire item selection
    if (sakai.config.widgets.listpeople[tuid].selectable) {

        $("#" + tuid + " .listpeople_page" + " li").addClass("selectable");
        $("#" + tuid + " #listpeople_page_" + pageNumber + " li").bind("click", function(e){
            // Check if user click on top of a link
            if (e.target.tagName.toLowerCase() !== "a") {
                // Remove from selected list
                if ($(this).hasClass("listpeople_selected")) {
                    $(this).removeClass("listpeople_selected");
                    $(this).children("input").attr('checked', false);
                    delete sakai.data.listpeople[tuid]["selected"][$(this).attr("data-userid")];
                    sakai.data.listpeople[tuid].selectCount -= 1;
                } else {
                    // Add to selected list
                    $(this).addClass("listpeople_selected");
                    $(this).children("input").attr('checked', true);
                    sakai.data.listpeople[tuid]["selected"][$(this).attr("data-userid")] = "";
                    sakai.data.listpeople[tuid].selectCount += 1;
                }
            }
            $("#" + tuid + " .listpeople_count_items").hide();
            $("#" + tuid + " .listpeople_count_of").show();
            $("#" + tuid + " .listpeople_count_total").show();
            $("#" + tuid + " .listpeople_count_selected").show();
            $("#" + tuid + " .listpeople_page" + " li").addClass("selectable");
            $("#" + tuid + " .listpeople_count").html(sakai.data.listpeople[tuid].selectCount);
        });
    }

    //Update known total amount of displayed elements
    sakai.data.listpeople[tuid].currentElementCount += rawData.results.length;

    //Set search result count
    // If we know the exact total display it
    $("#" + tuid + " .listpeople_count_total").html(rawData.total);


    // Wire sorting select dropdown
    $("#" + tuid + " .listpeople_sort_order").bind("click", function(e){
        var mylist = $('#listpeople_page_'+pageNumber);
        var listitems = mylist.children('li').get();
        listitems.sort(function(a, b) {
            var sortOrder = $("#" + tuid + " #listpeople_sort_order").val();
            var compA = $(a).text().toUpperCase();
            var compB = $(b).text().toUpperCase();
            if (sortOrder === 'ascending') {
                return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
            }
            return (compB < compA) ? -1 : (compB > compA) ? 1 : 0;
        });
        $.each(listitems, function(idx, itm) { mylist.append(itm); });
    });
};


/**
 * addSearchPage
 * Adds another page of search result to the People lister's result list
 * @param tuid {String} The instance ID of a widget
 * @pageNumber {Int} The page we want to load
 * @searchQuery {Object} An object containing the search query elements
 * @returns void
 */
sakai.api.UI.listPeople.addSearchPage = function(tuid, pageNumber, searchQuery) {

    // Create new container for the bit we load. This is then appended to the
    // main container
    var $pl_pageContainer = $("<ul id=\"listpeople_page_" + pageNumber + "\" class=\"listpeople_page loadinganim\"></ul>");
    var $pl_container = $("#" + tuid + " .listpeople_content");

    // Aadd relevant config elements to the search query
    searchQuery.page = pageNumber;
    searchQuery.sortOn = sakai.config.widgets.listpeople[tuid]["sortOn"];
    searchQuery.sortOrder = sakai.config.widgets.listpeople[tuid]["sortOrder"];

    // Construct search query
    var sq = searchQuery.url + "?";
    for (var e in searchQuery) {
        if (searchQuery.hasOwnProperty(e) && e !== "url") {
            sq += e + "=" + searchQuery[e] + "&";
        }
    }

    // Display empty new container with loading anim
    $pl_container.append($pl_pageContainer);

    // Make the request
    $.ajax({
        url: sq,
        type: "GET",
        success: function(rawData) {

            // Eval profile data for now and extend it with additional info
            for (var i = 0, il = rawData.results.length; i < il; i++) {
                var resultObject = rawData.results[i];

                // Eval json strings if any
                for (var j in resultObject) {
                    if (resultObject.hasOwnProperty(j) && typeof resultObject[j] === "string" && resultObject[j].charAt(0) === "{") {
                        rawData.results[i][j] = $.parseJSON(resultObject[j]);
                    }
                }

                // Determine what to put under the name. See if specified key exists in main object or under basic profile info
                var subNameInfo = "";
                var iSubNameInfo = sakai.config.widgets.listpeople[tuid]["subNameInfo"];
                if (iSubNameInfo !== "" && typeof iSubNameInfo === "string") {
                    if (rawData.results[i][iSubNameInfo]) {
                        subNameInfo = rawData.results[i][iSubNameInfo];
                    } else if (rawData.results[i]["basic"][iSubNameInfo]) {
                        subNameInfo = rawData.results[i]["basic"][iSubNameInfo];
                    }
                }
                rawData.results[i]["subNameInfo"] = subNameInfo;
            }

            var json_data = {
                "rawData" : rawData,
                "selectable" : sakai.config.widgets.listpeople[tuid].selectable
            };

            // Render the results data template
            var pageHTML = $.TemplateRenderer("#" + tuid + " .listpeople_content_pagetemplate", json_data);

            // Remove loading animation
            $pl_pageContainer.removeClass("loadinganim");

            // Inject results into DOM
            $pl_pageContainer.html(pageHTML);


            // Wire loading the next page when user scrolls to the bottom of the list
            if ((rawData.total > searchQuery.items) || (rawData.total === -1)) {
                $pl_container.bind("scroll", function(e){

                    if ((e.target.scrollHeight - e.target.scrollTop - $(e.target).height() ) === 0) {
                        $pl_container.unbind("scroll");
                        sakai.api.UI.listPeople.addSearchPage(tuid, (pageNumber + 1), searchQuery);
                    }
                });
            }


            // Wire item selection
            if (sakai.config.widgets.listpeople[tuid].selectable) {
        
                $("#" + tuid + " #listpeople_page_" + pageNumber + " li").bind("click", function(e){
                    // Check if user click on top of a link
                    if (e.target.tagName.toLowerCase() !== "a") {
                        // Remove from selected list
                        if ($(this).hasClass("listpeople_selected")) {
                            $(this).removeClass("listpeople_selected");
                            $(this).children("input").attr('checked', false);
                            delete sakai.data.listpeople[tuid]["selected"][$(this).attr("data-userid")];
                            sakai.data.listpeople[tuid].selectCount -= 1;
                        } else {
                            // Add to selected list
                            $(this).addClass("listpeople_selected");
                            $(this).children("input").attr('checked', true);
                            sakai.data.listpeople[tuid]["selected"][$(this).attr("data-userid")] = "";
                            sakai.data.listpeople[tuid].selectCount += 1;
                        }
                    }
                    $("#" + tuid + " .listpeople_count_items").hide();
                    $("#" + tuid + " .listpeople_count_of").show();
                    $("#" + tuid + " .listpeople_count_total").show();
                    $("#" + tuid + " .listpeople_count_selected").show();
                    $("#" + tuid + " .listpeople_page" + " li").addClass("selectable");
                    $("#" + tuid + " .listpeople_count").html(sakai.data.listpeople[tuid].selectCount);
                });
            }

            //Update known total amount of displayed elements
            sakai.data.listpeople[tuid].currentElementCount += rawData.results.length;

            //Set search result count
            if ((rawData.total === -1) || (rawData.total > 1000)) {
                // If we don't know the total display what we know
                $("#" + tuid + " .listpeople_count_total").html(sakai.data.listpeople[tuid].currentElementCount);
                $("#" + tuid + " .listpeople_count_people").show();
                $("#" + tuid + " .listpeople_count_of").show();
                $("#" + tuid + " .listpeople_count_thousands").show();

            } else {
                // If we know the exact total display it
                $("#" + tuid + " .listpeople_count_total").html(rawData.total);
                if (rawData.total === 1) {
                    $("#" + tuid + " .listpeople_count_person").show();
                } else {
                    $("#" + tuid + " .listpeople_count_people").show();
                }
            }


            // Wire sorting select dropdown
            $("#" + tuid + " .listpeople_sort_order").bind("click", function(e){
                // Reset everything
                sakai.api.UI.listPeople.reset(tuid);

                // Set config to new sort key
                sakai.config.widgets.listpeople[tuid]["sortOrder"] = $("#" + tuid + " #listpeople_sort_order").val();

                // Start from scratch
                sakai.api.UI.listPeople.addSearchPage(tuid, 0, searchQuery);

            });

        },
        error: function(xhr, status, thrown) {

            // If it's likely to be a genuine server error
            if ($pl_pageContainer.length === 0) {
                $pl_container.html($("#" + tuid + " .listpeople_error_template").html());
            } else {
                // Probably it's the last page of the result set
                $pl_pageContainer.last().remove();
                $("#" + tuid + " .listpeople_count_of").hide();
                $("#" + tuid + " .listpeople_count_total").hide();
            }
        }
    });
};


sakai.api.UI.listPeople.getSelection = function(tuid) {
    return sakai.data.listpeople[tuid]["selected"];
};


sakai.api.Widgets.widgetLoader.informOnLoad("listpeople");
