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

/*
 * This file will contain all the functionality that the 4 search files have in common.
 * ex: fetching my sites
 */

require(["jquery","sakai/sakai.api.core"], function($, sakai) {
    sakai_global.data = sakai_global.data || {};
    sakai_global.data.search = sakai_global.data.search || {};
    sakai_global._search = function(config, callback) {

        var searchConfig = config;
        var hasHadFocus = false;
        var searchSubset = false;
        var myfriends = {};
        var nrOfCharactersAroundTerm = 300;
        var usernameLengthStrip = 40;
        var mainFacetedUrl = "";


        /////////////////////////
        // Sites Functionality //
        /////////////////////////

        /**
         * Compare the names of 2 sites and order them alphabetically
         * @param {Object} a
         * @param {Object} b
         * @return 1, 0 or -1
         */
        var doSort = function(a, b) {
            if (a.name > b.name) {
                return 1;
            }
            else if (a.name === b.name) {
                return 0;
            }
            else {
                return -1;
            }
        };

        /**
         * Renders all the sites you are registered to.
         * @param {Object} data Object that represents all the sites. This object should contain an array 'items' that has all the sites.
         */
        var renderMySites = function(data) {
            // Perform a sorting on sites.
            data.items.sort(doSort);

            // render the sites
            $(config.filters.sites.filterSites).html(sakai.api.Util.TemplateRenderer(config.filters.sites.filterSitesTemplate, data));

            // because the response of the sites service will always be lower then the page load
            // we check if we have to select a site
            if (searchSubset) {
                $(searchConfig.filters.sites.ids.specificSite + searchSubset.substring(1)).attr("selected", "selected");
            }
        };

        /**
         * Gets the sites of the current user and will call the render method.
         */
        var getMySites = function() {
            History.history_change();
        };

        /**
         * Make a term bold if it occurs in a specific piece of text
         * @param {String} inputtext The text where we check for a specific term
         * @param {String} inputterm The term that we'll check in the text
         */
        var convertTermToBold = function(inputtext, inputterm){

            // Check if the term is found in the text
            var place = inputtext.toLowerCase().indexOf(inputterm);
            if (place !== -1) {
                var toreplace = inputtext.substring(place, place + inputterm.length);
                inputtext = inputtext.replace(toreplace, "<strong>" + toreplace + "</strong>");
            }

            // Return the input text
            return inputtext;
        };


        ////////////////////
        // Friends filter //
        ////////////////////

        /**
         * Makes a request to the server and loads the friends.
         */
        var fetchMyFriends = function() {
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_ALL + "?&page=0&n=100",
                cache: false,
                async: false,
                success: function(data) {
                    myfriends = $.extend(data, {}, true);
                    // Change the history
                    History.history_change();
                }
            });
        };

        fetchMyFriends();

        /**
         * Getter for the myFriends var
         */
        var getMyFriends = function() {
            return myfriends;
        };

        /**
         * Getter for the facetedurl var
         */
        var getFacetedUrl = function() {
            return mainFacetedUrl;
        };

        /**
         * Will add all the event listeners
         */
        var addEventListeners = function(searchterm, searchwhere) {
            /** The top tabs */
            $(searchConfig.tabs.all + ", " + searchConfig.tabs.people + ", " + searchConfig.tabs.sites + ", " + searchConfig.tabs.content+ ", " + searchConfig.tabs.sakai2).live("click", function(ev) {
                var url = $(this).attr("href").split("#")[0] + "#";
                var frag = $.deparam.fragment();
                frag["filter"] = ""; // clear the filter
                frag["facet"] = ""; // clear the facet
                frag["page"] = "1";
                url = $.param.fragment(url, frag);
                $(this).attr("href", url);
                return true;
            });

            /** We add a different style to the input box when it gets focussed. */
            $(searchConfig.global.text).bind("focus", function(ev) {
                if (!hasHadFocus) {
                    $(searchConfig.global.text).val("");
                    $(searchConfig.global.text).addClass(searchConfig.global.searchBarSelectedClass);
                }
                hasHadFocus = true;
            });

            /** When we hit return in the input box, the search should get executed. */
            $(searchConfig.global.text).bind("keypress", function(ev) {
                if (ev.keyCode === 13) {
                    callback.doHSearch();
                }
            });

            /** When we click the search button the search should get executed. */
            $(searchConfig.global.button).unbind("click");
            $(searchConfig.global.button).bind("click", function(ev) {
                callback.doHSearch();
            });
        };


        /**
         * Will fill in the input box and the drop down. Will also save the current page.
         * @param {Integer} page The page you are on.
         * @param {String} searchquery The searchterm you want to search trough.
         * @param {string} searchwhere The subset of sites you want to search in.
         *  * = entire community
         *  mysites = the site the user is registered on
         *  /a-site-of-mine = specific site from the user
         */
        var fillInElements = function(page, searchquery, searchwhere) {
            if (searchquery) {
                // This is a custom search term, we shouldnt hide it.
                hasHadFocus = true;
                // Set the search text.
                // If we were redirected from another page this will be empty.
                $(searchConfig.global.text).val(decodeURIComponent(searchquery));
                $(searchConfig.global.text).addClass(searchConfig.global.searchBarSelectedClass);
            }

            if (searchwhere) {
                searchSubset = searchwhere;
                // The subset to search in has been provided.
                if (searchwhere === "*") {
                    $(searchConfig.filters.sites.ids.entireCommunity).attr("selected", "selected");
                }
                else if (searchwhere === "mysites") {
                    $(searchConfig.filters.sites.ids.allMySites).attr("selected", "selected");
                }
                else {
                    // TODO    Sites will be loaded after this function so this can come too early..
                    $(searchConfig.filters.sites.ids.specificSite + searchwhere.substring(1)).attr("selected", "selected");
                }
            }
        };

        /**
         * This will take a Content & Media result set and prep it so it can be rendered.
         * @param {Object} results The results that have to be rendered.
         * @param {Object} finaljson The object where the rendered results shall come in. (results come in .items)
         */
        var prepareCMforRendering = function(results, finaljson, searchterm) {
            for (var i = 0, j = results.length; i < j; i++) {

                // Set the item object in finaljson equal to the object in results
                finaljson.items[i] = results[i];

                // Only modify the description if there is one
                if (finaljson.items[i]["sakai:description"]) {
                    finaljson.items[i]["sakai:description"] = sakai.api.Util.applyThreeDots(finaljson.items[i]["sakai:description"], $("#sites_header .search_results_part_header").width() - 80, {max_rows: 1,whole_word: false}, "search_result_course_site_excerpt");
                }
                if(finaljson.items[i]["sakai:pooled-content-file-name"]){
                    finaljson.items[i]["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(finaljson.items[i]["sakai:pooled-content-file-name"], $("#sites_header .search_results_part_header").width() - 80, {max_rows: 1,whole_word: false}, "s3d-bold");
                }
                // Modify the tags if there are any
                if(finaljson.items[i]["sakai:tags"]){
                    if (typeof(finaljson.items[i]["sakai:tags"]) === 'string') {
                        finaljson.items[i]["sakai:tags"] = finaljson.items[i]["sakai:tags"].split(",");
                    }

                    for(var k = 0, l = finaljson.items[i]["sakai:tags"].length; k < l; k++){

                        // If the searchterm occures in the tags, make it bold
                        if (finaljson.items[i]["sakai:tags"][k]) {
                            finaljson.items[i]["sakai:tags"][k] = convertTermToBold(finaljson.items[i]["sakai:tags"][k], searchterm);
                        }
                    }
                }
            }
            finaljson.sakai = sakai;
            return finaljson;
        };

        $(".link_accept_invitation").live("click", function(e) {
            var userid = $(this).attr("id").split("link_accept_invitation_")[1];
            acceptInvitation(userid);
            $(this).siblings("a.search_result_person_divider").remove();
            $(this).siblings("a.search_result_person_link_divider_message").removeClass("search_result_person_link_divider_message");
            $(this).remove();
        });

        var acceptInvitation = function(userid) {
            var $userContainer = $("div div a#link_accept_invitation_" + userid).parent("div").parent("div");
            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/contacts.accept.html",
                type: "POST",
                data : {"targetUserId": userid},
                success: function(data) {
                    fetchMyFriends();
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("AN_ERROR_HAS_OCCURRED"),"",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * This will take a peopel result set and prep it so it can be rendered.
         * @param {Object} results The results that have to be rendered.
         * @param {Object} finaljson The object where the rendered results shall come in. (results come in .items)
         */
        var preparePeopleForRender = function(results, finaljson) {
            for (var i = 0, j = results.length; i<j; i++) {
                var item = results[i];
                if (item) {
                    var user = {};
                    user.userid = item["rep:userId"];
                    // Parse the user his info.
                    user.path = "/~" + user.userid + "/public/";
                    var person = item;
                    if (person && person.basic && person.basic.elements && person.basic.elements.picture && $.parseJSON(person.basic.elements.picture.value).name){
                        person.picture = person.basic.elements.picture.value;
                    }
                    if (person.picture) {
                        var picture;
                        // if picture is string
                        if (typeof person.picture === "string") {
                            picture = $.parseJSON(person.picture);
                        // if picuture is json object
                        } else {
                            picture = person.picture;
                        }
                        if (picture.name) {
                            user.picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        } else {
                            user.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                        }
                        if (picture.name) {
                            user.picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        } else {
                            user.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                        }
                    } else {
                        user.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                    }
                    if (sakai.api.User.getDisplayName(item) !== "")  {
                        user.name = sakai.api.User.getDisplayName(item);
                        user.name = sakai.api.Util.applyThreeDots(user.name, 180, {max_rows: 1,whole_word: false}, "s3d-bold");
                        user.firstName = sakai.api.User.getProfileBasicElementValue(item, "firstName");
                        user.lastName = sakai.api.User.getProfileBasicElementValue(item, "lastName");
                    } else {
                        user.name = user.userid;
                    }
                    if (person.basic) {
                        var basic = person.basic;
                        if (basic.unirole) {
                            user.extra = basic.unirole;
                        }
                        else if (basic.unicollege) {
                            user.extra = basic.unicollege;
                        }
                        else if (basic.unidepartment) {
                            user.extra = basic.unidepartment;
                        }
                    }
                    user.connected = false;
                    user.invited = item.invited !== undefined ? item.invited : false;
                    // Check if this user is a friend of us already.

                    if (getMyFriends().results) {
                        for (var ii = 0, jj = getMyFriends().results.length; ii<jj; ii++) {
                            var friend = getMyFriends().results[ii];
                            if (friend.target === user.userid) {
                                user.connected = true;
                                // if invited state set invited to true
                                if(friend.details["sakai:state"] === "INVITED"){
                                    user.invited = true;
                                }
                            }
                        }
                    }
                    // Check if the user you found in the list isn't the current
                    // logged in user
                    if (user.userid === sakai.data.me.user.userid) {
                        user.isMe = true;
                    }
                    // Check if the user that is found isn't an annonymous user
                    else if (user.userid === "anonymous"){
                        user.isAnonymous = true;
                    }


                    finaljson.items.push(user);
                }
            }
            finaljson.sakai = sakai;
            return finaljson;
        };


        /**
         * This will check in what subset the user wants to look.
         * It will return * for everything, mysites for the user his sites or the location of the specific site.
         */
        var getSearchWhereSites = function() {
            var searchFilter = $(searchConfig.filters.filter + " option:selected").val();
            var searchWhere = "*";
            if (searchFilter === "entire_community") {
                searchWhere = "*";
            }
            else if (searchFilter === "all_my_sites") {
                searchWhere = "mysites";
            }
            else {
                // Specific site add the location.
                searchWhere = searchFilter;
            }
            return searchWhere;
        };

        /**
         * Checks what element is selected for the users and returns the appropriate value.
         *  * = entire community (default)
         *  mycontacts = My contacts
         */
        var getSearchWhereUsers = function() {
            var searchFilter = $(searchConfig.filters.filter + ' option:selected"').val();
            var searchWhere = '*';
            if (searchFilter === 'entire_community') {
                searchWhere = '*';
            }
            else if (searchFilter === 'my_contacts') {
                searchWhere = 'mycontacts';
            }
            else {
                searchWhere = '*';
            }
            return searchWhere;
        };

        /**
         * Returns the tag value
         */
        var getSearchTags = function() {
            if ($.bbq.getState('tag')) {
                return $.bbq.getState('tag');
            }
            return null;
        };

        /**
         * Removes the seperated and the add contacts link
         * @param {Object} user The user object we get from the addcontact widget.
         */
        var removeAddContactLinks = function(user) {
             fetchMyFriends();
             $(searchConfig.addFriend.addToContacts.replace(/\{USERID\}/gi, user.uuid)).hide();
             $(searchConfig.addFriend.addToContactsDivider.replace(/\{USERID\}/gi, user.uuid)).hide();
        };

        /**
         * This function will replace all
         * @param {String} term The search term that needs to be converted.
         */
        var prepSearchTermForURL = function(term) {
            return sakai.api.Server.createSearchString(term);
        };

        /**
         * Adds the faceted panel to the page if a search is performed
         */
        var addFacetedPanel = function() {
            $(window).bind("ready.faceted.sakai", function(e){
                $(window).trigger("render.faceted.sakai", searchConfig.facetedConfig);

                var currentfacet = $.bbq.getState('facet');
                if (currentfacet) {
                    $("#" + currentfacet).addClass("faceted_category_selected");
                } else {
                    $(".faceted_category:first").addClass("faceted_category_selected");
                }

                // bind faceted search elements
                // loop through each faceted category and bind the link to trigger a search

                $(".faceted_category").bind("click", function(ev){
                    var facet = $(this).attr("id");
                    var searchquery = $(searchConfig.global.text).val();
                    var searchwhere = getSearchWhereSites();

                    // sometimes page search takes a long time and
                    // if another link is clicked in between load old link data instead of new link
                    // so need to check if new link is clicked kill the previous ajax request.
                    var killPreviousAjaxCall = false;
                    /*if (mainFacetedUrl !== searchConfig.facetedConfig.facets[facet].searchurl) {
                        killPreviousAjaxCall = true;
                    }*/

                    mainFacetedUrl = searchConfig.facetedConfig.facets[facet].searchurl;
                    sakai_global._search.doHSearch(1, searchquery, searchwhere, facet, killPreviousAjaxCall);
                });

            });
        };

        if(sakai.config.showSakai2) {
            $("#tab_search_sakai2").show();
        }
        return {
            'getMySites': getMySites,
            'getFacetedUrl': getFacetedUrl,
            'fetchMyFriends': fetchMyFriends,
            'getMyFriends': getMyFriends,
            'getSearchWhereUsers': getSearchWhereUsers,
            'addEventListeners': addEventListeners,
            'getSearchWhereSites': getSearchWhereSites,
            'getSearchTags': getSearchTags,
            'fillInElements': fillInElements,
            'removeAddContactLinks': removeAddContactLinks,
            'prepSearchTermForURL': prepSearchTermForURL,
            'preparePeopleForRender': preparePeopleForRender,
            'prepareCMforRendering': prepareCMforRendering,
            'addFacetedPanel': addFacetedPanel

        };
    };
});
