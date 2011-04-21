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
        var $mymemberships_hover_template = $("#mymemberships_hover_template", $rootel);
        var $tooltip = $("#tooltip");


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

        /**
         * Compare the names of 2 participants
         *
         * @param {Object} participant a
         * @param {Object} participant b
         * @return 1, 0 or -1
         */
        var participantSort = function (a, b) {
            if (a.displayname.toLowerCase() > b.displayname.toLowerCase()) {
                return 1;
            } else {
                if (a.displayname.toLowerCase() === b.displayname.toLowerCase()) {
                    return 0;
                } else {
                    return -1;
                }
            }
        };

        /**
         * Push the given member to the given list of members to be rendered.
         * If the member is a manager, set is_manager to 'true'
         *
         * @param {Object} member      object returned in batch data results
         * @param {Object} list        list of members to add to
         * @param {Object} is_manager  optional flag to set whether this user
         *     is a manager or not
         */
        var push_member_to_list = function (member, list, is_manager) {
            var picsrc = "/dev/images/default_profile_picture_32.png";
            if (member.basic.elements.picture &&
                member.basic.elements.picture.name &&
                member.basic.elements.picture.name.value) {
                picsrc = member.basic.elements.picture.name.value;
            }
            list.push({
                link: "/~" + member.userid,
                picsrc: picsrc,
                displayname: member.basic.elements.firstName.value +
                    " " + member.basic.elements.lastName.value,
                manager: is_manager || false
            });
        };

        var setupTooltip = function (groupid, $item) {
            $item.addClass("mymemberships_item_hovered");
            // check local cache for data on this group
            if (mymemberships.cache[groupid] && mymemberships.cache[groupid].participants) {
                // data is cached
                openTooltip(groupid, $item);
            } else {
                // get batch group data for this group
                var batchRequests = [
                    {
                        url: "/system/userManager/group/" + groupid + ".members.json",
                        method: "GET"
                    },
                    {
                        url: "/system/userManager/group/" + groupid + ".managers.json",
                        method: "GET"
                    },
                    {
                        url: "/var/joinrequests/list.json?groupId=" + groupid,
                        method: "GET"
                    },
                    {
                        url: "/~" + groupid + "/public.1.json",
                        method: "GET"
                    }
                ];
                sakai.api.Server.batch(batchRequests, function (success, data) {
                    if (success && data && data.results && data.results.length) {
                        var participants = [];
                        // members
                        if (data.results[0].body) {
                            var members = $.parseJSON(data.results[0].body);
                            $.each(members, function (i, member) {
                                push_member_to_list(member, participants);
                            });
                        }
                        // managers
                        if (data.results[1].body) {
                            var managers = $.parseJSON(data.results[1].body);
                            mymemberships.cache[groupid].managerCount = managers.length;
                            $.each(managers, function (i, manager) {
                                push_member_to_list(manager, participants, true);
                            });
                        }
                        // join requests
                        if (data.results[2].body) {
                            var joinrequests = $.parseJSON(data.results[2].body);
                            mymemberships.cache[groupid].joinrequests = joinrequests;
                        }
                        // joinability info
                        if (data.results[3].body) {
                            var groupdata = $.parseJSON(data.results[3].body);
                            mymemberships.cache[groupid].joinability =
                                groupdata.authprofile["sakai:group-joinable"];
                        }

                        mymemberships.cache[groupid].totalParticipants = participants.length;
                        if (participants.length > 1) {
                            participants = participants.sort(participantSort);
                        }
                        if (participants.length > 5) {
                            participants = participants.slice(0, 5);
                            mymemberships.cache[groupid].seeAll = true;
                        }
                        mymemberships.cache[groupid].participants = participants;
                        openTooltip(groupid, $item);
                    } else {
                        debug.error("Batch request to fetch group (id: " + id + ") data failed.");
                    }
                });
            }
        }

        var openTooltip = function (groupid, $item) {
            $(window).trigger("init.tooltip.sakai", {
                tooltipHTML: sakai.api.Util.TemplateRenderer(
                    $mymemberships_hover_template, mymemberships.cache[groupid]),
                tooltipAutoClose: true,
                tooltipArrow: "top",
                tooltipTop: $item.offset().top + $item.height() + 5,
                tooltipLeft: $item.offset().left + $item.width() - 241,
                onShow: function () {
                    $(window).trigger("init.joinrequestbuttons.sakai", [
                        groupid,
                        mymemberships.cache[groupid].joinability,
                        mymemberships.cache[groupid].managerCount,
                        function (renderedButtons) {
                            // onShow
                            $("#mymemberships_joinrequestbuttons").html(
                                renderedButtons.html());
                        },
                        function (success, id) {
                            // requestCallback
                            if (success) {
                                // reset joinrequest data
                                mymemberships.cache[groupid].joinrequests = false;
                            }
                        },
                        function (success, id) {
                            // joinCallback
                            if (success) {
                                // re-render tooltip
                                resetTooltip(groupid, $item);
                            }
                        },
                        function (success, id) {
                            // leaveCallback
                            if (success) {
                                if (mymemberships.isOwnerViewing) {
                                    $(window).trigger("done.tooltip.sakai");
                                    // remove this group from sakai.data.me.groups cache
                                    // and re-render mymemberships
                                    $.each(sakai.data.me.groups, function (i, group) {
                                        if (group.groupid === id) {
                                            sakai.data.me.groups.splice(i, 1);
                                            return false;
                                        }
                                    });
                                    doInit();
                                } else {
                                    // re-render tooltip
                                    resetTooltip(groupid, $item);
                                }
                            }
                        },
                        mymemberships.cache[groupid].joinrequests
                    ]);
                }
            });
        };

        var resetTooltip = function (groupid, $item) {
            mymemberships.cache[groupid].participants = false;
            $(window).trigger("done.tooltip.sakai");
            setupTooltip(groupid, $item);
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        $mymemberships_sortby.change(function () {
            var sortSelection = this.options[this.selectedIndex].value;
            switch (sortSelection) {
                case "desc":
                    mymemberships.sortOrder = "desc";
                    break;
                default:
                    mymemberships.sortOrder = "asc";
                    break;
            }
            doInit();
        });

        $mymemberships_addgroup.click(function () {
            $(window).trigger("init.creategroup.sakai");
        });

        /** hover intent event handling for membership items **/
        var hoverOver = function (ev) {
            setupTooltip(this.id.split("mymemberships_item_")[1], $(this));
        };
        var hoverOut = function (ev) {
            if (!mymemberships.hovering) {
                $(this).removeClass("mymemberships_item_hovered");
                $(window).trigger("done.tooltip.sakai");
            }
        };
        $mymemberships_item.hoverIntent({
            sensitivity: 3,
            interval: 250,
            timeout: 0,
            over: hoverOver,
            out: hoverOut
        });

        $tooltip.live("mouseenter", function (ev) {
            mymemberships.hovering = true;
        });

        $tooltip.live("mouseleave", function (ev) {
            mymemberships.hovering = false;
            $(".mymemberships_item", $rootel).removeClass("mymemberships_item_hovered");
            $(window).trigger("done.tooltip.sakai");
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
                    var title = sakai.api.Util.applyThreeDots(
                        sakai.api.Security.escapeHTML(group["sakai:group-title"]),
                        650,  // width of .mymemberships_info div (not yet rendered)
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
                    groupData.push({
                        id: group.groupid,
                        url: "/~" + group.groupid,
                        picsrc: "/dev/images/group_emblem-sm.png",  // KERN?: should be part of the feed...
                        edit_url: "/dev/group_edit2.html?id=" + group.groupid,
                        title: title,
                        desc: desc
                    });
                    mymemberships.cache[group.groupid] = {
                        title: title,
                        id: group.groupid,
                        seeAll: false,
                        managerCount: 1
                    };
                });
                var json = {
                    groups: groupData,
                    user_manages: function (group) {
                        if (!group) { return false; }
                        return sakai.api.Groups.isCurrentUserAManager(group.id, sakai.data.me);
                    }
                };
                $mymemberships_nodata.hide();
                $mymemberships_nogroups.hide();
                $("#mymemberships_sortarea", $rootel).show();
                $mymemberships_items.show();
                $("#mymemberships_items", $rootel).html(sakai.api.Util.TemplateRenderer(
                    $("#mymemberships_items_template", $rootel), json));
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
