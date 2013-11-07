casper.test.begin('Prepare environment for tests', function(test) {

    // Override default waitTimeout before test fails
    casper.options.waitTimeout = 10000;

    /**
     * A function to be executed when a waitFor* function execution time exceeds the value of the waitTimeout option,
     * if any has been set. By default, on timeout the script will exit displaying an error,
     * except in test environment where it will just add a failure to the suite results.
     *
     * @param  {Number}    waitTimeout    Default wait timeout, for wait* family functions.
     */
    casper.options.onWaitTimeout = function(waitTimeout) {
        test.fail('Test timed out after ' + waitTimeout + ' ms');

        // Log out of the system
        userUtil().doLogOut();

        // Finish the current test to skip to the next one
        casper.then(function() {
            test.done();
        });
    };

    // Set up test tenant
    casper.start(configUtil().adminUI, function() {
        casper.waitForSelector('#admin-login-form', function() {
            casper.then(function() {
                userUtil().doAdminLogIn(configUtil().adminUsername, configUtil().adminPassword);
            });

            casper.then(function() {
                adminUtil().createTenant(configUtil().tenantAlias, configUtil().tenantDisplayname, configUtil().tenantHost, function() {
                    adminUtil().writeConfig(configUtil().tenantAlias, {
                        'oae-principals/recaptcha/enabled': false
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
