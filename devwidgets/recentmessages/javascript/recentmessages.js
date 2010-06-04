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

/*global $, Config, jQuery, sakai, sdata */

sakai.recentmessages = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    // IDs
    var $recentmessagesContainer = $("#recentmessages_container", rootel);
    var $recentmessagesErrorNomessages = $("#recentmessages_error_nomessages", rootel);
    var $recentmessagesErrorNotConnected = $("#recentmessages_error_notconnected", rootel);
    var $recentmessagesListItems = $("#recentmessages_container ul li a", rootel);
    var recentmessagesTemplate = "recentmessages_template";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Render the json object in the browser.
     * @param {Object|String} response
     *     This is the json response from the server.
     *     If this parameter is a string, it is an error.
     */
    var renderRecentMessages = function(response){

        if(response === "NOT_CONNECTED"){

            // If it wasn't possible to connect to the server, show the not connected error
            $recentmessagesContainer.html($recentmessagesErrorNotConnected);
        } else if (response.total === 0){

            // If the user doesn't have any messages, show the no messages error.
            $recentmessagesContainer.html($recentmessagesErrorNomessages);
        } else {

            // Only if everything went fine, show the recent messages
            $recentmessagesContainer.html($.TemplateRenderer(recentmessagesTemplate, response));

            // Activate the ThreeDots plug-in
            $("#recentmessages_container ul li a", rootel).ThreeDots({max_rows:1});
        }
    };

    /**
     * Load the recent messages for the current user
     * @param {Object|Boolean} response
     *     The response that the server has send.
     *     If the response is false, it means we were not able to connect to the server
     */
    var loadRecentMessages = function(response){

        // Check if the request was successful
        if (response) {

            // Render the recent message for the current user.
            renderRecentMessages(response);
        }else {
            renderRecentMessages("NOT_CONNECTED");
        }
    };

    /**
     * Send a request to the message service.to get your recent messages
     */
    var doInit = function() {

        // Set a params object to set which params should be passed into the request
        var params = $.param({
            box: "inbox",
            category: "message",
            items: 4,
            page: 0
        });

        // Fire an Ajax request to get the recent messages for the current user
        $.ajax({
            url: sakai.config.URL.MESSAGE_BOXCATEGORY_SERVICE + "?" + params,
            cache: false,
            success: function(data){
                loadRecentMessages(data);
            },
            error: function() {
                loadRecentMessages(false);
            }
        });
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    doInit();

};
sakai.api.Widgets.widgetLoader.informOnLoad("recentmessages");
