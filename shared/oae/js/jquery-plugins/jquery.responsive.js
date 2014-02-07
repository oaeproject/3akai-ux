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
 * Utility plugin that handles the responsive left hand navigation interactions.
 *     - Ability to open and close the navigation using the `.oae-lhnavigation-toggle` class on desktop and mobile.
 *     - When a `page link` is clicked on a mobile device the navigation will close (does not apply on desktop). The navigation stays visible when an `action button` is clicked as this doesn't show a new page.
 *     - Toggling the visiblity of the navigation uses css transitions to transition '.oae-lhnavigation' and '.oae-page' to their expanded state on desktop and mobile.
 *     - '.oae-lhnav-collapsing' is set to enable css transitions on the elements. It is removed once the transitions have ended.
 *     - '.oae-lhnav-expanded' is responsible for setting the required properties needed by '.oae-lhnavigation' and '.oae-page' to be shown in their expanded state.
 */

define(['jquery', 'underscore', 'oae.api.util'], function (jQuery, _, oaeUtil) {
    (function($) {
        // Time (in ms) it takes for the left hand nav opening/closing animation to finish.
        var LHNAVIGATION_ANIMATION_TIME = 250;

        /**
         * Toggle the left hand navigation. Throttle the function to prevent it from being triggered during animation.
         *
         * @param  {Boolean}   showNav   True when the left hand navigation should be shown, false when the left hand navigation should be hidden.
         */
        var toggleLhNav = _.throttle(function(showNav) {
            var $lhNav = $('.oae-lhnavigation').addClass('oae-lhnav-collapsing').toggleClass('oae-lhnav-expanded', showNav);
            if (showNav) {
                // Remove the bootstrap responsive hidden classes to show the left hand
                // navigation when animating on smaller screens
                $lhNav.children('ul').removeClass('hidden-xs hidden-sm');
            }

            setTimeout(function() {
                $lhNav.removeClass('oae-lhnav-collapsing');
                if (!showNav) {
                    // Add the bootstrap and OAE helper classes once the closing animation is finished
                    $lhNav.children('ul').addClass('hidden-xs hidden-sm');
                }
            }, LHNAVIGATION_ANIMATION_TIME);
        }, LHNAVIGATION_ANIMATION_TIME + 20);

        /**
         * Close the left hand navigation using animation when clicking a navigation link on a handheld device.
         * Actions in the left hand navigation trigger a widget and shouldn't close the left hand navigation.
         * If the user is on a desktop browser the left hand navigation should never close.
         */
        $(document).on('click', '.oae-lhnavigation > ul > li:not(.oae-lhnavigation-action)', function() {
            if (oaeUtil.isHandheldDevice()) {
                toggleLhNav(false);
            }
        });

        /**
         * Toggle the left hand navigation with animation. The left hand navigation can only
         * be toggled in small and extra small viewports.
         */
        $(document).on('click', '.oae-lhnavigation-toggle', function(ev) {
            // Open the left hand navigation if it's closed, otherwise close it.
            toggleLhNav(!$('.oae-lhnavigation').hasClass('oae-lhnav-expanded'));
        });

    })(jQuery);
});
