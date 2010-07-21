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

/*global Config, $, sdata, window */

var sakai = sakai || {};
sakai.wookieforum = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var me = false;
    var wookieDomain = "";    //    The domain wookie server is running on.
    var wookiePort = 8081;
    var generalMessageFadeOutTime = 5000;
    var wookieUrl = "/wookie/WidgetServiceServlet";        //    The url to the servlet for creating widgets.

    //    Containers
    var mainContainer = "#wookieforum_mainContainer";
    var mainMessagesContainer = "#wookieforum_mainMessage";
    var settingsContainer = "#wookieforum_settings";
    var settingsMessagesContainer = "#wookieforum_settings_txt";
    var settingsAdd = "#wookieforum_settings_add";
    var settingsCreate = "#wookieforum_settings_createnew";

    //    Buttons
    var settingsAddButton = ".wookieforum_settings_btnAddforum";

    //    CSS classes
    var CSSnormalMessage = "wookieforum_normal_message";
    var CSSerrorMessage = "wookieforum_error_message";

    //    Error messages
    var error_unableforumPrefs = "#wookieforum_error_unableforumPrefs";
    var error_unableContactWookie = "#wookieforum_error_unableContactWookie";
    var error_wrongMeFormat = "#wookieforum_error_wrongMeFormat";


    /////////////////////////////
    //    Utility  functions   //
    /////////////////////////////

    /**
     * This function will show a message in either a red or a green square.
     * @param {String} idToAppend The id of the element you wish to set this message in.
     * @param {String} msg The message you want to display.
     * @param {Boolean} isError true for error (red block)/false for normal message(green block).
     * @param {Number} timeout the amount of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(idToAppend, msg, isError, timeout) {
        $(idToAppend).html(sakai.api.Security.saneHTML(msg));
        if (isError) {
            $(idToAppend).addClass(CSSerrorMessage);
            $(idToAppend).removeClass(CSSnormalMessage);
        }
        else {
            $(idToAppend).removeClass(CSSerrorMessage);
            $(idToAppend).addClass(CSSnormalMessage);
        }
        if (typeof timeout === "undefined" || timeout !== 0) {
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


    ///////////////
    // Main view //
    ///////////////

    /**
     * This will add a forum window on the page.
     */
    var showForumPage = function() {

        // Get the forum

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                var forum = data;

                //    Construct the iframe
                var sFrame = '<iframe style="border:0px;" border="0" width="640" height="380" src="' + forum.url;
                // if we have a valid user, we can change the nickname into the users
                // real name.
                if (me) {
                    sFrame += "&nickname=" + me.profile.firstName + '-' + me.profile.lastName;
                    //    avatar
                    if (me.profile.picture) {
                        var oPicture = $.parseJSON(me.profile.picture);
                        var sAvatar = getSakaiDomain() + getSakaiPort() + "/sdata/f/_private" + me.userStoragePrefix + oPicture.name;
                        sFrame += "&avatar=" + sAvatar;
                    }
                }
                sFrame += '"></iframe>';

                // show the forum window on the page.
                $(mainContainer, rootel).append(sFrame);
            } else {
                showGeneralMessage(mainMessagesContainer, $(error_unableforumPrefs).text(), true, 0);
            }
        });
    };


       //////////////////////
    //     Settings view    //
    //////////////////////

   /**
    * Gets called when we have saved everything to JCR.
    */
    var forumSaved = function() {
         //    notify the container that we are finished.
        sakai.api.Widgets.Container.informFinish(tuid);
    };

     /**
      * Save the forum settings to JCR.
      * @param {Object} data
      */
    var createForumFinished = function(data) {
        var url = $("url", data).html();
        var width = $("width", data).html();
        var height = $("height", data).html();
        var maximize = $("maximize", data).html();

        var forum = {"url" : url, "width" : width, "height" : height, "maximze" : maximize};

        // Save data to widgets jcr
        sakai.api.Widgets.saveWidgetData(tuid, forum, forumSaved);
    };

    /**
     * Will initiate a request to the wookie server to get a unique forum window.
     */
    var createForum = function() {
        var url = "";
        if (wookieDomain !== "") {
            url = wookieDomain;
        }
        else {
            //    there was no domain specified, use same as current, just different port
            url = getSakaiDomain() + ":" + wookiePort;
        }

        //    The url to the servlet
        url += wookieUrl;

        //    as a uniaue shared key we will use this widget's ID + a randomly generated key.
        //    If we wouldnt add the key the user would not be able to add multiple chatboxes to a page.
        //    If he had deleted the chatbox by accident he would also not be able to add it again.
        var sharedDataKey = tuid + Math.random();

        //    The data we want posted to the wookie servlet.
        var sDataToWookie = "userid=" + me.profile.firstName + '-' + me.profile.lastName + "&shareddatakey=" + sharedDataKey + "&servicetype=forum&requestid=getwidget";

        //    The data we are going to send to the proxy
        var oPostData = {"method" : "POST", "url" : url, "post" : encodeURIComponent(sDataToWookie),"_charset_":"utf-8"};

        //    The request
        $.ajax({
            url: sakai.config.URL.PROXY_RSS_SERVICE,
            type : "POST",
            success : function(data) {
                createForumFinished(data);
            },
            error: function(xhr, textStatus, thrownError) {
                showGeneralMessage(settingsMessagesContainer, $(error_unableContactWookie).text(), true, 0);
            },
            data : oPostData
        });
    };

    /**
     * Do a request to JCR to see if this is an existing chat box or a new one.
     * If this is an existing chatbox we provide the option to create a new chatbox.
     */
    var doSettings = function() {

        // Get the chat settings
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {

                var forum = data;
                if (forum.url) {
                    // There is already some data so this must be an existing forum.
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


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var doInit = function() {
        //    Get the current User.
        me = sakai.data.me;
        if (me.user.anon || me.preferences.uuid === undefined) {
            //    This user is not logged in
            //    Send him to the login page.
            document.location = sakai.config.URL.GATEWAY_URL;
        }

        if (!showSettings) {
            //    We are not on the settings page
            //    Show the forum
            showForumPage();
        }
        else {
            //    We're in settings mode
            //    Check if this is an existing forum or not.
            doSettings();
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    //    When someone clicks the Add button..
    $(settingsAddButton, rootel).bind("click", function() {
        createForum();
    });

    //    Which view should we show.
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
sakai.api.Widgets.widgetLoader.informOnLoad("wookieforum");
