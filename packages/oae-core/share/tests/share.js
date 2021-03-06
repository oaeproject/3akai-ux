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

casper.test.begin('Widget - Share', function(test) {

    /**
     * Verify that the share popover can be opened in the content library
     */
    var openLibraryShare = function() {
        casper.waitForSelector('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]', function() {
            casper.click('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]');
            test.assertExists('#contentlibrary-widget .oae-list-header-actions button.oae-trigger-share:not([disabled])', 'The share button is enabled');
            casper.click('#contentlibrary-widget .oae-list-header-actions button.oae-trigger-share');
            casper.waitUntilVisible('#share-modal', function() {
                test.assertVisible('#share-modal', 'The share pane is showing after trigger');
            });
        });
    };

    /**
     * Verifies that the share form elements are present
     */
    var verifyLibraryShareElements = function() {
        casper.waitForSelector('#share-modal', function() {
            test.assertExists('form#share-form', 'The share form is present');
            test.assertExists('form#share-form ul.as-selections', 'The share form autosuggest is present');
            test.assertExists('form#share-form button#share-save', 'The share form submit button is present');
            test.assertExists('form#share-form button#share-save:disabled', 'The share form submit button is disabled by default');
            test.assertExists('form#share-form button[data-dismiss="modal"]', 'The share cancel button is present');
        });
    };

    /**
     * Verify that a content item can be shared with another user
     *
     * @param  {User}    user    The user object returned from the server on creation
     */
    var verifySharing = function(user) {
        //  Wait a few seconds before searching
        casper.wait(configUtil.searchWaitTime);
        // Share it with the second user that was created for the test
        casper.thenEvaluate(function(user) {
            document.querySelector('#share-form .as-selections input').value = user.displayName;
        }, user);
        // Click the input field to trigger the list
        casper.click('#share-form .as-selections input');
        // Wait for the list to render suggestions
        casper.waitForSelector('.as-list li', function() {
            // Verify there is at least one item in the autosuggestions
            test.assertExists('.as-list li', 'At least one suggestion for \'' + user.displayName + '\' was returned from the server');
            // Click the first suggestion in the list
            casper.click('.as-list li');
            // Check that the share button is now enabled
            test.assertExists('form#share-form button[type="submit"]:not([disabled])', 'The share form submit button is enabled after autosuggest selection');
            // TODO: The casper events aren't properly sent out.
            //       This causes the share button to remain disabled.
            //       We're removing this state manually for now so we can continue the test.
            casper.evaluate(function() {
                document.getElementById('share-save').removeAttribute('disabled');
            });
            // Submit the form
            casper.click('form#share-form button[type="submit"]');
            // Wait for the success notification
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'The content item was successfully shared');
                casper.click('#oae-notification-container .close');
                // Log out
                userUtil.doLogOut();
                // Log in with user I shared with
                casper.then(function() {
                    userUtil.doLogIn(user.username, user.password);
                });
                // Navigate to the content library
                uiUtil.openMyLibrary();
                casper.then(function() {
                    // Wait till the content library has loaded by waiting till the second item is there
                    // The first item contains the upload / new doc actions
                    casper.waitForSelector('#contentlibrary-widget .oae-list.oae-list-grid li.oae-list-actions + li', function() {
                        // Verify there is an item that was shared with the user
                        test.assertExists('li.oae-list-actions + li', 'The shared item can be found in the second user\'s library');
                    });
                });
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(2, function(user1, user2) {
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createFile(null, null, null, null, null, null, function(err, contentProfile) {

                uiUtil.openMyLibrary();

                // Verify opening the popover with trigger
                casper.then(function() {
                    casper.echo('# Verify content library share popover', 'INFO');
                    openLibraryShare();
                });

                // Verify the share form elements are present
                casper.then(function() {
                    casper.echo('# Verify content library share popover', 'INFO');
                    verifyLibraryShareElements();
                });

                // Verify that a content item can be shared with another user
                casper.then(function() {
                    casper.echo('# Verify content item can be shared', 'INFO');
                    verifySharing(user2);
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
