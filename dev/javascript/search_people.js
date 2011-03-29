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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.search = function() {


        //////////////////////////
        //    Config variables    //
        //////////////////////////

        var resultsToDisplay = 10;
        var searchterm = "";
        var tagterm = "";
        var currentpage = 0;
        var foundPeople = [];
        var contactclicked = false;
        var mainSearch = false;
        var max_items = 2000;

        var searchAjaxCall = false;

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

        //    CSS IDs


        var search = "#search";

        var searchConfig = {
            search : "#search",
            global : {
                resultTemp : search + "_result_temp",
                resultExceed : search + "_result_exceed",
                button : search + "_button",
                text  :search + '_text',
                numberFound : search + '_numberFound',
                searchTerm : search + "_mysearchterm",
                tagTerm : search + "_mytagterm",
                searchBarSelectedClass : "search_bar_selected",
                pagerClass : ".jq_pager",
                messageClass : ".search_result_person_link_message",
                messageID : "search_result_person_link_message_",
                addToContactsLink : ".link_add_to_contacts",
                addToContactsFiller : "link_add_to_contacts_",
                addToContactsDialog : '#add_to_contacts_dialog',
                sendmessageContainer : "#sendmessagecontainer"
            },
            addFriend : {
                types : '#add_friend_types',
                typesList : 'add_friends_list_type',
                typesTemplate : "add_friend_types_template",
                displayNameClass : ".add_friend_displayname",
                profilePicture : "#add_friend_profilepicture",
                personalNote : "#add_friend_personal_note",
                personalNoteTemplate : "add_friend_personal_note_template",
                doInvite : "#add_friends_do_invite",
                form : "#add_friends_form",
                response: "#add_to_contacts_response",
                addToContacts : "#link_add_to_contacts_{USERID}",
                addToContactsDivider : "#link_add_to_contacts_{USERID}_divider",
                errors : {
                    request : "#add_to_contacts_error_request",
                    message : "#add_to_contacts_error_message",
                    noTypeSelected : "#add_to_contacts_error_noTypeSelected"
                }

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

        //////////////////
        //    functions    //
        //////////////////


        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function() {
            $(searchConfig.global.searchTerm).html(sakai.api.Security.saneHTML(sakai.api.Security.escapeHTML(searchterm)));
            if (tagterm) {
                var tags = tagterm.replace("/tags/", "").split("/");
                if(tags[0] === "directory"){
                    $(searchConfig.global.tagTerm).html($("#search_result_results_located_in").html() + " " + tags.splice(1,tags.length).toString().replace(/,/g, "<span class='search_directory_seperator'>&raquo;</span>"));
                } else {
                    $(searchConfig.global.tagTerm).html($("#search_result_results_tagged_under").html() + " " + sakai.api.Security.saneHTML(tagterm.replace("/tags/", "")));
                }
            }
            $(searchConfig.global.numberFound).text("0");
            $(searchConfig.results.header).hide();
            $(searchConfig.results.tagHeader).hide();
            $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
        };

        /**
         * This method will cretae a flat space separeted
         * string from a numbered object. For example: obj = {0:"Foo",1:"Bar"} will return "Foo Bar"
         * @param {Object} input_object
         * @return {String} The concatenated String
         */
        var concatObjectValues = function(input_object) {

            var return_string = "";

            // Error handling
            if ((input_object.length === 0) || (!input_object)) {
                return return_string;
            }

            // Concatenate
            for (var i = 0, j = input_object.length; i<j; i++) {
                return_string += input_object[i]+" ";
            }

            // Remove extra space at the end
            return_string = return_string.substring(0,return_string.length-1);

            return return_string;
        };


        /**
         * Will search for a user in the list of results we got from the server.
         * @param {String} userid
         * @return Will return the user object if something is found, false if nothing is found.
         */
        var searchPerson = function(userid) {
            var person = false;
            for (var i = 0, j = foundPeople.length; i<j; i++) {
                if (foundPeople[i].userid === userid) {
                    person = foundPeople[i];
                    break;
                }
            }
            return person;
        };

        /**
         * Checks if user is in the add contacts tour and displays tooltips
         */
        var checkAddContactsTour = function(){
            var querystring = new Querystring();
            if (querystring.contains("addcontactstour") && querystring.get("addcontactstour") === "true") {
                // display tooltip
                var tooltipData = {
                    "tooltipSelector":"#search_button",
                    "tooltipTitle":"TOOLTIP_ADD_CONTACTS",
                    "tooltipDescription":"TOOLTIP_ADD_CONTACTS_P2",
                    "tooltipArrow":"bottom",
                    "tooltipLeft":15
                };
                if (!sakai.tooltip || !sakai.tooltip.isReady) {
                    $(window).bind("ready.tooltip.sakai", function() {
                        $(window).trigger("init.tooltip.sakai", tooltipData);
                    });
                } else {
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                }
            }
        };


        //////////////////////////////
        //    Search functionality    //
        //////////////////////////////


        /**
         * Used to do a search. This will add the page and the searchterm to the url and add
         * it too the history without reloading the page. This way the user can navigate
         * using the back and forward button.
         * @param {Integer} page The page you are on (optional / default = 1.)
         * @param {String} searchquery The searchterm you want to look for (optional / default = input box value.)
         */
        sakai_global._search.doHSearch = function(page, searchquery, searchwhere, facet, killPreviousAjaxCall) {
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
            //    This will invoke the sakai_global._search.doSearch function and change the url.
            History.addBEvent(page, encodeURIComponent(searchquery), searchwhere, facet);

            // display tooltip
            var tooltipData = {
                "tooltipSelector":"#search_button",
                "tooltipTitle":"TOOLTIP_ADD_CONTACTS",
                "tooltipDescription":"TOOLTIP_ADD_CONTACTS_P3",
                "tooltipTop":-150,
                "tooltipLeft":-200
            };
            $(window).trigger("update.tooltip.sakai", tooltipData);
        };

        /**
         * When the pager gets clicked.
         * @param {integer} pageclickednumber The page you want to go to.
         */
        var pager_click_handler = function(pageclickednumber) {
            currentpage = pageclickednumber;
            //    Redo the search
            sakai_global._search.doHSearch(currentpage, searchterm, null, $.bbq.getState('facet'));
        };

        /**
         * This will render all the results we have found.
         * @param {Object} results The json object containing all the result info.
         * @param {Boolean} success If the request was succesfull or not
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
                    $(searchConfig.global.numberFound).text($(searchConfig.global.resultExceed).html());
                }

                // Reset the pager.
                $(searchConfig.global.pagerClass).pager({
                    pagenumber: currentpage,
                    pagecount: Math.ceil(Math.abs(results.total) / resultsToDisplay),
                    buttonClickCallback: pager_click_handler
                });

                if (results.results) {
                    finaljson = mainSearch.preparePeopleForRender(results.results, finaljson);
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
            foundPeople = finaljson.items;

            //    Render the results.
            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $("#search_results_page1").show();
        };



        //////////////////////////
        //    _search functions    //
        //////////////////////////

        /*
         * These are functions that are defined in search_history.js .
         * We override these with our owm implementation.
         */


        /**
         * This function gets called everytime the page loads and a new searchterm is entered.
         * It gets called by search_history.js
         * @param {Integer} page The page you are on.
         * @param {String} searchquery The searchterm you want to search trough.
         * @param {string} searchwhere The subset of contact you want to search in.
         *  * = entire community
         *  my contacts = the site the user is registered on
         */
        sakai_global._search.doSearch = function(page, searchquery, searchwhere, facet) {

            // Get the tag if present.
            tagterm = mainSearch.getSearchTags();

            facetedurl = mainSearch.getFacetedUrl();
            facetedurlall = '';

            if (facet){
                facetedurl = searchConfig.facetedConfig.facets[facet].searchurl;
                facetedurlall = searchConfig.facetedConfig.facets[facet].searchurlall;
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

            //    Set all the input fields and paging correct.
            mainSearch.fillInElements(page, searchquery, searchwhere);


            //    Get the search term out of the input box.
            //    If we were redirected to this page it will be added previously already.
            searchterm = $(searchConfig.global.text).val();

            //    Rebind everything
            mainSearch.addEventListeners(searchterm, searchwhere);

            if (searchquery && searchterm && searchterm !== $(searchConfig.global.text).attr("title")) {
                // Show and hide the correct elements.
                showSearchContent();

                // Set off the AJAX request

                // Look to in which place we are searching (is it all the contacts or only my contacts)
                var searchWhere = mainSearch.getSearchWhereUsers();

                // What are we looking for?
                var urlsearchterm = mainSearch.prepSearchTermForURL(searchterm);

                // The search URL depends on the searchWhere variable
                var searchURL;
                var params = {};

                if (searchWhere === "mycontacts") {
                    if (urlsearchterm === "*" || urlsearchterm === "**") {
                        searchURL = sakai.config.URL.CONTACTS_FIND_STATE;
                    } else {
                        searchURL = sakai.config.URL.CONTACTS_FIND;
                        params['q'] = urlsearchterm;
                    }
                } else {
                    params = {
                        page: (currentpage - 1),
                        items: resultsToDisplay,
                        sortOn: "lastName",
                        sortOrder: "asc"
                    };
                    if (urlsearchterm === "*" || urlsearchterm === "**") {
                        searchURL = sakai.config.URL.SEARCH_USERS_ALL;
                    } else {
                        params['q'] = urlsearchterm;
                        searchURL = sakai.config.URL.SEARCH_USERS;
                    }
                }

                // Check if we want to search using a faceted link
                if (facetedurl){
                   params = {
                        page: (currentpage - 1),
                        items: resultsToDisplay,
                        sortOn: "firstName",
                        sortOrder: "asc"
                   };
                   if (urlsearchterm === '*' || urlsearchterm === '**') {
                       if (facetedurlall) {
                           searchURL = facetedurlall;
                       } else {
                           searchURL = facetedurl;
                           params['q'] = urlsearchterm;
                       }
                   } else {
                       searchURL = facetedurl;
                       params['q'] = urlsearchterm;
                   }
                }

                searchAjaxCall = $.ajax({
                    cache: false,
                    url: searchURL,
                    data: params,
                    success: function(data) {

                        // Store found people in data cache
                        sakai_global.data.search.results_people = {};
                        var resultsTemp = {};
                        // if results are returned in a different format
                        if (!data.results && data.contacts && facetedurl === sakai.config.URL.PRESENCE_CONTACTS_SERVICE) {
                            resultsTemp = { results : [] };
                            var j = 0;
                            $.each(data.contacts, function(i, val) {
                                if (val.profile && val["sakai:status"] === "online") {
                                    resultsTemp.results[j] = val.profile;
                                    j++;
                                }
                            });
                            resultsTemp.total = data.total;
                            data = resultsTemp;
                        } else if (data.results) {
                            resultsTemp = { results : [] };
                            var updateData = false;
                            $.each(data.results, function(i, val) {
                                if (val.profile) {
                                    resultsTemp.results[i] = val.profile;
                                    updateData = true;
                                }
                            });
                            resultsTemp.total = data.total;
                            if (updateData) {
                                data = resultsTemp;
                            }
                        }

                        for (var i = 0, jj = data.results.length; i < jj; i++) {
                            sakai_global.data.search.results_people[data.results[i]["rep:userId"]] = data.results[i];
                        }
                        if (facet === "invited") {
                            for (var ii = 0, jjj = data.results.length; i < jjj; ii++) {
                                data.results[ii]["invited"] = true;
                            }
                        }

                        renderResults(data, true);
                        $(searchConfig.results.header).show();
                    },
                    error: function(xhr, textStatus, thrownError) {
                        sakai_global.data.search.results_people = {};
                        renderResults(sakai_global.data.search.results_people, false);
                        $(searchConfig.results.header).show();
                    }
                });

            } else if (tagterm) {
                // add text to search input
                $(searchConfig.global.text).val(tagterm);

                // Show and hide the correct elements.
                showSearchContent();

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
                        $(searchConfig.results.tagHeader).show();
                    },
                    error: function(xhr, textStatus, thrownError) {
                        var json = {};
                        renderResults(json, false);
                        $(searchConfig.results.tagHeader).show();
                    }
                });
            } else {
                sakai_global._search.reset();
            }
        };

        /**
         * Will reset the view to standard.
         */
        sakai_global._search.reset = function() {
            $(searchConfig.results.header).hide();
        };

        // Handling the anon user
        if (sakai.data.me.user.anon) {
            $("#search_results_page1").removeClass("search_results_container_sub");
        }


        //////////////////////
        //    Event binding    //
        //////////////////////


        /** When a user wants to message another  user */
        $(searchConfig.global.messageClass).live("click", function() {
            var reg = new RegExp(searchConfig.global.messageID, "gi");
            var contactclicked = $(this).attr("id").replace(reg,"");
            var person = searchPerson(contactclicked);
            if (contactclicked) {
                $(searchConfig.global.sendmessageContainer).show();
                if (!person.uuid) {
                    person.uuid = person.userid;
                }
                if (!person.hasOwnProperty("firstName") && !person.hasOwnProperty("lastName")) {
                    person.firstName = person.uuid;
                    person.lastName = "";
                }
                $(window).trigger("initialize.sendmessage.sakai", [person, true]);
            }
        });

        /** A user want to make a new friend. */
        $(searchConfig.global.addToContactsLink).live("click", function(ev) {
            contactclicked = (this.id.substring(searchConfig.global.addToContactsFiller.length));
            $(window).trigger("initialize.addToContacts.sakai", { user: contactclicked, callback: mainSearch.removeAddContactLinks });

            // display tooltip
            var tooltipData = {
                "tooltipSelector":"#addtocontacts_profilepicture",
                "tooltipTitle":"TOOLTIP_ADD_CONTACTS",
                "tooltipDescription":"TOOLTIP_ADD_CONTACTS_P4",
                "tooltipTop":-50,
                "tooltipLeft":350
            };
            $(window).trigger("update.tooltip.sakai", tooltipData);
        });


        //////////////////////
        //    init function    //
        //////////////////////


        var thisFunctionality = {
            "doHSearch" : sakai_global._search.doHSearch
        };


        /**
         * Will fetch the sites and add a new item to the history list.
         */
        var doInit = function() {

            mainSearch = sakai_global._search(searchConfig, thisFunctionality);

            // check the URL for a query arg
            mainSearch.checkQuery();

            // add the bindings
            mainSearch.addEventListeners();

            // display faceted panel
            mainSearch.addFacetedPanel();

            // check for add contacts tour in progress
            checkAddContactsTour();
        };
        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("search");    
});
