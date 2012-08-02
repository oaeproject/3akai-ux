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

        module('Profile');

        var ProfileTest = function() {

            var profile = {}; profile.basic = {}; profile.basic.elements = {};
            profile.basic.elements.firstName = {}; profile.basic.elements.lastName = {};
            profile.basic.elements.firstName.value = 'Ken';
            profile.basic.elements.lastName.value = 'Griffey';

            asyncTest('Retrieve user\'s first name from profile', function() {
                var firstName = sakai.api.User.getProfileBasicElementValue(profile, 'firstName');
                ok(firstName === 'Ken', 'The user\'s first name was properly retrieved');
                start();
                asyncTest('Retrieve a user\'s display name', function() {
                    var displayName = sakai.api.User.getDisplayName(profile);
                    ok(displayName === 'Ken Griffey', 'Display name properly retrieved');
                    start();
                    asyncTest('Change a user\'s first name', function() {
                        sakai.api.User.setProfileBasicElementValue(profile, 'firstName', 'Bob');
                        ok(profile.basic.elements.firstName.value === 'Bob', 'First name properly changed');
                        start();
                    });
                });
            });

        }

        var startTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            ProfileTest();
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            startTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                startTest();
            });
        }

    }
);
