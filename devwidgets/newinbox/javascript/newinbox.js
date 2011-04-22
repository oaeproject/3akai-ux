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

        var POLLING_INTERVAL = 15000, // in ms
            MESSAGES_PER_PAGE = 20;

        var totalMessages = 0,
            messages = {},
            currentMessage = {},
            checkInterval = null,
            sortBy = "_created",
            sortOrder = "desc",
            currentPage = 0,
            invitations = [],
            rejections = [],
            removals = [];

        var $rootel = $("#"+tuid),
            $newinbox_items = $('#newinbox_message_list .newinbox_items_inner', $rootel),
            $newinbox_message_list = $("#newinbox_message_list", $rootel),
            $newinbox_show_message = $("#newinbox_show_message", $rootel),
            $newinbox_show_message_template = $("#newinbox_show_message_template", $rootel),
            $newinbox_back_to_messages = $("#newinbox_back_to_messages", $rootel),
            $newinbox_create_new_message = $("#newinbox_create_new_message", $rootel),
            $newinbox_new_message = $("#newinbox_new_message", $rootel),
            $newinbox_message_list_item_template = $("#newinbox_message_list_item_template", $rootel),
            $newinbox_title_total = $("#newinbox_title_total", $rootel),
            $newinbox_delete_button = $(".newinbox_delete_button", $rootel),
            $newinbox_show_message_reply_fields = $(".newinbox_show_message_reply_fields", $rootel),
            $newinbox_pager = $("#newinbox_pager", $rootel),
            $newinbox_invitation = $(".newinbox_invitation", $rootel);


        /** Sending messages **/
        var sendMessageFinished = function() {
            $.bbq.removeState("newmessage");
        };

        /** Contact invitations **/

        var getContacts = function(callback) {
            // reset the arrays
            sakai.api.User.getContacts(function() {
                invitations = []; rejections = []; removals = [];
                // move this to an APi function
                $.each(sakai.api.User.data.me.mycontacts, function(i, contact) {
                    var state = contact.details["sakai:state"];
                    if (state === "INVITED") {
                        invitations.push(contact.target);
                    } else if (state === "IGNORED") {
                        rejections.push(contact.target);
                    } else if (state === "NONE") {
                        removals.push(contact.target);
                    }
                });
                if ($.isFunction(callback)) {
                    callback();
                }
            });
        };

        var handleContactInvitation = function(e) {
            if ($(e.target).hasClass("newinbox_invitation_accept")) {
                sakai.api.User.acceptContactInvite(currentMessage.from.userObj.uuid, function() {
                    getContacts(showMessage);
                });
            } else {
                sakai.api.User.ignoreContactInvite(currentMessage.from.userObj.uuid, function() {
                    getContacts(showMessage);
                });
            }
        };

        $newinbox_invitation.live("click", handleContactInvitation);

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
                    debug.log("deleting failed");
                    // show a gritter message indicating deleting it failed
                }
            });
            if ($newinbox_show_message.is(":visible")) {
                backToMessages();
            } else {
                $("#" + mid).fadeOut(200);
            }
        };

        $newinbox_delete_button.live("click", deleteMessage);

        var determineInviteStatus = function(message) {
            if (invitations.indexOf(message.from.userObj.uuid) !== -1) {
                message.invited = true;
            } else if (rejections.indexOf(message.from.userObj.uuid) !== -1) {
                message.ignored = true;
            }
        };

        var showMessage = function() {
            $newinbox_message_list.hide();
            doHideReply();
            $newinbox_back_to_messages.show();
            var messageToShow = $.extend(true, {}, currentMessage);
            if (widgetData.category === "invitation") {
                determineInviteStatus(messageToShow);
            }
            sakai.api.Util.TemplateRenderer($newinbox_show_message_template, {message:messageToShow}, $newinbox_show_message);
            if (!currentMessage.read) {
                sakai.api.Communication.markMessagesAsRead(currentMessage.path);
                $("#" + currentMessage.id, $rootel).removeClass("unread");
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
            $(window).trigger("initialize.sendmessage.sakai", [currentMessage.from.userObj, $newinbox_show_message_reply_fields, hideReply, "Re: " + currentMessage.subject, null, true, currentMessage.id]);
            $newinbox_show_message_reply_fields.show();
        };

        var showNewMessage = function() {
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_message_list.hide();
            $newinbox_create_new_message.hide();
            $(window).trigger("initialize.sendmessage.sakai", [null, $newinbox_new_message, sendMessageFinished]);
            $newinbox_new_message.show();            
        };

        var setInitialState = function(callback) {
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_new_message.hide();
            $newinbox_message_list.show();
            $newinbox_create_new_message.show();
            if ($.isFunction(callback)) {
                callback();
            }
        };

        var formatMessageList = function() {
            // only applyThreeDots when the container is visible, or it won't work
            if ($newinbox_message_list.is(":visible")) {
                // apply threedots to the subject and the name
                $(".newinbox_subject a, .newinbox_name a").each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 1}, "s3d-bold"));
                });
                $(".newinbox_excerpt p").each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 2}, "s3d-bold"));
                });
            }
        };

        var updateMessageList = function(update) {
            if (update !== false) {
                getContacts();
                // make the results an array so we can know if we've hit the last
                // one when we're iterating in the template
                var data = $.extend(true, {}, messages);
                data.results = _.toArray(data.results);

                sakai.api.Util.TemplateRenderer($newinbox_message_list_item_template, {
                    sakai: sakai,
                    data: data
                }, $newinbox_message_list);

                formatMessageList();
            }
        };

        var handleShown = function(e, showing) {
            if (showing) {
                checkInterval = setInterval(getMessages, POLLING_INTERVAL);
            } else {
                clearInterval(checkInterval);
            }
        };

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if ($rootel.is(":visible")) {
                if (first) {
                    updateMessageList(true);
                }
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
                        setInitialState(formatMessageList);
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
                    updateMessageList(true);
                }
            }
        };

        var handlePageClick = function(pageNum) {
            if (pageNum-1 !== currentPage) {
                currentPage = pageNum-1;
            }
            getMessages();
        };

        var getMessages = function(callback) {
            var doFlip = widgetData.box === "outbox";
            sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, MESSAGES_PER_PAGE, currentPage, sortBy, sortOrder, function(success, data){
                var update = true;
                if (_.isEqual(messages, data)) {
                    update = false;
                }
                messages = data;
                if (data && data.total) {
                    totalMessages = data.total;
                    $newinbox_title_total.text(totalMessages).parent().show();
                    // only show pager if needed
                    if (totalMessages > MESSAGES_PER_PAGE) {
                        // pagenumber is 1-indexed, currentPage is 0-indexed
                        $newinbox_pager.pager({ pagenumber: currentPage+1, pagecount: Math.ceil(totalMessages/MESSAGES_PER_PAGE), buttonClickCallback: handlePageClick });
                    }
                } else {
                    $newinbox_title_total.text("0").parent().show();
                }
                if ($.isFunction(callback)) {
                    callback(update);
                } else {
                    updateMessageList(update);
                }
            }, true, doFlip);
        };

        var postInit = function() {
            getMessages(function() {
                var all = state && state.all ? state.all : {};
                handleHashChange(null, {}, {}, all, {}, true);
                $(window).bind("hashchanged.newinbox.sakai", handleHashChange);
            });
            checkInterval = setInterval(getMessages, POLLING_INTERVAL);
            $(window).bind(tuid + ".shown.sakai", handleShown);
        };

        var init = function() {
            if (widgetData.category === "invitation") {
                getContacts(postInit);
            } else {
                postInit();
            }
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("newinbox");
});
