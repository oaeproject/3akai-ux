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

casper.test.begin('Widget - Upload new version', function(test) {

    /**
     * Open the upload new version modal with assertions
     */
    var openUploadNewVersion = function() {
        casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
            casper.click('#content-clip-container .oae-clip-content > button');
            test.assertExists('.oae-trigger-uploadnewversion', 'Upload new version trigger exists');
            casper.click('.oae-trigger-uploadnewversion');
            casper.wait(configUtil.modalWaitTime, function() {
                test.assertVisible('#uploadnewversion-modal', 'Upload new version pane is showing after trigger');
                casper.click('#content-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Verifies that a new version can be uploaded
     */
    var verifyUploadNewVersion = function() {
        // Check if the form exists
        test.assertExists('form#uploadnewversion-form', 'The upload new version form is present');
        // Fill the form with a new version
        casper.fill('form#uploadnewversion-form', {
            'file': 'tests/casperjs/data/apereo.jpg'
        });
        // Verify that a success notification is shown
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'New version successfully uploaded');
            casper.click('#oae-notification-container .close');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createFile(null, null, null, null, null, null, function(err, contentProfile) {
                // Create a content item, go to the content profile page and open verify opening the modal
                uiUtil.openContentProfile(contentProfile);
                casper.then(function() {
                    casper.echo('Verify upload new version modal', 'INFO');
                    openUploadNewVersion();
                });

                casper.then(function() {
                    casper.echo('Verify uploading a new version', 'INFO');
                    verifyUploadNewVersion();
                });

                // Log out at the end of the test
                userUtil.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
