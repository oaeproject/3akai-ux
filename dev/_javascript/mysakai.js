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


/*global Config, $, sdata */

var sakai = sakai || {};

sakai.mysakai = function(){


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Init function for the mysakai page
     */
    var init = function(){

        // Initialise the entity widget
        $(window).bind("sakai.api.UI.entity.ready", function(e){
            sakai.api.UI.entity.render("myprofile", false);
        });

        $(window).bind("sakai.dashboard.ready", function(e) {
          sakai.dashboard.init("/~" + sakai.data.me.user.userid, true, "personalportal");
        });
        
        // If the user isn't logged in, redirect them to do so, as the dashboard is relevant
        // only when you're logged in
        $(window).bind("sakai.dashboard.notLoggedIn", function(e) {
          document.location = sakai.config.URL.GATEWAY_URL;
        });

    };

    init();

};

sakai.api.Widgets.Container.registerForLoad("sakai.mysakai");