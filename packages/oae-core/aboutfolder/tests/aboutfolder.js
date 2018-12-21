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

casper.test.begin('Widget - About Folder', function(test) {

    /**
     * Open the about folder modal with assertions
     */
    var verifyOpenAboutFolder = function() {
        casper.waitForSelector('#folder-clip-container .oae-clip-content > button', function() {
            casper.click('#folder-clip-container .oae-clip-content > button');
            test.assertExists('.oae-trigger-aboutfolder', 'About folder trigger exists');
            casper.click('.oae-trigger-aboutfolder');
            casper.waitUntilVisible('#aboutfolder-modal', function() {
                test.assertVisible('#aboutfolder-modal', 'About folder pane is showing after trigger');
                casper.click('#folder-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Open the about folder modal without assertions
     */
    var openAboutFolder = function() {
        casper.waitForSelector('#folder-clip-container .oae-clip-content > button', function() {
            casper.click('#folder-clip-container .oae-clip-content > button');
            casper.click('.oae-trigger-aboutfolder');
            casper.waitUntilVisible('#aboutfolder-modal', function() {
                casper.click('#folder-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Verify that all elements are present in the about folder modal
     *
     * @param {User}    user1    The user profile of the user that created the discussion
     */
    var verifyAboutFolderElements = function(user1) {
        test.assertExists('#aboutfolder-modal .modal-header h3', 'Verify that the modal has a header');
        test.assertSelectorHasText('#aboutfolder-modal .modal-header h3', 'About', 'Verify that the modal header reads \'About\'');
        test.assertExists('#aboutfolder-modal .modal-body ul.oae-list li', 'Verify that the modal shows who created the folder');
        test.assertExists('#aboutfolder-modal .modal-body ul.oae-list li .oae-listitem-primary-thumbnail', 'Verify that the modal shows the picture of the user who created the folder');
        test.assertExists('#aboutfolder-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', 'Verify that the modal shows the name of the user who created the folder');
        test.assertSelectorHasText('#aboutfolder-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', user1.displayName, 'Verify that the correct name is shown');
        test.assertExists('#aboutfolder-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'Verify that the modal shows the tenant of the user who created the folder');
        test.assertSelectorHasText('#aboutfolder-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'CasperJS Tenant', 'Verify that the metadata shows the tenant name');
        test.assertExists('#aboutfolder-modal .modal-body #aboutfolder-metadata-container #aboutfolder-title', 'Verify that the modal shows title of the folder');
        test.assertSelectorHasText('#aboutfolder-modal .modal-body #aboutfolder-metadata-container #aboutfolder-title', 'Test folder title', 'Verify that the correct folder title is shown');
        test.assertExists('#aboutfolder-modal .modal-body #aboutfolder-metadata-container time', 'Verify that the modal shows when the folder was created');
        // TODO Verify that the date shown corresponds to the created date after the createFolder API returns the folder profile and we have the date
        test.assertExists('#aboutfolder-modal .modal-body #aboutfolder-metadata-container #aboutfolder-description', 'Verify that the modal shows the description of the folder');
        test.assertSelectorHasText('#aboutfolder-modal .modal-body #aboutfolder-metadata-container #aboutfolder-description', 'Test folder description', 'Verify that the correct folder description is shown');
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(2, function(user1, user2) {
            // Login with the first user
            userUtil.doLogIn(user1.username, user1.password);

            // Create a folder to test with
            folderUtil.createFolder('Test folder title', 'Test folder description', null, null, [user2.id], function(err, folderProfile) {
                // Log out of user1
                userUtil.doLogOut();

                // Log in with user2
                userUtil.doLogIn(user2.username, user2.password);

                // Open the folder profile
                uiUtil.openFolderProfile(folderProfile);

                casper.then(function() {
                    casper.echo('Verify open about folder modal', 'INFO');
                    casper.waitForSelector('#folder-clip-container .oae-clip-content > button', function() {
                        verifyOpenAboutFolder();
                    });
                });

                casper.then(function() {
                    casper.echo('Verify about folder elements', 'INFO');
                    verifyAboutFolderElements(user1);
                });

                userUtil.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
