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

/*global $, Config, sdata, History, opensocial */

/*
 * This file will contain all the functionality that the 4 search files have in common.
 * ex: fetching my sites
 */
var sakai = sakai || {};
sakai._search = function(config, callback) {

    var searchConfig = config;
    var hasHadFocus = false;
    var searchSubset = false;
    var myfriends = {};
    var nrOfCharactersAroundTerm = 300;
    var usernameLengthStrip = 40;


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
        $(config.filters.sites.filterSites).html($.TemplateRenderer(config.filters.sites.filterSitesTemplate, data));

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
            url: "/var/contacts/all.json?page=0&n=100",
            cache: false,
            success: function(data) {
                myfriends = $.evalJSON(data);
                // Change the history
                History.history_change();
            }
        });
    };

    /**
     * Getter for the myFriends var
     */
    var getMyFriends = function() {
        return myfriends;
    };

    /**
     * Will add all the event listeners
     */
    var addEventListeners = function(searchterm, searchwhere) {
        /** The top tabs */
        $(searchConfig.tabs.all + ", " + searchConfig.tabs.people + ", " + searchConfig.tabs.sites + ", " + searchConfig.tabs.content).live("click", function(ev) {
            var url = $(this).attr("href").split('#')[0] + "#1";

            if (searchterm) {
                url += "|" + encodeURIComponent(searchterm);
                if (searchwhere) {
                    url += "|" + searchwhere;
                }
            }
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
            if (searchwhere === '*') {
                $(searchConfig.filters.sites.ids.entireCommunity).attr("selected", "selected");
            }
            else if (searchwhere === 'mysites') {
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
        for (var i = 0, j = results.length; i<j; i++) {

            // Set the item object in finaljson equal to the object in results
            finaljson.items[i] = results[i];

            // Only modify the description if there is one
            if (finaljson.items[i]["sakai:description"]) {

                // Strip HTML from the description
                var content = finaljson.items[i]["excerpt"].replace(/<\/?[^>]+(>|$)/g, " ");

                // Check if the search term occures in the description of the file
                finaljson.items[i]["excerpt"] = convertTermToBold(finaljson.items[i]["sakai:description"], searchterm);
            }
            // Modify the tags if there are any
            if(finaljson.items[i]["sakai:tags"]){

                for(var k = 0, l = finaljson.items[i]["sakai:tags"].length; k < l; k++){

                    // If the searchterm occures in the tags, make it bold
                    finaljson.items[i]["sakai:tags"][k] = convertTermToBold(finaljson.items[i]["sakai:tags"][k], searchterm);
                }
            }
        }
        return finaljson;
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
                user.path = "/_user/public/" + user.userid + "/";
                var person = item;
                if (person.picture) {
                    var picture = $.evalJSON(person.picture);
                    if (picture.name) {
                        user.picture = user.path + picture.name;
                    } else {
                        user.picture = sakai.config.URL.PERSON_ICON_URL;
                    }
                } else {
                    user.picture = sakai.config.URL.PERSON_ICON_URL;
                }
                if (person.firstName && person.lastName) {
                    user.name = person.firstName + " " + person.lastName;
                    if (user.name.length > usernameLengthStrip) {
                        user.name = user.name.substring(0, usernameLengthStrip) + "...";
                    }
                    user.firstName = person.firstName;
                    user.lastName = person.lastName;
                }
                else {
                    user.name = user.userid;
                }
                if (person.basic) {
                    var basic = $.evalJSON(person.basic);
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
                // Check if this user is a friend of us already.

                if (getMyFriends().results) {
                    for (var ii = 0, jj = getMyFriends().results.length; ii<jj; ii++) {
                        var friend = getMyFriends().results[ii];
                        if (friend.target === user.userid) {
                            user.connected = true;
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
        return finaljson;
    };


    /**
     * This will check in what subset the user wants to look.
     * It will return * for everything, mysites for the user his sites or the location of the specific site.
     */
    var getSearchWhereSites = function() {
        var searchFilter = $(searchConfig.filters.filter + ' option:selected').val();
        var searchWhere = '*';
        if (searchFilter === 'entire_community') {
            searchWhere = '*';
        }
        else if (searchFilter === 'all_my_sites') {
            searchWhere = 'mysites';
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
     * Checks if the user is logged in.
     * If he is not he will be redirected to /dev/index.html
     * If he is this function will return true.
     */
    var isLoggedIn = function() {
        var uuid = sakai.data.me.user.userid;
        if (!uuid || uuid === "anon") {
            document.location = "/dev/index.html";
        }
        else {
            return true;
        }
    };

    /**
     * Does the invitation stuff. Will send a request for an invitation and a message to the user.
     * @param {String} userid
     */
    var doInvite = function(userid) {
        var toSend = $.FormBinder.serialize($(searchConfig.addFriend.form));
        $(searchConfig.addFriend.response).text("");
        if (toSend[searchConfig.addFriend.typesList]) {

            var type = toSend[searchConfig.addFriend.typesList];
            var comment = toSend[searchConfig.addFriend.personalNote.replace(/#/gi, '')];

            // send message to other person
            var userstring = sakai.data.me.profile.firstName + " " + sakai.data.me.profile.lastName;

            var title = sakai.config.Connections.Invitation.title.replace(/[$][{][u][s][e][r][}]/g, userstring);
            var message = sakai.config.Connections.Invitation.body.replace(/[$][{][u][s][e][r][}]/g, userstring).replace(/[$][{][c][o][m][m][e][n][t][}]/g, comment);

            var data = {
                "friendUuid": userid,
                "friendType": type,
                "message": $.toJSON({
                    "title": title,
                    "body": message
                })
            };

            $.ajax({
                url: sakai.config.URL.FRIEND_CONNECT_SERVICE,
                type: "POST",
                success: function(data) {
                    // The request succeeded,
                    // do a request to the messaging service as well.
                    var toSend = {
                        "to": userid,
                        "message": $.toJSON(message),
                        "_charset_":"utf-8"
                    };
                    $.ajax({
                        url: sakai.config.URL.MESSAGES_SEND_SERVICE,
                        type: "POST",
                        success: function(data) {
                            var json = $.evalJSON(data);
                            if (json.response === "OK") {
                                // Everything went OK, hide the "Add to contacts" link.
                                $(searchConfig.addFriend.addToContacts.replace(/\{USERID\}/gi, userid)).hide();
                                $(searchConfig.addFriend.addToContactsDivider.replace(/\{USERID\}/gi, userid)).hide();

                                // Hide the layover
                                $(searchConfig.global.addToContactsDialog).jqmHide();
                            }
                            else {
                                $(searchConfig.addFriend.response).text($(searchConfig.addFriend.errors.message).text());
                            }
                        },
                        error: function(xhr, textStatus, thrownError) {
                            $(searchConfig.addFriend.response).text($(searchConfig.addFriend.errors.message).text());
                        },
                        data: toSend
                    });

                },
                error: function(xhr, textStatus, thrownError) {
                    $(searchConfig.addFriend.response).text($(searchConfig.addFriend.errors.request).text());
                },
                data: data
            });
        }
        else {
            $(searchConfig.addFriend.response).text($(searchConfig.addFriend.errors.noTypeSelected).text());
        }
    };


    /**
     * Removes the seperated and the add contacts link
     * @param {Object} user The user object we get from the addcontact widget.
     */
    var removeAddContactLinks = function(user) {
         $(searchConfig.addFriend.addToContacts.replace(/\{USERID\}/gi, user.uuid)).hide();
         $(searchConfig.addFriend.addToContactsDivider.replace(/\{USERID\}/gi, user.uuid)).hide();
    };

    /**
     * This function will replace all
     * @param {String} term The search term that needs to be converted.
     */
    var prepSearchTermForURL = function(term) {
        var urlterm = "";
        var splitted = term.split(" ");
        if (splitted.length > 1) {
            //urlterm += splitted[0] + "~"
            for (var i = 0; i < splitted.length; i++) {
                urlterm += splitted[i] + "* ";
            }
        }
        else {
            urlterm = term + "*";
        }
        return urlterm;
    };

    return {
        'getMySites': getMySites,
        'fetchMyFriends': fetchMyFriends,
        'getMyFriends': getMyFriends,
        'getSearchWhereUsers': getSearchWhereUsers,
        'addEventListeners': addEventListeners,
        'getSearchWhereSites': getSearchWhereSites,
        'fillInElements': fillInElements,
        'isLoggedIn': isLoggedIn,
        'removeAddContactLinks': removeAddContactLinks,
        'prepSearchTermForURL': prepSearchTermForURL,
        'preparePeopleForRender': preparePeopleForRender,
        'prepareCMforRendering': prepareCMforRendering

    };
};
