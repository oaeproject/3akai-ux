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

/*global $, Config, History */

var sakai = sakai || {};
sakai.search = function() {


    //////////////////////
    // Config variables //
    //////////////////////

    var resultsToDisplay = 10;
    var searchterm = "";
    var currentpage = 0;

    // Search URL mapping
    var searchURLmap = {
        allfiles : sakai.config.URL.SEARCH_ALL_FILES_SERVICE,
        mybookmarks : sakai.config.URL.SEARCH_MY_BOOKMARKS,
        mycontacts : sakai.config.URL.SEARCH_MY_CONTACTS,
        myfiles : sakai.config.URL.SEARCH_MY_FILES,
        mysites : sakai.config.URL.SEARCH_MY_SITES,
        pooledcontentmanager: sakai.config.URL.POOLED_CONTENT_MANAGER,
        pooledcontentviewer: sakai.config.URL.POOLED_CONTENT_VIEWER
    };

    // CSS IDs
    var search = "#search";

    var searchSiteSelect = $(search + "_site_select");
    var searchSiteSelectTemplate = "search_site_select_template";

    var searchConfig = {
        search : "#search",
        global : {
            resultTemp : search + "_result_temp",
            button : search + "_button",
            text  :search + '_text',
            numberFound : search + '_numberFound',
            searchTerm : search + "_mysearchterm",
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
            template : 'search_results_template'
        },
        facetedConfig : {
            title : "Refine your search",
            value : "Content",
            categories : ["Content I manage", "My content", "Content I can see"],
            searchurls : [searchURLmap.pooledcontentmanager, searchURLmap.mysites, searchURLmap.pooledcontentviewer]
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
        $(searchConfig.global.numberFound).text("0");
        $(searchConfig.results.header).show();
        $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
    };


    //////////////////////////
    // Search Functionality //
    //////////////////////////

    /**
     * Used to do a search. This will add the page and the searchterm to the url and add
     * it too the history without reloading the page. This way the user can navigate
     * using the back and forward button.
     * @param {Integer} page The page you are on (optional / default = 1.)
     * @param {String} searchquery The searchterm you want to look for (optional / default = input box value.)
     */
    var doHSearch = function(page, searchquery, searchwhere) {
        if (!page) {
            page = 1;
        }
        if (!searchquery) {
            searchquery = $(searchConfig.global.text).val();
        }
        if (!searchwhere) {
            searchwhere = mainSearch.getSearchWhereSites();
        }
        currentpage = page;

        // This will invoke the sakai._search.doSearch function and change the url.
        History.addBEvent(page, encodeURIComponent(searchquery), searchwhere);
    };

    /**
     * When the pager gets clicked.
     * @param {integer} pageclickednumber The page you want to go to.
     */
    var pager_click_handler = function(pageclickednumber) {
        currentpage = pageclickednumber;

        // Redo the search
        doHSearch(currentpage, searchterm);
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
                finaljson = mainSearch.prepareCMforRendering(results.results, finaljson, searchterm);
            }

            // We hide the pager if we don't have any results or
            // they are less then the number we should display
            if (results.total < resultsToDisplay) {
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
     * We override these with our owm implementation.
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
    sakai._search.doSearch = function(page, searchquery, searchwhere, facetedurl) {

        // Check if the searchquery is empty
        if(searchquery === ""){

            // If there is nothing in the search query, remove the html and hide some divs
            $(searchConfig.results.container).html();
            $(".search_results_container").hide();
            $("#faceted_container").hide();
            $(searchConfig.results.header).hide();
            $(searchConfig.global.pagerClass).hide();
            return;
        }

        if (isNaN(page)){
            page = 1;
        }

        currentpage = parseInt(page,  10);

        // Set all the input fields and paging correct.
        mainSearch.fillInElements(page, searchquery, searchwhere);

        var dd = $("#search_filter").get(0);
        if (dd && dd.options) {
          for (var i = 0, j = dd.options.length; i<j; i++){
              if (dd.options[i].value == searchwhere){
                  dd.selectedIndex = i;
              }
          }
        }

        // Get the search term out of the input box.
        // If we were redirected to this page it will be added previously already.
        searchterm = $(searchConfig.global.text).val();

        // Rebind everything
        mainSearch.addEventListeners(searchterm, searchwhere);

        if (searchterm) {
            // Show and hide the correct elements.
            showSearchContent();

            // Sites Search
            var searchWhere = mainSearch.getSearchWhereSites();

            // What are we looking for?
            var urlsearchterm = mainSearch.prepSearchTermForURL(searchterm);

            var url = "";
            var usedIn = [];

            // Check if there is a site defined, if so we need to change the url to all files
            if(searchWhere === "mysites"){
                url = searchURLmap[searchWhere];
            }
            else if(searchWhere === "*"){
                url = searchURLmap.allfiles;
            }else {
                url = searchURLmap.allfiles;
                usedIn = searchWhere;
            }
            
            // Check if we want to search using a faceted link
            if (facetedurl)
                url = facetedurl;

            $.ajax({
                url: url,
                data: {
                    "q" : urlsearchterm,
                    "page" : (currentpage - 1),
                    "items" : resultsToDisplay,
                    "usedin" : usedIn
                },
                success: function(data) {
                    renderResults(data, true);
                },
                error: function(xhr, textStatus, thrownError) {
                    var json = {};
                    renderResults(json, false);
                }
            });

        }
        else {
            sakai._search.reset();
        }
    };

    /**
     * Will reset the view to standard.
     */
    sakai._search.reset = function() {
        $(searchConfig.results.header).hide();
    };


    //////////////////////
    // init function    //
    //////////////////////

    /**
     * Will fetch the sites and add a new item to the history list.
     */
    var doInit = function() {
        // Make sure that we are still logged in.
        if (mainSearch.isLoggedIn()) {

            $.ajax({
                url: sakai.config.URL.SITES_SERVICE,
                cache: false,
                success: function(data){
                    data = data.results;
                    var sites = {
                        "sites" : data
                    };
                    searchSiteSelect.html($.TemplateRenderer(searchSiteSelectTemplate, sites));

                    // Get my sites
                    mainSearch.getMySites();
                }
            });
        }
        // Add the bindings
        mainSearch.addEventListeners();

        // display faceted panel
        mainSearch.addFacetedPanel();
    };

    var thisFunctionality = {
        "doHSearch" : doHSearch
    };

    var mainSearch = sakai._search(searchConfig, thisFunctionality);

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.search");
