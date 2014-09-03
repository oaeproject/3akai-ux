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
     * @param  {String[]}   [members]                Array of user/group ids that should be added as members to the group
     * @param  {String[]}   [managers]               Array of user/group ids that should be added as managers to the group
     * @param  {Function}   callback                 Standard callback function
     * @param  {Group}      callback.groupProfile    Group object representing the created group
     */
    var createGroup = function(displayName, description, visibility, joinable, managers, members, callback) {
        var groupProfile = null;
        var err = null;
        displayName = displayName || 'group-' + mainUtil().generateRandomString();
        description = description || 'Test group description';
        visibility = visibility || 'public';
        joinable = joinable || 'yes';
        managers = managers || [];
        members = members || [];

        mainUtil().callInternalAPI('group', 'createGroup', [displayName, description, visibility, joinable, managers, members], function(_err, _groupProfile) {
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
    };

    return {
        'createGroup': createGroup
    };
};
