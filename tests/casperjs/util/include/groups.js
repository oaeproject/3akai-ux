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
 */
var groupUtil = (function() {

    /**
     * Create a group
     *
     * @param  {String}            [displayName]            The displayName for this group
     * @param  {String}            [description]            The description for this group
     * @param  {String}            [visibility]             The visibility for this group
     * @param  {String}            [joinable]               Whether or not this group is joinable
     * @param  {String[]}          [managers]               An array of userIds that should be made managers
     * @param  {String[]}          [members]                An array of userIds that should be made members
     * @param  {Function}          callback                 Standard callback method
     * @param  {Object}            [callback.err]           Error object containing error code and error message
     * @param  {Group}             [callback.group]         A Group object representing the created group
     */
    var createGroup = function(displayName, description, visibility, joinable, managers, members, callback) {
        casper.then(function() {
            var groupProfile = null;
            var err = null;
            displayName = displayName || 'group-' + mainUtil.generateRandomString();
            description = description || 'Test group description';
            joinable = joinable || 'yes';
            managers = managers || [];
            members = members || [];

            mainUtil.callInternalAPI('group', 'createGroup', [displayName, description, visibility, joinable, managers, members], function(_err, _groupProfile) {
                if (_err) {
                    casper.echo('Could not create ' + displayName + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                    return;
                } else {
                    groupProfile = _groupProfile;
                }
            });

            casper.waitFor(function() {
                return groupProfile !== null || err !== null;
            }, function() {
                return callback(err, groupProfile);
            });
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
})();
