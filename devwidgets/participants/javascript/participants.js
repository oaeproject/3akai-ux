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

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.participants
     *
     * @class participants
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.participants = function (tuid, showSettings, widgetData) {

        var rootel = $("#" + tuid);

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // Containers
        var $participantsListContainer = $("#participants_list_container", rootel);

        // Templates
        var participantsListTemplate = "participants_list_template";

        // Elements
        var $participantsSearchField = $("#participants_search_field", rootel);
        var participantsListParticipantRequestConnection = ".participants_list_participant_request_connection";
        var $participantsSelectAll = $("#participants_select_all", rootel);
        var participantsListParticipantCheckbox = ".participants_list_participant_checkbox input:checkbox";
        var $participantsSendSelectedMessage = $("#participants_send_selected_message", rootel);
        var participantsListParticipantName = ".participants_list_participant_name";


        ///////////////////////
        // Utility functions //
        ///////////////////////

        var enableDisableButtons = function(){
            if($(participantsListParticipantCheckbox + ":checked", rootel).length){
                $participantsSendSelectedMessage.removeAttr("disabled");
            } else {
                $participantsSendSelectedMessage.attr("disabled", "disabled");
                $participantsSelectAll.removeAttr("checked");
            }
        };

        /**
         * Set the attributes needed by the sendmessage widget to send a message to all selected users
         */
        var setSendSelectedMessageAttributes = function(){
            var userArr = [];
            var userIDArr = [];
            $.each($(participantsListParticipantCheckbox + ":checked", rootel), function(index, item){
                userIDArr.push($(item)[0].id.split("_")[0]);
                userArr.push($(item).nextAll(participantsListParticipantName).text());
            });
            $participantsSendSelectedMessage.attr("sakai-entitytype", "user");
            $participantsSendSelectedMessage.attr("sakai-entityname", userArr);
            $participantsSendSelectedMessage.attr("sakai-entityid", userIDArr);
            enableDisableButtons();
        };

        /**
         * Check/Uncheck all items in the members list and enable/disable buttons
         */
        var checkAll = function(){
            if($(this).is(":checked")){
                $(participantsListParticipantCheckbox, rootel).attr("checked","checked");
                setSendSelectedMessageAttributes();
            }else{
                $(participantsListParticipantCheckbox, rootel).removeAttr("checked");
                enableDisableButtons();
            }
        };


        //////////////////////
        // Render functions //
        //////////////////////

        var renderParticipants = function (success, data){
            if(success){
                sakai.api.User.getContacts(function(){
                    var participantsArr = [];
                    for (var role in data) {
                        for (var i = 0; i < data[role].results.length; i++) {
                            var contentCount = 0
                            var contactsCount = 0;
                            var membershipsCount = 0;
                            if (data[role].results[i].counts){
                                contentCount = data[role].results[i].counts.contentCount;
                                contactsCount = data[role].results[i].counts.contactsCount;
                                membershipsCount = data[role].results[i].counts.membershipsCount;
                            }
                            if (data[role].results[i]["sakai:group-id"]) {
                                participantsArr.push({
                                    "name": data[role].results[i]["sakai:group-title"],
                                    "id": data[role].results[i]["sakai:group-id"],
                                    "title": role,
                                    "type": "group",
                                    "connected": false,
                                    "content": contentCount,
                                    "contacts": contactsCount,
                                    "memberships": membershipsCount,
                                    "profilePicture": sakai.api.Groups.getProfilePicture(data[role].results[i])
                                });
                            } else {
                                // Check if this user is a friend of us already.
                                var connected = false, invited = false, pending = false, none = false;
                                if (sakai.data.me.mycontacts) {
                                    for (var ii = 0, jj = sakai.data.me.mycontacts.length; ii<jj; ii++) {
                                        var friend = sakai.data.me.mycontacts[ii];
                                        if (friend.target === data[role].results[i]["rep:userId"]) {
                                            connected = true;
                                            // if invited state set invited to true
                                            if(friend.details["sakai:state"] === "INVITED"){
                                                invited = true;
                                            } else if(friend.details["sakai:state"] === "PENDING"){
                                                pending = true;
                                            } else if(friend.details["sakai:state"] === "NONE"){
                                                none = true;
                                            }
                                        }
                                    }
                                }

                                participantsArr.push({
                                    "name": sakai.api.User.getDisplayName(data[role].results[i]),
                                    "id": data[role].results[i]["rep:userId"],
                                    "title": role,
                                    "type": "user",
                                    "content": contentCount,
                                    "contacts": contactsCount,
                                    "memberships": membershipsCount,
                                    "connected": connected,
                                    "invited": invited,
                                    "pending": pending,
                                    "none": none,
                                    "profilePicture": sakai.api.User.getProfilePicture(data[role].results[i])
                                });
                            }
                        }
                    }
                    $participantsListContainer.html(sakai.api.Util.TemplateRenderer(participantsListTemplate, {
                        "participants": participantsArr,
                        "sakai": sakai
                    }));
                });
            } else {
                debug.log("Participants could not be loaded");
            }
        };


        ////////////////////
        // Init functions //
        ////////////////////

        /**
         * Load the managers and viewers of the group
         */
        var loadParticipants = function(){
            if (widgetData && widgetData.participants) {
                var query = $.trim($participantsSearchField.val());
                sakai.api.Groups.getMembers(widgetData.participants.groupid, query, renderParticipants, true);
            }
        };

        var addBinding = function(){
            $participantsSearchField.unbind("keyup", loadParticipants);
            $participantsSelectAll.unbind("click", checkAll);

            $participantsSearchField.bind("keyup", loadParticipants);
            $participantsSelectAll.bind("click", checkAll);
            $(participantsListParticipantCheckbox, rootel).live("click", setSendSelectedMessageAttributes);

            $(".participants_accept_invitation").live("click", function(ev){
                var userid = $(this).attr("sakai-entityid");
                sakai.api.User.acceptContactInvite(userid, function(){
                    $('.participants_accept_invitation').each(function(index) {
                        if ($(this).attr("sakai-entityid") === userid){
                            $(this).hide();
                        }
                    });
                });
            });

            $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
                $('.sakai_addtocontacts_overlay').each(function(index) {
                    if ($(this).attr("sakai-entityid") === userToAdd.uuid){
                        $(this).hide();
                    }
                });
            });
        };

        var init = function(){
            addBinding();
            loadParticipants();
        };

        $(window).bind("usersselected.addpeople.sakai", function(){
            var t = setTimeout(loadParticipants, 2000);
        });

        init();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("participants");
});
