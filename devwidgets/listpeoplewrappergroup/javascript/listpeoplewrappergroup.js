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
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.listpeoplewrappergroup
     *
     * @class listpeoplewrappergroup
     *
     * @description
     * Initialize the listpeoplewrappergroup widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     */
    sakai_global.listpeoplewrappergroup = function(tuid, showSettings){

        var rootel = "#" + tuid;
        var listType = "members";

        ///////////////////
        // CSS Selectors //
        ///////////////////

        var listpeoplewrappergroup = "#listpeoplewrappergroup";
        var listpeoplewrappergroupContainer = listpeoplewrappergroup + "_container";
        var listpeoplewrappergroupDefaultTemplate = listpeoplewrappergroup + "_default_template";
        var listpeoplewrappergroupSettings = listpeoplewrappergroup + "_settings";
        var listpeoplewrappergroupSettingsCancel = listpeoplewrappergroupSettings + "_cancel";
        var listpeoplewrappergroupSettingsFinish = listpeoplewrappergroupSettings + "_finish";
        var listpeoplewrappergroupSettingsSelect = listpeoplewrappergroupSettings + "_select";

        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the template
         */
        var renderTemplateListpeople = function() {
            var listTitle = listType.charAt(0).toUpperCase() + listType.substring(1,listType.length);
            $(listpeoplewrappergroupContainer, rootel).html(sakai.api.Util.TemplateRenderer(listpeoplewrappergroupDefaultTemplate, {listType: listType, tuid: tuid, listTitle: listTitle}));
            var newTitle = $(".listpeoplewrappergroup_header", rootel).text();
            if (sakai.api.Widgets.isOnDashboard(tuid)) {
                sakai.api.Widgets.changeWidgetTitle(tuid, newTitle);
            } else {
                $(".listpeoplewrappergroup_header", rootel).show();
            }
        };

        /**
         * Render Widget with group data
         */
        var loadGroupElements = function(){
            var pl_config = {"selectable":false, "subNameInfoUser": "", "subNameInfoGroup": "sakai:group-description", "sortOn": "lastName", "sortOrder": "asc", "items": 1000, "function": "getSelection" },
                url = "";

            if (listType === "members") {
                // get group members
                url = "/system/userManager/group/" + sakai_global.currentgroup.data.authprofile["sakai:group-id"] + ".members.json";
            } else if (listType === "managers") {
                // get group managers
                url = "/system/userManager/group/" + sakai_global.currentgroup.data.authprofile["sakai:group-id"] + ".managers.json";
            } else if (listType === "content") {
                // get group content
                url = "/var/search/pool/files.json?group=" + sakai_global.currentgroup.data.authprofile["sakai:group-id"];
            }

            $(window).trigger(listType+tuid + ".render.listpeople.sakai", {"listType": listType, "pl_config": pl_config, "url": url, "id": sakai_global.currentgroup.data.authprofile["sakai:group-id"]});
        };

        //////////////
        // Bindings //
        //////////////

        /**
         * Bind the listpeople widget
         */
        var addListpeopleBinding = function(){
            // Bind the listpeople widget
            if (sakai_global.listpeople && sakai_global.listpeople.isReady && sakai_global.data.listpeople[(listType+tuid)] && sakai_global.data.listpeople[(listType+tuid)].isReady) {
                loadGroupElements();
            } else {
                $(window).unbind(listType+tuid + ".ready.listpeople.sakai");
                $(window).bind(listType+tuid + ".ready.listpeople.sakai", function(e) {
                    loadGroupElements();
                });
            }
        };

        /**
         * Bind the save/cancel buttons
         */
        var addSettingBinding = function(){
            $(listpeoplewrappergroupSettingsCancel, rootel).bind("click",function(e,ui){
                sakai.api.Widgets.Container.informCancel(tuid, "listpeoplewrappergroup");
            });
            $(listpeoplewrappergroupSettingsFinish, rootel).bind("click",function(e,ui){
                var listType = $(listpeoplewrappergroupSettingsSelect, rootel).val();
                if (listType) {
                    sakai.api.Widgets.saveWidgetData(tuid, {listType: listType}, function(success, data) {
                        if ($(".sakai_dashboard_page").is(":visible")) {
                            showSettings = false;
                            showHideSettings(showSettings);
                        }
                        else {
                            sakai.api.Widgets.Container.informFinish(tuid, "listpeoplewrappergroup");
                        }
                    });
                }
            });
        };

        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Shows or hides the settings screen
         * @param {Object} show
         */
        var showHideSettings = function(show){
            if(show){
                addSettingBinding();
                $(listpeoplewrappergroupSettings, rootel).show();
            } else if (sakai_global.currentgroup.data) {
                $(listpeoplewrappergroupSettings, rootel).hide();
                renderTemplateListpeople();
                addListpeopleBinding();
            }
        };

        /**
         * doInit
         */
        var doInit = function(){
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    resultJSON = data;
                    if (data.listType) {
                        listType = data.listType;
                        $(listpeoplewrappergroupSettingsSelect, rootel).val(listType);
                    }
                }
                showHideSettings(showSettings);

                // Inserts the listpeople widget
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            });
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("listpeoplewrappergroup");
});
