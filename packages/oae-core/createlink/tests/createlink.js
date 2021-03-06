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

casper.test.begin('Widget - Create link', function(test) {

    /**
     * Open the createlink modal with assertions
     */
    var openCreateLink = function() {
        // Wait till the widget loading mechanisme is ready
        // Do this by waiting till a template has been rendered
        casper.waitForSelector('#me-clip-container .oae-clip', function() {
            casper.waitForSelector('#me-clip-container .oae-clip-content > button', function() {
                casper.click('#me-clip-container .oae-clip-content > button');
                test.assertExists('.oae-trigger-createlink', 'Createlink trigger exists');
                casper.click('.oae-trigger-createlink');
                // TODO: When widgets have an event that indicates it's done loading this wait needs to be replaced
                casper.wait(configUtil.searchWaitTime, function() {
                    test.assertVisible('#createlink-modal', 'Createlink pane is showing after trigger');
                    casper.click('#me-clip-container .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Verify creating a single link
     */
    var verifyCreateSingleLink = function() {
        // Verify the link dump area is there
        test.assertExists('#createlink-link-dump', 'The link dump area is present');
        // Add a single link to the textarea
        casper.sendKeys('#createlink-link-dump', 'http://www.oaeproject.org');
        // TODO: The casper events aren't properly sent out so the validation will not be triggered.
        //       This causes the next button to remain disabled.
        //       We're removing this state manually for now so we can continue the test.
        casper.evaluate(function() {
            $('#createlink-next').prop('disabled', false);
        });
        // Verify the 'Next' button is present
        test.assertExists('#createlink-next', 'The \'Next\' button is present');
        // Verify the 'Next' button is enabled
        test.assertDoesntExist('#createlink-next:disabled', 'The \'Next\' button is enabled');
        // Go to the next step
        casper.click('#createlink-next');
        // Add the link
        test.assertExists('button#createlink-create', 'The \'Add link(s)\' button is present');
        casper.click('button#createlink-create');
        // Verify that the link has been uploaded by going to the content profile provided in the notification
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Link successfully added');
            // Click the first link in the notification message to go to the content profile
            test.assertExists('#oae-notification-container .alert h4 + a', 'The link to the content profile is shown in the notification');
            test.assertSelectorHasText('#oae-notification-container .alert h4 + a', 'http://www.oaeproject.org', 'Notification link value is \'http://www.oaeproject.org\'');
            casper.click('#oae-notification-container .close');
        });
    };

    /**
     * Verify creating multiple links
     */
    var verifyCreateMultipleLinks = function() {
        // Verify the link dump area is there
        test.assertExists('#createlink-link-dump', 'The link dump area is present');
        // Add a couple of links to the textarea
        casper.sendKeys('#createlink-link-dump', 'http://www.oaeproject.org\nhttp://www.google.com');
        // TODO: The casper events aren't properly sent out so the validation will not be triggered.
        //       This causes the next button to remain disabled.
        //       We're removing this state manually for now so we can continue the test.
        casper.evaluate(function() {
            $('#createlink-next').prop('disabled', false);
        });
        // Verify the 'Next' button is present
        test.assertExists('#createlink-next', 'The \'Next\' button is present');
        // Verify the 'Next' button is enabled
        test.assertDoesntExist('#createlink-next:disabled', 'The \'Next\' button is enabled');
        // Go to the next step
        casper.click('#createlink-next');
        // Add the links
        test.assertExists('button#createlink-create', 'The \'Add link(s)\' button is present');
        casper.click('button#createlink-create');
        // Verify that the links have been created
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Links successfully created');
            casper.click('#oae-notification-container .close');
        });
    };

    /**
     * Verify renaming a link
     */
    var verifyRenameLink = function() {
        // Add a link to the textarea
        casper.sendKeys('#createlink-link-dump', 'http://www.oaeproject.org');
        // TODO: The casper events aren't properly sent out so the validation will not be triggered.
        //       This causes the next button to remain disabled.
        //       We're removing this state manually for now so we can continue the test.
        casper.evaluate(function() {
            $('#createlink-next').prop('disabled', false);
        });
        // Go to the next step
        casper.click('#createlink-next');
        // Verify that the jeditable field is present
        test.assertExists('#createlink-modal .jeditable-field', 'The editable link name field is present');
        test.assertSelectorHasText('#createlink-modal .jeditable-field', 'http://www.oaeproject.org', 'Selected link has name \'http://www.oaeproject.org\'');
        casper.click('.jeditable-field');

        casper.waitForSelector('#createlink-modal .jeditable-field form', function() {
            test.assertExists('#createlink-modal .jeditable-field form', 'The link name form is present after click');

            // fill the form
            casper.fill('#createlink-modal .jeditable-field form', {
                'value': 'OAE Project'
            }, true);

            // Verify that the new name is shown in the list
            test.assertSelectorHasText('.jeditable-field', 'OAE Project', 'Renamed link has name \'OAE Project\'');
            // Add the link
            casper.click('button#createlink-create');
            // Verify that the link has been created by going to the content profile provided in the notification
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Link successfully created');
                // Click the first link in the notification message to go to the content profile
                test.assertExists('#oae-notification-container .alert h4 + a', 'The link to the content profile is shown in the notification');
                test.assertSelectorHasText('#oae-notification-container .alert h4 + a', 'OAE Project', 'Notification link value is \'OAE Project\'');
                casper.click('#oae-notification-container .alert h4 + a');
                // Wait a couple of seconds for the pageload
                casper.waitForSelector('#content-clip-container h1', function() {
                    // Verify that the new name is used for the link
                    test.assertSelectorHasText('#content-clip-container h1', 'OAE Project', 'The created link has the correct renamed title');
                });
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test createlink with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);
            uiUtil.openMe();

            // Open the createlink modal
            casper.then(function() {
                casper.echo('# Verify createlink modal', 'INFO');
                openCreateLink();
            });

            // Verify creating a link
            casper.then(function() {
                casper.echo('# Verify creating single link', 'INFO');
                verifyCreateSingleLink();
            });

            // Verify creating multiple links
            casper.then(function() {
                casper.echo('# Verify creating multiple links', 'INFO');
                casper.then(function() {
                    casper.wait(configUtil.modalWaitTime, openCreateLink);
                    casper.then(verifyCreateMultipleLinks);
                });
            });

            uiUtil.openMe();

            // Verify renaming link
            casper.then(function() {
                casper.echo('# Verify renaming link', 'INFO');
                casper.then(openCreateLink);
                casper.then(verifyRenameLink);
            });

            // Log out at the end of the test
            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
