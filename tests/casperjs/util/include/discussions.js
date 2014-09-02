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
        var discussionProfile = null;
        var rndString = mainUtil().generateRandomString();
        var params = ['Discussion ' + rndString, 'Talk about all the things!', 'public', managers || [], members || []];

        mainUtil().callInternalAPI('discussion', 'createDiscussion', params, function(err, _discussionProfile) {
            if (err) {
                casper.echo('Could not create discussion \'Discussion' + rndString + '\'. Error ' + err.code + ': ' + err.msg, 'ERROR');
            } else {
                discussionProfile = _discussionProfile;
            }
        });

        // Wait for the discussion to be created before continuing
        casper.waitFor(function() {
            return discussionProfile !== null;
        }, function() {
            return callback(discussionProfile);
        });
    };

    return {
        'createDiscussion': createDiscussion
    };
};
