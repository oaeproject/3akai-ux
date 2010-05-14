module("Messaging");

var dummyMessage = "This is a messaging test";
var dummySubject = "Test subject";
var dummyUser = "user2";
var dummyCategory = "sakai";
var d;
var u1time;
var userlist;

/**
 * Test all that's coming in
 */
var testMessageCallback = function(bool, data){
    //check if there's data returned
    ok(data, "The message was sent succesfully")
    var responseMessage = data.message["sakai:body"];
    var responseSubject = data.message["sakai:subject"];
    var responseCategory = data.message["sakai:category"];
    same(responseMessage, dummyMessage, "The body was returned correctly");
    same(responseSubject, dummySubject, "The subject was returned correctly");
    if(data.message["sakai:category"] != "message")    same(responseCategory, dummyCategory, "The category was saved correctly");
    start();
}

/**
 * Get a user to send to (NOT USED FOR NOW)
 */
var getUser = function(){
    searchURL = sakai.config.URL.SEARCH_USERS + "?items=1&username=user2"+u1time+"&s=sakai:firstName&s=sakai:lastName";
    $.ajax({
        url: searchURL,
        type: "GET",
        success: function(data){
            //found user, save it into a global variable
            alert(data);
        },
        error: function(){
            //no user was found
        }
    });
}

/**
 * Login into sakai with user1 and send a message to dummyUser with subject = dummySubject and text = dummyMessage
 */
var sendMessage = function(category, reply){
    //login first before sending a message
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
        	sakai.api.Communication.sendMessage(dummyUser+u1time, dummySubject, dummyMessage, category, reply, testMessageCallback);
        },
        error:function(){
        	ok(false);
        	start();
        }
    });
}

asyncTest("Messaging: Send message to one person", function(){
    //login
    sendMessage("","");
});

asyncTest("Messaging: Send message to one person with a different category", function(){
	//login
    sendMessage(dummyCategory,"");
});

/**
 * A recursive function that creates users from the userlist
 * @param {Integer} count The current number of the user in the userlist array
 */
var createUsers = function(count){

    if(count !== userlist.length){
        //var username = userlist[count].firstName + " " + userlist[count].lastName;
        
        $.ajax({
            url: "/system/userManager/user.create.json",
            type: "POST",
            data: userlist[count],
            success: function(data){
                //log("Created " + username, true);
            },
            error: function(data){
                //log("Failed to create " + username, false);
            },
            complete: function(){
                count++;
                createUsers(count);
            }
        });
    }
};

/**
 * A recursive function that removes users from the userlist
 * @param {Integer} count The current number of the user in the userlist array
 */
var removeUsers = function(count){
    
    if(count !== userlist.length){
        var username = userlist[count][":name"];
        $.ajax({
            url: "/system/userManager/" + username + ".delete.json",
            type: "POST",
            success: function(data){
                //log("Created " + username, true);
            },
            error: function(data){
                //log("Failed to create " + username, false);
            },
            complete: function(){
                count++;
                removeUsers(count);
            }
        });
    }
}

/**
 * Do some setup before the module starts (equal to setUp in JUnit)
 * In this case, if it's a messaging test, we create some dummy users
 */
QUnit.moduleStart = function (name) {
    if(name.match(/Messaging/)){
    	d = new Date();
    	u1time = d.getMilliseconds();
    	userlist = [
    	            {"firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user1"+u1time},
    	            {"firstName": "Second", "lastName": "User", "email": "second.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user2"+u1time}
    	        ];
        //create users
        createUsers(0);
    }
};

/**
 * After the test is done, we undo some of the things we did during the test to keep sakai clean.(equal to tearDown in JUnit)
 * In this case, if the test is a messaging test, we remove all the dummy users
 */
QUnit.moduleDone = function (name, failures, total) {
    if(name.match(/Messaging/)){
        //remove users
        removeUsers(0);
    }
};