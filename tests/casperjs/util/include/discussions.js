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
     * @param  {String}         [displayName]             Topic for the discussion
     * @param  {String}         [description]             The discussion's description
     * @param  {String}         [visibility]              The discussion's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]                Array of user/group ids that should be added as managers to the discussion
     * @param  {String[]}       [members]                 Array of user/group ids that should be added as members to the discussion
     * @param  {Function}       callback                  Standard callback method
     * @param  {Object}         callback.err              Error object containing error code and error message
     * @param  {Discussion}     callback.discussion       Discussion object representing the created discussion
     */
    var createDiscussion = function(displayName, description, visibility, managers, members, callback) {
        casper.then(function() {
            var discussion = null;
            var err = null;

            // Default parameters
            displayName = displayName || 'Discussion ' + mainUtil().generateRandomString();
            description = description || 'Talk about all the things!';
            visibility = visibility || 'public';
            managers = managers || [];
            members = members || [];

            mainUtil().callInternalAPI('discussion', 'createDiscussion', [displayName, description, visibility, managers, members], function(_err, _discussion) {
                if (_err) {
                    casper.echo('Could not create discussion \'' + displayName + '\'. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                }
                discussion = _discussion;
            });

            // Wait for the discussion to be created or failing to be created before continuing
            casper.waitFor(function() {
                return discussion !== null || err !== null;
            }, function() {
                return callback(err, discussion);
            });
        });
    };

    return {
        'createDiscussion': createDiscussion
    };
};
