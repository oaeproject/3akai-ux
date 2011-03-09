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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.pager.js (pager)
 */

/*global $ */

// Namespaces
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.listpeople
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
    sakai_global.listpeople = sakai_global.listpeople || {};
    sakai_global.data = sakai_global.data || {};
    sakai_global.data.listpeople = sakai_global.data.listpeople || {};
    sakai_global.config = sakai_global.config || {};
    sakai_global.config.listpeople = sakai_global.config.listpeople || {};

    sakai_global.listpeople = function(tuid, showSettings) {

        var totalResult = 5; // total no. of items display in list
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
        var listType = "";
        
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
            $listpeople_sort_order.unbind("change");

            sakai_global.data.listpeople[listType].selected = {};
            sakai_global.data.listpeople[listType].currentElementCount = 0;
            sakai_global.data.listpeople[listType].selectCount = 0;
        };

        /**
         * Render
         * Renders the people lister with a specified set of data. The function uses
         * a search query initially, then does the paginating and subsequent requests
         * for data automatically
         * @param iConfig {Object} Optional sakai_global.config.listpeople[listType] overrides
         * @param url {String} URL to request data from
         * @param id {String} Unique id related to the data we're listing
         * @returns void
         */
        var render = function(iTuid, iConfig, url, id) {
            if (iTuid !== tuid) { return; }
            reset();

            // Merge user defined sakai_global.config.listpeople[tuid] with defaults
            for (var element in iConfig) {
                if (iConfig.hasOwnProperty(element)) {
                    sakai_global.config.listpeople[listType][element] = iConfig[element];
                }
            }

            if (sakai_global.config.listpeople[listType].items) {
                if (url.indexOf("?", 0) > 0) {
                    url = url + "&items=" + sakai_global.config.listpeople[listType].items;
                } else {
                    url = url + "?items=" + sakai_global.config.listpeople[listType].items;
                }
            }

            // list if items are managers or members
            if (listType === "managers") {
                $listpeople_count_items.html(sakai.api.i18n.Widgets.getValueForKey("listpeople", "", "MANAGERS"));
            } else if (listType === "members") {
                $listpeople_count_items.html(sakai.api.i18n.Widgets.getValueForKey("listpeople", "", "MEMBERS"));
            }

            // get data
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    var json_data = {},
                        itemCount = 0;
                    if (typeof(data) === 'string') {
                        data = $.parseJSON(data);

                        // Variable to check if the logged in user is a manager of the file or not
                        // If not we handel him like an anonymous user (not giving any editting possibilities in the UX)
                        if (typeof sakai.data.me.user.userid !== "undefined") {
                            if (data.managers.length !== 0) {
                                for (var i in data.managers) {
                                    if (data.managers[i]["rep:userId"] === sakai.data.me.user.userid) {
                                        sakai_global.config.listpeople[listType].anon = false;
                                        break;
                                    }
                                    else {
                                        sakai_global.config.listpeople[listType].anon = true;
                                    }
                                }
                            }
                            else {
                                sakai_global.config.listpeople[listType].anon = true;
                            }
                        } else {
                            sakai_global.config.listpeople[listType].anon = true;

                        }

                        // Check to set the buttons visible or invisible according to logged in user
                        if (!sakai_global.config.listpeople[listType].anon) {
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

                    if (json_data.results[listType]) {
                        json_data.results = json_data.results[listType];
                    }

                    if (json_data) {
                        itemCount = 0;

                        // filter out the manager group if we're listing items for a group, the everyone group and the anonymous user
                        json_data.results = $.grep(json_data.results, function(resultObject, index){
                                if (resultObject['sakai:group-id'] !== id + '-managers' &&
                                    resultObject['sakai:group-id'] !== 'everyone' &&
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
                    }
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
            sakai_global.data.listpeople[listType].userList = {};
            sakai_global.data.listpeople[listType].total = 0;
            var rawData = objects;

            // main container
            var uniqueIdentifier = Math.round(Math.random() + 1000);
            var $listpeople_page_container = $("<ul id=\"listpeople_page_" + pageNumber + "\" class=\"listpeople_page loadinganim " + uniqueIdentifier + "\"></ul>");

            // Display empty new container with loading anim
            //$listpeople_container.append($listpeople_page_container);

            addToList(rawData);

            var json_data = {
                "userList" : sakai_global.data.listpeople[listType].userList,
                "selectable" : sakai_global.config.listpeople[listType].selectable
            };

            // Override selectable property if needed
            // This should be overridden when a user is not a manager of the content and set to false
            if (sakai_global.config.listpeople[listType].anon){
                json_data.selectable = false;
            }
            json_data.pageNumber = pageNumber;

            // Render the results data template
            var pageHTML = sakai.api.Util.TemplateRenderer($listpeople_content_pagetemplate, json_data);

            // Display count of items
            $listpeople_count.html(sakai_global.data.listpeople[listType].total);

            // Remove loading animation
            //$listpeople_page_container.removeClass("loadinganim");

            // Inject results into DOM
            $listpeople_container.html(pageHTML);

            // Wire item selection
            if (sakai_global.config.listpeople[listType].selectable) {

                $(".listpeople_page" + " li", $rootel).addClass("selectable");
                $("#listpeople_page_" + pageNumber + " li", $rootel).bind("click", function(e){
                    // Check if user click on top of a link
                    if (e.target.tagName.toLowerCase() !== "a") {
                        // Remove from selected list
                        if ($(this).hasClass("listpeople_selected")) {
                            $(this).removeClass("listpeople_selected");
                            $(this).children("input").attr('checked', false);
                            delete sakai_global.data.listpeople[listType]["selected"][$(this).attr("id")];
                            sakai_global.data.listpeople[listType].selectCount -= 1;
                        } else {
                            // Add to selected list
                            $(this).addClass("listpeople_selected");
                            $(this).children("input").attr('checked', true);
                            sakai_global.data.listpeople[listType].selectCount += 1;

                            for (var i = 0; i < sakai_global.data.listpeople[listType].total; i++) {
                                if (sakai_global.data.listpeople[listType].userList[$(this).attr("id")]['rep:userId'] == [$(this).attr("id")] || sakai_global.data.listpeople[listType].userList[$(this).attr("id")]['userid'] == [$(this).attr("id")] || sakai_global.data.listpeople[listType].userList[$(this).attr("id")]['sakai:group-id'] == [$(this).attr("id")] || sakai_global.data.listpeople[listType].userList[$(this).attr("id")]['content_id'] == [$(this).attr("id")]) {
                                    sakai_global.data.listpeople[listType]["selected"][$(this).attr("id")] = sakai_global.data.listpeople[listType].userList[$(this).attr("id")];
                                }
                            }
                        }
                        // trigger event when add/remove from the list
                        $(window).trigger("listchange.listpeople.sakai",tuid);
                    }
                    $listpeople_count_items.hide();
                    $listpeople_count_of.show();
                    $listpeople_count_total.show();
                    $listpeople_count_selected.show();
                    $(".listpeople_page" + " li", $rootel).addClass("selectable");
                    $listpeople_count.html(sakai_global.data.listpeople[listType].selectCount);
                });
            }

            //Update known total amount of displayed elements
            sakai_global.data.listpeople[listType].currentElementCount += sakai_global.data.listpeople[listType].total;

            //Set search result count
            // If we know the exact total display it
            $listpeople_count_total.html(sakai_global.data.listpeople[listType].total);

            // Wire sorting select dropdown
            $listpeople_sort_order.bind("change", function(e){
                var sortOrder = $listpeople_sort_order.val();
                sortList(pageNumber, sortOrder);
            });

            // sort list
            sortList(pageNumber, sakai_global.config.listpeople[listType].sortOrder);
            pagerClickHandler(1);
            // SAKIII-1714 - In IE7, the list didn't rerender properly. Adding in this
            // resolved the problem
            if ($.browser.msie) {
                $listpeople_page_container.hide();
                setTimeout("$(\"." + uniqueIdentifier + "\").show()", 20);
            }
            
        };

        
        var pagerClickHandler = function(clicked){
           if (sakai_global.data.listpeople[listType].total > totalResult) {
                var pageNumber = (parseInt(clicked, 10) - 1) * totalResult;
                var listItems = $("#listpeople_page_0", $rootel).children('li');
                
                // hide all the list items.
                $(listItems).hide();

                // show only 5 items at a time
                for (var i = pageNumber; i < pageNumber+totalResult; i++) {
                    $(listItems).eq(i).show();
                }
                
                var totalNumberItems = sakai_global.data.listpeople[listType].total;
                $('.jq_pager', $rootel).pager({
                    pagenumber: clicked,
                    pagecount: Math.ceil(totalNumberItems / totalResult),
                    buttonClickCallback: pagerClickHandler
                });
                $('.jq_pager', $rootel).show();
            }
        };

        /**
         * sortList
         * Returns an array of selected items
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
                if (sortOrder === 'asc') {
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
        sakai_global.listpeople.getSelection = function(iListType) {
            return sakai_global.data.listpeople[iListType]["selected"];
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
                    var iSubNameInfoGroup = sakai_global.config.listpeople[listType]["subNameInfoGroup"];
                    var iSubNameInfoUser = sakai_global.config.listpeople[listType]["subNameInfoUser"];
                    var iSubNameInfoContent = sakai.widgets.listpeople.subNameInfoContent;
                    if (resultObject.userid) {
                        // get user details
                        sakai_global.data.listpeople[listType].userList[resultObject.userid] = resultObject;
                        sakai_global.data.listpeople[listType].total += 1;
                        if (sakai.api.User.getDisplayName(resultObject)) {
                            sakai_global.data.listpeople[listType].userList[resultObject.userid]["displayName"] = sakai.api.User.getDisplayName(resultObject);
                        } else if (resultObject["firstName"] && resultObject["lastName"]) {
                            sakai_global.data.listpeople[listType].userList[resultObject.userid]["displayName"] = resultObject["firstName"] + ' ' + resultObject["lastName"];
                        } else {
                            sakai_global.data.listpeople[listType].userList[resultObject.userid]["displayName"] = resultObject.userid;
                        }
                        if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                            sakai_global.data.listpeople[listType].userList[resultObject.userid]["picture"] = $.parseJSON(resultObject.picture);
                        }
                        if (!sakai_global.data.listpeople[listType].userList[resultObject.userid]["subNameInfo"]) {
                            sakai_global.data.listpeople[listType].userList[resultObject.userid]["subNameInfo"] = resultObject[iSubNameInfoUser];
                        }
                    } else if (resultObject.groupid) {
                        // get group details
                        sakai_global.data.listpeople[listType].userList[resultObject.groupid] = resultObject;
                        sakai_global.data.listpeople[listType].total += 1;
                        if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                            sakai_global.data.listpeople[listType].userList[resultObject.userid]["picture"] = $.parseJSON(resultObject.picture);
                        }
                        if (!sakai_global.data.listpeople[listType].userList[resultObject.groupid]["subNameInfo"]) {
                            sakai_global.data.listpeople[listType].userList[resultObject.groupid]["subNameInfo"] = resultObject[iSubNameInfoGroup];
                        }
                    } else if (resultObject['sakai:group-id']) {
                        // get group details
                        sakai_global.data.listpeople[listType].userList[resultObject['sakai:group-id']] = resultObject;
                        sakai_global.data.listpeople[listType].total += 1;
                        if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                            sakai_global.data.listpeople[listType].userList[resultObject['sakai:group-id']]["picture"] = $.parseJSON(resultObject.picture);
                        }
                        if (!sakai_global.data.listpeople[listType].userList[resultObject['sakai:group-id']]["subNameInfo"]) {
                            sakai_global.data.listpeople[listType].userList[resultObject['sakai:group-id']]["subNameInfo"] = resultObject[iSubNameInfoGroup];
                        }
                    } else if (sakai.api.User.getDisplayName(resultObject) && resultObject['rep:userId']) {
                        // get user details
                        sakai_global.data.listpeople[listType].userList[resultObject['rep:userId']] = resultObject;
                        sakai_global.data.listpeople[listType].userList[resultObject['rep:userId']]["displayName"] = sakai.api.User.getDisplayName(resultObject);
                        if (resultObject.picture && typeof(resultObject.picture) === 'string') {
                            sakai_global.data.listpeople[listType].userList[resultObject['rep:userId']]["picture"] = $.parseJSON(resultObject.picture);
                        }
                        if (!sakai_global.data.listpeople[listType].userList[resultObject['rep:userId']]["subNameInfo"]) {
                            sakai_global.data.listpeople[listType].userList[resultObject['rep:userId']]["subNameInfo"] = resultObject[iSubNameInfoUser];
                        }
                        sakai_global.data.listpeople[listType].total += 1;
                    } else if (resultObject["sling:resourceType"] === "sakai/pooled-content") {
                        // get content details
                        if (!resultObject["jcr:name"] && resultObject["content_id"]) {
                            resultObject["jcr:name"] = resultObject["content_id"];
                        }

                        var content_path = '/p/' + resultObject["jcr:name"];

                        $.ajax({
                            url: sakai.config.SakaiDomain + content_path + ".2.json",
                            async: false,
                            success: function(data){

                                sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]] = data;
                                sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]['content_id'] = resultObject["jcr:name"];
                                sakai_global.data.listpeople[listType].total += 1;
                                if (sakai.config.MimeTypes[data["mimeType"]]) {
                                    sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]['avatar'] = sakai.config.MimeTypes[data["mimeType"]].URL;
                                    sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]['mimeTypeDescripton'] = sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes[data["mimeType"]].description);
                                } else {
                                    sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]['avatar'] = "/dev/images/mimetypes/empty.png";
                                    sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]['mimeTypeDescripton'] = sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes.other.description);
                                }
                                if (!sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]["subNameInfo"]) {
                                    sakai_global.data.listpeople[listType].userList[resultObject["jcr:name"]]["subNameInfo"] = data[iSubNameInfoContent];
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
        sakai_global.listpeople.removeFromList = function() {
            $.each(sakai_global.data.listpeople[listType]["selected"], function(index, resultObject) {
                delete sakai_global.data.listpeople[listType].userList[index];
            });
            var tempList = {};
            tempList.results = sakai_global.data.listpeople[listType].userList;

            reset();

            if(!$.isEmptyObject(tempList)){
                // Re-render list of objects
                renderList(0, tempList);
            }
        };

        var init = function() {
            // Send out an event that says the widget is ready to
            // accept a search query to process and display. This event can be picked up
            // in a page JS code
            $(window).unbind(tuid + ".render.listpeople.sakai");
            $(window).bind(tuid + ".render.listpeople.sakai", function(e, data) {
                listType = data.listType;
                sakai_global.data.listpeople[listType] = {
                    "selected": {},
                    "currentElementCount": 0,
                    "selectCount": 0,
                    "total": 0,
                    "userList": {}
                };
                sakai_global.config.listpeople[listType] = {
                    "items": 1000,
                    "selectable": false,
                    "sortOn": "lastName",
                    "sortOrder": "asc",
                    "function": "getSelection",
                    "anon": false
                };
                render(tuid, data.pl_config, data.url, data.id);
            });
            $(window).trigger(tuid + ".ready.listpeople.sakai", tuid);
            $(window).trigger("ready.listpeople.sakai", tuid);
            sakai_global.listpeople.isReady = true;
            sakai_global.data.listpeople[tuid] = sakai_global.data.listpeople[tuid] || {};
            sakai_global.data.listpeople[tuid].isReady = true;
        };
        init();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("listpeople");
});
