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

casper.test.begin('Widget - Discussion', function(test) {

    /**
     * Verify that all discussion elements are present
     */
    var verifyDiscussionElements = function() {
        casper.waitForSelector('#discussion-topic', function() {
            test.assertExists('#discussion-topic', 'Verify the discussion topic container is present');
            test.assertSelectorHasText('#discussion-topic', 'Talk about all the things!', 'Verify the discussion topic container holds the correct discussion topic');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            discussionUtil.createDiscussion(null, null, null, null, null, function(err, discussionProfile) {
                // Redirect to the discussion profile
                uiUtil.openDiscussionProfile(discussionProfile);

                casper.then(function() {
                    casper.echo('# Verify discussion elements', 'INFO');
                    verifyDiscussionElements();
                });

                // Log out the admin user
                userUtil.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
