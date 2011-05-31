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

    sakai_global.joingroup = sakai_global.joingroup || {};
    sakai_global.joingroup.groupdata = sakai_global.joingroup.groupdata || {};
    sakai_global.joingroup.groupmembers = sakai_global.joingroup.groupmembers || {};

    /**
     * @name sakai_global.joingroup
     *
     * @class joingroup
     *
     * @description
     * Overlay for joining groups
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.joingroup = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $joingroup_hover_template = $("#joingroup_hover_template", $rootel);

        ///////////////////////
        // Utility Functions //
        ///////////////////////

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
        var push_member_to_list = function (member, list, role) {
            var picsrc = "/dev/images/default_profile_picture_32.png";
            if (member.basic.elements.picture &&
                member.basic.elements.picture.name &&
                member.basic.elements.picture.name.value) {
                picsrc = member.basic.elements.picture.name.value;
            }
            list.push({
                link: member.homePath,
                picsrc: picsrc,
                displayname: sakai.api.User.getDisplayName(member),
                role: role
            });
        };

        var getGroup = function(groupid, callback) {
            var group = {};
            // get batch group data for this group
            var batchRequests = [
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
                    // join requests
                    if (data.results[0].body) {
                        var joinrequests = $.parseJSON(data.results[0].body);
                        group.joinrequests = joinrequests;
                    }
                    // joinability info
                    if (data.results[1].body) {
                        var groupdata = $.parseJSON(data.results[1].body);

                        // add group data to global object so it can be accessed by the joinrequestbuttons widget
                        sakai_global.joingroup.groupdata = groupdata;

                        group.joinability =
                            groupdata.authprofile["sakai:group-joinable"];
                        group.title =
                            groupdata.authprofile["sakai:group-title"];
                        group.id =
                            groupid;
                    }
                    sakai.api.Groups.getMembers(groupid, false, function(success, members) {
                        // add results to global object so it can be accessed by the joinrequestbuttons widget
                        sakai_global.joingroup.groupmembers = members;

                        $.each(members, function(role, users) {
                            $.each(users.results, function(index, user) {
                                push_member_to_list(user, participants, role);
                            });
                        });

                        group.totalParticipants = participants.length;
                        if (participants.length > 1) {
                            participants = participants.sort(participantSort);
                        }
                        if (participants.length > 5) {
                            participants = participants.slice(0, 5);
                            group.seeAll = true;
                        } else {
                            group.seeAll = false;
                        }
                        group.participants = participants;
                        if ($.isFunction(callback)){
                            callback(group);
                        }
                    });
                } else {
                    debug.error("Batch request to fetch group (id: " + id + ") data failed.");
                }
            });
            return group;
        };

        var openTooltip = function (groupid, $item) {
            getGroup(groupid, function(group) {
                $(window).trigger("init.tooltip.sakai", {
                    tooltipHTML: sakai.api.Util.TemplateRenderer(
                        $joingroup_hover_template, group),
                    tooltipAutoClose: true,
                    tooltipArrow: "top",
                    tooltipTop: $item.offset().top + $item.height(),
                    tooltipLeft: $item.offset().left + $item.width(),
                    onShow: function () {
                        $(window).trigger("init.joinrequestbuttons.sakai", [
                            groupid,
                            group.joinability,
                            group.managerCount,
                            function (renderedButtons) {
                                // onShow
                                $("#joingroup_joinrequestbuttons").html(
                                    renderedButtons.html());
                            },
                            function (success, id) {
                                // requestCallback
                                if (success) {
                                    // reset joinrequest data
                                    group.joinrequests = false;
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
                                    if (joingroup.isOwnerViewing) {
                                        $(window).trigger("done.tooltip.sakai");
                                        // remove this group from sakai.data.me.groups cache
                                        // and re-render joingroup
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
                            group.joinrequests
                        ]);
                    }
                });
            });
        };

        var resetTooltip = function (groupid, $item) {
            $(window).trigger("done.tooltip.sakai");
            openTooltip(groupid, $item);
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var doInit = function () {
            $(window).bind("initialize.joingroup.sakai", function(evObj, groupid, target){
                openTooltip(groupid, $(target));
                return false;
            });
        };

        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("joingroup");
});
