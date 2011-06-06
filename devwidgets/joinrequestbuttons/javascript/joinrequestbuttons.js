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
 *
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.joinrequestbuttons
     *
     * @class joinrequestbuttons
     *
     * @description
     * Renders join request buttons (join, leave, pending)
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.joinrequestbuttons = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var joinrequestbuttons = {  // global widget data
            groupid: false,
            data: false,
            joinCallback: false,
            leaveCallback: false
        };

        // DOM elements
        var $rootel = $("#" + tuid);
        var $joinrequestbuttons_widget = $("#joinrequestbuttons_widget", $rootel);
        var $joinrequestbuttons_template = $("#joinrequestbuttons_template", $rootel);
        var $joinrequestbuttons_request = $(".joinrequestbuttons_request");
        var $joinrequestbuttons_join = $(".joinrequestbuttons_join");
        var $joinrequestbuttons_leave = $(".joinrequestbuttons_leave");

        // messages
        var $joinrequestbuttons_group_membership = $("#joinrequestbuttons_group_membership", $rootel);
        var $joinrequestbuttons_group_problem_removing = $("#joinrequestbuttons_group_problem_removing", $rootel);
        var $joinrequestbuttons_group_removal_successful = $("#joinrequestbuttons_group_removal_successful", $rootel);
        var $joinrequestbuttons_group_request_sent = $("#joinrequestbuttons_group_request_sent", $rootel);
        var $joinrequestbuttons_group_problem_with_request = $("#joinrequestbuttons_group_problem_with_request", $rootel);
        var $joinrequestbuttons_group_problem_adding = $("#joinrequestbuttons_group_problem_adding", $rootel);
        var $joinrequestbuttons_group_adding_successful = $("#joinrequestbuttons_group_adding_successful", $rootel);

        /**
         * Displays the specific type of group membership button
         * @param {String} type specifies which button to show. Options are:
         *  - join: "Join group" button
         *  - leave: "Leave group" button
         *  - request: "Request to join group" button
         *  - pending: "Join request pending" button
         * @return None
         */
        var showButton = function (type) {
            hideButtons();
            if (type && typeof(type) === "string") {
                switch(type) {
                    case "join":
                        $(".joinrequestbuttons_join").show();
                        break;
                    case "leave":
                        $(".joinrequestbuttons_leave").show();
                        break;
                    case "request":
                        $(".joinrequestbuttons_request").show();
                        break;
                    case "pending":
                        $(".joinrequestbuttons_pending").show();
                        break;
                }
            }
        };

        /**
         * Hides any showing group membership button
         */
        var hideButtons = function () {
            $("button", $rootel).hide();
        };

        /**
         * Renders the correct join request button
         */
        var render = function () {
            // render the template
            $joinrequestbuttons_widget.html(sakai.api.Util.TemplateRenderer(
                $joinrequestbuttons_template, {id:joinrequestbuttons.groupid}));

            // determine which button to show
            var isMember = sakai.api.Groups.isCurrentUserAMember(
                joinrequestbuttons.groupid, sakai.data.me);
            var isManager = sakai.api.Groups.isCurrentUserAManager(
                joinrequestbuttons.groupid, sakai.data.me);
            var isAnon = sakai.data.me.user.userid ? false : true;

            if ((isMember && !isManager) || (isManager && joinrequestbuttons.managerCount > 1)) {
                // we have either a group member or manager, but not the last group manager
                showButton("leave");
            }
            else if ((isManager && joinrequestbuttons.managerCount === 1) ||
                (!isMember && joinrequestbuttons.joinability ===
                    sakai.config.Permissions.Groups.joinable.manager_add) ||
                isAnon) {
                // we have either the last group manager or a non-member with
                // joinability set to 'only managers can add' or an anonymous user
                hideButtons();
            }
            else if (!isMember && !isAnon && joinrequestbuttons.joinability ===
                sakai.config.Permissions.Groups.joinable.user_direct) {
                // we have a non-member with joinability set to 'users can join directly'
                showButton("join");
            }
            else if (!isMember && !isAnon && joinrequestbuttons.joinability ===
                sakai.config.Permissions.Groups.joinable.user_request) {
                // we have a non-member with joinability set to 'users must request to join'

                /**
                 * Function to loop through join requests in search of a request
                 * from the current user
                 */
                var searchForJoinRequest = function (reqs) {
                    var foundRequest = false;
                    $.each(reqs, function (i, req) {
                        if (req.userid === sakai.data.me.user.userid) {
                            foundRequest = true;
                            return false;  // will break the $.each loop
                        }
                    });
                    if (foundRequest) {
                        // user has a pending join request
                        showButton("pending");
                    } else {
                        // user has not requested to join
                        showButton("request");
                    }
                };

                // has this user already requested to join the group? Search the list of join requests
                if (joinrequestbuttons.joinrequests) {
                    if (joinrequestbuttons.joinrequests.length) {
                        searchForJoinRequest(joinrequestbuttons.joinrequests);
                    } else {
                        // no requests
                        showButton("request");
                    }
                } else {
                    sakai.api.Groups.getJoinRequests(joinrequestbuttons.groupid,
                    function (success, data) {
                        if (success) {
                            if (data.results && data.results.length) {
                                searchForJoinRequest(data.results);
                            } else {
                                // no requests
                                showButton("request");
                            }
                        } else {
                            // not sure if this user has requested, show request button
                            showButton("request");
                            debug.warn("Could not get join requests for group id: " +
                                joinrequestbuttons.groupid);
                        }
                    },
                    false);  // this is an non-async call
                }
            }
            else {
                // unrecognized combination of user and joinability setting
                hideButtons();
            }

            if (joinrequestbuttons.onShow && typeof(joinrequestbuttons.onShow) === "function") {
                joinrequestbuttons.onShow($("#joinrequestbuttons_widget"));
            }
        };


        /////////////////////////////
        // Event Bindings          //
        /////////////////////////////

        $joinrequestbuttons_request.live("click", function (ev) {
            var groupid = this.id.split("joinrequestbuttons_request_")[1];
            if (!groupid || $.trim(groupid) === "") {
                debug.error("No group id found");
                return false;
            }
            if (!sakai.data.me.user.userid) {
                debug.error("Anonymous user tried to request group (id: " + groupid +
                    ") membership");
                return false;
            }
            sakai.api.Groups.addJoinRequest(sakai.data.me, groupid, joinrequestbuttons.groupData,
            function (success) {
                if (success) {
                    // show a notification and change the button
                    sakai.api.Util.notification.show($joinrequestbuttons_group_membership.text(),
                        $joinrequestbuttons_group_request_sent.text(),
                        sakai.api.Util.notification.type.INFORMATION);
                    showButton("pending");
                } else {
                    sakai.api.Util.notification.show($joinrequestbuttons_group_membership.text(),
                        $joinrequestbuttons_group_problem_with_request.text(),
                        sakai.api.Util.notification.type.ERROR);
                }
                // call callback
                if (joinrequestbuttons.requestCallback &&
                    typeof(joinrequestbuttons.requestCallback) === "function") {
                    joinrequestbuttons.requestCallback(success, groupid);
                }
            });
        });

        $joinrequestbuttons_join.live("click", function (ev) {
            hideButtons();
            var groupid = this.id.split("joinrequestbuttons_join_")[1];
            if (!groupid || $.trim(groupid) === "") {
                debug.error("No group id found");
                return false;
            }
            if (!sakai.data.me.user.userid) {
                debug.error("Anonymous user tried to join group id: " + groupid);
                return false;
            }
            sakai.api.Groups.addUsersToGroup(groupid, "members",
                [{user: sakai.data.me.user.userid}], sakai.data.me, false, function(success) {
                if (success) {
                    sakai.api.Util.notification.show($joinrequestbuttons_group_membership.text(),
                        $joinrequestbuttons_group_adding_successful.text(),
                        sakai.api.Util.notification.type.INFORMATION);
                    showButton("leave");
                } else {
                    debug.error("Could not add member: " + sakai.data.me.user.userid +
                        " to groupid: " + groupid);
                    sakai.api.Util.notification.show($joinrequestbuttons_group_membership.text(),
                        $joinrequestbuttons_group_problem_adding.text(),
                        sakai.api.Util.notification.type.ERROR);
                }
                // call callback
                if (joinrequestbuttons.joinCallback &&
                    typeof(joinrequestbuttons.joinCallback) === "function") {
                    joinrequestbuttons.joinCallback(success, groupid);
                }
            });
        });

        $joinrequestbuttons_leave.live("click", function (ev) {
            var groupid = this.id.split("joinrequestbuttons_leave_")[1];
            if (!groupid || $.trim(groupid) === "") {
                debug.error("No group id found");
                return false;
            }
            if (!sakai.data.me.user.userid) {
                debug.error("Anonymous user tried to leave group id: " + groupid);
                return false;
            }

            // if this user is a manager, we need to remove them from the manager group
            var groupType = "members";
            if (sakai.api.Groups.isCurrentUserAManager(groupid, sakai.data.me)) {
                groupType = "managers";
            }
            sakai.api.Groups.removeUsersFromGroup(groupid, groupType,
                [sakai.data.me.user.userid], sakai.data.me, function (success) {
                if (success) {
                    $(window).trigger("updated.counts.lhnav.sakai");
                    sakai.api.Util.notification.show($joinrequestbuttons_group_membership.text(),
                        $joinrequestbuttons_group_removal_successful.text(),
                        sakai.api.Util.notification.type.INFORMATION);
                    // re-render to determine which button to now show
                    render();
                } else {
                    sakai.api.Util.notification.show($joinrequestbuttons_group_membership.text(),
                        $joinrequestbuttons_group_problem_removing.text(),
                        sakai.api.Util.notification.type.ERROR);
                }
                // call callback
                if (joinrequestbuttons.leaveCallback &&
                    typeof(joinrequestbuttons.leaveCallback) === "function") {
                    joinrequestbuttons.leaveCallback(success, groupid);
                }
            });
        });


        /////////////////////////////
        // Initialization          //
        /////////////////////////////

        /**
         * Initializes and renders the joinrequest buttons.  The following params
         * should be sent while triggering the event:
         *  {Object} groupData    the profile of the group for which buttons need to be rendered
         *  {String} groupid      the id of the group for which buttons need to be rendered
         *  {String} joinability  the group's joinability setting
         *  {int} managerCount    optional number of managers in the group, defaults to 1
         *  {Function} onShow     optional callback function called when the buttons are rendered
         *  {Function} requestCallback  optional callback function called when the 'Request to join' button is clicked
         *  {Function} joinCallback     optional callback function called when the 'Join' button is clicked
         *  {Function} leaveCallback    optional callback function called when the 'Leave' button is clicked
         *  {Object} joinrequests  optional joinrequest data from the server. If not provided, this
         *      widget will issue a server request to get the data if needed.
         */
        $(window).bind("init.joinrequestbuttons.sakai", function (ev, groupData, groupid,
            joinability, managerCount, onShow, requestCallback, joinCallback, leaveCallback,
            joinrequests) {
            if (!groupid || !joinability) {
                return;
            }
            joinrequestbuttons.groupData = groupData;
            joinrequestbuttons.groupid = groupid;
            joinrequestbuttons.joinability = joinability;
            joinrequestbuttons.managerCount = managerCount || 1;
            joinrequestbuttons.onShow = onShow || false;
            joinrequestbuttons.joinrequests = joinrequests || false;
            joinrequestbuttons.requestCallback = requestCallback || false;
            joinrequestbuttons.joinCallback = joinCallback || false;
            joinrequestbuttons.leaveCallback = leaveCallback || false;
            render();
        });
        $(window).trigger("ready.joinrequestbuttons.sakai");
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("joinrequestbuttons");
});
