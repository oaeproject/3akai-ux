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

casper.test.begin('Widget - Admin Header', function(test) {

    /**
     * Verify that all elements are present in the admin header
     */
    var verifyAdminHeaderElements = function() {
        test.assertExists('#adminheader-container #adminheader-content', 'Verify the admin header container is present on the global administration page as an anonymous user');
        test.assertExists('#adminheader-container #adminheader-content h1', 'Verify the admin header title is present on the global administration page as an anonymous user');
        test.assertSelectorHasText('#adminheader-container #adminheader-content h1', 'Global administration', 'Verify the admin header title is present on the global administration page as an anonymous user');
        test.assertDoesntExist('#adminheader-container #adminheader-content form button[type="submit"]#adminheader-logout', 'Verify the admin header logout button is not present on the global administration page as an anonymous user');

        // Log in to the administration interface
        userUtil.doLogIn(configUtil.adminUsername, configUtil.adminPassword);

        // Open the admin UI
        uiUtil.openAdmin();

        casper.waitForSelector('#adminheader-content', function() {
            test.assertExists('#adminheader-container #adminheader-content', 'Verify the admin header container is present on the global administration page');
            test.assertExists('#adminheader-container #adminheader-content h1', 'Verify the admin header title is present on the global administration page');
            test.assertSelectorHasText('#adminheader-container #adminheader-content h1', 'Global administration', 'Verify the admin header title is present on the global administration page');
            test.assertExists('#adminheader-container #adminheader-content form button[type="submit"]#adminheader-logout', 'Verify the admin header logout button is present on the global administration page');

            // Go to the tenant administration page and run the same tests
            casper.waitForSelector('a[href="/tenant/test"]', function() {
                casper.click('a[href="/tenant/test"]');
                casper.waitForSelector('#adminheader-content', function() {
                    test.assertExists('#adminheader-container #adminheader-content', 'Verify the admin header container is present on the tenant administration page');
                    test.assertExists('#adminheader-container #adminheader-content h1', 'Verify the admin header title is present on the tenant administration page');
                    test.assertExists('#adminheader-container #adminheader-content h1 a[href="/"]', 'Verify the admin header breadcrumb link is present on the tenant administration page');
                    casper.click('#adminheader-container #adminheader-content h1 a[href="/"]');
                    casper.waitForSelector('#adminheader-content', function() {
                        test.assertSelectorHasText('#adminheader-container #adminheader-content h1', 'Global administration', 'Verify the admin header breadcrumb link takes the user back to the global administration page');
                        casper.waitForSelector('a[href="/tenant/test"]', function() {
                            casper.click('a[href="/tenant/test"]');
                            casper.waitForSelector('#adminheader-content', function() {
                                test.assertSelectorHasText('#adminheader-container #adminheader-content h1', 'All tenants', 'Verify the admin header breadcrumb text is present on the tenant administration page');
                                test.assertSelectorHasText('#adminheader-container #adminheader-content h1', 'CasperJS Tenant', 'Verify the admin header title is present on the tenant administration page');
                                test.assertExists('#adminheader-container #adminheader-content form button[type="submit"]#adminheader-logout', 'Verify the admin header logout button is present on the tenant administration page');
                            });
                        });
                    });
                });
            });
        });
    };

    /**
     * Verify logging out of the administration interface
     */
    var verifyLogOut = function() {
        casper.click('#adminheader-container #adminheader-content form button[type="submit"]#adminheader-logout');
        casper.waitForSelector('#adminheader-content', function() {
            test.assertDoesntExist('#adminheader-container #adminheader-content form button[type="submit"]#adminheader-logout', 'Verify the admin header logout button works and logs the administrator out of the administration interface');
        });
    };

    casper.start(configUtil.adminUI, function() {
        casper.then(function() {
            casper.echo('# Verify admin header elements', 'INFO');
            casper.waitForSelector('#adminheader-content', function() {
                verifyAdminHeaderElements();
            });
        });

        casper.then(function() {
            casper.echo('# Verify logging out of the administration interface', 'INFO');
            verifyLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
