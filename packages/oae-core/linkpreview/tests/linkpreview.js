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

casper.test.begin('Widget - Link preview', function(test) {

    /**
     * Verifies that the link is shown in an iframe on the content profile
     */
    var verifyLinkPreview = function() {
        casper.waitForSelector('#linkpreview-container', function() {
            test.assertExists('#linkpreview-container', 'The link preview container is present');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(1, function(user1) {
            // Log in with that user
            userUtil.doLogIn(user1.username, user1.password);

            contentUtil.createLink(null, null, null, null, null, null, null, function(err, linkProfile) {
                uiUtil.openLinkProfile(linkProfile);

                // Verify default previews
                casper.then(function() {
                    casper.echo('# Verify link preview elements present', 'INFO');
                    verifyLinkPreview();
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
