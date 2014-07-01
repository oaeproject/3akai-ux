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

// Keeps track of the created collabdocs that are available for testing
var createdCollabDocs = [];

/**
 * Utility functions for collaborative documents
 *
 * @return  {Object}    Returns an object with referenced collabdoc utility functions
 */
var collabDocUtil = function() {

    /**
     * Creates a collabdoc
     *
     * @param {Function}    callback              Standard callback function
     * @param {Collabdoc}   callback.collabdoc    The collabdoc data coming back from the server
     */
    var createCollabDoc = function(callback) {
        var collabdoc = null;
        var rndString = mainUtil().generateRandomString();
        data = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/content/create', 'POST', {
                'resourceSubType': 'collabdoc',
                'displayName': 'collabdoc-' + rndString,
                'description': '',
                'visibility': 'public'
            }, false));
        }, rndString);

        casper.then(function() {
            if (data) {
                createdCollabDocs.push(data);
                collabdoc = data;
            } else {
                casper.echo('Could not create collabdoc-' + rndString + '.', 'ERROR');
            }
        });

        casper.then(function() {
            callback(collabdoc);
        });
    };

    return {
        'createCollabDoc': createCollabDoc,
        'createdCollabDocs': createdCollabDocs
    };
};
