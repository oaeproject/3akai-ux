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

/*global $, sdata, Config*/

var sakai = sakai || {};

/**
 * Initialize the Delicious widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement The place of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.delicious = function(tuid, placement, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // ERRORS
    var $deliciousErrorNotConnected = $("#delicious_error_notconnected", rootel);

    // CONTENT
    var $deliciousContainer = $("#delicious_container", rootel);

    // SETTINGS
    var $deliciousSettingsContainer = $("#delicious_settings_container", rootel);

    // BUTTONS
    var $deliciousSettingsButtonSave = $("#delicious_settings_button_save", rootel);


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Notify the container that it can be closed.
     */
    var settingsClose = function(){
        showSettings = false;
        doInit();
    };


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Switch between main view and settings
     */
    var doInit = function() {
        if (!showSettings) {
            // Show Main View
            document.getElementById("delicious_container").innerHTML = document.getElementById("delicious_mainview_container").innerHTML;
        }else{
            // Show Settings
            document.getElementById("delicious_container").innerHTML = document.getElementById("delicious_settings_container").innerHTML;
        }

        // Buttons
        $deliciousSettingsButtonSave.live('click', settingsClose); // TEMP: close the settings page
    };
    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("delicious");