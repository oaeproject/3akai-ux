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

/*globals sakai_global */
// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    'use strict';

    /**
     * @name sakai_global.dashboardactivity
     *
     * @class dashboardactivity
     *
     * @description
     * Shows a stream of activity related to the user viewing it
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.dashboardactivity = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);
        var $dashboardactivityWidget = $('#dashboardactivity_widget', $rootel);

        // Containers
        var $dashboardactivityContainer = $('#dashboardactivity_container', $rootel);
        var $dashboardactivityActivityContainer = false;
        var dashboardactivityFilterContainer = '.dashboardactivity_filter';

        // Templates
        var dashboardactivityActivityTemplate = 'dashboardactivity_activity_template';
        var dashboardactivityActivityBadrequestTemplate = 'dashboardactivity_activity_badrequest_template';
        var dashboardactivityNoActivityTemplate = 'dashboardactivity_no_activity_template';
        var dashboardactivityContentCommentsTemplate = 'dashboardactivity_content_comments_template';

        // Widget variables
        var filter = 'all';
        var filterMap = {
            'ADDED_COMMENT': 'comments',
            'CREATED_FILE': 'updates',
            'SHARED_CONTENT': 'sharing',
            'UPDATED_CONTENT': 'updates'
        };
        var context = {
            'url': '',
            'id': ''
        };


        ////////////////////
        // Render & Parse //
        ////////////////////

        /**
         * Render the dashboard activity widget
         * @param {String|Object} template Template that needs to be rendered
         * @param {Object} data The JSON you want to pass through the dashboard widget
         */
        var renderActivity = function(template, data) {
            $dashboardactivityContainer.html(
                sakai.api.Util.TemplateRenderer(template, data || {})).show();
        };

        /**
         * Parse the activity data
         * @param {Object|Boolean} data The JSON activity data or `false` when there was no data
         */
        var parseActivityData = function(data) {
            // If the request wasn't successful, show it to the user
            if (!data) {
                renderActivity(dashboardactivityActivityBadrequestTemplate);
                return;
            }

            if (!data.results.length) {
                renderActivity(dashboardactivityNoActivityTemplate);
            } else {
                var filteredData = [];
                $.each(data.results, function(index, item) {
                    item.translatedActivityMessage = sakai.api.i18n.getValueForKey(
                                                        item['sakai:activityMessage'], 'dashboardactivity');
                    item.translatedActivityMessageAction = '';
                    if (item['sakai:activityMessageAction']) {
                        item.translatedActivityMessageAction = sakai.api.i18n.getValueForKey(
                           item['sakai:activityMessageAction'] , 'dashboardactivity');
                    }
                    // Filter based on the selected tab
                    if (filter !== 'all') {
                        if (filterMap[item['sakai:activityMessage']] === filter) {
                            filteredData.push(item);
                        }
                    } else {
                        filteredData.push(item);
                    }
                });

                if (!filteredData.length) {
                    renderActivity(dashboardactivityNoActivityTemplate);
                } else {
                    renderActivity(dashboardactivityActivityTemplate, {
                        data: filteredData,
                        sakai: sakai
                    });
                }
                $dashboardactivityActivityContainer = $($dashboardactivityActivityContainer);
            }
        };

        /**
         * Get the activity data
         */
        var getActivityData = function() {
            $.ajax({
                url: context.url,
                data: {
                    items: 1000
                },
                success: function(data) {
                    parseActivityData(data);
                },
                error: function() {
                    parseActivityData(false);
                }
            });
        };


        ///////////
        // UTILS //
        ///////////

        var switchActivityFilter = function() {
            if (filter !== $(this).data('filter')) {
                filter = $(this).data('filter');
                $(dashboardactivityFilterContainer + ' button').removeClass('selected');
                $(this).addClass('selected');

                if (filter === 'comments' && context.id === 'content') {
                    renderActivity(dashboardactivityContentCommentsTemplate);
                    sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
                } else {
                    getActivityData();
                }
            }
        };


        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Add binding to the elements
         */
        var addBinding = function() {
            $(dashboardactivityFilterContainer + ' button').on('click', switchActivityFilter);
        };

        var doInit = function() {
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (data.groupid) {
                    // Load activity for group
                    context = {
                        'url': '/devwidgets/dashboardactivity/dummy/groupdummy.json',
                        'id': data.groupid
                    };
                } else if (sakai_global.content_profile && sakai_global.content_profile.content_data) {
                    // Load activity for content profile
                    context = {
                        'url': '/devwidgets/dashboardactivity/dummy/contentdummy.json',
                        'id': 'content'
                    };
                    $dashboardactivityWidget.css('width', '100%');
                } else {
                    // Load activity for a user
                    context = {
                        'url': '/devwidgets/dashboardactivity/dummy/mydummy.json',
                        'id': 'user'
                    };
                }
                addBinding();
                getActivityData();
            });
        };

        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('dashboardactivity');
});
