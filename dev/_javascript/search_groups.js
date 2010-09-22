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

/*global $, Config, History, mainSearch, sakai */


sakai.search = function() {


    //////////////////////////
    //    Config variables    //
    //////////////////////////

    var resultsToDisplay = 10;
    var searchterm = "";
    var tagterm = "";
    var currentpage = 0;
    var currentfacet = "";

    // Search URL mapping
    var searchURLmap = {
        allgroups : sakai.config.URL.SEARCH_GROUPS,
        visiblegroups : sakai.config.URL.SEARCH_GROUPS,
        managergroups : sakai.config.URL.GROUPS_MANAGER,
        membergroups : sakai.config.URL.GROUPS_MEMBER
    };

    // CSS IDs
    var search = "#search";

    var searchConfig = {
        search : "#search",
        global : {
            resultTemp : search + "_result_temp",
            button : search + "_button",
            text  :search + '_text',
            numberFound : search + '_numberFound',
            searchTerm : search + "_mysearchterm",
            tagTerm : search + "_mytagterm",
            searchBarSelectedClass : "search_bar_selected",
            pagerClass : ".jq_pager"
        },
        filters : {
            filter : search + "_filter",
            sites : {
                filterSites : search + "_filter_my_sites",
                filterSitesTemplate : "search_filter_my_sites_template",
                ids : {
                    entireCommunity : '#search_filter_community',
                    allMySites : '#search_filter_all_my_sites',
                    specificSite : '#search_filter_my_sites_'
                },
                values : {
                    entireCommunity :'entire_community',
                    allMySites : "all_my_sites"
                }
            }
        },
        tabs : {
            all : "#tab_search_all",
            content : "#tab_search_content",
            people : "#tab_search_people",
            sites : "#tab_search_sites"
        },
        results : {
            container : search + '_results_container',
            header : search + '_results_header',
            tagHeader : search +  '_results_tag_header',
            template : 'search_results_template'
        },
        facetedConfig : {
            title : "Refine your search",
            value : "Groups",
            facets: {
                "all": {
                    "category": "All Groups",
                    "searchurl": searchURLmap.allgroups
                }, 
                "manage": {
                    "category": "Groups I manage",
                    "searchurl": searchURLmap.managergroups
                },
                "member": {
                    "category": "Groups I'm a member of",
                    "searchurl": searchURLmap.membergroups
                }
            }
        }
    };


    ///////////////
    // Functions //
    ///////////////

    /**
     * This method will show all the appropriate elements for when a search is executed.
     */
    var showSearchContent = function() {
        $(searchConfig.global.searchTerm).text(sakai.api.Security.saneHTML(searchterm));
        $(searchConfig.global.tagTerm).text(sakai.api.Security.saneHTML(tagterm));
        $(searchConfig.global.numberFound).text("0");
        $(searchConfig.results.header).show();
        $(searchConfig.results.tagHeader).hide();
        $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
    };


    //////////////////////////
    // Search Functionality    //
    //////////////////////////

    /**
     * Used to do a search. This will add the page and the searchterm to the url and add
     * it too the history without reloading the page. This way the user can navigate
     * using the back and forward button.
     * @param {Integer} page The page you are on (optional / default = 1.)
     * @param {String} searchquery The searchterm you want to look for (optional / default = input box value.)
     * @param {String} searchwhere The subset of sites you want to search in
     */
    sakai._search.doHSearch = function(page, searchquery, searchwhere, facet) {
        if (!page) {
            page = 1;
        }
        if (!searchquery) {
            searchquery = $(searchConfig.global.text).val().toLowerCase();
        }
        if (!searchwhere) {
            searchwhere = mainSearch.getSearchWhereSites();
        }
        if (!facet){
            facet = $.bbq.getState('facet');
        }

        currentpage = page;
        // This will invoke the sakai._search.doSearch function and change the url.
        History.addBEvent(page, encodeURIComponent(searchquery), searchwhere, facet);
    };

    /**
     * When the pager gets clicked.
     * @param {integer} pageclickednumber The page you want to go to.
     */
    var pager_click_handler = function(pageclickednumber) {
        currentpage = pageclickednumber;

        // Redo the search
        sakai._search.doHSearch(currentpage, searchterm, null, $.bbq.getState('facet'));
    };

    /**
     * This will render all the results we have found.
     * @param {Object} results The json object containing all the result info.
     * @param {Boolean} success
     */
    var renderResults = function(results, success) {
        var finaljson = {};
        finaljson.items = [];
            if (success) {
                // if results are returned in a different format
                if (!results.results){
                    var resultCount = 0;
                    $.each(results, function(index, resultObject) {
                        resultCount++;
                    });
                    var resultsTemp = {results : results, total : resultCount}; 
                    results = resultsTemp;
                }

            // Adjust display global total
            // If number is higher than a configurable threshold show a word instead conveying ther uncountable volume -- TO DO: i18n this
            if ((results.total <= sakai.config.Search.MAX_CORRECT_SEARCH_RESULT_COUNT) && (results.total >= 0)) {
                $(searchConfig.global.numberFound).text(""+results.total);
            } else if (results.results.length <= 0) {
                $(searchConfig.global.numberFound).text(0);
            } else {
                $(searchConfig.global.numberFound).text("thousands");
            }

            // Reset the pager.
            $(searchConfig.global.pagerClass).pager({
                pagenumber: currentpage,
                pagecount: Math.ceil(results.total / resultsToDisplay),
                buttonClickCallback: pager_click_handler
            });

            // If we have results we add them to the object.
            if (results && results.results) {
                finaljson.items = results.results;
                for (var group in finaljson.items){
                    if (finaljson.items.hasOwnProperty(group) && finaljson.items[group]["sakai:group-title"]) {
                        finaljson.items[group]["sakai:group-title"] = sakai.api.Security.escapeHTML(finaljson.items[group]["sakai:group-title"]);
                    }
                }

                // If result is page content set up page path
                for (var i=0, j=finaljson.items.length; i<j; i++ ) {
                    var full_path = finaljson.items[i]["path"];
                    var site_path = finaljson.items[i]["sakai:group-id"];
                    var page_path = site_path;

                    if (finaljson.items[i]["excerpt"]) {
                        var stripped_excerpt = $(""+finaljson.items[i]["excerpt"] + "").text().replace(/<[^>]*>/g, "");
                        finaljson.items[i]["excerpt"] = stripped_excerpt;
                    }
                    if (finaljson.items[i]["type"] === "sakai/pagecontent") {
                        page_path = full_path.replace(/\/_pages/g, "");
                        page_path = page_path.replace(/\/pageContent/g, "");
                        page_path = page_path.replace(/\//g,"");
                        page_path = site_path + "#" + page_path;

                    }
                    finaljson.items[i]["pagepath"] = page_path;
                }
            }

            // If we don't have any results or they are less then the number we should display
            // we hide the pager
            if ((results.total < resultsToDisplay) || (results.results.length <= 0)) {
                $(searchConfig.global.pagerClass).hide();
            }
            else {
                $(searchConfig.global.pagerClass).show();
            }
        }
        else {
            $(searchConfig.global.pagerClass).hide();
        }

        // Render the results.
        $(searchConfig.results.container).html($.TemplateRenderer(searchConfig.results.template, finaljson));
        $(".search_results_container").show();
    };


    ///////////////////////
    // _search Functions //
    ///////////////////////

    /*
     * These are functions that are defined in search_history.js .
     * We override these with our own implementation.
     */


    /**
     * This function gets called everytime the page loads and a new searchterm is entered.
     * It gets called by search_history.js
     * @param {Integer} page The page you are on.
     * @param {String} searchquery The searchterm you want to search trough.
     * @param {string} searchwhere The subset of sites you want to search in.
     *  * = entire community
     *  mysites = the site the user is registered on
     *  /a-site-of-mine = specific site from the user
     */
    sakai._search.doSearch = function(page, searchquery, searchwhere, facet) {

        // Get the tag if present.
        tagterm = mainSearch.getSearchTags();

        facetedurl = mainSearch.getFacetedUrl();

        if (facet){
            facetedurl = searchConfig.facetedConfig.facets[facet].searchurl;
        } else {
            facet = "";
        }
        
        $(".faceted_category").removeClass("faceted_category_selected");
        if (facet) {
            $("#" + facet).addClass("faceted_category_selected");
        } else {
            $(".faceted_category:first").addClass("faceted_category_selected");
        }

        if (isNaN(page)){
            page = 1;
        }

        currentpage = parseInt(page,  10);

        // Set all the input fields and paging correct.
        mainSearch.fillInElements(page, searchquery, searchwhere);

        // Get the search term out of the input box.
        // If we were redirected to this page it will be added previously already.
        searchterm = $(searchConfig.global.text).val().toLowerCase();

        // Rebind everything
        mainSearch.addEventListeners(searchterm, searchwhere);

        if (searchterm && searchterm !== $(searchConfig.global.text).attr("title").toLowerCase()) {

            // Show and hide the correct elements.
            showSearchContent();

            // Set off the AJAX request

            // sites Search
            var searchWhere = mainSearch.getSearchWhereSites();

            var urlsearchterm = "";
            var splitted = searchterm.split(" ");
            for (var i = 0; i < splitted.length; i++) {
                urlsearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
            }

            var searchURL = sakai.config.URL.SEARCH_GROUPS + "?page=" + (currentpage - 1) + "&items=" + resultsToDisplay + "&q=" + urlsearchterm;

            // Check if we want to search using a faceted link
            if (facetedurl) {
                // only simple search terms supported for these URLs - KERN-1020
                if (facetedurl === sakai.config.URL.GROUPS_MANAGER || facetedurl === sakai.config.URL.GROUPS_MEMBER) {
                    urlsearchterm = searchterm
                }
                
                searchURL = facetedurl + "?page=" + (currentpage - 1) + "&items=" + resultsToDisplay + "&q=" + urlsearchterm + "&facet=" + facet;
            }

            $.ajax({
                url: searchURL,
                cache: false,
                success: function(data) {
                    renderResults(data, true);
                },
                onFail: function(status) {
                    var json = {};
                    renderResults(json, false);
                }
            });

        } else if (tagterm) {
            // Show and hide the correct elements.
            showSearchContent();
            $(searchConfig.results.header).hide();
            $(searchConfig.results.tagHeader).show();

            // Search based on tags and render each search section
            $.ajax({
                url: tagterm + ".tagged.5.json",
                cache: false,
                success: function(data) {

                    var json = {};
                    if (typeof(data) === 'string') {
                        data = $.parseJSON(data);
                    }
                    json.results = data;
                    json.items = json.results.length;
                    renderResults(json, true);
                },
                error: function(xhr, textStatus, thrownError) {
                    var json = {};
                    renderResults(json, false);
                }
            });
        } else {
            sakai._search.reset();
        }
    };

    /**
     * Will reset the view to standard.
     */
    sakai._search.reset = function() {
        $(searchConfig.results.header).hide();
    };


    ///////////////////
    // Init Function //
    ///////////////////

    /**
     * Will fetch the sites and add a new item to the history list.
     */
    var doInit = function() {

        // Get my sites
        mainSearch.getMySites();
        // Add the bindings
        mainSearch.addEventListeners();

        // display faceted panel
        mainSearch.addFacetedPanel();

    };


    var thisFunctionality = {
        "doHSearch" : sakai._search.doHSearch
    };

    var mainSearch = sakai._search(searchConfig, thisFunctionality);

    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.search");
