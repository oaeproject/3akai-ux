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

casper.test.begin('Macro - List Metadata', function(test) {

    /**
     * Verify the correct metadata is shown in a list item
     *
     * @param  {Content|Discussion|Group|User}    entityData    Entity for which the list item metadata should be validated
     */
    var verifyListItem = function(entityData) {
        casper.waitForSelector('ul.oae-list li[data-id="' + entityData.id + '"]', function() {
            test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the list item');
            // Verify the visibility icon
            if (entityData.resourceType === 'user') {
                // A user doesn't have a visibility icon
                test.assertDoesntExist('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata .fa-oae-' + entityData.visibility, 'Verify the visibility icon is not present in the list item metadata');
            } else {
                test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata .fa-oae-' + entityData.visibility, 'Verify the visibility icon is present in the list item metadata');
            }
            // Verify the display name
            test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the list item metadata');
            test.assertSelectorHasText('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata h3', entityData.displayName, 'Verify the correct title is shown in the list item metadata');
            // Verify the subtext
            test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the list item metadata');
            if (entityData.resourceType === 'user') {
                test.assertSelectorHasText('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata small', entityData.tenant.displayName, 'Verify the small description in the list item metadata reads \'' + entityData.tenant.displayName + '\'');
            } else if (entityData.resourceType === 'group') {
                test.assertSelectorHasText('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata small', 'Group', 'Verify the small description in the list item metadata reads \'Group\'');
            } else if (entityData.resourceType === 'content') {
                var description = casper.evaluate(function(entityData) {
                    return require('oae.api.content').getMimeTypeDescription(entityData);
                }, entityData);

                casper.waitFor(function() {
                    return description !== null;
                }, function() {
                    test.assertSelectorHasText('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata small', description, 'Verify the small description in the list item metadata reads \'' + description + '\'');
                });
            } else if (entityData.resourceType === 'discussion') {
                test.assertSelectorHasText('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata small', 'Discussion', 'Verify the small description in the list item metadata reads \'Discussion\'');
            }
        });
    };

    casper.start(configUtil().tenantUI, function() {
        // Create some users to test with
        var user1 = null;
        var user2 = null;
        userUtil().createUsers(2, function(user1, user2) {
            // Sign in with the first user
            userUtil().doLogIn(user1.username, user1.password);

            // Follow user2
            followUtil().follow(user2.id, function() {
                // Create an image
                contentUtil().createFile(null, null, null, null, null, null, function(err, contentProfile1) {
                    // Create a video
                    contentUtil().createFile(null, null, null, 'tests/casperjs/data/sample-video.mp4', null, null, function(err, contentProfile2) {
                        // Create an archive
                        contentUtil().createFile(null, null, null, 'tests/casperjs/data/apereo.zip', null, null, function(err, contentProfile3) {
                            // Create a link
                            contentUtil().createLink(null, null, null, 'http://www.oaeproject.org', null, null, function(err, linkProfile) {
                                // Create a collaborative document
                                contentUtil().createCollabDoc(null, null, null, null, null, function(err, collabdocProfile) {
                                    // Create a discussion
                                    discussionUtil().createDiscussion(null, null, null, null, null, function(err, discussionProfile) {
                                        // Create a group
                                        groupUtil().createGroup(null, null, null, null, null, null, function(err, groupProfile) {

                                            // Verify that all content items are displayed correctly in the content library
                                            uiUtil().openMyLibrary();
                                            casper.then(function() {
                                                casper.echo('Verify content item metadata', 'INFO');
                                                verifyListItem(contentProfile1);
                                                verifyListItem(contentProfile2);
                                                verifyListItem(contentProfile3);
                                                verifyListItem(linkProfile);
                                                verifyListItem(collabdocProfile);
                                            });

                                            // Verify that a discussion is displayed correctly in the discussion library
                                            uiUtil().openMyDiscussions();
                                            casper.then(function() {
                                                casper.echo('Verify discussion list item metadata', 'INFO');
                                                verifyListItem(discussionProfile);
                                            });

                                            // Verify that a group is displayed correctly in the group library
                                            uiUtil().openMyGroups();
                                            casper.then(function() {
                                                casper.echo('Verify group list item metadata', 'INFO');
                                                verifyListItem(groupProfile);
                                            });

                                            // Verify that a user is displayed correctly in the network
                                            uiUtil().openMyNetwork();
                                            casper.then(function() {
                                                casper.echo('Verify user list item metadata', 'INFO');
                                                verifyListItem(user2);
                                            });

                                            userUtil().doLogOut();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
