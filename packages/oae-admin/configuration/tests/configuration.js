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

casper.test.begin('Widget - Configuration', function(test) {

    /**
     * Verify that tenant configuration settings can be changed
     */
    var verifyTenantConfigurationSettingsChange = function() {
        // Double check that the form is present
        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Tenant Module"] + div form.configuration-form', 'The form is present for the Tenant configuration');
        // Change a setting
        casper.fill('form[data-configurationSection="oae-tenants"]', {
            'oae-tenants/actions/allowStop': false,
            'oae-tenants/tenantprivacy/tenantprivate': false
        });
        // Submit the form
        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Tenant Module"] + div form.configuration-form button[type="submit"]');
        // Change it back
        casper.fill('form[data-configurationSection="oae-tenants"]', {
            'oae-tenants/actions/allowStop': true,
            'oae-tenants/tenantprivacy/tenantprivate': false
        });
        // Submit the form
        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Tenant Module"] + div form.configuration-form button[type="submit"]');
        // Wait for a notification to show and verify it's not an error
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Configuration successfully saved');
        });
    };

    /**
     * Verify that all elements for changing tenant settings are present
     */
    var verifyTenantConfigurationSettingsPresent = function() {
        casper.waitForSelector('#tenants-container .table', function() {
            // Verify that global admin can go into tenant administration
            test.assertExists('#tenants-container .table a[href="/tenant/test"]', 'The test tenant configuration link is present in the global administration panel');
            // Verify that following the edit link brings us to tenant administration
            casper.click('#tenants-container .table a[href="/tenant/test"]');
            casper.waitForSelector('#adminheader-content h1', function() {
                test.assertSelectorHasText('#adminheader-content h1', 'CasperJS Tenant', 'The test tenant configuration can be accessed through the global administration panel');
                // Verify that the left hand navigation has options for tenant, configuration and skinning
                casper.waitForSelector('.oae-lhnavigation ul.nav li', function() {
                    test.assertExists('.oae-lhnavigation ul.nav li a[href="/tenant/' + configUtil.tenantAlias + '/tenants"]', 'The \'Tenants\' left hand nav link is present');
                    test.assertExists('.oae-lhnavigation ul.nav li a[href="/tenant/' + configUtil.tenantAlias + '/configuration"]', 'The \'Configuration\' left hand nav link is present');
                    test.assertExists('.oae-lhnavigation ul.nav li a[href="/tenant/' + configUtil.tenantAlias + '/skinning"]', 'The \'Skinning\' left hand nav link is present');
                    // Verify that there are configuration section toggle buttons on the page
                    casper.click('.oae-lhnavigation ul.nav li a[href="/tenant/' + configUtil.tenantAlias + '/configuration"]');
                    casper.waitForSelector('#configuration-container .admin-table-striped', function() {
                        test.assertExists('#configuration-container .admin-table-striped-toggle', 'Configuration configuration toggle buttons are present');
                        // Open the configuration section containers
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Tenant Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Authentication Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Email Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Discussions Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Activity Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Content Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Preview Processor Module"]');
                        casper.click('#configuration-container .admin-table-striped-toggle[title="Edit OAE Principals Module"]');
                        // Verify that each configuration section has a form
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Tenant Module"] + div form.configuration-form', 'The form is present for the Tenant configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Authentication Module"] + div form.configuration-form', 'The form is present for the Authentication configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Email Module"] + div form.configuration-form', 'The form is present for the Email configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Discussions Module"] + div form.configuration-form', 'The form is present for the Discussions configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Activity Module"] + div form.configuration-form', 'The form is present for the Activity configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Content Module"] + div form.configuration-form', 'The form is present for the Content configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Preview Processor Module"] + div form.configuration-form', 'The form is present for the Preview Processor Configuration configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Principals Module"] + div form.configuration-form', 'The form is present for the Principals configuration');
                        // Verify that each configuration section has a 'Save' button
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Tenant Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Tenant configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Authentication Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Authentication configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Email Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Email configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Discussions Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Discussions configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Activity Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Activity configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Content Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Content configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Preview Processor Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Preview Processor Configuration configuration');
                        test.assertExists('#configuration-container .admin-table-striped-toggle[title="Edit OAE Principals Module"] + div form.configuration-form button[type="submit"]', 'The submit button is present for the Principals configuration');
                    });
                });
            });
        });
    };

    casper.start(configUtil.adminUI, function() {
        // Log in with admin user
        userUtil.doLogIn(configUtil.adminUsername, configUtil.adminPassword);
        uiUtil.openAdmin();

        // Verify tenant configuration settings
        casper.then(function() {
            casper.echo('# Verify the tenant configuration settings present', 'INFO');
            verifyTenantConfigurationSettingsPresent();
        });

        // Verify tenant configuration settings can be changed
        casper.then(function() {
            casper.echo('# Verify the tenant configuration settings can be changed', 'INFO');
            verifyTenantConfigurationSettingsChange();
        });

        // Log out with admin user
        userUtil.doLogOut();
    });

    casper.run(function() {
        test.done();
    });
});
