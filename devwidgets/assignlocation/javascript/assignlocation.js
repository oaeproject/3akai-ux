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
    var $assignlocationContainer = $("#assignlocation_container");
    var $assignlocationJSTreeContainer = $("#assignlocation_jstree_container");
    var $assignlocationJSTreeSelectedContainer = $("#assignlocation_jstree_selected_container");

    // Templates
    var assignlocationJSTreeSelectedTemplate = "assignlocation_jstree_selected_template";

    // Variables
    var alreadyAssignedLocations = [];
    var newlyAssignedLocations = [];
    var contextVariables = {};

    // i18n
    var assignlocationLocationSaved = $("#assignlocation_location_saved");
    var assignlocationLocationSuccessfullySaved = $("#assignlocation_location_successfully_saved");

    // Actions
    var $assignlocationSaveButton = $("#assignlocation_save_button");

    var renderSelected = function(init) {
        var locations = {
            "newlyAssignedLocations" : newlyAssignedLocations
        }
        $assignlocationJSTreeSelectedContainer.html($.TemplateRenderer(assignlocationJSTreeSelectedTemplate, locations));
        // Check the boxes that were previously saved
        if (init) {
            var initiallySelect = [];
            for (var location in contextVariables.saveddirectory){
                $.jstree._reference($assignlocationJSTreeContainer).change_state($("#" + contextVariables.saveddirectory[location][contextVariables.saveddirectory[location].length - 1]), false);
            }
        }
    };

    var addTreebinding = function(){
        $assignlocationJSTreeContainer.bind("change_state.jstree", function(ev){
            newlyAssignedLocations = [];
            $(".jstree-leaf.jstree-checked a").each(function(index, val){
                newlyAssignedLocations.push(val.href.split("#")[1]);
            });
            renderSelected();
        });
    };

    var saveLocations = function(){
        var locations = [];
        $("#assignlocation_locations_selected li").each(function(index, val){
            locations.push("directory/" + $(val).text());
        });

        // Concatenate the tags with the new locations
        var newTags = [];
        if (contextVariables.tags) {
            newTags = sakai.api.Util.formatTagsExcludeLocation(contextVariables.tags.toString()).slice(0);
        }
        newTags = newTags.concat(locations);

        // Fetch original tags and directory locations
        var originalTags = [];
        if (contextVariables.tags){
            originalTags = contextVariables.tags;
        }

        sakai.api.Util.tagEntity(contextVariables.path, newTags, originalTags, function(){
            contextVariables.tags = newTags;
            contextVariables.saveddirectory = sakai.api.Util.getDirectoryTags(newTags.toString());
            $assignlocationContainer.jqmHide();
            sakai.api.Util.notification.show($(assignlocationLocationSaved).html(), $(assignlocationLocationSuccessfullySaved).html());
            $(window).trigger("sakai-contentmetadata-renderlocations", contextVariables);
        });
    };

    var addWidgetBinding = function(){
        $assignlocationSaveButton.bind("click", function(){
            saveLocations();
        });
    };

    var showContainer = function(){
        // position dialog box at users scroll position
        var htmlScrollPos = $("html").scrollTop();
        var docScrollPos = $(document).scrollTop();
        
        if (htmlScrollPos > 0) {
            $assignlocationContainer.css({
                "top": htmlScrollPos + 100 + "px"
            });
            
        }
        else 
            if (docScrollPos > 0) {
                $contentmetadataLocationsDialog.css({
                    "top": docScrollPos + 100 + "px"
                });
            }
        $assignlocationContainer.show();
        renderSelected(true);
    };

    var determineContext = function(){
        var context = sakai.api.UI.getPageContext();
        if (context) {
            switch (context) {
                case "user":
                    contextVariables = {
                        "saveddirectory": sakai.data.me.profile.saveddirectory,
                        "tags": sakai.data.me.profile["sakai:tags"],
                        "path": "/~" + sakai.data.me.profile["rep:userId"] + "/public/authprofile",
                        "context" : "user"
                    }
                    break;
                case "group":
                    break;
                case "content":
                    contextVariables = {
                        "saveddirectory": sakai.content_profile.content_data.saveddirectory,
                        "tags": sakai.content_profile.content_data.data["sakai:tags"],
                        "path": "/p/" + sakai.content_profile.content_data.data["jcr:name"],
                        "context" : "content"
                    }
                    break;
            }
            addTreebinding();
            addWidgetBinding();
        }
    };

    var doInit = function(){

        $assignlocationContainer.jqm({
            modal: true,
            toTop: true,
            onShow: showContainer
        });

        // set up new jstree for directory 
        var pluginArray = ["themes", "json_data", "cookies", "dnd", "search", "checkbox"];
        $assignlocationJSTreeContainer.jstree({
            "core": {
                "animation": 0,
                "html_titles": true
            },
            "cookies": {
                "save_selected": true
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
        determineContext();
    };

    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("assignlocation");