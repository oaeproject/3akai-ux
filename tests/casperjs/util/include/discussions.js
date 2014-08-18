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
 * Utility functions for discussions
 *
 * @return  {Object}    Returns an object with referenced discussions utility functions
 */
var discussionUtil = function() {

    /**
     * Creates a discussion
     *
     * @param  {String[]}     [managers]                    Array of user/group ids that should be added as managers to the discussion
     * @param  {String[]}     [members]                     Array of user/group ids that should be added as members to the discussion
     * @param  {Function}     callback                      Standard callback function
     * @param  {Discussion}   callback.discussionProfile    Discussion object representing the created discussion
     */
    var createDiscussion = function(managers, members, callback) {
        var rndString = mainUtil().generateRandomString();
        managers = managers || [];
        members = members || [];

        // Bind the event called when the discussion has been created
        casper.on(rndString + '.finished', function(data) {
            if (!data.data) {
                casper.echo('Could not create discussion \'Discussion' + rndString + '\'.', 'ERROR');
                return callback(null);
            } else {
                return callback(data.data);
            }
        });

        // Use the OAE API to create the discussion
        casper.evaluate(function(rndString, managers, members) {
            require('oae.api.discussion').createDiscussion('Discussion ' + rndString, 'Talk about all the things!', 'public', managers, members, function(err, data) {
                window.callPhantom({
                    'cbId': rndString,
                    'data': data
                });
            });
        }, rndString, managers, members);
    };

    return {
        'createDiscussion': createDiscussion
    };
};
