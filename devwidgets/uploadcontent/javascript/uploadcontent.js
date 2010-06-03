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

/**
 * Widget that uploads content (files + links) to Sakai3
 * @param {String} tuid The unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget
 */
sakai.uploadcontent = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var uploaddata = {};


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $uploadcontent_dialog = $("#uploadcontent_dialog", $rootel);


    ////////////////////
    // Initialisation //
    ////////////////////

    sakai.uploadcontent.init = function(data){

        // Check for valid parameters
        if(!data || typeof data !== "object"){

            // If the parameters aren't valid, log an error message
            fluid.log("Upload Content widget - sakai.uploadcontent.init - the supplied data parameter is invalid: '" + data + "'");

            // Quit the execution of this function
            return;

        }

        // Clone the original data object
        uploaddata = $.extend(true, {}, data);

        // Show the jqModal
        $uploadcontent_dialog.jqmShow();

    };

    /**
     * Initial function for the widget
     * Everything in here is done before showing the widget to the user
     */
    var init = function(){

        // Initialise the jqModal
        $uploadcontent_dialog.jqm({
            modal: true,
            toTop: true
        });

    };
    init();

};

// Inform the widget loader that this widget is loaded
sdata.widgets.WidgetLoader.informOnLoad("uploadcontent");