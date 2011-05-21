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

        // Vars
        var contentPath = "";
        var versions = [];

        // Containers
        var versionsContainer = "#versions_container";

        // Templates
        var versionsTemplate = "versions_template";

        // Elements
        var versionsVersionItem = ".versions_version_item";
        var versionsRestoreVersion = ".versions_restore_version";


        ///////////////
        // RENDERING //
        ///////////////

        var carouselBinding = function(carousel){
            $("#versions_next").live("click",function(){
                carousel.next();
            });

            $("#versions_prev").live("click",function(){
                carousel.prev();
            });
        };


        ///////////////
        // RENDERING //
        ///////////////

        var renderVersions = function(){
            $(versionsContainer).html(sakai.api.Util.TemplateRenderer(versionsTemplate, {
                "data": versions,
                "sakai": sakai
            }));
            $(versionsContainer).jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 3,
                start: versions.length - 1,
                initCallback: carouselBinding,
                itemFallbackDimension: 123
            });
        };

        var setUsername = function(u, users) {
            $(versions).each(function(index, val){
               var userId = val["_lastModifiedBy"];
               if (userId === u){
                    val["_lastModifiedBy"] = sakai.api.User.getDisplayName(users[u]);
               }
            });
        };

        var parseVersions = function(success, data){
            var userIds = [];
            $.each(data.versions, function(index, version){
                versions.push(version);
                userIds.push(version["_lastModifiedBy"]);
            });
            versions.reverse();
            if (userIds.length) {
                sakai.api.User.getMultipleUsers(userIds, function(users){
                    for (var u in users) {
                        if (users.hasOwnProperty(u)) {
                            setUsername(u, users);
                        }
                    }
                    if ($(versionsContainer).is(":visible")) {
                        renderVersions();
                    }
                    else {
                        $(versionsContainer).show();
                        renderVersions();
                    }
                });
            } else {
                if ($(versionsContainer).is(":visible")) {
                    renderVersions();
                } else {
                    $(versionsContainer).show();
                    renderVersions();
                }
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

        var previewVersion = function(){
            $(".versions_selected").removeClass("versions_selected");
            $(this).addClass("versions_selected");
            if(!$("#" + currentPageShown.saveRef + "_previewversion").length){
                $("#" + currentPageShown.saveRef).before("<div id=\"" + currentPageShown.saveRef + "_previewversion\"></div>");
            }
            $("#" + currentPageShown.saveRef + "_previewversion").html("<div>" + $(this).attr("data-pageContent") + "</div>");
            $("#" + currentPageShown.saveRef + "_previewversion").show();
            $("#" + currentPageShown.saveRef).hide();
        };

        var restoreVersion = function(){
            var toStore = {};
            toStore[currentPageShown.saveRef] = {
                page: $(this).parent().attr("data-pageContent")
            }
            $.ajax({
                url: currentPageShown.pageSavePath + ".resource",
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
            $(versionsVersionItem).die("click", previewVersion);
            $(versionsRestoreVersion).die("click", restoreVersion)

            $(versionsVersionItem).live("click", previewVersion);
            $(versionsRestoreVersion).live("click", restoreVersion)
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var doInit = function(){
            versions = [];
            addBinding();
            getContext();
            getVersions();
        };

        $(window).bind("init.versions.sakai", function(ev, cps){
            if ($(versionsContainer).is(":visible")) {
                $(versionsContainer).hide();
            } else{
                currentPageShown = cps;
                doInit();
                if (cps.showByDefault) {
                    $(versionsContainer).show();
                }
            }
        });

        $(window).bind("update.versions.sakai", function(ev, cps){
            if ($(versionsContainer).is(":visible")) {
                currentPageShown = cps;
                doInit();
            }
        });


    };

    sakai.api.Widgets.widgetLoader.informOnLoad("versions");
});