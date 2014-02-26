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

define(['jquery'], function($) {

    /**
     * Close popovers and remove them from the DOM
     */
    var closePopovers = function() {
        var $popover = $('.popover');
        $($popover.prev()).popover('destroy');
        $popover.detach();
    };

    /**
     * Close any popovers that are open when an element other than the popover or one of
     * its children is clicked
     *
     * @param  {Event}    ev    Standard jQuery click event
     */
    $('body').on('click', function(ev) {
        if ($('.popover').length && !$(ev.target).parents('.popover').length) {
            closePopovers();
            ev.stopPropagation();
        }
    });

    /**
     * Catch the keypress event for `escape` and close any popovers that are open
     *
     * @param  {Event}    ev    Standard jQuery click event
     */
    $(document).on('keyup', function(ev) {
        var keyCode = parseInt(ev.which, 10);
        if (keyCode === 27 && $('.popover').length) {
            closePopovers();
        }
    });
});
