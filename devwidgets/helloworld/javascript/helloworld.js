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

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.helloworld
 *
 * @class helloworld
 *
 * @description
 * Initialize the helloworld widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.helloworld = function(tuid,showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var defaultColor = "#000000";

    // Dom identifiers
    var rootel = $("#" + tuid);
    var settingsContainer = "#helloworld_settings";
    var viewContainer = "#helloworld_main";
    var colorPicker = "#helloworld_color";
    var usernameContainer = "#helloworld_username";
    var seaveHelloworld = "#helloworld_save";


    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Shows the Hello world string in the right color
     * @param {Object} color
     */
    var showHelloWorld = function(color){
        $(viewContainer + " p", rootel).css("color",color.color);
        $(viewContainer, rootel).show();
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Selects the current color form the combobox
     * @param {Object} color
     */
    var selectCurrentColor = function(color){
        $(colorPicker,rootel).val(color.color);
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Binds the helloworld save button*/
    $("#helloworld_save").bind("click", function(ev){
        var select = $(colorPicker, rootel).get(0);
        var selected = select.options[select.selectedIndex].value;
        sakai.api.Widgets.saveWidgetData(tuid, {color:selected}, function(success, data){
            sakai.api.Widgets.Container.informFinish(tuid, "helloworld");
        });
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Retrieves the prefered color from JCR
     * @param {Object} callback
     */
    var getPreferedColor = function(callback){
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                callback(data);
            } else {
                callback({
                    "color": defaultColor
                });
            }

        });

    };

    var doInit = function(){
        if (showSettings) {
            getPreferedColor(selectCurrentColor);
            $(settingsContainer, rootel).show();
        } else {
            var me = sakai.data.me;
            $(usernameContainer, rootel).text(sakai.api.Security.saneHTML(sakai.api.User.getProfileBasicElementValue(me.profile, "firstName")));
            getPreferedColor(showHelloWorld);
        }
    };
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("helloworld");