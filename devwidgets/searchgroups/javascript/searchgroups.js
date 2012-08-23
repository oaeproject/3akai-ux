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
// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core', '/dev/javascript/search_util.js'], function($, sakai) {

    /**
     * @name sakai.WIDGET_ID
     *
     * @class WIDGET_ID
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.searchgroups = function(tuid, showSettings, widgetData) {

        var selectedCategory = 'other';
        var selectedCategoryPlural = 'other';
        var selectedCategoryId = '';

        sakai.api.Util.getTemplates(function(success, templates) {
            if (success) {
                for (var c = 0; c < templates.length; c++) {
                    if (templates[c].id === widgetData.category) {
                        selectedCategory = sakai.api.i18n.getValueForKey(templates[c].title);
                        selectedCategoryPlural = sakai.api.i18n.getValueForKey(templates[c].titlePlural);
                        selectedCategoryId = templates[c].id;
                    }
                }
            } else {
                debug.error('Could not get the group templates');
            }
        });

        //////////////////////
        // Config variables //
        //////////////////////

        var $rootel = $('#' + tuid);

        // Search URL mapping
        var searchURLmap = {
            allgroups : sakai.config.URL.SEARCH_GROUPS,
            allgroupsall : sakai.config.URL.SEARCH_GROUPS_ALL,
            managergroups : sakai.config.URL.GROUPS_MANAGER,
            membergroups : sakai.config.URL.GROUPS_MEMBER
        };

        var infinityScroll = false;

        // CSS IDs
        var search = '#searchgroups';

        var searchConfig = {
            search: '#searchgroups',
            global: {
                resultTemp: search + '_result_temp',
                numberFound: search + '_numberFound',
                text: '#form .s3d-search-inputfield',
                searchButton: '#form .s3d-search-button'
            },
            results: {
                container: search + '_results_container',
                resultsContainer: search + '_results',
                resultsContainerAnonClass: 's3d-search-results-anon',
                template: 'search_general_results_template',
                noResultsTemplate: 'searchgroups_noresults_template'
            },
            facetedConfig : {
                title : $('#searchgroups_result_title').text(),
                value : 'Groups',
                facets: {
                    'all': {
                        'category': sakai.api.Util.TemplateRenderer('searchgroups_result_all_groups', {
                            'world': selectedCategoryPlural.toLowerCase()
                        }),
                        'searchurl': searchURLmap.allgroups,
                        'searchurlall': searchURLmap.allgroupsall
                    }
                }
            }
        };

        if (!sakai.data.me.user.anon) {
            searchConfig.facetedConfig.facets.manage = {
                'category': sakai.api.Util.TemplateRenderer('searchgroups_result_groups_I_manage', {
                    'world': selectedCategoryPlural
                }),
                'searchurl': searchURLmap.managergroups,
                'searchurlall': searchURLmap.managergroups
            };
            searchConfig.facetedConfig.facets.member = {
                'category': sakai.api.Util.TemplateRenderer('searchgroups_result_groups_I_m_a_member_of', {
                    'world': selectedCategoryPlural
                }),
                'searchurl': searchURLmap.membergroups,
                'searchurlall': searchURLmap.membergroups
            };
        }

        ///////////////
        // Functions //
        ///////////////

        $('#searchgroups_type_title', $rootel).text(selectedCategoryPlural);

        /**
         * Take a list of search results retrieved by the server and process them so they are
         * ready to be run through the template
         * @param {Object} results     List of results coming back from the infinite scroll plugin
         * @param {Object} callback    Callback function from the infinite scroll plugin to call
         */
        var renderResults = function(results, callback) {
            // If we have results we add them to the object.
            if (results && results.length) {
                results = sakai_global.data.search.prepareGroupsForRender(results);
            }
            // Call the infinite scroll plugin callback
            callback(results);
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params) {
            // Set search box values
            if (!params.q || (params.q === '*' || params.q === '**')) {
                $(searchConfig.global.text, $rootel).val('');
            } else {
                $(searchConfig.global.text, $rootel).val(params.q);
            }
            $(searchConfig.results.container, $rootel).html($(searchConfig.global.resultTemp, $rootel).html());
        };

        /**
         * Render the default template when no results are found. This function will
         * be called by the infinite scroll plugin
         */
        var handleEmptyResultList = function() {
            $(searchConfig.global.numberFound, $rootel).text('0');
            $(searchConfig.results.container, $rootel).html(sakai.api.Util.TemplateRenderer(searchConfig.results.noResultsTemplate, {
                'sakai': sakai,
                'category': selectedCategory.toLowerCase(),
                'categoryid': selectedCategoryId
            }));
        };

        /**
         * Kick off a search with a specific query and sort option. This function will
         * initiate an infinite scroll for each search
         */
        var doSearch = function() {
            var params = sakai_global.data.search.getQueryParams($rootel);
            var urlsearchterm = sakai_global.data.search.processSearchString(params);
            var tags = sakai_global.data.search.processRefineString(params);

            var facetedurl = '';
            var facetedurlall = '';
            if (params['facet'] && searchConfig.facetedConfig.facets[params['facet']]) {
                facetedurl = searchConfig.facetedConfig.facets[params['facet']].searchurl;
                facetedurlall = searchConfig.facetedConfig.facets[params['facet']].searchurlall;
            } else {
                for (var f in searchConfig.facetedConfig.facets) {
                    facetedurl = searchConfig.facetedConfig.facets[f].searchurl;
                    facetedurlall = searchConfig.facetedConfig.facets[f].searchurlall;
                    break;
                }
            }

            // Set all the input fields and paging correct.
            showSearchContent(params);

            var url = '';

            if ((urlsearchterm === '**' || urlsearchterm === '*') && params.refine === '') {
                url = facetedurlall;
                $(window).trigger('lhnav.addHashParam', [{'q': '', 'refine': ''}]);
            } else {
                url = facetedurl;
                $(window).trigger('lhnav.addHashParam', [{'q': params.q, 'refine': params.refine}]);
            }

            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }
            // Set up the infinite scroll for the list of search results
            infinityScroll = $(searchConfig.results.container, $rootel).infinitescroll(url, {
                'q': urlsearchterm,
                'tags': tags,
                'sortOn': params['sorton'],
                'sortOrder': params['sortby'],
                'category': widgetData.category
            }, function(items, total) {
                // Adjust display global total
                $(searchConfig.global.numberFound, $rootel).text('' + total);
                if (total === 1) {
                    $(searchConfig.global.numberFound, $rootel).next('span.s3d-aural-text').text(
                        '' + sakai.api.i18n.getValueForKey('GROUP_FOUND', 'searchgroups')
                    );
                } else {
                    $(searchConfig.global.numberFound, $rootel).next('span.s3d-aural-text').text(
                        '' + sakai.api.i18n.getValueForKey('GROUPS_FOUND', 'searchgroups')
                    );
                }
                return sakai.api.Util.TemplateRenderer(searchConfig.results.template, {
                    'items': items,
                    'sakai': sakai
                });
            }, handleEmptyResultList, sakai.config.URL.INFINITE_LOADING_ICON, renderResults, function() {
                // adjust height of grid row elements to be equal
                sakai_global.data.search.determineAdjustGridElementHeights($rootel);
            }, false, function(data) {
                // Generate refine by tags
                sakai_global.data.search.generateTagsRefineBy(data, params);
            });
        };

        /////////////////////////
        // Initialise Function //
        /////////////////////////

        if (sakai.data.me.user.anon) {
            $(searchConfig.results.resultsContainer, $rootel).addClass(searchConfig.results.resultsContainerAnonClass);
        }

        $(window).on('hashchange', function(ev) {
            if ($.bbq.getState('l') === widgetData.category) {
                doSearch();
            }
        });

        $(window).on('sakai.search.util.finish', function(ev, data) {
            if (data && data.tuid === tuid) {
                var widgetId = sakai.api.Util.generateWidgetId();
                $('#searchgroups_results_faceted', $rootel).html(sakai.api.Util.TemplateRenderer('searchgroups_results_faceted', {
                    'widgetId': widgetId
                }));
                var config = {};
                config[widgetId] = {
                    'facetedConfig': searchConfig.facetedConfig
                };
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false, false, config);
                doSearch();
            }
        });

        $(window).trigger('sakai.search.util.init', [{'tuid': tuid}]);

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('searchgroups');

});
