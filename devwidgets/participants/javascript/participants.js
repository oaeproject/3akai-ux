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
        var infinityScroll = false;

        // Containers
        var $participantsListContainer = $("#participants_list_container_list", rootel);

        // Templates
        var participantsListTemplate = "participants_list_template";
        var participantsListTemplateEmpty = "participants_list_empty_template";

        // Elements
        var $participantsSearchField = $("#participants_search_field", rootel);
        var participantsListParticipantRequestConnection = ".participants_list_participant_request_connection";
        var $participantsSelectAll = $("#participants_select_all", rootel);
        var participantsListParticipantCheckbox = ".participants_list_participant_checkbox input:checkbox";
        var $participantsSendSelectedMessage = $("#participants_send_selected_message", rootel);
        var participantsListParticipantName = ".participants_list_participant_name";
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

        var processParticipants = function (results, callback){
            var participantsArr = [];
            if (results && results.length){
                sakai.api.User.getContacts(function() {
                    $.each(results, function(i, result){
                        var contentCount = 0;
                        var contactsCount = 0;
                        var membershipsCount = 0;
                        if (result.counts){
                            contentCount = result.counts.contentCount;
                            contactsCount = result.counts.contactsCount;
                            membershipsCount = result.counts.membershipsCount;
                        }
                        if (result["sakai:group-id"]) {
                            participantsArr.push({
                                "name": result["sakai:group-title"],
                                "id": result["sakai:group-id"],
                                "title": result.role.title,
                                "type": "group",
                                "connected": false,
                                "content": contentCount,
                                "contacts": contactsCount,
                                "memberships": membershipsCount,
                                "profilePicture": sakai.api.Groups.getProfilePicture(result),
                                "membersCount": result.counts.membersCount
                            });
                        } else {
                            // Check if this user is a friend of us already.
                            var connected = false, invited = false, pending = false, none = false;
                            if (sakai.data.me.mycontacts) {
                                $.each(sakai.data.me.mycontacts, function(ii, contact){
                                    if (contact.target === result["rep:userId"]) {
                                        connected = true;
                                        // if invited state set invited to true
                                        if(contact.details["sakai:state"] === "INVITED"){
                                            invited = true;
                                        } else if(contact.details["sakai:state"] === "PENDING"){
                                            pending = true;
                                        } else if(contact.details["sakai:state"] === "NONE"){
                                            none = true;
                                        }
                                    }
                                });
                            }
                            participantsArr.push({
                                "name": sakai.api.User.getDisplayName(result),
                                "id": result["rep:userId"],
                                "title": result.role.title,
                                "type": "user",
                                "content": contentCount,
                                "contacts": contactsCount,
                                "memberships": membershipsCount,
                                "connected": connected,
                                "invited": invited,
                                "pending": pending,
                                "none": none,
                                "profilePicture": sakai.api.User.getProfilePicture(result)
                            });
                        }
                    });
                });
            }
            callback(participantsArr);                        
        };

        ////////////////////
        // Init functions //
        ////////////////////

        var loadParticipants = function(){
            // Disable the previous infinite scroll
            if (infinityScroll){
                infinityScroll.kill();
            }
            // Set up the infinite scroll for the list of items in the library
            infinityScroll = $participantsListContainer.infinitescroll(function(parameters, callback){
                sakai.api.Groups.searchMembers(widgetData.participants.groupid, parameters.query, parameters.items, parameters.page, parameters.sortBy, parameters.sortOrder, function(success, data){
                    callback(true, data);
                });
            }, {
                "query": $.trim($participantsSearchField.val()),
                "sortBy": "firstName",
                "sortOrder": $participants_sort_by.val()
            }, function(items, total){
                return sakai.api.Util.TemplateRenderer(participantsListTemplate, {
                    "participants": items,
                    "sakai": sakai
                });
            }, function(){
                $participantsListContainer.html(sakai.api.Util.TemplateRenderer(participantsListTemplateEmpty, {}));                
            }, sakai.config.URL.INFINITE_LOADING_ICON, processParticipants);
        };

        var addBinding = function(){
            $(".participants_widget .s3d-search-button").unbind("click").bind("click", function(){
                currentPage = 1;
                loadParticipants();
            });
            $participantsSearchField.unbind("keyup").bind("keyup", function(ev) {
                if (ev.keyCode === 13) {
                    loadParticipants();
                }
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
