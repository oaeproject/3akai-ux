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
     * @name sakai_global.inserterbar
     *
     * @class inserterbar
     *
     * @description
     * The inserter bar enables users to drag and drop widgets/labels/paragraphs,...
     * on the content authoring edit mode.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.inserterbar = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $("#" + tuid);

        // containers
        var $inserterbarWidget = $("#inserterbar_widget", $rootel);
        var $inserterbarMoreWidgets = $("#inserterbar_more_widgets", $rootel);
        var $inserterbarDynamicWidgetList = $("#inserterbar_dynamic_widget_list", $rootel);

        // Templates
        var inserterbarDynamicWidgetListTemplate = "inserterbar_dynamic_widget_list_template";

        // Elements
        var $inserterbarGrabber = $("#inserterbar_grabber", $rootel);

        /////////////
        // Utility //
        /////////////

        var editPosition = function(width){
            //$inserterbarWidget.css("left", $(".s3d-page-header").position().left + $(".s3d-page-header").width() - $inserterbarWidget.width() - 12);
            $inserterbarWidget.css("left", $(".s3d-page-header").position().left + $(".s3d-page-header").width() - width - 12);
        };

        var showHideMoreWidgets = function(){
            $(this).children("span").toggle();
            if($("#inserterbar_more_widgets_container:visible", $rootel).length){
                $inserterbarGrabber.animate({
                    "height": "37px"
                });
            } else {
                $inserterbarGrabber.animate({
                    "height": "136px"
                });
            }
            $("#inserterbar_more_widgets_container", $rootel).animate({
                opacity: "toggle",
                height: "toggle"
            });
            editPosition();
        };


        ////////////////////
        // Initialization //
        ////////////////////

        var setupSortables = function(){
            $( "#inserterbar_widget .inserterbar_widget_draggable", $rootel ).draggable({
    			connectToSortable: ".contentauthoring_cell_content",
    			helper: "clone",
    			revert: "invalid",
    			opacity: 0.4,
                start: function(){
                    sakai_global.contentauthoring.isDragging = true;
                    // Fix for iFrames
                    $('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>').css({
                        width: "100%", height: "100%",
                        position: "absolute", opacity: "0.001", zIndex: 100000
                    }).css($(this).offset()).appendTo("body");
                },
                stop: function(){
                    sakai_global.contentauthoring.isDragging = false;
                    $("div.ui-resizable-iframeFix").each(function() { this.parentNode.removeChild(this); }); 
                }
    		});
        };

        var carouselBinding = function(carousel){
            $("#inserterbar_carousel_left", $rootel).live("click",function(){
                carousel.prev();
            });
            $("#inserterbar_carousel_right", $rootel).live("click",function(){
                carousel.next();
            });
        };

        var setupCarousel = function(){
            $("#inserterbar_more_widgets_container .s3d-outer-shadow-container", $rootel).jcarousel({
                animation: "slow",
                easing: "swing",
                scroll: 4,
                itemFirstInCallback: carouselBinding,
                itemFallbackDimension: 4
            });

            $("#inserterbar_more_widgets_container", $rootel).css("display", "none");
        };

        var renderWidgets = function(){
            // Vars for media and goodies
            var media = {}; media.items = [];
            var goodies = {}; goodies.items = [];

            // Fill in media and goodies
            for (var i in sakai.widgets){
                if (sakai.widgets.hasOwnProperty(i) && i) {
                    var widget = sakai.widgets[i];
                    if (widget["sakaidocs"] && widget.showinmedia) {
                        media.items.push(widget);
                    }
                    if (widget["sakaidocs"] && widget.showinsakaigoodies) {
                        goodies.items.push(widget);
                    }
                }
            }

            var jsonData = {
                "sakai": sakai,
                "media": media,
                "goodies": goodies
            };

            sakai.api.Util.TemplateRenderer(inserterbarDynamicWidgetListTemplate, jsonData, $inserterbarDynamicWidgetList);

            if(jsonData.goodies.items.length > 8){
                setupCarousel();
            } else {
                $("#inserterbar_more_widgets_container", $rootel).css("display", "none");
                $("#inserterbar_carousel_left", $rootel).addClass("disabled");
                $("#inserterbar_carousel_right", $rootel).addClass("disabled");
            }
            setupSortables();
            editPosition(255);
        };

        var addBinding = function(){
            $inserterbarMoreWidgets.click(showHideMoreWidgets);
            $(window).bind("edit.contentauthoring.sakai", function(){
                $("#inserterbar_view_container", $rootel).hide();
                editPosition(696);
                $("#inserterbar_default_widgets_container", $rootel).show();
            });
            $(window).bind("render.contentauthoring.sakai", function(){
                $("#inserterbar_more_widgets_container:visible", $rootel).hide();
                $("#inserterbar_tinymce_container", $rootel).hide();
                $("#inserterbar_default_widgets_container").hide();
                editPosition(255);
                $("#inserterbar_view_container", $rootel).show();
            });
        };

        $(window).bind("scroll", function(ev, ui){
            var top = $("#inserterbar_widget_container").position().top;
            var scroll = $.browser.msie ? $("html").scrollTop() : $(window).scrollTop();
            if (scroll > $("#inserterbar_widget_container").position().top){
                if (scroll >= ($("#contentauthoring_widget").height() + $("#contentauthoring_widget").position().top - ($("#inserterbar_widget").height() / 2))){
                    $(".sakaiSkin[role='listbox']").css("position", "absolute");
                    $("#inserterbar_widget").css("position", "absolute");
                } else {
                    var left = $("#inserterbar_widget").position();
                    $(".sakaiSkin[role='listbox']").css("position", "fixed");
                    $("#inserterbar_widget").css("position", "fixed");
                    $("#inserterbar_widget").css("top", "0px");
                    $("#inserterbar_widget").css("left", left + "px");
                }
            } else {
                $(".sakaiSkin[role='listbox']").css("position", "absolute");
                $("#inserterbar_widget").css("position", "absolute");
                $("#inserterbar_widget").css("top", $("#inserterbar_widget_container").position().top + "px");
            }
        });

        $(window).resize(function(){
            var left = $("#contentauthoring_widget").position().left + $("#contentauthoring_widget").width() - $("#inserterbar_widget").width() + 8;
            $("#inserterbar_widget").css("left", left + "px");
        });

        var doInit = function(){
            $inserterbarWidget.css("left", $(".s3d-page-header").position().left + $(".s3d-page-header").width() - $inserterbarWidget.width() - 12);
            addBinding();
            renderWidgets();
        };

        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("inserterbar");
});
