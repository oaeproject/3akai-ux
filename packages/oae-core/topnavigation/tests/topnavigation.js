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

casper.test.begin('Widget - Top navigation', function(test) {

    /**
     * Verify the top navigation elements are present as an anonymous user
     */
    var verifyAnonymousTopNavigation = function() {
        casper.waitForSelector('.oae-trigger-register', function() {
            // Verify that the signup button is present
            test.assertExists('.oae-trigger-register', 'The \'Sign up\' button is present');
            // Verify that the institutional logo is present
            test.assertExists('.oae-institutional-logo', 'The institutional logo is present');
            // Verify that the search box is present
            test.assertExists('form#topnavigation-search-form', 'The search form is present');
            test.assertExists('form#topnavigation-search-form input#topnavigation-search-query', 'The search input field is present');
            test.assertExists('form#topnavigation-search-form button[type="submit"]', 'The search submit button is present');
            // Verify that the sign in button and form is present
            test.assertExists('#topnavigation-signin', 'The sign in button is present');
            // Click the sign in button and verify that all form elements are present
            casper.click('#topnavigation-signin');
            test.assertExists('form#topnavigation-signin-form', 'The sign in form is present after click on sign in button');
            test.assertExists('form#topnavigation-signin-form #topnavigation-signin-username', 'The username field is present');
            test.assertExists('form#topnavigation-signin-form #topnavigation-signin-password', 'The password field is present');
            test.assertExists('form#topnavigation-signin-form button[type="submit"]', 'The form submit button is present');
            test.assertExists('form#topnavigation-signin-form button.oae-trigger-register', 'The \'Sign up\' link is present');
            // Verify that there is a container for external log in options
            test.assertExists('#topnavigation-signin-external', 'The external log in container is present');
            // Close the sign in pop-over
            casper.click('#topnavigation-signin');
        });
    };

    /**
     * Verify the log in functionality and validation
     *     - Submit empty form
     *     - Submit form without password
     *     - Submit form without username
     *     - Attempt login with correct values
     *
     * @param  {User}  user   The user profile of the user to test with
     */
    var verifyLogin = function(user) {
        // Open sign in form
        casper.click('#topnavigation-signin');
        // Submit empty form
        casper.fill('form#topnavigation-signin-form', {
            'topnavigation-signin-username': '',
            'topnavigation-signin-password': ''
        }, false);
        casper.click('#topnavigation-signin-button');
        // Verify that an error label is shown
        test.assertExists('#topnavigation-signin-username', 'Successfully validated empty form - username');
        test.assertExists('#topnavigation-signin-password', 'Successfully validated empty form - password');

        // Submit form without password
        casper.fill('form#topnavigation-signin-form', {
            'topnavigation-signin-username': user.username,
            'topnavigation-signin-password': ''
        }, false);
        casper.click('#topnavigation-signin-button');
        // Verify that an error label is shown
        test.assertExists('#topnavigation-signin-password', 'Successfully validated form without password');

        // Submit form without username
        casper.fill('form#topnavigation-signin-form', {
            'topnavigation-signin-username': '',
            'topnavigation-signin-password': 'password'
        }, false);
        casper.click('#topnavigation-signin-button');
        // Verify that an error label is shown
        test.assertExists('#topnavigation-signin-username', 'Successfully validated form without username');

        // Attempt login with incorrect values
        casper.fill('form#topnavigation-signin-form', {
            'topnavigation-signin-username': 'incorrect',
            'topnavigation-signin-password': 'values'
        }, false);
        casper.click('#topnavigation-signin-button');
        // Verify that an error label is shown
        test.assertExists('#topnavigation-signin-username', 'Successfully validated form with incorrect credentials');

        // Attempt login with correct values
        casper.fill('form#topnavigation-signin-form', {
            'topnavigation-signin-username': user.username,
            'topnavigation-signin-password': user.password
        }, false);
        casper.click('#topnavigation-signin-button');
        casper.waitForSelector('#me-clip-container h1', function() {
            test.assertExists('#me-clip-container h1', 'Successfully logged in through the top navigation');
        });
    };

    /**
     * Verify the top navigation elements are present as a logged in user
     */
    var verifyLoggedInTopNavigation = function() {
        casper.waitForSelector('#topnavigation-left', function() {
            // Verify that the home button is present
            test.assertExists('#topnavigation-left a[href="/"]', 'The \'Home\' button is present');
            // Verify that the notifications button is present
            test.assertExists('#topnavigation-left button.oae-trigger-notifications', 'The \'Notifications\' button is present');
            // Verify that the search box is present
            test.assertExists('form#topnavigation-search-form', 'The search form is present');
            test.assertExists('form#topnavigation-search-form input#topnavigation-search-query', 'The search input field is present');
            test.assertExists('form#topnavigation-search-form button[type="submit"]', 'The search submit button is present');
            // Verify that the logout button is present
            test.assertExists('#topnavigation-right form[action="/api/auth/logout"] button', 'The \'Sign out\' button is present');
            casper.click('#topnavigation-right form[action="/api/auth/logout"] button');
            casper.waitForSelector('#topnavigation-signin', function() {
                test.assertDoesntExist('button#topnavigation-signout', 'Successfully logged out through the top navigation');
            });
        });
    };

    /**
     * Verifies the search through the top navigation
     */
    var verifyTopNavigationSearch = function() {
        // Fill the search form
        casper.fill('form#topnavigation-search-form', {
            'topnavigation-search-query': 'Apereo OAE'
        });
        // Submit the search form
        casper.click('button#topnavigation-search-icon');
        // Wait for the search page to load
        casper.waitForSelector('#search-query', function() {
            // Verify that the search query got through to the search page
            test.assertEquals(casper.getCurrentUrl().split('/')[4], 'Apereo OAE', 'The search query \'Apereo OAE\' is showing on the search page');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test with
        userUtil.createUsers(1, function(user1) {
            // Verify the top navigation elements as an anonymous user
            casper.then(function() {
                casper.echo('# Verify top navigation elemens as an anonymous user', 'INFO');
                verifyAnonymousTopNavigation();
            });

            // Log in
            casper.then(function() {
                casper.echo('# Verify logging in through the top navigation', 'INFO');
                verifyLogin(user1);
            });

            // Verify the top navigation elements as a logged in user
            casper.then(function() {
                casper.echo('# Verify top navigation elemens as a logged in user', 'INFO');
                verifyLoggedInTopNavigation();
            });

            // Verify the top navigation search
            casper.then(function() {
                casper.echo('# Verify top navigation search', 'INFO');
                verifyTopNavigationSearch();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
