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

sakai.lance = function(tuid, placement, showSettings){


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
    var lance = "#lance";
    var lanceSettings = lance + "_settings";
    var lanceSettingsAdvanced = lanceSettings + "_advanced";
    var lanceSettingsAdvancedDown = lanceSettingsAdvanced + "_down";
    var lanceSettingsAdvancedToggleSettings = lanceSettingsAdvanced + "_toggle_settings";
    var lanceSettingsAdvancedUp = lanceSettingsAdvanced + "_up";
    var lanceSettingsBorders = lanceSettings + "_borders";
    var lanceSettingsCancel = lanceSettings + "_cancel";
    var lanceSettingsColorContainer = lanceSettings + "_color_container";
    var lanceSettingsHeight = lanceSettings + "_frame_height";
    var lanceSettingsInsert = lanceSettings + "_insert";
    var lanceSettingsPreview = lanceSettings + "_preview";
    var lanceSettingsPreviewFrame = lanceSettingsPreview + "_frame";
    var lanceSettingsLtiUrl = lanceSettings + "_ltiurl";
    var lanceSettingsLtiKey = lanceSettings + "_ltikey";
    var lanceSettingsLtiSecret = lanceSettings + "_ltisecret";
    var lanceSettingsWidth = lanceSettings + "_width";
    var lanceSettingsReleaseName = lanceSettings + "_release_names";

    // Containers
    var lanceMainContainer = lance + "_main_container";

    // Classes
    var lanceSettingsWidthUnitClass = ".lance_settings_width_unit";
    var lanceSettingsWidthUnitSelectedClass = "lance_settings_width_unit_selected";

    // Templates
    var lanceSettingsColorContainerTemplate = "lance_settings_color_container_template";
    var lanceSettingsTemplate = "lance_settings_template";
    var lanceSettingsPreviewTemplate = "lance_settings_preview_template";


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
            json.launchDataUrl = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "lance") + '.launch.html';
            $(lanceSettingsPreview).html($.Template.render(lanceSettingsPreviewTemplate, json));
        }else{
            $(lanceSettingsPreviewFrame).attr("style", "border: " + json.border_size + "px #" + json.border_color + " solid");
        }
    };

    /**
     * Render the iframe for the widget
     */
    var renderIframe = function(){
        if(json){
            var launchDataUrl = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "lance") + '.launch.html';
            json.launchDataUrl = launchDataUrl;
			$(lanceMainContainer, rootel).html($.Template.render(lanceSettingsPreviewTemplate, json));
        }
    };

    /**
     * Render the html of the lancesettings
     */
    var renderRemoteContentSettings = function() {
        if(json){
            $(lanceSettings).html($.Template.render(lanceSettingsTemplate, json));
        }
    };

    /**
     * Render the color container
     */
    var renderColorContainer = function(){
        if(json){
            $(lanceSettingsColorContainer).html($.Template.render(lanceSettingsColorContainerTemplate, json));
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
     * Save the lance to the jcr
     */
    var saveRemoteContent = function() {
        if (json.ltiurl !== "") {
            json.ltiurl = $(lanceSettingsLtiUrl).val() || "";
            json.ltikey = $(lanceSettingsLtiKey).val() || "";
            json.ltisecret = $(lanceSettingsLtiSecret).val() || "";
            json["debug@TypeHint"] = "Boolean";
            json.debug = $('#lance_settings_debug:checked').val() != null;
            json["release_names@TypeHint"] = "Boolean";
            json.release_names = $('#lance_settings_release_names:checked').val() != null;
            json["release_principal_name@TypeHint"] = "Boolean";
            json.release_principal_name = $('#lance_settings_release_principal_name:checked').val() != null;
            json["release_email@TypeHint"] = "Boolean";
            json.release_email = $('#lance_settings_release_email:checked').val() != null;
            json.launchDataUrl = ""; // does not need to be persisted
            json["_MODIFIERS"] = ""; // what the heck is this? TrimPath? Do not persist.
            json.defined = ""; // what the heck is this? Where does it come from?
            var saveUrl = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "lance");
            $.ajax({
                type: 'POST',
                url: saveUrl,
                data: json,
                dataType: 'html',
                success: savedDataToJCR
            });
        } else {
            alert("Please specify a URL");
        }
    };

    /**
     * Change the direction (up/down) of the arrow for the advanced settings
     */
    var changeAdvancedSettingsArrow = function(){
        if (isAdvancedSettingsVisible) {
            $(lanceSettingsAdvancedDown, rootel).hide();
            $(lanceSettingsAdvancedUp, rootel).show();
        }
        else {
            $(lanceSettingsAdvancedUp, rootel).hide();
            $(lanceSettingsAdvancedDown, rootel).show();
        }
    };


    //////////////
    // Bindings //
    //////////////

    /*
     * Add binding to the color boxes
     */
    var addColorBinding = function(){
        $(".lance_settings_color").click(function() {
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
        $(lanceSettingsLtiUrl).change(function() {
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
        $(lanceSettingsWidth).change(function() {
            var widthValue = $(lanceSettingsWidth).val();

            if(isDecimal(widthValue)){
                json.width = widthValue;
            }
            renderIframeSettings(false);
        });

        // Change the iframe height
        $(lanceSettingsHeight).change(function() {
            var heightValue = $(lanceSettingsHeight).val();

            if(isDecimal(heightValue)){
                json.frame_height = heightValue;
            }
            renderIframeSettings(false);
        });

        // Change the border width
        $(lanceSettingsBorders).change(function() {
            var borderValue = $(lanceSettingsBorders).val();
            if(isDecimal(borderValue)){
                json.border_size = borderValue;
                renderIframeSettings(false);
            }
        });

        // Toggle the advanced view
        $(lanceSettingsAdvancedToggleSettings).click(function(){
            $("#lance_settings_advanced", rootel).toggle();
            isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
            changeAdvancedSettingsArrow();
        });

        // When you click on one of the width units (px or percentage)
        $(lanceSettingsWidthUnitClass).click(function()  {
             var widthUnitValue = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
             if(widthUnitValue === "px"){
                 json.width_unit = widthUnitValue;
             }else{
                 json.width_unit = "%";
             }
             $(lanceSettingsWidthUnitClass).removeClass(lanceSettingsWidthUnitSelectedClass);
             $(this).addClass(lanceSettingsWidthUnitSelectedClass);
             renderIframeSettings(false);
        });

        // When you push the save button..
        $(lanceSettingsInsert).click(function()  {
            saveRemoteContent();
        });

        // Cancel it
        $(lanceSettingsCancel).click(function()  {
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
     * @param {Boolean} exists Does there exist a previous lance
     */
    var displaySettings = function(parameters, exists) {
        if(exists && parameters.ltiurl){
            json = parameters;
        }else{ // use default values
            json = {
				"sling:resourceType" : "sakai/basiclti",
                ltiurl: "",
                ltikey: "",
                ltisecret: "",
                release_names : true,
                release_principal_name : true,
                release_email : true,
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
        $(lanceSettings).show(); // Show the lance settings
    };

    /*
     * Is the widget in settings mode or not
     */
    if (showSettings) {
        $(lanceMainContainer).hide();
        $(lanceSettings).show();
    }
    else {
        $(lanceSettings).hide();
        $(lanceMainContainer).show();
    }

    /**
     * Will fetch the URL and other parameters from the JCR and according to which
     * view we are in, fill in the settings or display an iframe.
     */
    var getRemoteContent = function() {
		var settingsUrl = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "lance");
        $.ajax({
            url : settingsUrl,
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
                // When the request isn't successful, it means that  there was no existing lance
                // so we show the basic settings.
                displaySettings(null, false);
            }
        });
    };

    getRemoteContent();
};

sdata.widgets.WidgetLoader.informOnLoad("lance");