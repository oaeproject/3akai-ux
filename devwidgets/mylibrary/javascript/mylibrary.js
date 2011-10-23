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
    sakai_global.mylibrary = function (tuid, showSettings, widgetData, state) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var mylibrary = {  // global data for mylibrary widget
            sortBy: "_lastModified",
            sortOrder: "desc",
            isOwnerViewing: false,
            default_search_text: "",
            userArray: [],
            contextId: false,
            infinityScroll: false
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

        var currentGroup = false,
            currentQuery = "",
            currentItems = [];

        ///////////////////////
        // Utility functions //
        ///////////////////////

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
                return sakai.api.i18n.getValueForKey(
                    bundleKey, "mylibrary").replace(/\$\{firstname\}/gi,
                        currentGroup.properties["sakai:group-title"]);
            } else if (mylibrary.isOwnerViewing) {
                return sakai.api.i18n.getValueForKey(
                    bundleKey, "mylibrary").replace(/\$\{firstname\}/gi,
                        sakai.api.i18n.getValueForKey("YOUR").toLowerCase());
            } else {
                return sakai.api.i18n.getValueForKey(bundleKey, "mylibrary").replace(/\$\{firstname\}/gi, sakai.api.User.getFirstName(sakai_global.profile.main.data) + "'s");
            }
        };

        var resetView = function(){
            $mylibrary_check_all.removeAttr("checked");
            $mylibrary_remove.attr("disabled", "disabled");
            $("#mylibrary_title_bar").show();
        };

        /////////////////////////////
        // Deal with empty library //
        /////////////////////////////

        var handleEmptyLibrary = function(){
            $mylibrary_items.hide();
            var query = $mylibrary_livefilter.val();
            if (!query){
                $mylibrary_admin_actions.hide();
                $mylibrary_livefilter.hide();
                $mylibrary_sortarea.hide();
            }
            var mode = "me";
            if (sakai_global.profile && sakai_global.profile.main.mode.value !== sakai.data.me.user.userid) {
                mode = "user_other";
            } else if (sakai_global.group) {
                if (mylibrary.isOwnerViewing) {
                    mode = "group_managed";
                } else {
                    mode = "group";
                }
            }
            $mylibrary_empty.html(sakai.api.Util.TemplateRenderer("mylibrary_empty_template", {
                mode: mode,
                query: query
            }));
            $mylibrary_empty.show();
        }

        ////////////////////
        // Load a library //
        ////////////////////

        /**
         * Reset the current my library view
         *
         * @param {String} query  optional query string to limit search results
         */
        var showLibraryContent = function () {
            resetView();
            var query = $mylibrary_livefilter.val() || "*";
            // Set up the infinite scroll for the list of items in the library
            if (mylibrary.infinityScroll){
                mylibrary.infinityScroll.kill();
            }
            mylibrary.infinityScroll = $mylibrary_items.infinitescroll("/var/search/pool/manager-viewer.json", {
                userid: mylibrary.contextId,
                sortOn: mylibrary.sortBy,
                sortOrder: mylibrary.sortOrder,
                q: query
            }, "mylibrary_items_template", sakai, handleEmptyLibrary, handleLibraryItems, sakai.api.Content.getNewList(mylibrary.contextId));
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
                    paths.push(this.id.split("mylibrary_check_")[1]);
                });
                $(window).trigger('init.deletecontent.sakai', [{
                    path: paths,
                    context: mylibrary.contextId
                }, function (success) {
                    if (success) {
                        $(window).trigger("lhnav.updateCount", ["library", -(paths.length)]);
                        mylibrary.infinityScroll.removeItems(paths);
                    }
                }]);
            }
        });

        $mylibrary_sortby.change(function (ev) {
            var sortSelection = $(this).val();
            var sortBy = "_lastModified",
                sortOrder = "desc";
            if (sortSelection === "lastModified_asc") {
                sortOrder = "asc";
            }
            $.bbq.pushState({"lsb": sortBy, "lso": sortOrder, "lp": 1});
        });

        $mylibrary_livefilter.keyup(function (ev) {
            if (ev.keyCode === 13) {
                var q = $.trim(this.value);
                if (q && q !== currentQuery) {
                    $.bbq.pushState({
                        "lq": q,
                        "lp": 1
                    });
                } else if (!q) {
                    $.bbq.removeState("lq", "lp");
                }
            }
            return false;
        });

        $mylibrary_addcontent.click(function (ev) {
            $(window).trigger("init.newaddcontent.sakai");
            return false;
        });

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            // Set the sort states
            mylibrary.sortOrder = all["lso"] || "desc";
            mylibrary.sortBy = all["lsb"] || "_lastModified";
            $mylibrary_livefilter.val(changed["lq"] || all["lq"] || "");
            $mylibrary_sortby.val("lastModified_" + mylibrary.sortOrder);
            showLibraryContent();
        };

        // Listen for newly the newly added content event
        $(window).bind("done.newaddcontent.sakai", function(e, data, library) {
            if (library === mylibrary.contextId) {
                mylibrary.infinityScroll.prependItems(data);
            }
        });

        $(window).bind("hashchanged.mylibrary.sakai", handleHashChange);

        ////////////////////////////////////////////
        // Data retrieval and rendering functions //
        ////////////////////////////////////////////

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
                debug.log("Here");
                $.each(sakai.api.Util.formatTagsExcludeLocation(tags), function (i, name) {
                    formatted_tags.push({
                        name: name,
                        link: "search#q=" + sakai.api.Util.safeURL(name)
                    });
                });
                debug.log("Here");
                return formatted_tags;
            };

            var canDeleteContent = function(item){
                var canDelete = false;
                if (!mylibrary.isOwnerViewing){
                    return false;
                }
                if (item["sakai:pooled-content-viewer"]){
                    for (var v = 0; v < item["sakai:pooled-content-viewer"].length; v++){
                        if (item["sakai:pooled-content-viewer"][v] === mylibrary.contextId){
                            canDelete = true;
                        }
                    }
                }
                if (item["sakai:pooled-content-manager"]){
                    for (var m = 0; m < item["sakai:pooled-content-manager"].length; m++){
                        if (item["sakai:pooled-content-manager"][m] === mylibrary.contextId){
                            canDelete = true;
                        }
                    }
                }
                return canDelete;
            };

            /**
             * Process library item results from the server
             */
            var handleLibraryItems = function (results, callback) {
                var userIds = [];
                debug.log("Here1");
                $.each(results, function(index, content){
                    userIds.push(content["sakai:pool-content-created-for"] || content["_lastModifiedBy"]);
                });
                debug.log("Here1");
                if (userIds.length) {
                    sakai.api.User.getMultipleUsers(userIds, function(users){
                        currentItems = [];
                        $.each(results, function(i, result){
                            var mimetypeObj = sakai.api.Content.getMimeTypeData(result["_mimeType"]);
                            currentItems.push({
                                id: result["_path"],
                                filename: result["sakai:pooled-content-file-name"],
                                link: "/content#p=" + sakai.api.Util.safeURL(result["_path"]),
                                last_updated: $.timeago(new Date(result["_lastModified"])),
                                type: sakai.api.i18n.getValueForKey(mimetypeObj.description),
                                type_src: mimetypeObj.URL,
                                ownerid: result["sakai:pool-content-created-for"],
                                ownername: sakai.data.me.user.userid === result["sakai:pool-content-created-for"] ? sakai.api.i18n.getValueForKey("YOU") : sakai.api.User.getDisplayName(users[result["sakai:pool-content-created-for"]]),
                                tags: formatTags(result["sakai:tags"]),
                                numPlaces: sakai.api.Content.getPlaceCount(result),
                                numComments: sakai.api.Content.getCommentCount(result),
                                mimeType: result["_mimeType"],
                                thumbnail: sakai.api.Content.getThumbnail(result),
                                description: sakai.api.Util.applyThreeDots(result["sakai:description"], 1300, {
                                    max_rows: 1,
                                    whole_word: false
                                }, "searchcontent_result_course_site_excerpt"),
                                fullResult: result,
                                canDelete: canDeleteContent(result)
                            });
                            mylibrary.userArray.push(result["sakai:pool-content-created-for"]);
                        });
                        callback(currentItems);
                    });
                    // Show the admin controls now we know that there are items to display
                    if (mylibrary.isOwnerViewing) {
                        $mylibrary_admin_actions.show();
                    }
                    $mylibrary_livefilter.show();
                    $mylibrary_sortarea.show();
                    $mylibrary_empty.hide();
                    $mylibrary_items.show();
                } else {
                    callback([]);
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
                // TODO: Change this to getFirstName function
                contextName = sakai_global.profile.main.data.basic.elements.firstName.value;
                if (mylibrary.contextId === sakai.data.me.user.userid) {
                    mylibrary.isOwnerViewing = true;
                }
                finishInit(contextName, isGroup);
            }
        };
        
        var finishInit = function(contextName, isGroup){
            if (mylibrary.contextId) {
                mylibrary.default_search_text = getPersonalizedText("SEARCH_YOUR_LIBRARY");
                $mylibrary_livefilter.attr("placeholder", mylibrary.default_search_text);
                mylibrary.currentPagenum = 1;
                var all = state && state.all ? state.all : {};
                handleHashChange(null, {}, {}, all, $.bbq.getState(), true);
                sakai.api.Util.TemplateRenderer("mylibrary_title_template", {
                    isMe: mylibrary.isOwnerViewing,
                    isGroup: isGroup,
                    user: contextName
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
