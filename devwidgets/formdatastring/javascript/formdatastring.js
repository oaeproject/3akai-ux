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
    
    var widgetId = namespaceId     + "_widgetId";
    var inputLabel = namespaceId   + "_label";
    var defaultValue = namespaceId + "_default";
    var maxLength = namespaceId    + "_max";
    var inputSize = namespaceId    + "_size";
    
    // Dom identifiers
    var rootel = $("#" + tuid);
    var settingsContainer = namespaceId + "_settings";
    var viewContainer = namespaceId + "_main";
    var editContainer = namespaceId + "_edit";
    var dataContainer  = namespaceId + "_data"; 
    
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
    var showWidgetData = function(settings){
       var labelText = '';
       var dataText  = '';
       
       if ( settings.inputLabel !== undefined ) 
          labelText = '<label for="formdatastring_data_input">'+settings.inputLabel.bold()+'</label> '; 
       
       if ( settings.dataValue !== undefined ) 
          dataText = settings.dataValue.italics();
       
       $(widgetDataOutput, rootel).html(labelText+dataText);
       
       $(viewContainer, rootel).show();
       $(settingsContainer, rootel).hide();
       $(editContainer, rootel).hide();
    };


    /**
     * Show the widget data input field
     * @param {Object} settings
     */
    var showEditData = function(settings){
       var labelHtml = '';
       var inputHtml = '<input type="text" id="formdatastring_data_input" ';
       
       if ( settings.inputLabel !== undefined ) 
          labelHtml = '<label for="formdatastring_data_input">'+settings.inputLabel.bold()+'</label> '; 

       if ( settings.maxLength !== undefined && settings.maxLength > 0)
          inputHtml += 'maxlength="'+settings.maxLength+'" ';
       
       // tbd: if size > something, change to textarea? or add textarea settings flag?   
       // tbd: why is size ignored? need to over-ride style
       if ( settings.inputSize !== undefined  && settings.inputSize > 0)
          inputHtml += 'size="'+settings.inputSize+'" ';
          
       if ( settings.dataValue !== undefined )
          inputHtml += 'value="'+settings.dataValue+'" ';
       
       inputHtml += '>';
       
       $(dataContainer, rootel).html(labelHtml+inputHtml);
                 
       $(viewContainer, rootel).hide();
       $(settingsContainer, rootel).hide();
       $(editContainer, rootel).show();
    };


    /**
     * Show Settigns selection page
     * @param {Object} settings
     */
    var showSettingsData = function(settings){
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
       
       if ( settings.dataValue !== undefined && settings.dataValue.localeCompare("")!=0 )
          $(widgetDataHidden, rootel).attr("value", settings.dataValue);
       else if ( settings.defaultValue !== undefined )
          $(widgetDataHidden, rootel).attr("value", settings.defaultValue);
       
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
        
        settings.required = $("input[name=" + requiredFlag + " ]:checked", rootel).val();
        
        settings.maxLength = parseInt($(maxLength, rootel).val());
        if ($(maxLength, rootel).val().search(/^\d*$/) || settings.maxLength < 1) 
           settings.maxLength = 0; // indicates unlimited; no error reported for now
           
        settings.inputSize = parseInt($(inputSize, rootel).val());
        if ($(inputSize, rootel).val().search(/^\d*$/) || settings.inputSize < 1) 
           settings.inputSize = 0; // indicates unlimited; no error reported for now

        settings.inputLabel = $(inputLabel, rootel).val();
        settings.defaultValue = $(defaultValue, rootel).val();
        
        if ( $(widgetDataHidden, rootel).val() !== undefined && $(widgetDataHidden, rootel).val().localeCompare("")!=0 )
           settings.dataValue = $(widgetDataHidden, rootel).val();
        else
           settings.dataValue = $(defaultValue, rootel).val();
       
        settings['sling:resourceType'] = 'sakai/settings';
        settings['sakai:marker'] = tuid;
        settings['sakai:type'] = "form-data-string";

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
                    sdata.container.informFinish(tuid, "formdatastring");
              });
        }
       });

    /** Bind the settings cancel button */
    $(settingsCancel, rootel).bind("click", function(e, ui){
        sdata.container.informCancel(tuid);
    });

    /** Bind add/edit widget data button*/
    $(editAdd, rootel).bind("click", function(e, ui){
          loadSettings(showEditData);
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
                      showWidgetData(settings);
                });
          });
    });

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Retrieves the prefered color from JCR
     * @param {Object} callback
     */
    var loadSettings = function(callback){

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                callback(data);
            } else {
                callback(defaultSettings);
            }
        });

    };

    var doInit = function(){
       defaultSettings.required = "false";
       if (showSettings) {
          loadSettings(showSettingsData);
       } else {
          loadSettings(showWidgetData);
       }
    };
    
    doInit();

};

sdata.widgets.WidgetLoader.informOnLoad("formdatastring");
