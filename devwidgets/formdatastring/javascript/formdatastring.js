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
 * Initialize the formdatastring widget
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.formdatastring = function(tuid,showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var defaultSettings = {};
    
    var namespace   = "formdatastring";
    var namespaceId = "#formdatastring";
    
    var settingsSubmit = namespaceId + "_settings_submit";
    var settingsCancel = namespaceId + "_settings_cancel";
    var editSubmit = namespaceId + "_edit_submit";
    var editCancel = namespaceId + "_edit_cancel";
    var editAdd    = namespaceId + "_add";
    
    var requiredFlag = namespace   + "_required";
    
    var widgetId = namespaceId     + "_widgetid";
    var widgetIdInput = namespaceId + "_widgetid_input";
    var inputLabel = namespaceId   + "_label";
    var defaultValue = namespaceId + "_default";
    var maxLength = namespaceId    + "_max";
    var inputSize = namespaceId    + "_size";
    var requiredStar = namespaceId + "_required_star";
    var editIcon    = namespaceId + "_edit_icon";
    var errorMsg = namespaceId + "_error";
    
    var rootel = $("#" + tuid);
    var settingsContainer = namespaceId + "_settings";
    var viewContainer = namespaceId + "_main";
    var editContainer = namespaceId + "_edit";
    var dataContainer  = namespaceId + "_data"; 
    
    var settingsNewTab = namespaceId + "_settings_new_tab";
    var settingsNewContainer= namespaceId + "_settings_new_container";
    var settingsExistingTab = namespaceId + "_settings_existing_tab";
    var settingsExistingContainer= namespaceId + "_settings_existing_container";
    var settingsTabClass = namespace + "_settings_tab";
    var settingsTabSelectedClass = settingsTabClass + "_selected";   
    
    var widgetDataOutput = namespaceId + "_data_output"; 
    var widgetDataInput  = namespaceId + "_data_input"; 
    var widgetDataHidden = namespaceId + "_data_hidden"; 

    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Show the widget data 
     * @param {Object} settings
     */
    var showWidgetData = function(settings, replay){
       var dataText  = '';
       
       if ( settings === null )
          $(errorMsg, rootel).show();
          
       if ( !replay && settings.required !== undefined && settings.required === "true" )
          $(requiredStar, rootel).show();
       
       if ( settings.inputLabel !== undefined ) 
          dataText += '<label for="formdatastring_data_input">'+settings.inputLabel.bold()+'</label> '; 
       
       if ( settings.dataValue !== undefined ) 
          dataText += settings.dataValue.italics();
       
       if ( !replay )
          $(editIcon, rootel).show();
       
       $(widgetDataOutput, rootel).html(dataText);
       
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
       var labelHtml = "";
       var inputHtml = '<input type="text" id="formdatastring_data_input" ';
       
       if ( settings.required !== undefined && settings.required === "true" )
          $(requiredStar, rootel).show();
          
       if ( settings.inputLabel !== undefined ) 
          labelHtml += '<label for="formdatastring_data_input">'+settings.inputLabel.bold()+'</label> '; 

       if ( settings.maxLength !== undefined && settings.maxLength > 0)
          inputHtml += 'maxlength="'+settings.maxLength+'" ';
       
       if ( settings.inputSize !== undefined  && settings.inputSize > 0)
          inputHtml += 'style="width: '+settings.inputSize+'em;" ';
        
       if ( settings.dataValue !== undefined )
          inputHtml += 'value="'+settings.dataValue+'" ';
       
       inputHtml += '>';
       
       $(dataContainer, rootel).html(labelHtml+inputHtml);
                 
       $(viewContainer, rootel).hide();
       $(settingsContainer, rootel).hide();
       $(editContainer, rootel).show();
    };

    /**
     * Shows a settings tab.
     * @param {String} tab Available options: new, existing
     */
    var showTab = function(tab) {
        if (tab === "new") {
            $(settingsExistingContainer, rootel).hide();
            $(settingsNewTab, rootel).removeClass(settingsTabClass);
            $(settingsNewTab, rootel).addClass(settingsTabSelectedClass);
            $(settingsExistingTab, rootel).removeClass(settingsTabSelectedClass);
            $(settingsExistingTab, rootel).addClass(settingsTabClass);
            $(settingsNewContainer, rootel).show();
        }
        else if (tab === "existing") {
            $(settingsNewContainer, rootel).hide();
            $(settingsNewTab, rootel).removeClass(settingsTabSelectedClass);
            $(settingsNewTab, rootel).addClass(settingsTabClass);
            $(settingsExistingTab, rootel).removeClass(settingsTabClass);
            $(settingsExistingTab, rootel).addClass(settingsTabSelectedClass);
            $(settingsExistingContainer, rootel).show();
        }
    };

    /**
     * Show Settigns selection page
     * @param {Object} settings
     */
    var showSettingsData = function(settings){
       // show existing widget tab
       if ( settings.widgetId !== undefined ) {
          showTab("existing");
          $(widgetIdInput, rootel).attr("value", settings.widgetId);
       }
       
       // show new widget tab (default)
       else {
          $(widgetId, rootel).text(tuid);
          
          $("input[name=" + requiredFlag + "][value=" + settings.required + "]", rootel).attr("checked", true);
          
          if ( settings.maxLength !== undefined && settings.maxLength > 0)
             $(maxLength, rootel).attr("value", settings.maxLength);
          
          if ( settings.inputSize !== undefined  && settings.inputSize > 0)
             $(inputSize, rootel).attr("value", settings.inputSize);
          
          if ( settings.inputLabel !== undefined )
             $(inputLabel, rootel).attr("value", settings.inputLabel);
          
          if ( settings.defaultValue !== undefined )
             $(defaultValue, rootel).attr("value", settings.defaultValue);
          
          if ( settings.dataValue !== undefined && settings.dataValue.length > 0 )
             $(widgetDataHidden, rootel).attr("value", settings.dataValue);
          else if ( settings.defaultValue !== undefined )
             $(widgetDataHidden, rootel).attr("value", settings.defaultValue);
       }
       
       // if not using default settings, hide other settings tab
       if ( settings !== defaultSettings )
          $('a.'+settingsTabClass, rootel).hide();
             
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
        
        // check if on new settings tab
        if ( $(settingsNewTab, rootel).attr('class') === settingsTabSelectedClass ) {
           settings.required = $("input[name=" + requiredFlag + " ]:checked", rootel).val();
        
           settings.maxLength = parseInt($(maxLength, rootel).val());
           if ($(maxLength, rootel).val().search(/^\d*$/) || settings.maxLength < 1) 
              settings.maxLength = 0; // indicates unlimited; no error reported for now
           
           settings.inputSize = parseInt($(inputSize, rootel).val());
           if ($(inputSize, rootel).val().search(/^\d*$/) || settings.inputSize < 1) 
              settings.inputSize = 0; // indicates unlimited; no error reported for now
           
           settings.inputLabel = $(inputLabel, rootel).val();
           settings.defaultValue = $(defaultValue, rootel).val();
           
           if ( $(widgetDataHidden, rootel).val() !== undefined && $(widgetDataHidden, rootel).val().length > 0 )
              settings.dataValue = $(widgetDataHidden, rootel).val();
           else
              settings.dataValue = $(defaultValue, rootel).val();
        }
        
        // otherwise this is the existing widget tab
        else {
           settings.widgetId = $(widgetIdInput, rootel).val();
        }
       
        settings['sling:resourceType'] = 'sakai/settings';
        settings['sakai:marker'] = tuid;
        settings['sakai:type'] = "form-data-string";

        return settings;
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Bind the new settings tab
     */
    $(settingsNewTab, rootel).bind("click", function(e, ui) {
        showTab("new");
    });

    /*
     * Bind the existing settings tab
     */
    $(settingsExistingTab, rootel).bind("click", function(e, ui) {
        showTab("existing");
    });

    /** Bind the settings submit button*/
    $(settingsSubmit, rootel).bind("click", function(e, ui){
        var settings = getWidgetSettings();
        if ( settings ) {
           sakai.api.Widgets.saveWidgetData(tuid, settings, function(success){
                 if ( !success) 
                    alert("Failed to save.");
                 else 
                    sdata.container.informFinish(tuid, "formdatastring");
              });
        }
       });

    /** Bind the settings cancel button */
    $(settingsCancel, rootel).bind("click", function(e, ui){
        sdata.container.informCancel(tuid);
    });

    /** Bind edit widget data (icon) link */
    $(editAdd, rootel).bind("click", function(e, ui){
          loadSettings(showEditData, false);
       });

    /** Bind the edit cancel button */
    $(editCancel, rootel).bind("click", function(e, ui){
       $(viewContainer, rootel).show();
       $(editContainer, rootel).hide();
    });

    /** Bind the edit submit button */
    $(editSubmit, rootel).bind("click", function(e, ui){
       // get existing settings, update data value and save
       sakai.api.Widgets.loadWidgetData(tuid, function(success, settings){
             settings.dataValue = $(widgetDataInput, rootel).val();
             sakai.api.Widgets.saveWidgetData(tuid, settings, function(success){
                   if ( !success) 
                      alert("Failed to save.");
                   else
                      showWidgetData(settings, false);
                });
          });
    });

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Retrieves the widget settings from JCR for widget replay
     * @param {Object} settings
     */
    var replaySettings = function(settings){

       // Calling loadWidgetData() fails silently if widget not already loaded
       //   sakai.api.Widgets.loadWidgetData(settings.widgetId, function(success, replaySettings){};
       // so instead construct reference widget URL and directly send a GET request 
       
       var url = sdata.widgets.WidgetLoader.widgets[tuid].placement.replace(tuid, settings.widgetId)
       sakai.api.Server.loadJSON(url,  function(success, replaySettings){
            if (success) {
               showWidgetData(replaySettings, true);
            } 
            else {
               showWidgetData(null, true);
            }
        });

    };

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
            else if ( settings.widgetId !== undefined ) {
               replaySettings( settings );
            } 
            else {
               callback(settings, false);
            }
        });
    };

    /** Main widget initialization
     **/
    defaultSettings.required = "false";
    loadSettings(showWidgetData, showSettings);
};

sdata.widgets.WidgetLoader.informOnLoad("formdatastring");
