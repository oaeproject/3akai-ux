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

        /**
         * Get the group id from the querystring
         */
        var processEntityInfo = function(){
            var querystring = new Querystring();
            if (querystring.contains("id")) {
                entityID = querystring.get("id");
            }
            sakai.api.Server.loadJSON("/~" + entityID + "/public/authprofile.profile.json", function(success, data) {
                if (success){
                    groupData = {};
                    groupData.authprofile = data;
                    sakai.api.Security.showPage(function() {
                        if (groupData.authprofile["sakai:customStyle"]) {
                            sakai.api.Util.include.css(sakai_global.currentgroup.data.authprofile["sakai:customStyle"]);
                        }
                    });
                    var pageTitle = sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.prefix);
                    document.title = pageTitle + groupData.authprofile["sakai:group-title"];
                    loadGroupEntityWidget();

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
            var context = "group";
            var type = "group";
            if (false){
                type = "group_managed";
            }
            $(window).trigger("sakai.entity.init", [context, type, groupData]);
        };

        $(window).bind("sakai.entity.ready", function(){
            loadGroupEntityWidget();
        });

        $("#entity_manage_group").live("click", function(){
            document.location = "/dev/group_edit2.html?id=" + entityID;
        });

        $(window).bind("ready.entity.sakai", function(e){
            loadEntityWidget();
        });
        
        /////////////////////////
        // LOAD LEFT HAND SIDE //
        /////////////////////////
        
        var pubdata = {
            "structure0": {
                "syllabus": {
                    "_title": "Syllabus",
                    "_order": 0,
                    "_pid": "gUbBYGx9E"
                },
                "contactus": {
                    "_title": "Contact us",
                    "_order": 1,
                    "_pid": "gUbBi1Caa"
                },
                "coursewebsite": {
                    "_title": "Course websites",
                    "_order": 2,
                    "_pid": "gUbBqAyaa"
                }
            }
        };
        
        var generateNav = function(){
            $(window).trigger("lhnav.init", [pubdata, {}, {}]);
        };
        
        $(window).bind("lhnav.ready", function(){
            generateNav();
        });

        generateNav();

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