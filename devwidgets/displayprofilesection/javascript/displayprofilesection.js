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
 */

/*global $, Config */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.displayprofilesection
     *
     * @class displayprofilesection
     *
     * @description
     * Initialize the displayprofilesection widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.displayprofilesection = function(tuid, showSettings){

        var rootel = $("#" + tuid);

        // Display section
        var displayprofilesectionContent = ".displayprofilesection_content";
        var displayprofilesectionContentWidgetHolder = ".displayprofilesection_content_widget_holder";
        var displayprofilesectionNoProfileInfoInserted = ".displayprofilesection_no_profile_info_inserted";
        var displayprofilesectionNoProfileInfoInsertedViewMode = ".displayprofilesection_no_profile_info_inserted_view_mode";

        // Templates
        var displayprofilesectionSectionWidgetsContainerTemplate = "#displayprofilesection_sectionwidgets_container_template";
        var displayprofilesectionSelectSectionTemplate = "displayprofilesection_select_section_template";

        // Settings
        var displayprofilesectionSettings = ".displayprofilesection_settings";
        var displayprofilesectionSelectSection = ".displayprofilesection_select_section";
        var displayprofilesectionSectionTitle = ".displayprofilesection_section_title";
        var displayprofilesectionAddCancel = ".displayprofilesection_add_cancel";
        var displayprofilesectionAddSubmit = ".displayprofilesection_add_submit";

        /**
         * Get the settings for this widget
         */
        var getSettings = function(){
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    // Check if settings should be shown
                    if (showSettings) {
                        // Show these settings
                        displaySettings(data);
                    } else {
                        // Show the widget
                        displayWidget(data);
                        // Init widget
                        sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false);
                    }
                } else {
                    // We don't have settings for this widget yet.
                    if (showSettings) {
                        displaySettings(data);
                    }
                }

            });
        };

        /**
         * Insert a profile section widget
         * @param {Object} data Contains sectionID to display
         */
        var displayWidget = function(data) {

            // Create a JSON object to pass the sectionid along
            // Trimpath needs an object to be passed (not only a variable)
            var sectionobject = {
                "sectionid": "profilesection-" + data.sectionid + "-" + Math.ceil(Math.random() * 999999999)
            };

            sakai.api.Widgets.changeWidgetTitle(tuid, data.sectiontitle);

            // Construct the html for the widget
            var toAppend = sakai.api.Util.TemplateRenderer($(displayprofilesectionSectionWidgetsContainerTemplate, rootel)[0].id, sectionobject);
            $(displayprofilesectionContentWidgetHolder, rootel).html(toAppend);

            // Bind a global event that can be triggered by the profilesection widgets
            $(window).bind(sectionobject.sectionid + ".sakai", function(eventtype, callback){
                if ($.isFunction(callback)) {
                    callback(data.sectionid);
                }

                if ($.trim($("#profilesection_generalinfo", rootel).html()) === "") {
                    if (sakai.data.me.user.userid === sakai_global.profile.main.data["rep:userId"]) {
                        $(displayprofilesectionNoProfileInfoInserted, rootel).show();
                    } else {
                        $(displayprofilesectionNoProfileInfoInsertedViewMode, rootel).show();
                    }
                } else {
                    $(displayprofilesectionNoProfileInfoInserted, rootel).hide();
                    $(displayprofilesectionNoProfileInfoInsertedViewMode, rootel).hide();
                }
            });

        };

        /**
         * Display the settings of the widget
         * @param {Object} data Returned settings, if any
         */
        var displaySettings = function(data){
            var objArr = {configuration : [], selectedsection : data.sectionid};
            for(var s in sakai.config.Profile.configuration.defaultConfig){
                if(sakai.config.Profile.configuration.defaultConfig[s].display){
                    var obj = {
                        "id" : s,
                        "label" : sakai.api.i18n.General.getValueForKey(sakai.config.Profile.configuration.defaultConfig[s].label.split("__MSG__")[1].split("__")[0])
                    };
                    objArr.configuration.push(obj);
                }
            }

            $(displayprofilesectionSelectSection, rootel).html(sakai.api.Util.TemplateRenderer(displayprofilesectionSelectSectionTemplate, objArr));
            $(displayprofilesectionSectionTitle, rootel).val(data.sectiontitle);

            if (typeof data.sectionid != "undefined"){
                $(displayprofilesectionSelectSection, rootel).children("option[value='no_value']").remove();
            }
        };

        /**
         * Save the settings
         */
        var submitSettings = function(){
            sakai.api.Widgets.saveWidgetData(tuid, {
                "sectionid" : $(displayprofilesectionSelectSection, rootel).val(),
                "sectiontitle" : $(displayprofilesectionSectionTitle, rootel).val()
            }, function(success, data){
                sakai.api.Widgets.Container.informFinish(tuid, "displayprofilesection");
            });
        };

        /**
         * Add binding to elements
         */
        var addBinding = function(){
            // Bind the settings submit button.
            $(displayprofilesectionAddSubmit, rootel).bind("click", function(e, ui){
                submitSettings();
            });

            // Bind the settings cancel button
            $(displayprofilesectionAddCancel, rootel).bind("click", function(e, ui){
                sakai.api.Widgets.Container.informCancel(tuid, "displayprofilesection");
            });

            $(displayprofilesectionSelectSection, rootel).bind("change", function(e, ui){
                $(this).children("option[value='no_value']").remove();
            });
        };

        /**
         * Initialize the widget
         */
        var doInit = function() {
            if (showSettings){
                $(displayprofilesectionSettings, rootel).show();
            } else {
                $(displayprofilesectionContent, rootel).show();
            }

            addBinding();
            getSettings();

            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("displayprofilesection");
});
