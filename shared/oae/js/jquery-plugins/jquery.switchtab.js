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

define(['jquery', 'jquery.history'], function (jQuery, oaeUtil) {
    (function($) {

        /**
         * OAE plugin that implements the interaction of the "Switch Tab" component. A Switch Tab
         * is essentially a set of tabs that look like a left-to-right switch. There can only be
         * one selected at one time. Back functionality is also provided.
         *
         * Usage:
         *
         *  You should create a template that looks like the following:
         *
         *  ```
         *  <div id="search-scope" class="oae-switchtab-container">
         *      <div class="oae-switchtab-control">
         *          <button class="oae-switchtab-switch" data-switchtab-id="all" data-switchtab-path="/search/all">
         *              <span class="oae-switchtab-switch-icon fa fa-globe"></span>
         *              <span class="oae-switchtab-switch-label">__MSG__EVERYWHERE__</span>
         *          </button>
         *          <button class="oae-switchtab-switch" data-switchtab-id="my" data-switchtab-path="/search/my">
         *              <span class="oae-switchtab-switch-icon fa fa-lock"></span>
         *              <span class="oae-switchtab-switch-label">__MSG__MY_STUFF_ONLY__</span>
         *          </button>
         *      </div>
         *  </div>
         *  ```
         *
         * Where all classes prefixed with `oae-switchtab` are specific to the switchtab component.
         * The following special data attributes are available:
         *
         *  *   data-switchtab-id (required): Indicates that id of the tab. It is used both
         *      internally to indentify the element and it is useful for the $.switchtabId() method
         *      in order to determine which tab is currently selected
         *  *   data-switchtab-path (required): Indicates not only at what path prefix the tab
         *      should be active, but also what path to push into the History module when the tab
         *      is clicked. Note that when navigating to a tab, the query string is retained
         *  *   data-switchtab-title (optional): If specified, indicates what browser title should
         *      be used for the tab
         *
         * To perform an action when the tab is changed, you should listen to `$(window).on('statechange')`
         * and use `$mySwitchTab.switchtabId()` to get the tab id of the currently active tab.
         */
        $.fn.switchtab = function() {
            var $switchtab = $(this);

            var currentId = _idFromState($switchtab);

            $switchtab.on('click', '.oae-switchtab-switch', function() {
                var $el = $(this);
                var id = $el.attr('data-switchtab-id');
                if (id !== currentId) {
                    currentId = id;
                    _idToState($switchtab, id);
                }
                return false;
            });

            // Initialize the state
            _idToState($switchtab, currentId, true);

            // Each time the state changes (e.g., back button), update the state
            $(window).on('statechange', function() {
                var id = _idFromState($switchtab);
                if (id !== currentId) {
                    currentId = id;
                    _idToElement($switchtab, id);
                }
            });

            return $switchtab;
        };

        /**
         * Get the tab id of the currently selected element
         */
        $.fn.switchtabId = function() {
            return _idFromState($(this));
        }

        /*!
         * Get the querystring of the current page as a string
         */
        var _queryString = function() {
            var url = History.getState().cleanUrl;
            return url.split('?')[1];
        };

        /*!
         * Get the id of the switchtab that should be active based on the current page
         *
         * @param  {jQuery}     $switchtab  The switchtab element that contains the tabs
         */
        var _idFromState = function($switchtab) {
            var id = null;
            var path = $.url(History.getState().cleanUrl).attr('path');
            $switchtab.find('.oae-switchtab-switch').each(function(i, el) {
                var $el = $(el);
                var elPath = $el.attr('data-switchtab-path');
                if (path.indexOf(elPath) === 0) {
                    id = $el.attr('data-switchtab-id');
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
        var _idToState = function($switchtab, id, init) {
            var $target = _idToElement($switchtab, id);
            var data = History.getState().data;
            var title = $target.attr('data-switchtab-title') || History.getState().title;
            var path = $target.attr('data-switchtab-path')
            var queryString = _queryString();
            if (queryString) {
                path += '?' + queryString;
            }

            if (!init) {
                History.pushState(data, title, path);
            } else {
                History.replaceState(data, title, path);
            }
        };

        /*!
         * Given an id, set the CSS stat such that the active tab will be labelled as such for
         * display purposes
         *
         * @param  {jQuery}     $switchtab  The switchtab element that contains the tabs
         * @param  {String}     id          The tab id to use to set the element CSS classes
         */
        var _idToElement = function($switchtab, id) {
            var $target = $switchtab.find('.oae-switchtab-switch[data-switchtab-id="' + id + '"]');
            $target.addClass('oae-switchtab-active');
            $switchtab.find('.oae-switchtab-switch[data-switchtab-id!="' + id + '"]').removeClass('oae-switchtab-active');
            return $target;
        }

    })(jQuery);
});
