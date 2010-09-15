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

/*global, fluid, window, $ */

var sakai = sakai || {};

/**
 * @name sakai.deletecontent
 *
 * @class deletecontent
 *
 * @description
 * Deletecontent widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.deletecontent = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var deletedata = {};


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $deletecontent_action_delete = $("#deletecontent_action_delete", $rootel);
    var $deletecontent_dialog = $("#deletecontent_dialog", $rootel);
    var $deletecontent_error_couldnotdelete = $("#deletecontent_error_couldnotdelete", $rootel);

    // Messages
    var $deletecontent_not_successfully_deleted = $("#deletecontent_not_successfully_deleted");
    var $deletecontent_successfully_deleted = $("#deletecontent_successfully_deleted");
    var $deletecontent_deleted = $("#deletecontent_deleted");
    var $deletecontent_not_deleted = $("#deletecontent_not_deleted");


    /////////////
    // Binding //
    /////////////

    /**
     * Add binding to the various element in the delete content widget
     */
    var addBinding = function(){

        // Reinitialise the jQuery selector
        $deletecontent_action_delete = $($deletecontent_action_delete.selector);

        // Add binding to the delete button
        $deletecontent_action_delete.unbind("click").bind("click", function(){

            $.ajax({
                url: deletedata.path,
                success: function(){
                    // Show message
                    sakai.api.Util.notification.show($deletecontent_deleted.html(), $deletecontent_successfully_deleted.html());
                    // Wait for 2 seconds
                    setTimeout(function(){
                        // Relocate to the my sakai page
                        document.location = "/dev/my_sakai.html";
                    }, 2000);
                },
                error: function(){
                    sakai.api.Util.notification.show($deletecontent_not_deleted.html(), $deletecontent_not_successfully_deleted.html());
                },
                type: "POST",
                data: {
                    ":operation" : "delete"
                }
            });
        });
    };


    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * Load the delete content widget with the appropriate data
     * This function can be called from anywhere within Sakai
     * @param {Object} data A JSON object containing the necessary information.
     * @example
     *     sakai.deletecontent.init({
     *         "path": "/test.jpg"
     *     });
     */
    sakai.deletecontent.init = function(data){
        deletedata = $.extend(true, {}, data);
        addBinding();
        $deletecontent_dialog.jqmShow();
    };

    /**
     * Initialize the delete content widget
     * All the functionality in here is loaded before the widget is actually rendered
     */
    var init = function(){

        // This will make the widget popup as a layover.
        $deletecontent_dialog.jqm({
            modal: true,
            toTop: true
        });

    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("deletecontent");