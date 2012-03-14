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
        var $dashboardactivityContainer = $('#dashboardactivity_widget', $rootel);
        var $dashboardactivityNoActivityContainer = $('#dashboardactivity_no_activity_container', $rootel);
        var $dashboardactivityActivityContainer = $('#dashboardactivity_activity_container', $rootel);

        // Templates
        var dashboardactivityActivityTemplate = 'dashboardactivity_activity_template';


        ////////////////////
        // Initialization //
        ////////////////////

        var doInit = function() {
            $dashboardactivityContainer.show();
        };

        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('dashboardactivity');
});
