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
    sakai_global.commentswall = function(tuid, showSettings, widgetData){

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var json = false; // Variable used to recieve information by json
        var widgetSettings = {}; // Will hold the widget settings.
        var me = sakai.data.me; // Contains information about the current user
        var rootel = $("#" + tuid); // Get the main div used by the widget
        var jsonDisplay = {};
        var widgeturl = "";
        var store = "";
		var items = 800;

        // Output containers
        var wallcommentsOutputContainer = "#commentswall_mainContainer";
        var wallcommentsFillInComment = "#commentswall_fillInComment";
        var wallcommentsNoComment = "#commentswall_noComment";
        var wallcommentsShowComments = "#commentswall_showComments";

		// Form
		var wallcommentsInputForm = "#commentswall_fillInComment form";

        // Output textboxes
        var wallcommentsMessageTxt = "#commentswall_txtMessage";

        // Output templates
        var wallcommentsShowCommentsTemplate = "commentswall_showCommentsTemplate";
        
        // Avatar
        var userAvatar = $('#commentswall_userProfileAvatar img');

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
        var displayComments = function(){
            jsonDisplay = {
                "comments": [],
                "settings": widgetSettings
            };
            // Loops through all the comments and does the necessary changes to render the JSON-object
            for (var i = 0; i < json.results.length; i++) {
                jsonDisplay.comments[i] = {};
                var comment = json.results[i].post;
                // Checks if the date is already parsed to a date object
                var tempDate = comment["_created"];
                try {
                    // if the date is not a string this should generate en exception
                    comment.date = parseDate(tempDate);
                } catch (ex) {
                    comment.date = tempDate;
                }
                comment.timeAgo = $.timeago(comment.date);
                // Use the sakai API function to parse the date and convert to the users local time
                comment.date = parseDate(tempDate, sakai.data.me);
                comment.formatDate = sakai.api.l10n.transformDateTimeShort(comment.date);
                comment.messageTxt = comment["sakai:body"];
                comment.message = tidyInput(comment["sakai:body"]);
                // weird json bug.
                comment["sakai:deleted"] = (comment["sakai:deleted"] && (comment["sakai:deleted"] === "true" || comment["sakai:deleted"] === true)) ? true : false;

                var user = {};
                // User
                // Puts the userinformation in a better structure for trimpath
                // if (comment.profile["sling:resourceType"] === "sakai/user-profile") { // no longer in use, it seems
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
             
                comment.user = user;

                jsonDisplay.comments[i] = comment;
            }
            $(wallcommentsShowComments, rootel).html(sakai.api.Util.TemplateRenderer(wallcommentsShowCommentsTemplate, jsonDisplay));
            // Render Math formulas in the text
            sakai.api.Util.renderMath(tuid);
        };

        /**
         * Gets the comments from the service.
         */
        var getComments = function(){
            var sortOn = "_created";
            var sortOrder = "desc";
            var url = "/var/search/comments/flat.json?sortOn=" + sortOn + "&sortOrder=" + sortOrder + "&items=" + items + "&marker=" + tuid + "&path=" + store;
            
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    json = $.extend(data, {}, true);
					displayComments();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("COMMENTS_AN_ERROR_OCCURRED") + " (" + xhr.status + ")","",sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * Post a new comment
         */
        var postComment = function(){
            var comment = {
                // Replaces the \n (enters) with <br />
                "message": $(wallcommentsMessageTxt, rootel).val()
            };
            comment["sakai:type"] = "comment";

            var allowPost = true;
            var subject = 'Comment';
            var to = "internal:" + widgeturl + "/message";

            if (allowPost) {
                var body = $(wallcommentsMessageTxt, rootel).val();
                var message = {
                    "sakai:type": "comment",
                    "sakai:to": to,
                    "sakai:marker": tuid,
                    "sakai:subject": subject,
                    "sakai:body": body,
                    "sakai:messagebox": "outbox",
                    "sakai:sendstate": "pending",
                    "_charset_":"utf-8"
                };

                var url = widgeturl + "/message.create.html";
                $.ajax({
                    url: url,
                    type: "POST",
                    cache: false,
                    success: function(data){
                        // Clear the textboxes.
                        $(wallcommentsMessageTxt, rootel).val("");
                        var postData = {
                            "post": data.message,
                            "replies": []
                        };
                        postData.post["profile"] = [me.profile];
                        postData.post["_path"] = widgeturl.slice(3, widgeturl.length) + "/message/inbox/" + data.id;
                        if (widgetSettings && widgetSettings.direction && widgetSettings.direction === "comments_FirstDown") {
                            json.results.push(postData);
                        } else {
                            json.results.unshift(postData);
                        }
                        json.total++;
                        // Show the added comment
            			displayComments();
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
		};

        ////////////////////////
        // Settings functions //
        ////////////////////////

        /**
         * fills up the settings JSON-object
         * @return {Object} the settings JSON-object, returns {Boolean} false if input is invalid
         */
        var getCommentsSettings = function(){
            var comments = {};
            comments.comments = [];

            // Checks if there's already some comments placed on the widget
            comments.comments = json.comments || [];

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
                if (sakai.api.User.isAnonymous(sakai.data.me)) {
                	// Hide the commentbox and show the error message
                	$(wallcommentsFillInComment, rootel).hide();
                	$(wallcommentsNoComment, rootel).show();
                }
                if (success) {
                    if (!data.message) {
                        sakai.api.Widgets.saveWidgetData(tuid, {"message":{"sling:resourceType":"sakai/messagestore"}}, null);
                    }
                    widgetSettings = data;
                    // Clean up some values so that true is really true and not "true" or 1 ...
                    var keysToClean = ['sakai:forcename', 'sakai:forcemail', 'notification', 'sakai:allowanonymous'];
                    cleanBooleanSettings(keysToClean);

					getComments();
                } else {
					getComments();
                }
            });

        };
        
        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBindings = function() {
        	/**
        	* Bind the insert comment button
        	*/
            sakai.api.Util.Forms.clearValidation($(wallcommentsInputForm, rootel));

            /**
            * Show the form.
            */
            $(wallcommentsFillInComment, rootel).show();
            
            var txtToFocus = wallcommentsMessageTxt;
            $(txtToFocus, rootel).focus();

            /**
             * Hide the form, but keep the input.
             */ 
            var saveValidateOpts = {
                submitHandler: postComment
            };
            sakai.api.Util.Forms.validate($(wallcommentsInputForm, rootel), saveValidateOpts, true);
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

			// Show the main view.
			$(wallcommentsOutputContainer, rootel).show();
                
            // Picture
            var picture = sakai.api.Util.constructProfilePicture(me.profile);
			$(userAvatar).attr('src', picture);
			
            getWidgetSettings();
        };
        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("commentswall");
});