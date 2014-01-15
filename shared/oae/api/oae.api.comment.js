/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Gets the comments for a particular resource (content item, discussion, etc.)
     *
     * @param  {String}       resourceId                   Id of the resource for which to get the comments
     * @param  {String}       resourceType                 Type of resource for which to get the comments (e.g. 'content', 'discussion', etc.)
     * @param  {String}       [start]                      The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}       [limit]                      Number of comments to return
     * @param  {Function}     callback                     Standard callback method
     * @param  {Object}       callback.err                 Error object containing error code and error message
     * @param  {Object}       callback.comments            Response object containing the resource comments and nextToken
     * @param  {Comment[]}    callback.comments.results    Array of comments on the resource
     * @param  {String}       callback.comments.nextToken  The value to provide in the `start` parameter to get the next set of results
     * @throws {Error}                                     Error thrown when not all of the required parameters have been provided
     */
    var getComments = exports.getComments = function(resourceId, resourceType, start, limit, callback) {
        if (!resourceId) {
            throw new Error('A valid resource id should be provided');
        } else if (!resourceType) {
            throw new Error('A valid resource type should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': '/api/' + resourceType + '/' + resourceId + '/messages',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a comment on a resource or reply to an existing comment.
     *
     * @param  {String}       resourceId            Id of the resource for which to create the comment
     * @param  {String}       resourceType          Type of resource on which to comment (e.g. 'content', 'discussion', etc.)
     * @param  {String}       body                  The comment to be placed on the resource
     * @param  {String}       [replyTo]             Id of the comment to reply to
     * @param  {Function}     [callback]            Standard callback method
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @param  {Comment}      [callback.comment]    Comment object representing the created comment
     * @throws {Error}                              Error thrown when not all of the required parameters have been provided
     */
    var createComment = exports.createComment = function(resourceId, resourceType, body, replyTo, callback) {
        if (!resourceId) {
            throw new Error('A valid resource id should be provided');
        } else if (!resourceType) {
            throw new Error('A valid resource type should be provided');
        } else if (!body) {
            throw new Error('A comment should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'body': body,
            'replyTo': replyTo
        };

        $.ajax({
            'url': '/api/' + resourceType + '/' + resourceId + '/messages',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete an existing comment from a resource
     *
     * @param  {String}       resourceId                Id of the resource from which to delete the comment
     * @param  {String}       resourceType              Type of resource for which the comment should be deleted (e.g. 'content', 'discussion', etc.)
     * @param  {String}       commentId                 The ID of the comment to delete
     * @param  {Function}     [callback]                Standard callback method
     * @param  {Object}       [callback.err]            Error object containing error code and error message
     * @param  {Object}       [callback.softDeleted]    If the comment is not deleted, but instead flagged as deleted because it has replies, this will return a stripped down comment object representing the deleted comment, with the `deleted` property set to `true`. If the comment has been properly deleted, no comment will be returned.
     * @throws {Error}                                  Error thrown when not all of the required parameters have been provided
     */
    var deleteComment = exports.deleteComment = function(resourceId, resourceType, commentId, callback) {
        if (!resourceId) {
            throw new Error('A valid resource id should be provided');
        } else if (!resourceType) {
            throw new Error('A valid resource type should be provided');
        } else if (!commentId) {
            throw new Error('A comment id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/' + resourceType + '/' + resourceId + '/messages/' + commentId,
            'type': 'DELETE',
            'success': function(softDeleted) {
                callback(null, softDeleted);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

});
