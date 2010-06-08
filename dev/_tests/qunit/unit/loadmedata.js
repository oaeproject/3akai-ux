module("Load me data");

(function(){

/**
 * The callback function for the loadme function, tests the data returned
 * @param {boolean }success Whether it was successful or not
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

    //login
    $.ajax({
        url: "/system/sling/formlogin",
        type: "POST",
        data: {
            "sakaiauth:login": 1,
            "sakaiauth:pw": "admin",
            "sakaiauth:un": "admin",
            "_charset_": "utf-8"
        },
        success:function(){

            //test the loadmedata function
            sakai.api.User.loadMeData(testMeData);
        },
        error:function(){
            ok(false, "Couldn't login");
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