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

/**
 * @name sakai.mycontent
 *
 * @class mycontent
 *
 * @description
 * The 'My Content' widget shows the five most recently updated
 * content items the user manages.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.mycontent = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // DOM identifiers
    var rootel = $("#" + tuid);
    var uploadLink = "#upload_link";
    var fileuploadContainer = "#fileupload_container";


    ///////////////////////
    // Utility functions //
    ///////////////////////


    ////////////////////
    // Event Handlers //
    ////////////////////

    // Clicking to upload content
    $(uploadLink, rootel).click(function(ev){
        $(fileuploadContainer).show();
        sakai.fileupload.initialise();
        return false;
    });


    /////////////////////////////
    // Initialization function //
    /////////////////////////////

    var init = function() {
        // get list of content items
        // - JSON file at /var/search/pool/me/manager.json?q=* is empty:
        // -- {"items":25,"total":0,"results":[],"totals":{"sakai:tags":[]}}
        // ? where is server-side API documentation/code?

        // render the list of content items
        // - thinking about following the mygroups example
        // ? how does HTML scripting work? -- i.e. <ul> in mygroups.html
        //
        // - file link should be: /dev/content_profile.html#content_path=path
        // ? guessing correct path should come through manager.json
    };

    // run init() function when sakai.content object loads
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("mycontent");