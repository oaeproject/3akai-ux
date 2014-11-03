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
var folderUtil = function() {

    /**
     * Creates a folder
     *
     * @param  {String[]}     [managers]                    Array of user/group ids that should be added as managers to the folder
     * @param  {String[]}     [viewers]                     Array of user/group ids that should be added as viewers to the folder
     * @param  {Function}     callback                      Standard callback function
     * @param  {Folder}       callback.folderProfile        Folder object representing the created folder
     */
    var createFolder = function(managers, viewers, callback) {
        var rndString = mainUtil().generateRandomString();
        var folderProfile = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/folder', 'POST', {
                'displayName': 'Folder ' + rndString,
                'description': 'Collect all the things!',
                'visibility': 'public'
            }, false));
        }, rndString);

        casper.then(function() {
            if (!folderProfile) {
                casper.echo('Could not create folder \'Folder ' + rndString + '\'.', 'ERROR');
                return callback(null);
            }
        });

        casper.then(function() {
            // Add managers and viewers if required
            if (managers || viewers) {
                managers = managers || [];
                viewers = viewers || [];

                var members = {};
                for (var m = 0; m < managers.length; m++) {
                    members[managers[m]] = 'manager';
                }

                for (var v = 0; v < viewers.length; v++) {
                    members[viewers[v]] = 'viewer';
                }

                casper.evaluate(function(folderId, members) {
                    return JSON.parse(__utils__.sendAJAX('/api/folder/'+ folderId + '/members', 'POST', members, false));
                }, folderProfile.id, members);

                casper.then(function() {
                    return callback(folderProfile);
                });
            } else {
                return callback(folderProfile);
            }
        });
    };

    /**
     * Update a folder's metadata
     *
     * @param  {String}      folderId           Id of the folder we're trying to update
     * @param  {Object}      params             JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}    callback           Standard callback method
     */
    var updateFolder = function(folderId, params, callback) {
        var data = null;
        casper.then(function() {
            data = casper.evaluate(function(folderId, params) {
                return JSON.parse(__utils__.sendAJAX('/api/folder/' + folderId, 'POST', params, false));
            }, folderId, params);
        });

        casper.then(callback);
    };

    return {
        'createFolder': createFolder,
        'updateFolder': updateFolder
    };
};
