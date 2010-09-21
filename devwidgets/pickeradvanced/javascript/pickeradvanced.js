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
    var $pickeradvanced_content_list = $("#pickeradvanced_content_list", $rootel);
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
    var $pickeradvanced_search_filter = $(".pickeradvanced_search_filter");

    var $pickeradvanced_error_template = $("#pickeradvanced_error_template", $rootel);
    var $pickeradvanced_content_search_pagetemplate = $("#pickeradvanced_content_search_pagetemplate", $rootel);
    var $pickeradvanced_content_search_listtemplate = $("#pickeradvanced_content_search_listtemplate", $rootel);
    var $pickeradvanced_group_search_template = $("#pickeradvanced_group_search_template", $rootel);
    var $pickeradvanced_group_specific_filters = $("#pickeradvanced_group_specific_filters", $rootel);

    var $pickeradvanced_search_titles = $(".pickeradvanced_search_titles", $rootel);
    var $pickeradvanced_search_people = $("#pickeradvanced_search_people", $rootel);
    var $pickeradvanced_search_files = $("#pickeradvanced_search_files", $rootel);

    var pickeradvanced_page = ".pickeradvanced_page";

    var pickerlist = false;

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
      "where": "Group",
      "limit": false
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
        pickerData["searchIn"] = sakai.config.URL.CONTACTS_ACCEPTED + "?page=0&items=12&_=&q=";

        // Merge user defined config with default
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                pickerData[element] = iConfig[element];
            }
        }

        // display the groups list, bind elements and submit a search
        $pickeradvanced_search_titles.hide();
        $(".pickeradvanced_selected_list").removeClass("pickeradvanced_selected_list"); // deselect anything that was selected
        if (pickerData["type"] === "people") {
            $("#pickeradvanced_search_contacts").parent("li").addClass("pickeradvanced_selected_list");
            getGroups();
            $pickeradvanced_sort_on.show();
            $pickeradvanced_search_people.show();
        } else if (pickerData["type"] === "content") {
            $pickeradvanced_sort_on.hide();
            $pickeradvanced_search_files.show();
            pickerData["searchIn"] = sakai.config.URL.POOLED_CONTENT_MANAGER.replace(".json", ".infinity.json") + "?page=0&items=12&_=&q=";
        }
        $("ul.pickeradvanced_search_" + pickerData["type"]).show();
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
     * get groups for this user to search on
     */
    var getGroups = function() {
        $pickeradvanced_group_specific_filters.html('');
        $(sakai.data.me.groups).each(function(i,val) {
            var groupItem = $.TemplateRenderer($pickeradvanced_group_search_template, {"data":val});
            $pickeradvanced_group_specific_filters.append(groupItem);
        });
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
            searchQuery = $.trim(searchQuery);
            searchQuery = searchQuery.replace(/\s+/g, "* OR *");
            searchQuery = "*" + searchQuery + "*";
        }

        var pl_query = pickerData["searchIn"] + searchQuery + "&page=0&items=12&_=" + (Math.random() * 100000000000000000);
        renderSearch(pl_query);
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
        if (pickerData["type"] === "people") {
            searchQuery.sortOn = pickerData["sortOn"];
            searchQuery.sortOrder = pickerData["sortOrder"];
        }

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
                var doAdd = true;
                var newData = [];
                for (var i = 0, il = rawData.results.length; i < il; i++) {
                    doAdd = true;
                    if (rawData.results[i].profile) {
                        rawData.results[i] = rawData.results[i].profile;
                    }
                    if ($.inArray(rawData.results[i].user, pickerlist) !== -1) {
                        doAdd = false;
                    }
                    if (rawData.results[i]['rep:userId'] && (rawData.results[i]['rep:userId'] === "admin" || rawData.results[i]['rep:userId'] === "anonymous")) {
                        doAdd = false;
                    }
                    if (doAdd) {
                        newData.push(rawData.results[i]);
                    }
                }
                rawData.results = newData;
                rawData.total = newData.length;

                // Render the results data template
                var pageHTML = $.TemplateRenderer($pickeradvanced_content_search_pagetemplate, rawData);

                // Remove loading animation
                $pl_pageContainer = $(".pickeradvanced_page.pickeradvanced_page_list.loadinganim");
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
                    $pickeradvanced_select_all_button.unbind("click");
                    $pickeradvanced_select_all_button.click(function(){
                        pickerData.selectCount = 0;
                        $('#pickeradvanced_content_search ul li').each(function(i) {
                            $(this).addClass("pickeradvanced_selected_user");
                            pickerData.selectCount += 1;
                            pickerData["selected"][$(this).attr("id")] = rawData.results[i];
                            if (rawData.results[i]['rep:userId']) {
                                pickerData["selected"][$(this).attr("id")].entityType = "user";
                            } else if (rawData.results[i]['sakai:group-id']) {
                                pickerData["selected"][$(this).attr("id")].entityType = "group";
                            } else if (rawData.results[i]['jcr:name']) {
                                pickerData["selected"][$(this).attr("id")].entityType = "file";
                            }
                            if ($pickeradvanced_add_button.is(":disabled")) {
                                $pickeradvanced_add_button.attr("disabled", "");
                            }
                        });
                    });
                    $("#pickeradvanced_page_" + pageNumber + " li").unbind("click");
                    $("#pickeradvanced_page_" + pageNumber + " li").bind("click", function(e){
                        // Check if user click on top of a link
                        if (e.target.tagName.toLowerCase() !== "a") {
                            // Remove from selected list
                            if ($(this).hasClass("pickeradvanced_selected_user")) {
                                $(this).removeClass("pickeradvanced_selected_user");
                                delete pickerData["selected"][$(this).attr("id")];
                                pickerData.selectCount -= 1;
                                if (pickerData.selectCount < 1) {
                                    $pickeradvanced_add_button.attr("disabled", "disabled");
                                }
                            } else {
                                if ((pickerData.limit && pickerData.selectCount < pickerData.limit) || !pickerData.limit) {
                                    // Add to selected list
                                    $(this).addClass("pickeradvanced_selected_user");
                                    for (var j = 0; j < rawData.results.length; j++) {
                                        if (rawData.results[j]['rep:userId'] && rawData.results[j]['rep:userId'] == [$(this).attr("id")]) {
                                            pickerData.selectCount += 1;
                                            pickerData["selected"][$(this).attr("id")] = rawData.results[j];
                                            pickerData["selected"][$(this).attr("id")].entityType = "user";
                                        } else if (rawData.results[j]['sakai:group-id'] && rawData.results[j]['sakai:group-id'] == [$(this).attr("id")]) {
                                            pickerData.selectCount += 1;
                                            pickerData["selected"][$(this).attr("id")] = rawData.results[j];
                                            pickerData["selected"][$(this).attr("id")].entityType = "group";
                                        } else if (rawData.results[j]['jcr:name'] && rawData.results[j]['jcr:name'] == [$(this).attr("id")]) {
                                            pickerData.selectCount += 1;
                                            pickerData["selected"][$(this).attr("id")] = rawData.results[j];
                                            pickerData["selected"][$(this).attr("id")].entityType = "file";
                                        }
                                    }
                                }
                                if ($pickeradvanced_add_button.is(":disabled")) {
                                    $pickeradvanced_add_button.attr("disabled", "");
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
                $pickeradvanced_sort_on.unbind("change");
                $pickeradvanced_sort_on.bind("change", function(e){
                    // Reset everything
                    reset();

                    // Set config to new sort key
                    pickerData["sortOn"] = $(this).val().split("_")[0];
                    pickerData["sortOrder"] = $(this).val().split("_")[1];
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
        zIndex: 4000,
        toTop: true
    });
    
    var addPeople = function() {
      // this value is a comma-delimited list
      // split it and get rid of any empty values in the array
      $pickeradvanced_container.jqmHide();
      $(window).trigger("sakai-pickeradvanced-finished", {"toAdd":pickerData["selected"]});
    };


    ////////////
    // Events //
    ////////////
    
    $(window).unbind("sakai-pickeradvanced-init");
    $(window).bind("sakai-pickeradvanced-init", function(e, config) {
        render(config.config);
        $pickeradvanced_container.jqmShow();
        pickerlist = config.list;
    });
    
    $pickeradvanced_close_dialog.unbind("click");
    $pickeradvanced_close_dialog.bind("click", function() {
        $pickeradvanced_container.jqmHide();
    });

    $pickeradvanced_close_button.unbind("click");
    $pickeradvanced_close_button.bind("click", function() {
        $pickeradvanced_container.jqmHide();
    });

    $pickeradvanced_search_filter.die("click");
    $pickeradvanced_search_filter.live("click", function() {
       var searchType = $(this).attr("id").split("pickeradvanced_search_")[1];
       $(".pickeradvanced_selected_list").removeClass("pickeradvanced_selected_list");
       $(this).parent("li").addClass("pickeradvanced_selected_list");
       var searchURL = false;
       var searchingInGroup = false;
       switch (searchType) {
           case "contacts":
               searchURL = sakai.config.URL.SEARCH_USERS_ACCEPTED;
               break;
           case "users":
               searchURL = sakai.config.URL.SEARCH_USERS;
               break;
           case "groups":
               searchURL = sakai.config.URL.SEARCH_GROUPS;
               break;
           case "groups_member":
               searchURL = sakai.config.URL.SEARCH_GROUPS;
               break;
           case "groups_manager":
               searchURL = sakai.config.URL.SEARCH_GROUPS;
               break;
           case "files_mine":
               searchURL = sakai.config.URL.POOLED_CONTENT_MANAGER.replace(".json", ".infinity.json");
               break;
           case "files_view":
               searchURL = sakai.config.URL.POOLED_CONTENT_VIEWER.replace(".json", ".infinity.json");
               break;
           default: // should be any group specific search
               searchURL = sakai.config.URL.SEARCH_GROUP_MEMBERS.replace(".json", ".3.json");
               searchingInGroup = true;
               break;
       }
       if (!searchingInGroup) {
           pickerData["searchIn"] = searchURL + "?page=0&items=12&_=&q=";
       } else {
           pickerData["searchIn"] = searchURL + "?group=" + searchType.split("groups_")[1] + "&q=";
       }
       submitSearch();
    });

    // Reset to defaults
    reset();

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code

    $(window).trigger("sakai-pickeradvanced-ready");

};

sakai.api.Widgets.widgetLoader.informOnLoad("pickeradvanced");