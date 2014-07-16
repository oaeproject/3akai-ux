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

casper.test.begin('Page - Content', function(test) {

    /**
     * Verify that a manager of the content sees the correct buttons in the clips
     *     - Download
     *     - Manage access
     *     - Edit details
     *     - Upload new version
     *     - Revisions
     *     - Delete
     */
    var verifyContentClipButtonsAsManager = function() {
        test.assertSelectorHasText('#content-clip-container .oae-clip a', 'Download' , 'The `Download` button is available for managers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is available for managers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-uploadnewversion', 'The `Upload new version` button is available for managers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is available for managers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-contentshared', 'The `Shared with` button is not available for managers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-contentdetails', 'The `Details` button is not available for managers of content');
    };

    /**
     * Verify that a member of the content sees the correct buttons in the clips
     *     - Download
     *     - Shared with
     *     - Details
     */
    var verifyContentClipButtonsAsViewer = function() {
        test.assertSelectorHasText('#content-clip-container .oae-clip a', 'Download' , 'The `Download` button is available for viewers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentshared', 'The `Shared with` button is available for viewers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentdetails', 'The `Details` button is available for viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is not available for viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is not available for viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-uploadnewversion', 'The `Upload new version` button is not available for viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is not available for viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is not available for viewers of content');
    };

    /**
     * Verify that an anonymous user sees the correct buttons in the clips
     *     - Download
     *     - Shared with
     *     - Details
     */
    var verifyContentClipButtonsAsAnonymous = function() {
        test.assertSelectorHasText('#content-clip-container .oae-clip a', 'Download' , 'The `Download` button is available for anonymous viewers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentshared', 'The `Shared with` button is available for anonymous viewers of content');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentdetails', 'The `Details` button is available for anonymous viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is not available for anonymous viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is not available for anonymous viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-uploadnewversion', 'The `Upload new version` button is not available for anonymous viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is not available for anonymous viewers of content');
        test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is not available for anonymous viewers of content');
    };

    casper.start(configUtil().tenantUI, function() {
        // Create a couple of users to test with
        var user1 = null;
        var user2 = null;
        userUtil().createUsers(2, function(users) {
            user1 = users[0];
            user2 = users[1];
        });

        // Login with the first user
        casper.then(function() {
            userUtil().doLogIn(user1.username, configUtil().defaultUserPassword);
        });

        // Create a content item, go to the content profile page and verify the clip buttons as a manager
        var contentURL = null;
        casper.then(function() {
            casper.echo('Verify clip buttons as a manager', 'INFO');
            contentUtil().createFile(null, null, [user2.id], function(_contentURL) {
                contentURL = configUtil().tenantUI + _contentURL;
                casper.thenOpen(contentURL, function() {
                    casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
                        verifyContentClipButtonsAsManager();
                    });
                });
                casper.then(function() {
                    userUtil().doLogOut();
                });
            });
        });

        casper.then(function() {
            casper.echo('Verify clip buttons as a viewer', 'INFO');
            userUtil().doLogIn(user2.username, configUtil().defaultUserPassword);
            casper.thenOpen(contentURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
                    verifyContentClipButtonsAsViewer();
                });
            });
            casper.then(function() {
                userUtil().doLogOut();
            });
        });

        casper.then(function() {
            casper.echo('Verify clip buttons as an anonymous user', 'INFO');
            casper.thenOpen(contentURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
                    verifyContentClipButtonsAsAnonymous();
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
