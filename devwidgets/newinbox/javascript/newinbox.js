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
            $hoveredElt = false,
            messages = {};

        var $rootel = $("#"+tuid),
            $newinbox_items = $('#newinbox_message_list .newinbox_items_inner', $rootel),
            $newinbox_hover = $("#newinbox_hover", $rootel),
            $newinbox_hover_header = $("#newinbox_hover_header", $rootel),
            $newinbox_hover_content = $("#newinbox_hover_content", $rootel),
            $newinbox_hover_template = $("#newinbox_hover_template", $rootel),
            $newinbox_message_list = $("#newinbox_message_list", $rootel),
            $newinbox_show_message = $("#newinbox_show_message", $rootel),
            $newinbox_show_message_template = $("#newinbox_show_message_template", $rootel),
            $newinbox_select_all_messages = $("#newinbox_select_all_messages", $rootel),
            $newinbox_back_to_messages = $("#newinbox_back_to_messages", $rootel),
            $newinbox_create_new_message = $("#newinbox_create_new_message", $rootel),
            $newinbox_new_message = $("#newinbox_new_message", $rootel),
            $newinbox_message_list_item_template = $("#newinbox_message_list_item_template", $rootel); 

        /** Hover over the inbox list **/
        var hoverOver = function(e) {
            var $item = $(e.target);
            if (!hoveringHover) {
                $item = $item.parents('.newinbox_items_container');
                var messageID = $item.attr("id");
                var message = messages.results[messageID];
                sakai.api.Util.TemplateRenderer($newinbox_hover_template, {message:message}, $newinbox_hover);
                $newinbox_hover.css({
                    top: $item.offset().top,
                    left: $item.offset().left-5,
                    width: $item.width()
                }).show();
            }
        };

        var hoverOut = function(e) {
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
            $newinbox_hover.hide();
            $(".newinbox_items_inner.hover").removeClass("hover");
            hoveringHover = false;
        });

        /** Sending messages **/
        var sendMessageFinished = function() {
            $.bbq.removeState("newmessage");
        };

        /** History management **/

        var backToMessages = function() {
            $.bbq.removeState("message");
        };

        $newinbox_back_to_messages.live("click", backToMessages);

        var showMessage = function(messageid) {
            $newinbox_hover.hide();
            $newinbox_message_list.hide();
            $newinbox_select_all_messages.hide();
            $newinbox_back_to_messages.show();
            sakai.api.Util.TemplateRenderer($newinbox_show_message_template, {message:messageid}, $newinbox_show_message);
            $newinbox_show_message.show();
        };

        var setInitialState = function(callback) {
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_new_message.hide();
            $newinbox_select_all_messages.show();
            $newinbox_message_list.show();
            if ($.isFunction(callback)) {
                callback();
            }
        };

        var updateMessageList = function() {
            sakai.api.Util.TemplateRenderer($newinbox_message_list_item_template, {
                sakai: sakai,
                data: messages
            }, $newinbox_message_list);
        };

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if (!$.isEmptyObject(changed) || (first && !$.isEmptyObject(all))) {
                if (changed.hasOwnProperty("message") || all.hasOwnProperty("message")) {
                    var message = messages.results[changed.message || all.message];
                    showMessage(message);
                } else if (changed.hasOwnProperty("newmessage") || all.hasOwnProperty("newmessage")) {
                    $newinbox_hover.hide();
                    $(window).trigger("initialize.sendmessage.sakai", [null, $newinbox_new_message, sendMessageFinished]);
                    $newinbox_message_list.hide();
                    $newinbox_new_message.show();
                }
            } else if (!$.isEmptyObject(deleted)) {
                if (deleted.hasOwnProperty("message") || deleted.hasOwnProperty("newmessage")) {
                    setInitialState();
                    getMessages(null, null, null, updateMessageList);
                }
            } else if (!first) {
                setInitialState();
                getMessages(null, null, null, updateMessageList);
            } else {
                setInitialState();
                updateMessageList();
            }
        };

        var getMessages = function(sortBy, sortOrder, currentPage, callback) {
            sortBy = "sakai:created";
            sortOrder = "desc";
            currentPage = 0;
            sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, 20, currentPage, sortBy, sortOrder, function(success, data){
                messages = data;
                if ($.isFunction(callback)) {
                    callback();
                }
            });
        };

        var init = function() {
            $(window).bind("hashchanged.newinbox.sakai", handleHashChange);
            getMessages(null, null, null, function() {
                var all = state && state.all ? state.all : {};
                handleHashChange(null, {}, {}, all, {}, true);
            });
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("newinbox");
});