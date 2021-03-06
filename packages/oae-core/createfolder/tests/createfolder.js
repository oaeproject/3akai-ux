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

casper.test.begin('Widget - Create folder', function(test) {

    /**
     * Open the create folder modal with assertions
     */
    var verifyOpenCreateFolder = function() {
        // Wait till the widget loading mechanisme is ready
        // Do this by waiting till a template has been rendered
        casper.waitForSelector('#me-clip-container .oae-clip', function() {
            casper.waitForSelector('.oae-clip-secondary .oae-clip-content > button', function() {
                casper.click('.oae-clip-secondary .oae-clip-content > button');
                test.assertExists('.oae-trigger-createfolder', 'create folder trigger exists');
                casper.click('.oae-trigger-createfolder');
                casper.waitForSelector('.setpermissions-summary', function() {
                    test.assertVisible('#createfolder-modal', 'create folder pane is showing after trigger');
                    casper.click('.oae-clip-secondary .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Open the create folder modal
     */
    var openCreateFolder = function() {
        // Wait till the widget loading mechanisme is ready
        // Do this by waiting till a template has been rendered
        casper.waitForSelector('#me-clip-container .oae-clip', function() {
            casper.waitForSelector('.oae-clip-secondary .oae-clip-content > button', function() {
                casper.click('.oae-clip-secondary .oae-clip-content > button');
                casper.click('.oae-trigger-createfolder');
                casper.waitForSelector('.setpermissions-summary', function() {
                    casper.click('.oae-clip-secondary .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Goes through the workflow of creating a folder
     */
    var verifyCreatefolder = function(user2Id) {
        // Verify the form is present
        test.assertExists('form#createfolder-form', 'The create folder form is present');
        test.assertExists('#createfolder-name', 'The folder name field is present');
        // Fill the form
        casper.fill('form#createfolder-form', {
            'createfolder-name': 'Testing tools'
        }, false);

        // Verify the change permissions button is there
        test.assertExists('.setpermissions-change-permissions', 'The \'change permissions\' button is present');
        // Click the change permissions button
        casper.click('.setpermissions-change-permissions');
        // Verify the permissions radio button group and share input fields are there
        test.assertExists('#createfolder-permissions-container #setpermissions-container input[type="radio"]', 'The \'change permissions\' radio button group is present');
        test.assertExists('#createfolder-permissions-container .as-selections input', 'The \'share\' input field is present');
        // Select the public permission
        casper.click('#createfolder-permissions-container #setpermissions-container input[type="radio"][value="public"]', 'Select \'public\' permissions for the folder');
        // Verify the update button is present
        test.assertExists('#setpermissions-savepermissions', 'The \'Update\' button is present');
        // Share it with the second user that was created for the test
        casper.evaluate(function(user2Id) {
            $('#createfolder-permissions-container .as-selections input').val(user2Id);
        }, user2Id);
        // Click the input field to trigger the list
        casper.click('#createfolder-permissions-container .as-selections input');
        casper.waitForSelector('.as-list li', function() {
            // Verify there is at least one item in the autosuggestions
            test.assertExists('.as-list li', 'At least one suggestion for \'' + user2Id + '\' was returned from the server');
            // Click the first suggestion in the list
            casper.click('.as-list li');
            // Click the update button
            casper.click('#setpermissions-savepermissions', 'Update the permission changes');

            // Verify the 'create folder' button is present
            test.assertExists('#createfolder-create', 'The \'Create folder\' button is present');
            // Click the submit button
            casper.click('#createfolder-create');
            // Wait for a second and verify that the user was redirected to the folder profile page
            casper.waitForSelector('#folder-clip-container h1', function() {
                test.assertVisible('#folder-clip-container', 'Folder profile is shown after creation of folder');
                test.assertSelectorHasText('#folder-clip-container h1', 'Testing tools', 'Title matches \'Testing tools\'');
            });
        });
    };

    /**
     * Verify the form validation by checking that a folder without a name cannot be created
     */
    var verifyCreatefolderValidation = function() {
        casper.waitForSelector('form#createfolder-form', function() {
            // Test submitting without folder title
            // Fill the form
            casper.fill('form#createfolder-form', {
                'createfolder-name': ''
            }, false);
            // Click the submit button
            casper.click('#createfolder-create');
            // Verify that an error label is shown
            test.assertExists('#createfolder-name-error', 'Successfully validated empty title');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test createfolder with
        var user1 = null;
        var user2 = null;
        userUtil.createUsers(2, function(users) {
            user1 = users[0];
            user2 = users[1];
        });

        // Login with that user
        casper.then(function() {
            userUtil.doLogIn(user1.username, user1.password);
        });

        // Open the createdfolder modal
        casper.then(function() {
            casper.echo('# Verify open create folder modal', 'INFO');
            verifyOpenCreateFolder();
        });

        // Create a folder
        casper.then(function() {
            casper.echo('# Verify create folder', 'INFO');
            verifyCreatefolder(user2.username);
        });

        // Navigate back to the user home page
        casper.then(function() {
            uiUtil.openMe();
        });

        // Verify the folder form validation
        casper.then(function() {
            casper.echo('# Verify create folder validation', 'INFO');
            casper.then(openCreateFolder);
            casper.then(verifyCreatefolderValidation);
        });

        // Log out at the end of the test
        casper.then(function() {
            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
