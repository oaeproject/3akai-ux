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
    sakai_global.searchcontent = function(tuid, showSettings){

        //////////////////////
        // Config variables //
        //////////////////////

        var resultsToDisplay = 10;

        // Search URL mapping
        var searchURLmap = {
            allfiles: sakai.config.URL.SEARCH_ALL_FILES,
            allfilesall: sakai.config.URL.SEARCH_ALL_FILES_ALL,
            mybookmarks: sakai.config.URL.SEARCH_MY_BOOKMARKS,
            mybookmarksall: sakai.config.URL.SEARCH_MY_BOOKMARKS_ALL,
            mycontacts: sakai.config.URL.SEARCH_MY_CONTACTS,
            myfiles: sakai.config.URL.SEARCH_MY_FILES,
            myfilesall: sakai.config.URL.SEARCH_MY_FILES_ALL,
            mysites: sakai.config.URL.SEARCH_MY_SITES,
            pooledcontentmanager: sakai.config.URL.POOLED_CONTENT_MANAGER,
            pooledcontentmanagerall: sakai.config.URL.POOLED_CONTENT_MANAGER_ALL,
            pooledcontentviewer: sakai.config.URL.POOLED_CONTENT_VIEWER,
            pooledcontentviewerall: sakai.config.URL.POOLED_CONTENT_VIEWER_ALL
        };

        // CSS IDs
        var search = "#searchcontent";

        var searchConfig = {
            search: "#searchcontent",
            global: {
                resultTemp: search + "_result_temp",
                resultExceed: search + "_result_exceed",
                button: search + "_button",
                text: search + '_text',
                numberFound: search + '_numberFound',
                searchTerm: search + "_mysearchterm",
                tagTerm: search + "_mytagterm",
                searchBarSelectedClass: "searchcontent_bar_selected",
                pagerClass: ".jq_pager",
                matchingLabel: "#searchcontent_result_extended_matching"
            },
            filters: {
                filter: search + "_filter",
                sites: {
                    filterSites: search + "_filter_my_sites",
                    filterSitesTemplate: "searchcontent_filter_my_sites_template",
                    ids: {
                        entireCommunity: '#searchcontent_filter_community',
                        allMySites: '#searchcontent_filter_all_my_sites',
                        specificSite: '#searchcontent_filter_my_sites_'
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
                resultsContainerAnonClass: 'searchcontent_results_anon',
                header: search + '_results_header',
                tagHeader: search + '_results_tag_header',
                template: 'searchcontent_results_template'
            },
            facetedConfig: {
                title: $("#searchcontent_result_title").html(),
                value: "Content",
                facets: {
                    "all": {
                        "category": $("#searchcontent_result_all_content").html(),
                        "searchurl": searchURLmap.allfiles,
                        "searchurlall": searchURLmap.allfilesall
                    }
                }
            }
        };

        if (!sakai.data.me.user.anon) {
            searchConfig.facetedConfig.facets.manage = {
                "category": $("#searchcontent_result_content_I_manage").html(),
                "searchurl": searchURLmap.pooledcontentmanager,
                "searchurlall": searchURLmap.pooledcontentmanagerall
            };
            searchConfig.facetedConfig.facets.member = {
                "category": $("#searchcontent_result_content_I_m_a_viewer_of").html(),
                "searchurl": searchURLmap.pooledcontentviewer,
                "searchurlall": searchURLmap.pooledcontentviewerall
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
            var fetchUsers = false;
            var userArray = [];
            if (success) {

                // Adjust display global total
                // If number is higher than a configurable threshold show a word instead conveying ther uncountable volume -- TO DO: i18n this
                if ((results.total <= sakai.config.Search.MAX_CORRECT_SEARCH_RESULT_COUNT) && (results.total >= 0)) {
                    $(searchConfig.global.numberFound).text("" + results.total);
                }
                else
                    if (results.results.length <= 0) {
                        $(searchConfig.global.numberFound).text(0);
                    }
                    else {
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
                    finaljson = sakai_global.data.search.prepareCMforRender(results.results, finaljson);
                    for (var item in finaljson.items) {
                        if (finaljson.items.hasOwnProperty(item)) {
                            if (finaljson.items[item]["sakai:description"]) {
                                finaljson.items[item]["sakai:description"] = sakai.api.Util.applyThreeDots(finaljson.items[item]["sakai:description"], $(".search_results").width() - $("#faceted_container").width() - 115, {
                                    max_rows: 1,
                                    whole_word: false
                                }, "searchcontent_result_course_site_excerpt");
                            }
                            if (finaljson.items[item]["sakai:pooled-content-file-name"]) {
                                finaljson.items[item]["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(finaljson.items[item]["sakai:pooled-content-file-name"], $(".search_results").width() - $("#faceted_container").width() - 115, {
                                    max_rows: 1,
                                    whole_word: false
                                }, "s3d-bold");
                            }
                            if (finaljson.items[item]["sakai:pool-content-created-for"]) {
                                userArray.push(finaljson.items[item]["sakai:pool-content-created-for"]);
                                fetchUsers = true;
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
                }
                else {
                    $(searchConfig.global.pagerClass).show();
                }
            }
            else {
                $(searchConfig.global.pagerClass).hide();
            }

            // Make the content items available to other widgets
            sakai_global.searchcontent.content_items = finaljson.items;

            // Render the results.
            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $(".searchcontent_results_container").show();

            // display functions available to logged in users
            if (!sakai.data.me.user.anon) {
                $(".searchcontent_result_user_functions").show();
                $(".searchcontent_result_anonuser").hide();
            }

            // Update dom with user display names
            if (fetchUsers) {
                sakai.api.User.getMultipleUsers(userArray, function(users){
                    for (var u in users) {
                        if (users.hasOwnProperty(u)) {
                            setUsername(u, users);
                        }
                    }
                });
            }
        };

        var setUsername = function(u, users) {
            $(".searchcontent_result_username").each(function(index, val){
               var userId = $(val).text();
               if (userId === u){
                   $(val).text(sakai.api.User.getDisplayName(users[u]));
                   $(val).attr("title", sakai.api.User.getDisplayName(users[u]));
               }
            });
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params){
            $(searchConfig.global.searchTerm).html(sakai.api.Security.saneHTML(sakai.api.Security.escapeHTML(params.q)));
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
        };

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

            // Set all the input fields and paging correct.
            showSearchContent(params);

            var url = "";
            var requestParams = {
                "page": (params["page"] - 1),
                "items": resultsToDisplay,
                "q": urlsearchterm
            };

            if (urlsearchterm === '**' || urlsearchterm === '*') {
                url = facetedurlall;
                $(window).trigger("lhnav.addHashParam", [{"q": ""}]);
            } else {
                url = facetedurl.replace(".json", ".infinity.json");
                $(window).trigger("lhnav.addHashParam", [{"q": params.q}]);
            }

            searchAjaxCall = $.ajax({
                url: url,
                data: requestParams,
                success: function(data){
                    renderResults(data, true);
                    $(searchConfig.results.header).show();
                },
                error: function(xhr, textStatus, thrownError){
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
            if ($.bbq.getState("l") === "content") {
                doSearch();
            }
        });

        $(window).bind("sakai.search.util.finish", function(ev){
            sakai.api.Widgets.widgetLoader.insertWidgets("searchcontent_widget", false, false, [{
                "98384013291": {
                    "facetedConfig": searchConfig.facetedConfig
                }
            }]);
            doSearch();
        });

        $(window).trigger("sakai.search.util.init");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchcontent");

});
