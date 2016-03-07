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
 */
var userUtil = (function() {

    /**
     * Creates a given number of users
     *
     * @param  {Number}      [numToCreate]             The number of users to create. Defaults to creating 1 user
     * @param  {Function}    callback                  Standard callback function
     * @param  {User[]}      callback.userProfiles     Array of user objects representing the created users
     */
    var createUsers = function(numToCreate, callback) {
        casper.then(function() {
            var toCreate = numToCreate || 1;
            var created = 0;
            var userProfiles = [];

            // Point casper to the tenant UI
            casper.start(configUtil.tenantUI, function() {
                /**
                 * Create a user
                 */
                var createUser = function() {
                    var rndString = mainUtil.generateRandomString();
                    var rndPassword = mainUtil.generateRandomString();
                    var params = ['user-' + rndString, rndPassword, rndString, {
                        'visibility': 'public',
                        'email': 'roy@example.com',
                        'locale': 'en_GB',
                        'publicAlias': 'Roy',
                        'acceptedTC': true
                    }, null, null];

                    mainUtil.callInternalAPI('user', 'createUser', params, function(err, userProfile) {
                        if (err) {
                            casper.echo('Could not create user-' + rndString + '. Error ' + err.code + ': ' + err.msg, 'ERROR');
                        } else {
                            userProfile.username = 'user-' + rndString;
                            userProfile.password = rndPassword;
                            userProfiles.push(userProfile);

                            created++;
                        }
                    });
                };

                // Get the me object
                var me = null;
                mainUtil.callInternalAPI('user', 'getMe', null, function(err, _me) {
                    me = _me;
                });

                // Wait for the me object to be retrieved before starting to create users
                casper.waitFor(function() {
                    return me !== null;
                }, function() {
                    // Only start creating users when we're anonymous
                    if (me && me.anon) {
                        casper.repeat(toCreate, createUser);
                    // If we're not anonymous log out and continue creating users
                    } else {
                        casper.then(function() {
                            doLogOut();
                        });
                        casper.then(function() {
                            casper.repeat(toCreate, createUser);
                        });
                    }
                });
            });

            // Wait until all user profiles have been created and execute the callback
            // passing in the created user profiles
            casper.waitFor(function() {
                return userProfiles.length === toCreate;
            }, function() {
                return callback.apply(this, userProfiles);
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

        casper.echo('doLogIn');
        casper.echo('username : ' + username);
        casper.echo('password : ' + password);

        casper.then(function() {
            var err = null;
            var loggedIn = false;

            mainUtil.callInternalAPI('authentication', 'localLogin', [username, password], function(_err) {

                casper.echo('mainUtil.callInternalAPI DONE');

                if (_err) {
                    casper.echo('Could not log in with ' + username + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                } else {
                    loggedIn = true;
                }
            });

            casper.waitFor(function() {
                return loggedIn !== false || err !== null;
            });
        });
    };

    /**
     * Logs out the current user
     */
    var doLogOut = function() {
        casper.then(function() {
            var done = null;
            var err = null;

            mainUtil.callInternalAPI('authentication', 'logout', null, function(_err) {
                if (_err) {
                    casper.echo('Could not log out. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                    err = _err;
                } else {
                    done = true;
                }
            });

            casper.waitFor(function() {
                return done !== null || err !== null;
            });
        });
    };

    return {
        'createUsers': createUsers,
        'doLogIn': doLogIn,
        'doLogOut': doLogOut
    };
})();
