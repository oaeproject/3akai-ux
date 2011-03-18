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
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 */
/*global $,  get_cookie, Config */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.remotecontent
     *
     * @class remotecontent
     *
     * @description
     * Initialize the remotecontent widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.remotecontent = function(tuid, showSettings){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var rootel = $("#" + tuid);
        var json = false;
        var isAdvancedSettingsVisible = false;

        // Default values
        var defaultWidth = 100;
        var defaultWidthUnit = "%";
        var defaultHeight = 200;
        var clickSubmit = false;

        // Links and labels
        var remotecontent = "#remotecontent";
        var remotecontentTitle = remotecontent + "_title";
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
        var remotecontentSettingsUrlBlank = remotecontentSettingsUrl + "_blank";
        var remotecontentSettingsWidth = remotecontentSettings + "_width";

        // Containers
        var remotecontentMainContainer = remotecontent + "_main_container";

        // Classes
        var remotecontentSettingsWidthUnitClass = ".remotecontent_settings_width_unit";
        var remotecontentSettingsWidthUnitSelectedClass = "remotecontent_settings_width_unit_selected";

        // Templates
        var $remotecontentSettingsColorContainerTemplate = $("#remotecontent_settings_color_container_template", rootel);
        var $remotecontentSettingsTemplate = $("#remotecontent_settings_template", rootel);
        var $remotecontentSettingsPreviewTemplate = $("#remotecontent_settings_preview_template", rootel);
        var $noRemoteContentSet = $("#remotecontent_no_content_set", rootel);


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
         * Check if the input url is missing http/s or not
         * @param {String} url Url that needs to be tested
         * @return {Boolean}
         *     true: is an url
         *     false: is not an url
         */
        var isUrl = function(url){
            return (/^http\:\/\/|^https\:\/\//i).test(url);
        };

        /**
         * Check if the input url is in fact a complete url or not
         * @param {String} url Url that needs to be tested
         * @return {Boolean}
         *     true: is an url
         *     false: is not an url
         */
        var isCompleteUrl = function(url){
            var regEx = new RegExp(/^(?:ftp|https?):\/\/(?:(?:[\w\.\-\+%!$&'\(\)*\+,;=]+:)*[\w\.\-\+%!$&'\(\)*\+,;=]+@)?(?:[a-z0-9\-\.%]+)(?::[0-9]+)?(?:[\/|\?][\w#!:\.\?\+=&%@!$'~*,;\/\(\)\[\]\-]*)?$/);
            return regEx.test(url);
        };

        /**
         * Called when the data has been saved to the JCR.
         */
        var savedDataToJCR = function(){
            sakai.api.Widgets.Container.informFinish(tuid, "remotecontent");
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
            }
            else {
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
        };

        /**
         * Save the remotecontent to the jcr
         */
        var saveRemoteContent = function(){
            clickSubmit = true;
            if ($("#remotecontent_form").valid()) {
                $(remotecontentSettingsPreview).html("");
                sakai.api.Widgets.saveWidgetData(tuid, json, savedDataToJCR);
            }
        };

        /**
         * Change the direction (up/down) of the arrow for the advanced settings
         */
        var changeAdvancedSettingsArrow = function(){
            if (isAdvancedSettingsVisible) {
                $(remotecontentSettingsAdvancedDown, rootel).hide();
                $(remotecontentSettingsAdvancedUp, rootel).show();
            }
            else {
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
            $(".remotecontent_settings_color").click(function(){
                json.border_color = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
                renderIframeSettings(false);
                renderColorContainer();
                addColorBinding();
            });
        };

        /*
         * Add binding to all the elements
         */
        var addBinding = function(){
            // this method append http:// or ftp:// or https:// 
            $.validator.addMethod("appendhttp", function(value, element) {
                if(value.substring(0,7) !== "http://" &&
                value.substring(0,6) !== "ftp://" &&
                value.substring(0,8) !== "https://" &&
                $.trim(value) !== "") {
                    $(element).val("http://" + value);
                    json.url = "http://" + value;
                } else {
                  json.url = value;
                }
                return true;
            }, "No error message, this is just an appender");

            // FORM VALIDATION 
            $("#remotecontent_form").validate({
                onkeyup: false,
                errorPlacement: function(error, element){
                    if (clickSubmit) {
                        sakai.api.Util.notification.show($(remotecontentTitle).html(), $(error).html());
                        clickSubmit = false;
                    }
                }
            });
        
            // define rules for the url
            $(remotecontentSettingsUrl).rules("add", {
                required: true,
                url: true,
                messages: {
                    required: $(remotecontentSettingsUrlBlank).html(),
                    url: $(remotecontentSettingsUrlError).html()
                }
            });

            // Change the url for the iFrame
            $(remotecontentSettingsUrl).change(function(){
                var urlValue = $(this).val();
                if ($("#remotecontent_form").valid()) {
                    renderIframeSettings(true);
                }
            });

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
                $("#remotecontent_settings_advanced", rootel).toggle();
                isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
                changeAdvancedSettingsArrow();
            });

            // When you click on one of the width units (px or percentage)
            $(remotecontentSettingsWidthUnitClass).click(function(){
                var widthUnitValue = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
                if (widthUnitValue === "px") {
                    json.width_unit = widthUnitValue;
                }
                else {
                    json.width_unit = "%";
                }
                $(remotecontentSettingsWidthUnitClass).removeClass(remotecontentSettingsWidthUnitSelectedClass);
                $(this).addClass(remotecontentSettingsWidthUnitSelectedClass);
                renderIframeSettings(false);
            });

            // When you push the save button..
            $(remotecontentSettingsInsert).click(function(){
                saveRemoteContent();
            });

            // Cancel it
            $(remotecontentSettingsCancel).click(function(){
                sakai.api.Widgets.Container.informCancel(tuid, "remotecontent");
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
            }
            else {
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

            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

                if (success) {
                    // Get a JSON string that contains the necessary information.
                    var parameters = data;

                    if (showSettings) {
                        displaySettings(parameters, true); // Fill in the settings page.
                    }
                    else {
                        displayRemoteContent(parameters); // Show the frame
                    }
                }
                else {
                    // When the request isn't successful, it means that  there was no existing remotecontent
                    // so we show the basic settings.
                    if (showSettings) {
                        displaySettings(null, false);
                    } else {
                        $(remotecontentMainContainer, rootel).html(sakai.api.Util.TemplateRenderer($noRemoteContentSet, {}));
                        $(remotecontentMainContainer, rootel).show();
                    }
                }
            });
        };

        getRemoteContent();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("remotecontent");
});
