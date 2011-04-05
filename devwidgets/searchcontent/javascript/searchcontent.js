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
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/search_util.js"], function($, sakai) {

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
    sakai_global.searchcontent = function (tuid, showSettings) {

        //////////////////////
        // Config variables //
        //////////////////////

        var resultsToDisplay = 4;
        //var searchterm = "";
        //var tagterm = "";
        //var currentpage = 0;

        //var searchAjaxCall = false;

        // Search URL mapping
        var searchURLmap = {
            allfiles : sakai.config.URL.SEARCH_ALL_FILES,
            allfilesall : sakai.config.URL.SEARCH_ALL_FILES_ALL,
            mybookmarks : sakai.config.URL.SEARCH_MY_BOOKMARKS,
            mybookmarksall : sakai.config.URL.SEARCH_MY_BOOKMARKS_ALL,
            mycontacts : sakai.config.URL.SEARCH_MY_CONTACTS,
            myfiles : sakai.config.URL.SEARCH_MY_FILES,
            myfilesall : sakai.config.URL.SEARCH_MY_FILES_ALL,
            mysites : sakai.config.URL.SEARCH_MY_SITES,
            pooledcontentmanager: sakai.config.URL.POOLED_CONTENT_MANAGER,
            pooledcontentmanagerall: sakai.config.URL.POOLED_CONTENT_MANAGER_ALL,
            pooledcontentviewer: sakai.config.URL.POOLED_CONTENT_VIEWER,
            pooledcontentviewerall: sakai.config.URL.POOLED_CONTENT_VIEWER_ALL
        };

        // CSS IDs
        var search = "#searchcontent";

        var searchConfig = {
            search : "#searchcontent",
            global : {
                resultTemp : search + "_result_temp",
                resultExceed: search+"_result_exceed",
                button : search + "_button",
                text: search + '_text',
                numberFound : search + '_numberFound',
                searchTerm : search + "_mysearchterm",
                tagTerm : search + "_mytagterm",
                searchBarSelectedClass : "searchcontent_bar_selected",
                pagerClass : ".jq_pager",
                matchingLabel: "#searchcontent_result_extended_matching"
            },
            filters : {
                filter : search + "_filter",
                sites : {
                    filterSites : search + "_filter_my_sites",
                    filterSitesTemplate : "searchcontent_filter_my_sites_template",
                    ids : {
                        entireCommunity : '#searchcontent_filter_community',
                        allMySites : '#searchcontent_filter_all_my_sites',
                        specificSite : '#searchcontent_filter_my_sites_'
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
                template : 'searchcontent_results_template'
            },
            facetedConfig : {
                title : $("#searchcontent_result_title").html(),
                value : "Content",
                facets : {
                    "all" : {
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
        
        var pager_click_handler = function(pageclickednumber) {
            $.bbq.pushState({
            	"q": $(searchConfig.global.text).val(),
                "page": pageclickednumber
            }, 0);
        };
        
        var renderResults = function(results, success) {
            var params = sakai_global.data.search.getQueryParams();
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
                    for(var item in finaljson.items){
                        if(finaljson.items.hasOwnProperty(item)){
                            if (finaljson.items[item]["sakai:description"]) {
                                finaljson.items[item]["sakai:description"] = sakai.api.Util.applyThreeDots(finaljson.items[item]["sakai:description"], $(".search_results").width() - $("#faceted_container").width() - 115, {max_rows: 1,whole_word: false}, "searchcontent_result_course_site_excerpt");
                            }
                            if(finaljson.items[item]["sakai:pooled-content-file-name"]){
                                finaljson.items[item]["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(finaljson.items[item]["sakai:pooled-content-file-name"], $(".search_results").width() - $("#faceted_container").width() - 115, {max_rows: 1,whole_word: false}, "s3d-bold");
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

            // Render the results.
            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $(".searchcontent_results_container").show();
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params){
            $(searchConfig.global.searchTerm).html(sakai.api.Security.saneHTML(sakai.api.Security.escapeHTML(params.q)));
            // Set search box values
            if (!params.q || (params.q === "*" || params.q === "**")){
                $(searchConfig.global.text).val("");
                $(searchConfig.global.matchingLabel).hide();
            } else {
                $(searchConfig.global.text).val(params.q);
                $(searchConfig.global.matchingLabel).show();
            }
            $(searchConfig.global.numberFound).text("0");
            $(searchConfig.results.header).hide();
            $(searchConfig.results.tagHeader).hide();
            $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
        }
        
        var doSearch = function() {

            var params = sakai_global.data.search.getQueryParams();
            var urlsearchterm = sakai.api.Server.createSearchString(params.q);
            
            //facetedurl = mainSearch.getFacetedUrl();
            //facetedurlall = '';

            var facetedurl = "";
            var facetedurlall = "";
            if (params["facet"]){
                facetedurl = searchConfig.facetedConfig.facets[params["facet"]].searchurl;
                facetedurlall = searchConfig.facetedConfig.facets[params["facet"]].searchurlall;
            } else {
                for (var f in searchConfig.facetedConfig.facets){
                    facetedurl = searchConfig.facetedConfig.facets[f].searchurl;
                    facetedurlall = searchConfig.facetedConfig.facets[f].searchurl;
                    break;
                }
            }

            //$(".faceted_category").removeClass("faceted_category_selected");
            //if (facet) {
            //    $("#" + facet).addClass("faceted_category_selected");
            //} else {
            //    $(".faceted_category:first").addClass("faceted_category_selected");
            //}

            // Check if the searchquery is empty
            //if(searchquery === ""){
            // If there is nothing in the search query, remove the html and hide some divs
            //    $(searchConfig.results.container).html();
            //    $(".search_results_container").hide();
            //    $("#faceted_container").hide();
            //    $(searchConfig.results.header).hide();
            //    $(searchConfig.global.pagerClass).hide();
            //    return;
            //}

            //var page = 1;
            //alert(page);
            //if (!isNaN(params["page"])){
            page = params["page"];
            //}
            //alert(page);

            // Set all the input fields and paging correct.
            showSearchContent(params);

            //var dd = $("#search_filter").get(0);
            //if (dd && dd.options) {
            //  for (var i = 0, j = dd.options.length; i<j; i++){
            //      if (dd.options[i].value == searchwhere){
            //          dd.selectedIndex = i;
            //      }
            //  }
            //}

            // Get the search term out of the input box.
            // If we were redirected to this page it will be added previously already.
            //searchterm = $(searchConfig.global.text).val();

            // Rebind everything
            //mainSearch.addEventListeners(searchterm, searchwhere);

            //var title = $(searchConfig.global.text).attr("title");
            //if (searchterm === title) {
            //    searchterm = "*";
            //}
            //if (searchquery && searchterm) {
                // Show and hide the correct elements.
             //   showSearchContent();

                // Sites Search
                //var searchWhere = mainSearch.getSearchWhereSites();

                // What are we looking for?
                var urlsearchterm = sakai.api.Server.createSearchString(params.q);

                var url = "";
                //var usedIn = [];
                var params = {
                    "page" : (page - 1),
                    "items" : resultsToDisplay,
                    "q": urlsearchterm
                };

                // Check if there is a site defined, if so we need to change the url to all files

                //if (searchWhere === "mysites"){
                //    url = searchURLmap[searchWhere];
                //    params['q'] = urlsearchterm;
                //} else if (searchWhere === "*"){
                //    url = searchURLmap.allfilesall;
                //} else {
                //    url = searchURLmap.allfiles.replace(".json", ".infinity.json");
                //    params['usedin'] = searchWhere;
                //    params['q'] = urlsearchterm;
                //}

                // Check if we want to search using a faceted link
                //if (facetedurl) {
                    if (urlsearchterm === '**' || urlsearchterm === '*') {
                        url = facetedurlall;
                    } else {
                        url = facetedurl.replace(".json", ".infinity.json");
                    }
                //}

                searchAjaxCall = $.ajax({
                    url: url,
                    data: params,
                    success: function(data) {
                        renderResults(data, true);
                        $(searchConfig.results.header).show();
                    },
                    error: function(xhr, textStatus, thrownError) {
                        var json = {};
                        renderResults(json, false);
                        $(searchConfig.results.header).show();
                    }
                });

            //}
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

        $(window).bind("hashchange", function(ev){
            doSearch();
        });

        $(window).bind("sakai.search.util.finish", function(ev){
            sakai_global.data.search.addFacetedPanel(searchConfig);
            sakai.api.Widgets.widgetLoader.insertWidgets("searchcontent_widget");
            doSearch();
        });

        $(window).trigger("sakai.search.util.init");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchcontent");

});
