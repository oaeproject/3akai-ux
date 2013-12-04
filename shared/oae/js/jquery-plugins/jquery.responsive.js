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

define(['jquery'], function (jQuery) {
    (function($) {

        /**
         * Toggle the left hand navigation
         */
        $(document).on('click', '.oae-lhnavigation-toggle', function(ev) {
            $('.oae-lhnavigation > ul').toggleClass('hidden-xs hidden-sm');
            $('.oae-page').toggleClass('oae-page-expanded');
        });

    })(jQuery);
});
