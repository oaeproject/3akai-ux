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

    // Buttons
    var pickeruser_close_button = "#pickeruser_close_button";
    var $pickeruser_add_button = $("#pickeruser_add_button", $rootel);

    // Sharing
    var $pickeruser_i_want_to_share = $("#pickeruser_i_want_to_share", $rootel);
    var $pickeruser_adding_files = $("#pickeruser_adding_files", $rootel);
    var pickeruserEmailLink = "#pickeruser_email_link";
    var pickeruserMessageLink = "#pickeruser_message_link";
    var pickeruserLinkInput = "#pickeruser_share_link input";

    // Search
    var $pickeruser_container_search = $("#pickeruser_container_search", $rootel);
    var pickeruser_search_query = "#pickeruser_search_query";
    var pickeruser_init_search = "#pickeruser_init_search";

    // Containers
    var pickeruserBasicContainer = "#pickeruser_basic_container";
    var $pickeruser_container = $("#pickeruser_container", $rootel);

    // Templates
    var pickeruserBasicTemplate = "pickeruser_basic_template";

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
        return list;
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
        pickerData.selected = {};
        pickerData.currentElementCount = 0;
        pickerData.selectCount = 0;
        clearAutoSuggest();
    };

    /**
     * Executed when the message has been handled
     */
    var messageSent = function(){

    };

    var addMembers = function(){

    };

    var removeMembers = function(selectedUserId, listItem){
        var permission = selectedUserId.split("-")[0];
        var itemArr = [];
        if (permission !== "manager") {
            var item = {
                "url": sakai.content_profile.content_data.path + ".members.json",
                "method": "POST",
                "parameters": {
                    ":viewer@Delete": selectedUserId.substring(selectedUserId.indexOf("-") + 1, selectedUserId.length)
                }
            };
        } else {
            var item = {
                "url": sakai.content_profile.content_data.path + ".members.json",
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
                listItem.remove();
            }
        });
        
    };

    var addBinding = function() {
        $(pickeruser_init_search).live("click", function() {
            var currentSelections = getSelectedList();
            $(window).trigger("sakai-pickeradvanced-init", {"list":currentSelections, "config": {"type": pickerData["type"]}});
        });

        $(pickeruser_close_button).live("click", function() {
            // reset form.
            reset();
            $pickeruser_container.jqmHide();
        });

        $(pickeruserMessageLink).live("click", function(){
            sakai.sendmessage.initialise(null, true, false, messageSent, sakai.data.me.profile.basic.elements.firstName.value + " " + sakai.data.me.profile.basic.elements.lastName.value + " " + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "WANTS_TO_SHARE"), sakai.data.me.profile.basic.elements.firstName.value + " " + sakai.data.me.profile.basic.elements.lastName.value + " " + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "WANTS_TO_SHARE") + "\n\n" + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "DOCUMENT_NAME") + "\"" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"\n" + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "DOCUMENT_TYPE") + ": " + sakai.content_profile.content_data.data["jcr:content"]["jcr:mimeType"] + "\n" + sakai.api.i18n.Widgets.getValueForKey("pickeruser", "", "LINK") + ": " + window.location);
        });

        $(pickeruserLinkInput).live("focus", function(){
            this.select();
        });

        $(".pickeruser_remove a").live("click", function(){
            removeMembers(this.id, $(this).parent().parent().parent());
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
            },
            selectionRemoved: function(elem) {
                elem.remove();
                if ($(".as-selection-item").length === 0) {
                    $pickeruser_add_button.attr("disabled", "disabled");
                }
            }
        });
    };

    /**
     * Add people to the list of picked people
     * @param {Object} iConfig
     */
    var addPeople = function(iConfig) {
      var userList = getSelectedList();
      $pickeruser_container.jqmHide();
      $(window).trigger("sakai-pickeruser-finished", {"toAdd":userList});
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
      });
      $("input#" + tuid).val('').focus();
    };

    ////////////
    // Events //
    ////////////

    $(window).unbind("sakai-pickeruser-init");
    $(window).bind("sakai-pickeruser-init", function(e, config, callbackFn) {

        // position dialog box at users scroll position
        var htmlScrollPos = $("html").scrollTop();
        var docScrollPos = $(document).scrollTop();
        if (htmlScrollPos > 0) {
            $pickeruser_container.css({"top": htmlScrollPos + 50 + "px"});
        } else if (docScrollPos > 0) {
            $pickeruser_container.css({"top": docScrollPos + 50 + "px"});
        }

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