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

        sakai_global.data.search.prepareCMforRender = function(results) {
            for (var i = 0, j = results.length; i < j; i++) {
                if (results[i]['sakai:pooled-content-file-name']) {
                    // Set the item object in finaljson equal to the object in results
                    var contentItem = results[i];
                    contentItem.id = contentItem["_path"];
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
                }
            }
            return results;
        };
        
        sakai_global.data.search.prepareGroupsForRender = function(results) {
            for (var i = 0, j = results.length; i < j; i++){
                if (results[i]["sakai:group-id"]) {
                    var group = results[i];
                    group.id = group["sakai:group-id"];
                    if (group["sakai:group-title"]) {
                        group["sakai:group-title-short"] = sakai.api.Util.applyThreeDots(group["sakai:group-title"], 580, {max_rows: 1,whole_word: false}, "s3d-bold");
                    }
                    if (group["sakai:group-description"]) {
                        group["sakai:group-description-short"] = sakai.api.Util.applyThreeDots(group["sakai:group-description"], 580, {max_rows: 2,whole_word: false});//, "");
                        group["sakai:group-description-shorter"] = sakai.api.Util.applyThreeDots(group["sakai:group-description"], 150, {max_rows: 2,whole_word: false}); //, "");
                    }

                    var groupType = sakai.api.i18n.getValueForKey("OTHER");
                    if (group["sakai:category"]){
                        for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
                            if (sakai.config.worldTemplates[c].id === group["sakai:category"]){
                                groupType = sakai.api.i18n.getValueForKey(sakai.config.worldTemplates[c].titleSing);
                            }
                        }
                    }
                    // Modify the tags if there are any
                    if (group["sakai:tags"]) {
                        group["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(group["sakai:tags"]);
                    }
                    group.groupType = groupType;
                    group.lastModified = group.lastModified;
                    group.picPath = sakai.api.Groups.getProfilePicture(group);
                    group.userMember = false;
                    if (sakai.api.Groups.isCurrentUserAManager(group["sakai:group-id"], sakai.data.me) || sakai.api.Groups.isCurrentUserAMember(group["sakai:group-id"], sakai.data.me)){
                        group.userMember = true;
                    }
                    // use large default group icon on search page
                    if (group.picPath === sakai.config.URL.GROUP_DEFAULT_ICON_URL){
                        group.picPathLarge = sakai.config.URL.GROUP_DEFAULT_ICON_URL_LARGE;
                    }
                }
            }
            return results;
        };

        sakai_global.data.search.preparePeopleForRender = function(results) {
            for (var i = 0, j = results.length; i<j; i++) {
                var item = results[i];
                // The My Contacts feed comes back with everything wrapped inside of
                // a target object
                if (item.target){
                    item = item.profile;
                }
                if (item && item["rep:userId"] && item["rep:userId"] != "anonymous") {
                    item.id = item["rep:userId"];
                    item.userid = item["rep:userId"];
                    item.picture = sakai.api.User.getProfilePicture(item);
                    item.name = sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(item), 580, {max_rows: 1,whole_word: false}, "s3d-bold", true);
                    
                    // use large default user icon on search page
                    if (item.picture === sakai.config.URL.USER_DEFAULT_ICON_URL){
                        item.pictureLarge = sakai.config.URL.USER_DEFAULT_ICON_URL_LARGE;
                    }
                    if (item["sakai:tags"] && item["sakai:tags"].length > 0){
                        item["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(item["sakai:tags"]);
                    }
                    item.description = sakai.api.User.getProfileBasicElementValue(item, "description");
                    if (item.description) {
                        item.extra = sakai.api.Util.applyThreeDots(item.description, 580, { max_rows: 2, whole_word: false }, "");
                        user.extraGrid = sakai.api.Util.applyThreeDots(item.description, 200, {max_rows: 2,whole_word: false}, "");
                    }

                    item.connected = false;
                    item.accepted = false;
                    item.invited = item.invited !== undefined ? item.invited : false;
                    // Check if this user is a friend of us already.
                    var connectionState = false;
                    if (item["sakai:state"] || results[i]["details"]) {
                        connectionState = item["sakai:state"] || results[i]["details"]["sakai:state"];
                        item.connected = true;
                        // if invited state set invited to true
                        if(connectionState === "INVITED"){
                            item.invited = true;
                        } else if(connectionState === "PENDING"){
                            item.pending = true;
                        } else if(connectionState === "ACCEPTED"){
                            item.accepted = true;
                        } else if(connectionState === "NONE"){
                            //user.none = true;
                            item.connected = false;
                        }
                    } 

                    // Check if the user you found in the list isn't the current
                    // logged in user
                    if (item.userid === sakai.data.me.user.userid) {
                        item.isMe = true;
                    }
                    results[i] = item;
                }
            }
            return results;
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
