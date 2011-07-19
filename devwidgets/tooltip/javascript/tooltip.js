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

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * sakai_global.tooltip
     * a multi-purpose tooltip dialog box
     */
    sakai_global.tooltip = function(tuid, showSettings) {
        var tooltipOnShow = false,
            tooltipAutoClose = null,
            tooltipArrow = null,
            tooltipTop = null,
            tooltipLeft = null;

        var $rootel = $("#" + tuid);
        var $tooltip_widget = $("#tooltip_widget", $rootel),
            $tooltip_content = $(".tooltip_content", $rootel),
            $tooltip_close = $(".tooltip_close", $rootel),
            $tooltip_dialog = $(".tooltip_dialog", $rootel),
            $tooltip_title = $("#tooltip_title", $rootel),
            $tooltip_description = $("#tooltip_description", $rootel),
            $tooltip_header_arrow = $(".dialog_tooltip_header_arrow", $rootel),
            $tooltip_left_arrow = $(".dialog_tooltip_left_arrow", $rootel),
            $tooltip_footer_arrow = $(".dialog_tooltip_footer_arrow", $rootel);

        $tooltip_widget.jqm({
            modal: false,
            overlay: 0,
            zIndex: 6000,
            toTop: true
        });

        var hideTooltip = function() {
            $tooltip_widget.jqmHide();
            $(window).trigger("closed.tooltip.sakai");
            $(window).unbind("update.tooltip.sakai");
            $(document).unbind("click.tooltip_close");
        };

        /**
         * toggleTooltip sets tooltip configuration and displays the tooltip
         */
        var toggleTooltip = function() {
            // bind auto close of tooltip on outside mouse click
            if (tooltipAutoClose) {
                $(document).unbind("click.tooltip_close").bind("click.tooltip_close", function (e) {
                    var $clicked = $(e.target);
                    // Check if one of the parents is the tooltip
                    if (!$clicked.parents().is("#tooltip") && $tooltip_widget.is(":visible")) {
                        hideTooltip();
                    }
                });
            }

            // position tooltip and display directional arrow
            var topOffset = tooltipTop - 3;
            var leftOffset = tooltipLeft - 42;
            $tooltip_header_arrow.hide();
            $tooltip_footer_arrow.hide();

            if (tooltipArrow === "bottom"){
                topOffset = "auto";
                $tooltip_footer_arrow.show();
            } else if (tooltipArrow === "top"){
                $tooltip_header_arrow.show();
            }
            $tooltip_widget.css({
                top: topOffset,
                left: leftOffset
            });
            $tooltip_content.html(tooltipHTML);
            $tooltip_widget.jqmShow();
            if (tooltipOnShow && typeof(tooltipOnShow) === "function") {
                tooltipOnShow();
            }

            // bind tooltip movement
            $(window).unbind("update.tooltip.sakai");
            $(window).bind("update.tooltip.sakai", function(e, tooltipData) {
                hideTooltip();
                $(window).trigger("init.tooltip.sakai", tooltipData);
            });
            // bind tooltip close
            $(window).unbind("done.tooltip.sakai");
            $(window).bind("done.tooltip.sakai", function() {
                hideTooltip();
            });
            $(".tooltip_close").unbind("click");
            $(".tooltip_close").bind("click", function () {
                $(window).unbind(".tooltip_close");
                hideTooltip();
                return false;
            });
        };

        $tooltip_close.bind("click", function() {
            hideTooltip();
        });

        /* Renders a tooltip.  The tooltipConfig param should contain:
         * {String} tooltipHTML  a <div> containing all the HTML you want to display in the tool tip
         * {Boolean} tooltipAutoClose  If we close the tooltip on an outside click
         * {String} tooltipArrow  Direction for where the tooltip arrow is placed ("top" or "bottom")
         * {Integer} tooltipLeft  absolute position of where the tooltip should spawn: X value (jQuery.Event.pageX)
         * {Integer} tooltipTop   absolute position of where the tooltip should spawn: Y value (jQuery.Event.pageY)
         * {Function} onShow      callback called when the tooltip is shown
         */
        $(window).unbind("init.tooltip.sakai");
        $(window).bind("init.tooltip.sakai", function(e, tooltipConfig) {
            if (tooltipConfig) {
                tooltipHTML = tooltipConfig.tooltipHTML || false;
                tooltipAutoClose = tooltipConfig.tooltipAutoClose || false;
                tooltipArrow = tooltipConfig.tooltipArrow || false;
                tooltipTop = tooltipConfig.tooltipTop || false;
                tooltipLeft = tooltipConfig.tooltipLeft || false;
                tooltipOnShow = tooltipConfig.onShow || false;
                toggleTooltip();
            } else {
                debug.error("No tooltip mode specifed");
            }
        });

        sakai_global.tooltip.isReady = true;
        $(window).trigger("ready.tooltip.sakai");
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("tooltip");
});
