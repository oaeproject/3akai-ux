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

/*global $ */

// Namespaces
var sakai = sakai || {};

/**
 * @name sakai.pickerUser
 *
 * @description
 * Public functions for the people picker widget
 */
sakai.pickerUser = {};

/**
 * @name sakai.pickeruser
 *
 * @class pickeruser
 *
 * @description
 * People Picker widget<br />
 * This is a general widget which aims to display an arbitriary number of
 * people, loading dynamically if the list is very long and return the
 * selected users in an object.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.pickeruser = function(tuid, showSettings) {

    var $rootel = $("#" + tuid);

    // Buttons & links
    var pickeruser_dont_share_button = "#pickeruser_dont_share_button";
    var $pickeruser_add_button = $("#pickeruser_add_button", $rootel);
    var pickeruser_close_button = $("#pickeruser_close_button");
    var pickeruserPermissionsLink = ".pickeruser_permission_link";
    var pickeruserEmailLink = "#pickeruser_email_link";
    var pickeruserMessageLink = "#pickeruser_message_link";
    var pickeruserPermissionSettingsDontSave = "#pickeruser_permission_settings_dont_save";
    var pickeruserPermissionSettingsSave = "#pickeruser_permission_settings_save";

    // Sharing & permissions
    var $pickeruser_i_want_to_share = $("#pickeruser_i_want_to_share", $rootel);
    var $pickeruser_adding_files = $("#pickeruser_adding_files", $rootel);
    var pickeruserLinkInput = "#pickeruser_share_link input";
    var pickeruserSelectedSharer = "";
    var pickeruserChangeGlobalPermissions = "#pickeruser_change_global_permissions";
    var pickeruserNewMembersPermissions = "#pickeruser_basic_container .pickeruser_search_container .pickeruser_permission_link";

    // Search
    var $pickeruser_container_search = $("#pickeruser_container_search", $rootel);
    var pickeruser_search_query = "#pickeruser_search_query";
    var pickeruser_init_search = "#pickeruser_init_search";
    var pickeruserMessageNewMembers = "#pickeruser_message_new_members";

    // Containers
    var pickeruserBasicContainer = "#pickeruser_basic_container";
    var $pickeruser_container = $("#pickeruser_container", $rootel);
    var pickeruserEditPermissionsLink = "#pickeruser_edit_permission";
    var pickeruserPermissionSettingsContainer = "#pickeruser_permission_settings_container";
    var pickeruserPermissionSettingsContainerContent = "#pickeruser_permission_settings_container_content";
    var pickeruserVisibilityHeader = "#pickeruser_visibility_header";

    // Templates
    var pickeruserBasicTemplate = "pickeruser_basic_template";
    var pickeruserPermissionSettingsTemplate = "pickeruser_permission_settings_template";
    var pickeruserVisibilityHeaderTemplate = "#pickeruser_visibility_header_template";

    // i18n
    var pickeruserCanEdit = "#pickeruser_can_edit";
    var pickeruserCanView = "#pickeruser_can_view";

    var userList = [];
    var callback = false;

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
        $("#pickeruser_container .as-selection-item").each(function(){
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
        $pickeruser_add_button.hide();
        $(pickeruserNewMembersPermissions).hide();
        $(pickeruser_dont_share_button).hide();
        $(pickeruserMessageNewMembers).hide();
        $(pickeruser_close_button).show();

        pickerData.selected = {};
        pickerData.currentElementCount = 0;
        pickerData.selectCount = 0;
        clearAutoSuggest();
    };

    var removeMembers = function(selectedUserId, listItem){
        var permission = selectedUserId.split("-")[0];
        var itemArr = [];
        var item;
        if (permission !== "manager") {
            item = {
                "url": "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".members.json",
                "method": "POST",
                "parameters": {
                    ":viewer@Delete": selectedUserId.substring(selectedUserId.indexOf("-") + 1, selectedUserId.length)
                }
            };
        } else {
            item = {
                "url": "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".members.json",
                "method": "POST",
                "parameters": {
                    ":manager@Delete": selectedUserId.substring(selectedUserId.indexOf("-") + 1, selectedUserId.length)
                }
            };
        }
        itemArr.push(item);

        // Do the Batch request
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type : "POST",
            cache: false,
            data: {
                requests: $.toJSON(itemArr)
            },
            success: function(data){
                $(window).trigger("sakai-pickeruser-removeUser", {
                    "user": selectedUserId.substring(selectedUserId.indexOf("-") + 1, selectedUserId.length),
                    "access": permission
                });
                listItem.remove();
            }
        });

    };

    String.prototype.startsWith = function(str){
        return (this.indexOf(str) === 0);
    };

    var changePermission = function(userid, permission){
        var data = [];
        if (permission === "viewer") {
            item = {
                "url": "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".members.json",
                "method": "POST",
                "parameters": {
                    ":viewer": userid,
                    ":manager@Delete": userid
                }
            };
            data.push(item);
        } else {
            item = {
                "url": "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".members.json",
                "method": "POST",
                "parameters": {
                    ":manager": userid,
                    ":viewer@Delete": userid
                }
            };
            data.push(item);
        }
        // batch request to update user access for the content
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type: "POST",
            data: {
                requests: $.toJSON(data)
            },
            success: function(data){

            }
        });
    };

    var setGlobalPermission = function(){
        var selectedVal = "";
        $(pickeruserPermissionSettingsContainerContent + " input:radio").each(function(){
            if (this.checked) {
                selectedVal = this.value;
            }
        });

        var data = {
            "sakai:permissions" : selectedVal
        };

        sakai.api.Content.setFilePermissions(selectedVal, [{
            "hashpath": sakai.content_profile.content_data.data["jcr:name"]
        }], function(){
            $.ajax({
                url: "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".json",
                data: data,
                traditional: true,
                type: "POST",
                success: function(){
                    sakai.content_profile.content_data.data["sakai:permissions"] = selectedVal;
                    $(window).trigger("sakai-pickeruser-setGlobalPermission");
                    $(pickeruserVisibilityHeader).html($.TemplateRenderer(pickeruserVisibilityHeaderTemplate, sakai));
                    $(pickeruserPermissionSettingsContainer).jqmHide();
                }
            });
        }, false);
    };

    var addBinding = function() {
        $(window).bind("sakai-contentprofile-ready", function(){
            render();
        });

        $(pickeruser_init_search).live("click", function() {
            var currentSelections = getSelectedList();
            $(window).trigger("sakai-pickeradvanced-init", {"list":currentSelections.list, "config": {"type": pickerData["type"]}});
        });

        $(pickeruser_dont_share_button).live("click", function() {
            reset();
        });

        $(pickeruser_close_button).live("click", function(){
            reset();
            $(window).trigger("sakai-pickeruser-close");
            $pickeruser_container.jqmHide();
        });

        $(pickeruserChangeGlobalPermissions).live("click", function(){
            $(pickeruserPermissionSettingsContainer).jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 3100
            });

            $(pickeruserPermissionSettingsContainerContent).html($.TemplateRenderer(pickeruserPermissionSettingsTemplate, sakai.content_profile.content_data));
            $(pickeruserPermissionSettingsContainer).jqmShow();

            $(pickeruserPermissionSettingsDontSave).bind("click", function(){
                $(pickeruserPermissionSettingsContainer).jqmHide();
            });

            $(pickeruserPermissionSettingsSave).bind("click", function(){
                setGlobalPermission();
            });

        });

        $(pickeruserMessageLink).live("click", function(){
            sakai.sendmessage.initialise(null, true, false, null, sakai.data.me.profile.basic.elements.firstName.value + " " + sakai.data.me.profile.basic.elements.lastName.value + " " + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "WANTS_TO_SHARE"), sakai.data.me.profile.basic.elements.firstName.value + " " + sakai.data.me.profile.basic.elements.lastName.value + " " + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "WANTS_TO_SHARE") + "\n\n" + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "DOCUMENT_NAME") + ": \"" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"\n" + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "DOCUMENT_TYPE") + ": " + sakai.content_profile.content_data.data["jcr:content"]["jcr:mimeType"] + "\n" + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "LINK") + ": " + window.location);
        });

        $(pickeruserEmailLink).live("click", function(){
            location.href = "mailto:?subject=" + sakai.data.me.profile.basic.elements.firstName.value + " " + sakai.data.me.profile.basic.elements.lastName.value + " " + sakai.api.i18n.Widgets.getValueForKey("pickeruser","","WANTS_TO_SHARE") + "&body=" + sakai.data.me.profile.basic.elements.firstName.value + " " + sakai.data.me.profile.basic.elements.lastName.value + " " + sakai.api.i18n.Widgets.getValueForKey("pickeruser","","WANTS_TO_SHARE") + "%0A%0A" + sakai.api.i18n.Widgets.getValueForKey("pickeruser","","DOCUMENT_NAME") +
            ": \"" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\";%0A" + sakai.api.i18n.Widgets.getValueForKey("pickeruser","","DOCUMENT_TYPE") + ": " + sakai.content_profile.content_data.data["jcr:content"]["jcr:mimeType"] + "%0A" + sakai.api.i18n.Widgets.getValueForKey("pickeruser","","LINK") + ": " + window.location + "%0A%0A%0A" + sakai.api.i18n.Widgets.getValueForKey("pickeruser","","IF_YOU_DONT_HAVE_AN_ACCOUNT") + window.location.protocol + "//" +
            window.location.host + "/dev/create_new_account.html";
        });

        $(pickeruserLinkInput).live("focus", function(){
            this.select();
        });

        $(".pickeruser_remove").live("click", function(){
            removeMembers(this.id, $(this).parent().parent());
        });

        $(pickeruserPermissionsLink).live("click", function(){
            pickeruserSelectedSharer = "";
            $.each($(this)[0].classList, function(i, val){
                if(val.startsWith("pickeruser_permission_link_")){
                    pickeruserSelectedSharer = val.split("pickeruser_permission_link_")[1];
                }
            });
            pickeruserEditPermissionsLink = $("#pickeruser_edit_permission");
            pickeruserEditPermissionsLink.css("width", $(this).width() + 11);
            pickeruserEditPermissionsLink.css("left",$(this).position().left + 2 + "px");
            pickeruserEditPermissionsLink.css("top",$(this).position().top + 21 + "px");
            pickeruserEditPermissionsLink.toggle();
        });

        $(pickeruserEditPermissionsLink + " a").live("click", function(){
            $(pickeruserEditPermissionsLink).toggle();
            var changeTo;
            if (pickeruserSelectedSharer !== "") {
                // Change the permissions if the user selected a different one
                $pickeruserSelectedSharerSpan = $(".pickeruser_permission_link_" + pickeruserSelectedSharer + " span");
                changeTo = $(this)[0].id.split("pickeruser_edit_permission_picker_")[1];
            } else {
                $pickeruserSelectedSharerSpan = $(".pickeruser_new_members_permission_link span");
                changeTo = $(this)[0].id.split("pickeruser_edit_permission_picker_")[1];
            }

            if (changeTo === "viewer") {
                if ($pickeruserSelectedSharerSpan.html() !== $(pickeruserCanView).html()) {
                    $pickeruserSelectedSharerSpan.html($(pickeruserCanView).html());
                    if (pickeruserSelectedSharer !== "") {
                        changePermission(pickeruserSelectedSharer, changeTo);
                    } else {
                        $(pickeruserNewMembersPermissions).val("viewer");
                    }
                }
            }
            else {
                if ($pickeruserSelectedSharerSpan.html() !== $(pickeruserCanEdit).html()) {
                    $pickeruserSelectedSharerSpan.html($(pickeruserCanEdit).html());
                    if (pickeruserSelectedSharer !== "") {
                        changePermission(pickeruserSelectedSharer, changeTo);
                    } else {
                        $(pickeruserNewMembersPermissions).val("managers");
                    }
                }
            }
        });
    };

    /**
     * Set up the auto suggest box to enable search suggestions upon typing in the field
     */
    var setupAutoSuggest = function() {
        $(pickeruser_search_query).autoSuggest("",{
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
                                value = data.results[i]["rep:userId"];
                                type = "user";
                            } else if (data.results[i]["sakai:group-id"]) {
                                name = data.results[i]["sakai:group-title"];
                                value = data.results[i]["sakai:group-id"];
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
                $pickeruser_add_button.removeAttr("disabled");
                $(pickeruser_close_button).hide();
                $(pickeruserNewMembersPermissions).show();
                $pickeruser_add_button.show();
                $(pickeruser_dont_share_button).show();
                $(pickeruserMessageNewMembers).show();
            },
            selectionRemoved: function(elem) {
                elem.remove();
                if ($(".as-selection-item").length === 0) {
                    $pickeruser_add_button.attr("disabled", "disabled");
                    $pickeruser_add_button.hide();
                    $(pickeruserNewMembersPermissions).hide();
                    $(pickeruser_dont_share_button).hide();
                    $(pickeruser_close_button).show();
                    $(pickeruserMessageNewMembers).hide();
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
        // send the message if its not empty
        var messageText = $.trim($(pickeruserMessageNewMembers).val());
        if (messageText !== "") {
            sakai.api.Communication.sendMessage(userList.list, sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "I_WANT_TO_SHARE") + " \"" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"", messageText, false, false, false);
        }

        var mode = $(pickeruserNewMembersPermissions).val();
        $(window).trigger("sakai-pickeruser-finished", {"toAdd": userList.list, "toAddNames": userList.toAddNames, "mode": mode});

        $(window).trigger("sakai-pickeruser-addUser", {
            "user": userList,
            "access": mode
        });
    };

    /**
     * Render
     * Renders the people picker
     * @param iConfig {String} Config element for the widget
     * @returns void
     */
    var render = function(iConfig) {
        $pickeruser_add_button.attr("disabled", "disabled");
        clearAutoSuggest();
        // Merge user defined config with defaults
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                pickerData[element] = iConfig[element];
            }
        }

        // bind elements, replace some text
        $pickeruser_i_want_to_share.html(sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "I_WANT_TO_SHARE") + " \"" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"");
        $(pickeruserBasicContainer).html($.TemplateRenderer(pickeruserBasicTemplate, sakai));

        // Inserts the listpeople widget
        sakai.api.Widgets.widgetLoader.insertWidgets(tuid);

        $pickeruser_i_want_to_share.show();

        $(pickeruser_init_search, $rootel).show();

        $pickeruser_container_search.removeClass("no_message");
        $(pickeruser_search_query).focus();
        $pickeruser_add_button.unbind("click");
        $pickeruser_add_button.bind("click", function(){
            addPeople(iConfig);
            //reset form
            reset();
        });

        $pickeruser_add_button.hide();
        $(pickeruser_dont_share_button).hide();
        $(pickeruserNewMembersPermissions).hide();
        $(pickeruser_close_button).show();

        addBinding();
        setupAutoSuggest();
    };

    $pickeruser_container.jqm({
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
          $(pickeruser_search_query).autoSuggest.add_selected_item({"name": name, "value": id}, id);
          $pickeruser_add_button.removeAttr("disabled");
          $(pickeruserNewMembersPermissions).show();
          $(pickeruserMessageNewMembers).show();
          $(pickeruser_close_button).hide();
          $pickeruser_add_button.show();
          $(pickeruser_dont_share_button).show();
      });
      $("input#" + tuid).val('').focus();
    };

    ////////////
    // Events //
    ////////////

    $(window).unbind("sakai-pickeruser-init");
    $(window).bind("sakai-pickeruser-init", function(e, config, callbackFn) {
        $pickeruser_container.jqmShow();
        render(config);
        $(window).unbind("sakai-pickeradvanced-finished");
        $(window).bind("sakai-pickeradvanced-finished", function(e, data) {
            addChoicesFromPickeradvanced(data.toAdd);
        });
        callback = callbackFn;
    });

    // Reset to defaults
    reset();

    // Insert any inline widgets
    sakai.api.Widgets.widgetLoader.insertWidgets(tuid,false);

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code
    $(window).trigger("sakai-pickeruser-ready");
    sakai.pickeruser.isReady = true;

};

sakai.api.Widgets.widgetLoader.informOnLoad("pickeruser");