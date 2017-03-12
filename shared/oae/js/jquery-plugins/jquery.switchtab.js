/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
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
 * Utility plugin that handles the "switch tab" component interactions.
 */

define(['jquery', 'oae.api.util', 'jquery.history'], function (jQuery, oaeUtil) {
    (function($) {

        /**
         * OAE plugin that implements the interaction of the "Switch Tab" component. A Switch Tab
         * is essentially a set of tabs that look like a left-to-right switch. There can only be
         * one selected at one time. Back functionality is also provided.
         *
         * For usage, refer to switchtab style documentation in `oae.components.css`
         */
        $.fn.switchtab = function() {
            var $switchtab = $(this);

            var currentId = getIdFromState($switchtab);

            // When a switchtab tab is clicked, we should update the History.js state with the href
            // of the item that was clicked. The `$(window).on('statechange')` listener then takes
            // care of all the DOM updates
            $switchtab.on('click', 'a', function() {
                var $el = $(this);
                var id = $el.attr('aria-controls');
                if (id !== currentId) {
                    currentId = id;
                    pushIdToState($switchtab, id);
                }
                return false;
            });

            // Initialize the state
            pushIdToState($switchtab, currentId, true);

            // Each time the state changes (e.g., back button), update the elements on the DOM
            $(window).on('statechange', function() {
                var id = getIdFromState($switchtab);
                if (id !== currentId) {
                    currentId = id;
                    pushIdToElement($switchtab, id);
                }
            });

            return $switchtab;
        };

        /**
         * Get the tab id of the currently selected element
         */
        $.fn.switchtabId = function() {
            return getIdFromState($(this));
        };

        /*!
         * Get the querystring of the current page as a string
         */
        var getQueryString = function() {
            var url = History.getState().cleanUrl;
            return url.split('?')[1];
        };

        /*!
         * Get the id of the switchtab that should be active based on the current page
         *
         * @param  {jQuery}     $switchtab  The switchtab element that contains the tabs
         */
        var getIdFromState = function($switchtab) {
            var id = null;
            var path = oaeUtil.url(History.getState().cleanUrl).attr('path');
            $switchtab.find('a').each(function(i, el) {
                var $el = $(el);
                var elPath = $el.attr('href');
                if (path.indexOf(elPath) === 0) {
                    id = $el.attr('aria-controls');
                }
            });
            return id;
        };

        /*!
         * Given a switchtab id, set the History state to be that described by the tab element
         *
         * @param  {jQuery}     $switchtab  The switchtab element that contains the tabs
         * @param  {String}     id          The tab id to use to set the current History state
         * @param  {Boolean}    init        Whether or not this is the initial switchtab invokation. If it is, we will want to `replace` current state instead of `push` it, as that will result in a bogus back step
         */
        var pushIdToState = function($switchtab, id, init) {
            var $target = pushIdToElement($switchtab, id);
            var data = History.getState().data;
            var path = $target.attr('href');
            var queryString = getQueryString();
            if (queryString) {
                path += '?' + queryString;
            }

            if (!init) {
                History.pushState(data, null, path);
            } else {
                History.replaceState(data, null, path);
            }
        };

        /*!
         * Given an id, set the CSS state such that the active tab will be labelled as such for
         * display purposes
         *
         * @param  {jQuery}     $switchtab  The switchtab element that contains the tabs
         * @param  {String}     id          The tab id to use to set the element CSS classes
         */
        var pushIdToElement = function($switchtab, id) {
            var $target = $switchtab.find('a[aria-controls="' + id + '"]');
            $target.parent('li').addClass('active');
            $switchtab.find('a[aria-controls!="' + id + '"]').parent('li').removeClass('active');
            return $target;
        };

    })(jQuery);
});
