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

casper.test.begin('Page - Discussion', function(test) {

    /**
     * Verify that a manager of the discussion sees the correct buttons in the clips
     *     - Manage access
     *     - Edit details
     *     - Delete
     */
    var verifyDiscussionClipButtonsAsManager = function() {
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is available for managers of a discussion');
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-editdiscussion', 'The `Edit details` button is available for managers of a discussion');
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is available for managers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-discussionshared', 'The `Shared with` button is not available for managers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-discussiondetails', 'The `Details` button is not available for managers of a discussion');
    };

    /**
     * Verify that a member of the discussion sees the correct buttons in the clips
     *     - Download
     *     - Shared with
     *     - Details
     */
    var verifyDiscussionClipButtonsAsViewer = function() {
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-discussionshared', 'The `Shared with` button is available for viewers of a discussion');
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-discussiondetails', 'The `Details` button is available for viewers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is not available for viewers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-editdiscussion', 'The `Edit details` button is not available for viewers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is not available for viewers of a discussion');
    };

    /**
     * Verify that an anonymous user sees the correct buttons in the clips
     *     - Download
     *     - Shared with
     *     - Details
     */
    var verifyDiscussionClipButtonsAsAnonymous = function() {
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-discussionshared', 'The `Shared with` button is available for anonymous viewers of a discussion');
        test.assertExists('#discussion-clip-container .oae-clip button.oae-trigger-discussiondetails', 'The `Details` button is available for anonymous viewers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-manageaccess', 'The `Manage access` button is not available for anonymous viewers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-editdiscussion', 'The `Edit details` button is not available for anonymous viewers of a discussion');
        test.assertDoesntExist('#discussion-clip-container .oae-clip button.oae-trigger-deleteresource', 'The `Delete` button is not available for anonymous viewers of a discussion');
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

        // Create a discussion item, go to the discussion profile page and verify the clip buttons as a manager
        var discussionURL = null;
        casper.then(function() {
            casper.echo('Verify clip buttons as a manager', 'INFO');
            discussionUtil().createDiscussion(null, [user2.id], function(discussion) {
                discussionURL = configUtil().tenantUI + discussion.profilePath;
                casper.thenOpen(discussionURL, function() {
                    casper.waitForSelector('#discussion-clip-container .oae-clip-content > button', function() {
                        verifyDiscussionClipButtonsAsManager();
                    });
                });
                casper.then(function() {
                    userUtil().doLogOut();
                });
            });
        });

        casper.then(function() {
            casper.echo('Verify clip buttons as a viewer', 'INFO');
            userUtil().doLogIn(user2.username, configUtil().defaultUserPassword);
            casper.thenOpen(discussionURL, function() {
                casper.waitForSelector('#discussion-clip-container .oae-clip-content > button', function() {
                    verifyDiscussionClipButtonsAsViewer();
                });
            });
            casper.then(function() {
                userUtil().doLogOut();
            });
        });

        casper.then(function() {
            casper.echo('Verify clip buttons as an anonymous user', 'INFO');
            casper.thenOpen(discussionURL, function() {
                casper.waitForSelector('#discussion-clip-container .oae-clip-content > button', function() {
                    verifyDiscussionClipButtonsAsAnonymous();
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
