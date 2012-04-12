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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.scheduler
     *
     * @class scheduler
     *
     * @description
     * My Hello World is a dashboard widget that says hello to the current user
     * with text in the color of their choosing
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.scheduler = function (tuid, showSettings, widgetData) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mainContainer = $("#scheduler_main", $rootel);
        var $settingsContainer = $("#scheduler_settings", $rootel);
        var $settingsForm = $("#scheduler_settings_form", $rootel);
        var $cancelSettings = $("#scheduler_cancel_settings", $rootel);
        var schedulerFrom = "#scheduler_settings_from";
        var schedulerUntil = "#scheduler_settings_until";
        var schedulerDuration = "#scheduler_duration";
        var schedulerExtra = "#scheduler_settings_extra";
        
        
        var description = "No description has been given."
        
        var me = sakai.data.me;
        var fullName = me.profile.basic.elements.firstName.value + " " + me.profile.basic.elements.lastName.value

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         *
         * @param {Object} callback Function to call when the request returns. This
         * function will be sent a String with the hex value of the preferred color.
         */
        var getInformation = function () {
            // get the data associated with this widget
            sakai.api.Widgets.loadWidgetData(tuid, function (success, data) {
                if (success) {
                    // fetching the data succeeded, send it to the callback function
                    console.log("success: " + data);
                } else {
                    // fetching the data failed
                    console.log("fail:", data);
                    console.log("Did not get");
                }
            });
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        /** Binds Settings form */
        $settingsForm.bind("submit", function (ev) {
            var from = $(schedulerFrom).val();
            var until = $(schedulerUntil).val();
            var duration = $.trim($(schedulerDuration).val());
            extra = $(schedulerExtra).val();
            if(extra != ""){
                description = $(schedulerExtra).val();
            }
            
            
            var data = {
                "CourseName": { 
                    "From": from,
                    "Until": until,
                    "Duration": duration,
                    "Description": description, 
                }
             }
             
            sakai.api.Widgets.saveWidgetData(tuid, data,
                function (success, data) {
                    if (success) {
                        // Settings finished, switch to Main view
                        sakai.api.Widgets.Container.informFinish(tuid, "scheduler");
                    } else {
                        console.log("Did not save");
                    }
                }
            );
            return false;
        });

        $cancelSettings.bind("click", function() {
            sakai.api.Widgets.Container.informFinish(tuid, "scheduler");
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var renderSchedulerSettings = function() {
            getInformation();
            $("#scheduler_settings_container").html(sakai.api.Util.TemplateRenderer("scheduler_settings_template",{
                "from": "0900",
                "until": "1400",
                "duration": "30",
                "description": "This is the description"
            }));
        }

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function () {
            if (showSettings) {
                // render scheduler settings
                renderSchedulerSettings();
                
                // show the Settings view
                $settingsContainer.show();
            } else {
                // set up Main view
                $mainContainer.show();
            }
        };

        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("scheduler");
});