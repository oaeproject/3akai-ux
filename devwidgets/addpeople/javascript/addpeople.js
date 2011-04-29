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

        // Containers
        var $addpeopleContainer = $("#addpeople_container");
        var $addpeopleContactsContainer = $("#addpeople_contacts_container");
        var $addpeopleSelectedContactsContainer = $("#addpeople_selected_contacts_container");
        var $addpeopleMembersAutoSuggest = $("#addpeople_members_autosuggest");

        // Templates
        var addpeopleContactsTemplate = "addpeople_contacts_template";
        var addpeopleSelectedContactsTemplate = "addpeople_selected_contacts_template";

        // Elements
        var $addpeopleSelectAllContacts = $("#addpeople_select_all_contacts");
        var addpeopleCheckbox = ".addpeople_checkbox";
        var addpeopleSelectedCheckbox = ".addpeople_selected_checkbox";
        var addpeopleSelectedPermissions = ".addpeople_selected_permissions";
        var $addpeopleSelectedAllPermissions = $("#addpeople_selected_all_permissions");
        var $addpeopleSelectAllSelectedContacts = $("#addpeople_select_all_selected_contacts");
        var $addpeopleFinishAdding = $(".addpeople_finish_adding");
        var $addpeopleRemoveSelected = $(".addpeople_remove_selected");
        var $addpeopleMembersAutoSuggestField = $("#addpeople_members_autosuggest_field");

        var selectedUsers = {};
        var currentTemplate = false;


        ///////////////
        // RENDERING //
        ///////////////

        var renderContacts = function(){
            if ($addpeopleContactsContainer.text() == "") {
                $addpeopleContactsContainer.html(sakai.api.Util.TemplateRenderer(addpeopleContactsTemplate, {
                    "contacts": sakai.data.me.mycontacts,
                    "sakai": sakai
                }));
            }
        };

        var renderSelectedContacts = function(){
            $addpeopleSelectedContactsContainer.html(sakai.api.Util.TemplateRenderer(addpeopleSelectedContactsTemplate, {"contacts":selectedUsers, "roles": currentTemplate.roles}));
        };


        /////////////
        // UTILITY //
        /////////////

        var enableDisableControls = function(){
            var count = 0;
            for (var item in selectedUsers) {count++;}
            if(count == 0){
                $addpeopleRemoveSelected.attr("disabled","disabled");
                $addpeopleSelectAllSelectedContacts.attr("disabled","disabled");
                $addpeopleSelectAllSelectedContacts.removeAttr("checked");
                $addpeopleSelectedAllPermissions.attr("disabled","disabled");
            } else {
                $addpeopleRemoveSelected.removeAttr("disabled");
                $addpeopleSelectAllSelectedContacts.removeAttr("disabled");
                $addpeopleSelectedAllPermissions.removeAttr("disabled");
            }
        };

        /**
         * Fire an event that indicates the addpeople widget is done adding users.
         * The object containing this userdata is giving to the event
         * Also hide the overlay
         */
        var finishAdding = function(){
            $(window).trigger("sakai.addpeople.usersselected", [tuid, selectedUsers]);
            $addpeopleContainer.jqmHide();
        };

        /**
         * Check/Uncheck all items in the list and enable/disable buttons
         */
        var checkAll = function(el, peopleContainer){
            if($(el).is(":checked")){
                $(peopleContainer).attr("checked","checked");
                $(peopleContainer).change();
                if (peopleContainer != addpeopleSelectedCheckbox) {
                    renderSelectedContacts();
                }
            }else{
                $(peopleContainer).removeAttr("checked");
                if (peopleContainer != addpeopleSelectedCheckbox) {
                    selectedUsers = {};
                    renderSelectedContacts();
                    $addpeopleSelectAllSelectedContacts.removeAttr("checked");
                }
            }
            enableDisableControls();
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
                        name: $(this).nextAll(".s3d-entity-displayname").text(),
                        dottedname: sakai.api.Util.applyThreeDots($(this).nextAll(".s3d-entity-displayname").text(), 80),
                        permission: roleList[0].id,
                        picture: $(this).next().children("img").attr("src")
                    }
                    selectedUsers[userObj.userid] = userObj;
                    renderSelectedContacts();
                }
            }else{
                delete selectedUsers[$(this)[0].id.split("_")[0]];
                renderSelectedContacts();
                $addpeopleSelectAllSelectedContacts.removeAttr("checked");
                $addpeopleSelectAllContacts.removeAttr("checked");
            }
            enableDisableControls();
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
            $.each($addpeopleSelectedContactsContainer.find("input:checked"), function(index, item){
                delete selectedUsers[$(item)[0].id.split("_")[0]];
                $("#" + $(item)[0].id.split("_")[0] + "_chk").removeAttr("checked");
                $addpeopleSelectAllContacts.removeAttr("checked");
                $(item).parent().next().remove();
                $(item).parent().remove();
            });
            $addpeopleSelectAllSelectedContacts.removeAttr("checked");
            enableDisableControls();
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
            var userid = userData.attributes.value.split("/");
            if(userData.attributes.picture){
                pictureURL = "/~" + userid[1] + "/public/profile/" + userData.attributes.picture
            } else{
                if(userid[0] == "group"){
                    pictureURL = "/dev/images/group_avatar_icon_32x32.png";
                }else{
                    pictureURL = "/dev/images/default_profile_picture_32.png";
                }
            }
            var userObj = {
                userid: userid[1],
                name: userData.attributes.name,
                dottedname: sakai.api.Util.applyThreeDots(userData.attributes.name, 80),
                permission: roleList[0].id,
                picture: pictureURL
            };
            selectedUsers[userObj.userid] = userObj;
            renderSelectedContacts();
            enableDisableControls();
            $(".as-close").click();
        };

        /**
         * Fetch the users and groups used in the autocomplete functionality of the widget
         */
        var fetchUsersGroups = function(){
            var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS_ALL + "?q=*";

            sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                if (success) {
                    var suggestions = [];
                    var name, value, type, picture;
                    $.each(data.results, function(i){
                        if (data.results[i]["rep:userId"] && sakai.data.me.user.userid != data.results[i]["rep:userId"]) {
                            name = sakai.api.Security.saneHTML(sakai.api.User.getDisplayName(data.results[i]));
                            value = "user/" + data.results[i]["rep:userId"];
                            type = "user";
                            if (data.results[i].picture){
                                picture = $.parseJSON(data.results[i].picture).name;
                            }
                        } else if (data.results[i]["sakai:group-id"]) {
                            name = data.results[i]["sakai:group-title"];
                            value = "group/" + data.results[i]["sakai:group-id"];
                            type = "group";
                            if (data.results[i].picture){
                                picture = $.parseJSON(data.results[i].picture).name;
                            }
                        }
                        suggestions.push({"value": value, "name": name, "type": type, "picture": picture});
                    });
                    $addpeopleMembersAutoSuggestField.autoSuggest(suggestions, {
                        selectedItemProp: "name",
                        searchObjProps: "name",
                        startText: "",
                        asHtmlID: tuid,
                        resultClick: createAutoSuggestedUser
                    });
                    $addpeopleMembersAutoSuggest.show();
                }
            });
        };

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function(){
            $addpeopleContainer.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });

            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();
            if (htmlScrollPos > 0) {
                $addpeopleContainer.css({
                    "top": htmlScrollPos + 100 + "px"
                });
            } else if (docScrollPos > 0) {
                $addpeopleContainer.css({
                    "top": docScrollPos + 100 + "px"
                });
            }
            $addpeopleContainer.jqmShow();
        };

        var addBinding = function(){
            // Unbind all
            $(addpeopleCheckbox).die("change", constructSelecteduser);
            $(addpeopleSelectedPermissions).die("change", changePermission);
            $addpeopleFinishAdding.unbind("click", finishAdding);
            $addpeopleRemoveSelected.unbind("click", removeSelected);

            // Bind all
            $addpeopleSelectAllContacts.bind("click", function(){
                checkAll(this, addpeopleCheckbox);
            });
            $addpeopleSelectAllSelectedContacts.bind("click", function(){
                checkAll(this, addpeopleSelectedCheckbox);
            });
            $addpeopleSelectedAllPermissions.bind("change", changeSelectedPermission)
            $(addpeopleCheckbox).live("change", constructSelecteduser);
            $(addpeopleSelectedPermissions).live("change", changePermission);
            $addpeopleFinishAdding.bind("click", finishAdding);
            $addpeopleRemoveSelected.bind("click", removeSelected);
        };
        
        var loadRoles = function(){
            currentTemplate = sakai.api.Groups.getTemplate(widgetData.category, widgetData.id);
            $("#addpeople_selected_all_permissions").html(sakai.api.Util.TemplateRenderer("addpeople_selected_permissions_template", {"roles": currentTemplate.roles}));
        }

        ////////////
        // EVENTS //
        ////////////

        $(window).bind("init.addpeople.sakai", function(e, initTuid){
            debug.log(initTuid);
            if (initTuid === tuid) {
                loadRoles();
                addBinding();
                initializeJQM();
                fetchUsersGroups();
                sakai.api.User.getContacts(renderContacts);
                enableDisableControls();
            }
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addpeople");

});