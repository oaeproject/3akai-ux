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

casper.test.begin('Widget - Manage access', function(test) {

    /**
     * Open the manage access modal with assertions
     */
    var openManageAccessModal = function() {
        casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
            casper.click('#content-clip-container .oae-clip-content > button');
            casper.waitForSelector('button.content-trigger-manageaccess', function() {
                test.assertExists('button.content-trigger-manageaccess', 'The manage access trigger is present');
                casper.click('button.content-trigger-manageaccess');
                casper.waitUntilVisible('#manageaccess-modal', function() {
                    test.assertVisible('#manageaccess-modal', 'The manage access pane is showing after trigger');
                    casper.click('#content-clip-container .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Verify that the edit content elements are present
     */
    var verifyManageAccessElements = function() {
        // Test overview
        test.assertExists('#manageaccess-modal #manageaccess-overview #manageaccess-overview-visibility', 'Verify that the visibility container is present');
        test.assertExists('#manageaccess-modal #manageaccess-overview #manageaccess-overview-visibility #manageaccess-overview-visibility-container span', 'Verify that the current visiblity setting is shown');
        test.assertExists('#manageaccess-modal #manageaccess-overview #manageaccess-overview-visibility #manageaccess-change-visibility', 'Verify that the visibility setting \'change\' button is shown');
        test.assertExists('#manageaccess-modal #manageaccess-overview #manageaccess-overview-shared', 'Verify that the shared container is showing');
        test.assertExists('#manageaccess-modal #manageaccess-overview #manageaccess-share-add-more', 'Verify that the \'+ Add more\' button is showing');
        test.assertExists('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li', 'Verify that there is at least one member showing in the shared container');
        test.assertExists('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li:first-child select', 'Verify that the list items have a role select element');
        test.assertExists('#manageaccess-modal .modal-footer #manageaccess-overview-footer button[data-dismiss="modal"]', 'Verify that the cancel button is present in the overview');
        test.assertExists('#manageaccess-modal .modal-footer #manageaccess-overview-footer button#manageaccess-overview-save', 'Verify that the \'Save\' button is present in the overview');

        // Test visibility
        casper.click('#manageaccess-modal #manageaccess-overview-visibility #manageaccess-change-visibility');
        test.assertExists('#manageaccess-modal #manageaccess-visibility .oae-large-options-container', 'Verify that the visibility options are present in the visibility view');
        test.assertExists('#manageaccess-modal .modal-footer #manageaccess-visibility-footer button.manageaccess-cancel', 'Verify that the cancel button is present in the visibility view');
        test.assertExists('#manageaccess-modal .modal-footer #manageaccess-visibility-footer button#manageaccess-visibility-save', 'Verify that the \'Save\' button is present in the visibility view');
        casper.click('#manageaccess-modal .modal-footer #manageaccess-visibility-footer button.manageaccess-cancel');

        // Test share
        casper.click('#manageaccess-modal #manageaccess-overview #manageaccess-share-add-more');
        casper.waitForSelector('#manageaccess-modal #manageaccess-share .as-selections input', function() {
            test.assertExists('#manageaccess-modal #manageaccess-share .as-selections input', 'Verify that the autosuggest field is present in the share view');
            test.assertExists('#manageaccess-modal #manageaccess-share #manageaccess-share-role', 'Verify that the role select element is present in the share view');
            test.assertExists('#manageaccess-modal .modal-footer #manageaccess-share-footer button.manageaccess-cancel', 'Verify that the cancel button is present in the share view');
            test.assertExists('#manageaccess-modal .modal-footer #manageaccess-share-footer button#manageaccess-share-update', 'Verify that the \'Add\' button is present in the visibility view');
            casper.click('#manageaccess-modal .modal-footer #manageaccess-share-footer button.manageaccess-cancel');
        });
    };

    /**
     * Verify that content can be edited
     */
    var verifyManageAccess = function(user2, user3) {
        /**
         * Searches for a given user in the managaccess share autosuggest and selects it
         *
         * @param {User}      user    The basic user profile
         * @param {String}    role    The role to assign to the user (viewer or manager);
         */
        var addUser = function(user, role) {
            casper.thenEvaluate(function(user, role) {
                $('#manageaccess-modal #manageaccess-share .as-selections input').val(user.displayName);
                $('#manageaccess-modal #manageaccess-share #manageaccess-share-role').val(role);
            }, user, role);
            // Click the input field to trigger the list
            casper.click('#manageaccess-modal #manageaccess-share .as-selections input');
            // Wait for the list to render suggestions
            casper.waitForSelector('.as-list li', function() {
                // Click the first suggestion in the list
                casper.click('.as-list li:first-child');
            });
        };

        // Change the visibility from public to private
        casper.click('#manageaccess-modal #manageaccess-overview #manageaccess-overview-visibility #manageaccess-change-visibility');
        casper.click('#manageaccess-modal #manageaccess-visibility #oae-visibility-private');
        casper.click('#manageaccess-modal .modal-footer #manageaccess-visibility-footer button#manageaccess-visibility-save');

        // Share the content with user2 (viewer) and user3 (manager)
        casper.click('#manageaccess-modal #manageaccess-overview #manageaccess-share-add-more');
        casper.waitForSelector('#manageaccess-modal #manageaccess-share .as-selections input', function() {
            // Add user2 as a viewer of the content
            casper.then(function() {
                addUser(user2, 'viewer');
            });
            casper.then(function() {
                casper.click('#manageaccess-modal .modal-footer #manageaccess-share-footer button#manageaccess-share-update');
                casper.click('#manageaccess-modal #manageaccess-overview #manageaccess-share-add-more');
            });

            // Add user3 as a manager of the content
            casper.waitForSelector('#manageaccess-modal #manageaccess-share .as-selections input', function() {
                casper.then(function() {
                    addUser(user3, 'manager');
                });
                casper.then(function() {
                    casper.click('#manageaccess-modal .modal-footer #manageaccess-share-footer button#manageaccess-share-update');

                    // Verify the users have been added to the list
                    test.assertExists('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li select[data-id="' + user2.id + '"]', 'Verify that user 2 has been added to the list');
                    test.assertExists('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li select[data-id="' + user3.id + '"]', 'Verify that user 3 has been added to the list');

                    // Verify that user2 and user3 have been added and the correct role is assigned
                    var user2RoleCorrect = casper.evaluate(function(user2) {
                        return $('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li select[data-id="' + user2.id + '"]').val() === 'viewer';
                    }, user2);
                    test.assert(user2RoleCorrect, 'Verify that user 2 will be added as a viewer');
                    var user3RoleCorrect = casper.evaluate(function(user3) {
                        return $('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li select[data-id="' + user3.id + '"]').val() === 'manager';
                    }, user3);
                    test.assert(user3RoleCorrect, 'Verify that user 3 will be added as a manager');

                    // Save the changes and verify they succeeded
                    casper.click('#manageaccess-modal .modal-footer #manageaccess-overview-footer button#manageaccess-overview-save');
                    casper.waitForSelector('#oae-notification-container .alert', function() {
                        test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify that access to the content can be managed');
                        casper.click('#oae-notification-container .close');
                    });
                });
            });
        });
    };

    /**
     * Verify that there needs to be at least one manager on the content
     */
    var verifyAtLeastOneManager = function() {
        casper.wait(configUtil.searchWaitTime, function() {
            // Change all users to viewers
            casper.thenEvaluate(function() {
                $.each($('#manageaccess-modal #manageaccess-overview ul#manageaccess-overview-selected li select'), function(i, select) {
                    $(select).val('viewer');
                    $(select).trigger('change');
                });
            });
            casper.then(function() {
                // Save the changes and verify it fails
                casper.click('#manageaccess-modal .modal-footer #manageaccess-overview-footer button#manageaccess-overview-save');
                casper.waitForSelector('#oae-notification-container .alert', function() {
                    test.assertExists('#oae-notification-container .alert.alert-error', 'Verify that there needs to be at least one manager on the content');
                    casper.click('#oae-notification-container .close');
                });
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create 3 users to test with
        userUtil.createUsers(3, function(user1, user2, user3) {
            // Login with the first user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createLink(null, null, null, null, null, null, null, function(err, linkProfile) {
                uiUtil.openLinkProfile(linkProfile);

                casper.then(function() {
                    casper.echo('# Verify open manage access modal', 'INFO');
                    openManageAccessModal();
                });

                casper.then(function() {
                    casper.echo('# Verify manage access elements', 'INFO');
                    verifyManageAccessElements();
                });

                casper.then(function() {
                    casper.echo('# Verify access can be edited', 'INFO');
                    casper.wait(configUtil.searchWaitTime, function() {
                        verifyManageAccess(user2, user3);
                    });
                });

                casper.then(function() {
                    casper.echo('# Verify at least one manager is present', 'INFO');
                    casper.wait(configUtil.modalWaitTime, openManageAccessModal);
                    casper.then(verifyAtLeastOneManager);
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
