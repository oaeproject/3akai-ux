/**
 * Utility functions for users
 *
 * @return  {Object}    Returns an object with referenced user utility functions
 */
var userUtil = function() {

    /**
     * Creates a given number of users
     *
     * @param  {Number}   numToCreate   The number of users to create
     * @return {User[]}                 An array of created users
     */
    var createUsers = function(numToCreate, callback) {
        var toCreate = numToCreate || 4;
        var users = [];
        var me = null;

        casper.start(configUtil().tenantUI).repeat(toCreate, function() {
            casper.wait(1000, function() {
                me = casper.evaluate(function() {
                    return require('oae.core').data.me;
                });

                // If we're currently not logged in we can create users
                // If we are logged in, skip user creation and log the user out before trying again
                if (me && me.anon) {
                    var rndString = mainUtil().generateRandomString();
                    casper.then(function() {
                        data = casper.evaluate(function(rndString, password) {
                            return JSON.parse(__utils__.sendAJAX('/api/user/create', 'POST', {
                                'username': 'user-' + rndString,
                                'password': password,
                                'displayName': rndString,
                                'visibility': 'public',
                                'email': 'roy@example.com',
                                'locale': 'en_GB',
                                'timezone': 'Europe/London',
                                'publicAlias': 'Roy',
                                'acceptedTC': true
                            }, false));
                        }, rndString, configUtil().defaultUserPassword);
                    });

                    casper.wait(1000, function() {
                        if (data) {
                            data.username = 'user-' + rndString;
                            users.push(data);
                        } else {
                            casper.echo('Could not create user-' + rndString, 'ERROR');
                        }

                        callback(users);
                    });
                } else {
                    casper.then(function() {
                        doLogOut();
                    });
                    casper.then(function() {
                        createUsers(toCreate, callback);
                    });
                }
            });
        });
    };

    /**
     * Logs a user into the OAE
     *
     * @param  {String}    username    The username of the user to log in
     * @param  {String}    password    The password of the user to log in
     */
    var doLogIn = function(username, password) {
        casper.waitForSelector('#topnavigation-signin', function() {
            // Open sign in form
            casper.click('#topnavigation-signin');
            // Fill sign in form
            casper.fill('form#topnavigation-signin-form', {
                'topnavigation-signin-username': username,
                'topnavigation-signin-password': password
            }, false);
            // Do the login
            casper.click('#topnavigation-signin-button');
        });

        casper.waitForSelector('#me-clip-container h1');
    };

    /**
     * Logs a user into the OAE administration interface
     *
     * @param  {String}    username    The username of the user to log in
     * @param  {String}    password    The password of the user to log in
     */
    var doAdminLogIn = function(username, password) {
        casper.waitForSelector('#admin-login-form', function() {
            casper.wait(2000, function() {
                // Fill sign in form
                casper.fill('form#admin-login-form', {
                    'username': username,
                    'password': password
                }, false);
                // Do the login
                casper.click('form#admin-login-form button[type="submit"]');
            });
        });

        casper.waitForSelector('#admin-header-user');
    };

    /**
     * Logs out the current user
     */
    var doLogOut = function() {
        casper.wait(1000, function() {
            casper.thenEvaluate(function() {
                require('oae.core').api.authentication.logout(function() {
                    window.location = '/';
                });
            });
        });
    };

    /**
     * Logs out the current user from the administration interface
     */
    var doAdminLogOut = function() {
        casper.then(function() {
            casper.click('#admin-header-user-logout');
            casper.wait(2000);
        });
    };

    return {
        'createUsers': createUsers,
        'doAdminLogIn': doAdminLogIn,
        'doAdminLogOut': doAdminLogOut,
        'doLogIn': doLogIn,
        'doLogOut': doLogOut
    };
};
