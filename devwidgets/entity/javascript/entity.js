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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.timeago.js (Timeago)
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */
require(["jquery", "sakai/sakai.api.core", "/dev/lib/jquery/plugins/jquery.timeago.js"], function($, sakai) {

    /**
     * @name sakai_global.entity
     *
     * @class entity
     *
     * @description
     * Initialize the entity widget - this widget provides person / space and content information
     * http://jira.sakaiproject.org/browse/SAKIII-371
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.entity = function(tuid, showSettings){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Chat status
        var availableStatus = "chat_available_status_";
        var availableStatus_online = availableStatus + "online";
        var availableStatus_busy = availableStatus + "busy";
        var availableStatus_offline = availableStatus + "offline";

        var entitymodes = ["myprofile", "profile", "group", "content"];
        var entityconfig = {
            mode: entitymodes[0], // Set the default entity mode
            data: {
                profile: "",
                count: {
                    messages_unread: 0,
                    contacts_accepted: 0,
                    contacts_invited: 0,
                    contacts_pending: 0,
                    groups: 0,
                    contents: 0
                }
            }
        };
        var profile_dummy_status;
        var profile_status_value;

        ///////////////////
        // CSS SELECTORS //
        ///////////////////

        var $rootel = $("#" + tuid);

        // Container
        var $entity_container = $("#entity_container", $rootel);
        var $entity_container_template;
        var $entity_container_template_myprofile = $("#entity_container_template_myprofile", $rootel);
        var $entity_container_template_profile = $("#entity_container_template_profile", $rootel);
        var $entity_container_template_group = $("#entity_container_template_group", $rootel);
        var $entity_container_template_content = $("#entity_container_template_content", $rootel);
        var $entity_container_actions = $("#entity_container_actions", $rootel);

        // Profile
        var $entity_profile_status;
        var $entity_profile_status_input;
        var entity_profile_status_input_dummy = "entity_profile_status_input_dummy";
        var $entity_profile_status_input_dummy;
        var $entity_profile_status_input_saving;
        var $entity_profile_status_input_saving_failed;

        // Chat status
        var entityProfileChatstatus = "#entity_profile_chatstatus";
        var profileChatStatusClass = ".myprofile_chat_status";
        var profileChatStatusID = "#myprofile_chat_status_";
        var $entity_profile_status_title = "#entity_profile_status_title";
        var $entity_profile_status_body = "#entity_profile_status_body";

        // Tags Link
        var tagsLink = "#entity_tags_link";
        var tagsLinkMenu = tagsLink + "_menu";
        //var tagsLinkMenuLink = tagsLink + "_menu" + " a";

        // Locations Link
        var locationsLink = "#entity_locations_link";
        var locationsLinkMenu = locationsLink + "_menu";
        //var locationsLinkMenuLink = locationsLink + "_menu" + " a";

        // Group buttons
        var entityGroup = "#entity_group";
        var entityGroupLeave = entityGroup + "_leave";
        var entityGroupJoin = entityGroup + "_join";
        var entityGroupJoinRequest = entityGroupJoin + '_request';
        var entityGroupJoinRequestPending = entityGroupJoin + '_request_pending';

        // Content Profile
        var $entityContentUsersDialog = $("#entity_content_users_dialog");
        var $entityContentUsersDialogContainer = $("#entity_content_users_dialog_list_container", $rootel);
        var $entityContentUsersDialogTemplate = $("#entity_content_users_dialog_list_template", $rootel);
        var $entityContentActivityDialog = $("#entity_content_activity_dialog");
        var $entityContentActivityDialogContainer = $("#entity_content_activity_dialog_list_container", $rootel);
        var $entityContentActivityDialogTemplate = $("#entity_content_activity_dialog_list_template", $rootel);

        var authprofileURL;

        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        /**
         * Show or hide the tags link menu
         * @param {String} menuBox menu box we want to display
         * @param {String} menuLink link the user clicked to display the menu box
         * @param {Boolean} hideOnly
         *  true: Hide the menu only
         *  false: Show or hide the menu depending if it's already visible
         */
        var showHideListLinkMenu = function(menuBox, menuLink, hideOnly){
            if ($(menuBox).is(":visible") || hideOnly) {
                $(menuBox).hide();
                $(menuLink).removeClass("entity_list_open");
            } else {
                if ($(tagsLinkMenu).is(":visible") || $(locationsLinkMenu).is(":visible")) {
                    // hide other menus if they are open
                    $(tagsLinkMenu).hide();
                    $(tagsLink).removeClass("entity_list_open");
                    $(locationsLinkMenu).hide();
                    $(locationsLink).removeClass("entity_list_open");
                }
                $(menuBox).css("left", Math.round($(menuLink).offset().left) + "px");
                $(menuBox).css("top", (Math.round($(menuLink).offset().top) + $(menuLink).height()) + "px");
                $(menuLink).addClass("entity_list_open");
                $(menuBox).show();
            }
        };

        /**
         * Render the main entity template
         */
        var renderTemplate = function(){
            sakai.api.Util.TemplateRenderer($entity_container_template, {data: entityconfig.data, mode: entityconfig.mode, sakai: sakai}, $entity_container);
            $entity_container.show();
        };

        /**
         * Check whether there is a valid picture for the user
         * @param {Object} profile The profile object that could contain the profile picture
         * @return {String}
         * The complete URL of the profile picture
         * Will be an empty string if there is no picture
         */
        var constructProfilePicture = function(profile){

            // if (profile.basic.elements.picture && profile["rep:userId"]) {
            // profile.basic.elements object does not have picture information
            // if there is profile picture and userId
            // return the picture links
            if(profile.picture && (profile["rep:userId"] || profile["sakai:group-id"])) {

                var id = null;
                if (profile["rep:userId"]){
                    id = profile["rep:userId"];
                } else if (profile["sakai:group-id"]){
                    id = profile["sakai:group-id"];
                }
                //change string to json object and get name from picture object
                var picture_name = $.parseJSON(profile.picture).name;

                //return "/~" + profile["rep:userId"] + "/public/profile/" + profile.basic.elements.picture.value.name;
                return "/~" + id + "/public/profile/" + picture_name;
            }
            else {
                return "";
            }

        };

        /**
         * Change the chat status for the current user
         * @param {String} chatstatus The chatstatus you want to update the chatstatus with
         * @param {Function} [callback] A callback function that gets fired after the request
         */
        var changeChatStatus = function(chatstatus){
            sakai.data.me.profile = $.extend(true, {}, sakai.data.me.profile, {"chatstatus": chatstatus});

            var data = {
                "chatstatus": chatstatus,
                "_charset_": "utf-8"
            };

            $.ajax({
                url: "/~" + sakai.data.me.profile["rep:userId"] + "/public/authprofile",
                type: "POST",
                data: data,
                success: function(data){
                    $(window).trigger("chat_status_change", chatstatus);
                },
                error: function(xhr, textStatus, thrownError){
                    debug.error("Entity widget - An error occured when sending the status to the server.");
                }
             });

        };

        /**
         * Change the selected value of the dropdown list to the current chat status
         * @param {Object} chatstatus status which has to come up in the dropdown list
         */
        var updateChatStatusElement = function(chatstatus){
            $(entityProfileChatstatus).val(chatstatus);
        };

        /**
         * Gets the number of members and managers in a group and determines users role
         */
        var getGroupMembersManagers = function(){
            var requests = []; // Array used to contain all the information we need to send to the batch post
            var groupid = entityconfig.data.profile["sakai:group-id"];
            requests[0] = {
                "url": "/system/userManager/group/" + groupid + ".members.json",
                "method": "GET"
            };
            requests[1] = {
                "url": "/system/userManager/group/" + groupid + "-managers.members.json",
                "method": "GET"
            };

            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                async: false,
                success: function (data) {
                    var groupMembers = $.parseJSON(data.results[0].body);
                    var groupManagers = $.parseJSON(data.results[1].body);

                    // set the number of members and managers in this group
                    entityconfig.data.profile["memberCount"] = groupMembers.length;
                    entityconfig.data.profile["managerCount"] = groupManagers.length;

                    // set whether the current user's role
                    if (sakai.api.Groups.isCurrentUserAManager(groupid, sakai.data.me)) {
                        // current user is a manager
                        entityconfig.data.profile["role"] = "manager";
                    } else if (sakai.api.Groups.isCurrentUserAMember(groupid, sakai.data.me)) {
                        // current user must be a member and not a manager
                        // because of the structure of the if/else if
                        entityconfig.data.profile["role"] = "member";
                    } else {
                        // current user is either anonymous or a logged-in non-member
                        if (sakai.data.me.user.anon) {
                            entityconfig.data.profile["role"] = "anon";
                        } else {
                            entityconfig.data.profile["role"] = "non-member";
                        }
                    }
                }
            });
        };


        /**
         * Displays the specific type of group membership button
         * @param {String} type specifies which button to show. Options are:
         *  - join: "Join group" button
         *  - leave: "Leave group" button
         *  - request: "Request to join group" button
         *  - pending: "Join request pending" button
         * @return None
         */
        var showGroupMembershipButton = function (type) {
            hideGroupMembershipButton();
            $entity_container.addClass('joinable');
            $("div#sitespages_page_options").addClass('joinable');
            if (type && typeof(type) === "string") {
                switch(type) {
                    case "join":
                        $(entityGroupJoin, $rootel).show();
                        break;
                    case "leave":
                        $(entityGroupLeave, $rootel).show();
                        break;
                    case "request":
                        $(entityGroupJoinRequest, $rootel).show();
                        break;
                    case "pending":
                        $(entityGroupJoinRequestPending, $rootel).show();
                        break;
                }
            }
        };


        /**
         * Hides any showing group membership button
         */
        var hideGroupMembershipButton = function () {
            $entity_container.removeClass('joinable');
            $("div#sitespages_page_options").removeClass('joinable');
            $("button.entity_action_button", $rootel).hide();
        };


        /**
         * Sends a request to the group managers for the user to join as a member
         */
        var requestJoinGroup = function () {
            // add this user to the list of join requests for this group
            var groupid = entityconfig.data.profile["sakai:group-id"];
            sakai.api.Groups.addJoinRequest(sakai.data.me.user.userid, groupid,
            function (success) {
                if (success) {
                    // send a join request message to all group managers
                    /*
                     * ... to be fully implemented in Q2 ...
                     *

                    // set up message values
                    var username = sakai.data.me.profile.basic.elements.firstName.value +
                        " " + sakai.data.me.profile.basic.elements.lastName.value;
                    var groupname = entityconfig.data.profile["sakai:group-title"];
                    var subject = sakai.config.Groups.JoinRequest.title.replace(/\$\{user\}/gi, username);
                    subject = subject.replace(/\$\{group\}/gi, groupname);
                    var body = sakai.config.Groups.JoinRequest.body.replace(/\$\{user\}/gi, username);
                    body = body.replace(/\$\{group\}/gi, groupname);
                    var groupmanagers = groupid + "-managers";

                    // send message
                    sakai.api.Communication.sendMessage(groupmanagers, sakai.data.me,
                        subject, body, "message", null, function (success, data) {
                            if (success) {
                                // show a notification and change the button
                                sakai.api.Util.notification.show("Group Membership", "Your request has successfully been sent to the group's managers.");
                                showGroupMembershipButton("pending");
                            } else {
                                // show a notification and do not change the button
                                debug.log("entity.js/requestJoinGroup() ERROR: Could not send join request messages for: " +
                                    sakai.data.me.user.userid + " for groupid: " + groupid +
                                    " to manager group: " + groupmanagers +
                                    " - error status: " + data.textStatus);
                                sakai.api.Util.notification.show("Group Membership", "Sorry, there was a problem sending your request. We've notified system administrators. Please try again later or contact an administrator if the issue persists.");
                            }
                        });
                    */

                    // show a notification and change the button
                    sakai.api.Util.notification.show($("#entity_group_membership").text(),
                                                    $("#entity_group_request_sent").text(),
                                                    sakai.api.Util.notification.type.INFORMATION);
                    showGroupMembershipButton("pending");
                } else {
                    sakai.api.Util.notification.show($("#entity_group_membership").text(),
                                                    $("#entity_group_problem_with_request").text(),
                                                    sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * Joins the specific group as a member
         */
        var joinGroup = function () {
            // add user to group
            sakai.api.Groups.addUsersToGroup(entityconfig.data.profile["sakai:group-id"], "members", [sakai.data.me.user.userid], function(success) {
                if (success) {
                    sakai.api.Util.notification.show($("#entity_group_membership").text(),
                                                    $("#entity_group_adding_successful").text(),
                                                    sakai.api.Util.notification.type.INFORMATION);
                    // wait for two seconds and then redirect
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                } else {
                    debug.error("entity.js/joinGroup() ERROR: Could not add member: " +
                        sakai.data.me.user.userid + " to groupid: " +
                        entityconfig.data.profile["sakai:group-id"] +
                        " - error status: " + data.textStatus);
                        sakai.api.Util.notification.show($("#entity_group_membership").text(),
                                                        $("#entity_group_problem_adding").text(),
                                                        sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * Leaves the specific group as a member
         */
        var leaveGroup = function () {
            // if this user is a manager, we need to remove them from the manager group
            var groupid = entityconfig.data.profile["sakai:group-id"],
                groupType = "members";

            if (entityconfig.data.profile.role === "manager") {
                groupType = "managers";
            }

            // remove user from group
            sakai.api.Groups.removeUsersFromGroup(groupid, groupType, [sakai.data.me.user.userid], function (success) {
                if (success) {
                    // because the user has left the group, they may not be allowed to
                    // view the current page - refresh the page to check visibility
                    sakai.api.Util.notification.show($("#entity_group_membership").text(),
                                                    $("#entity_group_removal_successful").text(),
                                                    sakai.api.Util.notification.type.INFORMATION);
                    // wait for two seconds and then redirect
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                } else {
                        sakai.api.Util.notification.show($("#entity_group_membership").text(),
                                                        $("#entity_group_problem_removing").text(),
                                                        sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        //////////////
        // CONTACTS //
        //////////////

        /**
         * Check whether a user is already a contact, invited or pending
         * @param {String} userid    the user's userid
         */
        var checkContact = function(userid){
            // Do a batch request to get contacts, invited and pending
            var reqs = [
                {
                    url : sakai.config.URL.CONTACTS_FIND_STATE,
                    method : "GET",
                    parameters : {
                        items: 100,
                        page: 0,
                        state: "ACCEPTED"
                    }
                },
                {
                    url : sakai.config.URL.CONTACTS_FIND_STATE,
                    method : "GET",
                    parameters : {
                        items: 100,
                        page: 0,
                        state: "INVITED"
                    }
                },
                {
                    url : sakai.config.URL.CONTACTS_FIND_STATE,
                    method : "GET",
                    parameters : {
                        items: 100,
                        page: 0,
                        state: "PENDING"
                    }
                },
                {
                    url : sakai.config.URL.PRESENCE_CONTACTS_SERVICE,
                    method : "GET"
                }
            ];

            var handleChatUpdate = function(e) {
                var contactProfile = sakai_global.chat.getOnlineContact(userid).profile;
                if (contactProfile && contactProfile.chatstatus) {
                    if (entityconfig.data.profile.chatstatus !== contactProfile.chatstatus) {
                        $("#entity_contact_" + entityconfig.data.profile.chatstatus).hide();
                        entityconfig.data.profile.chatstatus = contactProfile.chatstatus;
                        $("#entity_contact_" + entityconfig.data.profile.chatstatus).show();
                    }
                } else {
                    $("#entity_contact_" + entityconfig.data.profile.chatstatus).hide();
                    entityconfig.data.profile.chatstatus = "offline";
                    $("#entity_contact_" + entityconfig.data.profile.chatstatus).show();
                }
            };

            $.ajax({
                cache: false,
                url: "/system/batch",
                type: "POST",
                data: {
                    "requests": $.toJSON(reqs)
                },
                success: function(data){
                    var presence = $.parseJSON(data.results[3].body);
                    for (var l in presence.contacts){
                        if (presence.contacts[l].user === userid){
                            if (presence.contacts[l].profile.chatstatus && presence.contacts[l]["sakai:status"] === "online") {
                                entityconfig.data.profile.chatstatus = presence.contacts[l].profile.chatstatus;
                            } else {
                                entityconfig.data.profile.chatstatus = "offline";
                            }
                            $("#entity_contact_" + entityconfig.data.profile.chatstatus).show();

                            // Add binding to chat status updates for the contact
                            $(window).bind("update.chat.sakai", handleChatUpdate);
                        }
                    }
                    var contacts = $.parseJSON(data.results[0].body);
                    for (var i in contacts.results){
                        if (contacts.results[i].target === userid){
                            $("#entity_contact_accepted").show();
                            return true;
                        }
                    }
                    var invited = $.parseJSON(data.results[1].body);
                    for (var j in invited.results){
                        if (invited.results[j].target === userid){
                            // is this a request to automatically accept an invitation?
                            var request = new Querystring();
                            if (request.get("accepttrue") === "accepttrue") {
                                // automatically accept the invitation
                                acceptInvitation(userid);
                            }
                            $("#entity_contact_invited").show();
                            return true;
                        }
                    }
                    var pending = $.parseJSON(data.results[2].body);
                    for (var k in pending.results){
                        if (pending.results[k].target === userid){
                            $("#entity_contact_pending").show();
                            return true;
                        }
                    }
                    $("#entity_add_to_contacts").show();
                    return true;
                }
            });
        };

        /**
         * Accept a contact invitation
         */
        var acceptInvitation = function (userid) {
            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/contacts.accept.html",
                type: "POST",
                data : {"targetUserId":userid},
                success: function(data){
                    $("#entity_contact_invited").hide();
                    $("#entity_contact_accepted").show();
                    var notificationMsg = sakai.api.i18n.General.getValueForKey(
                        "YOU_HAVE_ACCEPTED_CONTACT_INVITATION").replace(
                        /\$\{displayName\}/gi, sakai.api.User.getDisplayName(
                            entityconfig.data.profile
                        )
                    );
                    sakai.api.Util.notification.show(
                        sakai.api.i18n.General.getValueForKey("MY_CONTACTS"),
                        notificationMsg
                    );
                },
                error: function (data) {
                    var notificationMsg = sakai.api.i18n.General.getValueForKey(
                        "THERE_WAS_AN_ERROR_ACCEPTING_CONTACT").replace(
                        /\$\{displayName\}/gi, sakai.api.User.getDisplayName(
                            entityconfig.data.profile
                        )
                    );
                    sakai.api.Util.notification.show(
                        sakai.api.i18n.General.getValueForKey("MY_CONTACTS"),
                        notificationMsg
                    );
                }
            });
        };

        /////////////
        // BINDING //
        /////////////

        /**
         * Add binding to the profile status elements
         */
        var addBindingProfileStatus = function(){

            // We need to reinitialise the jQuery objects after the rendering
            $entity_profile_status = $("#entity_profile_status", $rootel);
            $entity_profile_status_input = $("#entity_profile_status_input", $rootel);
            $entity_profile_status_input_dummy = $("#entity_profile_status_input_dummy", $rootel);
            $entity_profile_status_input_saving = $("#entity_profile_status_input_saving", $rootel);
            $entity_profile_status_input_saving_failed = $("#entity_profile_status_input_saving_failed", $rootel);

            // Add the focus event to the profile status status
            $entity_profile_status_input.bind("focus", function(){

                // If we don't have the dummy status (e.g. What are you doing) variable set yet, set it now.
                if (!profile_dummy_status) {
                    profile_dummy_status = $entity_profile_status_input_dummy.text();
                }

                // Check whether the status field has the dummy class
                if ($entity_profile_status_input.hasClass(entity_profile_status_input_dummy)) {

                    // Clear the current value for the input box and remove the dummy class
                    $entity_profile_status_input.val("");
                    $entity_profile_status_input.removeClass(entity_profile_status_input_dummy);
                }

            });

            // Add the blur event to the profile status
            $entity_profile_status_input.bind("blur", function(){

                // Check if it still has a dummy
                if (!$entity_profile_status_input.hasClass(entity_profile_status_input_dummy) && $.trim($entity_profile_status_input.val()) === "") {

                    // Add the dummy class
                    $entity_profile_status_input.addClass(entity_profile_status_input_dummy);

                    // Set the input value to the dummy status (e.g. What are you doing)
                    $entity_profile_status_input.val(profile_dummy_status);

                }
            });

            // Add the submit event to the status form
            $entity_profile_status.unbind("submit");
            $entity_profile_status.bind("submit", function(){

                // Get the correct input value from the user
                var inputValue = $entity_profile_status_input.hasClass(entity_profile_status_input_dummy) ? "" : $.trim($entity_profile_status_input.val());

                // Escape html
                inputValue = sakai.api.Security.escapeHTML(inputValue);

                if (!profile_status_value || profile_status_value !== inputValue) {
                    profile_status_value = inputValue;

                    if (sakai.data.me.profile.activity) {
                        delete sakai.data.me.profile.activity;
                    }

                    var profileData = $.extend(true, {}, sakai.data.me.profile, {"status": inputValue});

                    sakai.api.Server.filterJCRProperties(profileData);

                    var originalText = $("button span", $entity_profile_status).text();
                    $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML($entity_profile_status_input_saving.text()));

                    sakai.api.Server.saveJSON(authprofileURL, profileData, function(success, data) {
                        if (success) {
                            // Set the button back to it's original text
                            $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML(originalText));

                            // Create an activity item for the status update
                            var nodeUrl = authprofileURL;
                            var activityMsg = "Status: " + inputValue;

                            var activityData = {
                                "sakai:activityMessage": activityMsg
                            };

                            sakai.data.me.profile = $.extend(true, sakai.data.me.profile, {"status": inputValue});

                            sakai.api.Util.notification.show($($entity_profile_status_title).text(), $($entity_profile_status_body).text());

                            //trigger chat_status_message_change to update the status message on chat widget.
                            $(window).trigger("chat_status_message_change", inputValue);

                            sakai.api.Activity.createActivity(nodeUrl, "status", "default", activityData);

                        } else {
                            // Log an error message
                            debug.error("Entity widget - the saving of the profile status failed");
                            profile_status_value = "";

                            // Show the message about a saving that failed to the user
                            $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML($entity_profile_status_input_saving_failed.text()));

                            // Show the origin text after 5 min
                            window.setTimeout(function(){
                                $("button span", $entity_profile_status).text(sakai.api.Security.saneHTML(originalText));
                            }, 5000);
                        }
                    });
                }
                return false;
            });

        };

        /**
         * Add binding to elements related to chat status
         */
        var addBindingChatStatus = function(){
            // Add the change event to the chatstatus dropdown
            $(entityProfileChatstatus).bind("change", function(ev){
                changeChatStatus($(ev.target).val());
            });
        };

        /**
         * Add binding to elements related to tag drop down
         */
        var addBindingTagsLink = function(){
            // Add the click event to the tagsLink link
            $(tagsLink).die("click");
            $(tagsLink).live("click", function(){
                showHideListLinkMenu(tagsLinkMenu, tagsLink, false);
            });
        };

        // Add the click listener to the document
        $(document).click(function(e){
            var $clicked = $(e.target);
            // if element clicked is not tag Link only then hide the menu.
            if (!$clicked.is(tagsLink)) {
                showHideListLinkMenu(tagsLinkMenu, tagsLink, true);
            }
        });

        /**
         * Add binding to elements related to locations drop down
         */
        var addBindingLocationsLink = function(){
            // Add the click event to the locationsLink link
            $(locationsLink).bind("click", function(){
                showHideListLinkMenu(locationsLinkMenu, locationsLink, false);
            });
        };

        /**
         * Remove contact button after contact request is sent
         */
         var removeAddContactLinks = function(user){
            $('#entity_add_to_contacts').hide();
            $('#entity_contact_pending').show();
        };

        /**
         * Add binding to add contact button
         */
        var addBindingAddContact = function(){
            // A user want to make a new friend
            $('#entity_add_to_contacts').live("click", function() {
                var contactclicked = entityconfig.data.profile["rep:userId"];
                $(window).trigger("initialize.addToContacts.sakai", { user: contactclicked, callback: function(user) {
                    removeAddContactLinks(user);
                }});
            });
        };

        /**
         * Add binding to elements related to tag drop down
         */
        var addBindingGroup = function(){
            // Add the click event to the leave group button
            $(entityGroupLeave).bind("click", function () {
                leaveGroup();
            });

            // Add the click event to the join group button
            $(entityGroupJoin).bind("click", function(){
                joinGroup();
            });

            // Add the click event to the join group request button
            $(entityGroupJoinRequest).bind("click", function(){
                requestJoinGroup();
            });

            // determine which button to display to the current user
            var groupid = entityconfig.data.profile["sakai:group-id"];
            var joinability = entityconfig.data.profile["sakai:group-joinable"];
            var role = entityconfig.data.profile.role;

            if (role === "member" || (role === "manager" && entityconfig.data.profile.managerCount > 1)) {
                // we have either a group member or manager, but not the last group manager
                showGroupMembershipButton("leave");
            }
            else if ((role === "manager" && entityconfig.data.profile.managerCount === 1) ||
                (role === "non-member" && joinability ===
                    sakai.config.Permissions.Groups.joinable.manager_add) || role === "anon") {
                // we have either the last group manager or a non-member with
                // joinability set to 'only managers can add' or an anonymous user
                hideGroupMembershipButton();
            }
            else if (role === "non-member" &&
                joinability === sakai.config.Permissions.Groups.joinable.user_direct) {
                // we have a non-member with joinability set to 'users can join directly'
                showGroupMembershipButton("join");
            }
            else if (role === "non-member" &&
                joinability === sakai.config.Permissions.Groups.joinable.user_request) {
                // we have a non-member with joinability set to 'users must request to join'

                // has this user already requested to join the group? Search the list of join requests
                sakai.api.Groups.getJoinRequests(groupid, function (success, data) {
                    if (success) {
                        // search data
                        var foundRequest = false;
                        if (data && data.total && data.total > 0) {
                            for (var i in data.results) {
                                if (data.results.hasOwnProperty(i) &&
                                    data.results[i].userid === sakai.data.me.user.userid) {
                                    // this user has a pending join request for this group
                                    foundRequest = true;
                                    break;
                                }
                            }
                        }
                        if (foundRequest) {
                            // user has a pending join request
                            showGroupMembershipButton("pending");
                        } else {
                            // user has not requested to join
                            showGroupMembershipButton("request");
                        }
                    } else {
                        // not sure if this user has requested, show request button
                        showGroupMembershipButton("request");
                    }
                },
                false);  // this is an non-async call
            }
            else {
                // unrecognized combination of user and joinability setting
                hideGroupMembershipButton();
            }
        };


        ///////////////////////////
        // ENTITY MODE FUNCTIONS //
        ///////////////////////////

        ////////////////////
        // MYPROFILE MODE //
        ////////////////////

        /**
         * Set data.
         * For example:
         * No. Unread messages
         * No. of Contacts
         * No. invited contacts
         * No. of pending request
         * No. of group
         *
         */
        var setMyProfileData = function(){
            //no. of unread messages
            entityconfig.data.count.messages_unread = sakai.data.me.messages.unread;

            //no. of contacts
            entityconfig.data.count.contacts_accepted = sakai.data.me.contacts.accepted;

            //no. of contacts invited
            entityconfig.data.count.contacts_invited = sakai.data.me.contacts.invited;

            //no. of pending requests
            entityconfig.data.count.contacts_pending = sakai.data.me.contacts.pending;

            //no. of groups user is memeber of
            entityconfig.data.count.groups = sakai.data.me.groups.length;
        };

        /**
         * Add binding to MyProfile elements on the entity widget
         */
        var addMyProfileBinding = function(){
            // Add binding to the profile status elements
            addBindingProfileStatus();

            // Add binding related to chat status
            addBindingChatStatus();

            // Add binding to elements related to tag drop down
            addBindingTagsLink();
        };


        //////////////////
        // PROFILE MODE //
        //////////////////

        /**
         * Set the profile data for the user such as the status and profile picture
         */
        var setProfileData = function(){
            // Set the profile picture for the user you are looking at
            // /~admin/public/profile/256x256_profilepicture
            entityconfig.data.profile.picture = constructProfilePicture(entityconfig.data.profile);

            // Set the status for the user you want the information from
            if (entityconfig.data.profile.basic && entityconfig.data.profile.basic.elements.status) {
                entityconfig.data.profile.status = entityconfig.data.profile.status;
            }

            // set the url to POST the status updates to
            authprofileURL = "/~" + entityconfig.data.profile["rep:userId"] + "/public/authprofile";

            if (!entityconfig.data.profile.chatstatus) {
                entityconfig.data.profile.chatstatus = "offline";
            }

        };

        /**
         * Add binding to Profile elements on the entity widget
         */
        var addProfileBinding = function(){
            // Add binding to the profile status elements
            addBindingProfileStatus();

            // Add binding related to chat status
            addBindingChatStatus();

            // Add binding to add contact button
            addBindingAddContact();

            // Add binding to available to chat link
            $('#entity_available_to_chat').live("click", function() {
                sakai.chat.openContactsList();
            });

            $("#entity_contact_invited").live("click", function(){
                acceptInvitation(entityconfig.data.profile["rep:userId"]);
            });

            // Add binding to elements related to tag drop down
            addBindingTagsLink();
        };


        ////////////////
        // GROUP MODE //
        ////////////////

        /**
         * Set the profile group data such as the users role, member count and profile picture
         */
        var setGroupData = function(){
            // determine users role and get the count of members and managers
            getGroupMembersManagers();

            // Set the profile picture for the group you are looking at
            entityconfig.data.profile.picture = constructProfilePicture(entityconfig.data.profile);

            // if the user is a manager we want to make sure the image is not cached if they change it and the entity widget rerenders
            if (entityconfig.data.profile.picture && entityconfig.data.profile["role"] === "manager") {
                entityconfig.data.profile.picture = entityconfig.data.profile.picture + "?sid=" + Math.random();
            }

            // configure the changepic widget to look at the group profile image
            if (sakai_global.changepic) {
                $(window).trigger("setData.changepic.sakai", ["group", entityconfig.data.profile["sakai:group-id"]]);
            } else {
                $(window).bind("ready.changepic.sakai", function(e){
                    $(window).trigger("setData.changepic.sakai", ["group", entityconfig.data.profile["sakai:group-id"]]);
                });
            }

        };

        /**
         * Add binding to Content elements on the entity widget
         */
        var addGroupBinding = function(){
            // Add binding to group related buttons
            addBindingGroup();

            // Add binding to locations box
            addBindingLocationsLink();

            // Add binding to elements related to tag drop down
            addBindingTagsLink();
        };


        //////////////////
        // CONTENT MODE //
        //////////////////

        /**
         * Set the data for the content object information
         * @param {Object} data The data we need to parse
         */
        var setContentData = function(data){
            if (!data) {
                debug.warn("Entity widget - setContentData - the data parameter is invalid:'" + data + "'");
                return;
            }

            var filedata = data.data;
            var jcr_content = filedata["jcr:content"];
            var jcr_access = filedata["rep:policy"];

            entityconfig.data.profile = {};

            // Check whether there is a jcr:content variable
            if (jcr_content) {

                // Set the person that last modified the resource
                if (jcr_content["lastModifiedBy"]) {
                    entityconfig.data.profile.lastmodifiedby = jcr_content["lastModifiedBy"];
                }
                // Set the last modified date
                if (jcr_content["lastModified"]) {
                    entityconfig.data.profile.lastmodified = $.timeago(sakai.api.Util.parseSakaiDate(jcr_content["lastModified"]));
                }
                // Set the size of the file
                if (jcr_content["jcr:data"]) {
                    entityconfig.data.profile.filesize = sakai.api.Util.convertToHumanReadableFileSize(jcr_content["jcr:data"]);
                }
                // Set the mimetype of the file
                if (jcr_content["jcr:mimeType"]) {
                    entityconfig.data.profile.mimetype = jcr_content["jcr:mimeType"];
                }
            }

            // Set file extension
            entityconfig.data.profile.extension = filedata["sakai:fileextension"];

            // Check if user is a manager or viewer
            entityconfig.data.profile["role"] = "viewer";
            if (jcr_access) {
                // check if user is a manager
                $.each(jcr_access, function(index, resultObject){
                    if (resultObject["rep:principalName"] === sakai.data.me.user.userid) {
                        if ($.inArray("jcr:all", resultObject["rep:privileges"]) != 1) {
                            entityconfig.data.profile["role"] = 'manager';
                        }
                    }
                });
            }

            // Set the created by and created (date) variables
            if (filedata["createdBy"]) {
                entityconfig.data.profile.createdby = filedata["createdBy"];
            }

            if (filedata["created"]) {
                entityconfig.data.profile.created = $.timeago(sakai.api.Util.parseSakaiDate(filedata["created"]));
            }

            if (filedata["sakai:pooled-content-file-name"]) {
                entityconfig.data.profile.name = filedata["sakai:pooled-content-file-name"];
            }

            // If it's a URL then set the URL
            if(filedata["sakai:pooled-content-url"]){
                entityconfig.data.profile.url = filedata["sakai:pooled-content-url"];
            }

            // If it's a URL then set the URL
            if(filedata["sakai:pooled-content-url"]){
                entityconfig.data.profile.revurl = filedata["sakai:pooled-content-revurl"];
            }

            // Set the path of the resource
            if(data.url){
                entityconfig.data.profile.path = data.url;
            }
            // Set the contentpath of the resource
            if(data.url){
                entityconfig.data.profile.contentpath = data.path;
            }

            // Set the description of the resource
            if (filedata["sakai:description"]) {
                entityconfig.data.profile.description = filedata["sakai:description"];
            }

            // Set the tags of the resource
            if (filedata["sakai:tags"]) {
                entityconfig.data.profile['sakai:tags'] = filedata["sakai:tags"].toString();
            }

            // Set the copyright of the file
            if (filedata["sakai:copyright"]) {
                entityconfig.data.profile.copyright = filedata["sakai:copyright"];
            }

            // Set the permissions of the file
            if (filedata["sakai:copyright"]) {
                entityconfig.data.profile.permissions = filedata["sakai:permissions"];
            }

            if (document.location.pathname === "/dev/content_profile.html" || document.location.pathname === "/content"){
                entityconfig.data["link_name"] = false;
            } else {
                entityconfig.data["link_name"] = true;
            }
        };

        /**
         * Add binding to Content elements on the entity widget
         */
        var addContentBinding = function(){
            // Add binding to locations box
            addBindingLocationsLink();

            // Add binding to elements related to tag drop down
            addBindingTagsLink();
        };

        ///////////////////
        // CONTENT2 MODE //
        ///////////////////

        /**
         * Callback function to sort activity based on created date
         */
        var sortActivity = function(a, b){
            return a["created"] < b["created"] ? 1 : -1;
        };

        /**
         * Set the data for the content2 object information
         * @param {Object} data The data we need to parse
         */
        var setContent2Data = function(data){
            setContentData(data);

            // get the count of users and groups who have access to the content
            var userCount = 0;
            var groupCount = 0;
            for (var i in sakai_global.content_profile.content_data.members.viewers) {
                if (sakai_global.content_profile.content_data.members.viewers[i]["rep:userId"]) {
                    userCount++;
                } else if (sakai_global.content_profile.content_data.members.viewers[i]['sakai:group-id']) {
                    groupCount++;
                }
            }
            for (var ii in sakai_global.content_profile.content_data.members.managers) {
                if (sakai_global.content_profile.content_data.members.managers[ii]["rep:userId"]) {
                    userCount++;
                } else if (sakai_global.content_profile.content_data.members.managers[ii]['sakai:group-id']) {
                    groupCount++;
                }
            }
            entityconfig.data.profile.usercount = userCount;
            entityconfig.data.profile.groupcount = groupCount;

            // Set the recent activity for the file
            if (sakai_global.content_profile.content_data.activity) {
                entityconfig.data.profile.activity = sakai_global.content_profile.content_data.activity;
                entityconfig.data.profile.activity.results.sort(sortActivity);

                // find a user for each action from the users list
                var userList = sakai_global.content_profile.content_data.members.managers.concat(sakai_global.content_profile.content_data.members.viewers);
                var foundUser = false;

                // loop through each activity
                for (var j in entityconfig.data.profile.activity.results) {
                    if (entityconfig.data.profile.activity.results.hasOwnProperty(j)) {

                        // loop though the userlist to find the actor
                        for (var jj in userList) {
                            if (userList.hasOwnProperty(jj)) {
                                if (userList[jj]["rep:userId"] && userList[jj]["rep:userId"] === entityconfig.data.profile.activity.results[j]["sakai:activity-actor"]) {
                                    entityconfig.data.profile.activity.results[j].actorProfile = userList[jj];
                                    foundUser = true;
                                } else if (!foundUser) {
                                        entityconfig.data.profile.activity.results[j].actorProfile = entityconfig.data.profile.activity.results[j]["sakai:activity-actor"];
                                }
                            }
                        }

                        // translate the activity message
                        if (entityconfig.data.profile.activity.results[j]["sakai:activityMessage"]) {
                            var messageArray = entityconfig.data.profile.activity.results[j]["sakai:activityMessage"].split(" ");
                            var translatedMessageArray = entityconfig.data.profile.activity.results[j]["sakai:activityMessage"].split(" ");

                            for (var jjj in messageArray) {
                                if (messageArray.hasOwnProperty(jjj)) {
                                    var expression = new RegExp("__MSG__(.*?)__", "gm");
                                    if (expression.test(translatedMessageArray[jjj])) {
                                        translatedMessageArray[jjj] = sakai.api.i18n.General.getValueForKey(messageArray[jjj].substr(7, messageArray[jjj].length - 9));
                                        if (translatedMessageArray[jjj] && translatedMessageArray[jjj] !== "false") {
                                            messageArray[jjj] = translatedMessageArray[jjj];
                                        }
                                    }
                                }
                            }
                            entityconfig.data.profile.activity.results[j]["sakai:activityMessage"] = messageArray.join(" ");
                        }

                        // get the time since the activity happened
                        entityconfig.data.profile.activity.results[j].timeAgo = $.timeago(sakai.api.Util.parseSakaiDate(entityconfig.data.profile.activity.results[j]["created"]));
                    }
                }
            }
        };

        /**
         * Add binding to Content2 elements on the entity widget
         */
        var addContent2Binding = function(){
            addContentBinding();

            $entityContentUsersDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });

            $entityContentActivityDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });

            $(".entity_content_people").live("click", function(){
                $entityContentUsersDialog.jqmShow();

                var userList = sakai_global.content_profile.content_data.members.managers.concat(sakai_global.content_profile.content_data.members.viewers);
                var json = {
                    "userList": userList,
                    "type": "people",
                    sakai: sakai
                };

                // render dialog template
                sakai.api.Util.TemplateRenderer($entityContentUsersDialogTemplate, json, $entityContentUsersDialogContainer);
                $entityContentUsersDialogContainer.show();
                $("#entity_content_users_dialog_heading").html($("#entity_content_poeple").html());

                return false;
            });

            $(".entity_content_group").live("click", function(){
                $entityContentUsersDialog.jqmShow();

                var userList = sakai_global.content_profile.content_data.members.managers.concat(sakai_global.content_profile.content_data.members.viewers);
                var json = {
                    "userList": userList,
                    "type": "places",
                    sakai: sakai
                };

                // render users dialog template
                sakai.api.Util.TemplateRenderer($entityContentUsersDialogTemplate, json, $entityContentUsersDialogContainer);
                $entityContentUsersDialogContainer.show();
                $("#entity_content_users_dialog_heading").html($("#entity_content_places").html());

                return false;
            });

            $("#entity_content_activity").live("click", function(){
                $entityContentActivityDialog.jqmShow();

                var activity = {
                    "results": false
                };

                if (entityconfig.data.profile.activity) {
                    activity = entityconfig.data.profile.activity;
                }
                activity.sakai = sakai;
                // render activity dialog template
                sakai.api.Util.TemplateRenderer($entityContentActivityDialogTemplate, activity, $entityContentActivityDialogContainer);
                $entityContentActivityDialogContainer.show();

                return false;
            });

            $("#entity_content_share_button, #entity_content_share_link").live("click", function(){
                var pl_config = {
                    "mode": "search",
                    "selectable": true,
                    "subNameInfo": "email",
                    "sortOn": "lastName",
                    "items": 50,
                    "type": "people",
                    "what": "Viewers",
                    "where": sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"],
                    "URL": sakai_global.content_profile.content_data.url + "/" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"]
                };

                $(window).trigger("init.sharecontent.sakai", pl_config, function(people){
                });

                // display help tooltip
                var tooltipData = {
                    "tooltipSelector":"#sharecontent_add_people",
                    "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                    "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P4",
                    "tooltipArrow":"bottom",
                    "tooltipTop":3,
                    "tooltipLeft":220
                };
                $(window).trigger("update.tooltip.sakai", tooltipData);

                return false;
            });

            $(window).bind("addUser.sharecontent.sakai", function(e, data) {
                // add users that were added to content member list and render template
                var comma = "";
                var managerAdded = false;
                var viewerAdded = false;
                var managerActivityMessage = "__MSG__CONTENT_ADDED_NEW_MANAGER__ -";
                var managerLinks = "";
                var viewerActivityMessage = "__MSG__CONTENT_SHARED_WITH_SOMEONE__";
                for (var i in data.user.toAddNames){
                    if (data.user.toAddNames.hasOwnProperty(i) && data.user.toAddNames[i]) {
                        var id = data.user.list[i];
                        var entityId = false;
                        var entityType = false;
                        if (id.substring(0,5) === "user/"){
                            entityType = "user";
                            entityId = id.substring(5);
                            entityconfig.data.profile.usercount++;
                        } else if (id.substring(0,6) === "group/"){
                            entityType = "group";
                            entityId = id.substring(6);
                            entityconfig.data.profile.groupcount++;
                        }
                        var displayName = data.user.toAddNames[i];
                        if (data.access === "viewer"){
                            viewerAdded = true;
                            sakai_global.content_profile.content_data.members.viewers.push({
                                "userid": entityId,
                                "displayName": displayName
                            });
                        } else if (data.access === "manager"){
                            if (managerAdded) {
                                comma = ",";
                                managerActivityMessage = "__MSG__CONTENT_ADDED_NEW_MANAGERS__ -";
                            }
                            managerLinks = managerLinks + comma + ' <a href="/~' + userid + '" target="_blank" class="s3d-regular-light-links">' + displayName + '</a>';
                            managerAdded = true;
                            sakai_global.content_profile.content_data.members.managers.push({
                                "userid": entityId,
                                "displayName": displayName
                            });
                        }
                    }
                }
                renderTemplate();
            });

            $(window).bind("removeUser.sharecontent.sakai", function(e, data) {
                // filter out the user that was removed and render template
                sakai_global.content_profile.content_data.members.managers = $.grep(sakai_global.content_profile.content_data.members.managers, function(resultObject, index){
                    if (resultObject["sakai:group-id"] === data.user) {
                        entityconfig.data.profile.groupcount--;
                        return false;
                    } else if (resultObject["rep:userId"] === data.user) {
                        entityconfig.data.profile.usercount--;
                        return false;
                    }
                    return true;
                });
                sakai_global.content_profile.content_data.members.viewers = $.grep(sakai_global.content_profile.content_data.members.viewers, function(resultObject, index){
                    if (resultObject["sakai:group-id"] === data.user) {
                        entityconfig.data.profile.groupcount--;
                        return false;
                    } else if (resultObject["rep:userId"] === data.user){
                        entityconfig.data.profile.usercount--;
                        return false;
                    }
                    return true;
                });
                renderTemplate();
            });

            $(window).bind("setGlobalPermission.sharecontent.sakai", function() {
                // update content permission and render template
                entityconfig.data.profile.permissions = sakai_global.content_profile.content_data.data["sakai:permissions"];
                renderTemplate();
            });
        };

        ////////////////////
        // MAIN FUNCTIONS //
        ////////////////////

        /**
         * Add binding to various elements on the entity widget depending on mode
         * @param {String} mode The mode you want to bind elements for
         */
        var addBinding = function(mode){
            // add bindings according to entity mode
            switch (mode) {
                case "profile":
                    addProfileBinding();
                    break;
                case "myprofile":
                    addMyProfileBinding();
                    break;
                case "group":
                    addGroupBinding();
                    break;
                case "content":
                    addContent2Binding();
                    break;
            }
        };

        /**
         * Get the data for a specific mode
         * @param {String} mode The mode you want to get the data for
         * @param {Object} [data] The data you received from the page that called this (can be undefined)
         * @param {Function} [callback] A callback function that will be fired it is supplied
         */
        var getData = function(mode, data){
            switch (mode) {
                case "profile":
                    entityconfig.data.profile = $.extend(true, {}, data);
                    // Set the correct profile data
                    setProfileData();
                    $entity_container_template = $entity_container_template_profile;
                    break;
                case "myprofile":
                    // Set the profile for the entity widget to the personal profile information
                    // We need to clone the sakai.data.me.profile object so we don't interfere with it
                    entityconfig.data.profile = $.extend(true, {}, sakai.data.me.profile);
                    //get data from sakai.data.me object and set in the entityconfig
                    setMyProfileData();
                    // Set the correct profile data
                    setProfileData();
                    $entity_container_template = $entity_container_template_myprofile;
                    break;
                case "group":
                    // Set the profile for the entity widget to the group authprofile
                    entityconfig.data.profile = $.extend(true, {}, data.authprofile);
                    // Set the correct group profile data
                    setGroupData();
                    $entity_container_template = $entity_container_template_group;
                    break;
                case "content":
                    setContent2Data(data);
                    $entity_container_template = $entity_container_template_content;
                    break;
            }

            if(entityconfig.mode ==="content" && !data){
                return;
            }

            // Render the main template
            renderTemplate();

            // Should we show the Add To Contacts button or not
            if (mode === "profile" && !sakai.data.me.user.anon){
                checkContact(entityconfig.data.profile["rep:userId"]);
            }

            // Add binding
            addBinding(mode);
        };

        /**
         * Get content data and then call method to get data for the appropriate mode
         * @param {String} mode The mode in which you load the entity widget
         * @param {Object} data A JSON object containing the necessary data - the structure depends on the mode
         * to display Contents: no. Items
         *
         */
        var getEntityData = function(mode, data){
            // Change the mode for the entity widget
            entityconfig.mode = mode;
            // Get the data for the appropriate mode
            getData(entityconfig.mode, data);
        };

        ////////////////////
        // INITIALISATION //
        ////////////////////

        /**
         * Init function for the entity widget
         * @param {String} mode The mode in which you load the entity widget
         * @param {Object} data A JSON object containing the necessary data - the structure depends on the mode
         */

        $(window).bind("render.entity.sakai", function(e, mode, data) {
            //Set initial chat status
            if (mode === entitymodes[0]) {
                if (!sakai.data.me.profile.chatstatus) {
                    // Assume online until chat status is persistent since that's what other comonents are doing, and so that the template has a consistent default
                    sakai.data.me.profile.chatstatus = "online";
                }
            }

            //Get the content data
            getEntityData(mode, data);

            $(window).trigger("rendered.entity.sakai");
            sakai_global.entity.isRendered = true;
        });

        $(window).trigger("ready.entity.sakai", {});
        sakai_global.entity.isReady = true;

        // Add binding to update the chat status
        $(window).bind("chat_status_change", function(event, newChatStatus){
            updateChatStatusElement(newChatStatus);
        });

        $(window).bind("complete.fileupload.sakai", function(){
            if (sakai.hasOwnProperty("content_profile")) {
                $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
            }
        });

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("entity");
});
