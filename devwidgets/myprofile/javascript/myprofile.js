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

var sakai = sakai || {};

/**
 * @name sakai.myprofile
 *
 * @class myprofile
 *
 * @description
 * Initialize the myprofile widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.myprofile = function (tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var me = sakai.data.me;
    var json = me.profile;

    //    IDs
    var myprofileId = "#myprofile";
    var myprofileClass = ".myprofile";

    var profileNameID = myprofileId + "_name";
    var profilePictureID = myprofileId + "_pic";
    var profileDepartementID = myprofileId + "_dept";

    var profileChatStatusID = myprofileId + "_chat_status_";
    var profileChatStatus = "chat_available_status_";
    var profileStatusContainer = myprofileId + "_status";
    var profileChatStatusClass = myprofileClass + "_chat_status";
    var profileChatStatusDropDownLink = myprofileClass + "_chat_status_dropdown_link";
    var profileChatStatusPicker = myprofileClass + "_chat_status_picker";
    var profileWidget = myprofileClass + "_widget";

    var availableStatus = "chat_available_status_";
    var availableStatus_online = availableStatus + "online";
    var availableStatus_busy = availableStatus + "busy";
    var availableStatus_offline = availableStatus + "offline";

    var profilePreviewLink = "#myprofile_preview_profile";

    var headerChatUserId = "#user_link"; // The username in the chat bar.

    var chatStatus = "online";

    var authprofileURL;

    /////////////////
    // Chat status //
    /////////////////

    /**
     * Add the right status css class on an element.
     * @param {Object} element the jquery element you wish to add the class to
     * @param {Object} status the status
     */
    var updateChatStatusElement = function (element, status) {
        if (element){
            element.removeClass(availableStatus_online);
            element.removeClass(availableStatus_busy);
            element.removeClass(availableStatus_offline);
            element.addClass(availableStatus + status);
        }
    };

    /**
     * Update the chat statuses all across the page.
     * @param {Object} status
     */
    var updateChatStatus = function (status) {
        $(profileChatStatusClass).hide();
        $(profileChatStatusID + status).show();

        // Trigger the chat_status_change event to update other widgets
        $(window).trigger("chat_status_change", chatStatus);
    };

    /**
     * Change the status of the currently logged in user.
     * @param {Object} status
     */
    var changeStatus = function (chatstatus) {
        if (chatStatus !== chatstatus){
            tempChatStatus = chatstatus;

            $(profileStatusContainer).toggle();

            var data = {
                "chatstatus": chatstatus,
                "_charset_": "utf-8"
            };

            $.ajax({
                url: "/~" + sakai.data.me.profile["rep:userId"] + "/public/authprofile",
                type: "POST",
                data: data,
                success: function(data){
                    updateChatStatus(status);
                },
                error: function(xhr, textStatus, thrownError){
                    if (typeof callback === "function") {
                        callback(false, xhr);
                    }
                    fluid.log("Entity widget - An error occured when sending the status to the server.");
                }
            });

            sakai.data.me.profile = $.extend(true, sakai.data.me.profile, {"chatstatus": chatstatus});

        }
    };


    //////////////////////////////
    // Initialisation Functions    //
    //////////////////////////////

    var doInit = function () {

        $(profilePreviewLink, rootel).attr("href", "/~" + sakai.data.me.user.userid);

        // Check if we have a first and last name
        if (sakai.api.User.getDisplayName(json) !== "") {
            $(profileNameID, rootel).text(sakai.api.Util.shortenString(sakai.api.User.getDisplayName(json), 30));
            $(profileNameID, rootel).attr("href", "/~" + sakai.data.me.user.userid);
        }
        else {
            $(profileNameID, rootel).text(sakai.api.Security.saneHTML(me.user.userid));
        }

        authprofileURL = "/~" + sakai.data.me.user.userid + "/public/authprofile";

        // Do we have a picture
        if (json.picture) {
            var pict = $.parseJSON(json.picture);
            if (pict.name) {
                $(profilePictureID, rootel).attr("src", "/~" + sakai.data.me.user.userid + "/public/profile/" + pict.name );
            }
        } else {
            $(profilePictureID, rootel).attr("src", sakai.config.URL.USER_DEFAULT_ICON_URL);
        }

        // Any extra information we may have.
        var extra = "";
        if (json.basic) {
            var basic = $.parseJSON(json.basic);
            if (json.unirole) {
                extra = json.unirole;
            }
            else if (json.unicollege) {
                extra = json.unicollege;
            }
            else if (json.unidepartment) {
                extra = json.unidepartment;
            }
            $(profileDepartementID, rootel).html(sakai.api.Security.saneHTML(extra));
        }

        var chatstatus = "online";
        chatStatus = "online";
        // Get the user his chatstatus
        if (me.profile.chatstatus) {
            chatstatus = me.profile.chatstatus;
            chatStatus = me.profile.chatstatus;
        }

        // Set the status in front of the user his name/
        $(profileNameID).addClass(profileChatStatus + chatstatus);
        $(profileChatStatusID + chatstatus).show();

        // Show the widget after everything is loaded
        $(profileWidget).show();
    };

    /**
     * Update the position of the status box which is position:absolute
     */
    var updateStatusContainerPosition = function(){
        $(profileStatusContainer).css("left", $(".profile_chat_status_dropdown_link").offset().left + 65 + "px");
        $(profileStatusContainer).css("top", $(".profile_chat_status_dropdown_link").offset().top + 30 + "px");
    };

    /**
     * Hide the status pop-up
     */
    var hideStatusContainer = function(){
        $(profileStatusContainer).hide();
    };

    /**
     * Toggle the status pop-up
     */
    var toggleStatusContainer = function(){
        updateStatusContainerPosition();
        $(profileStatusContainer).toggle();
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    // Toggle
    $(profileChatStatusDropDownLink).bind("click", function (ev) {
        toggleStatusContainer();
    });
    $(profileChatStatusClass).bind("click", function (ev) {
        toggleStatusContainer();
    });

    /**
     * Bind the document on click event and check if it if you didn't click on the profile chatstatus link
     */
    $(document).click(function(e){
        var $clicked = $(e.target);

        // Check if one of the parents is the chatstatuscontainer
        if(!$clicked.parents().is("#profile_chat_status")){
            hideStatusContainer();
        }

    });

    /**
     * Bind the resize event
     */
    $(window).resize(function(){

        // If the box is visible, update the position of it
        if($(profileStatusContainer).is(":visible")){
            updateStatusContainerPosition();
        }
    });

    // A user selects his status
    $(profileChatStatusPicker).live("click", function (ev) {
        var statusChosen = this.id.split("_")[this.id.split("_").length - 1];
        changeStatus(statusChosen);
        chatStatus = statusChosen;
    });

    // Add binding to set the status
    $(window).bind("chat_status_change", function(event, currentChatStatus){
        updateChatStatusElement($(profileNameID), currentChatStatus);
        chatStatus = currentChatStatus;
        $(profileChatStatusClass).hide();
        $(profileChatStatusID + currentChatStatus).show();
    });

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("myprofile");
