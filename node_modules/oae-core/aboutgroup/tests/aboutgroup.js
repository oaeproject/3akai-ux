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

casper.test.begin('Widget - About Group', function(test) {

    /**
     * Open the about group modal with assertions
     */
    var openAboutGroup = function() {
        casper.waitForSelector('#group-clip-container .oae-clip-content > button', function() {
            casper.click('#group-clip-container .oae-clip-content > button');
            test.assertExists('.oae-trigger-aboutgroup', 'About group trigger exists');
            casper.click('.oae-trigger-aboutgroup');
            casper.waitUntilVisible('#aboutgroup-modal', function() {
                test.assertVisible('#aboutgroup-modal', 'About group pane is showing after trigger');
                casper.click('#group-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Verify that all elements for files are present in the about group modal
     *
     * @param  {Group}   groupProfile    The group profile of the created group
     * @param  {User}    user1           The user profile of the user that created the group
     */
    var verifyAboutGroupElements = function(groupProfile, user1) {
        test.assertExists('#aboutgroup-modal .modal-header h3', 'Verify that the modal has a header');
        test.assertSelectorHasText('#aboutgroup-modal .modal-header h3', 'About', 'Verify that the modal header reads \'About\'');
        // TODO: Enable commented out tests when https://github.com/oaeproject/Hilary/pull/1009 has been merged
        // test.assertExists('#aboutgroup-modal .modal-body ul.oae-list li', 'Verify that the modal shows who added the group');
        // test.assertExists('#aboutgroup-modal .modal-body ul.oae-list li .oae-listitem-primary-thumbnail', 'Verify that the modal shows the picture of the user who added the group');
        // test.assertExists('#aboutgroup-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', 'Verify that the modal shows the name of the user who added the group');
        // test.assertSelectorHasText('#aboutgroup-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', user1.displayName, 'Verify that the correct name is shown');
        // test.assertExists('#aboutgroup-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'Verify that the modal shows the tenant of the user who added the group');
        // test.assertSelectorHasText('#aboutgroup-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'CasperJS Tenant', 'Verify that the metadata shows the tenant name');
        test.assertExists('#aboutgroup-modal .modal-body #aboutgroup-metadata-container #aboutgroup-title', 'Verify that the modal shows title of the group');
        test.assertSelectorHasText('#aboutgroup-modal .modal-body #aboutgroup-metadata-container #aboutgroup-title', groupProfile.displayName, 'Verify that the correct group title is shown');
        // test.assertExists('#aboutgroup-modal .modal-body #aboutgroup-metadata-container time', 'Verify that the modal shows when the group was added');
        test.assertExists('#aboutgroup-modal .modal-body #aboutgroup-metadata-container #aboutgroup-description', 'Verify that the modal shows the description of the group');
        test.assertSelectorHasText('#aboutgroup-modal .modal-body #aboutgroup-metadata-container #aboutgroup-description', groupProfile.description, 'Verify that the correct group description is shown');
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(2, function(user1, user2) {
            // Login with the first user
            userUtil.doLogIn(user1.username, user1.password);

            casper.then(function() {
                // Create a group
                groupUtil.createGroup(null, null, null, null, null, null, function(err, groupProfile) {
                    // Log out from user 1
                    userUtil.doLogOut();

                    // Log in with user 2 to start the tests
                    userUtil.doLogIn(user2.username, user2.password);
                    uiUtil.openGroupProfile(groupProfile);

                    casper.then(function() {
                        casper.echo('Verify open about group modal', 'INFO');
                        openAboutGroup();
                    });

                    casper.then(function() {
                        casper.echo('Verify about group elements', 'INFO');
                        verifyAboutGroupElements(groupProfile, user1);
                    });

                    userUtil.doLogOut();
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
