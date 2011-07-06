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

        var $rootel = $("#" + tuid);

        // Containers
        var entityContainer = "#entity_container";
        var entityUserPictureDropdown = ".entity_user_picture_dropdown";
        var entityUserCreateAddDropdown = ".entity_user_create_add_dropdown";

        // Buttons
        var entityUserCreateAndAdd = "#entity_user_create_and_add";
        var entityUserImage = "#entity_user_image";
        var entityUserMessage = "#entity_user_message";
        var entityUserAddToContacts = "#entity_user_add_to_contacts";
        var entityUserDropdown = "#entity_user_image.s3d-dropdown-menu";
        var entityGroupDropdown = "#entity_group_image.s3d-dropdown-menu";

        /**
         * The 'context' variable can have the following values:
         * - 'user_me' When the viewed user page is the current logged in user
         * - 'user_other' When the viewed user page is a user that is not a contact
         * - 'contact' When the viewed user page is one of a contact
         * @param {String} context String defining the context of the entity widget
         */
        var addBinding = function(context){
            switch(context.type){
                case "user_me":
                    $(entityUserCreateAndAdd).bind("click", function(){
                        if($(this).hasClass("entity_user_created_add_clicked")){
                            $(this).removeClass("entity_user_created_add_clicked");
                            $(entityUserCreateAddDropdown).hide();
                        }else{
                            $(this).addClass("entity_user_created_add_clicked");
                            $(entityUserCreateAddDropdown).show();
                            $(entityUserCreateAddDropdown).css("left", $(this).position().left - 38);
                        }
                    });
                    $(entityUserDropdown).hover(function(){
                        var $li = $(this);
                        var $subnav = $li.children(".s3d-dropdown-container");

                        var pos = $li.position();
                        $subnav.css("left", pos.left + 15);
                        $subnav.css("margin-top", $li.height() + 4 + "px");
                        $subnav.show();
                    }, function(){
                        var $li = $(this);
                        $li.children(".s3d-dropdown-container").hide();
                    });
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
                case "group_managed":
                    $('#entity_groupsettings_dropdown').html(sakai.api.Util.TemplateRenderer("entity_groupsettings_dropdown", context));

                    $('#ew_group_settings_edit_link').live("click", function(ev) {
                        $(window).trigger("init.worldsettings.sakai", context.data.authprofile['sakai:group-id']);
                        $('#entity_groupsettings_dropdown').jqmHide();
                    });

                    $(entityGroupDropdown).hover(function(){
                        var $li = $(this);
                        var $subnav = $li.children(".s3d-dropdown-container");

                        var pos = $li.position();
                        $subnav.css("left", pos.left + 5);
                        $subnav.css("margin-top", $li.height() + 4 + "px");
                        $subnav.show();
                    }, function(){
                        var $li = $(this);
                        $li.children(".s3d-dropdown-container").hide();
                    });
                    $(window).trigger("setData.changepic.sakai", ["group", context.data.authprofile["sakai:group-id"]]);
                    $(window).bind("ready.changepic.sakai", function(){
                        $(window).trigger("setData.changepic.sakai", ["group", context.data.authprofile["sakai:group-id"]]);
                    });
                    break;
                case "group":
                    $(window).bind("ready.joinrequestbuttons.sakai", function() {
                        var url = "/system/userManager/group/" +
                            context.data.authprofile["sakai:group-id"] + ".managers.json";
                        $.ajax({
                            url: url,
                            success: function(managers){
                                $(window).trigger("init.joinrequestbuttons.sakai", [
                                    context.data.authprofile.groupid,
                                    context.data.authprofile["sakai:group-joinable"],
                                    managers.length,
                                    function (renderedButtons) {
                                        // onShow
                                        $("#joinrequestbuttons_widget", $rootel).show();
                                    }
                                ]);
                            }
                        });
                    });
                    sakai.api.Widgets.widgetLoader.insertWidgets("entity_container", false, $rootel);
                    break;
                case "content_anon": //fallthrough
                case "content_not_shared": //fallthrough
                case "content_shared": //fallthrough
                case "content_managed":
                    var $entityContentUsersDialog = $("#entity_content_users_dialog");
                    var $entityContentUsersDialogContainer = $("#entity_content_users_dialog_list_container");
                    var entityContentUsersDialogTemplate = "#entity_content_users_dialog_list_template";

                    $entityContentUsersDialog.jqm({
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
                        sakai.api.Util.TemplateRenderer(entityContentUsersDialogTemplate, json, $entityContentUsersDialogContainer);
                        $("#entity_content_users_dialog_heading").html($("#entity_content_people").html());

                        return false;
                    });

                    $(".entity_content_group").live("click", function(){
                        var userList = sakai_global.content_profile.content_data.members.managers.concat(sakai_global.content_profile.content_data.members.viewers);
                        $entityContentUsersDialog.jqmShow();

                        var json = {
                            "userList": userList,
                            "type": "groups",
                            sakai: sakai
                        };

                        // render users dialog template
                        sakai.api.Util.TemplateRenderer(entityContentUsersDialogTemplate, json, $entityContentUsersDialogContainer);
                        $entityContentUsersDialogContainer.show();
                        $("#entity_content_users_dialog_heading").html($("#entity_content_groups").html());

                        return false;
                    });

                    $('#entity_contentsettings_dropdown').html(sakai.api.Util.TemplateRenderer("entity_contentsettings_dropdown", context));

                    $("#entity_comments_link").live("click", function(){
                        $("html:not(:animated),body:not(:animated)").animate({ scrollTop: $("#contentcomments_mainContainer").offset().top}, 500 );
                        $("#comments_txtMessage").focus();
                       return false;

                    });
                    break;
            }
       };

        var renderEntity = function(context){
            context.sakai = sakai;
            $(entityContainer).html(sakai.api.Util.TemplateRenderer("entity_" + context.context + "_template", context));
        };

        $(window).bind("sakai.entity.init", function(ev, context, type, data){
            var obj = {
                "context": context,
                "type": type,
                "anon": sakai.data.me.user.anon || false,
                "data": data || {}
            };
            renderEntity(obj);
            addBinding(obj);
            $('#entity_contentsettings_dropdown').jqm({
                modal: false,
                overlay: 0,
                toTop: true,
                zIndex: 3000
            });

            $('#entity_groupsettings_dropdown').jqm({
                modal: false,
                overlay: 0,
                toTop: true,
                zIndex: 3000
            });

            $('#entity_content_permissions').click(function(){
                var $this = $(this);
                if ($("#entity_contentsettings_dropdown").is(":visible")) {
                    $('#entity_contentsettings_dropdown').jqmHide();
                } else {
                    $('#entity_contentsettings_dropdown').css({
                        'top': $this.offset().top + $this.height() - 5,
                        'left': $this.offset().left + $this.width() / 2 - 160
                    }).jqmShow();
                }
            });

            $("#entity_group_permissions").click(function(){
                var $this = $(this);
                if ($("#entity_groupsettings_dropdown").is(":visible")) {
                    $('#entity_groupsettings_dropdown').jqmHide();
                } else {
                    $('#entity_groupsettings_dropdown').css({
                        'top': $this.offset().top + $this.height() - 5,
                        'left': $this.offset().left + $this.width() / 2 - 160
                    }).jqmShow();
                }
            });

            sakai.api.Util.hideOnClickOut("#entity_groupsettings_dropdown", "#entity_group_permissions", function(){
                $("#entity_groupsettings_dropdown").jqmHide();
            });

            $("#ew_group_categories_link").click(function(){
                $("#assignlocation_container").jqmShow();
                $('#entity_groupsettings_dropdown').jqmHide();
            });

            $('#ew_permissions').click(function(e){
                e.preventDefault();
                $(window).trigger("init.contentpermissions.sakai");
                $('#entity_contentsettings_dropdown').jqmHide();
            });

            $('#ew_upload').click(function(e){
                e.preventDefault();
                $(window).trigger("init.uploadnewversion.sakai");
                $('#entity_contentsettings_dropdown').jqmHide();
            });

            $("#ew_revhistory").click(function(e){
                $(window).trigger("init.versions.sakai", {
                    pageSavePath: sakai_global.content_profile.content_data.content_path,
                    saveRef: "",
                    showByDefault: true
                });
                $('#entity_contentsettings_dropdown').jqmHide();
            });
            
            $("#ew_content_preview_delete").bind("click", function(e){
                e.preventDefault();
                window.scrollTo(0,0);
                $(window).trigger('init.deletecontent.sakai', [{"path": sakai_global.content_profile.content_data.content_path},
                    function (success) {
                        if (success) {
                            // Wait for 2 seconds
                            setTimeout(function () {
                                // Relocate to the my sakai page
                                document.location = "/me";
                            }, 2000);
                        }
                    }]
                );
                $('#entity_contentsettings_dropdown').jqmHide();
            });

            $(".addpeople_init").click(function(){
                $(window).trigger("init.addpeople.sakai", [tuid]);
                $("#entity_groupsettings_dropdown").jqmHide();
            })

        });

        // An event to call from the worldsettings dialog so that we can
        // refresh the title if it's been saved.
        $(window).bind("sakai.entity.updateTitle", function(e, title) {
            $('#entity_name').html(title);
        });

        $(window).trigger("sakai.entity.ready");

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("entity");
});
