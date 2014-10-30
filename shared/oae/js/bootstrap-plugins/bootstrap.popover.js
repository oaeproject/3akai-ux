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
     * Cache the currently open popover and any other popovers that it
     * has superceded
     */
    var popovers = [];

    /**
     * Hide the currently open popover and restore the most recent
     * previous popover
     */
    var hidePopover = function() {
        if (popovers.length > 0) {
            popovers.shift().popover('hide');
            if (popovers.length > 0) {
                popovers[0].popover('show');
            }
        }
    };

    /**
     * When a new popover is shown, add it to the stack 
     *
     * @param  {Event}    ev    Standard Bootstrap `shown` event
     */
    $(document).on('shown.bs.popover', function(ev) {
        // Use a timeout to make sure the event is completely processed
        // before updating the stack
        setTimeout(function() {
            popovers.unshift($(ev.target));
        }, 0);
    });

    /**
     * Hide the popover when the user clicks anywhere else in the document
     *
     * @param  {Event}    ev    Standard jQuery click event
     */
    $(document).on('click', function(ev) {
        // If the click was not inside popover content, hide the
        // current popover
        if ($(ev.target).parents('.popover-content').length === 0) {
            hidePopover();
        }
    });

    /**
     * Catch the keypress event for `escape` and hide the open popover
     *
     * @param  {Event}    ev    Standard jQuery click event
     */
    $(document).on('keyup', function(ev) {
        var keyCode = parseInt(ev.which, 10);
        if (keyCode === 27) {
            hidePopover();
        }
    });
});
