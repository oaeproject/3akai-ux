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


/*global Config, $ */

var sakai = sakai || {};

sakai.mysakai = function(){


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var showHideMoreMenu = function(hideOnly){
        var el = $("#more_menu");
        if (el) {
            if (el.css("display").toLowerCase() !== "none" || hideOnly) {
                $("#more_link").removeClass("clicked");
                el.hide();
            } else {
                $("#more_link").addClass("clicked");
                var x = $("#more_link").position().left;
                var y = $("#more_link").position().top;
                el.css(
                        {
                          "top": y + 28 + "px",
                          "left": x + 2 + "px"
                        }
                    ).show();
            }
        }
    };

    // Bind Insert Link click event
    $("#more_link").live("click", function(ev){
        showHideMoreMenu(false);
    });
    // Bind mousedown and mouseup to give an optional clicking effect via css
    $("#more_link").live("mousedown", function(e) {
        $("#more_link").addClass("clicking");
    });
    $("#more_link").live("mouseup", function(e) {
        $("#more_link").removeClass("clicking");
    });

    $("#more_customize_page").live("click", function() {
        sakai.dashboard.showAddWidgetDialog();
        showHideMoreMenu(true);
    });

    $("#more_change_layout").live("click", function() {
        sakai.dashboard.changeLayout();
        showHideMoreMenu(true);
    });

    $("html").live("click", function(e) {
        if (!($(e.target).is("#more_menu") || $(e.target).parents("#more_menu").length || $(e.target).is("#more_link") || $(e.target).parents("#more_link").length)) {
            showHideMoreMenu(true);
        }
    });

    /**
     * Init function for the mysakai page
     */
    var init = function(){

        // Initialise the entity widget
        $(window).bind("sakai.api.UI.entity.ready", function(e){
            sakai.api.UI.entity.render("myprofile", false);
        });

        // Insert the widget in before the changepic widget, we do this here to add in the userid dynamically and to get it in the first pass
        // of insertWidgets to reduce HTTP requests
        $("#widget_changepic").before(sakai.api.Security.saneHTML("<div id='widget_dashboard_mysakaidashboard_/~" + sakai.data.me.user.userid + "/dashboard/' class='widget_inline'></div>"));

        $(window).bind("sakai.dashboard.ready", function(e, tuid) {
            sakai.dashboard.init("/~" + sakai.data.me.user.userid + "/dashboardwidgets/", true, "personalportal", true);
        });

        // If the user isn't logged in, redirect them to do so, as the dashboard is relevant
        // only when you're logged in
        $(window).bind("sakai.dashboard.notLoggedIn sakai.dashboard.notUsersDashboard", function(e) {
            document.location = sakai.config.URL.GATEWAY_URL;
        });

    };

    init();

};

sakai.api.Widgets.Container.registerForLoad("sakai.mysakai");