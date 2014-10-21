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

/**
 * Utility functions for folders
 *
 * @return  {Object}    Returns an object with referenced folder utility functions
 */
var folderUtil = (function() {

    /**
     * Create a new folder
     *
     * @param  {String}         [displayName]           Display title for the created folder
     * @param  {String}         [description]           The folder's description
     * @param  {String}         [visibility]            The folder's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]              Array of user/group ids that should be added as managers to the folder
     * @param  {String[]}       [viewers]               Array of user/group ids that should be added as viewers to the folder
     * @param  {Function}       [callback]              Standard callback function
     * @param  {Object}         [callback.err]          Error object containing error code and error message
     * @param  {Folder}         [callback.folder]       Folder object representing the created folder
     */
    var createFolder = function(displayName, description, visibility, managers, viewers, callback) {
        casper.then(function() {
            var folderProfile = null;
            var err = null;

            // Default parameters
            displayName = displayName || 'Folder ' + mainUtil.generateRandomString();
            description = description || 'Collect all the things!';
            visibility = visibility || 'public';
            managers = managers || [];
            viewers = viewers || [];

            mainUtil.callInternalAPI('folder', 'createFolder', [displayName, description, visibility, managers, viewers], function(_err, _folder) {
                if (_err) {
                    casper.echo('Could not create folder \'' + displayName + '\'. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                }
                folder = _folder;
            });

            // Wait for the folder to be created or failing to be created before continuing
            casper.waitFor(function() {
                return folder !== null || err !== null;
            }, function() {
                return callback(err, folder);
            });
        });
    };

    return {
        'createFolder': createFolder
    };
})();
