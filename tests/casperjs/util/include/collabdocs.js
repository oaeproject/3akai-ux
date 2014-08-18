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
     * @param  {Collabdoc}  callback.collabdoc    Collabdoc object representing the created collaborative document
     */
    var createCollabDoc = function(managers, viewers, callback) {
        var rndString = mainUtil().generateRandomString();
        managers = managers || [];
        viewers = viewers || [];

        // Bind the event called when the collaborative document has been created
        casper.on(rndString + '.finished', function(data) {
            if (!data.data) {
                casper.echo('Could not create collabdoc-' + rndString + '. Error ' + data.err.code + ': ' + data.err.msg, 'ERROR');
                return callback(null);
            } else {
                return callback(data.data);
            }
        });

        // Use the OAE API to create the collaborative document
        casper.evaluate(function(rndString, managers, viewers) {
            require('oae.api.content').createCollabDoc('collabdoc-' + rndString, 'Test collabdoc description', 'public', managers, viewers, function(err, data) {
                window.callPhantom({
                    'cbId': rndString,
                    'data': data,
                    'err': err
                });
            });
        }, rndString, managers, viewers);
    };

    return {
        'createCollabDoc': createCollabDoc
    };
};
