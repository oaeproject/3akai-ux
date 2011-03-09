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
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, dummyMessage, "", "", function(success, data) {
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

        asyncTest("Count Unread Messages", 2, function() {
            var expected = {"count": [{"group": "message", "count": 1}]};
            sakai.api.Communication.sendMessage(userlist[0], sakai.data.me, dummySubject, dummyMessage, "", "", function(success, data) {
                sakai.api.User.logout(function(success) {
                    sakai.api.User.login({
                        "username": userlist[0],
                        "password": "test"
                    }, function(success, data){
                        // logging in doesn't set this!
                        sakai.api.User.data.me.user.userid = userlist[0];
                        sakai.api.User.loadMeData();
                        // have to wait for the indexer to run
                        setTimeout(function(){
                            sakai.api.Communication.getUnreadMessageCount("inbox", function(success, data) {
                                ok(success);
                                same(data, expected, "User has one message");
                                start();
                            })
                        ;}, 6000);
                    });
                });
            });
        });

        asyncTest("Get the messages in a user's inbox", 2, function() {
            sakai.api.Communication.getAllMessages("inbox", "message", 13, 0, "sakai:created", "asc", function(success, data) {
                ok(success);
                equals(data.results.length, 1, "Got one message from inbox");
                start();
            });
        });

        asyncTest("Mark Message Read", 2, function() {
            sakai.api.Communication.getAllMessages("inbox", "message", 13, 0, "sakai:created", "asc", function(success, data) {
                var messagePath = data.results[0]["jcr:path"];
                sakai.api.Communication.markMessagesAsRead([messagePath], function(success, data) {
                    ok(success);
                    ok(data.results[0].success, "Message marked as read");
                    start();
                });
            });
        });

        asyncTest("Move Message to Trash", 2, function() {
            sakai.api.Communication.getAllMessages("inbox", "message", 13, 0, "sakai:created", "asc", function(success, data) {
                var messagePath = data.results[0]["jcr:path"];
                sakai.api.Communication.deleteMessages([messagePath], false, function(success, data) {
                    ok(success);
                    ok(data.results[0].success, "Message moved to trash");
                    start();
                });
            });
        });

        sakai_global.qunit.loginWithAdmin();

        asyncTest("Send a reply to the message", 3, function() {
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, "RE:" + dummyMessage, "", responseID, function(success, data) {
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
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, dummyMessage, dummyCategory, "", function(success, data) {
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
            sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, dummyMessage, "", "", function(success, data) {
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

        asyncTest("Cleanup users and messages", 3, function() {

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
            sakai.api.Communication.deleteMessages(pathToMessages, true, function(success, data){
                ok(success);
                var stat = true;
                $.each(data.results, function(i, result){
                    stat = stat && result.success;
                });
                ok(stat, "Deleted " + data.results.length + " messages");
                start();
            });
        });

    });
});
