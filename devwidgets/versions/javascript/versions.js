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
// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.versions
     *
     * @class versions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.versions = function(tuid, showSettings){


        ///////////////
        // VARIABLES //
        ///////////////

        var $rootel = $("#" + tuid);

        // Vars
        var contentPath = "";
        var currentPageShown = "";
        var versions = [];

        // Containers
        var versionsContainer = "#versions_container";

        // Templates
        var versionsTemplate = "versions_template";

        // Elements
        var versionsVersionItem = ".versions_version_item";
        var versionsRestoreVersion = ".versions_restore_version";


        var carouselBinding = function(carousel){
            $("#versions_newer", $rootel).live("click",function(){
                carousel.prev();
            });

            $("#versions_older", $rootel).live("click",function(){
                if (carousel.last !== carousel.size()){
                    carousel.next();
                }
            });

            $("#versions_oldest", $rootel).live("click",function(){
                carousel.scroll(carousel.size() || 0);
            });

            $("#versions_newest", $rootel).live("click",function(){
                carousel.scroll(0);
            });
        };


        ///////////////
        // RENDERING //
        ///////////////

        var renderVersions = function(){
            $(versionsContainer, $rootel).html(sakai.api.Util.TemplateRenderer(versionsTemplate, {
                "data": versions,
                "sakai": sakai,
                "currentPage": currentPageShown
            }));
            $("#versions_carousel_container", $rootel).jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 4,
                start: 0,
                initCallback: carouselBinding,
                itemFallbackDimension: 123
            });
        };

        var setUsername = function(u, users) {
            $(versions, $rootel).each(function(index, val){
               var userId = val["_lastModifiedBy"] || val["sakai:pool-content-created-for"];
               if (userId === u){
                    val["username"] = sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(users[u]), 80, null, "s3d-regular-links versions_updater");
               }
            });
        };

        var parseVersions = function(success, data){
            var userIds = [];
            $.each(data.versions, function(index, version){
                version.versionId = index;
                versions.push(version);
                userIds.push(version["_lastModifiedBy"] || version["sakai:pool-content-created-for"]);
            });
            if (userIds.length) {
                sakai.api.User.getMultipleUsers(userIds, function(users){
                    for (var u in users) {
                        if (users.hasOwnProperty(u)) {
                            setUsername(u, users);
                        }
                    }
                    renderVersions();
                });
            } else {
                renderVersions();
            }
        };


        //////////
        // UTIL //
        //////////

        var getVersions = function(){
            sakai.api.Server.loadJSON(currentPageShown.pageSavePath + "/" + currentPageShown.saveRef + ".versions.json", parseVersions);
        };

        var getContext = function(){
            contentPath = $.bbq.getState("content_path");
        };

        var previewVersion = function(event){
            event.stopPropagation();
            if (!sakai_global.content_profile || sakai_global.content_profile.content_data.data.mimeType == "x-sakai/document") {
                $(".versions_selected", $rootel).removeClass("versions_selected");
                $(this).addClass("versions_selected");
                if (!$("#" + currentPageShown.ref + "_previewversion").length) {
                    $("#" + currentPageShown.ref).before("<div id=\"" + currentPageShown.ref + "_previewversion\"></div>");
                }
                if(sakai.api.Util.determineEmptyContent(versions[$(this).attr("data-versionId")].page)) {
                    $("#" + currentPageShown.ref + "_previewversion").html("<div>" + versions[$(this).attr("data-versionId")].page + "</div>");
                } else {
                    $("#" + currentPageShown.ref + "_previewversion").html(sakai.api.Util.TemplateRenderer("versions_empty_document_template", {
                        "currentversion": $(this).attr("data-versionId") === versions.length - 1
                    }));
                }
                $("#" + currentPageShown.ref).remove();
                $("#" + currentPageShown.ref + "_previewversion").show();
                sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref + "_previewversion", false, currentPageShown.pageSavePath + "/");
                sakai.api.Util.renderMath(currentPageShown.ref + "_previewversion");
            } else{
                window.open(currentPageShown.pageSavePath + ".version.," + $(this).attr("data-version") + ",/" + $(this).attr("data-pooleditemname"), "_blank");
            }
        };

        var restoreVersion = function(e){
            var toStore = {};
            toStore[currentPageShown.saveRef] = {
                page: versions[$(this).parent().attr("data-versionId")].page
            }
            $.ajax({
                url: currentPageShown.pageSavePath,
                type: "POST",
                dataType: "json",
                data: {
                    ":operation": "import",
                    ":contentType": "json",
                    ":replace": true,
                    ":replaceProperties": true,
                    "_charset_":"utf-8",
                    ":content": $.toJSON(toStore)
                },
                success: function(){
                    $.ajax({
                        url: currentPageShown.pageSavePath + "/" + currentPageShown.saveRef + ".save.json",
                        type: "POST",
                        data: {
                            "sling:resourceType": "sakai/pagecontent",
                            "sakai:pagecontent": $.toJSON(toStore),
                            "_charset_": "utf-8"
                        }, success: function(){
                            $(window).trigger("update.versions.sakai", currentPageShown);
                        }
                    });
                }
            });
        };


        /////////////
        // BINDING //
        /////////////

        var addBinding = function(){
            if (!sakai_global.content_profile || sakai_global.content_profile.content_data.data.mimeType == "x-sakai/document") {
                $(versionsVersionItem, $rootel).die("click", previewVersion);
                $(versionsVersionItem, $rootel).live("click", previewVersion);
            }

            $(versionsRestoreVersion, $rootel).die("click", restoreVersion)
            $(versionsRestoreVersion, $rootel).live("click", restoreVersion)
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var doInit = function(){
            versions = [];
            if (!sakai_global.content_profile || sakai_global.content_profile.content_data.data.mimeType != "x-sakai/document") {
                $("#content_profile_preview_versions_container").show();
            }else {
                $("#content_profile_preview_versions_container").remove();
            }
            addBinding();
            getContext();
            getVersions();
        };

        $(window).bind("init.versions.sakai", function(ev, cps){
            if($("#content_profile_left_column").is(":visible")){
                // There is a left hand navigation visible, versions widget will be smaller
                $(versionsContainer, $rootel).removeClass("versions_without_left_hand_nav");
            } else {
                // No left hand navigation visible, versions widget will be wider
                $(versionsContainer, $rootel).addClass("versions_without_left_hand_nav");
            }
            if ($(versionsContainer, $rootel).is(":visible")) {
                $(versionsContainer, $rootel).hide();
            } else {
                currentPageShown = cps;
                $(versionsContainer, $rootel).show();
                doInit();
            }
        });

        $(window).bind("update.versions.sakai", function(ev, cps){
            if ($(versionsContainer, $rootel).is(":visible")) {
                currentPageShown = cps;
                doInit();
            }
        });


    };

    sakai.api.Widgets.widgetLoader.informOnLoad("versions");
});
