require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {

    require.ready(function() {

        sakai_global.qunit.loginWithAdmin();

        asyncTest("Create 5 Sakai 3 users", 5 , function(){
            var user_random = "userrandom_" + (new Date()).getTime();
            sakai.api.User.createUser(user_random, "User1", "LastName1", "user.1@sakatest.edu", "test", "test", null, function(success, data){
                sakai.api.Util.tagEntity("~" + user_random + "/public/authprofile", "tag1", "", false);
                ok(success, "The user has been successfully created");
                var user_random = "userrandom_" + (new Date()).getTime();
                sakai.api.User.createUser(user_random, "User2", "LastName2", "user.2@sakatest.edu", "test", "test", null, function(success, data){
                    ok(success, "The user has been successfully created");
                    var user_random = "userrandom_" + (new Date()).getTime();
                    sakai.api.User.createUser(user_random, "user3", "LastName3", "User.3@sakatest.edu", "test", "test", null, function(success, data){
                        ok(success, "The user has been successfully created");
                        var user_random = "userrandom_" + (new Date()).getTime();
                        sakai.api.User.createUser(user_random, "User4", "LastName4", "User.4@sakatest.edu", "test", "test", null, function(success, data){
                            ok(success, "The user has been successfully created");
                            var user_random = "userrandom_" + (new Date()).getTime();
                            sakai.api.User.createUser(user_random, "User5", "LastName5", "user.5@sakatest.edu", "test", "test", null, function(success, data){
                                ok(success, "The user has been successfully created");
                                start();
                            });
                        });
                    });
                });
            });
        });

        asyncTest("Create 5 groups", 5, function(){
            var group_random = "grouprandom_" + (new Date()).getTime();
            sakai.api.Groups.createGroup(group_random, "Group1", "test", sakai.data.me, function(success, nameTaken){
                ok(success, "The group has been successfully created");
                var group_random = "grouprandom_" + (new Date()).getTime();
                sakai.api.Groups.createGroup(group_random, "testgroup 2", "group 2", sakai.data.me, function(success, nameTaken){
                    ok(success, "The group has been successfully created");
                    var group_random = "grouprandom_" + (new Date()).getTime();
                    sakai.api.Groups.createGroup(group_random, "caseinsensitive", "Capital Group 3", sakai.data.me, function(success, nameTaken){
                        ok(success, "The group has been successfully created");
                        var group_random = "grouprandom_" + (new Date()).getTime();
                        sakai.api.Groups.createGroup(group_random, "Integration test group 4", "capital group 4 description", sakai.data.me, function(success, nameTaken){
                            ok(success, "The group has been successfully created");
                            var group_random = "grouprandom_" + (new Date()).getTime();
                            sakai.api.Groups.createGroup(group_random, "Random group name for testing purposes", "Group 5", sakai.data.me, function(success, nameTaken){
                                sakai.api.Util.tagEntity("~" + group_random + "/public/authprofile", "tag2", "", false);
                                ok(success, "The group has been successfully created");
                                start();
                            });
                        });
                    });
                });
            });
        });

        asyncTest("Search users (by tag) Query: 'tag1 tag2'", 1, function(){
            var randomNumber = (new Date()).getTime();
            $.ajax({
                url : "http://localhost:8080/var/search/users.infinity.json?_=" + randomNumber + "&page=0&items=10&sortOn=lastName&sortOrder=asc&q=tag1 tag2",
                type : "GET",
                cache : false,
                success : function(data){
                    var names = [];
                    for(var item in data.results){
                        names.push(data.results[item].basic.elements.firstName.value + " " + data.results[item].basic.elements.lastName.value);
                    }
                    if (names.toString()) {
                        ok(true, "The search succeeded: " + names.toString().replace(/,/g, ", ") + " returned.");
                    }else{
                        ok(false, "The search failed: Nothing was returned.");
                    }
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });

        // Do some searches for common fields and match those results to define success or failure
        asyncTest("Search users (by first name, last name). Query: 'user3 lastname4'", 1, function(){
            var randomNumber = (new Date()).getTime();
            $.ajax({
                url : "http://localhost:8080/var/search/users.infinity.json?_=" + randomNumber + "&page=0&items=10&sortOn=lastName&sortOrder=asc&q=user3 lastname4",
                type : "GET",
                cache : false,
                success : function(data){
                    var names = [];
                    for(var item in data.results){
                        names.push(data.results[item].basic.elements.firstName.value + " " + data.results[item].basic.elements.lastName.value);
                    }
                    if(names.toString()){
                        ok(true, "The search succeeded: " + names.toString().replace(/,/g, ", ") + " returned.");
                    }else{
                        ok(false, "The search failed: Nothing was returned.");
                    }
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });

        asyncTest("Search groups (by title, description). Query: 'group1 description'", 1, function(){
            var randomNumber = (new Date()).getTime();
            $.ajax({
                url : "http://localhost:8080/var/search/groups.infinity.json?_=" + randomNumber + "&page=0&items=10&q=description",
                type : "GET",
                cache : false,
                success : function(data){
                    var titles = [];
                    for(var item in data.results){
                        titles.push(data.results[item]["sakai:group-title"]);
                    }
                    if (titles.toString()) {
                        ok(true, "The search succeeded: " + titles.toString().replace(/,/g, ", ") + " returned.");
                    }else{
                        ok(false, "The search failed: Nothing was returned.");
                    }
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });

        asyncTest("Search groups (by title -> case insensitive). Query: 'CASEINSENSITIVE'", 1, function(){
            var randomNumber = (new Date()).getTime();
            $.ajax({
                url : "http://localhost:8080/var/search/groups.infinity.json?_=" + randomNumber + "&page=0&items=10&q=CASEINSENSITIVE",
                type : "GET",
                cache : false,
                success : function(data){
                    var titles = [];
                    for(var item in data.results){
                        titles.push(data.results[item]["sakai:group-title"]);
                    }
                    ok(true, "The search succeeded: " + titles.toString().replace(/,/g, ", ") + " returned.");
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });
    });
});