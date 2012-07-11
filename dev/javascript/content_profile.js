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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.content_profile = function(){

        var previous_content_path = false;
        var content_path = ""; // The current path of the content
        var ready_event_fired = 0;
        var list_event_fired = false;
        var intervalId;

        var showPreview = true;
        var collectionID = false;
        var collectionName = false;
        var isCollection = false;

        ///////////////////////////////
        // PRIVATE UTILITY FUNCTIONS //
        ///////////////////////////////

        /**
         * Load the content profile for the current content path
         * @param {Boolean} ignoreActivity Flag to also update activity data or not
         */
        var loadContentProfile = function(callback, ignoreActivity){
            // Check whether there is actually a content path in the URL
            if (content_path) {
                // Get the content information, the members and managers and version information
                sakai.api.Content.loadFullProfile(content_path, function(success, data){
                    if (success) {
                        if (data.results.hasOwnProperty(0)) {
                            var contentInfo = false;
                            if (data.results[0]["status"] === 404){
                                sakai.api.Security.send404();
                                return;
                            } else if (data.results[0]["status"] === 403){
                                sakai.api.Security.send403();
                                return;
                            } else {
                                contentInfo = $.parseJSON(data.results[0].body);
                                if (contentInfo["_mimeType"] && contentInfo["_mimeType"] === "x-sakai/document" || contentInfo["_mimeType"] && contentInfo["_mimeType"] === "x-sakai/collection"){
                                    showPreview = false;
                                } else {
                                    setColumnLayout(false, false);
                                }

                                var collectionId = $.bbq.getState("collectionId");
                                var collectionName = $.bbq.getState("collectionName");
                                var currentPath = $.bbq.getState("p");
                                if(collectionId && collectionName && currentPath){
                                    // Show go back to collection link
                                    $("#back_to_collection_button #collection_title").text(collectionName);
                                    $("#back_to_collection_button").attr("href", "/content#p=" + collectionId + "/" + sakai.api.Util.safeURL(collectionName) + "&item=" + currentPath.split("/")[0]);
                                    $('#back_to_collection_container').show();
                                } else {
                                    $('#back_to_collection_container').hide();
                                }
                            }
                        }

                        sakai.api.Content.parseFullProfile(data.results, function(parsedData){
                            parsedData.mode = "content";
                            sakai_global.content_profile.content_data = parsedData;
                            $(window).trigger("ready.contentprofile.sakai", sakai_global.content_profile.content_data);
                            if ($.isFunction(callback)) {
                                callback(true);
                            }
                            initEntityWidget();

                            if (!showPreview){
                                renderSakaiDoc(parsedData.data);
                            }
                        });
                    }
                });
            } else {
                sakai.api.Security.send404();
            }
        };

        var initEntityWidget = function(){
            if (sakai_global.content_profile.content_data) {
                var context = "content";
                if (sakai.data.me.user.anon) {
                    type = "content_anon";
                } else if (sakai_global.content_profile.content_data.isManager) {
                    type = "content_managed";
                } else if (sakai_global.content_profile.content_data.isEditor) {
                    type = 'content_edited';
                } else if (sakai_global.content_profile.content_data.isViewer) {
                    type = "content_shared";
                } else {
                    type = "content_not_shared";
                }
                $(window).trigger("sakai.entity.init", [context, type, sakai_global.content_profile.content_data]);
            }
        };

        $(window).bind("sakai.entity.ready", function(){
            initEntityWidget();
        });

        $(window).bind("load.content_profile.sakai", function(e, callback) {
            loadContentProfile(callback);
        });

        var handleHashChange = function() {
            content_path = $.bbq.getState("p") || "";
            content_path = content_path.split("/");
            content_path = "/p/" + content_path[0];

            if (content_path != previous_content_path) {
                $('#contentauthoring_widget').html('');
                previous_content_path = content_path;
                globalPageStructure = false;
                loadContentProfile(function(){
                    // The request was successful so initialise the entity widget
                    if (sakai_global.entity && sakai_global.entity.isReady) {
                        $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                    }
                    else {
                        $(window).bind("ready.entity.sakai", function(e){
                            $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                            ready_event_fired++;
                        });
                    }
                    // The request was successful so initialise the relatedcontent widget
                    if (sakai_global.relatedcontent && sakai_global.relatedcontent.isReady) {
                        $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                    }
                    else {
                        $(window).bind("ready.relatedcontent.sakai", function(e){
                            $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                            ready_event_fired++;
                        });
                    }
                    // The request was successful so initialise the relatedcontent widget
                    if (sakai_global.contentpreview && sakai_global.contentpreview.isReady) {
                        if (showPreview) {
                            $(window).trigger("start.contentpreview.sakai", sakai_global.content_profile.content_data);
                        }
                    }
                    else {
                        $(window).bind("ready.contentpreview.sakai", function(e){
                            if (showPreview) {
                                $(window).trigger("start.contentpreview.sakai", sakai_global.content_profile.content_data);
                                ready_event_fired++;
                            }
                        });
                    }
                    // The request was successful so initialise the metadata widget
                    if (sakai_global.contentmetadata && sakai_global.contentmetadata.isReady) {
                        $(window).trigger("render.contentmetadata.sakai");
                    }
                    else {
                        $(window).bind("ready.contentmetadata.sakai", function(e){
                            $(window).trigger("render.contentmetadata.sakai");
                            ready_event_fired++;
                        });
                    }
                    sakai.api.Security.showPage();
                    sakai.api.Util.setPageTitle(
                        sakai.api.i18n.getValueForKey(sakai.config.PageTitles.prefix) + " " + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"],
                        false,
                        true
                    );

                    // rerender comments widget
                    $(window).trigger("content_profile_hash_change");
                });
            }
            showPreview = true;
        };

        $("#entity_content_share").live("click", function(){
            $(window).trigger("init.sharecontent.sakai");
            return false;
        });

        $("#entity_content_add_to_library").live("click", function(){
            sakai.api.Content.addToLibrary(sakai_global.content_profile.content_data.data["_path"], sakai.data.me.user.userid, false, function(){
                $("#entity_content_add_to_library").hide();
                sakai.api.Util.notification.show($("#content_profile_add_library_title").html(), $("#content_profile_add_library_body").html());
            });
        });

        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Initialise the content profile page
         */
        var init = function(){
            // Bind an event to window.onhashchange that, when the history state changes,
            // loads all the information for the current resource
            $(window).bind('hashchange', function(){
                handleHashChange();
            });
            handleHashChange();
        };

        // //////////////////////////
        // Dealing with Sakai docs //
        /////////////////////////////

        var globalPageStructure = false;

        var generateNav = function(pagestructure){
            if (pagestructure) {
                $(window).trigger("lhnav.init", [pagestructure, {}, {
                    parametersToCarryOver: {
                        "p": sakai_global.content_profile.content_data.content_path.replace("/p/", "")
                    }
                }, sakai_global.content_profile.content_data.content_path]);
            }
        };

        $(window).bind("lhnav.ready", function(){
            generateNav(globalPageStructure);
        });

        var getPageCount = function(pagestructure){
            var pageCount = 0;
            for (var tl in pagestructure["structure0"]){
                if (pagestructure["structure0"].hasOwnProperty(tl) && tl !== "_childCount"){
                    pageCount++;
                    if (pageCount >= 3){
                        return 3;
                    }
                    for (var ll in pagestructure["structure0"][tl]){
                        if (ll.substring(0,1) !== "_"){
                            pageCount++;
                            if (pageCount >= 3){
                                return 3;
                            }
                        }
                    }
                }
            }
            return pageCount;
        };

        $(window).bind("sakai.contentauthoring.needsTwoColumns", function(){
            setColumnLayout(true, true);
        });

        $(window).bind("sakai.contentauthoring.needsOneColumn", function(){
            setColumnLayout(true, false);
        });

        var setEditProperty = function(structure, manager, editor) {
            for (var i in structure) {
                if (structure.hasOwnProperty(i)) {
                    structure[i]._canEdit = manager || editor;
                    structure[i]._canSubedit = manager || editor;
                }
            }
            return structure;
        };

        var renderSakaiDoc = function(pagestructure) {
            pagestructure = sakai.api.Server.cleanUpSakaiDocObject(pagestructure);
            pagestructure.structure0 = setEditProperty(pagestructure.structure0, sakai_global.content_profile.content_data.isManager, sakai_global.content_profile.content_data.isEditor);
            if (getPageCount(pagestructure) >= 3) {
                setColumnLayout(true, true);
            } else {
                setColumnLayout(true, false);
            }
            globalPageStructure = pagestructure;
            generateNav(pagestructure);
        };

        var setColumnLayout = function(isSakaiDoc, isTwoColumn) {
            $('body').toggleClass('has_nav', isTwoColumn);
            $('#content_profile_preview_container').toggle(!isSakaiDoc);
            $('#content_profile_contentauthoring_container').toggle(isSakaiDoc);
            $('#content_profile_left_column').toggle(isTwoColumn);
            $('#content_profile_main_container').toggleClass('s3d-twocolumn', isTwoColumn);
            $('#content_profile_right_container').toggleClass('s3d-page-column-right', isTwoColumn);
            $('#content_profile_right_metacomments').toggleClass('fl-container-650', !isTwoColumn).toggleClass('fl-container-470', isTwoColumn);
        };

        // Initialise the content profile page
        init();

    };

    sakai.api.Widgets.Container.registerForLoad("content_profile");
});
