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
     * @name sakai_global.collectionviewer
     *
     * @class collectionviewer
     *
     * @description
     * Displays a collection through a variety of options
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.collectionviewer = function (tuid, showSettings, widgetData) {


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var $rootel = $("#" + tuid);
        var collectionviewer = {
            listStyle: "carousel",
            sortOn: "_lastModified",
            sortOrder: "desc",
            total: 0,
            page: 1
        };
        var collectionData = [];
        var carouselInitialized = false;

        // containers
        var $collectionviewerCarouselContainer = $("#collectionviewer_carousel_container", $rootel);
        var $collectionviewerExpandedContentContainer = $("#collectionviewer_expanded_content_container", $rootel);
        var $collectionviewerGridListContainer = $("#collectionviewer_grid_list_container", $rootel);


        /////////////////////////
        // RENDERING FUNCTIONS //
        /////////////////////////

        // CAROUSEL //
        /**
         * Adds binding for the carousel actions and buttons
         */
        var carouselBinding = function(carousel){
            $("#collectionviewer_newer", $rootel).live("click",function(){
                carousel.prev();
            });
            $("#collectionviewer_older", $rootel).live("click",function(){
                carousel.next();
            });
            $("#collectionviewer_oldest", $rootel).live("click",function(){
                carousel.scroll(carousel.size() || 0);
            });
            $("#collectionviewer_newest", $rootel).live("click",function(){
                carousel.scroll(0);
            });
            if(carousel.size()){
                $(".collectionviewer_carousel_item:first").click();
            }
        };

        /**
        * Renders the carousel on the page and initializes it
        */
        var renderCarousel = function(){
            $collectionviewerCarouselContainer.html(sakai.api.Util.TemplateRenderer("collectionviewer_carousel_template", {
                "data": collectionData,
                "sakai": sakai
            }));
            $collectionviewerCarouselContainer.show();
            $collectionviewerExpandedContentContainer.show();
            $("#collectionviewer_carousel", $rootel).jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 12,
                start: 0,
                initCallback: carouselBinding,
                itemFallbackDimension: 123
            });
        };

        /**
         * Renders the items for a selected item in the carousel
         */
        var renderItemsForSelected = function(pageIndex, selectedIndex){
            var selectedData = collectionData[pageIndex][selectedIndex];
            if(selectedData._mimeType === "x-sakai/collection"){
                getCollectionData("c-" + selectedData._path, function(data){
                    selectedData.collectionItems = data.results;
                    $("#collectionviewer_expanded_content_container").html(sakai.api.Util.TemplateRenderer("collectionviewer_list_item_template", {
                        data: selectedData,
                        sakai: sakai
                    }));
                    sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
                });
            } else {
                $("#collectionviewer_expanded_content_container").html(sakai.api.Util.TemplateRenderer("collectionviewer_list_item_template", {
                    data: selectedData,
                    sakai: sakai
                }));
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            }
        };

        // GRID OR LIST //
        var renderGridOrList = function(grid){
            $collectionviewerGridListContainer.html(sakai.api.Util.TemplateRenderer("collectionviewer_grid_or_list_template", {
                "items": collectionData[collectionviewer.page],
                "sakai": sakai,
                "grid": grid
            }));
            $collectionviewerGridListContainer.show();
            $("#collectionviewer_paging").pager({
                pagenumber: collectionviewer.page,
                pagecount: Math.ceil(collectionviewer.total / 12),
                buttonClickCallback: function(page){
                    collectionviewer.page = parseInt(page);
                    decideGetNextBatch();
                }
            });
        };


        ///////////////////////
        // UTILITY FUNCTIONS //
        ///////////////////////

        var decideGetNextBatch = function(){
            // Fetch page if it wasn't fetched previously
            if(!collectionData[collectionviewer.page]){
                getCollectionData();
            } else {
                showData();
            }
        }

        /**
         * Hides the main containers
         */
        var hideContainers = function(){
            $collectionviewerCarouselContainer.hide();
            $collectionviewerExpandedContentContainer.hide();
            $collectionviewerGridListContainer.hide();
        };

        /**
         * Renders the appropriate view for the widget
         */
        var showData = function(){
            hideContainers();
            switch (collectionviewer.listStyle){
                case "carousel":
                    $("#collectionviewer_carousel_view,#collectionviewer_carousel_view > div", $rootel).addClass("selected");
                    renderCarousel();
                    break;
                case "grid":
                    $("#collectionviewer_grid_view,#collectionviewer_grid_view > div", $rootel).addClass("selected");
                    renderGridOrList(true);
                    break;
                case "list":
                    $("#collectionviewer_list_view,#collectionviewer_list_view > div", $rootel).addClass("selected");
                    renderGridOrList(false);
                    break;
            }
        };

        /**
         * Retrieves the basic data for items in a collection
         */
        var getCollectionData = function(userid, callback){
            var data = {
                "sortOn": "sakai:pooled-content-file-name",
                "sortOrder": collectionviewer.sortOrder,
                "userid": userid || widgetData.collectionviewer.groupid,
                "items": 12,
                "page": (collectionviewer.page - 1)
            }
            if(collectionviewer.sortOrder === "modified"){
                data.sortOrder = "desc";
                data.sortOn = "_lastModified";
            }
            if (collectionviewer.listStyle === "carousel") {
                data.items = 1000;
                data.page = 0;
            }
            $.ajax({
                "url": sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                "data": data,
                "success": function(data){
                    if($.isFunction(callback)){
                        sakai.api.Content.prepareContentForRender(data.results, sakai.data.me, function(parsedContent){
                            callback(data);
                        });
                    } else {
                        $("#collectionviewer_add_content_button > div").text(data.total);
                        collectionviewer.total = data.total;
                        if(data.results.length){
                            sakai.api.Content.prepareContentForRender(data.results, sakai.data.me, function(parsedContent){
                                collectionData[collectionviewer.page] = parsedContent;
                                // Get the full profiles for these items
                                showData();
                            });
                        } else {
                            showData();
                        }
                    }
                }
            });
        };

        /**
         * Show comments for an item
         */
        var showComments = function(){
            if($(".collectionviewer_collection_item_comments").is(":visible")){
                $(".collectionviewer_collection_item_comments").toggle();
            } else {
                var $selectedItem = $(".collectionviewer_carousel_item.selected");
                var contentProfile = {
                    data: collectionData[$selectedItem.data("page-index")][$selectedItem.data("arr-index")]
                };
                $(window).trigger("start.collectioncomments.sakai", contentProfile);
                $(".collectionviewer_collection_item_comments").toggle();
            }
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var handleHashChange = function(){
            collectionviewer.listStyle = $.bbq.getState("ls") || "carousel";
            $(".s3d-listview-options", $rootel).children(".selected").children().removeClass("selected");
            $(".s3d-listview-options", $rootel).children(".selected").removeClass("selected");
            collectionviewer.page = 1;
            getCollectionData();
        };

        /**
         * Add binding to various elements and events.
         */
        var addBinding = function(){
            
            // Header bindings
            $("#collectionviewer_carousel_view").live("click", function(){
                $.bbq.pushState({"ls":"carousel"});
            });

            $("#collectionviewer_grid_view").live("click", function(){
                $.bbq.pushState({"ls":"grid"});
            });

            $("#collectionviewer_list_view").live("click", function(){
                $.bbq.pushState({"ls":"list"});
            });

            $(window).bind("hashchanged.collectionviewer.sakai", handleHashChange);

            // Carousel bindings
            $(".collectionviewer_carousel_item").live("click", function(){
                $(".collectionviewer_carousel_item").removeClass("selected");
                $(this).addClass("selected");
                $(window).unbind("ready.collectionviewer.sakai");
                $(window).unbind("start.collectioncontentpreview.sakai");
                renderItemsForSelected($(this).data("page-index"), $(this).data("arr-index"));
            });

            $(".collectionviewer_comments_button").live("click", showComments);

            $(window).bind("ready.pageviewer.sakai", function(){
                $(window).trigger("start.pageviewer.sakai", collectionData[$(".collectionviewer_carousel_item.selected").data("page-index")][$(".collectionviewer_carousel_item.selected").data("arr-index")]);
            });

            $(window).bind("ready.collectioncontentpreview.sakai", function(){
                if(collectionviewer.listStyle === "carousel"){
                    $(window).trigger("start.collectioncontentpreview.sakai", {
                        data: collectionData[$(".collectionviewer_carousel_item.selected").data("page-index")][$(".collectionviewer_carousel_item.selected").data("arr-index")]
                    });
                    $(".collectionviewer_collection_item_preview").show();
                }
            });

            $("#collectionviewer_sortby").change(function(){
                var sortSelection = $(this).val();
                if (sortSelection === "desc") {
                    collectionviewer.sortOrder = "desc";
                    $.bbq.pushState({"so": "desc"});
                } else if (sortSelection === "asc") {
                    collectionviewer.sortOrder = "asc";
                    $.bbq.pushState({"so": "asc"});
                } else {
                    collectionviewer.sortOrder = "modified";
                    $.bbq.pushState({"so": "modified"});
                }
            });
        };

        /**
         * Initialize the widget by adding bindings to elements and gathering collection information
         */
        var doInit = function(){
            $("#content_profile_sakaidoc_container").addClass("collections");
            collectionviewer.listStyle = $.bbq.getState("ls") || "carousel";
            collectionviewer.sortOrder = $.bbq.getState("so") || "modified";

            $("#collectionviewer_sortby").val(collectionviewer.sortOrder);

            handleHashChange();
            addBinding();
        };

        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("collectionviewer");
});
