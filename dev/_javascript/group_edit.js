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
                renderTemplates();
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
    	sakai.api.Util.notification.show("Group management", "Your group was updated successfully");
        // Re-render the Entity Summary widget so the changes are reflected
        sakai.api.UI.entity.render("group", sakai.currentgroup.data);
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
    var renderUserLists = function(tuid){

        var listSelectable = false;
        if (sakai.currentgroup.mode === 'edit') {
            listSelectable = true;
        }

        var pl_config = {"selectable":listSelectable, "subNameInfoUser": "email", "subNameInfoGroup": "sakai:group-description", "sortOn": "lastName", "sortOrder": "ascending", "items": 50, "function": "getSelection" };

        if (tuid === 'members') {
            // get group members
            $.ajax({
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
            });
        } else if (tuid === 'managers') {
            // get group managers
            $.ajax({
                url: "/system/userManager/group/" + groupid + "-managers.members.json",
                success: function(data){
                    var groupManagers = $.parseJSON(data);
                    var json_data_managers = {
                        "results" : groupManagers,
                        "total" : groupManagers.length
                        };
                    sakai.listPeople.render(tuid, pl_config, json_data_managers);
                }
            });
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
                    data: {
                        "_charset_":"utf-8",
                        ":member@Delete": removeUser
                    },
                    type: "POST",
                    success: function(data){
                        sakai.listPeople.removeFromList(tuid);
                    }
                });
            }
        });
    };

    /**
     * Add users
     * Function that gets the list of selected users from the people picker widget and adds them to the group
     * @param {String} tuid Identifier for the widget/type of user we're removing (member or a manager)
     */
    var addUsers = function(tuid, users) {

        var addUser;
        var groupIdAdd = groupid;

        if (tuid === 'managers') {
            groupIdAdd = groupid + '-managers';
        }

        $.each(sakai.data.pcikeruser[tuid]["selected"], function(index, resultObject) {
            if (resultObject['userid']) {
                addUser = resultObject['userid'];
            } else if (resultObject['groupid']) {
                addUser = resultObject['groupid'];
            } else if (resultObject['rep:userId']) {
                addUser = resultObject['rep:userId'];
            }
            if (addUser) {
                // add user to group
                $.ajax({
                    url: "/system/userManager/group/" + groupIdAdd + ".update.json",
                    data: {
                        "_charset_":"utf-8",
                        ":member": addUser
                    },
                    type: "POST",
                    success: function(data){
                        sakai.listPeople.addToList(tuid, sakai.data.pickeruser[tuid]["selected"]);
                    }
                });
            }
        });
    };

    /**
     * Render Templates
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
        var $members_list_container = $("#members_list_permission_container");
        var $managers_list_container = $("#managers_list_permission_container");
        $members_list_container.html($.TemplateRenderer("#group_edit_userlist_default_template", membersData));
        $managers_list_container.html($.TemplateRenderer("#group_edit_userlist_default_template", managersData));
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
            renderUserLists(tuid);
        });

        // Bind the update button
        $("#group_editing_button_update").bind("click", function(){
            $(window).trigger("sakai.groupbasicinfo.update");
        });

        // Bind the don't update button
        $("#group_editing_button_dontupdate").bind("click", function(){
           window.location = "group.html?id=" + sakai.currentgroup.id;
        });

        // Bind the remove members button
        $("#group_editing_remove_members").bind("click", function(){
            removeUsers('members');
        });

        // Bind the remove managers button
        $("#group_editing_remove_managers").bind("click", function(){
            removeUsers('managers');
        });

        // Bind the people picker widget when it is ready to return a list of users
        $(window).bind("sakai-pickeruser-finished", function(){

            var json_data = {
                "results" : pickerData.selected,
                "total" : pickerData.selectCount
            };

            addUsers(pickerData.spaceName, json_data);
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
        if (groupid) {
            getGroupData(groupid);
        }

        addBinding();
    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.groupedit");