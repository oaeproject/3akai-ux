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
 */
var discussionUtil = (function() {
    /**
     * Creates a discussion
     *
     * @param  {String}         [displayName]             Topic for the discussion
     * @param  {String}         [description]             The discussion's description
     * @param  {String}         [visibility]              The discussion's visibility. This can be public, loggedin or private
     * @param  {String[]}       [managers]                Array of user/group ids that should be added as managers to the discussion
     * @param  {String[]}       [members]                 Array of user/group ids that should be added as members to the discussion
     * @param  {Function}       callback                  Standard callback method
     * @param  {Object}         [callback.err]            Error object containing error code and error message
     * @param  {Discussion}     [callback.discussion]     Discussion object representing the created discussion
     */
    var createDiscussion = function(
        displayName,
        description,
        visibility,
        managers,
        members,
        callback,
    ) {
        casper.then(function() {
            var discussion = null;
            var err = null;

            // Default parameters
            displayName =
                displayName || 'Discussion ' + mainUtil.generateRandomString();
            description = description || 'Talk about all the things!';
            visibility = visibility || 'public';
            managers = managers || [];
            members = members || [];

            mainUtil.callInternalAPI(
                'discussion',
                'createDiscussion',
                [displayName, description, visibility, managers, members],
                function(_err, _discussion) {
                    if (_err) {
                        casper.echo(
                            "Could not create discussion '" +
                                displayName +
                                "'. Error " +
                                _err.code +
                                ': ' +
                                _err.msg,
                            'ERROR',
                        );
                        err = _err;
                    }
                    discussion = _discussion;
                },
            );

            // Wait for the discussion to be created or failing to be created before continuing
            casper.waitFor(
                function() {
                    return discussion !== null || err !== null;
                },
                function() {
                    return callback(err, discussion);
                },
            );
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
            data = casper.evaluate(
                function(discussionId, params) {
                    return JSON.parse(
                        __utils__.sendAJAX(
                            '/api/discussion/' + discussionId,
                            'POST',
                            params,
                            false,
                        ),
                    );
                },
                discussionId,
                params,
            );
        });

        casper.then(callback);
    };

    return {
        createDiscussion: createDiscussion,
        updateDiscussion: updateDiscussion,
    };
})();
