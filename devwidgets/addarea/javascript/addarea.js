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
// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.addarea
     *
     * @class addarea
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.addarea = function(tuid, showSettings){

        //default, private, logged in only (if goup visible for logged in), public (if group public), advanced

        // Containers
        var $addareaContentsContainerDescription = $("#addarea_contents_container_description");
        var $addareaContentsContainerForm = $("#addarea_contents_container_form");

        // Classes
        var addareaContentsSelectedListItemClass = "addarea_contents_selected_list_item";

        // Templates
        var addareaContentsContainerDescriptionTemplate = "addarea_contents_container_description_template";

        // Elements
        var addareaContentsListItem = ".addarea_contents_list_item";
        var addareaContentsSelectedListItem = ".addarea_contents_selected_list_item";
        var addareaContentsListFirstItem = "#addarea_contents_list_first_item";
        var addareaSelectTemplate = ".addarea_select_template";

        // Mappings
        var descriptionMap = {
            "pages": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "PAGE_AUTHORING_AND_WIDGETS"),
            "sakaidoc": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "FIND_EXISTING_CONTENT_AND"),
            "dashboardoverview": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "AN_OVERVIEW_OF_CURRENT_ACTIVITY"),
            "participantlist": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "PARTICIPATING_PEOPLE_AND_GROUPS"),
            "timetable": "Timetable",
            "contentlibrary": "Content Library",
            "widgetpage": "Widgets Page",
            "sakaitwotool": sakai.api.i18n.Widgets.getValueForKey("addarea", "", "UTILISE_A_PREVIOUS_SAKAI_TOOL")
        };

        var switchSelection = function($el){
            $(addareaContentsSelectedListItem).removeClass(addareaContentsSelectedListItemClass);
            $el.addClass(addareaContentsSelectedListItemClass);
        };

        var renderDescription = function(){
            if(!$(this).hasClass(addareaContentsSelectedListItemClass)){
                var context = $(this).attr("data-context");
                var areadescription = descriptionMap[context];
                switchSelection($(this));
                $addareaContentsContainerDescription.html(sakai.api.Util.TemplateRenderer(addareaContentsContainerDescriptionTemplate, {
                    areadescription: areadescription,
                    context: context
                }));
                $addareaContentsContainerForm.hide();
                $addareaContentsContainerForm.html("");
            }
        };

        var renderForm = function(){
            var context = $(this).attr("data-context");
            if(context){
                $addareaContentsContainerForm.html(sakai.api.Util.TemplateRenderer("addarea_" + context + "_form_template", {
                    context: context
                }));
                $(addareaSelectTemplate).hide();
                //$addareaContentsContainerForm.show();
                $addareaContentsContainerForm.animate({width:"250px;"},0, 'linear').toggle("slow");
            }
        };

        var addBinding = function(){
            $(addareaContentsListItem).bind("click", renderDescription);
            $(addareaSelectTemplate).live("click", renderForm)
        };

        var doInit = function(){
            addBinding();
            $(addareaContentsListFirstItem).click();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addarea");
});