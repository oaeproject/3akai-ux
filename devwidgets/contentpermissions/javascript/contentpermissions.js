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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js (autoSuggest)
 */
/*global $ */

// Namespaces
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/content_profile.js"], function($, sakai){

    /**
     * @name sakai_global.contentpermissions
     *
     * @class contentpermissions
     *
     * @description
     * Content Permissions widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentpermissions = function(tuid, showSettings){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $contentpermissionsContainer = $("#contentpermissions_container");
        var $contentpermissionsContentContainer = $("#contentpermissions_content_container");

        // Templates
        var contentpermissionsContentTemplate = "contentpermissions_content_template";
        var contentpermissionsShareMessageTemplate = "contentpermissions_share_message_template";

        // Elements
        var contentpermissionsMembersAutosuggest = "#contentpermissions_members_autosuggest";
        var contentpermissionsCancelButton = "#contentpermissions_cancel_button";
        var contentpermissionsMembersMessage = "#contentpermissions_members_message";


        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        var getSelectedList = function() {
            var list = $("#as-values-" + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(",");
            var removed = 0
            $(list).each(function(i, val) {
               if (val === "") {
                   list.splice(i - removed, 1);
                   removed += 1;
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $("#contentpermissions_container .as-selection-item").each(function(){
                // In IE 7 </A> is returned and in firefox </a>
                toAddNames.push($(this).html().split(/<\/[aA]?>/g)[1]);
            });

            var returnValue = {"list":list, "toAddNames":toAddNames};

            return returnValue;
        };

        var closeOverlay = function(){
            $contentpermissionsContainer.jqmHide();
        };

        var addedUserGroup = function(el){
            if (!$(contentpermissionsMembersMessage).is(":visible")) {
                $(contentpermissionsMembersMessage).html(sakai.api.Util.TemplateRenderer(contentpermissionsShareMessageTemplate, {
                    "filename": sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"],
                    "path": window.location,
                    "user": sakai.api.User.getDisplayName(sakai.data.me.profile)
                }));
            }
        };

        var removedUserGroup = function(el){
            el.remove();
        };


        ////////////
        // SEARCH //
        ////////////

        var fetchUsersGroups = function(){
            var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS_ALL + "?q=*";

            sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                if (success) {
                    var suggestions = [];
                    var name, value, type;
                    $.each(data.results, function(i){
                        if (data.results[i]["rep:userId"]) {
                            name = sakai.api.Security.saneHTML(sakai.api.User.getDisplayName(data.results[i]));
                            value = "user/" + data.results[i]["rep:userId"];
                            type = "user";
                        }  else if (data.results[i]["sakai:group-id"]) {
                                name = data.results[i]["sakai:group-title"];
                                value = "group/" + data.results[i]["sakai:group-id"];
                                type = "group";
                            }
                        suggestions.push({"value": value, "name": name, "type": type});
                    });
                    $(contentpermissionsMembersAutosuggest).autoSuggest(suggestions, {
                        selectedItemProp: "name",
                        searchObjProps: "name",
                        startText: "Enter name here",
                        asHtmlID: tuid,
                        selectionAdded: addedUserGroup,
                        selectionRemoved: removedUserGroup
                    });
                }
            });
        };


        //////////////
        // RENDERING //
        //////////////

        var renderPermissions = function(){
            debug.log(sakai_global.content_profile.content_data);
            $contentpermissionsContentContainer.html(sakai.api.Util.TemplateRenderer(contentpermissionsContentTemplate, {"contentdata" : sakai_global.content_profile.content_data, "api":sakai.api}));
            fetchUsersGroups();
        };

        var fillPermissionsData = function(title){
            $(".dialog_header_inner h1:visible").text("\"" + title + "\" " + sakai.api.i18n.Widgets.getValueForKey("contentpermissions", "", "PERMISSIONS"));
            renderPermissions();
        };


        //////////////
        // BINDINGS //
        //////////////

        var addBinding = function(){
            $contentpermissionsContainer.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 3000//,
                //onHide: resetWidget
            });

            $(window).bind("init.contentpermissions.sakai", function(e, config, callbackFn){
                $contentpermissionsContainer.jqmShow();
                fillPermissionsData(config.title);
            });

            $(contentpermissionsCancelButton).live("click", closeOverlay);

        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var init = function(){
            addBinding();
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contentpermissions");
});