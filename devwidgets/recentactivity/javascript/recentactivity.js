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
     * @name sakai_global.recentactivity
     *
     * @class recentactivity
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentactivity = function(tuid, showSettings) {

        // Templates
        var recentactivityActivityItemTemplate = 'recentactivity_activity_item_template';

        // Container
        var $recentactivityActivityContainer = $('#recentactivity_activity_container');

        var activityMap = {
            CONTENT_ADDED_COMMENT: 'comment',
            CREATED_FILE: 'upload',
            GROUP_CREATED: 'new',
            JOINED_GROUP: 'new',
            SENT_MESSAGE: 'upload',
            UPDATED_CONTENT: 'new',
            UPDATED_DESCRIPTION: 'new',
            UPLOADED_CONTENT: 'upload',
            UPDATED_COPYRIGHT: 'new',
            UPDATED_URL: 'new',
            UPDATED_TAGS: 'new',
            USER_CREATED: 'new'
        };

        var t = '';
        var numItems = 0;
        var numDiff = 0;
        var currentData = '';

        var parseActivity = function(success, data, initialLoad) {
            if (success) {
                var results = [];
                numDiff = data.total - numItems;
                numItems = data.total;
                var total = 0;
                $.each(data.results, function(index, item) {
                    if (item['sakai:pooled-content-file-name'] && activityMap[item['sakai:activityMessage']] && item['who'] && item['who'].basic && total < 5) {
                        if (index < numDiff) {
                            item.fadeIn = true;
                        }
                        item.showdetails = true;
                        if (item['sakai:activity-type'] && item['sakai:activity-type'] === 'message' || item['sakai:activity-type'] === 'group') {
                            item.showdetails = false;
                        }
                        item.who.name = sakai.api.User.getDisplayName(item.who);
                        item['sakai:activity-appid'] = activityMap[item['sakai:activityMessage']];
                        item['sakai:activityMessage'] = sakai.api.i18n.getValueForKey(item['sakai:activityMessage'], 'recentactivity');
                        item.who.picture = sakai.api.User.getProfilePicture(item.who);
                        item.usedin = sakai.api.Content.getPlaceCount(item);
                        results.push(item);
                        total++;
                    }
                });
                var json = {
                    'data': results,
                    'sakai': sakai
                };
                sakai.api.Util.TemplateRenderer(recentactivityActivityItemTemplate, json, $recentactivityActivityContainer);
                applyThreeDots();
            }

            var $recentactivity_activity_item_container = $('.recentactivity_activity_item_container');
            $recentactivity_activity_item_container.filter(':visible').css('opacity', 1);
            if (!initialLoad) {
                $recentactivity_activity_item_container.filter(':hidden').fadeTo(1000, 1);
            } else {
                $recentactivity_activity_item_container.filter(':hidden').show();
                $recentactivity_activity_item_container.filter(':visible').css('opacity', 1);
            }
            applyThreeDots();
        };

        var applyThreeDots = function() {
            $.each($('.recentactivity_activity_item_text'), function(index, element) {
                var $el = $(element);
                var width = effectiveWidth($el, $el.siblings('a').find('img'));
                $el.html(sakai.api.Util.applyThreeDots($el.html(), width, {max_rows: 1}, $el.attr('class'), true));
            });
            $.each($('.recentactivity_activity_item_description'), function(index, element) {
                var $el = $(element);
                var width = effectiveWidth($el, $el.siblings('a').find('img'));
                $el.html(sakai.api.Util.applyThreeDots($el.html(), width, undefined, $el.attr('class'), true));
            });
        };

        var effectiveWidth = function(container, floated) {
            var eWidth = $(container).width();
            $.each(floated, function(index, floater) {
                eWidth -= $(floater).outerWidth(true);
            });
            return eWidth;
        };

        var fetchActivity = function(initialLoad) {
            sakai.api.Server.loadJSON(sakai.config.URL.SEARCH_ACTIVITY_ALL_URL, function(success, data) {
                var recentActivityJson = JSON.stringify(data.results);
                if (recentActivityJson !== currentData) {
                    currentData = recentActivityJson;
                    parseActivity(success, data, initialLoad);
                }
                t = setTimeout(function() {
                        fetchActivity(false);
                    }, 8000);
            }, {
                'items': 12
            });
        };

        var doInit = function(initialLoad) {
            fetchActivity(initialLoad);
        };

        doInit(true);

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('recentactivity');
});
