var sakai = sakai || {};
var $ = $ ||
function() {
    throw "JQuery undefined";
};
var sdata = sdata ||
function() {
    throw "sdata undefined";
};
var json_parse = json_parse || 
function(){
	throw "json_parse undefined";
};

/**
 * Shows the comments for the user
 * @param {Object} rootel
 * @param {Object} json
 */
sakai.displayComments = function(rootel, json){
	var pageStart = 0;
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
            d.setHours(parseInt(match[4],10) + 1);
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
	 * Pager click handler
	 * @param {Number} pageclickednumber
	 */
    var pagerClickHandler = function(pageclickednumber) {
        $(".commentswow_jq_pager",rootel).pager({
            pagenumber: pageclickednumber,
            pagecount: Math.ceil(json.comments.length / json.perPage),
            buttonClickCallback: pagerClickHandler
        });
        pageStart = (pageclickednumber - 1) * json.perPage;
        var jsonTemp = $.extend(true, {},
        json);
        jsonTemp.comments = [];
        var j = 0;
        // paging is different when newest post is on top
        if (json.direction === "commentswow_FirstUp") {
            var k = (json.comments.length - pageStart - json.perPage);
            if (k < 0) {
                k = 0;
            }
            for (var i = k;
            (i < json.comments.length - pageStart); i++) {
                var commentTemp = $.extend(true, {},
                json.comments[i]);
                commentTemp.sortIndex = j;
                jsonTemp.comments.push(commentTemp);
                j++;
            }
        }
        else {
            for (i = pageStart;
            (i < json.comments.length) && (i < pageStart + json.perPage); i++) {
                jsonTemp.comments.push(json.comments[i]);
            }
        }

        $("#commentswow_showComments", rootel).html(sdata.html.Template.render('commentswow_showCommentsTemplate', jsonTemp));
    };
	
	return{
		  /**
	 * Show al comments
	 */
    showComments : function() {
        $("#commentswow_numComments", rootel).html(json.comments.length);
        if (json.comments.length === 1) {
            $("#commentswow_commentscomment").html = "comment";
        }
        if (typeof json.comments !== "undefined" && json.comments.length !== 0) {
            var sUrl = "/rest/me/";
            var users = [];
            var iUserIndex = 0;
            for (var i = 0; i < json.comments.length; i++) {

                if (typeof json.comments[i].uid !== "undefined") {
                    if (typeof users[json.comments[i].uid] === "undefined") {
                        sUrl += json.comments[i].uid + ",";
                        users[json.comments[i].uid] = iUserIndex;
                        json.comments[i].id = iUserIndex;
                        iUserIndex++;
                    }
                    else {
                        json.comments[i].id = users[json.comments[i].uid];
                    }
                    if (typeof json.comments[i].date !== "object") {
                        json.comments[i].date = parseDate(json.comments[i].date);
                    }
                    json.comments[i].parseddate = formatDate(json.comments[i].date);
                    json.comments[i].originalIndex = i;
                    json.comments[i].sortIndex = i;
                    json.comments[i].timeAgo = "about " + getTimeAgo(json.comments[i].date) + " ago";
                }
            }
            sdata.Ajax.request({
                httpMethod: "GET",
                url: sUrl,
                onSuccess: function(data) {

                    json.users = json_parse(data);
                    for (var i = 0; i < json.users.users.length; i++) {
                        if (typeof json.users.users[i].profile.picture !== "undefined") {
                            var image = json_parse(json.users.users[i].profile.picture);
                            json.users.users[i].picture = "/sdata/f/_private" + json.users.users[i].userStoragePrefix + image.name;
                        }
                        else {
                            json.users.users[i].picture = "/dev/redesign/images/member.png";
                        }

                    }

                    if (json.display === "commentswow_PerPage") {
                        $(".commentswowjq_pager",rootel).pager({
                            pagenumber: 1,
                            pagecount: Math.ceil(json.comments.length / json.perPage),
                            buttonClickCallback: pagerClickHandler
                        });
                        pagerClickHandler(1);
                    }
                    else {
                        $("#commentswow_showComments", rootel).html(sdata.html.Template.render('commentswow_showCommentsTemplate', json));
                        $("#commentswow_nextPage", rootel).hide();
                    }

                },
                onFail: function(status) {
                    alert("Couldn't connect to the server.");
                }
            });

        }

    }

	};
};

