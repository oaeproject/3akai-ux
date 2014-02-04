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

/**
 * Bootstrap plugin that takes care of focusing the element that was clicked to launch the modal
 */

define(['jquery', 'bootstrap'], function($) {

    // Element that had focus when the modal was invoked
    var $focusedEl = null;

    // When the modal is shown, we store the focused element
    $('body').on('show.bs.modal', function() {
        $focusedEl = $(':focus');
    });

    // When the modal is hidden, we need to re-focus the modal trigger
    $('body').on('hidden.bs.modal', function() {
        if ($focusedEl) {
            $focusedEl.focus();
        }
    });

    /*!
     * Work-around Safari iOS 7 bug where Safari does not update the position of fixed elements when the
     * keyboard or other tool bars are displayed. This work-around sets the backdrop to the full height
     * of the page to ensure the keyboard does not expose the page behind the modal backdrop.
     *
     * https://github.com/twbs/bootstrap/issues/9023
     */
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        $('body').on('show.bs.modal', function() {

            // Position backdrop absolute and make it span the entire page
            //
            // Also dirty, but we need to tap into the backdrop after Boostrap
            // positions it but before transitions finish.
            //
            setTimeout(function() {

                // Find the full height of the page
                var maxHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );

                // Resize the backdrop to be the full height of the page
                $('.modal-backdrop').css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'width': '100%',
                    'height': maxHeight + 'px'
                });
            }, 0);
        });
    }
});
