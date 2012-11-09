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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
/*global Config, $ */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.discussion
     *
     * @class discussion
     *
     * @description
     * Initialize the discussion widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.discussion = function(tuid, showSettings, widgetData) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid); // Get the main div used by the widget
        var widgetSettings = {};
        var topicData = {};
        // Each post gets a marker which is basicly the widget ID.
        // If we are using another discussion this marker will be the ID of that widget.
        var marker = tuid;
        var addTopics = false;
        var addReplies = false;
        var cachedPosts = false;

        // Containers
        var $discussionContainer = $('#discussion_container', $rootel);
        var $discussionMainContainer = $('#discussion_main_container', $rootel);
        var discussionSettingsPermissionsContainer = '#discussion_settings_permissions_container';
        var discussionNoInitialTopic = '#discussion_no_initial_topic';
        var discussionCreateNewTopic = '#discussion_create_new_topic';
        var $discussionListTopics = $('#discussion_list_topics', $rootel);
        var discussionListTopicsContainer = '#discussion_list_topics_container';
        var discussionTabContentSettingsContainer = '#discussion_tab_content_settings_container';
        var discussionTopicContainer = '.discussion_topic_container';
        var discussionTopicReplyContainer = '#discussion_topic_reply_container';
        var discussionTopicRepliesContainer = '.discussion_topic_replies_container';
        var discussionQuotedTextContainer = '.discussion_quoted_text_container';
        var discussionEntityContainer = '.discussion_entity_container';

        // Templates
        var discussionTabContentSettingsTemplate = 'discussion_tab_content_settings_template';
        var discussionListTopicsTemplate = 'discussion_list_topics_template';
        var discussionNoInitialTopicTemplate = 'discussion_no_initial_topic_template';
        var discussionTopicReplyTemplate = 'discussion_topic_reply_template';
        var discussionDeletedPostActionsTemplate = 'discussion_deleted_post_actions_template';
        var discussionDeletedPostEntityInfoTemplate = 'discussion_deleted_post_entity_info_template';
        var discussionRestoredPostActionsTemplate = 'discussion_restored_post_actions_template';
        var discussionTopicNewlyPostedReplyTemplate = 'discussion_topic_newly_posted_reply_template';

        // Settings
        var parsedSettings = {};
        var $discussionSettings = $('#discussion_settings', $rootel);
        var discussionSettingsSubmit = '#discussion_settings_submit';
        var discussionSettingsCancel = '#discussion_settings_cancel';

        // Add new topic
        var discussionAddNewTopic = '#discussion_add_new_topic';
        var discussionDontAddTopic = '#discussion_dont_add_topic';
        var discussionCreateNewTopicTitle = '#discussion_create_new_topic_title';
        var discussionCreateNewTopicMessageText = '#discussion_create_new_topic_message_text';
        var discussionCreateNewTopicForm = '#discussion_create_new_topic form';

        // Replies
        var discussionRepliesIcon = '.discussion_replies_icon';
        var discussionTopicReplyText = '#discussion_topic_reply_text';
        var discussionTopicQuotedText = '#discussion_topic_quoted_text';
        var discussionExpandAll = '#discussion_expand_all';
        var discussionShowTopicReplies = '.discussion_show_topic_replies';
        var discussionQuote = '.discussion_quote';
        var discussionPostMessage = '.discussion_post_message';
        var discussionReplyTopic = '#discussion_reply_topic';
        var discussionDontAddReply = '#discussion_dont_add_reply';
        var discussionAddReply = '#discussion_add_reply';
        var discussionHideReply = '.discussion_hide_reply';
        var discussionReplyContents = '.discussion_reply_contents';
        var discussionReplyContentsText = '.discussion_reply_contents_text';
        var discussionTopicReplyQuotedUser = '#discussion_topic_reply_quoted_user';
        var discussionReplyContentsTextQuoted = '.discussion_reply_contents_text_quoted';
        var discussionPosterName = '.discussion_poster_name';
        var discussionPostingDate = '.discussion_posting_date';
        var discussionUpdatingDate = '.discussion_updating_date';
        var discussionNumberOfReplies = '.discussion_number_of_replies';
        var discussionReplyTopicBottom = '.discussion_reply_topic_bottom';

        // Edit
        var discussionEdit = '.discussion_edit';
        var discussionEditContainer = '.discussion_edit_container';
        var discussionDontSaveEdit = '#discussion_dont_save_edit';
        var discussionSaveEdit = '#discussion_save_edit';
        var discussionEditButtons = '#discussion_add_new_topic, .discussion_reply_topic, .discussion_quote, .discussion_edit';

        // Delete
        var discussionDelete = '.discussion_delete';
        var discussionRestore = '.discussion_restore';
        var discussionMessageOptions = '.discussion_message_options';
        var discussionDeletedMessage = '.discussion_deleted_message';

        // Classes
        var discussionExpandAllClass = 'discussion_expand_all';
        var discussionCollapseAllClass = 'discussion_collapse_all';
        var discussionShowRepliesIcon = 'discussion_show_replies_icon';
        var discussionHideRepliesIcon = 'discussion_hide_replies_icon';
        var s3dHighlightBackgroundClass = '.s3d-highlight_area_background';
        var discussionDeletedReplyClass = 'discussion_deleted_reply';
        var discussionNotChangeable = '.discussion_not_changeable';

        // i18n
        var $discussionCollapseAll = $('#discussion_i18n_collapse_all', $rootel);
        var $discussionExpandAll = $('#discussion_i18n_expand_all', $rootel);
        var $discussionShow = $('#discussion_i18n_show', $rootel);
        var $discussionHide = $('#discussion_i18n_hide', $rootel);

        /**
         * Enables all edit mode buttons (reply, quote, edit, create new topic)
         */
        var enableEditButtons = function() {
            $(discussionEditButtons, $rootel).removeAttr('disabled');
            $(discussionNotChangeable).hide();
        };

        /**
         * Disables all edit mode buttons (reply, quote, edit, create new topic)
         */
        var disableEditButtons = function() {
            $(discussionEditButtons, $rootel).attr('disabled', 'disabled');
            $(discussionNotChangeable).show();
        };

        var continueInit = function() {
            getWidgetSettings();
            if (showSettings) {
                $discussionMainContainer.hide();
                $discussionSettings.show();
            }else{
                $discussionMainContainer.show();
                $discussionSettings.hide();
            }
        };

        /**
         * Get the URL at which the discussion post message store
         * can be found
         */
        var getMessageStoreURL = function() {
            return sakai.api.Widgets.getWidgetDataStorageURL(tuid) + '/message';
        };

        /**
         * Check if the message store already exists
         * If it does not exists we need to create one
         */
        var checkMessageStore = function() {
            var widgeturl = sakai.api.Widgets.getWidgetDataStorageURL(tuid);
            if (widgeturl) {
                var store = getMessageStoreURL();
                $.ajax({
                    url: widgeturl + '.0.json',
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        continueInit();
                    },
                    error: function(xhr, textStatus, thrownError) {
                        if (xhr.status === 404) {
                            // we need to create the initial message store
                            $.post(store, {
                                'sling:resourceType': 'sakai/messagestore'
                            });
                            continueInit();
                        }
                    }
                });
            }
        };

        /**
         * Parse the picture for a user
         * @param {Object} profile The profile for a user
         */
        var parsePicture = function(profile) {
            var picture = sakai.api.Util.constructProfilePicture(profile);
            if (picture) {
                return picture;
            } else {
                return '/dev/images/user_avatar_icon_32x32.png';
            }
        };

        /**
         * Parse a json integer to a valid date
         * @param {Integer} dateInput Integer of a date that needs to be parsed
         * @returns {Date}
         */
        var parseDate = function(dateInput) {
            if (dateInput !== null) {
                return sakai.api.l10n.fromEpoch(dateInput, sakai.data.me);
            }
            return null;
        };

        var parseQuote = function(message) {
            var quote = false;
            if (message.substring(0,6) === '[quote') {
                // Parse the quoted message
                quote = message.split('[/quote]')[0];
                quote = quote.substring(quote.indexOf(']') + 1, quote.length);
                // Parse the original author
                var by = message.split('[/quote]')[0];
                by = by.substring(by.indexOf('\'') + 1, by.indexOf(']') - 1);
                return {'quote':quote, 'by':by};
            } else {
                return quote;
            }
        };

        /**
         * Enables or disables buttons in the widget
         * @param {Boolean} enable Flag for whether to enable or disable the buttons
         */
        var disableEnableButtons = function(enable) {
            if (enable) {
                $('#discussion_container button', $rootel).removeAttr('disabled');
            } else {
                $('#discussion_container button', $rootel).attr('disabled', 'disabled');
            }
        };

        /**
         * Callback function to sort replies based on created timestamp
         */
        var sortReplies = function(a, b) {
            return a.post['sakai:created'] - b.post['sakai:created'];
        };

        var renderPosts = function(arrPosts) {
            // Loop fetched posts and do markup
            for (var i = 0, j = arrPosts.length; i < j; i++) {
                arrPosts[i].post.profile[0].pictureImg = parsePicture(arrPosts[i].post.profile[0]);
                var tempPostDate = sakai.api.Util.parseSakaiDate(arrPosts[i].post['sakai:created']).getTime();
                if (isNaN(parseDate(arrPosts[i].post['sakai:created']))) {
                    tempPostDate = sakai.api.Util.parseSakaiDate(
                                       sakai.api.Util.createSakaiDate(new Date(arrPosts[i].post['sakai:created']))).getTime();
                }
                arrPosts[i].post['sakai:createdOn'] = sakai.api.l10n.transformDateTimeShort(parseDate(tempPostDate));
                if (arrPosts[i].post['sakai:editedOn']) {
                    arrPosts[i].post['sakai:editedOn'] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post['sakai:editedOn']));
                }
                for(var ii = 0, jj = arrPosts[i].replies.length; ii < jj; ii++) {
                    arrPosts[i].replies[ii].post.profile[0].pictureImg = parsePicture(arrPosts[i].replies[ii].post.profile[0]);
                    var tempReplyDate = sakai.api.Util.parseSakaiDate(arrPosts[i].replies[ii].post['sakai:created']).getTime();
                    if (isNaN(parseDate(arrPosts[i].replies[ii].post['sakai:created']))) {
                        tempReplyDate = sakai.api.Util.parseSakaiDate(
                                            sakai.api.Util.createSakaiDate(new Date(arrPosts[i].replies[ii].post['sakai:created']))).getTime();
                    }
                    arrPosts[i].replies[ii].post['sakai:createdOn'] = sakai.api.l10n.transformDateTimeShort(parseDate(tempReplyDate));
                    if (arrPosts[i].replies[ii].post['sakai:deletedOn']) {
                        arrPosts[i].replies[ii].post['sakai:deletedOn'] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post['sakai:deletedOn']));
                    }
                    if (arrPosts[i].replies[ii].post['sakai:editedOn']) {
                        arrPosts[i].replies[ii].post['sakai:editedOn'] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post['sakai:editedOn']));
                    }
                    arrPosts[i].replies[ii].post['sakai:quoted'] = parseQuote(arrPosts[i].replies[ii].post['sakai:body']);
                    if (arrPosts[i].replies[ii].post['sakai:body'].split(['[/quote]'])[1]) {
                        arrPosts[i].replies[ii].post['sakai:body'] = arrPosts[i].replies[ii].post['sakai:body'].split(['[/quote]'])[1];
                    }
                }
                // Sort replies
                arrPosts[i].replies.sort(sortReplies);
            }

            // Render formatted posts
            sakai.api.Util.TemplateRenderer(discussionListTopicsTemplate, {
                'postData':arrPosts,
                'settings':parsedSettings,
                'sakai': sakai
            }, $(discussionListTopicsContainer, $rootel));
            sakai.api.Util.renderMath(tuid);
        };

        var setEllipsis = function() {
            $('.discussion_ellipsis_container', $rootel).css('width', $('.discussion_ellipsis_container').width() + 'px');

            $('.discussion_ellipsis_container', $rootel).ThreeDots({
                max_rows: 4,
                text_span_class: 'discussion_ellipsis_text',
                e_span_class: 'discussion_e_span_class',
                ellipsis_string:'...<a href=\'javascript:;\' class=\'discussion_show_all_ellipsis_text s3d-regular-links\'>More</a>',
                whole_word: false,
                alt_text_t: true
            });
        };

        /**
         * Show all the posts in the main view
         * @param {String} response Json response with all the posts
         * @param {Boolean} exists Check if the discussion exists
         */
        var showPosts = function(response, exists) {
            if (exists && response.total !== 0) {
                topicData = response;
                try {
                    renderPosts(response.results);
                    $discussionListTopics.show();
                } catch (err) {
                }
            } else {
                // No topics yet but check the topicData to be sure (sometimes server doesn't return topic yet)
                if (exists && topicData && topicData.results && topicData.results.length) {
                    showPosts(topicData, true);
                } else {
                    sakai.api.Util.TemplateRenderer(discussionNoInitialTopicTemplate, {
                        'settings': parsedSettings,
                        'sakai': sakai
                    }, $(discussionNoInitialTopic, $rootel));
                    $(discussionNoInitialTopic, $rootel).show();
                    if ($rootel.parents('.contentauthoring_edit_mode').length) {
                        disableEditButtons();
                    }
                }
            }
        };

        /**
         * Displays the settings.
         */
        var displaySettings = function() {
            // Render settings
            sakai.api.Util.TemplateRenderer(discussionTabContentSettingsTemplate, {
                'settings':widgetSettings,
                'sakai': sakai
            }, $(discussionTabContentSettingsContainer, $rootel));
            // Hide/Show elements
            $discussionMainContainer.hide();
            $discussionSettings.show();
        };

        /**
         * Get the id of the dicussion widget and show the post including replies
         */
        var getPosts = function() {
            var s = getMessageStoreURL();
            var url = sakai.config.URL.DISCUSSION_GETPOSTS_THREADED.replace(/__PATH__/, s).replace(/__MARKER__/, marker);
            $.ajax({
                url: url,
                data: {
                    items : 1000000
                },
                cache: false,
                success: function(data) {
                    cachedPosts = data;
                    showPosts(data, true);
                }
            });
        };

        var parseSettings = function(data) {
            var contact = false;
            var canEditPage = false;
            // Check if the logged in user manages the discussion page or not (for a content profile or group)
            if ((sakai_global.group &&
                sakai.api.Groups.isCurrentUserAManager(sakai_global.group.groupId, sakai.data.me, sakai_global.group.groupData)) ||
                (sakai_global.content_profile &&
                sakai.api.Content.isUserAManager(sakai_global.content_profile.content_data.data, sakai.data.me))) {
                    canEditPage = true;
            }
            parsedSettings['ismanager'] = canEditPage;
            // Anonymous can't do anything
            if (sakai.api.User.isAnonymous(sakai.data.me)) {
                parsedSettings['addtopic'] = false;
                parsedSettings['canreply'] = false;
                parsedSettings['anon'] = true;
            } else {
                parsedSettings['anon'] = false;
                parsedSettings['userid'] = sakai.data.me.user.userid;

                // Check for who can add topics
                if (data['whocanaddtopic'] === 'managers_only') {
                    if (canEditPage) {
                        parsedSettings['addtopic'] = true;
                    } else {
                        parsedSettings['addtopic'] = false;
                    }
                } else {
                    parsedSettings['addtopic'] = true;
                }

                // Check for who can add replies
                if (data['whocanreply'] === 'anyone') {
                    parsedSettings['canreply'] = true;
                } else {
                    if (canEditPage) {
                        parsedSettings['canreply'] = true;
                    }
                }
            }
            getPosts();
        };

        var processWidgetData = function(data) {
            widgetSettings = $.extend(true, {}, data);
            if (widgetSettings.marker !== undefined) {
                marker = widgetSettings.marker;
            }
            if (showSettings) {
                displaySettings();
            } else {
                // Parse these settings to be usable in templates
                parseSettings(data);
            }
        };

        /**
         * Fetches the widget settings and places it in the widgetSettings var.
         */
        var getWidgetSettings = function() {
            if (widgetData.discussion) {
                processWidgetData(widgetData.discussion);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    if (success) {
                        processWidgetData(data);
                    } else {
                        // We don't have settings for this widget yet.
                        if (showSettings) {
                            displaySettings();
                        } else {
                            saveSettings(getWidgetSettings);
                        }
                    }

                });
            }
        };

        /**
         * Closes the settings container.
         */
        var finishSettingsContainer = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'discussion');
        };

        /**
         * Saves the settings for the widget
         * @param {Object} callback Function to be executed after saving the data
         */
        var saveSettings = function(callback) {
            var data = widgetSettings;

            widgetSettings['replytype'] = $('#discussion_settings_reply_options input[type="radio"]:checked', $rootel).val();
            widgetSettings['whocanaddtopic'] = $('#discussion_settings_permissions_add_new input[type="radio"]:checked', $rootel).val() || 'anyone';
            widgetSettings['whocanreply'] = $('#discussion_settings_permissions_who_can_reply input[type="radio"]:checked', $rootel).val() || 'anyone';
            widgetSettings['marker'] = marker;

            // JCR properties are not necessary.
            delete data['jcr:primaryType'];

            // don't save messages this way
            delete data['message'];

            sakai.api.Widgets.saveWidgetData(tuid, data, callback);
        };

        /**
         * Creates a new topic
         */
        var createTopic = function() {
            disableEnableButtons(false);
            var store = getMessageStoreURL();
            var postData = {
                'sakai:type': 'discussion',
                'sling:resourceType': 'sakai/message',
                'sakai:to': 'discussion:' + store,
                'sakai:subject': $(discussionCreateNewTopicTitle, $rootel).val(),
                'sakai:body': $(discussionCreateNewTopicMessageText, $rootel).val(),
                'sakai:initialpost': true,
                'sakai:writeto': store,
                'sakai:marker': tuid,
                'sakai:messagebox': 'pending',
                'sakai:sendstate': 'pending',
                '_charset_': 'utf-8'
            };
            $.ajax({
                url: store + '.create.html',
                cache: false,
                type: 'POST',
                data: postData,
                success: function(data) {
                    $(discussionCreateNewTopicTitle, $rootel).val('');
                    $(discussionCreateNewTopicMessageText, $rootel).val('');
                    $(discussionCreateNewTopic, $rootel).hide();

                    data.message['profile'] = [sakai.data.me.profile];

                    if (!topicData.results) {
                        topicData.results = [];
                    }
                    topicData.results.unshift({'post': data.message, 'replies': []});
                    showPosts(topicData, true);

                    disableEnableButtons(true);
                },
                error: function() {
                    disableEnableButtons(true);
                }
            });
        };

        /**
         * Reply to a post.
         * @param {String} id The ID of the topic that's being replied on
         * @param {String} body The message in the reply
         * @param {String} $parentDiv the parent div that should be hidden on success
         */
        var replyToTopic = function(id, body, $parentDiv, $replyParent) {
            var store = getMessageStoreURL();
            var object = {
                'sakai:body': body,
                'sakai:marker': marker,
                'sakai:type': 'discussion',
                'sling:resourceType': 'sakai/message',
                'sakai:replyon': id,
                'sakai:messagebox': 'pending',
                'sakai:sendstate': 'pending',
                'sakai:to': 'discussion:' + store,
                'sakai:deleted': false,
                '_charset_': 'utf-8'
            };
            var url = store + '.create.html';
            $.ajax({
                url: url,
                type: 'POST',
                success: function(data) {
                    $parentDiv.hide();
                    $parentDiv.parents(discussionTopicContainer).find(discussionReplyTopicBottom).show();

                    data.message['profile'] = $.extend(data.message['profile'], sakai.data.me.profile);
                    data.message.profile.pictureImg = parsePicture(data.message.profile);
                    var tempReplyDate = sakai.api.Util.parseSakaiDate(data.message['sakai:created']).getTime();
                    if (isNaN(parseDate(data.message['sakai:created']))) {
                        tempReplyDate = sakai.api.Util.parseSakaiDate(
                                            sakai.api.Util.createSakaiDate(new Date(data.message['sakai:created']))).getTime();
                    }
                    data.message['sakai:created'] = sakai.api.l10n.transformDateTimeShort(parseDate(tempReplyDate));
                    data.message['sakai:createdOn'] = data.message['sakai:created'];

                    data.message['sakai:quoted'] = parseQuote(data.message['sakai:body']);
                    if (data.message['sakai:body'].split(['[/quote]'])[1]) {
                        data.message['sakai:body'] = data.message['sakai:body'].split(['[/quote]'])[1];
                    }

                    var renderedTemplate = sakai.api.Util.TemplateRenderer(discussionTopicNewlyPostedReplyTemplate, {
                        'post':data,
                        'settings': parsedSettings,
                        sakai: sakai
                    });

                    $parentDiv.prevAll(discussionTopicRepliesContainer).append(renderedTemplate);

                    $parentDiv.parents(discussionTopicContainer).find(discussionNumberOfReplies).text(parseInt($parentDiv.parents(discussionTopicContainer).find(discussionNumberOfReplies).text(), 10) + 1);
                    $parentDiv.parents(discussionTopicContainer).find('.discussion_show_replies_icon').show();
                    sakai.api.Util.renderMath(tuid);
                    disableEnableButtons(true);

                    var $repliesIcon = $replyParent.find(discussionRepliesIcon);
                    if ($repliesIcon.hasClass(discussionShowRepliesIcon)) {
                        // expand topic reply list
                        $('#discussion_post_' + id + ' ' + discussionShowTopicReplies, $rootel).click();
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    if (xhr.status === 401) {
                        $parentDiv.hide();
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('YOU_CANT_REPLY'), '', sakai.api.Util.notification.type.ERROR);
                    }
                    else {
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('FAILED_ADD_REPLY'), '', sakai.api.Util.notification.type.ERROR);
                    }
                    disableEnableButtons(true);
                },
                data: object
            });
        };

        var doAddReply = function(form) {
            disableEnableButtons(false);
            var $replyParent = $(form).parents(discussionTopicContainer);
            var topicId = $replyParent.attr('id').split('discussion_post_')[1];
            var message = $.trim($replyParent.find('#discussion_topic_reply_text').val());

            if (message) {
                if ($replyParent.find('#discussion_topic_quoted_text').length) {
                    message = '[quote=\'' + $.trim($(discussionTopicReplyQuotedUser, $rootel).text()) + '\']' + $replyParent.find('#discussion_topic_quoted_text').val() + '[/quote]' + message;
                }

                replyToTopic(topicId, message, $(form).parents(discussionTopicReplyContainer), $replyParent);

                $(discussionTopicReplyQuotedUser, $rootel).text('');
            }
        };

        var saveEdit = function(form) {
            var editParent = $(form);
            var id = $(form).parents(s3dHighlightBackgroundClass).attr('id');
            var body = $.trim(editParent.find(discussionTopicReplyText).val());
            var quote = $.trim(editParent.find(discussionTopicQuotedText).val());
            var quoted = $(form).parents(s3dHighlightBackgroundClass).find(discussionReplyContentsTextQuoted).text();
            var post = $(form).parents(s3dHighlightBackgroundClass);

            if (body) {
                updatePost(id, body, quote, quoted, post);
            }
        };

        /**
         * Deletes or undeletes the post with the provided id.
         * @param {String} id The id of the post.
         * @param {boolean} deleteValue true = delete, false = undelete
         */
        var deletePost = function(id, deleteValue, post) {
            var store = getMessageStoreURL();
            var url = store + '/inbox/' + id;
            var data = {
                'sakai:deleted': deleteValue,
                'sakai:deletedBy': sakai.api.User.getDisplayName(sakai.data.me.profile),
                'sakai:deletedOn': Date.now()
            };
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function() {
                    if (deleteValue) {
                        // Apply grey class
                        post.addClass(discussionDeletedReplyClass);

                        // hide message option links
                        $('#' + id + ' ' + discussionMessageOptions, $rootel).hide();

                        // Remove/add links and information
                        post.find(discussionPostMessage).nextAll().remove();
                        post.find(discussionPostMessage).after(sakai.api.Util.TemplateRenderer(discussionDeletedPostActionsTemplate, {}));
                        post.find(discussionPostingDate).after(sakai.api.Util.TemplateRenderer(discussionDeletedPostEntityInfoTemplate, {
                            'deletedBy': data['sakai:deletedBy'],
                            'deletedOn': sakai.api.l10n.transformDateTimeShort(parseDate(data['sakai:deletedOn']))
                        }));
                    }else{
                        // Apply grey class
                        post.removeClass(discussionDeletedReplyClass);

                        // hide message option links
                        $('#' + id + ' ' + discussionMessageOptions, $rootel).hide();
                        $(discussionDeletedMessage, $rootel).hide();

                        // Remove links
                        post.find(discussionPostingDate).next().remove();
                        post.find(discussionPostMessage).nextAll().remove();
                        post.find(discussionPostMessage).after(sakai.api.Util.TemplateRenderer(discussionRestoredPostActionsTemplate, {}));
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('FAILED_DELETE_POST'),'',sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        var updatePost = function(id, body, quote, quoted, post) {
            var store = getMessageStoreURL();
            var url = store + '/inbox/' + id;
            var data = {
                'sakai:edited': true,
                'sakai:editedBy': sakai.api.User.getDisplayName(sakai.data.me.profile),
                'sakai:editedOn': Date.now(),
                'sakai:body': body
            };
            if (quote) {
                data['sakai:body'] = '[quote=\'' + quoted + '\']' + quote + '[/quote]' + body;
            }

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function() {
                    // remove edit divs
                    post.find(discussionEditContainer).children().remove();

                    // Set post data
                    post.find(discussionPostMessage).text(body);
                    post.find(discussionPostMessage).attr('data-source-text', body);
                    post.find(discussionReplyContentsText).text(quote);
                    post.find(discussionReplyContentsText).attr('data-source-text', quote);
                    sakai.api.Util.renderMath(tuid);

                    // Set entity data
                    post.children(discussionEntityContainer).find(discussionUpdatingDate).children('span').text(sakai.api.User.getDisplayName(sakai.data.me.profile) + ' ' + sakai.api.l10n.transformDateTimeShort(parseDate(data['sakai:editedOn'])));
                    post.children(discussionEntityContainer).children(discussionPostingDate).children().show();

                    // Show all
                    post.children('.discussion_entity_container, .discussion_reply_contents').show();
                }
            });
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBinding = function() {
            $rootel.off('click', discussionExpandAll);
            $rootel.on('click', discussionExpandAll, function() {
                if ($(discussionExpandAll, $rootel).hasClass(discussionExpandAllClass)) {
                    $(this).removeClass(discussionExpandAllClass);
                    $(this).addClass(discussionCollapseAllClass);
                    $(this).text($discussionCollapseAll.text());
                    $(discussionRepliesIcon, $rootel).addClass(discussionShowRepliesIcon);
                    $(discussionRepliesIcon, $rootel).removeClass(discussionHideRepliesIcon);
                }else{
                    $(this).removeClass(discussionCollapseAllClass);
                    $(this).addClass(discussionExpandAllClass);
                    $(this).text($discussionExpandAll.text());
                    $(discussionRepliesIcon, $rootel).removeClass(discussionShowRepliesIcon);
                    $(discussionRepliesIcon, $rootel).addClass(discussionHideRepliesIcon);
                }
                $(discussionShowTopicReplies, $rootel).click();
            });

            // SETTINGS //
            // Submit button.
            $rootel.on('click', discussionSettingsSubmit, function(e, ui) {
                saveSettings(finishSettingsContainer);
            });

            // Cancel button
            $rootel.on('click', discussionSettingsCancel, function(e, ui) {
                sakai.api.Widgets.Container.informCancel(tuid, 'discussion');
            });

            // NEW TOPIC //
            $rootel.on('click', discussionAddNewTopic, function() {
                $discussionListTopics.hide();
                $(discussionNoInitialTopic, $rootel).hide();
                $(discussionCreateNewTopic, $rootel).show();
            });

            $rootel.on('click', discussionDontAddTopic, function() {
                $(discussionCreateNewTopic, $rootel).hide();
                getWidgetSettings();
            });

            var validateOpts = {
                submitHandler: createTopic
            };
            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($(discussionCreateNewTopicForm, $rootel), validateOpts, true);

            $('.discussion_show_all_ellipsis_text', $rootel).on('click', function() {
                $(this).parent().prev().text($(this).parent().prev()[0].title);
                $(this).parent().remove();
            });

            // REPLY TOPIC //
            $rootel.off('click', discussionShowTopicReplies);
            $rootel.on('click', discussionShowTopicReplies, function() {
                var $repliesIcon = $(this).children(discussionRepliesIcon);
                var postId = $(this).parent().attr('id');
                if ($repliesIcon.hasClass(discussionShowRepliesIcon)) {
                    $(this).nextAll(discussionTopicRepliesContainer).show();
                    $repliesIcon.removeClass(discussionShowRepliesIcon);
                    $repliesIcon.addClass(discussionHideRepliesIcon);
                    if ($repliesIcon.next().children(discussionNumberOfReplies).text() !== '0') {
                        $(this).nextAll(discussionReplyTopicBottom).show();
                    }
                }else{
                    $(this).nextAll(discussionTopicRepliesContainer).hide();
                    $repliesIcon.addClass(discussionShowRepliesIcon);
                    $repliesIcon.removeClass(discussionHideRepliesIcon);
                    $(this).nextAll(discussionReplyTopicBottom).hide();
                }
            });

            // Open quoted reply fields
            $rootel.on('click', discussionQuote, function(e) {
                var replyParent = $(this).parents(discussionTopicContainer);
                replyParent.find(discussionReplyTopicBottom).hide();
                var postId = replyParent.attr('id').split('discussion_post_')[1];
                var quotedMessage = $(this).parent().prev().children(discussionPostMessage).attr('data-source-text');
                var quotedUser = $(this).parents(s3dHighlightBackgroundClass).find(discussionPosterName).text();
                sakai.api.Util.TemplateRenderer(discussionTopicReplyTemplate, {'edit':false, 'quoted':true, 'quotedUser':quotedUser, 'quotedMessage':quotedMessage, 'postId': postId}, replyParent.children(discussionTopicReplyContainer));
                var replyValidateOpts = {
                    submitHandler: doAddReply
                };
                sakai.api.Util.Forms.validate($('.discussion_reply_form', $rootel), replyValidateOpts, true);
                replyParent.children(discussionTopicReplyContainer).show();
                replyParent.find(discussionTopicReplyText).focus();
            });

            // Open reply fields
            $rootel.on('click', discussionReplyTopic, function() {
                var replyParent = $(this).parents(discussionTopicContainer);
                replyParent.find(discussionReplyTopicBottom).hide();
                var postId = replyParent.attr('id').split('discussion_post_')[1];
                sakai.api.Util.TemplateRenderer(discussionTopicReplyTemplate, {'edit':false, 'quoted':false, 'postId': postId}, replyParent.children(discussionTopicReplyContainer));
                var replyValidateOpts = {
                    submitHandler: doAddReply
                };
                sakai.api.Util.Forms.validate($('.discussion_reply_form', $rootel), replyValidateOpts, true);
                replyParent.children(discussionTopicReplyContainer).show();
                replyParent.find(discussionTopicReplyText).focus();
            });

            $rootel.on('click', discussionDontAddReply, function() {
                $(this).parents(discussionTopicReplyContainer).hide();
                if (!$(this).parents(discussionTopicContainer).find(discussionRepliesIcon).hasClass(discussionShowRepliesIcon)) {
                    $(this).parents(discussionTopicContainer).find(discussionReplyTopicBottom).show();
                }
            });

            // DELETE REPLIES //
            // Delete reply
            $rootel.on('click', discussionDelete, function() {
                deletePost($(this).parents(s3dHighlightBackgroundClass).attr('id'), true, $(this).parents(s3dHighlightBackgroundClass));
            });

            // Restore reply
            $rootel.on('click', discussionRestore, function() {
                deletePost($(this).parents(s3dHighlightBackgroundClass).attr('id'), false, $(this).parents(s3dHighlightBackgroundClass));
            });

            $rootel.on('click', discussionHideReply, function() {
                $(this).children('span').toggle();
                $(this).parent().nextAll(discussionReplyContents).toggle();
            });

            // EDIT POST //
            $rootel.on('click', discussionEdit, function() {
                var renderData = {};
                if ($(this).parent().prevAll(discussionQuotedTextContainer).length) {
                    renderData = {
                        'edit': true,
                        'quoted': true,
                        'quotedUser': $(this).parents(s3dHighlightBackgroundClass).find(discussionReplyContentsTextQuoted).text(),
                        'quotedMessage': $.trim($(this).parent().prevAll(discussionQuotedTextContainer).children(discussionReplyContentsText).attr('data-source-text')),
                        'body': $.trim($(this).parent().parent().find(discussionPostMessage).attr('data-source-text'))
                    };
                } else {
                    renderData = {
                        'edit': true,
                        'quoted': false,
                        'quotedUser': false,
                        'body': $.trim($(this).parent().parent().find(discussionPostMessage).attr('data-source-text'))
                    };
                }
                // Undo the saneHTMLAttribute applied in the template
                renderData.body = renderData.body.replace(/\\\"/g, '"').replace(/\\\'/g, '\'');
                $(this).parents(s3dHighlightBackgroundClass).children( discussionEntityContainer + ',' + discussionReplyContents).hide();
                sakai.api.Util.TemplateRenderer(discussionTopicReplyTemplate, renderData, $(this).parents(s3dHighlightBackgroundClass).children(discussionEditContainer));
                var editValidateOpts = {
                    submitHandler: saveEdit
                };
                sakai.api.Util.Forms.validate($('.discussion_edit_form', $rootel), editValidateOpts, true);
            });

            $rootel.on('click', discussionDontSaveEdit, function() {
                $(this).parents(s3dHighlightBackgroundClass).children(discussionEntityContainer + ',' + discussionReplyContents).show();
                $(this).parents(discussionEditContainer).text('');
            });

            $(window).on('edit.contentauthoring.sakai', function() {
                $(discussionCreateNewTopic, $rootel).hide();
                showPosts(cachedPosts, true);
                disableEditButtons();
            });
            $(window).on('render.contentauthoring.sakai', enableEditButtons);
        };


        //////////////////////
        // Initial function //
        //////////////////////

        var init = function() {
            addBinding();
            checkMessageStore();
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad('discussion');
});
