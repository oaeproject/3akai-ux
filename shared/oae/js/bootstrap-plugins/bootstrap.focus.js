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
});
