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
 * Utility functions for groups
 *
 * @return  {Object}    Returns an object with referenced group utility functions
 */
var groupUtil = function() {

    /**
     * Creates a group
     *
     * @param  {String[]}   [managers]               Array of user/group ids that should be added as managers to the group
     * @param  {String[]}   [viewers]                Array of user/group ids that should be added as members to the group
     * @param  {Function}   callback                 Standard callback function
     * @param  {Group}      callback.groupProfile    Group object representing the created group
     */
    var createGroup = function(managers, viewers, callback) {
        var rndString = mainUtil().generateRandomString();
        var groupProfile = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/group/create', 'POST', {
                'displayName': 'group-' + rndString,
                'visibility': 'public',
                'joinable': 'yes'
            }, false));
        }, rndString);

        casper.then(function() {
            if (!groupProfile) {
                casper.echo('Could not create group \'Discussion' + rndString + '\'.', 'ERROR');
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
                    members[viewers[v]] = 'member';
                }

                casper.evaluate(function(groupId, members) {
                    return JSON.parse(__utils__.sendAJAX('/api/group/'+ groupId + '/members', 'POST', members, false));
                }, groupProfile.id, members);

                casper.then(function() {
                    return callback(groupProfile);
                });
            } else {
                return callback(groupProfile);
            }
        });
    };

    /**
     * Update a group's metadata
     *
     * @param  {String}      groupId        Id of the group we're trying to update
     * @param  {Object}      params         JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}    callback       Standard callback method
     */
    var updateGroup = function(groupId, params, callback) {
        var data = null;
        casper.then(function() {
            data = casper.evaluate(function(groupId, params) {
                return JSON.parse(__utils__.sendAJAX('/api/group/' + groupId, 'POST', params, false));
            }, groupId, params);
        });

        casper.then(callback);
    };

    return {
        'createGroup': createGroup,
        'updateGroup': updateGroup
    };
};
