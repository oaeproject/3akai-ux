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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.participants
     *
     * @class participants
     *
     * @description
     * My Hello World is a dashboard widget that says hello to the current user
     * with text in the color of their choosing
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.participants = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // Containers
        var $participantsListContainer = $("#participants_list_container");

        // Templates
        var participantsListTemplate = "participants_list_template";

        // Elements
        var $participantsSearchField = $("#participants_search_field");

        ///////////////////////
        // Utility functions //
        ///////////////////////

        var renderParticipants = function (success, data){
            if(success){
                var participantsArr = [];
                for (var i = 0; i < data.results.length; i++){
                    participantsArr.push({
                        "name" : data.results[i].basic.elements.firstName.value + " " + data.results[i].basic.elements.lastName.value,
                        "id" : data.results[i]["rep:userId"],
                        "title" : "Research Assistant",
                        "content" : 0,
                        "contacts" : 0,
                        "memberships" : 0
                    });
                }
                $participantsListContainer.html(sakai.api.Util.TemplateRenderer(participantsListTemplate, {
                    "participants": participantsArr
                }));
            }else {
                debug.log("Participants could not be loaded");
            }
        };

        var loadParticipants = function(){
            var query = $.trim($participantsSearchField.val());
            sakai.api.Server.loadJSON("/var/search/groupmembers-all.json",
                renderParticipants, {
                    group: sakai_global.currentgroup.id,
                    q: query || "*"
                }
            );
        };

        var addBinding = function(){
            $participantsSearchField.unbind("keyup", loadParticipants);
            $participantsSearchField.bind("keyup", loadParticipants);
        };

        var init = function(){
            addBinding();
            loadParticipants();
        };

        init();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("participants");
});
