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
    var $deliciousContainerMain = $("#delicious_container_main", rootel);
    var $deliciousContainerSettings = $("#delicious_container_settings", rootel);
    
    // TEMPLATES
    var $deliciousTemplateMain = "delicious_template_main";
    var $deliciousTemplateSettings = "delicious_template_settings";

    // BUTTONS / HYPERLINKS
    var $deliciousErrorSettings = $("#delicious_error_settings", rootel);
    var $deliciousSettingsButtonSave = $("#delicious_settings_button_save", rootel);


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
    * Show the Main container and hide the Settings container
    */
    var showContainerMain = function(){
        $deliciousContainerMain.show();
        $deliciousContainerSettings.hide();
    };

    /**
    * Show the Main container and hide the Settings container
    */
    var showContainerSettings = function(){
        $deliciousContainerMain.hide();
        $deliciousContainerSettings.show();
    };

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Switch between main view and settings
     */
    var doInit = function() {
        $deliciousContainerMain.html($.Template.render($deliciousTemplateMain));
        $deliciousContainerSettings.html($.Template.render($deliciousTemplateSettings));

        if (!showSettings) {
            // Show Main View
            showContainerMain();
        }else{
            // Show Settings
            showContainerSettings();
        }

        // Buttons
        $deliciousErrorSettings.live('click', showContainerSettings);
        $deliciousSettingsButtonSave.live('click', showContainerMain); // TEMP: close the settings page
    };
    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("delicious");