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
require(["jquery", "sakai/sakai.api.core", "underscore"], function($, sakai, _) {

    sakai_global.inbox = function(tuid, showSettings, widgetData, state) {

        var totalMessages = 0,
            messages = {},
            currentMessage = {},
            sortBy = "_created",
            sortOrder = "desc",
            currentPage = 0,
            searchTerm = null,
            listViewClass = ".inbox-message-list-view",
            detailViewClass = ".inbox-message-detail-view",
            newMessageViewClass = ".inbox-new-message-view",
            infinityScroll = false,
            previousPosition = false;

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
            $inbox_message_list_item_empty_template = $("#inbox_message_list_item_empty_template", $rootel),
            $inbox_box_title = $("#inbox_box_title", $rootel),
            $inbox_delete_button = $(".inbox_delete_button", $rootel),
            $inbox_show_message_reply_fields = $(".inbox_show_message_reply_fields", $rootel),
            $inbox_invitation = $(".inbox_invitation", $rootel),
            $inbox_select_checkbox = $("#inbox_select_checkbox", $rootel),
            $inbox_delete_selected = $("#inbox_delete_selected", $rootel),
            $inbox_mark_as_read = $("#inbox_mark_as_read", $rootel),
            $inbox_item = $(".inbox_item", $rootel),
            $inbox_search_messages = $("#inbox_search_messages", $rootel),
            $inbox_search_term = $("#inbox_search_term", $rootel);
            $inbox_search_button = $(".inbox-message-list-view .s3d-search-button");

        /**
         * Toggle the 'mark as read' and 'delete selected' buttons on the message list view
         */
        var toggleGlobalButtons = function(enable) {
            if (enable) {
                var $unreadMessages = $inbox_message_list.find('input[type="checkbox"]:visible:checked')
                .parents('.inbox_items_container.unread');
                if ($unreadMessages.length) {
                    $inbox_mark_as_read.removeAttr('disabled');
                } else {
                    $inbox_mark_as_read.attr('disabled', 'disabled');
                }
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
            var unreadMessages = $inbox_message_list.find("input[type='checkbox']:visible:checked").parents(".inbox_items_container.unread");
            var readList = [];
            $.each(unreadMessages, function(i,elt) {
                var message = messages[$(elt).attr("id")];
                $(elt).removeClass("unread");
                $(elt).find('.inbox_placeholder').find('em').text(sakai.api.i18n.getValueForKey('READ', 'inbox'));
                readList.push(message);
            });
            sakai.api.Communication.markMessagesAsRead(readList);
        });

        $inbox_select_checkbox.live("change", function(e) {
            selectMessages($inbox_select_checkbox.is(":checked"));
        });

        $('.inbox_items_container input[type="checkbox"]', $rootel).live('change', function() {
            if ($('.inbox_items_container input[type="checkbox"]:checked', $rootel).length > 0) {
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
                    sakai.data.me.contacts.accepted++;
                    $(window).trigger('lhnav.updateCount', ['contacts', sakai.data.me.contacts.accepted, false]);
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

        var showMessage = function(message, _focusReply) {
            currentMessage = message;
            var cacheAutoSuggestData = $("#sendmessage_to_autoSuggest").data();
            $(listViewClass).hide();
            $(newMessageViewClass).hide();
            hideReply();
            var messageToShow = $.extend(true, {}, currentMessage);
            if (widgetData.category === "invitation") {
                determineInviteStatus(messageToShow);
            }
            $inbox_box_title.text(sakai.api.Util.applyThreeDots(messageToShow.subject, 310, false, false, true));
            sakai.api.Util.TemplateRenderer($inbox_show_message_template, {
                message:messageToShow,
                me: {
                    name: sakai.api.User.getDisplayName(sakai.api.User.data.me.profile),
                    picture: sakai.api.Util.constructProfilePicture(sakai.api.User.data.me)
                },
                box: widgetData.box
            }, $inbox_show_message);
            $("#sendmessage_to_autoSuggest").data(cacheAutoSuggestData);
            if (!currentMessage.read) {
                sakai.api.Communication.markMessagesAsRead(currentMessage);
                $("#" + currentMessage.id, $rootel).removeClass("unread");
            }
            $(detailViewClass).show();
            showReply();
            if (_focusReply) {
                focusReply();
            }
        };

        /**
         * Show the sendmessage widget all by itself in a div
         */
        var showNewMessage = function() {
            $(listViewClass).hide();
            $(detailViewClass).hide();
            $(document).trigger('initialize.sendmessage.sakai', [null, $inbox_new_message_sendmessage, sendMessageFinished]);
            $inbox_box_title.text(sakai.api.i18n.getValueForKey("NEW_MESSAGE", "inbox"));
            $(newMessageViewClass).show();
        };


        ///////////////////////
        // Deleting messages //
        ///////////////////////

        /**
         * Delete a list of messages from the current selected box
         * @param {Object} messages    Array that contains message objects
         */
        var deleteMessages = function(messages){
            var hardDelete = widgetData.box === "trash" ? true : false;
            sakai.api.Communication.deleteMessages(messages, hardDelete, function(success, data) {
                if ($inbox_show_message.is(":visible")) {
                    $.bbq.removeState("message", "reply");
                }
                if (infinityScroll){
                    var ids = [];
                    $.each(messages, function(i, message){
                        ids.push(message.id);
                    });
                    infinityScroll.removeItems(ids);
                }
            });
        };

        /**
         * Delete messages selected in the current view
         */
        var deleteMultipleMessages = function(e){
            var messagesToDelete = $inbox_message_list.find("input[type='checkbox']:visible:checked").parents(".inbox_items_container");
            var messageList = [];
            $.each(messagesToDelete, function(i,elt) {
                var msg = messages[$(elt).attr("id")];
                messageList.push(msg);
            });
            deleteMessages(messageList);
            $inbox_select_checkbox.removeAttr("checked");
            toggleGlobalButtons(false);
        };

        /**
         * Delete a message when the X icon in the message list
         * is clicked
         */
        var deleteSingleMessage = function(e) {
            var mid = $(e.currentTarget).parents(".inbox_items_container").attr("id");
            deleteMessages([messages[mid]]);
        };

        $inbox_delete_button.live("click", deleteSingleMessage);
        $inbox_delete_selected.live("click", deleteMultipleMessages);


        ///////////////////
        // List messages //
        ///////////////////

        /**
         * Show the list of messages in the currently selected message box, using 
         * the infinite scrolling plug-in
         */
        var getMessages = function() {
            var doFlip = widgetData.box === "outbox";
            if (!searchTerm) {
                $inbox_search_term = $($inbox_search_term.selector);
                $inbox_search_term.remove();
            }
            toggleGlobalButtons(false);
            $inbox_select_checkbox.removeAttr('checked');
            $inbox_search_messages.removeAttr("disabled");
            // Disable the previous infinite scroll
            if (infinityScroll){
                infinityScroll.kill();
            }
            // Set up the infinite scroll for the list of items in the library
            infinityScroll = $inbox_message_list.infinitescroll(function(parameters, callback){
                sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, searchTerm, parameters.items, parameters.page, sortBy, sortOrder, function(success, data){
                    $.each(data.results, function(index, result){
                        if (result.id){
                            messages[result.id] = result;
                            result['body_nolinebreaks_short'] = sakai.api.Util.applyThreeDots(result.body_nolinebreaks, '550', {max_rows: 2}, false, true);
                            result['subject_short'] = sakai.api.Util.applyThreeDots(result.subject, '550', {max_rows: 1}, 's3d-bold', true);
                        }
                    });
                    callback(true, data);
                });
            }, {}, function(items, total){
                $('.inbox_select_all_container:visible input', $rootel).removeAttr('disabled');
                return sakai.api.Util.TemplateRenderer($inbox_message_list_item_template, {
                    sakai: sakai,
                     _: _,
                    results: items,
                    search: searchTerm,
                    box: widgetData.box
                });
            }, function(){
                $('.inbox_select_all_container:visible input', $rootel).attr('disabled', true);
                $inbox_delete_selected.attr('disabled', true);
                $inbox_mark_as_read.attr('disabled', true);
                $inbox_message_list.html(sakai.api.Util.TemplateRenderer($inbox_message_list_item_empty_template, {
                    "widgetData": widgetData,
                    "search": searchTerm
                }));
                if (!searchTerm) {
                    $inbox_search_messages.attr("disabled", "disabled");
                }
            }, sakai.config.URL.INFINITE_LOADING_ICON);
        };


        /////////////
        // Replies //
        /////////////

        /**
         * Do some magic to make sendmessage happy
         */
        var hideReply = function() {
            $("#showmessagehidden").remove();
            $("<div/>").attr("id", "showmessagehidden").html($inbox_show_message_reply_fields.html()).hide().appendTo('body');
            $inbox_show_message_reply_fields.empty();
        };

        /**
         * Action that need to be taken when the reply has been sent
         *  1. Clear the value of the reply box
         *  2. Bring the user back to the inbox
         */
        var handleReplyFinished = function() {
            $("#comp-body").val('');
            $inbox_back_to_messages.click();
        };

        /**
         * Show the reply textarea inline
         */
        var showReply = function() {
            $inbox_show_message_reply_fields = $($inbox_show_message_reply_fields.selector);
            var replyButtonText = sakai.api.i18n.getValueForKey("REPLY", "inbox");
            var replyText = sakai.api.i18n.getValueForKey("RE", "inbox");
            var messageSubject = currentMessage.subject;
            // Check whether the message starts with Reply. If not, add it to the subject line
            if(currentMessage.subject.substring(0, replyText.length) !== replyText){
                messageSubject = replyText + " " + currentMessage.subject;
            }
            $(document).trigger('initialize.sendmessage.sakai', [currentMessage.replyAll, $inbox_show_message_reply_fields, handleReplyFinished, messageSubject, null, true, currentMessage.id, replyButtonText]);
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


        ////////////
        // SEARCH //
        ////////////

        var handleSearch = function(e) {
            if (e.keyCode === 13) {
                if ($.trim($inbox_search_messages.val()) === "") {
                    $.bbq.removeState("iq");
                } else {
                    $.bbq.pushState({"iq": $inbox_search_messages.val()});
                }
                return false;
            }
        };

        $inbox_search_messages.live("keydown", handleSearch);
        $inbox_search_button.live("click", function(){
            $.bbq.pushState({
                "iq": $inbox_search_messages.val()
            });
        });


        ////////////////////////////////
        // SCROLL POSITION MANAGEMENT //
        ////////////////////////////////

        /**
         * Store the scroll position when looking at a inbox
         * message, so we can return to the same position when
         * the user has finished reading the message
         */
        var storeCurrentScrollPosition = function(){
            previousPosition = $("html").scrollTop();
            window.scrollTo(0, 0);
        };

        /**
         * After a user stops reading a message or has
         * replied, we return the user to the previous position
         * he had in the message list
         */
        var restorePreviousPosition = function(){
            $(detailViewClass).hide();
            $(newMessageViewClass).hide();
            $(listViewClass).show();
            window.scrollTo(0, previousPosition);
        };


        ////////////////////////
        // HISTORY MANAGEMENT //
        ////////////////////////

        $inbox_item.live("click", function(e) {
            if (!($(e.target).hasClass("personinfo_trigger_click") || $(e.target).hasClass("inbox_action_button") || $(e.target).hasClass("inbox_delete_icon") || $(e.target).is("input"))) {
                $.bbq.pushState({"message": $(this).attr("id")});
            }
        });

        /**
         * Set the initial state of this box/category combo
         */
        var setInitialState = function(callback) {
            $(detailViewClass).hide();
            $(newMessageViewClass).hide();
            $inbox_box_title.text(sakai.api.i18n.General.process(widgetData.title, "inbox"));
            $(listViewClass).show();
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
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 1}, "s3d-bold inbox_main", true));
                });
                $(".inbox_excerpt p", $rootel).each(function(i,elt) {
                    $(elt).text(sakai.api.Util.applyThreeDots($(elt).text(), $(elt).parent().width(), {max_rows: 2}, "inbox_main", true));
                });
            }
        };

        /**
         * Event handler function for hiding/showing this widget
         * Cleans up or sets the polling interval for new messages
         */
        var handleShown = function(e, showing) {
            if (showing && !$.bbq.getState("message")) {
                getMessages();
            }
        };

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if (first) {
                // Store the l param for later
                widgetData.l = $.bbq.getState("l");
            }
            // check if the inbox is open, or if the hashchange will open an inbox message
            if ( $rootel.is(":visible") || widgetData.l === currentState.l ) {
                if (!$.isEmptyObject(changed) || (first && !$.isEmptyObject(all))) {
                    if (all.hasOwnProperty("message")) {
                        storeCurrentScrollPosition();
                        if ((messages && !messages[all.message]) || !messages) {
                            sakai.api.Communication.getMessage(all.message, widgetData.box, sakai.data.me, function(message){
                                if (message){
                                    messages[all.message] = message;
                                    currentMessage = message;
                                    showMessage(message, all.hasOwnProperty("reply"));
                                } else {
                                    setInitialState();
                                    getMessages();
                                }
                            });
                        } else {
                            var messageCached = messages[all.message];
                            if (messageCached) {
                                showMessage(messageCached, all.hasOwnProperty("reply"));
                            }
                        }
                    } else if (all.hasOwnProperty("newmessage")) {
                        showNewMessage();
                    } else if (all.hasOwnProperty("iq")) {
                        searchTerm = all.iq;
                        setInitialState();
                        getMessages();
                    }
                } else if (!$.isEmptyObject(deleted)) {
                    if (deleted.hasOwnProperty("message") || deleted.hasOwnProperty("newmessage")) {
                        if (previousPosition) {
                            restorePreviousPosition();
                        } else {
                            setInitialState(formatMessageList);
                            getMessages();
                        }
                    } else if (deleted.hasOwnProperty("iq")) {
                        searchTerm = null;
                        getMessages();
                    }
                } else {
                    setInitialState();
                    getMessages();
                }
            } else {
                setInitialState();
            }
        };

        var init = function() {
            var all = state && state.all ? state.all : {};
            handleHashChange(null, {}, {}, all, {}, true);
            $(window).bind("hashchanged.inbox.sakai", handleHashChange);
            $(window).bind(tuid + ".shown.sakai", handleShown);
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("inbox");
});
