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

/*global $, Config, sdata, window */

var sakai = sakai || {};

/**
 * @name sakai.wookiechat
 *
 * @class wookiechat
 *
 * @description
 * Initialize the wookiechat widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.wookiechat = function(tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var me = false;
    var wookieDomain = ""; //    The domain where the wookie server is running on.
    var wookiePort = 8081;
    var generalMessageFadeOutTime = 5000;
    var wookieUrl = "/wookie/WidgetServiceServlet";        //    The url to the servlet for creating widgets.

    // Containers
    var mainContainer = "#wookiechat_mainContainer";
    var mainMessagesContainer = "#wookiechat_main_message";
    var settingsContainer = "#wookiechat_settings";
    var settingsMessagesContainer = "#wookiechat_settings_txt";
    var settingsAdd = "#wookiechat_settings_add";
    var settingsCreate = "#wookiechat_settings_createnew";

    // Buttons
    var settingsAddButton = ".wookiechat_settings_btnAddChat";

    // CSS classes
    var CSSnormalMessage = "wookiechat_normal_message";
    var CSSerrorMessage = "wookiechat_error_message";

    // Error messages
    var error_unableChatPrefs = "#wookiechat_error_unableChatPrefs";
    var error_unableContactWookie = "#wookiechat_error_unableContactWookie";


    ////////////////////////
    // Utility  functions //
    ////////////////////////

    /**
     * This function will show a message in either a red or a green square.
     * @param {String} idToAppend The id of the element you wish to set this message in.
     * @param {String} msg The message you want to display.
     * @param {Boolean} isError true for error (red block)/false for normal message(green block).
     * @param {Number} timeout The amount of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(idToAppend, msg, isError, timeout) {
        $(idToAppend).html(msg);
        if (isError) {
            $(idToAppend).addClass(CSSerrorMessage);
            $(idToAppend).removeClass(CSSnormalMessage);
        }
        else {
            $(idToAppend).removeClass(CSSerrorMessage);
            $(idToAppend).addClass(CSSnormalMessage);
        }
        timeout = timeout || 0;
        if (timeout !== 0) {
            $(idToAppend).fadeOut(generalMessageFadeOutTime);
        }
        else {
            $(idToAppend).show();
        }
    };

    /**
     * This will return the domain where sakai is running on.
     * ex: http://localhost:8080/dev will return http://localhost
     */
    var getSakaiDomain = function() {
        var loc = "" + window.location;
        var parts = loc.split("/");
        var dompart = "" + parts[2];
        var domain = dompart.split(":");
        var url = parts[0] + "//" + domain[0];
        return url;
    };

    /**
     * This wil return the port where sakai is running on.
     * ex: http://localhost:8080/dev will return :8080
     * If there is no port "" will be returned
     */
    var getSakaiPort = function() {
        var loc = "" + window.location;
        var parts = loc.split("/");
        var dompart = "" + parts[2];
        var domain = dompart.split(":");
        if (domain.length > 1) {
            return ":" + domain[1];
        }
        return "";
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * When the settings are saved to JCR, this function will be called.
     * It will notify the container that it can be closed.
     */
    var chatRoomSaved = function() {
        sakai.api.Widgets.Container.informFinish(tuid);
    };

    /**
     * When our request to the Wookie server was succesfull this
     * function will be called.
     * @param {Object} data The data the Wookie server sent back.
     */
    var createChatRoomFinished = function(data) {
        // The data we receive from the server is XML formatted.
        // We retrieve it via jQuery.

        var url = $("url", data).html();
        var width = $("width", data).html();
        var height = $("height", data).html();
        var maximize = $("maximize", data).html();

        // The object we will be writing to JCR.
        var chat = {
            "url": url,
            "width": width,
            "height": height,
            "maximze": maximize
        };

        // sava data to widgets jcr
        sakai.api.Widgets.saveWidgetData(tuid, chat, chatRoomSaved);
    };

    /**
     * Will initiate a request to the wookie server to get a unique chat window.
     */
    var createChatRoom = function() {
        // Construct the URL to the wookie servlet
        var url = "";
        if (wookieDomain !== "") {
            url = wookieDomain;
        }
        else {
            // there was no domain specified, use same as current, just different port
            url = getSakaiDomain() + ":" + wookiePort;
        }
        url += wookieUrl;

        // The data we want to post to the wookie servlet.

        // As a unique shared key we will use this widget's ID + a randomly generated key.
        // If we wouldn't add the key the user would not be able to add multiple chatboxes to a page.
        // If he had deleted the chatbox by accident he would also not be able to add it again.
        var sharedDataKey = tuid + Math.random();

        var sDataToWookie = "userid=" + me.preferences.uuid + "&shareddatakey=" + sharedDataKey + "&servicetype=chat&requestid=getwidget";

        // The data we have to post to the proxy service.
        var oPostData = {
            "method": "POST",
            "url": url,
            "post": encodeURIComponent(sDataToWookie),
            "_charset_":"utf-8"
        };

        // The request.
        $.ajax({
            url: sakai.config.URL.PROXY_RSS_SERVICE,
            type: "POST",
            success: function(data) {
                // The chat room has created on wookie's side.
                // Save the date we get back to JCR.
                createChatRoomFinished(data);
            },
            error: function(xhr, textStatus, thrownError) {
                // For some reason we couldn't contact the wookie server.
                showGeneralMessage(settingsMessagesContainer, $(error_unableContactWookie).text(), true, 0);
            },
            data: oPostData
        });
    };

    /**
     * Do a request to JCR to see if this is an existing chat box or a new one.
     * If this is an existing chatbox we provide the option to create a fresh chatbox.
     */
    var doSettings = function() {

        // Get the chat settings
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {
                var chat = data;
                if (chat.url) {
                    // There is already some data here ..
                    // This must be an existing chatbox.
                    $(settingsAdd).hide();
                    $(settingsCreate).show();
                }
                else {
                    $(settingsCreate).hide();
                    $(settingsAdd).show();
                }
            } else {
                $(settingsCreate).hide();
                $(settingsAdd).show();
            }

        });
    };


    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * This method will fetch the settings from JCR,
     * construct the iframe with the chatbox in it and
     * display it on the page.
     */
    var showChatPage = function() {
        // Get the chat settings

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {
                var chat = data;

                // Construct the iframe
                // The wookie chat box always has a fixed size.
                var sFrame = '<iframe style="border:0px;" border="0" width="640" height="580" src="' + chat.url;

                // if we have a valid user, we can change the nickname into the users
                // real name.
                if (me) {
                    sFrame += "&nickname=" + me.profile.firstName + '-' + me.profile.lastName;

                    // If there is a picture we can pass it along the url.
                    // avatar
                    if (me.profile.picture) {
                        var oPicture = me.profile.picture;
                        var sAvatar = "/~" + me.user.userid + "/public/profile/" + oPicture.name;
                        sFrame += "&avatar=" + sAvatar;
                    }
                }
                sFrame += '"></iframe>';

                // show the chat window on the page.
                $(mainContainer, rootel).append(sFrame);
            } else {
                showGeneralMessage(mainMessagesContainer,$(error_unableChatPrefs).text(), true, 0);
            }
        });
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    $(settingsAddButton, rootel).bind("click", function() {
        createChatRoom();
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var doInit = function() {
        // Get the current User.
        me = sakai.data.me;
        if (me.user.anon || me.preferences.uuid === undefined) {
            // This user is not logged in
            // Send him to the login page.
            document.location = sakai.config.URL.GATEWAY_URL;
        }

        if (!showSettings) {
            // We are not on the settings page
            // Show the chat box
            showChatPage();
        }
        else {
            // We're in settings mode
            // Check if this is an existing chat box or not.
            doSettings();
        }
    };


    // Which view should we show.
    if (showSettings) {
        $(mainContainer, rootel).hide();
        $(settingsContainer, rootel).show();
    }
    else {
        $(settingsContainer, rootel).hide();
        $(mainContainer, rootel).show();
    }

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("wookiechat");