module("Clean Javascript");
$(function() {
var consoleregex = new RegExp(/console\.(?:log|warn|error|debug|trace)/g),
    alertregex = new RegExp(/alert\([.\s\S]*\)/g);

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

var jslintfile = function(data) {
    var result = JSLINT(data, {
        sub:true // ignore dot notation recommendations - ie ["userid"] should be .userid
        });
    if (result) {
        ok(result, "JSLint clean");
    } else {
        for (var i=0,j=JSLINT.errors.length; i<j; i++) {
            var error = JSLINT.errors[i];
            if (error)
                ok(false, "JSLint error on line " + error.line + " character " + error.character + ": " + error.reason + error.evidence);
        }
    }
};

for (var i=0, j=sakai.qunit.jsFiles.length; i<j; i++) {
    var file = sakai.qunit.jsFiles[i];
    (function(filename) {
        $.ajax({
            async: false,
            dataType: "text",
            url: filename,
            success: function(data) {
                test(filename, function() {
                    checkForConsoleLog(data, filename);
                    jslintfile(data);
                    checkForAlert(data);
                });
            }
        });
    })(file);
}

});