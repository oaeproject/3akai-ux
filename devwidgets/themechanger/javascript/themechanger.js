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
     * @name sakai_global.themechanger
     *
     * @class themechanger
     *
     * @description
     * Allows the user to change themes
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.themechanger = function (tuid, showSettings) { 
        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var DEFAULT_THEME = "LEFT";  // default text theme is left

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mainContainer = $("#themechanger_container", $rootel);
        var $settingsContainer = $("#themechanger_settings", $rootel);
        var $settingsForm = $("#themechanger_settings_form", $rootel);
        var $cancelSettings = $("#themechanger_cancel_settings", $rootel);
        var $themePicker = $("#change_theme_to", $rootel);
        var $widget = $("#themechanger_widget", $rootel);
        var $widgetContainer = $("#themechanger_widget_container", $rootel);
        var $themechangerDialog = $(".themechanger_dialog", $rootel);

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /////////////////////////
        // Main View functions //
        /////////////////////////
        function changeTheme(theme) {
            var groupId = sakai.api.Util.extractEntity(window.location.pathname);
            var url = "/system/userManager/group/" + groupId + ".update.json";

            if(theme == "LEFT"){
                var data = {
                "sakai:customStyle": "\""
                };
            
                 $.post(url, data,closeThemeChanger());
                //sakai.api.Server.saveJSON(url, data, closeThemeChanger(), false);
            }else if(theme == "TOP"){
                var data = {
                "sakai:customStyle": "/dev/skins/topnav/skin.css"
                };
                $.post(url, data,closeThemeChanger());
                //sakai.api.Server.saveJSON(url, data, closeThemeChanger(), false);
            };
            
        };

            function closeThemeChanger(){
            	$themechangerDialog.jqmHide();
            	window.location.reload();
            }

        ////////////////////
        // Event Handlers //
        ////////////////////

        /** Binds Settings form */
             $('#themechanger_apply_button').live("click", function(ev) {
                var selectedTheme = $themePicker.val();
                changeTheme(selectedTheme);
             });


        $cancelSettings.bind("click", function(){
            sakai.api.Widgets.Container.informFinish(tuid, "themechanger");
        });

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function (_worldId) {
            worldId = _worldId;
            $themechangerDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 3000
            });
            sakai.api.Util.bindDialogFocus($themechangerDialog);
            $themechangerDialog.jqmShow();
        };

        // run the initialization function when the widget object loads
        $(window).bind("init.themechanger.sakai", function(e, _worldId){
        	doInit(_worldId);
        });
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("themechanger");
});