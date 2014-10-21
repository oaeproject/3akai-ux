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

casper.test.begin('Widget - Delete resources', function(test) {

    /**
     * Open the delete resources modal with assertions
     *
     * @param {Object}    resourceProfile    The profile object of the resource to delete
     */
    var verifyDeleteResourcesModal = function(resourceProfile) {
        casper.waitForSelector('#contentlibrary-widget li[data-id="' + resourceProfile.id + '"] .oae-list-grid-item input[type="checkbox"]', function() {
            casper.click('#contentlibrary-widget li[data-id="' + resourceProfile.id + '"] .oae-list-grid-item input[type="checkbox"]');
            test.assertExists('#contentlibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources:not([disabled])', 'The delete resources button is enabled');
            casper.click('#contentlibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources');
            casper.waitUntilVisible('#deleteresources-modal', function() {
                test.assertVisible('#deleteresources-modal', 'The delete resources pane is showing after trigger');
                casper.click('#contentlibrary-widget li[data-id="' + resourceProfile.id + '"] .oae-list-grid-item input[type="checkbox"]');
            });
        });
    };

    /**
     * Open the delete resources modal without assertions
     *
     * @param {Object}    resourceProfile    The profile object of the resource to delete
     */
    var openDeleteResourcesModal = function(resourceProfile) {
        casper.waitForSelector('#contentlibrary-widget li[data-id="' + resourceProfile.id + '"] .oae-list-grid-item input[type="checkbox"]', function() {
            casper.click('#contentlibrary-widget li[data-id="' + resourceProfile.id + '"] .oae-list-grid-item input[type="checkbox"]');
            casper.click('#contentlibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources');
            casper.waitUntilVisible('#deleteresources-modal', function() {
                casper.click('#contentlibrary-widget li[data-id="' + resourceProfile.id + '"] .oae-list-grid-item input[type="checkbox"]');
            });
        });
    };

    /**
     * Verify that the delete resources elements are present
     */
    var verifyDeleteResourcesElements = function() {
        test.assertExists('#deleteresources-modal .modal-body h4', 'Verify that a warning header is shown');
        test.assertExists('#deleteresources-modal .modal-body ul.oae-list li', 'Verify that a list of resources to delete is shown');
        test.assertExists('#deleteresources-modal .modal-body #deleteresources-manage-delete-library', 'Verify that the button to remove resources from the library only is showing');
        test.assertExists('#deleteresources-modal .modal-body #deleteresources-manage-delete-system', 'Verify that the button to remove resources from the system is showing');
    };

    /**
     * Verify that deleting resources from the library with another manager on the content succeeds.
     */
    var verifyDeleteResourcesFromLibrary = function() {
        casper.waitForSelector('#deleteresources-modal .modal-body #deleteresources-manage-delete-library', function() {
            casper.click('#deleteresources-modal .modal-body #deleteresources-manage-delete-library');
            // Verify that deleting the item succeeded
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify that deleting resources from the library with another manager on the content succeeds');
                casper.click('#oae-notification-container .close');
            });
        });
    };

    /**
     * Verify that deleting resources from the library as the only manager does not succeed.
     */
    var verifyDeleteResourcesFromLibraryAsOnlyManager = function() {
        casper.waitForSelector('#deleteresources-modal .modal-body #deleteresources-manage-delete-library', function() {
            casper.click('#deleteresources-modal .modal-body #deleteresources-manage-delete-library');
            // Verify that deleting the item succeeded
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertExists('#oae-notification-container .alert.alert-error', 'Verify that a content item with only one manager cannot be removed from the library');
                casper.click('#oae-notification-container .close');
            });
        });
    };

    /**
     * Verify that resources can be deleted from the system
     */
    var verifyDeleteResourcesFromSystem = function() {
        casper.waitForSelector('#deleteresources-modal .modal-body #deleteresources-manage-delete-library', function() {
            casper.click('#deleteresources-modal .modal-body #deleteresources-manage-delete-system');
            // Verify that deleting the item succeeded
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify that deleting resources from the system succeeds.');
                casper.click('#oae-notification-container .close');
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test with
        userUtil.createUsers(2, function(user1, user2) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createLink(null, null, null, null, [user2.id], null, null, function(err, link1Profile) {
                contentUtil.createLink(null, null, null, null, null, null, null, function(err, link2Profile) {
                    contentUtil.createLink(null, null, null, null, null, null, null, function(err, link3Profile) {
                        // Open my library
                        uiUtil.openMyLibrary();

                        // Verify that the delete resources modal opens
                        casper.then(function() {
                            casper.echo('# Verify open delete resources modal', 'INFO');
                            verifyDeleteResourcesModal(link1Profile);
                        });

                        // Verify that the delete resources elements are present
                        casper.then(function() {
                            casper.echo('# Verify delete resources elements', 'INFO');
                            verifyDeleteResourcesElements();
                        });

                        // Verify that content with another manager can be deleted from my library
                        casper.then(function() {
                            casper.echo('# Verify deleting resources from the library succeeds for content with another manager', 'INFO');
                            verifyDeleteResourcesFromLibrary();
                        });

                        // Verify that as the only manager I cannot remove content from my library
                        uiUtil.openMyLibrary();
                        casper.then(function() {
                            casper.echo('# Verify deleting resources from the library fails for content with only me as a manager', 'INFO');
                            openDeleteResourcesModal(link2Profile);
                            verifyDeleteResourcesFromLibraryAsOnlyManager();
                        });

                        // Verify deleting content from the system
                        uiUtil.openMyLibrary();
                        casper.then(function() {
                            casper.echo('# Verify deleting resources from the system', 'INFO');
                            openDeleteResourcesModal(link3Profile);
                            verifyDeleteResourcesFromSystem();
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
