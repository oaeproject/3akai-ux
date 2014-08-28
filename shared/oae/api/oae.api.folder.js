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

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Get a full folder profile
     *
     * @param  {String}       folderId            Id of the folder we're trying to retrieve
     * @param  {Function}     callback            Standard callback function
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Content}      callback.content    Folder object representing the retrieved folder
     * @throws {Error}                            Error thrown when no folder id has been provided
     */
    var getFolder = exports.getFolder = function(folderId, callback) {
        if (!folderId) {
            throw new Error('A valid folder id should be provided');
        }

        $.ajax({
            'url': '/api/folder/' + folderId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };


    /**
     * Create a new folder
     *
     * @param  {String}         displayName         Display title for the created folder
     * @param  {String}         [description]       The folder's description
     * @param  {String}         [visibility]        The folder's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]          Array of user/group ids that should be added as managers to the folder
     * @param  {String[]}       [viewers]           Array of user/group ids that should be added as viewers to the folder
     * @param  {Function}       [callback]          Standard callback function
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @param  {Folder}         [callback.folder]   Folder object representing the created folder
     * @throws {Error}                              Error thrown when no valid display name has been provided
     */
    var createFolder = exports.createFolder = function(displayName, description, visibility, managers, viewers, callback) {
        if (!displayName) {
            throw new Error('A valid folder name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'displayName': displayName,
            'description': description,
            'visibility': visibility,
            'managers': managers,
            'viewers': viewers
        };

        $.ajax({
            'url': '/api/folder',
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

});
