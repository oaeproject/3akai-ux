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
 * /dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js (autoSuggest)
 */
/*global $ */

// Namespaces
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/content_profile.js"], function($, sakai){

    /**
     * @name sakai_global.contentpermissions
     *
     * @class contentpermissions
     *
     * @description
     * Content Permissions widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentpermissions = function(tuid, showSettings){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $contentpermissionsContainer = $("#contentpermissions_container");
        var $contentpermissionsContentContainer = $("#contentpermissions_content_container");
        var contentpermissionsMembersMessageContainer = "#contentpermissions_members_message_container";

        // Templates
        var contentpermissionsContentTemplate = "contentpermissions_content_template";
        var contentpermissionsShareMessageTemplate = "contentpermissions_share_message_template";

        // Elements
        var contentpermissionsMembersAutosuggest = "#contentpermissions_members_autosuggest";
        var contentpermissionsCancelButton = "#contentpermissions_cancel_button";
        var contentpermissionsMembersMessage = "#contentpermissions_members_message";
        var contentpermissionsShareButton = "#contentpermissions_share_button";
        var contentpermissionsNewMemberPermissions = "#contentpermissions_newmember_permissions";
        var contentpermissionsSaveAndCloseButton = "#contentpermissions_save_and_close_button";
        var contentpermissionsGlobalPermissions = "#contentpermissions_global_permissions";
        var contentpermissionsRemoveButton = "#contentpermissions_remove_button";
        var contentpermissionsNewMemberCheckAll = "#contentpermissions_newmember_checkall";
        var contentpermissionsNewMemberAllPermissions = "#contentpermissions_newmember_all_permissions";
        var contentpermissionsMembersContainerInputFields = "#contentpermission_members_container input[type=\"checkbox\"]";
        var contentpermissionsMembersListInputFields = "#contentpermissions_members_list input[type=\"checkbox\"]";
        var contentpermissionsMemberActions = "#contentpermissions_members_actions";
        var contentpermissionsMembersList = "#contentpermissions_members_list";
        var contentpermissionsMemberPermissions = ".contentpermissions_member_permissions";
        var contentpermissionsMembersListTemplate = "contentpermissions_members_list_template";

        var contentData = sakai_global.content_profile.content_data;

        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        /**
         * Enable or disable buttons on top of the members list to allow or disallow actions
         * @param {Boolean} disable True for disabling the list, false for enabling
         */
        var enableDisableButtons = function(disable){
            // First check if event was fired from individual checkbox
            if (disable.cancelable) {
                if($(contentpermissionsMembersListInputFields + ":checked").length){
                    $(contentpermissionsMemberActions).children("select, button").removeAttr("disabled");
                }else{
                    $(contentpermissionsMemberActions).children("select, button").attr("disabled", "disabled");
                    $(contentpermissionsNewMemberCheckAll).removeAttr("checked");
                }
            }
            else {
                if (disable) {
                    $(contentpermissionsMemberActions).children("select, button").attr("disabled", "disabled");
                } else {
                    $(contentpermissionsMemberActions).children("select, button").removeAttr("disabled");
                }
            }
        };

        /**
         * Check/Uncheck all items in the members list and enable/disable buttons
         */
        var checkAll = function(){
            if($(this).is(":checked")){
                $(contentpermissionsMembersListInputFields).attr("checked","checked");
                enableDisableButtons(false);
            }else{
                $(contentpermissionsMembersListInputFields).removeAttr("checked");
                enableDisableButtons(true);
            }
        };

        /**
         * Change the permission values for the selected (checked) users in the members list
         */
        var changePermissionForSelected = function(){
            var permissionValue = $(contentpermissionsNewMemberAllPermissions).val();
            $(contentpermissionsMembersListInputFields + ":checked").each(function(index, item){
                $(item).prev().val(permissionValue);
            });
        };

        /**
         * Remove the checked users in the list
         * Does validation to make sure users can be deleted or not and gives a notification when necessary.
         */
        var doRemove = function(){
            var usersToDelete = [];
            var numberOfManagersToDelete = 0;
            $(contentpermissionsMembersListInputFields + ":checked").each(function(index, item){
                var manager = $(item).hasClass("managers");
                var userid = item.id.split("_")[1];
                var userToDelete = {};
                if (manager) {
                    userToDelete = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":manager@Delete": userid
                        }
                    };
                    numberOfManagersToDelete++;
                }else{
                    userToDelete = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":viewer@Delete": userid
                        }
                    };
                }
                usersToDelete.push(userToDelete);
            });

            if (numberOfManagersToDelete < sakai_global.content_profile.content_data.members.managers.length) {
                // Do the Batch request
                sakai.api.Server.batch(usersToDelete, function(success, data){
                    $(window).trigger("load.content_profile.sakai");
                }, false);
            } else {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("CANNOT_DELETE_USERS", "contentpermissions"), sakai.api.i18n.getValueForKey("THERE_SHOULD_BE_AT_LEAST_ONE_MANAGER", "contentpermissions"));
            }
        };

        /**
         * Get the list of selected users/groups from the autosuggest plugin
         * @return {Object} returnValue An object containing a list of displayNames and an Array of userID's to be added to the members list
         */
        var getSelectedList = function() {
            var list = $("#as-values-" + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(",");
            var removed = 0;
            $(list).each(function(i, val) {
               if (val === "") {
                   list.splice(i - removed, 1);
                   removed += 1;
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $("#contentpermissions_container .as-selection-item").each(function(){
                // In IE 7 </A> is returned and in firefox </a>
                toAddNames.push($(this).html().split(/<\/[aA]?>/g)[1]);
            });

            var returnValue = {"list":list, "toAddNames":toAddNames};

            return returnValue;
        };

        /**
         * Close the JQModal overlay
         */
        var closeOverlay = function(){
            $contentpermissionsContainer.jqmHide();
            $("#contentpermissions_warning_container").jqmHide();
        };

        var showWarning = function(){
            var newVisibility = $(contentpermissionsGlobalPermissions);
            var newVisibilityVal = $.trim(newVisibility.val());
            var oldVisibilityIndex = parseInt(newVisibility.find("option[value='" + contentData.data["sakai:permissions"] + "']").attr("index"), 10);
            if (contentData.data["sakai:permissions"] === newVisibilityVal || parseInt(newVisibility.attr("selectedIndex"), 10) > oldVisibilityIndex || newVisibilityVal === "private"){
                doSave();
            } else {
                $("#contentpermissions_warning_container_text").html(sakai.api.Util.TemplateRenderer("contentpermissions_warning_container_text_template", {
                    "visibility": newVisibilityVal
                }));
                $("#contentpermissions_warning_container").jqmShow();
            }
        }

        /**
         * Callback function used by the autosuggest plugin after an item is added to the autosuggest list
         * Function renders and shows the default message that's being sent upon sharing
         */
        var addedUserGroup = function(){
            if (!$(contentpermissionsMembersMessageContainer).is(":visible")) {
                $(contentpermissionsMembersMessage).html(sakai.api.Util.TemplateRenderer(contentpermissionsShareMessageTemplate, {
                    "filename": sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"],
                    "path": window.location,
                    "user": sakai.api.User.getDisplayName(sakai.data.me.profile)
                }));
                $(contentpermissionsMembersMessageContainer).show();
            }
        };

        /**
         * Share the piece of content with a user by adding the user to the list of members (editor or viewer)
         */
        var doShare = function(){
            var userList = getSelectedList();
            $(window).trigger("finished.sharecontent.sakai", [
                userList,
                $.trim($(contentpermissionsMembersMessage).val()),
                {"data":{
                "_path":sakai_global.content_profile.content_data.data["_path"],
                "sakai:pooled-content-file-name":sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"]
                }}
            ]);
            renderMemberList();
            $(contentpermissionsMembersMessageContainer).hide();
        };

        /**
         *
         */
        var saveMemberPermissions = function(){
            var permissionsBatch = [];
            var atLeastOneManager = false;
            var savePermissions = false;
            var originalPermissions = sakai_global.content_profile.content_data.data["sakai:permissions"];
            if ($(contentpermissionsGlobalPermissions).val() !== originalPermissions){
                sakai_global.content_profile.content_data.data["sakai:permissions"] = $(contentpermissionsGlobalPermissions).val();
                savePermissions = true;
            }
            $(contentpermissionsMembersList + " li").each(function(index, item){
                var newPermission = $(item).children(contentpermissionsMemberPermissions).val();
                var userId = item.id.split("_")[1];
                var p = {};
                if (newPermission == "manager") {
                    atLeastOneManager = true;
                    p = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":manager": userId,
                            ":viewer@Delete": userId
                        }
                    };
                    permissionsBatch.push(p);
                } else {
                    p = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":viewer": userId,
                            ":manager@Delete": userId
                        }
                    };
                    permissionsBatch.push(p);
                }
                if(!$(item).attr("data-originalpermission").indexOf(newPermission) == 0){
                    savePermissions = true;
                }
            });
            if (atLeastOneManager && savePermissions) {
                // Do the Batch request
                sakai.api.Server.batch(permissionsBatch, function(success, data){
                    sakai.api.Content.setFilePermissions([{
                        "hashpath": sakai_global.content_profile.content_data.data["_path"],
                        "permissions": $(contentpermissionsGlobalPermissions).val()
                    }], function(){
                        closeOverlay();
                        sakai.api.Util.notification.show($("#contentpermissions_permissions").text(), $("#contentpermissions_permissionschanged").text());
                        $(window).trigger("load.content_profile.sakai");
                    });
                }, false);
            } else {
                if(!savePermissions){
                    closeOverlay();
                    $(window).trigger("load.content_profile.sakai");
                }else {
                    sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("contentpermissions","","CANNOT_SAVE_SETTINGS"), sakai.api.i18n.Widgets.getValueForKey("contentpermissions","","THERE_SHOULD_BE_AT_LEAST_ONE_MANAGER"));
                }
            }
        };

        /**
         * Save the settings of a widget
         * This includes the gobal permissions settings but also the individual permission settings for users
         */
        var doSave = function(){
            var dataObj = {
                "sakai:permissions": $(contentpermissionsGlobalPermissions).val()
            };
            var globalPermissionsChanged = sakai_global.content_profile.content_data.data["sakai:permissions"] !== $(contentpermissionsGlobalPermissions).val();
            if(globalPermissionsChanged){
                $.ajax({
                    url: sakai_global.content_profile.content_data.path + ".json",
                    type: "POST",
                    data: dataObj,
                    success: function(){
                        saveMemberPermissions();
                    }
                });
            } else {
                saveMemberPermissions();
            }
        };

        /**
         * Gets the list of member users and groups from sakai_global and returns an array of userIds/groupIds to pass to autosuggest for filtering out
         */     
        var autosuggestFilterUsersGroups = function(){
            var filterlist = [];
            var filterUsersGroups = sakai_global.content_profile.content_data.members.managers.concat(sakai_global.content_profile.content_data.members.viewers);
            $.each(filterUsersGroups,function(i,val){
                filterlist.push(val.userid || val.groupid);
            });
            return filterlist;
        };
        
        /**
         * Checks the data for duplicate users/groups and removes the duplicate; gives preference to the user/group with edit permissions
         * n.b. duplicates were being introduced via the sharing widget which will be addressed, so this sanity check will ultimately be optional
         * but might be good to have (if it doesn't affect performance) in case any new widgets make the same mistake...
         */ 
        var removeDuplicateUsersGroups = function(data){
            if(!data || !data.members){
                return data;
            }
            var tmpManagers = {};
            var managers = data.members.managers || [];
            var ml = managers.length;
            var tmpViewers = {};
            var viewers = data.members.viewers || [];
            var vl = viewers.length;
            for(var i = 0; i < ml; i++){ //though unlikely, this will remove any duplicates within the manager permission
                tmpManagers[managers[i].userid || managers[i].groupid] = managers[i];
            }
            for(var j = 0; j < vl; j++){ //if the viewer is a manager, don't add them. Also removes duplicates within viewer permissions
                if(!tmpManagers[viewers[j].userid || viewers[j].groupid]){
                    tmpViewers[viewers[j].userid || viewers[j].groupid] = viewers[j];
                }
            }
            
            var sortById = function(a, b) {
                var x = (a.userid || a.groupid).toLowerCase();
                var y = (b.userid || b.groupid).toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            };
            
            data.members.managers = _.toArray(tmpManagers).sort(sortById);
            data.members.viewers = _.toArray(tmpViewers).sort(sortById);
            return data;
        };
        
        //////////////
        // RENDERING //
        //////////////

        /**
         * Render the widget UI and fetch the data to go in the members list
         */
        var renderPermissions = function(){
            contentData = sakai_global.content_profile.content_data;
            $contentpermissionsContentContainer.html(sakai.api.Util.TemplateRenderer(contentpermissionsContentTemplate, {
                "contentdata": removeDuplicateUsersGroups(contentData),
                "sakai": sakai
            }));
            sakai.api.Util.AutoSuggest.setup($(contentpermissionsMembersAutosuggest), {"asHtmlID": tuid,"selectionAdded":addedUserGroup,"filterUsersGroups":autosuggestFilterUsersGroups()}); 
            renderMemberList();
        };
        
        var renderMemberList = function(){
            var mode = $(contentpermissionsNewMemberPermissions).val();
            var autosuggesteduserlist = getSelectedList();
            var userListLength = autosuggesteduserlist.list.length;
            var i = 0;
            for(i;i<userListLength;i++){ //maybe the users from both sources should be merged into separate array, in case the global array is used elsehwere and expects the full data?
                sakai_global.content_profile.content_data.members[mode].push({"userid":autosuggesteduserlist.list[i],"username":autosuggesteduserlist.toAddNames[i],"isAutoSuggested":true});
            }
            $(contentpermissionsMembersList).html(sakai.api.Util.TemplateRenderer(contentpermissionsMembersListTemplate, {
                "contentdata": contentData,
                "sakai": sakai
            }));
            enableDisableButtons(true);
            if(userListLength>0){
                doSave(true);
            }
        };

        /**
         * Set the widget title to include the filename and call the render function
         */
        var setWidgetTitleAndRender = function(){
            $(".dialog_header_inner h1:visible").text("\"" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\" " + sakai.api.i18n.getValueForKey("PERMISSIONS", "contentpermissions"));
            renderPermissions();
        };


        //////////////
        // BINDINGS //
        //////////////

        var addBinding = function(){
            $contentpermissionsContainer.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 3000
            });

            $("#contentpermissions_warning_container").jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 4000
            });

            $(window).bind("init.contentpermissions.sakai", function(e, config, callbackFn){
                $contentpermissionsContainer.jqmShow();
                setWidgetTitleAndRender();
            });

            $("#contentpermissions_proceedandapply").live("click", function(){
                doSave();
            });

            $(contentpermissionsCancelButton).live("click", closeOverlay);
            $(contentpermissionsShareButton).live("click", doShare);
            $(contentpermissionsSaveAndCloseButton).live("click", showWarning);
            $(contentpermissionsRemoveButton).live("click", doRemove);
            $(contentpermissionsNewMemberCheckAll).live("click", checkAll);
            $(contentpermissionsMembersContainerInputFields).live("click", enableDisableButtons);
            $(contentpermissionsNewMemberAllPermissions).live("change", changePermissionForSelected);
            $(window).bind("ready.contentprofile.sakai", renderPermissions);

        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var init = function(){
            addBinding();
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contentpermissions");
});