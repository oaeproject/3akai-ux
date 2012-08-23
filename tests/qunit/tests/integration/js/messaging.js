require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

        module('Messaging');

        var userlist = ['user1' + (new Date()).getTime(), 'user2' + (new Date()).getTime()],
            dummyMessage = 'This is a messaging test',
            dummySubject = 'Test subject',
            dummyUser = 'userrandom_' + (new Date()).getTime(),
            dummyCategory = 'sakai',
            pathToMessages = [],
            responseID;

        var MessagingTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            sakai_global.qunit.loginWithAdmin();
            createUsers();
        };

        var createUsers = function() {
            asyncTest('Create a couple of users to send messages', 3, function() {
                sakai.api.User.createUser(dummyUser, 'Dummy', 'User', 'user.0@sakatest.edu', 'test', 'test', null, function(success, data) {
                    ok(success, 'The first user has been successfully created');
                    sakai.api.User.createUser(userlist[0], 'User', '0', 'user.0@sakatest.edu', 'test', 'test', null, function(success, data) {
                        ok(success, 'The first user has been successfully created');
                        sakai.api.User.createUser(userlist[1], 'User', '0', 'user.0@sakatest.edu', 'test', 'test', null, function(success, data) {
                            ok(success, 'The second user has been successfully created');
                            start();
                            sendMessage();
                        });
                    });
                });
            });
        };

        var sendMessage = function() {
            asyncTest('Send message to one person', 3, function() {
                sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, dummyMessage, '', '', function(success, data) {
                    ok(data, 'The message was sent succesfully');

                    //check the body of the response
                    same(data.message['sakai:body'], dummyMessage, 'The body was returned correctly');

                    //check the subject of the response
                    same(data.message['sakai:subject'], dummySubject, 'The subject was returned correctly');

                    //save the path to the message
                    pathToMessages.push(data.message);
                    responseID = data.id;
                    start();
                    unreadMessage();
                });
            });
        };

        var unreadMessage = function() {
            asyncTest('Count Unread Messages', 2, function() {
                var expected = 1;
                sakai.api.Communication.sendMessage(userlist[0], sakai.data.me, dummySubject, dummyMessage, '', '', function(success, data) {
                    sakai.api.User.logout(function(success) {
                        sakai.api.User.login({
                            'username': userlist[0],
                            'password': 'test'
                        }, function(success, data) {
                            // logging in doesn't set this!
                            sakai.api.User.data.me.user.userid = userlist[0];
                            sakai.api.User.loadMeData();
                            // have to wait for the indexer to run
                            setTimeout(function() {
                                sakai.api.Communication.getUnreadMessageCount('inbox', function(success, data) {
                                    ok(success);
                                    same(data, expected, 'User has one message');
                                    start();
                                    getInbox();
                                })
                            ;}, 6000);
                        });
                    });
                });
            });
        };

        var getInbox = function() {
            asyncTest('Get the messages in a user\'s inbox', 1, function() {
                sakai.api.Communication.getAllMessages('inbox', 'message', null, 10, 0, '_created', 'asc', function(success, data) {
                    if (data.results && data.results.length) {
                        equals(data.results.length, 1, 'Got one message from inbox');
                    } else {
                        ok(false, 'No messages returned');
                    }
                    start();
                    markRead();
                });
            });
        };

        var markRead = function() {
            asyncTest('Mark Message Read', 1, function() {
                sakai.api.Communication.getAllMessages('inbox', 'message', null, 10, 0, '_created', 'asc', function(success, data) {
                    if (data.results && data.results[0]) {
                        sakai.api.Communication.markMessagesAsRead(data.results[0], function(success, data) {
                            ok(data.results[0].success, 'Message marked as read');
                            start();
                            moveTrash();
                        });
                    } else {
                        ok(false, 'No messages found in inbox');
                        start();
                        moveTrash();
                    }
                });
            });
        };

        var moveTrash = function() {
            asyncTest('Move Message to Trash', 1, function() {
                sakai.api.Communication.getAllMessages('inbox', 'message', null, 13, 0, '_created', 'asc', function(success, data) {
                    if (data.results && data.results[0]) {
                        sakai.api.Communication.deleteMessages(data.results[0], false, function(success, data) {
                            ok(data.results[0].success, 'Message moved to trash');
                            start();
                            sakai_global.qunit.loginWithAdmin();
                            sendReply();
                        });
                    } else {
                        ok(false, 'No messages found in inbox');
                        start();
                        sakai_global.qunit.loginWithAdmin();
                        sendReply();
                    }
                });
            });
        };

        var sendReply = function() {
            asyncTest('Send a reply to the message', 3, function() {
                sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, 'RE:' + dummyMessage, '', responseID, function(success, data) {
                    //test that some data came in
                    ok(success && data && data.message, 'The reply was successful');

                    //test that the body was correct
                    same(data.message['sakai:body'], 'RE:' + dummyMessage, 'The body was returned correctly');

                    //test that the id of the previous message is in the response of the reply
                    same(data.message['sakai:previousmessage'], responseID, 'The previousmessage id equals the id of the first message');

                    pathToMessages.push(data.message);
                    start();
                    sendCategory();
                });
            });
        };

        var sendCategory = function() {
            asyncTest('Send message to one person with a different category', 4, function() {
                //send a message with a custom category
                sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, dummyMessage, dummyCategory, '', function(success, data) {
                    ok(success && data && data.message, 'The message was sent succesfully');

                    //check the body of the response
                    same(data.message['sakai:body'], dummyMessage, 'The body was returned correctly');

                    //check the subject of the response
                    same(data.message['sakai:subject'], dummySubject, 'The subject was returned correctly');

                    //check if the category was saved correctly
                    same(data.message['sakai:category'], dummyCategory, 'The category was saved correctly');

                    //save the path to the message
                    pathToMessages.push(data.message);
                    start();
                    sendToMultiple();
                });
            });
        };

        var sendToMultiple = function() {
            asyncTest('Send message to multiple users', 4, function() {
                //change the dummyUser to an array of users
                dummyUser = ['user1','user2'];

                //send message with multiple users
                sakai.api.Communication.sendMessage(dummyUser, sakai.data.me, dummySubject, dummyMessage, '', '', function(success, data) {
                    ok(success && data && data.message, 'The message was sent succesfully');

                    //check the body of the response
                    same(data.message['sakai:body'], dummyMessage, 'The body was returned correctly');

                    //check the subject of the response
                    same(data.message['sakai:subject'], dummySubject, 'The subject was returned correctly');

                    // check the user list
                    same(data.message['sakai:to'], 'internal:user1,internal:user2', 'The users to whom the message was sent were correct');

                    //save the path to the message
                    pathToMessages.push(data.message);
                    start();
                    cleanUp();
                });
            });
        };

        var cleanUp = function() {
            asyncTest('Cleanup users and messages', 3, function() {
                // remove users
                var requests = [];
                $(userlist).each(function(i,val) {
                    var req = {
                        'url': '/system/userManager/' + val + '.delete.json',
                        'method': 'POST'
                    };
                    requests.push(req);
                });
                sakai.api.Server.batch(requests, function(success, data) {
                    ok(success, 'Deleted two users');
                }, null, false);

                // remove messages
                sakai.api.Communication.deleteMessages(pathToMessages, true, function(success, data) {
                    ok(success);
                    var stat = true;
                    $.each(data.results, function(i, result) {
                        stat = stat && result.success;
                    });
                    ok(stat, 'Deleted ' + data.results.length + ' messages');
                    start();
                    sakai_global.qunit.logout();
                });
            });
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            MessagingTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                MessagingTest();
            });
        }

    }
);
