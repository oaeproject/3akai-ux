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

var sakai = sakai || {};

sakai.basiclti = function(tuid, showSettings){


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
    var basiclti = "#basiclti";
    var basicltiSettings = basiclti + "_settings";
    var basicltiSettingsAdvanced = basicltiSettings + "_advanced";
    var basicltiSettingsAdvancedDown = basicltiSettingsAdvanced + "_down";
    var basicltiSettingsAdvancedToggleSettings = basicltiSettingsAdvanced + "_toggle_settings";
    var basicltiSettingsAdvancedUp = basicltiSettingsAdvanced + "_up";
    var basicltiSettingsBorders = basicltiSettings + "_borders";
    var basicltiSettingsCancel = basicltiSettings + "_cancel";
    var basicltiSettingsColorContainer = basicltiSettings + "_color_container";
    var basicltiSettingsHeight = basicltiSettings + "_frame_height";
    var basicltiSettingsInsert = basicltiSettings + "_insert";
    var basicltiSettingsPreview = basicltiSettings + "_preview";
    var basicltiSettingsPreviewFrame = basicltiSettingsPreview + "_frame";
    var basicltiSettingsLtiUrl = basicltiSettings + "_ltiurl";
    var basicltiSettingsLtiKey = basicltiSettings + "_ltikey";
    var basicltiSettingsLtiSecret = basicltiSettings + "_ltisecret";
    var basicltiSettingsWidth = basicltiSettings + "_width";
    var basicltiSettingsReleaseName = basicltiSettings + "_release_names";
    
    // Containers
    var basicltiMainContainer = basiclti + "_main_container";
    
    // Classes
    var basicltiSettingsWidthUnitClass = ".basiclti_settings_width_unit";
    var basicltiSettingsWidthUnitSelectedClass = "basiclti_settings_width_unit_selected";
    
    // Templates
    var $basicltiSettingsColorContainerTemplate = $("#basiclti_settings_color_container_template", rootel);
    var $basicltiSettingsTemplate = $("#basiclti_settings_template", rootel);
    var $basicltiSettingsPreviewTemplate = $("#basiclti_settings_preview_template", rootel);
    
    
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
    var savedDataToJCR = function(data, textStatus, XMLHttpRequest){
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
        if (complete) {
            json.launchDataUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_widgets").replace(/__TUID__/, tuid).replace(/__NAME__/, "basiclti") + '.launch.html';
            $(basicltiSettingsPreview).html($.TemplateRenderer($basicltiSettingsPreviewTemplate, json));
        }
        else {
            $(basicltiSettingsPreviewFrame).attr("style", "border: " + json.border_size + "px #" + json.border_color + " solid");
        }
    };
    
    /**
     * Render the iframe for the widget
     */
    var renderIframe = function(){
        if (json) {
            json.launchDataUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_widgets").replace(/__TUID__/, tuid).replace(/__NAME__/, "basiclti") + '.launch.html';
            $(basicltiMainContainer, rootel).html($.TemplateRenderer($basicltiSettingsPreviewTemplate, json));

            // SAKIII-314 We need to show the container, otherwise the second item won't be shown.
            $(basicltiMainContainer, rootel).show();
        }
    };
    
    /**
     * Render the html of the basicltisettings
     */
    var renderRemoteContentSettings = function(){
        if (json) {
            $(basicltiSettings).html($.TemplateRenderer($basicltiSettingsTemplate, json));
        }
    };
    
    /**
     * Render the color container
     */
    var renderColorContainer = function(){
        if (json) {
            $(basicltiSettingsColorContainer).html($.TemplateRenderer($basicltiSettingsColorContainerTemplate, json));
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
        // default to some reasonable vaules if the settings node does not have them (maybe a legacy node)
        if (parameters.border_size == null) {
            parameters.border_size = 0;
        }
        if (parameters.border_color == null) {
            parameters.border_color = "cccccc";
        }
        if (parameters.width == null) {
            parameters.width = defaultWidth;
        }
        if (parameters.width_unit == null) {
            parameters.width_unit = defaultWidthUnit;
        }
        if (parameters.frame_height == null) {
            parameters.frame_height = defaultHeight;
        }
        json = parameters;
        renderIframe();
    };
    
    /**
     * Save the basiclti to the jcr
     */
    var saveRemoteContent = function(){
        if (json.ltiurl !== "") {
            json[":operation"] = "basiclti";
            json["sling:resourceType"] = "sakai/basiclti";
            json.ltiurl = $(basicltiSettingsLtiUrl).val() || "";
            json.ltikey = $(basicltiSettingsLtiKey).val() || "";
            json.ltisecret = $(basicltiSettingsLtiSecret).val() || "";
            json["debug@TypeHint"] = "Boolean";
            json.debug = $('#basiclti_settings_debug:checked').val() != null;
            json["release_names@TypeHint"] = "Boolean";
            json.release_names = $('#basiclti_settings_release_names:checked').val() != null;
            json["release_principal_name@TypeHint"] = "Boolean";
            json.release_principal_name = $('#basiclti_settings_release_principal_name:checked').val() != null;
            json["release_email@TypeHint"] = "Boolean";
            json.release_email = $('#basiclti_settings_release_email:checked').val() != null;
            json.launchDataUrl = ""; // does not need to be persisted
            json.defined = ""; // what the heck is this? Where does it come from?
            var saveUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_widgets").replace(/__TUID__/, tuid).replace(/__NAME__/, "basiclti");
            $.ajax({
                type: 'POST',
                url: saveUrl,
                data: json,
                success: savedDataToJCR
            });
        }
        else {
            alert("Please specify a URL");
        }
    };
    
    /**
     * Change the direction (up/down) of the arrow for the advanced settings
     */
    var changeAdvancedSettingsArrow = function(){
        if (isAdvancedSettingsVisible) {
            $(basicltiSettingsAdvancedDown, rootel).hide();
            $(basicltiSettingsAdvancedUp, rootel).show();
        }
        else {
            $(basicltiSettingsAdvancedUp, rootel).hide();
            $(basicltiSettingsAdvancedDown, rootel).show();
        }
    };
    
    
    //////////////
    // Bindings //
    //////////////
    
    /*
     * Add binding to the color boxes
     */
    var addColorBinding = function(){
        $(".basiclti_settings_color").click(function(){
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
        $(basicltiSettingsLtiUrl).change(function(){
            var urlValue = $(this).val();
            if (urlValue !== "") {
                // Check if someone already wrote http inside the url
                if (!isUrl(urlValue)) {
                    urlValue = 'http://' + urlValue;
                }
                json.ltiurl = urlValue;
                //renderIframeSettings(true); // LDS disabled preview
            }
        });
        
        // Change the iframe width
        $(basicltiSettingsWidth).change(function(){
            var widthValue = $(basicltiSettingsWidth).val();
            
            if (isDecimal(widthValue)) {
                json.width = widthValue;
            }
            renderIframeSettings(false);
        });
        
        // Change the iframe height
        $(basicltiSettingsHeight).change(function(){
            var heightValue = $(basicltiSettingsHeight).val();
            
            if (isDecimal(heightValue)) {
                json.frame_height = heightValue;
            }
            renderIframeSettings(false);
        });
        
        // Change the border width
        $(basicltiSettingsBorders).change(function(){
            var borderValue = $(basicltiSettingsBorders).val();
            if (isDecimal(borderValue)) {
                json.border_size = borderValue;
                renderIframeSettings(false);
            }
        });
        
        // Toggle the advanced view
        $(basicltiSettingsAdvancedToggleSettings).click(function(){
            $("#basiclti_settings_advanced", rootel).toggle();
            isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
            changeAdvancedSettingsArrow();
        });
        
        // When you click on one of the width units (px or percentage)
        $(basicltiSettingsWidthUnitClass).click(function(){
            var widthUnitValue = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
            if (widthUnitValue === "px") {
                json.width_unit = widthUnitValue;
            }
            else {
                json.width_unit = "%";
            }
            $(basicltiSettingsWidthUnitClass).removeClass(basicltiSettingsWidthUnitSelectedClass);
            $(this).addClass(basicltiSettingsWidthUnitSelectedClass);
            renderIframeSettings(false);
        });
        
        // When you push the save button..
        $(basicltiSettingsInsert).click(function(){
            saveRemoteContent();
        });
        
        // Cancel it
        $(basicltiSettingsCancel).click(function(){
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
     * @param {Boolean} exists Does there exist a previous basiclti
     */
    var displaySettings = function(parameters, exists){
        if (exists && parameters.ltiurl) {
            json = parameters;
        }
        else { // use default values
            json = {
                ltiurl: "",
                ltikey: "",
                ltisecret: "",
                release_names: true,
                release_principal_name: true,
                release_email: true,
                border_size: 0,
                border_color: "cccccc",
                frame_height: defaultHeight,
                width: defaultWidth,
                width_unit: defaultWidthUnit
            };
        }
        renderRemoteContentSettings();
        //renderIframeSettings(true); // LDS disabled preview
        renderColorContainer();
        addBinding(); // Add binding to the various elements
        changeAdvancedSettingsArrow();
        $(basicltiSettings).show(); // Show the basiclti settings
    };
    
    /*
     * Is the widget in settings mode or not
     */
    if (showSettings) {
        $(basicltiMainContainer).hide();
        $(basicltiSettings).show();
    }
    else {
        $(basicltiSettings).hide();
        $(basicltiMainContainer).show();
    }
    
    /**
     * Will fetch the URL and other parameters from the JCR and according to which
     * view we are in, fill in the settings or display an iframe.
     */
    var getRemoteContent = function(){
        var settingsUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_widgets").replace(/__TUID__/, tuid).replace(/__NAME__/, "basiclti");
        $.ajax({
            url: settingsUrl,
            cache: false,
            success: function(data){
                // Get a JSON string that contains the necessary information.
                var parameters = $.evalJSON(data);
                
                if (showSettings) {
                    displaySettings(parameters, true); // Fill in the settings page.
                }
                else {
                    displayRemoteContent(parameters); // Show the frame
                }
            },
            error: function(xhr, textStatus, thrownError){
                // When the request isn't successful, it means that  there was no existing basiclti
                // so we show the basic settings.
                displaySettings(null, false);
            }
        });
    };
    
    getRemoteContent();
};

sdata.widgets.WidgetLoader.informOnLoad("basiclti");
