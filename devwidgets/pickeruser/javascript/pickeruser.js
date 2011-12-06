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

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai.pickerUser
     *
     * @description
     * Public functions for the people picker widget
     */
    sakai_global.pickerUser = {};

    /**
     * @name sakai_global.pickeruser
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
    sakai_global.pickeruser = function(tuid, showSettings) {

        var $rootel = $("#" + tuid);

        var $pickeruser_container = $("#pickeruser_container", $rootel);
        var $pickeruser_container_search = $("#pickeruser_container_search", $rootel);
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

        var $pickeruser_error_template = $("#pickeruser_error_template", $rootel);
        var $pickeruser_content_search_pagetemplate = $("#pickeruser_content_search_pagetemplate", $rootel);
        var $pickeruser_content_search_listtemplate = $("#pickeruser_content_search_listtemplate", $rootel);

        var $pickeruser_adding_titles = $(".pickeruser_adding_titles", $rootel);
        var $pickeruser_adding_people = $("#pickeruser_adding_people", $rootel);
        var $pickeruser_adding_files = $("#pickeruser_adding_files", $rootel);

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
          "sortOrder": "asc",
          "what": "People",
          "where": "Group",
          "excludeList": []
        };

        /**
         * Reset
         * Resets the people picker to a default state
         * @returns void
         */
        var reset = function() {
            $pickeruser_content_search.html("");
            $pickeruser_content_search.unbind("scroll");
            $pickeruser_message.val("");
            pickerData.selected = {};
            pickerData.currentElementCount = 0;
            pickerData.selectCount = 0;
            sakai.api.Util.AutoSuggest.reset($pickeruser_search_query);
        };

        /**
         * Render
         * Renders the people picker
         * @param iConfig {String} Config element for the widget
         * @returns void
         */
        var render = function(iConfig) {
            $pickeruser_add_button.attr("disabled", "disabled");
            sakai.api.Util.AutoSuggest.reset($pickeruser_search_query);
            // Merge user defined config with defaults
            for (var element in iConfig) {
                if (iConfig.hasOwnProperty(element) && pickerData.hasOwnProperty(element)) {
                    pickerData[element] = iConfig[element];
                }
            }

            // bind elements, replace some text
            $pickeruser_adding_titles.hide();
            if (pickerData.type === 'content') {
                $pickeruser_instruction.html($pickeruser_content_text.html());
                $pickeruser_send_message.hide();
                $pickeruser_container_search.addClass("no_message");
                $pickeruser_adding_files.show();
            } else {
                $pickeruser_instruction.html($pickeruser_people_text.html());
                $pickeruser_send_message.show();
                $pickeruser_init_search.show();
                $pickeruser_adding_people.show();
                $pickeruser_container_search.removeClass("no_message");
            }

            $pickeruser_add_header_what.html(pickerData.what);
            $pickeruser_add_header_where.html(pickerData.where);
            $pickeruser_search_query.focus();
            $pickeruser_add_button.unbind("click");
            $pickeruser_add_button.bind("click", function(){
                addPeople(iConfig);
                //reset form
                reset();
            });
        };

        $pickeruser_container.jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            zIndex: 3000
        });

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

        var addPeople = function(iConfig) {

          var userList = getSelectedList();

          // send the message if its not empty
          var messageText = $.trim($pickeruser_message.val());
          if (messageText !== "") {
              var messageList = getSelectedList();
              if ($pickeruser_copy_myself.is(':checked')) {
                messageList.push(sakai.data.me.profile["rep:userId"]);
              }
              if (iConfig.URL){
                  messageText = messageText + "\n\n" + "<a href='" + iConfig.URL + "'>" + iConfig.URL + "</a>";
              }
              sakai.api.Communication.sendMessage(messageList, sakai.data.me, sakai.api.Security.saneHTML($("#pickeruser_subject_text").text())+ "," + iConfig.where, messageText);
          }
          $pickeruser_container.jqmHide();
          $(window).trigger("finished.pickeruser.sakai", {"toAdd":userList});
        };

        var dataFn = function( query, add ) {
            var q = sakai.api.Server.createSearchString(query);
            var options = {"page": 0, "items": 15};
            var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS;
            if (pickerData.type === 'content') {
                searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
                if (q === '*' || q === '**') {
                    searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER_ALL;
                }
            } else if (q === '*' || q === '**') {
                searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS_ALL;
            }
            if (q !== '*' && q !== '**') {
                options['q'] = q;
            }
            sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                if (success) {
                    var suggestions = [];
                    var name, value, type;
                    $.each(data.results, function(i) {
                        if (pickerData.type === 'content') {
                            name = data.results[i]['sakai:pooled-content-file-name'];
                            value = data.results[i]['_path'];
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
                            suggestions.push({"value": sakai.api.Security.safeOutput(value), "name": sakai.api.Security.safeOutput(name), "type": sakai.api.Security.safeOutput(type)});
                        }
                    });
                    add( suggestions, query );
                }
            }, options);
        };
        sakai.api.Util.AutoSuggest.setup($pickeruser_search_query,{
            asHtmlID: tuid,
            retrieveLimit: 10,
            resultClick: function(data) {
                $pickeruser_add_button.removeAttr("disabled");
            },
            selectionRemoved: function(elem) {
                elem.remove();
                if ($(".as-selection-item").length === 0) {
                    $pickeruser_add_button.attr("disabled", "disabled");
                }
            },
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
            }
        }, false, dataFn);

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
                  id = val["_path"];
              }
              $pickeruser_search_query.autoSuggest.add_selected_item({"name": name, "value": id}, id);
              $pickeruser_add_button.removeAttr("disabled");
          });
          $("input#" + tuid).val('').focus();
        };

        ////////////
        // Events //
        ////////////

        $(window).unbind("init.pickeruser.sakai");
        $(window).bind("init.pickeruser.sakai", function(e, config, callbackFn) {

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
            $(window).unbind("finished.pickeradvanced.sakai");
            $(window).bind("finished.pickeradvanced.sakai", function(e, data) {
                addChoicesFromPickeradvanced(data.toAdd);
            });
            callback = callbackFn;
        });

        $pickeruser_init_search.bind("click", function() {
            var currentSelections = getSelectedList();
            $(window).trigger("init.pickeradvanced.sakai", {"list":currentSelections, "config": {"type": pickerData["type"]}});
        });

        $pickeruser_close_button.bind("click", function() {
            // reset form.
            reset();
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

        $(window).trigger("ready.pickeruser.sakai");
        sakai_global.pickeruser.isReady = true;

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("pickeruser");
});
