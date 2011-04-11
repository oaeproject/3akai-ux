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
        var contentpermissionsMembersMessageContainer = "#contentpermissions_members_message_container";

        // Templates
        var contentpermissionsContentTemplate = "contentpermissions_content_template";
        var contentpermissionsShareMessageTemplate = "contentpermissions_share_message_template";

        // Elements
        var contentpermissionsMembersAutosuggest = "#contentpermissions_members_autosuggest";
        var contentpermissionsCancelButton = "#contentpermissions_cancel_button";
        var contentpermissionsMembersMessage = "#contentpermissions_members_message";
        var contentpermissionsShareButton = "#contentpermissions_share_button";
        var contentpermissionsNewMemberPermissions = "#contentpermissions_newmember_permissions";
        var contentpermissionsSaveAndCloseButton = "#contentpermissions_save_and_close_button";
        var contentpermissionsGlobalPermissions = "#contentpermissions_global_permissions";


        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        var getSelectedList = function() {
            var list = $("#as-values-" + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(",");
            var removed = 0;
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
            if (!$(contentpermissionsMembersMessageContainer).is(":visible")) {
                $(contentpermissionsMembersMessage).html(sakai.api.Util.TemplateRenderer(contentpermissionsShareMessageTemplate, {
                    "filename": sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"],
                    "path": window.location,
                    "user": sakai.api.User.getDisplayName(sakai.data.me.profile)
                }));
                $(contentpermissionsMembersMessageContainer).show();
            }
        };

        var removedUserGroup = function(el){
            el.remove();
        };

        var doShare = function(){
            var userList = getSelectedList();
            $.each(userList.list, function(i, val){
                userList.list[i] = val.split("/")[1];
            });

            var toAddList = userList.list.slice();

            for (var i in toAddList) {
                if (toAddList.hasOwnProperty(i) && toAddList[i]) {
                    if (toAddList[i].substring(0, 5) === "user/") {
                        toAddList[i] = toAddList[i].substring(5, toAddList[i].length);
                    } else if (toAddList[i].substring(0, 6) === "group/") {
                        toAddList[i] = toAddList[i].substring(6, toAddList[i].length);
                    }
                }
            }

            $(window).trigger("finished.sharecontent.sakai", {
                "toAdd": toAddList,
                "toAddNames": userList.toAddNames,
                "mode": $(contentpermissionsNewMemberPermissions).val()
            });

            $(contentpermissionsMembersMessageContainer).hide();
        };

        var doSave = function(){
            var dataObj = {
                "sakai:permissions" : $(contentpermissionsGlobalPermissions).val()
            };
            $.ajax({
                url: sakai_global.content_profile.content_data.path,
                type:"POST",
                data: dataObj,
                success: function(data){
                    sakai_global.content_profile.content_data.data["sakai:permissions"] = $(contentpermissionsGlobalPermissions).val();
                }
            });

            var permissionsBatch = [];
            $("#contentpermissions_members_list li").each(function(index, item){
                var newPermission = $(item).children(".contentpermissions_member_permissions").val();
                var userId = item.id.split("_")[1];
                var p = {};
                if (newPermission == "manager") {
                    p = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":manager": userId,
                            ":viewer@Delete": userId
                        }
                    };
                    permissionsBatch.push(item);
                } else {
                    p = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":viewer": userId,
                            ":manager@Delete": userId
                        }
                    };
                    permissionsBatch.push(item);
                }
            });
            // Do the Batch request
            sakai.api.Server.batch(permissionsBatch, function(success, data) {
                closeOverlay();
                $(window).trigger("load.content_profile.sakai");
            }, false);
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
                        if (data.results[i]["rep:userId"] && sakai.data.me.user.userid != data.results[i]["rep:userId"]) {
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
            $contentpermissionsContentContainer.html(sakai.api.Util.TemplateRenderer(contentpermissionsContentTemplate, {
                "contentdata": sakai_global.content_profile.content_data,
                "api": sakai.api
            }));
            fetchUsersGroups();
        };

        var fillPermissionsData = function(){
            $(".dialog_header_inner h1:visible").text("\"" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\" " + sakai.api.i18n.Widgets.getValueForKey("contentpermissions", "", "PERMISSIONS"));
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
            });

            $(window).bind("init.contentpermissions.sakai", function(e, config, callbackFn){
                $contentpermissionsContainer.jqmShow();
                fillPermissionsData();
            });

            $(contentpermissionsCancelButton).live("click", closeOverlay);
            $(contentpermissionsShareButton).live("click", doShare);
            $(contentpermissionsSaveAndCloseButton).live("click", doSave);
            $(window).bind("membersadded.content.sakai", renderPermissions);

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