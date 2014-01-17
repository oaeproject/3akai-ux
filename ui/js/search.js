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

require(['jquery','oae.core', 'jquery.history'], function($, oae) {

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

        // Get the current search query from the History.js data object
        var query = History.getState().data.query;
        $('.search-query').val(query);

        // Reset the type checkboxes to make sure that none of them stay checked incorrectly
        // when hitting the back and forward buttons
        $('#search-refine-type input[type="checkbox"]').prop('checked', false);
        // Get the current type refinements from the History.js data object and select the corresponding checkboxes
        var types = History.getState().data.types;
        $.each(types, function(index, type) {
            $('#search-refine-type input[type="checkbox"][data-type="' + type + '"]').prop('checked', true);
        });

        // Set up the infinite scroll for the list of search results
        infinityScroll = $('.oae-list').infiniteScroll('/api/search/general', {
            'limit': 12,
            'q': query,
            'resourceTypes': types,
            'includeExternal': !oae.api.config.getValue('oae-tenants', 'tenantprivacy', 'tenantprivate')
        }, '#search-template', {
            'postRenderer': function(data) {
                $('#search-total-results').text(data.total);
            },
            'emptyListProcessor': function() {
                oae.api.util.template().render($('#search-noresults-template'), {
                    'query': query
                }, $('.oae-list'));
            }
        });
    };

    /**
     * Initiate a new search when a new search query has been entered or a type checkbox has been
     * checked/unchecked.
     */
    var modifySearch = function() {
        // Get the query from the search form
        var query = $.trim($('#search-query').val());

        // Get all of the selected type checkboxes
        var types = [];
        $('#search-refine-type input[type="checkbox"]:checked').each(function(index, checkbox) {
            types.push($(checkbox).attr('data-type'));
        });

        // Add the query and types into a new state, and encode a URL that reflects these for bookmarking
        // and refresh purposes
        var url = '/search/' + oae.api.util.security().encodeForURL(query);
        if (types.length > 0) {
            url += '?types=' + types.join(',');
        }

        History.pushState({
            'query': query,
            'types': types
        }, $('title').text(), url);
        return false;
    };

    /**
     * Extract the search query and type refinements from the current URL.
     * This will only be executed when the page is loaded.
     */
    var initSearch = function() {
        // We parse the URL fragment that's inside of the current History.js state.
        // The expected URL structure is `/search/<query>?types=type1,type2`
        var url = History.getState().cleanUrl;
        var initialState = $.url(url);
        var query = initialState.segment().slice(1).join('/');
        var types = (initialState.param().types || '').split(',');
        // Replace the current History.js state to have the query and type refinement data. This
        // is necessary because a newly loaded page will not contain the data object in its
        // state. Calling the replaceState function will automatically trigger the statechange
        // event, which will take care of the actual search. However, we also need to add a random
        // number to the data object to make sure that the statechange event is triggered after
        // a page reload.
        History.replaceState({
            'query': query,
            'types': types,
            '_': Math.random()
        }, $('title').text(), url);

        // Put focus on the search input field on desktop browsers
        if (!oae.api.util.isHandheldDevice()) {
            $('.search-query').focus();
        }
    };

    /**
     * Add the different event bindings
     */
    var addBinding = function() {
        // Listen to the form submit event on the search form
        $(document).on('submit', '#search-form', modifySearch);
        // Listen to the change event on the type refinement checkboxes
        $('#search-refine-type').on('change', 'input[type="checkbox"]', modifySearch);
        // Listen to History.js state changes
        $(window).on('statechange', renderSearch);
    };

    addBinding();
    initSearch();
});
