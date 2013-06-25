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

define(['jquery'], function ($) {
    (function() {

        /**
         * Show or hide the list options when clicking the page title toggle
         */
        $(document).on('click', '.oae-list-options-toggle', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $list = $(this).parents('.oae-list-options').parent();
            var $listOptionActions = $('.oae-list-options-actions', $list);
            // Hide the list options if they are currently showing. Show the list options
            // if they are currently hidden
            if ($listOptionActions.is(':visible')) {
                $listOptionActions.slideUp(200);
            } else {
                $listOptionActions.slideDown(200);
            }
            // Toggle the caret icon in the page title
            $(this).find('i').toggleClass('icon-caret-down icon-caret-up');
        });

        /**
         * Select or deselect all elements when clicking the select all checkbox in the
         * list options
         */
        $(document).on('change', '.oae-list-selectall', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $list = $(this).parents('.oae-list-options').parent();
            // Check or uncheck all checkboxes in the corresponding list
            var checked = $(this).is(':checked');
            var $listCheckboxes = $('.oae-list input[type="checkbox"]', $list);
            $listCheckboxes.prop('checked', checked);
            // Enable or disable the list option action buttons. We only change the state
            // when there is at least 1 item in the list that can be checked.
            if ($listCheckboxes.length > 0) {
                $('.oae-list-options-actions > .btn', $list).prop('disabled', !checked);
            }
        });

        /**
         * Switch the view mode between grid view, details view and compact view
         */
        $(document).on('click', '.oae-list-options .btn-group button', function() {
            // Get the list container, so we don't end up changing state in other lists
            var $list = $(this).parents('.oae-list-options').parent();
            // Update the list view switch buttons
            $('.oae-list-options .btn-group button', $list).removeClass('active');
            $(this).addClass('active');
            // Change the view type in the list itself
            $('.oae-list', $list).removeClass('oae-list-grid oae-list-details oae-list-compact');
            $('.oae-list', $list).addClass($(this).attr('data-type'));
        });

        /**
         * When a checkbox is checked/unchecked, we make sure that its corresponding checkbox in the
         * other views are checked as well. When at least 1 list item is checked, the list options
         * are shown and the list option action buttons are enabled. When no checkboxes are checked
         * in the list, the list options are hidden and the list option actions buttons are disabled.
         */
        $(document).on('click', '.oae-list input[type="checkbox"]', function() {
            // Get the list item the checkbox corresponds to and make sure the other views have the
            // same checked status
            $listItem = $(this).parents('li');
            $('input[type="checkbox"]', $listItem).prop('checked', $(this).is(':checked'))

            // Get the list container, so we don't end up changing state in other lists
            var $list = $(this).parents('.oae-list').parent();
            var $listOptionActions = $('.oae-list-options-actions', $list);

            // Hide the list options when no checkboxes are checked anymore. Show the list options
            // when at least 1 checkbox is checked
            var totalChecked = $('.oae-list input[type="checkbox"]:visible:checked', $list).length;
            if ((totalChecked > 0 && !$listOptionActions.is(':visible')) ||
                (totalChecked === 0 && $listOptionActions.is(':visible'))) {
                $('.oae-list-options-toggle', $list).click();
            }
            // Enable or disable the list option action buttons
            $('.oae-list-options-actions > .btn', $list).prop('disabled', (totalChecked === 0));
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

                // Get the id and resourceType from the data attributes on the checkbox
                var id = $(checked).attr('data-id');
                var resourceType = $(checked).attr('data-resourceType');
                var resourceSubType = $(checked).attr('data-resourceSubType');
                // Get the displayName and thumbnail image from the content of the list item
                var displayName = $('h3:visible', $checkedListItem).text();
                var thumbnailImage = $('img:visible', $checkedListItem).attr('src');

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
