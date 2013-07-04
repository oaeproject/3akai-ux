var casper = require('casper').create();
// Add a title comment so that you know what's happening and when
casper.test.comment('Sakai OAE - Register new user');

var testTime = new Date().getTime();

/**
 * Initialize CasperJS and point it to cam.oae.com
 */
casper.start('http://cam.oae.com', function () {
    // Set the size of the viewport
    casper.viewport(1600, 1200);
});

/**
 * Navigate to the register page from the landing page
 */
casper.waitForSelector('.oae-trigger-register', function() {
    casper.test.assertExists('.oae-trigger-register', 'Assert register button exists and click');
    casper.click('.oae-trigger-register');
});

/**
 * Fill out and submit the register form
 */
casper.waitForSelector('form#register-form', function() {
    casper.test.assertExists('input[name="firstName"]', 'Assert firstname input exists and fill');
    casper.test.assertExists('input[name="lastName"]', 'Assert lastname input exists and fill');
    casper.test.assertExists('input[name="email"]', 'Assert email input exists and fill');
    casper.test.assertExists('input[name="username"]', 'Assert username input exists and fill');
    casper.test.assertExists('input[name="password"]', 'Assert password input exists and fill');
    casper.test.assertExists('input[name="password_repeat"]', 'Assert password repeat input exists and fill');

    casper.fill('form#register-form', {
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'jd@gmail.com',
        'username': 'johndoe-' + new Date().getTime(),
        'password': 'testtest',
        'password_repeat': 'testtest'
    }, false);

    casper.test.assertExists('#register-create-account', 'Assert submit register form button exists and click');
    casper.click('#register-create-account');
});

// Run the whole test suite (all the above)
casper.run(function() {
    casper.test.renderResults(true);
});
