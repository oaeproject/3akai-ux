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

/*global $, sdata, get_cookie, Config */

var sakai = sakai || {};

sakai.remotecontent = function(tuid, placement, showSettings){


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
    var remotecontent = "#remotecontent";
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
    var remotecontentSettingsWidth = remotecontentSettings + "_width";

    // Containers
    var remotecontentMainContainer = remotecontent + "_main_container";

    // Classes
    var remotecontentSettingsWidthUnitClass = ".remotecontent_settings_width_unit";
    var remotecontentSettingsWidthUnitSelectedClass = "remotecontent_settings_width_unit_selected";

    // Templates
    var remotecontentSettingsColorContainerTemplate = "remotecontent_settings_color_container_template";
    var remotecontentSettingsTemplate = "remotecontent_settings_template";
    var remotecontentSettingsPreviewTemplate = "remotecontent_settings_preview_template";


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
    var savedDataToJCR = function() {
        sdata.container.informFinish(tuid);
    };


    //////////////////////
    // Render functions //
    //////////////////////

    /**
     * Render the iframe for the widget in settings mode
     * @param {Boolean} complete Render the preview completely or only adjust values
     */
    var renderIframeSettings = function(complete){
        if(complete){
            // We create this object to render the iframe with the default height, width and widthunit
            var jsonDefaultSize = {};
            jsonDefaultSize = json;
            jsonDefaultSize.width = defaultWidth;
            jsonDefaultSize.width_unit = defaultWidthUnit;
            jsonDefaultSize.height = defaultHeight;
            $(remotecontentSettingsPreview).html($.TemplateRenderer(remotecontentSettingsPreviewTemplate, json));
        }else{
            $(remotecontentSettingsPreviewFrame).attr("style", "border: " + json.border_size + "px #" + json.border_color + " solid");
        }
    };

    /**
     * Render the iframe for the widget
     */
    var renderIframe = function(){
        if(json){
            $(remotecontentMainContainer, rootel).html($.TemplateRenderer(remotecontentSettingsPreviewTemplate, json));
        }
    };

    /**
     * Render the html of the remotecontentsettings
     */
    var renderRemoteContentSettings = function() {
        if(json){
            $(remotecontentSettings).html($.TemplateRenderer(remotecontentSettingsTemplate, json));
        }
    };

    /**
     * Render the color container
     */
    var renderColorContainer = function(){
        if(json){
            $(remotecontentSettingsColorContainer).html($.TemplateRenderer(remotecontentSettingsColorContainerTemplate, json));
        }
    };


    //////////////////////
    // Global functions //
    //////////////////////

    /**
     * Display the iframe in normal mode
     * @param {Object} parameters JSON object that contains the necessary information for the iframe
     */
    var displayRemoteContent = function(parameters) {
        json = parameters;
        renderIframe();
    };

    /**
     * Save the remotecontent to the jcr
     */
    var saveRemoteContent = function() {
        if (json.url !== "") {
            var str = $.toJSON(json); // Convert the posts to a JSON string
            var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
            sdata.widgets.WidgetPreference.save(saveUrl, "remotecontent", str, savedDataToJCR);
        } else {
            alert("Please specify a URL");
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
        $(".remotecontent_settings_color").click(function() {
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
        $(remotecontentSettingsUrl).change(function() {
            var urlValue = $(this).val();
            if (urlValue !== "") {
                // Check if someone already wrote http inside the url
                if (!isUrl(urlValue)) {
                    urlValue = 'http://' + urlValue;
                }
                json.url = urlValue;
                renderIframeSettings(true);
            }
        });

        // Change the iframe width
        $(remotecontentSettingsWidth).change(function() {
            var widthValue = $(remotecontentSettingsWidth).val();

            if(isDecimal(widthValue)){
                json.width = widthValue;
            }
            renderIframeSettings(false);
        });

        // Change the iframe height
        $(remotecontentSettingsHeight).change(function() {
            var heightValue = $(remotecontentSettingsHeight).val();

            if(isDecimal(heightValue)){
                json.height = heightValue;
            }
            renderIframeSettings(false);
        });

        // Change the border width
        $(remotecontentSettingsBorders).change(function() {
            var borderValue = $(remotecontentSettingsBorders).val();
            if(isDecimal(borderValue)){
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
        $(remotecontentSettingsWidthUnitClass).click(function()  {
             var widthUnitValue = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
             if(widthUnitValue === "px"){
                 json.width_unit = widthUnitValue;
             }else{
                 json.width_unit = "%";
             }
             $(remotecontentSettingsWidthUnitClass).removeClass(remotecontentSettingsWidthUnitSelectedClass);
             $(this).addClass(remotecontentSettingsWidthUnitSelectedClass);
             renderIframeSettings(false);
        });

        // When you push the save button..
        $(remotecontentSettingsInsert).click(function()  {
            saveRemoteContent();
        });

        // Cancel it
        $(remotecontentSettingsCancel).click(function()  {
            sdata.container.informCancel(tuid);
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
    var displaySettings = function(parameters, exists) {
        if(exists && parameters.url){
            json = parameters;
        }else{
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
    var getRemoteContent = function() {
        $.ajax({
            url : Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "remotecontent"),
            cache: false,
               success : function(data) {
                // Get a JSON string that contains the necessary information.
                var parameters = $.evalJSON(data);

                if (showSettings) {
                    displaySettings(parameters, true); // Fill in the settings page.
                }
                else {
                    displayRemoteContent(parameters); // Show the frame
                }
            },
            error: function(xhr, textStatus, thrownError) {
                // When the request isn't successful, it means that  there was no existing remotecontent
                // so we show the basic settings.
                displaySettings(null, false);
            }
        });
    };

    getRemoteContent();
};

sdata.widgets.WidgetLoader.informOnLoad("remotecontent");