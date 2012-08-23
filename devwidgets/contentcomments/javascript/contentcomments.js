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
/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.pager.js (pager)
 */
/*global Config, $, pagerClickHandler */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {
    /**
     * @name sakai_global.contentcomments
     *
     * @class contentcomments
     *
     * @description
     * Initialize the contentcomments widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentcomments = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var json = false; // Variable used to recieve information by json
        var widgetSettings = {}; // Will hold the widget settings.
        var me = sakai.data.me; // Contains information about the current user
        var rootel = $('#' + tuid); // Get the main div used by the widget
        var $window = $(window);
        var jsonDisplay = {};
        var start = 0; // Start fetching from the first comment.
        var clickedPage = 1;
        var defaultPostsPerPage = 10;
        var widgeturl = '';
        var contentPath = '';
        var store = '';
        var showCommentsChecked = true;
        var contentData = {};

        // Main Ids
        var contentcomments = '#contentcomments';
        var contentcommentsName = 'contentcomments';
        var contentcommentsClass = '.contentcomments';

        // Output containers
        var contentcommentsOutputContainer = contentcomments + '_mainContainer';
        var contentcommentsFillInComment = contentcomments + '_fillInComment';
        var contentcommentsUserCommentContainer = contentcomments + '_userCommentContainer';
        var contentcommentsPostCommentStart = contentcomments + '_postComment';
        var contentcommentsShowComments = contentcomments + '_showComments';
        var contentcommentsNumComments = contentcomments + '_numComments';
        var contentcommentsNumCommentsDisplayed = contentcommentsNumComments + 'Displayed';
        var contentcommentsCommentComments = contentcomments + '_contentcommentscomment';
        var contentcommentsCancelComment = contentcomments + '_cancelComment';

        // Edit parts
        var contentcommentsEdit = contentcommentsClass + '_edit';
        var contentcommentsMessage = contentcomments + '_message_';
        var contentcommentsMessageEditContainer = contentcommentsMessage + 'editContainer_';
        var contentcommentsEditText = contentcomments + '_editComment_txt_';
        var contentcommentsEditSave = contentcommentsClass + '_editComment_save';
        var contentcommentsEditCancel = contentcommentsClass + '_editComment_cancel';
        var contentcommentsPath = contentcomments + '_path_';
        var contentcommentsEditorOptions = contentcomments + '_editorOptions';

        // Delete
        var contentcommentsDelete = contentcommentsClass + '_delete';
        var contentcommentsUnDelete = contentcommentsClass + '_undelete';

        // Comment permissions
        var contentcommentsShowCheckbox = contentcomments + '_showCommentsCheckbox';
        var contentcommentsAllowCheckbox = contentcomments + '_allowCommentsCheckbox';

        // Output textboxes
        var contentcommentsMessageTxt = contentcomments + '_txtMessage';
        var contentcommentsNamePosterTxt = contentcomments + '_txtNamePoster';
        var contentcommentsMailPosterTxt = contentcomments + '_txtMailPoster';
        // Their containers
        var contentcommentsNamePosterTxtContainer = contentcommentsNamePosterTxt + '_container';
        var contentcommentsMailPosterTxtContainer = contentcommentsMailPosterTxt + '_container';

        // Output classes
        var contentcommentsCommentBtn = contentcommentsClass + '_comment';
        var contentcommentsPager = contentcommentsClass + '_jqpager';


        // Output templates
        var contentcommentsShowCommentsTemplate = contentcommentsName + '_showCommentsTemplate';

        // Settings
        var contentcommentsSettingsContainer = contentcomments + '_settings';

        // Settings checkboxes and radiobuttons
        var contentcommentsEmailReqChk = contentcomments + '_Emailrequired';
        var contentcommentsNameReqChk = contentcomments + '_Namerequired';
        var contentcommentsSendMailChk = contentcomments + '_SendMail';
        var contentcommentsPageTxt = contentcomments + '_txtPage';

        // Settings buttons
        var contentcommentsSubmit = contentcomments + '_submit';
        var contentcommentsCancel = contentcomments + '_cancel';

        // Settings names
        var contentcommentsDisplayRbt = contentcommentsName + '_ChooseDisplayComments';
        var contentcommentsDirectionRbt = contentcommentsName + '_ChooseDirectionComments';
        var contentcommentsPermissionsRbt = contentcommentsName + '_ChoosePermissionComments';

        // Resize textarea to match width
        var contentcommentsMainContainerTextarea = contentcommentsOutputContainer + ' textarea';
        var contentcommentsTitlebar = contentcomments + '_titlebar';

        var contentcomments_userCommentContainer_template = '#contentcomments_userCommentContainer_template';

        ////////////////////////
        // Utility  functions //
        ////////////////////////

        /**
         * Converts all HTML to flat text and converts \n to <br />
         * @param {String} str
         */
        var tidyInput = function(str) {
            str = str.toString(); // in the event its not already a string, make it one
            str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            str = str.replace(/\n/g, '<br />');
            return str;
        };

        /**
         * Callback function to sort contentcomments based on created date
         */
        var sortComments = function(a, b) {
            return a._created < b._created ? 1 : -1;
        };

        ///////////////////
        // show contentcomments //
        ///////////////////

        /**
         * Show the contentcomments in a paged state or not
         */
        var displayCommentsPagedOrNot = function() {
            jsonDisplay = {
                'comments': [],
                'settings': widgetSettings
            };

            // sort contentcomments on create date
            json.comments.sort(sortComments);

            // Loops through all the contentcomments and does the necessary changes to render the JSON-object
            for (var i = 0; i < json.comments.length; i++) {
                jsonDisplay.comments[i] = {};
                var comment = json.comments[i];

                comment.timeAgo = $.timeago(new Date(comment._created));
                comment.messageTxt = comment.comment;
                comment.message = tidyInput(comment.comment);
                comment.canEdit = false;
                comment['sakai:id'] = comment.commentId.substring((comment.commentId.lastIndexOf('/') + 1),comment.commentId.length);

                var user = {};
                user.pictureUrl = sakai.config.URL.USER_DEFAULT_ICON_URL;
                // User
                // Puts the userinformation in a better structure for trimpath
                if (comment.userid) {
                    if (contentData.isManager) {
                        comment.canDelete = true;
                    }
                    user.fullName = sakai.api.User.getDisplayName(comment);
                    user.uid = comment.userid;
                    // Check if the user has a picture
                    var pictureUrl = sakai.api.Util.constructProfilePicture(comment);
                    if (pictureUrl) {
                        user.pictureUrl = pictureUrl;
                    }
                    user.profile = '/~' + sakai.api.Util.safeURL(user.uid);
                }

                comment.user = user;

                jsonDisplay.comments[i] = comment;
            }
            jsonDisplay.sakai = sakai;
            $(contentcommentsShowComments, rootel).html(sakai.api.Util.TemplateRenderer(contentcommentsShowCommentsTemplate, jsonDisplay));
            // Render Math formulas in the text
            sakai.api.Util.renderMath(tuid);
        };

        /**
         * Show all the posted contentcomments
         * This function first retrieves all the users who have posted in this widget and then call the displayCommentsPagedOrNot function
         */
        var showComments = function() {
            // Show the nr of contentcomments we are showing.
            var showingComments = json.total;
            if (widgetSettings.perPage < json.total) {
                showingComments = widgetSettings.perPage;
            }
            $(contentcommentsNumCommentsDisplayed, rootel).html(showingComments);
            // Puts the number of contentcomments on the page
            $(contentcommentsNumComments, rootel).html(json.total);
            // Change to 'comment' or 'contentcomments'
            if (json.total === 1) {
                $(contentcommentsCommentComments, rootel).text(sakai.api.i18n.getValueForKey('COMMENT_LC'));
            }

            if (json.total > widgetSettings.perPage) {
                $(contentcommentsPager, rootel).show();
            }
            // Checks if the contentcomments undefined or if it's length is 0
            displayCommentsPagedOrNot();
        };

        /**
         * Gets the contentcomments from the service.
         */
        var getComments = function() {
            var sortOn = '_created';
            var sortOrder = 'desc';
            var items = 10;
            if (widgetSettings.direction && widgetSettings.direction === 'contentcomments_FirstDown') {
                sortOrder = 'asc';
            }
            if (widgetSettings.perPage) {
                items = widgetSettings.perPage;
            }

            var url = '/p/' + contentData.data['_path'] + '.comments?sortOn=' + sortOn + '&sortOrder=' + sortOrder + '&page=' + (clickedPage - 1) + '&items=' + items;
            $.ajax({
                url: url,
                cache: false,
                success: function(data) {
                    json = $.extend(data, {}, true);
                    showComments();
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('COMMENTS_AN_ERROR_OCCURRED', 'contentcomments'), ' (' + xhr.status + ')',sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        /**
         * Pager click handler
         * @param {Number} pageclickednumber
         */
        var pagerClickHandler = function(pageclickednumber) {
            clickedPage = pageclickednumber;
            getComments();
        };

        /**
         * Post a new comment
         */
        var postComment = function() {
            var comment = {
                // Replaces the \n (enters) with <br />
                'message': $(contentcommentsMessageTxt, rootel).val()
            };
            comment['sakai:type'] = 'comment';

            var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
            var allowPost = true;
            // If the user is not loggedin but we allow anon contentcomments, we check some extra fields.
            if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === true) {
                if (!isLoggedIn && widgetSettings['sakai:forcename']) {
                    comment['sakai:name'] = $(contentcommentsNamePosterTxt, rootel).val();
                    if (comment['sakai:name'].replace(/\s/g, '') === '') {
                        allowPost = false;
                    }
                }
                if (!isLoggedIn && widgetSettings['sakai:forcemail']) {
                    comment['sakai:email'] = $(contentcommentsMailPosterTxt, rootel).val();
                    if (comment['sakai:email'].replace(/\s/g, '') === '') {
                        allowPost = false;
                    }
                }
            }
            if (!isLoggedIn && widgetSettings['sakai:allowanonymous'] === false) {
                // This should not even happen.. Somebody is tinkering with the HTML.
                allowPost = false;
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('ANON_NOT_ALLOWED'),'',sakai.api.Util.notification.type.ERROR);
            }

            var subject = 'Comment';
            //var to = 'internal:w-' + widgeturl + '/message';

            var body = $(contentcommentsMessageTxt, rootel).val();
            if (allowPost) {
                var message = {
                    '_charset_':'utf-8',
                    'comment': body
                };

                var url = '/p/' + contentData.data['_path'] + '.comments';
                $.ajax({
                    url: url,
                    type: 'POST',
                    cache: false,
                    success: function(data) {
                        // Clear the textboxes.
                        $(contentcommentsMessageTxt, rootel).val('');
                        $(contentcommentsNamePosterTxt, rootel).val('');
                        $(contentcommentsMailPosterTxt, rootel).val('');
                        // Add an acitivty
                        sakai.api.Activity.createActivity('/p/' + contentData.data['_path'], 'content', 'default', {'sakai:activityMessage': 'CONTENT_ADDED_COMMENT'}, function(responseData, success) {
                            if (success) {
                                // update the entity widget with the new activity
                                $window.trigger('updateContentActivity.entity.sakai', 'CONTENT_ADDED_COMMENT');
                                if (!rootel.parents('.collectionviewer_collection_item_comments').length) {
                                    $window.trigger('sakai.entity.updatecountcache', {increment: true});
                                }
                            }
                        });
                        // Get the contentcomments.
                        getComments();
                    },
                    error: function(xhr, textStatus, thrownError) {
                        if (xhr.status === 401) {
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('YOU_NOT_ALLOWED'),'',sakai.api.Util.notification.type.ERROR);
                        }
                        else {
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('FAILED_TO_SAVE'),'',sakai.api.Util.notification.type.ERROR);
                        }
                    },
                    data: message
                });
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
            $(contentcommentsOutputContainer, rootel).hide();
            $(contentcommentsSettingsContainer, rootel).show();

            // If you're changing an comment-widget, then the saved values need to be filled in
            if (exists) {
                $('input[name="' + contentcommentsDirectionRbt + '"][value="' + widgetSettings.direction + '"]', rootel).attr('checked', true);
                if (widgetSettings['sakai:allowanonymous'] && widgetSettings['sakai:allowanonymous'] === true) {
                    $('#contentcomments_DontRequireLogInID', rootel).attr('checked', true);
                    $(contentcommentsNameReqChk, rootel).attr('disabled', false);
                    $(contentcommentsEmailReqChk, rootel).attr('disabled', false);
                } else {
                    $('#contentcomments_RequireLogInID', rootel).attr('checked', true);
                    $(contentcommentsNameReqChk, rootel).attr('disabled', true);
                    $(contentcommentsEmailReqChk, rootel).attr('disabled', true);
                }
                $(contentcommentsEmailReqChk, rootel).attr('checked', widgetSettings['sakai:forcemail']);
                $(contentcommentsNameReqChk, rootel).attr('checked', widgetSettings['sakai:forcename']);


                $(contentcommentsSendMailChk, rootel).attr('checked', widgetSettings['sakai:notification']);
                $(contentcommentsPageTxt, rootel).val(widgetSettings.perPage);
            }
        };

        /**
         * When the settings are saved to JCR, this function will be called.
         * It will notify the container that it can be closed.
         */
        var finishNewSettings = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'contentcomments');
        };

        /**
         * fills up the settings JSON-object
         * @return {Object} the settings JSON-object, returns {Boolean} false if input is invalid
         */
        var getCommentsSettings = function() {
            var contentcomments = {};
            contentcomments.contentcomments = [];

            // Checks if there's already some contentcomments placed on the widget
            contentcomments.contentcomments = json.contentcomments || [];

            contentcomments.perPage = parseInt($(contentcommentsPageTxt, rootel).val(), 10);
            if (isNaN(contentcomments.perPage)) {
                contentcomments.perPage = defaultPostsPerPage;
            }

            if (contentcomments.perPage < 1) {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('PLEASE_FILL_POSITIVE_NUM'),'',sakai.api.Util.notification.type.ERROR);
                return false;
            }
            // Check if a valid number is inserted
            else
                if ($(contentcommentsPageTxt, rootel).val().search(/^\d*$/)) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('PLEASE_FILL_VALID_NUM'),'',sakai.api.Util.notification.type.ERROR);
                    return false;
                }


            contentcomments.direction = $('input[name=' + contentcommentsDirectionRbt + ' ]:checked', rootel).val();

            // These properties are noy yet used in the contentcomments-widget, but are saved in JCR
            contentcomments['sakai:allowanonymous'] = true;
            if ($('#contentcomments_RequireLogInID', rootel).is(':checked')) {
                contentcomments['sakai:allowanonymous'] = false;
            }
            contentcomments['sakai:forcename'] = $(contentcommentsNameReqChk, rootel).attr('checked');
            contentcomments['sakai:forcemail'] = $(contentcommentsEmailReqChk, rootel).attr('checked');
            contentcomments['sakai:notification'] = $(contentcommentsSendMailChk, rootel).attr('checked');
            contentcomments['sakai:notificationaddress'] = me.user.userid;
            contentcomments['sling:resourceType'] = 'sakai/settings';
            contentcomments['sakai:marker'] = tuid;
            contentcomments['sakai:type'] = 'comment';

            return contentcomments;
        };

        /**
         * Makes sure that values that are supposed to be booleans, really are booleans.
         * @param {String[]} arr Array of strings which holds keys for the widgetSettings variable that needs to be checked.
         */
        var cleanBooleanSettings = function(arr) {
            for (var i = 0; i < arr.length; i++) {
                var name = arr[i];
                widgetSettings[name] = (widgetSettings[name] && (widgetSettings[name] === true || widgetSettings[name] === 'true' || widgetSettings[name] === 1)) ? true : false;
            }
        };

        /**
         * Gets the widget settings and shows the appropriate view.
         */
        var getWidgetSettings = function() {

            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    if (!data.message) {
                        sakai.api.Widgets.saveWidgetData(tuid, {'message':{'sling:resourceType':'sakai/messagestore'}}, null);
                    }
                    widgetSettings = data;
                    // Clean up some values so that true is really true and not 'true' or 1 ...
                    var keysToClean = ['sakai:forcename', 'sakai:forcemail', 'notification', 'sakai:allowanonymous'];
                    cleanBooleanSettings(keysToClean);

                    var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
                    if (widgetSettings['sakai:allowanonymous'] === false && !isLoggedIn) {
                        $(contentcommentsCommentBtn, rootel).parent().hide();
                    }

                    if (showSettings) {
                        showSettingScreen(true, data);
                    } else {
                        pagerClickHandler(1);
                    }
                }
                else {
                    if (showSettings) {
                        showSettingScreen(false, data);
                    } else {
                        pagerClickHandler(1);
                    }
                }
            });

        };

        /**
         * Gets the comment allow/show settings and shows the appropriate view.
         * @param {Boolean} getComments true = fetch contentcomments if contentcomments are to be shown, false = do not fetch contentcomments.
         */
        var checkCommentsPermissions = function(getComments) {
            var showComments = contentData.data['sakai:showcontentcomments'];
            var allowComments = contentData.data['sakai:allowcontentcomments'];
            if (showComments === true) {
                if (getComments) {
                    pagerClickHandler(1);
                }
                if (sakai.api.User.isAnonymous(sakai.data.me)) {
                    // hide contentcomments entry box
                    $('#contentcomments_userCommentContainer', rootel).hide();
                } else {
                    $('#contentcomments_userCommentContainer', rootel).show();
                }
                $('#contentcomments_contentcommentsDisabled', rootel).hide();
                $('#contentcomments_showComments', rootel).show();
            } else {
                // hide contentcomments entry box and existing contentcomments
                $('#contentcomments_userCommentContainer', rootel).hide();
                $('#contentcomments_showComments', rootel).hide();
                $('#contentcomments_contentcommentsDisabled', rootel).show();
            }
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBinding = function() {
            var validateOpts = {
                submitHandler: postComment,
                messages: {
                    contentcomments_txtMessage: {
                        required: sakai.api.i18n.getValueForKey('PLEASE_ENTER_MESSAGE', 'contentcomments')
                    }
                }
            };
            sakai.api.Util.Forms.validate($('.contentcomments_fillInCommentTopContainer form', rootel), validateOpts, true);
        };


        /////////////////
        // DELETE LINK //
        /////////////////

        /**
         * Deletes or undeleted a post with a certain id.
         * @param {String} id The id of the post.
         * @param {Boolean} deleteValue true = delete it, false = undelete it.
         */
        var doDelete = function(id, deleteValue) {
            var url = contentPath + '.comments?commentId=' + id;
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function() {
                    getComments();
                    $window.trigger('sakai.entity.updatecountcache', {increment: false});
                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('FAILED_TO_DELETE', 'contentcomments'), '', sakai.api.Util.notification.type.ERROR);
                }
            });
        };

        rootel.on('click', contentcommentsDelete, function(e, ui) {
            var id = e.target.id.replace(contentcommentsDelete.replace(/\./g, '') + '_', '');
            doDelete(id, true);
            return false;
        });

        ////////////////
        // EDIT PARTS //
        ////////////////


        /////////////////////////////
        // Initialisation function //
        /////////////////////////////

        /**
         * Switch between main and settings page
         * @param {Boolean} showSettings Show the settings of the widget or not
         */
        var doInit = function() {
            // Temporarily set these here, always allowing comments
            //contentData.data = contentData.data || {};
            contentData.data['sakai:showcontentcomments'] = true;
            contentData.data['sakai:allowcontentcomments'] = true;
            $(contentcommentsEditorOptions, rootel).hide();
            if (sakai_global.content_profile && contentData) {
                contentPath = '/p/' + contentData.data['_path'];

                // check if contentcomments are allowed or shown and display the checkbox options for the manager
                if (contentData.isManager) {
                    if (contentData.data['sakai:allowcontentcomments'] === false) {
                        $(contentcommentsAllowCheckbox, rootel).removeAttr('checked');
                    } else {
                        contentData.data['sakai:allowcontentcomments'] = true;
                        $(contentcommentsAllowCheckbox, rootel).attr('checked', 'checked');
                    }
                    if (contentData.data['sakai:showcontentcomments'] === false) {
                        $(contentcommentsShowCheckbox, rootel).removeAttr('checked');
                        $(contentcommentsAllowCheckbox, rootel).removeAttr('checked');
                        $(contentcommentsAllowCheckbox, rootel).attr('disabled', 'disabled');
                        showCommentsChecked = false;
                    } else {
                        contentData.data['sakai:showcontentcomments'] = true;
                        $(contentcommentsShowCheckbox, rootel).attr('checked', 'checked');
                        $(contentcommentsAllowCheckbox, rootel).removeAttr('disabled');
                    }
                    $(contentcommentsEditorOptions, rootel).show();
                }
            }
            if (!showSettings) {
                // Show the main view.
                var picture = sakai.api.Util.constructProfilePicture(me.profile);
                sakai.api.Util.TemplateRenderer('#contentcomments_userCommentContainer_template', {picture: picture}, $(contentcommentsUserCommentContainer, rootel));
                $(contentcommentsSettingsContainer, rootel).hide();
                $(contentcommentsOutputContainer, rootel).show();
                var isLoggedIn = (me.user.anon && me.user.anon === true) ? false : true;
                if (!isLoggedIn) {
                    $(contentcommentsUserCommentContainer, rootel).hide();
                }
            }
            addBinding();
            checkCommentsPermissions(true);
        };

        /**
         * Load the initial data
         * @param {Object} data JSON object containing the data
         */
        var loadInitData = function(data) {
            if (sakai_global.content_profile) {
                contentData = data || sakai_global.content_profile.content_data;
                if (contentData) {
                    doInit();
                }
            }
        };

        if (!rootel.parents('.collectionviewer_collection_item_comments').length) {

            // Listen for the event if the content profile is ready
            $window.on('ready.contentprofile.sakai', function(ev, data) {
                loadInitData(data);
            });

            // listen for event if new content profile is loaded
            $window.on('content_profile_hash_change', function(ev, data) {
                loadInitData(data);
            });
        } else {
            $window.on('start.collectioncomments.sakai', function(ev, data) {
                contentData = data;
                doInit();
            });
        }

        $window.trigger('content_profile_hash_change');
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('contentcomments');
});
