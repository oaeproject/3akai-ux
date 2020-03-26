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

define(['jquery', 'oae.core'], function($, oae) {
  return function(uid) {
    // The widget container
    const $rootel = $('#' + uid);

    // Variable that keeps track of the people and groups to share this document with
    let extraManagers = [];
    let extraEditors = [];
    let extraViewers = [];
    // Variable that keeps track of the folders to add this document to
    let foldersToAddTo = [];

    // Variable that keeps track of the selected visibility for the document to create
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
      $('#createcollabdoc-modal', $rootel).on('hidden.bs.modal', function() {
        // Unbind the setpermissions handler
        $(document).off('oae.setpermissions.changed.' + setPermissionsId);

        // Reset the setpermissions content
        $('#createcollabdoc-permissions-container', $rootel).html('');

        // Reset the form
        const $form = $('#createcollabdoc-form', $rootel);
        $form[0].reset();
        oae.api.util.validation().clear($form);
        showOverview();
      });
    };

    /**
     * Initialize the create collabdoc form and validation
     */
    const setUpCreateCollabDoc = function() {
      const validateOpts = {
        submitHandler: createCollabDoc
      };
      oae.api.util.validation().validate($('#createcollabdoc-form', $rootel), validateOpts);
    };

    /**
     * Show the permissions widget to allow for updates in visiblity and members
     */
    const showPermissions = function() {
      // Hide all containers
      $('.modal-body > div:visible', $rootel).hide();
      $('#createcollabdoc-form > .modal-footer', $rootel).hide();
      // Show the permissions container
      $('#createcollabdoc-permissions-container', $rootel).show();
    };

    /**
     * Show the main panel of the widget
     */
    const showOverview = function() {
      // Hide all containers
      $('.modal-body > div:visible', $rootel).hide();
      // Show the overview container
      $('#createcollabdoc-form > .modal-footer', $rootel).show();
      $('#createcollabdoc-overview-container', $rootel).show();
    };

    /**
     * Load the `setpermissions` widget into this widget. That widget will take care of permission
     * management (visibility + sharing) of the document
     */
    const setUpSetPermissions = function() {
      // Remove the previous `setpermissions` widget
      const $setPermissionsContainer = $('#createcollabdoc-permissions-container', $rootel);
      $setPermissionsContainer.html('');

      // When the current context is the current user, the configured default tenant visibility for files
      // will be used as the default visibility. Otherwise, the visibility of the current context will be
      // used as the default visibility
      if (contextData.id === oae.data.me.id) {
        visibility = oae.api.config.getValue('oae-content', 'visibility', 'collabdocs');
      } else {
        visibility = contextData.visibility;
      }

      // Event that will be triggered when permission changes have been made in the `setpermissions` widget
      $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
        // Update visibility for document
        visibility = data.visibility || visibility;

        // debug
        console.dir(data);

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
          $('#createcollabdoc-permissions', $rootel).html(data.summary);
        }

        // Switch back to the overview
        showOverview();
      });

      // Event that will be triggered when permission changes have been cancelled
      $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

      // Always add the created document to the current user's library
      const preFill = [
        {
          displayName: oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
          id: oae.data.me.id,
          fixed: true
        }
      ];

      // If the current user is creating the document from a within a group,
      // the group is added as a fixed item as well
      if (contextData.id !== oae.data.me.id) {
        preFill.push($.extend({ fixed: true }, contextData));
      }

      // Load the `setpermissions` widget into its container
      oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
        count: 1,
        preFill,
        type: 'collabdoc',
        visibility
      });
    };

    /**
     * Create the collaborative document. When the collaborative document has been created successfully, the user will be redirected
     * to the created collaborative document
     */
    const createCollabDoc = function() {
      // Disable the form
      $('#createcollabdoc-form *', $rootel).prop('disabled', true);

      const displayName = $.trim($('#createcollabdoc-name', $rootel).val());

      oae.api.content.createCollabDoc(
        displayName,
        '',
        visibility,
        extraManagers,
        extraEditors,
        extraViewers,
        foldersToAddTo,
        function(err, data) {
          // If the creation succeeded, redirect to the document
          if (!err) {
            window.location = data.profilePath;
          } else {
            // Re-enable the form
            $('#createcollabdoc-form *', $rootel).prop('disabled', false);

            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__DOCUMENT_NOT_CREATED__', 'createcollabdoc'),
              oae.api.i18n.translate('__MSG__DOCUMENT_COULD_NOT_BE_CREATED__', 'createcollabdoc'),
              'error'
            );
          }
        }
      );

      // Avoid default form submit behavior
      return false;
    };

    /**
     * Initialize the create collabdoc modal dialog
     */
    const setUpCreateCollabDocModal = function() {
      $(document).on('click', '.oae-trigger-createcollabdoc', function() {
        // Request the context information
        $(document).trigger('oae.context.get', 'createcollabdoc');
      });

      // Receive the context information and cache it
      $(document).on('oae.context.send.createcollabdoc', function(ev, ctx) {
        contextData = ctx;
        $('#createcollabdoc-modal', $rootel).modal({
          backdrop: 'static'
        });
      });

      $('#createcollabdoc-modal', $rootel).on('shown.bs.modal', function() {
        // Set focus to the collabdoc name field
        $('#createcollabdoc-name', $rootel).focus();
        // Initiate the permissions widget
        setUpSetPermissions();
      });

      // Binds the 'change' button that shows the setpermissions widget
      $rootel.on('click', '.setpermissions-change-permissions', showPermissions);
    };

    setUpCreateCollabDocModal();
    setUpCreateCollabDoc();
    setUpReset();
  };
});
