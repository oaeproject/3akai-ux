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
            page: 1,
            contextId : false
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
                $(".collectionviewer_carousel_item:first", $rootel).click();
            }
        };

        /**
        * Renders the carousel on the page and initializes it
        */
        var renderCarousel = function(){
            sakai.api.Util.TemplateRenderer("collectionviewer_carousel_template", {
                data: collectionData,
                sakai: sakai,
                collectionName: getCollectionName(),
                collectionId: sakai.api.Content.Collections.getCollectionPoolId(collectionviewer.contextId),
                isManager: sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)
            }, $collectionviewerCarouselContainer);
            $("#collectionviewer_finish_editing_collection_button").hide();
            if(sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)){
                $("#collectionviewer_edit_collection_button").show();
            }
            $collectionviewerCarouselContainer.show();
            $collectionviewerExpandedContentContainer.show();
            $(".collectionviewer_controls", $rootel).hide();
            if(collectionData.length){
                var totalItems = 0;
                $.each(collectionData, function(index, item){
                    if (item){
                        totalItems += item.length;
                    }
                });
                if (totalItems > 12) {
                    $(".collectionviewer_controls", $rootel).show();
                }
                $("#collectionviewer_carousel", $rootel).jcarousel({
                    animation: "slow",
                    easing: "swing",
                    scroll: 12,
                    start: 0,
                    initCallback: carouselBinding,
                    itemFallbackDimension: 123
                });
            }
        };

        /**
         * Renders the items for a selected item in the carousel
         */
        var renderItemsForSelected = function(pageIndex, selectedIndex){
            var selectedData = collectionData[pageIndex][selectedIndex];
            if(selectedData._mimeType === "x-sakai/collection"){
                getCollectionData("c-" + selectedData._path, false, function(data){
                    selectedData.collectionItems = data.results;
                    sakai.api.Util.TemplateRenderer("collectionviewer_list_item_template", {
                        data: selectedData,
                        sakai: sakai,
                        collectionName: getCollectionName(),
                        collectionId: sakai.api.Content.Collections.getCollectionPoolId(collectionviewer.contextId),
                        isManager: sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)
                    }, $("#collectionviewer_expanded_content_container", $rootel));
                    sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
                });
            } else {
                sakai.api.Util.TemplateRenderer("collectionviewer_list_item_template", {
                    data: selectedData,
                    sakai: sakai,
                    collectionName: getCollectionName(),
                    collectionId: sakai.api.Content.Collections.getCollectionPoolId(collectionviewer.contextId),
                    isManager: sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)
                }, $("#collectionviewer_expanded_content_container", $rootel));
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            }
        };

        var renderEditMode = function(){
            hideContainers();            
            renderGridOrList(false, true);
        };

        // GRID OR LIST //
        var renderGridOrList = function(grid, editMode){
            if (sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)) {
                if (editMode) {
                    $("#collectionviewer_edit_collection_button").hide();
                    $("#collectionviewer_finish_editing_collection_button").show();
                } else {
                    $("#collectionviewer_finish_editing_collection_button").hide();
                    $("#collectionviewer_edit_collection_button").show();
                }
            }
            var pageNumber = collectionviewer.page - 1;
            sakai.api.Util.TemplateRenderer("collectionviewer_grid_or_list_template", {
                items: collectionData[pageNumber],
                sakai: sakai,
                grid: grid,
                editMode: editMode,
                collectionName: getCollectionName(),
                collectionId: sakai.api.Content.Collections.getCollectionPoolId(collectionviewer.contextId),
                isManager: sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)
            }, $collectionviewerGridListContainer);
            $collectionviewerGridListContainer.show();
            var pageCount = Math.ceil(collectionviewer.total / 12);
            if (pageCount > 1){
                $("#collectionviewer_paging", $rootel).show();
                $("#collectionviewer_paging", $rootel).pager({
                    pagenumber: collectionviewer.page,
                    pagecount: Math.ceil(collectionviewer.total / 12),
                    buttonClickCallback: function(page){
                        collectionviewer.page = parseInt(page, 10);
                        decideGetNextBatch();
                    }
                });
            } else {
                $("#collectionviewer_paging", $rootel).hide();
            }
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
        };

        /**
         * Hides the main containers
         */
        var hideContainers = function(){
            $collectionviewerCarouselContainer.hide();
            $collectionviewerExpandedContentContainer.hide();
            $collectionviewerGridListContainer.hide();
        };

        var toggleButtons = function(listStyle) {
            $("#collectionviewer_" + listStyle + "_view,#collectionviewer_" + listStyle + "_view > div", $rootel).addClass("selected");
        };

        /**
         * Renders the appropriate view for the widget
         */
        var showData = function(){
            hideContainers();
            switch (collectionviewer.listStyle){
                case "carousel":
                    renderCarousel();
                    break;
                case "grid":
                    renderGridOrList(true);
                    break;
                case "edit":
                    renderEditMode();
                    break;
                case "list":
                    renderGridOrList(false);
                    break;
            }
        };

        /**
         * Retrieves the basic data for items in a collection
         */
        var getCollectionData = function(userid, refresh, callback){
            toggleButtons(collectionviewer.listStyle);
            if(refresh){
                collectionviewer.page = 1;
                collectionData = [];
            }
            var data = {
                sortOn: "filename",
                sortOrder: collectionviewer.sortOrder,
                userid: userid || widgetData.collectionviewer.groupid,
                items: 15,
                page: (collectionviewer.page - 1)
            };
            if(collectionviewer.sortOrder === "modified"){
                data.sortOrder = "desc";
                data.sortOn = "_lastModified";
            }
            if (collectionviewer.listStyle === "carousel") {
                data.items = 1000;
                data.page = 0;
            }
            $.ajax({
                url: sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                data: data,
                success: function(data){
                    if($.isFunction(callback)){
                        sakai.api.Content.prepareContentForRender(data.results, sakai.data.me, function(parsedContent){
                            callback(data);
                        });
                    } else {
                        $("#collectionviewer_add_content_button > div", $rootel).text(data.total);
                        collectionviewer.total = data.total;
                        if(data.results && data.results.length){
                            sakai.api.Content.prepareContentForRender(data.results, sakai.data.me, function(parsedContent){
                                collectionData[(collectionviewer.page - 1)] = parsedContent;
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
            if($(".collectionviewer_collection_item_comments", $rootel).is(":visible")){
                $(".collectionviewer_collection_item_comments", $rootel).toggle();
            } else if ($rootel.is(":visible")) {
                var $selectedItem = $(".collectionviewer_carousel_item.selected", $rootel);
                var contentProfile = {
                    data: collectionData[parseInt($selectedItem.attr("data-page-index"), 10)][parseInt($selectedItem.attr("data-arr-index"),10)]
                };
                $(window).trigger("start.collectioncomments.sakai", contentProfile);
                $(".collectionviewer_collection_item_comments", $rootel).toggle();
            }
        };

        var handleHashChange = function(){
            var hash = collectionviewer.contextId.substring(2);
            var currHash = $.bbq.getState("p").split("/")[0];
            if (hash === currHash) {
                collectionviewer.listStyle = $.bbq.getState("ls") || "carousel";
                $(".s3d-listview-options", $rootel).children(".selected").children().removeClass("selected");
                $(".s3d-listview-options", $rootel).children(".selected").removeClass("selected");
                collectionviewer.page = 1;
                getCollectionData();
            }
        };

        var checkEditingEnabled = function(){
            if($(".collectionviewer_check:checked:visible").length){
                $("#collections_remove_button").removeAttr("disabled");
                $("#collections_savecontent_button").removeAttr("disabled");
            } else {
                $("#collections_remove_button").attr("disabled", true);
                $("#collections_savecontent_button").attr("disabled", true);
                $("#collectionviewer_select_all").removeAttr("checked");
            }
            updateButtonData();
        };

        var updateButtonData = function(){
            var idArr = [];
            var titleArr = [];
            $(".collectionviewer_check:checked:visible").each(function(i, item){
                idArr.push($(item).attr("data-entityid"));
                titleArr.push($(item).attr("data-entityname"));
            });
            $("#collections_savecontent_button").attr("data-entityid", idArr);
            $("#collections_savecontent_button").attr("data-entityname", titleArr);
        };

        var refreshCollection = function(){
            var pageNumber = collectionviewer.page - 1;
            getCollectionData("", true, function(data){
                collectionviewer.listStyle = $.bbq.getState("ls") || "list";
                $("#collectionviewer_add_content_button > div").text(data.total);
                collectionviewer.total = data.total;
                collectionData[pageNumber] = data.results;
                renderGridOrList(false, true);
                sakai.api.Util.progressIndicator.hideProgressIndicator();
            });
        };

        var doStart = function(which) {
            if ($rootel.is(":visible")) {
                var arrIndex1 = 0;
                if ($(".collectionviewer_carousel_item.selected", $rootel).length){
                    arrIndex1 = parseInt($(".collectionviewer_carousel_item.selected", $rootel).attr("data-page-index"), 10);
                }
                var arrIndex2 = 0;
                if ($(".collectionviewer_carousel_item.selected", $rootel).length) {
                    arrIndex2 = parseInt($(".collectionviewer_carousel_item.selected", $rootel).attr("data-arr-index"), 10);
                }
                if (which === "collectioncontentpreview" && collectionviewer.listStyle === "carousel") {
                    $(window).trigger("start.collectioncontentpreview.sakai", collectionData[arrIndex1][arrIndex2]);
                    $(".collectionviewer_collection_item_preview", $rootel).show();
                } else if (which === "pageviewer") {
                    $(window).trigger("start.pageviewer.sakai", collectionData[arrIndex1][arrIndex2]);
                }
            }
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Add binding to various elements and events.
         */
        var addBinding = function(){

            // Header bindings
            $("#collectionviewer_carousel_view", $rootel).live("click", function(){
                $.bbq.pushState({"ls":"carousel"});
            });

            $("#collectionviewer_grid_view", $rootel).live("click", function(){
                $.bbq.pushState({"ls":"grid"});
            });

            $("#collectionviewer_list_view", $rootel).live("click", function(){
                $.bbq.pushState({"ls":"list"});
            });

            $("#collectionviewer_edit_collection_button", $rootel).live("click", function(){
                $.bbq.pushState({"ls":"edit"});
            });

            $(window).bind("hashchanged.collectionviewer.sakai", handleHashChange);

            // Carousel bindings
            $(".collectionviewer_carousel_item", $rootel).live("click", function(){
                $(".collectionviewer_carousel_item", $rootel).removeClass("selected");
                $(this).addClass("selected");
                $(window).unbind("ready.collectionviewer.sakai");
                $(window).unbind("start.collectioncontentpreview.sakai");
                renderItemsForSelected(parseInt($(this).attr("data-page-index"), 10), parseInt($(this).attr("data-arr-index"), 10));
            });

            $(".collectionviewer_comments_button", $rootel).live("click", showComments);

            $(window).bind("ready.pageviewer.sakai", function(){
                doStart("pageviewer");
            });

            $(window).bind("ready.collectioncontentpreview.sakai", function() {
                doStart("collectioncontentpreview");
            });


            $("#collectionviewer_sortby", $rootel).change(function(){
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

            $(".collectionviewer_collection_item_comments #contentcomments_postComment", $rootel).live("click", function(){
                collectionData[parseInt($(".collectionviewer_carousel_item.selected").attr("data-page-index"),10)][parseInt($(".collectionviewer_carousel_item.selected").attr("data-arr-index"), 10)].numComments++;
                $(".collectionviewer_comments_count").text(collectionData[parseInt($(".collectionviewer_carousel_item.selected").attr("data-page-index"), 10)][parseInt($(".collectionviewer_carousel_item.selected").attr("data-arr-index"), 10)].numComments);
            });

            $("#collectionviewer_finish_editing_collection_button", $rootel).click(function(){
                $(this).hide();
                $("#collectionviewer_edit_collection_button", $rootel).show();
                $.bbq.pushState({"ls":"carousel"});
            });

            $("#collectionviewer_select_all", $rootel).live("click", function(){
                if($(this).is(":checked")){
                    $(".collectionviewer_check:visible").attr("checked", true);
                } else{
                    $(".collectionviewer_check:visible").removeAttr("checked");
                }
                checkEditingEnabled();
            });

            $(".collectionviewer_check", $rootel).live("change", checkEditingEnabled);

            $("#collections_remove_button", $rootel).live("click", function() {
                var $checked = $(".collectionviewer_check:checked:visible", $rootel);
                if ($checked.length) {
                    var paths = [];
                    $checked.each(function () {
                        paths.push($(this).attr("id").split("collectionviewer_check_")[1]);
                    });
                    $(window).trigger('init.deletecontent.sakai', [{
                        paths: paths,
                        context: collectionviewer.contextId
                    }, function (success) {
                        sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey("REMOVING_CONTENT_FROM_COLLECTION", "collectionviewer"), sakai.api.i18n.getValueForKey("PROCESSING", "collectionviewer"));
                        $(".collectionviewer_check:checked:visible").parents("li").hide("slow");
                        setTimeout(refreshCollection, 1500);
                    }]);
                }
            });

            $(".collectionviewer_remove_icon", $rootel).live("click", function(){
                var $itemToRemove = $(this);
                var toRemoveId = $itemToRemove.attr("data-entityid");
                $(window).trigger('init.deletecontent.sakai', [{
                    paths: [toRemoveId],
                    context: collectionviewer.contextId
                }, function (success) {
                    $itemToRemove.parents("li").hide("slow");
                    setTimeout(refreshCollection, 1500);
                }]);
            });

            $(window).bind("done.newaddcontent.sakai", function(ev, data){
                handleHashChange();
            });

            $(".collectionviewer_widget", $rootel).on("click", "#collectionviewer_expanded_content_container .s3d-search-result .share_trigger_click, #collectionviewer_expanded_content_container .s3d-search-result .savecontent_trigger", function() {
                $(this).parents(".s3d-search-result").addClass("hovered");
            });

            $(window).bind("hiding.newsharecontent.sakai hiding.savecontent.sakai", function() {
                $("#collectionviewer_expanded_content_container .s3d-search-result.hovered").removeClass("hovered");
            });

        };

        var getCollectionName = function(){
            if (sakai_global.content_profile && sakai_global.content_profile.content_data){
                return sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"];
            }
            return collectionviewer.contextName;
        };

        /**
         * Initialize the widget by adding bindings to elements and gathering collection information
         */
        var doInit = function(){
            collectionviewer.listStyle = $.bbq.getState("ls") || "carousel";
            collectionviewer.sortOrder = $.bbq.getState("so") || "modified";
            collectionviewer.contextId = widgetData.collectionviewer.groupid;
            if(sakai.api.Content.Collections.canCurrentUserManageCollection(collectionviewer.contextId)){
                $("#collectionviewer_header_container #collectionviewer_add_content_button").show();
                $("#collectionviewer_header_container #collectionviewer_edit_collection_button").show();
                $("#collectionviewer_finish_editing_collection_button").hide();
            }

            $("#content_profile_sakaidoc_container").addClass("collections");
            $("#collectionviewer_sortby").val(collectionviewer.sortOrder);

            if (sakai_global.content_profile && sakai_global.content_profile.content_data){
                collectionviewer.contextName = sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"];
                handleHashChange();
                addBinding();
            // Retrieve the name of the collection as we're not in a content profile page
            } else {
                $.ajax({
                    url: "/p/" + sakai.api.Content.Collections.getCollectionPoolId(collectionviewer.contextId) + ".json",
                    success: function(data){
                        collectionviewer.contextName = data["sakai:pooled-content-file-name"];
                        handleHashChange();
                        addBinding();
                    }
                });
            }
        };

        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("collectionviewer");
});
