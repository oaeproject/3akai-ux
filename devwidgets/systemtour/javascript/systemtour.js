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

/**
 * @name sakai.systemtour
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
sakai.systemtour = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var me; // Contains information about the current user
    // Variables used to determine what the user has done
    var uploadedProfilePhoto;
    var uploadedContent;
    var sharedContent;
    var invitedSomeone;
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
    var $systemtourInvitedSomeone = $("#systemtour_invited_someone", $rootel);
    var $systemtourHalfCompleteProfile = $("#systemtour_half_complete_profile", $rootel);
    var $systemtourAddPhotoComplete = $("#systemtour_add_photo_complete", $rootel);
    var $systemtourUploadFileComplete = $("#systemtour_upload_file_complete", $rootel);
    var $systemtourShareContentComplete = $("#systemtour_share_content_complete", $rootel);
    var $systemtourInvitedSomeoneComplete = $("#systemtour_invited_someone_complete", $rootel);
    var $systemtourHalfCompleteProfileComplete = $("#systemtour_half_complete_profile_complete", $rootel);


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
        invitedSomeone = me.profile.userprogress.invitedSomeone;
        halfCompletedProfile = me.profile.userprogress.halfCompletedProfile;
    };

    /**
     * Updates the progress bar based on actions the user has already performed
     */
    var updateProgressBar = function(){
        if (uploadedProfilePhoto) {
            $systemtourAddPhoto.hide();
            $systemtourAddPhotoComplete.show();
        }
        if (uploadedContent) {
            $systemtourUploadFile.hide();
            $systemtourUploadFileComplete.show();
        }
        if (sharedContent) {
            $systemtourShareContent.hide();
            $systemtourShareContentComplete.show();
        }
        if (invitedSomeone) {
            $systemtourInvitedSomeone.hide();
            $systemtourInvitedSomeoneComplete.show();
        }
        if (halfCompletedProfile) {
            $systemtourHalfCompleteProfile.hide();
            $systemtourHalfCompleteProfileComplete.show();
        }
    };

    /**
     * Temporary hides the progress bar
     */
    var hideProgressBar = function(){
        $systemtourContainer.hide();
    };

    /**
     * Permanently hides the progress bar
     */
    var removeProgressBar = function(){
        var progressData = {"hideSystemTour": true};
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
        $systemtourButton.removeClass("systemtour_add_photo_selected");
        $systemtourButton.removeClass("systemtour_edit_profile_selected");
        $systemtourButton.removeClass("systemtour_upload_file_selected");
        $systemtourButton.removeClass("systemtour_share_content_selected");
        $systemtourButton.removeClass("systemtour_add_contacts_selected");
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /**
     * Add binding to widget elements
     */
    var addBinding = function(){
        $(window).bind("sakai-help-close", function() {
            hideSelected();
        });

        $systemtourButton.bind("click", function () {
            hideSelected();

            var id = $(this).attr("id");
            switch (id) {
                case "systemtour_add_photo":
                    $(".systemtour_add_photo").addClass("systemtour_add_photo_selected");
                    var tooltipData = {"profileFlag": "photoHelpTooltip","whichHelp": "tooltip","tooltip":"true","tooltipSelector":"#changepic_container_trigger","tooltipTitle":"TOOLTIP_ADD_MY_PHOTO","tooltipDescription":"TOOLTIP_ADD_MY_PHOTO_P1","tooltipArrow":"top"};
                    $(window).trigger("sakai-help-init", tooltipData);
                    break;
                case "systemtour_edit_profile":
                    $(".systemtour_edit_profile").addClass("systemtour_edit_profile_selected");
                    //var tooltipData = {"profileFlag": "photoHelpTooltip","whichHelp": "tooltip_profile","tooltip":"true","toolTipSelector":"#entity_edit_profile"};
                    //$(window).trigger("sakai-help-init", tooltipData);
                    break;
                case "systemtour_upload_file":
                    $(".systemtour_upload_file").addClass("systemtour_upload_file_selected");
                    break;
                case "systemtour_share_content":
                    $(".systemtour_share_content").addClass("systemtour_share_content_selected");
                    break;
                case "systemtour_add_contacts":
                    $(".systemtour_add_contacts").addClass("systemtour_add_contacts_selected");
                    break;
            }
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
        sakai.api.User.checkUserProgress();

        updateProgressData();

        // if user has not removed the tour progress bar or completed all actions
        if (!me.profile.userprogress.hideSystemTour && (!uploadedProfilePhoto || !uploadedContent || !sharedContent || !invitedSomeone || !halfCompletedProfile)) {
            // update progress bar
            updateProgressBar();

            // bind elements
            addBinding();

            // show widget
            $systemtourContainer.show();
        }
    };
    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("systemtour");
