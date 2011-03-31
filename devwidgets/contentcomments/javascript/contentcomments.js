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

require(["jquery", "sakai/sakai.api.core", "/dev/javascript/content_profile.js"], function($, sakai) {
    /**
     * @name sakai_global.contentcomments
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
    sakai_global.contentcomments = function(tuid, showSettings){


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
        var widgeturl = "";
        var currentSite = "";
        var contentPath = "";
        var store = "";
        var showCommentsChecked = true;

        // Main Ids
        var comments = "#comments";
        var commentsName = "comments";
        var commentsClass = ".comments";

        // Output containers
        var commentsOutputContainer = comments + "_mainContainer";
        var commentsFillInComment = comments + "_fillInComment";
        var commentsUserCommentContainer = comments + "_userCommentContainer";
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
        var commentsEditorOptions = comments + "_editorOptions";

        // Delete
        var commentsDelete = commentsClass + "_delete";
        var commentsUnDelete = commentsClass + "_undelete";

        // Comment permissions
        var commentsShowCheckbox = comments + "_showCommentsCheckbox";
        var commentsAllowCheckbox = comments + "_allowCommentsCheckbox";

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
        var commentsTitlebar = comments + "_titlebar";

        ////////////////////////
        // Utility  functions //
        ////////////////////////

        /**
         * returns how many years, months, days or hours since the dateinput
         * @param {Date} date
         */
        var getTimeAgo = function(date){
            return sakai.api.Datetime.getTimeAgo(date);
        };

        /**
         * Converts all HTML to flat text and converts \n to <br />
         * @param {String} str
         */
        var tidyInput = function(str){
            str = str.toString(); // in the event its not already a string, make it one
            str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            str = str.replace(/\n/g, '<br />');
            return str;
        };

        /**
         * Show the users profile picture
         */
        var displayUserProfilePicture = function(){
            if (me.profile) {
                var profile = me.profile;
                var picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                if (profile.picture && $.parseJSON(profile.picture).name) {
                    picture = "/~" + profile["rep:userId"] + "/public/profile/" + $.parseJSON(profile.picture).name;
                }
                $("#comments_userProfileAvatarPicture").attr("src", picture);
            }
        };

        /**
         * Callback function to sort comments based on created date
         */
        var sortComments = function(a, b){
            return a.created < b.created ? 1 : -1;
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

            // sort comments on create date
            json.comments.sort(sortComments);

            // Loops through all the comments and does the necessary changes to render the JSON-object
            for (var i = 0; i < json.comments.length; i++) {
                jsonDisplay.comments[i] = {};
                var comment = json.comments[i];
                // Checks if the date is already parsed to a date object
                var tempDate = comment.created;
                try {
                    // if the date is not a string this should generate en exception
                    comment.date = sakai.api.l10n.fromEpoch(tempDate, sakai.data.me);
                }
                catch (ex) {
                    if (comment.date instanceof Date) {
                        comment.date = tempDate;
                    } else {
                        comment.date = new Date(comment.date);
                    }
                }

                comment.timeAgo = "about " + getTimeAgo(comment.date) + " "+sakai.api.i18n.General.getValueForKey("AGO");
                comment.formatDate = sakai.api.l10n.transformDateTimeShort(comment.date);
                comment.messageTxt = comment.comment;
                comment.message = tidyInput(comment.comment);
                comment.canEdit = false;
                comment["sakai:id"] = comment.commentId.substring((comment.commentId.lastIndexOf("/") + 1),comment.commentId.length);

                var user = {};
                // User
                // Puts the userinformation in a better structure for trimpath
                if (comment.userid) {
                    if (sakai_global.content_profile.content_data.isManager){
                        comment.canDelete = true;
                    }
                    var profile = comment;
                    user.fullName = sakai.api.User.getDisplayName(profile);
                    user.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                    user.uid = profile.userid;
                    // Check if the user has a picture
                    if (profile.basic.elements.picture && $.parseJSON(profile.basic.elements.picture.value).name) {
                        user.picture = "/~" + user.uid + "/public/profile/" + $.parseJSON(profile.basic.elements.picture.value).name;
                    }
                    user.profile = "/~" + user.uid;
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
            jsonDisplay.sakai = sakai;
            $(commentsShowComments, rootel).html(sakai.api.Util.TemplateRenderer(commentsShowCommentsTemplate, jsonDisplay));
        };

        /**
         * Show all the posted comments
         * This function first retrieves all the users who have posted in this widget and then call the displayCommentsPagedOrNot function
         */
        var showComments = function(){
            // Show the nr of comments we are showing.
            var showingComments = json.total;
            if (widgetSettings.perPage < json.total) {
                showingComments = widgetSettings.perPage;
            }
            $(commentsNumCommentsDisplayed, rootel).html(showingComments);
            // Puts the number of comments on the page
            $(commentsNumComments, rootel).html(json.total);
            // Change to "comment" or "comments"
            if (json.total === 1) {
                $(commentsCommentComments, rootel).text(sakai.api.i18n.General.getValueForKey("COMMENT"));
            }


            // Change the page-number on the display
    /*        $(commentsPager, rootel).pager({
                pagenumber: clickedPage,
                pagecount: Math.ceil(json.total / widgetSettings.perPage),
                buttonClickCallback: pagerClickHandler
            });*/

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
            var sortOn = "sakai:created";
            var sortOrder = "desc";
            var items = 10;
            if (widgetSettings.direction && widgetSettings.direction === "comments_FirstDown") {
                sortOrder = "asc";
            }
            if (widgetSettings.perPage) {
                items = widgetSettings.perPage;
            }

            var url = "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".comments?sortOn=" + sortOn + "&sortOrder=" + sortOrder + "&page=" + (clickedPage - 1) + "&items=" + items;

            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    json = $.extend(data, {}, true);
                    showComments();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("COMMENTS_AN_ERROR_OCCURRED") + " (" + xhr.status + ")","",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * Pager click handler
         * @param {Number} pageclickednumber
         */
        var pagerClickHandler = function(pageclickednumber){
            clickedPage = pageclickednumber;

            // Change the page-number on the display
    /*        $(commentsPager, rootel).pager({
                pagenumber: pageclickednumber,
                pagecount: Math.ceil(json.total / widgetSettings.perPage),
                buttonClickCallback: pagerClickHandler
            });*/
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
                sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("ANON_NOT_ALLOWED"),"",sakai.api.Util.notification.type.ERROR);
            }

            var subject = 'Comment on ' + currentSite;
            //var to = "internal:w-" + widgeturl + "/message";

            var body = $(commentsMessageTxt, rootel).val();
            if (allowPost && body !== "") {
                var message = {
                    "_charset_":"utf-8",
                    "comment": body
                };

                var url = "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".comments";
                $.ajax({
                    url: url,
                    type: "POST",
                    cache: false,
                    success: function(data){
                        // Hide the form.
                        //$(commentsUserCommentContainer, rootel).hide();
                        // Clear the textboxes.
                        $(commentsMessageTxt, rootel).val("");
                        $(commentsNamePosterTxt, rootel).val("");
                        $(commentsMailPosterTxt, rootel).val("");
                        // Add an acitivty
                        sakai.api.Activity.createActivity("/p/" + sakai_global.content_profile.content_data.data["jcr:name"], "content", "default", {"sakai:activityMessage": "__MSG__CONTENT_ADDED_COMMENT__"});
                        // Get the comments.
                        getComments();
                    },
                    error: function(xhr, textStatus, thrownError){
                        if (xhr.status === 401) {
                            sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("YOU_NOT_ALLOWED"),"",sakai.api.Util.notification.type.ERROR);
                        }
                        else {
                            sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_TO_SAVE"),"",sakai.api.Util.notification.type.ERROR);
                        }
                    },
                    data: message
                });
            }
            else {
                sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PLEASE_FILL_ALL_FIELDS"),"",sakai.api.Util.notification.type.ERROR);
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
                $("input[name=" + commentsDirectionRbt + "][value=" + widgetSettings.direction + "]", rootel).attr("checked", true);
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
                sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PLEASE_FILL_POSITIVE_NUM"),"",sakai.api.Util.notification.type.ERROR);
                return false;
            }
            // Check if a valid number is inserted
            else
                if ($(commentsPageTxt, rootel).val().search(/^\d*$/)) {
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PLEASE_FILL_VALID_NUM"),"",sakai.api.Util.notification.type.ERROR);
                    return false;
                }


            comments.direction = $("input[name=" + commentsDirectionRbt + " ]:checked", rootel).val();

            // These properties are noy yet used in the comments-widget, but are saved in JCR
            comments['sakai:allowanonymous'] = true;
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
                if (success) {
                    if (!data.message) {
                        sakai.api.Widgets.saveWidgetData(tuid, {"message":{"sling:resourceType":"sakai/messagestore"}}, null);
                    }
                    widgetSettings = data;
                    // Clean up some values so that true is really true and not "true" or 1 ...
                    var keysToClean = ['sakai:forcename', 'sakai:forcemail', 'notification', 'sakai:allowanonymous'];
                    cleanBooleanSettings(keysToClean);

                    var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
                    if (widgetSettings["sakai:allowanonymous"] === false && !isLoggedIn) {
                        $(commentsCommentBtn, rootel).parent().hide();
                    }

                    if (showSettings) {
                        showSettingScreen(true, data);
                    } else {
                        pagerClickHandler(1);
                    }
                }
                else {
                    if (showSettings) {
                        showSettingScreen(false, data);
                    } else {
                        pagerClickHandler(1);
                    }
                }
            });

        };

        /**
         * Gets the comment allow/show settings and shows the appropriate view.
         * @param {Boolean} getComments true = fetch comments if comments are to be shown, false = do not fetch comments.
         */
        var checkCommentsPermissions = function(getComments){
            var showComments = sakai_global.content_profile.content_data.data["sakai:showcomments"];
            var allowComments = sakai_global.content_profile.content_data.data["sakai:allowcomments"];
            if (showComments === "true") {
                if (getComments) {
                    pagerClickHandler(1);
                }
                var isAnon = me.user && me.user.anon;
                if (allowComments == "false" || isAnon) {
                    // hide comments entry box
                    $("#comments_userCommentContainer", rootel).hide();
                } else {
                    $("#comments_userCommentContainer", rootel).show();
                }
                $("#comments_commentsDisabled", rootel).hide();
                $("#comments_showComments", rootel).show();
            } else {
                // hide comments entry box and existing comments
                $("#comments_userCommentContainer", rootel).hide();
                $("#comments_showComments", rootel).hide();
                $("#comments_commentsDisabled", rootel).show();
            }
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        /** Bind the choose display radiobuttons button */
        $("input[name=" + commentsDisplayRbt + "]", rootel).bind("click", function(e, ui){
            var selectedValue = $("input[name=" + commentsDisplayRbt + "]:checked", rootel).val();
            // When the perPage-rbt is selected the focus should be set to the Page-textbox
            if (selectedValue === "comments_PerPage") {
                $(commentsPageTxt, rootel).focus();
            }
        });

        /** Bind the choose permissions radiobuttons button */
        $("input[name=" + commentsPermissionsRbt + "]", rootel).bind("change", function(e, ui){
            var selectedValue = $("input[name=" + commentsPermissionsRbt + "]:checked", rootel).val();
            // If a login is required the user shouldn't have the posibility to check Name-required or Email-required
            $(commentsNameReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");
            $(commentsEmailReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");

        });

        /** Bind the settings submit button*/
        $(commentsSubmit, rootel).bind("click", function(e, ui){
            // If the settings-input is valid an object will be returned else false will be returned
            var settings = getCommentsSettings();
            if (settings) {
                settings["_charset_"] = "utf-8";

                sakai.api.Widgets.saveWidgetData(tuid, settings, function(success){
                    if (success) {
                        finishNewSettings();
                    }
                    else {
                        sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_TO_SAVE"),"",sakai.api.Util.notification.type.ERROR);
                    }
                });

            }

        });

        /** Bind the insert comment button*/
        $(commentsCommentBtn, rootel).bind("click", function(e, ui){
            $(commentsMainContainerTextarea, rootel).width($(commentsTitlebar).width() - 90);
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
                sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("ANON_NOT_ALLOWED"),"",sakai.api.Util.notification.type.ERROR);
            }
            // Show the form.
            $(commentsUserCommentContainer, rootel).show();
            $(txtToFocus, rootel).focus();
        });

        /**
         * Hide the form, but keep the input.
         */
        $(commentsCancelComment, rootel).bind('click', function(){
            $(commentsUserCommentContainer, rootel).hide();
        });

        /** Bind submit comment button */
        $(commentsPostCommentStart, rootel).bind("click", function(e, ui){
            postComment();
        });

        /** Bind the settings cancel button */
        $(commentsCancel, rootel).bind("click", function(e, ui){
            sakai.api.Widgets.Container.informCancel(tuid, "comments");
        });

        /** Bind the checkboxes */
        $("#comments_allowCommentsOption label, #comments_allowCommentsCheckbox", rootel).bind("click", function(e){
            if (showCommentsChecked) {
                var allowComments = "false";
                if ($(commentsAllowCheckbox, rootel).attr("checked")) {
                    if ($(this).attr("id") !== "comments_allowCommentsCheckbox") {
                        $(commentsAllowCheckbox, rootel).removeAttr("checked");
                    } else {
                        allowComments = "true";
                    }
                }
                else {
                    if ($(this).attr("id") !== "comments_allowCommentsCheckbox") {
                        $(commentsAllowCheckbox, rootel).attr("checked", "checked");
                        allowComments = "true";
                    }
                }

                $.ajax({
                    url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                    type: "POST",
                    cache: false,
                    data: {
                        "sakai:allowcomments": allowComments
                    },
                    success: function(data){
                        sakai_global.content_profile.content_data.data["sakai:allowcomments"] = allowComments;
                        checkCommentsPermissions(false);
                    }
                });
            }
        });
        $("#comments_showCommentsOption label, #comments_showCommentsCheckbox", rootel).bind("click", function(e){
            var showComments = "false";
            if ($(commentsShowCheckbox, rootel).attr("checked")){
                if ($(this).attr("id") !== "comments_showCommentsCheckbox"){
                    showCommentsChecked = false;
                    $(commentsShowCheckbox, rootel).removeAttr("checked");
                    $(commentsAllowCheckbox, rootel).removeAttr("checked");
                    $(commentsAllowCheckbox, rootel).attr("disabled", "disabled");
                } else {
                    showComments = "true";
                    showCommentsChecked = true;
                    $(commentsAllowCheckbox, rootel).removeAttr("checked");
                    $(commentsAllowCheckbox, rootel).removeAttr("disabled");
                }
            } else {
                if ($(this).attr("id") !== "comments_showCommentsCheckbox"){
                    showComments = "true";
                    showCommentsChecked = true;
                    $(commentsShowCheckbox, rootel).attr("checked", "checked");
                    $(commentsAllowCheckbox, rootel).removeAttr("checked");
                    $(commentsAllowCheckbox, rootel).removeAttr("disabled");
                } else {
                    showCommentsChecked = false;
                    $(commentsAllowCheckbox, rootel).removeAttr("checked");
                    $(commentsAllowCheckbox, rootel).attr("disabled", "disabled");
                }
            }

            $.ajax({
                url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                type: "POST",
                cache: false,
                data: {
                    "sakai:showcomments": showComments,
                    "sakai:allowcomments": "false"
                },
                success: function(data){
                    sakai_global.content_profile.content_data.data["sakai:showcomments"] = showComments;
                    sakai_global.content_profile.content_data.data["sakai:allowcomments"] = "false";
                    checkCommentsPermissions(true);
                }
            });
        });


        /////////////////
        // DELETE LINK //
        /////////////////

        /**
         * Deletes or undeleted a post with a certain id.
         * @param {String} id The id of the post.
         * @param {Boolean} deleteValue true = delete it, false = undelete it.
         */
        var doDelete = function(id, deleteValue){
            var url = contentPath + ".comments?commentId=" + id;
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function(){
                    getComments();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_TO_DELETE"),"",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        $(commentsDelete, rootel).live("click", function(e, ui){
            var id = e.target.id.replace(commentsDelete.replace(/\./g, "") + "_", "");
            doDelete(id, true);
            return false;
        });

        $(commentsUnDelete, rootel).live("click", function(e, ui){
            var id = e.target.id.replace(commentsUnDelete.replace(/\./g, ""), "");
            doDelete(id, false);
            return false;
        });


        ////////////////
        // EDIT PARTS //
        ////////////////

        /**
         * Edit link
         */
        $(commentsEdit, rootel).live('click', function(e, ui){
            $(commentsMainContainerTextarea, rootel).width($(commentsTitlebar).width() - 90);
            var id = e.target.id.replace("comments_edit_", "");
            // Show the textarea
            $(commentsMessage + id, rootel).hide();
            $(commentsMessageEditContainer + id, rootel).show();
        });

        /**
         * Save the edited comment.
         */
        $(commentsEditSave, rootel).live('click', function(e, ui){
            var id = e.target.id.replace(commentsEditSave.replace(/\./g, ""), "");
            var message = $(commentsEditText + id, rootel).val();
            if (message !== "") {
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
                        $(commentsMessage + id, rootel).html(sakai.api.Security.saneHTML(tidyInput(message)));
                        // Hide the form
                        $(commentsMessageEditContainer + id, rootel).hide();
                        $(commentsMessage + id, rootel).show();
                    },
                    error: function(xhr, textStatus, thrownError){
                        sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_TO_EDIT"),"",sakai.api.Util.notification.type.ERROR);
                    },
                    data: data
                });
            }
            else {
                sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("PLEASE_ENTER_MESSAGE"),"",sakai.api.Util.notification.type.ERROR);
            }
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

        /////////////////////////////
        // Initialisation function //
        /////////////////////////////
        /**
         * Switch between main and settings page
         * @param {Boolean} showSettings Show the settings of the widget or not
         */
        var doInit = function(){
            $(commentsEditorOptions).hide();
            if (sakai_global.content_profile && sakai_global.content_profile.content_data){
                currentSite = sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"];
                contentPath = "/p/" + sakai_global.content_profile.content_data.path.split("/")[2];

                // check if comments are allowed or shown and display the checkbox options for the manager
                if (sakai_global.content_profile.content_data.isManager){
                    if (sakai_global.content_profile.content_data.data["sakai:allowcomments"] === "false"){
                        $(commentsAllowCheckbox, rootel).removeAttr("checked");
                    } else {
                        sakai_global.content_profile.content_data.data["sakai:allowcomments"] = "true";
                        $(commentsAllowCheckbox, rootel).attr("checked", "checked");
                    }
                    if (sakai_global.content_profile.content_data.data["sakai:showcomments"] === "false"){
                        $(commentsShowCheckbox, rootel).removeAttr("checked");
                        $(commentsAllowCheckbox, rootel).removeAttr("checked");
                        $(commentsAllowCheckbox, rootel).attr("disabled", "disabled");
                        showCommentsChecked = false;
                    } else {
                        sakai_global.content_profile.content_data.data["sakai:showcomments"] = "true";
                        $(commentsShowCheckbox, rootel).attr("checked", "checked");
                        $(commentsAllowCheckbox, rootel).removeAttr("disabled");
                    }
                    $(commentsEditorOptions).show();
                }
            }
            if (!showSettings) {
                // Show the main view.
                displayUserProfilePicture();
                $(commentsSettingsContainer, rootel).hide();
                $(commentsOutputContainer, rootel).show();
                var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
                if (!isLoggedIn) {
                    $(commentsUserCommentContainer, rootel).hide();
                }
            }
            //getWidgetSettings();
            //pagerClickHandler(1);
            checkCommentsPermissions(true);

            // listen for event if new content profile is loaded
            $(window).unbind("content_profile_hash_change");
            $(window).bind("content_profile_hash_change", function(e){
                doInit();
            });
        };
        if (sakai_global.content_profile && sakai_global.content_profile.content_data) {
            doInit();
        } else {
            $(window).bind("ready.contentprofile.sakai", function() {
                doInit();
            });
        }

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contentcomments");
});
