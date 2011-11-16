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

        // containers
        var $collectionviewerCarouselContainer = $("#collectionviewer_carousel_container", $rootel);


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
        };

        var renderCarousel = function(data){
            $collectionviewerCarouselContainer.html(sakai.api.Util.TemplateRenderer("collectionviewer_carousel_template", {
                "data": data,
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


        ///////////////////////
        // UTILITY FUNCTIONS //
        ///////////////////////

        var hideContainers = function(){
            $collectionviewerCarouselContainer.hide();
        };

        var showData = function(data){
            hideContainers();
            if(listStyle === "carousel"){
                renderCarousel(data);
            }
        };

        var getCollectionData = function(){
            sakai.api.Server.loadJSON(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER + "?userid=collections-viewer&items=1000", function(success, data){
                if(success){
                    showData(data);
                } else {
                    
                }
            });
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var addBinding = function(){
            
        };

        var doInit = function(){
            addBinding();
            getCollectionData();
        };

        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("collectionviewer");
});
