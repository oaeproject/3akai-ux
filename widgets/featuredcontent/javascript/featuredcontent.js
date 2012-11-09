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
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.featuredcontent
     *
     * @class featuredcontent
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.featuredcontent = function(tuid, showSettings, pageData) {

        var $rootel = $('#'+tuid);

        // Containers
        var $featuredcontentContentContainer = $('#featuredcontent_content_container', $rootel);
        var featuredcontentCategoryContentContainer = '#featuredcontent_category_content_container';

        // Templates
        var featuredcontentMainTemplate = $('#featuredcontent_main_template');
        var featuredcontentCategoryOtherTemplate = $('#featuredcontent_category_other_template');

        var $featuredcontentWidget = $('.featuredcontent_widget', $rootel);

        /**
         * Render the list of featured content items. Different templates are used based on whether or
         * not we are rendering from the landing page (random content) or a category page (content tagged
         * with that category
         * @param {Object} results    Sorted array of featured content items to render
         * @param {Object} total      Total number of items in the current category [optional]
         */
        var renderFeaturedContent = function(results, total) {
            // Category page
            if (sakai_global.category) {
                var showSeeAll = (total > results.length);
                var renderedLargeFeatured = false;
                // Only render the main featured item when it has a thumbnail image
                if (results.length && results[0].thumbnail) {
                    sakai.api.Util.TemplateRenderer(featuredcontentMainTemplate, {
                        'item': results[0],
                        'sakai': sakai,
                        'results': false,
                        'params': {'max_rows': 2}
                    }, $featuredcontentContentContainer);
                    // Remove the first item to avoid double rendering
                    results.splice(0, 1);
                    renderedLargeFeatured = true;
                }
                if (results.length || !renderedLargeFeatured) {
                    sakai.api.Util.TemplateRenderer(featuredcontentCategoryOtherTemplate, {
                        'results': results,
                        'sakai': sakai,
                        'total': total,
                        'category': pageData.category,
                        'title': pageData.title,
                        'showSeeAll': showSeeAll
                    }, $(featuredcontentCategoryContentContainer, $rootel));
                }
            // Landing/explore page
            } else {
                // Render the template
                sakai.api.Util.TemplateRenderer(featuredcontentMainTemplate, {
                    'results': reshuffleOrderedList(results),
                    'sakai': sakai,
                    'params': {'max_rows': 2}
                }, $featuredcontentContentContainer);
            }
        };

        /**
         * For the landing page, we show 1 large - 1 middle - 2 small - 1 large - 2 small - 1 large - 2 small
         * Therefore, we slightly re-arrange the ordered array to reflect this priority list, so
         * [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] is transformed into [1, 2, 5, 6, 3, 7, 8, 4, 9, 10]
         * @param {Object} results    List of content items to reshuffle
         */
        var reshuffleOrderedList = function(results) {
            if (results.length >= 5) {
                results.splice(2, 0, results.splice(4,1)[0]);
            }
            if (results.length >= 6) {
                results.splice(3, 0, results.splice(5,1)[0]);
            }
            if (results.length >= 7) {
                results.splice(5, 0, results.splice(6,1)[0]);
            }
            if (results.length >= 8) {
                results.splice(6, 0, results.splice(7,1)[0]);
            }
            return results;
        };

        /**
         * Sort the array of content items based on whether or not they have a thumbnail image and how
         * much metata they have (comments, description, tags)
         * @param {Object} a    First content item
         * @param {Object} b    Second content item
         */
        var sortBasedOnThumbnailAndMetadata = function(a, b) {
            if (a.thumbnail && b.thumbnail) {
                var scoreA = (a['sakai:description'] ? 1 : 0) + ((a['sakai:tags'] && a['sakai:tags'].length) ? 1 : 0) + (a.commentcount ? 1 : 0);
                var scoreB = (b['sakai:description'] ? 1 : 0) + ((b['sakai:tags'] && b['sakai:tags'].length) ? 1 : 0) + (b.commentcount ? 1 : 0);
                return scoreA < scoreB;
            } else if (a.thumbnail) {
                return -1;
            } else {
                return 1;
            }
        };

        /**
         * Add some additional metadata to the retrieved content items and sort them based on whether or
         * not they have a thumbnail image and how much metata they have (comments, description, tags)
         * @param {Object} success    True if the request to retrieve the featured items was successful,
         *                            false if an error occured
         * @param {Object} data       List of retrieved featured content items
         */
        var parseFeaturedContent = function(success, data) {
            if (success) {
                $.each(data.results, function(index, item) {
                    item.thumbnail = sakai.api.Content.getThumbnail(item);
                    item.usedin = sakai.api.Content.getPlaceCount(item);
                    item.commentcount = sakai.api.Content.getCommentCount(item);
                    item.canShare = sakai.api.Content.canCurrentUserShareContent(item);
                    if (item['sakai:tags']) {
                        item['sakai:tags'] = sakai.api.Util.formatTags(item['sakai:tags'].toString());
                    }
                });
                data.results.sort(sortBasedOnThumbnailAndMetadata);
                renderFeaturedContent(data.results, data.total);
            } else {
                renderFeaturedContent([], 0);
            }
        };

        var getFeaturedContent = function() {
            var items = 10;
            var q = '';
            var url = '/var/search/public/random-content.json';
            if (sakai_global.category) {
                items = 7;
                q = 'directory/' + pageData.category.replace('-', '/');
                url = '/var/search/bytag.json';
            }
            sakai.api.Server.loadJSON(url, parseFeaturedContent, {
                page: 0,
                items: items,
                tag: q,
                type: 'c'
            });
        };

        var resetWidget = function() {
            largeEnough = false;
            featuredContentArr = [];
            featuredCategoryContentArr = [];
        };

        var doInit = function() {
            resetWidget();
            getFeaturedContent();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('featuredcontent');
});