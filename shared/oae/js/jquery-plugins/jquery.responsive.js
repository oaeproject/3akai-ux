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
         * Determine whether or not the left-hand nav is expanded
         *
         * @return {Boolean}    `true` if the left-hand nav is expanded, `false` otherwise
         */
        var isLhNavExpanded = function() {
            return $('.oae-lhnavigation').hasClass('oae-lhnav-expanded');
        };

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
         * Close the left hand navigation when the user selects items that should be closed
         * when clicked.
         */
        $(document).on('click', '.oae-lhnavigation > ul li[data-close-nav]', function() {toggleLhNav(false);});

        /**
         * Toggle the left hand navigation with animation. The left hand navigation can only
         * be toggled in small and extra small viewports.
         */
        $(document).on('click', '.oae-lhnavigation-toggle', function(ev) {
            // Open the left hand navigation if it's closed, otherwise close it.
            toggleLhNav(!$('.oae-lhnavigation').hasClass('oae-lhnav-expanded'));
        });

        /**
         * Close the left hand navigation when anything within the main page, except for the
         * `oae-lhnavigation-toggle`, receives focus whilst the left hand navigation is still open.
         */
        $(document).on('focusin', '.oae-page', function(ev) {
            if (isLhNavExpanded() && !$(ev.target).hasClass('oae-lhnavigation-toggle')) {
                toggleLhNav(false);
            }
        });

        /**
         * Dismiss the keyboard on a mobile device when a search form is submitted. This won't be
         * noticable on desktop browsers.
         *
         * @see https://github.com/oaeproject/3akai-ux/issues/3401
         */
        $(document).on('submit', 'form[role="search"]', function() {
            $(this).find('.search-query').blur().focus();
        });

    })(jQuery);
});
