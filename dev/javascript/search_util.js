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

    $(window).bind("sakai.search.util.init", function(ev, config){

        /////////////////////
        // Get my contacts //
        /////////////////////

        var getMyContacts = function() {
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_ALL + "?&page=0&n=100",
                cache: false,
                success: function(data) {
                    sakai_global.data.search.contacts = $.extend(data, {}, true);
                    finishUtilInit();
                }
            });
        };

        ////////////////////////////////
        // Finish util initialisation //
        ////////////////////////////////

        var finishUtilInit = function(){
            $(window).trigger("sakai.search.util.finish");
        }

        ///////////////////////////
        // Prepare for rendering //
        ///////////////////////////

        sakai_global.data.search.prepareCMforRendering = function(results, finaljson, searchterm) {
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
                }
            }
            finaljson.sakai = sakai;
            return finaljson;
        };

        sakai_global.data.search.preparePeopleForRender = function(results, finaljson) {
            for (var i = 0, j = results.length; i<j; i++) {
                var item = results[i];
                if (item && item["rep:userId"] != "anonymous") {
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
                    } else {
                        user.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                    }
                    user.name = sakai.api.User.getDisplayName(item);
                    user.name = sakai.api.Util.applyThreeDots(user.name, 180, {max_rows: 1,whole_word: false}, "s3d-bold");
                    user.firstName = sakai.api.User.getProfileBasicElementValue(item, "firstName");
                    user.lastName = sakai.api.User.getProfileBasicElementValue(item, "lastName");

                    user.connected = false;
                    user.invited = item.invited !== undefined ? item.invited : false;
                    // Check if this user is a friend of us already.

                    if (sakai_global.data.search.contacts.results) {
                        for (var ii = 0, jj = sakai_global.data.search.contacts.results.length; ii<jj; ii++) {
                            var friend = sakai_global.data.search.contacts.results[ii];
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

                    finaljson.items.push(user);

                }
            }
            finaljson.sakai = sakai;
            return finaljson;
        };

        //////////////////////
        // Query parameters //
        //////////////////////

        sakai_global.data.search.getQueryParams = function(){
            var params = {
                "page": $.bbq.getState('page') || 0,
                "q": $.bbq.getState('q') || "*",
                "facet": $.bbq.getState('facet')
            }
            return params;
        }

        ////////////
        // EVENTS //
        ////////////

        /*
        $(searchConfig.global.addToContactsLink).live("click", function(ev) {
            contactclicked = (this.id.substring(searchConfig.global.addToContactsFiller.length));
            $(window).trigger("initialize.addToContacts.sakai", { user: contactclicked, callback: mainSearch.removeAddContactLinks });
        }); */

        /////////////////////////
        // Util initialisation //
        /////////////////////////

        getMyContacts();

    });

});
