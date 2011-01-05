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

/*global $ */

var sakai = sakai || {};

/**
 * sakai.help
 * a multi-purpose help dialog box
 */
sakai.tooltip = function(tuid, showSettings) {
    var profileFlag = null,
        whichHelp = null,
        profileData = null,
        forced = false,
        alreadySet = false,
        tooltip = false,
        tooltipSelector = false,
        tooltipTitle = null,
        tooltipDescription = null,
        tooltipArrow = null,
        tooltipTop = null,
        tooltipLeft = null,
        authprofileURL = "/~" +
                        sakai.data.me.user.userid +
                        "/public/authprofile";
    
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
        toTop: true
    });

    var hideTooltip = function() {
        $tooltip_widget.jqmHide();
        $(window).trigger("sakai-tooltip-close");
        if (tooltip) {
            $(window).unbind("sakai-tooltip-update");
        }
    };

    /**
     * toggleTooltip sets tooltip configuration and displays the tooltip
     */
    var toggleTooltip = function() {
        $tooltip_title.html(sakai.api.i18n.General.getValueForKey(tooltipTitle));
        $tooltip_description.html(sakai.api.i18n.General.getValueForKey(tooltipDescription));
        //$tooltip_widget.addClass("tooltip_dialog");
        // position tooltip and display directional arrow
        var topOffset = 20;
        var leftOffset = 430;
        if (tooltipTop){
            topOffset = topOffset + tooltipTop;
        }
        if (tooltipLeft){
            leftOffset = leftOffset + tooltipLeft;
        }
        $tooltip_header_arrow.hide();
        $tooltip_footer_arrow.hide();
        $tooltip_widget.jqmShow();
        
        // hide 2 backgrounds, show main bg
        
        if (tooltipArrow === "bottom"){
            topOffset = ($(".tooltip_dialog").height() + topOffset) * -1;
            $tooltip_footer_arrow.show();
        } else if (tooltipArrow === "top"){
            $tooltip_header_arrow.show();
        }
        //else if left/right
        
        if (tooltipSelector) {
            var eleOffset = $(tooltipSelector).offset();
            $tooltip_widget.css("top", topOffset + eleOffset.top);
            $tooltip_widget.css("left", leftOffset + eleOffset.left);
        }
        // bind tooltip movement
        $(window).bind("sakai-tooltip-update", function(e, tooltipData) {
            hideTooltip();
            $(window).trigger("sakai-tooltip-init", tooltipData);
        });
        // bind tooltip close
        $(window).bind("sakai-tooltip-close", function() {
            $(window).unbind("sakai-tooltip-close");
            hideTooltip();
        });
    };

    $tooltip_close.bind("click", function() {
        hideTooltip();
    });

    /* helpObj should contain
     * {String} whichHelp Which version of help to display
     * {String} profileFlag Flag on the current user's authprofile that
     *          determines if we should show the help or not
     * {Boolean} force If we can ignore the profile flag
     */
    $(window).bind("sakai-tooltip-init", function(e, helpObj) {
        if (helpObj) {
            tooltipSelector = helpObj.tooltipSelector || false;
            tooltipTitle = helpObj.tooltipTitle || false;
            tooltipDescription = helpObj.tooltipDescription || false;
            tooltipArrow = helpObj.tooltipArrow || false;
            tooltipTop = helpObj.tooltipTop || false;
            tooltipLeft = helpObj.tooltipLeft || false;
            toggleTooltip();
        } else {
            debug.error("No tooltip mode specifed");
        }
    });

    sakai.tooltip.isReady = true;
    $(window).trigger("sakai-tooltip-ready");
};

sakai.api.Widgets.widgetLoader.informOnLoad("tooltip");