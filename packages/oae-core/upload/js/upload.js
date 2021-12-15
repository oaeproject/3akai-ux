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

define(['jquery', 'oae.core', 'jquery.fileupload', 'jquery.iframe-transport', 'jquery.jeditable'], function($, oae) {
  return function(uid) {
    /**
     * Widget variables
     */

    // The widget container
    const $rootel = $('#' + uid);

    // Variable that keeps track of the selected files to upload
    let selectedFiles = [];
    let selectedFilesSize = 0;

    // Variable that keeps track of the folders to add this document to
    let foldersToAddTo = [];

    // Variable that keeps track of the selected visibility for the files to upload
    let visibility = null;

    // Generate a widget ID for the new instance of the `setpermissions` widget. This widget ID
    // will be used in the event communication between this widget and the `setpermissions` widget.
    const setPermissionsId = oae.api.util.generateId();

    // IE9 and below don't support XHR file uploads and we fall back to iframe transport
    const useIframeTransport = !$.support.xhrFileUpload && !$.support.xhrFormDataFileUpload;

    // Variable that keeps track of the current context
    let contextData = null;

    const MANAGER = 'manager';
    const VIEWER = 'viewer';

    const isRole = (role, someRole) => role === someRole;
    const isManager = someRole => isRole(MANAGER, someRole);
    const isViewer = someRole => isRole(VIEWER, someRole);

    /**
     * Utilities
     */

    /**
     * Reset the state of the widget when the modal dialog has been closed
     */
    const reset = function() {
      // Unbind the setpermissions handler
      $(document).off('oae.setpermissions.changed.' + setPermissionsId);

      // Reset the setpermissions content
      $('#upload-permissions-container', $rootel).html('');

      // Reset the selected Files list and total size
      selectedFiles = [];
      selectedFilesSize = 0;

      // Reset the fileupload form
      $('form', $rootel)[0].reset();

      // Hide all steps
      $('#upload-modal .modal-body > div', $rootel).hide();

      // Show the first step
      $('#upload-modal .modal-body > div:first-child', $rootel).show();
      $('#upload-modal > .modal-footer', $rootel).show();

      // Reset controls
      $('#upload-modal *').prop('disabled', false);
      $('#upload-upload', $rootel).hide();
      $('#upload-permissions', $rootel).hide();

      // Reset the progress bar
      $('.progress', $rootel).hide();
      updateProgress(0);

      // Remove the focus style on the Browse button
      $('#upload-browse-button', $rootel).removeClass('oae-focus');
    };

    /**
     * Filters selected files to include only those that can be uploaded
     *
     * @param  {Object[]}   files  Array of file objects to be considered for uploading
     * @return {Object[]}          Array after removing invalid files
     */
    const filterFiles = function(files) {
      return $.grep(files, function(file) {
        // If using iframe transport, all we can consider is the name since
        // browsers that require iframe (IE9) don't report size
        if (useIframeTransport) {
          return file.name;
        }

        // In other cases, we can look at size as well
        return file.size && file.name;
      });
    };

    /**
     * Adds selected files to the list of files to upload. Filters out folders and size 0 files
     *
     * @param  {Object}   data   The data object containing information on the files that are selected for upload
     * @return {Number}          Number of valid files added
     */
    const addToSelected = function(data) {
      // Restrict to valid files only
      const files = filterFiles(data.files);

      $.each(files, function(index, file) {
        // Add the file to the queue
        selectedFiles.push({
          displayName: file.name,
          description: '',
          file,
          resourceType: 'content',
          resourceSubType: 'file'
        });

        // Update total size if available
        selectedFilesSize += file.size ? file.size : 0;
      });

      return files.length;
    };

    /**
     * Updates the progress indicator
     *
     * @param  {Number}   progress   Number between 0 and 100 indicating the upload progress
     */
    const updateProgress = function(progress) {
      $('.progress-bar', $rootel)
        .css('width', progress + '%')
        .attr('aria-valuenow', progress);
      $('.progress-bar .sr-only', $rootel).text(progress + '%');
    };

    /**
     * Saves the edited file name to the corresponding item in the array of selected files
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     */
    const editableSubmitted = function(value) {
      value = $.trim(value);
      const prevValue = this.revert;
      const $listItem = $(this).parents('li');
      // If no name has been entered, we fall back to the previous value
      if (!value) {
        return prevValue;
      }

      const fileIndex = $('#upload-selected-container li').index($listItem);
      selectedFiles[fileIndex].displayName = value;
      return value;
    };

    /**
     * Shows a success or failure notification when the upload has completed.
     *
     * @param  {Number}   errCount   The number of errors that occurred during the upload
     */
    const showCompleteNotification = function(errCount) {
      // Render and show the notification
      const notificationTitle = oae.api.util.template().render($('#upload-notification-title-template', $rootel), {
        context: contextData,
        errCount,
        files: selectedFiles
      });

      const notificationBody = oae.api.util.template().render($('#upload-notification-body-template', $rootel), {
        context: contextData,
        errCount,
        files: selectedFiles
      });

      oae.api.util.notification(notificationTitle, notificationBody, errCount ? 'error' : 'success');

      // Hide the modal when there are no upload errors
      if (!errCount) {
        $('#upload-modal', $rootel).modal('hide');
      }
    };

    /**
     * View management
     */

    /**
     * When files are dropped onto an element that's designated as a drop zone, we skip the first step of
     * selecting files and proceed with showing the files that were dropped
     *
     * @param  {Object}    dropData    The data received from dropping files onto the container
     * @return {Number}                Number of valid files shown
     */
    const showDropped = function(dropData) {
      // Since we already have the selected files we skip to the next step
      setUpUploadField();

      // Add the dropped files to the fileupload field
      $('#upload-input', $rootel).fileupload('add', dropData.data.files);

      // Add the selected files to the internal list of selected files
      const filesShown = addToSelected(dropData.data);
      if (filesShown > 0) {
        // Ensure the overview is visible
        showOverview();
        // Render the selected list
        renderSelected();
      }

      return filesShown;
    };

    /**
     * Shows the drop zone with browse button
     */
    const showDropzone = function() {
      $('#upload-dropzone', $rootel).show();
    };

    /**
     * Shows the permissions widget to allow for updates in visiblity and members
     */
    const showPermissions = function() {
      // Hide all containers
      $('#upload-modal .modal-body > div', $rootel).hide();
      $('#upload-modal .modal-content > .modal-footer', $rootel).hide();
      // Show the permissions container
      $('#upload-modal .modal-body > div#upload-permissions-container', $rootel).show();
      $('#upload-upload', $rootel).hide();
    };

    /**
     * Shows an overview of the selected files
     */
    const showOverview = function() {
      // Hide all containers
      $('#upload-modal .modal-body > div', $rootel).hide();
      // Show the overview container
      $('#upload-modal .modal-content > .modal-footer', $rootel).show();
      $('#upload-modal .modal-body > div#upload-overview-container', $rootel).show();
      $('#upload-permissions', $rootel).show();
      $('#upload-upload', $rootel).show();
    };

    /**
     * Renders a list of the selected files to upload
     */
    const renderSelected = function() {
      oae.api.util.template().render(
        '#upload-selected-template',
        {
          files: selectedFiles,
          displayOptions: {
            metadata: false
          }
        },
        $('#upload-selected-container', $rootel)
      );

      // Initiate the widget that will deal with permission management
      setUpSetPermissions();

      // Give focus to the first item in the list
      $('#upload-selected-container li:first-child', $rootel).focus();

      // Apply jEditable for inline editing of file names
      $('.jeditable-field', $rootel).editable(editableSubmitted, {
        onblur: 'submit',
        select: true
      });

      // Apply jQuery Tooltip to the file title field to show that the fields are editable.
      // The custom template adds ARIA accessibility to the default bootstrap functionality
      $('[rel="tooltip"]', $rootel).each(function() {
        const tooltipId = oae.api.util.generateId();
        $(this).attr('aria-describedby', tooltipId);
        $(this).tooltip({
          template:
            '<div class="tooltip" role="tooltip" id="' +
            tooltipId +
            '"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
      });
    };

    /**
     * Initialization
     */

    /**
     * Reset the widget when the modal dialog is closed
     */
    const setUpReset = function() {
      $('#upload-modal').on('hidden.bs.modal', function(ev) {
        // Bootstrap will send out a `hidden` event when certain components are destroyed.
        // We can only reset the widget when the modal is closed though.
        // e.g. `$('[rel="tooltip"]', $rootel).tooltip('destroy');`
        if ($(ev.target).hasClass('modal')) {
          reset();
        }
      });
    };

    /**
     * Load the `setpermissions` widget into this widget. That widget will take care of permission
     * management (visibility + sharing) of the selected files
     */
    const setUpSetPermissions = function() {
      // Remove the previous `setpermissions` widget
      const $setPermissionsContainer = $('#upload-permissions-container', $rootel);
      $setPermissionsContainer.html('');

      // When the current context is the current user, the configured default tenant visibility for files
      // will be used as the default visibility. Otherwise, the visibility of the current context will be
      // used as the default visibility
      if (contextData.id === oae.data.me.id) {
        visibility = oae.api.config.getValue('oae-content', 'visibility', 'files');
      } else {
        visibility = contextData.visibility;
      }

      // Event that will be triggered when permission changes have been made in the `setpermissions` widget
      $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
        // Update visibility for files
        visibility = data.visibility || visibility;

        // Update the members of the selected files
        $.each(selectedFiles, function(index, file) {
          file.managers = [];
          file.viewers = [];
          file.folders = [];

          _.each(data.members, function(role, id) {
            if (isManager(role)) {
              file.managers.push(id);
            } else if (isViewer(role)) {
              file.viewers.push(id);
            }
          });

          _.each(data.invitations, function(invitation, id) {
            if (isManager(invitation.role)) {
              file.managers.push(id);
            } else if (isViewer(invitation.role)) {
              file.viewers.push(id);
            }
          });

          if (data.selectedFolderItems) {
            foldersToAddTo = data.selectedFolderItems;
          }
          file.folders.push(foldersToAddTo);
        });

        // Add the permissions summary
        $('#upload-permissions', $rootel).html(data.summary);

        // Switch back to the overview
        showOverview();
      });

      // Event that will be triggered when permission changes have been cancelled
      $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

      // Always add the created files to the current user's library
      const preFill = [
        {
          displayName: oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
          id: oae.data.me.id,
          fixed: true
        }
      ];

      // If the current user is creating the files from within a group,
      // the group is added as a fixed item as well
      if (contextData.id !== oae.data.me.id) {
        preFill.push($.extend({ fixed: true }, contextData));
      }

      // Load the `setpermissions` widget into its container
      oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
        count: selectedFiles.length,
        preFill,
        type: 'file',
        visibility
      });
    };

    /**
     * Remove a selected file from the list and reset the widget when no files remain
     */
    const setUpDelete = function() {
      $rootel.on('click', '.upload-trash', function(ev) {
        // Get the index of the list item
        const $listItem = $(this).parents('li');
        const fileIndex = $('#upload-selected-container li', $rootel).index($listItem);
        // Subtract the size of the file from the total
        selectedFilesSize -= selectedFiles[fileIndex].file.size;
        // This corresponds to the array from which we'll remove the selected file
        selectedFiles.splice(fileIndex, 1);
        // Also remove it from the UI
        $listItem.fadeOut(250, function() {
          $listItem.remove();
          // If there are no files left reset the widget
          if (selectedFiles.length === 0) {
            reset();
            setUpUploadField();
          }
        });
      });
    };

    /**
     * Initlializes the jQuery fileupload plugin on the upload form
     */
    const setUpUploadField = function() {
      // Used to hold the size of the file being uploaded.
      let prevFile = false;
      // A progress event can be fired multiple times for the same file depending on the size of the file
      // We make the distinction between files in the events by looking at the size of the file in the event
      // If the size of prevFile is equal to the size of totalPrevFile that means that the event is still handling the same file
      // Usage is described in the `progress` handler below
      let totalPrevFile = 0;
      let totalUploaded = 0;

      const fileuploadOptions = {
        url: '/api/content/create',
        dropZone: $('#upload-dropzone', $rootel),
        forceIframeTransport: useIframeTransport,
        // This is mandatory for browsers that require the iframe transport (i.e., IE9)
        replaceFileInput: false,
        // Drop is fired when a user drops files on the dropzone
        drop(ev, data) {
          // Ensure at least one file is valid
          if (addToSelected(data) > 0) {
            showOverview();
            renderSelected();
          } else {
            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__FILE_NOT_ADDED__', 'upload'),
              oae.api.i18n.translate('__MSG__PLEASE_SELECT_A_VALID_FILE_TO_UPLOAD__', 'upload'),
              'error'
            );
          }
        },
        add() {
          /* Overriding `add` to avoid submitting the files on selection */
        },
        // Change is fired when a user browses for files
        change(ev, data) {
          addToSelected(data);
          showOverview();
          renderSelected();
        },
        progress(ev, data) {
          // The progress event can be sent out multiple times during the same file upload depending on the size of the file.
          // If the 'prevFile' variable is false, fill it up with the size of the first file that is uploaded
          // This check will only be true on the first progress event of the first file that's uploaded
          if (!prevFile) {
            prevFile = data.total;
          }

          // If the size of the previous file event is the same as the size of the current file event
          // it's assumed that this is the same file. In that case the 'loaded' is not added to the total loaded size
          if (prevFile === data.total) {
            totalPrevFile = data.loaded;
            // If the size is not the same it's assumed the plugin is handling a different file
            // and the size of the previous file is added to the total of all files
          } else {
            totalUploaded += prevFile;
            prevFile = data.total;
            totalPrevFile = data.loaded;
          }

          // Update the progress bar
          updateProgress(((totalUploaded + totalPrevFile) / selectedFilesSize) * 100);
        }
      };

      $('#upload-input', $rootel).fileupload(fileuploadOptions);
    };

    /**
     * Start the file upload process. This iterates over all selected files and uploads them one at
     * a time. Regular updates are provided in the form of a loading spinner icon and success or fail icon
     */
    const setUpUploadHandling = function() {
      $('#upload-upload', $rootel).on('click', function() {
        let done = 0;
        let errCount = 0;

        // If we need an iframe for the upload, progress will probably not be supported
        if (!useIframeTransport) {
          // Show the progress bar when the upload starts
          $('.progress', $rootel).show();
        }

        // Disable editing on upload
        // Note: the file input element can not be disabled, as that will cause IE9
        // to drop it from the  DOM and not submit its file content to the server
        $('#upload-modal *')
          .not('input[type="file"]')
          .prop('disabled', true);
        $('.jeditable-field', $rootel).editable('destroy');
        $('[rel="tooltip"]', $rootel).tooltip('destroy');

        // Lock the modal so it cannot be closed during upload
        $('#upload-modal', $rootel).modal('lock');

        /**
         * Upload the actual files. Progress is shown for each individual file and
         * the progress bar is updated after each file upload.
         *
         * @param  {Number}    index    The index of the file that's currently being uploaded
         */
        const upload = function(index) {
          const file = selectedFiles[index];
          if (file) {
            const $listItem = $($('#upload-selected-container li', $rootel)[index]);
            const $spinner = $listItem.find('.upload-progress');
            const $ok = $listItem.find('.fa-check');
            const $warning = $listItem.find('.fa-exclamation-triangle');

            // Show the uploading animation and add focus to it so the browser scrolls
            $spinner.removeClass('hide').focus();

            oae.api.content.createFile(
              file.displayName,
              file.description,
              visibility,
              $('#upload-input', $rootel),
              file.file,
              file.managers,
              file.viewers,
              file.folders,
              function(error, data) {
                $spinner.addClass('hide');
                if (!error) {
                  $ok.show();
                  // Update the file object with the profile path of the content
                  file.profilePath = data.profilePath;
                } else {
                  $warning.show();
                  // Update the error count
                  errCount++;
                }

                done++;
                if (done !== selectedFiles.length) {
                  upload(done);
                } else {
                  $(window).trigger('done.addcontent.oae');
                  // Unlock the modal
                  $('#upload-modal', $rootel).modal('unlock');
                  // If we need an iframe for the upload, progress will probably not be supported
                  if (!useIframeTransport) {
                    updateProgress(100);
                  }

                  showCompleteNotification(errCount);
                }
              }
            );
          }
        };

        upload(0);
      });
    };

    /**
     * Initialize the upload modal dialog
     */
    const setUpUploadModal = function() {
      $(document).on('click', '.oae-trigger-upload', function() {
        oae.api.util
          .template()
          .render($('#upload-body-template', $rootel), { ios: oae.api.util.isIos() }, $('.modal-body', $rootel));
        $('#upload-modal', $rootel).modal({
          backdrop: 'static'
        });
        showDropzone();
        setUpUploadField();
      });

      // Defined `oae-dnd-upload` dropzones will trigger the `oae-trigger-upload` event when files
      // have been dropped. This is caught by the upload widget which shows the modal dialog and
      // renders the files into a list.
      $(document).on('oae.trigger.upload', function(ev, data) {
        // Non-null data indicates a pre-selected set of potential files has been provided
        if (data) {
          // Ensure at least one file is valid before continuing
          if (filterFiles(data.data.files).length > 0) {
            oae.api.util
              .template()
              .render($('#upload-body-template', $rootel), { ios: oae.api.util.isIos() }, $('.modal-body', $rootel));
            $('#upload-modal', $rootel).modal({
              backdrop: 'static'
            });
            showOverview();
            showDropped(data);

            // If no files are valid, show error notification
          } else {
            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__FILE_NOT_ADDED__', 'upload'),
              oae.api.i18n.translate('__MSG__PLEASE_SELECT_A_VALID_FILE_TO_UPLOAD__', 'upload'),
              'error'
            );
          }

          // If no pre-selected set is provided, just show the modal
        } else {
          oae.api.util.template().render(
            $('#upload-body-template', $rootel),
            {
              ios: oae.api.util.isIos()
            },
            $('.modal-body', $rootel)
          );
          $('#upload-modal', $rootel).modal({
            backdrop: 'static'
          });
          showDropzone();
          setUpUploadField();
        }
      });

      // Binds the 'change' button that shows the setpermissions widget
      $rootel.on('click', '.setpermissions-change-permissions', showPermissions);

      // Receive the context information and cache it
      $(document).on('oae.context.send.upload', function(ev, ctx) {
        contextData = ctx;
      });

      // Request the context information
      $(document).trigger('oae.context.get', 'upload');
    };

    setUpReset();
    setUpUploadHandling();
    setUpUploadModal();
    setUpDelete();
  };
});
