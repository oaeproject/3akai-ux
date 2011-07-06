require(
    [
    "jquery", 
    "sakai/sakai.api.core",
    "../../../../tests/qunit/js/qunit.js",
    "../../../../tests/qunit/js/sakai_qunit_lib.js",
    "../../../../tests/qunit/js/dev.js",
    "../../../../tests/qunit/js/devwidgets.js",
    "../../../../tests/qunit/js/jshint.js"
    ], function($, sakai) {

    require.ready(function() {
        module("Clean Javascript");

        var consoleregex = new RegExp(/console\.(?:log|warn|error|debug|trace)/g),
            alertregex = new RegExp(/alert\([.\s\S]*\)/g);

        var checkForConsoleLog = function(file, filename) {
            var matches = consoleregex.exec(file);
            if (filename === "/dev/lib/sakai/sakai.dependencies.js" && matches && matches.length === 1) {
                ok(true, "Found a single console.log in sakai.dependencies.js which is the only one allowed as it is the wrapper for debug.log");
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

        var JSHintfile = function(data, callback) {
            var result = JSHINT(data, {
                sub:true // ignore dot notation recommendations - ie ["userid"] should be .userid
            });
            if (result) {
                ok(result, "JSHint clean");
            } else {
                for (var i=0,j=JSHINT.errors.length; i<j; i++) {
                    var error = JSHINT.errors[i];
                    if (error) {
                        ok(false, "JSHint error on line " + error.line + " character " + error.character + ": " + error.reason + ", " + error.evidence);
                    }
                }
            }
            callback();
        };

        var makeCleanJSTest = function(filename) {
            asyncTest(filename, function() {
                $.ajax({
                    dataType: "text",
                    url: filename,
                    success: function(data) {
                        checkForConsoleLog(data, filename);
                        checkForAlert(data);
                        JSHintfile(data, function() {
                            start();
                        });
                    }
                });
            });
        };

        var cleanJSTest = function() {
            for (var i=0, j=sakai_global.qunit.allJSFiles.length; i<j; i++) {
                var file = sakai_global.qunit.allJSFiles[i];
                makeCleanJSTest(file);
            }
            QUnit.start();
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            cleanJSTest();
        } else {
            $(window).bind("ready.qunit.sakai", function() {
                cleanJSTest();
            });
        }
    });
});
