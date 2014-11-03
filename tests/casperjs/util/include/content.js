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

// Keeps track of the created content that is available for testing
var createdContent = [];

/**
 * Utility functions for content
 *
 * @return  {Object}    Returns an object with referenced content utility functions
 */
var contentUtil = function() {

    /**
     * Create a file through the UI, add optional managers and viewers and return the content profile object
     * in the callback
     *
     * @param  {[String]}    file                         Optional URL to the file to create
     * @param  {String[]}    [managers]                   Array of user/group ids that should be added as managers to the file
     * @param  {String[]}    [viewers]                    Array of user/group ids that should be added as viewers to the file
     * @param  {Function}    callback                     Standard callback function
     * @param  {Content}     callback.contentProfile      Content object representing the created content
     */
    var createFile = function(file, managers, viewers, callback) {
        var fileToUpload = file || 'tests/casperjs/data/balloons.jpg';

        // Casper doesn't allow direct file POST so we upload through the UI
        casper.thenOpen(configUtil().tenantUI + '/me', function() {
            casper.waitForSelector('#me-clip-container .oae-clip-content > button', function() {
                casper.click('#me-clip-container .oae-clip-content > button');
                casper.click('.oae-trigger-upload');
                casper.wait(configUtil().modalWaitTime, function() {
                    casper.click('#me-clip-container .oae-clip-content > button');
                });
            });
            casper.then(function() {
                casper.fill('#upload-dropzone form', {
                    'file': fileToUpload
                }, false);
                casper.click('button#upload-upload');
                casper.waitForSelector('#oae-notification-container .alert', function() {
                    var contentUrl = casper.getElementAttribute('#oae-notification-container .alert h4 + a', 'href');
                    var contentId = contentUrl.split('/');
                    contentId = 'c:test:' + contentId[contentId.length -1];

                    // Fetch the content profile
                    var contentProfile = casper.evaluate(function(contentId) {
                        return JSON.parse(__utils__.sendAJAX('/api/content/' + contentId, 'GET', null, false));
                    }, contentId);

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

                        // Add the managers and viewers
                        casper.evaluate(function(contentId, members) {
                            return JSON.parse(__utils__.sendAJAX('/api/content/'+ contentId + '/members', 'POST', members, false));
                        }, contentProfile.id, members);

                        casper.then(function() {
                            return callback(contentProfile);
                        });
                    } else {
                        return callback(contentProfile);
                    }
                });
            });
        });
    };

    /**
     * Creates a link through the UI and returns the URL to it
     *
     * @param  {String}      [link]                    Optional URL to the link to create
     * @param  {String[]}    [managers]                Array of user/group ids that should be added as managers to the link
     * @param  {String[]}    [viewers]                 Array of user/group ids that should be added as viewers to the link
     * @param  {Function}    callback                  Standard callback function
     * @param  {Link}        callback.linkProfile      Link object representing the created link
     */
    var createLink = function(link, managers, viewers, callback) {
        link = link || 'http://www.oaeproject.org';
        managers = managers || [];
        viewers = viewers || [];
        var linkProfile = null;

        casper.then(function() {
            linkProfile = casper.evaluate(function(link, managers, viewers) {
                return JSON.parse(__utils__.sendAJAX('/api/content/create', 'POST', {
                    'resourceSubType': 'link',
                    'displayName': link,
                    'description': '',
                    'visibility': 'public',
                    'link': link,
                    'managers': managers,
                    'viewers': viewers
                }, false));
            }, link, managers, viewers);
        });

        casper.then(function() {
            callback(linkProfile);
        });
    };

    /**
     * Creates a revision for a content item
     *
     * @param  {Function}    callback    Standard callback function
     */
    var createRevision = function(callback) {
        casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
            casper.click('.oae-trigger-uploadnewversion');

            // TODO: We need a way to know when the uploadnewversion widget has bootstrapped itself
            // There is currently no way to determine this from casper, so we do a simple wait
            casper.wait(configUtil().searchWaitTime, function() {
                casper.waitForSelector('form#uploadnewversion-form', function() {
                    casper.fill('form#uploadnewversion-form', {
                        'file': 'tests/casperjs/data/apereo.jpg'
                    });
                    casper.waitForSelector('#oae-notification-container .alert', function() {
                        casper.click('#oae-notification-container .close');
                        callback();
                    });
                });
            });
        });
    };

    /**
     * Update a content item's metadata
     *
     * @param  {String}      contentId     Id of the content item we're trying to update
     * @param  {Object}      params        JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}    callback      Standard callback method
     */
    var updateContent = function(contentId, params, callback) {
        var data = null;
        casper.then(function() {
            data = casper.evaluate(function(contentId, params) {
                return JSON.parse(__utils__.sendAJAX('/api/content/' + contentId, 'POST', params, false));
            }, contentId, params);
        });

        casper.then(callback);
    };

    return {
        'createFile': createFile,
        'createLink': createLink,
        'createRevision': createRevision,
        'updateContent': updateContent
    };
};
