require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {
    
    require.ready(function() {

        module("Load me data");

        /**
         * Run an asynchronous test
         */

        sakai_global.qunit.loginWithAdmin();

        asyncTest("Test if the correct data is retrieved and stored in the sakai.data.me object", function(){
            sakai.api.User.loadMeData(function(success, data) {
                //test if the profile node is included
                ok(data.profile, "check if there's profile information");

                //test if the user node is included
                ok(data.user, "check if there's user information");

                //test if the username is admin
                same(data.user.userid,"admin","Check the username");

                //start the next test
                start();
            });
        });
    });

});
