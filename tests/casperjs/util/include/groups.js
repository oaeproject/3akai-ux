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

// Keeps track of the created groups that are available for testing
var createdGroups = [];

/**
 * Utility functions for groups
 *
 * @return  {Object}    Returns an object with referenced group utility functions
 */
var groupUtil = function() {

    /**
     * Creates a group
     *
     * @param {Function}   callback          Standard callback function
     * @param {Group}      callback.group    The group data coming back from the server
     */
    var createGroup = function(members, managers, callback) {
        var group = null;

        var rndString = mainUtil().generateRandomString();
        data = casper.evaluate(function(rndString, members, managers) {
            return JSON.parse(__utils__.sendAJAX('/api/group/create', 'POST', {
                'displayName': 'group-' + rndString,
                'description': '',
                'visibility': 'public',
                'joinable': 'yes',
                'members': members,
                'managers': managers
            }, false));
        }, rndString, members, managers);

        casper.then(function() {
            if (data) {
                createdGroups.push(data);
                group = data;
            } else {
                casper.echo('Could not create group-' + rndString + '.', 'ERROR');
            }
        });

        casper.then(function() {
            callback(group);
        });
    };

    return {
        'createGroup': createGroup,
        'createdGroups': createdGroups
    };
};
