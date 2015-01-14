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

        // Variable that keeps track of the folder profile
        var folderProfile = null;

        /**
         * Render the edit folder form and initialize its validation
         */
        var setUpEditFolder = function() {
            // Render the form elements
            oae.api.util.template().render($('#editfolder-template', $rootel), {
                'folder': folderProfile
            }, $('.modal-body', $rootel));

            // Initialize jQuery validate on the form
            var validateOpts = {
                'submitHandler': editFolder
            };
            oae.api.util.validation().validate($('#editfolder-form', $rootel), validateOpts);
        };

        /**
         * Edit the folder
         */
        var editFolder = function() {
            // Disable the form
            $('#editfolder-form *', $rootel).prop('disabled', true);

            var params = {
                'displayName': $.trim($('#editfolder-name', $rootel).val()),
                'description': $.trim($('#editfolder-description', $rootel).val())
            };

            oae.api.folder.updateFolder(folderProfile.id, params, function (err, data) {
                // If the update succeeded, trigger the `oae.editfolder.done` event,
                // show a success notification and close the modal
                if (!err) {
                    $('#editfolder-modal', $rootel).modal('hide');
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__FOLDER_EDITED__', 'editfolder'),
                        oae.api.i18n.translate('__MSG__FOLDER_EDIT_SUCCESS__', 'editfolder'));
                    $(document).trigger('oae.editfolder.done', data);
                // If the update failed, enable the form and show an error notification
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__FOLDER_NOT_EDITED__', 'editfolder'),
                        oae.api.i18n.translate('__MSG__FOLDER_EDIT_FAIL__', 'editfolder'),
                        'error');
                    // Enable the form
                    $('#editfolder-form *', $rootel).prop('disabled', false);
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Reset the widget to its original state when the modal dialog is opened and closed.
         * Ideally this would only be necessary when the modal is hidden, but IE10+ fires `input`
         * events while Bootstrap is rendering the modal, and those events can "undo" parts of the
         * reset. Hooking into the `shown` event provides the chance to compensate.
         */
        var setUpReset = function() {
            $('#editfolder-modal', $rootel).on('shown.bs.modal hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#editfolder-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                // Enable the form and disable the submit button
                $('#editfolder-form *', $rootel).prop('disabled', false);
                $('#editfolder-form button[type="submit"]', $rootel).prop('disabled', true);
            });
        };

        /**
         * Initialize the edit folder modal dialog
         */
        var setUpEditFolderModal = function() {
            $(document).on('click', '.oae-trigger-editfolder', function() {
                $('#editfolder-modal', $rootel).modal({
                    'backdrop': 'static'
                });
                $(document).trigger('oae.context.get', 'editfolder');
            });

            $(document).on('oae.context.send.editfolder', function(ev, data) {
                folderProfile = data;
                setUpEditFolder();
            });

            // Detect changes in the form and enable the submit button
            $('#editfolder-form', $rootel).on(oae.api.util.getFormChangeEventNames(), function() {
                $('#editfolder-form button[type="submit"]', $rootel).prop('disabled', false);
            });

            $('#editfolder-modal', $rootel).on('shown.bs.modal', function() {
                // Set focus to the folder name field
                $('#editfolder-name', $rootel).focus();
            });
        };

        setUpReset();
        setUpEditFolderModal();

    };
});
