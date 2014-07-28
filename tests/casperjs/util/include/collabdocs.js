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
 * Utility functions for collaborative documents
 *
 * @return  {Object}    Returns an object with referenced collabdoc utility functions
 */
var collabDocUtil = function() {

    /**
     * Creates a collabdoc
     *
     * @param  {String[]}   [managers]            Array of user/group ids that should be added as managers to the collaborative document
     * @param  {String[]}   [viewers]             Array of user/group ids that should be added as viewers to the collaborative document
     * @param  {Function}   callback              Standard callback function
     * @param  {Collabdoc}  callback.collabdoc    The collabdoc data coming back from the server
     */
    var createCollabDoc = function(managers, viewers, callback) {
        var rndString = mainUtil().generateRandomString();
        var collabdoc = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/content/create', 'POST', {
                'resourceSubType': 'collabdoc',
                'displayName': 'collabdoc-' + rndString,
                'description': '',
                'visibility': 'public'
            }, false));
        }, rndString);

        casper.then(function() {
            if (!collabdoc) {
                casper.echo('Could not create collabdoc-' + rndString + '.', 'ERROR');
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
                    members[viewers[v]] = 'viewer';
                }

                casper.evaluate(function(collabdocId, members) {
                    return JSON.parse(__utils__.sendAJAX('/api/content/'+ collabdocId + '/members', 'POST', members, false));
                }, collabdoc.id, members);

                casper.then(function() {
                    return callback(collabdoc);
                });
            } else {
                return callback(collabdoc);
            }
        });
    };

    return {
        'createCollabDoc': createCollabDoc
    };
};
