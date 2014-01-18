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

define(['jquery', 'oae.api.util'], function (jQuery, oaeUtil) {
    (function($) {

        // Padding is adjusted for mobile phones when the page is rendered
        // This variable keeps track of what was chosen in CSS media queries.
        var navPadding = '25px';

        /**
         * Open the left hand navigation
         */
        var openLeftHandNav = function() {
            navPadding = $('.oae-page').css('padding-left');
            // First set the opacity and width to 0 before animating it
            $('.oae-lhnavigation').css({
                'opacity': 0,
                'width': 0
            });
            // Remove the bootstrap responsive hidden classes
            $('.oae-lhnavigation > ul').removeClass('hidden-xs hidden-sm');
            // Animate the opacity and width
            $('.oae-lhnavigation').animate({
                'opacity': 1,
                'width': '210px'
            }, 250);
            // Animate the padding of the page to 200px (width of the left hand nav)
            $('.oae-page').animate({
                'padding-left': '220px'
            }, 250, function() {
                $('.oae-page').addClass('oae-page-expanded');
            });
        };

        /**
         * Close the left hand navigation
         */
        var closeLeftHandNav = function() {
            // Animate the width and opacity to 0
            $('.oae-lhnavigation').animate({
                'opacity': 0,
                'width': 0
            }, 250);
            // Animate the padding of the page to 25 pixels
            $('.oae-page').animate({
                'padding-left': '25px'
            }, 250, function() {
                // Add the bootstrap and OAE helper classes
                $('.oae-lhnavigation > ul').addClass('hidden-xs hidden-sm');
                $('.oae-page').removeClass('oae-page-expanded');
            });
        };

        /**
         * Close the left hand navigation when clicking a navigation link on a handheld device
         */
        $(document).on('click', '.oae-lhnavigation > ul > li:not(.collapse)', function() {
            if (oaeUtil.isHandheldDevice()) {
                closeLeftHandNav();
            }
        });

        /**
         * Toggle the left hand navigation with animation
         */
        $(document).on('click', '.oae-lhnavigation-toggle', function(ev) {
            // If the left hand navigation is open close it
            if ($('.oae-page').hasClass('oae-page-expanded')) {
                closeLeftHandNav();
            // If the left hand navigation is closed open it
            } else {
                openLeftHandNav();
            }
        });

    })(jQuery);
});
