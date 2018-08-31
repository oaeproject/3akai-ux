/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the people and groups to share this folder with
        var members = [];
        // Variable that keeps track of the people and groups to make a manager of this folder
        var managers = [];

        // Variable that keeps track of the selected visibility for the folder to create
        var visibility = null;

        // Generate a widget ID for the new instance of the `setpermissions` widget. This widget ID
        // will be used in the event communication between this widget and the `setpermissions` widget.
        var setPermissionsId = oae.api.util.generateId();

        // Variable that keeps track of the current context
        var contextData = null;

        /**
         * Reset the widget to its original state when the modal dialog is closed
         */
        var setUpReset = function() {
            $('#createfolder-modal', $rootel).on('hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#createfolder-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                showOverview();

                // Unbind the setpermissions handler
                $(document).off('oae.setpermissions.changed.' + setPermissionsId);
            });
        };

        /**
         * Initialize the create folder form and validation
         */
        var setUpCreateFolder = function() {
            var validateOpts = {
                'submitHandler': createFolder
            };
            oae.api.util.validation().validate($('#createfolder-form', $rootel), validateOpts);
        };

        /**
         * Show the permissions widget to allow for updates in visiblity and members
         */
        var showPermissions = function() {
            // Hide all containers
            $('.modal-body > div:visible', $rootel).hide();
            $('#createfolder-form > .modal-footer', $rootel).hide();
            // Show the permissions container
            $('#createfolder-permissions-container', $rootel).show();
        };

        /**
         * Show the main panel of the widget
         */
        var showOverview = function() {
            // Hide all containers
            $('.modal-body > div:visible', $rootel).hide();
            // Show the overview container
            $('#createfolder-form > .modal-footer', $rootel).show();
            $('#createfolder-overview-container', $rootel).show();
        };

        /**
         * Load the `setpermissions` widget into this widget. That widget will take care of permission
         * management (visibility + sharing) of the folder
         */
        var setUpSetPermissions = function() {
            // Remove the previous `setpermissions` widget
            var $setPermissionsContainer = $('#createfolder-permissions-container', $rootel);
            $setPermissionsContainer.html('');

            // When the current context is the current user, the configured default tenant visibility for folders
            // will be used as the default visibility. Otherwise, the visibility of the current context will be
            // used as the default visibility
            if (contextData.id === oae.data.me.id) {
                visibility = oae.api.config.getValue('oae-folders', 'visibility', 'folder');
            } else {
                visibility = contextData.visibility;
            }

            // Event that will be triggered when permission changes have been made in the `setpermissions` widget
            $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
                // Update visibility for folder
                visibility = data.visibility || visibility;

                if (data.members) {
                    managers = [];
                    members = [];
                    
                    _.each(data.members, function(role, id) {
                        if (role === 'manager') {
                            managers.push(id);
                        } else {
                            members.push(id);
                        }
                    });

                    _.each(data.invitations, function(invitation, id) {
                        if (invitation.role === 'manager') {
                            managers.push(id);
                        } else {
                            members.push(id);
                        }
                    });
                }

                // Add the permissions summary
                $('#createfolder-permissions', $rootel).html(data.summary);

                // Switch back to the overview
                showOverview();
            });

            // Event that will be triggered when permission changes have been cancelled
            $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

            // Determine the default selection of people and groups the folder should be shared with
            var preFill = [];
            var ghosts = [];

            // Autosuggest item representing the current user's context
            var userItem = {
                'displayName': oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
                'id': oae.data.me.id
            };

            // If the current user is creating the folder from its personal space,
            // `My Library` is added as a fixed item
            if (contextData.id === oae.data.me.id) {
                preFill.push($.extend({
                    'fixed': true
                }, userItem));
            // If the current user is creating the folder from a within a group,
            // the group is added as a fixed item and `My Library` is added as a
            // ghost item
            } else {
                preFill.push($.extend({
                    'fixed': true
                }, contextData));
                ghosts.push(userItem);
            }

            // Load the `setpermissions` widget into its container
            oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
                'count': 1,
                'ghosts': ghosts,
                'preFill': preFill,
                'type': 'folder',
                'visibility': visibility
            });
        };

        /**
         * Create the folder. When the folder has been created successfully, the user will be redirected
         * to the created folder
         */
        var createFolder = function() {
            // Disable the form
            $('#createfolder-form *', $rootel).prop('disabled', true);

            var displayName = $.trim($('#createfolder-name', $rootel).val());

            oae.api.folder.createFolder(displayName, null, visibility, managers, members, function (err, data) {
                // If the creation succeeded, redirect to the folder profile
                if (!err) {
                    window.location = data.profilePath;
                } else {
                    // Re-enable the form
                    $('#createfolder-form *', $rootel).prop('disabled', true);

                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__FOLDER_NOT_CREATED__', 'createfolder'),
                        oae.api.i18n.translate('__MSG__FOLDER_COULD_NOT_BE_CREATED__', 'createfolder'),
                        'error');
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Initialize the create folder modal dialog
         */
        var setUpCreateFolderModal = function() {
            $(document).on('click', '.oae-trigger-createfolder', function() {
                // Request the context information
                $(document).trigger('oae.context.get', 'createfolder');
            });

            // Receive the context information and cache it
            $(document).on('oae.context.send.createfolder', function(ev, ctx) {
                contextData = ctx;
                $('#createfolder-modal', $rootel).modal({
                    'backdrop': 'static'
                });
            });

            $('#createfolder-modal', $rootel).on('shown.bs.modal', function() {
                // Set focus to the discussion topic field
                $('#createfolder-name', $rootel).focus();
                // Initiate the permissions widget
                setUpSetPermissions();
            });

            // Binds the 'change' button that shows the setpermissions widget
            $rootel.on('click', '.setpermissions-change-permissions', showPermissions);
        };

        setUpCreateFolderModal();
        setUpCreateFolder();
        setUpReset();

    };
});
