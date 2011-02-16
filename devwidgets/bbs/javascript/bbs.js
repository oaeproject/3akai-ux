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

        // Templates
        var bbsTabContentSettingsTemplate = "bbs_tab_content_settings_template";
        var bbsListTopicsTemplate = "bbs_list_topics_template";

        // Settings
        var parsedSettings = {};
        var $bbsSettings = $("#bbs_settings", $rootel);
        var $bbsSettingsSubmit = $("#bbs_settings_submit", $rootel);
        var $bbsSettingsCancel = $("#bbs_settings_cancel", $rootel);

        // Add new topic
        var bbsAddNewTopic = "#bbs_add_new_topic";
        var bbsDontAddTopic= "#bbs_dont_add_topic";
        var bbsAddTopic= "#bbs_add_topic";

        // i18n
        var $bbsCollapseAll = $("#bbs_i18n_collapse_all", $rootel);
        var $bbsExpandAll = $("#bbs_i18n_expand_all", $rootel);
        var $bbsShow = $("#bbs_i18n_show", $rootel);
        var $bbsHide = $("#bbs_i18n_hide", $rootel);

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
                        // no op
                    },
                    error: function(xhr, textStatus, thrownError){
                        if (xhr.status == 404) {
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
            if (pictureData && $.parseJSON(pictureData).name) {
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
                quote = message.split("[/quote]")[0]
                quote = quote.substring(quote.indexOf("]") + 1, quote.length)
                // Parse the original author
                var by = message.split("[/quote]")[0]
                by = by.substring(by.indexOf("\"") + 1, by.indexOf("]") - 1);
                return {"quote":quote, "by":by}
            }else{
                return quote;
            }
        };

        var renderPosts = function(arrPosts){
            // Loop fetched posts and do markup
            for (var i = 0, j = arrPosts.length; i < j; i++) {
                arrPosts[i].post.profile[0].picture = parsePicture(arrPosts[i].post["sakai:from"], arrPosts[i].post.profile[0].picture);
                arrPosts[i].post["sakai:created"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post["sakai:created"]));
                if(arrPosts[i].post["sakai:editedOn"]){
                    arrPosts[i].post["sakai:editedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].post["sakai:editedOn"]));
                }
                for(var ii = 0, jj = arrPosts[i].replies.length; ii < jj; ii++){
                    arrPosts[i].replies[ii].post.profile[0].picture = parsePicture(arrPosts[i].replies[ii].post["sakai:from"], arrPosts[i].replies[ii].post.profile[0].picture);
                    arrPosts[i].replies[ii].post["sakai:created"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["sakai:created"]));
                    if(arrPosts[i].replies[ii].post["sakai:deletedOn"]){
                        arrPosts[i].replies[ii].post["sakai:deletedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["sakai:deletedOn"]));
                    }
                    if(arrPosts[i].replies[ii].post["sakai:editedOn"]){
                        arrPosts[i].replies[ii].post["sakai:editedOn"] = sakai.api.l10n.transformDateTimeShort(parseDate(arrPosts[i].replies[ii].post["sakai:editedOn"]));
                    }
                    arrPosts[i].replies[ii].post["sakai:quoted"] = parseQuote(arrPosts[i].replies[ii].post["sakai:body"])
                    if(arrPosts[i].replies[ii].post["sakai:body"].split(["[/quote]"])[1]){
                        arrPosts[i].replies[ii].post["sakai:body"] = arrPosts[i].replies[ii].post["sakai:body"].split(["[/quote]"])[1];
                    }
                }
            }

            console.log({
                "postData": arrPosts
            });

            // Render formatted posts
            sakai.api.Util.TemplateRenderer(bbsListTopicsTemplate, {
                "postData":arrPosts,
                "settings":parsedSettings
            }, $(bbsListTopicsContainer, $rootel));
        };

        /**
         * Show all the posts in the main view
         * @param {String} response Json response with all the posts
         * @param {Boolean} exists Check if the discussion exists
         */
        var showPosts = function(response, exists){
            if (exists && response.total != 0) {
                try {
                    renderPosts(response.results);
                    $bbsListTopics.show();
                } catch (err) {
                    debug.error(err);
                }
            } else {
                // No topics yet
                sakai.api.Util.TemplateRenderer("bbs_no_initial_topic_template", {
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
            sakai.api.Util.TemplateRenderer("bbs_tab_content_settings_template", {
                "settings":widgetSettings
            }, $("#bbs_tab_content_settings_container", $rootel));
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
                },
                error: function(xhr, textStatus, thrownError){
                    //showPosts(xhr.status, false);
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
        }

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
                'sakai:subject': $("#bbs_create_new_topic_title", $rootel).val(),
                'sakai:body': $("#bbs_create_new_topic_message_text", $rootel).val(),
                'sakai:initialpost': true,
                'sakai:writeto': store,
                'sakai:marker': tuid,
                'sakai:messagebox': "outbox",
                'sakai:sendstate': "pending",
                '_charset_': "utf-8"
            }

            $.ajax({
                url: store + ".create.html",
                cache: false,
                type: 'POST',
                data: postData,
                success: function(data){
                    $("#bbs_create_new_topic_title", $rootel).val("");
                    $("#bbs_create_new_topic_message_text", $rootel).val("");
                    $(bbsCreateNewTopic, $rootel).hide();
                    getWidgetSettings();
                },
                error: function(xhr, textStatus, thrownError){
                    debug.error("Unable to save your post.");
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
                    getWidgetSettings();
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
            var replyParent = $(this).parents(".bbs_topic_container");
            var topicId = replyParent[0].id.split("bbs_post_")[1];
            var message = replyParent.children("#bbs_topic_reply_container").children("#bbs_topic_reply_text").val();

            if(replyParent.children("#bbs_topic_reply_container").children("#bbs_topic_quoted_text").length){
                message = "[quote=\"Bert Pareyn\"]" + replyParent.children("#bbs_topic_reply_container").children("#bbs_topic_quoted_text").val() + "[/quote]" + message;
            }

            replyToTopic(topicId, message, $(this).parents("#bbs_topic_reply_container"));
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
        var deletePost = function(id, deleteValue){
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
                    getPosts();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_DELETE_POST"),"",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        var updatePost = function(id, body, quote){
            var url = store + "/" + replyId(id);
            var data = {
                "sakai:edited": true,
                "sakai:editedBy": sakai.api.User.getDisplayName(sakai.data.me.profile),
                "sakai:editedOn": sakai.api.Util.createSakaiDate(new Date()),
                "sakai:body": body
            };
            if(quote){
                data["sakai:body"] = "[quote=\"Bert Pareyn\"]" + quote + "[/quote]" + body;
            }

            $.ajax({
                url: url,
                type: "POST",
                data: data,
                success: function(){
                    getPosts();
                },
                error: function(xhr, textStatus, thrownError){
                    console.log(textStatus);
                }
            });
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBinding = function() {
            $("#bbs_expand_all", $rootel).live("click", function(){
                if($("#bbs_expand_all", $rootel).hasClass("bbs_expand_all")){
                    $(this).removeClass("bbs_expand_all");
                    $(this).addClass("bbs_collapse_all");
                    $(this).text($bbsCollapseAll.text());
                    $(".bbs_replies_icon", $rootel).addClass("bbs_show_replies_icon");
                    $(".bbs_replies_icon", $rootel).removeClass("bbs_hide_replies_icon");
                    $(".bbs_show_topic_replies", $rootel).click();
                }else{
                    $(this).removeClass("bbs_collapse_all");
                    $(this).addClass("bbs_expand_all");
                    $(this).text($bbsExpandAll.text());
                    $(".bbs_replies_icon", $rootel).removeClass("bbs_show_replies_icon");
                    $(".bbs_replies_icon", $rootel).addClass("bbs_hide_replies_icon");
                    $(".bbs_show_topic_replies", $rootel).click();
                }
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

            $("#bbs_create_new_topic form", $rootel).validate({
                submitHandler: function(form){
                    createTopic();
                    return false;
                }
            });

            // REPLY TOPIC //
            $(".bbs_show_topic_replies").live("click",function(){
                var $repliesIcon = $(this).children(".bbs_replies_icon");
                if($repliesIcon.hasClass("bbs_show_replies_icon")){
                    $(this).nextAll(".bbs_topic_replies_container").show();
                    $repliesIcon.removeClass("bbs_show_replies_icon");
                    $repliesIcon.addClass("bbs_hide_replies_icon");
                }else{
                    $(this).nextAll(".bbs_topic_replies_container").hide();
                    $repliesIcon.addClass("bbs_show_replies_icon");
                    $repliesIcon.removeClass("bbs_hide_replies_icon");
                }
            });

            // Open quoted reply fields
            $(".bbs_quote").live("click", function(){
                var replyParent = $(this).parents(".bbs_topic_container");
                sakai.api.Util.TemplateRenderer("bbs_topic_reply_template", {"edit":false, "quoted":true, "quotedMessage":$(this).prev(".bbs_post_message").text()}, replyParent.children("#bbs_topic_reply_container"));
                replyParent.children("#bbs_topic_reply_container").show();
            });

            // Open reply fields
            $("#bbs_reply_topic").live("click", function(){
                var replyParent = $(this).parents(".bbs_topic_container");
                sakai.api.Util.TemplateRenderer("bbs_topic_reply_template", {"edit":false, "quoted":false}, replyParent.children("#bbs_topic_reply_container"));
                replyParent.children("#bbs_topic_reply_container").show();
            });

            $("#bbs_dont_add_reply", $rootel).live("click", function(){
                $(this).parents("#bbs_topic_reply_container").hide()
            });

            // Make the actual reply
            $("#bbs_add_reply", $rootel).die("click", doAddReply);
            $("#bbs_add_reply", $rootel).live("click", doAddReply);

            // DELETE REPLIES //
            // Delete reply
            $(".bbs_delete", $rootel).live("click", function(){
                deletePost($(this).parents(".s3d-highlight_area_background")[0].id, true);
            });

            // Restore reply
            $(".bbs_restore", $rootel).live("click", function(){
                deletePost($(this).parents(".s3d-highlight_area_background")[0].id, false);
            });

            $(".bbs_hide_reply", $rootel).live("click", function(){
                $(this).children("span").toggle();
                $(this).parent().nextAll(".bbs_reply_contents").toggle();
            });

            // EDIT POST //
            $(".bbs_edit", $rootel).live("click", function(){
                var renderData = {};
                if ($(this).prevAll(".bbs_quoted_text_container").length) {
                    renderData = {
                        "edit": true,
                        "quoted": true,
                        "quotedMessage": $.trim($(this).prevAll(".bbs_quoted_text_container").children(".bbs_reply_contents_text").text()),
                        "body": $.trim($(this).prevAll(".bbs_post_message").text())
                    };
                } else {
                    renderData = {
                        "edit": true,
                        "quoted": false,
                        "body": $.trim($(this).prevAll(".bbs_post_message").text())
                    };
                }
                $(this).parents(".s3d-highlight_area_background").children(".bbs_entity_container,.bbs_reply_contents").hide();
                sakai.api.Util.TemplateRenderer("bbs_topic_reply_template", renderData, $(this).parents(".s3d-highlight_area_background").children(".bbs_edit_container"));
            });

            $("#bbs_dont_save_edit", $rootel).live("click", function(){
                $(this).parents(".s3d-highlight_area_background").children(".bbs_entity_container,.bbs_reply_contents").show();
                $(this).parents(".bbs_edit_container").text("");
            });

            $("#bbs_save_edit", $rootel).live("click", function(){
                var editParent = $(this).parents(".bbs_edit_container");
                var id = $(this).parents(".s3d-highlight_area_background")[0].id;
                var body = editParent.children("#bbs_topic_reply_text").val();
                var quote = editParent.children("#bbs_topic_quoted_text").val();
                updatePost(id, body, quote);
            });
        };


        //////////////////////
        // Initial function //
        //////////////////////

        var init = function(){
            addBinding();
            checkMessageStore();
            getWidgetSettings();

            if (showSettings) {
                $bbsMainContainer.hide();
                $bbsSettings.show();
            }else{
                $bbsMainContainer.show();
                $bbsSettings.hide();
            }
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("bbs");
});