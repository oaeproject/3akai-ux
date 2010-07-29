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

/*global $, Config, sdata */

var sakai = sakai || {};

/**
 * Initialize the formsavecancel widget
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.formsavecancel = function(tuid,showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var defaultSettings = {};
    
    var namespace   = "formsavecancel";
    var namespaceId = "#formsavecancel";
    
    var widgetSelector = ".inline_class_widget_nofloat";
    
    var settingsSubmit = namespaceId + "_settings_submit";
    var settingsCancel = namespaceId + "_settings_cancel";
    var editSubmit     = namespaceId + "_edit_submit";
    var editCancel     = namespaceId + "_edit_cancel";
    var editStart      = namespaceId + "_edit_start";
    
    var rootel = $("#" + tuid);
    var settingsContainer = namespaceId + "_settings";
    var viewContainer     = namespaceId + "_main";
    var editContainer     = namespaceId + "_edit";
    var dataContainer     = namespaceId + "_data"; 
    var widgetDataOutput  = namespaceId + "_data_output"; 
    var inputLabel        = namespaceId   + "_label";
    
    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Show the widget data 
     * @param {Object} settings
     */
    var showWidgetData = function(settings, replay){
       $(widgetDataOutput, rootel).html(settings.inputLabel);
       $(viewContainer, rootel).show();
       $(settingsContainer, rootel).hide();
       $(editContainer, rootel).hide();
    };


    /**
     * Show the widget data input field
     * @param {Object} settings
     * @param (Boolean) replay (not used)
     */
    var showEditData = function(settings, replay){
       // Show editContainer
       $(viewContainer, rootel).hide();
       $(settingsContainer, rootel).hide();
       $(editContainer, rootel).show();

        // Get list of widgetIds on this page
        var el = $(document.body);
        var divarray = $(widgetSelector, el);
       
       // Run over all the elements and launch edit event
       for (var i = 0, j = divarray.length; i < j; i++){
          var widgetId = "#"+divarray[i].id;
          var widgetEdit = "#formdatastring_edit_start";
          $(widgetEdit, widgetId).trigger("click");
          // tbd add support for other types of form widgets
       }
       
    };

    /**
     * Show Settigns selection page
     * @param {Object} settings
     */
    var showSettingsData = function(settings){
       if ( settings.inputLabel !== undefined )
          $(inputLabel, rootel).attr("value", settings.inputLabel);
          
       $(viewContainer, rootel).hide();
       $(settingsContainer, rootel).show();
       $(editContainer, rootel).hide();
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * fills up the settings JSON-object
     * @return {Object} the settings JSON-object, returns {Boolean} false if input is invalid
     */
    var getWidgetSettings = function(){
        var settings = {};
        
        settings['sling:resourceType'] = 'sakai/settings';
        settings['sakai:marker'] = tuid;
        settings['sakai:type'] = "form-data-save";
        settings.inputLabel = $(inputLabel, rootel).val();

        return settings;
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Bind the settings submit button*/
    $(settingsSubmit, rootel).bind("click", function(e, ui){
        var settings = getWidgetSettings();
        if ( settings ) {
           sakai.api.Widgets.saveWidgetData(tuid, settings, function(success){
                 if ( !success) 
                    alert("Failed to save.");
                 else 
                    sakai.api.Widgets.Container.informFinish(tuid, "formsavecancel");
              });
        }
       });

    /** Bind the settings cancel button */
    $(settingsCancel, rootel).bind("click", function(e, ui){
        sakai.api.Widgets.Container.informCancel(tuid);
    });

    /** Bind edit widget data (icon) link */
    $(editStart, rootel).bind("click", function(e, ui){
          loadSettings(showEditData, false);
       });

    /** Bind the edit cancel button */
    $(editCancel, rootel).bind("click", function(e, ui){
       $(viewContainer, rootel).show();
       $(editContainer, rootel).hide();
       
        // Get list of widgetIds on this page
        var el = $(document.body);
        var divarray = $(widgetSelector, el);
       
       // Run over all the elements and launch edit cancel event
       for (var i = 0, j = divarray.length; i < j; i++){
          var widgetId = "#"+divarray[i].id;
          var widgetCancel = "#formdatastring_edit_cancel";
          $(widgetCancel, widgetId).trigger("click");
          // tbd add support for other types of form widgets
       }
       
    });

    /** Bind the edit submit button */
    $(editSubmit, rootel).bind("click", function(e, ui){
       $(viewContainer, rootel).show();
       $(editContainer, rootel).hide();
       
        // Get list of widgetIds on this page
        var el = $(document.body);
        var divarray = $(widgetSelector, el);
       
       // Run over all the elements and launch edit submit event
       for (var i = 0, j = divarray.length; i < j; i++){
          var widgetId = "#"+divarray[i].id;
          var widgetSubmit = "#formdatastring_edit_submit";
          $(widgetSubmit, widgetId).trigger("click");
          // tbd add support for other types of form widgets
       }       
    });

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Retrieves the widget settings from JCR
     * @param {Boolean} showSettings
     */
    var loadSettings = function(callback, showSettings){

        sakai.api.Widgets.loadWidgetData(tuid, function(success, settings){
            if ( showSettings && !success ) {
               showSettingsData(defaultSettings);
            }
            else if ( showSettings && success ) {
               showSettingsData(settings);
            }
            else {
               callback(settings, false);
            }
        });
    };

    /** Main widget initialization
     **/
    loadSettings(showWidgetData, showSettings);
};

sakai.api.Widgets.widgetLoader.informOnLoad("formsavecancel");
