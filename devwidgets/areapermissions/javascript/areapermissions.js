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

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai.areapermissions
     *
     * @class areapermissions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.areapermissions = function(tuid, showSettings) {

        var areapermissionsSelectable = '.areapermissions_selectable > input';

        var contextData = false;
        var visibility = 'selected';
        var currentArea = {};
        var visibilityindex = {
            'everyone': 1,
            'loggedin': 2,
            'selected': 3
        };

        //////////////////////////
        // Rendering group data //
        //////////////////////////

        var loadGroupData = function() {
             var groupData = sakai_global.group.groupData;
             var roles = $.parseJSON(groupData['sakai:roles']);

             // Calculate for each role what current permission is
             currentArea = sakai_global.group.pubdata.structure0[contextData.path];
             var editRoles = $.parseJSON(currentArea._edit);
             var viewRoles = $.parseJSON(currentArea._view);
             for (var i = 0; i < roles.length; i++) {
                 var role = roles[i];
                 if ($.inArray('-' + role.id, editRoles) !== -1) {
                     role.value = 'edit';
                 } else if ($.inArray('-' + role.id, viewRoles) !== -1) {
                     role.value = 'view';
                 } else {
                     role.value = 'hidden';
                 }
                 role.roleTitle = sakai.api.i18n.getValueForKey(role.titlePlural);
                 role.creatorRole = sakai_global.group.groupData['sakai:creatorRole'] === role.id;
             }

             var sortedroles = [];
             // Creators
             $.each(roles, function(i, role) {
                 if (role.creatorRole) {
                     sortedroles.push(role);
                 }
             });
             // Managers
             $.each(roles, function(i, role) {
                 if (role.isManagerRole && !role.creatorRole) {
                     sortedroles.push(role);
                 }
             });
             // Viewers
             $.each(roles, function(i, role) {
                 if (!role.isManagerRole) {
                     sortedroles.push(role);
                 }
             });

             if ($.inArray('anonymous', viewRoles) !== -1 && sakai_global.group.groupData['sakai:group-visible'] === 'public') {
                 visibility = 'everyone';
             } else if ($.inArray('everyone', viewRoles) !== -1 && (sakai_global.group.groupData['sakai:group-visible'] === 'logged-in-only' || sakai_global.group.groupData['sakai:group-visible'] === 'public')) {
                 visibility = 'loggedin';
             } else {
                 visibility = 'selected';
             }

             sakai.api.Groups.getRole(sakai.data.me.user.userid, groupData['sakai:group-id'], function(success, data) {
                // Render the list
                $('#areapermissions_content_container').html(sakai.api.Util.TemplateRenderer('areapermissions_content_template', {
                    'roles': sortedroles,
                    'visibility': visibility,
                    'manager': contextData.isManager,
                    'groupPermissions': sakai_global.group.groupData['sakai:group-visible'],
                    'sakai': sakai,
                    'title': sakai.api.Security.safeOutput(currentArea._title),
                    'meRole': data.id
                }));
             });
         };

         var checkSelectedPermissionForRole = function(roleId) {
             // Check for view permissions
             var roleCanSee = false;
             var seeEl = $('#areapermissions_see_' + roleId);
             if (seeEl.attr('checked')) {
                 roleCanSee = true;
             }
             // if view permissions, check for edit permissions
             if (roleCanSee) {
                 var editEl = $('#areapermissions_edit_' + roleId);
                 if (editEl.attr('checked')) {
                     return 'edit';
                 } else {
                     return 'view';
                 }
             } else {
                 return false;
             }
         };

         var applyPermissions = function() {
             $('#areapermissions_apply_permissions').attr('disabled', 'disabled');
             $('#areapermissions_proceedandapply').attr('disabled', 'disabled');
             var groupData = sakai_global.group.groupData;
             var roles = $.parseJSON(groupData['sakai:roles']);

             var newView = [];
             var newEdit = [];

             // Collect everyone and anonymous value
             var generalVisibility = $('#areapermissions_see_container input[type=radio]:checked').val();
             if (generalVisibility === 'everyone') {
                 newView.push('everyone');
                 newView.push('anonymous');
             } else if (generalVisibility === 'loggedin') {
                 newView.push('everyone');
             }

             // Collect new view roles and new edit roles
             for (var i = 0; i < roles.length; i++) {
                var rolePermission = checkSelectedPermissionForRole(roles[i].id);
                if (rolePermission === 'edit') {
                    newEdit.push('-' + roles[i].id);
                } else if (rolePermission === 'view') {
                    newView.push('-' + roles[i].id);
                }
            }

            // Refetch docstructure information
            $.ajax({
                url: '/~' + sakai_global.group.groupId + '/docstructure.infinity.json',
                success: function(data) {
                    // Store view and edit roles
                    var pubdata = sakai.api.Server.cleanUpSakaiDocObject(data);
                    pubdata.structure0[contextData.path]._view = JSON.stringify(newView);
                    pubdata.structure0[contextData.path]._edit = JSON.stringify(newEdit);
                    sakai_global.group.pubdata.structure0 = pubdata.structure0;
                    sakai.api.Server.saveJSON('/~' + sakai_global.group.groupId + '/docstructure', {
                        'structure0': JSON.stringify(pubdata.structure0)
                    });
                }
            });

            // If I manage the document, add/remove appropriate roles from document
            //if (contextData.isManager) {

                // General visibility
                // Options are public, everyone or private
                var permissionsBatch = [];

                var generalPermission = '';
                if (generalVisibility === 'everyone') {
                    generalPermission = 'public';
                } else if (generalVisibility === 'loggedin') {
                    generalPermission = 'everyone';
                } else if (generalVisibility === 'selected') {
                    generalPermission = 'private';
                }
                permissionsBatch.push({
                    'url': contextData.pageSavePath + '.json',
                    'method': 'POST',
                    'parameters': {
                        'sakai:permissions': generalPermission
                    }
                });

                // Per role visibility
                for (var j = 0; j < roles.length; j++) {
                    var role = sakai_global.group.groupId + '-' + roles[j].id;
                    var selectedPermission = checkSelectedPermissionForRole(roles[j].id);
                    var parameters = {
                        ':viewer@Delete': role,
                        ':manager@Delete': role
                    };
                    var aclParameters = {
                        'principalId': role,
                        'privilege@jcr:write': 'denied',
                        'privilege@jcr:read': 'denied'
                    };
                    if (selectedPermission === 'edit') {
                        parameters = {
                            ':viewer@Delete': role,
                            ':manager': role
                        };
                        aclParameters = {
                            'principalId': role,
                            'privilege@jcr:write': 'granted',
                            'privilege@jcr:read': 'granted'
                        };
                    } else if (selectedPermission === 'view') {
                        parameters = {
                            ':viewer': role,
                            ':manager@Delete': role
                        };
                        aclParameters = {
                            'principalId': role,
                            'privilege@jcr:write': 'denied',
                            'privilege@jcr:read': 'granted'
                        };
                    }
                    permissionsBatch.push({
                        'url': contextData.pageSavePath + '.members.json',
                        'method': 'POST',
                        'parameters': parameters
                    });
                    permissionsBatch.push({
                        'url': contextData.pageSavePath + '.modifyAce.html',
                        'method': 'POST',
                        'parameters': aclParameters
                    });
                }

                // Send requests
                sakai.api.Server.batch(permissionsBatch, function(success, data) {
                    if (generalPermission) {
                        sakai.api.Content.setFilePermissions([{
                            'hashpath': contextData.pageSavePath.substring(3),
                            'permissions': generalPermission
                        }]);
                    }
                    sakai.api.Util.Modal.close('#areapermissions_warning_container');
                    sakai.api.Util.Modal.close('#areapermissions_container');
                    sakai.api.Util.notification.show($('#areapermissions_notification_title').text(), $('#areapermissions_notification_body').text());
                });
            //}
        };

        var determineContentManager = function() {
             $.ajax({
                 url: contextData.pageSavePath + '.infinity.json',
                 success: function(data) {
                     var manager = false;
                     var managers = data['sakai:pooled-content-manager'];
                     for (var i = 0; i < managers.length; i++) {
                        if (managers[i] === sakai.data.me.user.userid ||
                            sakai.api.Groups.isCurrentUserAMember(managers[i], sakai.data.me)) {
                            manager = true;
                        }
                     }
                     contextData.isManager = manager;
                     loadGroupData();
                 }, error: function(data) {
                     contextData.isManager = false;
                     loadGroupData();
                 }
             });
         };

         var showWarning = function() {
             var newVisibilityVal = $.trim($('#areapermissions_see_container input[type=radio]:checked').val());
             if (visibility === newVisibilityVal || visibilityindex[newVisibilityVal] > visibilityindex[visibility] || newVisibilityVal === 'selected') {
                 applyPermissions();
             } else {
                 $('#areapermissions_warning_container_text').html(sakai.api.Util.TemplateRenderer('areapermissions_warning_container_text_template', {
                     'visibility': newVisibilityVal,
                     'title': sakai.api.Security.safeOutput(currentArea._title)
                 }));
                 $('#areapermissions_proceedandapply').removeAttr('disabled');
                 $('#areapermissions_apply_permissions').removeAttr('disabled');
                 sakai.api.Util.Modal.open('#areapermissions_warning_container');
             }
         };


         /////////////////////////////////
         // Modal dialog initialization //
         /////////////////////////////////

         var addBinding = function() {
             $('#areapermissions_container').on('click', areapermissionsSelectable, function() {
                 $('#areapermissions_see_container .s3d-outer-shadow-container').addClass('areapermissions_unselected_rbt');
                 $(areapermissionsSelectable).parent().removeClass('s3d-outer-shadow-container');
                 $(this).parent().addClass('s3d-outer-shadow-container');
                 $(this).parent().removeClass('areapermissions_unselected_rbt');
                 if ($(this).attr('id') === 'areapermissions_see_private') {
                     $('#areapermissions_see_private_specific').show();
                 } else {
                     $('#areapermissions_see_private_specific').hide();
                 }
             });

             $('#areapermissions_container').on('change', '.areapermissions_role_edit_check', function(ev) {
                 var roleId = $(ev.currentTarget).attr('id').split('areapermissions_edit_')[1];
                 if (ev.currentTarget.checked) {
                     $('.areapermissions_see_' + roleId + '_checked').show();
                     $('#areapermissions_see_' + roleId).hide();
                     $('#areapermissions_see_' + roleId).attr('checked', 'checked');
                 } else{
                     $('.areapermissions_see_' + roleId + '_checked').hide();
                     $('#areapermissions_see_' + roleId).show();
                 }
             });

             $('#areapermissions_apply_permissions').on('click', showWarning);
             $('#areapermissions_proceedandapply').on('click', applyPermissions);
         };

         var initializeOverlay = function() {
             sakai.api.Util.Modal.setup('#areapermissions_container', {
                 modal: true,
                 overlay: 20,
                 toTop: true,
                 zIndex: 3000
             });

             sakai.api.Util.Modal.setup('#areapermissions_warning_container', {
                 modal: true,
                 overlay: 20,
                 toTop: true,
                 zIndex: 4000
             });

             $('#areapermissions_apply_permissions').removeAttr('disabled');
             sakai.api.Util.Modal.open('#areapermissions_container');
         };


         /////////////////////
         // External events //
         /////////////////////

         $(document).on('init.areapermissions.sakai', function(ev, _contextData) {
             contextData = _contextData;
             initializeOverlay();
             determineContentManager();
         });

         addBinding();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('areapermissions');
});
