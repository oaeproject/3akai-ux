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

define(['jquery', 'oae.api.util', 'jquery.history'], function ($, oaeUtil) {
    (function() {

        /**
         * Show or hide the list header actions when clicking the header toggle
         */
        $(document).on('click', 'button.oae-list-header-toggle', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $listContainer = $(this).parents('.oae-list-container');
            var $listHeaderActions = $('.oae-list-header-actions', $listContainer);

            // Toggle the visibility of the list header actions
            if ($listHeaderActions.is(':visible')) {
                $listHeaderActions.slideUp(200);
            } else {
                $listHeaderActions.slideDown(200);
            }

            // Toggle the caret icon in the list header
            $(this).find('i').toggleClass('fa-caret-down fa-caret-up');
        });

        /**
         * Updates the History.js state to contain a search query from the list header search field
         * (if any). This implicitly triggers the `window` `statechange` event such that consumers
         * of the list header functionality can perform the operations needed to execute the user's
         * search.
         *
         * After the search has completed, the search query will be available with History.js. For
         * example:
         *
         * ```javascript
         *  // Subscribes to the event that is invoked when the user has performed a search with the
         *  // list header
         *  $(window).on('statechange', function() {
         *      // Fetches the query from the History.js module
         *      var query = History.getState().data.query
         *
         *      // Finally, do something with the query (e.g., invoke a search and update the DOM)
         *  });
         * ```
         */
        $(document).on('submit', '.oae-list-header .form-search', function(ev) {
            var query = $('.oae-list-header-search-query', $(this)).val();

            // Push the new query to a new History.js state. We make sure to take the
            // existing state data parameters with us and construct a new URL based on
            // the existing base URL, allowing for page refreshing and bookmarking.
            var newState = $.extend({}, History.getState().data, {
                'query': query
            });

            // We cannot rely on the "current" url as that can be different depending on the browser.
            // Most browsers will display `/me/library`, IE9 will be display `/me#library` however.
            // The cleanUrl in the History.js state will always be `/me/library`.
            var url = $.url(History.getState().cleanUrl).attr('path') + '?q=' + oaeUtil.security().encodeForURL(query);
            History.pushState(newState, $('title').text(), url);

            // Avoid submitting the search form
            ev.preventDefault();
        });

        /**
         * Deselect the 'select all' checkboxes when the state changes
         */
        $(window).on('statechange', function() {
            $('.oae-list-selectall').prop('checked', false);
            $('.oae-list-header-actions > .btn').prop('disabled', true);
        });

        /**
         * Select or deselect all elements when clicking the select all checkbox in the
         * list header actions container
         */
        $(document).on('change', '.oae-list-selectall', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $listContainer = $(this).parents('.oae-list-container');
            // Check or uncheck all checkboxes in the corresponding list
            var checked = $(this).is(':checked');
            var $listCheckboxes = $('.oae-list input[type="checkbox"]', $listContainer);
            $listCheckboxes.prop('checked', checked);
            // Enable or disable the list option action buttons. We only change the state
            // when there is at least 1 item in the list that can be checked.
            if ($listCheckboxes.length > 0) {
                $('.oae-list-header-actions > .btn', $listContainer).prop('disabled', !checked);
            }
        });

        /**
         * Deselect all elements in the list
         */
        $(document).on('oae.list.deselectall', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $listContainer = $('.oae-list-container:visible');
            // Deselect all checkboxes in the list
            var $listCheckboxes = $('.oae-list:visible input[type="checkbox"]', $listContainer);
            $listCheckboxes.prop('checked', false);
            // Uncheck the 'select all' checkbox
            $('.oae-list-selectall', $listContainer).prop('checked', false);
            // Disable all buttons in the list header actions container
            $('.oae-list-header-actions:visible > .btn', $listContainer).prop('disabled', true);
        });

        /**
         * Switch the view mode between grid view, details view and compact view
         */
        $(document).on('click', '.oae-list-header .btn-group button', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $listContainer = $(this).parents('.oae-list-container');
            // Update the list view switch buttons
            $('.oae-list-header .btn-group button', $listContainer).removeClass('active');
            $(this).addClass('active');
            // Change the view type in the list itself
            $('.oae-list', $listContainer).removeClass('oae-list-grid oae-list-details oae-list-compact');
            $('.oae-list', $listContainer).addClass($(this).attr('data-type'));
        });

        /**
         * When a checkbox is checked/unchecked, we make sure that its corresponding checkbox in the
         * other views are checked as well. When at least 1 list item is checked, the list header
         * actions are shown and the list header action buttons are enabled. When no checkboxes are
         * checked in the list, the list header action container collapses and the list header action
         * buttons are disabled.
         */
        $(document).on('click', '.oae-list input[type="checkbox"]', function() {
            // Get the list item the checkbox corresponds to and make sure the other views have the
            // same checked status
            $listItem = $(this).parents('li');
            $('input[type="checkbox"]', $listItem).prop('checked', $(this).is(':checked'));

            // Get the list container, so we don't end up changing state in other lists
            var $listContainer = $(this).parents('.oae-list-container');
            var $listHeaderActions = $('.oae-list-header-actions', $listContainer);

            // Hide the list header actions when no checkboxes are checked anymore. Show the list header
            // actions when at least 1 checkbox is checked
            var totalChecked = $('.oae-list input[type="checkbox"]:visible:checked', $listContainer).length;
            if ((totalChecked > 0 && !$listHeaderActions.is(':visible')) ||
                (totalChecked === 0 && $listHeaderActions.is(':visible'))) {
                $('button.oae-list-header-toggle', $listContainer).click();
            }

            // Enable or disable the list header action buttons
            $('.oae-list-header-actions > .btn', $listContainer).prop('disabled', (totalChecked === 0));
        });

        /**
         * The `oae.list.getSelection` or `oae.list.getSelection.<widgetname>` event can be sent by widgets
         * to get hold of the selected list items in the current list. In the first case, an
         * `oae.list.sendSelection` event will be sent out as a broadcast to all widgets listening
         * for the event. In the second case, an `oae.list.sendSelection.<widgetname>` event
         * will be sent out and will only be caught by that particular widget.
         *
         * @param  {Object}       ev                                          jQuery event
         * @param  {String}       [widgetId]                                  An optional widget ID. If an ID is specified an event will be triggered specifically for this widget.
         * @return {Object}       selectedItems                               Object containing the selected items
         * @return {Object[]}     selectedItems.results                       Array of objects representing the selected list items
         * @return {String}       selectedItems.results[i].id                 Resource id of the selected list item
         * @return {String}       selectedItems.results[i].displayName        Display name of the selected list item
         * @return {String}       selectedItems.results[i].resourceType       Resource type of the selected list item (group, user, content, etc.)
         * @return {String}       [selectedItems.results[i].thumbnailUrl]     URL to the thumbnail image of the selected list item
         */
        $(document).on('oae.list.getSelection', function(ev, widgetId) {
            var selectedItems = {
                'results': []
            };

            // Collect all of the selected items
            var $checked = $('input[type="checkbox"]:visible:checked', $('.oae-list:visible'));
            $checked.each(function(index, checked) {
                // Get the parent list item
                var $checkedListItem = $(this).parents('li');

                // Get the id, resourceType and resourceSubType from the data attributes on the checkbox
                var id = $(checked).attr('data-id');
                var resourceType = $(checked).attr('data-resourceType');
                var resourceSubType = $(checked).attr('data-resourceSubType');
                // Get the displayName and thumbnail image from the content of the list item
                var displayName = $('h3:visible', $checkedListItem).text();
                var thumbnailImage = null;
                if ($('div[role="img"]:visible', $checkedListItem).length === 1) {
                    // The `background-image` property can return in the following ways:
                    //   * `url(http://tenant.oae.com/path/to/image)`
                    //   * `url('http://tenant.oae.com/path/to/image')`
                    //   * `url("http://tenant.oae.com/path/to/image")`
                    // In order to extract the URL, we grab what's between the brackets and remove all quotes
                    // @see http://stackoverflow.com/questions/20857404/regex-to-extract-url-from-css-background-styling
                    var thumbnailImageCSS = $('div[role="img"]:visible', $checkedListItem).css('background-image');
                    thumbnailImage = thumbnailImageCSS.match(/\((.*?)\)/)[1].replace(/('|")/g,'');
                }

                selectedItems.results.push({
                    'id': id,
                    'displayName': displayName,
                    'resourceType': resourceType,
                    'resourceSubType': resourceSubType,
                    'thumbnailUrl': thumbnailImage
                });
            });

            // Respond to the request event by sending the list of selected items
            if (widgetId) {
                $(document).trigger('oae.list.sendSelection.' + widgetId, selectedItems);
            } else {
                $(document).trigger('oae.list.sendSelection', selectedItems);
            }
        });

    })();
});
