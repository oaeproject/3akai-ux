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

require(['jquery','oae.core'], function($, oae) {

    // Set the browser title
    oae.api.util.setBrowserTitle(oae.api.i18n.translate('__MSG__SEARCH__'));

    // Variable that will be used to keep track of the current
    // infinite scroll instance
    var infinityScroll = false;

    /**
     * Initialize a new infinite scroll container that lists the search results.
     */
    var renderSearch = function() {
        // Disable the previous infinite scroll
        if (infinityScroll) {
            infinityScroll.kill();
        }

        // Get the current search query
        var query = $.bbq.getState('q');
        $('.search-query').val(query);

        // Get the current type refinement
        var types = ($.bbq.getState('types') || '').split(',');
        $.each(types, function(index, type) {
            $('#search-refine-type input[type="checkbox"][data-type="' + type + '"]').attr('checked', 'checked');
        });

        // Set up the infinite scroll for the list of search results
        infinityScroll = $('.oae-list').infiniteScroll('/api/search/general', {
            'limit': 12,
            'q': query,
            'resourceTypes': types
        }, '#search-template', {
            'postRenderer': function(data) {
                $('#search-total-results').text(data.total);
            }
        });
    };

    /**
     * Initiate a search with the search query entered by the user.
     */
    var search = function() {
        $.bbq.pushState({'q': $('.search-query', $(this)).val()});
        renderSearch();
        return false;
    };

    /**
     * Every time a new resource type refinement options has been checked or unchecked, we change
     * the page URL to reflect the selected type refinements and kick off a new search
     */
    var refineByType = function() {
        var types = [];
        // Get all of the selected type checkboxes
        $('#search-refine-type input[type="checkbox"]:checked').each(function(index, checkbox) {
            types.push($(checkbox).attr('data-type'));
        });
        $.bbq.pushState({'types': types.join(',')});
        renderSearch();
    };

    /**
     * Add the different event bindings
     */
    var addBinding = function() {
        // Set up search event
        $(document).on('submit', '#search-form', search);
        // Listen to the change event on the type refinement checkboxes
        $('#search-refine-type').on('change', 'input[type="checkbox"]', refineByType);
    };

    addBinding();
    renderSearch();

});
