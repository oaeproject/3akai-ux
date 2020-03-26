/*!
 * Copyright 2018 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'oae.core'], function($, oae) {
  return function(uid) {
    // The widget container
    const $rootel = $('#' + uid);

    // Variable that keeps track of the people and groups to share this spreadsheet with
    let extraManagers = [];
    let extraEditors = [];
    let extraViewers = [];
    // Variable that keeps track of the folders to add this spreadsheet to
    let foldersToAddTo = [];

    // Variable that keeps track of the selected visibility for the spreadsheet to create
    let visibility = null;

    // Generate a widget ID for the new instance of the `setpermissions` widget. This widget ID
    // will be used in the event communication between this widget and the `setpermissions` widget.
    const setPermissionsId = oae.api.util.generateId();

    // Variable that keeps track of the current context
    let contextData = null;

    const MANAGER = 'manager';
    const EDITOR = 'editor';
    const VIEWER = 'viewer';

    const isRole = (role, someRole) => role === someRole;
    const isManager = someRole => isRole(MANAGER, someRole);
    const isEditor = someRole => isRole(EDITOR, someRole);
    const isViewer = someRole => isRole(VIEWER, someRole);

    /**
     * Reset the widget to its original state when the modal dialog is closed
     */
    const setUpReset = function() {
      $('#createcollabsheet-modal', $rootel).on('hidden.bs.modal', function() {
        // Unbind the setpermissions handler
        $(document).off('oae.setpermissions.changed.' + setPermissionsId);

        // Reset the setpermissions content
        $('#createcollabsheet-permissions-container', $rootel).html('');

        // Reset the form
        const $form = $('#createcollabsheet-form', $rootel);
        $form[0].reset();
        oae.api.util.validation().clear($form);
        showOverview();
      });
    };

    /**
     * Initialize the create collabsheet form and validation
     */
    const setUpCreateCollabSheet = function() {
      const validateOpts = {
        submitHandler: createCollabSheet
      };
      oae.api.util.validation().validate($('#createcollabsheet-form', $rootel), validateOpts);
    };

    /**
     * Show the permissions widget to allow for updates in visiblity and members
     */
    const showPermissions = function() {
      // Hide all containers
      $('.modal-body > div:visible', $rootel).hide();
      $('#createcollabsheet-form > .modal-footer', $rootel).hide();
      // Show the permissions container
      $('#createcollabsheet-permissions-container', $rootel).show();
    };

    /**
     * Show the main panel of the widget
     */
    const showOverview = function() {
      // Hide all containers
      $('.modal-body > div:visible', $rootel).hide();
      // Show the overview container
      $('#createcollabsheet-form > .modal-footer', $rootel).show();
      $('#createcollabsheet-overview-container', $rootel).show();
    };

    /**
     * Load the `setpermissions` widget into this widget. That widget will take care of permission
     * management (visibility + sharing) of the spreadsheet
     */
    const setUpSetPermissions = function() {
      // Remove the previous `setpermissions` widget
      const $setPermissionsContainer = $('#createcollabsheet-permissions-container', $rootel);
      $setPermissionsContainer.html('');

      // When the current context is the current user, the configured default tenant visibility for
      // collaborative spreadsheet will be used as the default visibility. Otherwise, the visibility of
      // the current context will be used as the default visibility
      if (contextData.id === oae.data.me.id) {
        visibility = oae.api.config.getValue('oae-content', 'visibility', 'collabsheets');
      } else {
        visibility = contextData.visibility;
      }

      // Event that will be triggered when permission changes have been made in the `setpermissions` widget
      $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
        // Update visibility for spreadsheet
        visibility = data.visibility || visibility;

        // Update members of the document
        if (data.members) {
          extraManagers = [];
          extraEditors = [];
          extraViewers = [];

          _.each(data.members, function(role, principalId) {
            if (isManager(role)) {
              extraManagers.push(principalId);
            } else if (isEditor(role)) {
              extraEditors.push(principalId);
            } else if (isViewer(role)) {
              extraViewers.push(principalId);
            }
          });

          _.each(data.invitations, function(invitation, principalId) {
            if (isManager(invitation.role)) {
              extraManagers.push(principalId);
            } else if (isEditor(invitation.role)) {
              extraEditors.push(principalId);
            } else if (isViewer(invitation.role)) {
              extraViewers.push(principalId);
            }
          });
        }

        if (data.selectedFolderItems) {
          foldersToAddTo = data.selectedFolderItems;
        }

        // Add the permissions summary
        if (data.summary) {
          $('#createcollabsheet-permissions', $rootel).html(data.summary);
        }

        // Switch back to the overview
        showOverview();
      });

      // Event that will be triggered when permission changes have been cancelled
      $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

      // Always add the created spreadsheet to the current user's library
      const preFill = [
        {
          displayName: oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
          id: oae.data.me.id,
          fixed: true
        }
      ];

      // If the current user is creating the spreadsheet from a within a group,
      // the group is added as a fixed item as well
      if (contextData.id !== oae.data.me.id) {
        preFill.push($.extend({ fixed: true }, contextData));
      }

      // Load the `setpermissions` widget into its container
      oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
        count: 1,
        preFill,
        type: 'collabsheet',
        visibility
      });
    };

    /**
     * Create the collaborative spreadsheet. When the collaborative spreadsheet has been created successfully, the user will be
     * redirected to the created collaborative spreadsheet
     */
    const createCollabSheet = function() {
      // Disable the form
      $('#createcollabsheet-form *', $rootel).prop('disabled', true);

      const displayName = $.trim($('#createcollabsheet-name', $rootel).val());

      oae.api.content.createCollabSheet(
        displayName,
        '',
        visibility,
        extraManagers,
        extraEditors,
        extraViewers,
        foldersToAddTo,
        function(err, data) {
          // If the creation succeeded, redirect to the spreadsheet
          if (!err) {
            window.location = data.profilePath;
          } else {
            // Re-enable the form
            $('#createcollabsheet-form *', $rootel).prop('disabled', false);

            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__COLLABSHEET_NOT_CREATED__', 'createcollabsheet'),
              oae.api.i18n.translate('__MSG__COLLABSHEET_COULD_NOT_BE_CREATED__', 'createcollabsheet'),
              'error'
            );
          }
        }
      );

      // Avoid default form submit behavior
      return false;
    };

    /**
     * Initialize the create collabsheet modal dialog
     */
    const setUpCreateCollabSheetModal = function() {
      $(document).on('click', '.oae-trigger-createcollabsheet', function() {
        // Request the context information
        $(document).trigger('oae.context.get', 'createcollabsheet');
      });

      // Receive the context information and cache it
      $(document).on('oae.context.send.createcollabsheet', function(ev, ctx) {
        contextData = ctx;
        $('#createcollabsheet-modal', $rootel).modal({
          backdrop: 'static'
        });
      });

      $('#createcollabsheet-modal', $rootel).on('shown.bs.modal', function() {
        // Set focus to the collabsheet name field
        $('#createcollabsheet-name', $rootel).focus();
        // Initiate the permissions widget
        setUpSetPermissions();
      });

      // Binds the 'change' button that shows the setpermissions widget
      $rootel.on('click', '.setpermissions-change-permissions', showPermissions);
    };

    setUpCreateCollabSheetModal();
    setUpCreateCollabSheet();
    setUpReset();
  };
});
