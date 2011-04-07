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
    sakai_global.mylibrary = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var mylibrary = {  // global data for mylibrary widget
            totalItems: 0,
            itemsPerPage: 8,
            currentPagenum: 1
        };

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mylibrary_items = $("#mylibrary_items", $rootel);
        var $mylibrary_check = $(".mylibrary_check", $rootel);
        var $mylibrary_check_all = $("#mylibrary_check_all", $rootel);
        var $mylibrary_remove = $("#mylibrary_remove", $rootel);


        ///////////////////////
        // Utility Functions //
        ///////////////////////

        /**
         * Reset the current my library view
         */
        var reset = function () {
            $mylibrary_items.html("");
            $mylibrary_check_all.removeAttr("checked");
            $mylibrary_remove.attr("disabled", "disabled");
            getLibraryItems(sakai_global.profile.main.data.userid, renderLibraryItems);
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
                        reset();
                    }
                }]);
            }
        });

        ////////////////////////////////////////////
        // Data retrieval and rendering functions //
        ////////////////////////////////////////////

        /**
         * Gets the given user's library items and passes them to the callback
         * function
         *
         * @param {String} userid  the user id for the user whose library items we want
         * @return callback function called with the following args:
         *     {Boolean} success - whether or not the fetch succeeded
         *     {Object} items - an array of library items or null if no success
         */
        var getLibraryItems = function (userid, callback) {

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
                for (var i in tags) {
                    if (tags.hasOwnProperty(i)) {
                        formatted_tags.push({
                            name: tags[i],
                            link: "/search#tag=/tags/" + tags[i]
                        });
                    }
                }
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
                var id = item["jcr:path"];
                var count = 0;
                if (item[id + "/comments"]) {
                    for (prop in item[id + "/comments"]) {
                        if (item[id + "/comments"].hasOwnProperty(prop)) {
                            if (prop.indexOf("/comments/") != -1) {
                                count++;
                            }
                        }
                    }
                }
                return count;
            };

            /**
             * Process library item results from the server
             */
            var handleLibraryItems = function (success, data) {
                if (success && data && data.results) {
                    mylibrary.totalItems = data.total;
                    var items = [];
                    if (mylibrary.totalItems === 0) {
                        callback(true, items);
                        return;
                    }
                    for (var i in data.results) {
                        if (data.results.hasOwnProperty(i)) {
                            var mimetypeObj = sakai.api.Content.getMimeTypeData(data.results[i]["_mimeType"]);
                            items.push({
                                id: data.results[i]["jcr:path"],
                                filename: data.results[i]["sakai:pooled-content-file-name"],
                                link: "/content#content_path=/p/" + data.results[i]["jcr:path"],
                                last_updated: $.timeago(new Date(data.results[i]["_lastModified"])),
                                type: sakai.api.i18n.General.getValueForKey(mimetypeObj.description),
                                type_src: mimetypeObj.URL,
                                ownerid: data.results[i]["sakai:pool-content-created-for"],
                                ownername: sakai.data.me.user.userid === data.results[i]["sakai:pool-content-created-for"] ?
                                    sakai.api.i18n.General.getValueForKey("YOU") :
                                    data.results[i]["sakai:pool-content-created-for"],  // using id for now - need to get firstName lastName
                                tags: formatTags(data.results[i]["sakai:tags"]),
                                numPeopleUsing: getNumPeopleUsing(),
                                numGroupsUsing: getNumGroupsUsing(),
                                numComments: getNumComments(data.results[i])
                            });
                        }
                    }
                    if (callback && typeof(callback) === "function") {
                        callback(true, items);
                    }
                } else {
                    debug.error("Fetching library items for userid: " + userid + " failed");
                    if (callback && typeof(callback) === "function") {
                        callback(false, null);
                    }
                }
            };

            // fetch the data
            sakai.api.Server.loadJSON("/var/search/pool/manager-viewer.json",
                handleLibraryItems, {
                    userid: userid,
                    page: mylibrary.currentPagenum - 1,
                    items: mylibrary.itemsPerPage,
                    sortOn: "lastModified",
                    sortOrder: "desc"
                }
            );
        };

        /**
         * Renders the given library items
         *
         * @param {Boolean} success - whether or not we have library items
         * @param {Array} items - an array of library items or null if no success
         */
        var renderLibraryItems = function (success, items) {
            // TODO will need to check if current user is looking at their own lib...
            if (success && items.length) {
                var json = {
                    items: items,
                    user_is_manager: function (item) {
                        return sakai.data.me.user.userid === item.ownerid;
                    }
                };
                $("#mylibrary_items", $rootel).html(sakai.api.Util.TemplateRenderer($("#mylibrary_items_template", $rootel), json));
                showPager(mylibrary.currentPagenum);
            } else {
                // show empty library
            }
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
            if (sakai_global.profile.main.data.userid) {
                mylibrary.currentPagenum = 1;
                getLibraryItems(sakai_global.profile.main.data.userid, renderLibraryItems);
            } else {
                debug.warning("No user found for My Library");
            }
        };

        // run the initialization function when the widget object loads
        doInit();

        // Listen for complete.fileupload.sakai event (from the fileupload widget)
        // to refresh this widget's file listing
        $(window).bind("complete.fileupload.sakai", function() {
            mylibrary.currentPagenum = 1;
            reset();
        });

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("mylibrary");
});
