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

// Namespaces
var sakai = sakai || {};

/**
 * @name sakai.assignlocation
 *
 * @description
 * Public functions for the content share widget
 */
sakai.assignlocation = {};

/**
 * @name sakai.assignlocation
 *
 * @class assignlocation
 *
 * @description
 * Assign location widget<br />
 * This widget is used to assign a location to a piece of content
 * The content can then be found under that location through the directory page
 * or by searching on the tags of the location
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.assignlocation = function(tuid, showSettings) {
    // Containers
    var $assignlocationJSTreeContainer = $("#assignlocation_jstree_container");
    var $assignlocationJSTreeSelectedContainer = $("#assignlocation_jstree_selected_container");

    // Templates
    var assignlocationJSTreeSelectedTemplate = "assignlocation_jstree_selected_template";

    // Variables
    var alreadyAssignedLocations = [];
    var newlyAssignedLocations = [];

    // Actions
    var $assignlocationSaveButton = $("#assignlocation_save_button");

    var renderSelected = function() {
        var locations = {
            "alreadyAssignedLocations" : alreadyAssignedLocations,
            "newlyAssignedLocations" : newlyAssignedLocations
        }
        $assignlocationJSTreeSelectedContainer.html($.TemplateRenderer(assignlocationJSTreeSelectedTemplate, locations));
    };

    var enableDisableButtons = function(){
        if(!newlyAssignedLocations.length && !alreadyAssignedLocations.length){
            $assignlocationSaveButton.attr("disabled", "disabled");
        } else {
            $assignlocationSaveButton.removeAttr("disabled");
        }
    };

    var addTreebinding = function(){
        $assignlocationJSTreeContainer.bind("change_state.jstree", function(ev){
            newlyAssignedLocations = [];
            $(".jstree-leaf.jstree-checked a").each(function(index, val){
                newlyAssignedLocations.push(val.href.split("#")[1]);
            });
            renderSelected();
            enableDisableButtons();
        });
    };

    var saveLocations = function(){
        
    };

    var addWidgetBinding = function(){
        $assignlocationSaveButton.bind("click", function(){
            saveLocations();
        });
    };

    var doInit = function(){
        // set up new jstree for directory 
        var pluginArray = ["themes", "json_data", "cookies", "dnd", "search", "checkbox"];
        $assignlocationJSTreeContainer.jstree({
            "core": {
                "animation": 0,
                "html_titles": true
            },
            "cookies": {
                "save_selected": false
            },
            "json_data": {
                "data": sakai.api.UI.getDirectoryStructure
            },
            "themes": {
                "dots": false,
                "icons": false
            },
            "search" : {
                "case_insensitive" : true
            },
            "plugins": pluginArray
        });
        addTreebinding();
        addWidgetBinding();
    };

    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("assignlocation");