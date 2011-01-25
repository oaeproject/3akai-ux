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
 * /dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js (JsTree)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.assignlocation
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
    sakai_global.assignlocation = function(tuid, showSettings) {
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
        var $assignlocationActions = $("#assignlocation_actions");

        // Elements
        var $assignlocationAjaxLoader = $("#assignlocation_ajax_loader");

        var renderSelected = function(init) {
            var locations = {
                "newlyAssignedLocations" : newlyAssignedLocations
            };
            $assignlocationJSTreeSelectedContainer.html(sakai.api.Util.TemplateRenderer(assignlocationJSTreeSelectedTemplate, locations));

            // add event binding to the items
            $(".assignlocation_close_link").bind("click", function(ev){
                // get the id for the node (list item id)
                var id = $(this).parent().attr("id").split("/").pop();
                // unchecked the node
                $assignlocationJSTreeContainer.jstree("uncheck_node", $("#"+id));
            });

            // Check the boxes that were previously saved
            if (init) {
                var initiallySelect = [];
                for (var location in contextVariables.saveddirectory){
                    if (contextVariables.saveddirectory.hasOwnProperty(location)) {
                        $.jstree._reference($assignlocationJSTreeContainer).change_state($("#" + contextVariables.saveddirectory[location][contextVariables.saveddirectory[location].length - 1]), false);
                    }
                }
            }
        };

        var addTreebinding = function(){
            $assignlocationJSTreeContainer.bind("change_state.jstree", function(ev){
                newlyAssignedLocations = [];
                $(".jstree-checked>a").each(function(index, val){
                    newlyAssignedLocations.push(val.href.split("#")[1]);
                });
                renderSelected();
            });
        };

        var saveLocations = function(){
            $assignlocationActions.hide();
            $assignlocationAjaxLoader.show();

            var locations = [];
            $("#assignlocation_locations_selected li").each(function(index, val){
                locations.push("directory/" + $(val)[0].id);
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
                $assignlocationActions.show();
                $assignlocationAjaxLoader.hide();
            });
        };

        var addWidgetBinding = function(){
            $assignlocationSaveButton.unbind("click");
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

        var closeContainer = function(){
            $assignlocationActions.show();
            $assignlocationAjaxLoader.hide();
        };

        var determineContext = function(){
            var context = sakai.api.Util.getPageContext();
            if (context) {
                $("#assignlocation_secondcolumn_header_" + context).show();
                switch (context) {
                    case "user":
                        contextVariables = {
                            "saveddirectory": sakai.data.me.profile.saveddirectory,
                            "tags": sakai.data.me.profile["sakai:tags"],
                            "path": "/~" + sakai.data.me.profile["rep:userId"] + "/public/authprofile",
                            "context" : "user"
                        };
                        break;
                    case "group":
                        contextVariables = {
                            "saveddirectory":sakai.currentgroup.data.authprofile.saveddirectory,
                            "tags": sakai.currentgroup.data.authprofile["sakai:tags"],
                            "path": "/~" + sakai.currentgroup.id + "/public/authprofile",
                            "context": "group"    
                        };
                        break;
                    case "content":
                        contextVariables = {
                            "saveddirectory": sakai.content_profile.content_data.saveddirectory,
                            "tags": sakai.content_profile.content_data.data["sakai:tags"],
                            "path": "/p/" + sakai.content_profile.content_data.data["jcr:name"],
                            "context" : "content"
                        };
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
                onShow: showContainer,
                onClose: closeContainer
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
                    "data": sakai.api.Util.getDirectoryStructure
                },
                "themes": {
                    "dots": false,
                    "icons": false
                },
                "search" : {
                    "case_insensitive" : true
                },
                "checkbox": {
                    "multi_select": false  
                },
                "plugins": pluginArray
            });
            determineContext();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("assignlocation");    
});
