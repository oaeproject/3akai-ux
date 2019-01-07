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

casper.test.begin('Widget - About Content', function(test) {

    /**
     * Open the about content modal with assertions
     */
    var openAboutContent = function() {
        casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
            casper.click('#content-clip-container .oae-clip-content > button');
            test.assertExists('.oae-trigger-aboutcontent', 'About content trigger exists');
            casper.click('.oae-trigger-aboutcontent');
            casper.waitUntilVisible('#aboutcontent-modal', function() {
                test.assertVisible('#aboutcontent-modal', 'About content pane is showing after trigger');
                casper.click('#content-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Verify that all elements for files are present in the about content modal
     *
     * @param {User}       user1             The user profile of the user that created the content item
     * @param {Content}    contentProfile    The profile of the content item to check
     */
    var verifyAboutFileElements = function(user1, contentProfile) {
        test.assertExists('#aboutcontent-modal .modal-header h3', 'Verify that the modal has a header');
        test.assertSelectorHasText('#aboutcontent-modal .modal-header h3', 'About', 'Verify that the modal header reads \'About\'');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li', 'Verify that the modal shows who added the file');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-primary-thumbnail', 'Verify that the modal shows the picture of the user who added the file');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', 'Verify that the modal shows the name of the user who added the file');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', user1.displayName, 'Verify that the correct name is shown');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'Verify that the modal shows the tenant of the user who added the file');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'CasperJS Tenant', 'Verify that the metadata shows the tenant name');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-title', 'Verify that the modal shows title of the file');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-title', contentProfile.displayName, 'Verify that the correct file title is shown');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container time', 'Verify that the modal shows when the file was added');
        test.assertEval(function(created) {
            return $('#aboutcontent-modal .modal-body #aboutcontent-metadata-container time').text() === require('oae.api.l10n').transformDate(created);
        }, 'Verify that the correct time when the content was created is shown', contentProfile.created);
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-description', 'Verify that the modal shows the description of the file');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-description', 'Test file description', 'Verify that the correct file description is shown');
    };

    /**
     * Verify that all elements for links are present in the about content modal
     *
     * @param {User}    user1          The user profile of the user that created the content item
     * @param {Link}    linkProfile    The profile of the link to check
     */
    var verifyAboutLinkElements = function(user1, linkProfile) {
        test.assertExists('#aboutcontent-modal .modal-header h3', 'Verify that the modal has a header');
        test.assertSelectorHasText('#aboutcontent-modal .modal-header h3', 'About', 'Verify that the modal header reads \'About\'');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li', 'Verify that the modal shows who added the link');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-primary-thumbnail', 'Verify that the modal shows the picture of the user who added the link');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', 'Verify that the modal shows the name of the user who added the link');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', user1.displayName, 'Verify that the correct name is shown');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'Verify that the modal shows the tenant of the user who added the link');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'CasperJS Tenant', 'Verify that the metadata shows the tenant name');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-title', 'Verify that the modal shows title of the link');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-title', 'Test link title', 'Verify that the correct link title is shown');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container time', 'Verify that the modal shows when the file was added');
        test.assertEval(function(created) {
            return $('#aboutcontent-modal .modal-body #aboutcontent-metadata-container time').text() === require('oae.api.l10n').transformDate(created);
        }, 'Verify that the correct time when the link was created is shown', linkProfile.created);
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-description', 'Verify that the modal shows the description of the link');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-description', 'Test link description', 'Verify that the correct link description is shown');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-link a', 'Verify that the modal shows link URL');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-link a', 'http://www.oaeproject.org', 'Verify that the link title is the URL of the link');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-link a[href="http://www.oaeproject.org"][target="_blank"]', 'Verify that the link points to the correct URL and opens in a new window');
    };

    /**
     * Verify that all elements for collaborative documents are present in the about content modal
     *
     * @param {User}         user1               The user profile of the user that created the content item
     * @param {Collabdoc}    collabdocProfile    The profile of the collabdoc to check
     */
    var verifyAboutCollabdocElements = function(user1, collabdocProfile) {
        test.assertExists('#aboutcontent-modal .modal-header h3', 'Verify that the modal has a header');
        test.assertSelectorHasText('#aboutcontent-modal .modal-header h3', 'About', 'Verify that the modal header reads \'About\'');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li', 'Verify that the modal shows who added the collaborative document');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-primary-thumbnail', 'Verify that the modal shows the picture of the user who added the collaborative document');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', 'Verify that the modal shows the name of the user who added the collaborative document');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', user1.displayName, 'Verify that the correct name is shown');
        test.assertExists('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'Verify that the modal shows the tenant of the user who added the collaborative document');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'CasperJS Tenant', 'Verify that the metadata shows the tenant name');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-title', 'Verify that the modal shows title of the collaborative document');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-title', 'Test collabdoc title', 'Verify that the correct collaborative document title is shown');
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container time', 'Verify that the modal shows when the file was added');
        test.assertEval(function(created) {
            return $('#aboutcontent-modal .modal-body #aboutcontent-metadata-container time').text() === require('oae.api.l10n').transformDate(created);
        }, 'Verify that the correct time when the collaborative document was created is shown', collabdocProfile.created);
        test.assertExists('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-description', 'Verify that the modal shows the description of the collaborative document');
        test.assertSelectorHasText('#aboutcontent-modal .modal-body #aboutcontent-metadata-container #aboutcontent-description', 'Test collabdoc description', 'Verify that the correct collaborative document description is shown');
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(2, function(user1, user2) {
            // Login with the first user
            userUtil.doLogIn(user1.username, user1.password);

            // Create all resources before starting the tests
            // Create a file
            contentUtil.createFile(null, 'Test file description', null, null, null, [user2.id], function(err, contentProfile) {
                // Create a link
                contentUtil.createLink('Test link title', 'Test link description', null, 'http://www.oaeproject.org', null, [user2.id], null, function(err, linkProfile) {
                    // Create a collaborative document
                    contentUtil.createCollabDoc('Test collabdoc title', 'Test collabdoc description', null, null, [user2.id], null, null, function(err, collabdocProfile) {
                        // Log out from user 1
                        userUtil.doLogOut();

                        // Log in with user 2 to start the tests
                        userUtil.doLogIn(user2.username, user2.password);

                        uiUtil.openContentProfile(contentProfile);
                        casper.then(function() {
                            casper.echo('Verify open about content modal', 'INFO');
                            openAboutContent();
                        });

                        casper.then(function() {
                            casper.echo('Verify about content elements for files', 'INFO');
                            verifyAboutFileElements(user1, contentProfile);
                        });

                        uiUtil.openLinkProfile(linkProfile);
                        casper.then(function() {
                            casper.echo('Verify about content elements for links', 'INFO');
                            casper.then(openAboutContent);
                            casper.then(function() {
                                verifyAboutLinkElements(user1, linkProfile);
                            });
                        });

                        uiUtil.openCollabdocProfile(collabdocProfile);
                        casper.then(function() {
                            casper.echo('Verify about content elements for collaborative documents', 'INFO');
                            casper.then(openAboutContent);
                            casper.then(function() {
                                verifyAboutCollabdocElements(user1, collabdocProfile);
                            });
                        });

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
