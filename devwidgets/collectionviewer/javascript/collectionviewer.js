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
    sakai_global.collectionviewer = function (tuid, showSettings) {


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var $rootel = $("#" + tuid);
        var listStyle = "carousel";
        var collectionData = [];

        // containers
        var $collectionviewerCarouselContainer = $("#collectionviewer_carousel_container", $rootel);


        /////////////////////////
        // RENDERING FUNCTIONS //
        /////////////////////////

        /**
         * Adds binding for the carousel actions and buttons
         */
        var carouselBinding = function(carousel){
            $("#collectionviewer_newer", $rootel).live("click",function(){
                carousel.prev();
            });
            $("#collectionviewer_older", $rootel).live("click",function(){
                if (carousel.last !== carousel.size()){
                    carousel.next();
                }
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
            $("#collectionviewer_carousel", $rootel).jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 4,
                start: 0,
                initCallback: carouselBinding,
                itemFallbackDimension: 123
            });
        };

        /**
         * Renders the items for a selected item in the carousel
         */
        var renderItemsForSelected = function(selectedIndex){
            var selectedData = collectionData[selectedIndex];
            $("#collectionviewer_expanded_content_container").html(sakai.api.Util.TemplateRenderer("collectionviewer_list_item_template", {
                data: selectedData,
                sakai: sakai
            }));
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
        };


        ///////////////////////
        // UTILITY FUNCTIONS //
        ///////////////////////

        /**
         * Hides the main containers
         */
        var hideContainers = function(){
            $collectionviewerCarouselContainer.hide();
        };

        /**
         * Renders the appropriate view for the widget
         */
        var showData = function(){
            hideContainers();
            if(listStyle === "carousel"){
                renderCarousel();
            }
        };

        /**
        * Parses the profile data and puts it in the collectionData variable to be reusable
        */
        var parseProfiles = function(data, index){
            sakai.api.Content.parseFullProfile(data, function(parsedData){
                collectionData[index].hasPreview = sakai.api.Content.hasPreview(parsedData[0].data);
                collectionData[index].fullProfile = parsedData;
            });
        };

        /**
         * Gets the full profiles for items in the collection
         */
        var getFullProfiles = function(data){
            var idArr = [];
            $.each(data.results, function(i, item){
                idArr.push("/p/" + item._path);
            });
            sakai.api.Content.loadFullProfile(idArr, function(success, data){
                var count = 0;
                while (count < data.results.length / 4){
                    parseProfiles(data.results.slice(count * 4,count * 4 + 4), count);
                    count++;
                    if(count * 4 === data.results.length){
                        showData();
                    }
                }
            });
        };

        /**
         * Retrieves the basic data for items in a collection
         */
        var getCollectionData = function(){
            sakai.api.Server.loadJSON(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER + "?userid=collections-viewer&items=1000", function(success, data){
                if(success){
                    collectionData = data.results;
                    // Get the full profiles for these items
                    getFullProfiles(data);
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
                var contentProfile = collectionData[$(".collectionviewer_carousel_item.selected").data("arr-index")].fullProfile;
                $(window).trigger("start.collectioncomments.sakai", contentProfile);
                $(".collectionviewer_collection_item_comments").toggle();
            }
        };

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Add binding to various elements and events.
         */
        var addBinding = function(){
            $(".collectionviewer_carousel_item").live("click", function(){
                $(".collectionviewer_carousel_item").removeClass("selected");
                $(this).addClass("selected");
                $(window).unbind("ready.collectionviewer.sakai");
                $(window).unbind("start.collectioncontentpreview.sakai");
                renderItemsForSelected($(this).data("arr-index"));
            });

            $(".collectionviewer_comments_button").live("click", showComments);

            $(window).bind("ready.collectioncontentpreview.sakai", function(){
                if(listStyle === "carousel"){
                    $(window).trigger("start.collectioncontentpreview.sakai", collectionData[$(".collectionviewer_carousel_item.selected").data("arr-index")].fullProfile);
                    $(".collectionviewer_collection_item_preview").show();
                }
            });
        };

        /**
         * Initialize the widget by adding bindings to elements and gathering collection information
         */
        var doInit = function(){
            addBinding();
            getCollectionData();
        };

        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("collectionviewer");
});
