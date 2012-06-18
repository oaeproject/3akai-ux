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
 * /dev/lib/jquery/plugins/jquery.pager.js (pager)
 */
/*global Config, $, pagerClickHandler */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.comments
     *
     * @class comments
     *
     * @description
     * Initialize the comments widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.comments = function(tuid, showSettings, widgetData){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var json = false; // Variable used to recieve information by json
        var widgetSettings = {}; // Will hold the widget settings.
        var me = sakai.data.me; // Contains information about the current user
        var rootel = $("#" + tuid); // Get the main div used by the widget
        var jsonDisplay = {};
        var start = 0; // Start fetching from the first comment.
        var clickedPage = 1;
        var defaultPostsPerPage = 10;
        var store = "";
        var allowedEdit = false;
        var allowedDelete = false;
        var extraComments = 0;

        // Main Ids
        var comments = "#comments";
        var commentsName = "comments";
        var commentsClass = ".comments";

        // Output containers
        var commentsOutputContainer = comments + "_mainContainer";
        var commentsFillInComment = comments + "_fillInComment";
        var commentsPostCommentStart = comments + "_postComment";
        var commentsShowComments = comments + "_showComments";
        var commentsNumComments = comments + "_numComments";
        var commentsNumCommentsDisplayed = commentsNumComments + "Displayed";
        var commentsCommentComments = comments + "_commentscomment";
        var commentsCancelComment = comments + "_cancelComment";

        // Edit parts
        var commentsEdit = commentsClass + "_edit";
        var commentsMessage = comments + "_message_";
        var commentsMessageEditContainer = commentsMessage + "editContainer_";
        var commentsEditText = comments + "_editComment_txt_";
        var commentsEditSave = commentsClass + "_editComment_save";
        var commentsEditCancel = commentsClass + "_editComment_cancel";
        var commentsPath = comments + "_path_";

        // Delete
        var commentsDelete = commentsClass + "_delete";
        var commentsUnDelete = commentsClass + "_undelete";

        // Output textboxes
        var commentsMessageTxt = comments + "_txtMessage";
        var commentsNamePosterTxt = comments + "_txtNamePoster";
        var commentsMailPosterTxt = comments + "_txtMailPoster";
        // Their containers
        var commentsNamePosterTxtContainer = commentsNamePosterTxt + "_container";
        var commentsMailPosterTxtContainer = commentsMailPosterTxt + "_container";

        // Output classes
        var commentsCommentBtn = commentsClass + "_comment";
        var commentsPager = commentsClass + "_jqpager";


        // Output templates
        var commentsShowCommentsTemplate = commentsName + "_showCommentsTemplate";

        // Settings
        var commentsSettingsContainer = comments + "_settings";

        // Settings checkboxes and radiobuttons
        var commentsEmailReqChk = comments + "_Emailrequired";
        var commentsNameReqChk = comments + "_Namerequired";
        var commentsSendMailChk = comments + "_SendMail";
        var commentsPageTxt = comments + "_txtPage";

        // Settings buttons
        var commentsSubmit = comments + "_submit";
        var commentsCancel = comments + "_cancel";

        // Settings names
        var commentsDisplayRbt = commentsName + "_ChooseDisplayComments";
        var commentsDirectionRbt = commentsName + "_ChooseDirectionComments";
        var commentsPermissionsRbt = commentsName + "_ChoosePermissionComments";

        // Resize textarea to match width
        var commentsMainContainerTextarea = commentsOutputContainer + " textarea";
        var commentsCommentMessage = commentsClass + "_commentMessage";

        ////////////////////////
        // Utility  functions //
        ////////////////////////

        /**
         * Parse a json string to a valid date
         * @param {Number} dateInput String of a date that needs to be parsed
         * @returns {Date}
         */
        var parseDate = function(dateInput){
            if (dateInput !== null) {
                return sakai.api.l10n.fromEpoch(dateInput, sakai.data.me);
            } else {
                return null;
            }
        };

        /**
         * Converts all HTML to flat text and converts \n to <br />
         * @param {String} str
         */
        var tidyInput = function(str){
            return sakai.api.Security.safeOutput(str);
        };

        ///////////////////
        // show comments //
        ///////////////////

        /**
         * Show the comments in a paged state or not
         */
        var displayCommentsPagedOrNot = function(){
            jsonDisplay = {
                "comments": [],
                "settings": widgetSettings
            };
            // Loops through all the comments and does the necessary changes to render the JSON-object
            for (var i = 0; i < json.results.length; i++) {
                jsonDisplay.comments[i] = {};
                var comment = json.results[i].post;
                // Checks if the date is already parsed to a date object
                var tempDate = sakai.api.Util.parseSakaiDate(comment['sakai:created']);
                if (isNaN(parseDate(comment['sakai:created']).getTime())) {
                    tempDate = sakai.api.Util.parseSakaiDate(
                                   sakai.api.Util.createSakaiDate(new Date(comment['sakai:created'])));
                }
                try {
                    // if the date is not a string this should generate en exception
                    comment.date = parseDate(tempDate);
                } catch (ex) {
                    comment.date = tempDate;
                }
                comment.timeAgo = $.timeago(tempDate);
                // Use the sakai API function to parse the date and convert to the users local time
                comment.date = parseDate(tempDate.getTime(), sakai.data.me);
                comment.formatDate = sakai.api.l10n.transformDateTimeShort(comment.date);
                comment.messageTxt = comment["sakai:body"];
                comment.message = tidyInput(comment["sakai:body"]);
                // weird json bug.
                comment["sakai:deleted"] = (comment["sakai:deleted"] && (comment["sakai:deleted"] === "true" || comment["sakai:deleted"] === true)) ? true : false;

                var user = {};
                // User
                // Puts the userinformation in a better structure for trimpath
                if (comment.profile) {
                    var profile = comment.profile[0];
                    user.fullName = sakai.api.User.getDisplayName(profile);
                    user.uid = profile["userid"];
                    user.pictureUrl = sakai.config.URL.USER_DEFAULT_ICON_URL;
                    // Check if the user has a picture
                    var pictureUrl = sakai.api.Util.constructProfilePicture(profile);
                    if (pictureUrl){
                        user.pictureUrl = pictureUrl;
                    }
                    user.profile = "/~" + sakai.api.Util.safeURL(user.uid);
                }
                else {
                    // This is an anonymous user.
                    comment.profile = {};
                    comment.profile.fullName = "Anonymous";
                    comment.profile.email = "noreply@sakaiproject.org";
                    if (widgetSettings["sakai:forcename"] === true) {
                        comment.profile.fullName = comment['sakai:name'];
                    }
                    if (widgetSettings["sakai:forcemail"] === true) {
                        comment.profile.email = comment['sakai:email'];
                    }
                }

                comment.user = user;

                jsonDisplay.comments[i] = comment;
            }
            $(commentsShowComments, rootel).html(sakai.api.Util.TemplateRenderer(commentsShowCommentsTemplate, jsonDisplay));
            // Render Math formulas in the text
            sakai.api.Util.renderMath(tuid);
        };

        /**
         * Show all the posted comments
         * This function first retrieves all the users who have posted in this widget and then call the displayCommentsPagedOrNot function
         */
        var showComments = function(){
            // Show the nr of comments we are showing.
            var showingComments = json.total;
            if (widgetSettings.perPage < json.total) {
                showingComments = widgetSettings.perPage + extraComments;
            }
            $(commentsNumCommentsDisplayed, rootel).html(showingComments);
            // Puts the number of comments on the page
            $(commentsNumComments, rootel).html(json.total);
            // Change to "comment" or "comments"
            if (json.total === 1) {
                $(commentsCommentComments, rootel).text(sakai.api.i18n.getValueForKey("COMMENT_LC", "comments"));
            }


            // Change the page-number on the display
            $(commentsPager, rootel).pager({
                pagenumber: clickedPage,
                pagecount: Math.ceil(json.total / widgetSettings.perPage),
                buttonClickCallback: pagerClickHandler
            });

            if (json.total > widgetSettings.perPage) {
                $(commentsPager, rootel).show();
            }
            // Checks if the comments undefined or if it's length is 0
            displayCommentsPagedOrNot();
        };

        /**
         * Gets the comments from the service.
         */
        var getComments = function(){
            var sortOn = '_created';
            var sortOrder = "desc";
            var items = 10;
            if (widgetSettings.direction && widgetSettings.direction === "comments_FirstDown") {
                sortOrder = "asc";
            }
            if (widgetSettings.perPage) {
                items = widgetSettings.perPage;
            }

            var url = "/var/search/comments/flat.json?sortOn=" + sortOn + "&sortOrder=" + sortOrder + "&page=" + (clickedPage - 1) + "&items=" + items + "&marker=" + tuid + "&path=" + store;
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    json = $.extend(data, {}, true);
                    showComments();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("COMMENTS_AN_ERROR_OCCURRED") + " (" + xhr.status + ")","",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * Pager click handler
         * @param {Number} pageclickednumber
         */
        var pagerClickHandler = function(pageclickednumber){
            extraComments = 0;
            clickedPage = pageclickednumber;

            // Change the page-number on the display
            $(commentsPager, rootel).pager({
                pagenumber: pageclickednumber,
                pagecount: Math.ceil(json.total / widgetSettings.perPage),
                buttonClickCallback: pagerClickHandler
            });
            getComments();
        };

        /**
         * Post a new comment
         */
        var postComment = function(){
            var comment = {
                // Replaces the \n (enters) with <br />
                "message": $(commentsMessageTxt, rootel).val()
            };
            comment["sakai:type"] = "comment";

            var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
            var allowPost = true;
            // If the user is not loggedin but we allow anon comments, we check some extra fields.
            if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === true) {
                if (!isLoggedIn && widgetSettings['sakai:forcename']) {
                    comment["sakai:name"] = $(commentsNamePosterTxt, rootel).val();
                    if (comment["sakai:name"].replace(/\s/g, "") === "") {
                        allowPost = false;
                    }
                }
                if (!isLoggedIn && widgetSettings['sakai:forcemail']) {
                    comment["sakai:email"] = $(commentsMailPosterTxt, rootel).val();
                    if (comment["sakai:email"].replace(/\s/g, "") === "") {
                        allowPost = false;
                    }
                }
            }
            if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === false) {
                // This should not even happen.. Somebody is tinkering with the HTML.
                allowPost = false;
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("ANON_NOT_ALLOWED"),"",sakai.api.Util.notification.type.ERROR);
            }

            var widgeturl = sakai.api.Widgets.getWidgetDataStorageURL(tuid);
            var subject = 'Comment';
            var to = "internal:" + widgeturl + "/message";

            if (allowPost) {
                var body = $(commentsMessageTxt, rootel).val();
                var message = {
                    'sakai:type': 'comment',
                    'sakai:to': to,
                    'sakai:marker': tuid,
                    'sakai:subject': subject,
                    'sakai:body': body,
                    'sakai:messagebox': 'pending',
                    'sakai:sendstate': 'pending',
                    'sling:resourceType': 'sakai/message',
                    '_charset_':'utf-8'
                };


                var url = widgeturl + "/message.create.html";
                $.ajax({
                    url: url,
                    type: "POST",
                    cache: false,
                    success: function(data){
                        // Hide the form.
                        $(commentsFillInComment, rootel).hide();
                        // Clear the textboxes.
                        $(commentsMessageTxt, rootel).val("");
                        $(commentsNamePosterTxt, rootel).val("");
                        $(commentsMailPosterTxt, rootel).val("");
                        var postData = {
                            "post": data.message,
                            "replies": []
                        };
                        postData.post["profile"] = [me.profile];
                        postData.post["_path"] = widgeturl.slice(3, widgeturl.length) + "/message/inbox/" + data.id;
                        postData.post["canDelete"] = allowedDelete;
                        postData.post["canEdit"] = allowedEdit;
                        if (widgetSettings && widgetSettings.direction && widgetSettings.direction === "comments_FirstDown") {
                            json.results.push(postData);
                        } else {
                            json.results.unshift(postData);
                        }
                        json.total++;
                        extraComments++;
                        // Show the added comment
                        showComments();
                    },
                    error: function(xhr, textStatus, thrownError){
                        if (xhr.status === 401) {
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("YOU_NOT_ALLOWED"),"",sakai.api.Util.notification.type.ERROR);
                        }
                        else {
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("FAILED_TO_SAVE"),"",sakai.api.Util.notification.type.ERROR);
                        }
                    },
                    data: message
                });
            }
            else {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("PLEASE_FILL_ALL_FIELDS"),"",sakai.api.Util.notification.type.ERROR);
            }
        };

        ////////////////////////
        // Settings functions //
        ////////////////////////

        /**
         * show the settingsscreen
         * @param {Boolean} exists
         * @param {Object} response
         */
        var showSettingScreen = function(exists, response){
            $(commentsOutputContainer, rootel).hide();
            $(commentsSettingsContainer, rootel).show();

            // If you're changing an comment-widget, then the saved values need to be filled in
            if (exists) {
                $("input[name='" + commentsDirectionRbt + "'][value='" + widgetSettings.direction + "']", rootel).attr("checked", true);
                if (widgetSettings['sakai:allowanonymous'] && widgetSettings['sakai:allowanonymous'] === true) {
                    $("#comments_DontRequireLogInID", rootel).attr("checked", true);
                    $(commentsNameReqChk, rootel).attr("disabled", false);
                    $(commentsEmailReqChk, rootel).attr("disabled", false);
                }
                else {
                    $("#comments_RequireLogInID", rootel).attr("checked", true);
                    $(commentsNameReqChk, rootel).attr("disabled", true);
                    $(commentsEmailReqChk, rootel).attr("disabled", true);
                }
                $(commentsEmailReqChk, rootel).attr("checked", widgetSettings['sakai:forcemail']);
                $(commentsNameReqChk, rootel).attr("checked", widgetSettings['sakai:forcename']);


                $(commentsSendMailChk, rootel).attr("checked", widgetSettings['sakai:notification']);
                $(commentsPageTxt, rootel).val(widgetSettings.perPage);
            }
        };

        /**
         * When the settings are saved to JCR, this function will be called.
         * It will notify the container that it can be closed.
         */
        var finishNewSettings = function(){
            sakai.api.Widgets.Container.informFinish(tuid, "comments");
        };

        /**
         * fills up the settings JSON-object
         * @return {Object} the settings JSON-object, returns {Boolean} false if input is invalid
         */
        var getCommentsSettings = function(){
            var comments = {};
            comments.comments = [];

            // Checks if there's already some comments placed on the widget
            comments.comments = json.comments || [];

            comments.perPage = parseInt($(commentsPageTxt, rootel).val(), 10);
            if (isNaN(comments.perPage)) {
                comments.perPage = defaultPostsPerPage;
            }

            if (comments.perPage < 1) {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("PLEASE_FILL_POSITIVE_NUM"),"",sakai.api.Util.notification.type.ERROR);
                return false;
            }
            // Check if a valid number is inserted
            else
                if ($(commentsPageTxt, rootel).val().search(/^\d*$/)) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("PLEASE_FILL_VALID_NUM"),"",sakai.api.Util.notification.type.ERROR);
                    return false;
                }


            comments.direction = $("input[name=" + commentsDirectionRbt + "]:checked", rootel).val();

            // These properties are not yet used in the comments-widget, but are saved in JCR
            comments['sakai:allowanonymous'] = false;
            if ($("#comments_RequireLogInID", rootel).is(":checked")) {
                comments['sakai:allowanonymous'] = false;
            }
            comments['sakai:forcename'] = $(commentsNameReqChk, rootel).attr("checked");
            comments['sakai:forcemail'] = $(commentsEmailReqChk, rootel).attr("checked");
            comments['sakai:notification'] = $(commentsSendMailChk, rootel).attr("checked");
            comments['sakai:notificationaddress'] = me.user.userid;
            comments['sling:resourceType'] = 'sakai/settings';
            comments['sakai:marker'] = tuid;
            comments['sakai:type'] = "comment";

            return comments;
        };

        /**
         * Makes sure that values that are supposed to be booleans, really are booleans.
         * @param {String[]} arr Array of strings which holds keys for the widgetSettings variable that needs to be checked.
         */
        var cleanBooleanSettings = function(arr){
            for (var i = 0; i < arr.length; i++) {
                var name = arr[i];
                widgetSettings[name] = (widgetSettings[name] && (widgetSettings[name] === true || widgetSettings[name] === "true" || widgetSettings[name] === 1)) ? true : false;
            }
        };

        /**
         * Gets the widget settings and shows the appropriate view.
         */
        var getWidgetSettings = function(){

            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (!sakai.api.User.isAnonymous(sakai.data.me)) {
                    $(commentsCommentBtn, rootel).show();
                }

                if (success) {
                    if (!data.message) {
                        sakai.api.Widgets.saveWidgetData(tuid, {"message":{"sling:resourceType":"sakai/messagestore"}}, null);
                    }
                    widgetSettings = data;
                    // Clean up some values so that true is really true and not "true" or 1 ...
                    var keysToClean = ['sakai:forcename', 'sakai:forcemail', 'notification', 'sakai:allowanonymous'];
                    cleanBooleanSettings(keysToClean);

                    if (showSettings) {
                        showSettingScreen(true, data);
                    } else {
                        pagerClickHandler(1);
                    }
                } else {
                    if (showSettings) {
                        showSettingScreen(false, data);
                    } else {
                        saveSettings();
                        pagerClickHandler(1);
                    }
                }
            });

        };

        var saveSettings = function(){
            // If the settings-input is valid an object will be returned else false will be returned
            var settings = getCommentsSettings();
            if (settings) {
                settings["_charset_"] = "utf-8";

                sakai.api.Widgets.saveWidgetData(tuid, settings, function(success){
                    if (success) {
                        finishNewSettings();
                    }
                    else {
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("FAILED_TO_SAVE"),"",sakai.api.Util.notification.type.ERROR);
                    }
                });

            }
            return false;
        };

        ////////////////////
        // Event Handlers //
        ////////////////////


        /////////////////
        // DELETE LINK //
        /////////////////

        /**
         * Deletes or undeleted a post with a certain id.
         * @param {String} id The id of the post.
         * @param {Boolean} deleteValue true = delete it, false = undelete it.
         */
        var doDelete = function(id, deleteValue){
            var url = $(commentsPath+id).val();
            var data = {
                "sakai:deleted": deleteValue
            };
            $.ajax({
                url: url,
                type: 'POST',
                success: function(){
                    // mark the comment as deleted or undeleted
                    for (var i = 0; i < json.results.length; i++) {
                        if (json.results[i].post["sakai:id"] === id){
                            json.results[i].post["sakai:deleted"] = deleteValue;
                        }
                    }
                    showComments();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("FAILED_TO_UNDELETE"),"",sakai.api.Util.notification.type.ERROR);
                },
                data: data
            });
        };

        var saveCommentEdit = function(form) {
            var id = $(form).find("button.comments_editComment_save").attr("id").replace(commentsEditSave.replace(/\./g, ""), "");
            var message = $(commentsEditText + id, rootel).val();
            var data = {
                "sakai:body": message,
                "sakai:editedby": me.user.userid
            };
            // Do a post to the comment to edit the message.
            var commentUrl = $(commentsPath+id).val();
            $.ajax({
                url: commentUrl,
                cache: false,
                type: 'POST',
                success: function(data){
                    // Set the new message
                    $(commentsMessage + id, rootel).html("<p>" + sakai.api.Security.saneHTML(tidyInput(message)) + "</p>");
                    // Hide the form
                    $(commentsMessageEditContainer + id, rootel).hide();
                    $(commentsMessage + id, rootel).show();
                    // update the comment body
                    for (var i = 0; i < json.results.length; i++) {
                        if (json.results[i].post["sakai:id"] === id){
                            json.results[i].post["sakai:body"] = message;
                            json.results[i].post["sakai:editedby"] = me.user.userid;
                        }
                    }
                    // Render Math formulas in the text
                    sakai.api.Util.renderMath(tuid);
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("FAILED_TO_EDIT"),"",sakai.api.Util.notification.type.ERROR);
                },
                data: data
            });
        };

        var addBindings = function() {

            /** Bind the choose display radiobuttons button */
            $("input[name=" + commentsDisplayRbt + "]", rootel).bind("click", function(e, ui){
                var selectedValue = $("input[name=" + commentsDisplayRbt + "]:checked", rootel).val();
                // When the perPage-rbt is selected the focus should be set to the Page-textbox
                if (selectedValue === "comments_PerPage") {
                    $(commentsPageTxt, rootel).focus();
                }
                return false;
            });

            /** Bind the choose permissions radiobuttons button */
            $("input[name=" + commentsPermissionsRbt + "]", rootel).bind("change", function(e, ui){
                var selectedValue = $("input[name=" + commentsPermissionsRbt + "]:checked", rootel).val();
                // If a login is required the user shouldn't have the posibility to check Name-required or Email-required
                $(commentsNameReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");
                $(commentsEmailReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");
                return false;
            });

            /** Bind the settings submit button*/
            $(commentsSubmit, rootel).bind("click", function(e, ui){
                saveSettings();
            });

            /** Bind the insert comment button*/
            $(commentsCommentBtn, rootel).bind("click", function(e, ui){
                sakai.api.Util.Forms.clearValidation($("#comments_fillInComment form", rootel));
                // checks if the user is loggedIn
                var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
                var txtToFocus = commentsMessageTxt;
                // If the user is not loggedin but we allow anon comments, we show some extra fields.
                if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === true) {
                    if (widgetSettings['sakai:forcename'] !== false) {
                        txtToFocus = commentsNamePosterTxt;
                        $(commentsNamePosterTxtContainer, rootel).show();
                    }
                    if (widgetSettings['sakai:forcemail'] !== false) {
                        // If name is not nescecary we focus the email address.
                        if (txtToFocus === commentsMessageTxt) {
                            txtToFocus = commentsMailPosterTxt;
                        }
                        $(commentsMailPosterTxtContainer, rootel).show();
                    }
                }
                if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === false) {
                    // This should not even happen.. Somebody is tinkering with the HTML.
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("ANON_NOT_ALLOWED"),"",sakai.api.Util.notification.type.ERROR);
                }
                // Show the form.
                $(commentsFillInComment, rootel).show();
                $(txtToFocus, rootel).focus();
                return false;
            });

            /**
             * Hide the form, but keep the input.
             */
            $(commentsCancelComment, rootel).bind('click', function(){
                $(commentsFillInComment, rootel).hide();
            });

            var saveValidateOpts = {
                submitHandler: postComment
            };
            sakai.api.Util.Forms.validate($("#comments_fillInComment form", rootel), saveValidateOpts, true);

            /** Bind the settings cancel button */
            $(commentsCancel, rootel).bind("click", function(e, ui){
                sakai.api.Widgets.Container.informCancel(tuid, "comments");
            });


            $(commentsDelete, rootel).live("click", function(e, ui){
                var id = e.target.id.replace(commentsDelete.replace(/\./g, ""), "");
                doDelete(id, true);
            });

            $(commentsUnDelete, rootel).live("click", function(e, ui){
                var id = e.target.id.replace(commentsUnDelete.replace(/\./g, ""), "");
                doDelete(id, false);
            });


            ////////////////
            // EDIT PARTS //
            ////////////////

            /**
             * Edit link
             */
            $(commentsEdit, rootel).live('click', function(e, ui){
                var id = e.target.id.replace("comments_edit_", "");
                // Show the textarea
                $(commentsMessage + id, rootel).hide();
                $(commentsMessageEditContainer + id, rootel).show();
                var validateOpts = {
                    submitHandler: saveCommentEdit
                };
                sakai.api.Util.Forms.validate($(commentsMessageEditContainer + id + " form"), validateOpts, true);
                return false;
            });

            /**
             * Cancel the edit comment.
             */
            $(commentsEditCancel, rootel).live('click', function(e, ui){
                var id = e.target.id.replace(commentsEditCancel.replace(".", ""), "");
                // Show the textarea
                $(commentsMessageEditContainer + id, rootel).hide();
                $(commentsMessage + id, rootel).show();
            });
        };


        /////////////////////////////
        // Initialisation function //
        /////////////////////////////
        /**
         * Switch between main and settings page
         * @param {Boolean} showSettings Show the settings of the widget or not
         */
        var doInit = function(){
            addBindings();
            var widgeturl = sakai.api.Widgets.getWidgetDataStorageURL(tuid);
            widgeturl = sakai.api.Widgets.widgetLoader.widgets[tuid] ? sakai.api.Widgets.widgetLoader.widgets[tuid].placement : false;
            if (widgeturl) {
                store = widgeturl + "/message";
                $.ajax({
                    url: widgeturl + ".0.json",
                    type: "GET",
                    dataType: "json",
                    success: function(data){
                        // no op
                    },
                    error: function(xhr, textStatus, thrownError) {
                        if (xhr.status == 404) {
                            // we need to create the initial message store
                            $.post(store, {"sling:resourceType":"sakai/messagestore"} );
                        }
                    }
                });
            }
            if (!showSettings) {
                // Show the main view.
                $(commentsSettingsContainer, rootel).hide();
                $(commentsOutputContainer, rootel).show();
            }
            getWidgetSettings();

            // determine if the edit or delete options should be shown for new posts
            if (sakai_global.group && sakai.api.Groups.isCurrentUserAManager(sakai_global.group.groupId, me, sakai_global.group.groupData)){
                allowedEdit = true;
                allowedDelete = true;
            }
        };
        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("comments");
});
