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
/*global $, QueryString */

var sakai = sakai || {};

// Global object that will store information about the current group context
sakai.currentgroup = sakai.currentgroup || {};

sakai.currentgroup.id = sakai.currentgroup.id || {};
sakai.currentgroup.data = sakai.currentgroup.data || {};
sakai.currentgroup.mode = sakai.currentgroup.mode || {};
sakai.currentgroup.profileView = true;

sakai.groupedit = function(){

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
    $(window).bind("sakai.api.UI.entity.ready", function(e){
        readyToRender = true;
        if (sakai.currentgroup.data) {
            sakai.api.UI.entity.render("group", sakai.currentgroup.data);
            hasRendered = true;
        }
    });

    /**
     * Fetch group data
     * @param {String} groupid Identifier for the group we're interested in
     */
    var getGroupData = function(groupid){

        $.ajax({
            url: "/~" + groupid + "/public.infinity.json",
            success: function(data){
                sakai.currentgroup.id = groupid;
                sakai.currentgroup.data = data;
                sakai.currentgroup.data["sakai:group-id"] = groupid;
                if (data.authprofile['rep:policy']) {
                    triggerEditable(true);
                }
                if (readyToRender && !hasRendered) {
                    sakai.api.UI.entity.render("group", sakai.currentgroup.data);
                }
                renderGroupBasicInfo();
                // per section permissions to be fully implemented later; hiding
                // the "Who can view or search this?" dropdowns for now
                // renderTemplates();
                addPickUserBinding();
            }
        });
    };

    /**
     * After the page has been loaded, weadd a declaration for the basic group info widget. We render
     * this and make sure that the showSettings variable will be set to true.
     * i.e. the widget will be rendered in Edit mode
     */
    var renderGroupBasicInfo = function(){
        $("#" + groupBasicInfoContainer).html($.TemplateRenderer("#" + groupBasicInfoTemplate, {}));
        sakai.api.Widgets.widgetLoader.insertWidgets(groupBasicInfoContainer, true);
    }

    /**
     * When the Basic Group Info widget has finished updating the group details, it will come
     * back to this function
     */
    $(window).bind("sakai.groupbasicinfo.updateFinished", function(){
        // Show a notification on the screen
    	sakai.api.Util.notification.show("Group Basic Information", "Updated successfully.");
        // Re-render the Entity Summary widget so the changes are reflected
        sakai.api.UI.entity.render("group", sakai.currentgroup.data);
    });

    /**
     * When the Group Permissions widget has finished updating group permissions,
     * it will come back to this function
     */
    $(window).bind("sakai.grouppermissions.updateFinished", function(ev, success, errorMessage) {
        // Show notification
        if(success) {
            sakai.api.Util.notification.show("Group Permissions", "Updated successfully.");
        } else {
            sakai.api.Util.notification.show("Group Permissions", "Update failed. Please try again later or contact your administrator if the issue persists.  (Error status: " + errorMessage + ")");
        }
    });

    /**
     * Trigger edit buttons
     * @param {Boolean} show Flag to either show or hide update or edit buttons
     */
    var triggerEditable = function(show){

        sakai.currentgroup.mode = 'edit';
        $(".group_editing").show();

    };

    /**
     * Render Widgets
     * @param {String} tuid unique identifier of widget
     */
    var renderItemLists = function(tuid){

        var listSelectable = false;
        if (sakai.currentgroup.mode === 'edit') {
            listSelectable = true;
        }
        var url;
        var pl_config = {"selectable":listSelectable, "subNameInfoUser": "email", "subNameInfoGroup": "sakai:group-description", "sortOn": "lastName", "sortOrder": "ascending", "items": 50, "function": "getSelection" };

        if (tuid === 'members') {
            // get group members
            /*$.ajax({
                url: "/system/userManager/group/" + groupid + ".members.json",
                success: function(data){
                    var groupMembers = $.parseJSON(data);

                    // filter out the manager group
                    $.each(groupMembers, function(index, resultObject) {
                        if (resultObject['groupid'] === groupid + '-managers') {
                            groupMembers.splice(index, 1);
                        }
                    });

                    var json_data_members = {
                        "results" : groupMembers,
                        "total" : groupMembers.length
                        };
                    sakai.listPeople.render(tuid, pl_config, json_data_members);
                }
            });*/
            url = "/system/userManager/group/" + groupid + ".members.json";
            sakai.listPeople.render(tuid, pl_config, url, groupid);
        } else if (tuid === 'managers') {
            // get group managers
            /*$.ajax({
                url: "/system/userManager/group/" + groupid + "-managers.members.json",
                success: function(data){
                    var groupManagers = $.parseJSON(data);
                    var json_data_managers = {
                        "results" : groupManagers,
                        "total" : groupManagers.length
                        };
                    sakai.listPeople.render(tuid, pl_config, json_data_managers);
                }
            });*/
            url = "/system/userManager/group/" + groupid + "-managers.members.json";
            sakai.listPeople.render(tuid, pl_config, url, groupid);
        } else if (tuid === 'content') {
            url = "/var/search/pool/files?group=" + groupid;
            sakai.listPeople.render(tuid, pl_config, url, groupid);
        }
    };

    /**
     * Remove users
     * Function that gets the list of selected users from the listpeople widget and removed them from the group
     * @param {String} tuid Identifier for the widget/type of user we're removing (member or a manager)
     */
    var removeUsers = function(tuid) {

        var removeUser;
        var groupIdRemove = groupid;
        var userCount = 0;

        if (tuid === 'managers') {
            groupIdRemove = groupid + '-managers';
        }

        $.each(sakai.data.listpeople[tuid]["selected"], function(index, resultObject) {
            if (resultObject['userid']) {
                removeUser = resultObject['userid'];
            } else if (resultObject['groupid']) {
                removeUser = resultObject['groupid'];
            } else if (resultObject['rep:userId']) {
                removeUser = resultObject['rep:userId'];
            }
            if (removeUser) {
                // remove user from group
                $.ajax({
                    url: "/system/userManager/group/" + groupIdRemove + ".update.json",
                    async: false,
                    data: {
                        "_charset_":"utf-8",
                        ":member@Delete": removeUser
                    },
                    type: "POST",
                    success: function(data){
                        sakai.listPeople.removeFromList(tuid);
                        userCount++;
                    }
                });
            }
        });

        if (userCount > 1) {
            sakai.api.Util.notification.show("Group Membership", "Selected users have been removed from the group.");
        } else if (userCount > 0) {
            sakai.api.Util.notification.show("Group Membership", "Selected user has been removed from the group.");
        }
    };

    /**
     * Remove content
     * Function that gets the list of selected content from the listpeople widget and removes group access
     * @param {String} tuid Identifier for the widget/type of user we're removing (content)
     */
    var removeContent = function(tuid) {

        var removeContent;
        var contentRemoved = false;

        $.each(sakai.data.listpeople[tuid]["selected"], function(index, resultObject) {
            if (resultObject['content_id']) {
                removeContent = resultObject['content_id'];
            }
            if (removeContent) {
                // remove group access
                $.ajax({
                    url: "/p/" + removeContent + ".members.json",
                    async: false,
                    data: {
                        "_charset_":"utf-8",
                        ":viewer@Delete": groupid
                    },
                    type: "POST",
                    success: function(data){
                        sakai.listPeople.removeFromList(tuid);
                        contentRemoved = true;
                    }
                });
            }
        });

        if (contentRemoved) {
            sakai.api.Util.notification.show("Group Content", "Selected content has been removed from the group.");
        }
    };

    /**
     * Add users
     * Function that gets the list of selected users from the people picker widget and adds them to the group
     * @param {String} tuid Identifier for the widget/type of user we're removing (member or a manager)
     */
    var addUsers = function(tuid, users) {

        var addUser;
        var groupIdAdd = groupid;
        var userCount = 0;

        if (tuid === 'managers') {
            groupIdAdd = groupid + '-managers';
        }

        $.each(users, function(index, member) {
            if (member) {
                // add user to group
                $.ajax({
                    url: "/system/userManager/group/" + groupIdAdd + ".update.json",
                    async: false,
                    data: {
                        "_charset_":"utf-8",
                        ":member": member
                    },
                    type: "POST",
                    success: function(data){
                        userCount++;
                    }
                });
            }
        });

        if (userCount > 1) {
            renderItemLists(tuid);
            sakai.api.Util.notification.show("Group Membership", "Users have been added to the group.");
        } else if (userCount > 0) {
            renderItemLists(tuid);
            sakai.api.Util.notification.show("Group Membership", "User has been added to the group.");
        }
    };
    
    /**
     * Add users
     * Function that gets the list of selected users from the people picker widget and adds them to the group
     * @param {String} tuid Identifier for the widget/type of user we're removing (member or a manager)
     */
    var addContent = function(contentList) {

        var updateSuccess = false;

        $.each(contentList, function(index, contentId) {
            if (contentId) {
                // add content to group
                $.ajax({
                    url: "/p/" + contentId + ".members.json",
                    async: false,
                    data: {
                        "_charset_":"utf-8",
                        ":viewer": groupid
                    },
                    type: "POST",
                    success: function(data){
                        updateSuccess = true;
                    }
                });
            }
        });

        if (updateSuccess) {
            renderItemLists('content');
            sakai.api.Util.notification.show("Group Content", "Content has been added to the group.");
        }
    };

    /**
     * Render Templates for per section permissions dropdowns. This functionality
     * is currently disabled (renderTemplates should not be called), but the code
     * remains to be continued at a later time.
     */
    var renderTemplates = function(){
        var data = { "access" : 'public' };
        var membersData = {
            "mode" : sakai.currentgroup.mode,
            "data" : data
            };
        var managersData = {
            "mode" : sakai.currentgroup.mode,
            "data" : data
            };
        var contentData = {
            "mode" : sakai.currentgroup.mode,
            "data" : data
            };
        var $members_list_container = $("#members_list_permission_container");
        var $managers_list_container = $("#managers_list_permission_container");
        var $content_list_container = $("#content_list_permission_container");
        $members_list_container.html($.TemplateRenderer("#group_edit_userlist_default_template", membersData));
        $managers_list_container.html($.TemplateRenderer("#group_edit_userlist_default_template", managersData));
        $content_list_container.html($.TemplateRenderer("#group_edit_userlist_default_template", contentData));
    };


    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to all the elements on the page
     */
    var addBinding = function(){

        // Bind the listpeople widgets
        $(window).bind("listpeople_ready", function(e, tuid){
            renderItemLists(tuid);
        });

        // Bind the update button
        $("#group_editing_button_update").bind("click", function(){
            $(window).trigger("sakai.groupbasicinfo.update");
            $(window).trigger("sakai.grouppermissions.update");
        });

        // Bind the don't update button
        $("#group_editing_button_dontupdate").bind("click", function(){
           window.location = "show.html?type=group&amp;id=" + sakai.currentgroup.id;
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
        $(window).bind("sakai-pickeruser-ready", function(e){
            var pl_config = {
                "mode": "search",
                "selectable":true,
                "subNameInfo": "email",
                "sortOn": "lastName",
                "items": 50,
                "what": "Members",
                "where": sakai.currentgroup.data.authprofile["sakai:group-title"]
            };

            // Bind the add members button
            $("#group_editing_add_members").bind("click", function(){
                pl_config.type = "people";
                pl_config.what = "Members";
                $(window).trigger("sakai-pickeruser-init", pl_config, function(people) {
                });
                $(window).unbind("sakai-pickeruser-finished");
                $(window).bind("sakai-pickeruser-finished", function(e, peopleList) {
                    addUsers('members', peopleList.toAdd);
                });
            });

            // Bind the add managers button
            $("#group_editing_add_managers").bind("click", function(){
                pl_config.type = "people";
                pl_config.what = "Managers";
                $(window).trigger("sakai-pickeruser-init", pl_config, function(people) {
                });
                $(window).unbind("sakai-pickeruser-finished");
                $(window).bind("sakai-pickeruser-finished", function(e, peopleList) {
                    addUsers('managers', peopleList.toAdd);
                });
            });

            // Bind the add content button
            $("#group_editing_add_content").bind("click", function(){
                pl_config.type = "content";
                pl_config.what = "Content";
                $(window).trigger("sakai-pickeruser-init", pl_config, function(content) {
                });
                $(window).unbind("sakai-pickeruser-finished");
                $(window).bind("sakai-pickeruser-finished", function(e, contentList) {
                    addContent(contentList.toAdd);
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
        if (sakai.api.Groups.isCurrentUserAManager(groupid)) {
            if (groupid) {
                getGroupData(groupid);
            }
            addBinding();
        } else {
            // force the user to go back to their previous page
            alert("Sorry, you are not allowed to view this page.");
            window.history.back();
        }
    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.groupedit");