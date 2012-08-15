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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js (autoSuggest)
 */
/*global $ */

// Namespaces
require(['jquery', 'sakai/sakai.api.core', 'underscore', '/dev/javascript/content_profile.js'], function($, sakai, _) {

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
    sakai_global.contentpermissions = function(tuid, showSettings) {

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var contentpermissionsSelectable = '.contentpermissions_selectable > input';
        var contentData = sakai_global.content_profile.content_data;
        var contentPermissionsEditList = 'li.contentpermissions_edit';
        var contentpermissionsMemberPermissions = '.contentpermissions_member_permissions';
        var contentpermissionsShareMessageTemplate = 'contentpermissions_share_message_template';

        var $contentpermissionsMembersAutosuggest = false;
        var globalPermissionsChanged = false;
        var defaultPermissionPassed = false;
        var changesMade = false;
        var visibility = 'selected';
        var visibilityindex = {
            'public': 1,
            'everyone': 2,
            'private': 3
        };

        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        /**
         * Closes the widget overlay
         */
        var closeOverlay= function() {
            sakai.api.Util.Modal.close('#contentpermissions_container');
            sakai.api.Util.Modal.close('#contentpermissions_warning_container');
        };

        var showWarning = function() {
            var newVisibilityVal = $.trim($('#contentpermissions_see_container input:checked').val());
            if (visibility === newVisibilityVal || visibilityindex[newVisibilityVal] > visibilityindex[visibility] || newVisibilityVal === 'selected') {
                doSave();
            } else {
                $('#contentpermissions_warning_container_text').html(sakai.api.Util.TemplateRenderer('contentpermissions_warning_container_text_template', {
                    'visibility': newVisibilityVal,
                    'content': sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name']
                }));
                sakai.api.Util.Modal.open('#contentpermissions_warning_container');
            }
        };

        /**
         * Updates the global content object with the changed membership data
         * @param {String} authId The ID for the user/group that has changed membership
         * @param {String} oldPermission The users old permission
         * @param {String} newPermission The users new permission (optional)
         */
        var updateContentPermissionData = function(authId, oldPermission, newPermission) {
            var userData = false;
            var index = false;
            if (oldPermission !== newPermission && sakai_global.content_profile.content_data.members[oldPermission]) {
                $.each(sakai_global.content_profile.content_data.members[oldPermission], function(i, userObject) {
                    if (userObject.userid && userObject.userid === authId) {
                        index = i;
                        userData = userObject;
                    } else if (userObject.groupid && userObject.groupid === authId) {
                        index = i;
                        userData = userObject;
                    }
                });
                if (userData && sakai_global.content_profile.content_data.members[oldPermission]) {
                    sakai_global.content_profile.content_data.members[oldPermission].splice(index, 1);
                    if (newPermission && sakai_global.content_profile.content_data.members[newPermission]) {
                        sakai_global.content_profile.content_data.members[newPermission].push(userData);
                    }
                }
            }
        };

        /**
         * Saves permissions for each individual member in the list of members
         */
        var saveMemberPermissions = function() {
            var permissionBatch = [];
            var atLeastOneManager = false;
            var savePermissions = false;
            var permissionsToUpdate = [];

            if (sakai.api.Content.Collections.isCollection(sakai_global.content_profile.content_data.data)) {
                var groupID = sakai.api.Content.Collections.getCollectionGroupId(sakai_global.content_profile.content_data.data);
                $(contentPermissionsEditList).each(function(index, item) {
                    var newPermission = $(item).children(contentpermissionsMemberPermissions).val();
                    var oldPermission = $(item).attr('data-originalpermission');
                    var userId = $(item).attr('id').split('_')[1];
                    if (newPermission === 'manager') {
                        atLeastOneManager = true;
                    }
                    var addToCollectionPseudoGroup = 'members';
                    var removeFromCollectionPseudoGroups = ['managers', 'editors'];
                    if (newPermission === 'manager') {
                        addToCollectionPseudoGroup = 'managers';
                        removeFromCollectionPseudoGroups = ['editors', 'members'];
                    } else if (newPermission === 'editor') {
                        addToCollectionPseudoGroup = 'editors';
                        removeFromCollectionPseudoGroups = ['managers', 'members'];
                    }
                    permissionBatch.push({
                        'url': '/system/userManager/group/' + groupID + '-' + addToCollectionPseudoGroup + '.update.json',
                        'method': 'POST',
                        'parameters': {
                            ':member': userId,
                            ':viewer': userId
                        }
                    });
                    $.each(removeFromCollectionPseudoGroups, function(idx, group) {
                        permissionBatch.push({
                            'url': '/system/userManager/group/' + groupID + '-' + group + '.update.json',
                            'method': 'POST',
                            'parameters': {
                                ':member@Delete': userId,
                                ':viewer@Delete': userId
                            }
                        });
                    });
                    permissionsToUpdate.push({
                        'authId': userId,
                        'oldPermission': oldPermission,
                        'newPermission': newPermission + 's'
                    });
                });
            } else {
                $(contentPermissionsEditList).each(function(index, item) {
                    var newPermission = $(item).children(contentpermissionsMemberPermissions).val();
                    var oldPermission = $(item).attr('data-originalpermission');
                    var userId = $(item).attr('id').split('_')[1];
                    if (newPermission === 'manager') {
                        atLeastOneManager = true;
                        permissionBatch.push({
                            'url': '/p/' + sakai_global.content_profile.content_data.data['_path'] + '.members.json',
                            'method': 'POST',
                            'parameters': {
                                ':manager': userId,
                                ':editor@Delete': userId,
                                ':viewer@Delete': userId
                            }
                        });
                    } else if (newPermission === 'editor') {
                        permissionBatch.push({
                            'url': '/p/' + sakai_global.content_profile.content_data.data['_path'] + '.members.json',
                            'method': 'POST',
                            'parameters': {
                                ':editor': userId,
                                ':viewer@Delete': userId,
                                ':manager@Delete': userId
                            }
                        });
                    } else {
                        permissionBatch.push({
                            'url': '/p/' + sakai_global.content_profile.content_data.data['_path'] + '.members.json',
                            'method': 'POST',
                            'parameters': {
                                ':viewer': userId,
                                ':editor@Delete': userId,
                                ':manager@Delete': userId
                            }
                        });
                    }
                    permissionsToUpdate.push({
                        'authId': userId,
                        'oldPermission': oldPermission,
                        'newPermission': newPermission + 's'
                    });
                });
            }

            if (atLeastOneManager) {
                // Do the Batch request
                sakai.api.Server.batch(permissionBatch, function(success, data) {
                    if (globalPermissionsChanged) {
                        if (sakai.api.Content.Collections.isCollection(sakai_global.content_profile.content_data.data)) {
                            sakai.api.Content.Collections.setCollectionPermissions(sakai_global.content_profile.content_data.data['_path'], sakai_global.content_profile.content_data.data['sakai:permissions'], finishSavePermissions);
                        } else {
                            sakai.api.Content.setFilePermissions([{
                                'hashpath': sakai_global.content_profile.content_data.data['_path'],
                                'permissions': sakai_global.content_profile.content_data.data['sakai:permissions']
                            }], finishSavePermissions);
                        }
                    } else {
                        finishSavePermissions();
                    }
                    $.each(permissionsToUpdate, function(i, permissionData) {
                        updateContentPermissionData(
                            permissionData.authId,
                            permissionData.oldPermission,
                            permissionData.newPermission);
                    });
                });
            } else {
                if (!globalPermissionsChanged) {
                    closeOverlay();
                } else {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('CANNOT_SAVE_SETTINGS', 'contentpermissions'),
                        sakai.api.i18n.getValueForKey('THERE_SHOULD_BE_AT_LEAST_ONE_MANAGER', 'contentpermissions'));
                }
            }
        };

        var finishSavePermissions = function() {
            closeOverlay();
            if (globalPermissionsChanged || changesMade) {
                $(window).trigger('sakai.entity.ready');
                sakai.api.Util.notification.show($('#contentpermissions_permissions').text(), $('#contentpermissions_permissionschanged').text());
            }
        };

        /**
         * Saves the global permissions for the widget
         */
        var doSave = function() {
            var newPermissions = $('#contentpermissions_see_container input:checked').val();
            var dataObj = {
                'sakai:permissions': newPermissions
            };
            globalPermissionsChanged = sakai_global.content_profile.content_data.data['sakai:permissions'] !== newPermissions;
            if (globalPermissionsChanged) {
                $.ajax({
                    url: sakai_global.content_profile.content_data.path + '.json',
                    type: 'POST',
                    data: dataObj,
                    success: function() {
                        sakai_global.content_profile.content_data.data['sakai:permissions'] = newPermissions;
                        saveMemberPermissions();
                    }
                });
            } else {
                saveMemberPermissions();
            }
        };

        /**
         * Deletes a user from the list of members by deleting the user from the content and removing permissions
         */
        var doDelete = function() {
            var userid = $(this).attr('data-sakai-entityid');
            var originalpermission = $(this).parent().attr('data-originalpermission');
            var manager = originalpermission === 'managers';
            var editor = originalpermission === 'editors';
            var $itemToDelete = $(this).parent();
            var userToDelete = {};

            if (sakai_global.content_profile.content_data.members.managers.length > 1 || !manager) {

                if (sakai.api.Content.Collections.isCollection(sakai_global.content_profile.content_data.data)) {
                    var userObj = [
                        {
                            'permission': 'managers',
                            'userid': userid
                        },
                        {
                            'permission': 'editors',
                            'userid': userid
                        },
                        {
                            'permission': 'members',
                            'userid': userid
                        }
                    ];
                    sakai.api.Groups.removeUsersFromGroup(sakai.api.Content.Collections.getCollectionGroupId(sakai_global.content_profile.content_data.data), userObj, sakai.data.me, function() {
                        $itemToDelete.remove();
                    });
                } else {
                    if (manager) {
                        userToDelete = {
                            ':manager@Delete': userid
                        };
                    } else if (editor) {
                        userToDelete = {
                            ':editor@Delete': userid
                        };
                    } else {
                        userToDelete = {
                            ':viewer@Delete': userid
                        };
                    }
                }

                // Do the Batch request
                $.ajax({
                    url: '/p/' + sakai_global.content_profile.content_data.data['_path'] + '.members.json',
                    type: 'POST',
                    data: userToDelete,
                    success: function() {
                        $itemToDelete.remove();
                        updateContentPermissionData(userid, originalpermission);
                    }
                });
                changesMade = true;
            } else {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('CANNOT_DELETE_USERS', 'contentpermissions'), sakai.api.i18n.getValueForKey('THERE_SHOULD_BE_AT_LEAST_ONE_MANAGER', 'contentpermissions'));
            }
        };

        /**
         * Checks the data for duplicate users/groups and removes the duplicate; gives preference to the user/group with edit permissions
         * n.b. duplicates were being introduced via the sharing widget which will be addressed, so this sanity check will ultimately be optional
         * but might be good to have (if it doesn't affect performance) in case any new widgets make the same mistake...
         */
        var removeDuplicateUsersGroups = function(data) {
            if (!data || !data.members) {
                return data;
            }
            var tmpManagers = {};
            var managers = data.members.managers || [];
            var ml = managers.length;
            var tmpEditors = {};
            var editors = data.members.editors || [];
            var el = editors.length;
            var tmpViewers = {};
            var viewers = data.members.viewers || [];
            var vl = viewers.length;
            for (var i = 0; i < ml; i++) { //though unlikely, this will remove any duplicates within the manager permission
                tmpManagers[managers[i].userid || managers[i].groupid] = managers[i];
            }
            for (var k = 0; k < el; k++) { //if the editor is a manager, don't add them. Also removes duplicates within viewer permissions
                if (!tmpManagers[editors[k].userid || editors[k].groupid]) {
                    tmpEditors[editors[k].userid || editors[k].groupid] = editors[k];
                }
            }
            for (var j = 0; j < vl; j++) { //if the viewer is a manager or editor, don't add them. Also removes duplicates within viewer permissions
                if (!tmpManagers[viewers[j].userid || viewers[j].groupid] && !tmpEditors[viewers[j].userid || viewers[j].groupid]) {
                    tmpViewers[viewers[j].userid || viewers[j].groupid] = viewers[j];
                }
            }
            var sortById = function(a, b) {
                var x = (a.userid || a.groupid).toLowerCase();
                var y = (b.userid || b.groupid).toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            };

            data.members.managers = _.toArray(tmpManagers).sort(sortById);
            data.members.editors = _.toArray(tmpEditors).sort(sortById);
            data.members.viewers = _.toArray(tmpViewers).sort(sortById);
            return data;
        };

        /**
         * Get the list of selected users/groups from the autosuggest plugin
         * @return {Object} returnValue An object containing a list of displayNames and an Array of userID's to be added to the members list
         */
        var getSelectedList = function() {
            var list = $('#as-values-' + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(',');
            var removed = 0;
            $(list).each(function(i, val) {
               if (val === '') {
                   list.splice(i - removed, 1);
                   removed += 1;
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $('#contentpermissions_container .as-selection-item').each(function() {
                // In IE 7 </A> is returned and in firefox </a>
                toAddNames.push($(this).html().split(/<\/[aA]?>/g)[1]);
            });

            var returnValue = {'list':list, 'toAddNames':toAddNames};

            return returnValue;
        };

        /**
         * Callback function used by the autosuggest plugin after an item is added to the autosuggest list
         * Function renders and shows the default message that's being sent upon sharing
         */
        var addedUserGroup = function() {
            if (!$('#contentpermissions_members_autosuggest_text').is(':visible')) {
                $('#contentpermissions_members_autosuggest_text').html(sakai.api.Util.TemplateRenderer(contentpermissionsShareMessageTemplate, {
                    'filename': sakai.api.Security.safeOutput(sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name']),
                    'path': window.location,
                    'user': sakai.api.User.getDisplayName(sakai.data.me.profile)
                }));
                $('.contentpermissions_buttons').hide();
                $('#contentpermissions_members_autosuggest_container').show();
                $('#contentpermissions_members_list').hide();
                $('#contentpermissions_members_autosuggest_permissions').removeAttr('disabled');
            }
        };

        /**
         * Removes a user or group from the autosuggest input field and
         * hides the message box if no other users or groups are present
         */
        var removedUserGroup = function(elem) {
            elem.remove();
            if (getSelectedList().list.length === 0) {
                hideShare();
            }
        };

        /**
         * Hide the share message box and show the list of people the content
         * has been shared with again
         */
        var hideShare = function() {
            sakai.api.Util.AutoSuggest.reset($contentpermissionsMembersAutosuggest);
            $('.contentpermissions_buttons').show();
            $('#contentpermissions_members_autosuggest_container').hide();
            $('#contentpermissions_members_list').show();
            $('#contentpermissions_members_autosuggest_permissions').attr('disabled', 'disabled');
        };

        /**
         * Renders the list of members and their permissions in the widget
         */
        var renderMemberList = function() {
            $('.contentpermissions_buttons').show();
            sakai.api.Util.TemplateRenderer('contentpermissions_content_template', {
                title: sakai.api.Util.Security.safeOutput(sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name']),
                contentData: removeDuplicateUsersGroups(contentData),
                sakai: sakai,
                defaultPermission: defaultPermissionPassed
            }, $('#contentpermissions_content_container'));
        };

        /**
         * Share the piece of content with a user by adding the user to the list of members (manager or viewer)
         */
        var doShare = function() {
            $(window).off('ready.contentprofile.sakai', doInit);
            $(window).on('ready.contentprofile.sakai', doInit);
            var userList = getSelectedList();
            $(window).trigger('finished.sharecontent.sakai', [
                userList, $.trim($('#contentpermissions_members_autosuggest_text').val()), {
                    data: [{
                        body: sakai_global.content_profile.content_data.data
                    }]
                }, $('#contentpermissions_members_autosuggest_permissions').val()
            ]);
            changesMade = true;
        };

        /**
         * Gets the list of member users and groups from sakai_global and returns an array of userIds/groupIds to pass to autosuggest for filtering out
         * @return {Array} Array of users and groups to populate the autosuggest field with
         */
        var autosuggestFilterUsersGroups = function() {
            var filterlist = [];
            var filterUsersGroups = sakai_global.content_profile.content_data.members.managers
                .concat(sakai_global.content_profile.content_data.members.viewers, sakai_global.content_profile.content_data.members.editors);
            $.each(filterUsersGroups,function(i,val) {
                filterlist.push(val.userid || val.groupid);
            });
            return filterlist;
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Add binding to various elements in the content permissions widget
         */
        var addBinding = function() {
            $('#contentpermissions_container').on('click', contentpermissionsSelectable, function() {
                $('#contentpermissions_see_container .s3d-outer-shadow-container').addClass('contentpermissions_unselected_rbt');
                $(contentpermissionsSelectable).parent().removeClass('s3d-outer-shadow-container');
                $(this).parent().addClass('s3d-outer-shadow-container');
                $(this).parent().removeClass('contentpermissions_unselected_rbt');
            });

            $('#contentpermissions_container').on('click', '.contentpermissions_permissions_container .s3d-actions-delete', doDelete);
            $('#contentpermissions_container').on('click', '#contentpermissions_apply_permissions', showWarning);
            $('#contentpermissions_container').on('click', '#contentpermissions_members_autosuggest_sharebutton', doShare);
            $(document).on('click', '#contentpermissions_members_autosuggest_cancelbutton', hideShare);
        };

        /**
         * Show the content permissions overlay
         */
        var initializeOverlay = function() {
            sakai.api.Util.Modal.setup('#contentpermissions_container', {
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 11000
            });
            sakai.api.Util.Modal.setup('#contentpermissions_warning_container', {
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 12000
            });
            sakai.api.Util.Modal.open('#contentpermissions_container');
        };

        /**
         * Initializes the content permission widget and invokes the overlay
         */
        var doInit = function() {
            $(window).off('ready.contentprofile.sakai', doInit);
            contentData = sakai_global.content_profile.content_data;
            visibility = contentData.data['sakai:permissions'];
            globalPermissionsChanged = false;
            changesMade = false;
            renderMemberList();
            $contentpermissionsMembersAutosuggest = $('#contentpermissions_members_autosuggest');
            sakai.api.Util.AutoSuggest.setup($contentpermissionsMembersAutosuggest, {
                'asHtmlID': tuid,
                'selectionAdded':addedUserGroup,
                'selectionRemoved':removedUserGroup,
                'filterUsersGroups':autosuggestFilterUsersGroups()
            });
            $('#contentpermissions_members_autosuggest_permissions').attr('disabled', 'disabled');
            initializeOverlay();
            $('#contentpermissions_members_list').prop('scrollTop',
                $('#contentpermissions_members_list').prop('scrollHeight'));
        };

        $('#contentpermissions_proceedandapply').click(doSave);

        $(document).on('init.contentpermissions.sakai', function(ev, data) {
            defaultPermissionPassed = data.newPermission;
            doInit();
        });

        addBinding();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('contentpermissions');
});
