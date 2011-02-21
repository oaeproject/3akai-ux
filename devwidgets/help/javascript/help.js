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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * sakai_global.help
     * a multi-purpose help dialog box
     */
    sakai_global.help = function(tuid, showSettings) {
        var profileFlag = null,
            whichHelp = null,
            profileData = null,
            forced = false,
            alreadySet = false,
            authprofileURL = "/~" +
                            sakai.data.me.user.userid +
                            "/public/authprofile";
        
        var $rootel = $("#" + tuid);
        var $help_widget = $("#help_widget", $rootel),
            $help_tooltip_widget = $("#help_widget", $rootel),
            $help_nav_ul_li_a = $(".help_nav ul li a", $rootel),
            $help_content = $(".help_content", $rootel),
            $help_close = $(".help_close", $rootel),
            $help_dont_show = $(".help_dont_show", $rootel);


        $help_widget.jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

        var showHelp = function() {
            if (profileFlag) {
                if ((!profileData[profileFlag] || 
                    profileData[profileFlag] === false) || forced) {

                    $("#help_" + whichHelp).show();
                    // profileData[profileFlag] is true if it shouldn't show, 
                    // false if it should
                    if (forced && profileData[profileFlag] === true) {
                        alreadySet = true;
                        $help_dont_show.attr("checked", true);
                    } else {
                        $help_dont_show.removeAttr("checked");
                    }
                    $help_widget.jqmShow();
                }
            }
        };

        var hideHelp = function() {
            $help_widget.jqmHide();
            $(window).trigger("sakai-help-close");
        };

        /**
         * toggleShow handles saving the user's profile data
         * If a user selects to not have this dialog shown again, a flag
         * is set on their profile. This flag (profileFlag) is set to true if
         * we should not show this again by default, false if we should
         */
        var toggleShow = function(dontShow) {
            if (profileFlag) {
                profileData[profileFlag] = dontShow;
                sakai.api.Server.saveJSON(authprofileURL, 
                    profileData, 
                    function(success, data){
                        if (dontShow) {
                            debug.info("No longer showing the dialog by default");
                        } else {
                            debug.info("Showing the dialog by default from now on");
                        }
                });
            } else {
                debug.error("Cannot disable repeat show, no profile flag set");
            }
        };

        $help_nav_ul_li_a.bind("click", function() {
            if (!$(this).hasClass("active")) {
                var allLIs = $(this).parent("li").parent("ul").children("li");
                // Position matters, of the li's and the div's in the
                // help_content container - they must match up
                var pos = $.inArray($(this).parent("li")[0], allLIs) + 1;
                $help_content.find("div:visible").hide();
                $help_content.find("div:nth-child(" + pos + ")").show();
                $(this).parent("li").parent("ul").find("a.active").removeClass("active");
                $(this).addClass("active");
            }
            return false;
        });

        $help_close.bind("click", function() {
            if ($help_dont_show.is(":checked") && !alreadySet) {
                toggleShow(true);
            } else if (alreadySet && !$help_dont_show.is(":checked")) {
                toggleShow(false);
            }
            hideHelp();
        });

        /* helpObj should contain
         * {String} whichHelp Which version of help to display
         * {String} profileFlag Flag on the current user's authprofile that
         *          determines if we should show the help or not
         * {Boolean} force If we can ignore the profile flag
         */
        $(window).bind("sakai-help-init", function(e, helpObj) {
            if (helpObj) {
                profileFlag = helpObj.profileFlag;
                whichHelp = helpObj.whichHelp;
                forced = helpObj.force || false;
                alreadySet = false;
                $.ajax({
                        url: authprofileURL + ".infinity.json",
                        cache:false,
                        success: function(profile){
                            profileData = $.extend(true, {}, profile);
                            showHelp();
                        }
                });
            } else {
                debug.error("No help mode specifed");
            }
        });

        sakai_global.help.isReady = true;
        $(window).trigger("sakai-help-ready");
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("help");
});
