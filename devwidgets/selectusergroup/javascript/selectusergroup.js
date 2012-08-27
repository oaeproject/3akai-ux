/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

/*global $ */

// Namespaces
require(['jquery', 'sakai/sakai.api.core', 'jquery-highlight'], function($, sakai) {

    /**
     * @name sakai_global.selectusergroup
     *
     * @class selectusergroup
     *
     * @description
     * Select Users/Groups widget<br />
     * This widget is used to select users or groups
     * for another widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.selectusergroup = function(tuid, showSettings) {

        var $selectusergroup_container = $('#selectusergroup_container');
        var $selectusergroup_close_dialog = $('.selectusergroup_close_dialog');
        var $selectusergroup_close_button = $('#selectusergroup_close_button');

        var infinityScroll = false;

        var config = {};
        var worldData = {};
        var widgetData = {
          'toAdd': {},
          'sortOn': 'score',
          'sortOrder': 'desc'
        };

        /**
         * Reset
         * Resets the people picker to a default state
         * @returns void
         */
        var reset = function() {
            $(selectusergroup_content_search).html('');
            $(selectusergroup_content_search).off('scroll');
            widgetData.toAdd = {};
        };

        /**
         * Reset
         * Resets the people picker to a default state
         * @returns void
         */
        var renderTabs = function() {
            sakai.api.Util.getTemplates(function(success, worlds) {
                $('#selectusergroup_tabs_container').html(sakai.api.Util.TemplateRenderer('#selectusergroup_tabs_template', {
                    'worlds': worlds,
                    'sakai':sakai
                }));
            });
        };

        /**
         * Take a list of search results retrieved by the server and process them so they are
         * ready to be run through the template
         * @param {Object} results     List of results coming back from the infinite scroll plugin
         * @param {Object} callback    Callback function from the infinite scroll plugin to call
         */
        var renderResults = function(results, callback) {
            // If we have results we add them to the object.
            if (results && results.length) {
                var $selectedButton = $('#selectusergroup_tabs_container button.selected');
                var searchType = $selectedButton.attr('data-type');
                if (searchType === 'world') {
                    results = sakai.api.Groups.prepareGroupsForRender(results, sakai.data.me);
                } else if (searchType === 'people') {
                    results = sakai.api.User.preparePeopleForRender(results, sakai.data.me);
                }
            }

            var filteredResults = results;

            // apply filter
            if (config.filter && config.filter.length) {
                filteredResults = [];
                $.each(results.reverse(), function(i, item) {
                    if ($.inArray(item.id, config.filter) === -1) {
                        filteredResults.push(item);
                    }
                });
            }

            // Call the infinite scroll plugin callback
            callback(filteredResults);
        };

        var submitSearch = function() {
            var query = $('#selectusergroup_search_query').val();

            var parameters = {
                'q': sakai.api.Server.createSearchString(query),
                'sortOn': widgetData['sortOn'],
                'sortOrder': widgetData['sortOrder']
            };

            var $selectedButton = $('#selectusergroup_tabs_container button.selected');
            var searchUrl = sakai.config.URL.SEARCH_USERS;
            var searchType = $selectedButton.attr('data-type');
            var categoryId = $selectedButton.attr('data-category-id');
            var worldId = false;

            if (parameters.q === '*' || parameters.q === '**') {
                searchUrl = sakai.config.URL.SEARCH_USERS_ALL;
            }

            if (searchType === 'world') {
                searchUrl = sakai.config.URL.SEARCH_GROUPS;
                parameters.category = categoryId;
                if (parameters.q === '*' || parameters.q === '**') {
                    searchUrl = sakai.config.URL.SEARCH_GROUPS_ALL;
                }
            }

            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }

            // Set up the infinite scroll for the results
            infinityScroll = $('#selectusergroup_results_container').infinitescroll(searchUrl, parameters, function(items, total) {
                return sakai.api.Util.TemplateRenderer('#selectusergroup_results_template', {
                    'type': searchType,
                    'items': items,
                    'sakai': sakai
                });
            }, false, sakai.config.URL.INFINITE_LOADING_ICON, renderResults, function() {
                // highlight the search term in results
                $('#selectusergroup_results_container .selectusergroup_result_name').highlight(query)
            });
            //}, false, false, false, false, 400);
        };

        sakai.api.Util.Modal.setup($selectusergroup_container, {
            modal: true,
            overlay: 20,
            zIndex: 5000,
            toTop: true
        });

        /**
         * Add Binding
         */
        var addBinding = function() {
            // bind tabs
            $('#selectusergroup_tabs_container button').off('click').on('click', function() {
                var $clicked = $(this)
                if (!$clicked.hasClass('selected')) {
                    $('#selectusergroup_tabs_container button.selected').removeClass('selected');
                    $clicked.addClass('selected');
                    submitSearch();
                }
            });

            // bind search form
            $('#selectusergroup_search_form').off('submit').on('submit', function() {
                submitSearch();
                return false;
            })

            // bind results list
            //$selectusergroup_container.off('click', '').on('click', '
        };

        ////////////
        // Events //
        ////////////

        $(window).off('init.selectusergroup.sakai').on('init.selectusergroup.sakai', function(e, _config) {
            config = _config;
            if (config.q) {
                $('#selectusergroup_search_query').val(config.q);
            }

            renderTabs();
            addBinding();
            submitSearch();
            sakai.api.Util.Modal.open($selectusergroup_container);
        });

        $selectusergroup_close_dialog.off('click').on('click', function() {
            sakai.api.Util.Modal.close($selectusergroup_container);
        });

        $selectusergroup_close_button.off('click').on('click', function() {
            sakai.api.Util.Modal.close($selectusergroup_container);
        });

        // Send out an event that says the widget is ready to
        // accept a search query to process and display. This event can be picked up
        // in a page JS code
        $(window).trigger('ready.selectusergroup.sakai');

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('selectusergroup');
});
