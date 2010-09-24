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

/*global $, opensocial, Config */

var sakai = sakai || {};
if (!sakai.sendmessage){

    /**
     * @name sakai.sendmessage
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
    sakai.sendmessage = function(tuid, showSettings) {


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var rootel = $(tuid);

        var toUser = false;  // configurable user to include as a message recipient
        var allowOthers = false;    //    If the user can add other receivers.
        var contactsGroups = [];  // array to hold list of user's contacts & groups (potential message recipients)
        var me = sakai.data.me;
        var fadeOutTime = 1500; //    The time it takes for the lightbox to fade out (in ms).
        var layover = true;        //    Will this widget be in a popup or inside another element.
        var putContentInId = null;    //     if the widget runs in another element, this variable contains the id
        var callbackWhenDone = null;    //    Callback function for when the message gets sent
        var generalMessageFadeOutTime = 5000;
        var dataCallbackCount = 2;  // keeps track of AJAX data returned


        // CSS IDs
        var dialogBoxContainer = "#sendmessage_dialog_box";
        var dialogFooterContainer = "#sendmessage_dialog_footer";

        var messageDialogContainer = '#message_dialog';
        var messageDone = "#message_done";
        var messageForm = "#message_form";
        var messageTo = "#message_to";

        var messageSingleToContainer = "#sendmessage_fixed_to_user";
        var messageMultipleToContainer = "#sendmessage_to_container";
        var messageMultipleLabel = "#sendmessage_to_autoSuggest_label";

        var messageFieldSubject = "#comp-subject";
        var messageFieldBody = "#comp-body";
        var messageFieldFrom = "#message_from";
        var messageFieldToSingle = "#message_to";

        var buttonSendMessage = "#send_message";

        var invalidClass = "sendmessage_invalid";
        var errorClass = "sendmessage_error_message";
        var normalClass = "sendmessage_normal_message";
        var dialogBoxClass = "dialogue_box";
        var dialogFooterClass = "dialog_footer";
        var dialogHeaderClass = ".dialog_header";
        var dialogClass = ".dialog";

        var notificationSuccess = "#sendmessage_message_sent";
        var notificationError = "#sendmessage_message_error";

        var messageOK = "#sendmessage_message_ok";
        var messageError = "#sendmessage_message_error";
        var messageErrorData = "#sendmessage_data_error";

        var autoSuggestContainer = "#as-selections-sendmessage_to_autoSuggest";
        var autoSuggestResults = "#as-results-sendmessage_to_autoSuggest";
        var autoSuggestInput = "#sendmessage_to_autoSuggest";
        var autoSuggestValues = "#as-values-sendmessage_to_autoSuggest";


        ///////////////////////
        // UTILITY FUNCTIONS //
        ///////////////////////

        /**
         * Adds the configured user to the recipient list in the 'To' field.
         * @param {String} name The display name (first and last name) of the user
         * @param {String} uid The user his uuid.
         */
        var addRecipient = function(name, uid) {
            // add an autoSuggest selection to the DOM
            $(messageTo).text(name);
        };

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
            if((recipients.length === 0 && !toUser) ||
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
         * Fade the message and close it.
         */
        var fadeMessage = function() {
            $(messageDone).fadeOut(fadeOutTime, function() {
                if (layover) {
                    $(messageDialogContainer).jqmHide();
                }
            });
        };

        /**
         * This will reset the whole widget to its default state.
         * It will clear any values or texts that might have been entered.
         */
        var resetView = function() {
            $(dialogBoxContainer).addClass(dialogBoxClass);
            $(dialogFooterContainer).addClass(dialogFooterClass);

            // Clear the input fields
            $(messageFieldSubject + ", " + messageFieldBody).val('');

            // remove autoSuggest if it exists
            if($(autoSuggestContainer).length) {
                $(autoSuggestContainer).remove();
                $(autoSuggestResults).remove();
                contactsGroups = [];
                // replace original input
                $("<input/>", {
                    "id": "sendmessage_to_autoSuggest",
                    "type": "text"
                }).insertAfter(messageMultipleLabel);
            }

            // Remove error status styling classes
            $(messageFieldSubject).removeClass(invalidClass);
            $(messageFieldBody).removeClass(invalidClass);

            // Show the form and hide any previous messages.
            $(messageDone).hide();
            $(messageForm).show();
        };

        /**
         * Wrapper function to set HTML message body element
         * @param {String} body Message body text
         * @return None
         */
        var setBody = function(body) {
            $(messageFieldBody).val(sakai.api.Security.saneHTML(body));
        };

        /**
         * Wrapper function to set HTML message subject element
         * @param {String} subject Message subject text
         * @return None
         */
        var setSubject = function(subject) {
            $(messageFieldSubject).val(sakai.api.Security.saneHTML(subject));
        };

        /**
         * This function will show a message in either a red or a green square.
         * @param {String} idToAppend The id of the element you wish to set this message in.
         * @param {String} msg The message you want to display.
         * @param {Boolean} isError true for error (red block)/false for normal message(green block).
         * @param {Number} timeout The amount of milliseconds you want the message to be displayed, 0 = always (till the next message)
         */
        var showGeneralMessage = function(idToAppend, msg, isError, timeout) {
            $(idToAppend).html(sakai.api.Security.saneHTML(msg));
            if (isError) {
                $(idToAppend).addClass(errorClass);
                $(idToAppend).removeClass(normalClass);
            }
            else {
                $(idToAppend).removeClass(errorClass);
                $(idToAppend).addClass(normalClass);
            }

            $(idToAppend).show();
            if (typeof timeout === "undefined" || timeout !== 0) {
                $(idToAppend).fadeOut(generalMessageFadeOutTime);
            }
        };

        /**
         * Called when the request to the server has been answered
         * @param {Boolean} succes    If the request failed or succeeded.
         */
        var showMessageSent = function(success) {
            // Clear the subject and body input fields
            $(messageFieldSubject).val("");
            $(messageFieldBody).val("");

            // show a message
            // We hide the formfield and show a message depending on the succes parameter.
            $(messageForm).hide();
            $(messageDone).show();

            // Remove any previous classes that their might be.
            $(messageDone).removeClass(errorClass);
            $(messageDone).removeClass(normalClass);

            // Depending on success we add the correct class and show the appropriate message.
            if (success) {
                $(messageDone).addClass(normalClass);
                $(messageDone).text(sakai.api.Security.saneHTML($(messageOK).text()));
                var successMsg = $(notificationSuccess).text();
                sakai.api.Util.notification.show("", successMsg, sakai.api.Util.notification.type.INFORMATION);
            }
            else {
                $(messageDone).addClass(errorClass);
                $(messageDone).text(sakai.api.Security.saneHTML($(messageError).text()));
                var errorMsg = $(notificationError).text();
                sakai.api.Util.notification.show("", errorMsg, sakai.api.Util.notification.type.ERROR);
            }

            // If we have a valid callback function we call that
            // and dont show the message
            // If we dont have a callback we show a default message and fade out the layover.
            if (success && callbackWhenDone !== null) {
                callbackWhenDone({"response" : "OK"});
            }
            else {
                fadeMessage();
            }
        };


        ///////////////////////////////////
        // CONTACTS, GROUPS, AUTOSUGGEST //
        ///////////////////////////////////

        /**
         * Initiates the 'To' field autoSuggest plugin with contact and group data
         * @param {Object} contactsGroupsList Array containing JSON objects for
         * each contact and group that should appear in the autoSuggest 'To'
         * field.
         * @return None
         */
        var autoSuggestContactsGroups = function(contactsGroupsList) {
            $("#sendmessage_to_autoSuggest").autoSuggest("", {
                asHtmlID: "sendmessage_to_autoSuggest",
                startText: "Enter contact or group names",
                searchObjProps: "name",
                selectedItemProp: "name",
                keyDelay: "200",
                retrieveLimit: 10,
                formatList: function(data, elem) {
                    // formats each line to be presented in autosuggest list
                    // add the correct image, wrap name in a class
                    var imgSrc = "/dev/_images/user_avatar_icon_32x32.png";
                    if(data.type === "group") {
                        imgSrc = "/dev/_images/group_avatar_icon_32x32.png";
                    }
                    var line_item = elem.html(
                        '<img class="sm_suggestion_img" src="' + imgSrc + '" />' +
                        '<span class="sm_suggestion_name">' + data.name + '</span>');
                    return line_item;
                },
                source: function(query, add) {
                    var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS;
                    sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                        if (success) {
                            var suggestions = [];
                            $.each(data.results, function(i) {
                                if (data.results[i]["rep:userId"] &&
                                !(toUser && toUser.uuid == data.results[i]["rep:userId"])) {
                                    // && data.results[i]["rep:userId"] !== sakai.data.me.user.userid) { // add this to ignore the user sending the message
                                    suggestions.push({"value": data.results[i]["rep:userId"], "name": sakai.api.Security.saneHTML(sakai.api.User.getDisplayName(data.results[i])), "type": "user"});
                                } else if (data.results[i]["sakai:group-id"]) {
                                    suggestions.push({"value": data.results[i]["sakai:group-id"], "name": data.results[i]["sakai:group-title"], "type": "group"});
                                }
                            });
                            add(suggestions);
                        } else {

                        }
                    }, {"q": "*" + query.replace(/\s+/g, "* OR *") + "*", "page": 0, "items": 15});
                }
            });
        };


        /**
         * Shows the lightbox and fills in the from and to field.
         * @param {Object} hash The jqModal hash.
         * @return None
         */
        var loadMessageDialog = function(hash) {
            // Fill in the 'From' text with the current user's name
            $(messageFieldFrom).text(sakai.api.User.getDisplayName(me.profile));

            // Depending on the allowOthers variable we show the appropriate input
            if (allowOthers) {
                // Enable multiple recipients
                $(messageMultipleToContainer).show();

                // Check if a recipient has already been set
                if (toUser !== false) {
                    $(messageSingleToContainer).show();
                    addRecipient(toUser.firstName + " " + toUser.lastName, toUser.uuid);
                } else {
                    $(messageMultipleLabel).text("To");
                }

                // fetch user's contacts and associated groups and set up
                // autoSuggest field with this content
                autoSuggestContactsGroups();
            }
            else {
                // We send this to a specific user.
                // Show the correct input box and fill in the name.
                $(messageMultipleToContainer).hide();
                $(messageSingleToContainer).show();

                // check for null
                if (toUser !== null) {
                    // Fill in the username
                    $(messageFieldToSingle).text(sakai.api.Security.saneHTML(
                        toUser.firstName + " " + toUser.lastName));
                }
            }

            // If this is a layover we show the popup.
            if (layover) {
                hash.w.show();
            }
        };


        ///////////////////////////
        // INITIALISE FUNCTION   //
        ///////////////////////////

        /**
         * Initializes the sendmessage widget, optionally preloading the message
         * with a recipient, subject and body. By default, the widget appears as
         * a modal dialog. This function can be called from other widgets or pages.
         * @param {Object} userObj The user object containing the nescecary information {uuid:  "user1", firstName: "foo", lastName: "bar"}, or a user profile
         * @param {Boolean} allowOtherReceivers If the user can add other users, default = false
         * @param {String} insertInId Insert the HTML into another element instead of showing it as a popup
         * @param {Object} callback When the message is sent this function will be called. If no callback is provided a standard message will be shown that fades out.
         */
        sakai.sendmessage.initialise = function(userObj, allowOtherReceivers, insertInId, callback, subject, body) {

            // Make sure that everything is standard.
            resetView();

            // The user we are sending a message to.
            if (userObj && userObj.firstName) {
                toUser = userObj;
            } else if (userObj) {
                toUser = {};
                toUser.firstName = sakai.api.User.getProfileBasicElementValue(userObj, "firstName");
                toUser.lastName = sakai.api.User.getProfileBasicElementValue(userObj, "lastName");
                toUser.uuid = userObj["rep:userId"];
            } else {
                toUser = false;
            }

            // Maybe this message can be sent to multiple people.
            allowOthers = false;
            if (allowOtherReceivers) {
                allowOthers = allowOtherReceivers;
            }

            // Putting the subject and body which have been send in the textboxes
            if(body) {
                $(messageFieldBody).val(sakai.api.Security.saneHTML(body));
            }
            if(subject) {
                $(messageFieldSubject).val(sakai.api.Security.saneHTML(subject));
            }

            // Maybe we dont want to display a popup but instead want to add it in another div.
            if (insertInId) {

                // Make sure this id exists.
                if ($(insertInId).length > 0) {
                    // The id exists!
                    layover = false;
                    putContentInId = insertInId;

                    // Remove the dialog stuff.
                    $(dialogHeaderClass).remove();
                    $(messageDialogContainer).removeClass(dialogClass.replace(/\./,''));
                    $(dialogBoxContainer).removeClass(dialogBoxClass);
                    $(dialogFooterContainer).removeClass(dialogFooterClass);

                    // Altough this isnt strictly nescecary it is cleaner.
                    rootel = $(insertInId);
                    rootel.append($(messageDialogContainer));
                }

            }

            // Store the callback
            if (callback) {
                callbackWhenDone = callback;
            }

            // show popup
            if (layover) {
                $(messageDialogContainer).jqmShow();
            }
            else {
                // We want to add this in another element.
                loadMessageDialog();
            }

            var o = {
                "setSubject" : setSubject,
                "setBody" : setBody
            };

            return o;
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
                alert("Your message failed to be delivered.");
            }
        };

        /**
         * Event handler to respond when the Send Message button is clicked.
         * Checks that user input is valid and initiates a 'sendMessage' AJAX
         * call to the server for the selected recipients.
         */
        $(buttonSendMessage).bind("click", function(ev) {
            var recipients = [];
            if (allowOthers) {
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
            }

            // Check if toUser has been defined
            if(toUser) {
                recipients.push(toUser.uuid);
            }

            // Check the fields if there are any required fields that are not filled in.
            if(checkFieldsForErrors(recipients)) {
                sakai.api.Communication.sendMessage(recipients,
                    $(messageFieldSubject).val(), $(messageFieldBody).val(),
                    "message", null, handleSentMessage);
            } else {
                alert("All fields are required.");
            }
        });


        ////////////////////////
        // jqModal functions  //
        ////////////////////////

        $(messageDialogContainer).jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onShow: loadMessageDialog
        });
        $(window).trigger("sakai-sendmessage-ready");
    };
}

sakai.api.Widgets.widgetLoader.informOnLoad("sendmessage");
