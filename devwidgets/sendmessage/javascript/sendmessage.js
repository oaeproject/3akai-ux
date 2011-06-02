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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js (autoSuggest)
 */

/*global $, opensocial, Config */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {
    if (!sakai_global.sendmessage){

        /**
         * @name sakai_global.sendmessage
         *
         * @class sendmessage
         *
         * @description
         * Initialize the sendmessage widget
         *
         * @version 0.0.1
         * @param {String} tuid Unique id of the widget
         * @param {Boolean} showSettings Show the settings of the widget or not
         */
        sakai_global.sendmessage = function(tuid, showSettings) {


            /////////////////////////////
            // CONFIGURATION VARIABLES //
            /////////////////////////////

            var $rootel = $("#"+tuid);

            var toUser = false;  // configurable user to include as a message recipient
            var layover = true;        //    Will this widget be in a popup or inside another element.
            var callbackWhenDone = null;    //    Callback function for when the message gets sent
            var replyMessageID = null;

            // CSS IDs
            var dialogBoxContainer = "#sendmessage_dialog_box";
            var dialogFooterContainer = "#sendmessage_dialog_footer";
            var dialogFooterInner = "dialog_footer_inner";

            var messageDialogContainer = '.message_dialog';
            var messageForm = "#message_form";

            var messageFieldSubject = "#comp-subject";
            var messageFieldBody = "#comp-body";

            var buttonSendMessage = "#send_message";

            var invalidClass = "sendmessage_invalid";
            var errorClass = "sendmessage_error_message";
            var normalClass = "sendmessage_normal_message";
            var dialogBoxClass = "dialogue_box";
            var dialogHeaderClass = ".s3d-dialog-header";
            var dialogContainerClass = "s3d-dialog-container";
            var dialogClass = ".s3d-dialog";

            var notificationSuccess = "#sendmessage_message_sent";
            var notificationError = "#sendmessage_message_error";

            var autoSuggestContainer = "#as-selections-sendmessage_to_autoSuggest";
            var autoSuggestResults = "#as-results-sendmessage_to_autoSuggest";
            var autoSuggestInput = "#sendmessage_to_autoSuggest";
            var autoSuggestValues = "#as-values-sendmessage_to_autoSuggest";
            var sendmessage_to = "#sendmessage_to",
                sendmessage_subject = "#sendmessage_subject",
                sendmessage_body = "#sendmessage_body",
                send_message_cancel = "#send_message_cancel",
                $sendmessage_container = $("#sendmessage_container");
            var $autosuggest; //placeholder, set in return from API call

            ///////////////////////
            // UTILITY FUNCTIONS //
            ///////////////////////

            /**
             * This method will check if there are any required fields that are not filled in.
             * If a field is not filled in the invalidClass will be added to that field.
             * @return true = no errors, false = error
             */
            var checkFieldsForErrors = function(recipients) {
                var subjectEl = $(messageFieldSubject);
                var bodyEl = $(messageFieldBody);
                var valid = true;
                var subject = subjectEl.val();
                var body = bodyEl.val();

                subjectEl.removeClass(invalidClass);
                bodyEl.removeClass(invalidClass);

                if (!subject) {
                    valid = false;
                    subjectEl.addClass(invalidClass);
                }
                if (!body) {
                    valid = false;
                    bodyEl.addClass(invalidClass);
                }
                // check if there are recipients
                if((recipients.length === 0 && !toUser.length) ||
                    recipients.length === 1 && recipients[0] === "") {
                    // no recipients are selected
                    valid = false;
                    // in the event allowOthers is false, the following will not be seen
                    $(autoSuggestContainer).addClass(invalidClass);
                    $(autoSuggestInput).addClass(invalidClass);
                }

                return valid;
            };

            /**
             * This will reset the whole widget to its default state.
             * It will clear any values or texts that might have been entered.
             */
            var resetView = function() {
                $(dialogHeaderClass, $sendmessage_container).show();
                $sendmessage_container.addClass(dialogContainerClass);
                $(dialogBoxContainer).addClass(dialogBoxClass);
                $(".sendmessage_dialog_footer_inner").addClass(dialogFooterInner);
                $(messageDialogContainer).addClass(dialogClass.replace(/\./,''));
                $(messageDialogContainer).show();
                $(sendmessage_to).show();
                $(sendmessage_subject).show();
                $(sendmessage_body).find("label").show();
                // Clear the input fields
                $(messageFieldSubject + ", " + messageFieldBody).val('');

                // remove autoSuggest if it exists
                sakai.api.Util.AutoSuggest.destroy($autosuggest);

                // Remove error status styling classes
                $(messageFieldSubject).removeClass(invalidClass);
                $(messageFieldBody).removeClass(invalidClass);
            };

            /**
             * Called when the request to the server has been answered
             * @param {Boolean} succes    If the request failed or succeeded.
             */
            var showMessageSent = function(success) {
                // Depending on success we add the correct class and show the appropriate message.
                if (success) {
                    var successMsg = $(notificationSuccess).text();
                    sakai.api.Util.notification.show("", successMsg, sakai.api.Util.notification.type.INFORMATION);
                }
                else {
                    var errorMsg = $(notificationError).text();
                    sakai.api.Util.notification.show("", errorMsg, sakai.api.Util.notification.type.ERROR);
                }
                if ($(messageDialogContainer).hasClass('s3d-dialog')) {
                    $(messageDialogContainer).jqmHide();
                }

                // If we have a valid callback function we call that
                // and dont show the message
                // If we dont have a callback we show a default message and fade out the layover.
                if (success && callbackWhenDone !== null) {
                    callbackWhenDone(true);
                }

                // Reset all the instance variables
                toUser = false;
                layover = true;
                callbackWhenDone = null;
                replyMessageID = null;
            };


            ///////////////////////////////////
            // CONTACTS, GROUPS, AUTOSUGGEST //
            ///////////////////////////////////

            /**
             * Initiates the 'To' field autoSuggest plugin with contact and group data
             * @return None
             */
            var initAutoSuggest = function() {
                var preFill = [];
                if (toUser) {
                    if ($.isPlainObject(toUser) && toUser.uuid) {
                        preFill.push({
                            "name": toUser.username,
                            "value": toUser.uuid
                        });
                    } else if (_.isArray(toUser)) {
                        $.each(toUser, function(i,usr) {
                            preFill.push({
                                "name": usr.username,
                                "value": usr.uuid
                            });
                        });
                    }
                }
                $autosuggest = sakai.api.Util.AutoSuggest.setup($("#sendmessage_to_autoSuggest"), {
                    "asHtmlID": "sendmessage_to_autoSuggest",
                    startText: "Enter contact or group names",
                    keyDelay: "200",
                    retrieveLimit: 10,
                    preFill: preFill,
                    formatList: function(data, elem) {
                        // formats each line to be presented in autosuggest list
                        // add the correct image, wrap name in a class
                        var imgSrc = "/dev/images/user_avatar_icon_32x32.png";
                        if(data.type === "group") {
                            imgSrc = "/dev/images/group_avatar_icon_32x32.png";
                        }
                        var line_item = elem.html(
                            '<img class="sm_suggestion_img" src="' + imgSrc + '" />' +
                            '<span class="sm_suggestion_name">' + data.name + '</span>');
                        return line_item;
                    }
                });
            };

            ///////////////////////////
            // INITIALISE FUNCTION   //
            ///////////////////////////

            /**
             * Initializes the sendmessage widget, optionally preloading the message
             * with a recipient, subject and body. By default, the widget appears as
             * a modal dialog. This function can be called from other widgets or pages.
             * @param {Object|Array} userObj The user object containing the nescecary information {uuid:  "user1", username: "John Doe", type: "user"}, or a user profile
             * @param {jQuery} $insertInId Insert the HTML into another element instead of showing it as a popup (String ID or jQuery)
             * @param {Object} callback When the message is sent this function will be called. If no callback is provided a standard message will be shown that fades out.
             * @param {String} subject The subject
             * @param {String} body The body
             * @param {Boolean} replyOnly hide the to: and subject: fields
             * @param {String} replyID The ID of the message you're replying to
             */
            var initialize = function(userObj, $insertInId, callback, subject, body, replyOnly, replyID, buttonText) {
                layover = true;
                // Make sure that everything is standard.
                resetView();
                // The user we are sending a message to.
                if (userObj && (($.isPlainObject(userObj) && userObj.username) || _.isArray(userObj))) {
                    toUser = userObj;
                } else {
                    toUser = false;
                }

                // Putting the subject and body which have been send in the textboxes
                if(body) {
                    $(messageFieldBody).val(sakai.api.Security.saneHTML(body));
                }
                if(subject) {
                    $(messageFieldSubject).val(sakai.api.Security.saneHTML(subject));
                }

                if (replyOnly) {
                    $(sendmessage_to).find("label").hide();
                    $(sendmessage_subject).hide();
                    $(sendmessage_body).find("label").hide();
                }
                if (replyID) {
                    replyMessageID = replyID;
                }

                if (buttonText) {
                    $("#send_message span").text(buttonText);
                } else {
                    $("#send_message span").text($("#sendmessage_default_button_text").text());
                }

                // Maybe we dont want to display a popup but instead want to add it in another div.
                if ($insertInId) {
                    if (!($insertInId instanceof jQuery)) {
                        $insertInId = $(insertInId);
                    }
                    // Make sure this id exists.
                    if ($insertInId.length > 0) {
                        // The id exists!
                        layover = false;

                        // Remove the dialog stuff.
                        $(dialogHeaderClass, $sendmessage_container).hide();
                        $sendmessage_container.removeClass(dialogContainerClass);
                        $(messageDialogContainer).removeClass(dialogClass.replace(/\./,''));
                        $(dialogBoxContainer).removeClass(dialogBoxClass);
                        // Altough this isnt strictly nescecary it is cleaner.
                        $rootel = $insertInId;
                        $rootel.append($(messageDialogContainer));
                        bindEvents();
                    }
                } else {
                    $rootel = $("#"+tuid);
                    bindEvents();
                }

                initAutoSuggest();
                // Store the callback
                if (callback) {
                    callbackWhenDone = callback;
                }

                // show popup
                if (layover) {
                    $(messageDialogContainer).jqm({
                        modal: true,
                        overlay: 20,
                        toTop: true
                    });
                    $(messageDialogContainer).jqmShow();
                }

            };



            ////////////////////
            // EVENT HANDLING //
            ////////////////////

            /**
             * Callback function called after a call to send a message has completed
             * @param {Boolean} success Status of the 'sendMessage' AJAX call
             * @param {Object} data Data returned from the 'sendMessage' AJAX call
             * @return None
             */
            var handleSentMessage = function(success, data) {
                if(success) {
                    showMessageSent(success);
                } else {
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("YOUR_MESSAGE_FAILED_DELIVERED"),"",sakai.api.Util.notification.type.ERROR);
                }
                $(buttonSendMessage).removeAttr("disabled");
            };

            var bindEvents = function() {

                /**
                 * Event handler to respond when the Send Message button is clicked.
                 * Checks that user input is valid and initiates a 'sendMessage' AJAX
                 * call to the server for the selected recipients.
                 */
                $(buttonSendMessage).die("click");
                $(buttonSendMessage).live("click", function(ev) {
                    // disable the button to prevent clicking button repeatedly
                    $(buttonSendMessage).attr("disabled", "disabled");
                    var recipients = [];
                    // fetch list of selected recipients
                    var recipientsString = $(autoSuggestValues).val();
                    // autoSuggest adds unnecessary commas to the beginning and end
                    // of the values string; remove them
                    if(recipientsString[0] === ",") {
                        recipientsString = recipientsString.slice(1);
                    }
                    if(recipientsString[recipientsString.length - 1] === ",") {
                    recipientsString = recipientsString.slice(0, -1);
                    }
                    recipients = recipientsString.split(",");

                    // Check the fields if there are any required fields that are not filled in.
                    if(checkFieldsForErrors(recipients)) {
                        sakai.api.Communication.sendMessage(recipients, sakai.data.me,
                            $(messageFieldSubject).val(), $(messageFieldBody).val(),
                            "message", replyMessageID, handleSentMessage, true, "new_message");
                    } else {
                        $(buttonSendMessage).removeAttr("disabled");
                        sakai.api.Util.notification.show("All fields are required.","All fields are required",sakai.api.Util.notification.type.ERROR);
                    }
                });
                ////////////////////////
                // jqModal functions  //
                ////////////////////////

                $(send_message_cancel).die("click");
                $(send_message_cancel).live("click", function() {
                    if ($(messageDialogContainer).hasClass('s3d-dialog')) {
                        $(messageDialogContainer).jqmHide();
                    }
                    if ($.isFunction(callbackWhenDone)) {
                        callbackWhenDone(false);
                    }
                });
                ////////////////////
                // Initialization //
                ////////////////////
                $(window).unbind("initialize.sendmessage.sakai");
                $(window).bind("initialize.sendmessage.sakai", function(e, userObj, insertInId, callback, subject, body, replyOnly, replyID, buttonText) {
                    initialize(userObj, insertInId, callback, subject, body, replyOnly, replyID, buttonText);
                });
            };

            var init = function() {
                bindEvents();
                $(window).trigger("ready.sendmessage.sakai");
            };

            init();
        };
    }
    sakai.api.Widgets.widgetLoader.informOnLoad("sendmessage");
});
