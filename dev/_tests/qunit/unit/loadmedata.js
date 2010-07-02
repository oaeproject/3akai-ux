module("Load me data");

(function(){

// Set the admin login data
var logindata = {
    "username": "admin",
    "password": "admin"
};

/**
 * The callback function for the loadme function, tests the data returned
 * @param {boolean} success Whether it was successful or not
 * @param {Object} data Contains the retrieved data or the xhr object
 */
var testMeData = function(success, data){

    //test if the profile node is included
    ok(data.profile, "check if there's profile information");

    //test if the user node is included
    ok(data.user, "check if there's user information");

    //test if the username is admin
    same(data.user.userid,"admin","Check the username");

    //start the next test
    start();
};

/**
 * Login and call the loadMeData function
 */
var testLoadMeData = function(){

    // Perform the login operation
    sakai.api.User.login(logindata, function(success){
        if (success) {
            //test the loadmedata function
            sakai.api.User.loadMeData(testMeData);
        }
        else {
            ok(false, "Could not log-in successfully");
            start();
        }
    });

};

/**
 * Run an asynchronous test
 */
asyncTest("Test if the correct data is retrieved and stored in the sakai.data.me object", function(){
    testLoadMeData();
});

})();