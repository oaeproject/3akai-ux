/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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

define(['jquery'], function (jQuery) {
    (function() {

        /**
         * Catch the keypress event for `enter` and `space` when an editable field has focus
         */
        $(document).on('focus', '.jeditable-field', function(ev) {
            $(this).keypress(function(ev) {
                if (ev.which == 13 || ev.which == 32){
                    $(this).trigger('click.editable');
                }
            });
        });

    })();
});
