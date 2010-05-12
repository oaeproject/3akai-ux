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
/*global $, sdata */

var sakai = sakai || {};

/**
 *
 * @param {Object} tuid , unique id for the widget
 * @param {Object} showSettings boolean to check if the widget is in settingsmode or not
 */
sakai.bookmarkandshare = function(tuid, showSettings){

    /**
     * Show the settings screen to initiate the widget
     */
    var showSettings = function(){
    
    };

    /**
     * Show the widget itself 
     */
    var showWidget = function(){
    
    }

    /**
     * Function to init the bookmark and share widget
     * Checks if the widget is initted to show the settings page or not
     */
    var init = function(){
        // Check if the widget has just been placed on the page
        if (showSettings) {
            showSettings();
        } else {
            showWidget();
        }
    };

    init();
};

sdata.widgets.WidgetLoader.informOnLoad("bookmarkandshare");
