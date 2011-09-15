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
        var NUM_PER_PAGE = 10,
            currentPage = 1;

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
        var $participants_pager = $("#participants_pager", rootel);
        var $participants_sort_by = $("#participants_sort_by", rootel);


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
                userArr.push($(item).parent().nextAll(participantsListParticipantName).text());
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
            if (success) {
                if (data && data.results && data.results.length) {
                    sakai.api.User.getContacts(function() {
                        var participantsArr = [];
                        for (var i = 0; i < data.results.length; i++) {
                            var contentCount = 0;
                            var contactsCount = 0;
                            var membershipsCount = 0;
                            if (data.results[i].counts){
                                contentCount = data.results[i].counts.contentCount;
                                contactsCount = data.results[i].counts.contactsCount;
                                membershipsCount = data.results[i].counts.membershipsCount;
                            }
                            if (data.results[i]["sakai:group-id"]) {
                                participantsArr.push({
                                    "name": data.results[i]["sakai:group-title"],
                                    "id": data.results[i]["sakai:group-id"],
                                    "title": data.results[i].role,
                                    "type": "group",
                                    "connected": false,
                                    "content": contentCount,
                                    "contacts": contactsCount,
                                    "memberships": membershipsCount,
                                    "profilePicture": sakai.api.Groups.getProfilePicture(data.results[i]),
                                    "membersCount": data.results[i].counts.membersCount
                                });
                            } else {
                                // Check if this user is a friend of us already.
                                var connected = false, invited = false, pending = false, none = false;
                                if (sakai.data.me.mycontacts) {
                                    for (var ii = 0, jj = sakai.data.me.mycontacts.length; ii<jj; ii++) {
                                        var friend = sakai.data.me.mycontacts[ii];
                                        if (friend.target === data.results[i]["rep:userId"]) {
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
                                    "name": sakai.api.User.getDisplayName(data.results[i]),
                                    "id": data.results[i]["rep:userId"],
                                    "title": data.results[i].role,
                                    "type": "user",
                                    "content": contentCount,
                                    "contacts": contactsCount,
                                    "memberships": membershipsCount,
                                    "connected": connected,
                                    "invited": invited,
                                    "pending": pending,
                                    "none": none,
                                    "profilePicture": sakai.api.User.getProfilePicture(data.results[i])
                                });
                            }
                        }
                        $participantsListContainer.html(sakai.api.Util.TemplateRenderer(participantsListTemplate, {
                            "participants": participantsArr,
                            "sakai": sakai
                        }));
                        if (data.total > NUM_PER_PAGE) {
                            $participants_pager.pager({ pagenumber: currentPage, pagecount: Math.ceil(data.total/NUM_PER_PAGE), buttonClickCallback: handlePageClick }).show();
                        } else {
                            $participants_pager.empty();
                        }
                    });
                } else {
                    $participantsListContainer.html(sakai.api.Util.TemplateRenderer(participantsListTemplate, {
                        "participants": [],
                        "sakai": sakai
                    }));
                    $participants_pager.empty();
                }
            } else {
                debug.warn("Participants could not be loaded");
            }
        };

        var handlePageClick = function(pageNum) {
            if (pageNum !== currentPage) {
                currentPage = pageNum;
                loadParticipants();
            }
        };

        ////////////////////
        // Init functions //
        ////////////////////

        var loadParticipants = function(){
            sakai.api.Groups.searchMembers(widgetData.participants.groupid, $.trim($participantsSearchField.val()), NUM_PER_PAGE, currentPage-1, "firstName", $participants_sort_by.val(), renderParticipants);
        };

        var addBinding = function(){
            $participantsSearchField.unbind("keyup").bind("keyup", function() {
                currentPage = 1;
                loadParticipants();
            });
            $participants_sort_by.unbind("change").bind("change", loadParticipants);
            $participantsSelectAll.unbind("click").bind("click", checkAll);
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
