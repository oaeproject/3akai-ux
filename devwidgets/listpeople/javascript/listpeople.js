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
 * @name sakai.listPeople
 *
 * @description
 * Public functions for the people lister widget
 */
sakai.listPeople = {};

/**
 * @name sakai.listpeople
 *
 * @class listpeople
 *
 * @description
 * People Lister widget<br />
 * This is a general widget which aims to display an arbitriary number of
 * people, loading dynamically if the list is very long.
 * Also this is a first attempt at implementing a general UI component which
 * needs to be part of the frontend API as a widget.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.listpeople = function(tuid, showSettings){

    // Config defaults
    var default_config = {
        "items": 25,
        "selectable": false,
        "sortOn": "lastName",
        "sortOrder": "ascending",
        "function": "getSelection"
    };

    // Create a config object for this instance
    sakai.config.widgets.listpeople = sakai.config.widgets.listpeople || {};
    sakai.config.widgets.listpeople[tuid] = default_config;

    // Create data object for this instance
    sakai.data.listpeople = sakai.data.listpeople || {};
    sakai.data.listpeople[tuid] = {};
    sakai.data.listpeople[tuid].userList = {};
    sakai.data.listpeople[tuid].total = 0;
    sakai.data.listpeople[tuid].selected = {};
    sakai.data.listpeople[tuid].currentElementCount = 0;
    sakai.data.listpeople[tuid].selectCount = 0;

    // Reset to defaults
    sakai.listPeople.reset(tuid);

    // Send out an event that says the widget is ready to
    // accept a search query to process and display. This event can be picked up
    // in a page JS code
    $(window).trigger("listpeople_ready", [tuid]);
};


/**
 * Reset
 * Resets the people lister to a default state
 * @param tuid {String} Unique id of the widget
 * @returns void
 */
sakai.listPeople.reset = function(tuid) {

    $("#" + tuid + " .listpeople_content").html("");
    $("#" + tuid + " .listpeople_count").html("0");
    $("#" + tuid + " .listpeople_count_items").show();
    $("#" + tuid + " .listpeople_count_of").hide();
    $("#" + tuid + " .listpeople_count_total").hide();
    $("#" + tuid + " .listpeople_count_selected").hide();
    $("#" + tuid + " .listpeople_content").unbind("scroll");
    $("#" + tuid + " .listpeople_sort_order").unbind("click");
    sakai.data.listpeople[tuid].selected = {};
    sakai.data.listpeople[tuid].currentElementCount = 0;
    sakai.data.listpeople[tuid].selectCount = 0;

};

/**
 * Render
 * Renders the people lister with a specified set of data. The function uses
 * a search query initially, then does the paginating and subsequent requests
 * for data automatically
 * @param tuid {String} Unique id of the widget
 * @param iConfig {Object} Optional config overrides
 * @param url {String} URL to request data from
 * @param id {String} Unique id related to the data we're listing
 * @returns void
 */
sakai.listPeople.render = function(tuid, iConfig, url, id) {

    sakai.listPeople.reset(tuid);

    // Init
    var $pl_container = $("#" + tuid + " .listpeople_content");

    // Merge user defined config with defaults
    for (var element in iConfig) {
        if (iConfig.hasOwnProperty(element)) {
            sakai.config.widgets.listpeople[tuid][element] = iConfig[element];
        }
    }

    // get data
    $.ajax({
        url: url,
        success: function(data){
            if (typeof(data) === 'string') {
                data = $.parseJSON(data);

                var json_data = {
                    "results" : data,
                    "total" : itemCount
                };
            } else {
                var json_data = data;
            }

            // if we're loading authorizables for a content profile we need to check down a level for either viewers or managers
            if (json_data.results[tuid]) {
                json_data.results = json_data.results[tuid];
            }

            if (json_data) {
                var itemCount = 0;

                // filter out the manager group if we're listing items for a group, the everyone group and the anonymous user
                json_data.results = $.grep(json_data.results, function(resultObject, index){
                        if ((resultObject['groupid'] !== id + '-managers') && (resultObject['groupid'] !== 'everyone') && (resultObject['userid'] !== 'everyone') && (resultObject['userid'] !== 'anonymous')) {
                            itemCount++;
                            return true;
                        }
                        return false;
                });

                json_data.total = itemCount;

                // Render list of objects
                sakai.listPeople.renderList(tuid, 0, json_data);
            };
        }
    });

    /*if(!$.isEmptyObject(objects)){
        // Render list of objects
        sakai.listPeople.renderList(tuid, 0, objects);
    }*/
};


/**
 * renderList
 * Renders the list of objects the user can select from
 * @param tuid {String} The instance ID of a widget
 * @pageNumber {Int} The page we want to load
 * @objects {Object} An object containing the elements to list
 * @returns void
 */
