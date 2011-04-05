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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    sakai_global.newinbox = function(tuid, showSettings, widgetData, state) {
        var hoveringHover = false,
            $hoveredElt = false;

        var $rootel = $("#"+tuid),
            $newinbox_items = $('#newinbox_message_list .newinbox_items_inner', $rootel),
            $newinbox_hover = $("#newinbox_hover", $rootel),
            $newinbox_hover_header = $("#newinbox_hover_header", $rootel),
            $newinbox_message_list = $("#newinbox_message_list", $rootel),
            $newinbox_show_message = $("#newinbox_show_message", $rootel),
            $newinbox_select_all_messages = $("#newinbox_select_all_messages", $rootel),
            $newinbox_back_to_messages = $("#newinbox_back_to_messages", $rootel),
            $newinbox_create_new_message = $("#newinbox_create_new_message", $rootel),
            $newinbox_new_message = $("#newinbox_new_message", $rootel);

        /** Hover over the inbox list **/
        var hoverOver = function(e) {
            var $item = $(e.target);
            if (!hoveringHover) {
                $item = $item.parents('.newinbox_items_container');
                $item.find('.newinbox_items_inner').addClass('hover');
                $hoveredElt = $item.clone(false);
                $newinbox_hover_header.empty().append($hoveredElt);
                $newinbox_hover.css({
                    top: $item.offset().top,
                    left: $item.offset().left-5,
                    width: $item.width()+10
                }).show();
            }
        };

        var hoverOut = function(e) {
            var $item = $(e.target);
            if (!hoveringHover) {
                $newinbox_hover.hide();
            }
        };

        $newinbox_items.hoverIntent({
            sensitivity: 3,
            interval: 250,
            over: hoverOver,
            timeout: 0,
            out: hoverOut
        });

        $newinbox_hover.live("mouseenter", function(e) {
            hoveringHover = true;
        });

        $newinbox_hover.live("mouseleave", function(e) {
            $(".newinbox_items_inner.hover").removeClass("hover");
            hoveringHover = false;
            $newinbox_hover.hide();
        });

        /** Sending messages **/
        var sendMessageFinished = function() {
            $.bbq.removeState("newmessage");
        };

        /** History management **/

        var setInitialState = function() {
            debug.log("setInitialState");
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_new_message.hide();
            $newinbox_message_list.show();
            $newinbox_select_all_messages.show();
        };

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if (!$.isEmptyObject(changed) || first) {
                if (changed.hasOwnProperty("message") || all.hasOwnProperty("message")) {
                    $newinbox_message_list.hide();
                    $newinbox_select_all_messages.hide();
                    $newinbox_back_to_messages.show();
                    $newinbox_show_message.show();
                } else if (changed.hasOwnProperty("newmessage") || all.hasOwnProperty("newmessage")) {
                    $(window).trigger("initialize.sendmessage.sakai", [null, $newinbox_new_message, sendMessageFinished]);
                    $newinbox_message_list.hide();
                    $newinbox_new_message.show();
                }
            } else if (!$.isEmptyObject(deleted)) {
                if (deleted.hasOwnProperty("message")) {
                    $newinbox_back_to_messages.hide();
                    $newinbox_show_message.hide();
                    $newinbox_message_list.show();
                    $newinbox_select_all_messages.show();
                } else if (deleted.hasOwnProperty("newmessage")) {
                    setInitialState();
                }
            } else {
                setInitialState();
            }
        };

        $(window).bind("hashchanged.newinbox.sakai", handleHashChange);
        if (state && state.all) {
            handleHashChange(null, {}, {}, state.all, {}, true);
        }

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("newinbox");
});