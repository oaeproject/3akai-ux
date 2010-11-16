module("Clean Javascript");
$(function() {
var jsfiles = [
        "/dev/javascript/account_preferences.js",
        "/dev/javascript/content_profile.js",
        "/dev/javascript/createnewaccount.js",
        "/dev/javascript/directory.js",
        "/dev/javascript/group.js",
        "/dev/javascript/group_edit.js",
        "/dev/javascript/inbox.js",
        "/dev/javascript/index.js",
        "/dev/javascript/logout.js",
        "/dev/javascript/mysakai.js",
        "/dev/javascript/people.js",
        "/dev/javascript/profile_edit.js",
        "/dev/javascript/sakai.403.js",
        "/dev/javascript/sakai.404.js",
        "/dev/javascript/sakai.500.js",
        "/dev/javascript/search.js",
        "/dev/javascript/search_content.js",
        "/dev/javascript/search_groups.js",
        "/dev/javascript/search_main.js",
        "/dev/javascript/search_people.js",
        "/dev/javascript/show.js",
        "/dev/javascript/_history/search_history.js",
        "/dev/javascript/_history/site_history.js",
        "/dev/lib/sakai_util/sakai_magic.js",
        "/dev/s23/javascript/s23_site.js",
        "/dev/admin/javascript/admin_widgets.js",
        "/dev/configuration/config.js",
        "/dev/configuration/config_custom.js",
        "/dev/configuration/widgets.js"
    ],
    consoleregex = new RegExp(/console\.(?:log|warn|error|debug|trace)/g),
    alertregex = new RegExp(/alert\([.\s\S]*\)/g);

// Grab all the widget's js files
for (var x in sakai.widgets.widgets) {
    if (sakai.widgets.widgets.hasOwnProperty(x) && sakai.widgets.widgets[x].url) {
        jsfiles.push("/devwidgets/" + x + "/javascript/" + x + ".js");
    }
}

var checkForConsoleLog = function(file, filename) {
    var matches = consoleregex.exec(file);
    if (filename === "/dev/lib/sakai_util/sakai_magic.js" && matches && matches.length === 1) {
        ok(true, "Found a single console.log in sakai_magic which is the only one allowed as it is the wrapper for debug.log");
    } else if (matches && matches.length) {
        for (var i=0,j=matches.length; i<j; i++) {
            ok(false, "found console.(log|warn|error|debug|trace)");
        }
    } else {
        ok(true, "No console.(log|warn|error|debug|trace) calls");
    }
};

var checkForAlert = function(file) {
    var matches = alertregex.exec(file);
    if (matches && matches.length) {
        for (var i=0,j=matches.length; i<j; i++) {
            ok(false, "found alert()");
        }
    } else {
        ok(true, "No alert() found");
    }
};

for (var i=0, j=jsfiles.length; i<j; i++) {
    var file = jsfiles[i];
    (function(filename) {
        $.ajax({
            async: false,
            dataType: "text",
            url: filename,
            success: function(data) {
                test(filename, function() {
                    checkForConsoleLog(data, filename);
                    checkForAlert(data);
                });
            }
        });
    })(file);
}

});