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

    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // Keeps track of current context profile
        var contextProfile = null;

        // Keeps track of the id of the comment that needs to be deleted
        var commentToDelete = null;

        /**
         * Delete a comment and send out an event to let other widgets know whether it succeeded.
         * The deleted comment's ID `commentId` and the deleted comment object `softDeleted` will be included
         * in the `oae.deletecoment.done` event that's fired off when the comment was successfully deleted.
         */
        var deleteComment = function() {
            oae.api.comment.deleteComment(contextProfile.id, contextProfile.resourceType, commentToDelete, function(err, softDeleted) {
                if (err) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__COMMENT_NOT_DELETED__', 'deletecomment'),
                        oae.api.i18n.translate('__MSG__COMMENT_DELETE_FAIL__', 'deletecomment'),
                        'error');
                } else {
                    // Fire off an event to let other widgets know that the comment was deleted
                    $(document).trigger('oae.deletecomment.done', {
                        'softDeleted': softDeleted,
                        'commentId': commentToDelete
                    });
                }

                // Hide the modal
                $('#deletecomment-modal', $rootel).modal('hide');
            });
        };

        /**
         * Initialize the delete comment widget
         */
        var initDeleteComment = function() {
            $(document).on('click', '.oae-trigger-deletecomment', function(ev, data) {
                // Cache the ID of the comment that needs to be deleted
                commentToDelete = $(ev.currentTarget).attr('data-id');

                // Receive the context's profile information and set up the delete comment modal
                $(document).on('oae.context.send.deletecomments', function(ev, contextData) {
                    contextProfile = contextData;
                    // Show the delete comment confirmation modal
                    $('#deletecomment-modal', $rootel).modal({
                        'backdrop': 'static'
                    });
                });
                // Request the context profile information
                $(document).trigger('oae.context.get', 'deletecomments');
            });

            // Bind the delete confirmation button
            $rootel.on('click', '#deletecomment-delete', deleteComment);
        };

        initDeleteComment();

    };
});
