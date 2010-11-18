module("Groups");

$(function() {
    var group_id = ("grouprandom" + (new Date()).getTime()),
        group_title = "Sakai Group",
        group_desc = "Sakai Group is the best group",
        group_new_title = "New Sakai Group",
        group_new_desc = "Sakai Group will never be the best group";

    // first, login as admin so we can create some groups
    sakai.api.User.login({
        "username": "admin",
        "password": "admin"
    }, function(success, data){
        if (success) {
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

            asyncTest("Group Membership", 3, function() {
                // wait 5 seconds to make sure the group has been properly created
                setTimeout(function() {
                    sakai.api.User.loadMeData(function() {
                        ok(sakai.api.Groups.isCurrentUserAManager(group_id), "/system/me says the user who created the group is a manager of the group");
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
                        $.ajax({
                            url: "/system/userManager/group/" + group_id + ".members.detailed.json",
                            async: false,
                            success: function(data) {
                                ok(data.length === 0, "Admin is not a member of the group, only a manager");
                            },
                            error: function(xhr, textStatus) {
                                ok(false, "Could not get group member info");
                            }
                        });
                        start();
                    });
                }, 5000);
            });

            // asyncTest("Group Information", 1, function() {
            //     var groupProfileURL = "/~" + group_id + "/public/authprofile";
            //     $.ajax({
            //         url: groupProfileURL,
            //         data: {
            //             "_charset_":"utf-8",
            //             "sakai:group-title" : group_new_title,
            //             "sakai:group-kind" : groupKind,
            //             "sakai:group-description" : group_new_desc
            //         },
            //         type: "POST",
            //         success: function(data, textStatus) {
            //             
            //         }
            //     });
            // });

        }
    });
});
