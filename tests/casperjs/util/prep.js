casper.test.begin('Prepare environment for tests', function(test) {

    // Override default waitTimeout before test fails
    casper.options.waitTimeout = configUtil().waitTimeout;

    // Set the default size of the viewport
    casper.options.viewportSize = {'width': 1200, 'height': 800};

    /**
     * A function to be executed when a waitFor* function execution time exceeds the value of the waitTimeout option,
     * if any has been set. By default, on timeout the script will exit displaying an error,
     * except in test environment where it will just add a failure to the suite results.
     *
     * @param  {Number}    waitTimeout    Default wait timeout, for wait* family functions.
     */
    casper.options.onWaitTimeout = function(waitTimeout) {
        // Log out of the system
        casper.evaluate(function() {
            require('oae.core').api.authentication.logout(function() {
                window.location = '/';
            });
        });

        // Finish the current test to skip to the next one
        casper.wait(configUtil().modalWaitTime, function() {
            test.fail('Test timed out after ' + waitTimeout + ' ms');
            test.done();
        });
    };

    // Set up test tenant
    casper.start(configUtil().adminUI, function() {
        casper.waitForSelector('#adminlogin-form', function() {
            casper.then(function() {
                userUtil().doAdminLogIn(configUtil().adminUsername, configUtil().adminPassword);
            });

            casper.then(function() {
                adminUtil().createTenant(configUtil().tenantAlias, configUtil().tenantDisplayname, configUtil().tenantHost, function() {
                    adminUtil().writeConfig(configUtil().tenantAlias, {
                        'oae-principals/recaptcha/enabled': false,
                        'oae-principals/termsAndConditions/enabled': true,
                        'oae-principals/termsAndConditions/text/default': '![OAE](/shared/oae/img/oae-logo.png) Default terms and conditions'
                    }, function() {
                        userUtil().doAdminLogOut();
                    });
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
