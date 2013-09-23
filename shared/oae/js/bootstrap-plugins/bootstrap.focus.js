/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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
 * Bootstrap plugin that takes care of focussing the clicked element
 * after a modal has been closed
 */

define(['jquery', 'bootstrap'], function($) {

    // Store the focussed element
    var focussedEl = null;

    // When the modal is shown
    $('body').on('show.bs.modal', function(e) {
        focussedEl = document.activeElement || null;
    });

    // When the modal is hidden, we need to re-focus the clicked element
    $('body').on('hidden.bs.modal', function(e) {
        if (focussedEl) {
            $(focussedEl).focus();
            focussedEl = null;
        }
    });
});