sakai.listPeople.renderList = function(tuid, pageNumber, objects) {

    sakai.data.listpeople[tuid].userList = {};
    sakai.data.listpeople[tuid].total = 0;
    var rawData = objects;

    // main container
    var $pl_pageContainer = $("<ul id=\"listpeople_page_" + pageNumber + "\" class=\"listpeople_page loadinganim\"></ul>");
    var $pl_container = $("#" + tuid + " .listpeople_content");

    // Display empty new container with loading anim
    $pl_container.append($pl_pageContainer);

    sakai.listPeople.addToList(tuid, rawData);

    var json_data = {
        "userList" : sakai.data.listpeople[tuid].userList,
        "selectable" : sakai.config.widgets.listpeople[tuid].selectable
    };

    // Render the results data template
    var pageHTML = $.TemplateRenderer("#" + tuid + " .listpeople_content_pagetemplate", json_data);

    // Display count of items
    $("#" + tuid + " .listpeople_count").html(sakai.data.listpeople[tuid].total);

    // Remove loading animation
    $pl_pageContainer.removeClass("loadinganim");

    // Inject results into DOM
    $pl_pageContainer.html(pageHTML);

    // Wire item selection
    if (sakai.config.widgets.listpeople[tuid].selectable) {

        $("#" + tuid + " .listpeople_page" + " li").addClass("selectable");
        $("#" + tuid + " #listpeople_page_" + pageNumber + " li").bind("click", function(e){
            // Check if user click on top of a link
            if (e.target.tagName.toLowerCase() !== "a") {
                // Remove from selected list
                if ($(this).hasClass("listpeople_selected")) {
                    $(this).removeClass("listpeople_selected");
                    $(this).children("input").attr('checked', false);
                    delete sakai.data.listpeople[tuid]["selected"][$(this).attr("id")];
                    sakai.data.listpeople[tuid].selectCount -= 1;
                } else {
                    // Add to selected list
                    $(this).addClass("listpeople_selected");
                    $(this).children("input").attr('checked', true);
                    sakai.data.listpeople[tuid].selectCount += 1;

                    for (var i = 0; i < sakai.data.listpeople[tuid].total; i++) {
                        if (sakai.data.listpeople[tuid].userList[$(this).attr("id")]['rep:userId'] == [$(this).attr("id")] || sakai.data.listpeople[tuid].userList[$(this).attr("id")]['userid'] == [$(this).attr("id")] || sakai.data.listpeople[tuid].userList[$(this).attr("id")]['groupid'] == [$(this).attr("id")] || sakai.data.listpeople[tuid].userList[$(this).attr("id")]['content_id'] == [$(this).attr("id")]) {
                            sakai.data.listpeople[tuid]["selected"][$(this).attr("id")] = sakai.data.listpeople[tuid].userList[$(this).attr("id")];
                        }
                    }
                }
            }
            $("#" + tuid + " .listpeople_count_items").hide();
            $("#" + tuid + " .listpeople_count_of").show();
            $("#" + tuid + " .listpeople_count_total").show();
            $("#" + tuid + " .listpeople_count_selected").show();
            $("#" + tuid + " .listpeople_page" + " li").addClass("selectable");
            $("#" + tuid + " .listpeople_count").html(sakai.data.listpeople[tuid].selectCount);
        });
    }

    //Update known total amount of displayed elements
    sakai.data.listpeople[tuid].currentElementCount += sakai.data.listpeople[tuid].total;

    //Set search result count
    // If we know the exact total display it
    $("#" + tuid + " .listpeople_count_total").html(sakai.data.listpeople[tuid].total);

    // Wire sorting select dropdown
    $("#" + tuid + " .listpeople_sort_order").bind("click", function(e){
        var sortOrder = $("#" + tuid + " #listpeople_sort_order").val();
        sakai.listPeople.sortList(tuid, pageNumber, sortOrder);
    });

    // sort list
    sakai.listPeople.sortList(tuid, pageNumber, sakai.config.widgets.listpeople[tuid].sortOrder);
};


/**
 * sortList
 * Returns an array of selected items
 * @param tuid {String} The instance ID of a widget
 * @param pageNumber {String} Number of the page to sort
 * @param sortOrder {String} Order to sort the list by
 * @returns void
 */
sakai.listPeople.sortList = function(tuid, pageNumber, sortOrder) {
    var mylist = $("#" + tuid + " #listpeople_page_" + pageNumber);
    var listitems = mylist.children('li').get();
    listitems.sort(function(a, b) {
        var compA = $(a).text().toUpperCase();
        var compB = $(b).text().toUpperCase();
        if (sortOrder === 'ascending') {
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        }
        return (compB < compA) ? -1 : (compB > compA) ? 1 : 0;
    });
    $.each(listitems, function(idx, itm) { mylist.append(itm); });
};


/**
 * getSelection
 * Returns an array of selected items
 * @param tuid {String} The instance ID of a widget
 * @returns array
 */
sakai.listPeople.getSelection = function(tuid) {
    return sakai.data.listpeople[tuid]["selected"];
};


/**
 * addToList
 * Takes an object/array of users and adds them to the list to be rendered.
 * @param tuid {String} The instance ID of a widget
 * @param object {Object} The object of users to add
 * @returns viod
 */
