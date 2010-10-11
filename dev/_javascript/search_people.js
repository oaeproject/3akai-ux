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

/*global $, Config, History, Widgets */

var sakai = sakai || {};
sakai.search = function() {


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

    // Search URL mapping
    var searchURLmap = {
        allusers : sakai.config.URL.SEARCH_USERS,
        mycontacts : sakai.config.URL.SEARCH_USERS_ACCEPTED,
        invitedcontacts : sakai.config.URL.CONTACTS_INVITED,
        pendingcontacts : sakai.config.URL.CONTACTS_PENDING,
        onlinecontacts : sakai.config.URL.PRESENCE_CONTACTS_SERVICE
    };

    //    CSS IDs


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
            sites : "#tab_search_sites"
        },
        results : {
            container : search + '_results_container',
            header : search + '_results_header',
            tagHeader : search +  '_results_tag_header',
            template : 'search_results_template'
        },
        facetedConfig : {
            title : "Refine your search",
            value : "People",
            facets: {
                "all" : {
                    "category": "All People",
                    "searchurl": searchURLmap.allusers
                },
                "contacts" : {
                    "category": "My Contacts",
                    "searchurl": searchURLmap.mycontacts
                },
                //"onlinecontacts" : {
                //    "category": "Contacts Currently Online",
                //    "searchurl": searchURLmap.onlinecontacts
                //},
                "invited" : {
                    "category": "My Contact Invitations",
                    "searchurl": searchURLmap.invitedcontacts
                },
                "requested" : {
                    "category": "Pending Invitations",
                    "searchurl": searchURLmap.pendingcontacts
                }
            }
        }
    };




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
    sakai._search.doHSearch = function(page, searchquery, searchwhere, facet) {
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
        //    This will invoke the sakai._search.doSearch function and change the url.
        History.addBEvent(page, encodeURIComponent(searchquery), searchwhere, facet);
    };

    /**
     * When the pager gets clicked.
     * @param {integer} pageclickednumber The page you want to go to.
     */
    var pager_click_handler = function(pageclickednumber) {
        currentpage = pageclickednumber;
        //    Redo the search
        sakai._search.doHSearch(currentpage, searchterm, null, $.bbq.getState('facet'));
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
                $(searchConfig.global.numberFound).text("more than 100");
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
        $(searchConfig.results.header).show();
        
        //    Render the results.
        $(searchConfig.results.container).html($.TemplateRenderer(searchConfig.results.template, finaljson));
        $("#search_results_page1").show();
        
        
        $(".search_result_person_threedots").ThreeDots({
            max_rows: 1,
            text_span_class: "threedots",
            alt_text_t: true
        });
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
    sakai._search.doSearch = function(page, searchquery, searchwhere, facet) {

        // Get the tag if present.
        tagterm = mainSearch.getSearchTags();

        facetedurl = mainSearch.getFacetedUrl();

        if (facet){
            facetedurl = searchConfig.facetedConfig.facets[facet].searchurl;
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
        searchterm = $(searchConfig.global.text).val().toLowerCase();

        //    Rebind everything
        mainSearch.addEventListeners(searchterm, searchwhere);

        if (searchquery && searchterm && searchterm !== $(searchConfig.global.text).attr("title").toLowerCase()) {
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

            if(searchWhere === "mycontacts") {
                searchURL = sakai.config.URL.SEARCH_USERS_ACCEPTED;
                params = {
                    q: urlsearchterm
                }
            }  else {
                searchURL = sakai.config.URL.SEARCH_USERS;
                params = {
                    page: (currentpage - 1),
                    items: resultsToDisplay,
                    q: urlsearchterm,
                    sortOn: "basic/elements/lastName/@value",
                    sortOrder: "ascending"
                }
            }

            // Check if we want to search using a faceted link
            if (facetedurl){
               searchURL = facetedurl;
               params = {
                    page: (currentpage - 1),
                    items: resultsToDisplay,
                    q: urlsearchterm,
                    sortOn: "basic/elements/firstName/@value",
                    sortOrder: "ascending"
                }
            }

            $.ajax({
                cache: false,
                url: searchURL,
                data: params,
                success: function(data) {

                    // Store found people in data cache
                    sakai.data.search.results_people = {};

                    // if results are returned in a different format
                    if (!data.results && data.contacts && facetedurl === sakai.config.URL.PRESENCE_CONTACTS_SERVICE) {
                        var resultsTemp = { results : [] };
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
                        var resultsTemp = { results : [] };
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

                    for (var i = 0, j = data.results.length; i < j; i++) {
                        sakai.data.search.results_people[data.results[i]["rep:userId"]] = data.results[i];
                    }

                    renderResults(data, true);
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.data.search.results_people = {};
                    renderResults(sakai.data.search.results_people, false);
                }
            });

        } else if (tagterm) {
            // Show and hide the correct elements.
            showSearchContent();
            $(searchConfig.results.header).hide();
            $(searchConfig.results.tagHeader).show();

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
                },
                error: function(xhr, textStatus, thrownError) {
                    var json = {};
                    renderResults(json, false);
                }
            });
        } else {
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
            sakai.sendmessage.initialise(person, true);
        }
    });

    /** A user want to make a new friend. */
    $(searchConfig.global.addToContactsLink).live("click", function(ev) {
        contactclicked = (this.id.substring(searchConfig.global.addToContactsFiller.length));
        sakai.addtocontacts.initialise(contactclicked, mainSearch.removeAddContactLinks);
    });


    //////////////////////
    //    init function    //
    //////////////////////


    var thisFunctionality = {
        "doHSearch" : sakai._search.doHSearch
    };


    /**
     * Will fetch the sites and add a new item to the history list.
     */
    var doInit = function() {

        mainSearch = sakai._search(searchConfig, thisFunctionality);

        // add the bindings
        mainSearch.addEventListeners();

        // display faceted panel
        mainSearch.addFacetedPanel();

    };
    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.search");