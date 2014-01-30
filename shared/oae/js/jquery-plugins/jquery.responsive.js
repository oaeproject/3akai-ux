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
 *     - Toggling the visiblity of the navigation uses animation to fade-in/fade-out on desktop and mobile.
 *     - When a `page link` is clicked on a mobile device the navigation will close (does not apply on desktop). The navigation stays visible when an `action button` is clicked as this doesn't show a new page.
 */

define(['jquery', 'underscore', 'oae.api.util'], function (jQuery, _, oaeUtil) {
    (function($) {
        var LHNAVIGATION_ANIMATION_TIME = 250;

        /**
         * Open the left hand navigation
         */
        var openLhNav = _.throttle(function() {
            // Remove the bootstrap responsive hidden classes to show the left hand
            // navigation when animating on smaller screens
            $('.oae-lhnavigation > ul').removeClass('hidden-xs hidden-sm');
            $('.oae-lhnavigation').addClass('oae-lhnav-expanded');
        }, LHNAVIGATION_ANIMATION_TIME * 2);

        /**
         * Close the left hand navigation
         */
        var closeLhNav = _.throttle(function() {
            $('.oae-lhnavigation').removeClass('oae-lhnav-expanded');
            setTimeout(function() {
                // Add the bootstrap and OAE helper classes when the collpasing animation is finished
                $('.oae-lhnavigation > ul').addClass('hidden-xs hidden-sm');
            }, LHNAVIGATION_ANIMATION_TIME - 15);
        }, LHNAVIGATION_ANIMATION_TIME * 2);

        /**
         * Close the left hand navigation when clicking a navigation link on a handheld device.
         * Actions in the left hand navigation trigger a widget and shouldn't close the left hand navigation.
         * If the user is on a desktop browser the left hand navigation should never close automatically.
         */
        $(document).on('click', '.oae-lhnavigation > ul > li:not(.oae-lhnavigation-action)', function() {
            if (oaeUtil.isHandheldDevice()) {
                closeLhNav();
            }
        });

        /**
         * Toggle the left hand navigation with animation. The left hand navigation can only
         * be toggled in small and extra small viewports.
         */
        $(document).on('click', '.oae-lhnavigation-toggle', function(ev) {
            // If the left hand navigation is open, close it
            if ($('.oae-lhnavigation').hasClass('oae-lhnav-expanded')) {
                closeLhNav();
            // If the left hand navigation is closed, open it
            } else {
                openLhNav();
            }
        });

    })(jQuery);
});
