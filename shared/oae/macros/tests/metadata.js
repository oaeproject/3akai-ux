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
     * Verify the correct metadata is shown in list items
     *
     * @param  {Object}    entityData    Entity for which the metadata should be checked
     */
    var verifyContentListItem = function(entityData) {
        test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the list item');
        // A user doesn't have a visibility icon
        if (entityData.resourceType === 'user') {
            test.assertDoesntExist('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is not present in the list item metadata');
        } else {
            test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is present in the list item metadata');
        }
        test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the list item metadata');
        test.assertSelectorHasText('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata h3', entityData.displayName, 'Verify the correct title is shown in the list item metadata');
        test.assertExists('.oae-list li[data-id="' + entityData.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the list item metadata');

        // Depending on the type of resource, the metadata shows a different description of it
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
            userUtil().doLogIn(user1.username, user1.password);
        });

        casper.then(function() {
            // Follow user 2
            followUtil().follow(user2.id, function() {
                // Create an image
                contentUtil().createFile(null, null, null, function(content1Profile) {
                    // Create a video
                    contentUtil().createFile('tests/casperjs/data/sample-video.mp4', null, null, function(content2Profile) {
                        // Create an archive
                        contentUtil().createFile('tests/casperjs/data/apereo.zip', null, null, function(content3Profile) {
                            // Create a link
                            contentUtil().createLink('http://www.oaeproject.org', null, null, function(linkProfile) {
                                // Create a collaborative document
                                collabDocUtil().createCollabDoc(null, null, function(collabdocProfile) {
                                    // Create a discussion
                                    discussionUtil().createDiscussion(null, null, function(discussionProfile) {
                                        // Create a group
                                        groupUtil().createGroup([], [], function(groupProfile) {

                                            casper.thenOpen(configUtil().tenantUI + '/me/library', function() {
                                                casper.echo('Verify image list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + content1Profile.id + '"]', function() {
                                                    verifyContentListItem(content1Profile);
                                                });
                                            });

                                            casper.then(function() {
                                                casper.echo('Verify video list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + content1Profile.id + '"]', function() {
                                                    verifyContentListItem(content2Profile);
                                                });
                                            });

                                            casper.then(function() {
                                                casper.echo('Verify archive list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + content1Profile.id + '"]', function() {
                                                    verifyContentListItem(content3Profile);
                                                });
                                            });

                                            casper.then(function() {
                                                casper.echo('Verify link list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + content1Profile.id + '"]', function() {
                                                    verifyContentListItem(linkProfile);
                                                });
                                            });

                                            casper.then(function() {
                                                casper.echo('Verify collaborative document list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + content1Profile.id + '"]', function() {
                                                    verifyContentListItem(collabdocProfile);
                                                });
                                            });

                                            casper.thenOpen(configUtil().tenantUI + '/me/discussions', function() {
                                                casper.echo('Verify discussion list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + discussionProfile.id + '"]', function() {
                                                    verifyContentListItem(discussionProfile);
                                                });
                                            });

                                            casper.thenOpen(configUtil().tenantUI + '/me/groups', function() {
                                                casper.echo('Verify group list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + groupProfile.id + '"]', function() {
                                                    verifyContentListItem(groupProfile);
                                                });
                                            });

                                            casper.thenOpen(configUtil().tenantUI + '/me/network', function() {
                                                casper.echo('Verify user list item metadata', 'INFO');
                                                casper.waitForSelector('ul.oae-list li[data-id="' + user2.id + '"]', function() {
                                                    verifyContentListItem(user2);
                                                });
                                            });

                                            casper.then(userUtil().doLogOut);
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
