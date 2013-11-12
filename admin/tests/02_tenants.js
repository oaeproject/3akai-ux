casper.test.begin('Admin - Tenants', function(test) {

    /**
     * Verify that a tenant can be deleted
     *
     * @param  {String}    tenantID    The ID of the tenant to be deleted
     */
    var verifyDeleteTenant = function(tenantID) {
        test.assertExists('.delete-tenant[data-alias="' + tenantID + '"]', 'The \'Delete\' button is present');
        casper.click('.delete-tenant[data-alias="' + tenantID + '"]');

        // Wait for the confirmation modal to show
        casper.waitForSelector('#admin-confirmation-container #deletetenant-modal.in', function() {
            test.assertExists('#admin-confirmation-container #deletetenant-modal.in', 'A confirmation modal shows to confirm stopping the tenant');
            // Confirm starting the tenant
            test.assertExists('#deletetenant-modal-confirm', 'The \'Yes, delete "' + tenantID + '"\' button is present');
            casper.click('#deletetenant-modal-confirm');
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Tenant ' + tenantID + ' was successfully deleted');
                casper.click('#oae-notification-container .close');
            });
        });
    };

    /**
     * Verify that a tenant can be started
     *
     * @param  {String}    tenantID    The ID of the tenant to be started
     */
    var verifyStartTenant = function(tenantID) {
        test.assertExists('.start-tenant[data-alias="' + tenantID + '"]', 'The \'Start\' button is present');
        casper.click('.start-tenant[data-alias="' + tenantID + '"]');

        // Wait for the confirmation modal to show
        casper.waitForSelector('#admin-confirmation-container #starttenant-modal.in', function() {
            test.assertExists('#admin-confirmation-container #starttenant-modal.in', 'A confirmation modal shows to confirm stopping the tenant');
            // Confirm starting the tenant
            test.assertExists('#starttenant-modal-confirm', 'The \'Yes, start "' + tenantID + '"\' button is present');
            casper.click('#starttenant-modal-confirm');
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Tenant ' + tenantID + ' was successfully started');
                casper.click('#oae-notification-container .close');
            });
        });
    };

    /**
     * Verify that a tenant can be stopped
     *
     * @param  {String}    tenantID    The ID of the tenant to be stopped
     */
    var verifyStopTenant = function(tenantID) {
        test.assertExists('.stop-tenant[data-alias="' + tenantID + '"]', 'The \'Stop\' button is present');
        casper.click('.stop-tenant[data-alias="' + tenantID + '"]');

        // Wait for the confirmation modal to show
        casper.waitForSelector('#admin-confirmation-container #stoptenant-modal.in', function() {
            test.assertExists('#admin-confirmation-container #stoptenant-modal.in', 'A confirmation modal shows to confirm stopping the tenant');
            // Confirm stopping the tenant
            test.assertExists('#stoptenant-modal-confirm', 'The \'Yes, stop "' + tenantID + '"\' button is present');
            casper.click('#stoptenant-modal-confirm');
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Tenant ' + tenantID + ' was successfully stopped');
                casper.click('#oae-notification-container .close');
            });
        });
    };

    /**
     * Verifies that a tenant can be renamed
     *
     * @param  {String}    tenantID    The ID of the tenant to be renamed
     */
    var verifyRenameTenant = function(tenantID) {
        casper.waitForSelector('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"]', function() {
            test.assertExists('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"]', 'The editable tenant name field is present');
            casper.click('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"]');
            // Submit the form
            test.assertExists('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"] form', 'The tenant name form is present after click');
            casper.fill('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"] form', {
                'value': 'New tenant name'
            }, false);
            casper.click('html');
            casper.waitForSelector('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"]', function() {
                test.assertSelectorHasText('.jeditable-container .jeditable-field[data-field="displayName"][data-alias="' + tenantID + '"]', 'New tenant name', 'The tenant name has been successfully changed');
            });
        });
    };

    /**
     * Verifies that a new tenant can be created and returns the ID of the new tenant in the callback.
     *
     * @param  {Function}   callback            Standard callback function executed when the test is complete
     * @param  {String}     callback.tenantID   The ID of the created tenant
     */
    var verifyCreateNewTenant = function(callback) {
        var tenantID = mainUtil().generateRandomString();
        test.assertExists('form#createtenant-form', 'The create tenant form is present');
        // Try submitting an empty form
        casper.fill('form#createtenant-form', {
            'alias': tenantID,
            'displayName': tenantID + ' Tenant',
            'host': tenantID + '.oae.com'
        }, false);
        // Submit the form
        casper.click('#createtenant-submit-button');
        // Verify that creating the tenant worked
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'New tenant ' + tenantID + ' successfully created');
            casper.click('#oae-notification-container .close');
            callback(tenantID);
        });
    };

    /**
     * Verify the log in form validation by checking the following:
     *     - Try submitting an empty form
     *     - Try submitting a form without alias
     *     - Try submitting a form without name
     *     - Try submitting a form without host
     */
    var verifyCreateTenantValidation = function() {
        casper.waitForSelector('#admin-login-form', function() {
            // Toggle the create tenant form
            test.assertExists('#createtenant-toggle-button', 'The create tenant toggle is present');
            casper.click('#createtenant-toggle-button');

            // Try submitting an empty form
            casper.fill('form#createtenant-form', {
                'alias': '',
                'displayName': '',
                'host': ''
            }, false);
            // Submit the form
            casper.click('#createtenant-submit-button');
            // Verify that an error label is shown
            test.assertExists('#alias-error', 'Create tenant form successfully validated empty form - alias');
            test.assertExists('#displayName-error', 'Create tenant form successfully validated empty form - displayName');
            test.assertExists('#host-error', 'Create tenant form successfully validated empty form - host');

            // Try submitting a form without alias
            casper.fill('form#createtenant-form', {
                'alias': '',
                'displayName': 'CasperJS',
                'host': configUtil().tenantHost
            }, false);
            // Submit the form
            casper.click('#createtenant-submit-button');
            // Verify that an error label is shown
            test.assertExists('#alias-error', 'Create tenant form successfully validated form with missing alias');

            // Try submitting a form without name
            casper.fill('form#createtenant-form', {
                'alias': 'test',
                'displayName': '',
                'host': configUtil().tenantHost
            }, false);
            // Submit the form
            casper.click('#createtenant-submit-button');
            // Verify that an error label is shown
            test.assertExists('#displayName-error', 'Create tenant form successfully validated form with missing displayName');

            // Try submitting a form without host
            casper.fill('form#createtenant-form', {
                'alias': 'test',
                'displayName': 'CasperJS',
                'host': ''
            }, false);
            // Submit the form
            casper.click('#createtenant-submit-button');
            // Verify that an error label is shown
            test.assertExists('#host-error', 'Create tenant form successfully validated form with missing host');
        });
    };

    casper.start(configUtil().adminUI, function() {
        // Log in with admin user
        casper.then(function() {
            userUtil().doAdminLogIn(configUtil().adminUsername, configUtil().adminPassword);
        });

        // Verify form validation
        casper.echo('Verify the create tenant form validation', 'INFO');
        casper.then(verifyCreateTenantValidation);

        casper.then(function() {
            // Create a new tenant
            casper.echo('Verify creating a new tenant', 'INFO');
            verifyCreateNewTenant(function(tenantID) {
                // Rename the new tenant
                casper.then(function() {
                    casper.echo('Verify renaming a tenant', 'INFO');
                    verifyRenameTenant(tenantID);
                });

                // Stop the new tenant
                casper.then(function() {
                    casper.echo('Verify stopping a tenant', 'INFO');
                    verifyStopTenant(tenantID);
                });

                // Start the new tenant
                casper.then(function() {
                    casper.echo('Verify starting a tenant', 'INFO');
                    verifyStartTenant(tenantID);
                });

                // Delete the new tenant
                casper.then(function() {
                    casper.echo('Verify deleting a tenant', 'INFO');
                    verifyDeleteTenant(tenantID);
                });
            });
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
