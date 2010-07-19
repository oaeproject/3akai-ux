module("User");

(function(){

// Create a random user id
// We do this to not conflict with other users in the system + tests
var user_random = "userrandom_" + (new Date()).getTime();

asyncTest("Create a Sakai3 user", function(){

    sakai.api.User.createUser({
        "firstName": "User",
        "lastName": "0",
        "email": "user.0@sakatest.edu",
        "pwd": "test",
        "pwdConfirm": "test",
        ":name": user_random
    }, function(success, data){
        ok(success, "The user has been successfully created");
        start();
    });

});

asyncTest("Log-in with a Sakai3 user", function(){

    sakai.api.User.login({
        "username": user_random,
        "password": "test"
    }, function(success, data){
        ok(success, "The user has successfully logged-in");
        start();
    });

});

asyncTest("Log-out with a Sakai3 user", function(){

    sakai.api.User.logout(function(success, data){
		ok(success, "The user has successfully logged-out");
		sakai.api.User.loadMeData(function(success, data){
			ok(data.user.anon === true, "The current active user is anonymous");
        });
        start();
    });

});

asyncTest("Log-in with a Sakai3 admin user", function(){

    sakai.api.User.login({
        "username": "admin",
        "password": "admin"
    }, function(success, data){
        ok(success, "The admin user has successfully logged-in");
        start();
    });

});

asyncTest("Remove a Sakai3 user", function(){

    sakai.api.User.removeUser(user_random, function(success, data){
        ok(success, "The user has been successfully removed");
        start();
    });

});

asyncTest("Log-out with a Sakai3 admin user", function(){

    sakai.api.User.logout(function(success, data){
        ok(success, "The admin user has successfully logged-out");
		sakai.api.User.loadMeData(function(success, data){
			ok(data.user.anon === true, "The current active user is anonymous");
        });
        start();
    });

});

})();