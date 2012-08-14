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
    sakai_global.searchcontent = function(tuid, showSettings) {

        //////////////////////
        // Config variables //
        //////////////////////

        // Search URL mapping
        var searchURLmap = {
            allfiles: sakai.config.URL.SEARCH_ALL_FILES,
            allfilesall: sakai.config.URL.SEARCH_ALL_FILES_ALL,
            pooledcontentmanager: sakai.config.URL.POOLED_CONTENT_MANAGER,
            pooledcontentmanagerall: sakai.config.URL.POOLED_CONTENT_MANAGER_ALL,
            pooledcontentviewer: sakai.config.URL.POOLED_CONTENT_VIEWER,
            pooledcontentviewerall: sakai.config.URL.POOLED_CONTENT_VIEWER_ALL
        };

        var infinityScroll = false;

        // CSS IDs
        var search = '#searchcontent';
        var $rootel = $('#' + tuid);

        var searchConfig = {
            search: '#searchcontent',
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
                noResultsTemplate: 'searchcontent_noresults_template'
            },
            facetedConfig: {
                title: $('#searchcontent_result_title').html(),
                value: 'Content',
                facets: {
                    'all': {
                        'category': $('#searchcontent_result_all_content').html(),
                        'searchurl': searchURLmap.allfiles,
                        'searchurlall': searchURLmap.allfilesall
                    }
                }
            }
        };

        if (!sakai.data.me.user.anon) {
            searchConfig.facetedConfig.facets.manage = {
                'category': $('#searchcontent_result_content_I_manage').html(),
                'searchurl': searchURLmap.pooledcontentmanager,
                'searchurlall': searchURLmap.pooledcontentmanagerall
            };
            searchConfig.facetedConfig.facets.member = {
                'category': $('#searchcontent_result_content_I_m_a_viewer_of').html(),
                'searchurl': searchURLmap.pooledcontentviewer,
                'searchurlall': searchURLmap.pooledcontentviewerall
            };
        }

        ///////////////
        // Functions //
        ///////////////

        /**
         * Take a list of search results retrieved by the server and process them so they are
         * ready to be run through the template
         * @param {Object} results     List of results coming back from the infinite scroll plugin
         * @param {Object} callback    Callback function from the infinite scroll plugin to call
         */
        var renderResults = function(results, callback) {
            // If we have results we add them to the object.
            if (results && results.length) {
                sakai_global.data.search.prepareCMforRender(results, function(_results) {
                    callback(_results);
                });
            } else {
                callback(results);
            }
        };

        /**
         * This method will show all the appropriate elements for when a search is executed.
         */
        var showSearchContent = function(params) {
            // Set search box values
            if (!params.q || (params.q === '*' || params.q === '**')) {
                $(searchConfig.global.text).val('');
            } else {
                $(searchConfig.global.text).val(params.q);
            }
            $(searchConfig.results.container).html($(searchConfig.global.resultTemp).html());
        };

        /**
         * Render the default template when no results are found. This function will
         * be called by the infinite scroll plugin
         */
        var handleEmptyResultList = function() {
            $(searchConfig.global.numberFound).text('0');
            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.noResultsTemplate, {sakai: sakai}));
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
            infinityScroll = $(searchConfig.results.container).infinitescroll(url, {
                'q': urlsearchterm,
                'tags': tags,
                'sortOn': params['sorton'],
                'sortOrder': params['sortby']
            }, function(items, total) {
                // Adjust display global total
                $(searchConfig.global.numberFound, $rootel).text('' + total);
                if (total === 1) {
                    $(searchConfig.global.numberFound, $rootel).next('span.s3d-aural-text').text(
                        '' + sakai.api.i18n.getValueForKey('CONTENT_ITEM_FOUND', 'searchcontent')
                    );
                } else {
                    $(searchConfig.global.numberFound, $rootel).next('span.s3d-aural-text').text(
                        '' + sakai.api.i18n.getValueForKey('CONTENT_ITEMS_FOUND', 'searchcontent')
                    );
                }
                return sakai.api.Util.TemplateRenderer(searchConfig.results.template, {
                    'items': items,
                    'sakai': sakai
                });
            }, handleEmptyResultList, sakai.config.URL.INFINITE_LOADING_ICON, renderResults, function() {
                // Initialize content draggable
                sakai.api.Util.Draggable.setupDraggable({}, $(searchConfig.results.container));
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
            $(searchConfig.results.resultsContainer).addClass(searchConfig.results.resultsContainerAnonClass);
        }

        $(window).on('hashchange', function(ev) {
            if ($.bbq.getState('l') === 'content') {
                doSearch();
            }
        });

        $(window).on('sakai.search.util.finish', function(ev, data) {
            if (data && data.tuid === tuid) {
                sakai.api.Widgets.widgetLoader.insertWidgets('searchcontent_widget', false, false, {
                    '98384013291': {
                        'facetedConfig': searchConfig.facetedConfig
                    }
                });
                doSearch();
            }
        });

        $(window).trigger('sakai.search.util.init', [{'tuid': tuid}]);

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('searchcontent');

});
