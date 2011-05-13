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
    sakai_global.searchall = function (tuid, showSettings) {

        /////////////////
        // CONFIG VARS //
        /////////////////

        var peopleToSearch = 6;
        var cmToSearch = 5;
        var groupsToSearch = 5;

        ///////////////
        // HELP VARS //
        ///////////////

        var totalItemsFound = 0;

        /////////////
        // CSS IDs //
        /////////////

        var search = "#searchall";
        var searchConfig = {
            search : "#searchall",
            global : {
                resultTemp : search + "_result_temp",
                thousands : search + "_result_thousands",
                introductionText: "#introduction_text",
                button : search + "_button",
                text : search + '_text',
                numberFound : search + '_numberFound',
                searchTerm : search + "_mysearchterm",
                tagTerm : search + "_mytagterm",
                pagerClass : ".jq_pager",
                messageClass : ".searchall_result_person_link_message",
                messageID : "searchall_result_person_link_message_",
                addToContactsLink : ".link_add_to_contacts",
                addToContactsFiller : "link_add_to_contacts_",
                addToContactsDialog : '#add_to_contacts_dialog',
                sendmessageContainer : "#sendmessagecontainer",
                resultTitle : "#searchall_result_title",
                resultTagTitle : "#searchall_result_tag_title",
                matchingLabel: "#searchall_result_extended_matching"
            },
            people : {
                displayMore : "#display_more_people",
                displayMoreNumber : "#display_more_people_number",
                searchResult : "#people_searchall_result",
                searchResultTemplate : "people_searchall_result_template",
                header : "#people_header"
            },
            sites : {
                displayMore : "#display_more_sites",
                displayMoreNumber : "#display_more_sites_number",
                searchResult : "#sites_searchall_result",
                searchResultTemplate : "sites_searchall_result_template",
                header : "#sites_header"
            },
            cm : {
                displayMore : "#display_more_cm",
                displayMoreNumber : "#display_more_cm_number",
                searchResult : "#cm_searchall_result",
                searchResultTemplate : "cm_searchall_result_template",
                header : "#cm_header"
            }
        };


        ///////////////
        // Functions //
        ///////////////

        var showSearchContent = function(params) {
            // Set searching messages
            $(searchConfig.global.searchTerm).html(sakai.api.Security.saneHTML(sakai.api.Security.escapeHTML(params.q)));
            totalItemsFound = 0;
            $(searchConfig.global.numberFound).text(totalItemsFound);

            // Set search box values
            if (!params.q || (params.q === "*" || params.q === "**")){
                $(searchConfig.global.text).val("");
                $(searchConfig.global.matchingLabel).hide();
            } else {
                $(searchConfig.global.text).val(params.q);
                $(searchConfig.global.matchingLabel).show();
            }

            $(searchConfig.cm.displayMoreNumber).text("0");
            $(searchConfig.people.displayMoreNumber).text("0");
            $(searchConfig.sites.displayMoreNumber).text("0");

            $(searchConfig.cm.searchResult).html($(searchConfig.global.resultTemp).html());
            $(searchConfig.people.searchResult).html($(searchConfig.global.resultTemp).html());
            $(searchConfig.sites.searchResult).html($(searchConfig.global.resultTemp).html());

            // show the blocks
            $(searchConfig.cm.header).show();
            $(searchConfig.people.header).show();
            $(searchConfig.sites.header).show();

            $(searchConfig.global.resultTagTitle).hide();
            $(searchConfig.global.introductionText).hide();
            $(searchConfig.cm.displayMore).hide();
            $(searchConfig.sites.displayMore).hide();
            $(searchConfig.people.displayMore).hide();

            $(searchConfig.global.resultTitle).show();
        };

        /**
         * Updates the total number of search hits, and displays it
         * @param: {Int} hitcount The number of elements found by a particular search
         * @returns void
         */
        var updateTotalHitCount = function(hitcount) {

            // Adjust total search result count
            if (hitcount > 0) {
                totalItemsFound += hitcount;
            }

            // Adjust display global total
            // If number is higher than a configurable threshold show a word instead conveying ther uncountable volume
            if (totalItemsFound <= sakai.config.Search.MAX_CORRECT_SEARCH_RESULT_COUNT) {
                $(searchConfig.global.numberFound).text(""+totalItemsFound);
            } else {
                $(searchConfig.global.numberFound).text($(searchConfig.global.thousands).html());
            }

        };

        /**
         * This will render the results for the found content and media. It will add the nr of results to the total
         * If nessecary it will show the link to display more.
         * @param {Object} results Response from the REST service.
         */
        var renderCM = function(foundCM) {
            var finaljson = {};
            finaljson.items = [];

            // set required fields to default values in case foundCM is empty
            // this can be the case when a search fails
            foundCM.results = foundCM.results || [];
            foundCM.total = foundCM.total || 0;

            // Adjust total search result count
            updateTotalHitCount(foundCM.results.length);

            var params = sakai_global.data.search.getQueryParams();
            $("#cm_header .searchall_results_part_header").html(sakai.api.Util.TemplateRenderer("cm_results_header_template", {"query_href":"#l=content&q=" + params.q + "&page=" + params.page, "show_more":Math.abs(foundCM.total) > cmToSearch}));

            if (foundCM && foundCM.results) {
                finaljson = sakai_global.data.search.prepareCMforRender(foundCM.results, finaljson);
            }
            $(searchConfig.cm.searchResult).html(sakai.api.Util.TemplateRenderer(searchConfig.cm.searchResultTemplate, finaljson));
        };

        /**
         * This will render the results for the found sites. It will add the nr of results to the total
         * If nessecary it will show the link to dispolay more.
         * @param {Object} results Response from the REST service.
         */
        var renderGroups = function(foundGroups) {

            var finaljson = {};
            finaljson.items = [];

            // set required fields to default values in case foundCM is empty
               // this can be the case when a search fails
            foundGroups.results = foundGroups.results || [];
            foundGroups.total = foundGroups.total || 0;

            // Adjust total search result count
            updateTotalHitCount(foundGroups.results.length);
            
            var params = sakai_global.data.search.getQueryParams();
            $("#sites_header .searchall_results_part_header").html(sakai.api.Util.TemplateRenderer("groups_results_header_template", {"query_href":"#l=groups&q=" + params.q + "&page=" + params.page, "show_more":Math.abs(foundGroups.total) > groupsToSearch}));

            if (foundGroups && foundGroups.results) {
                finaljson = sakai_global.data.search.prepareGroupsForRender(foundGroups.results, finaljson);
            }
        
            $(searchConfig.sites.searchResult).html(sakai.api.Util.TemplateRenderer(searchConfig.sites.searchResultTemplate, finaljson));
        
        };


        /**
         * This will render the results for the people. It will add the nr of results to the total
         * If nessecary it will show the link to dispolay more.
         * @param {Object} results Response from the REST service.
         */
        var renderPeople = function(results) {

            var finaljson = {};
            finaljson.items = [];

            // set required fields to default values in case foundCM is empty
            // this can be the case when a search fails
            results.results = results.results || [];
            results.total = results.total || 0;

            // Adjust total search result count
            updateTotalHitCount(results.results.length);

            var params = sakai_global.data.search.getQueryParams();
            $("#people_header .searchall_results_part_header").html(sakai.api.Util.TemplateRenderer("people_results_header_template", {"query_href":"#l=people&q=" + params.q + "&page=" + params.page, "show_more":Math.abs(results.total) > peopleToSearch}));

            if (results && results.results) {
                finaljson = sakai_global.data.search.preparePeopleForRender(results.results, finaljson);
            }

            $(searchConfig.people.searchResult).html(sakai.api.Util.TemplateRenderer(searchConfig.people.searchResultTemplate, finaljson));

         };

        var doSearch = function(){

            var params = sakai_global.data.search.getQueryParams();
            showSearchContent(params);
            var urlsearchterm = sakai.api.Server.createSearchString(params.q);

            // Set off the 3 AJAX requests
            var filesUrl = sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json");
            var usersUrl = sakai.config.URL.SEARCH_USERS;
            var groupsUrl = sakai.config.URL.SEARCH_GROUPS;
            if (urlsearchterm === "*" || urlsearchterm === "**") {
                filesUrl = sakai.config.URL.SEARCH_ALL_FILES_ALL;
                usersUrl = sakai.config.URL.SEARCH_USERS_ALL;
                groupsUrl = sakai.config.URL.SEARCH_GROUPS_ALL;
                $(window).trigger("lhnav.addHashParam", [{"q": ""}]);
            } else {
                $(window).trigger("lhnav.addHashParam", [{"q": params.q}]);
            }

            // get the sort by
            var sortBy = $("#search_select_sortby option:first").val();
            if (params["sortby"]){
                sortBy = params["sortby"];
            }

            // Content search
            $.ajax({
                url: filesUrl,
                data: {
                    "page": 0,
                    "q" : urlsearchterm,
                    "items" : cmToSearch,
                    "sortOn": "_created",
                    "sortOrder": sortBy
                },
                cache: false,
                success: function(data) {
                    renderCM(data);
                },
                error: function() {
                    renderCM({});
                }
            });

            // People Search
            $.ajax({
                cache: false,
                url: usersUrl,
                data: {
                    "page": 0,
                    "items": peopleToSearch,
                    "q": urlsearchterm,
                    "sortOn": "_created",
                    "sortOrder": sortBy
                },
                success: function(data) {
                    renderPeople(data);
                },
                error: function() {
                    renderPeople({});
                }
            });

            // Groups search
            $.ajax({
                cache: false,
                url: groupsUrl,
                data: {
                    "page": 0,
                    "items": groupsToSearch,
                    "q": urlsearchterm,
                    "sortOn": "_created",
                    "sortOrder": sortBy
                },
                success: function(data) {
                    renderGroups(data);
                },
                error: function() {
                    renderGroups({});
                }
            });
        }

        ///////////////////
        // Event binding //
        ///////////////////

        $(searchConfig.global.text).live("keydown", function(ev){
            if (ev.keyCode === 13) {
                $.bbq.pushState({
                    "q": $(searchConfig.global.text).val(),
                    "page": 1
                }, 0);
            }
        });

        $(searchConfig.global.button).live("click", function(ev){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "page": 1
            }, 0);
        });

        $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
            sakai_global.data.search.getMyContacts();
            $('.sakai_addtocontacts_overlay').each(function(index) {
                if ($(this).attr("sakai-entityid") === userToAdd.uuid){
                    $(this).hide();
                }
            });
        });

        /////////////////////////
        // Initialise Function //
        /////////////////////////

        $(window).bind("hashchange", function(ev){
            if ($.bbq.getState("l") === "all" || !$.bbq.getState("l")) {
                doSearch();
            }
        });

        $(window).bind("sakai.search.util.finish", function(ev){
            doSearch();
        });

        $(window).trigger("sakai.search.util.init");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchall");

});
