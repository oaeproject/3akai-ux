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
 * /dev/lib/misc/querystring.js (Querystring)
 * /dev/lib/jquery/plugins/jquery.cookie.js (cookie)
 */

require(["jquery", "sakai/sakai.api.core", "/dev/lib/misc/querystring.js", "/dev/lib/jquery/plugins/jquery.cookie.js"], function($, sakai) {

    /**
     * @name sakai_global.systemtour
     *
     * @class systemtour
     *
     * @description
     * Initialize the systemtour widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.systemtour = function(tuid, showSettings){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var me; // Contains information about the current user
        // Variables used to determine what the user has done
        var uploadedProfilePhoto;
        var uploadedContent;
        var sharedContent;
        var madeContactRequest;
        var halfCompletedProfile;


        ///////////////////
        // CSS SELECTORS //
        ///////////////////

        var $rootel = $("#" + tuid); // Get the main div used by the widget
        var $systemtourContainer = $("#systemtour_container", $rootel);
        var $systemtourProgressBar = $("#systemtour_progress_bar", $rootel);
        var $systemtourRemoveWidget = $("#systemtour_remove_widget", $rootel);
        var $systemtourCloseWidget = $("#systemtour_close_widget", $rootel);

        // Progress bar buttons
        var $systemtourButton = $(".systemtour_button", $rootel);
        var $systemtourAddPhoto = $("#systemtour_add_photo", $rootel);
        var $systemtourUploadFile = $("#systemtour_upload_file", $rootel);
        var $systemtourShareContent = $("#systemtour_share_content", $rootel);
        var $systemtourInvitedSomeone = $("#systemtour_add_contacts", $rootel);
        var $systemtourHalfCompleteProfile = $("#systemtour_edit_profile", $rootel);
        var $systemtourAddPhotoComplete = $("#systemtour_add_photo .systemtour_item_complete", $rootel);
        var $systemtourUploadFileComplete = $("#systemtour_upload_file .systemtour_item_complete", $rootel);
        var $systemtourShareContentComplete = $("#systemtour_share_content .systemtour_item_complete", $rootel);
        var $systemtourInvitedSomeoneComplete = $("#systemtour_add_contacts .systemtour_item_complete", $rootel);
        var $systemtourHalfCompleteProfileComplete = $("#systemtour_edit_profile .systemtour_item_complete", $rootel);


        ////////////////////////
        // Utility  functions //
        ////////////////////////

        /**
         * Updates the progress data based
         */
        var updateProgressData = function(){
            me = sakai.data.me;
            uploadedProfilePhoto = me.profile.userprogress.uploadedProfilePhoto;
            uploadedContent = me.profile.userprogress.uploadedContent;
            sharedContent = me.profile.userprogress.sharedContent;
            madeContactRequest = me.profile.userprogress.madeContactRequest;
            halfCompletedProfile = me.profile.userprogress.halfCompletedProfile;
        };

        /**
         * Updates the progress bar based on actions the user has already performed
         */
        var updateProgressBar = function(){
            if (uploadedProfilePhoto) {
                $systemtourAddPhoto.find(".systemtour_item_complete").addClass("systemtour_item_complete_full");
            }
            if (uploadedContent) {
                $systemtourUploadFile.find(".systemtour_item_complete").addClass("systemtour_item_complete_full");
            }
            if (sharedContent) {
                $systemtourShareContent.find(".systemtour_item_complete").addClass("systemtour_item_complete_full");
            }
            if (madeContactRequest) {
                $systemtourInvitedSomeone.find(".systemtour_item_complete").addClass("systemtour_item_complete_full");
            }
            if (halfCompletedProfile) {
                $systemtourHalfCompleteProfile.find(".systemtour_item_complete").addClass("systemtour_item_complete_full");
            }
        };

        /**
         * Temporary hides the progress bar
         */
        var hideProgressBar = function(){
            $systemtourContainer.hide();
            $.cookie("sakai.systemtour.hide", "true");
        };

        /**
         * Permanently hides the progress bar
         */
        var removeProgressBar = function(){
            var curDate = new Date();
            var curTimestamp = curDate.getTime();
            var progressData = {
                "hideSystemTour": true,
                "reminderTimestamp": curTimestamp
            };
            var authprofileURL = "/~" + me.user.userid + "/public/authprofile/userprogress";
            sakai.api.Server.saveJSON(authprofileURL, progressData, function(success, data){
                // Check whether save was successful
                if (success) {
                    $(window).unbind("sakai-systemtour-update");
                    $systemtourContainer.hide();
                }
            });
        };

        /**
         * Hides selected buttons
         */
        var hideSelected = function(){
            $systemtourButton.parent().removeClass("systemtour_1_selected");
            $systemtourButton.parent().removeClass("systemtour_2_selected");
            $systemtourButton.parent().removeClass("systemtour_3_selected");
            $systemtourButton.parent().removeClass("systemtour_4_selected");
            $systemtourButton.parent().removeClass("systemtour_5_selected");
            $systemtourButton.removeClass("systemtour_button_selected");
        };

        /**
         * Starts the specified tour
         * {String} id The tour we want to start
         */
        var startTour = function(id){
            $(window).trigger("sakai-tooltip-close");
            hideSelected();
            var tooltipData,
                contentLink,
                hashPos,
                newContentLink;
            switch (id) {
                case "systemtour_add_photo":
                    $(".systemtour_1").addClass("systemtour_1_selected");
                    $(".systemtour_1 a").addClass("systemtour_button_selected");
                    tooltipData = {
                        "tooltipSelector":"#changepic_container_trigger",
                        "tooltipTitle":"TOOLTIP_ADD_MY_PHOTO",
                        "tooltipDescription":"TOOLTIP_ADD_MY_PHOTO_P1",
                        "tooltipArrow":"top"
                    };
                    $(window).trigger("sakai-tooltip-init", tooltipData);
                    break;
                case "systemtour_edit_profile":
                    $(".systemtour_2").addClass("systemtour_2_selected");
                    $(".systemtour_2 a").addClass("systemtour_button_selected");
                    tooltipData = {
                        "tooltipSelector":"#entity_edit_profile",
                        "tooltipTitle":"TOOLTIP_EDIT_MY_PROFILE",
                        "tooltipDescription":"TOOLTIP_EDIT_MY_PROFILE_P1",
                        "tooltipArrow":"top"
                    };
                    $(window).trigger("sakai-tooltip-init", tooltipData);
                    if ($("#entity_edit_profile").attr("href") && $("#entity_edit_profile").attr("href").indexOf("editprofiletour") === -1) {
                        $("#entity_edit_profile").attr("href", $("#entity_edit_profile").attr("href") + "?editprofiletour=true");
                    }
                    break;
                case "systemtour_upload_file":
                    $(".systemtour_3").addClass("systemtour_3_selected");
                    $(".systemtour_3 a").addClass("systemtour_button_selected");
                    tooltipData = {
                        "tooltipSelector":"#mycontent_footer_upload_link",
                        "tooltipTitle":"TOOLTIP_UPLOAD_CONTENT",
                        "tooltipDescription":"TOOLTIP_UPLOAD_CONTENT_P1",
                        "tooltipArrow":"bottom"
                    };
                    $(window).trigger("sakai-tooltip-init", tooltipData);
                    break;
                case "systemtour_share_content":
                    $(".systemtour_4").addClass("systemtour_4_selected");
                    $(".systemtour_4 a").addClass("systemtour_button_selected");
                    if (!uploadedContent){
                        tooltipData = {
                            "tooltipSelector":"#mycontent_footer_upload_link",
                            "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                            "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P1",
                            "tooltipArrow":"bottom",
                            "tooltipTop":45
                        };
                    } else {
                        tooltipData = {
                            "tooltipSelector":"#mycontent_footer_upload_link",
                            "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                            "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P2",
                            "tooltipArrow":"bottom",
                            "tooltipTop":70,
                            "tooltipLeft":-100
                        };
                        $(".mycontent_item_link").each(function(index) {
                            if ($(this).attr("href") && $(this).attr("href").indexOf("sharecontenttour") === -1) {
                                contentLink = $(this).attr("href");
                                hashPos = contentLink.indexOf("#");
                                newContentLink = contentLink.substr(0, hashPos) + "?sharecontenttour=true" + contentLink.substr(hashPos);
                                $(this).attr("href", newContentLink);
                            }
                        });
                    }
                    $(window).trigger("sakai-tooltip-init", tooltipData);
                    break;
                case "systemtour_add_contacts":
                    $(".systemtour_5").addClass("systemtour_5_selected");
                    $(".systemtour_5 a").addClass("systemtour_button_selected");
                    tooltipData = {
                        "tooltipSelector":"#mycontacts_footer_search",
                        "tooltipTitle":"TOOLTIP_ADD_CONTACTS",
                        "tooltipDescription":"TOOLTIP_ADD_CONTACTS_P1",
                        "tooltipArrow":"bottom"
                    };
                    if ($("#mycontacts_footer_search").attr("href") && $("#mycontacts_footer_search").attr("href").indexOf("addcontactstour") === -1) {
                        contentLink = $("#mycontacts_footer_search").attr("href");
                        hashPos = contentLink.indexOf("#");
                        newContentLink = contentLink.substr(0, hashPos) + "?addcontactstour=true" + contentLink.substr(hashPos);
                        $("#mycontacts_footer_search").attr("href", newContentLink);
                    }
                    if ($("#navigation_people_link").attr("href") && $("#navigation_people_link").attr("href").indexOf("addcontactstour") === -1) {
                        contentLink = $("#navigation_people_link").attr("href");
                        hashPos = contentLink.indexOf("#");
                        newContentLink = contentLink.substr(0, hashPos) + "?addcontactstour=true" + contentLink.substr(hashPos);
                        $("#navigation_people_link").attr("href", newContentLink);
                    }
                    $(window).trigger("sakai-tooltip-init", tooltipData);
                    break;
            }
        };

        /**
         * Checks if user is in the edit profile tour and displays the final tooltip
         */
        var checkEditProfileTour = function(){
            if (halfCompletedProfile){
                // display tooltip
                var tooltipData = {
                    "tooltipSelector":"#systemtour_edit_profile",
                    "tooltipTitle":"TOOLTIP_EDIT_MY_PROFILE",
                    "tooltipDescription":"TOOLTIP_EDIT_MY_PROFILE_P4",
                    "tooltipArrow":"top",
                    "tooltipTop":25,
                    "tooltipLeft":40,
                    "tooltipAutoClose":true
                };
                $(".systemtour_2").addClass("systemtour_2_selected");
                $(".systemtour_2 a").addClass("systemtour_button_selected");
                if (!sakai_global.tooltip || !sakai_global.tooltip.isReady) {
                    $(window).bind("sakai-tooltip-ready", function() {
                        $(window).trigger("sakai-tooltip-init", tooltipData);
                    });
                } else {
                    $(window).trigger("sakai-tooltip-init", tooltipData);
                }
            }
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        /**
         * Add binding to widget elements
         */
        var addBinding = function(){
            $(window).bind("sakai-tooltip-closed", function() {
                hideSelected();
            });

            $systemtourButton.live("click", function () {
                var id = $(this).attr("id");
                startTour(id);
                return false;
            });

            $("#systemtour_tooltip_upload_file").live("click", function () {
                startTour("systemtour_upload_file");
                return false;
            });

            $systemtourCloseWidget.bind("click", function () {
                hideProgressBar();
                return false;
            });

            $systemtourRemoveWidget.bind("click", function () {
                removeProgressBar();
                return false;
            });

            $(window).bind("sakai-systemtour-update", function() {
                // update progress bar when data has changed
                updateProgressData();
                updateProgressBar();
            });
        };


        /////////////////////////////
        // Initialisation function //
        /////////////////////////////

        /**
         * Initialise the widget
         */
        var doInit = function(){
            if (!sakai.data.me.profile.userprogress){
                sakai.data.me.profile.userprogress = {};
            }

            // checks user progress and displays reminder tooltips
            // wait for some widgets to load before checking
            if (!sakai.mycontent || !sakai.mycontent.isReady) {
                $(window).bind("sakai-mycontent-ready", function() {
                    sakai.api.User.checkUserProgress();
                });
            } else {
                sakai.api.User.checkUserProgress();
            }

            updateProgressData();

            var checkEditProfileProgress = false;
            var querystring = new Querystring();
            if (querystring.contains("editprofiletour") && querystring.get("editprofiletour") === "true"){
                checkEditProfileProgress = true;
            }

            var hide = $.cookie("sakai.systemtour.hide");

            // if user has not removed the tour progress bar or completed all actions or edit profile tour is in progress
            if (!hide && !me.profile.userprogress.hideSystemTour && ((!uploadedProfilePhoto || !uploadedContent || !sharedContent || !madeContactRequest || !halfCompletedProfile || checkEditProfileProgress))) {
                // update progress bar
                updateProgressBar();

                // bind elements
                addBinding();

                // show widget
                $systemtourContainer.show();

                if (checkEditProfileProgress){
                    checkEditProfileTour();
                }
            }
        };
        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("systemtour");

});