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
sakai.pickeradvanced = {};

/**
 * @name sakai.pickeradvanced
 *
 * @class pickeradvanced
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
sakai.pickeradvanced = function(tuid, showSettings) {
    var $rootel = $("#" + tuid);

    var $pickeradvanced_container = $("#pickeradvanced_container", $rootel);
    var $pickeradvanced_content_search = $("#pickeradvanced_content_search", $rootel);
    var $pickeradvanced_search_query = $("#pickeradvanced_search_query", $rootel);
    var $pickeradvanced_search_button = $("#pickeradvanced_search_button", $rootel);
    var $pickeradvanced_close_button = $("#pickeradvanced_close_button", $rootel);
    var $pickeradvanced_select_all_button = $("#pickeradvanced_select_all_button", $rootel);
    var $pickeradvanced_content_search_form = $("#pickeradvanced_content_search_form", $rootel);
    var $pickeradvanced_add_button = $("#pickeradvanced_add_button", $rootel);
    var $pickeradvanced_sort_on = $("#pickeradvanced_sort_on", $rootel);
    var $pickeradvanced_count = $("#pickeradvanced_count", $rootel);
    var $pickeradvanced_count_person = $("#pickeradvanced_count_person", $rootel);
    var $pickeradvanced_count_people = $("#pickeradvanced_count_people", $rootel);
    var $pickeradvanced_count_of = $("#pickeradvanced_count_of", $rootel);
    var $pickeradvanced_count_thousands = $("#pickeradvanced_count_thousands", $rootel);
    var $pickeradvanced_add_header_what = $("#pickeradvanced_add_header_what", $rootel);
    var $pickeradvanced_add_header_where = $("#pickeradvanced_add_header_where", $rootel);
    var $pickeradvanced_copy_myself = $("#pickeradvanced_copy_myself", $rootel);
    var $pickeradvanced_message = $("#pickeradvanced_message", $rootel);
    var $pickeradvanced_close_dialog = $(".pickeradvanced_close_dialog", $rootel);

    var $pickeradvanced_error_template = $("#pickeradvanced_error_template", $rootel);
    var $pickeradvanced_content_search_pagetemplate = $("#pickeradvanced_content_search_pagetemplate", $rootel);
    var $pickeradvanced_content_search_listtemplate = $("#pickeradvanced_content_search_listtemplate", $rootel);

    var pickeradvanced_page = ".pickeradvanced_page";

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
      "sortOrder": "ascending",
      "what": "People",
      "where": "Group"
    };

    /**
     * Reset
     * Resets the people picker to a default state
     * @returns void
     */
    var reset = function() {
        $pickeradvanced_content_search.html("");
        $pickeradvanced_content_search.unbind("scroll");
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
        // Merge user defined config with defaults
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                pickerData[element] = iConfig[element];
            }
        }

        // display the groups list, bind elements and submit a search
        renderSearchList();      
        $pickeradvanced_search_query.focus();
        $pickeradvanced_search_button.click(submitSearch);
        $pickeradvanced_content_search_form.submit(submitSearch);
        $pickeradvanced_add_button.unbind("click");
        $pickeradvanced_add_button.bind("click", function(){
            addPeople();
        });
        submitSearch();
    };

    /**
     * submitSearch
     * Perform the search based on the value in the $pickeradvanced_search_query text input box
     * @returns void
     */
    var submitSearch = function(){
        reset();
        var searchQuery = $pickeradvanced_search_query.val();
        if (!searchQuery) {
            searchQuery = "*";
        } else {
            searchQuery = "*" + searchQuery + "*";
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
        var $pl_listContainer = $("<ul id=\"pickeradvanced_list\" class=\"pickeradvanced_list loadinganim\"></ul>");

        // Display empty new container with loading anim
        $pickeradvanced_content_search.append($pl_listContainer);

        // Elements to display in the list
        var listData = {
            people : [ { name: "All Contacts", id: sakai.config.URL.SEARCH_USERS + "?page=0&items=12&_=&q=" },
                       { name: "Everyone", id: sakai.config.URL.SEARCH_USERS + "?page=0&items=12&_=&q=" }]
        };

        // Render the results data template
        var pageHTML = $.TemplateRenderer($pickeradvanced_content_search_listtemplate, listData);

        // Remove loading animation
        $pl_listContainer.removeClass("loadinganim");

        // Inject results into DOM
        $pl_listContainer.html(pageHTML);

        // Make All Contacts selected by default
    //    $('[data-id='+sakai.config.URL.SEARCH_USERS_ACCEPTED+']').addClass("pickeradvanced_selected_list");
        pickerData["searchIn"] = sakai.config.URL.SEARCH_USERS + "?page=0&items=12&_=&q=";

        // Bind the list and submit the search
        $("#" + tuid + " .pickeradvanced_list li").live("click", function(e){
            $(".pickeradvanced_selected_list").removeClass("pickeradvanced_selected_list");
            $(this).addClass("pickeradvanced_selected_list");
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
        // Create new container for the bit we load. This is then appended to the
        // main container
        var $pl_pageContainer = $("<ul id=\"pickeradvanced_page_" + pageNumber + "\" class=\"pickeradvanced_page pickeradvanced_page_list loadinganim\"></ul>");

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
        $pickeradvanced_content_search.append($pl_pageContainer);

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
                var pageHTML = $.TemplateRenderer($pickeradvanced_content_search_pagetemplate, rawData);

                // Remove loading animation
                $pl_pageContainer.removeClass("loadinganim");

                // Inject results into DOM
                $pl_pageContainer.html(pageHTML);
                // Wire loading the next page when user scrolls to the bottom of the list
                if ((rawData.total > searchQuery.items) || (rawData.total === -1)) {
                    $pickeradvanced_content_search.bind("scroll", function(e){

                        if ((e.target.scrollHeight - e.target.scrollTop - $(e.target).height() ) === 0) {
                            $pickeradvanced_content_search.unbind("scroll");
                            sakai.pickerUser.addPage(tuid, (pageNumber + 1), searchQuery);
                        }
                    });
                }

                // Wire item selection
                if (pickerData.selectable) {

                    $pickeradvanced_select_all_button.click(function(){
                        pickerData.selectCount = 0;
                        $('.pickeradvanced_content_search ul li').each(function(index) {
                            $(this).addClass("pickeradvanced_selected_user");
                            pickerData.selectCount += 1;
                            pickerData["selected"][$(this).attr("id")] = rawData.results[i];
                        });
                    });

                    $("#pickeradvanced_page_" + pageNumber + " li", $rootel).bind("click", function(e){
                        // Check if user click on top of a link
                        if (e.target.tagName.toLowerCase() !== "a") {
                            // Remove from selected list
                            if ($(this).hasClass("pickeradvanced_selected_user")) {
                                $(this).removeClass("pickeradvanced_selected_user");
                                delete pickerData["selected"][$(this).attr("id")];
                                for (var i = 0; i < rawData.results.length; i++) {
                                    if (rawData.results[i]['rep:userId'] == [$(this).attr("id")]) {
                                        delete pickerData["selected"][$(this).attr("id")];
                                        pickerData.selectCount -= 1;
                                    }
                                }
                            } else {
                                // Add to selected list
                                $(this).addClass("pickeradvanced_selected_user");
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
                $pickeradvanced_count_people.hide();
                $pickeradvanced_count_person.hide();
                //Set search result count
                if ((rawData.total === -1) || (rawData.total > 1000)) {
                    // If we don't know the total display what we know
                    $pickeradvanced_count.html(pickerData.currentElementCount);
                    $pickeradvanced_count.show();
                    $pickeradvanced_count_people.show();
                    $pickeradvanced_count_of.show();
                    $pickeradvanced_count_thousands.show();

                } else {
                    // If we know the exact total display it
                    $pickeradvanced_count.html(rawData.total);
                    $pickeradvanced_count.show();
                    if (rawData.total === 1) {
                        $pickeradvanced_count_person.show();
                    } else {
                        $pickeradvanced_count_people.show();
                    }
                }

                // Wire sorting select dropdown
                $pickeradvanced_sort_on.bind("change", function(e){
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
                    $pickeradvanced_content_search.html($pickeradvanced_error_template.html());
                } else {
                    // Probably it's the last page of the result set
                    $pl_pageContainer.last().remove();
                    $pickeradvanced_count_of.hide();
                    $pickeradvanced_count_thousands.hide();
                }
            }
        });
    };

    $pickeradvanced_container.jqm({
        modal: true,
        overlay: 20,
        zIndex: 4000
    });
    
    var addPeople = function() {
      //sakai.api.Communication.sendMessage = function(to, subject, body, category, reply, callback) {  
      var userList = $("#as-values-" + tuid).val();
      // this value is a comma-delimited list
      // split it and get rid of any empty values in the array
      userList = userList.split(",");
      $(userList).each(function(i, val) {
         if (val === "") {
             userList.splice(i, 1);
         } 
      });
      $pickeradvanced_container.jqmHide();
      $(window).trigger("sakai-pickeradvanced-finished", {"toAdd":userList});
    };


    ////////////
    // Events //
    ////////////
    
    $(window).unbind("sakai-pickeradvanced-init");
    $(window).bind("sakai-pickeradvanced-init", function(e, config, callbackFn) {
        $pickeradvanced_container.jqmShow();
        render(config);
        callback = callbackFn;
    });
    
    $pickeradvanced_close_dialog.bind("click", function() {
        $pickeradvanced_container.jqmHide();
    });

    $pickeradvanced_close_button.bind("click", function() {
        $pickeradvanced_container.jqmHide();
    });

    // Reset to defaults
    reset();

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code

    $(window).trigger("sakai-pickeradvanced-ready");

};

sakai.api.Widgets.widgetLoader.informOnLoad("pickeradvanced");