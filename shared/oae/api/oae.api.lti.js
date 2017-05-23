/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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

define(['exports', 'jquery', 'underscore', 'oae.api.util'], function(exports, $, _, utilAPI) {

    /**
     * Create a LTI tool
     *
     * @param  {String}            groupId                  The id of the group this LTI tool belongs to
     * @param  {String}            url                      The launch URL for the new LTI tool
     * @param  {String}            secret                   The OAUTH secret for the new LTI tool
     * @param  {String}            key                      The OAUTH consumer key for the new LTI tool
     * @param  {String}            [displayName]            The displayName for this LTI tool
     * @param  {String}            [description]            The description for this LTI tool
     * @param  {Function}          [callback]               Standard callback function
     * @param  {Object}            [callback.err]           Error object containing error code and error message
     * @param  {LtiTool}           [callback.ltiTool]       A LTI tool object representing the created LTI tool
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
    var createLtiTool = exports.createLtiTool = function (groupId, url, secret, key, displayName, description, callback) {
        if (!groupId) {
            throw new Error('A group ID should be provided');
        } else if (!url) {
            throw new Error('A tool launch URL should be provided');
        } else if (!secret) {
            throw new Error('An OAUTH secret should be provided');
        } else if (!key) {
            throw new Error('An OAUTH consumer key should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'url': url,
            'secret': secret,
            'key': key,
            'displayName': displayName,
            'description': description,
        };

        $.ajax({
            'url': '/api/lti/' + groupId + '/create',
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
     * Launch a LTI tool
     *
     * @param  {String}       groupId             The id of the group in which the LTI tool resides
     * @param  {String}       toolId              The id of the LTI tool that should be retrieved
     * @param  {Function}     callback            Standard callback function
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {LtiTool}      callback.ltiTool    The LTI tool object representing the requested LTI tool
     * @throws {Error}                            Error thrown when no LTI tool id has been provided
     */
    var launchLtiTool = exports.launchLtiTool = function(groupId, toolId, callback) {
        if (!groupId){
            throw new Error('A valid group ID should be provided');
        } else if (!toolId) {
            throw new Error('A valid LTI tool ID should be provided');
        }

        $.ajax({
            'url': '/api/lti/' + groupId + '/' + toolId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get all the LTI tools for a group
     *
     * @param  {String}         groupId                         Id of the group we're trying to retrieve the LTI tools for
     * @param  {Function}       callback                        Standard callback function
     * @param  {Object}         callback.err                    Error object containing error code and error message
     * @param  {Object}         callback.tools                  Response object containing the LTI tool invitations
     * @throws {Error}                                          Error thrown when no group id has been provided
     */
    var getLtiTools = exports.getLtiTools = function(groupId, callback) {
        if (!groupId) {
            throw new Error('A valid group ID should be provided');
        }

        $.ajax({
            'url': '/api/lti/'  + groupId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

   /**
     * Delete a LTI tool
     *
     * @param  {String}     groupId             The id of the group in which the LTI tool resides
     * @param  {String}     toolId              The id of the LTI tool to delete
     * @param  {Function}   [callback]          Standard callback function
     * @param  {Object}     [callback.err]      Error object containing the error code and error message
     * @throws {Error}                          Error thrown when no group id or LTI tool id has been provided
     */
    var deleteLtiTool = exports.deleteLtiTool = function(groupId, toolId, callback) {
        if (!groupId){
            throw new Error('A valid group ID should be provided');
        } else if (!toolId) {
            throw new Error('A valid LTI tool ID should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/lti/' + groupId + '/' + toolId,
            'type': 'DELETE',
            'success': function(data) {
                callback();
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
