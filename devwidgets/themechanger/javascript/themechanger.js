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

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $applyThemeChanger = $("#themechanger_apply_button", $rootel);
        var $closeThemeChanger = $("#themechanger_close_button", $rootel);
        var $themePicker = $("#change_theme_to", $rootel);
        var $themechangerDialog = $(".themechanger_dialog", $rootel);
        var themePickerTemplate = $("#themechanger_form_template", $rootel);
        var themes = {};

        ////////////////////
        // View functions //
        ////////////////////

        /**
        * Renders the themes using template
        */
        var renderThemes = function(){
            var themes = {themes:$.extend(sakai.config.skinStore, {}, true)};
            sakai.api.Util.TemplateRenderer(themePickerTemplate, themes, $themePicker);
        }

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
        * Removes current skin and adds new one if necessary.
        * @param {String} theme The name of the theme
        */
        var changeTheme = function(theme) {
            var cssURL = getURL(theme);
            $.ajax({
                url: "/system/userManager/group/" + sakai_global.group.groupId + ".update.json",
                data: {
                    "sakai:customStyle": cssURL
                },
                type: "POST"
            });
            if(cssURL.substr(-8, 8) == "skin.css"){
                 removeCSS();
                 addCSS(cssURL);
            }
            else{
                removeCSS();
            };
        };

        /**
        * Gets and returns the url of the css based on the theme name
        * @param {String} theme The name of the theme
        */
        var getURL = function(theme){
            var url = "";
            $.each(sakai.config.skinStore, function(key, value){
                if(theme == value.title) { 
                   url = value.url;
                }
            });
            return url
        }

        /**
        * Adds the link into the html head
        * @param {String} cssURL The url of the skin to which the user wants to change to
        */
        var addCSS = function(cssURL){
            if(cssURL != "/"){
                $('head').append('<link href="' + cssURL + '" type="text/css" rel="stylesheet" />');
            }
        }

        /**
        * Removes the href from the head if the href ends with 'skin.css'
        */
        var removeCSS = function() {
            $("link").each(function() {
                var string = this.href.substr(-8, 8);
                if(string == "skin.css"){
                    this.removeAttribute("href");
                }
            });
        };

        ////////////////////
        // Event Handlers //
        ////////////////////
        /** Binds apply & close button */
       var addBinding = function(){
            $applyThemeChanger.on("click", function(ev) {
                var selectedTheme = $themePicker.val();
                changeTheme(selectedTheme);
                $themechangerDialog.jqmHide();
            });

            $closeThemeChanger.on("click", function(){
                $themechangerDialog.jqmHide();
            });
        }
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
            renderThemes();
            addBinding();
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