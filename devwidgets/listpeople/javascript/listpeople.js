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
sakai.listpeople = sakai.listpeople || {};

sakai.listpeople = function(tuid, showSettings){

    // DOM Selectors
    var $rootel = $("#"+tuid);
    var $listpeople_container = $(".listpeople_content", $rootel);
    var $listpeople_content = $(".listpeople_content", $rootel);
    var $listpeople_count = $(".listpeople_count", $rootel);
    var $listpeople_count_items = $(".listpeople_count_items", $rootel);
    var $listpeople_count_of = $(".listpeople_count_of", $rootel);
    var $listpeople_count_total = $(".listpeople_count_total", $rootel);
    var $listpeople_count_selected = $(".listpeople_count_selected", $rootel);
    var $listpeople_sort_order = $("#listpeople_sort_order", $rootel);

    // Template Selectors
    var $listpeople_content_pagetemplate = $(".listpeople_content_pagetemplate", $rootel);

    // Variables


    /**
     * Reset
     * Resets the people lister to a default state
     * @returns void
     */
    var reset = function() {
        $listpeople_content.html("");
        $listpeople_count.html("0");
        $listpeople_count_items.show();
        $listpeople_count_of.hide();
        $listpeople_count_total.hide();
        $listpeople_count_selected.hide();
        $listpeople_content.unbind("scroll");
        $listpeople_sort_order.unbind("click");
        sakai.listpeople.data[tuid].selected = {};
        sakai.listpeople.data[tuid].currentElementCount = 0;
        sakai.listpeople.data[tuid].selectCount = 0;
    };

    /**
     * Render
     * Renders the people lister with a specified set of data. The function uses
     * a search query initially, then does the paginating and subsequent requests
     * for data automatically
     * @param iConfig {Object} Optional sakai.listpeople.config[tuid] overrides
     * @param url {String} URL to request data from
     * @param id {String} Unique id related to the data we're listing
     * @returns void
     */
    var render = function(iTuid, iConfig, url, id) {
        if (iTuid !== tuid) return;
        reset();

        // Merge user defined sakai.listpeople.config[tuid] with defaults
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element)) {
                sakai.listpeople.config[tuid][element] = iConfig[element];
            }
        }

        // get data
        $.ajax({
            url: url,
            success: function(data){
                var json_data;
                if (typeof(data) === 'string') {
                    data = $.parseJSON(data);

                    // Variable to check if the logged in user is a manager of the file or not
                    // If not we handel him like an anonymous user (not giving any editting possibilities in the UX)
                    if (data.managers.length !== 0) {
                        for (var i in data.managers) {
                            if (data.managers[i]["rep:userId"] === sakai.data.me.user.userid) {
                                sakai.listpeople.config[tuid].anon = false;
                                break;
                            }
                            else {
                                sakai.listpeople.config[tuid].anon = true;
                            }
                        }
                    }
                    else {
                        sakai.listpeople.config[tuid].anon = true;
                    }

                    // Check to set the buttons visible or invisible according to logged in user
                    if (!sakai.listpeople.config[tuid].anon) {
                        $(".content_profile_list_buttons").show();
                    }

                    json_data = {
                        "results" : data,
                        "total" : itemCount
                    };
                } else if (!data.results) {
                    json_data = {
                        "results" : data,
                        "total" : itemCount
                    };
                } else {
                    json_data = data;
                }

                // if we're loading authorizables for a content profile we need to check down a level for either viewers or managers

                if (json_data.results[tuid]) {
                    json_data.results = json_data.results[tuid];
                }

                if (json_data) {
                    var itemCount = 0;

                    // filter out the manager group if we're listing items for a group, the everyone group and the anonymous user
                    json_data.results = $.grep(json_data.results, function(resultObject, index){
                            if (resultObject['groupid'] !== id + '-managers' &&
                                resultObject['groupid'] !== 'everyone' &&
                                resultObject['rep:userId'] !== 'everyone' &&
                                resultObject['rep:userId'] !== 'anonymous') {

                                itemCount++;
                                return true;
                            }
                            return false;
                    });

                    json_data.total = itemCount;

                    // Render list of objects
                    renderList(0, json_data);
                };
            }
        });

        /*if(!$.isEmptyObject(objects)){
            // Render list of objects
            renderList(0, objects);
        }*/
    };


    /**
     * renderList
     * Renders the list of objects the user can select from
     * @pageNumber {Int} The page we want to load
     * @objects {Object} An object containing the elements to list
     * @returns void
     */
    var renderList = function(pageNumber, objects) {

        sakai.listpeople.data[tuid].userList = {};
        sakai.listpeople.data[tuid].total = 0;
        var rawData = objects;

        // main container
        var $listpeople_page_container = $("<ul id=\"listpeople_page_" + pageNumber + "\" class=\"listpeople_page loadinganim\"></ul>");

        // Display empty new container with loading anim
        $listpeople_container.append($listpeople_page_container);

        addToList(rawData);

        var json_data = {
            "userList" : sakai.listpeople.data[tuid].userList,
            "selectable" : sakai.listpeople.config[tuid].selectable
        };

        // Override selectable property if needed
        // This should be overridden when a user is not a manager of the content and set to false
        if (sakai.listpeople.config[tuid].anon){
            json_data.selectable = false;
        }

        // Render the results data template
        var pageHTML = $.TemplateRenderer($listpeople_content_pagetemplate, json_data);

        // Display count of items
        $listpeople_count.html(sakai.listpeople.data[tuid].total);

        // Remove loading animation
        $listpeople_page_container.removeClass("loadinganim");

        // Inject results into DOM
        $listpeople_page_container.html(pageHTML);

        // Wire item selection
        if (sakai.listpeople.config[tuid].selectable) {

            $(".listpeople_page" + " li", $rootel).addClass("selectable");
            $("#listpeople_page_" + pageNumber + " li", $rootel).bind("click", function(e){
                // Check if user click on top of a link
                if (e.target.tagName.toLowerCase() !== "a") {
                    // Remove from selected list
                    if ($(this).hasClass("listpeople_selected")) {
                        $(this).removeClass("listpeople_selected");
                        $(this).children("input").attr('checked', false);
                        delete sakai.listpeople.data[tuid]["selected"][$(this).attr("id")];
                        sakai.listpeople.data[tuid].selectCount -= 1;
                    } else {
                        // Add to selected list
                        $(this).addClass("listpeople_selected");
                        $(this).children("input").attr('checked', true);
                        sakai.listpeople.data[tuid].selectCount += 1;

                        for (var i = 0; i < sakai.listpeople.data[tuid].total; i++) {
                            if (sakai.listpeople.data[tuid].userList[$(this).attr("id")]['rep:userId'] == [$(this).attr("id")] || sakai.listpeople.data[tuid].userList[$(this).attr("id")]['userid'] == [$(this).attr("id")] || sakai.listpeople.data[tuid].userList[$(this).attr("id")]['groupid'] == [$(this).attr("id")] || sakai.listpeople.data[tuid].userList[$(this).attr("id")]['content_id'] == [$(this).attr("id")]) {
                                sakai.listpeople.data[tuid]["selected"][$(this).attr("id")] = sakai.listpeople.data[tuid].userList[$(this).attr("id")];
                            }
                        }
                    }
                }
                $listpeople_count_items.hide();
                $listpeople_count_of.show();
                $listpeople_count_total.show();
                $listpeople_count_selected.show();
                $(".listpeople_page" + " li", $rootel).addClass("selectable");
                $listpeople_count.html(sakai.listpeople.data[tuid].selectCount);
            });
        }

        //Update known total amount of displayed elements
        sakai.listpeople.data[tuid].currentElementCount += sakai.listpeople.data[tuid].total;

        //Set search result count
        // If we know the exact total display it
        $listpeople_count_total.html(sakai.listpeople.data[tuid].total);

        // Wire sorting select dropdown
        $listpeople_sort_order.bind("click", function(e){
            var sortOrder = $listpeople_sort_order.val();
            sortList(pageNumber, sortOrder);
        });

        // sort list
        sortList(pageNumber, sakai.listpeople.config[tuid].sortOrder);
    };


    /**
     * sortList
     * Returns an array of selected items
     * @param tuid {String} The instance ID of a widget
     * @param pageNumber {String} Number of the page to sort
     * @param sortOrder {String} Order to sort the list by
     * @returns void
     */
    var sortList = function(pageNumber, sortOrder) {
        var mylist = $("#listpeople_page_" + pageNumber, $rootel);
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
     * @returns array
     */
    sakai.listpeople.getSelection = function(tuid) {
        return sakai.listpeople.data[tuid]["selected"];
    };


    /**
     * addToList
     * Takes an object/array of users and adds them to the list to be rendered.
     * @param object {Object} The object of users to add
     * @returns viod
     */
    var addToList = function(object) {

        if(!$.isEmptyObject(object)){
            // Get display name and subName for each user or group and add to the list object. This should also filter out the anonymous user
            $.each(object.results, function(index, resultObject) {
                var iSubNameInfoGroup = sakai.listpeople.config[tuid]["subNameInfoGroup"];
                var iSubNameInfoUser = sakai.listpeople.config[tuid]["subNameInfoUser"];
                var iSubNameInfoContent = Widgets.widgets.listpeople.subNameInfoContent;
                if (resultObject.userid) {
                    // get user details
                    sakai.listpeople.data[tuid].userList[resultObject.userid] = resultObject;
                    sakai.listpeople.data[tuid].total += 1;
                    if (sakai.api.User.getDisplayName(resultObject)) {
                        sakai.listpeople.data[tuid].userList[resultObject.userid]["displayName"] = sakai.api.User.getDisplayName(resultObject);
                    } else if (resultObject["firstName"] && resultObject["lastName"]) {
                        sakai.listpeople.data[tuid].userList[resultObject.userid]["displayName"] = resultObject["firstName"] + ' ' + resultObject["lastName"];
                    } else {
                        sakai.listpeople.data[tuid].userList[resultObject.userid]["displayName"] = resultObject.userid;
                    }
                    if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                        sakai.listpeople.data[tuid].userList[resultObject.userid]["picture"] = $.parseJSON(resultObject.picture);
                    }
                    if (!sakai.listpeople.data[tuid].userList[resultObject.userid]["subNameInfo"]) {
                        sakai.listpeople.data[tuid].userList[resultObject.userid]["subNameInfo"] = resultObject[iSubNameInfoUser];
                    }
                } else if (resultObject.groupid) {
                    // get group details
                    sakai.listpeople.data[tuid].userList[resultObject.groupid] = resultObject;
                    sakai.listpeople.data[tuid].total += 1;
                    if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                        sakai.listpeople.data[tuid].userList[resultObject.userid]["picture"] = $.parseJSON(resultObject.picture);
                    }
                    if (!sakai.listpeople.data[tuid].userList[resultObject.groupid]["subNameInfo"]) {
                        sakai.listpeople.data[tuid].userList[resultObject.groupid]["subNameInfo"] = resultObject[iSubNameInfoGroup];
                    }
                } else if (resultObject['sakai:group-id']) {
                    // get group details
                    sakai.listpeople.data[tuid].userList[resultObject['sakai:group-id']] = resultObject;
                    sakai.listpeople.data[tuid].total += 1;
                    if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                        sakai.listpeople.data[tuid].userList[resultObject['sakai:group-id']]["picture"] = $.parseJSON(resultObject.picture);
                    }
                    if (!sakai.listpeople.data[tuid].userList[resultObject['sakai:group-id']]["subNameInfo"]) {
                        sakai.listpeople.data[tuid].userList[resultObject['sakai:group-id']]["subNameInfo"] = resultObject[iSubNameInfoGroup];
                    }
                } else if (sakai.api.User.getDisplayName(resultObject) && resultObject['rep:userId']) {
                    // get user details
                    sakai.listpeople.data[tuid].userList[resultObject['rep:userId']] = resultObject;
                    sakai.listpeople.data[tuid].userList[resultObject['rep:userId']]["displayName"] = sakai.api.User.getDisplayName(resultObject);
                    if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                        sakai.listpeople.data[tuid].userList[resultObject['rep:userId']]["picture"] = $.parseJSON(resultObject.picture);
                    }
                    if (!sakai.listpeople.data[tuid].userList[resultObject['rep:userId']]["subNameInfo"]) {
                        sakai.listpeople.data[tuid].userList[resultObject['rep:userId']]["subNameInfo"] = resultObject[iSubNameInfoUser];
                    }
                    sakai.listpeople.data[tuid].total += 1;
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

                            sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]] = data;
                            sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]['content_id'] = resultObject["jcr:name"];
                            sakai.listpeople.data[tuid].total += 1;
                            if (sakai.config.MimeTypes[data["jcr:content"]["jcr:mimeType"]]) {
                                sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]['avatar'] = sakai.config.MimeTypes[data["jcr:content"]["jcr:mimeType"]].URL;
                                sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]['mimeTypeDescripton'] = sakai.config.MimeTypes[data["jcr:content"]["jcr:mimeType"]].description;
                            } else {
                                sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]['avatar'] = "/dev/_images/mimetypes/empty.png";
                                sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]['mimeTypeDescripton'] = sakai.config.MimeTypes.other.description;
                            }
                            if (!sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]["subNameInfo"]) {
                                sakai.listpeople.data[tuid].userList[resultObject["jcr:name"]]["subNameInfo"] = data[iSubNameInfoContent];
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
     * @returns viod
     */
    sakai.listpeople.removeFromList = function() {
        $.each(sakai.listpeople.data[tuid]["selected"], function(index, resultObject) {
            delete sakai.listpeople.data[tuid].userList[index];
        });
        var tempList = {};
        tempList.results = sakai.listpeople.data[tuid].userList;

        reset();

        if(!$.isEmptyObject(tempList)){
            // Re-render list of objects
            renderList(0, tempList);
        }
    };

    var init = function() {
        sakai.listpeople.data = sakai.listpeople.data || {};
        sakai.listpeople.data[tuid] = {
            "selected": {},
            "currentElementCount": 0,
            "selectCount": 0,
            "total": 0,
            "userList": {}
        };

        sakai.listpeople.config = sakai.listpeople.config || {};
        sakai.listpeople.config[tuid] = {
            "items": 25,
            "selectable": false,
            "sortOn": "lastName",
            "sortOrder": "ascending",
            "function": "getSelection",
            "anon": false
        };

        // Reset to defaults
        reset();

        // Send out an event that says the widget is ready to
        // accept a search query to process and display. This event can be picked up
        // in a page JS code
        $(window).trigger("sakai-listpeople-ready", tuid);
        sakai.listpeople.isReady = true;
    };

    $(window).bind("sakai-listpeople-render", function(e, data) {
        render(data.tuid, data.pl_config, data.url, data.id);
    });

    init();

};

sakai.api.Widgets.widgetLoader.informOnLoad("listpeople");
