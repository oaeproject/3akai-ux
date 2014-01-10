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
 * OAE jQuery plugin that will allow for a jQuery.fileUpload Browse button, used to invoke
 * the filepicker dialog, to be made keyboard accessible. This is necessary because such
 * a Browse button is a regular `span` element in which a hidden file input element is
 * contained. This hidden element does receive keyboard focus by default, but doesn't show
 * the focus style as it is hidden. Therefore, we add a CSS class to the Browse button to fake the
 * focus style.
 */

define(['jquery'], function (jQuery) {
    (function($) {

        /**
         * Add the `oae-focus` class to the Browse button when the file input field receives focus
         */
        $(document).on('focus', 'input[type="file"]', function() {
            // When the file input element is used with a jQuery.fileUpload Browse button, we assume
            // that it will be wrapped in a span element that is disguised as a button
            var $browseButton = $(this).parent();
            if ($browseButton.hasClass('btn')) {
                $browseButton.addClass('oae-focus');
            }
        });

        /**
         * Remove the `oae-focus` class from the Browse button when the file input field loses focus
         */
        $(document).on('focusout', 'input[type="file"]', function() {
            // When the file input element is used with a jQuery.fileUpload Browse button, we assume
            // that it will be wrapped in a span element that is disguised as a button
            var $browseButton = $(this).parent();
            if ($browseButton.hasClass('btn')) {
                $browseButton.removeClass('oae-focus');
            }
        });

    })(jQuery);
});
