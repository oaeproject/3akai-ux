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
     * Verify the correct metadata is shown in content list items
     *
     * @param  {Content}      content1Profile     Content (image) for which the metadata should be checked
     * @param  {Content}      content2Profile     Content (video) for which the metadata should be checked
     * @param  {Content}      content3Profile     Content (archive) for which the metadata should be checked
     * @param  {Link}         linkProfile         Link for which the metadata should be checked
     * @param  {Collabdoc}    collabdocProfile    Collaborative document for which the metadata should be checked
     */
    var verifyContentListItemMetadata = function(content1Profile, content2Profile, content3Profile, linkProfile, collabdocProfile) {
        casper.echo('Verify metadata for images', 'PARAMETER');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content1Profile.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the content list item');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content1Profile.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is present in the content list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content1Profile.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the content list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + content1Profile.id + '"] .oae-tile-metadata h3', content1Profile.displayName, 'Verify the correct title is shown in the content list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content1Profile.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the content list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + content1Profile.id + '"] .oae-tile-metadata small', 'Image', 'Verify the small description in the content list item metadata reads \'Image\'');

        casper.echo('Verify metadata for videos', 'PARAMETER');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content2Profile.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the content list item');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content2Profile.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is present in the content list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content2Profile.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the content list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + content2Profile.id + '"] .oae-tile-metadata h3', content2Profile.displayName, 'Verify the correct title is shown in the content list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content2Profile.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the content list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + content2Profile.id + '"] .oae-tile-metadata small', 'Video', 'Verify the small description in the content list item metadata reads \'Video\'');

        casper.echo('Verify metadata for archives', 'PARAMETER');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content3Profile.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the content list item');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content3Profile.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is present in the content list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content3Profile.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the content list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + content3Profile.id + '"] .oae-tile-metadata h3', content3Profile.displayName, 'Verify the correct title is shown in the content list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + content3Profile.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the content list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + content3Profile.id + '"] .oae-tile-metadata small', 'Archive', 'Verify the small description in the content list item metadata reads \'Archive\'');

        casper.echo('Verify metadata for links', 'PARAMETER');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + linkProfile.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the link list item');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + linkProfile.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is present in the link list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + linkProfile.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the link list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + linkProfile.id + '"] .oae-tile-metadata h3', linkProfile.displayName, 'Verify the correct title is shown in the link list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + linkProfile.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the link list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + linkProfile.id + '"] .oae-tile-metadata small', 'Link', 'Verify the small description in the link list item metadata reads \'Link\'');

        casper.echo('Verify metadata for collaborative documents', 'PARAMETER');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + collabdocProfile.id + '"] .oae-tile-metadata', 'Verify the metadata container is present in the collabdoc list item');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + collabdocProfile.id + '"] .oae-tile-metadata .icon-oae-public', 'Verify the visibility icon is present in the collabdoc list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + collabdocProfile.id + '"] .oae-tile-metadata h3', 'Verify the title is present in the collabdoc list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + collabdocProfile.id + '"] .oae-tile-metadata h3', collabdocProfile.displayName, 'Verify the correct title is shown in the collabdoc list item metadata');
        test.assertExists('#contentlibrary-widget .oae-list li[data-id="' + collabdocProfile.id + '"] .oae-tile-metadata small', 'Verify the small description is present in the collabdoc list item metadata');
        test.assertSelectorHasText('#contentlibrary-widget .oae-list li[data-id="' + collabdocProfile.id + '"] .oae-tile-metadata small', 'Document', 'Verify the small description in the collabdoc list item metadata reads \'Document\'');
    };

    casper.start(configUtil().tenantUI, function() {
        // Create a couple of users to test with
        var user1 = null;
        userUtil().createUsers(1, function(users) {
            user1 = users[0];
        });

        // Login with the first user
        casper.then(function() {
            userUtil().doLogIn(user1.username, user1.password);
        });

        casper.then(function() {
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

                                casper.thenOpen(configUtil().tenantUI + '/me/library', function() {
                                    casper.echo('Verify list item metadata', 'INFO');
                                    casper.waitForSelector('#contentlibrary-widget ul.oae-list li[data-id="' + content1Profile.id + '"]', function() {
                                        verifyContentListItemMetadata(content1Profile, content2Profile, content3Profile, linkProfile, collabdocProfile);
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

    casper.run(function() {
        test.done();
    });
});
