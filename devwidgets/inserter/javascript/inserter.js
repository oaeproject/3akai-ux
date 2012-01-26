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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.inserter
     *
     * @class inserter
     *
     * @description
     * The inserter makes it possible to insert content from your library and
     * enhances the content authoring experience.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.inserter = function (tuid, showSettings) {

        var hasInitialised = false;

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $("#" + tuid);
        var libraryData = {};
        var library = false;
        var infinityScroll = false;
        var contentListDisplayed = [];
        var prevQ = "";

        // Elements in the UI
        var $inserterAllCollectionsButton = $("#inserter_all_collections_button", $rootel);
        var inserterCollectionContentSearch = "#inserter_collection_content_search";
        var $inserterMimetypeFilter = $("#inserter_mimetype_filter");

        // Containers
        var $inserterWidget = $(".inserter_widget", $rootel);
        var $inserterHeader = $("#inserter_header", $rootel);
        var $inserterHeaderTitleContainer = $("#inserter_header_title_container", $rootel);
        var $inserterInitContainer = $("#inserter_init_container", $rootel);
        var $inserterCollectionContentContainer = $("#inserter_collection_content_container", $rootel);
        var $inserterCollectionItemsList = $(".inserter_collections_top_container ul", $rootel);
        var $inserterCollectionItemsListItem = $(".inserter_collections_top_container ul li", $rootel);
        var $inserterInfiniteScrollContainerList = $("#inserter_infinitescroll_container ul", $rootel);
        var $inserterInfiniteScrollContainer = $("#inserter_infinitescroll_container", $rootel);
        var $inserterNoResultsContainer = $("#inserter_no_results_container", $rootel);

        // Templates
        var inserterHeaderTemplate = "inserter_header_title_template";
        var inserterInitTemplate = "inserter_init_template";
        var inserterCollectionContentTemplate = "inserter_collection_content_template";
        var inserterNoResultsTemplate = "inserter_no_results_template";


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Search through the list based on the title of the document
         * @param {Object} ev Event object from search input field keyup action
         */
        var searchCollection = function(ev){
            if (ev.keyCode === $.ui.keyCode.ENTER && prevQ !== $.trim($(inserterCollectionContentSearch).val())) {
                prevQ = $.trim($(inserterCollectionContentSearch).val());
                showCollection(contentListDisplayed);
            }
        };

        /**
         * Disables/Enables the header input and select elements
         * @param {Boolean} disable True or false depending on if the search should be enabled or not
         */
        var disableEnableHeader = function(disable){
            if(disable){
                $(inserterCollectionContentSearch).attr("disabled", "true");
                $inserterMimetypeFilter.attr("disabled", "true");
            } else {
                $(inserterCollectionContentSearch).removeAttr("disabled");
                $inserterMimetypeFilter.removeAttr("disabled");
            }
        };

        /**
         * Renders the header for each context
         * @param {String} context if context is 'library' the library header will be rendered, other header has collection title.
         * @param {Object} item Object containing the data of the collection to be shown
         */
        var renderHeader = function(context, item) {
            $inserterHeaderTitleContainer.animate({
                "opacity": 0
            }, 0, function(){
                sakai.api.Util.TemplateRenderer(inserterHeaderTemplate, {
                    "context": context,
                    "item": item,
                    "librarycount": sakai.data.me.user.properties.contentCount,
                    sakai: sakai
                }, $inserterHeaderTitleContainer);
                $inserterHeaderTitleContainer.animate({
                    "opacity": 1
                }, 400);
            });
        };

        /**
         * Reset the UI to the initial state
         */
        var resetUI = function(){
            disableEnableHeader(false);
            renderHeader("init");
            library = false;
            $(inserterCollectionContentSearch).val("");
            $inserterMimetypeFilter.val($('options:first', $inserterMimetypeFilter).val());
            animateUIElements("reset");
        };

        /**
         * Refreshes the widget by resetting the UI to the initial screen and fetching the collections
         */
        var refreshWidget = function(){
            resetUI();
            fetchLibrary();
        };

        /**
         * Animate different UI elements according to the context of the widget
         * @param {String} context Context the widget is in
         */
        var animateUIElements = function(context){
            switch (context){
                case "init":
                    $inserterWidget.animate({
                        "height": $inserterInitContainer.height() + $inserterHeader.height() + 10
                    });
                    break;
                case "reset":
                    $inserterInitContainer.animate({
                        "margin-left": 5,
                        "opacity": 1
                    }, 400 );
                    $inserterCollectionContentContainer.animate({
                        "margin-left": 240,
                        "opacity": 0
                    }, 400 );
                    $inserterWidget.animate({
                        "height": $inserterInitContainer.height() + $inserterHeader.height() + 10
                    });
                    break;
                case "noresults":
                    $inserterWidget.animate({
                        "height": $inserterNoResultsContainer.height() + $inserterHeader.height() + 80
                    });
                    break;
                case "results":
                    $inserterInitContainer.animate({
                        "margin-left": -240,
                        "opacity": 0
                    }, 400 );
                    $inserterCollectionContentContainer.css("margin-left", 240);
                    $inserterCollectionContentContainer.animate({
                        "margin-left": 5,
                        "opacity": 1
                    }, 400 );
                    $inserterWidget.animate({
                        "height": $inserterCollectionContentContainer.height() + $("#inserter_no_results_container:visible", $rootel).height() + $inserterHeader.height() + 10
                    });
                    break;
            }
        };

        /**
         * Filter the library and returns collection type items
         * @param {Object} library Contains a resultset in the form of an Array
         */
        var filterCollections = function(library){
            var collections = [];
            library = library || libraryData.results;
            $.each(library, function(index, item){
                if(item._mimeType === "x-sakai/collection"){
                    collections.push(item);
                }
            });
            return collections;
        };


        ////////////////////
        // Data gathering //
        ////////////////////

        /**
         * Process library item results from the server
         * @param {Object} Results fetched by the infinite scroller
         * @param {Function} callback executed in the infinite scroller
         */
        var handleLibraryItems = function (results, callback) {
            sakai.api.Content.prepareContentForRender(results, sakai.data.me, function(contentResults){
                if (contentResults.length > 0){
                    callback(contentResults);
                } else {
                    callback([]);
                }
            });
        };

        /**
         * Show the collection of items
         * @param {Object} Contains data about the collection to be loaded
         */
        var showCollection = function(item){

            var query = $.trim($(inserterCollectionContentSearch).val()) || "*";
            var mimetype = $inserterMimetypeFilter.val() || "";

            var params = {
                sortOn: "_lastModified",
                sortOrder: "desc",
                q: query,
                mimetype: mimetype
            };
            if (item === "library" || library) {
                library = true;
                item = libraryData.results;
                contentListDisplayed = item;
                params.userid = sakai.data.me.userid;
            } else {
                library = false;
                contentListDisplayed = item._path || item;
                params.userid = sakai.api.Content.Collections.getCollectionGroupId(contentListDisplayed);
            }

            // Disable the previous infinite scroll
            if (infinityScroll){
                infinityScroll.kill();
            }
            infinityScroll = $inserterCollectionItemsList.infinitescroll(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER, params, function(items, total){
                // render
                return sakai.api.Util.TemplateRenderer(inserterCollectionContentTemplate, {
                    "items": items,
                    sakai: sakai
                });
            }, function(){
                // empty list processor
                disableEnableHeader((!query && !mimetype) || query);
                var query = $.trim($(inserterCollectionContentSearch).val());
                if(!$inserterMimetypeFilter.val() || query){
                    sakai.api.Util.TemplateRenderer(inserterNoResultsTemplate, {
                        "search": query
                    }, $inserterNoResultsContainer);
                    $inserterNoResultsContainer.show();
                } else {
                    var query = $.trim($(inserterCollectionContentSearch).val());
                    sakai.api.Util.TemplateRenderer(inserterNoResultsTemplate, {
                        "search": "mimetypesearch"
                    }, $inserterNoResultsContainer);
                    $inserterNoResultsContainer.show();
                }
                animateUIElements("noresults");
            }, sakai.config.URL.INFINITE_LOADING_ICON, handleLibraryItems, function(){
                // post renderer
                $inserterNoResultsContainer.hide();
                sakai.api.Util.Draggable.setupDraggable({
                    connectToSortable: ".contentauthoring_cell_content"
                }, $inserterInfiniteScrollContainerList);
                if($inserterCollectionContentContainer.css("margin-left") !== "5px"){
                    animateUIElements("results");
                } else {
                    $inserterWidget.css({
                        "height": $inserterCollectionContentContainer.height() + $inserterHeader.height() + 10
                    });
                }
            }, sakai.api.Content.getNewList(contentListDisplayed), function(){
                // initial callback
            }, $inserterInfiniteScrollContainer);
        };


        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Fetch the collection data
         */
        var processCollections = function(){
            sakai.api.Content.Collections.getMyCollections(0, 1000, function(data){
                if(data){
                    var collections = filterCollections(data.results);
                    $inserterInitContainer.html(sakai.api.Util.TemplateRenderer(inserterInitTemplate, {"library": data, "collections": collections, sakai: sakai}));
                    sakai.api.Util.Draggable.setupDraggable({
                        connectToSortable: ".contentauthoring_cell_content"
                    }, $inserterInitContainer);
                    animateUIElements("init");
                    $.each(libraryData.results, function(i, item){
                        if(item._mimeType === "x-sakai/collection"){
                            $.each(collections, function(ii, collection){
                                if(collection._path === item._path){
                                    libraryData.results[i].counts = collection.counts;
                                }
                            });
                        }
                    });
                }
            });
        }

        /**
         * Fetch the user's library
         */
        var fetchLibrary = function(){
            sakai.api.Server.loadJSON(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER, function(success, data) {
                if (success){
                    libraryData = data;
                    processCollections();
                }
            });
        };

        /**
         * Add binding to various elements of the widget
         */
        var addBinding = function(){
            $inserterCollectionItemsListItem.live("click", function(){
                $inserterInitContainer.animate({
                    "opacity": 0,
                    "margin-left": -240
                }, 400 );
                var idToShow = $(this).data("id");
                if (idToShow === "library"){
                    renderHeader("items", idToShow);
                    showCollection(idToShow);
                } else {
                    $.each(libraryData.results, function(i, item){
                        if(item._path === idToShow){
                            renderHeader("items", item);
                            showCollection(item);
                        }
                    });
                }
            });
            $inserterAllCollectionsButton.live("click", resetUI);
            $(inserterCollectionContentSearch).live("keyup", searchCollection);
            $inserterMimetypeFilter.live("change", function(){
                showCollection(contentListDisplayed);
            });
            $(window).bind("sakai.collections.created", refreshWidget);
            $(window).bind("sakai.collections.updated", processCollections);
            $(window).bind("done.newaddcontent.sakai", processCollections);
        };

        /**
         * Initialize the inserter widget
         */
        var doInit = function(){
            $inserterInitContainer.css({
                "margin-left": 5,
                "opacity": 1
            });
            $inserterCollectionContentContainer.css({
                "margin-left": 240,
                "opacity": 0
            });
            addBinding();
            $inserterWidget.draggable({
                cancel: "div#inserter_collector",
                stop: function(ev){
                    elOffset = $(ev.target).offset();
                    wHeight = $(window).height();
                    wWidth = $(window).width();
                    iHeight= $inserterWidget.height();
                    iWidth = $inserterWidget.width()
                    borderMargin = 15;
                    // Overlaps left window border
                    if(elOffset && elOffset.left < 0){
                        $inserterWidget.css("left", borderMargin);
                    }
                    // Overlaps right window border
                    if (elOffset.left > wWidth - iWidth){
                        $inserterWidget.css("left", wWidth - iWidth - borderMargin);
                    }
                    // Overlaps top window border or topnavigation
                    if(elOffset && elOffset.top < 50){
                        $inserterWidget.css("top", 50);
                    }
                    // Overlaps bottom window border
                    if (elOffset.top > wHeight - iHeight){
                        $inserterWidget.css("top", wHeight - iHeight - borderMargin);
                    }
                }
            });
            renderHeader("init");
            fetchLibrary();
        };

        var toggleInserter = function(){
            $inserterWidget.fadeToggle(250);
            if ($("#topnavigation_container .inserter_toggle").hasClass("inserter_toggle_active")){
                $("#topnavigation_container .inserter_toggle").removeClass("inserter_toggle_active");
            } else {
                $("#topnavigation_container .inserter_toggle").addClass("inserter_toggle_active");
            }
            if (!hasInitialised) {
                doInit();
                hasInitialised = true;
            }
        };
        $(".inserter_toggle").live("click", toggleInserter);

        $(window).bind("start.drag.sakai", function(){
            if (!$inserterWidget.is(":visible")){
                toggleInserter();
            }
        });

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("inserter");
});