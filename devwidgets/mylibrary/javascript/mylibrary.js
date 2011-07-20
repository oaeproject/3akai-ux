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

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.mylibrary
     *
     * @class mylibrary
     *
     * @description
     * My Hello World is a dashboard widget that says hello to the current user
     * with text in the color of their choosing
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.mylibrary = function (tuid, showSettings, widgetData) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var mylibrary = {  // global data for mylibrary widget
            totalItems: 0,
            itemsPerPage: 8,
            currentPagenum: 1,
            sortBy: "_lastModified",
            sortOrder: "desc",
            isOwnerViewing: false,
            default_search_text: "",
            userArray: [],
            oldResults: false,
            contextId: false
        };

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mylibrary_items = $("#mylibrary_items", $rootel);
        var $mylibrary_check = $(".mylibrary_check", $rootel);
        var $mylibrary_check_all = $("#mylibrary_check_all", $rootel);
        var $mylibrary_remove = $("#mylibrary_remove", $rootel);
        var $mylibrary_sortby = $("#mylibrary_sortby", $rootel);
        var $mylibrary_livefilter = $("#mylibrary_livefilter", $rootel);
        var $mylibrary_sortarea = $("#mylibrary_sortarea", $rootel);
        var $mylibrary_empty = $("#mylibrary_empty", $rootel);
        var $mylibrary_admin_actions = $("#mylibrary_admin_actions", $rootel);
        var $mylibrary_addcontent = $("#mylibrary_addcontent", $rootel);
        var $mylibrary_groupfilter_selection = $("#mylibrary_groupfilter_selection", $rootel);
        var $mylibrary_groupfilter_groups = $("#mylibrary_groupfilter_groups", $rootel);
        var $mylibrary_groupfilter_wrapper = $("#mylibrary_groupfilter_wrapper", $rootel);
        var $mylibrary_groupfilter_usedin_count = $("#mylibrary_groupfilter_usedin_count", $rootel);
        var $mylibrary_groupfilter_groups_container = $("#mylibrary_groupfilter_groups_container", $rootel);
        var $mylibrary_groupfilter_groups_button = $("#mylibrary_groupfilter_groups button", $rootel);
        var $mylibrary_groupfilter_usedin_arrow = $("#mylibrary_groupfilter_usedin_arrow", $rootel);

        var mylibrary_groupfilter_groups_template = "mylibrary_groupfilter_groups_template";

        var currentGroup = false;

        ///////////////////////
        // Utility Functions //
        ///////////////////////

        /**
         * Reset the current my library view
         *
         * @param {String} query  optional query string to limit search results
         */
        var reset = function (query) {
            mylibrary.currentPagenum = mylibrary.currentPagenum || 1;
            $mylibrary_check_all.removeAttr("checked");
            $mylibrary_remove.attr("disabled", "disabled");
            mylibrary.contextId = "";
            if(widgetData && widgetData.mylibrary){
                mylibrary.contextId = widgetData.mylibrary.groupid;
            } else {
                mylibrary.contextId = sakai_global.profile.main.data.userid;
            }
            getLibraryItems(renderLibraryItems, query || false);
        };

        /**
         * Determine if we're on the user's personal dashboard or not
         */
        var isOnPersonalDashboard = function() {
            return $('body').hasClass('me');
        };

        /**
         * Show the given page of library items.
         *
         * @param {int} pagenum The page number you want to display (not 0-indexed)
         */
        var showPage = function (pagenum) {
            showPager(pagenum);
            mylibrary.currentPagenum = pagenum;
            reset();
        };

        /**
         * Show the pager at the bottom of the page.
         *
         * @param {int} pagenum The number of the current page (not 0-indexed)
         */
        var showPager = function (pagenum) {
            mylibrary.currentPagenum = pagenum;
            if (Math.ceil(mylibrary.totalItems / mylibrary.itemsPerPage) > 1) {
                $("#mylibrary_pager", $rootel).pager({
                    pagenumber: pagenum,
                    pagecount: Math.ceil(mylibrary.totalItems / mylibrary.itemsPerPage),
                    buttonClickCallback: showPage
                });
            }
        };

        /**
         * Get personalized text for the given message bundle key based on
         * whether this library is owned by the viewer, or belongs to someone else.
         * The message should contain a '${firstname}' variable to replace with
         * and be located in this widget's properties files.
         *
         * @param {String} bundleKey The message bundle key
         */
        var getPersonalizedText = function (bundleKey) {
            if(currentGroup){
                return sakai.api.i18n.Widgets.getValueForKey(
                    "mylibrary","",bundleKey).replace(/\$\{firstname\}/gi,
                        currentGroup.properties["sakai:group-title"]);
            } else if (mylibrary.isOwnerViewing) {
                return sakai.api.i18n.Widgets.getValueForKey(
                    "mylibrary","",bundleKey).replace(/\$\{firstname\}/gi,
                        sakai.api.i18n.General.getValueForKey("YOUR").toLowerCase());
            } else {
                return sakai.api.i18n.Widgets.getValueForKey("mylibrary", "", bundleKey).replace(/\$\{firstname\}/gi, sakai_global.profile.main.data.basic.elements.firstName.value + "'s");
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        $mylibrary_check.live("change", function (ev) {
            if ($(this).is(":checked")) {
                $mylibrary_remove.removeAttr("disabled");
            } else if (!$(".mylibrary_check:checked", $rootel).length) {
                $mylibrary_remove.attr("disabled", "disabled");
            }
        });

        $mylibrary_check_all.change(function (ev) {
            if ($(this).is(":checked")) {
                $(".mylibrary_check").attr("checked", "checked");
                $mylibrary_remove.removeAttr("disabled");
            } else {
                $(".mylibrary_check").removeAttr("checked");
                $mylibrary_remove.attr("disabled", "disabled");
            }
        });

        $mylibrary_remove.click(function (ev) {
            var $checked = $(".mylibrary_check:checked", $rootel);
            if ($checked.length) {
                var paths = [];
                $checked.each(function () {
                    paths.push("/p/" + this.id.split("mylibrary_check_")[1]);
                });
                $(window).trigger('init.deletecontent.sakai', [{
                    path: paths
                }, function (success) {
                    if (success) {
                        $(window).trigger("lhnav.updateCount", ["library", -(paths.length)]);
                        mylibrary.currentPagenum = 1;
                        reset();
                    }
                }]);
            }
        });

        $mylibrary_sortby.change(function (ev) {
            var sortSelection = this.options[this.selectedIndex].value;
            if (sortSelection === "lastModified_asc") {
                mylibrary.sortBy = "_lastModified";
                mylibrary.sortOrder = "asc";
            } else {
                mylibrary.sortBy = "_lastModified";
                mylibrary.sortOrder = "desc";
            }
            reset();
        });

        $mylibrary_livefilter.keyup(function (ev) {
            var q = $.trim(this.value);
            if (q && ev.keyCode != 16) {
                $mylibrary_livefilter.addClass("mylibrary_livefilter_working");
                reset(q);
            } else if (!q) {
                reset();
            }
            return false;
        });

        $mylibrary_livefilter.focus(function (ev) {
            $input = $(this);
            $input.removeClass("mylibrary_meta");
            if ($.trim($input.val()) === mylibrary.default_search_text) {
                $input.val("");
            }
        });

        $mylibrary_livefilter.blur(function (ev) {
            $input = $(this);
            if ($.trim($input.val()) === "") {
                $input.addClass("mylibrary_meta");
                $input.val(mylibrary.default_search_text);
            }
        });

        $mylibrary_addcontent.click(function (ev) {
            $(window).trigger("init.newaddcontent.sakai");
            return false;
        });

        // Listen for newly the newly added content event
        $(window).bind("done.newaddcontent.sakai", function(e, data, library) {
            if (library === mylibrary.contextId || isOnPersonalDashboard()) {
                reset();
            }
        });

        ////////////////////////////////////////////
        // Data retrieval and rendering functions //
        ////////////////////////////////////////////

        /**
         * Gets the given user's library items and passes them to the callback
         * function
         *
         * @param {Function} callback  function called with the following args:
         *     {Boolean} success - whether or not the fetch succeeded
         *     {Object} items - an array of library items or null if no success
         * @param {String} query       optional query string to limit search results
         */
        var getLibraryItems = function (callback, query) {

            /**
             * Formats a tag list from the server for display in the UI
             *
             * @param {Array} tags  an array of tags from the server
             * @return {Array} an array of tags formatted for the UI
             */
            var formatTags = function (tags) {
                if (!tags) {
                    return null;
                }
                var formatted_tags = [];
                $.each(sakai.api.Util.formatTagsExcludeLocation(tags), function (i, name) {
                    formatted_tags.push({
                        name: name,
                        link: "/search#q=" + name
                    });
                });
                return formatted_tags;
            };

            /**
             * Returns the number of people using the given item
             *
             * @param {Object} item  the item object returned from the server
             * @return {Number} the number of users using this item
             */
            var getNumPeopleUsing = function (item) {
                // Need KERN feed changes
                return 0;
            };

            /**
             * Returns the number of groups using the given item
             *
             * @param {Object} item  the item object returned from the server
             * @return {Number} the number of groups using this item
             */
            var getNumGroupsUsing = function (item) {
                // Need KERN feed changes
                return 0;
            };

            /**
             * Returns the number of comments for the given item
             *
             * @param {Object} item  the item object returned from the server
             * @return {Number} the number of comments for this item
             */
            var getNumComments = function (item) {
                if (!item) {
                    return 0;
                }
                var id = item["_path"];
                var count = 0;
                if (item[id + "/comments"]) {
                    $.each(item[id + "/comments"], function (param, value) {
                        if (param.indexOf("/comments/") != -1) {
                            count++;
                        }
                    });
                }
                return count;
            };

            /**
             * Process library item results from the server
             */
            var handleLibraryItems = function (success, data) {
                var userIds = [];
                $.each(data.results, function(index, content){
                    userIds.push(content["sakai:pool-content-created-for"] || content["_lastModifiedBy"]);
                });
                if (userIds.length) {
                    sakai.api.User.getMultipleUsers(userIds, function(users){
                        if (data && data.results && _.isEqual(mylibrary.oldResults, data.results)) {
                            $mylibrary_items.show();
                            $mylibrary_livefilter.removeClass("mylibrary_livefilter_working");
                            return;
                        }
                        else if (!success || (data && data.total === 0)) {
                                mylibrary.oldResults = false;
                            } else {
                                mylibrary.oldResults = data.results;
                            }
                        if (success && data && data.results) {
                            mylibrary.totalItems = data.total;
                            var items = [];
                            if (mylibrary.totalItems === 0) {
                                callback(true, items, query);
                                return;
                            }
                            $.each(data.results, function(i, result){
                                var mimetypeObj = sakai.api.Content.getMimeTypeData(result["_mimeType"] || result["sakai:custom-mimetype"]);
                                items.push({
                                    id: result["_path"],
                                    filename: result["sakai:pooled-content-file-name"],
                                    link: "/content#p=" + sakai.api.Util.encodeURIComponentI18n(result["_path"]),
                                    last_updated: $.timeago(new Date(result["_lastModified"])),
                                    type: sakai.api.i18n.General.getValueForKey(mimetypeObj.description),
                                    type_src: mimetypeObj.URL,
                                    ownerid: result["sakai:pool-content-created-for"],
                                    ownername: sakai.data.me.user.userid === result["sakai:pool-content-created-for"] ? sakai.api.i18n.General.getValueForKey("YOU") : sakai.api.User.getDisplayName(users[result["sakai:pool-content-created-for"]]), // using id for now - need to get firstName lastName
                                    tags: formatTags(result["sakai:tags"]),
                                    numPeopleUsing: getNumPeopleUsing(),
                                    numGroupsUsing: getNumGroupsUsing(),
                                    numPlaces: sakai.api.Content.getPlaceCount(result),
                                    numComments: sakai.api.Content.getCommentCount(result),
                                    mimeType: result["_mimeType"] || result["sakai:custom-mimetype"],
                                    thumbnail: sakai.api.Content.getThumbnail(result),
                                    description: sakai.api.Util.applyThreeDots(result["sakai:description"], 1300, {
                                        max_rows: 1,
                                        whole_word: false
                                    }, "searchcontent_result_course_site_excerpt"),
                                    fullResult: result
                                });
                                mylibrary.userArray.push(result["sakai:pool-content-created-for"]);
                            });
                            if (callback && typeof(callback) === "function") {
                                callback(true, items);
                            }
                        } else {
                            debug.error("Fetching library items for userid: " + mylibrary.contextId + " failed");
                            if (callback && typeof(callback) === "function") {
                                callback(false, null, query);
                            }
                        }
                    });
                }
            };

            var handleResponse = function(success, data) {
                if (sakai_global.newaddcontent) {
                    var library = null;
                    if (!isOnPersonalDashboard()) {
                        library = mylibrary.contextId;
                    }
                    data = sakai.api.Content.getNewList(data, library, mylibrary.currentPagenum - 1, mylibrary.itemsPerPage);
                }
                handleLibraryItems(success, data);
            };

            // fetch the data
            sakai.api.Server.loadJSON("/var/search/pool/manager-viewer.json",
                handleResponse, {
                    userid: mylibrary.contextId,
                    page: mylibrary.currentPagenum - 1,
                    items: mylibrary.itemsPerPage,
                    sortOn: mylibrary.sortBy,
                    sortOrder: mylibrary.sortOrder,
                    q: query || "*"
                }
            );
        };

        /**
         * Renders the given library items
         *
         * @param {Boolean} success - whether or not we have library items
         * @param {Array} items - an array of library items or null if no success
         */
        var renderLibraryItems = function (success, items, query) {
            if (success && items.length) {
                var json = {
                    items: items,
                    user_is_owner: function (item) {
                        if (!item) {
                            return false;
                        }
                        return sakai.data.me.user.userid === item.ownerid && mylibrary.isOwnerViewing;
                    },
                    user_is_manager: function (item) {
                        if (!item) {
                            return false;
                        }
                        return sakai.data.me.user.userid === item.ownerid;
                    }
                };
                json.sakai = sakai;
                if (mylibrary.isOwnerViewing) {
                    $mylibrary_admin_actions.show();
                }
                $mylibrary_livefilter.show();
                $mylibrary_sortarea.show();
                $mylibrary_empty.hide();
                $("#mylibrary_title_bar").show();
                $mylibrary_items.show();
                $mylibrary_items.html(sakai.api.Util.TemplateRenderer("mylibrary_items_template", json));
                showPager(mylibrary.currentPagenum);
                $mylibrary_livefilter.removeClass("mylibrary_livefilter_working");
            } else if (query) {
                $mylibrary_items.hide();
                $mylibrary_empty.html(sakai.api.Util.TemplateRenderer("mylibrary_empty_template", {who:"nosearchresults", query:query}));
                $mylibrary_livefilter.removeClass("mylibrary_livefilter_working");
                $mylibrary_empty.show();
            } else {
                $mylibrary_admin_actions.hide();
                $mylibrary_livefilter.hide();
                $mylibrary_sortarea.hide();
                $mylibrary_items.hide();
                var who = "";
                if (sakai_global.profile) {
                    who = sakai_global.profile.main.mode.value;
                } else if (sakai_global.group) {
                    if (mylibrary.isOwnerViewing) {
                        who = "group_managed";
                    } else {
                        who = "group";
                    }
                }
                $mylibrary_empty.html(sakai.api.Util.TemplateRenderer("mylibrary_empty_template", {who:who}));
                $mylibrary_empty.show();
            }
        };

        /**
         * Renders the used in filter
         */
        var initUsedInFilter = function (){
            $mylibrary_groupfilter_selection.click(function (ev) {
                if ($mylibrary_groupfilter_selection.hasClass("mylibrary_groupfilter_selection_open")) {
                    $mylibrary_groupfilter_selection.removeClass("mylibrary_groupfilter_selection_open");
                    $mylibrary_groupfilter_usedin_arrow.removeClass("mylibrary_groupfilter_usedin_arrow_down");
                    $mylibrary_groupfilter_usedin_arrow.addClass("mylibrary_groupfilter_usedin_arrow_up");
                    $mylibrary_groupfilter_groups.hide();
                } else {
                    $mylibrary_groupfilter_selection.addClass("mylibrary_groupfilter_selection_open");
                    $mylibrary_groupfilter_usedin_arrow.removeClass("mylibrary_groupfilter_usedin_arrow_up");
                    $mylibrary_groupfilter_usedin_arrow.addClass("mylibrary_groupfilter_usedin_arrow_down");
                    $mylibrary_groupfilter_groups.show();
                }
                return false;
            });
            $mylibrary_groupfilter_groups_button.live("click", function (ev) {
                var groupId = $(this).data("groupid");
                var groupTitle = $(this).attr("title");
                if (!groupId){
                    groupId = sakai.data.me.user.userid;
                    groupTitle = getPersonalizedText("ALL");
                }
                $mylibrary_groupfilter_selection.find("button").attr("title", groupTitle);
                $mylibrary_groupfilter_selection.find("button").text(groupTitle);

                mylibrary.currentPagenum = 1;
                getLibraryItems(groupId, renderLibraryItems);
                sakai.api.Util.TemplateRenderer("mylibrary_title_template", {
                    isMe: mylibrary.isOwnerViewing,
                    firstName: groupTitle
                }, $("#mylibrary_title_container", $rootel));

                $mylibrary_groupfilter_selection.click();
            });

            var groups = sakai.api.Groups.getMemberships(sakai.data.me.groups);

            // Truncate long group titles
            for (var g in groups.entry) {
                if (groups.entry.hasOwnProperty(g)) {
                    if (groups.entry[g]["sakai:group-title"]) {
                        groups.entry[g]["sakai:group-title"] = sakai.api.Util.applyThreeDots(groups.entry[g]["sakai:group-title"], 300, {
                            max_rows: 1,
                            whole_word: false
                        }, "s3d-bold");
                        groups.entry[g]["sakai:group-title-short"] = sakai.api.Util.applyThreeDots(groups.entry[g]["sakai:group-title"], 125, {
                            max_rows: 1,
                            whole_word: false
                        }, "s3d-bold");
                    }
                }
            }

            var json = {
                "groups": groups
            };

            $mylibrary_groupfilter_groups_container.html(sakai.api.Util.TemplateRenderer(mylibrary_groupfilter_groups_template, json));
            //$mylibrary_groupfilter_wrapper.show();
            $mylibrary_groupfilter_usedin_count.html("(" + (parseInt(groups.entry.length, 10) + 1) + ")");
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function () {
            mylibrary.contextId = "";
            var contextName = "";
            var isGroup = false;

            // We embed the deletecontent widget, so make sure it's loaded
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false);

            if (widgetData && widgetData.mylibrary) {
                mylibrary.contextId = widgetData.mylibrary.groupid;
                sakai.api.Server.loadJSON("/system/userManager/group/" +  mylibrary.contextId + ".json", function(success, data) {
                    if (success){
                        currentGroup = data;
                        contextName = currentGroup.properties["sakai:group-title"];
                        isGroup = true;
                        mylibrary.isOwnerViewing = sakai.api.Groups.isCurrentUserAManager(currentGroup.properties["sakai:group-id"], sakai.data.me, currentGroup.properties);
                        finishInit(contextName, isGroup);
                    }
                });
            } else {
                mylibrary.contextId = sakai_global.profile.main.data.userid;
                contextName = sakai_global.profile.main.data.basic.elements.firstName.value;
                if (mylibrary.contextId === sakai.data.me.user.userid) {
                    mylibrary.isOwnerViewing = true;
                    initUsedInFilter();
                }
                finishInit(contextName, isGroup);
            }
        };
        
        var finishInit = function(contextName, isGroup){
            if (mylibrary.contextId) {
                mylibrary.default_search_text = getPersonalizedText("SEARCH_YOUR_LIBRARY");
                $mylibrary_livefilter.val(mylibrary.default_search_text);
                mylibrary.currentPagenum = 1;
                getLibraryItems(renderLibraryItems);
                sakai.api.Util.TemplateRenderer("mylibrary_title_template", {
                    isMe: mylibrary.isOwnerViewing,
                    isGroup: isGroup,
                    firstName: contextName
                }, $("#mylibrary_title_container", $rootel));
            } else {
                debug.warn("No user found for My Library");
            }
        };

        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("mylibrary");
});
