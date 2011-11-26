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
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.joinrequests
     *
     * @class joinrequests
     *
     * @description
     * The Join Requests widget manages join requests for a specific group. Its
     * primary placement is at the top of group_edit.html
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.joinrequests = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var numJoinrequests = 0,  // keeps track of the total number of requests
            groupid = "",
            joinGroupID = "",
            joinRole = "",
            groupData = {};

        // DOM elements
        var $rootel = $("#" + tuid);
        var $joinrequestsWidget = $(".joinrequests_widget", $rootel);
        var $joinrequests = $("#joinrequests_joinrequests", $rootel);
        var $joinrequestsTitle = $("#joinrequests_title", $rootel);
        var $joinrequestsError = $("#joinrequests_error", $rootel);
        var $joinrequestsSuccess = $("#joinrequests_success", $rootel);
        var $joinrequestsTemplate = $("#joinrequests_template", $rootel);
        var $addLink = $(".joinrequests_add_link");
        var $ignoreLink = $(".joinrequests_ignore_link");
        var $joinrequests_container = $("#joinrequests_container");


        /**
         * Renders the joinrequests widget with the given joinrequests array
         *
         * @param {Array} joinrequests Array of joinrequest Objects to display,
         * formatted for the UI.  Each joinrequest Object should contain:
         * {
         *    "userid": <userid>,
         *    "firstName": <user's first name>,
         *    "lastName": <user's last name>,
         *    "request_age": <request create-date, JS Date.toLocaleString() value>
         * }
         */
        var renderJoinRequests = function(joinrequests) {
            if (joinrequests) {
                // populate template with data
                var json = {
                    "joinrequests": joinrequests,
                    "joinrole": joinRole
                };
                $joinrequests.html(sakai.api.Util.TemplateRenderer($joinrequestsTemplate, json));
                // show the widget
                $joinrequestsWidget.show();
            }
        };

        /**
         * Fetches join requests from the server
         */
        var getJoinRequestsData = function(joinGroupID) {
            // get join requests from server
            sakai.api.Groups.getJoinRequests(joinGroupID, function (success, data) {
                if (success) {
                    // process joinrequest data for UI
                    if (data && data.total && data.total > 0) {
                        numJoinrequests = data.total;
                        var joinrequests = [];
                        for (var i in data.results) {
                            if (data.results.hasOwnProperty(i)) {
                                var jr = data.results[i];
                                var displayName = sakai.api.User.getDisplayName(jr);
                                if (automaticallyAcceptUser(jr.userid)) {
                                    addUser(jr.userid, displayName);
                                } else {
                                    joinrequests.push({
                                        "userid": jr.userid,
                                        "displayName": displayName,
                                        "request_age": $.timeago(jr["_created"]),
                                        "pic_src": sakai.api.User.getProfilePicture(jr)
                                    });
                                }
                            }
                        }
                        renderJoinRequests(joinrequests);
                    }
                }
            });
        };


        /**
         * Returns whether or not the given user should automatically be accepted
         * based on the 'accept' URL param.
         *
         * @param {String} userid The ID of the user that may need to be
         * automatically accepted
         * @return {Boolean} true if the given user's join request should be
         * automatically accepted, false otherwise
         */
        var automaticallyAcceptUser = function(userid) {
            if (_.isString(userid)) {
                var request = new Querystring();
                return request.get("accept", null) === userid;
            } else {
                return false;
            }
        };

        // TODO when adding users we should refresh the entity widget so it stays
        // in sync with the new participant count
        var resetEntityCounts = function() {
        };

        /**
         * Adds a user to the current group
         *
         * @param {String} userid The ID of the user to add to the current group
         */
        var addUser = function(userid, displayName) {
            // add user to group
            var userToAdd = {
                "user": userid,
                "permission": groupData["sakai:joinRole"]
            };
            sakai.api.Groups.addUsersToGroup(groupid, [userToAdd], sakai.data.me, false, function(success) {
                if (success) {
                    // show notification
                    var name = displayName;
                    if (!name) {
                        name = $("#joinrequests_username_link_" + userid).html();
                    }
                    sakai.api.Util.notification.show($joinrequestsTitle.html(), name + " " + $joinrequestsSuccess.html());

                    // trigger the member list on group_edit.html to refresh
                    $(window).trigger("ready.listpeople.sakai", "members");

                    // remove join request from UI and server
                    removeJoinRequest(userid);
                } else {
                    sakai.api.Util.notification.show($joinrequestsTitle.html(), $joinrequestsError.html());
                }
            });
        };


        /**
         * Removes a join request from the UI and the server
         *
         * @param {String} userid The ID of the user whose join request to remove
         */
        var removeJoinRequest = function(userid) {
            // remove join request from server
            sakai.api.Groups.removeJoinRequest(userid, joinGroupID, function(success) {
                if (success) {
                    $("#joinrequests_loading_" + userid).hide();
                    // remove the UI joinrequest element
                    $("#joinrequests_joinrequest_" + userid).fadeOut(function() {
                        $(this).remove();
                        numJoinrequests -= 1;
                        if (numJoinrequests === 0) {
                            $joinrequests_container.jqmHide();
                        }
                    });
                } else {
                    sakai.api.Util.notification.show($joinrequestsTitle.html(), $joinrequestsError.html());
                    hideSpinner(userid);
                }
            });
        };


        /**
         * Shows an AJAX loading spinner while the user's join request is processed
         *
         * @param {String} userid The ID of the user whose join request is being processed
         */
        var showSpinner = function(userid) {
            $("#joinrequests_actions_" + userid).hide();
            $("#joinrequests_loading_" + userid).show();
        };


        /**
         * Hides the AJAX loading spinner once the user's join request is processed
         *
         * @param {String} userid The ID of the user whose join request has been processed
         */
        var hideSpinner = function(userid) {
            $("#joinrequests_loading_" + userid).hide();
            $("#joinrequests_actions_" + userid).show();
        };

        /**
         * Callback for onHide for the JQM
         */
        var handleJQMHide = function(h){
            resetEntityCounts();
            h.w.hide();
            if (h.o) {
                h.o.remove();
            }
        };

        /////////////////////////////
        // Event Bindings          //
        /////////////////////////////

        // Add the specific user when the 'Add as a member' link is clicked
        $addLink.live("click", function() {
            var userid = this.id.split("_")[2];
            showSpinner(userid);
            addUser(userid);
        });

        // Ignore the specific user when the 'Ignore' link is clicked
        $ignoreLink.live("click", function() {
            var userid = this.id.split("_")[2];
            showSpinner(userid);
            removeJoinRequest(userid);
        });


        /////////////////////////////
        // Initialization          //
        /////////////////////////////

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function(){
            $joinrequests_container.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                onHide: handleJQMHide
            });
        };

        var getJoinRoleTitle = function() {
            var roles = $.parseJSON(groupData["sakai:roles"]),
                ret = "";
            $.each(roles, function(i, role) {
                if (role.id === groupData["sakai:joinRole"]) {
                    ret = role.titlePlural;
                }
            });
            return sakai.api.i18n.getValueForKey(ret);
        };

        /**
         * Initialization function run when the widget loads
         */
        var init = function() {
            initializeJQM();
            // _groupdata should be the group's authprofile
            $(window).bind("init.joinrequests.sakai", function(e, _groupdata) {
                if (_groupdata && _groupdata["sakai:group-id"]) {
                    groupData = _groupdata;
                    groupid = groupData["sakai:group-id"];
                    if (groupData["sakai:joinRole"]) {
                        joinRole = getJoinRoleTitle();
                        joinGroupID = groupid + "-" + groupData["sakai:joinRole"];
                    }
                    // get join request data
                    getJoinRequestsData(joinGroupID);
                    $joinrequests_container.jqmShow();
                } else {
                    debug.warn("The group's authprofile node wasn't passed in to init.joinrequests.sakai");
                }
            });
            $(window).trigger("ready.joinrequests.sakai");
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("joinrequests");
});
