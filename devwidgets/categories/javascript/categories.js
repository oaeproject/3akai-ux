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

        var directory = sakai.config.Directory;
        var categoriesToRender = [];

        var carouselBinding = function(carousel){
            $(".categories_items_scroll_scrollbutton").bind("click", function(){
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

        var addCarousel = function(){
            $categoriesItemsContainer.jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 4,
                initCallback: carouselBinding
            });
        };

        var renderCategories = function(){
            $categoriesItemsContainer.html(sakai.api.Util.TemplateRenderer(categoriesItemsTemplate, {
                "directory": categoriesToRender
            }));
            addCarousel();
        };

        var parseDirectory = function(){
            $.each(directory, function(i, toplevel){
                $.each(toplevel.children, function(index, item){
                    categoriesToRender.push(item);
                });
            });
            renderCategories();
        };

        var doInit = function(){
            parseDirectory();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("categories");
});