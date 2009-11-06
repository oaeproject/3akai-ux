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




var sakai = sakai ||
{};
sakai.notifications = {
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
        var contEL = document.createElement("div");
        var d = new Date();
        var id = "notification_" + d.getTime();
        contEL.setAttribute("id", id);
		
		
		
        var iconUrl = "";
        switch (type) {
            case "error":
                contEL.setAttribute("class", "notification_error");
                iconUrl = "/dev/_images/inbox_folders_announcements.gif";
                break;
            case "normal":
                contEL.setAttribute("class", "notification_normal");
                iconUrl = "/dev/_images/inbox_folders_announcements.gif";
                break;
            case "warning":
                contEL.setAttribute("class", "notification_warning");
                iconUrl = "/dev/_images/inbox_folders_announcements.gif";
                break;
        }
        
        // If the user provided an icon, use that one.
        if (icon) {
            iconUrl = icon;
        }
		
		// Create the close icon.
		var closeEL = document.createElement("img");
        closeEL.setAttribute("src", "/dev/_images/close_icon_small.png");
		closeEL.setAttribute("class", "notification_close");
		closeEL.style.display = "none";
		contEL.appendChild(closeEL);
		
		$(closeEL).bind('click', function(e, ui) {
			$(this).parent().stop(true).remove();
		});
		
        // Create the image icon.
        var imgEL = document.createElement("img");
        imgEL.setAttribute("src", iconUrl);
        contEL.appendChild(imgEL);
        
        // Create the title.
        var titleEL = document.createElement("span");
        titleEL.setAttribute("class", "notification_title");
        titleEL.innerHTML = title;
        contEL.appendChild(titleEL);
        
        // Create the message
        var messageEL = document.createElement("span");
        messageEL.setAttribute("class", "notification_message");
        messageEL.innerHTML = message;
        contEL.appendChild(messageEL);
        
        
        var $notification_container = $("#notification_container");
        if ($notification_container.length === 0) {
            // Create the notification container and append it too the body.
            var container = document.createElement("div");
            container.setAttribute("id", "notification_container");
            container.appendChild(contEL);
            //$("body").append(container);
            document.body.appendChild(container);
        }
        else {
            document.getElementById("notification_container").appendChild(contEL);
        }
        
        
        
        if (typeof displayTime === "undefined") {
            displayTime = 5000;
        }
        if (typeof fadeInTime === "undefined") {
            fadeInTime = 500;
        }
        if (typeof fadeOutTime === "undefined") {
            fadeOutTime = 500;
        }
        if (typeof stayontop === "undefined") {
            stayontop = false;
        }
        
        // fade out notification
        $("#" + id).corners().bind("mouseenter", function() {
			// hovering over the notifcation shows the close icon.
			$(".notification_close", this).show();
		}).bind("mouseleave", function() {
			$(".notification_close", this).hide();
		}).fadeIn(fadeInTime, function(){
            if (!stayontop) {
				// It's not required to stay on top so it can fade out.
                setTimeout("$('#" + id + "').fadeOut(" + fadeOutTime + ");", displayTime);
            }
        });
        
    }
};
