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

        var POLLING_INTERVAL = 15000, // in ms
            MESSAGES_PER_PAGE = 10;

        var totalMessages = 0,
            messages = {},
            currentMessage = {},
            checkInterval = null,
            sortBy = "_created",
            sortOrder = "desc",
            currentPage = 0,
            invitations = [],
            rejections = [],
            removals = [],
            selectWhat = "all",
            listViewClass = ".newinbox-message-list-view",
            detailViewClass = ".newinbox-message-detail-view",
            newMessageViewClass = ".newinbox-new-message-view";

        var $rootel = $("#"+tuid),
            $newinbox_items = $('#newinbox_message_list .newinbox_items_inner', $rootel),
            $newinbox_message_list = $("#newinbox_message_list", $rootel),
            $newinbox_show_message = $("#newinbox_show_message", $rootel),
            $newinbox_show_message_template = $("#newinbox_show_message_template", $rootel),
            $newinbox_back_to_messages = $("#newinbox_back_to_messages", $rootel),
            $newinbox_create_new_message = $("#newinbox_create_new_message", $rootel),
            $newinbox_new_message = $("#newinbox_new_message", $rootel),
            $newinbox_new_message_sendmessage = $("#newinbox_new_message_sendmessage", $rootel),
            $newinbox_message_list_item_template = $("#newinbox_message_list_item_template", $rootel),
            $newinbox_box_title = $("#newinbox_box_title", $rootel),
            $newinbox_title_total = $("#newinbox_title_total", $rootel),
            $newinbox_delete_button = $(".newinbox_delete_button", $rootel),
            $newinbox_show_message_reply_fields = $(".newinbox_show_message_reply_fields", $rootel),
            $newinbox_pager = $("#newinbox_pager", $rootel),
            $newinbox_invitation = $(".newinbox_invitation", $rootel),
            $newinbox_select = $("#newinbox_select", $rootel),
            $newinbox_select_checkbox = $("#newinbox_select_checkbox", $rootel),
            $newinbox_select_options = $("#newinbox_select_options", $rootel),
            $newinbox_select_unread = $("#newinbox_select_unread", $rootel),
            $newinbox_select_all = $("#newinbox_select_all", $rootel),
            $newinbox_delete_selected = $("#newinbox_delete_selected", $rootel),
            $newinbox_mark_as_read = $("#newinbox_mark_as_read", $rootel),
            $newinbox_title_total_wrapper = $("#newinbox_title_total_wrapper", $rootel);


        /** Message header button handling **/

        /**
         * Hide the dropdown on document click outside of valid targets
         */
        var handleDocumentClick = function(e) {
            var noHideClickTargets = [$newinbox_select.get(0), $newinbox_select_checkbox.get(0), $newinbox_select_options.get(0)];
            var noHideClickTargetsObjects = [$newinbox_select, $newinbox_select_checkbox, $newinbox_select_options];
            if (noHideClickTargets.indexOf(e.target) === -1) {
                var doHide = true;
                $.each(noHideClickTargetsObjects, function(i,elt) {
                    if ($(e.target).parents($(elt).selector).length !== 0) {
                        doHide = false;
                        return;
                    }
                });
                if (doHide) {
                    toggleSelectDropdown(e, false);
                }
            }
        };

        $(document).unbind("click", handleDocumentClick);
        $(document).bind("click", handleDocumentClick);

        /**
         * Toggle the select specifier dropdown
         *
         * @param {Object} e The event that triggered this function
         * @param {Boolean} show (optional) if specified, will either show or hide the dropdown
         */
        var toggleSelectDropdown = function(e, show) {
            // don't toggle when the target of the click is the checkbox
            if (e === null || !$(e.target).is($newinbox_select_checkbox.selector)) {
                $newinbox_select.toggleClass("s3d-button-hover", show);
                if ($newinbox_select.is(":visible")) {
                    $newinbox_select_options.css({
                        top: $newinbox_select.offset().top + $newinbox_select.height()-2,
                        left: $newinbox_select.offset().left + 1
                    });
                }
                if (show === true) {
                    $newinbox_select_options.show();
                } else if (show === false) {
                    $newinbox_select_options.hide();
                } else {
                    $newinbox_select_options.toggle();
                }

            }
        };

        $newinbox_select.live("click", function(e) {
            toggleSelectDropdown(e);
        });

        /**
         * Toggle the 'mark as read' and 'delete selected' buttons on the message list view
         */
        var toggleGlobalButtons = function(enable) {
            if (enable) {
                $newinbox_mark_as_read.removeAttr("disabled");
                $newinbox_delete_selected.removeAttr("disabled");
            } else {
                $newinbox_mark_as_read.attr("disabled", "disabled");
                $newinbox_delete_selected.attr("disabled", "disabled");
            }
        };

        /**
         * Select or deselect all the messages in the list view, specified
         * by the selectWhat variable
         *
         * @param {Boolean} doCheck If true, select everything, else, deselect everything
         */
        var selectMessages = function(doCheck) {
            if (doCheck) {
                var selector = ".newinbox_items_container input[type='checkbox']";
                if (selectWhat === "unread") {
                    selector = ".newinbox_items_container.unread input[type='checkbox']";
                }
                if ($newinbox_message_list.find(selector).length > 0) {
                    $newinbox_message_list.find(selector).attr("checked", "checked");
                    toggleGlobalButtons(true);
                }
            } else {
                $newinbox_message_list.find("input[type='checkbox']").removeAttr("checked");
                toggleGlobalButtons(false);
            }
        };

        /**
         * Mark all selected messsages as read
         */
        $newinbox_mark_as_read.live("click", function() {
            var unreadMessages = $newinbox_message_list.find("input[type='checkbox']:checked").parents(".newinbox_items_container.unread");
            pathList = [];
            $.each(unreadMessages, function(i,elt) {
                var path = messages.results[$(elt).attr("id")].path;
                $(elt).removeClass("unread");
                pathList.push(path);
            });
            sakai.api.Communication.markMessagesAsRead(pathList);
        });

        /**
         * Delete messages selected in the current view
         */
        $newinbox_delete_selected.live("click", function() {
            var messagesToDelete = $newinbox_message_list.find("input[type='checkbox']:checked").parents(".newinbox_items_container");
            pathList = [];
            $.each(messagesToDelete, function(i,elt) {
                var path = messages.results[$(elt).attr("id")].path;
                pathList.push(path);
            });
            var hardDelete = widgetData.box === "trash" ? true : false;
            sakai.api.Communication.deleteMessages(pathList, hardDelete, function(success, data) {
                messagesToDelete.fadeOut(getMessages);
            });
        });

        $newinbox_select_unread.live("click", function(e) {
            selectWhat = "unread";
            toggleSelectDropdown(e, false);
            $newinbox_select_checkbox.attr("checked", "checked");
            selectMessages(true);
        });

        $newinbox_select_all.live("click", function(e) {
            selectWhat = "all";
            toggleSelectDropdown(e, false);
            $newinbox_select_checkbox.attr("checked", "checked");
            selectMessages(true);
        });

        $newinbox_select_checkbox.live("change", function() {
            selectMessages($newinbox_select_checkbox.is(":checked"));
        });

        $(".newinbox_items_container input[type='checkbox']").live("change", function() {
            if ($(".newinbox_items_container input[type='checkbox']:checked").length > 0) {
                toggleGlobalButtons(true);
            } else {
                toggleGlobalButtons(false);
            }
        });

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

        var determineInviteStatus = function(message) {
            message.invitation = true;
            if (invitations.indexOf(message.from.userObj.uuid) !== -1) {
                message.invited = true;
            } else if (rejections.indexOf(message.from.userObj.uuid) !== -1) {
                message.ignored = true;
            }
        };

        /** Messages **/

        var showMessage = function() {
            toggleSelectDropdown(null, false);
            $(listViewClass).hide();
            hideReply();
            var messageToShow = $.extend(true, {}, currentMessage);
            if (widgetData.category === "invitation") {
                determineInviteStatus(messageToShow);
            }
            $newinbox_box_title.text(messageToShow.subject);
            sakai.api.Util.TemplateRenderer($newinbox_show_message_template, {
                message:messageToShow,
                me: {
                    name: sakai.api.User.getDisplayName(sakai.api.User.data.me.profile),
                    picture: sakai.api.Util.constructProfilePicture(sakai.api.User.data.me)
                }
            }, $newinbox_show_message);
            if (!currentMessage.read) {
                sakai.api.Communication.markMessagesAsRead(currentMessage.path);
                $("#" + currentMessage.id, $rootel).removeClass("unread");
            }
            $(detailViewClass).show();
            showReply();
        };

        /**
         * Show the sendmessage widget all by itself in a div
         */
        var showNewMessage = function() {
            toggleSelectDropdown(null, false);
            $(listViewClass).hide();
            $(detailViewClass).hide();
            $(window).trigger("initialize.sendmessage.sakai", [null, $newinbox_new_message_sendmessage, sendMessageFinished]);
            $newinbox_box_title.text(sakai.api.i18n.Widgets.getValueForKey("newinbox", sakai.api.User.data.me.user.locale, "NEW_MESSAGE"));
            $(newMessageViewClass).show();
        };

        var deleteMessage = function(e) {
            var mid = $(e.currentTarget).parents(".newinbox_items_container").attr("id");
            var msg = messages.results[mid];
            var hardDelete = widgetData.box === "trash" ? true : false;
            sakai.api.Communication.deleteMessages(msg.path, hardDelete, function(success, data) {
                if (!success) {
                    debug.log("deleting failed");
                    // show a gritter message indicating deleting it failed
                } else {
                    getMessages();
                }
            });
            if ($newinbox_show_message.is(":visible")) {
                backToMessages();
            } else {
                $("#" + mid).fadeOut(200);
            }
        };

        $newinbox_delete_button.live("click", deleteMessage);

        var getMessages = function(callback) {
            var doFlip = widgetData.box === "outbox";
            sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, MESSAGES_PER_PAGE, currentPage, sortBy, sortOrder, function(success, data){
                var update = true;
                if (_.isEqual(messages, data)) {
                    update = false;
                }
                messages = data;
                if (data && _.isNumber(data.total)) {
                    totalMessages = data.total;
                    // only show unread counts for the inbox
                    if (widgetData.box === "inbox") {
                        sakai.api.Communication.getUnreadMessageCount(widgetData.box, function(success, unreadMsgs) {
                            $newinbox_title_total.text(unreadMsgs);
                        });
                    }
                    // only show pager if needed
                    if (totalMessages > MESSAGES_PER_PAGE) {
                        // pagenumber is 1-indexed, currentPage is 0-indexed
                        $newinbox_pager.pager({ pagenumber: currentPage+1, pagecount: Math.ceil(totalMessages/MESSAGES_PER_PAGE), buttonClickCallback: handlePageClick });
                    }
                } else {
                    $newinbox_title_total.text("0");
                }
                if ($.isFunction(callback)) {
                    callback(update);
                } else {
                    updateMessageList(update);
                }
            }, true);
        };

        /** Replies **/

        /**
         * Do some magic to make sendmessage happy
         */
        var hideReply = function() {
            $("#showmessagehidden").remove();
            $("<div/>").attr("id", "showmessagehidden").html($newinbox_show_message_reply_fields.html()).hide().appendTo('body');
            $newinbox_show_message_reply_fields.empty();
        };

        /**
         * Clear out the value in the textarea
         */
        var clearReply = function() {
            $("#comp-body").val('');
        };

        /**
         * Show the reply textarea inline
         */
        var showReply = function() {
            $newinbox_show_message_reply_fields = $($newinbox_show_message_reply_fields.selector);
            var replyButtonText = sakai.api.i18n.Widgets.getValueForKey("newinbox", sakai.api.User.data.me.user.locale, "REPLY");
            $(window).trigger("initialize.sendmessage.sakai", [currentMessage.replyAll, $newinbox_show_message_reply_fields, clearReply, "Re: " + currentMessage.subject, null, true, currentMessage.id, replyButtonText]);
            $newinbox_show_message_reply_fields.show();
        };

        /**
         * When the user has clicked the reply button on the list of messages
         * it takes them directly to the textarea in the sendmessage widget
         */
        var focusReply = function() {
            var $replyBody = $("#comp-body", $rootel);
            // Only animate if the reply box is below the window's viewable area
            if ($replyBody.offset().top > (window.innerHeight+200)) {
                $("html, body").animate({
                    scrollTop: $replyBody.offset().top
                }, 350, "swing", function() {
                    $replyBody.focus();
                });
            } else {
                $replyBody.focus();
            }
        };

        /** History management **/

        var backToMessages = function() {
            $.bbq.removeState("message", "reply");
        };

        $newinbox_back_to_messages.live("click", backToMessages);

        /**
         * Set the initial state of this box/category combo
         */
        var setInitialState = function(callback) {
            $(detailViewClass).hide();
            $(newMessageViewClass).hide();
            $newinbox_box_title.text(sakai.api.i18n.Widgets.getValueForKey("newinbox", sakai.api.User.data.me.user.locale, widgetData.title));
            $(listViewClass).show();
            if (widgetData.box !== "inbox") {
                $newinbox_title_total_wrapper.hide();
            }
            if ($.isFunction(callback)) {
                callback();
            }
        };

        /**
         * Handles threedots
         */
        var formatMessageList = function() {
            // only applyThreeDots when the container is visible, or it won't work
            if ($newinbox_message_list.is(":visible")) {
                // apply threedots to the subject and the name
                $(".newinbox_subject a, .newinbox_name a, .newinbox_name span", $rootel).each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 1}, "s3d-bold newinbox_main"));
                });
                $(".newinbox_excerpt p", $rootel).each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 2}, "newinbox_main"));
                });
            }
        };

        /**
         * Updates the list of messages in the default view of this box/category
         */
        var updateMessageList = function(update) {
            if (update !== false) {
                getContacts();
                // make the results an array so we can know if we've hit the last
                // one when we're iterating in the template
                var data = $.extend(true, {}, messages);
                data.results = _.toArray(data.results);

                sakai.api.Util.TemplateRenderer($newinbox_message_list_item_template, {
                    sakai: sakai,
                    _: _,
                    data: data
                }, $newinbox_message_list);

                formatMessageList();
            }
        };

        /**
         * Event handler function for hiding/showing this widget
         * Cleans up or sets the polling interval for new messages
         */
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
                                focusReply();
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
                } else if (!first) {
                    setInitialState();
                    getMessages(null, null, null, updateMessageList);
                } else {
                    setInitialState();
                    updateMessageList(true);
                }
            }
        };

        /**
         * Handle click on paging controls, the pager callback function
         */
        var handlePageClick = function(pageNum) {
            if (pageNum-1 !== currentPage) {
                currentPage = pageNum-1;
            }
            getMessages();
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
            $newinbox_box_title.text(sakai.api.i18n.Widgets.getValueForKey("newinbox", sakai.api.User.data.me.user.locale, widgetData.title));
            // we need to check invitation status before we render any messages
            // if we're in the invitation category
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
