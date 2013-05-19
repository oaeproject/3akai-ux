/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Gets the comments on a content item
     *
     * @param  {String}       resourceId          Content id of the content item for which to get the comments
     * @param  {String}       [start]             Determines the point at which content items are returned for paging purposed.
     * @param  {Integer}      [limit]             Number of items to return
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Comment[]}    callback.comments   Array of comments on the content item
     * @throws {Error}                            Error thrown when no content id has been provided
     */
    var getComments = exports.getComments = function(resourceId, resourceType, start, limit, callback) {
        if (!resourceId) {
            throw new Error('A valid content id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/content/' + contentId + '/comments',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Create a comment on a content item or reply to an existing comment.
     *
     * @param  {String}       contentId           Content id of the content item we're trying to comment on
     * @param  {String}       body                The comment to be placed on the content item
     * @param  {String}       [replyTo]           Id of the comment to reply to
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Comment}      callback.comment    Comment object representing the created comment
     * @throws {Error}                            Error thrown when not all of the required parameters have been provided
     */
    var createComment = exports.createComment = function(contentId, body, replyTo, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!body) {
            throw new Error('A comment should be provided');
        }

        var data = {
            'body': body,
            'replyTo': replyTo
        };

        $.ajax({
            'url': '/api/content/' + contentId + '/comments',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Delete an existing comment from a content item
     *
     * @param  {String}       contentId               Content id of the content item we're trying to delete a comment from
     * @param  {String}       commentId               The ID of the comment to delete
     * @param  {Function}     callback                Standard callback method
     * @param  {Object}       callback.err            Error object containing error code and error message
     * @param  {Object}       [callback.softDeleted]  If the comment is not deleted, but instead flagged as deleted because it has replies, this will return a stripped down comment object representing the deleted comment will be returned, with the `deleted` parameter set to `false`.. If the comment has been properly deleted, no comment will be returned.
     */
    var deleteComment = exports.deleteComment = function(contentId, commentId, callback) {
        if (!contentId) {
            throw new Error('A valid content id should be provided');
        } else if (!commentId) {
            throw new Error('A comment id should be provided');
        }

        $.ajax({
            'url': '/api/content/' + contentId + '/comments/' + commentId,
            'type': 'DELETE',
            'success': function(softDeleted) {
                callback(null, softDeleted);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

});
