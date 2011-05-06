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
     * @name sakai_global.categories
     *
     * @class categories
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.categories = function(tuid, showSettings){

        // Containers
        var $categoriesItemsContainer = $("#categories_items_container");

        // Templates
        var categoriesItemsTemplate = "categories_items_template";

        // Elements
        var $categoriesExpandContract = $("#categories_expand_contract");

        var directory = sakai.config.Directory;
        var categoriesToRender = [];


        /////////////
        // BINDING //
        /////////////

        /**
         * Expand or collapse the widget
         */
        var toggleWidgetvisibility = function(){
            $categoriesItemsContainer.toggle("display");
            $categoriesExpandContract.children("div").toggle();
        };

        var addBinding = function(){
            $categoriesExpandContract.bind("click", toggleWidgetvisibility)
        };

        /**
         * Add binding to the carousel action buttons after rendering and initializing the carousel
         * @param {Object} carousel reference to the carousel instance
         */
        var carouselBinding = function(carousel){
            $(".categories_items_scroll_scrollbutton.categories_items_scroll_deselected").live("click", function(){
                var clickedId = $(this)[0].id.split("scroll_")[1];
                if(clickedId < $(".categories_items_scroll_selected")[0].id.split("scroll_")[1]){
                    carousel.prev();
                }else{
                    carousel.next();
                }
                $(".categories_items_scroll_scrollbutton").addClass("categories_items_scroll_deselected");
                $(".categories_items_scroll_selected").removeClass("categories_items_scroll_selected");
                $(this).removeClass("categories_items_scroll_deselected");
                $(this).addClass("categories_items_scroll_selected");
                return false;
            });
        };


        ////////////////////////////
        // CAROUSEL AND RENDERING //
        ////////////////////////////

        /**
         * Initialize the carousel after rendering the items
         */
        var addCarousel = function(){
            $categoriesItemsContainer.jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 4,
                initCallback: carouselBinding
            });
            $categoriesItemsContainer.css("display","none");
        };

        var renderCategories = function(total){
            $categoriesItemsContainer.html(sakai.api.Util.TemplateRenderer(categoriesItemsTemplate, {
                "directory": categoriesToRender,
                "sakai": sakai,
                "total":total
            }));
            addCarousel();
        };

        /**
         * Parse the directory structure and extract some information from the featured content
         * @param {Object} success true or false depending on the success of loading the featured content
         * @param {Object} data contains featured content data
         */
        var parseDirectory = function(success, data){
            $.each(directory, function(i, toplevel){
                var count = 0;
                $.each(toplevel.children, function(index, item){
                    if (data.results[count]){
                        if (data.results[count]["_mimeType"] && data.results[count]["_mimeType"].split("/")[0] == "image") {
                            data.results[count].image = true;
                        }
                        if (data.results[count]["sakai:tags"]) {
                            data.results[count]["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(data.results[count]["sakai:tags"].toString());
                        }
                        data.results[count].haspreview = sakai.api.Content.hasPreview(data.results[count]);
                        item["featuredcontent"] = data.results[count];
                    }
                    categoriesToRender.push(item);
                    count++;
                });
            });
            renderCategories(data.total);
        };

        /**
         * Get a feed of content to display in the carousel
         */
        var getCategoryContent = function(){
            sakai.api.Server.loadJSON("/var/search/pool/all-all.json", parseDirectory, {
                page: 0,
                items: 10,
                sortOn: "_lastModified",
                sortOrder: "desc",
                q: "*"
            });
        };


        ////////////////
        // INITIALIZE //
        ////////////////

        var doInit = function(){
            addBinding();
            getCategoryContent();
            //parseDirectory();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("categories");
});