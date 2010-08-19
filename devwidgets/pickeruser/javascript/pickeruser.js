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
 * @name sakai.pickerUser
 *
 * @description
 * Public functions for the people picker widget
 */
sakai.pickerUser = {};

/**
 * @name sakai.pickeruser
 *
 * @class pickeruser
 *
 * @description
 * People Picker widget<br />
 * This is a general widget which aims to display an arbitriary number of
 * people, loading dynamically if the list is very long and return the
 * selected users in an object.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.pickeruser = function(tuid, showSettings) {

    var $rootel = $("#" + tuid);

    var $pickeruser_container = $("#pickeruser_container", $rootel);
    var $pickeruser_content_search = $("#pickeruser_content_search", $rootel);
    var $pickeruser_space_name = $("#pickeruser_space_name", $rootel);
    var $pickeruser_search_query = $("#pickeruser_search_query", $rootel);
    var $pickeruser_search_button = $("#pickeruser_search_button", $rootel);
    var $pickeruser_close_button = $("#pickeruser_close_button", $rootel);
    var $pickeruser_select_all_button = $("#pickeruser_select_all_button", $rootel);
    var $pickeruser_content_search_form = $("#pickeruser_content_search_form", $rootel);
    var $pickeruser_add_button = $("#pickeruser_add_button", $rootel);
    var $pickeruser_display_as = $("#pickeruser_display_as", $rootel);
    var $pickeruser_sort_on = $("#pickeruser_sort_on", $rootel);
    var $pickeruser_count = $("#pickeruser_count", $rootel);
    var $pickeruser_count_person = $("#pickeruser_count_person", $rootel);
    var $pickeruser_count_people = $("#pickeruser_count_people", $rootel);
    var $pickeruser_count_of = $("#pickeruser_count_of", $rootel);
    var $pickeruser_count_thousands = $("#pickeruser_count_thousands", $rootel);
    var $pickeruser_error_template = $("#pickeruser_error_template", $rootel);
    var $pickeruser_content_search_pagetemplate = $("#pickeruser_content_search_pagetemplate", $rootel);
    var $pickeruser_content_search_listtemplate = $("#pickeruser_content_search_listtemplate", $rootel);

    var pickeruser_page = ".pickeruser_page";

    var callback = false;

    var pickerData = {
      "selected": {},
      "searchIn": "",
      "currentElementCount": 0,
      "selectCount": 0,
      "mode": "search",
      "type": "people",
      "spaceName": "Space",
      "items": 50,
      "selectable": true,
      "sortOn": "lastName",
      "sortOrder": "ascending"
    };

    /**
     * Reset
     * Resets the people picker to a default state
     * @returns void
     */
    var reset = function() {
        console.log("sakai.pickeruser.reset");
        $pickeruser_content_search.html("");
        $pickeruser_content_search.unbind("scroll");
        pickerData.selected = {};
        pickerData.currentElementCount = 0;
        pickerData.selectCount = 0;

    };

    /**
     * Render
     * Renders the people picker
     * @param iConfig {String} Config element for the widget
     * @returns void
     */
    var render = function(iConfig) {
        console.log("sakai.pickeruser.render", iConfig);
        // Merge user defined config with defaults
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                pickerData[element] = iConfig[element];
            }
        }



        // display the groups list, bind elements and submit a search
        renderSearchList();
        $pickeruser_space_name.html(pickerData['spaceName']);
        $pickeruser_search_query.focus();
        $pickeruser_search_button.click(submitSearch);
        $pickeruser_content_search_form.submit(submitSearch);
        $pickeruser_add_button.click(function(){
            //$(window).trigger("pickeruser_finished", [tuid]);
        });
        submitSearch();
    };

    /**
     * submitSearch
     * Perform the search based on the value in the $pickeruser_search_query text input box
     * @returns void
     */
    var submitSearch = function(){
        reset();
        var searchQuery = $pickeruser_search_query.val();
        if (!searchQuery) {
            searchQuery = "*";
        }

        var pl_query = pickerData["searchIn"] + searchQuery + "&page=0&items=12&_=" + (Math.random() * 100000000000000000);
        renderSearch(pl_query);
    };

    /**
     * renderSearchList
     * Renders the people picker list to limit search to a specific groups
     * @returns void
     */
    var renderSearchList = function() {
        console.log("sakai.pickeruser.renderSearchList");
        var $pl_listContainer = $("<ul id=\"pickeruser_list\" class=\"pickeruser_list loadinganim\"></ul>");

        // Display empty new container with loading anim
        $pickeruser_content_search.append($pl_listContainer);

        // Elements to display in the list
        var listData = {
            people : [ { name: "All Contacts", id: sakai.config.URL.SEARCH_USERS + "?page=0&items=12&_=&q=" },
                       { name: "Everyone", id: sakai.config.URL.SEARCH_USERS + "?page=0&items=12&_=&q=" }]
        };

        // Render the results data template
        var pageHTML = $.TemplateRenderer($pickeruser_content_search_listtemplate, listData);

        // Remove loading animation
        $pl_listContainer.removeClass("loadinganim");

        // Inject results into DOM
        $pl_listContainer.html(pageHTML);

        // Make All Contacts selected by default
    //    $('[data-id='+sakai.config.URL.SEARCH_USERS_ACCEPTED+']').addClass("pickeruser_selected_list");
        pickerData["searchIn"] = sakai.config.URL.SEARCH_USERS + "?page=0&items=12&_=&q=";

        // Bind the list and submit the search
        $("#" + tuid + " .pickeruser_list li").live("click", function(e){
            $(".pickeruser_selected_list").removeClass("pickeruser_selected_list");
            $(this).addClass("pickeruser_selected_list");
            pickerData["searchIn"] = $(this).attr("id");
            submitSearch();
        });
    };

    /**
     * RenderSearch
     * Renders the people picker with a specified set of data. The function uses
     * a search query initially, then does the paginating and subsequent requests
     * for data automatically
     * @param iSearchQuery {String} A Sakai search query
     * @returns void
     */
    var renderSearch = function(iSearchQuery) {
        console.log("sakai.pickeruser.renderSearch", iSearchQuery);
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
        searchQuery.items = pickerData.items;

        // Add hash to search query in case it's not there to prevent caching
        if (!searchQuery["_"]) {
            searchQuery["_"] = (Math.random() * 100000000000000000);
        }

        // Render the first page of results
        addPage(0, searchQuery);

    };

    /**
     * addPage
     * Adds another page of search result to the People picker's result list
     * @pageNumber {Int} The page we want to load
     * @searchQuery {Object} An object containing the search query elements
     * @returns void
     */
    var addPage = function(pageNumber, searchQuery) {
        console.log("sakai.pickeruser.addPage", pageNumber, searchQuery);
        // Create new container for the bit we load. This is then appended to the
        // main container
        var pl_view = $pickeruser_display_as.val();
        var $pl_pageContainer = $("<ul id=\"pickeruser_page_" + pageNumber + "\" class=\"pickeruser_page pickeruser_page_" + pl_view + " loadinganim\"></ul>");

        // Aadd relevant config elements to the search query
        searchQuery.page = pageNumber;
        searchQuery.sortOn = pickerData["sortOn"];
        searchQuery.sortOrder = pickerData["sortOrder"];

        // Construct search query
        var sq = searchQuery.url + "?";
        for (var e in searchQuery) {
            if (searchQuery.hasOwnProperty(e) && e !== "url") {
                sq += e + "=" + searchQuery[e] + "&";
            }
        }

        // Display empty new container with loading anim
        $pickeruser_content_search.append($pl_pageContainer);

        // Make the request
        $.ajax({
            url: sq,
            type: "GET",
            dataType: "json",
            success: function(rawData) {
                // Eval profile data for now and extend it with additional info
                for (var i = 0, il = rawData.results.length; i < il; i++) {
                    var resultObject = rawData.results[i];

                    // Eval json strings if any
                    // is this useful anymore?
                    for (var j in resultObject) {
                        if (resultObject.hasOwnProperty(j) && typeof resultObject[j] === "string" && resultObject[j].charAt(0) === "{") {
                            rawData.results[i][j] = $.parseJSON(resultObject[j]);
                        }
                    }

                    // Determine what to put under the name. See if specified key exists in main object or under basic profile info
                    var subNameInfo = "";
                    var iSubNameInfo = pickerData["subNameInfo"];
                    if (iSubNameInfo !== "" && typeof iSubNameInfo === "string") {
                        if (rawData.results[i][iSubNameInfo]) {
                            subNameInfo = rawData.results[i][iSubNameInfo];
                        } else if (rawData.results[i]["basic"][iSubNameInfo]) {
                            subNameInfo = rawData.results[i]["basic"][iSubNameInfo];
                        }
                    }
                    rawData.results[i]["subNameInfo"] = subNameInfo;
                }

                // Render the results data template
                var pageHTML = $.TemplateRenderer($pickeruser_content_search_pagetemplate, rawData);

                // Remove loading animation
                $pl_pageContainer.removeClass("loadinganim");

                // Inject results into DOM
                $pl_pageContainer.html(pageHTML);
                // Wire loading the next page when user scrolls to the bottom of the list
                if ((rawData.total > searchQuery.items) || (rawData.total === -1)) {
                    $pickeruser_content_search.bind("scroll", function(e){

                        if ((e.target.scrollHeight - e.target.scrollTop - $(e.target).height() ) === 0) {
                            $pickeruser_content_search.unbind("scroll");
                            sakai.pickerUser.addPage(tuid, (pageNumber + 1), searchQuery);
                        }
                    });
                }

                // Wire item selection
                if (pickerData.selectable) {

                    $pickeruser_select_all_button.click(function(){
                        pickerData.selectCount = 0;
                        $('.pickeruser_content_search ul li').each(function(index) {
                            $(this).addClass("pickeruser_selected_user");
                            pickerData.selectCount += 1;
                            pickerData["selected"][$(this).attr("id")] = rawData.results[i];
                        });
                    });

                    $("#pickeruser_page_" + pageNumber + " li", $rootel).bind("click", function(e){
                        // Check if user click on top of a link
                        if (e.target.tagName.toLowerCase() !== "a") {
                            // Remove from selected list
                            if ($(this).hasClass("pickeruser_selected_user")) {
                                $(this).removeClass("pickeruser_selected_user");
                                delete pickerData["selected"][$(this).attr("id")];
                                for (var i = 0; i < rawData.results.length; i++) {
                                    if (rawData.results[i]['rep:userId'] == [$(this).attr("id")]) {
                                        delete pickerData["selected"][$(this).attr("id")];
                                        pickerData.selectCount -= 1;
                                    }
                                }
                            } else {
                                // Add to selected list
                                $(this).addClass("pickeruser_selected_user");
                                for (var j = 0; j < rawData.results.length; j++) {
                                    if (rawData.results[j]['rep:userId'] == [$(this).attr("id")]) {
                                        pickerData.selectCount += 1;
                                        pickerData["selected"][$(this).attr("id")] = rawData.results[j];
                                    }
                                }
                            }
                        }
                    });
                }

                //Update known total amount of displayed elements
                pickerData.currentElementCount += rawData.results.length;

                //Set search result count
                if ((rawData.total === -1) || (rawData.total > 1000)) {
                    // If we don't know the total display what we know
                    $pickeruser_count.html(pickerData.currentElementCount);
                    $pickeruser_count.show();
                    $pickeruser_count_people.show();
                    $pickeruser_count_of.show();
                    $pickeruser_count_thousands.show();

                } else {
                    // If we know the exact total display it
                    $pickeruser_count.html(rawData.total);
                    $pickeruser_count.show();
                    if (rawData.total === 1) {
                        $pickeruser_count_person.show();
                    } else {
                        $pickeruser_count_people.show();
                    }
                }

                // Change result list layout
                $pickeruser_display_as.bind("change", function(e){
                    $(pickeruser_page, $rootel).removeClass("pickeruser_page_list");
                    $(pickeruser_page, $rootel).removeClass("pickeruser_page_thumbnails");
                    $(pickeruser_page, $rootel).addClass("pickeruser_page_" + $pickeruser_display_as.val());
                });

                // Wire sorting select dropdown
                $pickeruser_sort_on.bind("change", function(e){
                    // Reset everything
                    reset();

                    // Set config to new sort key
                    pickerData["sortOn"] = $(this).val();

                    // Start from scratch
                    addPage(0, searchQuery);

                });
            },
            error: function(xhr, status, thrown) {

                // If it's likely to be a genuine server error
                if ($pl_pageContainer.length === 0) {
                    $pickeruser_content_search.html($pickeruser_error_template.html());
                } else {
                    // Probably it's the last page of the result set
                    $pl_pageContainer.last().remove();
                    $pickeruser_count_of.hide();
                    $pickeruser_count_thousands.hide();
                }
            }
        });
    };

    $pickeruser_container.jqm({
        modal: true,
        overlay: 20,
        toTop: true
    });

    ////////////
    // Events //
    ////////////

    $(window).bind("sakai-pickeruser-init", function(e, config, callbackFn) {
        $pickeruser_container.jqmShow();
        render(config);
        callback = callbackFn;
    });

    $pickeruser_close_button.bind("click", function() {
        $pickeruser_container.jqmHide();
    });

    // Create a config object for this instance
    /*
    sakai.config.widgets.pickeruser = sakai.config.widgets.pickeruser || {};
    pickerData = default_config;
    */
    // Create data object for this instance
    /*
    sakai.data.pickeruser = sakai.data.pickeruser || {};
    sakai.data.pickeruser[tuid] = {};
    sakai.data.pickeruser[tuid].selected = {};
    sakai.data.pickeruser[tuid].searchIn = "";
    sakai.data.pickeruser[tuid].currentElementCount = 0;
    sakai.data.pickeruser[tuid].selectCount = 0;
    */
    // Reset to defaults
    reset();

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code

    $(window).trigger("sakai-pickeruser-ready");

};

sakai.api.Widgets.widgetLoader.informOnLoad("pickeruser");