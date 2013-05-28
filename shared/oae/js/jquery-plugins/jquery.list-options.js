/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
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
         * When at least 1 checkbox inside of the list is checked, the list options are shown and
         * the list option action buttons are enabled. When no checkboxes are checked in the list,
         * the list options are hidden and the list option actions buttons are hidden
         */
        $(document).on('click', '.oae-list input[type="checkbox"]', function() {
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
         * Gets the id and title data from checkboxes in a list and returns an object.
         *
         * @return {Object}             Returns an object of data on the list. e.g. {'g:cam:oae-1234908-3240271': 'Mathematics 101'}
         */
        var getListData = function() {
            var list = [];
            // Loop over each list item and store the `data-id` and `data-title` values
            // in an object to return.
            var $checked = $('input[type="checkbox"]:visible:checked', $('.oae-list:visible'));
            $.each($checked, function(i, checked) {
                // Get the parent list item
                var $chkParent = $($(this).parents('li'));

                // Get the basic information for the item out of the parent
                var resourcetype = $(checked).attr('data-resourceType');
                var id = $(checked).attr('data-id');
                var displayName = $chkParent.find('label:visible').text();
                var thumbnailImage = $chkParent.find('img:visible').attr('src');

                list.push({
                    'resourceType': resourcetype,
                    'id': id,
                    'displayName': displayName,
                    'thumbnailUrl': thumbnailImage
                });
            });

            return list;
        };

        $(document).on('oae.list.getSelection', function() {
            $(document).trigger('oae.list.sendSelection', {'data': getListData()});
        });

    })();
});
