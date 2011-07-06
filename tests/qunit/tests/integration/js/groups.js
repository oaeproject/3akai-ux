require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {

    require.ready(function() {
        
        module("Groups");

        var group_id = ("grouprandom" + (new Date()).getTime()),
            group_title = "Sakai Group",
            group_desc = "Sakai Group is the best group",
            group_new_title = "New Sakai Group",
            group_new_desc = "Sakai Group will never be the best group",
            group_new_kind = "library",
            user_random = "userrandom_" + (new Date()).getTime(),
            group_template = sakai.api.Groups.getTemplate("group", "simplegroup");


        sakai_global.qunit.loginWithAdmin();

        asyncTest("Create group", 1, function() {
            sakai.api.Groups.createGroup(group_id, group_title, group_desc, sakai.data.me, group_template, function(success, nameTaken) {
                ok(success, "Group Created");
                start();
            });
        });

        asyncTest("Create same group again", 1, function() {
            sakai.api.Groups.createGroup(group_id, group_title, group_desc, sakai.data.me, group_template, function(success, nameTaken) {
                ok(!success && nameTaken, "Group creation correctly failed");
                start();
            });
        });

        module("Group Membership");

        asyncTest("/system/me membership test", 1, function() {
            sakai.api.User.loadMeData(function(success, data) {
                ok(success && sakai.api.Groups.isCurrentUserAManager(group_id, sakai.data.me), "/system/me says the user who created the group is a manager of the group");
                start();
            });
        });

        asyncTest("User is a manager of the group", 1, function() {
            sakai.api.Groups.getManagers(group_id, function(success, data) {
                if (success) {
                    ok(data && data[0] && data[0]["rep:userId"] === "admin", "Admin is a manager of the group");
                } else {
                    ok(false, "Could not get group manager info");
                }
                start();
            });
        });

        asyncTest("User is not a member of the group", 1, function() {
            sakai.api.Groups.getMembers(group_id, function(success, data) {
                if (success) {
                    ok(data.length === 0, "Admin is a member of the group");
                } else {
                    ok(false, "Could not get group member info");
                }
                start();
            });
        });

        // create a user to add to the group as a member
        asyncTest("Creating a new user and adding them to the group as a member", function() {
            sakai.api.User.createUser(user_random, "User", "0", "user.0@sakatest.edu", "test", "test", null, function(success, data) {
                ok(success, "The user has been successfully created");
                if (success) {
                    // add the user to the group
                    sakai.api.Groups.addUsersToGroup(group_id, "members", sakai.data.me, [user_random], function(success) {
                        ok(success, "User was added to group");
                        if (success) {
                            setTimeout(function() {
                                // check to see that they've been added to the group
                                sakai.api.Groups.getMembers(group_id, function(success, data) {
                                    ok(data && data[0] && data[0]["rep:userId"] === user_random, "User shows up in list of group members");
                                    start();
                                });
                            }, 6000);
                        } else {
                            start();
                        }
                    });
                } else {
                    start();
                }
            });
        });

        // remove the user from the group
        asyncTest("Removing user from the group's members", function() {
            sakai.api.Groups.removeUsersFromGroup(group_id, "members", [user_random], sakai.data.me, function(success) {
                ok(success, "Removing a user was successful");
                if (success) {
                    // check to see that they've been removed from the group
                    sakai.api.Groups.getMembers(group_id, function(success, data) {
                        ok(data.length === 0, "User was successfully removed from the members list");
                        start();
                    });
                } else {
                    start();
                }
            });
        });


        // create a user to add to the group as a manager
        asyncTest("Adding the user to the group as a manager", function() {
            // add the user to the group
            sakai.api.Groups.addUsersToGroup(group_id, "managers", [user_random], sakai.data.me, function(success) {
                ok(success, "User was added to group");
                if (success) {
                    // check to see that they've been added to the group
                    sakai.api.Groups.getManagers(group_id, function(success, data) {
                        var found = false;
                        for (var i in data) {
                            if (data[i]["rep:userId"] === user_random) {
                                found = true;
                            }
                        }
                        ok(found, "User shows up in list of group managers");
                        start();
                    });
                } else {
                    start();
                }
            });
        });

        // remove the user from the group
        asyncTest("Removing user from the group's managers", function() {
            sakai.api.Groups.removeUsersFromGroup(group_id, "managers", [user_random], sakai.data.me, function(success) {
                ok(success, "Removing a user was successful");
                if (success) {
                    // check to see that they've been removed from the group
                    sakai.api.Groups.getManagers(group_id, function(success, data) {
                        ok(data.length === 1, "User was successfully removed from the managers list");
                        start();
                    });
                } else {
                    start();
                }
            });
        });

        module("Group Joinability");

        // Test joinability
        asyncTest("Set the group as joinable", 1, function() {
            // set the group to joinable
            sakai.api.Groups.setPermissions(group_id, sakai.config.Permissions.Groups.joinable.user_direct, sakai.config.Permissions.Groups.visible["public"], function(success) {
                ok(success, "Set group permissions to allow anyone to join");
                start();
            });
        });

        sakai_global.qunit.logout();

        asyncTest("Join the user to the group", 3, function() {
            sakai.api.User.login({
                "username": user_random,
                "password": "test"
            }, function(success, data) {
                if (success) {
                    sakai.api.Groups.addJoinRequest(user_random, group_id, false, function(success) {
                        ok(success, "Added a join request for the user");
                        if (success) {
                            // check to see that the user is now a member of the group
                            sakai.api.Groups.getMembers(group_id, function(success, data) {
                                ok(data && data[0] && data[0]["rep:userId"] === user_random, "User shows up in list of group members, join was successful");
                                if (success) {
                                    sakai.api.User.loadMeData(function() {
                                        ok(sakai.api.Groups.isCurrentUserAMember(group_id, sakai.data.me), "/system/me says the current user is a member of the groups");
                                        start();
                                    });
                                }
                            });
                        } else {
                            start();
                        }
                    });
                } else {
                    start();
                }
            });
        });

        sakai_global.qunit.loginWithAdmin();

        module("Group Information");

        asyncTest("Change group information", function() {
            sakai.api.Groups.updateGroupInfo(group_id, group_new_title, group_new_desc, group_new_kind, function(success) {
                ok(success, "Changed group information");
                if (success) {
                    sakai.api.Groups.getGroupData(group_id, function(success, data) {
                        if (success) {
                            var profile = data.authprofile;
                            same(profile["sakai:group-title"], group_new_title, "Title set correctly");
                            same(profile["sakai:group-kind"], group_new_kind, "Kind set correctly");
                            same(profile["sakai:group-description"], group_new_desc, "Description set correctly");
                        }
                        start();
                    }, false);
                } else {
                    start();
                }
            });
        });

        module("Group Test Cleanup");

        asyncTest("Cleanup", function() {
            sakai.api.User.removeUser(user_random, function(success, data) {
                ok(success, "Deleted user");
                start();
            });
            // TODO: Delete the group, as we don't have a way of doing that now
        });

    });
});
