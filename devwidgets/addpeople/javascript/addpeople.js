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
    sakai_global.addpeople = function(tuid, showSettings){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $addpeopleContainer = $("#addpeople_container");
        var $addpeopleContactsContainer = $("#addpeople_contacts_container");
        var $addpeopleSelectedContactsContainer = $("#addpeople_selected_contacts_container");

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

        var selectedUsers = {};


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
            $addpeopleSelectedContactsContainer.html(sakai.api.Util.TemplateRenderer(addpeopleSelectedContactsTemplate, {"contacts":selectedUsers}));
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

        var finishAdding = function(){
            $(window).trigger("sakai.addpeople.usersselected", selectedUsers);
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

        var constructSelecteduser = function(){
            $addpeopleSelectAllSelectedContacts.removeAttr("checked");
            if ($(this).is(":checked")) {
                if (!selectedUsers[$(this)[0].id.split("_")[0]]) {
                    var userObj = {
                        userid: $(this)[0].id.split("_")[0],
                        name: $(this).nextAll(".s3d-entity-displayname").text(),
                        permission: "viewer",
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
            enableDisableControls();
        };

        ////////////////////
        // INITIALIZATION //
        ////////////////////

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


        ////////////
        // EVENTS //
        ////////////

        $(window).bind("init.addpeople.sakai", function(e, data){
            addBinding();
            initializeJQM();
            sakai.api.User.getContacts(renderContacts);
            enableDisableControls();
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addpeople");

});