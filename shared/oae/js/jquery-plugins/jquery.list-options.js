/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
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
        $(document).on('change', '.oae-list-selectall', function(ev) {
            var checked = $(ev.target).is(':checked');
            $('.oae-list:visible input[type="checkbox"]').attr('checked', checked);
        });

        $(document).on('click', '.oae-list-options-toggle', function(ev) {
            $('.oae-list-options').toggleClass('hide');
            $(ev.target).find('i').toggleClass('icon-caret-down icon-caret-up');
        });

        /**
         * Switches the view mode of a list to list, expanded list or grid
         * @param  {Object}    el    The DOM element that was clicked (either list, expanded list or grid button)
         */
        var switchViewMode = function(el) {
            $('.search-view-container > .btn:visible').removeClass('active');
            $(el).addClass('active');
        };

        $(document).on('click', '.search_view_grid', function() {
            switchViewMode(this);
            $('.oae-list:visible').addClass('grid');
            $('.oae-list:visible').removeClass('expandedlist');
        });

        $(document).on('click', '.search_view_expandedlist', function() {
            switchViewMode(this);
            $('.oae-list:visible').removeClass('grid');
            $('.oae-list:visible').addClass('expandedlist');
        });

        $(document).on('click', '.search_view_list', function() {
            switchViewMode(this);
            $('.oae-list:visible').removeClass('expandedlist');
            $('.oae-list:visible').removeClass('grid');
        });

        $(document).on('click', '.oae-list-item-right', function() {
            $(this).parent().toggleClass('active');
        });
    })();
});
