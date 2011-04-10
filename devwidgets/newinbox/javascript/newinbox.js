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
require(["jquery", "sakai/sakai.api.core", "/tests/qunit/js/jquery.mockjax.js"], function($, sakai) {

    sakai_global.newinbox = function(tuid, showSettings, widgetData, state) {
        var hoveringHover = false,
            $hoveredElt = false,
            totalMessages = 0,
            messages = {},
            currentMessage = {};

        var $rootel = $("#"+tuid),
            $newinbox_items = $('#newinbox_message_list .newinbox_items_inner', $rootel),
            $newinbox_hover = $("#newinbox_hover", $rootel),
            $newinbox_hover_header = $("#newinbox_hover_header", $rootel),
            $newinbox_hover_content = $("#newinbox_hover_content", $rootel),
            $newinbox_hover_template = $("#newinbox_hover_template", $rootel),
            $newinbox_message_list = $("#newinbox_message_list", $rootel),
            $newinbox_show_message = $("#newinbox_show_message", $rootel),
            $newinbox_show_message_template = $("#newinbox_show_message_template", $rootel),
            $newinbox_back_to_messages = $("#newinbox_back_to_messages", $rootel),
            $newinbox_create_new_message = $("#newinbox_create_new_message", $rootel),
            $newinbox_new_message = $("#newinbox_new_message", $rootel),
            $newinbox_message_list_item_template = $("#newinbox_message_list_item_template", $rootel),
            $newinbox_title_total = $("#newinbox_title_total", $rootel),
            $newinbox_delete_button = $(".newinbox_delete_button", $rootel),
            $newinbox_show_message_reply_fields = $(".newinbox_show_message_reply_fields", $rootel);

        /** Hover over the inbox list **/
        var hoverOver = function(e) {
            var $item = $(e.target);
            if (!hoveringHover) {

                $item = $item.parents('.newinbox_items_container');
                if ($item.length) {
                    var messageID = $item.attr("id");
                    var message = messages.results[messageID];
                    sakai.api.Util.TemplateRenderer($newinbox_hover_template, {message:message}, $newinbox_hover);
                    $newinbox_hover.css({
                        top: $item.offset().top,
                        left: $item.offset().left-5,
                        width: $item.width()
                    }).fadeIn(80);
                }
            }
        };

        var hoverOut = function(e) {
            if (!hoveringHover) {
                $newinbox_hover.fadeOut(80);
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
            $newinbox_hover.fadeOut(80);
            $(".newinbox_items_inner.hover").removeClass("hover");
            hoveringHover = false;
        });

        /** Sending messages **/
        var sendMessageFinished = function() {
            $.bbq.removeState("newmessage");
        };

        /** History management **/

        var backToMessages = function() {
            $.bbq.removeState("message", "reply");
        };

        $newinbox_back_to_messages.live("click", backToMessages);

        var deleteMessage = function(e) {
            var mid = $(e.currentTarget).parents(".newinbox_items_container").attr("id");
            var msg = messages.results[mid];
            var hardDelete = widgetData.box === "trash" ? true : false;
            sakai.api.Communication.deleteMessages(msg.path, hardDelete, function(success, data) {
                if (!success) {
                    // show a gritter message indicating deleting it failed
                }
            });
            if ($newinbox_show_message.is(":visible")) {
                backToMessages();
            } else {
                $newinbox_hover.hide();
                $("#" + mid).fadeOut(200);
            }
        };

        $newinbox_delete_button.live("click", deleteMessage);

        var showMessage = function() {
            $newinbox_hover.hide();
            $newinbox_message_list.hide();
            doHideReply();
            $newinbox_back_to_messages.show();
            sakai.api.Util.TemplateRenderer($newinbox_show_message_template, {message:currentMessage}, $newinbox_show_message);
            if (!currentMessage.read) {
                sakai.api.Communication.markMessagesAsRead(currentMessage.path);
                $("#" + currentMessage.id, $rootel).addClass("read");
            }
            $newinbox_show_message.show();
        };

        var hideReply = function() {
            $.bbq.removeState("reply");
        };

        var doHideReply = function() {
            $("<div/>").html($newinbox_show_message_reply_fields.html()).hide().appendTo('body');
            $newinbox_show_message_reply_fields.empty().hide();
        };

        var showReply = function() {
            $newinbox_show_message_reply_fields = $($newinbox_show_message_reply_fields.selector);
            $(window).trigger("initialize.sendmessage.sakai", [currentMessage.from.userObj, $newinbox_show_message_reply_fields, hideReply, "Re: " + currentMessage.subject, null, true]);
            $newinbox_show_message_reply_fields.show();
        };

        var showNewMessage = function() {
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_hover.hide();
            $newinbox_message_list.hide();
            $(window).trigger("initialize.sendmessage.sakai", [null, $newinbox_new_message, sendMessageFinished]);
            $newinbox_new_message.show();
        };

        var setInitialState = function(callback) {
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_new_message.hide();
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
            if ($rootel.is(":visible")) {
                if (!$.isEmptyObject(changed) || (first && !$.isEmptyObject(all))) {
                    if (changed.hasOwnProperty("message") || all.hasOwnProperty("message")) {
                        var message = messages.results[changed.message || all.message];
                        currentMessage = message;
                        // this handles multiple instances of the widget
                        if (currentMessage) {
                            showMessage();
                            if (changed.hasOwnProperty("reply") || all.hasOwnProperty("reply")) {
                                showReply();
                            }
                        }
                    } else if (changed.hasOwnProperty("newmessage") || all.hasOwnProperty("newmessage")) {
                        showNewMessage();
                    }
                } else if (!$.isEmptyObject(deleted)) {
                    if (deleted.hasOwnProperty("message") || deleted.hasOwnProperty("newmessage")) {
                        setInitialState();
                        getMessages(null, null, null, updateMessageList);
                    }
                    if (deleted.hasOwnProperty("reply")) {
                        doHideReply();
                    }
                } else if (!first) {
                    setInitialState();
                    getMessages(null, null, null, updateMessageList);
                } else {
                    setInitialState();
                    updateMessageList();
                }
            }
        };

        var getMessages = function(sortBy, sortOrder, currentPage, callback) {
            sortBy = "_created";
            sortOrder = "desc";
            currentPage = 0;
            var doFlip = widgetData.box === "outbox";
            sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, 20, currentPage, sortBy, sortOrder, function(success, data){
                messages = data;
                if (data && data.total) {
                    totalMessages = data.total;
                    $newinbox_title_total.text(totalMessages).parent().show();
                } else {
                    $newinbox_title_total.text("0").parent().show();
                }
                if ($.isFunction(callback)) {
                    callback();
                }
            }, true, doFlip);
        };

        var init = function() {
            getMessages(null, null, null, function() {
                var all = state && state.all ? state.all : {};
                handleHashChange(null, {}, {}, all, {}, true);
                $(window).bind("hashchanged.newinbox.sakai", handleHashChange);
            });
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("newinbox");
});
