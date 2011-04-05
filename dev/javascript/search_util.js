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

        sakai_global.data.search.getMyContacts = function(callback) {
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_ALL + "?&page=0&n=100",
                cache: false,
                success: function(data) {
                    sakai_global.data.search.contacts = $.extend(data, {}, true);
                    if (callback) {
                        callback();
                    }
                }
            });
        };

        ////////////////////////////////
        // Finish util initialisation //
        ////////////////////////////////

        var finishUtilInit = function(){
            $(window).trigger("sakai.search.util.finish");
        }

        ////////////////////
        // Faceted Search //
        ////////////////////
        
        /**
         * Adds the faceted panel to the page if a search is performed
         */
        sakai_global.data.search.addFacetedPanel = function(searchConfig) {
            
            //alert("Here");
            
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
                    $.bbq.pushState({
                        "page": 1,
                        "facet": facet
                    }, 0);
                    //alert("Facet changed");
                    //var searchquery = $(searchConfig.global.text).val();
                    //var searchwhere = getSearchWhereSites();

                    // sometimes page search takes a long time and
                    // if another link is clicked in between load old link data instead of new link
                    // so need to check if new link is clicked kill the previous ajax request.
                    //var killPreviousAjaxCall = false;
                    /*if (mainFacetedUrl !== searchConfig.facetedConfig.facets[facet].searchurl) {
                        killPreviousAjaxCall = true;
                    }*/

                    //mainFacetedUrl = searchConfig.facetedConfig.facets[facet].searchurl;
                    //sakai_global._search.doHSearch(1, searchquery, searchwhere, facet, killPreviousAjaxCall);
                });

            });

        };

        ///////////////////////////
        // Prepare for rendering //
        ///////////////////////////

        sakai_global.data.search.prepareCMforRender = function(results, finaljson) {
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
        
        sakai_global.data.search.prepareGroupsForRender = function(results, finaljson){
            for (var group in results){
                if (results.hasOwnProperty(group)) {
                    if (results[group]["sakai:group-title"]) {
                        results[group]["sakai:group-title"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(results[group]["sakai:group-title"]), $(".searchall_results .searchall_results_container").width() - 80, {max_rows: 1,whole_word: false}, "s3d-bold");
                    }
                    if (results[group]["sakai:group-description"]) {
                        results[group]["sakai:group-description"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(results[group]["sakai:group-description"]), $(".searchall_results .searchall_results_container").width() - 80, {max_rows: 1,whole_word: false}, "searchall_result_course_site_excerpt");
                    }
                    finaljson.items.push(results[group]);
                }
            }

            // If result is page content set up page path
            for (var i=0, j=finaljson.items.length; i<j; i++ ) {
                var full_path = finaljson.items[i]["path"];
                var site_path = finaljson.items[i]["sakai:group-id"];
                var page_path = site_path;
                finaljson.items[i]["pagepath"] = page_path;
                finaljson.items[i]["dottedpagepath"] = sakai.api.Util.applyThreeDots(page_path, $(".searchall_results .searchall_results_container").width() - 80, {max_rows: 1,whole_word: false},"searchall_result_course_site_excerpt");

                if (finaljson.items[i].picture && typeof finaljson.items[i].picture === "string") {
                    finaljson.items[i].picture = $.parseJSON(finaljson.items[i].picture);
                    finaljson.items[i].picture.picPath = "/~"+finaljson.items[i]["sakai:group-id"]+"/public/profile/"+finaljson.items[i].picture.name;
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
                "page": parseInt($.bbq.getState('page'), 10) || 1,
                "q": $.bbq.getState('q') || "*",
                "facet": $.bbq.getState('facet')
            }
            return params;
        }

        /////////////////////////
        // Util initialisation //
        /////////////////////////

        sakai_global.data.search.getMyContacts(finishUtilInit);

    });

});
