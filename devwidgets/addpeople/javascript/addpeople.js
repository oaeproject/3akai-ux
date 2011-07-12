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
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.addpeople
     *
     * @class addpeople
     *
     * @description
     * addpeople widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.addpeople = function(tuid, showSettings, widgetData){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var $rootel = $("#" + tuid);

        // Containers
        var $addpeopleContainer = $("#addpeople_container", $rootel);
        var $addpeopleContactsContainer = $("#addpeople_contacts_container", $rootel);
        var $addpeopleSelectedContactsContainer = $("#addpeople_selected_contacts_container", $rootel);
        var $addpeopleMembersAutoSuggest = $("#addpeople_members_autosuggest", $rootel);

        // Templates
        var addpeopleContactsTemplate = "addpeople_contacts_template";
        var addpeopleSelectedContactsTemplate = "addpeople_selected_contacts_template";

        // Elements
        var $addpeopleSelectAllContacts = $("#addpeople_select_all_contacts", $rootel);
        var addpeopleCheckbox = ".addpeople_checkbox";
        var addpeopleSelectedCheckbox = ".addpeople_selected_checkbox";
        var addpeopleSelectedPermissions = ".addpeople_selected_permissions";
        var $addpeopleSelectedAllPermissions = $("#addpeople_selected_all_permissions", $rootel);
        var $addpeopleSelectAllSelectedContacts = $("#addpeople_select_all_selected_contacts", $rootel);
        var $addpeopleFinishAdding = $(".addpeople_finish_adding", $rootel);
        var $addpeopleRemoveSelected = $(".addpeople_remove_selected", $rootel);
        var $addpeopleMembersAutoSuggestField = $("#addpeople_members_autosuggest_field", $rootel);

        var selectedUsers = {};
        var currentTemplate = false;
        var hasbeenInit = false;


        ///////////////
        // RENDERING //
        ///////////////

        var renderContacts = function(){
            if ($addpeopleContactsContainer.text() === "") {
                var groups = sakai.api.Groups.getMemberships(sakai.data.me.groups);
                if (sakai_global.group && sakai_global.group.groupData && sakai_global.group.groupData["sakai:group-id"]) {
                    groups = _.without(groups, sakai_global.group.groupData["sakai:group-id"]);
                }
                $addpeopleContactsContainer.html(sakai.api.Util.TemplateRenderer(addpeopleContactsTemplate, {
                    "contacts": sakai.data.me.mycontacts,
                    "groups": groups,
                    "sakai": sakai
                }));
            }
        };

        var renderSelectedContacts = function(){
            $addpeopleSelectedContactsContainer.html(sakai.api.Util.TemplateRenderer(addpeopleSelectedContactsTemplate, {"contacts":selectedUsers, "roles": currentTemplate.roles}));
            enableDisableControls(true);
        };


        /////////////
        // UTILITY //
        /////////////

        var enableDisableControls = function(disable){
            if(disable){
                $addpeopleRemoveSelected.attr("disabled","disabled");
                $addpeopleSelectedAllPermissions.attr("disabled","disabled");
            }else{
                $addpeopleRemoveSelected.removeAttr("disabled");
                $addpeopleSelectedAllPermissions.removeAttr("disabled");
            }
        };

        var decideEnableDisableControls = function(el){
            if($("." + el.currentTarget.className + ":checked").length){
                enableDisableControls(false);
            }else{
                enableDisableControls(true);
            }
            $addpeopleSelectAllSelectedContacts.removeAttr("checked");
        };

        /**
         * Fire an event that indicates the addpeople widget is done adding users.
         * The object containing this userdata is giving to the event
         * Also hide the overlay
         */
        var finishAdding = function(){
            if (sakai_global.group) {
                var managerSelected = false;
                var permissionsToDelete = [];
                var newUsers = [];
                $.each(selectedUsers, function(index, user){
                    if (user.originalPermission && user.permission !== user.originalPermission) {
                        permissionsToDelete.push(user);
                    }

                    if (!user.originalPermission){
                        newUsers.push(user);
                    }

                    $.each(currentTemplate.roles, function(i, role){
                        if (user.permission == role.title || user.permission == role.id) {
                            user.permission = role.id;
                            if (role.allowManage) {
                                managerSelected = true;
                            }
                        }
                    });
                });
            }
            if (managerSelected || !sakai_global.group) {
                $(window).trigger("sakai.addpeople.usersswitchedpermission", [tuid.replace("addpeople", ""), permissionsToDelete]);
                $(window).trigger("sakai.addpeople.usersselected", [tuid.replace("addpeople", ""), selectedUsers]);
                $.merge(permissionsToDelete, newUsers);
                if (sakai_global.group) {
                    $.each(permissionsToDelete, function(index, user){
                        sakai.api.Communication.sendMessage(user.userid,
                        sakai.data.me,
                        sakai.api.i18n.Widgets.getValueForKey("addpeople", "", "USER_HAS_ADDED_YOU_AS_A_ROLE_TO_THE_GROUP_GROUPNAME").replace("${user}", sakai.api.User.getDisplayName(sakai.data.me.profile)).replace("${role}", user.permission).replace("${groupName}", sakai_global.group.groupData["sakai:group-title"]),
                        $("#addpeople_message_template", $rootel).text().replace("${role}", user.permission).replace("${firstname}", user.name).replace("${user}", sakai.api.User.getDisplayName(sakai.data.me.profile)).replace("${groupName}", sakai_global.group.groupData["sakai:group-title"]).replace("${groupURL}", sakai.config.SakaiDomain + "/~"+sakai_global.group.groupData["sakai:group-id"]),
                        "message",
                        false,
                        false,
                        true,
                        "group_invitation");
                    });
                }
                $addpeopleContainer.jqmHide();
            } else {
                sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("addpeople","","MANAGE_PARTICIPANTS"), sakai.api.i18n.Widgets.getValueForKey("addpeople","","SELECT_AT_LEAST_ONE_MANAGER"));
            }
        };

        /**
         * Check/Uncheck all items in the list and enable/disable buttons
         */
        var checkAll = function(el, peopleContainer){
            if($(el).is(":checked")){
                $(peopleContainer).attr("checked","checked");
                if (peopleContainer !== addpeopleSelectedCheckbox) {
                    $(peopleContainer).change();
                    renderSelectedContacts();
                }else{
                    enableDisableControls(false);
                }
            }else{
                $(peopleContainer).removeAttr("checked");
                if (peopleContainer !== addpeopleSelectedCheckbox) {
                    $(peopleContainer).removeAttr("checked");
                    $(peopleContainer).change();
                    renderSelectedContacts();
                    $addpeopleSelectAllSelectedContacts.removeAttr("checked");
                } else {
                    enableDisableControls(true);
                }
            }
        };

        /**
         * Construct a user object when adding a user to the list of selected users
         */
        var constructSelecteduser = function(){
            $addpeopleSelectAllSelectedContacts.removeAttr("checked");
            if ($(this).is(":checked")) {
                if (!selectedUsers[$(this)[0].id.split("_")[0]]) {
                    var userObj = {
                        userid: $(this)[0].id.split("_")[0],
                        roleid: $(this).val(),
                        name: $(this).nextAll(".s3d-entity-displayname").text(),
                        dottedname: sakai.api.Util.applyThreeDots($(this).nextAll(".s3d-entity-displayname").text(), 80),
                        permission: currentTemplate.joinRole,
                        picture: $(this).next().children("img").attr("src"),
                        tmpsrc:"checklistadded"
                    };
                    selectedUsers[userObj.userid] = userObj;
                    renderSelectedContacts();
                }
            }else{
                delete selectedUsers[$(this)[0].id.split("_")[0]];
                renderSelectedContacts();
                $addpeopleSelectAllSelectedContacts.removeAttr("checked");
                $addpeopleSelectAllContacts.removeAttr("checked");
            }
        };

        /**
         * Batch change the permission setting for a specific selection of users
         */
        var changeSelectedPermission = function(){
            var selectedPermission = $(this).val();
            $.each($addpeopleSelectedContactsContainer.find("input:checked"), function(index, item){
                $(item).nextAll("select").val(selectedPermission);
                selectedUsers[$(item)[0].id.split("_")[0]].permission = selectedPermission;
            });
        };

        /**
         * Change the permission setting for a specific user
         */
        var changePermission = function(){
            var userid = $(this)[0].id.split("_")[0];
            selectedUsers[userid].permission = $(this).val();
        };

        /**
         * Removes all users that are selected from the list of users to be added as a member (manager or viewer)
         */
        var removeSelected = function(){
            var managerLeft = false;
            $.each($addpeopleSelectedContactsContainer.find("input:not(:checked)"), function(index, user){
                $.each(currentTemplate.roles, function(i, role){
                    if (role.allowManage) {
                        if ($(user).nextAll("select").val() == role.id) {
                            managerLeft = true;
                        }
                    }
                });
            });
            if (managerLeft) {
                var usersToDelete = [];
                $.each($addpeopleSelectedContactsContainer.find("input:checked"), function(index, item){
                    usersToDelete.push({
                        "userid": $(item)[0].id.split("_")[0],
                        "permission": $(item).nextAll("select").val()
                    });
                    delete selectedUsers[$(item)[0].id.split("_")[0]];
                    $("#" + $(item)[0].id.split("_")[0] + "_chk").removeAttr("checked");
                    $addpeopleSelectAllContacts.removeAttr("checked");
                    $(item).parent().next().remove();
                    $(item).parent().remove();
                });
                sakai.api.Groups.removeUsersFromGroup(sakai_global.group.groupData["sakai:group-id"], false, usersToDelete, sakai.data.me);
                $addpeopleSelectAllSelectedContacts.removeAttr("checked");
            } else {
                sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("addpeople", "", "MANAGE_PARTICIPANTS"), sakai.api.i18n.Widgets.getValueForKey("addpeople", "", "SELECT_AT_LEAST_ONE_MANAGER"));
            }
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Get the list of selected users/groups from the autosuggest plugin
         * @return {Object} returnValue An object containing a list of displayNames and an Array of userID's to be added to the members list
         */
        var createAutoSuggestedUser = function(userData) {
            var pictureURL = "";
            var userid = userData.attributes.value;
            if (userData.attributes.picture) {
                pictureURL = "/~" + userid + "/public/profile/" + userData.attributes.picture;
            } else {
                if (userData.attributes.type=== "group") {
                    pictureURL = "/dev/images/group_avatar_icon_35x35_nob.png";
                } else {
                    pictureURL = "/dev/images/default_User_icon_35x35.png";
                }
            }
            var userObj = {
                userid: userid,
                name: userData.attributes.name,
                dottedname: sakai.api.Util.applyThreeDots(userData.attributes.name, 80),
                permission: currentTemplate.joinRole,
                picture: pictureURL,
                tmpsrc:"autsuggestadded"
            };
            selectedUsers[userObj.userid] = userObj;
            renderSelectedContacts();
            $(".as-close").click();
        };


        /**
         * Clears the input field, closes the autosuggest and then hides the modal/overlay, called onHide in jqm
         */
        var resetAutosuggest = function(h){
            sakai.api.Util.AutoSuggest.reset($addpeopleMembersAutoSuggestField);
            for(user in selectedUsers){
                if(selectedUsers.hasOwnProperty(user) && selectedUsers[user].tmpsrc){
                    delete selectedUsers[user];
                }
            }
            $("ul",$addpeopleSelectedContactsContainer).empty();
            $(addpeopleCheckbox).add($addpeopleSelectAllContacts).removeAttr("checked");
            h.w.hide();
            if (h.o) {
                h.o.remove();
            }
        };

        var prepareSelectedContacts = function(success, data){
            for(var role in data){
                for(var user in data[role].results){
                    if (data[role].results.hasOwnProperty(user)) {
                        var userObj = {};
                        if (data[role].results[user].hasOwnProperty("sakai:group-id")) {
                            userObj = {
                                userid: data[role].results[user]["sakai:group-id"],
                                name: data[role].results[user]["sakai:group-title"],
                                dottedname: sakai.api.Util.applyThreeDots(data[role].results[user]["sakai:group-title"], 80)
                            };
                        } else {
                            userObj = {
                                userid: data[role].results[user]["rep:userId"],
                                name: sakai.api.User.getDisplayName(data[role].results[user]),
                                dottedname: sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(data[role].results[user]), 80)
                            };
                        }

                        $.each(currentTemplate.roles, function(i, r){
                            if (currentTemplate.roles[i].title === role) {
                                userObj.permission = currentTemplate.roles[i].id;
                                userObj.originalPermission = currentTemplate.roles[i].id;
                            }
                        });
                        if (data[role].results[user].picture) {
                            userObj.picture = "/~" + data[role].results[user]["rep:userId"] + "/public/profile/" + $.parseJSON(data[role].results[user].picture).name;
                        }
                        else {
                            if (data[role].results[user]["sakai:group-id"]) {
                                userObj.picture = "/dev/images/group_avatar_icon_35x35_nob.png";
                            }
                            else {
                                userObj.picture = "/dev/images/default_User_icon_35x35.png";
                            }
                        }
                        selectedUsers[userObj.userid] = userObj;
                    }
                }
            }
            renderSelectedContacts();
        };

        var fetchMembers = function(){
            sakai.api.Groups.getMembers(sakai_global.group.groupData["sakai:group-id"], "", prepareSelectedContacts, true);
        };

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function(){
            $addpeopleContainer.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                onHide: resetAutosuggest
            });
        };

        var showDialog = function(){
            $addpeopleContainer.jqmShow();
        };

        var addBinding = function(){
            // Unbind all
            $(addpeopleCheckbox).die();
            $(addpeopleSelectedPermissions).die();
            $addpeopleFinishAdding.unbind("click", finishAdding);
            $addpeopleRemoveSelected.unbind("click", removeSelected);

            // Bind all
            $addpeopleSelectAllContacts.bind("click", function(){
                checkAll(this, addpeopleCheckbox);
            });
            $addpeopleSelectAllSelectedContacts.bind("click", function(){
                checkAll(this, addpeopleSelectedCheckbox);
            });
            $(addpeopleSelectedCheckbox).live("change", decideEnableDisableControls, $rootel);
            $addpeopleSelectedAllPermissions.bind("change", changeSelectedPermission);
            $(addpeopleCheckbox).live("change", constructSelecteduser, $rootel);
            $(addpeopleSelectedPermissions).live("change", changePermission, $rootel);
            $addpeopleFinishAdding.bind("click", finishAdding);
            $addpeopleRemoveSelected.bind("click", removeSelected);
        };

        var loadRoles = function(){
            currentTemplate = sakai.api.Groups.getTemplate(widgetData.category, widgetData.id);
            $("#addpeople_selected_all_permissions", $rootel).html(sakai.api.Util.TemplateRenderer("addpeople_selected_permissions_template", {"roles": currentTemplate.roles}));
        };

        ////////////
        // EVENTS //
        ////////////

        $(window).bind("init.addpeople.sakai", function(e, initTuid){
            if (initTuid + "addpeople" === tuid || sakai_global.group) {
                if (!hasbeenInit) {
                    if (!widgetData) {
                        widgetData = {
                            "category": sakai_global.group.groupData["sakai:category"],
                            "id": sakai_global.group.groupData["sakai:templateid"]
                        };
                    }
                    loadRoles();
                    addBinding();
                    sakai.api.Util.AutoSuggest.setup($addpeopleMembersAutoSuggestField, {"asHtmlID": tuid,"resultClick":createAutoSuggestedUser},function(){$addpeopleMembersAutoSuggest.show();});
                    initializeJQM();
                    hasbeenInit = true;
                }
                if(sakai_global.group){
                    fetchMembers();
                }
                showDialog();
                sakai.api.User.getContacts(renderContacts);
            }
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addpeople");

});
