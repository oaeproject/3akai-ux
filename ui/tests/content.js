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
        test.assertExists('#content-clip-container .oae-clip button.content-trigger-manageaccess', 'The `Manage access` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.content-trigger-manageaccess-add', 'The `Share` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-uploadnewversion', 'The `Upload new version` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is available for managers of a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a file');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 8, 'Verify that there are exactly 8 buttons in the file clip');
    };

    /**
     * Verify that non-managers of a file see the correct buttons in the clips
     *
     * @param  {Boolean}    anon    Whether or not the user is anonymous
     */
    var verifyFileClipButtonsAsNonManager = function(anon) {
        test.assertSelectorHasText('#content-clip-container .oae-clip a', 'Download', 'The `Download` button is available on a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-aboutcontent', 'The `About` button is available on a file');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-sharedwith', 'The `Shared with` button is available on a file');
        if (anon) {
            test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-share', 'The `Share` button is not available on a file for anonymous users');
            test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is not available on a file for anonymous users');
            test.assertEvalEquals(function() {
                return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
            }, 3, 'Verify that there are exactly 3 buttons in the file clip for anonymous users');
        } else {
            test.assertExists('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is available on a file');
            test.assertExists('#content-clip-container .oae-clip button.oae-trigger-share', 'The `Share` button is available on a file');
            test.assertEvalEquals(function() {
                return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
            }, 5, 'Verify that there are exactly 5 buttons in the file clip');
        }
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
        test.assertExists('#content-clip-container .oae-clip button.content-trigger-manageaccess', 'The `Manage access` button is available for managers of a link');
        test.assertExists('#content-clip-container .oae-clip button.content-trigger-manageaccess-add', 'The `Share` button is available for managers of a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is available for managers of a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a link');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 5, 'Verify that there are exactly 5 buttons in the link clip');
    };

    /**
     * Verify that non-managers of a link see the correct buttons in the clips
     *
     * @param  {Boolean}    anon    Whether or not the user is anonymous
     */
    var verifyLinkClipButtonsAsNonManager = function(anon) {
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-aboutcontent', 'The `About` button is available on a link');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-sharedwith', 'The `Shared with` button is available on a link');
        if (anon) {
            test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-share', 'The `Share` button is not available on a link for anonymous users');
            test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is not available on a link for anonymous users');
            test.assertEvalEquals(function() {
                return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
            }, 2, 'Verify that there are exactly 2 buttons in the link clip for anonymous users');
        } else {
            test.assertExists('#content-clip-container .oae-clip button.oae-trigger-share', 'The `Share` button is available on a link');
            test.assertExists('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is available on a link');
            test.assertEvalEquals(function() {
                return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
            }, 4, 'Verify that there are exactly 4 buttons in the link clip');
        }
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
        test.assertExists('#content-clip-container .oae-clip button.content-trigger-manageaccess', 'The `Manage access` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.content-trigger-manageaccess-add', 'The `Share` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-editcontent', 'The `Edit details` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-revisions', 'The `Revisions` button is available for managers of a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a collaborative document');
        test.assertEvalEquals(function() {
            return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
        }, 6, 'Verify that there are exactly 6 buttons in the collaborative document clip');
    };

    /**
     * Verify that non-managers of a collaborative document see the correct buttons in the clips
     *
     * @param  {Boolean}    anon    Whether or not the user is anonymous
     */
    var verifyCollabdocClipButtonsAsNonManager = function(anon) {
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-sharedwith', 'The `Shared with` button is available on a collaborative document');
        test.assertExists('#content-clip-container .oae-clip button.oae-trigger-aboutcontent', 'The `About` button is available on a collaborative document');
        if (anon) {
            test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-share', 'The `Share` button is not available on a collaborative document for anonymous users');
            test.assertDoesntExist('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is not available on a collaborative document for anonymous users');
            test.assertEvalEquals(function() {
                return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
            }, 2, 'Verify that there are exactly 2 buttons in the collaborative document clip for anonymous users');
        } else {
            test.assertExists('#content-clip-container .oae-clip button.oae-trigger-share', 'The `Share` button is available on a collaborative document');
            test.assertExists('#content-clip-container .oae-clip button.oae-trigger-addtofolder', 'The `Add to folder` button is available on a collaborative document');
            test.assertEvalEquals(function() {
                return $('#content-clip-container .oae-clip .oae-clip-content > div button, #content-clip-container .oae-clip .oae-clip-content > div a').length;
            }, 4, 'Verify that there are exactly 4 buttons in the collaborative document clip');
        }
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(3, function(user1, user2, user3) {
            // Login with the first user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createFile(null, null, null, null, null, [user2.id], function(err, contentProfile) {
                contentUtil.createLink(null, null, null, null, null, [user2.id], null, function(err, linkProfile) {
                    contentUtil.createCollabDoc(null, null, null, null, [user2.id], null, function(err, collabdocProfile) {
                        ///////////
                        // FILES //
                        ///////////

                        // Verify content clip buttons as a manager
                        uiUtil.openContentProfile(contentProfile);
                        casper.then(function() {
                            casper.echo('Verify file clip buttons as a manager', 'INFO');
                            verifyFileClipButtonsAsManager();
                        });

                        userUtil.doLogOut();
                        userUtil.doLogIn(user2.username, user2.password);
                        uiUtil.openContentProfile(contentProfile);

                        casper.then(function() {
                            casper.echo('Verify file clip buttons as a viewer', 'INFO');
                            verifyFileClipButtonsAsNonManager();
                        });

                        userUtil.doLogOut();
                        userUtil.doLogIn(user3.username, user3.password);
                        uiUtil.openContentProfile(contentProfile);

                        casper.then(function() {
                            casper.echo('Verify file clip buttons as a logged in non-viewer user', 'INFO');
                            verifyFileClipButtonsAsNonManager();
                        });

                        userUtil.doLogOut();
                        uiUtil.openContentProfile(contentProfile);

                        casper.then(function() {
                            casper.echo('Verify file clip buttons as an anonymous user', 'INFO');
                            verifyFileClipButtonsAsNonManager(true);
                        });


                        ///////////
                        // LINKS //
                        ///////////

                        // Login with the first user again to start link tests
                        userUtil.doLogIn(user1.username, user1.password);
                        uiUtil.openLinkProfile(linkProfile);

                        // Verify the link clip buttons as a manager
                        casper.then(function() {
                            casper.echo('Verify link clip buttons as a manager', 'INFO');
                            verifyLinkClipButtonsAsManager();
                        });

                        userUtil.doLogOut();
                        userUtil.doLogIn(user2.username, user2.password);
                        uiUtil.openLinkProfile(linkProfile);

                        casper.then(function() {
                            casper.echo('Verify link clip buttons as a viewer', 'INFO');
                            verifyLinkClipButtonsAsNonManager();
                        });

                        userUtil.doLogOut();
                        userUtil.doLogIn(user3.username, user3.password);
                        uiUtil.openLinkProfile(linkProfile);

                        casper.then(function() {
                            casper.echo('Verify link clip buttons as a logged in non-viewer user', 'INFO');
                            verifyLinkClipButtonsAsNonManager();
                        });

                        userUtil.doLogOut();
                        uiUtil.openLinkProfile(linkProfile);

                        casper.then(function() {
                            casper.echo('Verify link clip buttons as an anonymous user', 'INFO');
                            verifyLinkClipButtonsAsNonManager(true);
                        });


                        /////////////////////////////
                        // COLLABORATIVE DOCUMENTS //
                        /////////////////////////////

                        // Login with the first user again to start collabdoc tests
                        userUtil.doLogIn(user1.username, user1.password);
                        uiUtil.openCollabdocProfile(collabdocProfile);

                        // Verify the collabdoc clip buttons as a manager
                        casper.then(function() {
                            casper.echo('Verify collabdoc clip buttons as a manager', 'INFO');
                            verifyCollabdocClipButtonsAsManager();
                        });

                        userUtil.doLogOut();
                        userUtil.doLogIn(user2.username, user2.password);
                        uiUtil.openCollabdocProfile(collabdocProfile);

                        casper.then(function() {
                            casper.echo('Verify collabdoc clip buttons as a viewer', 'INFO');
                            verifyCollabdocClipButtonsAsNonManager();
                        });

                        userUtil.doLogOut();
                        userUtil.doLogIn(user3.username, user3.password);
                        uiUtil.openCollabdocProfile(collabdocProfile);

                        casper.then(function() {
                            casper.echo('Verify collabdoc clip buttons as a logged in non-viewer user', 'INFO');
                            verifyCollabdocClipButtonsAsNonManager();
                        });

                        userUtil.doLogOut();
                        uiUtil.openCollabdocProfile(collabdocProfile);

                        casper.then(function() {
                            casper.echo('Verify collabdoc clip buttons as an anonymous user', 'INFO');
                            verifyCollabdocClipButtonsAsNonManager(true);
                        });
                    });
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
