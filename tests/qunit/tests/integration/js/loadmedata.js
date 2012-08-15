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

        module('Load me data');

        var loadMeDataTest = function() {
            sakai_global.qunit.loginWithAdmin();
            loadMeData();
        };

        var loadMeData = function() {
            asyncTest('Test if the correct data is retrieved and stored in the sakai.data.me object', function() {
                sakai.api.User.loadMeData(function(success, data) {
                    //test if the profile node is included
                    ok(data.profile, 'check if there\'s profile information');

                    //test if the user node is included
                    ok(data.user, 'check if there\'s user information');

                    //test if the username is admin
                    same(data.user.userid,'admin','Check the username');

                    //start the next test
                    start();
                });
            });
        }

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            loadMeDataTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                loadMeDataTest();
            });
        }

    }
);
