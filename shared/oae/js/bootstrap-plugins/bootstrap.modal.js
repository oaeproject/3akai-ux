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
 * Bootstrap plugin that adds the ability to lock down a modal. Users will not be able
 * to dismiss a modal once `lock` has been called.
 *     e.g. $('#widget-modal').modal('lock');
 * The modal can then also be unlocked, which will re-enable all buttons and keys that
 * dismiss the modal.
 *     e.g. $('#widget-modal').modal('unlock');
 */

define(['jquery', 'bootstrap'], function($) {
    $.extend($.fn.modal.Constructor.prototype, {
        'lock': function() {
            // Set isShown to false. https://github.com/twitter/bootstrap/issues/1202#issuecomment-3698674
            this.$element.data('modal').isShown = false;
            // Disable buttons that dismiss the modal
            $('#' + this.$element.attr('id') + ' [data-dismiss="modal"]').attr('disabled', 'disabled');
        },
        'unlock': function() {
            // Set isShown to true. https://github.com/twitter/bootstrap/issues/1202#issuecomment-3698674
            this.$element.data('modal').isShown = true;
            // Enable buttons that dismiss the modal
            $('#' + this.$element.attr('id') + ' [data-dismiss="modal"]').removeAttr('disabled', 'disabled');
        }
    });
});
