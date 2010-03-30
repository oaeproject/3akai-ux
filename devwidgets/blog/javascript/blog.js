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

/*global $, Config, jQuery, sakai, sdata */

sakai.blog = function(tuid, showSettings) {

    var me = sakai.data.me;                    // Contains information about the current user
    var rootel = $("#" + tuid);        // Get the main div used by the widget
    var arrSelectedTags = [];
    var sPreviousSearch = '';
    var arrAllTags = [];
    var iSearchInterval = 300;        //    The interval at which the search refreshes. (in ms)
    var oSearchInterval = null;
    var blogSettings = {};            //    The object containing all the blog settings.
    var isEditing = false;
    var editId;
    var isAdding = false;
    var toAddId;
    var displayPosts = {};


    /////////////////
    // Config vars //
    /////////////////

    //    CSS ids
    var blog = "blog";
    var blogID = "#" + blog;
    var blogClass = "." + blog;


    //    views
    var viewSettings = blogID + "_settings";
    var viewNormal = blogID + "_view";

    //    buttons
    var buttonFormCancel = blogID + "_formCancel";
    var buttonFormSubmit = blogID + "_formSubmit";
    var buttonSettingsCancel = blogID + "_settingsCancel";
    var buttonSettingsSubmit = blogID + "_settingsSubmit";
    var buttonCommentCancel = blogID + "_commentCancel";
    var buttonCommentSubmit = blogID + "_commentSubmit";
    var buttonNewPostClass = blogClass + "_view_newpost";

    //    settings
    var settingsTagClass = ".blog_settingsTag";

    var blogSettingsID = blogID + "_settings";

    var settingsNrOfSelected = blogSettingsID + "_nrOfSelectedTags";
    var settingsAllowComments = blogSettingsID + "_allowComments";
    var settingsFilterTags = blogSettingsID + "Tags";
    var settingsTagList = blogSettingsID + "TagsList";
    var settingsSelectedTagCloud = blogSettingsID + "_selectedTagsCloud";
    var settingsTagLoader = blogID + "_tagLoader";
    var settingsSelectedTagClass = ".blog_settingsSelectedTag";

    var settingsTagListTemplate = "blog_settingsTagsListTemplate";
    var settingsSelectedTagCloudTemplate = "blog_settings_selectedTagsCloudTemplate";

    // Main view
    var postsContainer = "#blog_view_posts";
    var postsTemplate = "blog_view_postTemplate";

    var viewBlogTagsContainer = "#blog_view_showBlogTagsContainer";
    var viewBlogTags = "#blog_view_showBlogTags";

    //    input fields
    var txtTitle = "#blog_postTitle";
    var txtContent = "#blog_postMessage";
    var txtTags = "#blog_postTags";
    var txtCommentTitle = "#blog_txtCommentSubject";
    var txtCommentBody= "#blog_txtCommentBody";

    //    actions
    var postActions = "#blog_postActions";
    var showHideClass = ".blog_showHide";
    var showHideId= "#blog_showHide";
    var commentsContainer = "#blog_comments";
    var blogComment = "#blog_comment";
    var actionReplyClass = ".blog_ActionReply";
    var actionEditClass = ".blog_ActionEdit";
    var actionDeleteClass = ".blog_ActionDelete";
    var actionReplyId = "blog_reply";
    var actionEditId = "blog_edit";
    var actionDeleteId = "blog_delete";

    var textPostSubject = "#blog_subject_";
    var textPostBody = "#blog_messagePost_";
    var textPostTags  = "#blog_tags";

    var errorClass = "blog_error";

    var blogForm = "#blog_form";
    var blogCommentForm = '#blog_commentForm';

    var blockContainer = "#blog_block";


    ////////////////////
    // Util functions //
    ////////////////////

    /**
     * Escape HTML
     * @param {Object} str The HTML string that needs to be replaced.
     */
    var escapeHTML = function(str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    /**
     *
     * @param {Object} str
     */
    var unescapeHTML = function(str) {
        return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    };

    /**
     * Loops over an array and remove all the strings that are empty or just spaces.
     * Will also trim each value.
     * @param {Object} arr
     * @param {Boolean} removeDoubles: should doubles be removed as well
     */
    var removeEmptyStringsFromArray = function(arr, removeDoubles) {
        var arrNew = [];
        for (var i = 0, iMax = arr.length;i < iMax;i++) {
            var s = jQuery.trim(arr[i]);
            if ((!removeDoubles || arrNew.indexOf(s) === -1) && s !== '') {
                arrNew.push(s);
            }
        }
        return arrNew;
    };

    /**
     * Gets all the user ids from an array of posts.
     * @param {Object} arrPosts
     * @param {Object} us This object should contain 2 fields
     *     arr - Array where the usernames will be in
     *  str - String where the usernames will get in via a comma s
     */
    var getUserUIDSFromPosts = function(arrPosts, arr) {
        for (var i = 0, iMax = arrPosts.length; i < iMax;i++) {
            if (arr.indexOf(arrPosts[i].poster) === -1) {
                arr.push(arrPosts[i].poster);
            }
            //    Check for sub posts.
            if (arrPosts[i].comments.length > 0) {
                arr = getUserUIDSFromPosts(arrPosts[i].comments, arr);
            }
        }
        return arr;
    };


    /**
     * Parse a json string to a valid date
     * @param {String} dateInput String of a date that needs to be parsed
     * @returns {Date}
     */
    var parseDate = function(dateInput) {
        /** Get the date with the use of regular expressions */
        var match = /([0-9]{2})\/([0-9]{2})\/([0-9]{4})T([0-9]{2}):([0-9]{2}):([0-9]{2})/.exec(dateInput); // 03/03/2009T17:53:48Z
        var d = new Date();
        d.setDate(match[1]);
        d.setMonth(match[2]-1);
        d.setYear(match[3]);
        d.setHours(match[4]);
        d.setMinutes(match[5]);
        d.setSeconds(match[6]);
        return d;
    };

    /**
     * Format an input date (used by TrimPath)
     * @param {Date} d Date that needs to be formatted
     */
    var formatDate = function(d){
        var names_of_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var am_or_pm = "";

        var current_hour = d.getHours();
        if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
        if (current_hour === 0){current_hour = 12;}
        if (current_hour > 12){current_hour = current_hour - 12;}

        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1){current_minutes = "0" + current_minutes;}

        return(names_of_months[d.getMonth()].substring(0,3) + " " + d.getDate() + ", " +  d.getFullYear() + " at " + current_hour + ":" + current_minutes + am_or_pm);
    };

    /**
     * Scroll to a specific element in a page
     * @param {Object} element The element you want to scroll to
     */
    var scrollTo = function(element) {
        $('html, body').animate({scrollTop: element.offset().top}, 1);
    };

    /**
     * Shows errors on the supplied fields
     * @param {Object} fields: array of fields
     * @param {String} errorClass: name of the errorclass
     */
    var showErrors = function(fields, errorClass){
        var ok = true;
        for(var i=0, iMax=fields.length; i<iMax;i++){
            var sField = jQuery.trim($(fields[i], rootel).val());
            if(sField === ''){
                ok = false;
                $(fields[i], rootel).addClass(errorClass);
            }
            else{
                $(fields[i], rootel).removeClass(errorClass);
            }
        }
        return ok;
    };

    /**
     * Checks if the fields are filled in correctly.
     * The fields who are empty will be given a class.
     * Returns true of false;
     */
    var checkFields = function(fields) {
        var txts = [txtTitle, txtContent, txtTags];
        return showErrors(txts, errorClass);
    };


    ///////////////
    // View mode //
    ///////////////

    /**
     * Takes an array, sorts it and renders the provided template at the provided place.
     * @param {Object} where    Where the rendered template should go.
     * @param {Object} template    Which template should be used.
     * @param {Object} arrTags    The tags
     */
    var renderTags = function(where, template, arrTags) {
        //    Sort the tags alphabetically.
        arrTags.sort();
        var context = {'tags' : arrTags};
        //    add them to the DOM
        $(where, rootel).html($.TemplateRenderer(template, context));
    };

    /**
     * Will do a reauest to JCR and get all the tags that are currently registered for this site.
     * @param {Object} callback
     */
    var getAllTags = function(callback) {
        $(settingsTagLoader).show();

        $.ajax({
            url: "/sdata/f/" + placement + "/_blog",
            cache: false,
            success: function(data){
                arrAllTags = [];
                var posts = $.evalJSON(data);
                //    get all the tags for this site.
                for (var i = 0, iMax=posts.items.length;i < iMax;i++) {
                    var post = posts.items[i];
                    var sTags = post.tags;
                    var arrPostTags = sTags.split(',');
                    for (var t = 0, tMax=arrPostTags.length; t < tMax; t++) {
                        if (arrAllTags.indexOf(jQuery.trim(arrPostTags[t])) === -1) {
                            arrAllTags.push(jQuery.trim(arrPostTags[t]));
                        }
                    }
                }

                $(settingsTagLoader).hide();
                renderTags(settingsTagList, settingsTagListTemplate, arrAllTags);

                if (typeof callback !== "undefined" && callback !== null) {
                    callback();
                }
            },
            error: function(xhr, textStatus, thrownError) {
                $(settingsTagLoader).hide();
            }
        });
    };

    var viewMode = function(){


    //////////////////////////////
    // View mode util functions //
    //////////////////////////////

    /**
     * Takes a JSON object, converts it and saves it to JCR.
     * @param {String} siteid
     * @param {Object} json
     * @param {Object} callback
     */
    var convertAndSaveToJCR = function(siteid, json, callback) {
        // save it to jcr
        sakai.api.Widgets.saveWidgetData(tuid, json, callback);
    };



    /**
     * This will save data to the JCR.
     * @param {String} siteid
     * @param {String} sPreviousPosts A json string containing the previous posts.
     * @param {Boolean} bExists
     * @param {Object} post
     * @param {Object} callback The function that has to be called when the data is saved.
     */
    var savePostToJCR = function(siteid, sPreviousPosts, bExists, post, callback) {
        var json = {'items' : []};

        if (bExists) {
            // there are already some posts in the database, add them so we don't overwrite them.
            var previousPosts = sPreviousPosts;
            json.items = previousPosts.items;

        }

        post.id = "" + json.items.length;

        //    add our post to the list
        json.items.push(post);

        //    save it to jcr
        convertAndSaveToJCR(siteid, json, callback);
    };


    ////////////////////////////
    // View mode UI functions //
    ////////////////////////////

    /**
     * Start the creation proces of a new blog post
     * @param {String} siteId
     * @param {String} title
     * @param {String} message
     * @param {String} tags
     * @param {Object} callback The function that has to be called when the save is done.
     */
    var createNewBlogPost = function(sSiteId, sTitle, sMessage, sTags, callback) {

        //    Do a quick check to see if the user has entered all the fields.
        if (sTitle !== "" && sMessage !== "" && sTags !== "") {

            var arrTags = sTags.split(",");
            arrTags = removeEmptyStringsFromArray(arrTags, true);
            sTags = arrTags.join(', ');

            //    save the post to the JCR.
            var date = $.L10N.transformDate(new Date()) + "T" + $.L10N.transformTime(new Date()) + "Z";
            var json = {'id' : "0", 'title' : sTitle, 'message' : sMessage, 'tags' : sTags, 'arrTags' : arrTags, 'postDate' : date, 'poster' : me.preferences.uuid, 'comments' : [], 'blogpost' : true};
            //    We do a check to see if the node for this blog already exists
            //    If it exists we will have onSucces, if it fails we end up with an onFail.
            //    Since all the blogposts and comments are saved under one node we
            //    check this to make sure we don't overwrite any posts.
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    // There are some posts in here. Pass them along.
                    savePostToJCR(sSiteId, data, true, json, callback);
                } else {
                    // This is the first post.
                    savePostToJCR(sSiteId, data.status, false, json, callback);
                }
            });
        }
    };

    /**
     * Searches for a specific post that has the specified id in an array of json objects.
     * @param {Object} arrPosts
     * @param {Object} id
     */
    var getPostWithId = function(arrPosts, id) {
        for (var i = 0;i < arrPosts.length;i++) {
            //    We use the == instead of ===
            //    Because the id can sometimes be a string or a number (depending if it is a blog or a comment post)
            if (arrPosts[i].id == id) {
                return arrPosts[i];
            }
            else {
                if (arrPosts[i].comments.length > 0) {
                    var o = getPostWithId(arrPosts[i].comments, id);
                    if (o !== null) {
                        return o;
                    }
                }
            }
        }
        return null;
    };

    /**
     * Does an action (remove or update) to a post
     * @param {Object} arrPosts: array of posts that contains the post to be updated
     * @param {Object} post: the post than need's updating
     * @param {Object} remove: does this post have to be removed or updated
     */
    var doActionOnPost = function(arrPosts, post, remove){
        for (var i = 0;i < arrPosts.length;i++) {
            //    We use the == instead of ===
            //    Because the id can sometimes be a string or a number (depending if it is a blog or a comment post)
            if (arrPosts[i].id == post.id) {
                if(remove){
                    arrPosts.splice(i, 1);
                }
                else{
                    arrPosts[i] = post;
                }
                break;
            }
            else {
                if (arrPosts[i].comments.length > 0) {
                    doActionOnPost(arrPosts[i].comments, post,remove);
                }
            }
        }
    };

    /**
     * Seaches in the array for a post with the same id as the post.id and replaces it with the new post.
     * @param {Object} arrPosts
     * @param {Object} post
     */
    var updatePostWithId = function(arrPosts, post) {
        doActionOnPost(arrPosts,post,false);
        return arrPosts;
    };

    /**
     * Deletes a post from an array.
     * @param {Object} arrPosts
     * @param {Object} postToDelete
     */
    var deletePostFromArray = function(arrPosts, postToDelete) {
        doActionOnPost(arrPosts,postToDelete,true);
        return arrPosts;
    };


    /**
     * Delete the post/comment with the specified id.
     * @param {Object} id
     */
    var deletePost = function(id) {
        //    Get all the posts
        //    We do a request to get all the posts so that we don't unintentionally delete another post.
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
            if (success) {
                var json = data;
                var deletePost = getPostWithId(json.items, id);
                if (deletePost !== null) {
                    //    Delete the post out of the array.
                    json.items = deletePostFromArray(json.items, deletePost);

                    //    loop over all the posts and edit the ids.
                    var editPostsIds = function(arrItems, startId) {
                        for (var i = 0, iMax=arrItems.length;i < iMax;i++) {
                            arrItems[i].id = startId + "_" + i;
                            if (arrItems[i].comments.lenth > 0) {
                                arrItems[i].comments = editPostsIds(arrItems[i].comments, startId + '_' + i);
                            }
                        }
                        return arrItems;
                    };

                    json.items = editPostsIds(json.items, 0);

                    // save it to jcr
                    convertAndSaveToJCR(placement, json, displayPosts);
                }
            }
        });
    };

    /**
     * Will edit a blog or comment post.
     * @param {Object} id    Id of the post
     * @param {Object} isComment    If the post is a comment or a blog post.
     */
    var editComment = function(id, isComment) {
        var sTitle = '';
        var sMessage = '';
        if (isComment) {
            sTitle = $(blogCommentForm + id + " " + txtCommentTitle, rootel).val();
            sMessage = $(blogCommentForm + id + " " + txtCommentBody, rootel).val();
        }
        else {
            //    blog post
            sTitle = $(blogForm + id + " " + txtTitle, rootel).val();
            sMessage = $(blogForm + id + " " + txtContent, rootel).val();
            var sTags = $(blogForm + id + " " + txtTags, rootel).val();

            sTags = escapeHTML(sTags);

            //    Make sure that our tags are split nicely.
            var arrTags = sTags.split(",");
            arrTags = removeEmptyStringsFromArray(arrTags);
            sTags = arrTags.join(', ');
        }
        //    Escape HTML characters
        sTitle = escapeHTML(sTitle);
        sMessage = escapeHTML(sMessage);

        if (sTitle !== "" && sMessage !== "") {
            // get all the other posts so we don't overwrite one.
            sakai.api.Widgets.loadWidgetData("blog", tuid, placement, function(success, data) {
                if (success){
                    var json = data;

                    var editPost = getPostWithId(json.items, id);
                    if (editPost !== null) {
                        // found the post we're editing

                        editPost.title = sTitle;
                        editPost.message = sMessage;
                        if (!isComment) {
                            editPost.tags = sTags;
                            editPost.arrTags = arrTags;
                        }

                        json.items = updatePostWithId(json.items, editPost);

                        //    save it to jcr
                        convertAndSaveToJCR(placement, json, displayPosts);
                    }
                }
            });
        }
        else {
            alert('Please enter a subject and a body.');
        }
    };

    /**
     * Removes the edit form and shows the normal text again.
     * @param {Object} id
     */
    var stopEditing = function(id, isBlogPost) {
        //    remove form
        if (isBlogPost) {
            $(blogForm + id).remove();
        }
        else {
            $(blogCommentForm + id).remove();
        }

        //    show block
        $(blockContainer + id, rootel).show();
        $(postActions + id, rootel).show();

        isEditing = false;
    };

    /**
     * Show the edit form and hide the message part.
     * @param {Object} id    Id of the message that needs to be replaced by a form.
     */
    var showEditForm = function(id) {
        //    hide any previous editing forms that we may have.
        if (isEditing) {
            stopEditing(editId);
        }

        //    hide the message & actions stuff
        var block = $(blockContainer + id, rootel).hide();
        $(postActions + id, rootel).hide();

        //    determine if this is a blogpost or a comment:
        var form = null;
        var sTitle = unescapeHTML($(textPostSubject + id, block).html());
        var sMessage = unescapeHTML($(textPostBody + id, block).html().replace(/<br>/gi, "\n"));

        isEditing = true;
        editId = id;

        //    If there is no _ in the id than this means that this is a blogpost.
        if (!id.match(/_/, 'gi')) {
            //    This is a blogpost
            form = $(blogForm).clone().attr('id', blogForm.replace(/#/gi,'') + id);

            $(txtTitle, form).val(sTitle);
            $(txtContent, form).val(sMessage);
            $(txtTags, form).val($(textPostTags + id, block).html().replace(/Tags: /g, ""));

            //    bind the events
            $(buttonFormCancel, form).click(function() {
                stopEditing(editId, true);
            });
            $(buttonFormSubmit, form).click(function() {
                editComment(editId);
            });

        }
        else {
            //    This is a comment
            form = $(blogCommentForm).clone().attr('id', blogCommentForm.replace(/#/gi,'') + id);

            $(txtCommentTitle, form).val(sTitle);
            $(txtCommentBody, form).val(sMessage);


            //    bind the events
            $(buttonCommentCancel, form).click(function() {
                stopEditing(editId, false);
            });
            $(buttonCommentSubmit, form).click(function() {
                editComment(editId, true);
            });
        }
        $(block).after($(form).show());
    };

    /**
     * Add a reply to a (blog-)post.
     * @param {Object} id The id of the post to append it.
     */
    var addReply = function(id) {

        var sTitle = escapeHTML($(txtCommentTitle).val());
        var sMessage = escapeHTML($(txtCommentBody).val());

        if (sTitle !== "" && sMessage !== "") {
            if (blogSettings.allowComments) {

                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    if (success) {

                        var json = data;

                        var replyToPost = getPostWithId(json.items, id);
                        if (replyToPost !== null) {
                            // found the post we're replying to
                            var newId = replyToPost.id + '_' + replyToPost.comments.length;

                            var date = $.L10N.transformDate(new Date()) + "T" + $.L10N.transformTime(new Date()) + "Z";
                            var newPost = {
                                'id': newId,
                                'title': sTitle,
                                'message': sMessage,
                                'postDate': date,
                                'poster': me.preferences.uuid,
                                'comments': []
                            };
                            var replyId = "" + replyToPost.id;
                            var addPostToArray = function(arrPosts, addPost){
                                for (var i = 0, iMax= arrPosts.length; i < iMax; i++) {
                                    if (arrPosts[i].id == replyId) {
                                        // This is the post we are replying too
                                        // Add it too the list.
                                        arrPosts[i].comments.push(addPost);
                                        return arrPosts;
                                    }
                                    else {
                                        if (arrPosts[i].comments.length > 0) {
                                            arrPosts[i].comments = addPostToArray(arrPosts[i].comments, addPost);
                                        }
                                    }
                                }
                                return arrPosts;
                            };
                            json.items = addPostToArray(json.items, newPost);

                            //    save it to jcr
                            var str = $.toJSON(json);

                            sakai.api.Widgets.saveWidgetData(tuid, str, displayPosts);
                        }
                    }
                });

            } else {
                alert("Comments are not allowed.");
            }

        } else {
            alert('Please enter a subject and a body.');
        }
    };

    /**
     * Will show the form to add a comment.
     * @param {Object} id The id of the blogpost/comment you wish to append the form
     */
    var showAddForm = function(id) {
        if (isAdding) {
            //    We are already trying to add a post somewhere
            //    remove the other form
            $(blogCommentForm + toAddId, rootel).remove();
        }
        isAdding = true;
        toAddId = id;
        //    Add a form beneath this box
        $(blogComment + toAddId, rootel).after($(blogCommentForm).clone().attr('id',blogCommentForm.replace(/#/,'') + id).css('display', 'block'));

        $(blogCommentForm + id + " " + txtCommentTitle).val('Re: ' + $(textPostSubject + id).text() );

        //    focus body
        scrollTo($(blogCommentForm + id, rootel));
        $(blogCommentForm + id + " " + txtCommentBody).focus();

        //    Add events
        $(blogCommentForm + id + " " + buttonCommentSubmit, rootel).click(function() {
            addReply(toAddId);
            $(blogCommentForm + toAddId).remove();
            isAdding = false;
        });
        $(blogCommentForm + id + " " + buttonCommentCancel).click(function() {
            $(blogCommentForm + toAddId).remove();
            isAdding = false;
        });
    };

    /**
     * Set all the properties for a post. This function will crawl recursively trough all the posts.
     * @param {Object} arrComments    Array of all the blog posts and comments
     * @param {Object} arrUserNames Array of all the uuids
     * @param {Object} users    Array of all the user objects.
     */
    var markupPosts = function(arrComments, arrUserNames, users) {
        for (var i = 0; i < arrComments.length; i++) {
            //    Loop the usernames
            arrComments[i].picture = '';
            arrComments[i].showEdit = false;
            arrComments[i].showDelete = false;
            arrComments[i].allowComments = blogSettings.allowComments;
            arrComments[i].nrOfComments = arrComments[i].comments.length;
            arrComments[i].message = arrComments[i].message.replace(/\n/g, "<br />");

            if(me.preferences.superUser || me.preferences.uuid === arrComments[i].poster){
                arrComments[i].showEdit = true;
                arrComments[i].showDelete = true;
            }

            for (var u = 0, uMax =arrUserNames.length; u < uMax; u++) {
                if (arrUserNames[u] === arrComments[i].poster) {
                    arrComments[i].name = users[u].profile.firstName + " " + users[u].profile.lastName;

                    if (users[u].profile.picture) {
                        arrComments[i].picture = "/_user" + users[u].profile.path + "/public/profile/" + users[u].profile.picture.name;
                    }
                }
            }

            arrComments[i].postDate = formatDate(parseDate(arrComments[i].postDate));

            //    All replies on this post should have the same mark up.
            if (arrComments[i].comments.length > 0) {
                arrComments[i].comments = markupPosts(arrComments[i].comments, arrUserNames, users);
            }
        }
        return arrComments;
    };


    /**
     * Takes am array with json objects that are the posts and displays them.
     * @param {Object} json
     * @param {Object} status
     */
    var showPosts = function(json, status) {
        //    If we have some items in here.
        if (json.items) {
            //    We only have uuids in the json object. so we do another post to the me service with all the ids.
            var arrUserNames = [];
            arrUserNames = getUserUIDSFromPosts(json.items, arrUserNames);
            var sUserNames = arrUserNames.join(',');

            // Get the usernames
            $.ajax({
                url: "/rest/me/" + sUserNames,
                success: function(userdata){
                    var users = $.evalJSON(userdata);
                    var arrPostsToDisplay = [];

                    //    We check the widget settings if we are interested in a specific set of tags.
                    if (blogSettings.tags && blogSettings.tags.length > 0) {

                        //    Loop over all the posts to see if this is the tags we are intereseted in.
                        jQuery.each(json.items, function(index) {

                            //    Check if this post has a tag this blog also has.
                            for (var i = 0, iMax=blogSettings.tags.length; i < iMax; i++) {
                                if (json.items[index].arrTags.indexOf(blogSettings.tags[i]) > -1 && !arrPostsToDisplay.indexOf(json.items[index]) === -1) {
                                    arrPostsToDisplay.push(json.items[index]);
                                }
                            }
                        });
                    }
                    else {
                        //    No tags specified, show them all.
                        arrPostsToDisplay = json.items;
                    }

                    //    Do all the nescecary markup so that the template can render properly.
                    arrPostsToDisplay = markupPosts(arrPostsToDisplay, arrUserNames, users.users);

                    //    Render template.
                    json = {'posts' : arrPostsToDisplay};
                    $(postsContainer, rootel).html($.TemplateRenderer(postsTemplate,  json));
                }
            });

        }
    };


    //////////////////////
    // View mode Events //
    //////////////////////

    //    reply
    $(actionReplyClass).live('click', function() {
        var id = $(this).attr('id').replace(actionReplyId, '');        //    ID of the post we are replying to.
        showAddForm(id);
    });

    //edit
    $(actionEditClass).live('click', function() {
        var id = $(this).attr('id').replace(actionEditId, '');        //    ID of the post we are editing.
        showEditForm(id);
    });
    //delete
    $(actionDeleteClass).live('click', function() {
        var id = $(this).attr('id').replace(actionDeleteId, '');        //    ID of the post we are deleting.
        deletePost(id);
    });

    //    Show/hide all
    $(showHideClass).live('click', function() {
        var id = $(this).attr('id').replace(showHideClass.replace(/\./,''), '');        //    ID of the post of which we want to show/hide the comments.
        $(commentsContainer + id).toggle();

        var s = 'Hide all';
        if ($(commentsContainer + id).is(':hidden')) {
            s = 'Show all';
        }
        $(showHideId + id).text(s);

    });


    $(buttonNewPostClass, rootel).bind('click', function() {
        //    show the form
        $(blogForm, rootel).show();
        //    scroll to it
        scrollTo($(blogForm, rootel));

    });

    $(buttonFormCancel, rootel).bind('click', function() {
        //    Hide the form
        $(blogForm, rootel).toggle();
    });

    $(buttonFormSubmit, rootel).bind('click', function(){
        //    Check if all fields are filled in correctly.
        if (checkFields()) {
            //    Get the values
            var sTitle = jQuery.trim($(txtTitle, rootel).val());
            var sMessage = jQuery.trim($(txtContent, rootel).val());
            var sTags = jQuery.trim($(txtTags, rootel).val());

            sTitle = escapeHTML(sTitle);
            sMessage = escapeHTML(sMessage);
            sTags = escapeHTML(sTags);

            //    start the process.
            createNewBlogPost(placement, sTitle, sMessage, sTags, displayPosts);

            //    Hide the form
            $(blogForm, rootel).toggle();

            //    Clean the values
            $(txtTitle, rootel).val('');
            $(txtContent, rootel).val('');
            $(txtTags, rootel).val('');

        }
    });


    /**
     * Displays all the posts
     */
    displayPosts = function() {

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
            var json;
            if (success) {
                // Show posts
                json = data;
                showPosts(json, true);
            } else {
                // Show empty page.
                json = {"posts" : []};
                $(postsContainer, rootel).html($.TemplateRenderer(postsTemplate,  json));
            }
        });

    };

    displayPosts();
    };


    ///////////////////
    // Blog    settings //
    ///////////////////

    var settingsMode = function(){


    ////////////////////////////////
    // Blog    settings UI functions //
    ////////////////////////////////



    /**
     * Will loop over all the tags and check if it matches against the input the user typed in.
     */
    var searchSettingsTags = function() {
        var sSearch = $(settingsFilterTags, rootel).val();
        if (sSearch !== sPreviousSearch) {
            sPreviousSearch = sSearch;

            //    new text, let's filter the tags
            //    When a tag starts with the same text as the user typed in, it should be considered as a match.
            var reg = new RegExp("^" + sSearch, 'gi');
            var arrFilteredTags = [];
            for (var i = 0, iMax = arrAllTags.length; i < iMax; i++) {
                if (arrAllTags[i].match(reg)) {
                    arrFilteredTags.push(arrAllTags[i]);
                }
            }
            renderTags(settingsTagList, settingsTagListTemplate, arrFilteredTags);
        }
    };


    /**
     * Saves the blog settings to JCR.
     * @param {Object} callback
     */
    var saveBlogSettings = function(callback) {
        var json = {};
        json.allowComments = $(settingsAllowComments, rootel).is(":checked");
        json.tags = arrSelectedTags;
        var str = $.toJSON(json);
        sakai.api.Widgets.saveWidgetData(tuid, str, callback);
    };

    /**
     * Closes the overlay.
     */
    var closeSettingsView = function() {
        sdata.container.informFinish(tuid);
    };


    //////////////////////////
    // Blog    settings Events //
    //////////////////////////

    /** When a tag in the list gets clicked.. */
    $(settingsTagClass).live('click', function() {
        var sTag = $(this).attr('title');
        if (arrSelectedTags.indexOf(sTag) === -1) {
            //    We haven't selected this tag before, add it.
            arrSelectedTags.push(sTag);
            //    Display them
            renderTags(settingsSelectedTagCloud, settingsSelectedTagCloudTemplate, arrSelectedTags);

            //    set the nr of selected tags
            $(settingsNrOfSelected, rootel).text(arrSelectedTags.length);
        }
    });


    /**    When the image next to a tag in the tagcloud gets clicked. */
    $(settingsSelectedTagClass + " img").live('click', function() {
        var sTag = $(this).attr('id').replace(/blog_delete_tag_/gi, '');
        if (arrSelectedTags.indexOf(sTag) > -1) {
            //    delete it
            arrSelectedTags.splice(arrSelectedTags.indexOf(sTag), 1);

            //    remove it from the cloud
            $(this).parent().remove();

            //    set the nr of selected tags
            $(settingsNrOfSelected, rootel).text(arrSelectedTags.length);
        }
    });

    $(buttonSettingsSubmit, rootel).bind('click', function(){
        saveBlogSettings(closeSettingsView);
    });

    $(buttonSettingsCancel, rootel).bind('click', function(){
        sdata.container.informCancel(tuid);
    });

    /**
     * Sets all the fields in the blog view to the correct values.
     */
    var displayBlogSettings = function() {

        if (blogSettings.allowComments) {
            $(settingsAllowComments, rootel).attr('checked', 'checked');
        }
        if (blogSettings.tags) {
            arrSelectedTags = blogSettings.tags;
            renderTags(settingsSelectedTagCloud, settingsSelectedTagCloudTemplate, blogSettings.tags);
        }
        //    Fetch all the other tags.
        getAllTags();
    };
    displayBlogSettings();
    //    start the search interval
    //    This will check if the user wants to filter the tags and filter them for him
    oSearchInterval = setInterval(searchSettingsTags, iSearchInterval);

    };


    //////////
    // init //
    //////////

    /**
     * Get the blog settings out of JCR.
     * @param {Object} callback
     */
    var getBlogSettings = function(callback) {
        
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                blogSettings = $.evalJSON(data);

                //    Show the tags in the page.
                if (blogSettings.tags.length === 0) {
                    $(viewBlogTagsContainer).hide();
                }
                else {
                    $(viewBlogTagsContainer).show();
                    $(viewBlogTags).text(blogSettings.tags.join(', '));
                }

                if (typeof callback === "function") {
                    callback();
                }
            }
            else {
                getAllTags();
            }
        });
        
    };

    if (showSettings) {
        $(viewNormal, rootel).hide();
        $(viewSettings, rootel).show();
        //    Get the blog settings
        getBlogSettings(settingsMode);

    }
    else {
        $(viewSettings, rootel).hide();
        $(viewNormal, rootel).show();
        if (oSearchInterval !== null) {
            clearInterval(oSearchInterval);
        }

        //    Get the blog settings, when received .. display the posts.
        getBlogSettings(viewMode);
    }

};

sdata.widgets.WidgetLoader.informOnLoad("blog");
