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
    sakai_global.searchpeople = function(tuid, showSettings){

        //////////////////////
        // Config variables //
        //////////////////////

        var resultsToDisplay = 10;

        // Search URL mapping
        var searchURLmap = {
            allusers : sakai.config.URL.SEARCH_USERS,
            allusersall : sakai.config.URL.SEARCH_USERS_ALL,
            mycontacts : sakai.config.URL.CONTACTS_FIND,
            mycontactsall : sakai.config.URL.SEARCH_USERS_ACCEPTED,
            invitedcontacts : sakai.config.URL.CONTACTS_FIND + '?state=INVITED',
            invitedcontactsall : sakai.config.URL.SEARCH_USERS_ACCEPTED + '?state=INVITED',
            pendingcontacts : sakai.config.URL.CONTACTS_FIND + '?state=PENDING',
            pendingcontactsall : sakai.config.URL.SEARCH_USERS_ACCEPTED + '?state=PENDING',
            onlinecontacts : sakai.config.URL.PRESENCE_CONTACTS_SERVICE
        };

        // CSS IDs
        var search = "#searchpeople";

        var searchConfig = {
            search: "#searchpeople",
            global: {
                resultTemp: search + "_result_temp",
                resultExceed: search + "_result_exceed",
                button: search + "_button",
                text: search + '_text',
                numberFound: search + '_numberFound',
                searchTerm: search + "_mysearchterm",
                tagTerm: search + "_mytagterm",
                searchBarSelectedClass: "searchpeople_bar_selected",
                pagerClass: ".jq_pager",
                matchingLabel: "#searchpeople_result_extended_matching"
            },
            filters: {
                filter: search + "_filter",
                sites: {
                    filterSites: search + "_filter_my_sites",
                    filterSitesTemplate: "searchpeople_filter_my_sites_template",
                    ids: {
                        entireCommunity: '#searchpeople_filter_community',
                        allMySites: '#searchpeople_filter_all_my_sites',
                        specificSite: '#searchpeople_filter_my_sites_'
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
                resultsContainerAnonClass: 'searchpeople_results_anon',
                header: search + '_results_header',
                tagHeader: search + '_results_tag_header',
                template: 'searchpeople_results_template'
            },
            facetedConfig : {
                title : $("#search_result_title").html(),
                value : "People",
                facets: {
                    "all" : {
                        "category": $("#search_result_all_people").html(),
                        "searchurl": searchURLmap.allusers,
                        "searchurlall": searchURLmap.allusersall
                    }
                }
            }
        };

        if (!sakai.data.me.user.anon) {
            searchConfig.facetedConfig.facets.contacts = {
                "category": $("#search_result_my_contacts").html(),
                "searchurl": searchURLmap.mycontacts,
                "searchurlall": searchURLmap.mycontactsall
            };
            searchConfig.facetedConfig.facets.invited = {
                "category": $("#search_result_my_contacts_invitation").html(),
                "searchurl": searchURLmap.invitedcontacts,
                "searchurlall": searchURLmap.invitedcontactsall
            };
            searchConfig.facetedConfig.facets.requested = {
                "category": $("#search_result_pending_invitations").html(),
                "searchurl": searchURLmap.pendingcontacts,
                "searchurlall": searchURLmap.pendingcontactsall
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
                    $(searchConfig.global.pagerClass).show();
                }
            }

            // Render the results.
            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $(".searchpeople_results_container").show();

            // display functions available to logged in users
            if (!sakai.data.me.user.anon) {
                $(".searchpeople_result_user_functions").show();
                $(".searchpeople_result_anonuser").hide();
            }
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params){
            // Set search box values
            if (!params.q || (params.q === "*" || params.q === "**")) {
                $(searchConfig.global.text).val("");
                //$(searchConfig.global.matchingLabel).hide();
            }
            else {
                $(searchConfig.global.text).val(params.q);
                //$(searchConfig.global.matchingLabel).show();
            }
            $(searchConfig.global.numberFound).text("0");
            $(searchConfig.results.header).hide();
            $(searchConfig.results.tagHeader).hide();
            $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
        };

        var doSearch = function(){
            $(searchConfig.global.pagerClass).hide();

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
                "sortOn": "_lastModified",
                "sortOrder": sortBy
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

        $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
            sakai_global.data.search.getMyContacts();
            $('.sakai_addtocontacts_overlay').each(function(index) {
                if ($(this).attr("sakai-entityid") === userToAdd.uuid){
                    $(this).hide();
                    $("#searchpeople_result_left_filler_"+userToAdd.uuid).show();
                }
            });
        });

        $(window).bind("hashchange", function(ev){
            if ($.bbq.getState("l") === "people") {
                doSearch();
            }
        });

        $(window).bind("sakai.search.util.finish", function(ev){
            sakai.api.Widgets.widgetLoader.insertWidgets("searchpeople_widget", false, false, [{
                "449529953": {
                    "facetedConfig": searchConfig.facetedConfig
                }
            }]);
            doSearch();
        });

        $(window).trigger("sakai.search.util.init");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchpeople");

});
