casper.test.comment('Admin - Login');

/**
 * Verify the log in form validation by checking the following:
 *     - Try submitting an empty form
 *     - Try submitting a form without username
 *     - Try submitting a form without password
 *     - Try submitting a form with incorrect user credentials
 */
var verifyLoginValidation = function() {
    casper.waitForSelector('#admin-login-form', function() {
        // Fill empty form
        casper.fill('form#admin-login-form', {
            'username': '',
            'password': ''
        }, false);
        // Do the login
        casper.click('form#admin-login-form button[type="submit"]');
        // Verify that an error label is shown
        casper.test.assertExists('#username-error', 'Log in form successfully validated empty form - username');
        casper.test.assertExists('#password-error', 'Log in form successfully validated empty form - password');


        // Fill form without username
        casper.fill('form#admin-login-form', {
            'username': '',
            'password': 'administrator'
        }, false);
        // Do the login
        casper.click('form#admin-login-form button[type="submit"]');
        casper.test.assertExists('#username-error', 'Log in form successfully validated empty username field');

        // Fill form without password
        casper.fill('form#admin-login-form', {
            'username': 'administrator',
            'password': ''
        }, false);
        // Do the login
        casper.click('form#admin-login-form button[type="submit"]');
        casper.test.assertExists('#password-error', 'Log in form successfully validated empty password field');

        // Fill form with incorrect user credentials
        casper.fill('form#admin-login-form', {
            'username': 'incorrect',
            'password': 'user'
        }, false);
        // Do the login
        casper.click('form#admin-login-form button[type="submit"]');
        casper.waitForSelector('#oae-notification-container .alert', function() {
            casper.test.assertExists('#oae-notification-container .alert.alert-error', 'Log in form successfully validated incorrect user credentials');
            casper.click('#oae-notification-container .close');
        });
    });
};

casper.start('http://admin.oae.com', function() {
    // Log in with admin user
    casper.then(function() {
        casper.echo('Verify logging in to the administration interface', 'INFO');
        userUtil().doAdminLogIn('administrator', 'administrator');
        casper.then(function() {
            casper.test.assertExists('#admin-header-user', 'Successfully logged in to the administration interface');
        });
    });

    // Verify that the login was successfull
    casper.then(function() {
        casper.echo('Verify logging out of the administration interface', 'INFO');
        userUtil().doAdminLogOut('administrator', 'administrator');
        casper.test.assertExists('#admin-login-form', 'Successfully logged out of the administration interface');
    });

    // Verify form validation
    casper.then(function() {
        casper.echo('Verify log in form validation', 'INFO');
        casper.then(verifyLoginValidation);
    });
});

casper.run(function() {
    this.test.done();
});
