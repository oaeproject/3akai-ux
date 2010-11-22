$(function() {

module("Groups");

var group_id = ("grouprandom" + (new Date()).getTime()),
    group_title = "Sakai Group",
    group_desc = "Sakai Group is the best group",
    group_new_title = "New Sakai Group",
    group_new_desc = "Sakai Group will never be the best group",
    user_random = "userrandom_" + (new Date()).getTime();


sakai.qunit.loginWithAdmin();

asyncTest("Create group", 1, function() {
    sakai.api.Groups.createGroup(group_id, group_title, group_desc, function(success, nameTaken) {
        ok(success, "Group Created");
        start();
    });
});

asyncTest("Create same group again", 1, function() {
    sakai.api.Groups.createGroup(group_id, group_title, group_desc, function(success, nameTaken) {
        ok(!success && nameTaken, "Group creation correctly failed");
        start();
    });
});

module("Group Membership");

asyncTest("/system/me membership test", 1, function() {
    sakai.api.User.loadMeData(function(success, data) {
        ok(success && sakai.api.Groups.isCurrentUserAManager(group_id), "/system/me says the user who created the group is a manager of the group");
        start();
    });
});

asyncTest("User is a manager of the group", 1, function() {
    sakai.api.Groups.getManagers(group_id, function(success, data) {
        if (success) {
            ok(data[0]["rep:userId"] === "admin", "Admin is a manager of the group");
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
            sakai.api.Groups.addUsersToGroup(group_id, "members", [user_random], function(success) {
                ok(success, "User was added to group");
                if (success) {
                    // check to see that they've been added to the group
                    sakai.api.Groups.getMembers(group_id, function(success, data) {
                        ok(data[0]["rep:userId"] === user_random, "User shows up in list of group members");
                        start();
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

// remove the user from the group
asyncTest("Removing user from the group's members", function() {
    sakai.api.Groups.removeUsersFromGroup(group_id, "members", [user_random], function(success) {
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
    sakai.api.Groups.addUsersToGroup(group_id, "managers", [user_random], function(success) {
        ok(success, "User was added to group");
        if (success) {
            // check to see that they've been added to the group
            sakai.api.Groups.getManagers(group_id, function(success, data) {
                ok(data[1]["rep:userId"] === user_random, "User shows up in list of group managers");
                start();
            });
        } else {
            start();
        }
    });
});

// remove the user from the group
asyncTest("Removing user from the group's managers", function() {
    sakai.api.Groups.removeUsersFromGroup(group_id, "managers", [user_random], function(success) {
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

sakai.qunit.logout();

asyncTest("Join the user to the group", 3, function() {
    sakai.api.User.login({
        "username": user_random,
        "password": "test"
    }, function(success, data) {
        if (success) {
            sakai.api.Groups.addJoinRequest(user_random, group_id, function(success) {
                ok(success, "Added a join request for the user");
                if (success) {
                    // check to see that the user is now a member of the group
                    sakai.api.Groups.getMembers(group_id, function(success, data) {
                        ok(data[0]["rep:userId"] === user_random, "User shows up in list of group members, join was successful");
                        if (success) {
                            sakai.api.User.loadMeData(function() {
                                ok(sakai.api.Groups.isCurrentUserAMember(group_id), "/system/me says the current user is a member of the groups");
                                start();
                            });
                        }
                    });
                }
            });
        }
    });
});

sakai.qunit.loginWithAdmin();

asyncTest("Cleanup", function() {
    sakai.api.User.removeUser(user_random, function(success, data) {
        ok(success, "Deleted user");
        start();
    });
    // TODO: Delete the group, as we don't have a way of doing that now
});

});
