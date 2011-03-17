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
         * Checks system tour progress for the user and display tooltip reminders
         */
        var checkUserProgress = function() {
            if (!sakai.data.me.profile.userprogress){
                sakai.data.me.profile.userprogress = {};
            }
            var me = sakai.data.me,
                progressData = "",
                tooltipProfileFlag = "",
                tooltipSelector = "",
                tooltipTitle = "",
                tooltipDescription = "",
                tooltipArrow = "top",
                tooltipTop = 0,
                tooltipLeft = 0,
                displayTooltip = false,
                contentLink = "",
                hashPos = "",
                newContentLink = "";
            var curDate = new Date();
            var curTimestamp = curDate.getTime();
            var intervalTimestamp = parseInt(sakai.config.SystemTour.reminderIntervalHours, 10) * 60 * 60 * 1000;

            if (sakai.config.SystemTour.enableReminders && me.profile.userprogress.hideSystemTour && !me.profile.userprogress.hideSystemTourReminders) {
                if (!me.profile.userprogress.uploadedProfilePhoto && 
                    (!me.profile.userprogress.uploadedProfilePhotoReminder || 
                        (!me.profile.userprogress.uploadedProfilePhoto && me.profile.userprogress.uploadedProfilePhotoReminder && 
                            ((me.profile.userprogress.uploadedProfilePhotoReminder + intervalTimestamp) < curTimestamp)))) {
                    progressData = {"uploadedProfilePhotoReminder": curTimestamp};
                    tooltipSelector = "#changepic_container_trigger";
                    tooltipTitle = "TOOLTIP_ADD_MY_PHOTO";
                    tooltipDescription = "TOOLTIP_ADD_MY_PHOTO_P1";
                    displayTooltip = true;
                    $(".systemtour_1").addClass("selected");
                } else if (!me.profile.userprogress.uploadedContent && 
                    (!me.profile.userprogress.uploadedContentReminder || 
                        (!me.profile.userprogress.uploadedContent && me.profile.userprogress.uploadedContentReminder && 
                            ((me.profile.userprogress.uploadedContentReminder + intervalTimestamp) < curTimestamp)))) {
                    progressData = {"uploadedContentReminder": curTimestamp};
                    tooltipSelector = "#mycontent_footer_upload_link";
                    tooltipTitle = "TOOLTIP_UPLOAD_CONTENT";
                    tooltipDescription = "TOOLTIP_UPLOAD_CONTENT_P1";
                    displayTooltip = true;
                    $(".systemtour_3").addClass("selected");
                } else if (!me.profile.userprogress.sharedContent && 
                    (!me.profile.userprogress.sharedContentReminder && me.profile.userprogress.uploadedContent || 
                        (!me.profile.userprogress.sharedContent && me.profile.userprogress.sharedContentReminder && me.profile.userprogress.uploadedContent && 
                            ((me.profile.userprogress.sharedContentReminder + intervalTimestamp) < curTimestamp)))) {
                    progressData = {"sharedContentReminder": curTimestamp};
                    tooltipSelector = "#mycontent_footer_upload_link";
                    tooltipTitle = "TOOLTIP_SHARE_CONTENT";
                    tooltipDescription = "TOOLTIP_SHARE_CONTENT_P2";
                    tooltipArrow = "bottom";
                    tooltipTop = 70;
                    tooltipLeft = -100;
                    displayTooltip = true;
                    $(".systemtour_4").addClass("selected");
                    $(".mycontent_item_link").each(function(index) {
                        if ($(this).attr("href") && $(this).attr("href").indexOf("sharecontenttour") === -1) {
                            contentLink = $(this).attr("href");
                            hashPos = contentLink.indexOf("#");
                            newContentLink = contentLink.substr(0, hashPos) + "?sharecontenttour=true" + contentLink.substr(hashPos);
                            $(this).attr("href", newContentLink);
                        }
                    });
                } else if (!me.profile.userprogress.madeContactRequest && 
                    (!me.profile.userprogress.madeContactRequestReminder || 
                        (!me.profile.userprogress.madeContactRequest && me.profile.userprogress.madeContactRequestReminder && 
                            ((me.profile.userprogress.madeContactRequestReminder + intervalTimestamp) < curTimestamp)))) {
                    progressData = {"madeContactRequestReminder": curTimestamp};
                    tooltipSelector = "#mycontacts_footer_search";
                    tooltipTitle = "TOOLTIP_ADD_CONTACTS";
                    tooltipDescription = "TOOLTIP_ADD_CONTACTS_P1";
                    tooltipArrow = "bottom";
                    displayTooltip = true;
                    $(".systemtour_5").addClass("selected");
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
                } else if (!me.profile.userprogress.halfCompletedProfile && 
                    (!me.profile.userprogress.halfCompletedProfileReminder || 
                        (!me.profile.userprogress.halfCompletedProfile && me.profile.userprogress.halfCompletedProfileReminder && 
                            ((me.profile.userprogress.halfCompletedProfileReminder + intervalTimestamp) < curTimestamp)))) {
                    progressData = {"halfCompletedProfileReminder": curTimestamp};
                    tooltipSelector = "#entity_edit_profile";
                    tooltipTitle = "TOOLTIP_EDIT_MY_PROFILE";
                    tooltipDescription = "TOOLTIP_EDIT_MY_PROFILE_P1";
                    displayTooltip = true;
                    addUserProgress("halfCompletedProfileInProgress");
                    $(".systemtour_2").addClass("selected");
                    if ($("#entity_edit_profile").attr("href") && $("#entity_edit_profile").attr("href").indexOf("editprofiletour") === -1) {
                        $("#entity_edit_profile").attr("href", $("#entity_edit_profile").attr("href") + "?editprofiletour=true");
                    }
                }
            }

            if (displayTooltip){
                var tooltipData = {
                    "tooltipSelector": tooltipSelector,
                    "tooltipTitle": tooltipTitle,
                    "tooltipDescription": tooltipDescription,
                    "tooltipArrow": tooltipArrow,
                    "tooltipTop": tooltipTop,
                    "tooltipLeft" : tooltipLeft,
                    "tooltipAutoClose": false
                };

                var authprofileURL = "/~" + me.user.userid + "/public/authprofile/userprogress";
                sakai.api.Server.saveJSON(authprofileURL, progressData, function(success, data){
                    // Check whether save was successful
                    if (success) {
                        // Display the tooltip
                        if (!sakai.tooltip || !sakai.tooltip.isReady) {
                            $(window).bind("ready.tooltip.sakai", function() {
                                $(window).trigger("init.tooltip.sakai", tooltipData);
                            });
                        } else {
                            $(window).trigger("init.tooltip.sakai", tooltipData);
                        }
                    }
                });
            }
        };

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
                    $(window).unbind("update.systemtour.sakai");
                    $systemtourContainer.hide();
                }
            });
        };

        /**
         * Hides selected buttons
         */
        var hideSelected = function(){
            $systemtourButton.parent().removeClass("selected");
            $systemtourButton.removeClass("selected");
        };

        /**
         * Starts the specified tour
         * {String} id The tour we want to start
         */
        var startTour = function(id){
            $(window).trigger("done.tooltip.sakai");
            hideSelected();
            var tooltipData,
                contentLink,
                hashPos,
                newContentLink;
            switch (id) {
                case "systemtour_add_photo":
                    $(".systemtour_1").addClass("selected");
                    tooltipData = {
                        "tooltipSelector":"#changepic_container_trigger",
                        "tooltipTitle":"TOOLTIP_ADD_MY_PHOTO",
                        "tooltipDescription":"TOOLTIP_ADD_MY_PHOTO_P1",
                        "tooltipArrow":"top"
                    };
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                    break;
                case "systemtour_edit_profile":
                    $(".systemtour_2").addClass("selected");
                    tooltipData = {
                        "tooltipSelector":"#entity_edit_profile",
                        "tooltipTitle":"TOOLTIP_EDIT_MY_PROFILE",
                        "tooltipDescription":"TOOLTIP_EDIT_MY_PROFILE_P1",
                        "tooltipArrow":"top"
                    };
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                    if ($("#entity_edit_profile").attr("href") && $("#entity_edit_profile").attr("href").indexOf("editprofiletour") === -1) {
                        $("#entity_edit_profile").attr("href", $("#entity_edit_profile").attr("href") + "?editprofiletour=true");
                    }
                    break;
                case "systemtour_upload_file":
                    $(".systemtour_3").addClass("selected");
                    tooltipData = {
                        "tooltipSelector":"#mycontent_footer_upload_link",
                        "tooltipTitle":"TOOLTIP_UPLOAD_CONTENT",
                        "tooltipDescription":"TOOLTIP_UPLOAD_CONTENT_P1",
                        "tooltipArrow":"bottom"
                    };
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                    break;
                case "systemtour_share_content":
                    $(".systemtour_4").addClass("selected");
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
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                    break;
                case "systemtour_add_contacts":
                    $(".systemtour_5").addClass("selected");
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
                    $(window).trigger("init.tooltip.sakai", tooltipData);
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
                    "tooltipSelector":"#top_banner",
                    "tooltipTitle":"TOOLTIP_EDIT_MY_PROFILE",
                    "tooltipDescription":"TOOLTIP_EDIT_MY_PROFILE_P4",
                    "tooltipArrow":"top",
                    "tooltipTop":80,
                    "tooltipLeft":380,
                    "tooltipAutoClose":true
                };
                $(".systemtour_2").addClass("selected");
                if (!sakai_global.tooltip || !sakai_global.tooltip.isReady) {
                    $(window).bind("ready.tooltip.sakai", function() {
                        $(window).trigger("init.tooltip.sakai", tooltipData);
                    });
                } else {
                    $(window).trigger("init.tooltip.sakai", tooltipData);
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
            $(window).bind("closed.tooltip.sakai", function() {
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

            $(window).bind("update.systemtour.sakai", function() {
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
                $(window).bind("ready.mycontent.sakai", function() {
                    checkUserProgress();
                });
            } else {
                checkUserProgress();
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
