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
 * jQuery plugin that will detect the clips that are present on the page, and
 * will take care of making them active where necessary. This includes showing
 * and hiding the admin options and toggling the caret icons
 */

define(['jquery'], function (jQuery) {
    (function($) {
        // Add click event handler that toggles the action items of a clip
        $(document).on('click', '.oae-clip-content > button:not(:disabled)', function(ev) {
            var $clip = $(this).parent();
            // Only do this in if a toggle icon is available. If not, this indicates
            // that we're looking and the clip in view only mode or there are no
            // clip actions available
            if ($('i.icon-caret-down, i.icon-caret-up', $clip).length > 0) {
                // Show/hide the options
                $('ul', $clip).toggle();
                // Toggle the caret icons
                $clip.find('i.icon-caret-down, i.icon-caret-up').toggleClass('icon-caret-down icon-caret-up');
            }
        });
    })(jQuery);
});
