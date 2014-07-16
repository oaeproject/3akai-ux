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

casper.test.begin('Page - Group', function(test) {

    /**
     * Verify that a manager of the group sees the correct buttons in the clips
     *     - Manage access
     *     - Edit details
     *     - Upload new version
     *     - Revisions
     *     - Delete
     */
    var verifyGroupClipButtonsAsManager = function() {
        test.assertExists('#group-clip-container .oae-clip button.oae-trigger-changepic', 'The `Change picture` button is available for managers of a group');
        test.assertExists('#group-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is available for managers of a group');
        test.assertExists('#group-clip-container .oae-clip button.oae-trigger-editgroup', 'The `Edit details` button is available for managers of a group');
    };

    /**
     * Verify that a member of the group sees the correct buttons in the clips
     *     - Details
     */
    var verifyGroupClipButtonsAsMember = function() {
        test.assertExists('#group-clip-container .oae-clip button.oae-trigger-aboutgroup', 'The `Details` button is available for members of a group');
        test.assertDoesntExist('#group-clip-container .oae-clip button.oae-trigger-changepic', 'The `Change picture` button is not available for members of a group');
        test.assertDoesntExist('#group-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is not available for members of a group');
        test.assertDoesntExist('#group-clip-container .oae-clip button.oae-trigger-editgroup', 'The `Edit details` button is not available for members of a group');
    };

    /**
     * Verify that an anonymous user sees the correct buttons in the clips
     *     - Details
     */
    var verifyGroupClipButtonsAsAnonymous = function() {
        test.assertExists('#group-clip-container .oae-clip button.oae-trigger-aboutgroup', 'The `Details` button is available for members of a group');
        test.assertDoesntExist('#group-clip-container .oae-clip button.oae-trigger-changepic', 'The `Change picture` button is not available for members of a group');
        test.assertDoesntExist('#group-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is not available for members of a group');
        test.assertDoesntExist('#group-clip-container .oae-clip button.oae-trigger-editgroup', 'The `Edit details` button is not available for members of a group');
    };

    casper.start(configUtil().tenantUI, function() {
        // Create a couple of users to test with
        var user1 = null;
        var user2 = null;
        userUtil().createUsers(2, function(users) {
            user1 = users[0];
            user2 = users[1];
        });

        // Login with the first user
        casper.then(function() {
            userUtil().doLogIn(user1.username, configUtil().defaultUserPassword);
        });

        // Create a group, go to the group profile page and verify the clip buttons as a manager
        var groupURL = null;
        casper.then(function() {
            casper.echo('Verify group clip buttons as a manager', 'INFO');
            groupUtil().createGroup([user2.id], [], function(group) {
                groupURL = configUtil().tenantUI + group.profilePath;
                casper.thenOpen(groupURL, function() {
                    casper.waitForSelector('#group-clip-container .oae-clip-content > button', function() {
                        verifyGroupClipButtonsAsManager();
                    });
                });
                casper.then(function() {
                    userUtil().doLogOut();
                });
            });
        });

        casper.then(function() {
            casper.echo('Verify group clip buttons as a member', 'INFO');
            userUtil().doLogIn(user2.username, configUtil().defaultUserPassword);
            casper.thenOpen(groupURL, function() {
                casper.waitForSelector('#group-clip-container .oae-clip-content > button', function() {
                    verifyGroupClipButtonsAsMember();
                });
            });
            casper.then(function() {
                userUtil().doLogOut();
            });
        });

        casper.then(function() {
            casper.echo('Verify group clip buttons as an anonymous user', 'INFO');
            casper.thenOpen(groupURL, function() {
                casper.waitForSelector('#group-clip-container .oae-clip-content > button', function() {
                    verifyGroupClipButtonsAsAnonymous();
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
