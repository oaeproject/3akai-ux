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

define(['jquery'], function (jQuery) {
    (function($) {

        /**
         * Catch the keypress event for `enter` and `space` when an editable field has focus
         */
        $(document).on('focus', '.jeditable-field', function(ev) {
            $(document).off('keydown', '.jeditable-field').on('keydown', '.jeditable-field', function(ev) {
                if ($(ev.target).hasClass('jeditable-field')) {
                    // IE has a different way of dealing with `hidden` events bootstrap is sending out
                    // which results in unexpected behaviour in combination with jquery.jeditable
                    // Removing the tooltip from the jeditable field beforehand avoids the issue.
                    $('[rel="tooltip"]').tooltip('destroy');
                    $('.tooltip').hide().detach();

                    var keyCode = parseInt(ev.which, 10);
                    if (keyCode === 13 || keyCode === 32) {
                        $(this).trigger('click.editable');
                    }
                }
            });
        });

        /**
         * Catch the blur event for an editable field so the tooltip can be applied
         */
        $(document).on('blur', '.jeditable-field', function(ev) {
            if ($(ev.target).hasClass('jeditable-field')) {
                var that = this;
                // IE has a different way of dealing with `hidden` events bootstrap is sending out
                // which results in unexpected behaviour in combination with jquery.jeditable
                // Removing the tooltip from the jeditable field beforehand avoids the issue.
                // We need to reapply the tooltip when the jeditable field focus is lost
                setTimeout(function() {
                    $(that).tooltip({
                        'animation': false
                    });
                }, 50);
            }
        });

    })(jQuery);
});
