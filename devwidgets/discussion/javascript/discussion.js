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
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 * /dev/lib/jquery/plugins/jquery.cookie.js (cookie)
 */
/*global Config, $ */

require(["jquery", "sakai/sakai.api.core", "jquery-plugins/jquery.cookie"], function($, sakai) {

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
    sakai_global.discussion = function(tuid, showSettings, widgetData){

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $("#" + tuid); // Get the main div used by the widget
        var widgeturl = sakai.api.Widgets.widgetLoader.widgets[tuid] ? sakai.api.Widgets.widgetLoader.widgets[tuid].placement : false;
        var store = "";
        var widgetSettings = {};
        var topicData = {};
        // Each post gets a marker which is basicly the widget ID.
        // If we are using another discussion this marker will be the ID of that widget.
        var marker = tuid;
        var addTopics = false,
            addReplies = false;

        // Containers
        var $discussionContainer = $("#discussion_container", $rootel);
        var $discussionMainContainer = $("#discussion_main_container", $rootel);
        var discussionSettingsPermissionsContainer = "#discussion_settings_permissions_container";
        var discussionNoInitialTopic = "#discussion_no_initial_topic";
        var discussionCreateNewTopic = "#discussion_create_new_topic";
        var $discussionListTopics = $("#discussion_list_topics", $rootel);
        var discussionListTopicsContainer = "#discussion_list_topics_container";
        var discussionTabContentSettingsContainer = "#discussion_tab_content_settings_container";
        var discussionTopicContainer = ".discussion_topic_container";
        var discussionTopicReplyContainer = "#discussion_topic_reply_container";
        var discussionTopicRepliesContainer = ".discussion_topic_replies_container";
        var discussionQuotedTextContainer = ".discussion_quoted_text_container";
        var discussionEntityContainer = ".discussion_entity_container";

        // Templates
        var discussionTabContentSettingsTemplate = "discussion_tab_content_settings_template";
        var discussionListTopicsTemplate = "discussion_list_topics_template";
        var discussionNoInitialTopicTemplate = "discussion_no_initial_topic_template";
        var discussionTopicReplyTemplate = "discussion_topic_reply_template";
        var discussionDeletedPostActionsTemplate = "discussion_deleted_post_actions_template";
        var discussionDeletedPostEntityInfoTemplate = "discussion_deleted_post_entity_info_template";
        var discussionRestoredPostActionsTemplate = "discussion_restored_post_actions_template";
        var discussionTopicNewlyPostedReplyTemplate = "discussion_topic_newly_posted_reply_template";

        // Settings
        var parsedSettings = {};
        var $discussionSettings = $("#discussion_settings", $rootel);
        var $discussionSettingsSubmit = $("#discussion_settings_submit", $rootel);
        var $discussionSettingsCancel = $("#discussion_settings_cancel", $rootel);

        // Add new topic
        var discussionAddNewTopic = "#discussion_add_new_topic";
        var discussionDontAddTopic= "#discussion_dont_add_topic";
        var discussionAddTopic= "#discussion_add_topic";
        var discussionCreateNewTopicTitle = "#discussion_create_new_topic_title";
        var discussionCreateNewTopicMessageText = "#discussion_create_new_topic_message_text";
        var discussionCreateNewTopicForm = "#discussion_create_new_topic form";

        // Replies
        var discussionRepliesIcon = ".discussion_replies_icon";
        var discussionTopicReplyText = "#discussion_topic_reply_text";
        var discussionTopicQuotedText = "#discussion_topic_quoted_text";
        var discussionExpandAll = "#discussion_expand_all";
        var discussionShowTopicReplies = ".discussion_show_topic_replies";
        var discussionQuote = ".discussion_quote";
        var discussionPostMessage = ".discussion_post_message";
        var discussionReplyTopic = "#discussion_reply_topic";
        var discussionDontAddReply = "#discussion_dont_add_reply";
        var discussionAddReply = "#discussion_add_reply";
        var discussionHideReply = ".discussion_hide_reply";
        var discussionReplyContents = ".discussion_reply_contents";
        var discussionReplyContentsText = ".discussion_reply_contents_text";
        var discussionTopicReplyQuotedUser = "#discussion_topic_reply_quoted_user";
        var discussionReplyContentsTextQuoted = ".discussion_reply_contents_text_quoted";
        var discussionPosterName = ".discussion_poster_name";
        var discussionPostingDate = ".discussion_posting_date";
        var discussionUpdatingDate = ".discussion_updating_date";
        var discussionNumberOfReplies = ".discussion_number_of_replies";
        var discussionReplyTopicBottom = ".discussion_reply_topic_bottom";

        // Edit
        var discussionEdit = ".discussion_edit";
        var discussionEditContainer = ".discussion_edit_container";
        var discussionDontSaveEdit = "#discussion_dont_save_edit";
        var discussionSaveEdit = "#discussion_save_edit";

        // Delete
        var discussionDelete = ".discussion_delete";
        var discussionRestore = ".discussion_restore";
        var discussionMessageOptions = ".discussion_message_options";
        var discussionDeletedMessage = ".discussion_deleted_message";

        // Classes
        var discussionExpandAllClass = "discussion_expand_all";
        var discussionCollapseAllClass = "discussion_collapse_all";
        var discussionShowRepliesIcon = "discussion_show_replies_icon";
        var discussionHideRepliesIcon = "discussion_hide_replies_icon";
        var s3dHighlightBackgroundClass = ".s3d-highlight_area_background";
        var discussionDeletedReplyClass = "discussion_deleted_reply";

        // i18n
        var $discussionCollapseAll = $("#discussion_i18n_collapse_all", $rootel);
        var $discussionExpandAll = $("#discussion_i18n_expand_all", $rootel);
        var $discussionShow = $("#discussion_i18n_show", $rootel);
        var $discussionHide = $("#discussion_i18n_hide", $rootel);

        var continueInit = function(){
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
         * Check if the message store already exists
         * If it does not exists we need to create one
         */
        var checkMessageStore = function(){
            if (widgeturl) {
                store = widgeturl + "/message";
                $.ajax({
                    url: widgeturl + ".0.json",
                    type: "GET",
                    dataType: "json",
                    success: function(data){
                        continueInit();
                    },
                    error: function(xhr, textStatus, thrownError){
                        if (xhr.status == 404) {
                            showSettings = true;
                            continueInit();
                            // we need to create the initial message store
                            $.post(store, {
                                "sling:resourceType": "sakai/messagestore"
                            });
                        }
                    }
                });
            }
        };

        /**
         * Parse the picture for a user
         * @param {Object} profile The profile for a user
         */
        var parsePicture = function(profile){
            var picture = sakai.api.Util.constructProfilePicture(profile);
            if (picture) {
                return picture;
            } else {
                return "/dev/images/user_avatar_icon_32x32.png";
            }
        };

        /**
         * Parse a json integer to a valid date
         * @param {Integer} dateInput Integer of a date that needs to be parsed
         * @returns {Date}
         */
        var parseDate = function(dateInput){
            if (dateInput !== null) {
                return sakai.api.l10n.fromEpoch(dateInput, sakai.data.me);
            }
            return null;
        };

        var parseQuote = function(message){
            var quote = false;
            if (message.substring(0,6) === "[quote") {
                // Parse the quoted message
                quote = message.split("[/quote]")[0];
                quote = quote.substring(quote.indexOf("]") + 1, quote.length);
                // Parse the original author
                var by = message.split("[/quote]")[0];
                by = by.substring(by.indexOf("\"") + 1, by.indexOf("]") - 1);
                return {"quote":quote, "by":by};
            } else {
                return quote;
            }
        };

        /**
         * Callback function to sort replies based on created timestamp
         */
        var sortReplies = function(a, b){
            return a.post._created - b.post._created;
        };

        var renderPosts = function(arrPosts){
            // Loop fetched posts and do markup
            for (var i = 0, j = arrPosts.length; i < j; i++) {
                arrPosts[i].post.profile[0].pictureImg = parsePicture(arrPosts[i].post.profile[0]);
                arrPosts[i].post["sakai:createdOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post["_created"]));
                if(arrPosts[i].post["sakai:editedOn"]){
                    arrPosts[i].post["sakai:editedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post["sakai:editedOn"]));
                }
                for(var ii = 0, jj = arrPosts[i].replies.length; ii < jj; ii++){
                    arrPosts[i].replies[ii].post.profile[0].pictureImg = parsePicture(arrPosts[i].replies[ii].post.profile[0]);
                    arrPosts[i].replies[ii].post["sakai:createdOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["_created"]));
                    if(arrPosts[i].replies[ii].post["sakai:deletedOn"]){
                        arrPosts[i].replies[ii].post["sakai:deletedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["sakai:deletedOn"]));
                    }
                    if(arrPosts[i].replies[ii].post["sakai:editedOn"]){
                        arrPosts[i].replies[ii].post["sakai:editedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["sakai:editedOn"]));
                    }
                    arrPosts[i].replies[ii].post["sakai:quoted"] = parseQuote(arrPosts[i].replies[ii].post["sakai:body"]);
                    if(arrPosts[i].replies[ii].post["sakai:body"].split(["[/quote]"])[1]){
                        arrPosts[i].replies[ii].post["sakai:body"] = arrPosts[i].replies[ii].post["sakai:body"].split(["[/quote]"])[1];
                    }
                }
                // Sort replies
                arrPosts[i].replies.sort(sortReplies);
            }

            // Render formatted posts
            sakai.api.Util.TemplateRenderer(discussionListTopicsTemplate, {
                "postData":arrPosts,
                "settings":parsedSettings
            }, $(discussionListTopicsContainer, $rootel));
        };

        var setEllipsis = function(){
            $(".discussion_ellipsis_container").css("width", $(".discussion_ellipsis_container").width() + "px");

            $(".discussion_ellipsis_container").ThreeDots({
                max_rows: 4,
                text_span_class: "discussion_ellipsis_text",
                e_span_class: "discussion_e_span_class",
                ellipsis_string:"...<a href=\"javascript:;\" class=\"discussion_show_all_ellipsis_text s3d-regular-links\">More</a>",
                whole_word: false,
                alt_text_t: true
            });
        };

        /**
         * Show all the posts in the main view
         * @param {String} response Json response with all the posts
         * @param {Boolean} exists Check if the discussion exists
         */
        var showPosts = function(response, exists){
            if (exists && response.total !== 0) {
                topicData = response;
                try {
                    renderPosts(response.results);
                    $discussionListTopics.show();
                    setEllipsis();

                    var cookieData = $.parseJSON($.cookie(tuid));
                    // loop through the posts
                    for (var i in response.results) {
                        if (response.results[i].post && response.results[i].replies && response.results[i].replies.length) {
                            var postId = "discussion_post_" + response.results[i].post["sakai:id"];
                            if (!(cookieData && cookieData[postId] && cookieData[postId].option === "hide")){
                                // expand the thread
                                $("#" + postId + " a" + discussionShowTopicReplies, $rootel).click();
                            }
                        }
                    }
                } catch (err) {
                }
            } else {
                // No topics yet
                sakai.api.Util.TemplateRenderer(discussionNoInitialTopicTemplate, {
                    "settings": parsedSettings
                }, $(discussionNoInitialTopic, $rootel));
                $(discussionNoInitialTopic, $rootel).show();
            }
        };

        /**
         * Displays the settings.
         */
        var displaySettings = function(){
            // Render settings
            sakai.api.Util.TemplateRenderer(discussionTabContentSettingsTemplate, {
                "settings":widgetSettings
            }, $(discussionTabContentSettingsContainer, $rootel));
            // Hide/Show elements
            $discussionMainContainer.hide();
            $discussionSettings.show();
        };

        /**
         * Get the id of the dicussion widget and show the post including replies
         */
        var getPosts = function(){
            var s = store;
            var url = sakai.config.URL.DISCUSSION_GETPOSTS_THREADED.replace(/__PATH__/, s).replace(/__MARKER__/, marker);
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    showPosts(data, true);
                }
            });
        };

        var parseSettings = function(data){
            var contact = false;
            var canEditPage = sakai.api.Widgets.canEditContainer(widgetData);
            parsedSettings["ismanager"] = canEditPage;
            // Anonymous can't do anything
            if (sakai.api.User.isAnonymous(sakai.data.me)) {
                parsedSettings["addtopic"] = false;
                parsedSettings["canreply"] = false;
                parsedSettings["anon"] = true;
            } else {
                parsedSettings["anon"] = false;
                parsedSettings["userid"] = sakai.data.me.user.userid;

                // Check for who can add topics
                if (data["whocanaddtopic"] === "managers_only") {
                    if (canEditPage) {
                        parsedSettings["addtopic"] = true;
                    } else {
                        parsedSettings["addtopic"] = false;
                    }
                } else {
                    parsedSettings["addtopic"] = true;
                }

                // Check for who can add replies
                if (data["whocanreply"] === "anyone") {
                    parsedSettings["canreply"] = true;
                } else {
                    if (canEditPage) {
                        parsedSettings["canreply"] = true;
                    }
                }
            }
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
                getPosts();
            }
        };

        /**
         * Fetches the widget settings and places it in the widgetSettings var.
         */
        var getWidgetSettings = function(){
            if (widgetData.discussion) {
                processWidgetData(widgetData.discussion);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                    if (success) {
                        processWidgetData(data);
                    } else {
                        // We don't have settings for this widget yet.
                        if (showSettings) {
                            displaySettings();
                        }
                    }

                });
            }
        };

        /**
         * Closes the settings container.
         */
        var finishSettingsContainer = function(){
            sakai.api.Widgets.Container.informFinish(tuid, "discussion");
        };

        /**
         * Saves the settings for the widget
         * @param {Object} callback Function to be executed after saving the data
         */
        var saveSettings = function(callback){
            var data = widgetSettings;

            widgetSettings['replytype'] = $("#discussion_settings_reply_options input[type='radio']:checked", $rootel).val();
            widgetSettings['whocanaddtopic'] = $("#discussion_settings_permissions_add_new input[type='radio']:checked", $rootel).val();
            widgetSettings['whocanreply'] = $("#discussion_settings_permissions_who_can_reply input[type='radio']:checked", $rootel).val();
            widgetSettings['marker'] = marker;

            // JCR properties are not necessary.
            delete data["jcr:primaryType"];

            // don't save messages this way
            delete data["message"];

            sakai.api.Widgets.saveWidgetData(tuid, data, callback);
        };

        /**
         * Creates a new topic
         */
        var createTopic = function(){
            var postData = {
                "sakai:type": "discussion",
                "sling:resourceType": "sakai/message",
                "sakai:to": "discussion:" + store,
                'sakai:subject': $(discussionCreateNewTopicTitle, $rootel).val(),
                'sakai:body': $(discussionCreateNewTopicMessageText, $rootel).val(),
                'sakai:initialpost': true,
                'sakai:writeto': store,
                'sakai:marker': tuid,
                'sakai:messagebox': "pending",
                'sakai:sendstate': "pending",
                '_charset_': "utf-8"
            };

            $.ajax({
                url: store + ".create.html",
                cache: false,
                type: 'POST',
                data: postData,
                success: function(data){
                    $(discussionCreateNewTopicTitle, $rootel).val("");
                    $(discussionCreateNewTopicMessageText, $rootel).val("");
                    $(discussionCreateNewTopic, $rootel).hide();

                    data.message["profile"] = [sakai.data.me.profile];

                    if (!topicData.results){
                        topicData.results = [];
                    }
                    topicData.results.unshift({"post": data.message, "replies": []});
                    showPosts(topicData, true);

                    getWidgetSettings();
                }
            });
        };

        /**
         * Reply to a post.
         * @param {String} id The ID of the topic that's being replied on
         * @param {String} body The message in the reply
         * @param {String} $parentDiv the parent div that should be hidden on success
         */
        var replyToTopic = function(id, body, $parentDiv){
            var object = {
                "sakai:body": body,
                "sakai:marker": marker,
                "sakai:type": "discussion",
                "sling:resourceType": "sakai/message",
                "sakai:replyon": id,
                "sakai:messagebox": "pending",
                "sakai:sendstate": "pending",
                "sakai:to": "discussion:" + store,
                "sakai:deleted": false,
                "_charset_": "utf-8"
            };
            var url = store + ".create.html";
            $.ajax({
                url: url,
                type: "POST",
                success: function(data){
                    $parentDiv.hide();

                    data.message["profile"] = $.extend(data.message["profile"], sakai.data.me.profile);
                    data.message.profile.pictureImg = parsePicture(data.message.profile);
                    data.message["_created"] = sakai.api.l10n.transformDateTimeShort(parseDate(data.message["_created"]));
                    data.message["sakai:createdOn"] = data.message["_created"];

                    data.message["sakai:quoted"] = parseQuote(data.message["sakai:body"]);
                    if (data.message["sakai:body"].split(["[/quote]"])[1]) {
                        data.message["sakai:body"] = data.message["sakai:body"].split(["[/quote]"])[1];
                    }

                    var renderedTemplate = sakai.api.Util.TemplateRenderer(discussionTopicNewlyPostedReplyTemplate, {
                        "post":data,
                        "settings": parsedSettings
                    });

                    $parentDiv.prevAll(discussionTopicRepliesContainer).append(renderedTemplate);

                    $parentDiv.parents(discussionTopicContainer).find(discussionNumberOfReplies).text(parseInt($parentDiv.parents(discussionTopicContainer).find(discussionNumberOfReplies).text(), 10) + 1);
                },
                error: function(xhr, textStatus, thrownError){
                    if (xhr.status === 401) {
                        $parentDiv.hide();
                        sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("YOU_CANT_REPLY"), "", sakai.api.Util.notification.type.ERROR);
                    }
                    else {
                        sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_ADD_REPLY"), "", sakai.api.Util.notification.type.ERROR);
                    }
                },
                data: object
            });
        };

        var doAddReply = function(){
            var replyParent = $(this).parents(discussionTopicContainer);
            var topicId = replyParent[0].id.split("discussion_post_")[1];
            var message = $.trim(replyParent.children(discussionTopicReplyContainer).children(discussionTopicReplyText).val());

            if (message){
                if(replyParent.children(discussionTopicReplyContainer).children(discussionTopicQuotedText).length && replyParent.children(discussionTopicReplyContainer).children(discussionTopicQuotedText).val()){
                    message = "[quote=\"" + $.trim($(discussionTopicReplyQuotedUser, $rootel).text()) + "\"]" + $.trim(replyParent.children(discussionTopicReplyContainer).children(discussionTopicQuotedText).val()) + "[/quote]" + message;
                }

                replyToTopic(topicId, message, $(this).parents(discussionTopicReplyContainer));

                var $repliesIcon = replyParent.find(discussionRepliesIcon);
                if ($repliesIcon.hasClass(discussionShowRepliesIcon)) {
                    // expand topic reply list
                    $("#discussion_post_" + topicId + " " + discussionShowTopicReplies, $rootel).click();
                }
                $(discussionTopicReplyQuotedUser, $rootel).text("");
            }
        };

        /**
         * Deletes or undeletes the post with the provided id.
         * @param {String} id The id of the post.
         * @param {boolean} deleteValue true = delete, false = undelete
         */
        var deletePost = function(id, deleteValue, post){
            var url = store + "/inbox/" + id;
            var data = {
                "sakai:deleted": deleteValue,
                "sakai:deletedBy": sakai.api.User.getDisplayName(sakai.data.me.profile),
                "sakai:deletedOn": sakai.api.Util.createSakaiDate(new Date())
            };
            $.ajax({
                url: url,
                type: "POST",
                data: data,
                success: function(){
                    if (deleteValue) {
                        // Apply grey class
                        post.addClass(discussionDeletedReplyClass);

                        // hide message option links
                        $("#" + id + " " + discussionMessageOptions).hide();

                        // Remove/add links and information
                        post.find(discussionPostMessage).nextAll().remove();
                        post.find(discussionPostMessage).after(sakai.api.Util.TemplateRenderer(discussionDeletedPostActionsTemplate, {}));
                        post.find(discussionPostingDate).after(sakai.api.Util.TemplateRenderer(discussionDeletedPostEntityInfoTemplate, {
                            "deletedBy": sakai.api.User.getDisplayName(sakai.data.me.profile),
                            "deletedOn": sakai.api.l10n.transformDateTimeShort(parseDate(sakai.api.Util.createSakaiDate(new Date())))
                        }));
                    }else{
                        // Apply grey class
                        post.removeClass(discussionDeletedReplyClass);

                        // hide message option links
                        $("#" + id + " " + discussionMessageOptions).hide();
                        $(discussionDeletedMessage).hide();

                        // Remove links
                        post.find(discussionPostingDate).next().remove();
                        post.find(discussionPostMessage).nextAll().remove();
                        post.find(discussionPostMessage).after(sakai.api.Util.TemplateRenderer(discussionRestoredPostActionsTemplate, {}));
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_DELETE_POST"),"",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        var updatePost = function(id, body, quote, quoted, post){
            var url = store + "/inbox/" + id;
            var data = {
                "sakai:edited": true,
                "sakai:editedBy": sakai.api.User.getDisplayName(sakai.data.me.profile),
                "sakai:editedOn": sakai.api.Util.createSakaiDate(new Date()),
                "sakai:body": body
            };
            if(quote){
                data["sakai:body"] = "[quote=\"" + quoted + "\"]" + quote + "[/quote]" + body;
            }

            $.ajax({
                url: url,
                type: "POST",
                data: data,
                success: function(){
                    // remove edit divs
                    post.find(discussionEditContainer).children().remove();

                    // Set post data
                    post.find(discussionPostMessage).text(body);
                    post.find(discussionReplyContentsText).text(quote);

                    // Set entity data
                    post.children(discussionEntityContainer).find(discussionUpdatingDate).children("span").text(sakai.api.User.getDisplayName(sakai.data.me.profile) + " " + sakai.api.l10n.transformDateTimeShort(parseDate(sakai.api.Util.createSakaiDate(new Date()))));
                    post.children(discussionEntityContainer).children(discussionPostingDate).children().show();

                    // Show all
                    post.children(".discussion_entity_container, .discussion_reply_contents").show();
                }
            });
        };

        /**
         * Set thread view for the user by cookie
         * @param {String} postId The post ID
         * @param {String} option Option to show or hide replies
         */
        var setPostView = function(postId, option){
            if (postId) {
                var cookieData = $.parseJSON($.cookie(tuid));
                if (!cookieData) {
                    cookieData = {};
                }

                // if the option is show then we remove the data for the post from the cookie, since it will show by default
                if (option === "show") {
                    delete cookieData[postId];
                } else {
                    cookieData[postId] = {
                        "option": option
                    };
                }
                $.cookie(tuid, $.toJSON(cookieData));
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBinding = function() {
            $(discussionExpandAll, $rootel).die("click");
            $(discussionExpandAll, $rootel).live("click", function(){
                if($(discussionExpandAll, $rootel).hasClass(discussionExpandAllClass)){
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
            $discussionSettingsSubmit.bind("click", function(e, ui){
                saveSettings(finishSettingsContainer);
            });

            // Cancel button
            $discussionSettingsCancel.bind("click", function(e, ui){
                sakai.api.Widgets.Container.informCancel(tuid, "discussion");
            });

            // NEW TOPIC //
            $(discussionAddNewTopic, $rootel).live("click", function(){
                $discussionListTopics.hide();
                $(discussionNoInitialTopic, $rootel).hide();
                $(discussionCreateNewTopic, $rootel).show();
            });

            $(discussionDontAddTopic, $rootel).bind("click", function(){
                $(discussionCreateNewTopic, $rootel).hide();
                getWidgetSettings();
            });

            $(discussionCreateNewTopicForm, $rootel).validate({
                submitHandler: function(form){
                    createTopic();
                }
            });

            $(".discussion_show_all_ellipsis_text", $rootel).live("click", function(){
                $(this).parent().prev().text($(this).parent().prev()[0].title);
                $(this).parent().remove();
            });

            // REPLY TOPIC //
            $(discussionShowTopicReplies, $rootel).die("click");
            $(discussionShowTopicReplies, $rootel).live("click",function(){
                var $repliesIcon = $(this).children(discussionRepliesIcon);
                var postId = $(this).parent().attr("id");
                if($repliesIcon.hasClass(discussionShowRepliesIcon)){
                    $(this).nextAll(discussionTopicRepliesContainer).show();
                    $repliesIcon.removeClass(discussionShowRepliesIcon);
                    $repliesIcon.addClass(discussionHideRepliesIcon);
                    if ($repliesIcon.next().children(discussionNumberOfReplies).text() != "0") {
                        $(this).nextAll(discussionReplyTopicBottom).show();
                    }
                    setPostView(postId, "show");
                }else{
                    $(this).nextAll(discussionTopicRepliesContainer).hide();
                    $repliesIcon.addClass(discussionShowRepliesIcon);
                    $repliesIcon.removeClass(discussionHideRepliesIcon);
                    $(this).nextAll(discussionReplyTopicBottom).hide();
                    setPostView(postId, "hide");
                }
            });

            // Open quoted reply fields
            $(discussionQuote, $rootel).live("click", function(){
                var replyParent = $(this).parents(discussionTopicContainer);
                var postId = replyParent[0].id.split("discussion_post_")[1];
                sakai.api.Util.TemplateRenderer(discussionTopicReplyTemplate, {"edit":false, "quoted":true, "quotedUser":$(this).parents(s3dHighlightBackgroundClass).find(discussionPosterName).text(), "quotedMessage":$(this).parent().prev().children(discussionPostMessage).text(), "postId": postId}, replyParent.children(discussionTopicReplyContainer));
                replyParent.children(discussionTopicReplyContainer).show();
                replyParent.find(discussionTopicReplyText).focus();
            });

            // Open reply fields
            $(discussionReplyTopic, $rootel).live("click", function(){
                var replyParent = $(this).parents(discussionTopicContainer);
                var postId = replyParent[0].id.split("discussion_post_")[1];
                sakai.api.Util.TemplateRenderer(discussionTopicReplyTemplate, {"edit":false, "quoted":false, "postId": postId}, replyParent.children(discussionTopicReplyContainer));
                replyParent.children(discussionTopicReplyContainer).show();
                replyParent.find(discussionTopicReplyText).focus();
            });

            $(discussionDontAddReply, $rootel).live("click", function(){
                $(this).parents(discussionTopicReplyContainer).hide();
            });

            // Make the actual reply
            $(discussionAddReply, $rootel).die("click");
            $(discussionAddReply, $rootel).live("click", doAddReply);

            // DELETE REPLIES //
            // Delete reply
            $(discussionDelete, $rootel).live("click", function(){
                deletePost($(this).parents(s3dHighlightBackgroundClass)[0].id, true, $(this).parents(s3dHighlightBackgroundClass));
            });

            // Restore reply
            $(discussionRestore, $rootel).live("click", function(){
                deletePost($(this).parents(s3dHighlightBackgroundClass)[0].id, false, $(this).parents(s3dHighlightBackgroundClass));
            });

            $(discussionHideReply, $rootel).live("click", function(){
                $(this).children("span").toggle();
                $(this).parent().nextAll(discussionReplyContents).toggle();
            });

            // EDIT POST //
            $(discussionEdit, $rootel).live("click", function(){
                var renderData = {};
                if ($(this).parent().prevAll(discussionQuotedTextContainer).length) {
                    renderData = {
                        "edit": true,
                        "quoted": true,
                        "quotedUser": $(this).parents(s3dHighlightBackgroundClass).find(discussionReplyContentsTextQuoted).text(),
                        "quotedMessage": $.trim($(this).parent().prevAll(discussionQuotedTextContainer).children(discussionReplyContentsText).text()),
                        "body": $.trim($(this).parent().parent().find(discussionPostMessage).text())
                    };
                } else {
                    renderData = {
                        "edit": true,
                        "quoted": false,
                        "quotedUser": false,
                        "body": $.trim($(this).parent().parent().find(discussionPostMessage).text())
                    };
                }
                $(this).parents(s3dHighlightBackgroundClass).children( discussionEntityContainer + "," + discussionReplyContents).hide();
                sakai.api.Util.TemplateRenderer(discussionTopicReplyTemplate, renderData, $(this).parents(s3dHighlightBackgroundClass).children(discussionEditContainer));
            });

            $(discussionDontSaveEdit, $rootel).live("click", function(){
                $(this).parents(s3dHighlightBackgroundClass).children(discussionEntityContainer + "," + discussionReplyContents).show();
                $(this).parents(discussionEditContainer).text("");
            });

            $(discussionSaveEdit, $rootel).live("click", function(){
                var editParent = $(this).parents(discussionEditContainer);
                var id = $(this).parents(s3dHighlightBackgroundClass)[0].id;
                var body = $.trim(editParent.children(discussionTopicReplyText).val());
                var quote = $.trim(editParent.children(discussionTopicQuotedText).val());
                var quoted = $(this).parents(s3dHighlightBackgroundClass).find(discussionReplyContentsTextQuoted).text();
                var post = $(this).parents(s3dHighlightBackgroundClass);

                if (body) {
                    updatePost(id, body, quote, quoted, post);
                }
            });
        };


        //////////////////////
        // Initial function //
        //////////////////////

        var init = function(){
            addBinding();
            checkMessageStore();
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("discussion");
});