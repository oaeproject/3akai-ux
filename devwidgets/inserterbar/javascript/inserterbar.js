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
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.inserterbar
     *
     * @class inserterbar
     *
     * @description
     * The inserter bar enables users to drag and drop widgets/labels/paragraphs,...
     * on the content authoring pages.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.inserterbar = function (tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);

        // Containers
        var $contentauthoringWidget = $('#contentauthoring_widget');
        var $inserterbarWidget = $('#inserterbar_widget', $rootel);
        var $inserterbarMoreWidgets = $('#inserterbar_more_widgets', $rootel);
        var $inserterbarWidgetContainer = $('#inserterbar_widget_container', $rootel);
        
        // Elements
        var $inserterbarCarouselLeft = $('#inserterbar_carousel_left', $rootel);
        var $inserterbarCarouselRight = $('#inserterbar_carousel_right', $rootel);
        var $inserterbarMoreWidgetsContainer = $('#inserterbar_more_widgets_container', $rootel);


        ///////////////////////
        // Utility Functions //
        ///////////////////////

        /**
         * Shows/Hides more widgets that can be inserted into the page
         */
        var showHideMoreWidgets = function() {
            $(this).children('span').toggle();
            $('#inserterbar_more_widgets_container', $rootel).toggle();
            resetPosition();
        };

        /**
         * Renders more widgets that can be inserted into the page
         */
        var renderWidgets = function() {
            // Render the list of exposed widgets
            sakai.api.Util.TemplateRenderer('inserterbar_widget_container_exposed_template', {
                'sakai': sakai, 
                'widgets': sakai.config.exposedSakaiDocWidgets
            }, $('#inserterbar_widget_container_exposed', $rootel));
            // Bind the hover
            $('#inserterbar_widget_container_exposed .inserterbar_widget_exposed', $rootel).hover(function() {
                    var $container = $(this);
                    if ($('.inserterbar_standard_icon_hover', $container).length) {
                        $('.inserterbar_standard_icon_out', $container).hide();
                        $('.inserterbar_standard_icon_hover', $container).show();
                    }
                }, function() {
                    var $container = $(this);
                    $('.inserterbar_standard_icon_out', $container).show();
                    $('.inserterbar_standard_icon_hover', $container).hide();
                }
            );

            // Render the more widgets list
            var moreWidgets = [];
            $.each(sakai.widgets, function(widgetid, widget) {
                if (widget.sakaidocs && $.inArray(widgetid, sakai.config.exposedSakaiDocWidgets) === -1) {
                    moreWidgets.push(widget);
                }
            });
            sakai.api.Util.TemplateRenderer('inserterbar_dynamic_widget_list_template', {
                'sakai': sakai,
                'widgets': moreWidgets
            }, $('#inserterbar_dynamic_widget_list', $rootel));

            if (moreWidgets.length > 4) {
                setupCarousel();
            } else {
                $inserterbarMoreWidgetsContainer.hide();
                $('#inserterbar_carousel_left', $rootel).hide();
                $('#inserterbar_carousel_right', $rootel).hide();
            }
            $inserterbarWidgetContainer.removeClass('fl-hidden');

            setupSortables();
            resetPosition();
        };


        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Sets the widgets up as sortables so they can be dragged into the page
         */
        var setupSortables = function() {
            $('#inserterbar_widget .inserterbar_widget_draggable', $rootel).draggable({
                connectToSortable: '.contentauthoring_cell_content',
                helper: 'clone',
                revert: 'invalid',
                opacity: 0.4,
                start: function() {
                    $(window).trigger('startdrag.contentauthoring.sakai');
                    sakai.api.Util.Draggable.setIFrameFix();
                },
                stop: function() {
                    $(window).trigger('stopdrag.contentauthoring.sakai');
                    sakai.api.Util.Draggable.removeIFrameFix();
                }
            });
        };

        /**
         * Adds binding to the carousel that contains more widgets
         * @param {Object} carousel Carousel object (jcarousel)
         */
        var carouselBinding = function(carousel) {
            $inserterbarCarouselLeft.live('click',function() {
                carousel.prev();
            });
            $inserterbarCarouselRight.live('click',function() {
                carousel.next();
            });
            var carouselListWidth = parseInt(carousel.list.css('width'), 10);
            carousel.list.css('width' , carouselListWidth * carousel.options.size);
        };

        /**
         * Sets up the carousel that contains more widgets
         */
        var setupCarousel = function() {
            $('#inserterbar_more_widgets_container .s3d-outer-shadow-container', $rootel).jcarousel({
                animation: 'slow',
                easing: 'swing',
                scroll: 4,
                itemFirstInCallback: carouselBinding,
                itemFallbackDimension: 4,
                visible: 4
            });

            $inserterbarMoreWidgetsContainer.hide();
        };

        /**
         * Position the inserterBar correctly
         */
        var positionInserterBar = function() {
            if ($inserterbarWidgetContainer.is(":visible")) {
                var top = $inserterbarWidgetContainer.position().top;
                var scroll = $.browser.msie ? $('html').scrollTop() : $(window).scrollTop();
                if (scroll > top) {
                    if (scroll >= ($contentauthoringWidget.height() + top - ($inserterbarWidget.height() / 2))) {
                        $('.sakaiSkin[role="listbox"]').css('position', 'absolute');
                        $inserterbarWidget.css('position', 'absolute');
                    } else {
                        $('.sakaiSkin[role="listbox"]').css('position', 'fixed');
                        $inserterbarWidget.css({
                            'position': 'fixed',
                            'top': '0px'
                        });
                    }
                } else {
                    $('.sakaiSkin[role="listbox"]').css('position', 'absolute');
                    $inserterbarWidget.css({
                        'position': 'absolute',
                        'top': top + 'px'
                    });
                }
            }
        };

        /**
         * Re-position the bar based on its current width
         */
        var resetPosition = function() {
            var right = $(window).width() - ($contentauthoringWidget.position().left + $contentauthoringWidget.width()) - 15;
            $inserterbarWidget.css('right', right + 'px');
            positionInserterBar();
        };

        /**
         * Hide all of the panes in the inserterbar. This will be executed
         * before the right panel is shown.
         */
        var hideAllModes = function() {
            $('#inserterbar_view_container', $rootel).hide();
            $('#inserterbar_default_widgets_container', $rootel).hide();
            $('#inserterbar_tinymce_container', $rootel).hide();
            $('#inserterbar_revision_history_container', $rootel).hide();
            $('#inserterbar_more_widgets_container', $rootel).hide();
        };

        /**
         * Put the inserter bar into page edit mode
         */
        var setInserterForEditMode = function() {
            hideAllModes();
            $('#inserterbar_default_widgets_container', $rootel).show();
            resetPosition();
        };

        /**
         * Put the inserter bar into view mode
         */
        var setInserterForViewMode = function() {
            hideAllModes();
            $('#inserterbar_view_container', $rootel).show();
            resetPosition();
        };

        /**
         * Put the inserter bar into revision history mode
         */
        var setInserterForRevisionHistoryMode = function() {
            hideAllModes();
            $('#inserterbar_revision_history_container', $rootel).show();
            resetPosition();
        };

        /**
         * Adds bindings to the widget elements
         */
        var addBinding = function() {
            $inserterbarMoreWidgets.on('click', showHideMoreWidgets);
            // Hide the tinyMCE toolbar when we click outside of a tinyMCE area
            sakai.api.Util.hideOnClickOut($('#inserterbar_tinymce_container'), ".mceMenu, .mce_forecolor");

            $('#inserterbar_action_close_revision_history').on('click', function(e) {
                $(window).trigger("close.versions.sakai");
                setInserterForViewMode();
                e.preventDefault();
            });

            $('#inserterbar_action_revision_history').on('click', setInserterForRevisionHistoryMode);
            $(window).bind('edit.contentauthoring.sakai', setInserterForEditMode);
            $(window).bind('render.contentauthoring.sakai', setInserterForViewMode);

            $(window).on('scroll', positionInserterBar);
            $(window).on('position.inserter.sakai', positionInserterBar);
            $(window).resize(resetPosition);
        };

        /**
         * Initializes the widget
         */
        var doInit = function() {
            var top = 130;
            if (sakai.config.enableBranding) {
                top = top + $('.branding_widget').height();
            }
            $inserterbarWidget.css({
                'right': $(window).width() - ($contentauthoringWidget.position().left + $contentauthoringWidget.width()) - 15,
                'top': top
            });
            addBinding();
            renderWidgets();

            if ($rootel.parents('.contentauthoring_edit_mode').length) {
                setInserterForEditMode();
            }
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('inserterbar');
});
