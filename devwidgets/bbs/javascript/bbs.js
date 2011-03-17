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
 */
/*global Config, $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.bbs
     *
     * @class bbs
     *
     * @description
     * Initialize the bbs widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.bbs = function(tuid, showSettings){


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

        // Containers
        var $bbsContainer = $("#bbs_container", $rootel);
        var $bbsMainContainer = $("#bbs_main_container", $rootel);
        var bbsSettingsPermissionsContainer = "#bbs_settings_permissions_container";
        var bbsNoInitialTopic = "#bbs_no_initial_topic";
        var bbsCreateNewTopic = "#bbs_create_new_topic";
        var $bbsListTopics = $("#bbs_list_topics", $rootel);
        var bbsListTopicsContainer = "#bbs_list_topics_container";
        var bbsTabContentSettingsContainer = "#bbs_tab_content_settings_container";
        var bbsTopicContainer = ".bbs_topic_container";
        var bbsTopicReplyContainer = "#bbs_topic_reply_container";
        var bbsTopicRepliesContainer = ".bbs_topic_replies_container";
        var bbsQuotedTextContainer = ".bbs_quoted_text_container";
        var bbsEntityContainer = ".bbs_entity_container";

        // Templates
        var bbsTabContentSettingsTemplate = "bbs_tab_content_settings_template";
        var bbsListTopicsTemplate = "bbs_list_topics_template";
        var bbsNoInitialTopicTemplate = "bbs_no_initial_topic_template";
        var bbsTopicReplyTemplate = "bbs_topic_reply_template";
        var bbsDeletedPostActionsTemplate = "bbs_deleted_post_actions_template";
        var bbsDeletedPostEntityInfoTemplate = "bbs_deleted_post_entity_info_template";
        var bbsRestoredPostActionsTemplate = "bbs_restored_post_actions_template";
        var bbsTopicNewlyPostedReplyTemplate = "bbs_topic_newly_posted_reply_template";

        // Settings
        var parsedSettings = {};
        var $bbsSettings = $("#bbs_settings", $rootel);
        var $bbsSettingsSubmit = $("#bbs_settings_submit", $rootel);
        var $bbsSettingsCancel = $("#bbs_settings_cancel", $rootel);

        // Add new topic
        var bbsAddNewTopic = "#bbs_add_new_topic";
        var bbsDontAddTopic= "#bbs_dont_add_topic";
        var bbsAddTopic= "#bbs_add_topic";
        var bbsCreateNewTopicTitle = "#bbs_create_new_topic_title";
        var bbsCreateNewTopicMessageText = "#bbs_create_new_topic_message_text";
        var bbsCreateNewTopicForm = "#bbs_create_new_topic form";

        // Replies
        var bbsRepliesIcon = ".bbs_replies_icon";
        var bbsTopicReplyText = "#bbs_topic_reply_text";
        var bbsTopicQuotedText = "#bbs_topic_quoted_text";
        var bbsExpandAll = "#bbs_expand_all";
        var bbsShowTopicReplies = ".bbs_show_topic_replies";
        var bbsQuote = ".bbs_quote";
        var bbsPostMessage = ".bbs_post_message";
        var bbsReplyTopic = "#bbs_reply_topic";
        var bbsDontAddReply = "#bbs_dont_add_reply";
        var bbsAddReply = "#bbs_add_reply";
        var bbsHideReply = ".bbs_hide_reply";
        var bbsReplyContents = ".bbs_reply_contents";
        var bbsReplyContentsText = ".bbs_reply_contents_text";
        var bbsTopicReplyQuotedUser = "#bbs_topic_reply_quoted_user";
        var bbsReplyContentsTextQuoted = ".bbs_reply_contents_text_quoted";
        var bbsPosterName = ".bbs_poster_name";
        var bbsPostingDate = ".bbs_posting_date";
        var bbsUpdatingDate = ".bbs_updating_date";
        var bbsNumberOfReplies = ".bbs_number_of_replies";
        var bbsReplyTopicBottom = ".bbs_reply_topic_bottom";

        // Edit
        var bbsEdit = ".bbs_edit";
        var bbsEditContainer = ".bbs_edit_container";
        var bbsDontSaveEdit = "#bbs_dont_save_edit";
        var bbsSaveEdit = "#bbs_save_edit";

        // Delete
        var bbsDelete = ".bbs_delete";
        var bbsRestore = ".bbs_restore";

        // Classes
        var bbsExpandAllClass = "bbs_expand_all";
        var bbsCollapseAllClass = "bbs_collapse_all";
        var bbsShowRepliesIcon = "bbs_show_replies_icon";
        var bbsHideRepliesIcon = "bbs_hide_replies_icon";
        var s3dHighlightBackgroundClass = ".s3d-highlight_area_background";
        var bbsDeletedReplyClass = "bbs_deleted_reply";

        // i18n
        var $bbsCollapseAll = $("#bbs_i18n_collapse_all", $rootel);
        var $bbsExpandAll = $("#bbs_i18n_expand_all", $rootel);
        var $bbsShow = $("#bbs_i18n_show", $rootel);
        var $bbsHide = $("#bbs_i18n_hide", $rootel);

        var continueInit = function(){
            getWidgetSettings();

            if (showSettings) {
                $bbsMainContainer.hide();
                $bbsSettings.show();
            }else{
                $bbsMainContainer.show();
                $bbsSettings.hide();
            }
        }

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
         * @param {String} profile The profile for a user
         * @param {String} uuid Uuid of the user
         */
        var parsePicture = function(uuid, pictureData){
            if (pictureData && $.parseJSON(pictureData) && $.parseJSON(pictureData).name) {
                return "/~" + uuid + "/public/profile/" + $.parseJSON(pictureData).name;
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
            //2009-08-19 11:29:53+0100
            //2009-08-19T10:58:27
            if (dateInput !== null) {
                /** Get the date with the use of regular expressions */
                var match = /([0-9]{4})\-([0-9]{2})\-([0-9]{2}).([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(dateInput); // 2009-08-14T12:18:50
                var d = new Date();
                if (match !== undefined) {
                    d.setYear(match[1]);
                    d.setMonth(match[2] - 1);
                    d.setDate(match[3]);
                    d.setHours(match[4]);
                    d.setMinutes(match[5]);
                    d.setSeconds(match[6]);
                }
                return d;
            }
            return null;
        };

        var parseQuote = function(message){
            var quote = false;
            if(message.substring(0,6) == "[quote"){
                // Parse the quoted message
                quote = message.split("[/quote]")[0];
                quote = quote.substring(quote.indexOf("]") + 1, quote.length);
                // Parse the original author
                var by = message.split("[/quote]")[0];
                by = by.substring(by.indexOf("\"") + 1, by.indexOf("]") - 1);
                return {"quote":quote, "by":by};
            }else{
                return quote;
            }
        };

        var renderPosts = function(arrPosts){
            // Loop fetched posts and do markup
            for (var i = 0, j = arrPosts.length; i < j; i++) {
                arrPosts[i].post.profile[0].pictureImg = parsePicture(arrPosts[i].post["sakai:from"], arrPosts[i].post.profile[0].picture);
                arrPosts[i].post["sakai:createdOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post["sakai:created"]));
                if(arrPosts[i].post["sakai:editedOn"]){
                    arrPosts[i].post["sakai:editedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post["sakai:editedOn"]));
                }
                for(var ii = 0, jj = arrPosts[i].replies.length; ii < jj; ii++){
                    arrPosts[i].replies[ii].post.profile[0].pictureImg = parsePicture(arrPosts[i].replies[ii].post["sakai:from"], arrPosts[i].replies[ii].post.profile[0].picture);
                    arrPosts[i].replies[ii].post["sakai:createdOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["sakai:created"]));
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
                arrPosts[i].replies.reverse();
            }

            // Render formatted posts
            sakai.api.Util.TemplateRenderer(bbsListTopicsTemplate, {
                "postData":arrPosts,
                "settings":parsedSettings
            }, $(bbsListTopicsContainer, $rootel));
        };

        var setEllipsis = function(){
            $(".bbs_ellipsis_container").css("width", $(".bbs_ellipsis_container").width() + "px");

            $(".bbs_ellipsis_container").ThreeDots({
                max_rows: 4,
                text_span_class: "bbs_ellipsis_text",
                e_span_class: "bbs_e_span_class",
                ellipsis_string:"...<a href=\"javascript:;\" class=\"bbs_show_all_ellipsis_text s3d-regular-links\">More</a>",
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
                    $bbsListTopics.show();
                    setEllipsis();
                } catch (err) {
                }
            } else {
                // No topics yet
                sakai.api.Util.TemplateRenderer(bbsNoInitialTopicTemplate, {
                    "settings": parsedSettings
                }, $(bbsNoInitialTopic, $rootel));
                $(bbsNoInitialTopic, $rootel).show();
            }
        };

        /**
         * Displays the settings.
         */
        var displaySettings = function(){
            // Render settings
            sakai.api.Util.TemplateRenderer(bbsTabContentSettingsTemplate, {
                "settings":widgetSettings
            }, $(bbsTabContentSettingsContainer, $rootel));
            // Hide/Show elements
            $bbsMainContainer.hide();
            $bbsSettings.show();
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
            if (sakai._isAnonymous) {
                parsedSettings["addtopic"] = false;
                parsedSettings["canreply"] = false;
                parsedSettings["anon"] = true;
            } else {
                parsedSettings["anon"] = false;
                parsedSettings["userid"] = sakai.data.me.user.userid;
                if (data["sakai:whocanaddtopic"] == "managers_only") {
                    if (sakai_global.currentgroup.manager) {
                        // Grant all permissions
                        parsedSettings["addtopic"] = true;
                    }
                    else {
                        parsedSettings["addtopic"] = false;
                    }
                }
                else {
                    if (sakai_global.currentgroup.manager) {
                        // Grant all permissions
                        parsedSettings["addtopic"] = true;
                    }
                    else {
                        // Check if the user is a member
                        parsedSettings["addtopic"] = false;
                        if (sakai_global.currentgroup.member) {
                            parsedSettings["addtopic"] = true;
                        }
                    }
                }
                if (data["sakai:whocanreply"] == "everyone") {
                    parsedSettings["canreply"] = true;
                }
                else {
                    if (sakai_global.currentgroup.manager) {
                        // Grant all permissions
                        parsedSettings["canreply"] = true;
                    }
                    else {
                        // Check if the user is a member
                        parsedSettings["canreply"] = false;
                        if (sakai_global.currentgroup.member) {
                            parsedSettings["canreply"] = true;
                        }
                    }
                }
            }
        };

        /**
         * Fetches the widget settings and places it in the widgetSettings var.
         */
        var getWidgetSettings = function(){
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    widgetSettings = $.extend(data, {}, true);
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
                }
                else {
                    // We don't have settings for this widget yet.
                    if (showSettings) {
                        displaySettings();
                    }
                }

            });
        };

        /**
         * Closes the settings container.
         */
        var finishSettingsContainer = function(){
            sakai.api.Widgets.Container.informFinish(tuid, "bbs");
        };

        /**
         * Saves the settings for the widget
         * @param {Object} callback Function to be executed after saving the data
         */
        var saveSettings = function(callback){
            var data = widgetSettings;

            widgetSettings['sakai:replytype'] = $("#bbs_settings_reply_options input[type='radio']:checked", $rootel).val();
            widgetSettings['sakai:whocanaddtopic'] = $("#bbs_settings_permissions_add_new input[type='radio']:checked", $rootel).val();
            widgetSettings['sakai:whocanreply'] = $("#bbs_settings_permissions_who_can_reply input[type='radio']:checked", $rootel).val();
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
                "sakai:to": "discussion:w-" + store,
                'sakai:subject': $(bbsCreateNewTopicTitle, $rootel).val(),
                'sakai:body': $(bbsCreateNewTopicMessageText, $rootel).val(),
                'sakai:initialpost': true,
                'sakai:writeto': store,
                'sakai:marker': tuid,
                'sakai:messagebox': "outbox",
                'sakai:sendstate': "pending",
                '_charset_': "utf-8"
            };

            $.ajax({
                url: store + ".create.html",
                cache: false,
                type: 'POST',
                data: postData,
                success: function(data){
                    $(bbsCreateNewTopicTitle, $rootel).val("");
                    $(bbsCreateNewTopicMessageText, $rootel).val("");
                    $(bbsCreateNewTopic, $rootel).hide();

                    data.message["profile"] = [sakai.data.me.profile];
                    //data.message.profile[0].picture = parsePicture(data.message["sakai:from"], data.message.profile.picture);

                    if (!topicData.results){
                        topicData.results = [];
                    }
                    topicData.results.push({"post": data.message, "replies": []});
                    showPosts(topicData, true);
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
                "sakai:messagebox": "outbox",
                "sakai:sendstate": "pending",
                "sakai:to": "discussion:w-" + store,
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
                    data.message.profile.pictureImg = parsePicture(data.message["sakai:from"], data.message.profile.picture);
                    data.message["sakai:created"] = sakai.api.l10n.transformDateTimeShort(parseDate(data.message["sakai:created"]));

                    data.message["sakai:quoted"] = parseQuote(data.message["sakai:body"]);
                    if (data.message["sakai:body"].split(["[/quote]"])[1]) {
                        data.message["sakai:body"] = data.message["sakai:body"].split(["[/quote]"])[1];
                    }

                    var renderedTemplate = sakai.api.Util.TemplateRenderer(bbsTopicNewlyPostedReplyTemplate, {
                        "post":data,
                        "settings": parsedSettings
                    });

                    $parentDiv.prevAll(bbsTopicRepliesContainer).append(renderedTemplate);

                    $parentDiv.parents(bbsTopicContainer).find(bbsNumberOfReplies).text(parseInt($parentDiv.parents(bbsTopicContainer).find(bbsNumberOfReplies).text(), 10) + 1);
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
            var replyParent = $(this).parents(bbsTopicContainer);
            var topicId = replyParent[0].id.split("bbs_post_")[1];
            var message = replyParent.children(bbsTopicReplyContainer).children(bbsTopicReplyText).val();

            if(replyParent.children(bbsTopicReplyContainer).children(bbsTopicQuotedText).length){
                message = "[quote=\"" + $(bbsTopicReplyQuotedUser, $rootel).text() + "\"]" + replyParent.children(bbsTopicReplyContainer).children(bbsTopicQuotedText).val() + "[/quote]" + message;
            }

            replyToTopic(topicId, message, $(this).parents(bbsTopicReplyContainer));
        };

        /**
         * Return hashed URL for the given ID.
         * e.g Id =testings
         * return te/st/in/gs/testings
         * @param {String} id Id of the post that needs to be edited
         *
         *
         */
        var replyId = function(id){
            return id.substring(0, 2) + '/' + id.substring(2, 4) + '/' + id.substring(4, 6) + '/' + id.substring(6, 8) + '/' + id;
        };

        /**
         * Deletes or undeletes the post with the provided id.
         * @param {String} id The id of the post.
         * @param {boolean} deleteValue true = delete, false = undelete
         */
        var deletePost = function(id, deleteValue, post){
            var url = store + "/" + replyId(id);
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
                        post.addClass(bbsDeletedReplyClass);

                        // Remove/add links and information
                        post.find(bbsPostMessage).nextAll().remove();
                        post.find(bbsPostMessage).after(sakai.api.Util.TemplateRenderer(bbsDeletedPostActionsTemplate, {}));
                        post.find(bbsPostingDate).after(sakai.api.Util.TemplateRenderer(bbsDeletedPostEntityInfoTemplate, {
                            "deletedBy": sakai.api.User.getDisplayName(sakai.data.me.profile),
                            "deletedOn": sakai.api.l10n.transformDateTimeShort(parseDate(sakai.api.Util.createSakaiDate(new Date())))
                        }));
                    }else{
                        // Apply grey class
                        post.removeClass(bbsDeletedReplyClass);

                        // Remove links
                        post.find(bbsPostingDate).next().remove();
                        post.find(bbsPostMessage).nextAll().remove();
                        post.find(bbsPostMessage).after(sakai.api.Util.TemplateRenderer(bbsRestoredPostActionsTemplate, {}));
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_DELETE_POST"),"",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        var updatePost = function(id, body, quote, quoted, post){
            var url = store + "/" + replyId(id);
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
                    post.find(bbsEditContainer).children().remove();

                    // Set post data
                    post.find(bbsPostMessage).text(body);
                    post.find(bbsReplyContentsText).text(quote);

                    // Set entity data
                    post.children(bbsEntityContainer).find(bbsUpdatingDate).children("span").text(sakai.api.User.getDisplayName(sakai.data.me.profile) + " " + sakai.api.l10n.transformDateTimeShort(parseDate(sakai.api.Util.createSakaiDate(new Date()))));
                    post.children(bbsEntityContainer).children(bbsPostingDate).children().show();

                    // Show all
                    post.children(".bbs_entity_container, .bbs_reply_contents").show();
                }
            });
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBinding = function() {
            $(bbsExpandAll, $rootel).live("click", function(){
                if($(bbsExpandAll, $rootel).hasClass(bbsExpandAllClass)){
                    $(this).removeClass(bbsExpandAllClass);
                    $(this).addClass(bbsCollapseAllClass);
                    $(this).text($bbsCollapseAll.text());
                    $(bbsRepliesIcon, $rootel).addClass(bbsShowRepliesIcon);
                    $(bbsRepliesIcon, $rootel).removeClass(bbsHideRepliesIcon);
                }else{
                    $(this).removeClass(bbsCollapseAllClass);
                    $(this).addClass(bbsExpandAllClass);
                    $(this).text($bbsExpandAll.text());
                    $(bbsRepliesIcon, $rootel).removeClass(bbsShowRepliesIcon);
                    $(bbsRepliesIcon, $rootel).addClass(bbsHideRepliesIcon);
                }
                $(bbsShowTopicReplies, $rootel).click();
            });

            // SETTINGS //
            // Submit button.
            $bbsSettingsSubmit.bind("click", function(e, ui){
                saveSettings(finishSettingsContainer);
            });

            // Cancel button
            $bbsSettingsCancel.bind("click", function(e, ui){
                sakai.api.Widgets.Container.informCancel(tuid, "bbs");
            });

            // NEW TOPIC //
            $(bbsAddNewTopic, $rootel).live("click", function(){
                $bbsListTopics.hide();
                $(bbsNoInitialTopic, $rootel).hide();
                $(bbsCreateNewTopic, $rootel).show();
            });

            $(bbsDontAddTopic, $rootel).bind("click", function(){
                $(bbsCreateNewTopic, $rootel).hide();
                getWidgetSettings();
            });

            $(bbsCreateNewTopicForm, $rootel).validate({
                submitHandler: function(form){
                    createTopic();
                }
            });

            $(".bbs_show_all_ellipsis_text", $rootel).live("click", function(){
                $(this).parent().prev().text($(this).parent().prev()[0].title);
                $(this).parent().remove();
            });

            // REPLY TOPIC //
            $(bbsShowTopicReplies, $rootel).live("click",function(){
                var $repliesIcon = $(this).children(bbsRepliesIcon);
                if($repliesIcon.hasClass(bbsShowRepliesIcon)){
                    $(this).nextAll(bbsTopicRepliesContainer).show();
                    $repliesIcon.removeClass(bbsShowRepliesIcon);
                    $repliesIcon.addClass(bbsHideRepliesIcon);
                    if ($repliesIcon.next().children(bbsNumberOfReplies).text() != "0") {
                        $(this).nextAll(bbsReplyTopicBottom).show();
                    }
                }else{
                    $(this).nextAll(bbsTopicRepliesContainer).hide();
                    $repliesIcon.addClass(bbsShowRepliesIcon);
                    $repliesIcon.removeClass(bbsHideRepliesIcon);
                    $(this).nextAll(bbsReplyTopicBottom).hide();
                }
            });

            // Open quoted reply fields
            $(bbsQuote, $rootel).live("click", function(){
                var replyParent = $(this).parents(bbsTopicContainer);
                var postId = replyParent[0].id.split("bbs_post_")[1];
                sakai.api.Util.TemplateRenderer(bbsTopicReplyTemplate, {"edit":false, "quoted":true, "quotedUser":$(this).parents(s3dHighlightBackgroundClass).find(bbsPosterName).text(), "quotedMessage":$(this).prev().children(bbsPostMessage).text(), "postId": postId}, replyParent.children(bbsTopicReplyContainer));
                replyParent.children(bbsTopicReplyContainer).show();
                window.location.hash = "reply_" + postId;
            });

            // Open reply fields
            $(bbsReplyTopic, $rootel).live("click", function(){
                var replyParent = $(this).parents(bbsTopicContainer);
                var postId = replyParent[0].id.split("bbs_post_")[1];
                sakai.api.Util.TemplateRenderer(bbsTopicReplyTemplate, {"edit":false, "quoted":false, "postId": postId}, replyParent.children(bbsTopicReplyContainer));
                replyParent.children(bbsTopicReplyContainer).show();
                window.location.hash = "reply_" + postId;
            });

            $(bbsDontAddReply, $rootel).live("click", function(){
                $(this).parents(bbsTopicReplyContainer).hide();
            });

            // Make the actual reply
            $(bbsAddReply, $rootel).die("click", doAddReply);
            $(bbsAddReply, $rootel).live("click", doAddReply);

            // DELETE REPLIES //
            // Delete reply
            $(bbsDelete, $rootel).live("click", function(){
                deletePost($(this).parents(s3dHighlightBackgroundClass)[0].id, true, $(this).parents(s3dHighlightBackgroundClass));
            });

            // Restore reply
            $(bbsRestore, $rootel).live("click", function(){
                deletePost($(this).parents(s3dHighlightBackgroundClass)[0].id, false, $(this).parents(s3dHighlightBackgroundClass));
            });

            $(bbsHideReply, $rootel).live("click", function(){
                $(this).children("span").toggle();
                $(this).parent().nextAll(bbsReplyContents).toggle();
            });

            // EDIT POST //
            $(bbsEdit, $rootel).live("click", function(){
                var renderData = {};
                if ($(this).prevAll(bbsQuotedTextContainer).length) {
                    renderData = {
                        "edit": true,
                        "quoted": true,
                        "quotedUser": $(this).parents(s3dHighlightBackgroundClass).find(bbsReplyContentsTextQuoted).text(),
                        "quotedMessage": $.trim($(this).prevAll(bbsQuotedTextContainer).children(bbsReplyContentsText).text()),
                        "body": $.trim($(this).prevAll(bbsPostMessage).text())
                    };
                } else {
                    renderData = {
                        "edit": true,
                        "quoted": false,
                        "quotedUser": false,
                        "body": $.trim($(this).prevAll(bbsPostMessage).text())
                    };
                }
                $(this).parents(s3dHighlightBackgroundClass).children( bbsEntityContainer + "," + bbsReplyContents).hide();
                sakai.api.Util.TemplateRenderer(bbsTopicReplyTemplate, renderData, $(this).parents(s3dHighlightBackgroundClass).children(bbsEditContainer));
            });

            $(bbsDontSaveEdit, $rootel).live("click", function(){
                $(this).parents(s3dHighlightBackgroundClass).children(bbsEntityContainer + "," + bbsReplyContents).show();
                $(this).parents(bbsEditContainer).text("");
            });

            $(bbsSaveEdit, $rootel).live("click", function(){
                var editParent = $(this).parents(bbsEditContainer);
                var id = $(this).parents(s3dHighlightBackgroundClass)[0].id;
                var body = editParent.children(bbsTopicReplyText).val();
                var quote = editParent.children(bbsTopicQuotedText).val();
                var quoted = $(this).parents(s3dHighlightBackgroundClass).find(bbsReplyContentsTextQuoted).text();
                var post = $(this).parents(s3dHighlightBackgroundClass);
                updatePost(id, body, quote, quoted, post);
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
    sakai.api.Widgets.widgetLoader.informOnLoad("bbs");
});