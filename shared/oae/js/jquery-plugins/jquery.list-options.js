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

define(['jquery'], function (jQuery) {
    (function() {

        /**
         * Show or hide the list options when clicking the toggle next to the page title
         */
        $(document).on('click', '.oae-list-options-toggle', function(ev) {
            $('.oae-list-options-actions').toggleClass('hide');
            $(this).find('i').toggleClass('icon-caret-down icon-caret-up');
        });

        /**
         * Select or deselect all elements when clicking the select all checkbox in the
         * list options
         */
        $(document).on('change', '.oae-list-selectall', function(ev) {
            var checked = $(this).is(':checked');
            $('.oae-list input[type="checkbox"]').prop('checked', checked);
        });

        /**
         * Switch the view mode between grid view, details view and compact view
         */
        $(document).on('click', '.oae-list-options .btn-group button', function() {
            $('.oae-list-options .btn-group button').removeClass('active');
            $(this).addClass('active');
            $('.oae-list:visible').removeClass('oae-list-grid oae-list-details oae-list-compact');
            $('.oae-list:visible').addClass($(this).attr('data-type'));
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
