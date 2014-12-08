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
 * Utility functions for content
 */
var contentUtil = (function() {

    /**
     * Create a file through the UI, update the metadata, add optional managers and viewers and return
     * the content profile object in the callback
     *
     * @param  {String}             [displayName]       Display title for the created content item
     * @param  {String}             [description]       The content item's description
     * @param  {String}             [visibility]        The content item's visibility. This can be public, loggedin or private
     * @param  {String}             [file]              Optional URL to the file to create
     * @param  {String[]}           [managers]          Array of user/group ids that should be added as managers to the content item
     * @param  {String[]}           [viewers]           Array of user/group ids that should be added as viewers to the content item
     * @param  {Function}           callback            Standard callback method
     * @param  {Object}             [callback.err]      Error object containing error code and error message
     * @param  {Content}            [callback.content]  Content object representing the created content
     */
    var createFile = function(displayName, description, visibility, file, managers, viewers, callback) {
        casper.then(function() {
            var contentProfile = null;
            var err = null;
            displayName = displayName || 'Content ' + mainUtil.generateRandomString();
            description = description || '';
            visibility = visibility || 'public';
            file = file || 'tests/casperjs/data/balloons.jpg';
            managers = managers || [];
            viewers = viewers || [];

            /**
             * Update the members of a content item
             *
             * @param  {String}    contentId          The ID of the content item to retrieve
             * @param  {Object}    updatedMembers     JSON Object where the keys are the user/group ids we want to update membership for, and the values are the roles these members should get (manager or viewer). If false is passed in as a role, the principal will be removed as a member
             * @param  {Content}   _contentProfile    Content object representing the content to update the members for
             * @api private
             */
            var _updateMembers = function(contentId, members, _contentProfile) {
                mainUtil.callInternalAPI('content', 'updateMembers', [contentId, members], function(_err) {
                    if (_err) {
                        casper.echo('Could not update members for ' + _contentProfile.displayName + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                        err = _err;
                        return;
                    } else {
                        contentProfile = _contentProfile;
                    }
                });

                casper.waitFor(function() {
                    return contentProfile !== null || err !== null;
                }, function() {
                    return callback(err, contentProfile);
                });
            };

            /**
             * Update a content item's metadata
             *
             * @param  {String}    contentId    Id of the content item we're trying to update
             * @param  {Object}    params       JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
             * @api private
             */
            var _updateContent = function(contentId, params) {
                var updatedContent = null;
                var members = {};

                updateContent(contentId, params, function(_err, _contentProfile) {
                    if (_err) {
                        err = _err;
                        return;
                    } else if (managers.length || viewers.length) {
                        for (var m = 0; m < managers.length; m++) {
                            members[managers[m]] = 'manager';
                        }

                        for (var v = 0; v < viewers.length; v++) {
                            members[viewers[v]] = 'viewer';
                        }
                    }
                    updatedContent = _contentProfile;
                });

                casper.waitFor(function() {
                    return updatedContent !== null || err !== null;
                }, function() {
                    if (managers.length || viewers.length) {
                        return _updateMembers(contentId, members, updatedContent);
                    } else {
                        return callback(err, updatedContent);
                    }
                });
            };

            /**
             * Retrieve the content profile and continue with updating the content metadata
             *
             * @param  {String}    contentId    The ID of the content item to retrieve
             * @api private
             */
            var _getContent = function(contentId) {
                var retrievedContent = null;
                var params = null;

                mainUtil.callInternalAPI('content', 'getContent', [contentId], function(_err, _contentProfile) {
                    if (_err) {
                        casper.echo('Could not get content profile for ' + contentId + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                        err = _err;
                        return;
                    }

                    // Update the content metadata
                    params = {
                        'displayName': displayName,
                        'description': description,
                        'visibility': visibility
                    };

                    retrievedContent = _contentProfile;
                });

                casper.waitFor(function() {
                    return retrievedContent !== null || err !== null;
                }, function() {
                    _updateContent(contentId, params);
                });
            };

            // Casper doesn't allow direct file POST so we upload through the UI
            uiUtil.openMe();
            casper.then(function() {
                casper.waitForSelector('#me-clip-container .oae-clip-content > button', function() {
                    casper.click('#me-clip-container .oae-clip-content > button');
                    casper.click('.oae-trigger-upload');
                    casper.wait(configUtil.modalWaitTime, function() {
                        casper.click('#me-clip-container .oae-clip-content > button');
                    });
                });
                casper.then(function() {
                    casper.waitForSelector('#upload-dropzone form', function() {
                        casper.fill('#upload-dropzone form', {
                            'file': file
                        }, false);
                        casper.click('button#upload-upload');
                        casper.waitForSelector('#oae-notification-container .alert', function() {
                            var contentUrl = casper.getElementAttribute('#oae-notification-container .alert h4 + a', 'href');
                            var contentId = contentUrl.split('/');
                            contentId = 'c:' + configUtil.tenantAlias + ':' + contentId[contentId.length -1];

                            // Retrieve the content profile and update the metadata and members
                            _getContent(contentId);
                        });
                    });
                });
            });
        });
    };

    /**
     * Creates a link through the UI and returns the content profile
     *
     * @param  {String}         [displayName]       Display title for the created content item
     * @param  {String}         [description]       The content item's description
     * @param  {String}         [visibility]        The content item's visibility. This can be public, loggedin or private
     * @param  {String}         [link]              The URL that should be stored against this content item
     * @param  {String[]}       [managers]          Array of user/group ids that should be added as managers to the content item
     * @param  {String[]}       [viewers]           Array of user/group ids that should be added as viewers to the content item
     * @param  {String[]}       [folders]           Array of folder ids to which the link should be added
     * @param  {Function}       callback            Standard callback method
     * @param  {Object}         [callback.err]      Error object containing error code and error message
     * @param  {Content}        [callback.content]  Content object representing the created link
     */
    var createLink = function(displayName, description, visibility, link, managers, viewers, folders, callback) {
        casper.then(function() {
            var linkProfile = null;
            var err = null;
            link = link || 'http://www.oaeproject.org';
            displayName = displayName || link;
            description = description || '';
            visibility = visibility || 'public';
            managers = managers || [];
            viewers = viewers || [];
            folders = folders || [];

            mainUtil.callInternalAPI('content', 'createLink', [displayName, description, visibility, link, managers, viewers, folders], function(_err, _linkProfile) {
                if (_err) {
                    casper.echo('Could not create link ' + link + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                    return;
                } else {
                    linkProfile = _linkProfile;
                }
            });

            casper.waitFor(function() {
                return linkProfile !== null || err !== null;
            }, function() {
                return callback(err, linkProfile);
            });
        });
    };

    /**
     * Creates a collabdoc and return the content profile
     *
     * @param  {String}       [displayName]         Display title for the created collabdoc
     * @param  {String}       [description]         The collabdoc's description
     * @param  {String}       [visibility]          The collabdoc's visibility. This can be public, loggedin or private
     * @param  {String[]}     [managers]            Array of user/group ids that should be added as managers to the collabdoc
     * @param  {String[]}     [viewers]             Array of user/group ids that should be added as viewers to the collabdoc
     * @param  {String[]}     [folders]             Array of folder ids to which the collaborative document should be added
     * @param  {Function}     callback              Standard callback method
     * @param  {Object}       [callback.err]        Error object containing error code and error message
     * @param  {Content}      [callback.content]    Content object representing the created collabdoc
     */
    var createCollabDoc = function(displayName, description, visibility, managers, viewers, folders, callback) {
        casper.then(function() {
            var collabdocProfile = null;
            var err = null;
            displayName = displayName || 'Collabdoc ' + mainUtil.generateRandomString();
            description = description || '';
            visibility = visibility || 'public';
            managers = managers || [];
            viewers = viewers || [];
            folders = folders || [];

            mainUtil.callInternalAPI('content', 'createCollabDoc', [displayName, description, visibility, managers, viewers, folders], function(_err, _collabdocProfile) {
                if (_err) {
                    casper.echo('Could not create ' + displayName + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                    return;
                } else {
                    collabdocProfile = _collabdocProfile;
                }
            });

            casper.waitFor(function() {
                return collabdocProfile !== null || err !== null;
            }, function() {
                return callback(err, collabdocProfile);
            });
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
            casper.wait(configUtil.searchWaitTime, function() {
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
     * @param  {String}       contentId           Id of the content item we're trying to update
     * @param  {Object}       params              JSON object where the keys represent all of the profile field names we want to update and the values represent the new values for those fields
     * @param  {Function}     callback            Standard callback method
     * @param  {Object}       [callback.err]      Error object containing error code and error message
     * @param  {Content}      [callback.data]     Content object representing the updated content
     */
    var updateContent = function(contentId, params, callback) {
        casper.then(function() {
            var contentProfile = null;
            var err = null;

            mainUtil.callInternalAPI('content', 'updateContent', [contentId, params], function(_err, _contentProfile) {
                if (_err) {
                    casper.echo('Could not update content. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                    return;
                } else {
                    contentProfile = _contentProfile;
                }
            });

            casper.waitFor(function() {
                return contentProfile !== null || err !== null;
            }, function() {
                return callback(err, contentProfile);
            });
        });
    };

    return {
        'createFile': createFile,
        'createLink': createLink,
        'createCollabDoc': createCollabDoc,
        'createRevision': createRevision,
        'updateContent': updateContent
    };
})();
