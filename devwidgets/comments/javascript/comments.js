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
/*global Config, $, sdata, pagerClickHandler */

var sakai = sakai ||
{};

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
    var widgetSettings = {}; // Will hold the widget settings.
    var me = sakai.data.me; // Contains information about the current user
    var rootel = $("#" + tuid); // Get the main div used by the widget
    var jsonDisplay = {};
    var start = 0; // Start fetching from the first comment.
    var clickedPage = 1;
    var defaultPostsPerPage = 10;
    var currentSite = placement.split("/")[0];
    var store = "/sites/" + currentSite + "/store/";

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
    var commentsNumCommentsDisplayed = commentsNumComments + "Displayed";
    var commentsCommentComments = comments + "_commentscomment";
    var commentsCancelComment = comments + "_cancelComment";

    // Edit parts
    var commentsEdit = commentsClass + "_edit";
    var commentsMessage = comments + "_message_";
    var commentsMessageEditContainer = commentsMessage + "editContainer_";
    var commentsEditText = comments + "_editComment_txt_";
    var commentsEditSave = commentsClass + "_editComment_save";
    var commentsEditCancel = commentsClass + "_editComment_cancel";

    // Delete
    var commentsDelete = commentsClass + "_delete";
    var commentsUnDelete = commentsClass + "_undelete";

    // Output textboxes
    var commentsMessageTxt = comments + "_txtMessage";
    var commentsNamePosterTxt = comments + "_txtNamePoster";
    var commentsMailPosterTxt = comments + "_txtMailPoster";
    // Their containers
    var commentsNamePosterTxtContainer = commentsNamePosterTxt + "_container";
    var commentsMailPosterTxtContainer = commentsMailPosterTxt + "_container";

    // Output classes
    var commentsCommentBtn = commentsClass + "_comment";
    var commentsPager = commentsClass + "_jqpager";


    // Output templates
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
     * Parse a json string to a valid date
     * @param {String} dateInput String of a date that needs to be parsed
     * @returns {Date}
     */
    var parseDate = function(dateInput) {
        /** Get the date with the use of regular expressions */
        if (dateInput !== null) {
            /** Get the date with the use of regular expressions */
            var match = /([0-9]{4})\-([0-9]{2})\-([0-9]{2}).([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(dateInput); // 2009-08-14T12:18:50
            var d = new Date();
            d.setYear(match[1]);
            d.setMonth(match[2] - 1);
            d.setDate(match[3]);
            d.setHours(match[4]);
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
     * Converts all HTML to flat text and converts \n to <br />
     * @param {String} str
     */
    var tidyInput = function(str) {
        str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        str = str.replace(/\n/g, '<br />');
        return str;
    };

    ///////////////////
    // show comments //
    ///////////////////

    /**
     * Show the comments in a paged state or not
     */
    var displayCommentsPagedOrNot = function() {
        jsonDisplay = {
            "comments": [],
            "settings": widgetSettings
        };
        // Loops through all the comments and does the necessary changes to render the JSON-object
        for (var i = 0; i < json.results.length; i++) {
            jsonDisplay.comments[i] = {};
            var comment = json.results[i].post;
            // Checks if the date is already parsed to a date object
            // TODO: Get jcr:created
            var tempDate = comment["sakai:created"];
            try {
                // if the date is not a string this should generate en exception
                comment.date = parseDate(tempDate);
            }
            catch (ex) {
                comment.date = tempDate;
            }
            comment.timeAgo = "about " + getTimeAgo(comment.date) + " ago";
            comment.formatDate = formatDate(comment.date);
            comment.messageTxt = comment["sakai:body"];
            comment.message = tidyInput(comment["sakai:body"]);
            // weird json bug.
            comment["sakai:deleted"] = (comment["sakai:deleted"] && (comment["sakai:deleted"] === "true" || comment["sakai:deleted"] === true)) ? true : false;


            var user = {};
            // User
            // Puts the userinformation in a better structure for trimpath
            if (comment.profile["sling:resourceType"] === "sakai/user-profile") {
                var profile = comment.profile;
                var fullName = "";
                if (profile.firstName) {
                    fullName = profile.firstName;
                }
                if (profile.lastName) {
                    fullName += " " + profile.lastName;
                }
                user.fullName = fullName;
                user.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                // Check if the user has a picture
                if (profile.picture && $.evalJSON(profile.picture).name) {
                    user.picture = "/_user/public/" + profile["rep:userId"] + "/" + $.evalJSON(profile.picture).name;
                }
                user.uid = profile["rep:userId"][0];
                user.profile = sakai.config.URL.PROFILE_URL + "?user=" + user.uid;
            }
            else {
                // This is an anonymous user.
                comment.profile = {};
                comment.profile.fullName = "Anonymous";
                comment.profile.email = "noreply@sakaiproject.org";
                if (widgetSettings["sakai:forcename"] === true) {
                    comment.profile.fullName = comment['sakai:name'];
                }
                if (widgetSettings["sakai:forcemail"] === true) {
                    comment.profile.email = comment['sakai:email'];
                }
            }

            comment.user = user;

            jsonDisplay.comments[i] = comment;
        }
        $(commentsShowComments, rootel).html($.TemplateRenderer(commentsShowCommentsTemplate, jsonDisplay));
    };

    /**
     * Show all the posted comments
     * This function first retrieves all the users who have posted in this widget and then call the displayCommentsPagedOrNot function
     */
    var showComments = function() {
        // Show the nr of comments we are showing.
        var showingComments = json.total;
        if (widgetSettings.perPage < json.total) {
            showingComments = widgetSettings.perPage;
        }
        $(commentsNumCommentsDisplayed, rootel).html(showingComments);
        // Puts the number of comments on the page
        $(commentsNumComments, rootel).html(json.total);
        // Change to "comment" or "comments"
        if (json.total === 1) {
            $(commentsCommentComments, rootel).text("comment");
        }


        // Change the page-number on the display
        $(commentsPager, rootel).pager({
            pagenumber: clickedPage,
            pagecount: Math.ceil(json.total / widgetSettings.perPage),
            buttonClickCallback: pagerClickHandler
        });

        if (json.total > widgetSettings.perPage) {
            $(commentsPager, rootel).show();
        }
        // Checks if the comments undefined or if it's length is 0
        displayCommentsPagedOrNot();
    };

    /**
     * Gets the comments from the service.
     */
    var getComments = function() {
        var sortOn = "sakai:created";
        var sortOrder = "descending";
        var items = 10;
        if (widgetSettings.direction && widgetSettings.direction === "comments_FirstDown") {
            sortOrder = "ascending";
        }
        if (widgetSettings.perPage) {
            items = widgetSettings.perPage;
        }

        var url = "/var/search/comments/flat.json?sortOn=" + sortOn + "&sortOrder=" + sortOrder + "&page=" + (clickedPage - 1) + "&items=" + items +"&marker=" + tuid + "&path=" + store.substring(0, store.length - 1);
        $.ajax({
            url: url,
            cache: false,
            success: function(data) {
                json = $.evalJSON(data);
                showComments();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("comments: An error occured while receiving the comments (" + xhr.status + ")");
            }
        });
    };

    /**
     * Pager click handler
     * @param {Number} pageclickednumber
     */
    var pagerClickHandler = function(pageclickednumber) {
        clickedPage = pageclickednumber;

        // Change the page-number on the display
        $(commentsPager, rootel).pager({
            pagenumber: pageclickednumber,
            pagecount: Math.ceil(json.total / widgetSettings.perPage),
            buttonClickCallback: pagerClickHandler
        });
        getComments();
    };

    /**
     * Returns a unique reference to this comment placement.
     * For now this is just placement + "#" +  tuid
     */
    var getReferenceID = function() {
        return placement + "/" + tuid;
    };


    /**
     * Post a new comment
     */
    var postComment = function() {
        var comment = {
            // Replaces the \n (enters) with <br />
            "message": $(commentsMessageTxt, rootel).val()
        };
        comment["sakai:type"] = "comment";

        var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
        var allowPost = true;
        // If the user is not loggedin but we allow anon comments, we check some extra fields.
        if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === true) {
            if (!isLoggedIn && widgetSettings['sakai:forcename']) {
                comment["sakai:name"] = $(commentsNamePosterTxt, rootel).val();
                if (comment["sakai:name"].replace(/\s/g, "") === "") {
                    allowPost = false;
                }
            }
            if (!isLoggedIn && widgetSettings['sakai:forcemail']) {
                comment["sakai:email"] = $(commentsMailPosterTxt, rootel).val();
                if (comment["sakai:email"].replace(/\s/g, "") === "") {
                    allowPost = false;
                }
            }
        }
        if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === false) {
            // This should not even happen.. Somebody is tinkering with the HTML.
            allowPost = false;
            alert("Anonymous users are not allowed to post comments. Please register or log in to add your comment.");
        }

        var subject = 'Comment on sites/' + placement;
        var to = "internal:s-" + currentSite;

        if (allowPost) {
            var body = $(commentsMessageTxt, rootel).val();
            var message = {
                "sakai:type": "comment",
                "sakai:to": to,
        "sakai:marker": tuid,
        "sakai:subject": subject,
                "sakai:body": body,
                "sakai:messagebox": "outbox",
        "sakai:sendstate" : "pending",
        "_charset_":"utf-8"
            };


            var url = "/_user/message.create.html";
            $.ajax({
                url: url,
                type: "POST",
                cache: false,
                success: function(data) {
                    // Hide the form.
                    $(commentsFillInComment, rootel).hide();
                    // Clear the textboxes.
                    $(commentsMessageTxt, rootel).val("");
                    $(commentsNamePosterTxt, rootel).val("");
                    $(commentsMailPosterTxt, rootel).val("");
                    // Get the comments.
                    getComments();
                },
                error: function(xhr, textStatus, thrownError) {
                    if (xhr.status === 401) {
                        alert("You are not allowed to add comments.");
                    }
                    else {
                        alert("Failed to save.");
                    }
                },
                data: message
            });
        }
        else {
            alert("Please fill in all the fields.");
        }
    };

    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * show the settingsscreen
     * @param {Boolean} exists
     * @param {Object} response
     */
    var showSettingScreen = function(exists, response) {
        $(commentsOutputContainer, rootel).hide();
        $(commentsSettingsContainer, rootel).show();

        // If you're changing an comment-widget, then the saved values need to be filled in
        if (exists) {
            $("input[name=" + commentsDirectionRbt + "][value=" + widgetSettings.direction + "]", rootel).attr("checked", true);
            if (widgetSettings['sakai:allowanonymous'] && widgetSettings['sakai:allowanonymous'] === true) {
                $("#comments_DontRequireLogInID", rootel).attr("checked", true);
                $(commentsNameReqChk, rootel).attr("disabled", false);
                $(commentsEmailReqChk, rootel).attr("disabled", false);
            }
            else {
                $("#comments_RequireLogInID", rootel).attr("checked", true);
                $(commentsNameReqChk, rootel).attr("disabled", true);
                $(commentsEmailReqChk, rootel).attr("disabled", true);
            }
            $(commentsEmailReqChk, rootel).attr("checked", widgetSettings['sakai:forcemail']);
            $(commentsNameReqChk, rootel).attr("checked", widgetSettings['sakai:forcename']);


            $(commentsSendMailChk, rootel).attr("checked", widgetSettings['sakai:notification']);
            $(commentsPageTxt, rootel).val(widgetSettings.perPage);
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
        comments.comments = json.comments || [];

        comments.perPage = parseInt($(commentsPageTxt, rootel).val(), 10);
        if (isNaN(comments.perPage)) {
            comments.perPage = defaultPostsPerPage;
        }

        if (comments.perPage < 1) {
            alert("Please fill in a number bigger then 0.");
            return false;
        }
        // Check if a valid number is inserted
        else if ($(commentsPageTxt, rootel).val().search(/^\d*$/)) {
            alert("Please fill in a valid number.");
            return false;
        }


        comments.direction = $("input[name=" + commentsDirectionRbt + " ]:checked", rootel).val();

        // These properties are noy yet used in the comments-widget, but are saved in JCR
        comments['sakai:allowanonymous'] = true;
        if ($("#comments_RequireLogInID", rootel).is(":checked")) {
            comments['sakai:allowanonymous'] = false;
        }
        comments['sakai:forcename'] = $(commentsNameReqChk, rootel).attr("checked");
        comments['sakai:forcemail'] = $(commentsEmailReqChk, rootel).attr("checked");
        comments['sakai:notification'] = $(commentsSendMailChk, rootel).attr("checked");
        comments['sakai:notificationaddress'] = me.user.userid;
        comments['sling:resourceType'] = 'sakai/settings';
        comments['sakai:marker'] = tuid;
        comments['sakai:type'] = "comment";

        return comments;
    };

    /**
     * Makes sure that values that are supposed to be booleans, really are booleans.
     * @param {String[]} arr Array of strings which holds keys for the widgetSettings variable that needs to be checked.
     */
    var cleanBooleanSettings = function(arr) {
        for (var i = 0; i < arr.length; i++) {
            var name = arr[i];
            widgetSettings[name] = (widgetSettings[name] && (widgetSettings[name] === true || widgetSettings[name] === "true" || widgetSettings[name] === 1)) ? true : false;
        }
    };

    /**
     * Gets the widget settings and shows the appropriate view.
     */
    var getWidgetSettings = function() {
        var url = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "settings.json");
        $.ajax({
            url: url,
            cache: false,
            success: function(data) {
                widgetSettings = $.evalJSON(data);
                // Clean up some values so that true is really true and not "true" or 1 ...
                var keysToClean = ['sakai:forcename', 'sakai:forcemail', 'notification', 'sakai:allowanonymous'];
                cleanBooleanSettings(keysToClean);

                var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
                if (widgetSettings["sakai:allowanonymous"] === false && !isLoggedIn) {
                    $(commentsCommentBtn, rootel).parent().hide();
                }

                if (showSettings) {
                    showSettingScreen(true, data);
                }
                else {
                    pagerClickHandler(1);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                if (showSettings) {
                    showSettingScreen(false, xhr.status);
                }
                else {
                    pagerClickHandler(1);
                }
            }
        });
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Bind the choose display radiobuttons button */
    $("input[name=" + commentsDisplayRbt + "]", rootel).bind("click", function(e, ui) {
        var selectedValue = $("input[name=" + commentsDisplayRbt + "]:checked", rootel).val();
        // When the perPage-rbt is selected the focus should be set to the Page-textbox
        if (selectedValue === "comments_PerPage") {
            $(commentsPageTxt, rootel).focus();
        }
    });

    /** Bind the choose permissions radiobuttons button */
    $("input[name=" + commentsPermissionsRbt + "]", rootel).bind("change", function(e, ui) {
        var selectedValue = $("input[name=" + commentsPermissionsRbt + "]:checked", rootel).val();
        // If a login is required the user shouldn't have the posibility to check Name-required or Email-required
        $(commentsNameReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");
        $(commentsEmailReqChk, rootel).attr("disabled", selectedValue === "comments_RequireLogIn");

    });

    /** Bind the settings submit button*/
    $(commentsSubmit, rootel).bind("click", function(e, ui) {
        // If the settings-input is valid an object will be returned else false will be returned
        var settings = getCommentsSettings();
        if (settings) {
            settings["_charset_"] = "utf-8";
        var saveUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, "settings");
            // gets the JSON-settings-object and converts it to a string

            $.ajax({
                url: saveUrl,
                type: "POST",
                cache: false,
                success: function(data) {
                    finishNewSettings();
                },
                error: function(xhr, textStatus, thrownError) {
                    alert("Failed to save.");
                },
                data: settings
            });

        }

    });

    /** Bind the insert comment button*/
    $(commentsCommentBtn, rootel).bind("click", function(e, ui) {
        // checks if the user is loggedIn
        var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
        var txtToFocus = commentsMessageTxt;
        // If the user is not loggedin but we allow anon comments, we show some extra fields.
        if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === true) {
            if (widgetSettings['sakai:forcename'] !== false) {
                txtToFocus = commentsNamePosterTxt;
                $(commentsNamePosterTxtContainer, rootel).show();
            }
            if (widgetSettings['sakai:forcemail'] !== false) {
                // If name is not nescecary we focus the email address.
                if (txtToFocus === commentsMessageTxt) {
                    txtToFocus = commentsMailPosterTxt;
                }
                $(commentsMailPosterTxtContainer, rootel).show();
            }
        }
        if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === false) {
            // This should not even happen.. Somebody is tinkering with the HTML.
            alert("Anonymous users are not allowed to post comments. Please register or log in to add your comment.");
        }
        // Show the form.
        $(commentsFillInComment, rootel).show();
        $(txtToFocus, rootel).focus();
    });

    /**
     * Hide the form, but keep the input.
     */
    $(commentsCancelComment, rootel).bind('click', function() {
        $(commentsFillInComment, rootel).hide();
    });

    /** Bind submit comment button */
    $(commentsPostCommentStart, rootel).bind("click", function(e, ui) {
        postComment();
    });

    /** Bind the settings cancel button */
    $(commentsCancel, rootel).bind("click", function(e, ui) {
        sdata.container.informCancel(tuid);
    });


    /////////////////
    // DELETE LINK //
    /////////////////
    /**
     * Deletes or undeleted a post with a certain id.
     * @param {String} id The id of the post.
     * @param {Boolean} deleteValue true = delete it, false = undelete it.
     */
    var doDelete = function(id, deleteValue) {
        var url = store + id;
        var data = {
            "sakai:deleted": deleteValue
        };
        $.ajax({
            url: url,
            type: 'POST',
            success: function() {
                getComments();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to (un)delete the post.");
            },
            data: data
        });
    };

    $(commentsDelete, rootel).live("click", function(e, ui) {
        var id = e.target.id.replace(commentsDelete.replace(/\./g, ""), "");
        doDelete(id, true);
    });

    $(commentsUnDelete, rootel).live("click", function(e, ui) {
        var id = e.target.id.replace(commentsUnDelete.replace(/\./g, ""), "");
        doDelete(id, false);
    });


    ////////////////
    // EDIT PARTS //
    ////////////////

    /**
     * Edit link
     */
    $(commentsEdit, rootel).live('click', function(e, ui) {
        var id = e.target.id.replace("comments_edit_", "");
        // Show the textarea
        $(commentsMessage + id, rootel).hide();
        $(commentsMessageEditContainer + id, rootel).show();
    });

    /**
     * Save the edited comment.
     */
    $(commentsEditSave, rootel).live('click', function(e, ui) {
        var id = e.target.id.replace(commentsEditSave.replace(/\./g, ""), "");
        var message = $(commentsEditText + id, rootel).val();
        if (message !== "") {
            var data = {
                "sakai:body": message,
                "sakai:editedby" : me.user.userid + "|" + new Date().toUTCString()
            };
            // Do a post to the comment to edit the message.
            var commentUrl = store + id;
            $.ajax({
                url: commentUrl,
                cache: false,
                type: 'POST',
                success: function(data) {
                    // Set the new message
                    $(commentsMessage + id, rootel).html(tidyInput(message));
                    // Hide the form
                    $(commentsMessageEditContainer + id, rootel).hide();
                    $(commentsMessage + id, rootel).show();
                },
                error: function(xhr, textStatus, thrownError) {
                    alert("Failed to edit comment.");
                },
                data: data
            });
        }
        else {
            alert("Please enter a message.");
        }
    });

    /**
     * Cancel the edit comment.
     */
    $(commentsEditCancel, rootel).live('click', function(e, ui) {
        var id = e.target.id.replace(commentsEditCancel.replace(".", ""), "");
        // Show the textarea
        $(commentsMessageEditContainer + id, rootel).hide();
        $(commentsMessage + id, rootel).show();
    });

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////
    /**
     * Switch between main and settings page
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    var doInit = function() {
        if (!showSettings) {
            // Show the main view.
            $(commentsSettingsContainer, rootel).hide();
            $(commentsOutputContainer, rootel).show();
        }
        getWidgetSettings();
    };
    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("comments");
