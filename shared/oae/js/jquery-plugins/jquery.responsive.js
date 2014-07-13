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

/**
 * Utility plugin that handles the responsive left hand navigation interactions. This plugin will support the
 * opening and closing of the left hand navigation using the `.oae-lhnavigation-toggle` element using an animation.
 * When a page link is clicked on a mobile device, the navigation will automatically close. The navigation will
 * remain visible when an action button is clicked, as this doesn't render a new page.
 */

define(['jquery', 'oae.api.util'], function (jQuery, oaeUtil) {
    (function($) {

        /**
         * Determine whether or not the left-hand nav is expanded
         *
         * @return {Boolean}    `true` if the left-hand nav is expanded, `false` otherwise
         */
        var isLhNavExpanded = function() {
            return $('.oae-lhnavigation').hasClass('oae-lhnav-expanded');
        };

        /**
         * Toggle the left hand navigation between its expanded and collapsed state
         */
        var toggleLhNav = function() {
            $('.oae-lhnavigation').toggleClass('oae-lhnav-expanded');
        };

        /**
         * Close the left hand navigation when the user selects items that are marked with
         * the attribute `data-close-nav`
         */
        $(document).on('click', '.oae-lhnavigation > ul li[data-close-nav]', function() {
            if (isLhNavExpanded()) {
                toggleLhNav();
            }
        });

        /**
         * Clicking the toggle will expand / collapse the lhnavigation
         */
        $(document).on('click', '.oae-lhnavigation-toggle', toggleLhNav);

        /**
         * Close the left hand navigation when anything within the main page, except for the
         * `oae-lhnavigation-toggle`, receives focus whilst the left hand navigation is still open
         */
        $(document).on('focusin', '.oae-page', function(ev) {
            if (isLhNavExpanded() && !$(ev.target).hasClass('oae-lhnavigation-toggle')) {
                toggleLhNav();
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
