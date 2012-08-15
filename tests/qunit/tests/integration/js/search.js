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

        var createdGroups = [];
        var createdUsers = [];

        var decideSuccess = function(results, expectedResult) {
            if (results.length === 1) {
                if (results[0] === expectedResult) {
                    ok(true, 'The search succeeded: ' + results[0] + ' returned as expected.');
                } else {
                    ok(false, 'The search failed because the returned result was unexpected. Expecting: ' + expectedResult + ' and got ' + results[0] + '.');
                }
            } else {
                if (results.length) {
                    ok(false, 'The search failed: ' + results.length + ' results were returned, 1 expected.');
                } else {
                    ok(false, 'The search failed: Nothing was returned.');
                }
            }
        };

        var SearchTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            sakai_global.qunit.loginWithAdmin();
            createUsers();
        };

        var createUsers = function() {
            asyncTest('Create 5 Sakai OAE users', 5 , function() {
                var count = 0;
                function createUser() {
                    if (count <= 4) {
                        var user_random = 'userrandom_' + (new Date()).getTime();
                        sakai.api.User.createUser(user_random, user_random, 'Lastname_' + user_random, user_random + '_' + '@sakatest.edu', 'test', 'test', null, function(success, data) {
                            if (success) {
                                createdUsers.push(user_random);
                                sakai.api.Util.tagEntity('/~' + user_random + '/public/authprofile', [user_random + '_tag' + count], [], function(success) {
                                    ok(true, 'The user has been successfully created');
                                    count++;
                                    createUser();
                                });
                            } else {
                                ok(false, 'The user could not be created');
                                searchUsers1();
                            }
                        });
                    } else {
                        setTimeout(function() {
                            start();
                            searchUsers1();
                        }, 6000);
                    }
                };
                createUser();
            });
        };

        var searchUsers1 = function() {
            asyncTest('Search users by tag (free-text tag search, not .tagged search)', 1, function() {
                $.ajax({
                    url : '/var/search/users.infinity.json?page=0&items=10&sortOn=lastName&sortOrder=asc&q=' + createdUsers[0] + '_tag' + 0,
                    type : 'GET',
                    cache : false,
                    success : function(data) {
                        var names = [];
                        for (var item in data.results) {
                            if (data.results.hasOwnProperty(item)) {
                                names.push(data.results[item].basic.elements.firstName.value);
                            }
                        }
                        decideSuccess(names, createdUsers[0] + '_tag' + 0);
                        start();
                        searchUsers2();
                    }, error: function(xhr, textStatus, thrownError) {
                        ok(false, 'The search failed: ' + textStatus);
                        start();
                        searchUsers2();
                    }
                });
            });
        };

        var searchUsers2 = function() {
            asyncTest('Search users by last name.', 1, function() {
                $.ajax({
                    url : '/var/search/users.infinity.json?page=0&items=10&sortOn=lastName&sortOrder=asc&q=' + 'lastname_' + createdUsers[1],
                    type : 'GET',
                    cache : false,
                    success : function(data) {
                        var names = [];
                        for(var item in data.results) {
                            if (data.results.hasOwnProperty(item)) {
                                names.push(data.results[item].basic.elements.lastName.value);
                            }
                        }
                        decideSuccess(names, 'Lastname_' + createdUsers[1]);
                        start();
                        searchUsers3();
                    }, error: function(xhr, textStatus, thrownError) {
                        ok(false, 'The search failed: ' + textStatus);
                        start();
                        searchUsers3();
                    }
                });
            });
        };

        var searchUsers3 = function() {
            asyncTest('Search users by email.', 1, function() {
                $.ajax({
                    url : '/var/search/users.infinity.json?page=0&items=10&sortOn=lastName&sortOrder=asc&q=' + createdUsers[2] + '_' + '@sakatest.edu',
                    type : 'GET',
                    cache : false,
                    success : function(data) {
                        var emails = [];
                        for(var item in data.results) {
                            if (data.results.hasOwnProperty(item)) {
                                emails.push(data.results[item].basic.elements.email.value);
                            }
                        }
                        decideSuccess(emails, createdUsers[2] + '_' + '@sakatest.edu');
                        start();
                    }, error: function(xhr, textStatus, thrownError) {
                        ok(false, 'The search failed: ' + textStatus);
                        start();
                    }
                });
            });
        };

        // TODO: Add search integration tests for worlds as well
        // TODO: Add search integration tests for content as well

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            SearchTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                SearchTest();
            });
        }

    }
);
