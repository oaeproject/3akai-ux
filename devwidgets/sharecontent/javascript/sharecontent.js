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
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/content_profile.js"], function($, sakai) {

    /**
     * @name sakai_global.sharecontent
     *
     * @class sharecontent
     *
     * @description
     * Content Share widget<br />
     * This is a general widget which aims to display an arbitriary number of
     * people, loading dynamically if the list is very long and return the
     * selected users in an object. The list loaded also shows which permissions
     * users have (managers or viewers) and as a manager you can change these settings
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.sharecontent = function(tuid, showSettings) {

        var $rootel = $("#" + tuid);

        // Buttons & links
        var sharecontent_dont_share_button = "#sharecontent_dont_share_button";
        var $sharecontent_add_button = $("#sharecontent_add_button", $rootel);
        var sharecontent_close_button = $("#sharecontent_close_button");
        var sharecontentPermissionsLink = ".sharecontent_permission_link";
        var sharecontentEmailLink = "#sharecontent_email_link";
        var sharecontentMessageLink = "#sharecontent_message_link";
        var sharecontentPermissionSettingsDontSave = "#sharecontent_permission_settings_dont_save";
        var sharecontentPermissionSettingsSave = "#sharecontent_permission_settings_save";

        // Sharing & permissions
        var $sharecontent_i_want_to_share = $("#sharecontent_i_want_to_share", $rootel);
        var $sharecontent_adding_files = $("#sharecontent_adding_files", $rootel);
        var sharecontentLinkInput = "#sharecontent_share_link input";
        var sharecontentSelectedSharer = "";
        var sharecontentChangeGlobalPermissions = "#sharecontent_change_global_permissions";
        var sharecontentNewMembersPermissions = "#sharecontent_basic_container .sharecontent_search_container .sharecontent_permission_link";

        // Search
        var $sharecontent_container_search = $("#sharecontent_container_search", $rootel);
        var sharecontent_search_query = "#sharecontent_search_query";
        var sharecontent_init_search = "#sharecontent_init_search";
        var sharecontentMessageNewMembers = "#sharecontent_message_new_members";

        // Containers
        var sharecontentBasicContainer = "#sharecontent_basic_container";
        var $sharecontent_container = $("#sharecontent_container", $rootel);
        var sharecontentEditPermissionsLink = "#sharecontent_edit_permission";
        var sharecontentPermissionSettingsContainer = "#sharecontent_permission_settings_container";
        var sharecontentPermissionSettingsContainerContent = "#sharecontent_permission_settings_container_content";
        var sharecontentVisibilityHeader = "#sharecontent_visibility_header";

        // Templates
        var sharecontentBasicTemplate = "sharecontent_basic_template";
        var sharecontentPermissionSettingsTemplate = "sharecontent_permission_settings_template";
        var sharecontentVisibilityHeaderTemplate = "#sharecontent_visibility_header_template";
        var sharecontentMessageTemplate = "sharecontent_share_message_template";
        var sharecontentSubjectTemplate = "sharecontent_share_subject_template";

        // i18n
        var sharecontentCanEdit = "#sharecontent_can_edit";
        var sharecontentCanView = "#sharecontent_can_view";
        var $sharecontentThereShouldBeAtLeastOneManager = $("#sharecontent_there_should_be_at_least_one_manager");
        var $sharecontentManagerCouldNotBeRemoved = $("#sharecontent_manager_could_not_be_removed");

        var shareData = {
            "filename": "\"" +  sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"",
            "path": window.location,
            "user": sakai.data.me.profile.basic.elements.firstName.value
        };

        var userList = [];
        var initialized = false;
        var callback = false;
        var memberAdded = false;
        var entityTypes = {};

        var pickerData = {
          "selected": {},
          "searchIn": "",
          "currentElementCount": 0,
          "selectCount": 0,
          "mode": "search",
          "type": "people",
          "spaceName": "Space",
          "items": 50,
          "selectable": true,
          "sortOn": "public/authprofile/basic/elements/lastName/@value",
          "sortOrder": "ascending",
          "what": "People",
          "where": "Group",
          "excludeList": []
        };

        var getSelectedList = function() {
            var list = $("#as-values-" + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(",");
            $(list).each(function(i, val) {
               if (val === "") {
                   list.splice(i, 1);
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $("#sharecontent_container .as-selection-item").each(function(){
                toAddNames.push($(this).html().split("</a>")[1]);
            });

            var returnValue = {"list":list, "toAddNames":toAddNames};

            return returnValue;
        };

        /**
         * Clear the autosuggest box
         */
        var clearAutoSuggest = function() {
            $("#as-values-" + tuid).val("");
            $(".as-selection-item").remove();
        };

        /**
         * Reset
         * Resets the people picker to a default state
         * @returns void
         */
        var reset = function() {
            $sharecontent_add_button.hide();
            $(sharecontentNewMembersPermissions).hide();
            $(sharecontent_dont_share_button).hide();
            $(sharecontentMessageNewMembers).hide();
            $(sharecontent_close_button).show();

            pickerData.selected = {};
            pickerData.currentElementCount = 0;
            pickerData.selectCount = 0;
            clearAutoSuggest();
        };

        var createActivity = function(activityMessage){
            var activityData = {
                "sakai:activityMessage": activityMessage
            };
            sakai.api.Activity.createActivity("/p/" + sakai_global.content_profile.content_data.data["jcr:name"], "content", "default", activityData, function(){
                $(window).trigger("load.content_profile.sakai", function(){
                    $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                });
            });
        };


        /**
         * Checks whether the current user can edit the current content item
         *
         * @return Boolean  true if member can edit content, false otherwise
         */
        var canCurrentUserEdit = function () {
            var managers = sakai_global.content_profile.content_data.members.managers;
            for (var i in managers) {
                if (managers.hasOwnProperty(i)) {
                    if (managers[i].hasOwnProperty("rep:userId")) {
                        if (sakai.data.me.user.userid === managers[i]["rep:userId"]) {
                            return true;
                        }
                    } else if (managers[i].hasOwnProperty("sakai:group-id")) {
                        if (sakai.api.Groups.isCurrentUserAMember(
                            managers[i]["sakai:group-id"], sakai.data.me)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        var removeMembers = function(selectedUserId, listItem){
            var permission = selectedUserId.split("-")[0];
            var removeAllowed = true;
            var itemArr = [];
            var item;
            var userid = selectedUserId.substring(selectedUserId.indexOf("-") + 1, selectedUserId.length);
            if (permission !== "manager") {
                item = {
                    "url": "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".members.json",
                    "method": "POST",
                    "parameters": {
                        ":viewer@Delete": userid
                    }
                };
            } else {
                if (sakai_global.content_profile.content_data.members.managers.length <= 1) {
                    removeAllowed = false;
                }
                else {
                    item = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":manager@Delete": userid
                        }
                    };
                }
            }

            if (removeAllowed) {
                itemArr.push(item);

                // Do the Batch request
                $.ajax({
                    url: sakai.config.URL.BATCH,
                    traditional: true,
                    type: "POST",
                    data: {
                        requests: $.toJSON(itemArr)
                    },
                    success: function(data){
                        $(window).trigger("sakai-sharecontent-removeUser", {
                            "user": userid,
                            "access": permission
                        });
                        listItem.remove();
                        createActivity("__MSG__MEMBERS_REMOVED_FROM_CONTENT__");

                        // reload if the current user can no longer edit
                        if (!canCurrentUserEdit()) {
                            window.location.reload();
                        }
                    }
                });
            } else {
                sakai.api.Util.notification.show($sharecontentManagerCouldNotBeRemoved.text(),
                    $sharecontentThereShouldBeAtLeastOneManager.text());
            }
        };

        String.prototype.startsWith = function(str){
            return (this.indexOf(str) === 0);
        };

        var changePermission = function(memberid, permission) {
            var data = [];
            if (permission === "viewer") {
                $.ajax({
                    url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".members.json",
                    type: "POST",
                    data: {
                        ":viewer": memberid,
                        ":manager@Delete": memberid
                    },
                    success: function () {
                        // update cached data (move this member from managers to viewers)
                        var managers = sakai_global.content_profile.content_data.members.managers;
                        for (var i = 0; i < managers.length; i++) {
                            var manager = managers[i];
                            if (manager["rep:userId"] === memberid || manager["sakai:group-id"] === memberid) {
                                // append this member to viewers
                                sakai_global.content_profile.content_data.members.viewers.push(manager);
                                // remove from managers
                                managers.splice(i, 1);
                            }
                        }

                        // create activity
                        createActivity("__MSG__CHANGED_PERMISSIONS_FOR_MEMBER__");

                        // reload if the current user can no longer edit
                        if (!canCurrentUserEdit()) {
                            window.location.reload();
                        }
                    },
                    error: function (data) {
                        debug.error("sharecontent failed to change content " +
                            "permission to 'viewer' for member: " + memberid);
                        debug.error("xhr data returned: " + data);
                    }
                });
            } else {
                $.ajax({
                    url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".members.json",
                    type: "POST",
                    data: {
                        ":manager": memberid,
                        ":viewer@Delete": memberid
                    },
                    success: function (data) {
                        // update cached data (move this member from viewers to managers)
                        var viewers = sakai_global.content_profile.content_data.members.viewers;
                        for (var i = 0; i < viewers.length; i++) {
                            var viewer = viewers[i];
                            if (viewer["rep:userId"] === memberid || viewer["sakai:group-id"] === memberid) {
                                // append this member to managers
                                sakai_global.content_profile.content_data.members.managers.push(viewer);
                                // remove from viewers
                                viewers.splice(i, 1);
                            }
                        }
                        createActivity("__MSG__CHANGED_PERMISSIONS_FOR_MEMBER__");
                    },
                    error: function (data) {
                        debug.error("sharecontent failed to change content " +
                            "permission to 'manager' for member: " + memberid);
                        debug.error("xhr data returned: " + data);
                    }
                });
            }
        };

        var setGlobalPermission = function(){
            var selectedVal = "";
            $(sharecontentPermissionSettingsContainerContent + " input:radio").each(function(){
                if (this.checked) {
                    selectedVal = this.value;
                }
            });

            var data = {
                "sakai:permissions" : selectedVal
            };

            sakai.api.Content.setFilePermissions(selectedVal, [{
                "hashpath": sakai_global.content_profile.content_data.data["jcr:name"]
            }], function(){
                $.ajax({
                    url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".json",
                    data: data,
                    traditional: true,
                    type: "POST",
                    success: function(){
                        sakai_global.content_profile.content_data.data["sakai:permissions"] = selectedVal;
                        $(window).trigger("sakai-sharecontent-setGlobalPermission");
                        $(sharecontentVisibilityHeader).html(sakai.api.Util.TemplateRenderer(sharecontentVisibilityHeaderTemplate, sakai));
                        $(sharecontentPermissionSettingsContainer).jqmHide();
                        // Post activity
                        createActivity("__MSG__CHANGED_FILE_PERMISSIONS__");
                    }
                });
            }, false);
        };

        var addBinding = function() {
            initialized = true;

            $(window).bind("sakai-contentprofile-ready", function(){
                render();
            });

            $(sharecontent_init_search).live("click", function() {
                var currentSelections = getSelectedList();
                $(window).trigger("sakai-pickeradvanced-init", {"list":currentSelections.list, "config": {"type": pickerData["type"]}});
            });

            $(sharecontent_dont_share_button).live("click", function() {
                reset();
            });

            $(sharecontent_close_button).live("click", function(){
                reset();
                $(window).trigger("sakai-sharecontent-close");
                $sharecontent_container.jqmHide();

                if (memberAdded) {
                    // display help tooltip
                    var tooltipData = {
                        "tooltipSelector": "#entity_content_share_button",
                        "tooltipTitle": "TOOLTIP_SHARE_CONTENT",
                        "tooltipDescription": "TOOLTIP_SHARE_CONTENT_P7",
                        "tooltipTop": -50,
                        "tooltipLeft": -200,
                        "tooltipAutoClose":true
                    };
                    $(window).trigger("sakai-tooltip-update", tooltipData);
                } else {
                    // hide any tooltips if they are open
                    $(window).trigger("sakai-tooltip-close");
                }
            });

            $(".jqmClose").bind("click", function(){
                // hide any tooltips if they are open
                $(window).trigger("sakai-tooltip-close");
            });

            $(sharecontentChangeGlobalPermissions).live("click", function(){
                $(sharecontentPermissionSettingsContainer).jqm({
                    modal: true,
                    overlay: 20,
                    toTop: true,
                    zIndex: 3100
                });

                $(sharecontentPermissionSettingsContainerContent).html(sakai.api.Util.TemplateRenderer(sharecontentPermissionSettingsTemplate, sakai_global.content_profile.content_data));
                $(sharecontentPermissionSettingsContainer).jqmShow();

                $(sharecontentPermissionSettingsDontSave).bind("click", function(){
                    $(sharecontentPermissionSettingsContainer).jqmHide();
                });

                $(sharecontentPermissionSettingsSave).bind("click", function(){
                    setGlobalPermission();
                });

            });

            $(sharecontentMessageLink).live("click", function(){
                $(window).trigger("initialize.sendmessage.sakai", [null, true, false, null, sakai.api.Util.TemplateRenderer(sharecontentSubjectTemplate, shareData), sakai.api.Util.TemplateRenderer(sharecontentMessageTemplate, shareData)]);
            });

            $(sharecontentEmailLink).live("click", function(){
                location.href = "mailto:?subject=" + sakai.api.Util.TemplateRenderer(sharecontentSubjectTemplate, shareData) +
                "&body=" + sakai.api.Util.TemplateRenderer(sharecontentMessageTemplate, shareData);
            });

            $(sharecontentLinkInput).live("focus", function(){
                this.select();
            });

            $(".sharecontent_remove").live("click", function(){
                removeMembers(this.id, $(this).parent().parent());
            });

            $(sharecontentPermissionsLink).live("click", function(){
                sharecontentSelectedSharer = "";
                $.each($(this)[0].className.split(" "), function(i, val){
                    if(val.startsWith("sharecontent_permission_link_")){
                        sharecontentSelectedSharer = val.split("sharecontent_permission_link_")[1];
                    }
                });
                sharecontentEditPermissionsLink = $("#sharecontent_edit_permission");
                sharecontentEditPermissionsLink.css("width", $(this).width() + 11 + "px");
                sharecontentEditPermissionsLink.css("left",$(this).position().left + 2 + "px");
                sharecontentEditPermissionsLink.css("top",$(this).position().top + 21 + "px");
                sharecontentEditPermissionsLink.toggle();
            });

            $(sharecontentEditPermissionsLink + " a").live("click", function(){
                $(sharecontentEditPermissionsLink).toggle();
                var changeTo;
                if (sharecontentSelectedSharer !== "") {
                    // Change the permissions if the user selected a different one
                    $sharecontentSelectedSharerSpan = $(".sharecontent_permission_link_" + sharecontentSelectedSharer + " span");
                    changeTo = $(this)[0].id.split("sharecontent_edit_permission_picker_")[1];
                } else {
                    $sharecontentSelectedSharerSpan = $(".sharecontent_new_members_permission_link span");
                    changeTo = $(this)[0].id.split("sharecontent_edit_permission_picker_")[1];
                }

                if (changeTo === "viewer") {
                    if ($sharecontentSelectedSharerSpan.html() !== $(sharecontentCanView).html()) {
                        if (sakai_global.content_profile.content_data.members.managers.length <= 1) {
                            // do not allow the last manager to become a viewer
                            sakai.api.Util.notification.show(
                                $sharecontentManagerCouldNotBeRemoved.text(),
                                $sharecontentThereShouldBeAtLeastOneManager.text());
                        } else {
                            // there is more than one manager; OK to become viewer
                            $sharecontentSelectedSharerSpan.html($(sharecontentCanView).html());
                            if (sharecontentSelectedSharer !== "") {
                                changePermission(sharecontentSelectedSharer, changeTo);
                            } else {
                                $(sharecontentNewMembersPermissions).val("viewer");
                            }
                        }
                    }
                }
                else {
                    if ($sharecontentSelectedSharerSpan.html() !== $(sharecontentCanEdit).html()) {
                        $sharecontentSelectedSharerSpan.html($(sharecontentCanEdit).html());
                        if (sharecontentSelectedSharer !== "") {
                            changePermission(sharecontentSelectedSharer, changeTo);
                        } else {
                            $(sharecontentNewMembersPermissions).val("managers");
                        }
                    }
                }
            });
        };

        /**
         * Set up the auto suggest box to enable search suggestions upon typing in the field
         */
        var setupAutoSuggest = function() {
            $(sharecontent_search_query).autoSuggest("",{
                source: function(query, add) {
                    var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS;
                    if (pickerData.type === 'content') {
                        searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
                    }
                    sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                        if (success) {
                            var suggestions = [];
                            var name, value, type;
                            $.each(data.results, function(i) {
                                if (pickerData.type === 'content') {
                                    name = data.results[i]['sakai:pooled-content-file-name'];
                                    value = data.results[i]['jcr:name'];
                                    type = "file";
                                } else if (data.results[i]["rep:userId"]) {
                                    name = sakai.api.Security.saneHTML(sakai.api.User.getDisplayName(data.results[i]));
                                    value = "user/" + data.results[i]["rep:userId"];
                                    type = "user";
                                } else if (data.results[i]["sakai:group-id"]) {
                                    name = data.results[i]["sakai:group-title"];
                                    value = "group/" + data.results[i]["sakai:group-id"];
                                    type = "group";
                                }
                                if (pickerData.excludeList.length === 0 || $.inArray(value, pickerData.excludeList) === -1) {
                                    suggestions.push({"value": value, "name": name, "type": type});
                                }
                            });
                            add(suggestions);
                        }
                    }, {"q": sakai.api.Server.createSearchString(query), "page": 0, "items": 15});
                },
                retrieveLimit: 10,
                asHtmlID: tuid,
                selectedItemProp: "name",
                searchObjProps: "name",
                startText: "Enter name here",
                formatList: function(data, elem) {
                    // formats each line to be presented in autosuggest list
                    // add the correct image, wrap name in a class
                    var imgSrc = "/dev/images/user_avatar_icon_32x32.png";
                    if(data.type === "group") {
                        imgSrc = "/dev/images/group_avatar_icon_32x32.png";
                    }
                    var line_item = elem.html(
                        '<img class="sm_suggestion_img" src="' + imgSrc + '" />' +
                        '<span class="sm_suggestion_name">' + data.name + '</span>');
                    return line_item;
                },
                resultClick: function(data) {
                    $sharecontent_add_button.removeAttr("disabled");
                    $(sharecontent_close_button).hide();
                    $(sharecontentNewMembersPermissions).show();
                    $sharecontent_add_button.show();
                    $(sharecontent_dont_share_button).show();
                    $(sharecontentMessageNewMembers).show();

                    // display help tooltip
                    var tooltipData = {
                        "tooltipSelector":sharecontentNewMembersPermissions,
                        "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                        "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P5",
                        "tooltipArrow":"bottom",
                        "tooltipTop":30,
                        "tooltipLeft":340
                    };
                    $(window).trigger("sakai-tooltip-update", tooltipData);
                    memberAdded = true;
                },
                selectionRemoved: function(elem) {
                    elem.remove();
                    if ($(".as-selection-item").length === 0) {
                        $sharecontent_add_button.attr("disabled", "disabled");
                        $sharecontent_add_button.hide();
                        $(sharecontentNewMembersPermissions).hide();
                        $(sharecontent_dont_share_button).hide();
                        $(sharecontent_close_button).show();
                        $(sharecontentMessageNewMembers).hide();
                    }
                }
            });
        };

        /**
         * Add people to the list of picked people
         * @param {Object} iConfig
         */
        var addPeople = function(iConfig){
            var userList = getSelectedList();
            $.each(userList.list, function(i, val){
                userList.list[i] = val.split("/")[1];
            });
            // send the message if its not empty
            var messageText = $.trim($(sharecontentMessageNewMembers).val());
            if (messageText !== "") {
                sakai.api.Communication.sendMessage(userList.list, sakai.data.me, sakai.api.i18n.Widgets.getValueForKey("sharecontent", "", "I_WANT_TO_SHARE") + " \"" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"", messageText, "message", false, false, false, "shared_content");
            }

            var mode = $(sharecontentNewMembersPermissions).val();
            var toAddList = userList.list.slice();

            for (var i in toAddList){
                if (toAddList.hasOwnProperty(i) && toAddList[i]) {
                    if (toAddList[i].substring(0,5) === "user/") {
                        toAddList[i] = toAddList[i].substring(5, toAddList[i].length);
                    } else if (toAddList[i].substring(0,6) === "group/") {
                        toAddList[i] = toAddList[i].substring(6, toAddList[i].length);
                    }
                }
            }

            $(window).trigger("sakai-sharecontent-finished", {"toAdd": toAddList, "toAddNames": userList.toAddNames, "mode": mode});

            $(window).trigger("sakai-sharecontent-addUser", {
                "user": userList,
                "access": mode
            });

            createActivity("__MSG__ADDED_A_MEMBER__");

            //reset form
            reset();
        };

        /**
         * Render
         * Renders the people picker
         * @param iConfig {String} Config element for the widget
         * @returns void
         */
        var render = function(iConfig) {
            $sharecontent_add_button.attr("disabled", "disabled");
            clearAutoSuggest();
            // Merge user defined config with defaults
            for (var element in iConfig) {
                if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                    pickerData[element] = iConfig[element];
                }
            }

            // bind elements, replace some text
            $sharecontent_i_want_to_share.html(sakai.api.i18n.Widgets.getValueForKey("sharecontent", "", "I_WANT_TO_SHARE") + " \"" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"");
            $(sharecontentBasicContainer).html(sakai.api.Util.TemplateRenderer(sharecontentBasicTemplate, sakai));


            // Render the default sharing message
            $(sharecontentMessageNewMembers).html(sakai.api.Util.TemplateRenderer(sharecontentMessageTemplate, shareData));

            // Inserts the listpeople widget
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);

            $sharecontent_i_want_to_share.show();

            $(sharecontent_init_search, $rootel).show();

            $sharecontent_container_search.removeClass("no_message");
            $(sharecontent_search_query).focus();

            $sharecontent_add_button.hide();
            $(sharecontent_dont_share_button).hide();
            $(sharecontentNewMembersPermissions).hide();
            $(sharecontent_close_button).show();

            // display help tooltip
            var tooltipData = {
                "tooltipSelector":sharecontent_close_button,
                "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P6",
                "tooltipArrow":"bottom",
                "tooltipLeft":15
            };
            $(window).trigger("sakai-tooltip-update", tooltipData);

            if (!initialized) {
                addBinding();
            }
            setupAutoSuggest();

            $sharecontent_add_button.unbind("click", addPeople);
            $sharecontent_add_button.bind("click", iConfig, addPeople);
        };

        $sharecontent_container.jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            zIndex: 3000
        });

        /**
         * Add people to the list of picked people, selected in the advanced picker widget
         * @param {Object} data User data
         */
        var addChoicesFromPickeradvanced = function(data) {
          $.each(data, function(i,val) {
              var name = "";
              var id = "";
              if (val.entityType == "group") {
                  name = val["sakai:group-title"];
                  id = val["sakai:group-id"];
              } else if (val.entityType == "user") {
                  name = sakai.api.User.getDisplayName(val);
                  id = val["rep:userId"];
              } else if (val.entityType == "file") {
                  name = val["sakai:pooled-content-file-name"];
                  id = val["jcr:name"];
              }
              $(sharecontent_search_query).autoSuggest.add_selected_item({"name": name, "value": id}, id);
              $sharecontent_add_button.removeAttr("disabled");
              $(sharecontentNewMembersPermissions).show();
              $(sharecontentMessageNewMembers).show();
              $(sharecontent_close_button).hide();
              $sharecontent_add_button.show();
              $(sharecontent_dont_share_button).show();
          });
          $("input#" + tuid).val('').focus();
        };

        ////////////
        // Events //
        ////////////

        $(window).unbind("sakai-sharecontent-init");
        $(window).bind("sakai-sharecontent-init", function(e, config, callbackFn) {
            $sharecontent_container.jqmShow();
            render(config);
            $(window).unbind("sakai-pickeradvanced-finished");
            $(window).bind("sakai-pickeradvanced-finished", function(e, data) {
                addChoicesFromPickeradvanced(data.toAdd);
            });
            callback = callbackFn;
        });

        $(document).bind("click", function(e) {
            var $target = $(e.target);
            if (!$target.hasClass("sharecontent_permission_link") &&
                !$target.hasClass("s3d-button-link-2-state-inner") &&
                !$target.hasClass("sharecontent_permission")) {
                if($(sharecontentEditPermissionsLink).is(":visible")) {
                    $(sharecontentEditPermissionsLink).hide();
                }
            }
        });

        // Reset to defaults
        reset();

        // Insert any inline widgets
        sakai.api.Widgets.widgetLoader.insertWidgets(tuid,false);

        // Send out an event that says the widget is ready to
        // accept a search query to process and display. This event can be picked up
        // in a page JS code
        $(window).trigger("sakai-sharecontent-ready");
        sakai_global.sharecontent.isReady = true;

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("sharecontent");
});
