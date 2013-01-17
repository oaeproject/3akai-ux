/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

        module('User Creation, Login, Logout');

        var user_random = 'userrandom_' + (new Date()).getTime();

        var userTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            sakai_global.qunit.loginWithAdmin();
            createUser();
        };

        var createUser = function() {
            // Create a random user id
            // We do this to not conflict with other users in the system + tests
            asyncTest('Create a Sakai OAE user', function() {
                sakai.api.User.createUser(user_random, 'User', '0', 'user.0@sakatest.edu', 'test', 'test', null, function(success, data) {
                    ok(success, 'The user has been successfully created');
                    start();
                    sakai_global.qunit.logout();
                    login();
                });
            });
        };

        var login = function() {
            asyncTest('Log-in with a Sakai OAE user', function() {
                sakai.api.User.login({
                    'username': user_random,
                    'password': 'test'
                }, function(success, data) {
                    ok(success, 'The user has successfully logged-in');
                    start();
                    sakai_global.qunit.logout();
                    removeUser();
                });
            });
        };

        var removeUser = function() {
            asyncTest('Remove a Sakai OAE user', function() {
                sakai.api.User.login({
                    'username': 'admin',
                    'password': 'admin'
                }, function(success, data) {
                    ok(success, 'The admin user has successfully logged-in to remove the user');
                    sakai.api.User.removeUser(user_random, function(success, data) {
                        ok(success, 'The user has been successfully removed');
                        start();
                    });
                });
            });
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            userTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                userTest();
            });
        }

    }
);