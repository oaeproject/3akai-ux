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

require(['jquery', 'sakai/sakai.api.core', 'underscore'], function($, sakai, _) {

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
    sakai_global.addpeople = function(tuid, showSettings, widgetData) {

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var $rootel = $('#' + tuid);

        // Containers
        var $addpeopleContainer = $('#addpeople_container', $rootel);
        var $addpeopleContactsContainer = $('#addpeople_contacts_container');
        var $addpeopleSelectedContactsContainer = $('#addpeople_selected_contacts_container');
        var $addpeopleMembersAutoSuggest = $('#addpeople_members_autosuggest', $rootel);

        // Templates
        var addpeopleContactsTemplate = 'addpeople_contacts_template';
        var addpeopleSelectedContactsTemplate = 'addpeople_selected_contacts_template';

        // Elements
        var $addpeopleSelectAllContacts = $('#addpeople_select_all_contacts', $rootel);
        var addpeopleCheckbox = '.addpeople_checkbox';
        var addpeopleSelectedCheckbox = '.addpeople_selected_checkbox';
        var addpeopleSelectedPermissions = '.addpeople_selected_permissions';
        var $addpeopleSelectedAllPermissions = $('#addpeople_selected_all_permissions', $rootel);
        var $addpeopleSelectAllSelectedContacts = $('#addpeople_select_all_selected_contacts', $rootel);
        var $addpeopleFinishAdding = $('.addpeople_finish_adding', $rootel);
        var $addpeopleRemoveSelected = $('.addpeople_remove_selected', $rootel);
        var $addpeopleMembersAutoSuggestField = $('#addpeople_members_autosuggest_field', $rootel);
        var $addpeopleExistingGroup = $('.addpeople_existinggroup', $rootel);
        var $addpeopleNewGroup = $('.addpeople_newgroup', $rootel);
        var $addpeopleNoContactsNoMemberships = $('.addpeople_nocontacts_nomemberships', $rootel);

        var selectedUsers = {};
        var currentTemplate = false;
        var existingGroup = false;
        var permissionsToChange = [];
        var contactsInfinityScroll = false;

        ///////////////
        // RENDERING //
        ///////////////

        var renderContacts = function() {
            if ($addpeopleContactsContainer.text() === '') {
                var groups = sakai.api.Groups.getMemberships(sakai.data.me.groups);
                groups = groups.entry;
                if (sakai_global.group && sakai_global.group.groupData && sakai_global.group.groupData['sakai:group-id']) {
                    groups = _.reject(groups, function(group) {
                        return group['sakai:group-id'] === sakai_global.group.groupData['sakai:group-id'];
                    });
                }

                var url = sakai.config.URL.CONTACTS_FIND_STATE;
                var data = {
                    'state': 'ACCEPTED',
                    'items': '10'
                };

                // Disable the previous infinite scroll
                if (contactsInfinityScroll) {
                    contactsInfinityScroll.kill();
                }

                // Set up the infinite scroll for the list of contacts
                contactsInfinityScroll = $addpeopleContactsContainer.infinitescroll(url, data, function(items, total) {
                    $.each(items, function(index, contact) {
                        contact.profile.basic.elements.picture = sakai.api.Util.constructProfilePicture(contact.profile);
                    });
                    if ((!groups || (groups && !groups.length)) && !total) {
                        $addpeopleNoContactsNoMemberships.show();
                    }
                    return sakai.api.Util.TemplateRenderer(addpeopleContactsTemplate, {
                        'contacts': items,
                        'groups': groups,
                        'sakai': sakai
                    });
                }, false, sakai.config.URL.INFINITE_LOADING_ICON, false, false, false, false, $('#addpeople_contacts_list'), 400);
            }
        };

        var renderSelectedContacts = function() {
            var currentUserDetails = selectedUsers[sakai.data.me.user.userid];
            var currentUserRoleData = false;
            $.each(currentTemplate.roles, function(i, roleData) {
                if (currentUserDetails && currentUserDetails.permission === roleData.id) {
                    currentUserRoleData = roleData;
                    return false;
                }
            });
            if (existingGroup) {
                $.each($addpeopleSelectedAllPermissions.children(), function() {
                    var roleId = $(this).val();
                    if (!sakai.api.Groups.hasManagementRights(currentUserRoleData, roleId) && currentUserRoleData.id !== roleId) {
                        $(this).attr('disabled', 'disabled');
                    }
                });
            }
            $addpeopleSelectedContactsContainer.html(sakai.api.Util.TemplateRenderer(addpeopleSelectedContactsTemplate, {
                'currentUserRoleData':currentUserRoleData,
                'existingGroup':existingGroup,
                'contacts':selectedUsers,
                'roles': currentTemplate.roles,
                'sakai': sakai
            }));
            $addpeopleSelectedContactsContainer.prop('scrollTop',
                $addpeopleSelectedContactsContainer.prop('scrollHeight'));
            enableDisableControls(true);
        };


        /////////////
        // UTILITY //
        /////////////

        var enableDisableControls = function(disable) {
            if (disable) {
                $addpeopleRemoveSelected.attr('disabled','disabled');
                $addpeopleSelectedAllPermissions.attr('disabled','disabled');
            }else{
                $addpeopleRemoveSelected.removeAttr('disabled');
                $addpeopleSelectedAllPermissions.removeAttr('disabled');
            }
        };

        var decideEnableDisableControls = function(el) {
            if ($('.' + el.currentTarget.className + ':checked').length) {
                enableDisableControls(false);
            }else{
                enableDisableControls(true);
            }
            $addpeopleSelectAllSelectedContacts.removeAttr('checked');
        };

        /**
         * Generates an error message that lists the available management roles
         * that the group needs at least one user to be in
         * @return {String} errorMsg A string containing the error message
         */
        var generateExistingGroupError = function() {
            var roles = currentTemplate.roles;
            var manageRoles = [];
            $.each(roles, function(i,role) {
                if (role.isManagerRole) {
                    manageRoles.push(role.title);
                }
            });
            var manageRoleSelections = false;
            var doubleQuote = sakai.api.i18n.getValueForKey('DOUBLE_QUOTE');
            if (manageRoles.length > 1) {
                $.each(manageRoles, function(m, manageRole) {
                    if (!manageRoleSelections) {
                        manageRoleSelections = doubleQuote + manageRole + doubleQuote;
                    } else if ((parseInt(m, 10) + 1) === manageRoles.length) {
                        manageRoleSelections = manageRoleSelections + ' ' + sakai.api.i18n.getValueForKey('OR') + ' ' + doubleQuote + manageRole + doubleQuote;
                    } else {
                        manageRoleSelections = manageRoleSelections + ', ' + doubleQuote + manageRole + doubleQuote;
                    }
                });
            } else {
                manageRoleSelections = doubleQuote + manageRoles[0] + doubleQuote;
            }
            errorMsg = sakai.api.i18n.getValueForKey('THIS_GROUP_MUST_HAVE_AT_LEAST_ONE_MANAGER', 'addpeople');
            errorMsg = errorMsg.replace('${groupType}', sakai.api.i18n.getValueForKey(currentTemplate.title));
            errorMsg = errorMsg.replace('${managerRole}', manageRoleSelections);
            return errorMsg;
        };

        /**
         * Fire an event that indicates the addpeople widget is done adding users.
         * The object containing this userdata is giving to the event
         * Also hide the overlay
         */
        var finishAdding = function() {
            var managerSelected = false;
            permissionsToChange = [];
            var newUsers = [];
            $.each(selectedUsers, function(index, user) {
                if (user.originalPermission && user.permission !== user.originalPermission) {
                    permissionsToChange.push(user);
                }

                if (!user.originalPermission) {
                    newUsers.push(user);
                }

                $.each(currentTemplate.roles, function(i, role) {
                    if (user.permission === role.title || user.permission === role.id) {
                        user.permission = role.id;
                        user.permissionTitle = role.title;
                        if (role.isManagerRole) {
                            managerSelected = true;
                        }
                    }
                });
            });
            if (managerSelected || !sakai_global.group) {
                $(window).trigger('toadd.addpeople.sakai', [tuid.replace('addpeople', ''), newUsers]);
                if (sakai_global.group) {
                    $.each(newUsers, function(index, user) {
                        var groupTitle = sakai.api.Security.safeOutput(sakai_global.group.groupData['sakai:group-title']);
                        var groupID = sakai_global.group.groupData['sakai:group-id'];
                        var displayName = sakai.api.User.getDisplayName(sakai.data.me.profile);
                        var subject = sakai.api.i18n.getValueForKey('USER_HAS_ADDED_YOU_AS_A_ROLE_TO_THE_EXISTING_GROUP_GROUPNAME', 'addpeople').replace('${user}', displayName).replace('${role}', user.permissionTitle).replace('${groupName}', groupTitle);
                        var body = $('#addpeople_message_template', $rootel).text().replace('${role}', user.permissionTitle).replace('${firstname}', user.name).replace('${user}', sakai.api.User.getDisplayName(sakai.data.me.profile)).replace('${groupURL}', sakai.config.SakaiDomain + '/~' + groupID).replace('${groupName}', groupTitle);
                        sakai.api.Communication.sendMessage(user.userid, sakai.data.me, subject, body, 'message', false, false, true, 'group_invitation');
                    });
                    if (permissionsToChange.length || newUsers.length) {
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('MANAGE_PARTICIPANTS', 'addpeople'), sakai.api.i18n.getValueForKey('NEW_SETTINGS_HAVE_BEEN_APPLIED', 'addpeople'));
                    }
                }
                sakai.api.Util.Modal.close($addpeopleContainer);
            } else {
                var errorMsg = sakai.api.i18n.getValueForKey('SELECT_AT_LEAST_ONE_MANAGER', 'addpeople');
                if (existingGroup && sakai_global.group) {
                    errorMsg = generateExistingGroupError();
                }
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('MANAGE_PARTICIPANTS', 'addpeople'), errorMsg);
            }
        };

        /**
         * Check/Uncheck all items in the list and enable/disable buttons
         */
        var checkAll = function(el, peopleContainer) {
            if ($(el).is(':checked')) {
                $(peopleContainer + ':not(:disabled)').attr('checked','checked');
                if (peopleContainer !== addpeopleSelectedCheckbox) {
                    $(peopleContainer).change();
                    renderSelectedContacts();
                }else{
                    enableDisableControls(false);
                }
            }else{
                $(peopleContainer).removeAttr('checked');
                if (peopleContainer !== addpeopleSelectedCheckbox) {
                    $(peopleContainer).removeAttr('checked');
                    $(peopleContainer).change();
                    renderSelectedContacts();
                    $addpeopleSelectAllSelectedContacts.removeAttr('checked');
                } else {
                    enableDisableControls(true);
                }
            }
        };

        /**
         * Construct a user object when adding a user to the list of selected users
         */
        var constructSelecteduser = function() {
            $addpeopleSelectAllSelectedContacts.removeAttr('checked');
            var selectedId = $(this).attr('data-userid');
            if ($(this).is(':checked')) {
                if (!selectedUsers[selectedId]) {
                    var userObj = {
                        userid: selectedId,
                        roleid: $(this).val(),
                        name: $(this).nextAll('.s3d-entity-displayname').text(),
                        firstName: $(this).attr('data-user-firstname'),
                        dottedname: sakai.api.Util.applyThreeDots($(this).nextAll('.s3d-entity-displayname').text(), 100, null, 's3d-entity-displayname s3d-regular-links s3d-bold'),
                        permission: currentTemplate.joinRole,
                        picture: $(this).next().children('img').attr('src'),
                        tmpsrc:'checklistadded'
                    };
                    selectedUsers[userObj.userid] = userObj;
                    renderSelectedContacts();
                }
            } else {
                delete selectedUsers[selectedId];
                renderSelectedContacts();
                $addpeopleSelectAllSelectedContacts.removeAttr('checked');
                $addpeopleSelectAllContacts.removeAttr('checked');
            }
        };

        /**
         * Batch change the permission setting for a specific selection of users
         */
        var changeSelectedPermission = function() {
            var selectedPermission = $(this).val();
            var selectedPermissionTitle = $(this).find('option:selected').text();
            $.each($addpeopleSelectedContactsContainer.find('input:checked'), function(index, item) {
                $(item).nextAll('select').val(selectedPermission);
                var selectedId = $(item).attr('data-userid');
                selectedUsers[selectedId].permission = selectedPermission;
                selectedUsers[selectedId].permissionTitle = selectedPermissionTitle;
            });
        };

        /**
         * Change the permission setting for a specific user
         */
        var changePermission = function() {
            var userid = $(this).attr('data-userid');
            selectedUsers[userid].permission = $(this).val();
            selectedUsers[userid].permissionTitle = $(this).find('option:selected').text();
        };

        /**
         * Removes all users that are selected from the list of users to be added as a member (manager or viewer)
         */
        var removeSelected = function() {
            var managerLeft = false;
            $.each($addpeopleSelectedContactsContainer.find('input:not(:checked)'), function(index, user) {
                $.each(currentTemplate.roles, function(i, role) {
                    if (role.isManagerRole) {
                        if ($(user).nextAll('select').val() === role.id) {
                            managerLeft = true;
                        }
                    }
                });
            });
            if (managerLeft || !sakai_global.group) {
                var usersToDelete = [];
                $.each($addpeopleSelectedContactsContainer.find('input:checked'), function(index, item) {
                    var selectedId = $(item).attr('data-userid');
                    usersToDelete.push({
                        'userid': selectedId,
                        'permission': $(item).nextAll('select').val()
                    });
                    delete selectedUsers[selectedId];
                    $('#' + selectedId + '_chk').removeAttr('checked');
                    $addpeopleSelectAllContacts.removeAttr('checked');
                    $(item).parent().next().remove();
                    $(item).parent().remove();
                });
                if (sakai_global.group) {
                    sakai.api.Groups.removeUsersFromGroup(sakai_global.group.groupData['sakai:group-id'], usersToDelete, sakai.data.me);
                }
                $addpeopleSelectAllSelectedContacts.removeAttr('checked');
            } else {
                var errorMsg = sakai.api.i18n.getValueForKey('SELECT_AT_LEAST_ONE_MANAGER', 'addpeople');
                if (existingGroup && sakai_global.group) {
                    errorMsg = generateExistingGroupError();
                }
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('MANAGE_PARTICIPANTS', 'addpeople'), errorMsg);
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
            var pictureURL = userData.attributes.picture;
            var userid = userData.attributes.value;
            var userObj = {
                userid: userid,
                firstName: userData.attributes.firstName,
                name: userData.attributes.name,
                dottedname: sakai.api.Util.applyThreeDots(userData.attributes.name, 100, null, 's3d-entity-displayname s3d-regular-links s3d-bold', true),
                permission: currentTemplate.joinRole,
                picture: pictureURL,
                tmpsrc:'autsuggestadded'
            };
            selectedUsers[userObj.userid] = userObj;
            renderSelectedContacts();
            $('.as-close', $addpeopleContainer).click();
        };


        /**
         * Clears the input field, closes the autosuggest and then hides the modal/overlay, called onHide in jqm
         */
        var resetAutosuggest = function(h) {
            sakai.api.Util.AutoSuggest.reset($addpeopleMembersAutoSuggestField);
            $('ul',$addpeopleSelectedContactsContainer).empty();
            $(addpeopleCheckbox).add($addpeopleSelectAllContacts).removeAttr('checked');
            h.w.hide();
            if (h.o) {
                h.o.remove();
            }
        };

        var prepareSelectedContacts = function(success, data) {
            data = data[sakai_global.group.groupData['sakai:group-id']];

            for (var role in data) {
                for (var user in data[role].results) {
                    if (data[role].results.hasOwnProperty(user)) {
                        var userObj = {};
                        if (data[role].results[user].hasOwnProperty('sakai:group-id')) {
                            userObj = {
                                userid: data[role].results[user]['sakai:group-id'],
                                name: data[role].results[user]['sakai:group-title'],
                                dottedname: sakai.api.Util.applyThreeDots(data[role].results[user]['sakai:group-title'], 100, null, 's3d-entity-displayname s3d-regular-links s3d-bold', true)
                            };
                        } else {
                            userObj = {
                                userid: data[role].results[user]['rep:userId'],
                                name: sakai.api.User.getDisplayName(data[role].results[user]),
                                firstName: sakai.api.User.getFirstName(data[role].results[user]),
                                dottedname: sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(data[role].results[user]), 100, null, 's3d-entity-displayname s3d-regular-links s3d-bold', true)
                            };
                        }
                        for (var i = 0; i < currentTemplate.roles.length; i++) {
                            if (currentTemplate.roles[i].id === role) {
                                userObj.permission = currentTemplate.roles[i].id;
                                userObj.originalPermission = currentTemplate.roles[i].id;
                                userObj.permissionTitle = role;
                            }
                        }
                        if (data[role].results[user]['sakai:group-id']) {
                            userObj.picture = sakai.api.Groups.getProfilePicture(data[role].results[user]);
                        } else {
                            userObj.picture = sakai.api.User.getProfilePicture(data[role].results[user]);
                        }
                        selectedUsers[userObj.userid] = userObj;
                    }
                }
            }
            renderSelectedContacts();
        };

        var fetchMembers = function() {
            sakai.api.Groups.getMembers(sakai_global.group.groupData['sakai:group-id'], prepareSelectedContacts, true, true);
        };

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function() {
            sakai.api.Util.Modal.setup($addpeopleContainer, {
                modal: true,
                overlay: 20,
                toTop: true,
                onHide: resetAutosuggest
            });
        };

        var showDialog = function() {
            sakai.api.Util.Modal.open($addpeopleContainer);
        };

        var addBinding = function() {
            // Unbind all
            $addpeopleFinishAdding.off('click', finishAdding);
            $addpeopleRemoveSelected.off('click', removeSelected);

            // Bind all
            $addpeopleSelectAllContacts.on('click', function() {
                checkAll(this, addpeopleCheckbox);
            });
            $addpeopleSelectAllSelectedContacts.on('click', function() {
                checkAll(this, addpeopleSelectedCheckbox);
            });
            $(addpeopleSelectedCheckbox).on('change', decideEnableDisableControls);
            $addpeopleSelectedAllPermissions.on('change', changeSelectedPermission);
            $addpeopleContainer.off('change', addpeopleCheckbox).on('change', addpeopleCheckbox, constructSelecteduser);
            $(addpeopleSelectedPermissions).off('change').on('change', changePermission);
            $addpeopleFinishAdding.on('click', finishAdding);
            $addpeopleRemoveSelected.on('click', removeSelected);

            $(window).on('usersselected.addpeople.sakai', function(e) {
                if (permissionsToChange.length) {
                    $(window).trigger('usersswitchedpermission.addpeople.sakai', [tuid.replace('addpeople', ''), permissionsToChange]);
                }
            });
        };

        var loadRoles = function(callback) {
            if (sakai_global.selecttemplate && sakai_global.selecttemplate.currentTemplate) {
                currentTemplate = sakai_global.selecttemplate.currentTemplate;
                $('#addpeople_selected_all_permissions', $rootel).html(
                    sakai.api.Util.TemplateRenderer('addpeople_selected_permissions_template', {
                        'roles': currentTemplate.roles,
                        'sakai': sakai
                    })
                );
                if ($.isFunction(callback)) {
                    callback();
                }
            } else {
                sakai.api.Groups.getTemplate(widgetData.category, widgetData.id, function(success, template) {
                    if (success) {
                        currentTemplate = $.extend(true, {}, template);
                        if ($.isEmptyObject(currentTemplate) && sakai_global.group &&
                             sakai_global.group.groupData && sakai_global.group.groupData['sakai:roles']) {
                            var groupData = $.extend( true, {}, sakai_global.group.groupData );
                            groupData.roles = $.parseJSON(sakai_global.group.groupData['sakai:roles']);
                            currentTemplate.roles = sakai.api.Groups.getRoles(groupData, true);
                            currentTemplate.joinRole = groupData['sakai:joinRole'];
                        } else if (!$.isEmptyObject(currentTemplate)) {
                            currentTemplate.roles = sakai.api.Groups.getRoles(currentTemplate, true);
                        } else {
                            debug.error('Unable to find any suitable roles');
                        }

                        $('#addpeople_selected_all_permissions', $rootel).html(
                            sakai.api.Util.TemplateRenderer('addpeople_selected_permissions_template', {
                                'roles': currentTemplate.roles,
                                'sakai': sakai
                            })
                        );

                        if ($.isFunction(callback)) {
                            callback();
                        }
                    } else {
                        debug.error('Could not get the group template');
                    }
                });
            }
        };

        var fetchGroupsAndUsersData = function(defaultMembers, callback) {
            var batchRequests = [];

            $.each(defaultMembers, function(i, member) {
                batchRequests.push({
                    'url': '/~' + member + '/public/authprofile.profile.json',
                    'method': 'GET',
                    'parameters': {}
                });
            });

            sakai.api.Server.batch(batchRequests, function(success, data) {
                if (success) {
                    $.each(data.results, function(i, result) {
                        result = $.parseJSON(result.body);
                        var picture = '';
                        if (result && result.picture) {
                            picture = '/~' + sakai.api.Util.safeURL(result.userid || result['sakai:group-id']) + '/public/profile/' + sakai.api.Util.safeURL($.parseJSON(result.picture).name);
                        } else {
                            if (result.userid) {
                                picture = sakai.api.User.getProfilePicture(result);
                            }else{
                                picture = sakai.api.Groups.getProfilePicture(result);
                            }
                        }
                        var name = '';
                        var dottedname = '';
                        if (result['sakai:group-title']) {
                            name = result['sakai:group-title'];
                            dottedname = sakai.api.Util.applyThreeDots(name, 100, null, 's3d-entity-displayname s3d-regular-links s3d-bold', true);
                        } else {
                            name = sakai.api.User.getDisplayName(result);
                            dottedname = sakai.api.Util.applyThreeDots(name, 100, null, 's3d-entity-displayname s3d-regular-links s3d-bold', true);
                        }
                        var userObj = {
                            userid: result.userid || result['sakai:group-id'],
                            name: name,
                            dottedname: dottedname,
                            permission: currentTemplate.joinRole,
                            picture: picture
                        };
                        selectedUsers[userObj.userid] = userObj;
                    });
                    renderSelectedContacts();
                    $(window).trigger('toadd.addpeople.sakai', [tuid.replace('addpeople', ''), selectedUsers]);
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            });
        };

        ////////////
        // EVENTS //
        ////////////

        /**
         * Continue the initialization
         * @param {Object} options The different options we want to pass through.
         * e.g.{
         *         editingGroup: false, // if you're editing a group
         *         openDialog: true // open the dialog or not
         *     }
         */
        var continueInit = function(options) {
                existingGroup = options.editingGroup;
                if (!widgetData && options.editingGroup) {
                    widgetData = {
                        'category': sakai_global.group.groupData['sakai:category'],
                        'id': sakai_global.group.groupData['sakai:templateid']
                    };
                }
                loadRoles();
                addBinding();
                var autoSuggestOpts = {
                    'asHtmlID': tuid,
                    'resultClick':createAutoSuggestedUser,
                    searchObjProps: 'name,value'
                };
                sakai.api.Util.AutoSuggest.setup($addpeopleMembersAutoSuggestField, autoSuggestOpts, function() {
                    $addpeopleMembersAutoSuggest.show();
                });
                initializeJQM();
                renderSelectedContacts();
                if (sakai_global.group) {
                    fetchMembers();
                }
                if (existingGroup) {
                    $addpeopleNewGroup.hide();
                    $addpeopleExistingGroup.show();
                }
                if (options.openDialog) {
                    showDialog();
                    renderContacts();
                }
        };

        $(document).on('init.addpeople.sakai', function(e, options) {
            options = $.extend({
                editingGroup: false,
                openDialog: true
            }, options);
            if (sakai_global.selecttemplate &&
                sakai_global.selecttemplate.currentTemplate &&
                sakai_global.selecttemplate.currentTemplate.id !== currentTemplate.id) {
                selectedUsers = {};
            }
            if (!sakai_global.group) {
                loadRoles(function() {
                    var defaultMembers = $.bbq.getState('members') || [];
                    if (defaultMembers.length) {
                        defaultMembers = defaultMembers.split(',');
                        defaultMembers = _.without(defaultMembers, sakai.data.me.user.userid);
                        fetchGroupsAndUsersData(defaultMembers, function() {
                            continueInit(options);
                        });
                    } else {
                        continueInit(options);
                    }
                });
            } else {
                continueInit(options);
            }
        });
    };
    sakai.api.Widgets.widgetLoader.informOnLoad('addpeople');

});
