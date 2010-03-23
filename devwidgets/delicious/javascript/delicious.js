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
 * @param {String} tuid: unique id of the widget
 * @param {String} placement: the place of the widget
 * @param {Boolean} showSettings: show the settings of the widget or not
 */
sakai.delicious = function(tuid, placement, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // Errors
    var $deliciousErrorNotConnected = $("#delicious_error_notconnected", rootel);

    // Content
    var $deliciousContainer = $("#delicious_container", rootel);
    var $deliciousContainerMain = $("#delicious_container_main", rootel);
    var $deliciousContainerSettings = $("#delicious_container_settings", rootel);

    // Templates
    var $deliciousTemplateMain = "delicious_template_main";
    var $deliciousTemplateSettings = "delicious_template_settings";

    // Buttons and links
    var $deliciousSettingsLink = $("#delicious_settings_link", rootel);
    var $deliciousSettingsButtonSave = $("#delicious_settings_button_save", rootel);


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Adds the retrieved settings to the right fields
     * @param {Object} data: retrieved data
     */
    var fillInDeliciousSettings = function(data){
        var settings = $.evalJSON(data);

        document.getElementById('delicious_settings_input_username').value = settings.username;
        document.getElementById('delicious_settings_input_password').value = settings.password;
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Get the stored widget settings
     */
    var getDeliciousSettings = function(){
        var url = "/delicious/" + sdata.me.user.userid + "/delicious/delicious_settings.json";

        // Getting the settings data
        // There is a standard function (sdata.widgets.WidgetPreference.get) to do this,
        // but as long as data is being stored at the modified location it can not be used.
        $.ajax({
            cache: false,
            url: url,
            success: function(data){
                // Fill in the retrieved data
                fillInDeliciousSettings(data);
            },
            error: function(xhr, textStatus, thrownError) {
                // Display error message in console
                console.log("ERROR at delicious.js, getDeliciousSettings: " + thrownError);
            }
        });
    };

    /**
     * Callback function. Once the settings have been saved, hide the settings page and show the main view
     */
    var savedDeliciousSettings = function(success){
        if (success) {
            // Preference saved

            // FIXME
            // Multiple instances of this widget are showing up
            // sdata.container.informFinish(tuid,"delicious");

            // This is a temporary solution
            $deliciousContainerMain.show();
            $deliciousContainerSettings.hide();
        } else {
            // Log error
            console.log("ERROR at delicious.js, savedDeliciousSettings");
        }
    };

    /**
     * Save the widget settings
     */
    var saveDeliciousSettings = function(){
        // Concatinate the URL where the settings should be saved
        var saveUrl = "/delicious/" + sdata.me.user.userid + "/delicious";

        // Object to be saved at JCR
        var deliciousSettings = {
            "username" : $("#delicious_settings_input_username", rootel).val(),
            "password" : $("#delicious_settings_input_password", rootel).val()
        };

        // Create JSON data to send
        var jsonDeliciousSettings = "";
        jsonDeliciousSettings = $.toJSON(deliciousSettings);

        // Sava the JSON data to the widgets JCR
        sdata.widgets.WidgetPreference.save(saveUrl, "delicious_settings.json", jsonDeliciousSettings, savedDeliciousSettings);
    };


    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * Switch between main view and settings
     */
    var doInit = function(){
        if (showSettings) {
            // Get settings
            getDeliciousSettings();

            // Show settings
            $deliciousContainerMain.hide();
            $deliciousContainerSettings.show();
        } else {
            // Show main view
            $deliciousContainerMain.show();
            $deliciousContainerSettings.hide();
        }

        // Buttons
        //$deliciousSettingsLink.live('click', reloadWidget);
        $deliciousSettingsButtonSave.live('click', saveDeliciousSettings);

        // Render
        $deliciousContainerMain.html($.Template.render($deliciousTemplateMain));
        $deliciousContainerSettings.html($.Template.render($deliciousTemplateSettings));
    };

    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("delicious");