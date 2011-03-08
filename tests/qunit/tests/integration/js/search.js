require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {

    require.ready(function() {

        var createdGroups = [];
        var createdUsers = [];

        /////////////////////////////////
        /////// LOGIN WITH ADMIN ////////
        /////////////////////////////////

        sakai_global.qunit.loginWithAdmin();


        //////////////////////////////
        /////// CREATE USERS /////////
        //////////////////////////////

        asyncTest("Create 5 Sakai 3 users", 5 , function(){
            var count = 0;
            function createUser(){
                if (count <= 4) {
                    var user_random = "userrandom_" + (new Date()).getTime();
                    sakai.api.User.createUser(user_random, user_random, "Lastname_" + user_random, user_random + "_" + "@sakatest.edu", "test", "test", null, function(success, data){
                        if(success){
                            createdUsers.push(user_random);
                            sakai.api.Util.tagEntity("~" + user_random + "/public/authprofile", user_random + "_tag" + count, "", function(){
                                ok(true, "The user has been successfully created");
                                count++;
                                createUser();
                            });
                        }else{
                            ok(false, "The user could not be created");
                            createUser();
                        }
                    });
                }else{
                    start();
                }
            };
            createUser();
        });


        //////////////////////////////
        /////// CREATE GROUPS ////////
        //////////////////////////////

        asyncTest("Create 5 groups", 5, function(){
            var count = 0;
            function createGroup(){
                if (count <= 4) {
                    var group_random = "grouprandom_" + (new Date()).getTime();
                    sakai.api.Groups.createGroup(group_random, group_random + "_group_title", group_random + "_group_description", sakai.data.me, function(success, nameTaken){
                        if (success) {
                            createdGroups.push(group_random);
                            sakai.api.Util.tagEntity("~" + group_random + "/public/authprofile", group_random + "_tag" + count, "", function(){
                                ok(true, "The group has been successfully created");
                                count++;
                                createGroup();
                            });
                        }
                        else {
                            ok(false, "The group could not be created");
                            createGroup();
                        }
                    });
                }
                else {
                    start();
                }
            };
            createGroup();
        });


        ////////////////////////
        ///// SEARCH UTILS /////
        ////////////////////////

        var decideSuccess = function(results, expectedResult){
            if (results.length == 1) {
                if (results[0] === expectedResult) {
                    ok(true, "The search succeeded: " + results[0] + " returned as expected.");
                } else {
                    ok(false, "The search failed because the returned result was unexpected. Expecting: " + expectedResult + " and got " + results[0] + ".");
                }
            } else {
                if (results.length) {
                    ok(false, "The search failed: " + results.length + " results were returned, 1 expected.");
                } else {
                    ok(false, "The search failed: Nothing was returned.");
                }
            }
        };

        ////////////////////////
        ///// SEARCH USERS ////
        ///////////////////////

        asyncTest("Search users by tag", 1, function(){
            $.ajax({
                url : "http://localhost:8080/var/search/users.infinity.json?page=0&items=10&sortOn=lastName&sortOrder=asc&q=" + createdUsers[0] + "_tag" + 0,
                type : "GET",
                cache : false,
                success : function(data){
                    var names = [];
                    for(var item in data.results){
                        names.push(data.results[item].basic.elements.firstName.value);
                    }
                    decideSuccess(names, createdUsers[0] + "_tag" + 0);
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });

        asyncTest("Search users by last name.", 1, function(){
            $.ajax({
                url : "http://localhost:8080/var/search/users.infinity.json?page=0&items=10&sortOn=lastName&sortOrder=asc&q=" + "lastname_" + createdUsers[1],
                type : "GET",
                cache : false,
                success : function(data){
                    var names = [];
                    for(var item in data.results){
                        names.push(data.results[item].basic.elements.lastName.value);
                    }
                    decideSuccess(names, "Lastname_" + createdUsers[1]);
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });

        asyncTest("Search users by email.", 1, function(){
            $.ajax({
                url : "http://localhost:8080/var/search/users.infinity.json?page=0&items=10&sortOn=lastName&sortOrder=asc&q=" + createdUsers[2] + "_" + "@sakatest.edu",
                type : "GET",
                cache : false,
                success : function(data){
                    var emails = [];
                    for(var item in data.results){
                        emails.push(data.results[item].basic.elements.email.value);
                    }
                    decideSuccess(emails, createdUsers[2] + "_" + "@sakatest.edu");
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });


        ////////////////////////
        ///// SEARCH GROUPS ////
        ////////////////////////

        asyncTest("Search groups by title", 1, function(){
            $.ajax({
                url : "http://localhost:8080/var/search/groups.infinity.json?page=0&items=10&q=" + createdGroups[0] + "_group_title",
                type : "GET",
                cache : false,
                success : function(data){
                    var titles = [];
                    for(var item in data.results){
                        titles.push(data.results[item]["sakai:group-title"]);
                    }
                    decideSuccess(titles, createdGroups[0] + "_group_title");
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });

        asyncTest("Search groups by description", 1, function(){
            $.ajax({
                url : "http://localhost:8080/var/search/groups.infinity.json?page=0&items=10&q=" + createdGroups[1] + "_group_description",
                type : "GET",
                cache : false,
                success : function(data){
                    var descriptions = [];
                    for(var item in data.results){
                        descriptions.push(data.results[item]["sakai:group-description"]);
                    }
                    decideSuccess(descriptions, createdGroups[1] + "_group_description");
                    start();
                }, error: function(xhr, textStatus, thrownError){
                    ok(false, "The search failed: " + textStatus);
                    start();
                }
            });
        });
    });
});