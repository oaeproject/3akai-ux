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

casper.test.begin('Widget - Network', function(test) {

    /**
     * Verify following a user
     */
    var verifyFollowingUser = function() {
        casper.waitForSelector('#user-clip-left-container h1', function() {
            // Verify the follow button is present
            test.assertExists('button.user-follow', 'Verify the `Follow` button is present');
            // Verify the user can be followed
            casper.click('button.user-follow');
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify a user can be followed');
                test.assertNotVisible('button.user-follow', 'Verify follow button is removed after following a user');
            });
        });
    };

    /**
     * Verify that the view mode can be changed through the list options
     */
    var verifyNetworkViewMode = function() {
        // Toggle the list options
        casper.click('.oae-list-header-toggle');
        // Verify compact list
        casper.click('#network-widget .oae-list-header-actions button[data-type="oae-list-compact"]');
        test.assertExists('.oae-list.oae-list-compact', 'Network can be switched to compact view');
        // Verify details list
        casper.click('#network-widget .oae-list-header-actions button[data-type="oae-list-details"]');
        test.assertExists('.oae-list.oae-list-details', 'Network can be switched to details view');
        // Switch back to grid view
        casper.click('#network-widget .oae-list-header-actions button[data-type="oae-list-grid"]');
        test.assertExists('.oae-list.oae-list-grid', 'Network can be switched to grid view');
    };

    /**
     * Verify that all the network elements are present
     */
    var verifyNetworkElements = function() {
        casper.waitForSelector('#network-widget .oae-list.oae-list-grid li', function() {
            // Verify there is a dummy list item with action buttons
            test.assertExists('#network-widget #network-following .oae-list li:first-child', 'Initial dummy list item is present');
            // Verify dummy list item has a `Find people` button
            test.assertExists('#network-widget #network-following .oae-list li:first-child a[href="/search/all?types=user"]', 'The first list item has a \'Find people\' link button');
            // Verify that no other list items are present
            test.assertDoesntExist('#network-widget #network-following .oae-list li:nth-child(2)', 'No other list items are present');
            // Verify that the network widget has a follower and following tab
            test.assertExists('#network-widget .nav li.active a[href="#network-following"]', 'Verify following tab is present and active by default');
            test.assertExists('#network-widget .nav li a[href="#network-followers"]', 'Verify followers tab is present');
            // Verify switching to the followers tab
            casper.click('#network-widget .nav li a[href="#network-followers"]');
            test.assertExists('#network-widget .nav li.active a[href="#network-followers"]', 'Verify followers tab is active after click');
            // Give infinite scroll time to process
            casper.waitForSelector('#network-widget #network-followers .alert', function() {
                // Verify there is no dummy list item on the followers tab but an alert instead
                test.assertDoesntExist('#network-widget #network-followers .oae-list li:first-child', 'Verify there is no initial dummy list item present in the followers tab');
                test.assertExists('#network-widget #network-followers .alert', 'Verify there is an alert when no followers are currently available');
                // Verify switching back to the following tab
                casper.click('#network-widget .nav li a[href="#network-following"]');
                test.assertExists('#network-widget .nav li.active a[href="#network-following"]', 'Verify following tab is active after click');
                // Verify `Find people` button shows the search page
                casper.click('#network-widget #network-following .oae-list li:first-child a[href="/search/all?types=user"]');
                casper.waitForSelector('#search-clip-container', function() {
                    test.assertExists('#search-clip-container', 'The search people page can be triggered from the dummy list item');
                    uiUtil.openMyNetwork();
                    casper.then(function() {
                        casper.waitForSelector('#network-widget .oae-list.oae-list-grid li', function() {
                            // Verify list options are there
                            test.assertExists('#network-widget .oae-list-header-actions', 'The list options are present');
                            // Verify list options contain a checkbox that selects all
                            test.assertExists('#network-widget .oae-list-header-actions input[type="checkbox"]', 'The \'Select all\' checkbox is present in the list options');
                            // Verify list options contain a `unfollow` button
                            test.assertExists('#network-widget .oae-list-header-actions .oae-trigger-unfollow', 'The `Stop following` button is present in the list options');
                            // Verify list options contain a switch view button
                            test.assertExists('#network-widget .oae-list-header-actions button[data-type="oae-list-compact"]', 'The \'Compact\' list view button is present');
                            test.assertExists('#network-widget .oae-list-header-actions button[data-type="oae-list-details"]', 'The \'Details\' list view button is present');
                            test.assertExists('#network-widget .oae-list-header-actions button[data-type="oae-list-grid"]', 'The \'Grid\' list view button is present');
                            // Verify list options contain a search field
                            test.assertExists('#network-widget .oae-list-header-search .oae-list-header-search-query', 'The search box is present');
                        });
                    });
                });
            });
        });
    };

    /**
     * Verify that the network can be searched
     */
    var verifyNetworkSearch = function(user) {
        // Search for something that doesn't match any results
        casper.fill('form.form-search', {
            'search-query': '---'
        }, false);
        casper.click('form.form-search button[type="submit"]');
        // Verify that no results come back and a message is shown
        casper.waitForSelector('.oae-list .alert-info', function() {
            test.assertExists('.oae-list .alert-info', 'No results are returned for non-matching search and a message is shown');
            // Wait 2 seconds before triggering new search
            casper.wait(configUtil.searchWaitTime, function() {
                // Search which should return 1 result
                casper.fill('form.form-search', {
                    'search-query': user.displayName
                }, false);
                casper.click('form.form-search button[type="submit"]');
                // Verify one search result comes back
                casper.waitForSelector('.oae-list li', function() {
                    test.assertExists('.oae-list li', '1 result is returned for \'' + user.displayName + '\'');
                    test.assertSelectorHasText('.oae-list li .oae-tile-metadata a', user.displayName, 'The returned user has the name \'' + user.displayName + '\'');
                    // Reset the form
                    casper.fill('form.form-search', {
                        'search-query': ''
                    }, false);
                    casper.click('form.form-search button[type="submit"]');
                });
            });
        });
    };

    /**
     * Verify that current user has a specified follower
     *
     * @param  {User}           user            The expected first user in the list of users following the current user
     */
    var verifyUserHasFollower = function(user) {
        casper.waitForSelector('#network-widget .nav li a[href="#network-followers"]', function() {
            casper.click('#network-widget .nav li a[href="#network-followers"]');
            // Give infinite scroll time to process
            casper.waitForSelector('#network-widget #network-followers .oae-list li:first-child', function() {
                test.assertExists('#network-widget #network-followers .oae-list li:first-child', 'Verify user has a follower');
                test.assertSelectorHasText('#network-widget #network-followers .oae-list li .oae-tile-metadata a', user.displayName, 'The follower has the name \'' + user.displayName + '\'');
                test.assertSelectorHasText('#network-widget #network-followers .oae-list li .oae-tile-metadata small', user.tenant.displayName, 'The follower is a tenant of \'' + user.tenant.displayName + '\'');
            });
        });
    };

    /**
     * Verify that current user is following a specified follower
     *
     * @param  {User}           user            The expected first user in the list of users followed by the current user
     */
    var verifyUserHasFollowing = function(user) {
        // Give infinite scroll time to process
        casper.waitForSelector('#network-widget #network-following .oae-list li:nth-child(2)', function() {
            test.assertExists('#network-widget #network-following .oae-list li:nth-child(2)', 'Verify user\'s following network is not empty');
            test.assertSelectorHasText('#network-widget #network-following .oae-list li:nth-child(2) .oae-tile-metadata a', user.displayName, 'The followed user has the name \'' + user.displayName + '\'');
            test.assertSelectorHasText('#network-widget #network-following .oae-list li:nth-child(2) .oae-tile-metadata small', user.tenant.displayName, 'The followed user is a tenant of \'' + user.tenant.displayName + '\'');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create users for testing
        userUtil.createUsers(3, function(user1, user2, user3) {
            // Sign in with the first user and go to the network page
            userUtil.doLogIn(user1.username, user1.password);
            uiUtil.openMyNetwork();

            // Verify that all expected network elements are present
            casper.then(function() {
                casper.echo('# Verify network elements', 'INFO');
                verifyNetworkElements();
            });

            // Verify that the view modes can be changed
            casper.then(function() {
                casper.echo('# Verify network view modes', 'INFO');
                verifyNetworkViewMode();
            });

            // Verify that a user can follow another user
            casper.then(function() {
                casper.echo('# Verify following a user', 'INFO');
                // user1 follows user2
                followUtil.follow(user2.id, function() {
                    // Refresh the network page
                    uiUtil.openMyNetwork();
                    // Verify that user2 is in the list of users followed by user1
                    verifyUserHasFollowing(user2);
                });
            });

            // Verify that the first user is a follower of the second user
            casper.then(function() {
                userUtil.doLogOut();
                userUtil.doLogIn(user2.username, user2.password);
                uiUtil.openMyNetwork();
                // Verify that user1 is in the list of users following user2
                verifyUserHasFollower(user1);
            });

            // Follow the first user as the second user
            casper.then(function() {
                // user2 follows user1
                followUtil.follow(user1.id, function() {
                    // Refresh the network page
                    uiUtil.openMyNetwork();
                    // Verify that user1 is in the list of users followed by user2
                    verifyUserHasFollowing(user1);
                });
            });

            // Verify following behavior for unrelated user hasn't changed
            uiUtil.openUserProfile(user3);
            casper.then(verifyFollowingUser);

            // Verify searching the network
            uiUtil.openMyNetwork();
            casper.then(function() {
                casper.echo('# Verify network search', 'INFO');
                casper.waitForSelector('#network-widget .oae-list.oae-list-grid li', function() {
                    casper.wait(configUtil.searchWaitTime, function() {
                        verifyNetworkSearch(user1);
                    });
                });
            });

            // Log out at the end of the test
            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
