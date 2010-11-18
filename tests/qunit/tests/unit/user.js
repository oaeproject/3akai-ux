module("User Creation, Login, Logout");

$(function() {

asyncTest("Log-in with a Sakai3 admin user", 1, function(){
    sakai.api.User.login({
        "username": "admin",
        "password": "admin"
    }, function(success, data){
        ok(success, "The admin user has successfully logged-in");
        start();
    });
});

// Create a random user id
// We do this to not conflict with other users in the system + tests
var user_random = "userrandom_" + (new Date()).getTime();

asyncTest("Create a Sakai3 user", 1, function(){
    sakai.api.User.createUser(user_random, "User", "0", "user.0@sakatest.edu", "test", "test", null, function(success, data) {
        ok(success, "The user has been successfully created");
        start();
    });
});

asyncTest("Log-out with a Sakai3 admin user", 2, function(){
    // Create an iFrame in which we load the logout page. If the logout works, this should redirect to the login page
    $(document.body).append($("<iframe src='" + sakai.config.URL.LOGOUT_URL + "' id='test_logout_admin' name='test_logout_admin'>"));

    // Wait for 5 seconds so that the redirect can happen and the login page can be rendered
    setTimeout(function(){

        // Test whether the current URL of the iFrame is the login page
        ok(window.frames.test_logout_admin.location.pathname === sakai.config.URL.GATEWAY_URL, "The user has successfully logged-out");

        // Clean up the iFrame
        $("#test_logout_admin").remove();

        // Check whether the logout was successful through the Me object
        sakai.api.User.loadMeData(function(success, data){
            ok(data.user.anon === true, "The current active user is anonymous");
            start();
        });
    }, 5000);
});

asyncTest("Log-in with a Sakai3 user", 1, function(){
    sakai.api.User.login({
        "username": user_random,
        "password": "test"
    }, function(success, data){
        ok(success, "The user has successfully logged-in");
        start();
    });
});

asyncTest("Log-out with a Sakai3 user", 2, function(){

    // Create an iFrame in which we load the logout page. If the logout works, this should redirect to the login page
    $(document.body).append($("<iframe src='" + sakai.config.URL.LOGOUT_URL + "' id='test_logout' name='test_logout'>"));

    // Wait for 5 seconds so that the redirect can happen and the login page can be rendered
    setTimeout(function(){

        // Test whether the current URL of the iFrame is the login page
        ok(window.frames.test_logout.location.pathname === sakai.config.URL.GATEWAY_URL, "The user has successfully logged-out");

        // Clean up the iFrame
        $("#test_logout").remove();

        // Check whether the logout was successful through the Me object
        sakai.api.User.loadMeData(function(success, data){
            ok(data.user.anon === true, "The current active user is anonymous");
            start();
        });
    }, 5000);

});

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