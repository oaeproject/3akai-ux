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
// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/search_util.js"], function($, sakai){

    /**
     * @name sakai.WIDGET_ID
     *
     * @class WIDGET_ID
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.searchgroups = function(tuid, showSettings){
    
        //////////////////////
        // Config variables //
        //////////////////////
        
        var resultsToDisplay = 10;

        // Search URL mapping
        var searchURLmap = {
            allgroups : sakai.config.URL.SEARCH_GROUPS,
            allgroupsall : sakai.config.URL.SEARCH_GROUPS_ALL,
            visiblegroups : sakai.config.URL.SEARCH_GROUPS,
            visiblegroupsall : sakai.config.URL.SEARCH_GROUPS_ALL,
            managergroups : sakai.config.URL.GROUPS_MANAGER,
            membergroups : sakai.config.URL.GROUPS_MEMBER
        };
        
        // CSS IDs
        var search = "#searchgroups";
        
        var searchConfig = {
            search: "#searchgroups",
            global: {
                resultTemp: search + "_result_temp",
                resultExceed: search + "_result_exceed",
                button: search + "_button",
                text: search + '_text',
                numberFound: search + '_numberFound',
                searchTerm: search + "_mysearchterm",
                tagTerm: search + "_mytagterm",
                searchBarSelectedClass: "searchgroups_bar_selected",
                pagerClass: ".jq_pager",
                matchingLabel: "#searchgroups_result_extended_matching"
            },
            filters: {
                filter: search + "_filter",
                sites: {
                    filterSites: search + "_filter_my_sites",
                    filterSitesTemplate: "searchgroups_filter_my_sites_template",
                    ids: {
                        entireCommunity: '#searchgroups_filter_community',
                        allMySites: '#searchgroups_filter_all_my_sites',
                        specificSite: '#searchgroups_filter_my_sites_'
                    },
                    values: {
                        entireCommunity: 'entire_community',
                        allMySites: "all_my_sites"
                    }
                }
            },
            tabs: {
                all: "#tab_search_all",
                content: "#tab_search_content",
                people: "#tab_search_people",
                sites: "#tab_search_sites",
                sakai2: "#tab_search_sakai2"
            },
            results: {
                container: search + '_results_container',
                resultsContainer: search + '_results',
                resultsContainerAnonClass: 'searchgroups_results_anon',
                header: search + '_results_header',
                tagHeader: search + '_results_tag_header',
                template: 'searchgroups_results_template'
            },
            facetedConfig : {
                title : "Refine your search",
                value : "Groups",
                facets: {
                    "all": {
                        "category": "All groups",
                        "searchurl": searchURLmap.allgroups,
                        "searchurlall": searchURLmap.allgroupsall
                    }
                }
            }
        };

        if (!sakai.data.me.user.anon) {
            searchConfig.facetedConfig.facets.manage = {
               "category": "Groups I manage",
               "searchurl": searchURLmap.managergroups,
               "searchurlall": searchURLmap.managergroups
            };
            searchConfig.facetedConfig.facets.member = {
               "category": "Groups I'm a member of",
               "searchurl": searchURLmap.membergroups,
               "searchurlall": searchURLmap.membergroups
            };
        }
        
        ///////////////
        // Functions //
        ///////////////
        
        var pager_click_handler = function(pageclickednumber){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "page": pageclickednumber
            }, 0);
        };
        
        var renderResults = function(results, success){
            var params = sakai_global.data.search.getQueryParams();
            var finaljson = {};
            finaljson.items = [];
            if (success) {
            
                // Adjust display global total
                // If number is higher than a configurable threshold show a word instead conveying ther uncountable volume -- TO DO: i18n this
                if ((results.total <= sakai.config.Search.MAX_CORRECT_SEARCH_RESULT_COUNT) && (results.total >= 0)) {
                    $(searchConfig.global.numberFound).text("" + results.total);
                } else if (results.results.length <= 0) {
                    $(searchConfig.global.numberFound).text(0);
                } else {
                    $(searchConfig.global.numberFound).text($(searchConfig.global.resultExceed).html());
                }
                
                // Reset the pager.
                $(searchConfig.global.pagerClass).pager({
                    pagenumber: params["page"],
                    pagecount: Math.ceil(Math.abs(results.total) / resultsToDisplay),
                    buttonClickCallback: pager_click_handler
                });

                // If we have results we add them to the object.
                if (results && results.results) {
                    finaljson = sakai_global.data.search.prepareGroupsForRender(results.results, finaljson);
                    for (var group in finaljson.items){
                        if (finaljson.items.hasOwnProperty(group)) {
                            if (finaljson.items[group]["sakai:group-title"]) {
                                finaljson.items[group]["sakai:group-title"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(finaljson.items[group]["sakai:group-title"]), $(".search_results").width() - $("#faceted_container").width() - 115, {max_rows: 1,whole_word: false}, "s3d-bold");
                            }
                            if (finaljson.items[group]["sakai:group-description"]) {
                                finaljson.items[group]["sakai:group-description"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(finaljson.items[group]["sakai:group-description"]), $(".search_results").width() - $("#faceted_container").width() - 115, {max_rows: 1,whole_word: false}, "search_result_course_site_excerpt");
                            }
                        }
                    }
                }
                
                // if we're searching tags we need to hide the pager since it doesnt work too well
                if (!results.total) {
                    results.total = resultsToDisplay;
                }
                
                // We hide the pager if we don't have any results or
                // they are less then the number we should display
                results.total = Math.abs(results.total);
                if (results.total <= resultsToDisplay) {
                    $(searchConfig.global.pagerClass).hide();
                } else {
                    $(searchConfig.global.pagerClass).show();
                }
            }
            else {
                $(searchConfig.global.pagerClass).hide();
            }
            
            // Render the results.
            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $(".searchgroups_results_container").show();
        };
        
        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params){
            // Set search box values
            if (!params.q || (params.q === "*" || params.q === "**")) {
                $(searchConfig.global.text).val("");
                $(searchConfig.global.matchingLabel).hide();
            }
            else {
                $(searchConfig.global.text).val(params.q);
                $(searchConfig.global.matchingLabel).show();
            }
            $(searchConfig.global.numberFound).text("0");
            $(searchConfig.results.header).hide();
            $(searchConfig.results.tagHeader).hide();
            $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
        }
        
        var doSearch = function(){
        
            var params = sakai_global.data.search.getQueryParams();
            var urlsearchterm = sakai.api.Server.createSearchString(params.q);
            
            var facetedurl = "";
            var facetedurlall = "";
            if (params["facet"] && searchConfig.facetedConfig.facets[params["facet"]]) {
                facetedurl = searchConfig.facetedConfig.facets[params["facet"]].searchurl;
                facetedurlall = searchConfig.facetedConfig.facets[params["facet"]].searchurlall;
            } else {
                for (var f in searchConfig.facetedConfig.facets) {
                    facetedurl = searchConfig.facetedConfig.facets[f].searchurl;
                    facetedurlall = searchConfig.facetedConfig.facets[f].searchurlall;
                    break;
                }
            }

            // get the sort by
            var sortBy = $("#search_select_sortby option:first").val();
            if (params["sortby"]){
                sortBy = params["sortby"];
            }

            // Set all the input fields and paging correct.
            showSearchContent(params);

            var url = "";
            var requestParams = {
                "page": (params["page"] - 1),
                "items": resultsToDisplay,
                "q": urlsearchterm,
                "sortOn": "_created",
                "sortOrder": sortBy
            };
            
            if (urlsearchterm === '**' || urlsearchterm === '*') {
                url = facetedurlall;
                $(window).trigger("lhnav.addHashParam", [{"q": ""}]);
            } else {
                url = facetedurl;
                $(window).trigger("lhnav.addHashParam", [{"q": params.q}]);
            }
            
            searchAjaxCall = $.ajax({
                url: url,
                data: requestParams,
                cache: false,
                success: function(data) {
                    renderResults(data, true);
                    $(searchConfig.results.header).show();
                },
                error: function(status) {
                    var json = {};
                    renderResults(json, false);
                    $(searchConfig.results.header).show();
                }
            });
        };

        ///////////////////
        // Event binding //
        ///////////////////
        
        $(searchConfig.global.text).live("keydown", function(ev){
            if (ev.keyCode === 13) {
                $.bbq.pushState({
                    "q": $(searchConfig.global.text).val(),
                    "page": 0
                }, 0);
            }
        });
        
        $(searchConfig.global.button).live("click", function(ev){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "page": 0
            }, 0);
        });
        
        /////////////////////////
        // Initialise Function //
        /////////////////////////
        
        if (sakai.data.me.user.anon){
            $(searchConfig.results.resultsContainer).addClass(searchConfig.results.resultsContainerAnonClass);
        }
        
        $(window).bind("hashchange", function(ev){
            if ($.bbq.getState("l") === "groups") {
                doSearch();
            }
        });
        
        $(window).bind("sakai.search.util.finish", function(ev){
            sakai.api.Widgets.widgetLoader.insertWidgets("searchgroups_widget", false, false, [{
                "9493020598": {
                    "facetedConfig": searchConfig.facetedConfig
                }
            }]);
            doSearch();
        });
        
        $(window).trigger("sakai.search.util.init");
        
    };
    
    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchgroups");
    
});
