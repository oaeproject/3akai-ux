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
    var refineTags = [];
    var activeTags = [];
    var maxTagsDisplayed = 10;

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
        $(".search_view_" + view).addClass("selected");
        $(".search_view_" + view).children("div").addClass("selected");

        ////////////////////////////////
        // Finish util initialisation //
        ////////////////////////////////

        var finishUtilInit = function(){
            $(window).trigger("sakai.search.util.finish", [config]);
        };

        ///////////////////////////
        // Prepare for rendering //
        ///////////////////////////

        sakai_global.data.search.prepareCMforRender = function(results, callback) {
            sakai.api.Content.prepareContentForRender(results, sakai.data.me, callback);
        };

        sakai_global.data.search.prepareGroupsForRender = function(results) {
            return sakai.api.Groups.prepareGroupsForRender(results, sakai.data.me);
        };

        sakai_global.data.search.preparePeopleForRender = function(results) {
            return sakai.api.User.preparePeopleForRender(results, sakai.data.me);
        };

        /**
         * Renders the tag lists
         */
        renderRefineTags = function() {
            sakai.api.Util.TemplateRenderer($("#search_tags_active_template"), {"tags": activeTags, "sakai": sakai}, $("#search_tags_active_container"));
            sakai.api.Util.TemplateRenderer($("#search_tags_refine_template"), {"tags": refineTags, "sakai": sakai}, $(".search_tags_refine_container"));
        };

        /**
         * Generates the tag list to refine the search by
         * @param {Object} data Search result containing the tags available
         * @param {Object} params Parameters used in the search
         */
        sakai_global.data.search.generateTagsRefineBy = function(data, params) {
            $("#search_tags_active_container").empty();
            activeTags = [];
            refineTags = [];
            var tagArray = [];

            // get any tags already in location hash
            if (params && params.refine){
                activeTags = params.refine.split(',');
            }

            // filter tags
            if (data.facet_fields && data.facet_fields[0] && data.facet_fields[0].tagname && data.facet_fields[0].tagname.length > 0) {
                var tempTagArray = data.facet_fields[0].tagname;
                // put the tags from the tag cloud service into an array
                $.each(tempTagArray, function(key, tagOjb) {
                    $.each(tagOjb, function(tag, count) {
                        if (count > 0) {
                            tagArray.push(tag);
                        }
                    });
                });
                tagArray = sakai.api.Util.formatTagsExcludeLocation(tagArray);
                // store tags in either already active tags, or tags available to refine the search by
                $.each(tagArray, function(key, tag) {
                    if ($.inArray(tag, activeTags) === -1) {
                        refineTags.push(tag);
                    }
                });
                activeTags.sort();
                // limit the number of tags to display in refine list
                refineTags = refineTags.slice(0, maxTagsDisplayed).sort();
            }

            renderRefineTags();
        };

        //////////////////////
        // Query parameters //
        //////////////////////

        sakai_global.data.search.getQueryParams = function($rootel){
            var params = {
                "page": parseInt($.bbq.getState('page'), 10) || 1,
                "cat": $.bbq.getState('cat'),
                "q": $.bbq.getState('q') || "*",
                "facet": $.bbq.getState('facet'),
                "sortby": $.bbq.getState('sortby'),
                "sorton": $.bbq.getState('sorton'),
                "refine": $.bbq.getState('refine')
            };
            // get the sort by and sort on
            if (!params["sortby"] || !params["sorton"]){
                var val = $(".s3d-search-sort option:selected", $rootel).val().split(",");
                params["sortby"] = val[0];
                params["sorton"] = val[1];
            }
            return params;
        };

        sakai_global.data.search.processSearchString = function(params){
            var searchString = params.q;
            var catString = params.cat;
            if (params.refine){
                if (catString) {
                    catString = catString + " " + params.refine.replace(/,/g, " ");
                } else if (searchString === "*"){
                    searchString = params.refine.replace(/,/g, " ");
                } else {
                    searchString = searchString + " " + params.refine.replace(/,/g, " ");
                }
            }
            return sakai.api.Server.createSearchString(catString || searchString);
        };

        ////////////
        // Events //
        ////////////

        $(".search_tag_refine_item").die("click").live("click", function(ev){
            var tag = $(this).attr("data-sakai-entityid");
            activeTags.push(tag);
            $.bbq.pushState({
                "refine": activeTags.toString()
            }, 0);
        });

        $(".search_tag_active_item").die("click").live("click", function(ev){
            var tag = $(this).attr("data-sakai-entityid");
            activeTags = $.grep(activeTags, function(value) {
                return value !== tag;
            });
            $.bbq.pushState({
                "refine": activeTags.toString()
            }, 0);
        });

        $(".link_accept_invitation").die("click").live("click", function(ev){
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
        $(".s3d-search-sort select").die("change").live("change", function(ev) {
            var val = $(this).find(":selected").val().split(",");
            var sortby = val[0];
            var sorton = val[1];
            $.bbq.pushState({
                "page": 1,
                "sortby": sortby,
                "sorton": sorton
            }, 0);
        });

        // bind search view change
        $(".search_view_list, .search_view_grid").die("click").live("click", function(ev){
            if ($(".s3d-search-results-container").hasClass("s3d-search-results-grid")){
                view = "list";
                $(".s3d-search-results-container").removeClass("s3d-search-results-grid");
            } else {
                view = "grid";
                $(".s3d-search-results-container").addClass("s3d-search-results-grid");
            }
            $(".s3d-search-listview-options").find("div").removeClass("selected");
            $(".search_view_" + view).addClass("selected");
            $(".search_view_" + view).children("div").addClass("selected");
        });

        $('.searchgroups_result_plus').die("click");
        $('.searchgroups_result_plus').live("click", function(ev) {
            var joinable = $(this).data("group-joinable");
            var groupid = $(this).data("groupid");
            var itemdiv = $(this);
            sakai.api.Groups.addJoinRequest(sakai.data.me, groupid, false, true, function (success) {
                if (success) {
                    if (joinable === "withauth") {
                        // Don't add green tick yet because they need to be approved.
                        var notimsg = sakai.api.i18n.getValueForKey("YOUR_REQUEST_HAS_BEEN_SENT");
                    } else  { // Everything else should be regular success
                        $(".searchgroups_memberimage_"+groupid).show();
                        var notimsg = sakai.api.i18n.getValueForKey("SUCCESSFULLY_ADDED_TO_GROUP");
                    }
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("GROUP_MEMBERSHIP"),
                        notimsg, sakai.api.Util.notification.type.INFORMATION);
                    itemdiv.removeClass("s3d-action-icon s3d-actions-addtolibrary searchgroups_result_plus");
                } else {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("GROUP_MEMBERSHIP"),
                        sakai.api.i18n.getValueForKey("PROBLEM_ADDING_TO_GROUP"),
                        sakai.api.Util.notification.type.ERROR);
                }
            });
        });

        /////////////////////////
        // Util initialisation //
        /////////////////////////

        finishUtilInit();

    });

});
