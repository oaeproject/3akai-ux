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
     * Creates a file through the UI and returns the URL to it
     *
     * @param  {[String]}   file       Optional URL to the file to create
     * @param  {Function}   callback   Standard callback function
     */
    var createFile = function(file, callback) {
        var fileToUpload = file || 'tests/casperjs/data/balloons.jpg';
        var contentUrl = null;

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
                    contentUrl = casper.getElementAttribute('#oae-notification-container .alert h4 + a', 'href');
                    callback(contentUrl);
                });
            });
        });
    };

    /**
     * Creates a link through the UI and returns the URL to it
     *
     * @param  {[String]}   link       Optional URL to the link to create
     * @param  {Function}   callback   Standard callback function
     */
    var createLink = function(link, managers, viewers, callback) {
        link = link || 'http://www.oaeproject.org';
        managers = managers || [];
        viewers = viewers || [];
        var data = null;

        casper.then(function() {
            data = casper.evaluate(function(link, managers, viewers) {
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
            callback(data);
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

    return {
        'createFile': createFile,
        'createLink': createLink,
        'createRevision': createRevision
    };
};