/**
 * Initialize the discussion widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.commentswow = function(tuid, placement, showSettings) {
    var json = false; // Variable used to recieve information by json
    var me = false; // Contains information about the current user
    var rootel = $("#" + tuid); // Get the main div used by the widget
    

    /**
	 * Gets the current user
	 */
    var getCurrentUser = function() {
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/me",
            onSuccess: function(data) {
                me = json_parse(data);
                if (!me) {
                    alert('An error occured when getting the current user.');
                }
            },
            onFail: function(status) {
                alert("Couldn't connect to the server.");
            }
        });
    };
    getCurrentUser();



  
    /**
	 * show the settingsscreen
	 * @param {Boolean} exists
	 * @param {Object} response
	 */
    var ShowSettingScreen = function(exists, response) {
        $("#commentswow_settings", rootel).show();
        $("#commentswow_mainContainer", rootel).hide();

        if (exists) {
            var commentswow = json_parse(response);
            $("input[name=commentswow_ChooseDisplayComments][value=" + commentswow.display + "]", rootel).attr("checked", true);
            $("input[name=commentswow_ChooseDirectionComments][value=" + commentswow.direction + "]", rootel).attr("checked", true);
            $("input[name=commentswow_ChoosePermissionComments][value=" + commentswow.permissions.postWhenLoggedOut + "]", rootel).attr("checked", true);
            $("#commentswow_Emailrequired", rootel).attr("checked", commentswow.permissions.mailRequired);
            $("#commentswow_Namerequired", rootel).attr("checked", commentswow.permissions.nameRequired);
            $("#commentswow_SendMail", rootel).attr("checked", commentswow.sendMailWhenComment);
            $('#commentswow_txtPage', rootel).val(commentswow.perPage);
        }

    };

    /**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
    if (showSettings) {
        sdata.Ajax.request({
            url: "/sdata/f/" + placement + "/" + tuid + "/commentswow?sid=" + Math.random(),
            httpMethod: "GET",
            onSuccess: function(data) {
                json = json_parse(data);
                ShowSettingScreen(true, data);
            },
            onFail: function(status) {
                ShowSettingScreen(false, status);
            }
        });

    } else {
        $("#commentswow_settings", rootel).hide();
        $("#commentswow_mainContainer", rootel).show();

        sdata.Ajax.request({
            url: "/sdata/f/" + placement + "/" + tuid + "/commentswow?sid=" + Math.random(),
            httpMethod: "GET",
            onSuccess: function(data) {
                json = json_parse(data);
                sakai.displayComments(rootel, json).showComments();
            },
            onFail: function(status) {
                alert("An error occured while receiving the comments");
            }
        });
    }

    var finishNewSettings = function() {
        sdata.container.informFinish(tuid);
    };

    /**
	 * gets the filled in settings, returns a Json object
	 */
    var getCommentsSettings = function() {
        var commentswow = {};
        commentswow.comments = [];

        if (typeof json.comments !== "undefined") {
            commentswow.comments = json.comments;
        }

        commentswow.display = $('input[name=commentswow_ChooseDisplayComments]:checked', rootel).val();
        commentswow.perPage = parseInt($('#commentswow_txtPage', rootel).val(), 10);
        commentswow.direction = $('input[name=commentswow_ChooseDirectionComments]:checked', rootel).val();
        commentswow.permissions = {
            'postWhenLoggedOut': $('input[name=commentswow_ChoosePermissionComments]:checked', rootel).val(),
            'nameRequired': $('#commentswow_Namerequired', rootel).attr('checked'),
            'mailRequired': $('#commentswow_Emailrequired', rootel).attr('checked')
        };
        commentswow.sendMailWhenComment = $('#commentswow_SendMail', rootel).attr('checked');

        return commentswow;
    };

    /**
	 * Post a new comment
	 * @param {string} top or bottom container
	 */
    var postComment = function(container) {
        $(container, rootel).toggle();
        var comment = {
            "message": $("#commentswow_txtMessage", container).val().replace(/\n/g, "<br />"),
            "mail": false,
            "name": false,
            "uid": me.preferences.uuid
        };
        if (json.permissions.nameRequired) {
            comment.name = $("#commentswow_txtNamePoster", container).val();
        }
        if (json.permissions.mailRequired) {
            comment.mail = $("#commentswow_txtMailPoster", container).val();
        }
        comment.date = new Date();
        json.comments.push(comment);
        var tostring = sdata.JSON.stringify(json);
        sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "commentswow", tostring, finishNewSettings);
		
        sakai.displayComments(rootel, json).showComments();
		
    };

    /** Bind the choose display radiobuttons button */
    $("input[name=commentswow_ChooseDisplayComments]", rootel).bind("click",
    function(e, ui) {
        var selectedValue = $('input[name=commentswow_ChooseDisplayComments]:checked', rootel).val();
        if (selectedValue === "commentswow_PerPage") {
            $("#commentswow_txtPage", rootel).focus();
        }
        $("#commentswow_showComments", rootel).html(sdata.html.Template.render('commentswow_showCommentsTemplate', json));
    });
    /** Bind the choose permissions radiobuttons button */
    $("input[name=commentswow_ChoosePermissionComments]", rootel).bind("change",
    function(e, ui) {
        var selectedValue = $('input[name=commentswow_ChoosePermissionComments]:checked', rootel).val();

        $("#commentswow_Namerequired", rootel).attr("disabled", selectedValue === "commentswow_RequireLogIn");
        $("#commentswow_Emailrequired", rootel).attr("disabled", selectedValue === "commentswow_RequireLogIn");

    });
    /** Bind the settings submit button*/
    $("#commentswow_submit", rootel).bind("click",
    function(e, ui) {
        var tostring = sdata.JSON.stringify(getCommentsSettings());
        sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "commentswow", tostring, finishNewSettings);
    });
    /** Bind the top insert comment button*/
    $("#commentswow_comment_top", rootel).bind("click",
    function(e, ui) {
        json.loggedIn = (typeof me.preferences.uuid !== "undefined");
        json.place = "Top";
        $("#commentswow_fillInCommentTop", rootel).html(sdata.html.Template.render('commentswow_fillInCommentTemplate', json));
        $("#commentswow_fillInCommentTop", rootel).toggle();
        $("#commentswow_comment", rootel).attr("disabled", true);
        $("#commentswow_txtMessage", "#commentswow_fillInCommentTop").focus();
        /** Bind submit comment button */
        $("#commentswow_postCommentTop", rootel).bind("click",
        function(e, ui) {
            postComment('#commentswow_fillInCommentTop');
        });

    });
    /** Bind the bottom insert comment button*/
    $("#commentswow_comment_bottom", rootel).bind("click",
    function(e, ui) {
        json.loggedIn = (typeof me.preferences.uuid !== "undefined");
        json.place = "Bottom";
        $("#commentswow_fillInCommentBottom", rootel).html(sdata.html.Template.render('commentswow_fillInCommentTemplate', json));
        $("#commentswow_fillInCommentBottom", rootel).toggle();
        $("#commentswow_comment", rootel).attr("disabled", true);
        $("#commentswow_txtMessage", "#commentswow_fillInCommentBottom").focus();
        /** Bind submit comment button */
        $("#commentswow_postCommentBottom", rootel).bind("click",
        function(e, ui) {
            postComment('#commentswow_fillInCommentBottom');
        });

    });

    /** Bind the settings cancel button */
    $("#commentswow_cancel", rootel).bind("click",
    function(e, ui) {
        $("#commentswow_settings", rootel).hide();
        sdata.container.informCancel(tuid);
    });

};

sdata.widgets.WidgetLoader.informOnLoad("commentswow");