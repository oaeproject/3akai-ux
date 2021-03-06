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

casper.test.begin('Widget - Skinning', function(test) {

    /**
     * Verify that all skinning elements are present. Note that the skinning
     * configuration can change and we are using specific skinning options
     * to test various elements.
     */
    var verifySkinningElements = function() {
        // Verify header
        test.assertExists('#skinning-container .oae-list-header h2', 'Verify that the skinning header title is present');
        test.assertSelectorHasText('#skinning-container .oae-list-header h2', 'Skin values', 'Verify that skinning has the correct header title');

        // Verify form
        test.assertExists('#skinning-container form#skinning-form', 'Verify that the skinning form is present');

        // Verify subsections of skinning
        test.assertExists('#skinning-container form#skinning-form h3', 'Verify that skinning subsection titles are present');
        test.assertSelectorHasText('#skinning-container form#skinning-form h3', 'Branding', 'Verify that skinning subsection titles have a descriptive title');
        test.assertExists('#skinning-container form#skinning-form h3 + div.admin-table-striped', 'Verify that skinning subsections are present');
        test.assertExists('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group', 'Verify that the skinning subsections are divided into individual skinning value groups');
        test.assertExists('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group label', 'Verify that the individual skinning value groups have a label');
        test.assertSelectorHasText('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group label', 'Body background color', 'Verify that the individual skinning value group labels have a descriptive title');
        test.assertExists('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group .skinning-revert', 'Verify that the individual skinning value groups have a revert button');

        // Verify input fields
        test.assertExists('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-institutional-logo-url', 'Verify that the \'institutional-logo-url\' is an input field');
        test.assertEvalEquals(function() {
            return $('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-institutional-logo-url').val();
        }, '\'/shared/oae/img/oae-logo.png\'', 'Verify that the \'institutional-logo-url\' input field has the correct default value');

        // Verify color picker
        test.assertExists('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-body-background-color[data-type="color"] + .sp-replacer', 'Verify that the \'body-background-color\' skinning option is a color picker');
        test.assertEvalEquals(function() {
            return $('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-body-background-color[data-type="color"]').val();
        }, '#eceae5', 'Verify that the \'body-background-color\' color picker has the correct default value');

        // Verify submit
        test.assertExists('#skinning-container form#skinning-form button[type="submit"]', 'Verify that the skinning form submit button is present');
    };

    /**
     * Verify the skinning functionality
     */
    var verifySkinningFunctionality = function() {
        // Change an input and color picker field
        casper.fill('#skinning-container form#skinning-form', {
            'institutional-logo-url': '\'/tests/casperjs/data/apereo.jpg\''
        }, false);
        casper.evaluate(function() {
            $('#skinning-container form#skinning-form #skinning-body-background-color').val('#000000');
        });
        // Submit the form
        casper.click('#skinning-container form#skinning-form button[type="submit"]');

        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify that skin values can be changed successfully');

            casper.reload(function() {
                casper.waitForSelector('#skinning-container', function() {
                    // Verify the changes are still there
                    test.assertEvalEquals(function() {
                        return $('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-institutional-logo-url').val();
                    }, '\'/tests/casperjs/data/apereo.jpg\'', 'Verify that the \'institutional-logo-url\' update persists after a page reload');
                    test.assertEvalEquals(function() {
                        return $('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-body-background-color[data-type="color"]').val();
                    }, '#000000', 'Verify that the \'body-background-color\' update persists after a page reload');

                    // Revert the changes
                    casper.click('#skinning-container form#skinning-form .admin-table-striped:first-of-type .form-group:first-of-type .skinning-revert');
                    casper.click('#skinning-container form#skinning-form .admin-table-striped:first-of-type .form-group:first-of-type + .form-group .skinning-revert');
                    casper.click('#skinning-container form#skinning-form button[type="submit"]');

                    // Verify that the changes were reverted to the default values
                    casper.waitForSelector('#oae-notification-container .alert', function() {
                        test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify that skin values can be changed successfully');

                        casper.reload(function() {
                            casper.waitForSelector('#skinning-container .oae-list-header h2', function() {
                                test.assertEvalEquals(function() {
                                    return $('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-institutional-logo-url').val();
                                }, '\'/shared/oae/img/oae-logo.png\'', 'Verify that the \'institutional-logo-url\' input field was reverted to the default value');
                                test.assertEvalEquals(function() {
                                    return $('#skinning-container form#skinning-form h3 + div.admin-table-striped > .form-group input#skinning-body-background-color[data-type="color"]').val();
                                }, '#eceae5', 'Verify that the \'body-background-color\' color picker was reverted to the default value');
                            });
                        });
                    });
                });
            });
        });
    };

    casper.start(configUtil.adminUI, function() {

        userUtil.doLogIn(configUtil.adminUsername, configUtil.adminPassword);
        uiUtil.openAdminSkinning(configUtil.tenantAlias);

        casper.then(function() {
            casper.echo('# Verify that the skinning elements are present', 'INFO');
            verifySkinningElements();
        });

        casper.then(function() {
            casper.echo('# Verify the skinning functionality', 'INFO');
            verifySkinningFunctionality();
        });

        // Log out the admin user
        userUtil.doLogOut();
    });

    casper.run(function() {
        test.done();
    });
});
