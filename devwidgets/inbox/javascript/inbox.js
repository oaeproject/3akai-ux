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

    sakai_global.inbox = function(tuid, showSettings, widgetData, state) {

        var POLLING_INTERVAL = 15000, // in ms
            MESSAGES_PER_PAGE = 10;

        var totalMessages = 0,
            messages = {},
            currentMessage = {},
            checkInterval = null,
            sortBy = "_created",
            sortOrder = "desc",
            currentPage = 0,
            numJustDeleted = 0,
            searchTerm = null,
            selectWhat = "all",
            listViewClass = ".inbox-message-list-view",
            detailViewClass = ".inbox-message-detail-view",
            newMessageViewClass = ".inbox-new-message-view";

        var $rootel = $("#"+tuid),
            $inbox_items = $('#inbox_message_list .inbox_items_inner', $rootel),
            $inbox_message_list = $("#inbox_message_list", $rootel),
            $inbox_show_message = $("#inbox_show_message", $rootel),
            $inbox_show_message_template = $("#inbox_show_message_template", $rootel),
            $inbox_back_to_messages = $("#inbox_back_to_messages", $rootel),
            $inbox_create_new_message = $("#inbox_create_new_message", $rootel),
            $inbox_new_message = $("#inbox_new_message", $rootel),
            $inbox_new_message_sendmessage = $("#inbox_new_message_sendmessage", $rootel),
            $inbox_message_list_item_template = $("#inbox_message_list_item_template", $rootel),
            $inbox_box_title = $("#inbox_box_title", $rootel),
            $inbox_title_total = $("#inbox_title_total", $rootel),
            $inbox_delete_button = $(".inbox_delete_button", $rootel),
            $inbox_show_message_reply_fields = $(".inbox_show_message_reply_fields", $rootel),
            $inbox_pager = $("#inbox_pager", $rootel),
            $inbox_invitation = $(".inbox_invitation", $rootel),
            $inbox_select = $("#inbox_select", $rootel),
            $inbox_select_checkbox = $("#inbox_select_checkbox", $rootel),
            $inbox_select_options = $("#inbox_select_options", $rootel),
            $inbox_select_unread = $("#inbox_select_unread", $rootel),
            $inbox_select_all = $("#inbox_select_all", $rootel),
            $inbox_delete_selected = $("#inbox_delete_selected", $rootel),
            $inbox_mark_as_read = $("#inbox_mark_as_read", $rootel),
            $inbox_title_total_wrapper = $(".inbox_title_total_wrapper", $rootel),
            $inbox_item = $(".inbox_item", $rootel),
            $inbox_search_messages = $("#inbox_search_messages", $rootel),
            $inbox_search_term = $("#inbox_search_term", $rootel);


        /** Message header button handling **/

        /**
         * Hide the dropdown on document click outside of valid targets
         */
        var handleDocumentClick = function(e) {
            var noHideClickTargets = [$inbox_select.get(0), $inbox_select_checkbox.get(0), $inbox_select_options.get(0)];
            var noHideClickTargetsObjects = [$inbox_select, $inbox_select_checkbox, $inbox_select_options];
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
            if (e === null || !$(e.target).is($inbox_select_checkbox.selector)) {
                $inbox_select.toggleClass("s3d-button-hover", show);
                if ($inbox_select.is(":visible")) {
                    $inbox_select_options.css({
                        top: $inbox_select.offset().top + $inbox_select.height()-2,
                        left: $inbox_select.offset().left + 1
                    });
                }
                if (show === true) {
                    $inbox_select_options.show();
                } else if (show === false) {
                    $inbox_select_options.hide();
                } else {
                    $inbox_select_options.toggle();
                }

            }
        };

        $inbox_select.live("click", function(e) {
            toggleSelectDropdown(e);
        });

        /**
         * Toggle the 'mark as read' and 'delete selected' buttons on the message list view
         */
        var toggleGlobalButtons = function(enable) {
            if (enable) {
                $inbox_mark_as_read.removeAttr("disabled");
                $inbox_delete_selected.removeAttr("disabled");
            } else {
                $inbox_mark_as_read.attr("disabled", "disabled");
                $inbox_delete_selected.attr("disabled", "disabled");
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
                var selector = ".inbox_items_container input[type='checkbox']";
                if (selectWhat === "unread") {
                    selector = ".inbox_items_container.unread input[type='checkbox']";
                }
                if ($inbox_message_list.find(selector).length > 0) {
                    $inbox_message_list.find(selector).attr("checked", "checked");
                    toggleGlobalButtons(true);
                }
            } else {
                $inbox_message_list.find("input[type='checkbox']").removeAttr("checked");
                toggleGlobalButtons(false);
            }
        };

        /**
         * Mark all selected messsages as read
         */
        $inbox_mark_as_read.live("click", function() {
            var unreadMessages = $inbox_message_list.find("input[type='checkbox']:checked").parents(".inbox_items_container.unread");
            readList = [];
            $.each(unreadMessages, function(i,elt) {
                var message = messages.results[$(elt).attr("id")];
                $(elt).removeClass("unread");
                readList.push(message);
            });
            sakai.api.Communication.markMessagesAsRead(readList);
        });

        /**
         * Delete messages selected in the current view
         */
        $inbox_delete_selected.live("click", function() {
            var messagesToDelete = $inbox_message_list.find("input[type='checkbox']:checked").parents(".inbox_items_container");
            pathList = [];
            $.each(messagesToDelete, function(i,elt) {
                var path = messages.results[$(elt).attr("id")].path;
                pathList.push(path);
            });
            var hardDelete = widgetData.box === "trash" ? true : false;
            sakai.api.Communication.deleteMessages(pathList, hardDelete, function(success, data) {
                numJustDeleted = pathList.length;
                messagesToDelete.fadeOut(getMessages);
            });
        });

        $inbox_select_unread.live("click", function(e) {
            selectWhat = "unread";
            toggleSelectDropdown(e, false);
            $inbox_select_checkbox.attr("checked", "checked");
            selectMessages(true);
        });

        $inbox_select_all.live("click", function(e) {
            selectWhat = "all";
            toggleSelectDropdown(e, false);
            $inbox_select_checkbox.attr("checked", "checked");
            selectMessages(true);
        });

        $inbox_select_checkbox.live("change", function() {
            selectMessages($inbox_select_checkbox.is(":checked"));
        });

        $(".inbox_items_container input[type='checkbox']").live("change", function() {
            if ($(".inbox_items_container input[type='checkbox']:checked").length > 0) {
                toggleGlobalButtons(true);
            } else {
                toggleGlobalButtons(false);
            }
        });

        /** Sending messages **/
        var sendMessageFinished = function() {
            $.bbq.removeState("newmessage");
        };

        var handleContactInvitation = function(e) {
            $(".inbox_invitation", $rootel).hide();
            if ($(e.target).hasClass("inbox_invitation_accept")) {
                $(".inbox_accepted", $rootel).show();
                sakai.api.User.acceptContactInvite(currentMessage.from.userObj.uuid, function() {
                    currentMessage.from.connectionState = "ACCEPTED";
                });
            } else {
                $(".inbox_ignored", $rootel).show();
                sakai.api.User.ignoreContactInvite(currentMessage.from.userObj.uuid, function() {
                    currentMessage.from.connectionState = "IGNORED";
                });
            }
        };

        $inbox_invitation.live("click", handleContactInvitation);

        var determineInviteStatus = function(message) {
            message.invitation = true;
            if (message.from.connectionState && message.from.connectionState === "INVITED") {
                message.invited = true;
            } else if (message.from.connectionState && message.from.connectionState === "IGNORED") {
                message.ignored = true;
            }
        };

        /** Messages **/

        var showMessage = function() {
            var cacheAutoSuggestData = $("#sendmessage_to_autoSuggest").data();
            toggleSelectDropdown(null, false);
            $(listViewClass).hide();
            hideReply();
            var messageToShow = $.extend(true, {}, currentMessage);
            if (widgetData.category === "invitation") {
                determineInviteStatus(messageToShow);
            }
            $inbox_box_title.text(messageToShow.subject);
            sakai.api.Util.TemplateRenderer($inbox_show_message_template, {
                message:messageToShow,
                me: {
                    name: sakai.api.User.getDisplayName(sakai.api.User.data.me.profile),
                    picture: sakai.api.Util.constructProfilePicture(sakai.api.User.data.me)
                }
            }, $inbox_show_message);
            $("#sendmessage_to_autoSuggest").data(cacheAutoSuggestData);
            if (!currentMessage.read) {
                sakai.api.Communication.markMessagesAsRead(currentMessage);
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
            $(window).trigger("initialize.sendmessage.sakai", [null, $inbox_new_message_sendmessage, sendMessageFinished]);
            $inbox_box_title.text(sakai.api.i18n.Widgets.getValueForKey("inbox", sakai.api.User.data.me.user.locale, "NEW_MESSAGE"));
            $(newMessageViewClass).show();
        };

        var deleteMessage = function(e) {
            var mid = $(e.currentTarget).parents(".inbox_items_container").attr("id");
            var msg = messages.results[mid];
            var hardDelete = widgetData.box === "trash" ? true : false;
            sakai.api.Communication.deleteMessages(msg.path, hardDelete, function(success, data) {
                if (!success) {
                    debug.error("deleting failed");
                    // show a gritter message indicating deleting it failed
                } else {
                    getMessages();
                }
            });
            if ($inbox_show_message.is(":visible")) {
                $.bbq.removeState("message", "reply");
            } else {
                $("#" + mid).fadeOut(200);
            }
        };

        $inbox_delete_button.live("click", deleteMessage);

        var getMessages = function(callback) {
            var doFlip = widgetData.box === "outbox";
            if (numJustDeleted) {
                var currentPaging = totalMessages & MESSAGES_PER_PAGE,
                    newPaging = (totalMessages - numJustDeleted) % MESSAGES_PER_PAGE;
                // newPaging === 0 means we need a new page, as nothing will show on this one
                // newPaging > currentPaging means that there are more on the new page than before, so
                //    we should show the previous page (should rarely, if ever, happen)
                if (newPaging === 0 || newPaging > currentPaging) {
                    currentPage--;
                }
                // if we can destroy the pager now, lets do it
                if (currentPage === 0 && totalMessages - numJustDeleted <= MESSAGES_PER_PAGE) {
                    $inbox_pager.empty();
                }
                numJustDeleted = 0;
            }
            sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, searchTerm, MESSAGES_PER_PAGE, currentPage, sortBy, sortOrder, function(success, data){
                var update = true;
                if (!searchTerm) {
                    $inbox_search_term = $($inbox_search_term.selector);
                    $inbox_search_term.remove();
                }
                if (_.isEqual(messages, data) && !searchTerm) {
                    update = false;
                }
                messages = data;
                if (data && _.isNumber(data.total) && data.total !== 0) {
                    $inbox_search_messages.removeAttr("disabled");
                    totalMessages = data.total;
                    // only show unread counts for the inbox
                    if (widgetData.box === "inbox") {
                        sakai.api.Communication.getUnreadMessageCount(widgetData.box, function(success, unreadMsgs) {
                            $inbox_title_total.text(unreadMsgs);
                        }, widgetData.category);
                    }
                    // only show pager if needed
                    if (totalMessages > MESSAGES_PER_PAGE) {
                        // pagenumber is 1-indexed, currentPage is 0-indexed
                        $inbox_pager.pager({ pagenumber: currentPage+1, pagecount: Math.ceil(totalMessages/MESSAGES_PER_PAGE), buttonClickCallback: handlePageClick });
                    }
                } else {
                    if (!searchTerm) {
                        $inbox_search_messages.attr("disabled", "disabled");
                    }
                    $inbox_title_total.text("0");
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
            $("<div/>").attr("id", "showmessagehidden").html($inbox_show_message_reply_fields.html()).hide().appendTo('body');
            $inbox_show_message_reply_fields.empty();
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
            $inbox_show_message_reply_fields = $($inbox_show_message_reply_fields.selector);
            var replyButtonText = sakai.api.i18n.Widgets.getValueForKey("inbox", sakai.api.User.data.me.user.locale, "REPLY");
            $(window).trigger("initialize.sendmessage.sakai", [currentMessage.replyAll, $inbox_show_message_reply_fields, clearReply, "Re: " + currentMessage.subject, null, true, currentMessage.id, replyButtonText]);
            $inbox_show_message_reply_fields.show();
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

        /** Searhcing **/
        var handleSearch = function(e) {
            if (e.keyCode === 13) {
                if ($.trim($inbox_search_messages.val()) === "") {
                    $.bbq.removeState("iq");
                } else {
                    $.bbq.pushState({"iq": $inbox_search_messages.val()});
                }
            }
        };

        $inbox_search_messages.live("keydown", handleSearch);

        /** History management **/

        $inbox_item.live("click", function(e) {
            if (!($(e.target).hasClass("personinfo_trigger_click") || $(e.target).hasClass("inbox_action_button") || $(e.target).is("input"))) {
                $.bbq.pushState({"message": $(this).attr("id")});
            }
        });

        /**
         * Set the initial state of this box/category combo
         */
        var setInitialState = function(callback) {
            $(detailViewClass).hide();
            $(newMessageViewClass).hide();
            $inbox_box_title.text(sakai.api.i18n.Widgets.getValueForKey("inbox", sakai.api.User.data.me.user.locale, widgetData.title));
            $(listViewClass).show();
            if (widgetData.box !== "inbox") {
                $inbox_title_total_wrapper.hide();
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
            if ($inbox_message_list.is(":visible")) {
                // apply threedots to the subject and the name
                $(".inbox_subject a, .inbox_name a, .inbox_name span", $rootel).each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 1}, "s3d-bold inbox_main"));
                });
                $(".inbox_excerpt p", $rootel).each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 2}, "inbox_main"));
                });
            }
        };

        /**
         * Updates the list of messages in the default view of this box/category
         */
        var updateMessageList = function(update) {
            if (update !== false) {
                // make the results an array so we can know if we've hit the last
                // one when we're iterating in the template
                var data = $.extend(true, {}, messages);
                data.results = _.toArray(data.results);

                sakai.api.Util.TemplateRenderer($inbox_message_list_item_template, {
                    sakai: sakai,
                    _: _,
                    data: data,
                    search: searchTerm,
                    widgetData: widgetData
                }, $inbox_message_list);

                formatMessageList();
            }
        };

        /**
         * Event handler function for hiding/showing this widget
         * Cleans up or sets the polling interval for new messages
         */
        var handleShown = function(e, showing) {
            if (widgetData.box !== "inbox") {
                $inbox_title_total_wrapper.hide();
            }
            if (showing) {
                checkInterval = setInterval(getMessages, POLLING_INTERVAL);
            } else {
                clearInterval(checkInterval);
            }
        };

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if ($rootel.is(":visible")) {
                if (!$.isEmptyObject(changed) || (first && !$.isEmptyObject(all))) {
                    if (changed.hasOwnProperty("message") || all.hasOwnProperty("message")) {
                        getMessages(function() {
                            updateMessageList(true);
                            var message = messages.results[changed.message || all.message];
                            currentMessage = message;
                            // this handles multiple instances of the widget
                            if (currentMessage) {
                                showMessage();
                                if (changed.hasOwnProperty("reply") || all.hasOwnProperty("reply")) {
                                    focusReply();
                                }
                            }
                        });
                    } else if (changed.hasOwnProperty("newmessage") || all.hasOwnProperty("newmessage")) {
                        showNewMessage();
                    } else if (changed.hasOwnProperty("iq") || all.hasOwnProperty("iq")) {
                        searchTerm = changed.iq || all.iq;
                        $inbox_search_messages.removeAttr("disabled").val(searchTerm);
                        setInitialState();
                        getMessages();
                    }
                } else if (!$.isEmptyObject(deleted)) {
                    if (deleted.hasOwnProperty("message") || deleted.hasOwnProperty("newmessage")) {
                        setInitialState(formatMessageList);
                        getMessages();
                    } else if (deleted.hasOwnProperty("iq")) {
                        searchTerm = null;
                        getMessages();
                    }
                } else {
                    setInitialState();
                    getMessages();
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
            var all = state && state.all ? state.all : {};
            handleHashChange(null, {}, {}, all, {}, true);
            $(window).bind("hashchanged.inbox.sakai", handleHashChange);
            checkInterval = setInterval(getMessages, POLLING_INTERVAL);
            $(window).bind(tuid + ".shown.sakai", handleShown);
        };

        var init = function() {
            $inbox_box_title.text(sakai.api.i18n.Widgets.getValueForKey("inbox", sakai.api.User.data.me.user.locale, widgetData.title));
            // we need to check invitation status before we render any messages
            // if we're in the invitation category
            if (widgetData.category === "invitation") {
                postInit();
            } else {
                postInit();
            }
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("inbox");
});
