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
/*global $ */



/*
 * Note:
 *
 * This is just a quick and dirty proof of concept.
 *
 * It definetly needs a skin and some recoding as well.
 *
 */




var sakai = sakai || {};
sakai.lib = sakai.lib || {};

sakai.lib.notifications = {

    /**
     * Config
     */

    default_warning_icon_url: "/dev/_images/inbox_folders_announcements.gif",
    default_normal_icon_url: "/dev/_images/inbox_folders_announcements.gif",
    default_error_icon_url: "/dev/_images/inbox_folders_announcements.gif",
    default_close_icon: "/dev/_images/close_icon_small.png",
    default_display_time: 5000,
    default_fade_in_time: 500,
    default_fade_out_time: 500,
    default_stayontop: false,


    /**
     * Displays a Growl-like notification.
     * @param {String} title The title you wish to display.
     * @param {String} message The message you wish to display.
     * @param {String} icon The icon to use. Default = TBA
     * @param {String} type The type of message you wish to display. Options: "error", "warning", "normal"
     * @param {Boolean} stayontop true = Don't fade out, false = fade out. (default = false)
     * @param {Number} fadeInTime The amount of milliseconds it takes for the message to fade in. (default = 500)
     * @param {Number} displayTime The amount of milliseconds the notification is visible. (default = 2000)
     * @param {Number} fadeOutTime The amount of milliseconds it takes for the message to fade out. (default = 500)
     */
    showNotification: function(title, message, type, stayontop, icon, fadeInTime, displayTime, fadeOutTime){

        var d = new Date();
        var notification_id = "notification_" + d.getTime();
    var $containerEL = $("<div></div>").attr({id:notification_id});

        var iconUrl = "";
        switch (type) {
            case "error":
                $containerEL.addClass("notification_error");
                iconUrl = this.default_error_icon_url;
                break;
            case "normal":
                $containerEL.addClass("notification_normal");
                iconUrl = this.default_normal_icon_url;
                break;
            case "warning":
                $containerEL.addClass("class", "notification_warning");
                iconUrl = this.default_warning_icon_url;
                break;
        }

        // If the user provided an icon, use that one.
        if (icon) {
            iconUrl = icon;
        }

        // Create the close icon.
        var closeEL = document.createElement("img");
        closeEL.setAttribute("src", this.default_close_icon);
        closeEL.setAttribute("class", "notification_close");
        closeEL.style.display = "none";
        $containerEL.append(closeEL);

        // Close icon click event
        $(closeEL).bind('click', function(e, ui) {
            $(this).parent().stop(true).remove();
        });

        // Create the image icon.
        var imgEL = document.createElement("img");
        imgEL.setAttribute("src", iconUrl);
        $containerEL.append(imgEL);

        // Create the title.
        var titleEL = document.createElement("span");
        titleEL.setAttribute("class", "notification_title");
        titleEL.innerHTML = title;
        $containerEL.append(titleEL);

        // Create the message
        var messageEL = document.createElement("span");
        messageEL.setAttribute("class", "notification_message");
        messageEL.innerHTML = message;
        $containerEL.append(messageEL);

        // Add the message to the container
        var $notification_container = $("#notification_container");
        if ($notification_container.length === 0) {

        // Create the notification container if it doesn't exist yet
        $notification_container = $("<div></div>").attr({id:"notification_container"}).append($containerEL);
            $("body").append($notification_container);
        }
        else {
        // Add to an existing container
            $notification_container.append($containerEL);
        }

        // Position notification
    if (window.pageYOffset > 0) {
        $notification_container.css("top", window.pageYOffset + 10);
    }

        // Default timings
        if (typeof displayTime === "undefined") {
            displayTime = this.default_display_time;
        }
        if (typeof fadeInTime === "undefined") {
            fadeInTime = this.default_fade_in_time;
        }
        if (typeof fadeOutTime === "undefined") {
            fadeOutTime = this.default_fade_out_time;
        }
        if (typeof stayontop === "undefined") {
            stayontop = this.default_stayontop;
        }

        // Fade out notification and clear
        $("#" + notification_id).corners().bind("mouseenter", function() {

        // hovering over the notifcation shows the close icon.
         $(".notification_close", this).show();
        }).bind("mouseleave", function() {
        $(".notification_close", this).hide();
        }).fadeIn(fadeInTime, function(){
            if (!stayontop) {
            // It's not required to stay on top so it can fade out and cleaned up
            setTimeout("$('#" + notification_id + "').fadeOut(" + fadeOutTime + ",function() { $(this).remove(); });", displayTime);
            }
        });

    }



};
