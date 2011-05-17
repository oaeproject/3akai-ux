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
    sakai_global.searchgroups = function(tuid, showSettings, widgetData){

        var selectedCategory = "other";
        for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
            if (sakai.config.worldTemplates[c].id === widgetData.category) {
            selectedCategory = sakai.api.i18n.General.getValueForKey(sakai.config.worldTemplates[c].title);
            }
        }

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

        var rootel = $("#" + tuid);

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
                        "category": "All " + selectedCategory.toLowerCase(),
                        "searchurl": searchURLmap.allgroups,
                        "searchurlall": searchURLmap.allgroupsall
                    }
                }
            }
        };

        if (!sakai.data.me.user.anon) {
            searchConfig.facetedConfig.facets.manage = {
               "category": selectedCategory + " I manage",
               "searchurl": searchURLmap.managergroups,
               "searchurlall": searchURLmap.managergroups
            };
            searchConfig.facetedConfig.facets.member = {
               "category": selectedCategory + " I'm a member of",
               "searchurl": searchURLmap.membergroups,
               "searchurlall": searchURLmap.membergroups
            };
        }

        ///////////////
        // Functions //
        ///////////////

        var pager_click_handler = function(pageclickednumber){
            $.bbq.pushState({
                "q": $(searchConfig.global.text, rootel).val(),
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
                    $(searchConfig.global.numberFound, rootel).text("" + results.total);
                } else if (results.results.length <= 0) {
                    $(searchConfig.global.numberFound, rootel).text(0);
                } else {
                    $(searchConfig.global.numberFound, rootel).text($(searchConfig.global.resultExceed, rootel).html());
                }

                // Reset the pager.
                $(searchConfig.global.pagerClass, rootel).pager({
                    pagenumber: params["page"],
                    pagecount: Math.ceil(Math.abs(results.total) / resultsToDisplay),
                    buttonClickCallback: pager_click_handler
                });

                // If we have results we add them to the object.
                if (results && results.results) {
                    finaljson = sakai_global.data.search.prepareGroupsForRender(results.results, finaljson);
                }

                // if we're searching tags we need to hide the pager since it doesnt work too well
                if (!results.total) {
                    results.total = resultsToDisplay;
                }

                // We hide the pager if we don't have any results or
                // they are less then the number we should display
                results.total = Math.abs(results.total);
                if (results.total > resultsToDisplay) {
                    $(searchConfig.global.pagerClass, rootel).show();
                }
            }

            // Render the results.
            finaljson.category = selectedCategory.toLowerCase();
            $(searchConfig.results.container, rootel).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $(".searchgroups_results_container", rootel).show();

            // display functions available to logged in users
            if (!sakai.data.me.user.anon) {
                $(".searchgroups_result_user_functions", rootel).show();
                $(".searchgroups_result_anonuser", rootel).hide();
            }
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params){
            // Set search box values
            if (!params.q || (params.q === "*" || params.q === "**")) {
                $(searchConfig.global.text, rootel).val("");
                $(searchConfig.global.matchingLabel, rootel).hide();
            }
            else {
                $(searchConfig.global.text, rootel).val(params.q);
                $(searchConfig.global.matchingLabel, rootel).show();
            }
            $(searchConfig.global.numberFound, rootel).text("0");
            $(searchConfig.results.header, rootel).hide();
            $(searchConfig.results.tagHeader, rootel).hide();
            $(searchConfig.results.container, rootel).html($(searchConfig.global.resultTemp, rootel).html());
        };

        var doSearch = function(){
            $(searchConfig.global.pagerClass, rootel).hide();

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
                "category": widgetData.category,
                "sortOn": "_lastModified",
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
                    $(searchConfig.results.header, rootel).show();
                },
                error: function(status) {
                    var json = {};
                    renderResults(json, false);
                    $(searchConfig.results.header, rootel).show();
                }
            });
        };

        ///////////////////
        // Event binding //
        ///////////////////

        $(searchConfig.global.text, rootel).live("keydown", function(ev){
            if (ev.keyCode === 13) {
                $.bbq.pushState({
                    "q": $(searchConfig.global.text, rootel).val(),
                    "page": 0
                }, 0);
            }
        });

        $(searchConfig.global.button, rootel).live("click", function(ev){
            $.bbq.pushState({
                "q": $(searchConfig.global.text, rootel).val(),
                "page": 0
            }, 0);
        });

        /////////////////////////
        // Initialise Function //
        /////////////////////////

        if (sakai.data.me.user.anon){
            $(searchConfig.results.resultsContainer, rootel).addClass(searchConfig.results.resultsContainerAnonClass);
        }

        $(window).bind("hashchange", function(ev){
            if ($.bbq.getState("l") === widgetData.category) {
                doSearch();
            }
        });

        $(window).bind("sakai.search.util.finish", function(ev){
            var widgetId = sakai.api.Util.generateWidgetId();
            $("#searchgroups_results_faceted", rootel).html(sakai.api.Util.TemplateRenderer("searchgroups_results_faceted", {"widgetId": widgetId}));
            var config = {};
            config[widgetId] = {
                "facetedConfig": searchConfig.facetedConfig
            };
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false, false, [config]);
            doSearch();
        });

        $(window).trigger("sakai.search.util.init");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchgroups");

});
