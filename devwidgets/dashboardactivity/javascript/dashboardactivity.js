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
    sakai_global.dashboardactivity = function (tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);

        // Containers
        var $dashboardactivityContainer = $('#dashboardactivity_container', $rootel);
        var $dashboardactivityActivityContainer = $('#dashboardactivity_activity_container', $rootel);

        // Templates
        var $dashboardactivityActivityTemplate = $('#dashboardactivity_activity_template', $rootel);
        var $dashboardactivityActivityBadrequestTemplate = $('#dashboardactivity_activity_badrequest_template', $rootel);
        var $dashboardactivityNoActivityTemplate = $('#dashboardactivity_no_activity_template', $rootel);


        /////////////
        // Binding //
        /////////////

        /**
         * Add binding to the elements
         */
        var addBinding = function() {
            $dashboardactivityActivityContainer = $($dashboardactivityActivityContainer.selector);
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
                sakai.api.Util.TemplateRenderer(template, data)
                ).show();
        };

        /**
         * Parse the activity data
         * @param {Object|Boolean} data The JSON activity data or `false` when there was no data
         */
        var parseActivityData = function(data) {

            // If the request wasn't successful, show it to the user
            if (!data) {
                renderActivity($dashboardactivityActivityBadrequestTemplate, {});
                return;
            }

            if (data.results.length === 0){
                renderActivity($dashboardactivityNoActivityTemplate, {});
            } else {

                $.each(data.results, function(index, item){
                    item.translatedActivityMessage =
                        sakai.api.i18n.getValueForKey(
                            item['sakai:activityMessage'], 'dashboardactivity');
                    item.translatedActivityMessageAction = item['sakai:activityMessageAction'] ?
                        sakai.api.i18n.getValueForKey(
                           item['sakai:activityMessageAction'] , 'dashboardactivity')
                        : '';

                });

                renderActivity($dashboardactivityActivityTemplate, {
                    data: data,
                    sakai: sakai
                });
                addBinding();
            }

        };

        /**
         * Get the activity data
         */
        var getActivityData = function() {

            $.ajax({
                url: '/devwidgets/dashboardactivity/dummy/mydummy.json',
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


        ////////////////////
        // Initialization //
        ////////////////////

        var doInit = function() {
            getActivityData();
        };

        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('dashboardactivity');
});
