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

        module('Tagging');

        // Create a random user id
        // We do this to not conflict with other users in the system + tests
        var user_random = 'userrandom_' + (new Date()).getTime() + Math.floor(Math.random() * 1000);
        var tag_random = 'tag_' + (new Date()).getTime() + Math.floor(Math.random() * 1000);

        var TaggingTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            sakai_global.qunit.loginWithAdmin();
            createUser();
        };

        var createUser = function() {
            asyncTest('Create a Sakai OAE user to test with', 1, function() {
                sakai.api.User.createUser(user_random, 'User', '0', 'user.0@sakatest.edu', 'test', 'test', null, function(success, data) {
                    ok(success, 'The user has been successfully created');
                    start();
                    sakai_global.qunit.logout(logIn);
                });
            });
        };

        var logIn = function() {
            asyncTest('Log-in with a Sakai OAE user', 1, function() {
                sakai.api.User.login({
                    'username': user_random,
                    'password': 'test'
                }, function(success, data) {
                    ok(success, 'The user has successfully logged-in');
                    start();
                    tagEntity();
                });
            });
        };

        var tagEntity = function() {
            asyncTest('Tag an entity', 1, function() {
                sakai.api.Util.tagEntity('/~' + user_random + '/public/authprofile', [tag_random], null, function(success) {
                    ok(success, 'User tagged successfully');
                    setTimeout(function() {
                        start();
                        testTag();
                    }, 6000);
                });
            });
        };

        var testTag = function() {
            asyncTest('Test to see if the entity was properly tagged', 1, function() {
                sakai.api.User.getUser(user_random, function(success, profile) {
                    ok(profile.hasOwnProperty('sakai:tags') && profile['sakai:tags'].indexOf(tag_random) > -1, 'User was tagged');
                    start();
                    sakai_global.qunit.logout();
                });
            });
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            TaggingTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                TaggingTest();
            });
        }

    }
);
