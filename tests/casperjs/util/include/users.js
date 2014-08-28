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

/**
 * Utility functions for users
 *
 * @return  {Object}    Returns an object with referenced user utility functions
 */
var userUtil = function() {

    /**
     * Creates a given number of users
     *
     * @param  {Number}      [numToCreate]             The number of users to create. Defaults to creating 1 user
     * @param  {Function}    callback                  Standard callback function
     * @param  {User[]}      callback.userProfiles     Array of user objects representing the created users
     */
    var createUsers = function(numToCreate, callback) {
        var toCreate = numToCreate || 1;
        var userProfiles = [];

        casper.start(configUtil().tenantUI).repeat(toCreate, function() {
            casper.wait(configUtil().modalWaitTime, function() {
                var me = casper.evaluate(function() {
                    return require('oae.core').data.me;
                });

                // If we're currently not logged in we can create users
                // If we are logged in, skip user creation and log the user out before trying again
                if (me && me.anon) {
                    var rndString = mainUtil().generateRandomString();
                    var rndPassword = mainUtil().generateRandomString();
                    var user = casper.evaluate(function(rndString, password) {
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
                    }, rndString, rndPassword);

                    casper.then(function() {
                        if (user) {
                            user.username = 'user-' + rndString;
                            user.password = rndPassword;
                            userProfiles.push(user);
                        } else {
                            casper.echo('Could not create user-' + rndString, 'ERROR');
                        }

                        callback(userProfiles);
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
        casper.waitForSelector('#adminlogin-local', function() {
            casper.wait(configUtil().searchWaitTime, function() {
                // Fill sign in form
                casper.fill('form#adminlogin-local', {
                    'adminlogin-local-username': username,
                    'adminlogin-local-password': password
                }, false);
                // Do the login
                casper.click('form#adminlogin-local button[type="submit"]');
            });
        });

        casper.waitForSelector('#adminheader-content #adminheader-logout');
    };

    /**
     * Logs out the current user
     */
    var doLogOut = function() {
        casper.wait(configUtil().modalWaitTime, function() {
            casper.thenEvaluate(function() {
                $('form[action="/api/auth/logout"]').submit();
            });
        });
    };

    /**
     * Logs out the current user from the administration interface
     */
    var doAdminLogOut = function() {
        casper.then(function() {
            casper.click('#adminheader-content #adminheader-logout');
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
