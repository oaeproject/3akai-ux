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


    ///////////
    // FILES //
    ///////////

    /**
     * Verify that a manager of a file sees the correct buttons in the clips
     *     - Download
     *     - Manage access
     *     - Edit details
     *     - Upload new version
     *     - Revisions
     *     - Delete
     */
    var verifyFileClipButtonsAsManager = function() {
        test.assertSelectorHasText('#content-clip-container .oae-clip a', 'Download', 'The `Download` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-uploadnewversion', 'The `Upload new version` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a file');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 6, 'Verify that there are exactly 6 buttons in the file clip');
    };

    /**
     * Verify that non-managers of a file see the correct buttons in the clips
     */
    var verifyFileClipButtonsAsNonManager = function() {
        test.assertSelectorHasText('#content-clip-container .oae-clip a', 'Download', 'The `Download` button is available on a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentshared', 'The `Shared with` button is available on a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-aboutcontent', 'The `About` button is available on a file');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 3, 'Verify that there are exactly 3 buttons in the file clip');
    };


    ///////////
    // LINKS //
    ///////////

    /**
     * Verify that a manager of a link sees the correct buttons in the clips
     *     - Manage access
     *     - Edit details
     *     - Delete
     */
    var verifyLinkClipButtonsAsManager = function() {
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is available for managers of a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a link');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 3, 'Verify that there are exactly 3 buttons in the link clip');
    };

    /**
     * Verify that non-managers of a link see the correct buttons in the clips
     */
    var verifyLinkClipButtonsAsNonManager = function() {
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentshared', 'The `Shared with` button is available on a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-aboutcontent', 'The `About` button is available on a link');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 2, 'Verify that there are exactly 2 buttons in the link clip');
    };


    /////////////////////////////
    // COLLABORATIVE DOCUMENTS //
    /////////////////////////////

    /**
     * Verify that a manager of a collaborative document sees the correct buttons in the clips
     *     - Manage access
     *     - Edit details
     *     - Revisions
     *     - Delete
     */
    var verifyCollabdocClipButtonsAsManager = function() {
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a collaborative document');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 4, 'Verify that there are exactly 4 buttons in the collaborative document clip');
    };

    /**
     * Verify that non-managers of a collaborative document see the correct buttons in the clips
     */
    var verifyCollabdocClipButtonsAsNonManager = function() {
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-contentshared', 'The `Shared with` button is available on a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-aboutcontent', 'The `About` button is available on a collaborative document');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 2, 'Verify that there are exactly 2 buttons in the collaborative document clip');
    };

    casper.start(configUtil().tenantUI, function() {
        // Create a couple of users to test with
        var user1 = null;
        var user2 = null;
        var user3 = null;
        userUtil().createUsers(3, function(users) {
            user1 = users[0];
            user2 = users[1];
            user3 = users[2];
        });

        // Login with the first user
        casper.then(function() {
            userUtil().doLogIn(user1.username, user1.password);
        });


        ///////////
        // FILES //
        ///////////

        // Create a file, go to the content profile page and verify the clip buttons as a manager
        var contentURL = null;
        casper.then(function() {
            casper.echo('Verify file clip buttons as a manager', 'INFO');
            contentUtil().createFile(null, null, [user2.id], function(contentProfile) {
                contentURL = configUtil().tenantUI + contentProfile.profilePath;
                casper.thenOpen(contentURL, function() {
                    casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyFileClipButtonsAsManager);
                });
                casper.then(userUtil().doLogOut);
            });
        });

        casper.then(function() {
            casper.echo('Verify file clip buttons as a viewer', 'INFO');
            userUtil().doLogIn(user2.username, user2.password);
            casper.thenOpen(contentURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyFileClipButtonsAsNonManager);
            });
            casper.then(userUtil().doLogOut);
        });

        casper.then(function() {
            casper.echo('Verify file clip buttons as a logged in non-viewer user', 'INFO');
            userUtil().doLogIn(user3.username, user3.password);
            casper.thenOpen(contentURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyFileClipButtonsAsNonManager);
            });
            casper.then(userUtil().doLogOut);
        });

        casper.then(function() {
            casper.echo('Verify file clip buttons as an anonymous user', 'INFO');
            casper.thenOpen(contentURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyFileClipButtonsAsNonManager);
            });
        });


        ///////////
        // LINKS //
        ///////////

        // Login with the first user again to start link tests
        casper.thenOpen(configUtil().tenantUI, function() {
            userUtil().doLogIn(user1.username, user1.password);
        });

        // Create a link, go to the content profile page and verify the clip buttons as a manager
        var linkURL = null;
        casper.then(function() {
            casper.echo('Verify link clip buttons as a manager', 'INFO');
            contentUtil().createLink(null, null, [user2.id], function(link) {
                linkURL = configUtil().tenantUI + link.profilePath;
                casper.thenOpen(linkURL, function() {
                    casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyLinkClipButtonsAsManager);
                });
                casper.then(userUtil().doLogOut);
            });
        });

        casper.then(function() {
            casper.echo('Verify link clip buttons as a viewer', 'INFO');
            userUtil().doLogIn(user2.username, user2.password);
            casper.thenOpen(linkURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyLinkClipButtonsAsNonManager);
            });
            casper.then(userUtil().doLogOut);
        });

        casper.then(function() {
            casper.echo('Verify link clip buttons as a logged in non-viewer user', 'INFO');
            userUtil().doLogIn(user3.username, user3.password);
            casper.thenOpen(linkURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyLinkClipButtonsAsNonManager);
            });
            casper.then(userUtil().doLogOut);
        });

        casper.then(function() {
            casper.echo('Verify link clip buttons as an anonymous user', 'INFO');
            casper.thenOpen(linkURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyLinkClipButtonsAsNonManager);
            });
        });


        /////////////////////////////
        // COLLABORATIVE DOCUMENTS //
        /////////////////////////////

        // Login with the first user again to start collabdoc tests
        casper.thenOpen(configUtil().tenantUI, function() {
            userUtil().doLogIn(user1.username, user1.password);
        });

        // Create a collaborative document, go to the content profile page and verify the clip buttons as a manager
        var collabdocURL = null;
        casper.then(function() {
            casper.echo('Verify collabdoc clip buttons as a manager', 'INFO');
            collabDocUtil().createCollabDoc(null, [user2.id], function(collabdocProfile) {
                collabdocURL = configUtil().tenantUI + collabdocProfile.profilePath;
                casper.thenOpen(collabdocURL, function() {
                    casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyCollabdocClipButtonsAsManager);
                });
                casper.then(userUtil().doLogOut);
            });
        });

        casper.then(function() {
            casper.echo('Verify collabdoc clip buttons as a viewer', 'INFO');
            userUtil().doLogIn(user2.username, user2.password);
            casper.thenOpen(collabdocURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyCollabdocClipButtonsAsNonManager);
            });
            casper.then(userUtil().doLogOut);
        });

        casper.then(function() {
            casper.echo('Verify collabdoc clip buttons as a logged in non-viewer user', 'INFO');
            userUtil().doLogIn(user3.username, user3.password);
            casper.thenOpen(collabdocURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyCollabdocClipButtonsAsNonManager);
            });
            casper.then(userUtil().doLogOut);
        });

        casper.then(function() {
            casper.echo('Verify collabdoc clip buttons as an anonymous user', 'INFO');
            casper.thenOpen(collabdocURL, function() {
                casper.waitForSelector('#content-clip-container .oae-clip-content > button', verifyCollabdocClipButtonsAsNonManager);
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
