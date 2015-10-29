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

        // Variable that will keep track of the current page context
        var contextProfile = null;

        /**
         * Delete the folder. When specified, all of the content items inside of the folder
         * will be deleted as well
         *
         * @param  {Boolean}        [deleteContent]           Whether or not the content items in the folder should be deleted as well
         */
        var deleteFolder = function(deleteContent) {
            // Disable the action buttons
            $('#deletefolder-overview *', $rootel).prop('disabled', true);

            // Delete the folder
            oae.api.folder.deleteFolder(contextProfile.id, deleteContent, function(err, failedContent) {
                if (!err) {
                    // If the folder contents should have been deleted, but not all of the content items
                    // could be deleted, the list of failed items is shown
                    if (failedContent && failedContent.length > 0) {
                        oae.api.util.template().render($('#deletefolder-failed-template', $rootel), {
                            'failedContent': failedContent,
                            // Make sure that the items that could not be deleted open in a new tab
                            'displayOptions': {
                                'linkTarget': '_blank'
                            }
                        }, $('#deletefolder-failed-container', $rootel));
                        $('#deletefolder-overview', $rootel).hide();
                        $('#deletefolder-failed', $rootel).show();
                        // Finish the deletion process when the modal is closed
                        $('#deletefolder-modal').on('hidden.bs.modal', finishDeleteFolder);
                    // If all items have been successfully deleted, close the modal, show a success
                    // notification and redirect the user
                    } else {
                        $('#deletefolder-modal', $rootel).modal('hide');
                        finishDeleteFolder();
                    }
                // If the update failed, enable the form, show an error notification
                // and close the modal
                } else {
                    $('#deletefolder-modal', $rootel).modal('hide');
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__FOLDER_NOT_DELETED__', 'deletefolder'),
                        oae.api.i18n.translate('__MSG__FOLDER_DELETE_FAIL__', 'deletefolder'),
                        'error');
                    // Enable the action buttons
                    $('#deletefolder-overview *', $rootel).prop('disabled', false);
                }
            });
        };

        /**
         * Finish the delete folder process when the folder has been successfully removed. This
         * involves showing a notification and redirecting the user away from the deleted folder
         */
        var finishDeleteFolder = function(failedContent) {
            oae.api.util.notification(
                oae.api.i18n.translate('__MSG__FOLDER_DELETED__', 'deletefolder'),
                oae.api.i18n.translate('__MSG__FOLDER_DELETE_SUCCESS__', 'deletefolder'));
            setTimeout(oae.api.util.redirect().home, 2000);
        };

        /**
         * Add the different event bindings
         */
        var addBinding = function() {
            // Remove the folder only
            $rootel.on('click', '#deletefolder-delete-folder', function() {
                deleteFolder(false);
            });

            // Remove the folder and all of its content
            $rootel.on('click', '#deletefolder-delete-folder-contents', function() {
                deleteFolder(true);
            });
        };

        /**
         * Initialize the delete folder modal dialog
         */
        var setUpDeleteFolderModal = function() {
            $(document).on('click', '.oae-trigger-deletefolder', function() {
                // Show the modal
                $('#deletefolder-modal', $rootel).modal({
                    'backdrop': 'static'
                });
            });

            // Receive the context information and cache it
            $(document).on('oae.context.send.deletefolder', function(ev, ctx) {
                contextProfile = ctx;
            });

            // Request the context information
            $(document).trigger('oae.context.get', 'deletefolder');
        };

        addBinding();
        setUpDeleteFolderModal();

    };
});
