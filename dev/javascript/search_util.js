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

    var view = "list";

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

        /////////////////////
        // Set search view //
        /////////////////////

        if (config && config.tuid && view === "grid"
            && $(".s3d-search-results-container").length){
            $(".s3d-search-results-container").addClass("s3d-search-results-grid");
        }


        ////////////////////////////////
        // Finish util initialisation //
        ////////////////////////////////

        var finishUtilInit = function(){
            $(window).trigger("sakai.search.util.finish", [config]);
        };

        ///////////////////////////
        // Prepare for rendering //
        ///////////////////////////

        sakai_global.data.search.prepareCMforRender = function(results, finaljson) {
            for (var i = 0, j = results.length; i < j; i++) {
                if (results[i]['sakai:pooled-content-file-name']) {
                    // Set the item object in finaljson equal to the object in results
                    var contentItem = results[i];

                    // Only modify the description if there is one
                    if (contentItem["sakai:description"]) {
                        contentItem["sakai:description-shorter"] = sakai.api.Util.applyThreeDots(contentItem["sakai:description"], 150, {
                            max_rows: 2,
                            whole_word: false
                        }, "");
                        contentItem["sakai:description"] = sakai.api.Util.applyThreeDots(contentItem["sakai:description"], 580, {
                            max_rows: 2,
                            whole_word: false
                        }, "");
                    }
                    if (contentItem["sakai:pooled-content-file-name"]) {
                        contentItem["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(contentItem["sakai:pooled-content-file-name"], 600, {
                            max_rows: 1,
                            whole_word: false
                        }, "s3d-bold");
                    }
                    // Modify the tags if there are any
                    if (contentItem["sakai:tags"]) {
                        if (typeof(contentItem["sakai:tags"]) === 'string') {
                            contentItem["sakai:tags"] = contentItem["sakai:tags"].split(",");
                        }
                        contentItem["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(contentItem["sakai:tags"]);
                    }
                    // set mimetype
                    var mimeType = sakai.api.Content.getMimeType(contentItem);
                    contentItem.mimeType = mimeType;
                    contentItem.mimeTypeDescription = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes["other"].description);
                    if (sakai.config.MimeTypes[mimeType]){
                        contentItem.mimeTypeDescription = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes[mimeType].description);
                    }
                    contentItem.thumbnail = sakai.api.Content.getThumbnail(results[i]);
                    finaljson.items.push(contentItem);
                }
            }
            finaljson.sakai = sakai;
            return finaljson;
        };
        
        sakai_global.data.search.prepareGroupsForRender = function(results, finaljson){
            for (var group in results){
                if (results.hasOwnProperty(group) && results[group]["sakai:group-id"]) {
                    if (results[group]["sakai:group-title"]) {
                        results[group]["sakai:group-title-short"] = sakai.api.Util.applyThreeDots(results[group]["sakai:group-title"], 580, {max_rows: 1,whole_word: false}, "s3d-bold");
                    }
                    if (results[group]["sakai:group-description"]) {
                        results[group]["sakai:group-description-short"] = sakai.api.Util.applyThreeDots(results[group]["sakai:group-description"], 580, {max_rows: 2,whole_word: false}, "");
                        results[group]["sakai:group-description-shorter"] = sakai.api.Util.applyThreeDots(results[group]["sakai:group-description"], 150, {max_rows: 2,whole_word: false}, "");
                    }

                    var groupType = sakai.api.i18n.getValueForKey("OTHER");
                    if (results[group]["sakai:category"]){
                        for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
                            if (sakai.config.worldTemplates[c].id === results[group]["sakai:category"]){
                                groupType = sakai.api.i18n.getValueForKey(sakai.config.worldTemplates[c].titleSing);
                            }
                        }
                    }
                    // Modify the tags if there are any
                    if (results[group]["sakai:tags"]) {
                        results[group]["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(results[group]["sakai:tags"]);
                    }
                    results[group].groupType = groupType;
                    results[group].lastModified = results[group].lastModified;
                    results[group].picPath = sakai.api.Groups.getProfilePicture(results[group]);
                    results[group].userMember = false;
                    if (sakai.api.Groups.isCurrentUserAManager(results[group]["sakai:group-id"], sakai.data.me) || sakai.api.Groups.isCurrentUserAMember(results[group]["sakai:group-id"], sakai.data.me)){
                        results[group].userMember = true;
                    }
                    // use large default group icon on search page
                    if (results[group].picPath === sakai.config.URL.GROUP_DEFAULT_ICON_URL){
                        results[group].picPathLarge = sakai.config.URL.GROUP_DEFAULT_ICON_URL_LARGE;
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
                var details = false;
                if (item.target){
                    item = results[i].profile;
                    details = results[i].details;
                }
                if (item && item["rep:userId"] && item["rep:userId"] != "anonymous") {
                    var user = {};
                    user.userid = item["rep:userId"];
                    // Parse the user his info.
                    user.path = item.homePath + "/public/";
                    var person = item;
                    user.picture = sakai.api.User.getProfilePicture(person);
                    user.counts = item.counts;
                    user.name = sakai.api.User.getDisplayName(item);
                    user.name = sakai.api.Util.applyThreeDots(user.name, 580, {max_rows: 1,whole_word: false}, "s3d-bold", true);
                    user.firstName = sakai.api.User.getProfileBasicElementValue(item, "firstName");
                    user.lastName = sakai.api.User.getProfileBasicElementValue(item, "lastName");

                    // use large default user icon on search page
                    if (user.picture === sakai.config.URL.USER_DEFAULT_ICON_URL){
                        user.pictureLarge = sakai.config.URL.USER_DEFAULT_ICON_URL_LARGE;
                    }
                    if (item["sakai:tags"] && item["sakai:tags"].length > 0){
                        user["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(item["sakai:tags"]);
                    }
                    if (item.basic && item.basic.elements && item.basic.elements.description){
                        user.extra = sakai.api.Util.applyThreeDots(item.basic.elements.description.value, 580, {max_rows: 2,whole_word: false}, "");
                        user.extraGrid = sakai.api.Util.applyThreeDots(item.basic.elements.description.value, 200, {max_rows: 2,whole_word: false}, "");
                    }

                    user.connected = false;
                    user.accepted = false;
                    user.invited = item.invited !== undefined ? item.invited : false;
                    // Check if this user is a friend of us already.
                    var connectionState = false;
                    if (item["sakai:state"]) {
                        connectionState = item["sakai:state"];
                    } else if (details && details["sakai:state"]) {
                        connectionState = details["sakai:state"];
                    } else if (sakai_global.data.search.contacts && sakai_global.data.search.contacts.results) {
                        for (var ii = 0, jj = sakai_global.data.search.contacts.results.length; ii<jj; ii++) {
                            var friend = sakai_global.data.search.contacts.results[ii];
                            if (friend.target === user.userid) {
                                connectionState = friend.details["sakai:state"];
                            }
                        }
                    }
                    if (connectionState) {
                        user.connected = true;
                        // if invited state set invited to true
                        if(connectionState === "INVITED"){
                            user.invited = true;
                        } else if(connectionState === "PENDING"){
                            user.pending = true;
                        } else if(connectionState === "ACCEPTED"){
                            user.accepted = true;
                        } else if(connectionState === "NONE"){
                            user.none = true;
                            user.connected = false;
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
                "cat": $.bbq.getState('cat'),
                "q": $.bbq.getState('q') || "*",
                "facet": $.bbq.getState('facet'),
                "sortby": $.bbq.getState('sortby')
            };
            return params;
        };

        ////////////
        // Events //
        ////////////

        $(".link_accept_invitation").live("click", function(ev){
            var userid = $(this).attr("sakai-entityid");
            $.ajax({
                url: "/~" + sakai.api.Util.safeURL(sakai.data.me.user.userid) + "/contacts.accept.html",
                type: "POST",
                data : {"targetUserId": userid},
                success: function(data) {
                    sakai_global.data.search.getMyContacts();
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("AN_ERROR_HAS_OCCURRED"),"",sakai.api.Util.notification.type.ERROR);
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

        // bind search view type
        $("#search_view_list").live("click", function(ev){
            if ($(".s3d-search-results-container").hasClass("s3d-search-results-grid")){
                view = "list";
                $(".s3d-search-results-container").removeClass("s3d-search-results-grid");
            }
        });

        $("#search_view_grid").live("click", function(ev){
            if (!$(".s3d-search-results-container").hasClass("s3d-search-results-grid")){
                view = "grid";
                $(".s3d-search-results-container").addClass("s3d-search-results-grid");
            }
        });

        /////////////////////////
        // Util initialisation //
        /////////////////////////

        finishUtilInit();

    });

});
