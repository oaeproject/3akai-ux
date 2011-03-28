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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.entity
     *
     * @class entity
     *
     * @description
     * Initialize the entity widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.entity = function(tuid, showSettings){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var entityContainer = "#entity_container";
        var entityUserDropdown = ".entity_user_dropdown";

        // Buttons
        var entityUserCreateAndAdd = "#entity_user_create_and_add";
        var entityUserImage = "#entity_user_image";
        var entityUserMessage = "#entity_user_message";
        var entityUserAddToContacts = "#entity_user_add_to_contacts";

        /**
         * Add binding to elements related to tag drop down
         */
        var addBindingTagsLink = function(){
            // Add the click event to the tagsLink link
            $(tagsLink).die("click");
            $(tagsLink).live("click", function(e){
                // in chrome it call showHideListLinkMenu twice
                e.stopImmediatePropagation();
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
                if (jcr_content["_lastModifiedBy"]) {
                    entityconfig.data.profile.lastmodifiedby = jcr_content["_lastModifiedBy"];
                }
                // Set the last modified date
                if (jcr_content["_lastModified"]) {
                    entityconfig.data.profile.lastmodified = $.timeago(sakai.api.Util.parseSakaiDate(jcr_content["_lastModified"]));
                }
                // Set the size of the file
                if (jcr_content["jcr:data"]) {
                    entityconfig.data.profile.filesize = sakai.api.Util.convertToHumanReadableFileSize(jcr_content["jcr:data"]);
                }
                // Set the mimetype of the file
                if (jcr_content["_mimeType"]) {
                    entityconfig.data.profile.mimetype = jcr_content["_mimeType"];
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
            if (filedata["_createdBy"]) {
                entityconfig.data.profile.createdby = filedata["_createdBy"];
            }

            if (filedata["_created"]) {
                entityconfig.data.profile.created = $.timeago(sakai.api.Util.parseSakaiDate(filedata["_created"]));
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
            return a["_created"] < b["_created"] ? 1 : -1;
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
                        entityconfig.data.profile.activity.results[j].timeAgo = $.timeago(sakai.api.Util.parseSakaiDate(entityconfig.data.profile.activity.results[j]["_created"]));
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
                    "tooltipLeft":120
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
                case "user_other":
                    $(entityUserMessage).bind("click", function(){
                        // Place message functionality
                    });
                    $(entityUserAddToContacts).bind("click", function(){
                        // Place contacts functionality
                    });
                    break;
                case "contact":
                    $(entityUserMessage).bind("click", function(){
                        // Place message functionality
                    });
                    break;
            }
       }

        var renderEntity = function(context){
            $(entityContainer).html(sakai.api.Util.TemplateRenderer("entity_" + context.context + "_template", context));
        }
        
        $(window).bind("sakai.entity.init", function(ev, context, type, data){
             var obj = {
                 "context": context, 
                 "type": type, 
                 "anon": sakai.data.me.user.anon || false,
                 "data": data || {}
             }
             renderEntity(obj);
             addBinding(obj);
        });
        
        $(window).trigger("sakai.entity.ready");

            // var context = "user";
            // var context = "content";
            //var type = "user_me";
            //var type = "user_other";
            //var type = "contact";
            //var type = "content_not_shared";
            //var type = "content_shared";
            //var type = "content_managed";
            //if (document.location.pathname === "/dev/create_new_account2.html"){
            //    context = "newaccount";
            //    type = false;
            //}

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("entity");
});