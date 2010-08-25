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

/*global $, Config */

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

    var $pickeruser_container = $("#pickeruser_container", $rootel);
    var $pickeruser_content_search = $("#pickeruser_content_search", $rootel);
    var $pickeruser_search_query = $("#pickeruser_search_query", $rootel);
    var $pickeruser_search_button = $("#pickeruser_search_button", $rootel);
    var $pickeruser_close_button = $("#pickeruser_close_button", $rootel);
    var $pickeruser_select_all_button = $("#pickeruser_select_all_button", $rootel);
    var $pickeruser_content_search_form = $("#pickeruser_content_search_form", $rootel);
    var $pickeruser_add_button = $("#pickeruser_add_button", $rootel);
    var $pickeruser_sort_on = $("#pickeruser_sort_on", $rootel);
    var $pickeruser_count = $("#pickeruser_count", $rootel);
    var $pickeruser_count_person = $("#pickeruser_count_person", $rootel);
    var $pickeruser_count_people = $("#pickeruser_count_people", $rootel);
    var $pickeruser_count_of = $("#pickeruser_count_of", $rootel);
    var $pickeruser_count_thousands = $("#pickeruser_count_thousands", $rootel);
    var $pickeruser_add_header_what = $("#pickeruser_add_header_what", $rootel);
    var $pickeruser_add_header_where = $("#pickeruser_add_header_where", $rootel);
    var $pickeruser_copy_myself = $("#pickeruser_copy_myself", $rootel);
    var $pickeruser_message = $("#pickeruser_message", $rootel);
    var $pickeruser_init_search = $("#pickeruser_init_search", $rootel);
    var $pickeruser_people_text = $("#pickeruser_people_text", $rootel);
    var $pickeruser_content_text = $("#pickeruser_content_text", $rootel);
    var $pickeruser_instruction = $("#pickeruser_instruction", $rootel);
    var $pickeruser_send_message = $("#pickeruser_send_message", $rootel);
    var $pickeruser_init_search = $("#pickeruser_init_search", $rootel);

    var $pickeruser_error_template = $("#pickeruser_error_template", $rootel);
    var $pickeruser_content_search_pagetemplate = $("#pickeruser_content_search_pagetemplate", $rootel);
    var $pickeruser_content_search_listtemplate = $("#pickeruser_content_search_listtemplate", $rootel);

    var pickeruser_page = ".pickeruser_page";

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
      "sortOn": "lastName",
      "sortOrder": "ascending",
      "what": "People",
      "where": "Group"
    };

    /**
     * Reset
     * Resets the people picker to a default state
     * @returns void
     */
    var reset = function() {
        $pickeruser_content_search.html("");
        $pickeruser_content_search.unbind("scroll");
        pickerData.selected = {};
        pickerData.currentElementCount = 0;
        pickerData.selectCount = 0;
        clearAutoSuggest();
    };

    /**
     * Render
     * Renders the people picker
     * @param iConfig {String} Config element for the widget
     * @returns void
     */
    var render = function(iConfig) {

        clearAutoSuggest();
        // Merge user defined config with defaults
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                pickerData[element] = iConfig[element];
            }
        }

        // bind elements, replace some text
        if (pickerData.type === 'content') {
            $pickeruser_instruction.html($pickeruser_content_text.html());
            $pickeruser_send_message.hide();
            $pickeruser_init_search.hide();
        } else {
            $pickeruser_instruction.html($pickeruser_people_text.html());
            $pickeruser_send_message.show();
            $pickeruser_init_search.show();
        }

        $pickeruser_add_header_what.html(pickerData.what);
        $pickeruser_add_header_where.html(pickerData.where);
        $pickeruser_search_query.focus();
        $pickeruser_add_button.unbind("click");
        $pickeruser_add_button.bind("click", function(){
            addPeople();
        });
    };

    $pickeruser_container.jqm({
        modal: true,
        overlay: 20
    });

    var addPeople = function() {

      var userList = $("#as-values-" + tuid).val();
      // this value is a comma-delimited list
      // split it and get rid of any empty values in the array
      userList = userList.split(",");
      $(userList).each(function(i, val) {
         if (val === "") {
             userList.splice(i, 1);
         }
      });

      // send the message if its not empty
      var messageText = $.trim($pickeruser_message.val());
      if (messageText !== "") {
          var messageList = userList;
          if ($pickeruser_copy_myself.is(':checked')) {
            messageList.push(sakai.data.me.profile["rep:userId"]);
          }
          sakai.api.Communication.sendMessage(messageList, "Subject", messageText);
      }
      $pickeruser_container.jqmHide();
      $(window).trigger("sakai-pickeruser-finished", {"toAdd":userList});
    };

    var clearAutoSuggest = function() {
        $("#as-values-" + tuid).val("");
        $(".as-selection-item").remove();
    };

    var setupAutoSuggest = function() {
        $pickeruser_search_query.autoSuggest("",{
            source: function(query, add) {
                var searchUrl = sakai.config.URL.SEARCH_USERS;
                if (pickerData.type === 'content') {
                    searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
                }
                sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                    if (success) {
                        var suggestions = [];
                        $.each(data.results, function(i) {
                            if (pickerData.type === 'content') {
                                suggestions.push({"value": data.results[i]['jcr:name'], "name": data.results[i]['sakai:pooled-content-file-name']});
                            } else {
                                suggestions.push({"value": data.results[i].user, "name": sakai.api.User.getDisplayName(data.results[i])});
                            }
                        });
                        add(suggestions);
                    } else {

                    }
                }, {"q": "*" + query + "*"});
            },
            asHtmlID: tuid,
            selectedItemProp: "name",
            searchObjProps: "name"
        });
    };
    setupAutoSuggest();
    ////////////
    // Events //
    ////////////

    $(window).unbind("sakai-pickeruser-init");
    $(window).bind("sakai-pickeruser-init", function(e, config, callbackFn) {
        $pickeruser_container.jqmShow();
        render(config);
        callback = callbackFn;
    });

    $pickeruser_init_search.bind("click", function() {
       $(window).trigger("sakai-pickeradvanced-init", null, function(e, users) {
       });
    });

    $pickeruser_close_button.bind("click", function() {
        $pickeruser_container.jqmHide();
        //$("li#as-values-" + tuid).val();
    });

    // Reset to defaults
    reset();

    // Insert any inline widgets
    sakai.api.Widgets.widgetLoader.insertWidgets(tuid,false);

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code

    $(window).trigger("sakai-pickeruser-ready");

};

sakai.api.Widgets.widgetLoader.informOnLoad("pickeruser");