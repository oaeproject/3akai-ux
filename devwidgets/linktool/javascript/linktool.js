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
/*global $, sdata, get_cookie, Querystring, Config */

var sakai = sakai || {};

sakai.linktool = function(tuid, showSettings){


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

    // Links and labels
    var linktool = "#linktool";
    var linktoolSettings = linktool + "_settings";
    var linktoolSettingsAdvanced = linktoolSettings + "_advanced";
    var linktoolSettingsAdvancedDown = linktoolSettingsAdvanced + "_down";
    var linktoolSettingsAdvancedToggleSettings = linktoolSettingsAdvanced + "_toggle_settings";
    var linktoolSettingsAdvancedUp = linktoolSettingsAdvanced + "_up";
    var linktoolSettingsBorders = linktoolSettings + "_borders";
    var linktoolSettingsCancel = linktoolSettings + "_cancel";
    var linktoolSettingsColorContainer = linktoolSettings + "_color_container";
    var linktoolSettingsHeight = linktoolSettings + "_height";
    var linktoolSettingsInsert = linktoolSettings + "_insert";
    var linktoolSettingsPreview = linktoolSettings + "_preview";
    var linktoolSettingsPreviewFrame = linktoolSettingsPreview + "_frame";
    var linktoolSettingsQuerystringPreview = linktoolSettings + "_querystring_preview";
    var linktoolSettingsUrl = linktoolSettings + "_url";
    var linktoolSettingsWidth = linktoolSettings + "_width";

    // Containers
    var linktoolMainContainer = linktool + "_main_container";

    // Classes
    var linktoolSettingsQuerystringClass = ".linktool_settings_querystring";
    var linktoolSettingsQuerystringCheckboxClass = linktoolSettingsQuerystringClass + "_checkbox";
    var linktoolSettingsQuerystringTextClass = linktoolSettingsQuerystringClass + "_text";
    var linktoolSettingsWidthUnitClass = ".linktool_settings_width_unit";
    var linktoolSettingsWidthUnitSelectedClass = "linktool_settings_width_unit_selected";

    // Templates
    var $linktoolSettingsColorContainerTemplate = $("#linktool_settings_color_container_template", rootel);
    var $linktoolSettingsTemplate = $("#linktool_settings_template", rootel);
    var $linktoolSettingsPreviewTemplate = $("#linktool_settings_preview_template", rootel);
    var $linktoolSettingsQuerystringPreviewTemplate = $("#linktool_settings_querystring_preview_template", rootel);


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
     * Generate the complete url: the url and the querystring
     * keys and values
     */
    var generateCompleteUrl = function(){
        var completeUrl = "";
        if (json) {
            var containsQuestionMark = false;
            // Check if the url contains a ?
            if (json.url.indexOf("?") !== -1) {
                containsQuestionMark = true;
            }

            completeUrl += json.url;

            for (var i in json.querystring) {
                // Only add to the querystring if the checkbox is checked
                if (json.querystring.hasOwnProperty(i) && json.querystring[i].checked) {
                    var querystringPart = json.querystring[i].text + "=" + json.querystring[i].value;
                    if (containsQuestionMark) {
                        completeUrl += "&" + querystringPart;
                    }
                    else {
                        completeUrl += "?" + querystringPart;
                        containsQuestionMark = true;
                    }
                }
            }
        }
        return completeUrl;
    };

    /**
     * Called when the data has been saved to the JCR.
     */
    var savedDataToJCR = function(success, data){
        sakai.api.Widgets.Container.informFinish(tuid);
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
            $(linktoolSettingsPreview).html($.TemplateRenderer($linktoolSettingsPreviewTemplate, json));
        }
        else {
            $(linktoolSettingsPreviewFrame).attr("style", "border: " + json.border_size + "px #" + json.border_color + " solid");
        }
    };

    /**
     * Render the iframe for the widget
     */
    var renderIframe = function(){
        if (json) {
            json.url = generateCompleteUrl();
            $(linktoolMainContainer, rootel).html($.TemplateRenderer($linktoolSettingsPreviewTemplate, json));
            $(linktoolMainContainer, rootel).show();
        }
    };

    /**
     * Render the html of the linktoolsettings
     */
    var renderLinkToolSettings = function(){
        if (json) {
            $(linktoolSettings).html($.TemplateRenderer($linktoolSettingsTemplate, json));
        }
    };

    /**
     * Render the color container
     */
    var renderColorContainer = function(){
        if (json) {
            $(linktoolSettingsColorContainer).html($.TemplateRenderer($linktoolSettingsColorContainerTemplate, json));
        }
    };

    /**
     * Render the querystring preview
     */
    var renderQuerystringPreview = function(){
        if (json) {
            var jsoncomplete = {};
            jsoncomplete.url_complete_preview = generateCompleteUrl();
            $(linktoolSettingsQuerystringPreview).html($.TemplateRenderer($linktoolSettingsQuerystringPreviewTemplate, jsoncomplete));
        }
    };


    //////////////////////
    // Global functions //
    //////////////////////

    /**
     * Display the iframe in normal mode
     * @param {Object} parameters JSON object that contains the necessary information for the iframe
     */
    var displayLinkTool = function(parameters){
        json = parameters;
        renderIframe();
    };

    /**
     * Save the linktool to the jcr
     */
    var saveLinkTool = function(){
        if (json.url !== "") {
            sakai.api.Widgets.saveWidgetData(tuid, json, savedDataToJCR);
        }
    };

    /**
     * Change the direction (up/down) of the arrow for the advanced settings
     */
    var changeAdvancedSettingsArrow = function(){
        if (isAdvancedSettingsVisible) {
            $(linktoolSettingsAdvancedDown, rootel).hide();
            $(linktoolSettingsAdvancedUp, rootel).show();
        }
        else {
            $(linktoolSettingsAdvancedUp, rootel).hide();
            $(linktoolSettingsAdvancedDown, rootel).show();
        }
    };


    //////////////
    // Bindings //
    //////////////

    /*
     * Add binding to the querystring elements
     */
    var addQuerystringBinding = function(){
        $(linktoolSettingsQuerystringCheckboxClass).click(function(){
            var checkId = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 2];
            json.querystring[checkId].checked = $(this).attr("checked");
            renderQuerystringPreview();
        });

        $(linktoolSettingsQuerystringTextClass).change(function(){
            var textId = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 2];
            json.querystring[textId].text = $(this).val();
            renderQuerystringPreview();
        });
    };

    /*
     * Add binding to the color boxes
     */
    var addColorBinding = function(){
        $(".linktool_settings_color").click(function(){
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

        // Change the url for the iFrame
        $(linktoolSettingsUrl).change(function(){
            var urlValue = $(this).val();
            if (urlValue !== "") {
                // Check if someone already wrote http inside the url
                if (!isUrl(urlValue)) {
                    urlValue = 'http://' + urlValue;
                }
                json.url = urlValue;
                renderIframeSettings(true);
                renderQuerystringPreview();
            }
        });

        // Change the iframe width
        $(linktoolSettingsWidth).change(function(){
            var widthValue = $(linktoolSettingsWidth).val();

            if (isDecimal(widthValue)) {
                json.width = widthValue;
            }
            renderIframeSettings(false);
        });

        // Change the iframe height
        $(linktoolSettingsHeight).change(function(){
            var heightValue = $(linktoolSettingsHeight).val();

            if (isDecimal(heightValue)) {
                json.height = heightValue;
            }
            renderIframeSettings(false);
        });

        // Change the border width
        $(linktoolSettingsBorders).change(function(){
            var borderValue = $(linktoolSettingsBorders).val();
            if (isDecimal(borderValue)) {
                json.border_size = borderValue;
                renderIframeSettings(false);
            }
        });

        // Toggle the advanced view
        $(linktoolSettingsAdvancedToggleSettings).click(function(){
            $("#linktool_settings_advanced", rootel).toggle();
            isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
            changeAdvancedSettingsArrow();
        });

        // When you click on one of the width units (px or percentage)
        $(linktoolSettingsWidthUnitClass).click(function(){
            var widthUnitValue = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
            if (widthUnitValue === "px") {
                json.width_unit = widthUnitValue;
            }
            else {
                json.width_unit = "%";
            }
            $(linktoolSettingsWidthUnitClass).removeClass(linktoolSettingsWidthUnitSelectedClass);
            $(this).addClass(linktoolSettingsWidthUnitSelectedClass);
            renderIframeSettings(false);
        });

        // When you push the save button..
        $(linktoolSettingsInsert).click(function(){
            saveLinkTool();
        });

        // Cancel it
        $(linktoolSettingsCancel).click(function(){
            sakai.api.Widgets.Container.informCancel(tuid);
        });

        addColorBinding();
        addQuerystringBinding();
    };


    ///////////////////////
    // Initial functions //
    ///////////////////////

    /**
     * Function that fills in the input fields in the settings tab.
     * @param {Object} parameters A JSON object that contains the necessary information.
     * @param {Boolean} exists Does there exist a previous linktool
     */
    var displaySettings = function(parameters, exists){
        if (exists && parameters.url) {
            json = parameters;
        }
        else {
            var qs = new Querystring();
            json = {
                border_size: 0,
                border_color: "cccccc",
                height: defaultHeight,
                url: "",
                width: defaultWidth,
                width_unit: defaultWidthUnit
            };
            json.querystring = {
                sid: {
                    checked: false,
                    text: "siteId",
                    value: qs.get("siteid")
                },
                sessionid: {
                    checked: false,
                    text: "sessionId",
                    value: $.cookie('SAKAIID')
                },
                uid: {
                    checked: false,
                    text: "userId",
                    value: sakai.data.me.user.userid
                },
                uname: {
                    checked: false,
                    text: "userName",
                    value: sakai.data.me.profile.firstName + " " + sakai.data.me.profile.lastName
                },
                urole: {
                    checked: false,
                    text: "userRole",
                    value: "owner"
                }
            };
        }
        renderLinkToolSettings();
        renderIframeSettings(true);
        renderColorContainer();
        renderQuerystringPreview();
        addBinding(); // Add binding to the various elements
        changeAdvancedSettingsArrow();
        $(linktoolSettings).show(); // Show the linktool settings
    };

    /*
     * Is the widget in settings mode or not
     */
    if (showSettings) {
        $(linktoolMainContainer).hide();
        $(linktoolSettings).show();
    }
    else {
        $(linktoolSettings).hide();
        $(linktoolMainContainer).show();
    }

    /**
     * Will fetch the URL and other parameters from the JCR and according to which
     * view we are in, fill in the settings or display an iframe.
     */
    var getLinkTool = function(){

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {
                // Get a JSON string that contains the necessary information.
                var parameters = data;

                if (showSettings) {
                    displaySettings(parameters, true); // Fill in the settings page.
                }
                else {
                    displayLinktool(parameters); // Show the frame
                }
            }
            else {
                // When the request isn't successful, it means that  there was no existing linktools
                // so we show the basic settings.
                displaySettings(null, false);
            }
        });
    };

    getLinkTool();
};

sakai.api.Widgets.widgetLoader.informOnLoad("linktool");