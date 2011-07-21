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
        var contextVariables = {};
        var initiallySelected = [],
            initiallyRendered = [],
            initial = 0;

        // i18n
        var assignlocationLocationSaved = $("#assignlocation_location_saved");
        var assignlocationLocationSuccessfullySaved = $("#assignlocation_location_successfully_saved");

        // Actions
        var $assignlocationSaveButton = $("#assignlocation_save_button");
        var $assignlocationActions = $("#assignlocation_actions");

        // Elements
        var $assignlocationAjaxLoader = $("#assignlocation_ajax_loader");

        var renderSelected = function() {
            var locations = {
                "selections" : initiallyRendered,
                sakai: sakai
            };
            $assignlocationJSTreeSelectedContainer.html(sakai.api.Util.TemplateRenderer(assignlocationJSTreeSelectedTemplate, locations));

            // add event binding to the items
            $(".assignlocation_close_image").bind("click", function(ev){
                // get the id for the node (list item id)
                var id = $(this).parent().attr("id").split("/").pop();
                // unchecked the node
                $assignlocationJSTreeContainer.jstree("uncheck_node", $("#"+id));
                return false;
            });
        };

        var addTreeBinding = function(){
            $assignlocationJSTreeContainer.bind("change_state.jstree", function(ev){
                if (initial > 0) {
                    initial--;
                } else {
                    initiallyRendered = [];
                    $(".jstree-checked>a").each(function(index, val) {
                        initiallyRendered.push($(val).attr("data-path"));
                    });
                    renderSelected();
                }
            });
        };

        var saveLocations = function(){
            $assignlocationActions.hide();
            $assignlocationAjaxLoader.show();

            var locations = [];
            $("#assignlocation_locations_selected li").each(function(index, val){
                locations.push("directory/" + $(val)[0].id);
            });

            var originalTags = [],
                newTags = [];

            // Fetch original tags and directory locations
            if (contextVariables.data["sakai:tags"]){
                originalTags = $.merge([], contextVariables.data["sakai:tags"]);
            }

            // Concatenate the tags with the new locations
            if (originalTags) {
                newTags = sakai.api.Util.formatTagsExcludeLocation(originalTags);
            }
            newTags = newTags.concat(locations);

            sakai.api.Util.tagEntity(contextVariables.path, newTags, originalTags, function(success, tags){
                contextVariables.data["sakai:tags"] = tags;
                contextVariables.data.saveddirectory = sakai.api.Util.getDirectoryTags(tags);
                $assignlocationContainer.jqmHide();
                sakai.api.Util.notification.show($(assignlocationLocationSaved).html(), $(assignlocationLocationSuccessfullySaved).html());
                $(window).trigger("renderlocations.contentmetadata.sakai", contextVariables);
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

        var showContainer = function(hash){
            determineContext();
            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();

            if (htmlScrollPos > 0) {
                $assignlocationContainer.css({
                    "top": htmlScrollPos + 100 + "px"
                });
            } else {
                if (docScrollPos > 0) {
                    $assignlocationContainer.css({
                        "top": docScrollPos + 100 + "px"
                    });
                }
            }
            hash.w.show();
            renderSelected(true);
        };

        var closeContainer = function(){
            $assignlocationActions.show();
            $assignlocationAjaxLoader.hide();
        };

        var determineContext = function(){
            if ($.isEmptyObject(contextVariables)) {
                var context = sakai.api.Util.getPageContext();
                if (context) {
                    $("#assignlocation_secondcolumn_header_" + context).show();
                    switch (context) {
                        case "user":
                            contextVariables = {
                                "data": sakai.data.me.profile,
                                "path": "/~" + sakai.data.me.profile["rep:userId"] + "/public/authprofile",
                                "context" : "user"
                            };
                            break;
                        case "group":
                            contextVariables = {
                                "data": sakai_global.group.groupData,
                                "path": "/~" + sakai_global.group.groupId + "/public/authprofile",
                                "context": "group"
                            };
                            break;
                        case "content":
                            contextVariables = {
                                "data": sakai_global.content_profile.content_data,
                                "path": "/p/" + sakai_global.content_profile.content_data.data["_path"],
                                "context" : "content"
                            };
                            // check if content tags are stored another level down
                            if (!contextVariables.data["sakai:tags"]
                                && sakai_global.content_profile.content_data.data
                                && sakai_global.content_profile.content_data.data["sakai:tags"]) {
                                contextVariables.data["sakai:tags"] = sakai_global.content_profile.content_data.data["sakai:tags"];
                            }
                            break;
                    }
                }
                determineInitiallySelected();
                initTree();
                addTreeBinding();
                addWidgetBinding();
            }
        };

        var determineInitiallySelected = function() {
            initiallySelected = [];
            initiallyRendered = [];
            for (var location in contextVariables.data.saveddirectory) {
                if (contextVariables.data.saveddirectory.hasOwnProperty(location)) {
                    var jstreeID = contextVariables.data.saveddirectory[location][contextVariables.data.saveddirectory[location].length - 1];
                    var initialRender = contextVariables.data.saveddirectory[location].join("/");
                    initiallySelected.push(jstreeID);
                    initiallyRendered.push(initialRender);
                }
            }
            initial = initiallySelected.length;
        };

        var initTree = function(){
            // set up new jstree for directory
            var jsonData = sakai.api.Util.getDirectoryStructure();
            var pluginArray = ["themes", "json_data", "cookies", "search", "checkbox", "ui"];
            $assignlocationJSTreeContainer.jstree("destroy");
            $assignlocationJSTreeContainer.jstree({
                "plugins": pluginArray,
                "core": {
                    "animation": 0,
                    "html_titles": true
                },
                "cookies": {
                    "save_selected": true
                },
                "json_data": {
                    "data": jsonData
                },
                "themes": {
                    "dots": false,
                    "icons": false,
                    "url": "/dev/lib/jquery/plugins/jsTree/themes/default/style.css"
                },
                "search" : {
                    "case_insensitive" : true
                },
                "ui": {
                    "initially_select": initiallySelected,
                    "preventDefault": true
                }
            });
        };

        var doInit = function(){
            $assignlocationContainer.jqm({
                modal: true,
                toTop: true,
                onShow: showContainer,
                onClose: closeContainer
            });

            //determineContext();
        };
        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("assignlocation");
});
