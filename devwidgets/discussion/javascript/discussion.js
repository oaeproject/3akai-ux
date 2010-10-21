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
 * @name sakai.discussion
 *
 * @class discussion
 *
 * @description
 * Initialize the discussion widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.discussion = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var me = sakai.data.me; // Contains information about the current user
    var rootel = $("#" + tuid); // Get the main div used by the widget
    var editing = false; // Currently editing a post
    var currentEditId = ""; // ID of the element that is currently being edited
    var currentReplyId = "0"; // ID of the post that is currently being replied to
    var selectedExistingDiscussionID = false; // ID of the discussion-widget which is currently selected in the insert existing discussion form
    var editContainer = "";
    // Each post gets a marker which is basicly the widget ID.
    // If we are using another discussion this marker will be the ID of that widget.
    var marker = tuid;
    var widgeturl = sakai.api.Widgets.widgetLoader.widgets[tuid] ? sakai.api.Widgets.widgetLoader.widgets[tuid].placement : false;
    var currentSite = "";
    var store = "";
    var widgetSettings = {};
    var allDiscussions = [];
    var initialPost = false;
    var countReplies = 0;
    var currentDisplayMode = '';

    // - Main Id
    var discussion = "#discussion";
    var discussionPosts = discussion + "_posts";

    // Class
    var discussionClass = ".discussion";
    var discussionContentClass = discussionClass + "_content";
    var discussionContentDeleteClass = discussionContentClass + "_delete";
    var discussionContentUnDeleteClass = discussionContentClass + "_undelete";
    var discussionContentEditClass = discussionContentClass + "_edit";
    var discussionContentReplyClass = discussionContentClass + "_reply";
    var discussionToggleShowAllClass = discussionClass + "_toggle_showall";
    var discussionToggleShowHideAllClass = discussionClass + "_toggle_showhideall";
    var discussionToggleShowHideAllTextClass = discussionToggleShowHideAllClass + "_text";

    // Class without .
    var discussionSettingsListItemClass = "discussion_settings_list_item";
    var discussionSettingsListItemSelectedClass = discussionSettingsListItemClass + "_selected";
    var discussionSettingsTabClass = "discussion_settings_tab";
    var discussionSettingsTabSelectedClass = discussionSettingsTabClass + "_selected";

    // Container
    var discussionContainer = discussion + "_container";
    var discussionMainContainer = discussion + "_main_container";

    // Add new topic
    var discussionAdd = discussion + "_add";
    var discussionAddContainer = discussionAdd + "_container";
    var discussionAddNewTopic = discussionAdd + "_newtopic";
    var discussionAddTopicSubject = discussionAdd + "_subject";
    var discussionAddTopicBody = discussionAdd + "_body";
    var discussionAddTopicSubmit = discussionAdd + "_submit";
    var discussionAddTopicCancel = discussionAdd + "_cancel";

    // Content
    var discussionContent = discussion + "_content";
    var discussionContentActions = discussionContent + "_actions";
    var discussionContentContainer = discussionContent + "_container";
    var discussionContentMessage = discussionContent + "_message";
    var discussionContentSubject = discussionContent + "_subject";

    // Edit
    var discussionEdit = discussion + "_edit";
    var discussionEditCancel = discussionEdit + "_cancel";
    var discussionEditContainer = discussionEdit + "_container";
    var discussionEditMessage = discussionEdit + "_message";
    var discussionEditSave = discussionEdit + "_save";
    var discussionEditSubject = discussionEdit + "_subject";

    // No (when there are none)
    var discussionNo = discussion + "_no";
    var discussionNoDiscussions = discussionNo + "_discussions";

    // Reply
    var discussionReply = discussion + "_reply";
    var discussionReplyBody = discussionReply + "_body";
    var discussionReplyCancel = discussionReply + "_cancel";
    var discussionReplyContainer = discussionReply + "_container";
    var discussionReplySubject = discussionReply + "_subject";
    var discussionReplySubmit = discussionReply + "_submit";

    // Settings
    var discussionSettings = discussion + "_settings";

    var discussionSettingsExisting = discussionSettings + "_existing";
    var discussionSettingsExistingContainer = discussionSettingsExisting + "_container";
    var discussionSettingsExistingTab = discussionSettingsExisting + "_tab";

    var discussionSettingsNew = discussionSettings + "_new";
    var discussionSettingsNewBody = discussionSettingsNew + "_body";
    var discussionSettingsNewContainer = discussionSettingsNew + "_container";
    var discussionSettingsNewSubject = discussionSettingsNew + "_subject";
    var discussionSettingsNewTab = discussionSettingsNew + "_tab";

    var discussionSettingsDisplayOptions = discussionSettings + "_display_options";
    var discussionSettingsDisplayOptionsContainer = discussionSettingsDisplayOptions + "_container";
    var discussionSettingsDisplayOptionsTab = discussionSettingsDisplayOptions + "_tab";

    var discussionSettingsSubmit = discussionSettings + "_submit";

    // Templates
    var discussionContainerTemplate = "discussion_container_template";
    var discussionSettingsExistingContainerTemplate = "discussion_settings_existing_container_template";
    var discussionCompactContainerTemplate = "discussion_compact_container_template";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Format an input date (used by TrimPath)
     * @param {Date} d Date that needs to be formatted
     * @return {String} A string that beautifies the date e.g. May 11, 2009 at 9:11AM
     */
    var formatDate = function(d){
        var names_of_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var am_or_pm = "";

        var current_hour = d.getHours();
        if (current_hour < 12) {
            am_or_pm = "AM";
        }
        else {
            am_or_pm = "PM";
        }
        if (current_hour === 0) {
            current_hour = 12;
        }
        if (current_hour > 12) {
            current_hour = current_hour - 12;
        }

        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1) {
            current_minutes = "0" + current_minutes;
        }

        return (names_of_months[d.getMonth()].substring(0, 3) + " " + d.getDate() + ", " + d.getFullYear() + " at " + current_hour + ":" + current_minutes + am_or_pm);
    };

    /**
     * Parse a json integer to a valid date
     * @param {Integer} dateInput Integer of a date that needs to be parsed
     * @returns {Date}
     */
    var parseDate = function(dateInput){
        //2009-08-19 11:29:53+0100
        //2009-08-19T10:58:27
        if (dateInput !== null) {
            /** Get the date with the use of regular expressions */
            var match = /([0-9]{4})\-([0-9]{2})\-([0-9]{2}).([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(dateInput); // 2009-08-14T12:18:50
            var d = new Date();
            if (match !== undefined) {
                d.setYear(match[1]);
                d.setMonth(match[2] - 1);
                d.setDate(match[3]);
                d.setHours(match[4]);
                d.setMinutes(match[5]);
                d.setSeconds(match[6]);
            }
            return d;
        }
        return null;
    };

    /**
     * Scroll to a specific element in a page
     * @param {Object} element The element you want to scroll to
     */
    var scrollTo = function(element){
        $('html, body').animate({
            scrollTop: element.offset().top
        }, 1);
    };

    /**
     * Parse the name for a user
     * @param {String} uuid Uuid of the user
     * @param {String} firstName Firstname of the user
     * @param {String} lastName Lastname of the user
     */
    var parseName = function(uuid, profile){
        var displayName = sakai.api.User.getDisplayName(profile);
        if (displayName) {
            return displayName;
        }
        else {
            return uuid;
        }
    };

    /**
     * Parse the picture for a user
     * @param {String} profile The profile for a user
     * @param {String} uuid Uuid of the user
     */
    var parsePicture = function(uuid, profile){
        // Check if the picture is undefined or not
        // The picture name will be undefined if the other user is in process of
        // changing his/her picture
        if (profile.picture && $.parseJSON(profile.picture).name) {
            var picture = $.parseJSON(profile.picture);
            return "/~" + uuid + "/public/profile/" + picture.name;
        }
        else {
            return "/dev/_images/user_avatar_icon_32x32.png";
        }
    };


    ////////////////////
    // Edit functions //
    ////////////////////

    /**
     * Stop editing and show/hide the appropriate divs
     * @param {String} id Id of the post that you stop editing
     */
    var stopEditing = function(id){
        $(discussionContentContainer + "_" + id, rootel).show();
        $(discussionContentActions + "_" + id, rootel).show();
        $(editContainer, rootel).remove();
        $(discussionEditMessage, editContainer).val("");
        $(discussionEditSubject, editContainer).val("");
        editing = false;
    };

    /**
     * Remove the edit form and replace the old content with the new one.
     * @param {String} id The id of the post to edit
     * @param {String} subject The new subject
     * @param {String} body The new body
     */
    var editComplete = function(id, subject, body){
        // Show new values
        stopEditing(id);

        $(discussionContentSubject + "_" + id, rootel).html(sakai.api.Security.saneHTML(subject));
        $(discussionContentMessage + "_" + id, rootel).html(sakai.api.Security.saneHTML(body.replace(/\n/g, "<br />")));

    };

    /**
     * Does the actual request to edit a post.
     * @param {String} id
     * @param {String} subject
     * @param {String} body
     */
    var editPost = function(id, subject, body){
        // The data we will send to the node.
        var post = {
            'sakai:subject': subject,
            'sakai:body': body,
            'sakai:editedby': me.user.userid
        };

        $.ajax({
            url: store + "/" + shardedId(id),
            cache: false,
            success: function(data){
                if (showSettings) {
                    sakai.api.Widgets.Container.informFinish(tuid, "discussion");
                }
                else {
                    editComplete(id, subject, body);
                }
            },
            error: function(xhr, textStatus, thrownError){
                alert("Failed to edit this post.");
            },
            data: post,
            type: 'POST'
        });
    };

    /**
     * Return hashed URL for the given ID.
     * e.g Id =testings
     * return te/st/in/gs/testings
     * @param {String} id Id of the post that needs to be edited
     *
     *
     */
    var shardedId = function(id){
        return id.substring(0, 2) + '/' + id.substring(2, 4) + '/' + id.substring(4, 6) + '/' + id.substring(6, 8) + '/' + id;
    };

    /**
     * Show the edit form
     * @param {String} id Id of the post that needs to be edited
     */
    var showEditPost = function(id){
        if (editing) {
            stopEditing(currentEditId);
        }
        editing = true;
        currentEditId = id;

        // Hide the div of the post you want to edit
        $(discussionContentContainer + "_" + id, rootel).hide();
        // Hide the actions of the post you are editing
        $(discussionContentActions + "_" + id, rootel).hide();

        // Clone the edit template div
        // We need to do this so we don't modify the original div
        editContainer = $(discussionEditContainer, rootel).clone();

        // Insert the cloned div after the hidden div with the original post
        $(discussionContentContainer + "_" + id, rootel).after($(editContainer));

        // Insert the text of the post you want to edit in the input fields //
        $(discussionEditSubject, editContainer).val($(discussionContentSubject + "_" + id, rootel).text());

        var sMessage = "";
        sMessage = $(discussionContentMessage + "_" + id, rootel).html();
        sMessage = sMessage.replace(/<br\s*\/?>/g, "\n"); // Replace br or br/ tags with \n tags
        $(discussionEditMessage, editContainer).val(sMessage);

        // Add binding to the cancel button
        $(discussionEditCancel, editContainer).bind("click", function(e, ui){
            stopEditing(id);
        });

        // Add binding to the save button
        $(discussionEditSave, editContainer).bind("click", function(e, ui){
            var subject = $(discussionEditSubject, editContainer).val();
            var message = $(discussionEditMessage, editContainer).val();

            editPost(id, subject, message);
            $(discussionContentActions + "_" + id, rootel).show();
        });

        // Show the edit form and add focus to the first field in that form
        $(editContainer).show();
        $(discussionEditSubject, editContainer).focus();
    };


    //////////////////////
    // DISPLAYING POSTS //
    //////////////////////

    /**
     * Wrapper to allow renderPosts to be called from a click handler
     * @param {Object} event An object whose data attribute contains the jsonPosts
     */
    var renderFullPostsView = function(event){

        // If we are currently in compact mode, re-render
        if (currentDisplayMode === 'compact') {
            renderPosts(event.data);
        }

        $(discussion, rootel).show();
        $(discussion + '_compact_link', rootel).show();
        $(discussion + '_full_link', rootel).hide();
        $(discussion + '_expand_link', rootel).hide();
        $(discussion + '_collapse_link', rootel).show();
    };

    /**
     * Renders the compact view of the current posts.
     */
    var renderCompactPostsView = function(event){

        // If we are currently in full mode, re-render
        if (currentDisplayMode === 'full') {

            // Render the compact view template
            $(discussionContainer, rootel).html($.TemplateRenderer(discussionCompactContainerTemplate, event.data));
            $('#discussion_post' + event.data.posts[0].post["sakai:id"]).show();

        }

        $('#discussion_compact_link', rootel).hide();
        $('#discussion_expand_link', rootel).hide();
        $('#discussion_collapse_link', rootel).show();
        $('#discussion_full_link', rootel).show();

        $('#discussion_container', rootel).show();

        currentDisplayMode = 'compact';
    };

    /**
     * Render the discussion posts
     * @param {Object} jsonPosts The posts that needs to be rendered
     */
    var renderPosts = function(jsonPosts){
        jsonPosts.curr = me;

        // Render the posts with the template engine
        $(discussionContainer, rootel).html($.TemplateRenderer(discussionContainerTemplate, jsonPosts));

        currentDisplayMode = 'full';
    };

    /**
     * Counts all the replies under a post. even the nested ones.
     * @param {Object} post
     */
    var addCountReplies = function(post){
        countReplies += post.replies.length;
        for (var i = 0, j = post.replies.length; i < j; i++) {
            addCountReplies(post.replies[i]);
        }
    };

    /**
     * Makes sure the post is properly formatted so the template engine can interpret it.
     * @param {Object} o
     */
    var doMarkUpOnPost = function(o){
        var post = o.post;
        var uid = post["sakai:from"];
        post.date = formatDate(parseDate(post["sakai:created"]));
        post['sakai:body'] = (""+post['sakai:body']).replace(/\n/g, "<br />");
        post.showEdit = false;
        post.showDelete = false;

        // Show or hide the edit or delete button
        if (me.user.superUser) {
            post.canEdit = true;
            post.canDelete = true;
        }

        // Get the user's firstName, lastName and picture if it's in the database
        var profile = post.profile[0];
        post.profile.fullName = parseName(uid, profile);
        post.profile.picture = parsePicture(uid, profile);

        // Check if someone edited the post
        // post.sakai:editedbyprofiles is an array of objects that contain all the editers for this post.
        // TODO: Fix this weird assignment bug.
        var editedByProfiles = post['sakai:editedbyprofiles'];
        if (editedByProfiles) {
            var lastEditter = editedByProfiles[editedByProfiles.length - 1];

            // Get the profile info from the user that edited the post
            post.editedByUserid = lastEditter.userid;
            post.editedByName = parseName(lastEditter.userid, lastEditter);
            //post.editedByDate = formatDate(parseDate(lastEditter.date));
        }
        o.post = post;

        // Count all the replies;
        countReplies = 0;
        addCountReplies(o);
        o.post.nrOfReplies = "" + countReplies;


        // weird json bug.
        o.post["sakai:deleted"] = (o.post["sakai:deleted"] && (o.post["sakai:deleted"] === "true" || o.post["sakai:deleted"] === true)) ? true : false;

        displayReplies(o);

        return o;
    };

    var displayReplies = function(o) {
        for (var i = 0, j = o.replies.length; i < j; i++) {
            o.replies[i] = doMarkUpOnPost(o.replies[i]);
        }
    };

    /**
     * Get the information for a post.
     * @param {Object[]} arrPosts An array containing all the post
     */
    var getPostInfo = function(arrPosts){

        // Clear the old posts
        $(discussionPosts, rootel).empty();

        // Hide the reply form
        $(discussionReplyContainer, rootel).hide();

        // Hide the add new topic form
        $(discussionAddContainer, rootel).hide();

        for (var i = 0, j = arrPosts.length; i < j; i++) {
            arrPosts[i] = doMarkUpOnPost(arrPosts[i]);
        }

        var jsonPosts = {};
        jsonPosts.posts = arrPosts;

        if (me.user.anon) {
            jsonPosts.loggedIn = false;
        }
        else {
            jsonPosts.loggedIn = true;
        }
        if (jsonPosts.posts[0]) {
        var firstPostSubject = jsonPosts.posts[0].post['sakai:subject'];

        $('#discussion_compact_link', rootel).unbind('click');
        $('#discussion_compact_link', rootel).bind('click', jsonPosts, renderCompactPostsView);

        $('#discussion_full_link', rootel).unbind('click');
        $('#discussion_full_link', rootel).bind('click', jsonPosts, renderFullPostsView);

        $('#discussion_expand_link', rootel).unbind('click');
        $('#discussion_expand_link', rootel).bind('click', function(e, ui){
            $('#discussion_container', rootel).show();

            if (currentDisplayMode === 'full') {
                $('#discussion_compact_link', rootel).show();
                $('#discussion_full_link', rootel).hide();
            }
            else {
                $('#discussion_compact_link', rootel).hide();
                $('#discussion_full_link', rootel).show();
            }

            $('#li_divider', rootel).show();

            $('#discussion_expand_link', rootel).hide();
            $('#discussion_collapse_link', rootel).show();
        });

        $('#discussion_collapse_link', rootel).unbind('click');
        $('#discussion_collapse_link', rootel).bind('click', function(e, ui){
            $('#discussion_container', rootel).hide();
            $('#discussion_collapse_link', rootel).hide();
            $('#discussion_expand_link', rootel).show();
            $('#discussion_compact_link', rootel).hide();
            $('#discussion_full_link', rootel).hide();
            $('#li_divider', rootel).hide();
        });

        renderPosts(jsonPosts);

        $(discussionToggleShowAllClass, rootel).hide();


        if (!widgetSettings.displayMode || widgetSettings.displayMode === 'inline') {
            $('#discussion_collapse_link', rootel).show();
            $('#discussion_compact_link', rootel).show();
            $('#discussion_container', rootel).show();
            $('#li_divider', rootel).show();
        }
        else
            if (widgetSettings.displayMode === 'link') {
                $('#discussion_expand_link', rootel).show();
                $('#discussion_container', rootel).hide();
                $('#li_divider', rootel).hide();
            }
        }
    };

    /**
     * Show all the posts in the main view
     * @param {String} response Json response with all the posts
     * @param {Boolean} exists Check if the discussion exists
     */
    var showPosts = function(response, exists){
        if (exists) {
            try {
                getPostInfo(response.results);
            }
            catch (err) {
                fluid.log(err);
            }
        }
        else {
            fluid.log('Failed to show the posts.');
        }
    };


    /**
     * Get the id of the dicussion widget and show the post including replies
     */
    var getPostsFromJCR = function(){
        var s = store;
        var url = sakai.config.URL.DISCUSSION_GETPOSTS_THREADED.replace(/__PATH__/, s).replace(/__MARKER__/, marker);
        $.ajax({
            url: url,
            cache: false,
            success: function(data){
                showPosts(data, true);
            },
            error: function(xhr, textStatus, thrownError){
                showPosts(xhr.status, false);
            }
        });
    };


    /////////////////
    // CREATE POST //
    /////////////////

    /**
     * Takes the widgetSettings object and saves the settings.
     * @param {Object} callback a function that can be called when the settings were successfully saved.
     */
    var saveWidgetSettings = function(callback){
        var data = widgetSettings;

        widgetSettings['sling:resourceType'] = 'sakai/settings';
        widgetSettings['sakai:marker'] = tuid;

        // JCR properties are not necessary.
        delete data["jcr:primaryType"];

        // don't save messages this way
        delete data["message"];

        sakai.api.Widgets.saveWidgetData(tuid, data, callback);
    };

    /**
     * Creates an initial post.
     * @param {Object} post The object with all the data that should be sent to the create service.
     */
    var createInitialPost = function(post){
        // Use the local store for creating the initial posts.
        $.ajax({
            url: store + ".create.html",
            cache: false,
            type: 'POST',
            success: function(data){
                saveWidgetSettings();
                sakai.api.Widgets.Container.informFinish(tuid, "discussion");
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Unable to save your post.");
            },
            data: post
        });
    };


    ///////////
    // REPLY //
    ///////////

    /**
     * Clear the input fields for the reply form
     */
    var clearReplyFields = function(){
        $(discussionReplySubject, rootel).val("");
        $(discussionReplyBody, rootel).val("");
    };

    /**
     * Clear the input fields for the add topic form
     */
    var clearAddTopicFields = function(){
        $(discussionAddTopicSubject, rootel).val("");
        $(discussionAddTopicBody, rootel).val("");
    };


    /**
     * Reply to a post.
     * @param {String} id
     */
    var replyPost = function(id){
        var subject = $(discussionReplySubject, rootel).val();
        var body = $(discussionReplyBody, rootel).val();
        if ((""+subject).replace(/ /g, "") !== "" && (""+body).replace(/ /g, "") !== "") {

            var object = {
                'sakai:subject': subject,
                'sakai:body': body,
                'sakai:marker': marker,
                'sakai:type': 'discussion',
                'sling:resourceType': 'sakai/message',
                'sakai:replyon': id,
                'sakai:messagebox': 'outbox',
                'sakai:sendstate': 'pending',
                'sakai:to': "discussion:w-" + store
            };
/*            sakai.api.Widgets.saveWidgetData(tuid, object, function(success, data){
                alert("I seem to have saved a discussion topic.");
            });*/
            var url = store + ".create.html";
            $.ajax({
                url: url,
                type: 'POST',
                success: function(data){
                    // Get all the other posts
                    clearReplyFields();
                    getPostsFromJCR();
                },
                error: function(xhr, textStatus, thrownError){
                    if (xhr.status === 401) {
                        clearReplyFields();
                        alert("You are not allowed to add a reply.");
                    }
                    else {
                        alert("Failed to add a reply.");
                    }
                },
                data: object
            });
        }
        else {
            alert("Please enter all the fields.");
        }
    };

    /**
     * Reply to a post
     * This function will show the necessary divs, put focus in the first element and add
     * RE: in front of the subject.
     * @param {String} id Id of the post that is replied to
     */
    var showReply = function(id){
        $(discussionReplyContainer, rootel).show();

        // Jump to reply form
        scrollTo($(discussionReplyContainer, rootel));

        // Focus on the subject field
        $(discussionReplySubject, rootel).focus();

        // Add RE: in front of the subject
        $(discussionReplySubject, rootel).val("Re: " + $(discussionContentSubject + "_" + id, rootel).text());
    };

    var showAddTopic = function(id){
        $(discussionAddContainer, rootel).show();

        // Jump to reply form
        scrollTo($(discussionAddContainer, rootel));

        // Focus on the subject field
        $(discussionAddTopicSubject, rootel).focus();

        $(discussionAddContainer + " form", rootel).validate().resetForm();
    };


    ////////////
    // DELETE //
    ////////////

    /**
     * Deletes or undeletes the post with the provided id.
     * @param {String} id The id of the post.
     * @param {boolean} deleteValue true = delete, false = undelete
     */
    var deletePost = function(id, deleteValue){
        var url = store + "/" + shardedId(id);
        var data = {
            "sakai:deleted": deleteValue,
            "sakai:deletedByID": me.user.userid,
            "sakai:deletedBy": sakai.api.User.getDisplayName(me.profile)
        };
        $.ajax({
            url: url,
            type: 'POST',
            success: function(){
                getPostsFromJCR();
            },
            error: function(xhr, textStatus, thrownError){
                alert("Failed to delete this post.");
            },
            data: data
        });
    };

    ///////////////////
    // ADD NEW TOPIC //
    ///////////////////

    /**
     * Add a new topic.
     * @param {String} id
     */
    var addNewTopic = function(){
        var subject = $(discussionAddTopicSubject, rootel).val();
        var body = $(discussionAddTopicBody, rootel).val();
        if ((""+subject).replace(/ /g, "") !== "" && (""+body).replace(/ /g, "") !== "") {

            var object = {
                'sakai:subject': subject,
                'sakai:body': body,
                'sakai:marker': marker,
                'sakai:type': 'discussion',
                'sling:resourceType': 'sakai/message',
                'sakai:writeto': store,
                'sakai:marker': tuid,
                'sakai:initialpost': true,
                'sakai:messagebox': 'outbox',
                'sakai:sendstate': 'pending',
                'sakai:to': "discussion:w-" + store
            };
/*            sakai.api.Widgets.saveWidgetData(tuid, object, function(success, data){
                alert("I seem to have saved a discussion topic.");
            });*/
            var url = store + ".create.html";
            $.ajax({
                url: url,
                type: 'POST',
                success: function(data){
                    // Get all the other posts
                    clearAddTopicFields();
                    getPostsFromJCR();
                },
                error: function(xhr, textStatus, thrownError){
                    if (xhr.status === 401) {
                        clearReplyFields();
                        alert("You are not allowed to add a reply.");
                    }
                    else {
                        alert("Failed to add a reply.");
                    }
                },
                data: object
            });
        }
        else {
            alert("Please enter all the fields.");
        }
    };


    //////////////
    // SETTINGS //
    //////////////

    /**
     * Closes the settings container.
     */
    var finishSettingsContainer = function(){
        sakai.api.Widgets.Container.informFinish(tuid, "discussion");
    };

    /**
     * Gets the selected discussion post.
     * @param {String} the id of the post.
     * @return {object} the selected post.
     */
    var getSelectedDiscussion = function(id){
        if (selectedExistingDiscussionID) {
            for (var i = 0, j = allDiscussions.length; i < j; i++) {
                if (allDiscussions[i]["sakai:id"] === id) {
                    return allDiscussions[i];
                }
            }
        }
        return false;
    };

    var createPostObject = function(){
        var post = {};
        post["sakai:type"] = "discussion";
        post["sling:resourceType"] = "sakai/message";
        post["sakai:to"] = "discussion:w-" + store;
        post['sakai:subject'] = $(discussionSettingsNewSubject, rootel).val();
        post['sakai:body'] = $(discussionSettingsNewBody, rootel).val();
        post['sakai:initialpost'] = true;
        post['sakai:writeto'] = store;
        post['sakai:marker'] = tuid;
        post['sakai:messagebox'] = "outbox";
        post['sakai:sendstate'] = "pending";
        return post;
    };

    /**
     * Should be called when the submit button gets clicked.
     */
    var submitSettings = function(){
        // Determine which view we are on.
        var post = {};
        if ($(discussionSettingsExistingContainer, rootel).is(":visible")) {
            // The user wants to add an existing item, we get the selected post and get the marker from it.
            post = getSelectedDiscussion(selectedExistingDiscussionID);
            widgetSettings.marker = post["sakai:marker"];
            var callback = finishSettingsContainer;
            saveWidgetSettings(callback);
        }
        else
            if ($(discussionSettingsNewContainer, rootel).is(":visible")) {
                // The user wants to write his own post.
                widgetSettings.marker = tuid;

                post = createPostObject();

                if ((""+post['sakai:subject']).replace(/ /g, "") === "" || (""+post['sakai:body']).replace(/ /g, "") === "") {
                    alert("Please fill in all the fields.");
                }
                else {
                    if (initialPost !== false) {
                        // We already have an initalpost.
                        // edit this one.
                        editPost(initialPost["sakai:id"], post['sakai:subject'], post['sakai:body']);
                    }
                    else {
                        // create a new post.
                        createInitialPost(post);
                    }
                }
            }
            else
                if ($(discussionSettingsDisplayOptionsContainer, rootel).is(":visible")) {

                    if (initialPost === false) {
                        var subject = $(discussionSettingsNewSubject, rootel).val();
                        var body = $(discussionSettingsNewBody, rootel).val();
                        if (subject.replace(/ /g, "") !== "" && body.replace(/ /g, "") !== "") {
                            post = createPostObject();
                            createInitialPost(post);
                        }
                        else {
                            post = getSelectedDiscussion(selectedExistingDiscussionID);

                            if (post === false) {
                                sakai.api.Util.notification.show($("#discussion_discussion").text(),
                                                                $("#discussion_post_to_new_discussion").text(),
                                                                sakai.api.Util.notification.type.ERROR);
                                return;
                            }
                            widgetSettings.marker = post["sakai:marker"];
                        }
                    }

                    if ($('#' + tuid + ' #discussion_settings_link_display_button').is(":checked")) {
                        widgetSettings.displayMode = 'link';
                    }
                    else
                        if ($('#' + tuid + ' #discussion_settings_inline_display_button').is(":checked")) {
                            widgetSettings.displayMode = 'inline';
                        }

                    var callback1 = finishSettingsContainer;
                    saveWidgetSettings(callback1);
                }
    };


    /**
     * Gets all the existing discussions for the current site
     */
    var getExistingDiscussions = function(){
        var url = sakai.config.URL.DISCUSSION_INITIALPOSTS_SERVICE.replace(/__PATH__/, sakai.config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, currentSite));
        url = url.replace(/__ITEMS__/, 1000).replace(/__PAGE__/, 0);
        $.ajax({
            cache: false,
            url: url,
            success: function(data){
                if (data.results) {
                    // Save the results for later.
                    allDiscussions = data.results;
                    // Hide the no discussion message.
                    $(discussionNoDiscussions, rootel).hide();
                    // Render the list that contains the existing discussions

                    data.settings = widgetSettings;

                    // If we have a local store we check all our initial nodes and set our text.
                    for (var i = 0, j = allDiscussions.length; i < j; i++) {
                        if (allDiscussions[i]["sakai:marker"] === tuid) {
                            initialPost = allDiscussions[i];
                            $(discussionSettingsNewBody, rootel).val(allDiscussions[i]['sakai:body']);
                            $(discussionSettingsNewSubject, rootel).val(allDiscussions[i]['sakai:subject']);
                        }
                    }

                    $(discussionSettingsExistingContainer, rootel).html($.TemplateRenderer(discussionSettingsExistingContainerTemplate, data));
                }
                else {
                    // No discussions available.
                    $(discussionNoDiscussions, rootel).show();
                }
            },
            error: function(xhr, textStatus, thrownError){
                // No discussions available.
                $(discussionNoDiscussions, rootel).show();
            }
        });
    };

    /**
     * Shows a setting tab.
     * @param {String} tab Available options: new, existing
     */
    var showTab = function(tab){
        $(".fl-tabs-active").removeClass("fl-tabs-active");
        if (tab === "new") {
            $(discussionSettingsExistingContainer, rootel).hide();
            $(discussionSettingsNewTab, rootel).removeClass(discussionSettingsTabClass);
            $(discussionSettingsNewTab, rootel).parent("li").addClass("fl-tabs-active");
            $(discussionSettingsExistingTab, rootel).removeClass(discussionSettingsTabSelectedClass);
            $(discussionSettingsExistingTab, rootel).addClass(discussionSettingsTabClass);
            $(discussionSettingsNewContainer, rootel).show();
            $(discussionSettingsDisplayOptionsContainer, rootel).hide();
            $(discussionSettingsDisplayOptionsTab, rootel).removeClass(discussionSettingsTabSelectedClass);
            $(discussionSettingsDisplayOptionsTab, rootel).addClass(discussionSettingsTabClass);
            $(discussionSettingsNewContainer, rootel).show();
        }
        else if (tab === "existing") {
            $(discussionSettingsNewContainer, rootel).hide();
            $(discussionSettingsNewTab, rootel).removeClass(discussionSettingsTabSelectedClass);
            $(discussionSettingsNewTab, rootel).addClass(discussionSettingsTabClass);
            $(discussionSettingsDisplayOptionsContainer, rootel).hide();
            $(discussionSettingsDisplayOptionsTab, rootel).removeClass(discussionSettingsTabSelectedClass);
            $(discussionSettingsDisplayOptionsTab, rootel).addClass(discussionSettingsTabClass);
            $(discussionSettingsExistingTab, rootel).removeClass(discussionSettingsTabClass);
            $(discussionSettingsExistingTab, rootel).parent("li").addClass("fl-tabs-active");
            $(discussionSettingsExistingContainer, rootel).show();
        } else if (tab === "display_options") {
            $(discussionSettingsNewContainer, rootel).hide();
            $(discussionSettingsNewTab, rootel).removeClass(discussionSettingsTabSelectedClass);
            $(discussionSettingsNewTab, rootel).addClass(discussionSettingsTabClass);
            $(discussionSettingsExistingContainer, rootel).hide();
            $(discussionSettingsExistingTab, rootel).removeClass(discussionSettingsTabSelectedClass);
            $(discussionSettingsExistingTab, rootel).addClass(discussionSettingsTabClass);
            $(discussionSettingsDisplayOptionsTab, rootel).removeClass(discussionSettingsTabClass);
            $(discussionSettingsDisplayOptionsTab, rootel).parent("li").addClass("fl-tabs-active");
            $(discussionSettingsDisplayOptionsContainer, rootel).show();

            if (widgetSettings.displayMode === 'inline') {
                $('#' + tuid + ' #discussion_settings_inline_display_button').attr('checked', true);
            } else if (widgetSettings.displayMode === 'link') {
                $('#' + tuid + ' #discussion_settings_link_display_button').attr('checked', true);
            }
        }
    };

    /**
     * Displays the settings, and depending on the settings the main or exisiting view of it.
     */
    var displaySettings = function(){
        $(discussionMainContainer, rootel).hide();
        $(discussionSettings, rootel).show();
        // Fetch all the initial posts.
        getExistingDiscussions();

        // If we are posting to another store we show the existing view.
        if (widgetSettings.marker !== undefined && widgetSettings.marker !== tuid) {
            showTab("existing");
        }
    };

    /**
     * Fetches the widget settings and places it in the widgetSettings var.
     */
    var getWidgetSettings = function(){

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {
                widgetSettings = $.extend(data, {}, true);
                if (widgetSettings.marker !== undefined) {
                    marker = widgetSettings.marker;
                }

                if (showSettings) {
                    displaySettings();
                }
                else {
                    getPostsFromJCR();
                }

            }
            else {

                // We don't have settings for this widget yet.
                if (showSettings) {
                    displaySettings();
                }
            }

        });

    };


    ////////////////////
    // Event Handlers //
    ////////////////////
    var addBindings = function() {

        $("div form", rootel).validate();

        $('.discussion_compact_post_link a', rootel).live('click', function(e, ui){
            var id = this.id.split("_")[this.id.split("_").length - 1];

            $('.discussion_compact_post', rootel).hide();
            $('#discussion_post' + id, rootel).show();
            $('#discussion_post_link' + id, rootel).hide(300);

            // Stop that annoying jump to top of the screen
            return false;

        });

        $(discussionToggleShowHideAllClass, rootel).live("click", function(e, ui){
            var id = this.id.split("_")[this.id.split("_").length - 1];
            $(discussionPosts + id, rootel).toggle();
            $(discussionToggleShowHideAllTextClass + id, rootel).toggle();
        });

        // Bind the reply button
        $(discussionContentReplyClass, rootel).live("click", function(e, ui){
            if (editing) {
                stopEditing(currentEditId);
            }
            currentReplyId = $(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1];
            showReply(currentReplyId);
        });
        // Bind the delete button
        $(discussionContentDeleteClass, rootel).live("click", function(e, ui){
            deletePost($(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1], true);
        });
        // Bind the undelete button
        $(discussionContentUnDeleteClass, rootel).live("click", function(e, ui){
            deletePost($(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1], false);
        });

        // Bind the edit button
        $(discussionContentEditClass, rootel).live("click", function(e, ui){
            clearReplyFields();
            // Hide the input form
            $(discussionReplyContainer, rootel).hide();
            showEditPost($(this).attr("id").split("_")[$(this).attr("id").split("_").length - 1]);
        });

        /*
         * Bind the submit button
         */
        $(discussionReplySubmit, rootel).bind("click", function(e, ui){
            replyPost(currentReplyId);
        });

        // Bind the add topic button
        $(discussionAddNewTopic, rootel).bind("click", function(e, ui){
            showAddTopic();
        });

        // Bind the add topic submit
        $(discussionAddContainer + " form", rootel).bind("submit", function(e, ui){
            if ($(discussionAddContainer + " form").valid()) {
                addNewTopic();
            }
            return false;
        });

        // Bind the add topic cancel
        $(discussionAddTopicCancel, rootel).bind("click", function(e, ui){

            // Clear everything in the add topic fields
            clearAddTopicFields();

            // Hide the input form
            $(discussionAddContainer, rootel).hide();
        });

        /*
         * Bind the cancel button
         */
        $(discussionReplyCancel, rootel).bind("click", function(e, ui){

            // Clear everything in the reply fields
            clearReplyFields();

            // Hide the input form
            $(discussionReplyContainer, rootel).hide();
        });

        // Bind the settings submit button.
        $(discussionSettingsSubmit, rootel).bind("click", function(e, ui){
            submitSettings();
        });

        /*
         * Bind the settings cancel button
         */
        $("#discussion_settings_cancel", rootel).bind("click", function(e, ui){
            sakai.api.Widgets.Container.informCancel(tuid, "discussion");
        });

        /*
         * Bind the new discussion tab
         */
        $(discussionSettingsNewTab, rootel).bind("click", function(e, ui){
            showTab("new");
        });

        /*
         * Bind the existing discussion tab
         */
        $(discussionSettingsExistingTab, rootel).bind("click", function(e, ui){
            showTab("existing");
        });

        /*
         * Bind the display_options discussion tab
         */
        $(discussionSettingsDisplayOptionsTab, rootel).bind("click", function(e, ui){
            showTab("display_options");
        });


        /**
         * User clicks something he hasn't selected in the existing discussions tab
         * @param {Object} e
         * @param {Object} ui
         */
        $("." + discussionSettingsListItemClass, rootel).live("click", function(e, ui){
            // Unselect the other one.
            $("." + discussionSettingsListItemSelectedClass, rootel).addClass(discussionSettingsListItemClass);
            $("." + discussionSettingsListItemSelectedClass, rootel).removeClass(discussionSettingsListItemSelectedClass);

            selectedExistingDiscussionID = e.target.id.split("_")[e.target.id.split("_").length - 1];
            e.target.className = discussionSettingsListItemSelectedClass;
        });

        /**
         * User clicks a discussion he already selected.
         * @param {Object} e
         * @param {Object} ui
         */
        $("." + discussionSettingsListItemSelectedClass, rootel).live("click", function(e, ui){
            selectedExistingDiscussionID = false;
            e.target.className = discussionSettingsListItemClass;
        });

    };

    //////////////////////
    // Initial function //
    //////////////////////

    // Get the widget settings
    var init = function() {
        addBindings();

        if (widgeturl) {
            store = widgeturl + "/message";
            $.ajax({
                url: widgeturl + ".infinity.json",
                type: "GET",
                dataType: "json",
                success: function(data){
                    // no op
                },
                error: function(xhr, textStatus, thrownError) {
                    if (xhr.status == 404) {
                        // we need to create the initial message store
                        $.post(store, {"sling:resourceType":"sakai/messagestore"} );
                    }
                }
            });
        }
        var isGroup = false;
        if (sakai.currentgroup && typeof sakai.currentgroup.id === "string") {
            currentSite = sakai.currentgroup.id;
            isGroup = true;
        } else {
            currentSite = sakai.profile.main.data["rep:userId"];
        }
        getWidgetSettings();
        if (showSettings) {
            $(discussionMainContainer, rootel).hide();
            $(discussionSettings, rootel).show();
            if (isGroup) {
                $("#discussion_settings_visibility_group", rootel).show();
            } else {
                $("#discussion_settings_visibility_user", rootel).show();
            }
        }
        else {
            $(discussionMainContainer, rootel).show();
            $(discussionSettings, rootel).hide();

            var canAddTopics = false;
            if (isGroup) {
                if (sakai.api.Groups.isCurrentUserAManager(currentSite) || sakai.api.Groups.isCurrentUserAMember(currentSite)) {
                    canAddTopics = true;
                }
            } else {
                if (sakai.data.me.user.userid === currentSite) {
                    canAddTopics = true;
                } else {
                    canAddTopics = sakai.api.User.checkIfConnected(currentSite);
                }
            }

            if (canAddTopics) {
                $(discussionAddNewTopic).show();
            }

            if (!sakai.api.Widgets.isOnDashboard(tuid)) {
                $("#discussion_widget_header", rootel).show();
            }
        }
    };

    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("discussion");
