require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {
    
    require(["misc/domReady!"], function(doc) {

        module("Tagging");

        sakai_global.qunit.loginWithAdmin();

        // Create a random user id
        // We do this to not conflict with other users in the system + tests
        var user_random = "userrandom_" + (new Date()).getTime() + Math.floor(Math.random() * 1000);
        var tag_random = "tag_" + (new Date()).getTime() + Math.floor(Math.random() * 1000);

        asyncTest("Create a Sakai3 user to test with", 1, function(){
            sakai.api.User.createUser(user_random, "User", "0", "user.0@sakatest.edu", "test", "test", null, function(success, data) {
                ok(success, "The user has been successfully created");
                start();
            });
        });

        sakai_global.qunit.logout();

        asyncTest("Log-in with a Sakai3 user", 1, function(){
            sakai.api.User.login({
                "username": user_random,
                "password": "test"
            }, function(success, data){
                ok(success, "The user has successfully logged-in");
                start();
            });
        });

        asyncTest("Tag an entity", 1, function() {
            sakai.api.Util.tagEntity("/~"+user_random+"/public/authprofile", [tag_random], null, function(success) {
                ok(success, "User tagged successfully");
                setTimeout(function() {
                    start();
                }, 6000);

            });
        });

        asyncTest("Test to see if the entity was properly tagged", 1, function() {
            sakai.api.User.getUser(user_random, function(success, profile) {
                ok(profile.hasOwnProperty("sakai:tags") && profile["sakai:tags"].indexOf(tag_random) > -1, "User was tagged");
                start();
            });
        });

        sakai_global.qunit.logout();

    });
});
