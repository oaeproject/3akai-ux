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
/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
/*global $, get_cookie, Config */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.ggadget
     *
     * @class ggadget
     *
     * @description
     * Initialize the ggadget widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.ggadget = function(tuid, showSettings, widgetData){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var rootel = $("#" + tuid);
        var json = false;
        var isAdvancedSettingsVisible = false;

        // Default values
        var defaultWidth = 600;
        var defaultWidthUnit = "px";
        var defaultHeight = 400;

        // Links and labels
        var remotecontent = "#ggadget_remotecontent";
        var remotecontentSettings = remotecontent + "_settings";
        var remotecontentSettingsAdvanced = remotecontentSettings + "_advanced";
        var remotecontentSettingsAdvancedDown = remotecontentSettingsAdvanced + "_down";
        var remotecontentSettingsAdvancedToggleSettings = remotecontentSettingsAdvanced + "_toggle_settings";
        var remotecontentSettingsAdvancedUp = remotecontentSettingsAdvanced + "_up";
        var remotecontentSettingsBorders = remotecontentSettings + "_borders";
        var remotecontentSettingsCancel = remotecontentSettings + "_cancel";
        var remotecontentSettingsColorContainer = remotecontentSettings + "_color_container";
        var remotecontentSettingsHeight = remotecontentSettings + "_height";
        var remotecontentSettingsInsert = remotecontentSettings + "_insert";
        var remotecontentSettingsPreview = remotecontentSettings + "_preview";
        var remotecontentSettingsPreviewFrame = remotecontentSettingsPreview + "_frame";
        var remotecontentSettingsUrl = remotecontentSettings + "_url";
        var remotecontentSettingsUrlError = remotecontentSettingsUrl + "_error";
        var remotecontentSettingsUrlErrorTitle = remotecontentSettingsUrlError + "_title";
        var remotecontentSettingsWidth = remotecontentSettings + "_width";

        // Containers
        var remotecontentMainContainer = remotecontent + "_main_container";

        // Classes
        var remotecontentSettingsWidthUnitClass = ".ggadget_remotecontent_settings_width_unit";
        var remotecontentSettingsWidthUnitSelectedClass = "ggadget_remotecontent_settings_width_unit_selected";

        // Templates
        var $remotecontentSettingsColorContainerTemplate = $("#ggadget_remotecontent_settings_color_container_template", rootel);
        var $remotecontentSettingsTemplate = $("#ggadget_remotecontent_settings_template", rootel);
        var $remotecontentSettingsPreviewTemplate = $("#ggadget_remotecontent_settings_preview_template", rootel);

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Check if the value is a decimal or not
         * @param {Object} value Value that needs to be checked
         * @return {Boolean}
         *     true: is a decimal
         *     false: is not a decimal
         */
        var isDecimal = function(value){
            return (/^\d+$/).test(value);
        };

        /**
         * Check if the input url is in fact an url or not
         * @param {String} url Url that needs to be tested
         * @return {Boolean}
         *     true: is an url
         *     false: is not an url
         */
        var isUrl = function(url){
            return (/^http\:\/\/|^https\:\/\//i).test(url);
        };

        /**
         * Called when the data has been saved to the JCR.
         */
        var savedDataToJCR = function(){
            sakai.api.Widgets.Container.informFinish(tuid, "ggadget");
        };


        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the iframe for the widget in settings mode
         * @param {Boolean} complete Render the preview completely or only adjust values
         */
        var renderIframeSettings = function(complete){
            if (complete) {
                // We create this object to render the iframe with the default height, width and widthunit
                var jsonDefaultSize = {};
                jsonDefaultSize = json;
                jsonDefaultSize.width = defaultWidth;
                jsonDefaultSize.width_unit = defaultWidthUnit;
                jsonDefaultSize.height = defaultHeight;
                $(remotecontentSettingsPreview).html(sakai.api.Util.TemplateRenderer($remotecontentSettingsPreviewTemplate, json, null, false));
            } else {
                $(remotecontentSettingsPreviewFrame).attr("style", "border: " + json.border_size + "px #" + json.border_color + " solid");
            }
        };

        /**
         * Render the iframe for the widget
         */
        var renderIframe = function(){
            if (json) {
                $(remotecontentMainContainer, rootel).html(sakai.api.Util.TemplateRenderer($remotecontentSettingsPreviewTemplate, json, null, false));

                // SAKIII-314 We need to show the container, otherwise the second item won't be shown.
                $(remotecontentMainContainer, rootel).show();
            }
        };

        /**
         * Render the html of the remotecontentsettings
         */
        var renderRemoteContentSettings = function(){
            if (json) {
                $(remotecontentSettings).html(sakai.api.Util.TemplateRenderer($remotecontentSettingsTemplate, json));
            }
        };

        /**
         * Render the color container
         */
        var renderColorContainer = function(){
            if (json) {
                $(remotecontentSettingsColorContainer).html(sakai.api.Util.TemplateRenderer($remotecontentSettingsColorContainerTemplate, json));
            }
        };


        //////////////////////
        // Global functions //
        //////////////////////

        /**
         * Display the iframe in normal mode
         * @param {Object} parameters JSON object that contains the necessary information for the iframe
         */
        var displayRemoteContent = function(parameters){
            json = parameters;
            renderIframe();
            $("iframe").ready(function() {
                $("iframe iframe").attr("style", "overflow:auto");
            });
        };

        /**
         * Save the remotecontent to the jcr
         */
        var saveRemoteContent = function(){
            if (json.url !== "") {
                sakai.api.Widgets.saveWidgetData(tuid, json, savedDataToJCR);
            } else {
                sakai.api.Util.notification.show($(remotecontentSettingsUrlErrorTitle).html(), $(remotecontentSettingsUrlError).html());
            }
        };

        /**
         * Change the direction (up/down) of the arrow for the advanced settings
         */
        var changeAdvancedSettingsArrow = function(){
            if (isAdvancedSettingsVisible) {
                $(remotecontentSettingsAdvancedDown, rootel).hide();
                $(remotecontentSettingsAdvancedUp, rootel).show();
            } else {
                $(remotecontentSettingsAdvancedUp, rootel).hide();
                $(remotecontentSettingsAdvancedDown, rootel).show();
            }
        };


        //////////////
        // Bindings //
        //////////////

        /*
         * Add binding to the color boxes
         */
        var addColorBinding = function(){
            $(".ggadget_remotecontent_settings_color").click(function(){
                json.border_color = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
                renderIframeSettings(false);
                renderColorContainer();
                addColorBinding();
            });
        };

        /**
         * previewGadget
         * Executes the preview for the gadget based on the embed code
         */
        var previewGadget = function() {
            // get the src attribute of the embed script tag, and define a html render rather than JS
                var urlValue = $($(remotecontentSettingsUrl).val()).attr("src").replace("output=js", "output=html");

                // Get size of the gadget from the embed code
                var rawParams = urlValue.split("&");
                for (var i = 0, il = rawParams.length; i < il; i++) {
                    var kvpair = rawParams[i].split("=");
                    if (kvpair[0] === "w") {
                        json.width = kvpair[1];
                    }
                    if (kvpair[0] === "h") {
                        json.width = kvpair[1];
                    }
                }

                // Set width and height values in settings
                if (isDecimal(json.width)) {
                    $(remotecontentSettingsWidth).val(json.width);
                }
                if (isDecimal(json.height)) {
                    $(remotecontentSettingsHeight).val(json.height);
                }
                if (urlValue !== "") {
                    // Check if someone already wrote http inside the url
                    if (!isUrl(urlValue)) {
                        urlValue = 'http://' + urlValue;
                    }
                    json.url = urlValue;
                    renderIframeSettings(true);
                }
        };


        /*
         * Add binding to all the elements
         */
        var addBinding = function(){
            // Change the url for the iFrame
            $(remotecontentSettingsUrl).change(function(){
                previewGadget();
            });

            var validateOpts = {
                submitHandler: previewGadget
            };
            sakai.api.Util.Forms.validate($("#ggadget_form", rootel), validateOpts, true);

            // Change the iframe width
            $(remotecontentSettingsWidth).change(function(){
                var widthValue = $(remotecontentSettingsWidth).val();
                if (isDecimal(widthValue)) {
                    json.width = widthValue;
                }
                renderIframeSettings(false);
            });

            // Change the iframe height
            $(remotecontentSettingsHeight).change(function(){
                var heightValue = $(remotecontentSettingsHeight).val();
                if (isDecimal(heightValue)) {
                    json.height = heightValue;
                }
                renderIframeSettings(false);
            });

            // Change the border width
            $(remotecontentSettingsBorders).change(function(){
                var borderValue = $(remotecontentSettingsBorders).val();
                if (isDecimal(borderValue)) {
                    json.border_size = borderValue;
                    renderIframeSettings(false);
                }
            });

            // Toggle the advanced view
            $(remotecontentSettingsAdvancedToggleSettings).click(function(){
                $(remotecontentSettingsAdvanced, rootel).toggle();
                isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
                changeAdvancedSettingsArrow();
            });

            // When you click on one of the width units (px or percentage)
            $(remotecontentSettingsWidthUnitClass).click(function(){
                var widthUnitValue = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
                if (widthUnitValue === "px") {
                    json.width_unit = widthUnitValue;
                } else {
                    json.width_unit = "%";
                }
                $(remotecontentSettingsWidthUnitClass).removeClass(remotecontentSettingsWidthUnitSelectedClass);
                $(this).addClass(remotecontentSettingsWidthUnitSelectedClass);
                renderIframeSettings(false);
            });

            // When you push the save button..
            var validateOpts = {
                submitHandler: saveRemoteContent
            };
            sakai.api.Util.Forms.validate($("#ggadget_settings_form", rootel), validateOpts, true);

            // Cancel it
            $(remotecontentSettingsCancel).click(function(){
                sakai.api.Widgets.Container.informCancel(tuid, "ggadget");
            });

            addColorBinding();
        };

        ///////////////////////
        // Initial functions //
        ///////////////////////

        /**
         * Function that fills in the input fields in the settings tab.
         * @param {Object} parameters A JSON object that contains the necessary information.
         * @param {Boolean} exists Does there exist a previous remotecontent
         */
        var displaySettings = function(parameters, exists){
            if (exists && parameters.url) {
                json = parameters;
            } else {
                json = {
                    border_size: 0,
                    border_color: "cccccc",
                    height: defaultHeight,
                    url: "",
                    width: defaultWidth,
                    width_unit: defaultWidthUnit
                };
            }
            renderRemoteContentSettings();
            renderIframeSettings(true);
            renderColorContainer();
            addBinding(); // Add binding to the various elements
            changeAdvancedSettingsArrow();
            $(remotecontentSettings).show(); // Show the remotecontent settings
            $(remotecontentSettingsUrl).focus();
        };

        /*
         * Is the widget in settings mode or not
         */
        if (showSettings) {
            $(remotecontentMainContainer).hide();
            $(remotecontentSettings).show();
        }
        else {
            $(remotecontentSettings).hide();
            $(remotecontentMainContainer).show();
        }

        /**
         * Will fetch the URL and other parameters from the JCR and according to which
         * view we are in, fill in the settings or display an iframe.
         */
        var getRemoteContent = function(){
            if (widgetData.ggadget){
                processRemoteContent(true, widgetData.ggadget);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, processRemoteContent);
            }
        };
  
        var processRemoteContent = function(success, data){
            if (success) {
                // Get a JSON string that contains the necessary information.
                var parameters = data;
                if (showSettings) {
                    displaySettings(parameters, true); // Fill in the settings page.
                } else {
                    displayRemoteContent(parameters); // Show the frame
                }
            } else {
                // When the request isn't successful, it means that  there was no existing remotecontent
                // so we show the basic settings.
                if (showSettings) {
                    displaySettings(null, false);
                }
            }
        };

        getRemoteContent();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("ggadget");
});
