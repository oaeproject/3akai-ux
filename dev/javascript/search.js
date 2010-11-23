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


    /////////////////
    // CONFIG VARS //
    /////////////////

    var mainSearch = false;
    var contactclicked = false;

    var peopleToSearch = 6;
    var cmToSearch = 5;
    var nrOfCharactersAroundTerm = 300;
    var sitesToSearch = 5;

    var foundPeople = false;
    var searchterm = "";
    var tagterm = "";

    var totalItemsFound = 0;


    /////////////
    // CSS IDs //
    /////////////

    var search = "#search";
    var searchConfig = {
        search : "#search",
        global : {
            resultTemp : search + "_result_temp",
            thousands : search + "_result_thousands",
            introductionText: "#introduction_text",
            button : search + "_button",
            text : ".search_content_main " + search + '_text',
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
            sendmessageContainer : "#sendmessagecontainer",
            resultTitle : "#search_result_title",
            resultTagTitle : "#search_result_tag_title"
        },
        people : {
            displayMore : "#display_more_people",
            displayMoreNumber : "#display_more_people_number",
            searchResult : "#people_search_result",
            searchResultTemplate : "people_search_result_template",
            header : "#people_header"
        },
        sites : {
            displayMore : "#display_more_sites",
            displayMoreNumber : "#display_more_sites_number",
            searchResult : "#sites_search_result",
            searchResultTemplate : "sites_search_result_template",
            header : "#sites_header"
        },
        cm : {
            displayMore : "#display_more_cm",
            displayMoreNumber : "#display_more_cm_number",
            searchResult : "#cm_search_result",
            searchResultTemplate : "cm_search_result_template",
            header : "#cm_header"
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
        tabs : {
            all : "#tab_search_all",
            content : "#tab_search_content",
            people : "#tab_search_people",
            sites : "#tab_search_sites"
        }
    };


    ///////////////
    // Functions //
    ///////////////

    sakai._search.reset = function() {
        // Hide the blocks
        $(searchConfig.cm.header).hide();
        $(searchConfig.people.header).hide();
        $(searchConfig.sites.header).hide();
        $(searchConfig.global.resultTitle).hide();
        $(searchConfig.global.introductionText).show();
    };


    var showSearchContent = function() {
        // Set searching messages
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
     * Adds a "historical event". This way the searchterm will be added in the url bar and the user can use his back and forward button.
     * @param {Object} page Page you are on (for search_b this is always 1)
     * @param {Object} searchquery The searchterm
     */
    var doHSearch = function() {
        totalItemsFound = 0;
        History.addBEvent("1", encodeURIComponent($(searchConfig.global.text).val()));
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
        // If number is higher than a configurable threshold show a word instead conveying ther uncountable volume -- TO DO: i18n this
        if (totalItemsFound <= sakai.config.Search.MAX_CORRECT_SEARCH_RESULT_COUNT) {
            $(searchConfig.global.numberFound).text(""+totalItemsFound);
        } else {
            $(searchConfig.global.numberFound).text($(searchConfig.global.thousands).html());
        }

    };


    /**
     * This will render the results for the found content and media. It will add the nr of results to the total
     * If nessecary it will show the link to dispolay more.
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

        $("#search_content_title").attr("href", "search_content.html#q=" + searchterm);
        if (Math.abs(foundCM.total) > cmToSearch) {
            $(searchConfig.cm.displayMore).show();
            $(searchConfig.cm.displayMore).attr("href", "search_content.html#q=" + searchterm);
        }

        if (foundCM && foundCM.results) {

            finaljson = mainSearch.prepareCMforRendering(foundCM.results, finaljson);

        }
        $(searchConfig.cm.searchResult).html($.TemplateRenderer(searchConfig.cm.searchResultTemplate, finaljson));

        $(".search_result_person_threedots").ThreeDots({
            max_rows: 1,
            text_span_class: "threedots",
            alt_text_t: true
        });

    };

    /**
     * This will render the results for the found sites. It will add the nr of results to the total
     * If nessecary it will show the link to dispolay more.
     * @param {Object} results Response from the REST service.
     */
    var renderSites = function(foundSites) {

        var finaljson = {};
        finaljson.items = [];

        // set required fields to default values in case foundCM is empty
           // this can be the case when a search fails
        foundSites.results = foundSites.results || [];
        foundSites.total = foundSites.total || 0;

        // Adjust total search result count
        if (foundSites.results) {

            updateTotalHitCount(foundSites.results.length);

            $("#search_groups_title").attr("href", "search_groups.html#q=" + searchterm);
            if (Math.abs(foundSites.total) > sitesToSearch) {
                $(searchConfig.sites.displayMore).show();
                $(searchConfig.sites.displayMore).attr("href", "search_groups.html#q=" + searchterm);
            }

            if (foundSites && foundSites.results) {

                finaljson.items = [];

                for (var group in foundSites.results){
                    if (foundSites.results.hasOwnProperty(group)) {
                        if (foundSites.results[group]["sakai:group-title"]) {
                            foundSites.results[group]["sakai:group-title"] = sakai.api.Security.escapeHTML(foundSites.results[group]["sakai:group-title"]);
                        }
                        finaljson.items.push(foundSites.results[group]);
                    }
                }

                // If result is page content set up page path
                for (var i=0, j=finaljson.items.length; i<j; i++ ) {

                    var full_path = finaljson.items[i]["path"];
                    var site_path = finaljson.items[i]["sakai:group-id"];
                    var page_path = site_path;
                    if (finaljson.items[i]["excerpt"]) {
                        var stripped_excerpt = $(""+finaljson.items[i]["excerpt"] + "").text().replace(/<[^>]*>/g, "");
                        finaljson.items[i]["excerpt"] = stripped_excerpt;
                    }

                    if (finaljson.items[i]["type"] === "sakai/pagecontent") {
                        page_path = full_path.replace(/\/_pages/g, "");
                        page_path = page_path.replace(/\/pageContent/g, "");
                        page_path = page_path.replace(/\//g,"");
                        page_path = site_path + "#" + page_path;
                    }
                    finaljson.items[i]["pagepath"] = page_path;

                    if (finaljson.items[i].picture && typeof finaljson.items[i].picture === "string") {
                        finaljson.items[i].picture = $.parseJSON(finaljson.items[i].picture);
                        finaljson.items[i].picture.picPath = "/~"+finaljson.items[i]["sakai:group-id"]+"/public/profile/"+finaljson.items[i].picture.name;
                    }
                }
            }
        }

        $(searchConfig.sites.searchResult).html($.TemplateRenderer(searchConfig.sites.searchResultTemplate, finaljson));
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

        $("#search_people_title").attr("href", "search_people.html#q=" + searchterm);
        if ((Math.abs(results.total) > peopleToSearch) && (results.results.length > 0)) {
            $(searchConfig.people.displayMore).attr("href", "search_people.html#q=" + searchterm).show();
        }

        if (results && results.results) {
            // Prepare the finaljson object for rendering
            finaljson = mainSearch.preparePeopleForRender(results.results, finaljson);
        }

        foundPeople = finaljson.items;

        $(searchConfig.people.searchResult).html($.TemplateRenderer(searchConfig.people.searchResultTemplate, finaljson));
    };



     /**
     * This function gets called everytime the page loads and a new searchterm is entered.
     * It gets called by search_history.js
     * @param {String} searchquery The searchterm you want to search trough.
     */
    sakai._search.doSearch = function(page, searchquery, searchwhere) {

        // Get the tag if present.
        tagterm = mainSearch.getSearchTags();

        // Check if the searchquery is empty
        if((searchquery === "" || searchquery === undefined) && (tagterm === "" || tagterm === undefined)){

            // If there is nothing in the search query, remove the html and hide some divs
            $(".search_results_container").hide();
            $(searchConfig.global.resultTitle).hide();
            $(searchConfig.global.pagerClass).hide();
            return;
        }

        mainSearch.fillInElements(page, searchquery, searchwhere);

        // Get the search term out of the input box.
        // If we were redirected to this page it will be added previously already.
        searchterm = $(searchConfig.global.text).val().toLowerCase();

        // Rebind everything
        mainSearch.addEventListeners(searchterm);

        if (searchquery && searchterm && searchterm !== $(searchConfig.global.text).attr("title").toLowerCase() + " ...") {
            // Show and hide the correct elements.
            showSearchContent();

            // Convert spaces etc.

            var urlsearchterm = mainSearch.prepSearchTermForURL(searchterm);

            // Set off the 3 AJAX requests
            // Content & Media Search
            $.ajax({
                url: sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json"),
                data: {
                    "q" : urlsearchterm,
                    "items" : cmToSearch
                },
                cache: false,
                success: function(data) {
                    renderCM(data);
                },
                error: function(xhr, textStatus, thrownError) {
                    renderCM({});
                }
            });

            // People Search
            $.ajax({
                cache: false,
                url: sakai.config.URL.SEARCH_USERS,
                data: {
                    page: 0,
                    items: peopleToSearch,
                    q: urlsearchterm,
                    sortOn: "public/authprofile/basic/elements/lastName/@value",
                    sortOrder: "ascending"
                },
                success: function(data) {

                    // Store found people in data cache
                    sakai.data.search.results_people = {};
                    for (var i = 0, j = data.results.length; i < j; i++) {
                        sakai.data.search.results_people[data.results[i]["rep:userId"]] = data.results[i];
                    }

                    // Render results
                    renderPeople(data);
                },
                error: function(xhr, textStatus, thrownError) {

                    sakai.data.search.results_people = {};
                    renderPeople({});
                }
            });

            // Sites search
            $.ajax({
                cache: false,
                url: sakai.config.URL.SEARCH_GROUPS,
                data: {
                     page: 0,
                     items: 5,
                     q: urlsearchterm
                },
                success: function(data) {
                    renderSites(data);
                },
                error: function(xhr, textStatus, thrownError) {
                    renderSites({});
                }
            });

        } else if (tagterm) {
            // Show and hide the correct elements.
            showSearchContent();
            $(searchConfig.global.resultTitle).hide();
            $(searchConfig.global.resultTagTitle).show();

            // Search based on tags and render each search section
            $.ajax({
                url: tagterm + ".tagged.5.json",
                cache: false,
                dataType: "json",
                success: function(data) {

                    var json = {};
                    if (typeof(data) === 'string') {
                        data = $.parseJSON(data);
                    }
                    json.results = data;
                    json.items = json.results.length;

                    renderSites(json);
                    renderCM(json);

                    // Store found people in data cache
                    sakai.data.search.results_people = {};
                    for (var i = 0, j = json.results.length; i < j; i++) {
                        sakai.data.search.results_people[json.results[i]["rep:userId"]] = json.results[i];
                    }
                    renderPeople(json);
                },
                error: function(xhr, textStatus, thrownError) {
                    renderCM({});
                    sakai.data.search.results_people = {};
                    renderPeople({});
                    renderSites({});
                }
            });
        } else {
            // There was no search term provided.
            // Reset the whole thing
            sakai._search.reset();
        }
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


    ////////////
    // EVENTS //
    ////////////

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

    /** A user want to make a new friend */
    $(searchConfig.global.addToContactsLink).live("click", function(ev) {
        contactclicked = (this.id.substring(searchConfig.global.addToContactsFiller.length));
        sakai.addtocontacts.initialise(contactclicked, mainSearch.removeAddContactLinks);
    });


    /////////////////////////
    // Initialise Function //
    /////////////////////////

    var thisFunctionality = {
        "doHSearch" : doHSearch
    };

    var doInit = function() {
        mainSearch = sakai._search(searchConfig, thisFunctionality);
        // add the bindings
        mainSearch.addEventListeners();
    };
    doInit();
};
sakai.api.Widgets.Container.registerForLoad("sakai.search");
