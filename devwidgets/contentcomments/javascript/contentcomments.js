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
/*global Config, $ */

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

        var $rootel = $('#' + tuid);


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
        * Checks if the current user is a manager of the content
        *
        * @return {Boolean}    Returns true if the user is a manager of the content
        */
        var canManage = function() {
            // Check content permissions to see if user can manage content
            return true;
        };

        /**
         * Renders the paged comment items
         *
         * @param {Object}    commentData    Object containing comments as returned by the comment API
         */
        var renderComments = function(commentData) {
            $('.contentcomments_widget .contentcomments_content_container', $rootel).append(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                comments: commentData.results,
                canManage: canManage()
            }));

            // Adjust paging button so it fetches next page on click
            var nextPage = commentData.results[commentData.results.length - 1].created;
            $('.contentcomments_read_more', $rootel).attr('data-page', nextPage);
        };

        /**
        * When a reply or comment is made the comment object is constructed added to the UI.
        * TODO: Once the Comment API is hooked up this will need to be replaced/removed as the created comment will come back from the server.
        *
        * @param {String}    comment    The comment text that was created
        * @param {String}    replyTo    If the comment was a reply on another comment, this is the commentId of that comment
        * @param {String}    level      The level of the comment
        */
        var constructAndAppendComment = function(comment, replyTo, level) {
            var comment = { // Should be coming back from the create comment endpoint
                "results": [{
                    "commentId": 'c:camtest:' + Date.now(),
                    "body": comment,
                    "replyTo": replyTo,
                    "contentId": "comm:camtest:ePu3OzEzE9J",
                    "createdBy": {
                        "tenant": "camtest",
                        "id": "u:camtest:ee3iRmvC9M",
                        "displayName": "Bert Pareyn",
                        "visibility": "private",
                        "locale": "en_GB",
                        "timezone": "Etc/UTC",
                        "publicAlias": "Bert Pareyn",
                        "smallPicture": "https://secure.gravatar.com/avatar/7937c2985aa325a2f1dd0de91432ed13?s=32",
                        "mediumPicture": "https://secure.gravatar.com/avatar/7937c2985aa325a2f1dd0de91432ed13?s=64",
                        "largePicture": "https://secure.gravatar.com/avatar/7937c2985aa325a2f1dd0de91432ed13?s=256",
                        "extra": {}
                    },
                    "created": Date.now() + '|',
                    "level": level
                }]
            };

            if (!replyTo) {
                $('.contentcomments_widget .contentcomments_content_container', $rootel).prepend(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                    comments: comment.results,
                    canManage: canManage()
                }));
            } else {
                $('div[data-commentid="' + replyTo + '"]').next().hide();
                $('div[data-commentid="' + replyTo + '"] .contentcomments_reply_button').toggleClass('active');
                $('div[data-commentid="' + replyTo + '"]').next().after(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                    comments: comment.results,
                    canManage: true
                }));
            }
        };

        /**
         * Removes a comment from the list of comments
         *
         * @param {String}    commentId    The comment ID of the comment to be removed from the content
         */
        var removeCommentFromList = function(commentId) {
            $comment = $('div[data-commentid="' + commentId + '"]');
            $comment.prev().remove();
            $comment.next().remove();
            $comment.remove();
        };

        ///////////////////////
        // Comment functions //
        ///////////////////////

        /**
         * Creates a new comment on the content item and calls the functionality that appends/prepends it to the list of comments in the UI.
         *
         * @param {String}    comment    The comment text that was created
         * @param {String}    replyTo    If the comment was a reply on another comment, this is the commentId of that comment
         * @param {String}    level      The level of the comment
         */
        var createComment = function(comment, replyTo, level) {
            /*$.ajax({
                'url': '/api/content/:contentId/comments',
                'data': {
                    'body': comment,
                    'replyTo': replyTo
                },
                'type': 'POST',
                'success': function(data) {
                    // Prepend the comment
                },
                'error': function(err) {
                    // Show something bad happend
                }
            });*/

            constructAndAppendComment(comment, replyTo, level);
        };

        /**
         * Deletes a comment from the content item and calls the functionality that deletes it from the list of comments in the UI.
         *
         * @parm {String}    commentId    The ID of the comment to delete
         */
        var deleteComment = function(commentId) {
            /*$.ajax({
                'url': '/api/content/:contentId/comments/:commentId',
                'type': 'DELETE',
                'success': function(data) {
                    // Remove the comment
                },
                'error': function(err) {
                    // Show something bad happend
                }
            });*/

            removeCommentFromList(commentId);
        };

        /**
         * Retrieves the paged list of comments
         *
         * @param {String}    page    Indicates where to start paging
         *
         */
        var getComments = function(page) {
            page = page || 'page1';

            $.ajax({
                'url': 'devwidgets/contentcomments/dummy/' + page + '.json',
                'success': function(data) {
                    renderComments(data);
                },
                'error': function(err) {
                    $('.contentcomments_read_more', $rootel).hide();
                }
            });
        };


        //////////////////////////////
        // Initialization functions //
        //////////////////////////////

        /**
         * Binds various functions to elements in the content comments UI.
         */
        var addBinding = function() {
            // Paging
            $('.contentcomments_read_more', $rootel).on('click', function() {
                var nextPage = $(this).attr('data-page');
                getComments(nextPage);
            });

            // Post comment/reply
            $rootel.on('click', '.post_comment', function() {
                var replyTo = $(this).attr('data-replyTo');
                var level = parseInt($(this).attr('data-level')) || 0;
                var comment = $(this).next().val();
                createComment(comment, replyTo, level);
            });

            // Delete comment/reply
            $rootel.on('click', '.contentcomments_delete_button', function() {
                var commentId = $(this).parent().attr('data-commentid');
                deleteComment(commentId);
            });

            // Show reply form
            $rootel.on('click', '.contentcomments_reply_button', function() {
                $(this).toggleClass('active');
                $(this).parent().next().toggle();
            });
        };

        /**
         * Triggers the initialization of the content comments widget.
         */
        var doInit = function() {
            addBinding();
            getComments();
            $('.contentcomments_widget').show();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('contentcomments');
});
