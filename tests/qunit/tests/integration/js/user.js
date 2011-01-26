require(["jquery", "sakai/sakai.api.core"], function($, sakai) {
    $(function() {

    module("User Creation, Login, Logout");

    sakai_global.qunit.loginWithAdmin();

    // Create a random user id
    // We do this to not conflict with other users in the system + tests
    var user_random = "userrandom_" + (new Date()).getTime();

    asyncTest("Create a Sakai3 user", 1, function(){
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

    sakai_global.qunit.logout();

    asyncTest("Remove a Sakai3 user", 2, function(){
        sakai.api.User.login({
            "username": "admin",
            "password": "admin"
        }, function(success, data){
            ok(success, "The admin user has successfully logged-in to remove the user");
            sakai.api.User.removeUser(user_random, function(success, data){
                ok(success, "The user has been successfully removed");
                start();
            });
        });
    });

    });
});
