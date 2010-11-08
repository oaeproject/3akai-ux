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
/*global $, Config, jQuery, sakai */

var sakai = sakai || {};

/**
 * @name sakai.joinrequests
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
sakai.joinrequests = function (tuid, showSettings) {

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var numJoinrequests = 0;  // keeps track of the total number of requests

    // DOM elements
    var $rootel = $("#" + tuid);
    var $joinrequestsWidget = $(".joinrequests_widget", $rootel);
    var $joinrequests = $("#joinrequests_joinrequests", $rootel);
    var $joinrequestsTemplate = $("#joinrequests_template", $rootel);
    var $addLink = $("a.joinrequests_add_link", $rootel);
    var $ignoreLink = $("a.joinrequests_ignore_link", $rootel);


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
    var renderJoinRequests = function (joinrequests) {
        if (joinrequests) {
            // populate template with data
            var json = {
                "joinrequests": joinrequests
            };
            $joinrequests.html($.TemplateRenderer($joinrequestsTemplate, json));
            // set images for users that have a profile picture
            for (var i in joinrequests) {
                if (joinrequests.hasOwnProperty(i)) {
                    var pic_src = "/dev/_images/default_profile_picture_64.png";
                    if (joinrequests[i].pic_src) {
                        var pic_src_json = $.parseJSON(joinrequests[i].pic_src);
                        pic_src = "/~" + joinrequests[i].userid +
                            "/public/profile/" + pic_src_json.name;
                    }
                    $("#joinrequests_userpicture_" + joinrequests[i].userid).attr(
                        "src", pic_src
                    );
                }
            }
            // show the widget
            $joinrequestsWidget.show();
        }
    };


    /**
     * Returns a human readable date and time based on the given jcr:created
     * timestamp. WARNING--THIS FUNCTION IS NOT SAFE TO USE IN ALL BROWSERS
     *
     * @param {String} jcr_created jcr:created timestamp to convert
     * @return {String} human readable date
     */
    var getReadableRequestAge = function (jcr_created) {
        if (jcr_created && typeof(jcr_created) === "string") {
            var date = new Date(jcr_created);
            if (date) {
                return date.toLocaleString();
            } else {
                return jcr_created;
            }
        } else {
            // not sure what this is - just send it back
            return jcr_created;
        }
    };


    /**
     * Fetches join requests from the server
     */
    var getJoinRequestsData = function () {
        // get join requests from server
        sakai.api.Groups.getJoinRequests(sakai.currentgroup.id, function (success, data) {
            if (success) {
                // process joinrequest data for UI
                if (data && data.total && data.total > 0) {
                    numJoinrequests = data.total;
                    var joinrequests = [];
                    for (var i in data.results) {
                        if (data.results.hasOwnProperty(i)) {
                            var jr = data.results[i];
                            joinrequests.push({
                                "userid": jr.userid,
                                "firstName": jr.basic.elements.firstName.value,
                                "lastName": jr.basic.elements.lastName.value,
                                "request_age": $.timeago(jr["jcr:created"]),
                                "pic_src": jr.picture
                            });
                        }
                    }
                    renderJoinRequests(joinrequests);
                }
            } else {
                // log error
                debug.error("joinrequests.js/getJoinRequestsData() ERROR: Could not get join requests for group: " +
                    sakai.currentgroup.id + " - error status: " + data.textStatus);
            }
        });
    };


    /**
     * Adds a user to the current group
     *
     * @param {String} userid The ID of the user to add to the current group
     */
    var addUser = function (userid) {
        // add user to group
        sakai.api.Groups.addToGroup(userid, sakai.currentgroup.id,
        function (success, data) {
            if (success) {
                // show notification
                sakai.api.Util.notification.show("Group Membership",
                    $("#joinrequests_username_link_" + userid).html() +
                    " has successfully been added to the group.");

                // trigger the member list on group_edit.html to refresh
                $(window).trigger("sakai-listpeople-ready", "members");

                // remove join request from UI and server
                removeJoinRequest(userid);
            } else {
                debug.error("joinrequests.js/addUser() ERROR: Could not add member: " +
                    userid + " to groupid: " + sakai.currentgroup.id +
                    " - error status: " + data.textStatus);
                sakai.api.Util.notification.show("Group Membership", "Sorry, there was a problem while adding the user to the group. We've notified system administrators. Please try again later or contact an administrator if the issue persists.");
            }
        });
    };


    /**
     * Removes a join request from the UI and the server
     *
     * @param {String} userid The ID of the user whose join request to remove
     */
    var removeJoinRequest = function (userid) {
        // remove join request from server
        sakai.api.Groups.removeJoinRequest(userid, sakai.currentgroup.id,
        function (success, data) {
            if (success) {
                // remove the UI joinrequest element
                $("#joinrequests_joinrequest_" + userid, $rootel).remove();
                if (--numJoinrequests === 0) {
                    $joinrequestsWidget.hide();
                }
            } else {
                debug.error("joinrequests.js/ignoreUser() ERROR: Could not remove join request for: " +
                    userid + " from groupid: " + sakai.currentgroup.id +
                    " - error status: " + data.textStatus);
                sakai.api.Util.notification.show("Group Membership", "Sorry, there was a problem while ignoring the join request. We've notified system administrators. Please try again later or contact an administrator if the issue persists.");
                hideSpinner(userid);
            }
        });
    };


    /**
     * Shows an AJAX loading spinner while the user's join request is processed
     *
     * @param {String} userid The ID of the user whose join request is being processed
     */
    var showSpinner = function (userid) {
        $("#joinrequests_actions_" + userid).hide();
        $("#joinrequests_loading_" + userid).show();
    };


    /**
     * Hides the AJAX loading spinner once the user's join request is processed
     *
     * @param {String} userid The ID of the user whose join request has been processed
     */
    var hideSpinner = function (userid) {
        $("#joinrequests_loading_" + userid).hide();
        $("#joinrequests_actions_" + userid).show();
    };


    /////////////////////////////
    // Event Bindings          //
    /////////////////////////////

    // Add the specific user when the 'Add as a member' link is clicked
    $addLink.live("click", function () {
        var userid = this.id.split("_")[2];
        showSpinner(userid);
        addUser(userid);
    });

    // Ignore the specific user when the 'Ignore' link is clicked
    $ignoreLink.live("click", function () {
        var userid = this.id.split("_")[2];
        showSpinner(userid);
        removeJoinRequest(userid);
    });


    /////////////////////////////
    // Initialization          //
    /////////////////////////////

    /**
     * Initialization function run when the widget loads
     */
    var init = function () {
        // get join request data
        getJoinRequestsData();
    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("joinrequests");