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

define(['jquery', 'oae.api.util'], function (jQuery, oaeUtil) {
    (function($) {

        var LHNAVIGATION_WIDTH = 210;
        var LHNAVIGATION_PADDING = 25;

        /**
         * Open the left hand navigation
         */
        var openLhNav = function() {
            // First set the opacity and width to 0 before animating it
            $('.oae-lhnavigation').css({
                'opacity': 0,
                'width': 0
            });
            // Remove the bootstrap responsive hidden classes to show the left hand
            // navigation when animating on smaller screens
            $('.oae-lhnavigation > ul').removeClass('hidden-xs hidden-sm');
            // Animate the opacity and width
            $('.oae-lhnavigation').animate({
                'opacity': 1,
                'width': LHNAVIGATION_WIDTH  + 'px'
            }, 250);
            // Animate the padding of the page to 200px (width of the left hand nav) + 20 pixels (margin)
            $('.oae-page').animate({
                'padding-left': (LHNAVIGATION_WIDTH + 10) + 'px'
            }, 250, function() {
                $('.oae-lhnavigation').addClass('oae-lhnav-expanded');
            });
        };

        /**
         * Close the left hand navigation
         */
        var closeLhNav = function() {
            // Animate the width and opacity to 0
            $('.oae-lhnavigation').animate({
                'opacity': 0,
                'width': 0
            }, 250);
            // Animate the padding of the page to 25 pixels
            $('.oae-page').animate({
                'padding-left': LHNAVIGATION_PADDING + 'px'
            }, 250, function() {
                // Add the bootstrap and OAE helper classes
                $('.oae-lhnavigation > ul').addClass('hidden-xs hidden-sm');
                $('.oae-lhnavigation').removeClass('oae-lhnav-expanded');
            });
        };

        /**
         * Close the left hand navigation when clicking a navigation link, but not an action link (e.g., Share)
         * as that opens a widget that intends to overlay the left hand menu.
         */
        $(document).on('click', '.oae-lhnavigation > ul > li:not(.oae-lhnavigation-action)', closeLhNav);

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
