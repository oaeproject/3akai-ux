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

/*global Config, $, sdata */

var sakai = sakai || {};

/**
 * Initialize the comments widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement The place of the widget - usualy the location of the site
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.comments = function(tuid, placement, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////
	
    var json = false; // Variable used to recieve information by json
    var me = sdata.me; // Contains information about the current user
    var rootel = $("#" + tuid); // Get the main div used by the widget
    var jsonDisplay = {};

    // Main Ids
    var comments = "#comments";
    var commentsName = "comments";
    var commentsClass = ".comments";

    // Output containers
    var commentsOutputContainer = comments + "_mainContainer";
    var commentsFillInComment = comments + "_fillInComment";
    var commentsPostCommentStart = comments + "_postComment";
    var commentsShowComments = comments + "_showComments";
    var commentsNumComments = comments + "_numComments";
    var commentsCommentComments = comments + "_commentscomment";

    // Output textboxes
    var commentsMessageTxt = comments + "_txtMessage";
    var commentsNamePosterTxt = comments + "_txtNamePoster";
    var commentsMailPosterTxt = comments + "_txtMailPoster";

    // Output classes
    var commentsCommentBtn = commentsClass + "_comment";
    var commentsPager = commentsClass + "_jqpager";

    // Output names
    var commentsCommentBtnNoDot = commentsName + "_comment";

    // Output templates
    var commentsFillInCommentTemplate = commentsName + "_fillInCommentTemplate";
    var commentsShowCommentsTemplate = commentsName + "_showCommentsTemplate";

    // Settings
    var commentsSettingsContainer = comments + "_settings";

    // Settings checkboxes and radiobuttons
    var commentsEmailReqChk = comments + "_Emailrequired";
    var commentsNameReqChk = comments + "_Namerequired";
    var commentsSendMailChk = comments + "_SendMail";
    var commentsPageTxt = comments + "_txtPage";

    // Settings buttons
    var commentsSubmit = comments + "_submit";
    var commentsCancel = comments + "_cancel";

    // Settings names
    var commentsDisplayRbt = commentsName + "_ChooseDisplayComments";
    var commentsDirectionRbt = commentsName + "_ChooseDirectionComments";
    var commentsPermissionsRbt = commentsName + "_ChoosePermissionComments";


    ////////////////////////
    // Utility  functions //
    ////////////////////////
	
    /**
	 * This function will clone any JSON-object
	 * @param {Object} the cloned JSON-object
	 */
    var cloneObject = function(object) {
        var clonedObject = {};
        $.extend(true,clonedObject, object);
        return clonedObject;
    };

    /**
	 * Parse a json string to a valid date
	 * @param {String} dateInput String of a date that needs to be parsed
	 * @returns {Date}
	 */
    var parseDate = function(dateInput) {
        /** Get the date with the use of regular expressions */
        if (dateInput !== null) {
            var match = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(dateInput); // 2009-03-03T17:53:48Z
            if (match === null) {
                return null;
            }
            var d = new Date();
            d.setDate(match[3]);
            d.setMonth(match[2] - 1);
            d.setYear(match[1]);
            d.setHours(parseInt(match[4], 10) + 1);
            d.setMinutes(match[5]);
            d.setSeconds(match[6]);
            return d;
        }
        return null;

    };

    /**
	 * returns how many years, months, days or hours since the dateinput
	 * @param {Date} date
	 */
    var getTimeAgo = function(date) {
        if (date !== null) {
            var currentDate = new Date();
            var iTimeAgo = (currentDate - date) / (1000);
            if (iTimeAgo < 60) {
                if (Math.floor(iTimeAgo) === 1) {
                    return Math.floor(iTimeAgo) + " second";
                }
                return Math.floor(iTimeAgo) + " seconds";
            }
            else if (iTimeAgo < 3600) {
                if (Math.floor(iTimeAgo / 60) === 1) {
                    return Math.floor(iTimeAgo / 60) + " minute";
                }
                return Math.floor(iTimeAgo / 60) + " minutes";
            }
            else if (iTimeAgo < (3600 * 60)) {
                if (Math.floor(iTimeAgo / (3600)) === 1) {
                    return Math.floor(iTimeAgo / (3600)) + " hour";
                }
                return Math.floor(iTimeAgo / (3600)) + " hours";
            }
            else if (iTimeAgo < (3600 * 60 * 30)) {
                if (Math.floor(iTimeAgo / (3600 * 60)) === 1) {
                    return Math.floor(iTimeAgo / (3600 * 60)) + " day";
                }
                return Math.floor(iTimeAgo / (3600 * 60)) + " days";
            }
            else if (iTimeAgo < (3600 * 60 * 30 * 12)) {
                if (Math.floor(iTimeAgo / (3600 * 60 * 30)) === 1) {
                    return Math.floor(iTimeAgo / (3600 * 60 * 30)) + " month";
                }
                return Math.floor(iTimeAgo / (3600 * 60 * 30)) + " months";
            }
            else {
                if (Math.floor(iTimeAgo / (3600 * 60 * 30 * 12) === 1)) {
                    return Math.floor(iTimeAgo / (3600 * 60 * 30 * 12)) + " year";
                }
                return Math.floor(iTimeAgo / (3600 * 60 * 30 * 12)) + " years";
            }
        }

        return null;

    };

    /**
	 * Format an input date (used by TrimPath)
	 * @param {Date} d Date that needs to be formatted
	 * @return {String} returns the date in the followinig format
	 */
    var formatDate = function(d) {
        if (d === null) {
            return null;
        }

        var names_of_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var current_hour = d.getHours();
        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1) {
            current_minutes = "0" + current_minutes;
        }

        return (names_of_months[d.getMonth()].substring(0, 3) + " " + d.getDate() + ", " + d.getFullYear() + " - " + current_hour + ":" + current_minutes);
    };
	
	/**
	 * Can be used to sort an array of comments-JSON-objects on date (sorts from newest to oldest)
	 * @param {Object} a
	 * @param {Object} b
	 */
    var sortByDatefunction = function(a, b) {
        if (a.date < b.date) {
            return 1;
        }
        else if (b.date < a.date) {
            return - 1;
        }
        return 0;
    };


    ////////////////////
    // Main functions //
    ////////////////////
	
    /**
	 * Pager click handler
	 * @param {Number} pageclickednumber
	 */
    var pagerClickHandler = function(pageclickednumber) {
        // Change the page-number on the display
		$(commentsPager, rootel).pager({
            pagenumber: pageclickednumber,
            pagecount: Math.ceil(json.comments.length / json.perPage),
            buttonClickCallback: pagerClickHandler
        });
		// Clones the JSON-object so there's no changes to the original object
        var jsonTemp = cloneObject(jsonDisplay);
		// Splices the temporary comments-array (starting from the start of the page to the end)
        jsonTemp.comments = jsonTemp.comments.splice((pageclickednumber - 1) * json.perPage, json.perPage);
		// Let's the JSON-object render
        $(commentsShowComments, rootel).html($.Template.render(commentsShowCommentsTemplate, jsonTemp));
    };
	/**
	 * Show the comments in a paged state or not
	 * @param {Object} users
	 */
    var displayCommentsPagedOrNot = function(users) {
        jsonDisplay = {
            "comments": []
        };
		// Loops through all the comments and does the necessary changes to render the JSON-object
        for (var i = 0; i < json.comments.length; i++) {
            jsonDisplay.comments[i] = {};
			// Checks if the date is already parsed to a date object
            if (typeof json.comments[i].date === "string") {
                json.comments[i].date = parseDate(json.comments[i].date);
            }
            jsonDisplay.comments[i].timeAgo = "about " + getTimeAgo(json.comments[i].date) + " ago";
            jsonDisplay.comments[i].formatDate = formatDate(json.comments[i].date);
			jsonDisplay.comments[i].date = json.comments[i].date;
            jsonDisplay.comments[i].user = users[json.comments[i].uid];
            jsonDisplay.comments[i].message = json.comments[i].message;
            // The original index is needed to know on which comment an event was called
			jsonDisplay.comments[i].originalIndex = i;

        }
		// If the First comment should be on top of the page the order needs to be changed
        if (json.direction === "comments_FirstUp") {
            jsonDisplay.comments = jsonDisplay.comments.sort(sortByDatefunction);
        }
		// Checks if paging was requested and sets to page 1 default
        if (json.display === "comments_PerPage") {
            $(commentsPager, rootel).pager({
                pagenumber: 1,
                pagecount: Math.ceil(json.comments.length / json.perPage),
                buttonClickCallback: pagerClickHandler
            });
            pagerClickHandler(1);
        }
		// Show all the comments on 1 page
        else {
            $(commentsShowComments, rootel).html($.Template.render(commentsShowCommentsTemplate, jsonDisplay));
        }
    };
	
	/**
	 * Show all the posted comments
	 * This function first retrieves all the users who have posted in this widget and then call the displayCommentsPagedOrNot function
	 */
	var showComments = function() {
		// Puts the number of comments on the page
        $(commentsNumComments, rootel).html(json.comments.length);
		// Change to "comment" or "comments"
        if (json.comments.length === 1) {
            $(commentsCommentComments, rootel).html = "comment";
        }
		// Checks if the comments undefined or if it's length is 0
        if (typeof json.comments !== "undefined") {
			if(json.comments.length !== 0){
				var users = [];
				
				// puts all the userids who added comments to this widget in an array
	            for (var i = 0; i < json.comments.length; i++) {
	                if (!users.contains(json.comments[i].uid)) {
	                    users.push(json.comments[i].uid);
	                }
	            }
	
				// retrieves al the users profile information
	            $.ajax({
	                url: Config.URL.ME_SERVICE + "/" + users.join(","),
	                success: function(data) {
	                    var jsonUsers = $.evalJSON(data);
	                    users = [];
	                    for (i = 0; i < jsonUsers.users.length; i++) {
							// Puts the userinformation in a better structure for trimpath
	                        var user = {};
	                        user.fullName = jsonUsers.users[i].profile.firstName + " " + jsonUsers.users[i].profile.lastName;
	                        user.picture = Config.URL.PERSON_ICON_URL;
	                        // Check if the user has a picture
							if (jsonUsers.users[i].profile.picture) {
	                            user.picture = Config.URL.WEBDAV_PRIVATE_URL + jsonUsers.users[i].userStoragePrefix + jsonUsers.users[i].profile.picture.name;
	                        }
	                        user.uid = jsonUsers.users[i].userStoragePrefix.split("/")[3];
	                        user.profile = Config.URL.PROFILE_URL + "?user=" + user.uid;
	                        users[user.uid] = user;
	
	                    }
	                    displayCommentsPagedOrNot(users);
	                },
	                error: function(status) {
	                    alert("Couldn't connect to the server.");
	                }
	            });	
			}
        }
    };
	
	    /**
	 * Post a new comment
	 * @param {string} top or bottom container
	 */
    var postComment = function(container) {
        // Before you post the current posts should be retrieved, in this way no posts get overwritten
        var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "comments");
        $.ajax({
            url: url,
            cache: false,
            success: function(data) {
                json = $.evalJSON(data);
                $(container, rootel).toggle();
                var comment = {
                    // Replaces the \n (enters) with <br />
                    // I'm using $(rootel.selector + " " + container) instead of rootel because there are 2 commentsInput container
                    "message": $(commentsMessageTxt, $(rootel.selector + " " + container)).val().replace(/\n/g, "<br />"),
                    "mail": false,
                    "name": false,
                    "uid": me.preferences.uuid
                };
                if (json.permissions.nameRequired) {
                    comment.name = $(commentsNamePosterTxt, $(rootel.selector + " " + container)).val();
                }
                if (json.permissions.mailRequired) {
                    comment.mail = $(commentsMailPosterTxt, $(rootel.selector + " " + container)).val();
                }
                comment.date = new Date();
                json.comments.push(comment);
                // Converting JSON-object to a string
                var tostring = $.toJSON(json);
                var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
                // Sending Stringified JSON-object to JCR
                sdata.widgets.WidgetPreference.save(saveUrl,"comments", tostring, showComments());
            },
            error: function(status) {
                alert("An error occured while adding the comment");
            }
        });

    };


    ////////////////////////
    // Settings functions //
    ////////////////////////
	
    /**
	 * show the settingsscreen
	 * @param {Boolean} exists
	 * @param {Object} response
	 */
    var ShowSettingScreen = function(exists, response) {
        $(commentsOutputContainer, rootel).hide();
        $(commentsSettingsContainer, rootel).show();

		// If you're changing an comment-widget, then the saved values need to be filled in
        if (exists) {
            var comments = json_parse(response);
            $("input[name=" + commentsDisplayRbt + "][value=" + comments.display + "]", rootel).attr("checked", true);
            $("input[name=" + commentsDirectionRbt + "][value=" + comments.direction + "]", rootel).attr("checked", true);
            $("input[name=" + commentsPermissionsRbt + "][value=" + comments.permissions.postWhenLoggedOut + "]", rootel).attr("checked", true);
            $(commentsEmailReqChk, rootel).attr("checked", comments.permissions.mailRequired);
            $(commentsNameReqChk, rootel).attr("checked", comments.permissions.nameRequired);
            $(commentsSendMailChk, rootel).attr("checked", comments.sendMailWhenComment);
            $(commentsPageTxt, rootel).val(comments.perPage);
        }

    };

    /**
	 * When the settings are saved to JCR, this function will be called.
	 * It will notify the container that it can be closed.
	 */
    var finishNewSettings = function() {
        sdata.container.informFinish(tuid);
    };

    /**
	 * fills up the settings JSON-object
	 * @return {Object} the settings JSON-object, returns {Boolean} false if input is invalid
	 */
    var getCommentsSettings = function() {
        var comments = {};
        comments.comments = [];

        // Checks if there's already some comments placed on the widget
        if (typeof json.comments !== "undefined") {
            comments.comments = json.comments;
        }

        comments.display = $("input[name=" + commentsDisplayRbt + "]:checked", rootel).val();
        comments.perPage = parseInt($(commentsPageTxt, rootel).val(), 10);

		if(comments.display === "comments_PerPage"){
			 // There shouldn't be pages with 0 items on
	        if (comments.perPage < 1) {
	            alert("Please fill in a number bigger then 0.");
	            return false;
	        }
	        // Check if a valid number is inserted
	        else if (comments.perPage + "" === "NaN") {
	            alert("Please fill in a valid number.");
	            return false;
	        }
		}
       
        comments.direction = $("input[name=" + commentsDirectionRbt + " ]:checked", rootel).val();

        // These properties are noy yet used in the comments-widget, but are saved in JCR
        comments.permissions = {
            'postWhenLoggedOut': $("input[name=" + commentsPermissionsRbt + "]:checked", rootel).val(),
            'nameRequired': $(commentsNameReqChk, rootel).attr("checked"),
            'mailRequired': $(commentsEmailReqChk, rootel).attr("checked")
        };
        comments.sendMailWhenComment = $(commentsSendMailChk, rootel).attr("checked");

        return comments;
    };




    ////////////////////
    // Event Handlers //
    ////////////////////
	
    /** Bind the choose display radiobuttons button */
    $("input[name=" + commentsDisplayRbt + "]", rootel).bind("click",
    function(e, ui) {
        var selectedValue = $("input[name=" + commentsDisplayRbt + "]:checked", rootel).val();
        // When the perPage-rbt is selected the focus should be set to the Page-textbox
        if (selectedValue === "comments_PerPage") {
            $(commentsPageTxt, rootel).focus();
        }
    });

    /** Bind the choose permissions radiobuttons button */
    $("input[name=" + commentsPermissionsRbt + "]", rootel).bind("change",
    function(e, ui) {
        var selectedValue = $("input[name=" + commentsPermissionsRbt + "]:checked", rootel).val();
        // If a login is required the user shouldn't have the posibility to check Name-required or Email-required
        $(commentsNameReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");
        $(commentsEmailReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");

    });

    /** Bind the settings submit button*/
    $(commentsSubmit, rootel).bind("click",
    function(e, ui) {
        // If the settings-input is valid an object will be returned else false will be returned
        if (getCommentsSettings()) {
            var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
            // gets the JSON-settings-object and converts it to a string
            var tostring = $.toJSON(getCommentsSettings());
            sdata.widgets.WidgetPreference.save(saveUrl, "comments", tostring, finishNewSettings);
        }

    });

    /** Bind the top/bottom insert comment button*/
    $(commentsCommentBtn, rootel).bind("click",
    function(e, ui) {
		var jsonTemp = cloneObject(json);
		// checks if the user is loggedIn
        jsonTemp.loggedIn = (typeof me.preferences.uuid !== "undefined");
		// gets the place where the add comments buttons is clicked (Top or Bottom) 
        jsonTemp.place = e.target.id.replace(commentsCommentBtnNoDot + "_", "");
		// Renders the put commentTextbox, can be dynamic because of the require-login, require-name and require-mail properties
        $(commentsFillInComment + jsonTemp.place, rootel).html($.Template.render(commentsFillInCommentTemplate, jsonTemp));
        $(commentsFillInComment + jsonTemp.place, rootel).toggle();
        $(commentsMessageTxt, $(rootel.selector + " " + commentsFillInComment + jsonTemp.place)).focus();
        /** Bind submit comment button */
        $(commentsPostCommentStart + jsonTemp.place, rootel).bind("click",
        function(e, ui) {
            postComment(commentsFillInComment + jsonTemp.place);
        });

    });

    /** Bind the settings cancel button */
    $(commentsCancel, rootel).bind("click",
    function(e, ui) {
        sdata.container.informCancel(tuid);
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////
    /**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
    var doInit = function() {
        var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "comments");
        if (showSettings) {
            $.ajax({
                url: url,
                cache: false,
                success: function(data) {
                    json = $.evalJSON(data);
                    ShowSettingScreen(true, data);
                },
                error: function(status) {
                    ShowSettingScreen(false, status);
                }
            });

        } else {
            $(commentsSettingsContainer, rootel).hide();
            $(commentsOutputContainer, rootel).show();
            $.ajax({
                url: url,
                cache: false,
                success: function(data) {
                    json = $.evalJSON(data);
                    showComments();
                },
                error: function(status) {
                    alert("An error occured while receiving the comments");
                }
            });
        }
    };

    doInit();

};

sdata.widgets.WidgetLoader.informOnLoad("comments");