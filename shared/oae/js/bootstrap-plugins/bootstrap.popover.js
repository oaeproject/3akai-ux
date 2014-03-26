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

    var $currentPopover = null;
    var $prevPopover = null;

    /**
     * Hide the open popover and reset the `$currentPopover` to null as none will be open
     */
    var hidePopover = function($popover) {
        $popover.popover('hide');

        // If we're hiding the current popover that means that all previous popovers are closed
        // as well and we reset to the initial state
        if ($popover[0] === $currentPopover[0]) {
            $currentPopover = null;
            $prevPopover = null;
        }
    };

    /**
     * Assign the current open popover to the `$currentPopover` variable to be able to
     * reference it later.
     *
     * @param  {Event}    ev    Standard Bootstrap `shown` event
     */
    $(document).on('shown.bs.popover', function(ev) {
        $prevPopover = $currentPopover;
        $currentPopover = $(ev.target);
    });

    /**
     * Hide the popover when the user clicks anywhere else in the document
     *
     * @param  {Event}    ev    Standard jQuery click event
     */
    $(document).on('click', function(ev) {
        // If the popover was clicked or the trigger ignore the click, otherwise close the popover
        if ($currentPopover && !$.contains($currentPopover[0], ev.target) && ev.target !== $currentPopover[0] && !$.contains($('.popover')[0], ev.target)) {
            hidePopover($currentPopover);
        } else if ($prevPopover && $prevPopover[0]) {
            hidePopover($prevPopover);
        }
    });

    /**
     * Catch the keypress event for `escape` and hide the open popover
     *
     * @param  {Event}    ev    Standard jQuery click event
     */
    $(document).on('keyup', function(ev) {
        var keyCode = parseInt(ev.which, 10);
        if (keyCode === 27 && $currentPopover) {
            hidePopover($currentPopover);
        }
    });
});
