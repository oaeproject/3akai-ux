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

require(['jquery', 'oae.core', 'underscore', 'jquery.history', 'jquery.switchtab'], function($, oae, _) {

    // Variable that will be used to keep track of the current
    // infinite scroll instance
    var infinityScroll = false;

    var $switchtab = null;
    var currSwitchtabId = null;

    /**
     * Get the search query data in the current state
     *
     * @return {Object}     queryData           The query data from the current state
     * @return {String}     queryData.q         The full-text search query
     * @return {String[]}   queryData.types     The resource types for which to search
     * @return {String}     queryData.tenant    The tenant alias in which to search
     */
    var getQueryData = function() {
        var params = oae.api.util.url(History.getState().cleanUrl).param();
        var q = params.q;
        var tenant = params.tenant;
        var types = [];
        if (params.types) {
            types = params.types.split(',');
        }

        var data = {
            'q': params.q,
            'tenant': tenant,
            'types': types
        };

        return data;
    };

    /**
     * Convert the given query data object into a url-encoded querystring string
     *
     * @return {String}     The query string (including the '?'), or an empty string if the data object is empty
     */
    var createQueryString = function(obj) {
        var params = [];
        $.each(obj, function(key, val) {
            params.push(key + '=' + oae.api.util.security().encodeForURL(val));
        });
        return (params.length) ? '?' + params.join('&') : '';
    };

    /**
     * Initialize a new infinite scroll container that lists the search results.
     */
    var renderSearch = function() {
        // Disable the previous infinite scroll
        if (infinityScroll) {
            infinityScroll.kill();
        }

        // Ensure the correct tab class is on the search content container. This CSS class helps
        // the UI hide/show search form controls that are applicable to specied search scope
        var switchtabId = $switchtab.switchtabId();
        if (currSwitchtabId !== switchtabId) {
            currSwitchtabId = switchtabId;
            $('#search-content-container')
                .removeClass('search-my')
                .removeClass('search-all')
                .addClass('search-' + switchtabId);
        }

        var title = ['__MSG__SEARCH__'];
        var queryData = getQueryData();

        // Apply the search value to the search text field
        $('.search-query').val(queryData.q);
        if (queryData.q) {
            title.push(queryData.q);
        }

        // Set the browser title
        oae.api.util.setBrowserTitle(title);

        // Reset the type checkboxes to make sure that none of them stay checked incorrectly
        // when hitting the back and forward buttons
        $('#search-refine-type input[type="checkbox"]').prop('checked', false);

        $.each(queryData.types, function(i, type) {
            $('#search-refine-type input[type="checkbox"][data-type="' + type + '"]').prop('checked', true);
        });

        // Hide the 'within tenant' checkbox for private tenants
        var isPrivate = oae.api.config.getValue('oae-tenants', 'tenantprivacy', 'tenantprivate');
        if (!isPrivate && currSwitchtabId === 'all') {
            // Ensure only the selected tenant is chosen, if at all
            $('#search-refine-tenant').show();

            $('#search-refine-tenant input[type="checkbox"]').removeAttr('checked');
            if (queryData.tenant) {
                $('#search-refine-tenant input[type="checkbox"][data-tenant="' + queryData.tenant + '"]').prop('checked', true);
            } 
        } else if (currSwitchtabId === 'my') {
            // Need to hide this again explicitly in case user switches back to 'my' tab
            $('#search-refine-tenant').hide();
        }

        var searchParams = {
            'limit': 12,
            'q': queryData.q,
            'resourceTypes': queryData.types,
            'scope': '_' + currSwitchtabId
        };

        if (searchParams.scope === '_my') {
            // "My" search never includes users, and will be harmful if only "user" is selected from
            // the "Everything" tab. Just always filter it out
            searchParams.resourceTypes = _.without(searchParams.resourceTypes, 'user');
        } else if (searchParams.scope === '_all' && (queryData.tenant || isPrivate)) {
            // If a tenant is specified or the current tenant is private, we search by the tenant
            if (!queryData.tenant) {
                queryData.tenant = oae.data.me.tenant.alias;
            }
            searchParams.scope = queryData.tenant;
        }

        // Set up the infinite scroll for the list of search results
        infinityScroll = $('.oae-list').infiniteScroll('/api/search/general', searchParams, '#search-template', {
            'postRenderer': function(data) {
                var nrResults = oae.api.l10n.transformNumber(data.total);
                $('.oae-list-header-badge').text(nrResults).show();
            },
            'emptyListProcessor': function() {
                oae.api.util.template().render($('#search-noresults-template'), {
                    'query': queryData.q
                }, $('.oae-list'));
            }
        });
    };

    /**
     * Initiate a new search based on the current state of the search parameters. This can be re-run
     * whenever search parameters are changed
     */
    var modifySearch = function() {
        // Get the query from the search form
        var query = $.trim($('#search-query').val());

        // Get all of the selected type checkboxes
        var types = [];
        $('#search-refine-type input[type="checkbox"]:checked').each(function() {
            types.push($(this).attr('data-type'));
        });

        var tenant = $('#search-refine-tenant input[type="checkbox"]:checked').attr('data-tenant');
        var path = oae.api.util.url(History.getState().cleanUrl).attr('path');
        var params = {};

        if (query) {
            params.q = query;
        }

        if (types.length > 0) {
            params.types = types.join(',');
        }

        if (tenant) {
            params.tenant = tenant;
        }

        // Append the query string, if any
        path += createQueryString(params);

        History.pushState({}, null, path);

        return false;
    };

    /**
     * Extract the search query and type refinements from the current URL.
     * This will only be executed when the page is loaded.
     */
    var initSearch = function() {
        oae.api.util.template().render($('#search-list-header-template'), null, $('#search-list-header'));
        oae.api.util.template().render($('#search-lhnavigation-template'), null, $('#search-lhnavigation'));

        // We should intelligently detect that if someone goes to /search/<search query>, we should
        // automatically send them to /search/all?q=<search query>
        var state = History.getState();
        var url = oae.api.util.url(History.getState().cleanUrl);
        var path = url.attr('path').split('/');
        var queryString = url.attr('query');

        /*!
         * This is backward compatibility handling for links that are sent to OAE. Previously, a
         * link could be sent to /search/<query> to send a user to the search page with a pre-
         * loaded query. Now those search endpoints look like /search/all/<query> and
         * /search/my/<query>.
         *
         * To transition to this, we look if the query looks like /search/<query> where <query> is
         * not "all" or "my". If so, we rewrite the URL to /search/all/<query>.
         *
         * TODO: Remove after this is released
         */
        var topLevelSearch = path[2] || '';
        if (topLevelSearch !== 'my' && topLevelSearch !== 'all') {
            // The topLevelSearch does not equal "my" or "all", so we make that path portion the `q`
            // parameter and send them to /search/all
            path[2] = 'all';
            if (queryString) {
                queryString += '&';
            }
            queryString += 'q=' + topLevelSearch;
            History.replaceState({}, null, path.join('/') + '?' + queryString);
        } else if (topLevelSearch !== 'all' && oae.data.me.anon) {
            // When the user is anonymous, they can only go to /search/all, so send them there
            // instead with the search query
            path[2] = 'all';
            path = path.join('/');
            if (queryString) {
                path += '?' + queryString;
            }
            History.replaceState({}, null, path);
        }

        // Initialize the switchtab component
        $switchtab = $('#search-scope').switchtab();
    };

    /**
     * Add the different event bindings
     */
    var addBinding = function() {
        // Listen to the form submit event on the search form
        $(document).on('submit', '#search-form', modifySearch);

        // Listen to changes to the checkboxes that refine search options
        $('#search-refine-type').on('change', 'input[type="checkbox"]', modifySearch);

        // Listen to changes to the checkboxes that refine by tenant
        $('#search-refine-tenant').on('change', 'input[type="checkbox"]', modifySearch);

        // Listen to History.js state changes
        $(window).on('statechange', renderSearch);
    };

    initSearch();
    addBinding();
    renderSearch();
});
