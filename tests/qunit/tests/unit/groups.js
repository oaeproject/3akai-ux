$(function() {

module("Groups");

var group_id = ("grouprandom" + (new Date()).getTime()),
    group_title = "Sakai Group",
    group_desc = "Sakai Group is the best group",
    group_new_title = "New Sakai Group",
    group_new_desc = "Sakai Group will never be the best group";


asyncTest("Log-in with a Sakai3 admin user - need to do this to create a group", 1, function(){
    sakai.api.User.login({
        "username": "admin",
        "password": "admin"
    }, function(success, data){
        ok(success, "The admin user has successfully logged-in");
        start();
    });
});

asyncTest("Create group", 1, function() {
    stop(2000);
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
    sakai.api.User.loadMeData(function() {
        ok(sakai.api.Groups.isCurrentUserAManager(group_id), "/system/me says the user who created the group is a manager of the group");
        start();
    });
});

test("User is a manager of the group", 1, function() {
    $.ajax({
        url: "/system/userManager/group/" + group_id + "-managers.members.detailed.json",
        async: false,
        success: function(data) {
            ok(data[0]["rep:userId"] === "admin", "Admin is a member of the group");
        },
        error: function(xhr, textStatus) {
            ok(false, "Could not get group manager info");
        }
    });
});

test("User is not a member of the group", 1, function() {
    $.ajax({
        url: "/system/userManager/group/" + group_id + "-managers.members.detailed.json",
        async: false,
        success: function(data) {
            ok(data[0]["rep:userId"] === "admin", "Admin is a member of the group");
        },
        error: function(xhr, textStatus) {
            ok(false, "Could not get group manager info");
        }
    });
});

});
