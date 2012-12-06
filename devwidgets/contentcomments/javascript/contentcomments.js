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

        var renderComments = function(commentData) {
            $('.contentcomments_widget .contentcomments_content_container', $rootel).append(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                comments: commentData.results
            }));

            // Adjust paging button so it fetches next page on click
            var nextPage = commentData.results[commentData.results.length - 1].created;
            $('.contentcomments_read_more', $rootel).attr('data-page', nextPage);
        };

        var constructAndAppendComment = function(comment, replyTo, level) {
            var comment = {
                "results": [{
                    "commentId": 'c:camtest:' + Date.now(), // Should be coming back from the create comment endpoint
                    "body": comment,
                    "replyTo": replyTo,
                    "contentId": "c:camtest:ePu3OzEzE9J", // Get this from content profile feed
                    "createdBy": {
                        "tenant": "camtest", // Get this from me feed
                        "id": "u:camtest:ee3iRmvC9M", // Get this from me feed
                        "displayName": "Bert Pareyn", // Get this from me feed
                        "visibility": "private", // Get this from me feed
                        "locale": "en_GB", // Get this from me feed
                        "timezone": "Etc/UTC", // Get this from me feed
                        "publicAlias": "Bert Pareyn", // Get this from me feed
                        "smallPicture": "https://secure.gravatar.com/avatar/7937c2985aa325a2f1dd0de91432ed13?s=32", // Get this from me feed
                        "mediumPicture": "https://secure.gravatar.com/avatar/7937c2985aa325a2f1dd0de91432ed13?s=64", // Get this from me feed
                        "largePicture": "https://secure.gravatar.com/avatar/7937c2985aa325a2f1dd0de91432ed13?s=256", // Get this from me feed
                        "extra": {}
                    },
                    "created": Date.now() + '|',
                    "level": level
                }]
            };

            if (!replyTo) {
                $('.contentcomments_widget .contentcomments_content_container', $rootel).prepend(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                    comments: comment.results
                }));
            } else {
                $('div[data-commentid="' + replyTo + '"]').next().hide();
                $('div[data-commentid="' + replyTo + '"] .contentcomments_reply_button').toggleClass('active');
                $('div[data-commentid="' + replyTo + '"]').next().after(sakai.api.Util.TemplateRenderer('#contentcomments_comment_template', {
                    comments: comment.results
                }));
            }
        };

        ///////////////////////
        // Comment functions //
        ///////////////////////

        var postComment = function(comment, replyTo, level) {
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

        var addBinding = function() {
            $('.contentcomments_read_more', $rootel).on('click', function() {
                var nextPage = $(this).attr('data-page');
                getComments(nextPage);
            });

            $rootel.on('click', '.post_comment', function() {
                var replyTo = $(this).attr('data-replyTo');
                var level = parseInt($(this).attr('data-level')) || 0;
                var comment = $(this).next().val();
                postComment(comment, replyTo, level);
            });

            $rootel.on('click', '.contentcomments_reply_button', function() {
                $(this).toggleClass('active');
                $(this).parent().next().toggle();
            });
        };

        var doInit = function() {
            addBinding();
            getComments();
            $('.contentcomments_widget').show();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('contentcomments');
});
