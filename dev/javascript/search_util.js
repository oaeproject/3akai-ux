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
        };

        ///////////////////////////
        // Prepare for rendering //
        ///////////////////////////

        sakai_global.data.search.prepareCMforRender = function(results, finaljson) {
            for (var i = 0, j = results.length; i < j; i++) {
                if (results[i]['sakai:pooled-content-file-name']) {
                    // Set the item object in finaljson equal to the object in results
                    finaljson.items[i] = results[i];

                    // Only modify the description if there is one
                    if (finaljson.items[i]["sakai:description"]) {
                        finaljson.items[i]["sakai:description"] = sakai.api.Util.applyThreeDots(finaljson.items[i]["sakai:description"], 580, {
                            max_rows: 2,
                            whole_word: false
                        }, "search_result_course_site_excerpt");
                    }
                    if (finaljson.items[i]["sakai:pooled-content-file-name"]) {
                        finaljson.items[i]["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(finaljson.items[i]["sakai:pooled-content-file-name"], 600, {
                            max_rows: 1,
                            whole_word: false
                        }, "s3d-bold");
                    }
                    // Modify the tags if there are any
                    if (finaljson.items[i]["sakai:tags"]) {
                        if (typeof(finaljson.items[i]["sakai:tags"]) === 'string') {
                            finaljson.items[i]["sakai:tags"] = finaljson.items[i]["sakai:tags"].split(",");
                        }
                    }
                }
            }
            finaljson.sakai = sakai;
            return finaljson;
        };
        
        sakai_global.data.search.prepareGroupsForRender = function(results, finaljson){
            for (var group in results){
                if (results.hasOwnProperty(group) && results[group]["sakai:group-id"]) {
                    if (results[group]["sakai:group-title"]) {
                        results[group]["sakai:group-title-short"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(results[group]["sakai:group-title"]), 580, {max_rows: 1,whole_word: false}, "s3d-bold");
                    }
                    if (results[group]["sakai:group-description"]) {
                        results[group]["sakai:group-description-short"] = sakai.api.Util.applyThreeDots(sakai.api.Security.escapeHTML(results[group]["sakai:group-description"]), 580, {max_rows: 2,whole_word: false}, "");
                    }

                    var groupType = sakai.api.i18n.General.getValueForKey("OTHER");
                    if (results[group]["sakai:category"]){
                        for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
                            if (sakai.config.worldTemplates[c].id === results[group]["sakai:category"]){
                                groupType = sakai.api.i18n.General.getValueForKey(sakai.config.worldTemplates[c].titleSing);
                            }
                        }
                    }
                    results[group].groupType = groupType;
                    results[group].lastModified = results[group].lastModified;
                    results[group].picPath = sakai.api.Groups.getProfilePicture(results[group]);
                    results[group].userMember = false;
                    if (sakai.api.Groups.isCurrentUserAManager(results[group]["sakai:group-id"], sakai.data.me) || sakai.api.Groups.isCurrentUserAMember(results[group]["sakai:group-id"], sakai.data.me)){
                        results[group].userMember = true;
                    }

                    finaljson.items.push(results[group]);
                }
            }

            finaljson.sakai = sakai;
            return finaljson;
        };

        sakai_global.data.search.preparePeopleForRender = function(results, finaljson) {
            for (var i = 0, j = results.length; i<j; i++) {
                var item = results[i];
                if (item.target){
                    item = results[i].profile;
                }
                if (item && item["rep:userId"] && item["rep:userId"] != "anonymous") {
                    var user = {};
                    user.userid = item["rep:userId"];
                    // Parse the user his info.
                    user.path = item.homePath + "/public/";
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
                    user.counts = item.counts;
                    user.name = sakai.api.User.getDisplayName(item);
                    user.name = sakai.api.Util.applyThreeDots(user.name, 180, {max_rows: 1,whole_word: false}, "s3d-bold");
                    user.firstName = sakai.api.User.getProfileBasicElementValue(item, "firstName");
                    user.lastName = sakai.api.User.getProfileBasicElementValue(item, "lastName");

                    if (item["sakai:tags"] && item["sakai:tags"].length > 0){
                        user["sakai:tags"] = item["sakai:tags"];
                    }
                    if (item.basic && item.basic.elements && item.basic.elements.description){
                        user.extra = sakai.api.Util.applyThreeDots(item.basic.elements.description.value, 580, {max_rows: 2,whole_word: false}, "");
                    }

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
                                } else if(friend.details["sakai:state"] === "PENDING"){
                                    user.pending = true;
                                } else if(friend.details["sakai:state"] === "NONE"){
                                    user.none = true;
                                }
                            }
                        }
                    }
                    // Check if the user you found in the list isn't the current
                    // logged in user
                    if (user.userid === sakai.data.me.user.userid) {
                        user.isMe = true;
                    }

                    if (user["sakai:tags"]) {
                        var filteredTags = [];
                        for (var t = 0; t < user["sakai:tags"].length; t++) {
                            if (user["sakai:tags"][t].split("/")[0] !== "directory") {
                                filteredTags.push(user["sakai:tags"][t]);
                            }
                        }
                        user["sakai:tags"] = filteredTags;
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
                "facet": $.bbq.getState('facet'),
                "sortby": $.bbq.getState('sortby')
            }
            return params;
        }

        ////////////
        // Events //
        ////////////
        
        $(".link_accept_invitation").live("click", function(ev){
            var userid = $(this).attr("sakai-entityid");
            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/contacts.accept.html",
                type: "POST",
                data : {"targetUserId": userid},
                success: function(data) {
                    sakai_global.data.search.getMyContacts();;
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("AN_ERROR_HAS_OCCURRED"),"",sakai.api.Util.notification.type.ERROR);
                }
            });
            $('.link_accept_invitation').each(function(index) {
                if ($(this).attr("sakai-entityid") === userid){
                    $(this).hide();
                    $("#search_result_contact_" + userid).show();
                }
            });
        });

        // bind sortby select box
        $("#search_select_sortby").live("change", function(ev) {
            var sortby = $(this).find(":selected").val();
            $.bbq.pushState({
                "page": 1,
                "sortby": sortby
            }, 0);
        });

        /////////////////////////
        // Util initialisation //
        /////////////////////////

        sakai_global.data.search.getMyContacts(finishUtilInit);

    });

});
