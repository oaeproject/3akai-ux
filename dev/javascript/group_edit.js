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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    // Global object that will store information about the current group context
    sakai_global.currentgroup = sakai_global.currentgroup || {};
    sakai_global.currentgroup.id = sakai_global.currentgroup.id || {};
    sakai_global.currentgroup.data = sakai_global.currentgroup.data || {};
    sakai_global.currentgroup.mode = sakai_global.currentgroup.mode || {};
    sakai_global.currentgroup.profileView = true;

    sakai_global.profile = sakai_global.profile || {};
    sakai_global.profile.main = {
        chatstatus: "",
        config: sakai.config.Profile.configuration.defaultConfig,
        data: {},
        isme: false,
        currentuser: "",
        mode: {
            options: ["view", "view", "edit"],
            value: "edit"
        },
        acls: {},
        picture: "",
        status: "",
        validation: {}
    };

    sakai_global.groupedit = function(){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var querystring; // Variable that will contain the querystring object of the page
        var groupid; // Variable that will contain the group ID


        ///////////////////
        // CSS SELECTORS //
        ///////////////////

        var groupBasicInfoContainer = "group_edit_widget_container";
        var groupBasicInfoTemplate = "group_edit_widget_template";


        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        /**
         * Get the group id from the querystring
         */
        var getGroupId = function(){
            if (querystring.contains("id")) {
                return querystring.get("id");
            }
            sakai.api.Security.send404();
            return false;
        };

        var readyToRender = false;
        var hasRendered = false;
        var readyToRenderBasic = false;
        var hasRenderedBasic = false;

        /**
         * This function will be executed when the Entity summary widget has been
         * loaded. We will execute its render function once we have the groupdata
         * available
         * @param {Object} e    Event that caused this function
         */
        $(window).bind("ready.entity.sakai", function(e){
            readyToRender = true;
            if (sakai_global.currentgroup.data) {
                $(window).trigger("render.entity.sakai", ["group", sakai_global.currentgroup.data]);
                hasRendered = true;
            }
        });

        /**
         * Fetch group data
         * @param {String} groupid Identifier for the group we're interested in
         */
        var getGroupData = function(groupid){
            sakai.api.Groups.getGroupData(groupid, function(success, data) {
                if (success) {
                    sakai_global.currentgroup.id = groupid;
                    sakai_global.currentgroup.data = data;
                    sakai_global.currentgroup.data["sakai:group-id"] = groupid;
                    if (sakai.api.Groups.isCurrentUserAManager(groupid, sakai.data.me)) {
                        triggerEditable(true);
                    }
                    if (readyToRender && !hasRendered) {
                        $(window).trigger("render.entity.sakai", ["group", sakai_global.currentgroup.data]);
                    }
                    renderGroupBasicInfo();
                    // per section permissions to be fully implemented later; hiding
                    // the "Who can view or search this?" dropdowns for now
                    // renderTemplates();
                    addPickUserBinding();
                    // Show the page content
                    sakai.api.Security.showPage();
                } else if (data && (data.status === 401 || data.status === 403)) {
                        sakai.api.Security.send403();
                } else {
                    sakai.api.Security.send404();
                }

            }, null, false);
        };

        /**
         * After the page has been loaded, weadd a declaration for the basic group info widget. We render
         * this and make sure that the showSettings variable will be set to true.
         * i.e. the widget will be rendered in Edit mode
         */
        var renderGroupBasicInfo = function(){
            $("#" + groupBasicInfoContainer).html(sakai.api.Util.TemplateRenderer("#" + groupBasicInfoTemplate, {}));
            sakai.api.Widgets.widgetLoader.insertWidgets(groupBasicInfoContainer, true);
        };

        /**
         * When the Basic Group Info widget has finished updating the group details, it will come
         * back to this function
         */
        $(window).bind("updateFinished.groupbasicinfo.sakai", function () {
            // enable group basic info input elements
            sakai_global.groupbasicinfo.enableInputElements();
            // Show a notification on the screen
            sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_basic_info_text").text()),
                                             sakai.api.Security.saneHTML($("#group_edit_updated_successfully_text").text()),
                                             sakai.api.Util.notification.type.INFORMATION);
            // Re-render the Entity Summary widget so the changes are reflected
            $(window).trigger("render.entity.sakai", ["group", sakai_global.currentgroup.data]);
        });

        /**
         * Trigger edit buttons
         * @param {Boolean} show Flag to either show or hide update or edit buttons
         */
        var triggerEditable = function (show) {
            if (show) {
                sakai_global.currentgroup.mode = 'edit';
                $(".group_editing").show();
            } else {
                sakai_global.currentgroup.mode = 'view';
                $(".group_editing").hide();
            }
        };

        /**
         * Render Widgets
         * @param {String} listType The type of the widget's contents
         */
        var renderItemLists = function(listType){

            var listSelectable = false;
            if (sakai_global.currentgroup.mode === 'edit') {
                listSelectable = true;
            }
            var url;
            var pl_config = {
                "selectable": listSelectable,
                "subNameInfoUser": "",
                "subNameInfoGroup": "sakai:group-description",
                "sortOn": "lastName",
                "sortOrder": "asc",
                "items": 1000,
                "function": "getSelection",
                "listType": listType
            };

            if (listType === 'members') {
                // get group members
                url = "/system/userManager/group/" + groupid + ".members.detailed.json";
            } else if (listType === 'managers') {
                // get group managers
                url = "/system/userManager/group/" + groupid + "-managers.members.detailed.json";
            } else if (listType === 'content') {
                url = "/var/search/pool/files?group=" + groupid;
            }
            $(window).trigger("render.listpeople.sakai", {"tuid": listType, "listType": listType, "pl_config": pl_config, "url": url, "id": groupid});
        };

        /**
         * Remove users
         * Function that gets the list of selected users from the listpeople widget and removed them from the group
         * @param {String} listType Identifier for the widget/type of user we're removing (member or a manager)
         */
        var removeUsers = function(listType) {
            // disable button
            toggleButtons(listType,true);

            if (sakai_global.data.listpeople[listType].selectCount === sakai_global.data.listpeople[listType].currentElementCount && listType === "managers") {
                sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()),
                                                 sakai.api.Security.saneHTML($("#group_edit_cannot_remove_everyone").text()),
                                                 sakai.api.Util.notification.type.ERROR);
            } else {
                var removeList = [];

                $.each(sakai_global.data.listpeople[listType]["selected"], function(index, resultObject) {
                    if (resultObject['userid']) {
                        removeList.push(resultObject['userid']);
                    } else if (resultObject['sakai:group-id']) {
                        removeList.push(resultObject['sakai:group-id']);
                    } else if (resultObject['rep:userId']) {
                        removeList.push(resultObject['rep:userId']);
                    }
                });

                sakai.api.Groups.removeUsersFromGroup(groupid, listType, removeList, function(success) {
                    if (removeList.length > 1) {
                        sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()), sakai.api.Security.saneHTML($("#group_edit_users_removed_text").text()));
                    } else if (removeList.length == 1) {
                        sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()), sakai.api.Security.saneHTML($("#group_edit_user_removed_text").text()));
                    }
                    renderItemLists(listType);
                    $("#entity_member_count").text(sakai.api.Security.saneHTML(parseInt($("#entity_member_count").text(), 10) - removeList.length));
                });
            }
        };

        /**
         * Remove content
         * Function that gets the list of selected content from the listpeople widget and removes group access
         * @param {String} listType Identifier for the widget/type of user we're removing (content)
         */
        var removeContent = function(listType) {
            // disable button
            toggleButtons(listType, true);
            var contentIDs = [];

            $.each(sakai_global.data.listpeople[listType]["selected"], function(index, resultObject) {
                if (resultObject['content_id']) {
                    removeContent = resultObject['content_id'];
                    contentIDs.push(removeContent);
                }
            });

            sakai.api.Groups.removeContentFromGroup(groupid, contentIDs, function(success) {
                if (success) {
                    sakai_global.listpeople.removeFromList(listType);
                    sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()),
                                                     sakai.api.Security.saneHTML($("#group_edit_content_removed_text").text()),
                                                     sakai.api.Util.notification.type.INFORMATION);
                }
            });
        };

        /**
         * Add users
         * Function that gets the list of selected users from the people picker widget and adds them to the group
         * @param {String} listType Identifier for the widget/type of user we're removing (member or a manager)
         */
        var addUsers = function(listType, users) {
            sakai.api.Groups.addUsersToGroup(groupid, listType, users, function(success) {
                if (success) {
                    if (users.length > 1) {
                        sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()), sakai.api.Security.saneHTML($("#group_edit_users_added_text").text()));
                    } else if (users.length == 1) {
                        sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()), sakai.api.Security.saneHTML($("#group_edit_user_added_text").text()));
                    }
                    renderItemLists('members');
                    renderItemLists('managers');
                    $("#entity_member_count").text(sakai.api.Security.saneHTML(parseInt($("#entity_member_count").text(), 10) + users.length));
                    $("#group_editing_add_" + listType).focus();
                }
            });
        };

        var addContent = function() {
            renderItemLists('content');
            sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_content_text").text()),
                                             sakai.api.Security.saneHTML($("#group_edit_content_added_text").text()),
                                             sakai.api.Util.notification.type.INFORMATION);
            $("#group_editing_add_content").focus();
        };

        /**
         * Render Templates for per section permissions dropdowns. This functionality
         * is currently disabled (renderTemplates should not be called), but the code
         * remains to be continued at a later time.
         */
        var renderTemplates = function(){
            var data = { "access" : 'public' };
            var membersData = {
                "mode" : sakai_global.currentgroup.mode,
                "data" : data
                };
            var managersData = {
                "mode" : sakai_global.currentgroup.mode,
                "data" : data
                };
            var contentData = {
                "mode" : sakai_global.currentgroup.mode,
                "data" : data
                };
            var $members_list_container = $("#members_list_permission_container");
            var $managers_list_container = $("#managers_list_permission_container");
            var $content_list_container = $("#content_list_permission_container");
            $members_list_container.html(sakai.api.Util.TemplateRenderer("#group_edit_userlist_default_template", membersData));
            $managers_list_container.html(sakai.api.Util.TemplateRenderer("#group_edit_userlist_default_template", managersData));
            $content_list_container.html(sakai.api.Util.TemplateRenderer("#group_edit_userlist_default_template", contentData));
        };

        /**
         * Filter Users
         * Given a list of users, filter them against the current managers and members
         * This is used to make sure users or groups aren't added twice to a group
         *
         * @param {Array} peopleList The list of people to filter against
         * @return {Array} The filtered list of people
         */
        var filterUsers = function(peopleList, accessType) {
            var peopleToAdd = [];
            $(peopleList).each(function(i,val) {
                var reason = "";
                for (var j in sakai_global.data.listpeople["managers"]["userList"]) {
                    if (sakai_global.data.listpeople["managers"]["userList"].hasOwnProperty(j) && j === val) {
                        reason = "manager";
                    }
                }
                for (var k in sakai_global.data.listpeople["members"]["userList"]) {
                    if (sakai_global.data.listpeople["members"]["userList"].hasOwnProperty(k) && k === val && accessType !== 'managers') {
                        reason = "member";
                    }
                }
                if (reason === "") {
                    peopleToAdd.push(val);
                } else if (reason === "manager") {
                    $(".group_edit_cannot_add_user").text(val);
                    sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()),
                                                     sakai.api.Security.saneHTML($("#group_edit_cannot_add_user_as_manager").text()),
                                                     sakai.api.Util.notification.type.ERROR);
                    // show notification saying you can't add this user because they're already a member/manager of the group
                } else if (reason === "member") {
                    $(".group_edit_cannot_add_user").text(val);
                    sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#group_edit_group_membership_text").text()),
                                                     sakai.api.Security.saneHTML($("#group_edit_cannot_add_user_as_member").text()),
                                                     sakai.api.Util.notification.type.ERROR);
                }
            });
            return peopleToAdd;
        };

        /**
         * Retrieve the union of the members and managers lists
         *
         * @return {Array} the list of members and managers
         */
        var getMembersAndManagers = function() {
            var list = [];
            for (var j in sakai_global.data.listpeople["managers"]["userList"]) {
                if (sakai_global.data.listpeople["managers"]["userList"].hasOwnProperty(j)) {
                    list.push(j);
                }
            }
            for (var k in sakai_global.data.listpeople["members"]["userList"]) {
                if (sakai_global.data.listpeople["members"]["userList"].hasOwnProperty(k)) {
                    list.push(k);
                }
            }
            return list;
        };

        /**
         * Enable/disable buttons based on the selected list.
         */
        var toggleButtons = function(tuid,isDisable) {
            // if disable is true
            if (!isDisable) {
                // if there is selected list
                if (sakai_global.data.listpeople[tuid].selectCount) {
                    // enable the button
                    $("#group_editing_remove_" + tuid).removeAttr("disabled");
                }
                // if there is not selected list disable
                else {
                    $("#group_editing_remove_" + tuid).attr("disabled", "disabled");
                }
            }
            // disable the button
            else {
                $("#group_editing_remove_" + tuid).attr("disabled", "disabled");
            }
        };

        /**
         * Retrieve the managers lists
         *
         * @return {Array} the list of managers
         */
        var getManagers = function() {
            var list = [];
            for (var j in sakai_global.data.listpeople["managers"]["userList"]) {
                if (sakai_global.data.listpeople["managers"]["userList"].hasOwnProperty(j)) {
                    list.push(j);
                }
            }
            return list;
        };

        ///////////////////////
        // BINDING FUNCTIONS //
        ///////////////////////

        /**
         * Add binding to all the elements on the page
         */
        var addBinding = function(){

            // Bind the listpeople widgets
            $(window).bind("ready.listpeople.sakai", function(e, tuid){
                renderItemLists(tuid);
            });

            // Bind event when selection in the list change
            $(window).bind("list-people-selected-change", function(e, tuid){
                toggleButtons(tuid);
            });

            // Bind the update button
            $("#group_editing_button_update").bind("click", function(){
                $(window).trigger("update.groupbasicinfo.sakai");
            });

            // Bind the don't update button
            $("#group_editing_button_dontupdate").bind("click", function(){
               window.location = "/~" + sakai_global.currentgroup.id;
            });

            // Bind the remove members button
            $("#group_editing_remove_members").bind("click", function(){
                removeUsers('members');
            });

            // Bind the remove managers button
            $("#group_editing_remove_managers").bind("click", function(){
                removeUsers('managers');
            });

            // Bind the remove content button
            $("#group_editing_remove_content").bind("click", function(){
                removeContent('content');
            });

        };

        /**
         * Add binding to the pickeruser widget buttons for adding users
         */
        var addPickUserBinding = function(){
            $(window).bind("ready.pickeruser.sakai", function(e){
                var pl_config = {
                    "mode": "search",
                    "selectable":true,
                    "subNameInfo": "email",
                    "sortOn": "lastName",
                    "items": 50,
                    "what": "Members",
                    "where": sakai_global.currentgroup.data.authprofile["sakai:group-title"],
                    "URL": window.location.protocol + "//" + window.location.host + "/~" + sakai_global.currentgroup.data.authprofile["sakai:group-id"]
                };

                // Bind the add members button
                $("#group_editing_add_members").bind("click", function(){
                    pl_config.type = "people";
                    pl_config.what = "Members";
                    pl_config.excludeList = getMembersAndManagers();
                    $(window).trigger("init.pickeruser.sakai", pl_config, function(people) {
                    });
                    $(window).unbind("finished.pickeruser.sakai");
                    $(window).bind("finished.pickeruser.sakai", function(e, peopleList) {
                        var peopleToAdd = filterUsers(peopleList.toAdd, 'members');
                        addUsers('members', peopleToAdd);
                    });
                });

                // Bind the add managers button
                $("#group_editing_add_managers").bind("click", function(){
                    pl_config.type = "people";
                    pl_config.what = "Managers";
                    pl_config.excludeList = getManagers();
                    $(window).trigger("init.pickeruser.sakai", pl_config, function(people) {
                    });
                    $(window).unbind("finished.pickeruser.sakai");
                    $(window).bind("finished.pickeruser.sakai", function(e, peopleList) {
                        var peopleToAdd = filterUsers(peopleList.toAdd, 'managers');
                        addUsers('managers', peopleToAdd);
                    });
                });

                // Bind the add content button
                $("#group_editing_add_content").bind("click", function(){
                    $(window).trigger('sakai-contentpicker-init', {"name":sakai_global.currentgroup.data.authprofile["sakai:group-title"], "mode": "picker", "type": "share", "limit": false, "filter": false});
                    $(window).unbind("finished.contentpicker.sakai");
                    $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                        if (fileList.items.length) {
                            addContent();
                        }
                    });
                });
            });
        };

        ////////////////////
        // INITIALISATION //
        ////////////////////

        /**
         * doInit function
         */
        var doInit = function(){

            querystring = new Querystring();

            // Get the group ID and retrieve data
            groupid = getGroupId();

            // check to see whether this user is authorized to see this page
            if (sakai.api.Groups.isCurrentUserAManager(groupid, sakai.data.me)) {
                if (groupid) {
                    getGroupData(groupid);
                }
                addBinding();
            } else {

                // The user is not a manager of the group
                sakai.api.Security.send403();

            }
        };

        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("groupedit");
});
