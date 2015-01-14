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

casper.test.begin('Widget - Revisions', function(test) {

    /**
     * Open the revisions modal with assertions
     */
    var openRevisionsModal = function() {
        casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
            casper.click('#content-clip-container .oae-clip-content > button');
            test.assertExists('.oae-trigger-revisions', 'Revisions trigger exists');
            casper.click('.oae-trigger-revisions');
            casper.waitUntilVisible('#revisions-modal', function() {
                test.assertVisible('#revisions-modal', 'Revisions pane is showing after trigger');
                casper.click('#content-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Verify that all revisions elements are present for content items
     */
    var verifyContentRevisionsElements = function() {
        // Verify the list of revisions is present
        test.assertExists('ul#revisions-list', 'The list of content revisions is present');
        casper.waitForSelector('ul#revisions-list li', function() {
            // Verify that there is at least one item in the revisions list
            test.assertExists('ul#revisions-list li', 'There is at least one content revision present');
            // Verify current revision cannot be restored
            test.assertNotVisible('ul#revisions-list li:first-child .revisions-list-actions-restore', 'The current content revision cannot be restored');
            // Verify other revisions can be restored
            test.assertExists('ul#revisions-list li:first-child + li .revisions-list-actions-restore', 'All other content revisions can be restored');
            // Verify that the revision can be downloaded
            test.assertExists('ul#revisions-list li .revisions-list-actions-download', 'The download button for each content revision is present');
            // Verify preview for revision is shown
            test.assertExists('#revisions-preview-large', 'The content revision preview container is present');
            test.assertExists('#revisions-preview-large img', 'The content revision preview image is present');
        });
    };

    /**
     * Verify that a content revision can be restored
     */
    var verifyRestoringContentRevision = function() {
        // Verify restoring a revision
        casper.click('ul#revisions-list li:first-child + li .revisions-list-actions-restore');
        // Wait for the success notification
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'The content revision can be restored');
            casper.click('#oae-notification-container .close');
        });
    };

    /**
     * Verify that all revisions elements are present for collaborative documents
     */
    var verifyCollabDocRevisionsElements = function() {
        // Verify the list of revisions is present
        test.assertExists('ul#revisions-list', 'The list of collabdoc revisions is present');
        casper.waitForSelector('ul#revisions-list li', function() {
            // Verify that there is at least one item in the revisions list
            test.assertExists('ul#revisions-list li', 'There is at least one collabdoc revision present');
            // Verify current revision can be restored
            test.assertExists('ul#revisions-list li:first-child .revisions-list-actions-restore', 'The current collabdoc revision can be restored');
            // Verify preview for revision is shown
            casper.waitForSelector('.revisions-etherpad-container', function() {
                test.assertExists('.revisions-etherpad-container', 'The collabdoc revision preview is present');
            });
        });
    };

    /**
     * Verify that a content revision can be restored
     */
    var verifyRestoringCollabDocRevision = function() {
        // Verify restoring a revision
        casper.click('ul#revisions-list li:first-child .revisions-list-actions-restore');
        // Wait for the success notification
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'The collabdoc revision can be restored');
            casper.click('#oae-notification-container .close');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createFile(null, null, null, null, null, null, function(err, contentProfile) {
                contentUtil.createCollabDoc(null, null, null, null, null, null, function(err, collabdocProfile) {

                    uiUtil.openContentProfile(contentProfile);

                    casper.then(function() {
                        casper.echo('# Verify revisions modal', 'INFO');
                        contentUtil.createRevision(function() {
                            openRevisionsModal();
                        });
                    });

                    casper.then(function() {
                        casper.echo('# Verify content revisions elements', 'INFO');
                        verifyContentRevisionsElements();
                    });

                    casper.then(function() {
                        casper.echo('# Verify restoring content revision', 'INFO');
                        verifyRestoringContentRevision();
                    });

                    uiUtil.openCollabdocProfile(collabdocProfile);

                    casper.then(function() {
                        casper.echo('# Verify collabdoc revisions elements', 'INFO');
                        openRevisionsModal();
                        casper.then(verifyCollabDocRevisionsElements);
                    });

                    casper.then(function() {
                        casper.echo('# Verify restoring collabdoc revision', 'INFO');
                        verifyRestoringCollabDocRevision();
                    });

                    // Log out at the end of the test
                    userUtil.doLogOut();
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
