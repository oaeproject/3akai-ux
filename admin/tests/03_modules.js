casper.test.begin('Admin - Modules', function(test) {

    /**
     * Verify that tenant module settings can be changed
     */
    var verifyTenantModuleSettingsChange = function() {
        // Double check that the form is present
        test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Tenant Module"] + .admin-module-configuration-container form', 'The form is present for the Tenant module');
        // Change a setting
        casper.fill('form[data-module="oae-tenants"]', {
            'oae-tenants/actions/allowStop': false,
            'oae-tenants/tenantprivacy/tenantprivate': false
        });
        // Submit the form
        casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Tenant Module"] + .admin-module-configuration-container form button[type="submit"]');
        // Change it back
        casper.fill('form[data-module="oae-tenants"]', {
            'oae-tenants/actions/allowStop': true,
            'oae-tenants/tenantprivacy/tenantprivate': false
        });
        // Submit the form
        casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Tenant Module"] + .admin-module-configuration-container form button[type="submit"]');
        // Wait for a notification to show and verify it's not an error
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Configuration successfully saved');
        });
    };

    /**
     * Verify that all elements for changing tenant settings are present
     */
    var verifyTenantModuleSettingsPresent = function() {
        casper.waitForSelector('#admin-tenants-container .table', function() {
            // Verify that global admin can go into tenant administration
            test.assertExists('#admin-tenants-container .table a[href="/tenant/test"]', 'The test tenant configuration link is present in the global administration panel');
            // Verify that following the edit link brings us to tenant administration
            casper.click('#admin-tenants-container .table a[href="/tenant/test"]');
            casper.waitForSelector('#admin-header-content h1', function() {
                test.assertSelectorHasText('#admin-header-content h1', 'CasperJS Tenant', 'The test tenant configuration can be accessed through the global administration panel');
                // Verify that the left hand navigation has options for tenant, modules and skinning
                test.assertExists('#admin-lhnav-container a[href="?view=tenants"]', 'The \'Tenants\' left hand nav link is present');
                test.assertExists('#admin-lhnav-container a[href="?view=modules"]', 'The \'Modules\' left hand nav link is present');
                test.assertExists('#admin-lhnav-container a[href="?view=skinning"]', 'The \'Skinning\' left hand nav link is present');
                // Verify that there are module toggle buttons on the page
                casper.click('#admin-lhnav-container a[href="?view=modules"]');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button', 'Module configuration toggle buttons are present');
                // Open the module containers
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Tenant Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Authentication Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Email Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Discussions Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Activity Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Content Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Preview Processor Module"]');
                casper.click('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Principals Module"]');
                // Verify that each module has a form
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Tenant Module"] + .admin-module-configuration-container form', 'The form is present for the Tenant module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Authentication Module"] + .admin-module-configuration-container form', 'The form is present for the Authentication module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Email Module"] + .admin-module-configuration-container form', 'The form is present for the Email module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Discussions Module"] + .admin-module-configuration-container form', 'The form is present for the Discussions module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Activity Module"] + .admin-module-configuration-container form', 'The form is present for the Activity module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Content Module"] + .admin-module-configuration-container form', 'The form is present for the Content module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Preview Processor Module"] + .admin-module-configuration-container form', 'The form is present for the Preview Processor Module module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Principals Module"] + .admin-module-configuration-container form', 'The form is present for the Principals module');
                // Verify that each module has a 'Save' button
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Tenant Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Tenant module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Authentication Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Authentication module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Email Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Email module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Discussions Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Discussions module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Activity Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Activity module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Content Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Content module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Preview Processor Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Preview Processor Module module');
                test.assertExists('.admin-module-configuration-container .admin-module-configuration-toggle-button[title="Edit the OAE Principals Module"] + .admin-module-configuration-container form button[type="submit"]', 'The submit button is present for the Principals module');
            });
        });
    };

    casper.start(configUtil().adminUI, function() {
        // Log in with admin user
        casper.then(function() {
            userUtil().doAdminLogIn(configUtil().adminUsername, configUtil().adminPassword);
        });

        // Verify tenant module settings
        casper.then(function() {
            casper.echo('Verify the tenant module settings present', 'INFO');
            verifyTenantModuleSettingsPresent();
        });

        // Verify tenant module settings can be changed
        casper.then(function() {
            casper.echo('Verify the tenant module settings can be changed', 'INFO');
            verifyTenantModuleSettingsChange();
        });

        // Log out with admin user
        casper.then(function() {
            userUtil().doAdminLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
