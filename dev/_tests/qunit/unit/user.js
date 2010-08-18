module("User");

(function(){

// Create a random user id
// We do this to not conflict with other users in the system + tests
var user_random = "userrandom_" + (new Date()).getTime();

asyncTest("Create a Sakai3 user", function(){
    var profileData = {}; profileData.basic = {}; profileData.basic.elements = {};
    profileData.basic.elements["firstName"] = {};
    profileData.basic.elements["firstName"].value = "User";
    profileData.basic.elements["lastName"] = {};
    profileData.basic.elements["lastName"].value = "0";
    profileData.basic.elements["email"] = {};
    profileData.basic.elements["email"].value = "user.0@sakatest.edu";

    var data = {
        "pwd": "test",
        "pwdConfirm": "test",
        ":name": user_random,
        "sakai:authprofile_import": $.toJSON(profileData)
    };

    sakai.api.User.createUser(data, function(success, data){
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

})();