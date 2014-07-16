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
     * @param  {Function}     callback               Standard callback function
     * @param  {Discussion}   callback.discussion    The created discussion object
     */
    var createDiscussion = function(managers, viewers, callback) {
        var discussion = null;
        var rndString = mainUtil().generateRandomString();
        data = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/discussion/create', 'POST', {
                'displayName': 'Discussion ' + rndString,
                'description': 'Talk about all the things!',
                'visibility': 'public'
            }, false));
        }, rndString);

        casper.then(function() {
            if (data) {
                discussion = data;
            } else {
                casper.echo('Could not create discussion \'Discussion' + rndString + '\'.', 'ERROR');
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

                var viewersToAdd = {};
                for (var v = 0; v < viewers.length; v++) {
                    members[viewers[v]] = 'viewer';
                }

                data = casper.evaluate(function(discussionId, members) {
                    return JSON.parse(__utils__.sendAJAX('/api/discussion/'+ discussionId + '/members', 'POST', members, false));
                }, discussion.id, members);

                casper.then(function() {
                    callback(discussion);
                });
            } else {
                callback(discussion);
            }
        });
    };

    return {
        'createDiscussion': createDiscussion
    };
};
