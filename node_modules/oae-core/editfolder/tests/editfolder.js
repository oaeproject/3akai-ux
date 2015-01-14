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

casper.test.begin('Widget - Edit folder', function(test) {

    /**
     * Verify that the editFolder button can be pressed and press it
     */
    var verifyOpenEditFolder = function() {
        casper.waitForSelector('#folder-clip-container .oae-clip-content > button', function() {
            casper.click('#folder-clip-container .oae-clip-content > button');
            casper.waitForSelector('button.oae-trigger-editfolder', function() {
                test.assertVisible('button.oae-trigger-editfolder', 'Edit folder trigger exists');
                casper.click('button.oae-trigger-editfolder');
                casper.waitUntilVisible('#editfolder-modal', function() {
                    test.assertVisible('#editfolder-modal', 'Edit folder pane is showing after trigger');
                    casper.click('#folder-clip-container .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Verify that the editfolder form is present
     */
    var verifyEditFolderFormElements = function() {
        casper.waitForSelector('#editfolder-modal', function() {
            test.assertExists('form#editfolder-form','The edit folder form is present');
            test.assertExists('form#editfolder-form #editfolder-name','The edit folder name field is present');
            test.assertExists('form#editfolder-form #editfolder-description','The edit folder description field is present');
            test.assertExists('form#editfolder-form button[type="submit"]','The edit folder form submit button is present');
        });
    };

    /**
     * Verify the form validation by checking that a folder cannot be updated without a name
     */
    var verifyEditFolderFormValidate = function() {
        // Form without name
        casper.fill('form#editfolder-form', {
            'editfolder-name': '',
            'editfolder-description': 'A valid description'
        }, false);
        casper.click('#editfolder-form button[type="submit"]');
        test.assertVisible('#editfolder-name-error', 'Verify validating empty name, name-error is visible');

        // TODO: Make sure that updating the folder without a description works
    };

    /**
     * Verify that a folder can be edited
     */
    var verifyEditFolder = function() {
        // Fill the form
        casper.fill('form#editfolder-form', {
            'editfolder-name': 'New folder name',
            'editfolder-description': 'New folder description'
        }, false);
        // Submit the editfolder form
        casper.click('#editfolder-form button[type="submit"]');
        // Verify that the changes have been persisted
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'The folder details were successfully updated');
            test.assertSelectorHasText('#folder-clip-container h1', 'New folder name', 'The folder name was successfully renamed to \'New folder name\'');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test with
        userUtil.createUsers(1, function(user1) {
            // Log in with that user
            userUtil.doLogIn(user1.username, user1.password);

            // Create a folder
            folderUtil.createFolder(null, null, null, null, null, function(err, folderProfile) {
                // Open the folder profile
                uiUtil.openFolderProfile(folderProfile);

                // Verify that editfolder can be triggered
                casper.then(function() {
                    casper.echo('# Verify editfolder modal','INFO');
                    verifyOpenEditFolder();
                });

                // Verify that the edit folder form is opened and visible
                casper.then(function() {
                    casper.echo('# Verify editfolder form elements','INFO');
                    verifyEditFolderFormElements();
                });

                // Verify that the errors from the edit form works
                casper.then(function() {
                    casper.echo('# Verify editfolder form validation','INFO');
                    verifyEditFolderFormValidate();
                });

                // Verify that the details can be edited
                casper.then(function() {
                    casper.echo('# Verify folder can be edited','INFO');
                    verifyEditFolder();
                });
            });

            // Log out again
            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
