/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
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
        // Catches a change in the oae-visibility-choice radio button group and sends out an event
        $(document).on('change', '.oae-visibility-choice input[type="radio"]', function() {
            $(document).trigger('oae-visibility-changed', {'radio': this});
        });
    })(jQuery);
});
