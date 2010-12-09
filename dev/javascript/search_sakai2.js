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
    var newjson = false;

    // Add Group Button links
    var createGroupContainer = "#creategroupcontainer";
    var searchAddGroupButton = ".search_add_group_button";

    var searchAjaxCall = false;

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
            sites : "#tab_search_sites",
            sakai2 : "#tab_search_sakai2"
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
            facets:{
                    "all": {
                        "category": "All sites",
                        "searchurl": searchURLmap.allgroups
                    }
                }
        }
    };

    /**
     * This will render all the results we have found.
     * @param {Object} results The json object containing all the result info.
     * @param {Boolean} success
     */
    var renderResults = function(results, success) {
        // show the total result found.
        $(searchConfig.global.numberFound).text(results.total);
        // show header
        $(searchConfig.results.header).show();

        // Reset the pager.
        $(searchConfig.global.pagerClass).pager({
            pagenumber: currentpage,
            pagecount: Math.ceil(Math.abs(results.total) / resultsToDisplay),
            buttonClickCallback: pager_click_handler
        });

        // We hide the pager if we don't have any results or
        // they are less then the number we should display
        if (results.total <= resultsToDisplay) {
            $(searchConfig.global.pagerClass).hide();
        }
        else {
            $(searchConfig.global.pagerClass).show();
        }

        // Render the results.
        $(searchConfig.results.container).html($.TemplateRenderer(searchConfig.results.template, results));
        //show results
        $(".search_results_container").show();

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
    sakai._search.doHSearch = function(page, searchquery, searchwhere, facet, killPreviousAjaxCall) {
        // if killpreviousajaxcall is true then kill the previous ajax request
        if (killPreviousAjaxCall) {
            searchAjaxCall.abort();
        }

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
        History.addBEvent(page,encodeURIComponent(searchquery), searchwhere, facet);
    };

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

        // if there is facet selected then remove previous one and highlight new one
        if (facet) {
            $(".faceted_category").removeClass("faceted_category_selected");
            $("#" + facet).addClass("faceted_category_selected");
        }
        
        if (isNaN(page)){
            page = 1;
        }

        // Set all the input fields and paging correct.
        mainSearch.fillInElements(page, searchquery, searchwhere);

        // Get the search term out of the input box.
        // If we were redirected to this page it will be added previously already.
        searchterm = $(searchConfig.global.text).val().toLowerCase();

        // Rebind everything
        mainSearch.addEventListeners(searchterm, searchwhere);

        if (searchquery && searchterm && searchterm !== $(searchConfig.global.text).attr("title").toLowerCase()) {
            
            // Show and hide the correct elements.
            showSearchContent();
            
            var categoryname = facet === "all" ? false: facet;
            
            // if all is not selected used the newjson
            var newJson = filterCategory(page, searchterm, categoryname, newjson);

            renderResults(newJson,true);
            
        } else {
            sakai._search.reset();
        }
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
     * This function loop through all category if all is slected and loop through related category
     * if other category is slected.
     * @param {String} searchterm The searchterm you want to search trough.
     * @param {string} category The category you want to search in.
     * @param {Object} json The search result json object.
     */
    var filterCategory = function(page, searchterm, categoryname, json){
        var resultJson = {};
        resultJson.sites = [];

        for(var i in json.categories){
            var category = json.categories[i];
            if(category.category.replace(/_/gi,"") === categoryname) {
                resultJson = filterSearch(searchterm, category, resultJson);
                break;
            } else if(!categoryname) {
                 resultJson = filterSearch(searchterm, category, resultJson);
            }
        }

         resultJson.total = resultJson.sites.length;
         
         var pagingIndex = (page-1) * resultsToDisplay;
         var lastIndex = pagingIndex+resultsToDisplay;
         
         if(lastIndex <= resultJson.sites.length){
             lastIndex = lastIndex;
             console.log(pagingIndex);
             console.log(lastIndex)
             resultJson.sites = resultJson.sites.slice(pagingIndex,lastIndex);
         }
         else {
             lastIndex = resultJson.sites.length ;
             console.log(pagingIndex);
             console.log(lastIndex);
             resultJson.sites = resultJson.sites.slice(pagingIndex,lastIndex);
         }

         return resultJson;
    }

    /**
     * This function loop through the site and check if search term is in the description or title
     * @param {String} searchterm The searchterm you want to search trough.
     * @param {string} category The category you want to search in.
     * @param {Object} resultJson The search result json object.
     */
    var filterSearch = function(searchterm, category , resultJson) {
        for(var j=0;j<category.sites.length;j++){
            var site = category.sites[j];
            if(searchterm === "*"){
                if(!isItemExists(resultJson.sites,site))
                    resultJson.sites.push(site);
            }else if(site.title.toLowerCase().search(searchterm) > -1){
                if(!isItemExists(resultJson.sites,site))
                    resultJson.sites.push(site);
            }
            else if (site.description) {
                if(site.description.toLowerCase().search(searchterm) > -1)
                    if(!isItemExists(resultJson.sites,site))
                        resultJson.sites.push(site);
            }
         }
         
         return resultJson;        
    }

    /**
     *  This function check if item is already exists in the site list.
     *  It check whether site is already in the sites.
     * @param {String} sites The site lists json object
     * @param {string} site The site object.
     */
    var isItemExists = function(sites, site){
        var checking = false;
        for(var i in sites) {
            if(sites[i].id == site.id) {
                checking = true;
            }
        }
        return checking;
    }

    /**
     * This method will show all the appropriate elements for when a search is executed.
     */
    var showSearchContent = function() {
        $(searchConfig.global.searchTerm).html(sakai.api.Security.saneHTML(sakai.api.Security.escapeHTML(searchterm)));
        
        $(searchConfig.global.numberFound).text("0");
        $(searchConfig.results.header).hide();
        $(searchConfig.results.tagHeader).hide();
        $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
    };


    /**
     * Get sites list group with categories from back end.
     */
    var getCategories = function(){
        $.ajax({
            // TODO static links need to change once backend is completed
            url: "/dev/s23/bundles/sites-categorized.json",
            type : "GET",
            dataType: "json",
            success: function(data){
                newjson = data;
                // Render all the sites.
                renderCategories(newjson);
            },
            error: function(){
            }
        });
    }
    
    /**
     * Render Category lists on the search screen.
     */
    var renderCategories = function(newjson){
        var newCategoryJson = {};
        for(var i=0;i<newjson.categories.length;i++) {
            var newCategoryJson = {
                    "category" : newjson.categories[i].category + " (" +newjson.categories[i].sites.length +")"
            };
            var obj = newjson.categories[i].category;
            // need to remove because for some reason search facet remove _ for the element id
            obj = obj.replace(/_/gi,"");
            // remove underscore
            searchConfig.facetedConfig.facets[obj]=newCategoryJson;
        }
    }
 
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

        getCategories();
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