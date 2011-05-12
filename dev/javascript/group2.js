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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.group2 = function() {

        var groupData = false;
        var groupId = false;
        var pubdata = false;

        /**
         * Get the group id from the querystring
         */
        var processEntityInfo = function(){
            var querystring = new Querystring();
            if (querystring.contains("id")) {
                groupId = querystring.get("id");
            }
            sakai.api.Server.loadJSON("/system/userManager/group/" + groupId + ".json", function(success, data) {
                if (success){
                    groupData = {};
                    groupData.authprofile = data.properties;
                    sakai.api.Security.showPage(function() {
                        if (groupData.authprofile["sakai:customStyle"]) {
                            sakai.api.Util.include.css(groupData.authprofile["sakai:customStyle"]);
                        }
                    });
                    var pageTitle = sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.prefix);
                    document.title = pageTitle + groupData.authprofile["sakai:group-title"];
                    loadGroupEntityWidget();
                    loadDocStructure();

                } else {
                    if (data.status === 401 || data.status === 403){
                        sakai.api.Security.send403();
                    } else {
                        sakai.api.Security.send404();
                    }
                }
            });
        };

        var loadGroupEntityWidget = function(){
            var canManage = sakai.api.Groups.isCurrentUserAManager(groupId, sakai.data.me, groupData.authprofile);
            var context = "group";
            var type = "group";
            if (canManage){
                type = "group_managed";
            }
            $(window).trigger("sakai.entity.init", [context, type, groupData]);
        };

        $(window).bind("sakai.entity.ready", function(){
            loadGroupEntityWidget();
        });

        $(window).bind("ready.entity.sakai", function(e){
            loadEntityWidget();
        });

        /////////////////////////
        // LOAD LEFT HAND SIDE //
        /////////////////////////

        var loadDocStructure = function(){
            $.ajax({
                url: "/~" + groupId+ "/docstructure.infinity.json",
                success: function(data){
                    pubdata = {};
                    pubdata.structure0 = sakai.api.Server.cleanUpSakaiDocObject(data);
                    generateNav();
                }
            });
        };

        var generateNav = function(){
            if (pubdata) {
                $(window).trigger("lhnav.init", [pubdata, {}, {}]);
            }
        };

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });

        ////////////////////
        // INITIALISATION //
        ////////////////////

        var doInit = function(){
            processEntityInfo();
        };

        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("group2");
});