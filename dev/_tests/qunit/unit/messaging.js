module("Messaging");

var userlist;
var dummyMessage = "This is a messaging test";
var dummySubject = "Test subject";
var dummyUser = "user2";
var dummyCategory = "sakai";
var d;
var u1time;
var dummyReply;
var pathToMessages;

/**
 * Delete all messages that were sent during the test
 */
var deleteMessages = function(){
    var messages = [];
    //loop over all the messages sent during the test
    for (var i = 0,j=pathToMessages.length;i<j;i++) {
        //console.log(pathToMessages[i]);

        //create a json object containing the request to delete the message
        var message = {
            "url":pathToMessages[i],
            "method":"DELETE"
        };
        //create one big json object containing all the requests
        messages.push(message);
    }

    //convert the json object with the requests to a string
    var data = $.toJSON(messages);

    //post the requests to the system/batch servlet which will process all the requests
    $.ajax({
        url: "/system/batch",
        type: "POST",
        data : {
            "requests": data
        }
    });
};

/**
 * Test all that's coming in and send a reply
 * @param {boolean} bool Whether the message has been sent succesfully or not
 * @param {Object} data The data coming in from the respons (the message)
 */
var testMessageCallback = function(bool, data){
    //check if there's data returned
    ok(data, "The message was sent succesfully");

    //save the values from the response into variables
    var responseMessage = data.message["sakai:body"];
    var responseSubject = data.message["sakai:subject"];
    var responseCategory = data.message["sakai:category"];

    //check the body of the response
    same(responseMessage, dummyMessage, "The body was returned correctly");

    //check the subject of the response
    same(responseSubject, dummySubject, "The subject was returned correctly");

    //if the category is different than the standard one, check if the category was saved correctly
    if(data.message["sakai:category"] !== "message"){
        same(responseCategory, dummyCategory, "The category was saved correctly");
    }

    //check if the users sent to are correct
    if(typeof(dummyUser) !== "string"){
        same(data.message["sakai:to"], "internal:user1,internal:user2", "The users to whom the message was sent were correct");
    }

    //save the path to the message
    pathToMessages.push(data.message["jcr:path"]);

    //send a reply to the message we just sent
    dummyReply = data.id;
    dummyMessage = "RE:" + dummyMessage;
    sendMessage("",dummyReply);
};

/**
 * Test the reply message and start the next test
 * @param {boolean} bool Whether the message has been sent succesfully or not
 * @param {Object} data The data coming in from the respons (the reply message)
 */
var testReplyCallback = function(bool,data){
    //test that some data came in
    ok(data, "The reply was successful");

    //test that the body was correct
    same(data.message["sakai:body"], dummyMessage, "The body was returned correctly");

    //test that the id of the previous message is in the response of the reply
    same(data.message["sakai:previousmessage"], dummyReply, "The previousmessage id equals the id of the first message");

    //reset the data to its start values
    dummyReply="";
    dummyMessage = dummyMessage.substring(3);
    pathToMessages.push(data.message["jcr:path"]);

    //start the testrunner for the other tests
    start();
};

/**
 * Login into sakai with user1 and send a message to dummyUser with subject = dummySubject and text = dummyMessage
 * @param {String} category The category of the message
 * @param {String} reply The id of the message on which we reply
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
            //check if it's a normal message or a reply, change the callback function
            if(reply == ""){
                sakai.api.Communication.sendMessage(dummyUser, dummySubject, dummyMessage, category, reply, testMessageCallback);
            }else{
                sakai.api.Communication.sendMessage(dummyUser, dummySubject, dummyMessage, category, reply, testReplyCallback);
            }
        },
        error:function(){
            ok(false, "Couldn't login");
            start();
        }
    });
};

asyncTest("Messaging: Send message to one person", function(){
    //send a message
    sendMessage("","");
});

asyncTest("Messaging: Send message to one person with a different category", function(){
    //send a message with a custom category
    sendMessage(dummyCategory,"");
});

asyncTest("Messaging: Send message to multiple users", function(){
    //change the dummyUser to an array of users
    dummyUser = ["user1","user2"];
    //send message with multiple users
    sendMessage("","");
});

/**
 * A recursive function that creates users from the userlist
 * @param {Integer} count The current number of the user in the userlist array
 */
var createDummyUsers = function(count){

    if(count !== userlist.length){

        $.ajax({
            url: "/system/userManager/user.create.json",
            type: "POST",
            data: userlist[count],
            complete: function(){
                count++;
                createDummyUsers(count);
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
 * @param {String} name The name of the current module that is running
 */
QUnit.moduleStart = function(name) {
    if(name === "Messaging"){
        d = new Date();
        u1time = d.getMilliseconds();
        dummyUser = dummyUser + u1time;
        pathToMessages = [];
        userlist = [
                    {"firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user1"+u1time},
                    {"firstName": "Second", "lastName": "User", "email": "second.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user2"+u1time}
                ];
        //create users
        createDummyUsers(0);
    }
};

/**
 * After the test is done, we undo some of the things we did during the test to keep sakai clean.(equal to tearDown in JUnit)
 * In this case, if the test is a messaging test, we remove all the dummy users
 * @param {String} name The name of the current module that is running
 * @param {int} failures The amount of tests that have failed in this module
 * @param {int} total The total amount of tests in this module
 */
QUnit.moduleDone = function(name, failures, total) {
    if(name === "Messaging"){

        //remove messages
        deleteMessages();

        //remove users
        removeUsers(0);
    }
};