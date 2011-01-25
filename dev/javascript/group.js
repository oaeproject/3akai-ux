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
/*global $, QueryString */

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.currentgroup = sakai_global.currentgroup || {};
    sakai_global.currentgroup.id = sakai_global.currentgroup.id || {};
    sakai_global.currentgroup.data = sakai_global.currentgroup.data || {};
    sakai_global.currentgroup.manager = sakai_global.currentgroup.manager || false;

    sakai_global.group = function(){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var querystring; // Variable that will contain the querystring object of the page


        ///////////////////
        // CSS SELECTORS //
        ///////////////////

        var group_class = ".group";
        var $group_actions = $("#group_actions", group_class);
        var $group_actions_template = $("#group_actions_template", group_class);
        var $group_field_default_template = $("#group_field_default_template", group_class);
        var $group_footer = $("#group_footer", group_class);
        var $group_footer_button_dontupdate = $("#group_footer_button_dontupdate", group_class);
        var $group_footer_button_edit = $("#group_footer_button_edit", group_class);
        var $group_footer_template = $("#group_footer_template", group_class);
        var $group_heading = $("#group_heading", group_class);
        var $group_heading_template = $("#group_heading_template", group_class);


        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        var widgetready = false;
        var groupinfoready = false;

        $(window).bind("sakai.sitespages.ready", function(e){
            widgetready = true;
            if (groupinfoready) {
                loadPagesWidget();
            }
        });

        var loadPagesWidget = function(){
            var basepath = "/~" + sakai_global.currentgroup.id + "/pages/";
            var fullpath = "/_group/g/g-/" + sakai_global.currentgroup.id + "/pages/";
            var url = "/~" + sakai_global.currentgroup.id;
            var editMode = sakai_global.currentgroup.manager;
            var homePage = "";
            sakai.sitespages.doInit(basepath, fullpath, url, editMode, homePage, "grouppages", "groupdashboard");
        };

        /**
         * Get the group id from the querystring
         */
        var getGroupId = function(){
            if (querystring.contains("id")) {
                return querystring.get("id");
            }
            return false;
        };

        var readyToRender = false;
        var hasRendered = false;

        $(window).bind("sakai.api.UI.entity.ready", function(e){
            readyToRender = true;
            if (sakai_global.currentgroup.data) {
                $(window).trigger("render.entity.sakai", ["group", sakai_global.currentgroup.data]);
                hasRendered = true;
            }
        });

        /**
         * Fetch group data
         */
        var getGroupData = function(groupid){
            sakai.api.Groups.getGroupData(groupid, function(success, data) {
                if (success) {
                    sakai_global.currentgroup.id = groupid;
                    sakai_global.currentgroup.data = data;
                    if (data.authprofile['rep:policy']) {
                        sakai_global.currentgroup.manager = true;
                    }
                    if (readyToRender && !hasRendered) {
                        $(window).trigger("render.entity.sakai", ["group", data]);
                    }
                    groupinfoready = true;
                    if (widgetready){
                        loadPagesWidget();
                    }
                }
            });
        };

        ////////////////////
        // INITIALISATION //
        ////////////////////

        var doInit = function(){

            querystring = new Querystring();

            // Get and set the profile mode
            var groupid = getGroupId();
            if (groupid) {
                getGroupData(groupid);
            }

            /*$(window).bind("sakai.api.UI.groupbasicinfo.ready", function(e){
                getGroupData(groupid);
            });*/

        };

        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("group");
});
