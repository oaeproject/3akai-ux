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

/*global sdata, fluid, window, $ */

var sakai = sakai || {};

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
    var $deletecontent_error_container = $("#deletecontent_error_container", $rootel);
    var $deletecontent_error_couldnotdelete = $("#deletecontent_error_couldnotdelete", $rootel);


    ////////////////////
    // Util functions //
    ////////////////////

    /**
     * Show an error message to the user
     * @param {String} input Which error message you need to show
     */
    var showError = function(input){

        if(input === "couldnotdelete"){
            $.TemplateRenderer($deletecontent_error_couldnotdelete, {},$deletecontent_error_container);
        }

    };


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
                    //document.location = "/dev/my_sakai.html";
                },
                error: function(){
                    showError("couldnotdelete");
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

        // Check for a valid paramter
        if(!data || typeof data !== "object"){

            // Log a console error message
            fluid.log("Delete content widget - sakai.deletecontent.init - The supplied parameter data is incorrect: '" + data + "'.");

            // Stop the execution of this function
            return;
        }

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