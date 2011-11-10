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
    sakai_global.searchall = function(tuid, showSettings){

        //////////////////////
        // Config variables //
        //////////////////////

        var resultsToDisplay = 12;
        var rootel = $("#" + tuid);

        // CSS IDs
        var search = "#searchall";

        var searchConfig = {
            search: "#searchall",
            global: {
                resultTemp: search + "_result_temp",
                resultExceed: search + "_result_exceed",
                button: search + "_button",
                text: search + '_text',
                numberFound: search + '_numberFound',
                searchTerm: search + "_mysearchterm",
                tagTerm: search + "_mytagterm",
                searchBarSelectedClass: "searchall_bar_selected",
                pagerClass: ".jq_pager",
                matchingLabel: "#searchall_result_extended_matching",
                searchButton: "#form .s3d-search-button"
            },
            filters: {
                filter: search + "_filter",
                sites: {
                    filterSites: search + "_filter_my_sites",
                    filterSitesTemplate: "searchall_filter_my_sites_template",
                    ids: {
                        entireCommunity: '#searchall_filter_community',
                        allMySites: '#searchall_filter_all_my_sites',
                        specificSite: '#searchall_filter_my_sites_'
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
                resultsContainerAnonClass: 's3d-search-results-anon',
                header: search + '_results_header',
                tagHeader: search + '_results_tag_header',
                template: 'searchall_results_template'
            }
        };

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
                $(searchConfig.global.numberFound, rootel).text("" + results.total);

                // Reset the pager.
                $(searchConfig.global.pagerClass, rootel).pager({
                    pagenumber: params["page"],
                    pagecount: Math.ceil(Math.abs(results.total) / resultsToDisplay),
                    buttonClickCallback: pager_click_handler
                });

                // If we have results we add them to the object.
                if (results && results.results) {
                    finaljson = sakai_global.data.search.prepareGroupsForRender(results.results, finaljson);
                    finaljson = sakai_global.data.search.preparePeopleForRender(results.results, finaljson);
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
                } else {
                    $(searchConfig.global.pagerClass, rootel).hide();
                }
            }

            sakai_global.searchall.content_items = [];
            finaljson.sakai = sakai;
            if (success && results && results.results) {
                sakai_global.data.search.prepareCMforRender(results.results, finaljson, function(prcessedResults){
                    // Make the content items available to other widgets
                    sakai_global.searchall.content_items = prcessedResults.items;
                    // Render the results.
                    $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, prcessedResults));
                });
            } else {
                // Render the results.
                $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            }
            bindResultsEvents();
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchAll = function(params){
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
            $(searchConfig.global.pagerClass).hide();

            var params = sakai_global.data.search.getQueryParams();
            var urlsearchterm = sakai.api.Server.createSearchString(params.cat || params.q);

            // get the sort by
            var sortBy = $("#search_select_sortby option:first").val();
            if (params["sortby"]){
                sortBy = params["sortby"];
            }

            // Set all the input fields and paging correct.
            showSearchAll(params);

            var url = sakai.config.URL.SEARCH_ALL_ENTITIES;
            if (urlsearchterm === '**' || urlsearchterm === '*') {
                $(window).trigger("lhnav.addHashParam", [{"q": "", "cat": ""}]);
                url = sakai.config.URL.SEARCH_ALL_ENTITIES_ALL;
            } else {
                $(window).trigger("lhnav.addHashParam", [{"q": params.q, "cat": params.cat}]);
            }
            var requestParams = {
                "page": (params["page"] - 1),
                "items": resultsToDisplay,
                "q": urlsearchterm,
                "sortOn": "_lastModified",
                "sortOrder": sortBy
            };

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
                    "cat": "",
                    "page": 0
                }, 0);
            }
        });

        $(searchConfig.global.searchButton).live("click", function(){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "page": 0
            }, 0);
        })

        $(searchConfig.global.button).live("click", function(ev){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "cat": "",
                "page": 0
            }, 0);
        });

        $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
            sakai_global.data.search.getMyContacts();
            $('.sakai_addtocontacts_overlay').each(function(index) {
                if ($(this).attr("sakai-entityid") === userToAdd.uuid){
                    $(this).hide();
                    $("#searchpeople_result_left_filler_"+userToAdd.uuid).show();
                }
            });
        });

        /*
         * Bindings that occur after we've rendered the search results.
         */
        var bindResultsEvents = function() {
            $('.searchgroups_result_plus',rootel).live("click", function(ev) {
                var joinable = $(this).data("group-joinable");
                var groupid = $(this).data("groupid");
                var itemdiv = $(this);
                sakai.api.Groups.addJoinRequest(sakai.data.me, groupid, false, true, function (success) {
                    if (success) {
                        if (joinable === "withauth") {
                            // Don't add green tick yet because they need to be approved.
                            var notimsg = sakai.api.i18n.getValueForKey("YOUR_REQUEST_HAS_BEEN_SENT");
                        } 
                        else  { // Everything else should be regular success
                            $("#searchgroups_memberimage_"+groupid,rootel).show();
                            var notimsg = sakai.api.i18n.getValueForKey("SUCCESSFULLY_ADDED_TO_GROUP");
                        }
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("GROUP_MEMBERSHIP"),
                            notimsg, sakai.api.Util.notification.type.INFORMATION);
                        itemdiv.removeClass("s3d-action-icon s3d-actions-addtolibrary searchgroups_result_plus");
                    } else {
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("GROUP_MEMBERSHIP"),
                            sakai.api.i18n.getValueForKey("PROBLEM_ADDING_TO_GROUP"),
                            sakai.api.Util.notification.type.ERROR);
                    }
                });
            });
        };

        /////////////////////////
        // Initialise Function //
        /////////////////////////

        if (sakai.data.me.user.anon){
            $(searchConfig.results.resultsContainer).addClass(searchConfig.results.resultsContainerAnonClass);
        }

        $(window).bind("hashchange", function(ev){
            if (!$.bbq.getState("l") || $.bbq.getState("l") === "all") {
                doSearch();
            }
        });

        $(window).bind("sakai.search.util.finish", function(ev, data){
            if (data && data.tuid === tuid){
                doSearch();
            }
        });

        $(window).trigger("sakai.search.util.init", [{"tuid": tuid}]);

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchall");

});
