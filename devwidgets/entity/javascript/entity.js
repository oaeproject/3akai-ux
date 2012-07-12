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
        var renderObj = {};

        // Containers
        var entityContainer = "#entity_container";
        var entityUserPictureDropdown = ".entity_user_picture_dropdown";
        var entityUserCreateAddDropdown = ".entity_user_create_add_dropdown";

        // Buttons
        var entityUserCreateAndAdd = "#entity_user_create_and_add";
        var entityChangeImage = ".entity_change_avatar";
        var entityUserMessage = "#entity_user_message";
        var entityUserAddToContacts = "#entity_user_add_to_contacts";
        var entityUserDropdown = "#entity_user_image.s3d-dropdown-menu";
        var entityGroupDropdown = "#entity_group_image.s3d-dropdown-menu";

        /**
         * Filters out pseudogroups and adds the parent group to the list to be displayed
         * @param {Array} data required array of user and group objects to filter
         * @param {Boolean} setCount required Set to true if the context is content and the counts should be updated (Filtered pseudogroups don't count)
         * @param {Object} context not required if setCount is false, provides the context of the entity widget and holds the counts
         * @Return {Object} parentGroups Object containing the parent groups to display
         */
        var getParentGroups = function(data, setCount, context){
            var parentGroups = {};
            if (setCount) {
                context.data.members.counts.groups = 0;
                context.data.members.counts.collections = 0;
            }
            $.each(data, function(index, group){
                // Check for pseudogroups, if a pseudogroup filter out the parent
                if (group.pseudoGroup) {
                    // Only groups should be added to the object
                    if (!parentGroups.hasOwnProperty(group.parent["sakai:group-id"]) && group.parent["sakai:group-id"]) {
                        if (setCount) {
                            context.data.members.counts.groups++;
                        }
                        // Discard pseudogroup but store parent group
                        parentGroups[group.parent["sakai:group-id"]] = {
                            "sakai:group-id": group.parent["sakai:group-id"],
                            "sakai:group-title": group.parent["sakai:group-title"]
                        };
                    }
                // If no pseudogroup store the group as it is
                } else if (!parentGroups.hasOwnProperty(group["sakai:group-id"]) && group["sakai:group-id"]) {
                    if (setCount) {
                        if (sakai.api.Content.Collections.isCollection(group)){
                            context.data.members.counts.collections++;
                        } else {
                            context.data.members.counts.groups++;
                        }
                    }
                    parentGroups[group["sakai:group-id"]] = group;
                }
            });
            return parentGroups;
        };

        /**
         * Saves the content/collection name
         * @param {String} newTitle The new content/collection title to save
         */
        var saveName = function(newTitle) {
            var oldTitle = $.trim($('#entity_name').attr('data-original-title'));
            $('#entity_name').attr('data-original-title', newTitle);
            if (newTitle && newTitle !== oldTitle) {
                $.ajax({
                    url: '/p/' + sakai_global.content_profile.content_data.data['_path'] + '.html',
                    type: 'POST',
                    cache: false,
                    data: {
                        'sakai:pooled-content-file-name': newTitle
                    },
                    success: function() {
                        var contentData = sakai_global.content_profile.content_data.data;
                        if (sakai.api.Content.Collections.isCollection(contentData)) {
                            // Change the group title as well
                            var groupId = sakai.api.Content.Collections.getCollectionGroupId(contentData);
                            $.ajax({
                                'url': '/system/userManager/group/' + groupId + '.update.json',
                                'type': 'POST',
                                'data': {
                                    'sakai:group-title': newTitle
                                },
                                'success': function() {
                                    // Update the me object
                                    var memberships = sakai.api.Groups.getMemberships(sakai.data.me.groups, true);
                                    $.each(memberships.entry, function(index, membership) {
                                        if (membership['sakai:group-id'] === groupId) {
                                            membership['sakai:group-title'] = newTitle;
                                        }
                                    });
                                    finishChangeTitle(newTitle);
                                }
                            });
                        } else {
                            finishChangeTitle(newTitle);
                        }
                    }
                });
            }
        };

        var finishChangeTitle = function(newTitle) {
            var title = newTitle;
            var link;
            sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name'] = title;
            // Export as IMS Package
            if (sakai.api.Content.getMimeType(sakai_global.content_profile.content_data.data) === 'x-sakai/document') {
                link = '/imscp/' + sakai_global.content_profile.content_data.data['_path'] + '/' +
                sakai.api.Util.safeURL(sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name']) + '.zip';
                $('#contentpreview_download_button').attr('href', link);
            // Download as a normal file
            } else {
                link = sakai_global.content_profile.content_data.smallPath + '/' +
                sakai.api.Util.safeURL(sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name']);
                $('#contentpreview_download_button').attr('href', link);
            }
            sakai.api.Util.setPageTitle(' ' + title, 'pageLevel');
        };

        /**
         * Get the complete user list
         * This includes managers, viewers and editors
         * @return {Array} All the users for a specific content item
         */
        var getUserList = function() {
            return sakai_global.content_profile.content_data.members.managers.concat(
                sakai_global.content_profile.content_data.members.viewers,
                sakai_global.content_profile.content_data.members.editors
            );
        };

        var addBindingUsedBy = function(context) {
            var $entityContentUsersDialog = $('#entity_content_users_dialog');
            var $entityContentUsersDialogContainer = $('#entity_content_users_dialog_list_container');
            var entityContentUsersDialogTemplate = '#entity_content_users_dialog_list_template';
            var entityContentCollectionsDialogTemplate = '#entity_content_collections_dialog_list_template';

            $entityContentUsersDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });

            $('.entity_content_people').on('click', function() {
                var userList = getUserList();

                $entityContentUsersDialog.jqmShow();

                var json = {
                    'userList': userList,
                    'type': 'people',
                    'sakai': sakai
                };

                // render dialog template
                sakai.api.Util.TemplateRenderer(entityContentUsersDialogTemplate, json, $entityContentUsersDialogContainer);
                $('#entity_content_users_dialog_heading').html($('#entity_content_people').html());

                return false;
            });

            $('.entity_content_group').on('click', function() {
                var userList = getUserList();

                $entityContentUsersDialog.jqmShow();

                var parentGroups = getParentGroups(userList, false);

                var json = {
                    'userList': parentGroups,
                    'type': 'groups',
                    'sakai': sakai
                };

                // render users dialog template
                sakai.api.Util.TemplateRenderer(entityContentUsersDialogTemplate, json, $entityContentUsersDialogContainer);
                $entityContentUsersDialogContainer.show();
                $('#entity_content_users_dialog_heading').html($('#entity_content_groups').html());

                return false;
            });

            $('.entity_content_collections').on('click', function() {
                var userList = getUserList();

                $entityContentUsersDialog.jqmShow();

                var json = {
                    'userList': userList,
                    'sakai': sakai
                };

                // render users dialog template
                sakai.api.Util.TemplateRenderer(entityContentCollectionsDialogTemplate, json, $entityContentUsersDialogContainer);
                $entityContentUsersDialogContainer.show();
                $('#entity_content_users_dialog_heading').html($('#entity_content_collections').html());

                return false;
            });

            $('#entity_contentsettings_dropdown').html(sakai.api.Util.TemplateRenderer('entity_contentsettings_dropdown', context));

            $('#entity_comments_link').on('click', function() {
                $('html:not(:animated), body:not(:animated)').animate({
                    scrollTop: $('#content_profile_right_metacomments #contentcomments_mainContainer').offset().top
                }, 500);
                $('#content_profile_right_metacomments #contentcomments_txtMessage').focus();
            });
        };

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
                    $(window).bind("displayName.profile.updated.sakai", function(){
                        $('.entity_name_me').text(sakai.api.User.getDisplayName(sakai.data.me.profile));
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
                    checkHash(context);
                    var json = {
                        "joinable": context.data.authprofile["sakai:group-joinable"] === "withauth",
                        "context": context,
                        "sakai": sakai
                    };

                    $('#entity_groupsettings_dropdown').html(sakai.api.Util.TemplateRenderer("entity_groupsettings_dropdown", json));

                    $('#ew_group_settings_edit_link').live("click", function(ev) {
                        $(window).trigger("init.worldsettings.sakai", context.data.authprofile['sakai:group-id']);
                        $('#entity_groupsettings_dropdown').jqmHide();
                    });

                    $('#ew_group_delete_link').live("click", function(ev) {
                        $(window).trigger('init.deletegroup.sakai', [context.data.authprofile,
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
                        $('#entity_groupsettings_dropdown').jqmHide();
                    });

                    $('#ew_group_join_requests_link').live("click", function(ev) {
                        $(window).trigger("init.joinrequests.sakai", context.data.authprofile);
                        $('#entity_groupsettings_dropdown').jqmHide();
                    });

                    $(".sakai_add_content_overlay").live("click", function(ev){
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
                    sakai.api.Widgets.widgetLoader.insertWidgets("entity_groupsettings_dropdown", false, $rootel);
                    break;
                case "group":
                    $(document).on('ready.joinrequestbuttons.sakai', function() {
                        sakai.api.Groups.getMembers(context.data.authprofile["sakai:group-id"], function(success, members) {
                            members = members[context.data.authprofile["sakai:group-id"]];
                            var managerCount = sakai.api.Groups.getManagerCount(context.data.authprofile, members);
                            var leaveAllowed = managerCount > 1 || !sakai.api.Groups.isCurrentUserAManager(context.data.authprofile["sakai:group-id"], sakai.data.me);
                            $(document).trigger('init.joinrequestbuttons.sakai', [
                                {
                                    "groupProfile": context.data.authprofile,
                                    "groupMembers": members,
                                    "leaveAllowed": leaveAllowed
                                },
                                context.data.authprofile["sakai:group-id"],
                                context.data.authprofile["sakai:group-joinable"],
                                managerCount,
                                "s3d-header-button",
                                function (renderedButtons) {
                                    // onShow
                                    $("#joinrequestbuttons_widget", $rootel).show();
                                }
                            ]);
                        }, true);
                    });
                    sakai.api.Widgets.widgetLoader.insertWidgets("entity_container", false, $rootel);
                    break;
                case "content_anon": //fallthrough
                case "content_not_shared": //fallthrough
                case "content_shared": //fallthrough
                case 'content_edited':
                    addBindingUsedBy(context);
                    break;
                case "content_managed":
                    var entityNameEditable = "#entity_name.entity_name_editable";

                    $(entityNameEditable).click(function(e) {
                        if (!$(this).find('input').length) {
                            $(this).addClass('entity_name_editing');
                            $(this).text($.trim($('#entity_name').attr('data-original-title')));
                            $(this).trigger('openjedit.entity.sakai');
                            $(window).trigger('position.inserter.sakai');
                        }
                    });
                    // setup jeditable for the content name field
                    var nameUpdate = function(value, settings) {
                        $(this).removeClass('entity_name_editing');
                        saveName($.trim(value));
                        return value;
                    };
                    var nameCallback = function(value, settings) {
                        var newDottedTitle = sakai.api.Util.applyThreeDots($.trim(value), 800, {
                            whole_word: false
                        }, '', true);
                        $(this).html(newDottedTitle);
                        $(window).trigger('position.inserter.sakai');
                    };
                    $(entityNameEditable).editable(nameUpdate, {
                        type: 'text',
                        onblur: 'submit',
                        event: 'openjedit.entity.sakai',
                        callback: nameCallback
                    });
                    addBindingUsedBy(context);
                    break;
            }
       };

        var prepareRenderContext = function(context) {
            if (context.context === "content") {
                if ($.isArray(sakai_global.content_profile.content_data.members.managers)) {
                    getParentGroups(getUserList, true, context);
                }

                // Collaborators are managers & editors
                var collaborators = sakai_global.content_profile.content_data.members.managers.concat(
                    sakai_global.content_profile.content_data.members.editors
                );

                sakai_global.content_profile.content_data.members.counts.collaboratorgroups = 0;
                sakai_global.content_profile.content_data.members.counts.collaboratorusers = 0;
                $.each(collaborators, function(i, collaborator) {
                    if(collaborator['sakai:group-id']){
                        sakai_global.content_profile.content_data.members.counts.collaboratorgroups++;
                    } else {
                        sakai_global.content_profile.content_data.members.counts.collaboratorusers++;
                    }
                });

                sakai_global.content_profile.content_data.members.counts.viewergroups = 0;
                sakai_global.content_profile.content_data.members.counts.viewerusers = 0;
                sakai_global.content_profile.content_data.members.counts.viewercollections = 0;
                $.each(sakai_global.content_profile.content_data.members.viewers, function(i, viewer){
                    if(viewer["sakai:group-id"] && sakai.api.Content.Collections.isCollection(viewer)){
                        sakai_global.content_profile.content_data.members.counts.viewercollections++;
                    } else if(viewer["sakai:group-id"]){
                        sakai_global.content_profile.content_data.members.counts.viewergroups++;
                    } else {
                        sakai_global.content_profile.content_data.members.counts.viewerusers++;
                    }
                });
            }
            context.sakai = sakai;
            context.entitymacros = sakai.api.Util.processLocalMacros($("#entity_macros_template"));
        };

        var renderEntity = function(context){
            prepareRenderContext(context);
            $(entityContainer).html(sakai.api.Util.TemplateRenderer("entity_" + context.context + "_template", context));
        };

        var toggleDropdownList = function(){
            $(entityChangeImage).nextAll(".s3d-dropdown-list").toggle();
            $(entityChangeImage).toggleClass("clicked");
            $(entityChangeImage).nextAll(".s3d-dropdown-list").css("top", $(".entity_profile_picture_down_arrow").position().top + 62);
        };

        var checkHash = function(context){
            if ($.bbq.getState("e") === "joinrequests" && context.context === "group" && context.data.authprofile["sakai:group-joinable"] === "withauth"){
                $(window).bind("ready.joinrequests.sakai", function(){
                    $(window).trigger("init.joinrequests.sakai", context.data.authprofile);
                });
                $(window).trigger("init.joinrequests.sakai", context.data.authprofile);
            }
        };

        var setupCountAreaBindings = function() {
            $('#entity_content_permissions').unbind("click").bind("click", function(){
                var $this = $(this);
                if ($("#entity_contentsettings_dropdown").is(":visible")) {
                    $('#entity_contentsettings_dropdown').jqmHide();
                } else {
                    $('#entity_contentsettings_dropdown').css({
                        'top': $this.offset().top + $this.height() + 5,
                        'left': $this.offset().left + $this.width() / 2 - 138
                    }).jqmShow();
                }
            });

            $('.ew_permissions').unbind("click").bind("click", function(e){
                e.preventDefault();
                if ($(this).parents('.s3d-dropdown-list').length || $(e.target).hasClass('s3d-dropdown-list-arrow-up')) {
                    $(document).trigger('init.contentpermissions.sakai', {'newPermission': $(this).data('permissionvalue') || false});
                    $('#entity_contentsettings_dropdown').jqmHide();
                }
            });

        };

        $(window).bind("sakai.entity.init", function(ev, context, type, data){
            if(data && data.data && data.data["sakai:pooled-content-file-name"]){
                data.data["sakai:pooled-content-file-name-shorter"] = sakai.api.Util.applyThreeDots(data.data["sakai:pooled-content-file-name"], 800, {
                    whole_word: false
                }, "");
            }
            renderObj = {
                "context": context,
                "type": type,
                "anon": sakai.data.me.user.anon || false,
                "data": data || {}
            };
            renderEntity(renderObj);
            addBinding(renderObj);
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

            setupCountAreaBindings();

            $(window).bind("updateParticipantCount.entity.sakai", function(ev, val){
                var num = parseInt($("#entity_participants_count").text(), 10);
                var newNum = num + val;
                $("#entity_participants_count").text(newNum);
                if (newNum === 1) {
                    $("#entity_participants_text").text(sakai.api.i18n.getValueForKey("PARTICIPANT_LC", "entity"));
                } else {
                    $("#entity_participants_text").text(sakai.api.i18n.getValueForKey("PARTICIPANTS_LC", "entity"));
                }
            });

            $("#entity_group_permissions").click(function(){
                var $this = $(this);
                if ($("#entity_groupsettings_dropdown").is(":visible")) {
                    $('#entity_groupsettings_dropdown').jqmHide();
                } else {
                    $('#entity_groupsettings_dropdown').css({
                        'top': $this.offset().top + $this.height() + 5,
                        'left': $this.offset().left + $this.width() / 2 - 138
                    }).jqmShow();
                }
            });

            sakai.api.Util.hideOnClickOut("#entity_groupsettings_dropdown", "#entity_group_permissions,.entity_permissions_icon", function(){
                $("#entity_groupsettings_dropdown").jqmHide();
            });

            sakai.api.Util.hideOnClickOut("#entity_contentsettings_dropdown", "#entity_content_permissions, .entity_permissions_icon", function(){
                $("#entity_contentsettings_dropdown").jqmHide();
            });
            
             // templateGenerator
            $('#ew_group_export_as_template_link').click(function(e){
                $(window).trigger("init.templategenerator.sakai");
                $('#entity_groupsettings_dropdown').jqmHide();
            });

            $('#ew_upload').click(function(e){
                e.preventDefault();
                $(document).trigger('init.uploadnewversion.sakai');
                $('#entity_contentsettings_dropdown').jqmHide();
            });

            $("#ew_revhistory").click(function(e){
                $(window).trigger("init.versions.sakai", {
                    pageSavePath: sakai_global.content_profile.content_data.content_path,
                    saveRef: "",
                    showByDefault: true
                });
                $('#content_profile_preview_versions_container').toggle();
                $('#entity_contentsettings_dropdown').jqmHide();
            });

            $("#ew_content_preview_delete").bind("click", function(e){
                e.preventDefault();
                window.scrollTo(0,0);
                $(document).trigger('init.deletecontent.sakai', [{
                        "paths": [sakai_global.content_profile.content_data.data._path]
                    },
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

            $(".addpeople_init").live("click", function(){
                $(window).trigger("init.addpeople.sakai", [tuid, true]);
                $("#entity_groupsettings_dropdown").jqmHide();
            });

            $(".entity_owns_actions_container .ew_permissions").live("hover", function(){
                var $dropdown = $(this).find(".s3d-dropdown-list");
                $dropdown.css("left", $(this).position().left - $dropdown.width() / 2 - 30 );
                $dropdown.css("margin-top", $(this).height() + 7 + "px");
            });

            $(entityChangeImage).click(toggleDropdownList);

            sakai.api.Util.hideOnClickOut('.entity_user_avatar_menu.s3d-dropdown-list,.entity_group_avatar_menu.s3d-dropdown-list', entityChangeImage, toggleDropdownList);

        });

        // An event to call from the worldsettings dialog so that we can
        // refresh the title if it's been saved.
        $(window).bind('updatedTitle.worldsettings.sakai', function(e, title) {
            $('#entity_name').html(sakai.api.Security.safeOutput(title));
        });

        $(window).bind("sakai.entity.updatecountcache", function(e, data){
            if(data.increment){
                $("#entity_comments_link > span").text(parseInt($("#entity_comments_link > span").text(), 10) + 1);
            } else{
                $("#entity_comments_link > span").text(parseInt($("#entity_comments_link > span").text(), 10) - 1);
            }
        });

        $(window).bind("sakai.entity.updateOwnCounts", function(e) {
           if (renderObj.data.content_path) {
                sakai.api.Content.loadFullProfile([renderObj.data.content_path], function(success,data){
                    if (success){
                        sakai.api.Content.parseFullProfile(data.results, function(parsedData){
                            if (parsedData){
                                parsedData.mode = "content";
                                renderObj.data = parsedData;
                                sakai_global.content_profile.content_data = parsedData;
                                prepareRenderContext(renderObj);
                                $("#entity_owns").html(sakai.api.Util.TemplateRenderer("entity_counts_template", renderObj));
                                setupCountAreaBindings();
                            }
                        });
                    }
                });
            }
        });

        $(window).trigger("sakai.entity.ready");

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("entity");
});
