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

    return function(uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that will cache the list of users to unfollow
        var usersToUnfollow = null;

        /**
         * Renders the list of users to unfollow
         */
        var renderUnfollow = function() {
            oae.api.util.template().render($('#unfollow-list-template', $rootel), {
                'users': usersToUnfollow,
                'displayOptions': {
                    'metadata': false
                }
            }, $('#unfollow-list-container', $rootel));

            // Hide the spinner icons using jQuery
            // @see https://github.com/FortAwesome/Font-Awesome/issues/729
            $('.fa-spinner', $rootel).hide();
        };

        /**
         * Unfollow the selected users
         */
        var unfollow = function() {
            var done = 0;
            var todo = usersToUnfollow.length;
            var errCount = 0;

            // Lock the modal
            $('#unfollow-modal', $rootel).modal('lock');

            /**
             * Unfollow a single user and calls itsself when not done or finishes the
             * unfollowing process by calling `finishUnfollow` and passing in the error count
             * and how many unfollow requests where made
             *
             * @param  {String}    userId    The ID of the user to unfollow
             */
            var unfollowUser = function(userId) {
                var $listItem = $('ul li[data-id="' + userId + '"]', $rootel);
                var $spinner = $listItem.find('.fa-spinner');
                var $ok = $listItem.find('.fa-check');
                var $warning = $listItem.find('.fa-exclamation-triangle');

                // Show the progress indicator
                $spinner.show();

                oae.api.follow.unfollow(userId, function(err) {
                    // Hide the progress indicator
                    $spinner.hide();
                    if (err) {
                        // If there is an error, show the warning icon
                        $warning.show();
                        errCount++;
                    } else {
                        // If there is no error, show the success icon
                        $ok.show();
                    }

                    done++;
                    // If not all users have been handled, unfollow the next user
                    if (done !== todo) {
                        unfollowUser(usersToUnfollow[done].id);
                    // If all users have been handled, show a notification and close
                    // the modal if all users have been unfollowed successfully
                    } else {
                        finishUnfollow(errCount);
                    }
                });
            };

            // Unfollow the first user
            unfollowUser(usersToUnfollow[0].id);
        };

        /**
         * Finish the unfollow process by showing a success or failure notification, hiding the modal and
         * sending out am `oae.unfollow.done` event.
         *
         * @param  {Number}    errCount    The number of errors that happened when unfollowing users
         */
        var finishUnfollow = function(errCount) {
            // Show a success or failure notification
            var resultData = {
                'users': usersToUnfollow,
                'errCount': errCount
            };
            var notificationTitle = oae.api.util.template().render($('#unfollow-notification-title-template', $rootel), resultData);
            var notificationBody = oae.api.util.template().render($('#unfollow-notification-body-template', $rootel), resultData);
            oae.api.util.notification(notificationTitle, notificationBody, errCount ? 'error' : 'success');

            // Refresh the network list
            $(document).trigger('oae.unfollow.done');

            // Deselect all list items and disable list option buttons
            $(document).trigger('oae.list.deselectall');

            // Unlock the modal
            $('#unfollow-modal', $rootel).modal('unlock');

            // If no errors occurred, close the modal
            if (errCount === 0) {
                $('#unfollow-modal', $rootel).modal('hide');
            }
        };

        /**
         * Initializes the unfollow modal dialog
         */
        var setUpUnfollowModal = function() {
            $(document).on('click', '.oae-trigger-unfollow', function() {
                // Show the modal
                $('#unfollow-modal', $rootel).modal({
                    'backdrop': 'static'
                });

                // Request the context information
                $(document).trigger('oae.list.getSelection', 'unfollow');
            });

            // Listen to the event that returns the list of selected users
            $(document).on('oae.list.sendSelection.unfollow', function(ev, selected) {
                usersToUnfollow = selected.results;
                renderUnfollow();
            });

            // Bind the 'unfollow' button that will unfollow the selected users
            $rootel.on('click', '#unfollow-unfollow', unfollow);
        };

        setUpUnfollowModal();

    };
});