sakai.listPeople.addToList = function(tuid, object) {
    if(!$.isEmptyObject(object)){
        // Get display name and subName for each user or group and add to the list object. This should also filter out the anonymous user
        $.each(object.results, function(index, resultObject) {
            var iSubNameInfoGroup = sakai.config.widgets.listpeople[tuid]["subNameInfoGroup"];
            var iSubNameInfoUser = sakai.config.widgets.listpeople[tuid]["subNameInfoUser"];
            var iSubNameInfoContent = Widgets.widgets.listpeople.subNameInfoContent;
            if (resultObject.userid) {
                // get user details
                sakai.data.listpeople[tuid].userList[resultObject.userid] = resultObject
                sakai.data.listpeople[tuid].total += 1
                if (sakai.api.User.getDisplayName(resultObject)) {
                    sakai.data.listpeople[tuid].userList[resultObject.userid]["displayName"] = sakai.api.User.getDisplayName(resultObject);
                } else if (resultObject["firstName"] && resultObject["lastName"]) {
                    sakai.data.listpeople[tuid].userList[resultObject.userid]["displayName"] = resultObject["firstName"] + ' ' + resultObject["lastName"];
                } else {
                    sakai.data.listpeople[tuid].userList[resultObject.userid]["displayName"] = resultObject.userid;
                }
                if (!sakai.data.listpeople[tuid].userList[resultObject.userid]["subNameInfo"]) {
                    sakai.data.listpeople[tuid].userList[resultObject.userid]["subNameInfo"] = resultObject[iSubNameInfoUser]
                }
            } else if (resultObject.groupid) {
                // get group details
                sakai.data.listpeople[tuid].userList[resultObject.groupid] = resultObject
                sakai.data.listpeople[tuid].total += 1
                if (!sakai.data.listpeople[tuid].userList[resultObject.groupid]["subNameInfo"]) {
                    sakai.data.listpeople[tuid].userList[resultObject.groupid]["subNameInfo"] = resultObject[iSubNameInfoGroup];
                }
            } else if (sakai.api.User.getDisplayName(resultObject) && resultObject['rep:userId']) {
                // get user details
                sakai.data.listpeople[tuid].userList[resultObject['rep:userId']] = resultObject
                sakai.data.listpeople[tuid].userList[resultObject['rep:userId']]["displayName"] = sakai.api.User.getDisplayName(resultObject);
                if (!sakai.data.listpeople[tuid].userList[resultObject['rep:userId']]["subNameInfo"]) {
                    sakai.data.listpeople[tuid].userList[resultObject['rep:userId']]["subNameInfo"] = resultObject[iSubNameInfoUser]
                }
                sakai.data.listpeople[tuid].total += 1
            } else if (resultObject["jcr:primaryType"] === "sakai:pooled-content") {
                // get content details
                if (!resultObject["jcr:name"] && resultObject["content_id"]) {
                    resultObject["jcr:name"] = resultObject["content_id"];
                }

                var content_path = '/p/' + resultObject["jcr:name"];

                $.ajax({
                    url: sakai.config.SakaiDomain + content_path + ".2.json",
                    async: false,
                    success: function(data){

                        sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]] = data
                        sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]['content_id'] = resultObject["jcr:name"];
                        sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]['url'] = sakai.config.SakaiDomain + content_path;
                        sakai.data.listpeople[tuid].total += 1
                        if (sakai.config.MimeTypes[data["jcr:content"]["jcr:mimeType"]]) {
                            sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]['avatar'] = sakai.config.MimeTypes[data["jcr:content"]["jcr:mimeType"]].URL;
                            sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]['mimeTypeDescripton'] = sakai.config.MimeTypes[data["jcr:content"]["jcr:mimeType"]].description;
                        } else {
                            sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]['avatar'] = "/dev/_images/mimetypes/empty.png";
                            sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]['mimeTypeDescripton'] = sakai.config.MimeTypes.other.description;
                        }
                        if (!sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]["subNameInfo"]) {
                            sakai.data.listpeople[tuid].userList[resultObject["jcr:name"]]["subNameInfo"] = data[iSubNameInfoContent];
                        }
                    }
                });
            }
        });
    }
};


/**
 * removeFromList
 * Removes selected items from the list and re-renders list
 * @param tuid {String} The instance ID of a widget
 * @returns viod
 */
sakai.listPeople.removeFromList = function(tuid) {
    $.each(sakai.data.listpeople[tuid]["selected"], function(index, resultObject) {
        delete sakai.data.listpeople[tuid].userList[index];
    });
    var tempList = {};
    tempList.results = sakai.data.listpeople[tuid].userList;

    sakai.listPeople.reset(tuid);

    if(!$.isEmptyObject(tempList)){
        // Re-render list of objects
        sakai.listPeople.renderList(tuid, 0, tempList);
    }
};

sakai.api.Widgets.widgetLoader.informOnLoad("listpeople");
