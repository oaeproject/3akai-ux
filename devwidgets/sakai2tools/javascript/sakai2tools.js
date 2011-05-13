
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

require(["jquery", "sakai/sakai.api.core", "sakai/sakai.api.widgets"], function($, sakai, sakaiWidgetsAPI) {

    /**
     * @name sakai_global.basiclti
     *
     * @class basiclti
     *
     * @description
     * Basiclti widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.sakai2tools = function(tuid, showSettings){


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
        var basicltiSettingsPreviewId = tuid + "_frame";
        var basicltiSettingsPreviewFrame = "#" + basicltiSettingsPreviewId;
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

        // see: http://www.ietf.org/rfc/rfc2396.txt Appendix B
        var urlRegExp = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");

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
            var matches = urlRegExp.exec(url);
            // e.g. if("http:" && "localhost")
            if(matches[1] && matches[4]) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Check to see if both URLs are in the same origin. See: http://en.wikipedia.org/wiki/Same_origin_policy.
         * @param {String} url1
         * @param {String} url2
         * @return {Boolean}
         *     true: in the same origin policy
         *     false: NOT in the same origin policy
         */
        var isSameOriginPolicy = function(url1, url2){
            if(url1 == url2) {
                return true;
            }
            // i.e. protocol, domain (and optional port numbers) must match
            if((urlRegExp.exec(url1)[2] == urlRegExp.exec(url2)[2]) &&
               (urlRegExp.exec(url1)[4] == urlRegExp.exec(url2)[4])){
                return true;
            } else {
                return false;
            }
        };

        /**
         * Called when the data has been saved to the JCR.
         */
        var savedDataToJCR = function(success, data){
            displayRemoteContent(data);
            sakai.api.Widgets.Container.informFinish(tuid, "sakai2tools");
        };

        var isSakai2Tool = function() {
            return true;
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
                $(basicltiSettingsPreview).html(sakai.api.Util.TemplateRenderer($basicltiSettingsPreviewTemplate, json));
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
                json.tuidFrame = basicltiSettingsPreviewId;
                $(basicltiMainContainer, rootel).html(sakai.api.Util.TemplateRenderer($basicltiSettingsPreviewTemplate, json));
                json.launchDataUrl = sakaiWidgetsAPI.widgetLoader.widgets[tuid].placement + ".launch.html";
                $("#" + json.tuidFrame).attr("src", json.launchDataUrl); 

                // resize the iframe to match inner body height if in the same origin (i.e. same protocol/domain/port)
                if(isSameOriginPolicy(window.location.href, json.ltiurl)) {
                    $(basicltiSettingsPreviewFrame).load(function() {
                        $(this).height($(this).contents().find("body").height() + 15); // add 10px for IE and 5px more for Gradebook weirdness
                    });
                }

                // SAKIII-314 We need to show the container, otherwise the second item won't be shown.
                $(basicltiMainContainer, rootel).show();
            }
        };

        /**
         * Render the html of the basicltisettings
         */
        var renderRemoteContentSettings = function(){
            if (json) {
                $(basicltiSettings).html(sakai.api.Util.TemplateRenderer($basicltiSettingsTemplate, json));
            }
        };

        /**
         * Render the color container
         */
        var renderColorContainer = function(){
            if (json) {
                $(basicltiSettingsColorContainer).html(sakai.api.Util.TemplateRenderer($basicltiSettingsColorContainerTemplate, json));
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
            if (parameters.border_size === null) {
                parameters.border_size = 0;
            }
            if (parameters.border_color === null) {
                parameters.border_color = "cccccc";
            }
            if (parameters.width === null) {
                parameters.width = defaultWidth;
            }
            if (parameters.width_unit === null) {
                parameters.width_unit = defaultWidthUnit;
            }
            if (parameters.frame_height === null) {
                parameters.frame_height = defaultHeight;
            }
            json = parameters;
            renderIframe();
        };

        /**
         * Save the basiclti to the jcr
         */
        var saveRemoteContent = function(){
            var  saveContentAjax = function(json_data) {
                var url = sakaiWidgetsAPI.widgetLoader.widgets[tuid].placement;
                $.ajax({
                    type: "POST",
                    url: url,
                    data: json,
                    success: function(data) { 
                        savedDataToJCR(true, data); 
                    }
                }); 
                // Because we need to use a particular servlet (LiteBasicLTI), and it
                // requires some different options, we make our own ajax call above
                // instead of using saveWidgetData for now.
                // 
                //sakai.api.Widgets.saveWidgetData(tuid, json, savedDataToJCR);                
            };

            if (isSakai2Tool()) {
                json["lti_virtual_tool_id"] = $('#basiclti_settings_lti_virtual_tool_id').val();    

                json[":operation"] = "basiclti";
                json["sling:resourceType"] = "sakai/basiclti";
                json.ltikey = $(basicltiSettingsLtiKey).val() || "";
                json.ltisecret = $(basicltiSettingsLtiSecret).val() || "";
                json["debug@TypeHint"] = "Boolean";
                json.debug = $('#basiclti_settings_debug:checked').val() !== null;
                json["release_names@TypeHint"] = "Boolean";
                json.release_names = $('#basiclti_settings_release_names:checked').val() !== null;
                json["release_principal_name@TypeHint"] = "Boolean";
                json.release_principal_name = $('#basiclti_settings_release_principal_name:checked').val() !== null;
                json["release_email@TypeHint"] = "Boolean";
                json.release_email = $('#basiclti_settings_release_email:checked').val() !== null;
                json.launchDataUrl = ""; // does not need to be persisted
                json.tuidFrame = ""; // does not need to be persisted
                json.defined = ""; // what the heck is this? Where does it come from?
                json._MODIFIERS = null; // trimpath garbage - probably need a more selective way of saving data

                saveContentAjax(json);
            }
            else if (json.ltiurl !== "") {
                json.ltiurl = $(basicltiSettingsLtiUrl).val() || "";    
                json[":operation"] = "basiclti";
                json["sling:resourceType"] = "sakai/basiclti";
                json.ltikey = $(basicltiSettingsLtiKey).val() || "";
                json.ltisecret = $(basicltiSettingsLtiSecret).val() || "";
                json["debug@TypeHint"] = "Boolean";
                json.debug = $('#basiclti_settings_debug:checked').val() !== null;
                json["release_names@TypeHint"] = "Boolean";
                json.release_names = $('#basiclti_settings_release_names:checked').val() !== null;
                json["release_principal_name@TypeHint"] = "Boolean";
                json.release_principal_name = $('#basiclti_settings_release_principal_name:checked').val() !== null;
                json["release_email@TypeHint"] = "Boolean";
                json.release_email = $('#basiclti_settings_release_email:checked').val() !== null;
                json.launchDataUrl = ""; // does not need to be persisted
                json.tuidFrame = ""; // does not need to be persisted
                json.defined = ""; // what the heck is this? Where does it come from?
                json._MODIFIERS = null; // trimpath garbage - probably need a more selective way of saving data

                saveContentAjax(json);
            }
            else {
                sakai.api.Util.notification.show("", sakai.api.i18n.General.getValueForKey("PLEASE_SPECIFY_A_URL"),
                                                 sakai.api.Util.notification.type.ERROR);
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
                sakai.api.Widgets.Container.informCancel(tuid, "basiclti");
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
            json.isSakai2Tool = isSakai2Tool();
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
        var getRemoteContent = function() {
            // We make our own call below at the moment. Unlike most of the widgets
            // we need to interact directly with the LiteBasicLTI servlet. It's 
            // also not a recursive servlet so we can't use the default .infinity.json
            // that is used under the covers for most of the calls.
            var url = sakaiWidgetsAPI.widgetLoader.widgets[tuid].placement;
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                success: function(data) {
                    if (showSettings) {
                        displaySettings(data,true);
                    }
                    else {
                        displayRemoteContent(data);
                    } 
                },
                error: function(xhr, status, e) {
                    displaySettings(null, false);
                }
            });
        };

        getRemoteContent();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("sakai2tools");
});
