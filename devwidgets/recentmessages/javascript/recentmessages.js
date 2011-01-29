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
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.recentmessages
     *
     * @class recentmessages
     *
     * @description
     * Initialize the recentmessages widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentmessages = function(tuid, showSettings){


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
        var ellipsisContainer = ".recentmessages_ellipsis_container";


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
                response.sakai = sakai;
                // Only if everything went fine, show the recent messages
                $recentmessagesContainer.html(sakai.api.Util.TemplateRenderer(recentmessagesTemplate, response));

                // make sure the newly added content is properly styled with
                // threedots truncation
                $(ellipsisContainer, rootel).ThreeDots({
                    max_rows: 1,
                    text_span_class: "recentmessages_ellipsis_text",
                    e_span_class: "recentmessages_e_span_class",
                    whole_word: false,
                    alt_text_t: true
                });
                // need to define for chrome...if
                $(ellipsisContainer).css("display","inline");
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
                items: 4,
                sortOn: "sakai:created",
                sortOrder: "descending",
                page: 0
            });

            // Fire an Ajax request to get the recent messages for the current user
            $.ajax({
                url: sakai.config.URL.MESSAGE_BOX_SERVICE + "?" + params,
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

});
