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
            $categoriesExpandContract.bind("click", toggleWidgetvisibility);
        };
        
        /**
         * Add binding to the carousel action buttons after rendering and initializing the carousel
         * @param {Object} carousel reference to the carousel instance
         */
        var carouselBinding = function(carousel){
            $(".categories_items_scroll_scrollbutton.categories_items_scroll_deselected, #categories_view_next_raquo").live("click", function(){
                $(".categories_items_scroll_scrollbutton.categories_items_scroll_deselected, #categories_view_next_raquo").die("click");
                var clickedId = parseInt($(this)[0].id.split("scroll_")[1], 10);
                if (clickedId < parseInt($(".categories_items_scroll_selected")[0].id.split("scroll_")[1], 10) && $(this)[0].id !== "categories_view_next_raquo") {
                    carousel.prev();
                }
                else {
                    carousel.next();
                }
                if ($(this)[0].id !== "categories_view_next_raquo") {
                    $(".categories_items_scroll_scrollbutton").addClass("categories_items_scroll_deselected");
                    $(".categories_items_scroll_selected").removeClass("categories_items_scroll_selected");
                    $(this).removeClass("categories_items_scroll_deselected");
                    $(this).addClass("categories_items_scroll_selected");
                }
                else {
                    var $this = $(".categories_items_scroll_selected");
                    if ($this.next()[0]) {
                        var $next = $this.next();
                        $next.addClass("categories_items_scroll_selected");
                        $next.removeClass("categories_items_scroll_deselected");
                    } else {
                        var $first = $($(".categories_items_scroll_deselected")[0]);
                        $first.addClass("categories_items_scroll_selected");
                        $first.removeClass("categories_items_scroll_deselected");
                    }
                    $this.removeClass("categories_items_scroll_selected");
                    $this.addClass("categories_items_scroll_deselected");
                }
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
                wrap: "circular",
                itemFirstInCallback: carouselBinding
            });
            $categoriesItemsContainer.css("display", "none");
        };
        
        var renderCategories = function(){
            $categoriesItemsContainer.html(sakai.api.Util.TemplateRenderer(categoriesItemsTemplate, {
                "directory": categoriesToRender,
                "sakai": sakai
            }));
            addCarousel();
            $(".categories_widget").css("visibility", "visible");
        };
        
        /**
         * Parse the directory structure and extract some information from the featured content
         * @param {Object} success true or false depending on the success of loading the featured content
         * @param {Object} data contains featured content data
         */   
        var parseDirectory = function(success, data){
            $.each(directory, function(i, toplevel){
                toplevel.count = 0;
                if (data[i] && data[i].content){
                    toplevel.content = data[i].content;
                    toplevel.content.usedin = sakai.api.Content.getPlaceCount(toplevel.content);
                    toplevel.content.commentcount = sakai.api.Content.getCommentCount(toplevel.content);
                    var mimeType = sakai.api.Content.getMimeType(toplevel.content);
                    if (mimeType.indexOf("image/") !== -1){
                        toplevel.content.image = true;
                    }
                    if (sakai.api.Content.getThumbnail(toplevel.content)){
                        toplevel.content.haspreview = true;
                    }
                    toplevel.count = data[i]["sakai:tag-count"];
                }
                toplevel.id = i;
                categoriesToRender.push(toplevel);
                
            });
            renderCategories();
        };
        
        /**
         * Get a feed of content to display in the carousel
         */
        var getCategoryContent = function(){
            sakai.api.Server.loadJSON("/tags/directory.tagged.json", parseDirectory, {});
        };
        
        
        ////////////////
        // INITIALIZE //
        ////////////////
        
        var doInit = function(){
            addBinding();
            getCategoryContent();
        };
        
        doInit();
        
    };
    
    sakai.api.Widgets.widgetLoader.informOnLoad("categories");
});
