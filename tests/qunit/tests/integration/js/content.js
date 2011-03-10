require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ],
    function($, sakai) {

    require.ready(function() {

        module("Content");

        var dummyUser = "userrandom_" + (new Date()).getTime(),
            contentPaths = [];

        sakai_global.qunit.loginWithAdmin();

        asyncTest("Get test content", 1, function(){
            $.ajax({
                url: "http://localhost:8080/var/search/pool/all.infinity.json?page=0&items=10&q=lorem*",
                async: false,
                success: function(data) {
                    $.each(data.results, function(i, result){
                        if (result.createdBy === "admin") {
                            contentPaths.push("/p/" + result["jcr:path"]);
                        }
                    });
                    var msg;
                    if (contentPaths.length > 0) {
                        msg = "Found content at " + $.toJSON(contentPaths);
                    } else {
                        msg = "Need at least one piece of content, did you remember to run createDummyContent.js?";
                    }
                    ok(contentPaths.length > 0, msg);
                },
                complete: function(xhr, textStatus) {
                    start();
                }
            });
        });

        asyncTest("Check viewers", 5, function() {
            sakai.api.Content.loadContentProfile(contentPaths[0], function(success, cprofile) {
                ok(success, "API Call returned successfully");
                ok(!sakai.api.Content.isUserAViewer(cprofile, dummyUser), "Dummyuser isn't a viewer");
                sakai.api.Content.changePermission(contentPaths[0], dummyUser, "viewer", function(success, data){
                    ok(success, "changePermission returned successfully");
                    sakai.api.Content.loadContentProfile(contentPaths[0], function(success, cprofile) {
                        ok(success, "loadContentProfile returned successfully");
                        ok(sakai.api.Content.isUserAViewer(cprofile, dummyUser), "Dummyuser is a viewer");
                        start();
                    });
                });
            });
        });

        asyncTest("Set File Permissions", 1, function() {
            sakai.api.Content.setFilePermissions("private", contentPaths, function(success) {
                // There doesn't appear to be a good way to verify that this worked
                ok(success, "API call returned successfully");
                start();
            });
        });

        asyncTest("Check managers", 3, function() {
            sakai.api.Content.loadContentProfile(contentPaths[0], function(success, cprofile) {
                ok(success, "API Call returned successfully");
                ok(sakai.api.Content.isUserAManager(cprofile, "admin"), "Admin is a manager");
                ok(!sakai.api.Content.isUserAManager(cprofile, dummyUser, "Dummy user isn't a manager"));
                start();
            });
        });

        sakai_global.qunit.logout();
    });
});
