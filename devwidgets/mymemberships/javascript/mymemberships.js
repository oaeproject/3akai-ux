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
     * @name sakai_global.mymemberships
     *
     * @class mymemberships
     *
     * @description
     * My Memberships lists the groups and worlds that a member is affiliated with
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.mymemberships = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var mymemberships = {  // global widget data
            isOwnerViewing: false,
            sortOrder: "asc",
            cache: [],
            hovering: false
        };

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mymemberships_items = $("#mymemberships_items", $rootel);
        var $mymemberships_nodata = $("#mymemberships_nodata", $rootel);
        var $mymemberships_nogroups = $("#mymemberships_nogroups", $rootel);
        var $mymemberships_actionbar = $("#mymemberships_actionbar", $rootel);
        var $mymemberships_addgroup = $("#mymemberships_addgroup", $rootel);
        var $mymemberships_sortby = $("#mymemberships_sortby", $rootel);
        var $mymemberships_item = $(".mymemberships_item", $rootel);

        ///////////////////////
        // Utility Functions //
        ///////////////////////

        /**
         * Reset the current my memberships view
         *
         * @param {String} query  optional query string to limit search results
         */
        var reset = function (query) {
            // placeholder...
        };

        /**
         * Show the given page of membership items.
         *
         * @param {int} pagenum The page number you want to display (not 0-indexed)
         */
        var showPage = function (pagenum) {
            // placeholder...
        };

        /**
         * Show the pager at the bottom of the page.
         *
         * @param {int} pagenum The number of the current page (not 0-indexed)
         */
        var showPager = function (pagenum) {
            // placeholder...
        };

        /**
         * Get personalized text for the given message bundle key based on
         * whether this list is owned by the viewer, or belongs to someone else.
         * The message should contain a '${firstname}' variable to replace with
         * and be located in this widget's properties files.
         *
         * @param {String} bundleKey The message bundle key
         */
        var getPersonalizedText = function (bundleKey) {
            // placeholder...
        };

        /**
         * Compare the names of 2 group objects
         *
         * @param {Object} a
         * @param {Object} b
         * @return 1, 0 or -1
         */
        var groupSort = function (a, b) {
            if (a["sakai:group-title"].toLowerCase() > b["sakai:group-title"].toLowerCase()) {
                return 1;
            } else {
                if (a["sakai:group-title"].toLowerCase() === b["sakai:group-title"].toLowerCase()) {
                    return 0;
                } else {
                    return -1;
                }
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        $mymemberships_sortby.change(function () {
            var sortSelection = this.options[this.selectedIndex].value;
            if (sortSelection === "desc") {
                mymemberships.sortOrder = "desc";
            } else {
                mymemberships.sortOrder = "asc";
            }
            doInit();
        });

        $mymemberships_addgroup.click(function () {
            $(window).trigger("init.creategroup.sakai");
        });

        ////////////////////////////////////////////
        // Data retrieval and rendering functions //
        ////////////////////////////////////////////

        /**
         * Renders the given groups
         *
         * @param {Object} groups  JSON containing group data
         */
        var render = function (groups) {
            if (!groups) {
                $mymemberships_actionbar.hide();
                $mymemberships_nogroups.hide();
                $mymemberships_nodata.show();
                return;
            }
            if (groups.entry && groups.entry.length) {
                groups.entry = groups.entry.sort(groupSort);
                if (mymemberships.sortOrder === "desc") {
                    groups.entry.reverse();
                }
                var groupData = [];
                $.each(groups.entry, function (i, group) {
                    var titleShort = sakai.api.Util.applyThreeDots(
                        sakai.api.Security.escapeHTML(group["sakai:group-title"]),
                        550,  // width of .mymemberships_info div (not yet rendered)
                        {max_rows: 1, whole_word: false},
                        "s3d-bold"
                    );
                    var desc = group["sakai:group-description"] &&
                        $.trim(group["sakai:group-description"]) ?
                            sakai.api.Util.applyThreeDots(
                                sakai.api.Security.escapeHTML(group["sakai:group-description"]),
                                650,  // width of .mymemberships_info div (not yet rendered)
                                {max_rows: 2, whole_word: false},
                                "s3d-bold"
                            ) : false;
                    var groupType = sakai.api.i18n.General.getValueForKey("OTHER");
                    if (group["sakai:category"]){
                        for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
                            if (sakai.config.worldTemplates[c].id === group["sakai:category"]){
                                groupType = sakai.api.i18n.General.getValueForKey(sakai.config.worldTemplates[c].title);
                            }
                        }
                    }

                    var tags = group["sakai:tags"];
                    if (!tags){
                        if (group.basic && group.basic.elements && group.basic.elements["sakai:tags"]){
                            tags = group.basic.elements["sakai:tags"].value;
                        }
                    }

                    groupData.push({
                        id: group.groupid,
                        url: "/~" + group.groupid,
                        picsrc: sakai.api.Groups.getProfilePicture(group),
                        edit_url: "/dev/group_edit2.html?id=" + group.groupid,
                        title: group["sakai:group-title"],
                        titleShort: titleShort,
                        desc: desc,
                        type: groupType,
                        created: group.created,
                        contentCount: group.counts.contentCount,
                        membersCount: group.counts.membersCount,
                        tags: tags
                    });
                });
                var json = {
                    groups: groupData,
                    isOwnerViewing: mymemberships.isOwnerViewing,
                    user_manages: function (group) {
                        if (!group) { return false; }
                        return sakai.api.Groups.isCurrentUserAManager(group.id, sakai.data.me);
                    },
                    sakai: sakai
                };
                $mymemberships_nodata.hide();
                $mymemberships_nogroups.hide();
                $("#mymemberships_sortarea", $rootel).show();
                $mymemberships_items.show();
                $("#mymemberships_items", $rootel).html(sakai.api.Util.TemplateRenderer(
                    $("#mymemberships_items_template", $rootel), json));

                // display functions available to logged in users
                if (!sakai.data.me.user.anon) {
                    $(".mymemberships_item_anonuser").hide();
                    $(".mymemberships_item_user_functions").show();
                }
            } else {
                $mymemberships_nodata.hide();
                $mymemberships_actionbar.hide();
                $mymemberships_items.hide();
                sakai.api.Util.TemplateRenderer("mymemberships_nogroups_template", {isMe: mymemberships.isOwnerViewing}, $mymemberships_nogroups);
                $mymemberships_nogroups.show();
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
            if (sakai_global.profile.main.data.userid ===
                sakai.data.me.user.userid) {
                mymemberships.isOwnerViewing = true;
                render(sakai.api.Groups.getMemberships(sakai.data.me.groups));
            } else {
                sakai.api.Server.loadJSON("/system/me", function(success, data){
                    mymemberships.isOwnerViewing = false;
                    render(sakai.api.Groups.getMemberships(data.groups));
                }, { uid: sakai_global.profile.main.data.userid });
            }
            sakai.api.Util.TemplateRenderer("mymemberships_title_template", {
                isMe: mymemberships.isOwnerViewing,
                firstName: sakai_global.profile.main.data.basic.elements.firstName.value
            }, $("#mymemberships_title_container", $rootel));
        };

        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("mymemberships");
});
