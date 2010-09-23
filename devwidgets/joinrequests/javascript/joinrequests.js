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

    // DOM elements
    var $rootel = $("#" + tuid);
    var $joinrequestsWidget = $(".joinrequests_widget", $rootel);
    var $joinrequests = $("#joinrequests_joinrequests", $rootel);
    var $joinrequestsTemplate = $("#joinrequests_template", $rootel);
    var $addLink = $("a.joinrequests_add_link", $rootel);
    var $ignoreLink = $("a.joinrequests_ignore_link", $rootel);


    var renderJoinRequests = function (joinrequests) {
        // populate template with data
        var json = {
            "joinrequests": joinrequests
        };
        $joinrequests.html($.TemplateRenderer($joinrequestsTemplate, json));
        $joinrequestsWidget.show();
    };


    var getJoinRequestsData = function () {
        // create server request (fake data for now)
        return [{
            "userid": "userx",
            "firstName": "Gaurav",
            "lastName": "Bhatnagar",
            "request_age": "1 day ago"
        },
        {
            "userid": "usery",
            "firstName": "Cedric",
            "lastName": "Diggory",
            "request_age": "55 minutes ago"
        }];
    };


    var addUser = function (userid) {
        // TODO
    };


    var ignoreUser = function (userid) {
        // TODO
    };


    /////////////////////////////
    // Event Bindings          //
    /////////////////////////////

    // Add the specific user when the 'Add as a member' link is clicked
    $addLink.click(function () {
        var userid = this.id.split("_")[2];
        addUser(userid);
    });

    // Ignore the specific user when the 'Ignore' link is clicked
    $ignoreLink.click(function () {
        var userid = this.id.split("_")[2];
        ignoreUser(userid);
    });


    /////////////////////////////
    // Initialization          //
    /////////////////////////////

    /**
     * Initialization function run when the widget loads
     */
    var init = function () {
        // get join request data
        var joinrequests = getJoinRequestsData();
        if (joinrequests && joinrequests.length) {
            // we have join requests to render
            renderJoinRequests(joinrequests);
        }
    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("joinrequests");