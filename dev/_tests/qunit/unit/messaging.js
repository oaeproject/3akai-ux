module("Messaging");

var dummyMessage = "This is a messaging test";
var dummySubject = "Test subject";
var dummyUser = "user2";
var dummyCategory = "sakai";
var d;
var u1time;
var dummyReply;
var pathToMessages;

/**
 * Test all that's coming in and send a reply
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
            ok(false);
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