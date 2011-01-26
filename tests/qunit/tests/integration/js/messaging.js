require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {
    
    require.ready(function() {

        module("Messaging");

        var userlist = ["user1" + (new Date()).getTime(), "user2" + (new Date()).getTime()],
            dummyMessage = "This is a messaging test",
            dummySubject = "Test subject",
            dummyUser = "userrandom_" + (new Date()).getTime(),
            dummyCategory = "sakai",
            pathToMessages = [],
            responseID;

        sakai_global.qunit.loginWithAdmin();

        asyncTest("Create a couple of users to send messages", 2, function() {
            sakai.api.User.createUser(userlist[0], "User", "0", "user.0@sakatest.edu", "test", "test", null, function(success, data) {
                ok(success, "The first user has been successfully created");
                sakai.api.User.createUser(userlist[1], "User", "0", "user.0@sakatest.edu", "test", "test", null, function(success, data) {
                    ok(success, "The second user has been successfully created");
                    start();
                });
            });
        });

        asyncTest("Send message to one person", 3, function(){
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me.user.userid, dummySubject, dummyMessage, "", "", function(success, data) {
                ok(data, "The message was sent succesfully");

                //check the body of the response
                same(data.message["sakai:body"], dummyMessage, "The body was returned correctly");

                //check the subject of the response
                same(data.message["sakai:subject"], dummySubject, "The subject was returned correctly");

                //save the path to the message
                pathToMessages.push(data.message["jcr:path"]);
                responseID = data.id;
                start();
            });
        });

        asyncTest("Send a reply to the message", 3, function() {
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me.user.userid, dummySubject, "RE:" + dummyMessage, "", responseID, function(success, data) {
                //test that some data came in
                ok(success && data, "The reply was successful");

                //test that the body was correct
                same(data.message["sakai:body"], "RE:" + dummyMessage, "The body was returned correctly");

                //test that the id of the previous message is in the response of the reply
                same(data.message["sakai:previousmessage"], responseID, "The previousmessage id equals the id of the first message");

                pathToMessages.push(data.message["jcr:path"]);
                start();
            });
        });

        asyncTest("Send message to one person with a different category", 4, function(){
            //send a message with a custom category
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me.user.userid, dummySubject, dummyMessage, dummyCategory, "", function(success, data) {
                ok(success && data, "The message was sent succesfully");

                //check the body of the response
                same(data.message["sakai:body"], dummyMessage, "The body was returned correctly");

                //check the subject of the response
                same(data.message["sakai:subject"], dummySubject, "The subject was returned correctly");

                //check if the category was saved correctly
                same(data.message["sakai:category"], dummyCategory, "The category was saved correctly");

                //save the path to the message
                pathToMessages.push(data.message["jcr:path"]);
                start();
            });
        });

        asyncTest("Send message to multiple users", 4, function(){

            //change the dummyUser to an array of users
            dummyUser = ["user1","user2"];

            //send message with multiple users
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me.user.userid, dummySubject, dummyMessage, "", "", function(success, data) {
                ok(data, "The message was sent succesfully");

                //check the body of the response
                same(data.message["sakai:body"], dummyMessage, "The body was returned correctly");

                //check the subject of the response
                same(data.message["sakai:subject"], dummySubject, "The subject was returned correctly");

                // check the user list
                same(data.message["sakai:to"], "internal:user1,internal:user2", "The users to whom the message was sent were correct");

                //save the path to the message
                pathToMessages.push(data.message["jcr:path"]);
                start();
            });
        });

        asyncTest("Cleanup users and messages", 2, function() {

            // remove users
            var requests = [];
            $(userlist).each(function(i,val) {
                var req = {
                    "url": "/system/userManager/" + val + ".delete.json",
                    "method": "POST"
                };
                requests.push(req);
            });
            $.ajax({
                url: sakai.config.URL.BATCH,
                async: false,
                data: {
                    requests: $.toJSON(requests)
                },
                complete: function(xhr, textStatus) {
                    ok(textStatus === "success", "Deleted two users");
                }
            });

            // remove messages
            requests = [];
            for (var i=0,j=pathToMessages.length;i<j;i++) {
                var request = {
                    "url":pathToMessages[i],
                    "method":"DELETE"
                };
                requests.push(request);
            }

            $.ajax({
                url: sakai.config.URL.BATCH,
                type: "POST",
                async:false,
                data: {
                    requests: $.toJSON(requests)
                },
                complete: function(xhr, textStatus){
                    ok(textStatus === "success", "Deleted the messages");
                    start();
                }
            });
        });

    });
});