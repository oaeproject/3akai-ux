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

define(['jquery', 'oae.core', 'jquery.history'], function($, oae) {

    return function(uid, showSettings, widgetData) {

        var $rootel = $('#' + uid);

        // Variable that will be used to keep track of the current infinite scroll instance
        var infinityScroll = false;

        /**
         * Initialize a new infinite scroll container that fetches a user's memberships.
         * This will detect when a search is happening and will change the endpoint
         * accordingly.
         */
        var getMemberships = function() {
            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }

            // Detect whether or not we need to do a search by checking if
            // the History.js state has a query parameter
            var query = History.getState().data.query;
            $('.oae-list-header-search-query', $rootel).val(query);

             // Set up the list actions
            var initialContent = null;
            if (widgetData.canManage && !query) {
                initialContent = oae.api.util.template().render($('#memberships-list-actions-template', $rootel));
            }

            var url = '/api/user/' + widgetData.context.id + '/memberships';
            if (query) {
                url = '/api/search/memberships-library/' + widgetData.context.id;
            }

            // Set up the infinite scroll instance
            infinityScroll = $('.oae-list', $rootel).infiniteScroll(url, {
                'limit': 12,
                'q': query
            }, '#memberships-template', {
                'initialContent': initialContent,
                'postProcessor': function(data) {
                    // Let the template know whether or not the current list
                    // is a main list or a search list, as different paging
                    // keys need to be provided for each
                    data.query = query;
                    data.displayOptions = {
                        'showCheckbox': widgetData.canManage ? true : false
                    };
                    return data;
                },
                'emptyListProcessor': function() {
                    oae.api.util.template().render($('#memberships-noresults-template', $rootel), {
                        'query': query
                    }, $('.oae-list', $rootel));
                }
            });
        };

        /**
         * Set up the list header macro with its actions. If the current user can manage the memberships
         * list, they have the option to "leave" groups in the list
         */
        var setUpListHeader = function() {
            // Determine which list header actions should be available to the user viewing the list
            var listHeaderActions = [];
            if (widgetData.canManage) {
                listHeaderActions.push({
                    'icon': 'fa-minus-circle',
                    'label': oae.api.i18n.translate('__MSG__LEAVE_GROUP__', 'memberships'),
                    'trigger': 'oae-trigger-leavegroup'
                });
            }

            oae.api.util.template().render($('#memberships-list-header-template', $rootel), {'actions': listHeaderActions}, $('#memberships-list-header', $rootel));
        };

        /**
         * Add the different event bindings
         */
        var addBinding = function() {
            // Listen to History.js state changes
            $(window).on('statechange', function() {
                // Only re-load the memberships list when the widget is currently visible
                if ($rootel.is(':visible')) {
                    getMemberships();
                }
            });
            // Listen to the event that indicates that groups have been left.
            // In that case, we reload the memberships.
            $(window).on('oae.leavegroup.done', getMemberships);
        };

        addBinding();
        setUpListHeader();
        getMemberships();

    };
});
