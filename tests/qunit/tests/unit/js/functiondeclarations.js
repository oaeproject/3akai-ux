require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ], 
    function($, sakai) {

        module('Function declarations');

        var checkJs = function(file, string, i) {

            var error = ', index: ' + i + ', string: ' + string;

            var regex = /^\s*function\s/;
            ok(!regex.test(string), file + ': Use \"var <functionName> = function() {\"' + error);

        };

        /**
         * Check JavaScript function declarations
         */
        var checkFunctionDeclarations = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            QUnit.start();
            for (var j = 0; j < sakai_global.qunit.allJSFiles.length; j++) {
                var urlToCheck = sakai_global.qunit.allJSFiles[j];
                (function(url) {
                    asyncTest(url, function() {
                        $.ajax({
                            url: url,
                            success: function(data) {
                                // remove comments
                                data = data.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
                                var lines = data.split('\n');
                                $.each(lines, function(i, line) {
                                    checkJs(url, line, i);
                                });
                                start();
                            }
                        });
                    });
                })(urlToCheck);
            }
        };

        /**
         * Run the test
         */

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            checkFunctionDeclarations();
        } else {
            $(window).bind('ready.qunit.sakai', function() {
                checkFunctionDeclarations();
            });
        }
    }
);
