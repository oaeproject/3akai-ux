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

casper.test.begin('Widget - File preview', function(test) {

    /**
     * Verifies that a file preview is shown on the content profile page
     */
    var verifyFilePreview = function() {
        casper.waitForSelector('#filepreview-container', function() {
            test.assertExists('#filepreview-container', 'The file preview container is present');
            test.assertExists('#filepreview-container #filepreview-image-container', 'The image container is present');
            test.assertExists('#filepreview-container #filepreview-image-container img', 'The image is shown on the content profile page');
        });
    };

    /**
     * Verifies that a video preview is shown on the content profile page
     */
    var verifyVideoPreview = function() {
        casper.waitForSelector('#filepreview-container', function() {
            test.assertExists('#filepreview-container', 'The file preview container is present');
        });
    };

    /**
     * Verifies that the etherpad document is shown on the content profile page and that viewers cannot edit the document
     *
     * @param  {User}      user                User profile object
     * @param  {Collabdoc} collabdocProfile    The profile of the collaborative document that's tested
     */
    var verifyCollabDocPreview = function(user, collabdocProfile) {
        casper.waitForSelector('#etherpad-container #etherpad-edit-mode', function() {
            test.assertExists('#etherpad-container', 'The etherpad container is present');
            test.assertExists('#etherpad-container #etherpad-edit-mode', 'The etherpad edit mode is present for other manager');
            test.assertExists('#etherpad-container iframe#etherpad-editor', 'The etherpad iframe is present');
            userUtil.doLogOut();
            userUtil.doLogIn(user.username, user.password);
            uiUtil.openCollabdocProfile(collabdocProfile);
            casper.waitForSelector('#etherpad-container #etherpad-view-mode', function() {
                test.assertExists('#etherpad-container', 'The etherpad container is present for viewer');
                test.assertExists('#etherpad-container #etherpad-view-mode', 'The etherpad view mode is present for viewer');
                test.assertDoesntExist('#etherpad-container iframe#etherpad-editor', 'The etherpad edit iframe is not present for viewer');
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(2, function(user1, user2) {
            // Log in with that user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createFile(null, null, null, null, null, null, function(err, content1Profile) {
                contentUtil.createFile(null, null, null, 'tests/casperjs/data/sample-video.mp4', null, null, function(err, content2Profile) {
                    contentUtil.createCollabDoc(null, null, null, null, null, null, function(err, collabdocProfile) {
                        // Verify image previews
                        uiUtil.openContentProfile(content1Profile);
                        casper.then(function() {
                            casper.echo('# Verify image preview elements present', 'INFO');
                            verifyFilePreview();
                        });

                        // Verify video previews
                        uiUtil.openContentProfile(content2Profile);
                        casper.then(function() {
                            casper.echo('# Verify video preview elements present', 'INFO');
                            verifyVideoPreview();
                        });

                        // Verify collaborative document previews
                        uiUtil.openCollabdocProfile(collabdocProfile);
                        casper.then(function() {
                            casper.echo('# Verify collaborative document preview elements present', 'INFO');
                            verifyCollabDocPreview(user2, collabdocProfile);
                        });

                        // Log out at the end of the test
                        userUtil.doLogOut();
                    });
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
