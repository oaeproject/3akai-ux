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
     * @param  {String[]}     [viewers]                     Array of user/group ids that should be added as viewers to the discussion
     * @param  {Function}     callback                      Standard callback function
     * @param  {Discussion}   callback.discussionProfile    Discussion object representing the created discussion
     */
    var createDiscussion = function(managers, viewers, callback) {
        var rndString = mainUtil().generateRandomString();
        var discussionProfile = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/discussion/create', 'POST', {
                'displayName': 'Discussion ' + rndString,
                'description': 'Talk about all the things!',
                'visibility': 'public'
            }, false));
        }, rndString);

        casper.then(function() {
            if (!discussionProfile) {
                casper.echo('Could not create discussion \'Discussion' + rndString + '\'.', 'ERROR');
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

                casper.evaluate(function(discussionId, members) {
                    return JSON.parse(__utils__.sendAJAX('/api/discussion/'+ discussionId + '/members', 'POST', members, false));
                }, discussionProfile.id, members);

                casper.then(function() {
                    return callback(discussionProfile);
                });
            } else {
                return callback(discussionProfile);
            }
        });
    };

    /**
     * Update a discussion's metadata
     *
     * @param  {String}      discussionId   Id of the discussion we're trying to update
     * @param  {Object}      params         JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}    callback       Standard callback method
     */
    var updateDiscussion = function(discussionId, params, callback) {
        var data = null;
        casper.then(function() {
            data = casper.evaluate(function(discussionId, params) {
                return JSON.parse(__utils__.sendAJAX('/api/discussion/' + discussionId, 'POST', params, false));
            }, discussionId, params);
        });

        casper.then(callback);
    };

    return {
        'createDiscussion': createDiscussion,
        'updateDiscussion': updateDiscussion
    };
};
