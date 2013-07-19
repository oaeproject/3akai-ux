casper.echo('Include userUtil');

// Keeps track of the created users that are available for testing
var createdUsers = [];

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

        casper.start('http://cam.oae.com/').repeat(toCreate, function() {
            var rndString = mainUtil().generateRandomString();
            data = casper.evaluate(function(rndString) {
                return JSON.parse(__utils__.sendAJAX('/api/user/create', 'POST', {
                    'username': 'user-' + rndString,
                    'password': 'password',
                    'displayName': rndString,
                    'visibility': 'public',
                    'email': 'roy@example.com',
                    'locale': 'en_GB',
                    'timezone': 'Europe/London',
                    'publicAlias': 'Roy'
                }, false));
            }, rndString);

            casper.then(function() {
                casper.echo('Created user-' + rndString + '.');
                data.username = 'user-' + rndString;
                createdUsers.push(data);
                users.push(data);
            });
        });

        casper.then(function() {
            callback(users);
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

        casper.waitForSelector('#me-clip-container h1', function() {
            casper.echo('Log in with user ' + username);
        });
    };

    /**
     * Logs a user into the OAE administration interface
     *
     * @param  {String}    username    The username of the user to log in
     * @param  {String}    password    The password of the user to log in
     */
    var doAdminLogIn = function(username, password) {
        casper.waitForSelector('#admin-login-form', function() {
            // Fill sign in form
            casper.fill('form#admin-login-form', {
                'username': username,
                'password': password
            }, false);
            // Do the login
            casper.click('form#admin-login-form button[type="submit"]');
        });

        casper.waitForSelector('#admin-header-user', function() {
            casper.echo('Log in with user ' + username);
        });
    };

    /**
     * Logs out the current user
     */
    var doLogOut = function() {
        casper.then(function() {
            casper.echo('Log out');
            casper.click('#topnavigation-signout');
        });
    };

    /**
     * Logs out the current user from the administration interface
     */
    var doAdminLogOut = function() {
        casper.then(function() {
            casper.echo('Log out');
            casper.click('#admin-header-user-logout');
        });
    };

    return {
        'createUsers': createUsers,
        'createdUsers': createdUsers,
        'doAdminLogIn': doAdminLogIn,
        'doAdminLogOut': doAdminLogOut,
        'doLogIn': doLogIn,
        'doLogOut': doLogOut
    };
};
