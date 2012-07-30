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

        module('Formatting');

        var checkJs = function(file, string, callback) {

            var regex = /[^=!]==[^=]/;
            ok(regex.test(string), file + ': Use \"===\" or \"!==\" instead of \"==\" and \"!=\""');

            regex = /^\s*{/;
            ok(regex.test(string), file + ': Put opening braces on the same line as the statement');

            regex = /^\s*const\s/;
            ok(regex.test(string), file + ': Use \"var <ALLCAPS>\" instead of \"const\"');

            regex = /\.(live|die|bind|unbind)\(/;
            ok(regex.test(string), file + ': Use \".on()\" and \".off()\" to attach event handlers');

            regex = /\.prototype\./;
            ok(regex.test(string), file + ': Do not extend prototypes');

            regex = /^\s*function\s/;
            ok(regex.test(string), file + ': Use \"var <functionName> = function() {\"');

            regex = /.{81}/;
            ok(regex.test(string), file + ': Limit lines to 80 characters');

            regex = /new\s+(Object|Array|Number|String|Boolean)\s*\(/;
            ok(regex.test(string), file + ': Use literal notation');

            regex = /(^|\s)(Object\.(freeze|preventExtensions|seal)|eval|with)(\s|$)/;
            ok(regex.test(string), file + ': Evil');

            regex = /"/;
            ok(regex.test(string), file + ': Use single quotes');

            regex = /(^|\s)typeof(\s|$)/;
            ok(regex.test(string), file + ': Use jquery or underscore for type checking');

            if ($.isFunction(callback)) {
                callback();
            }
        };

        /**
         * Check JavaScript formatting
         */
        var checkFormatting = function() {
            for (var j = 0; j < sakai_global.qunit.allJSFiles.length; j++) {
                var urlToCheck = sakai_global.qunit.allJSFiles[j];
                (function(url) {
                    asyncTest(url, function() {
                        $.ajax({
                            url: url,
                            success: function(data) {
                                // remove comments
                                data = data.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
                                checkJs(url, data, function() {
                                    start();
                                });
                            }
                        });
                    });
                })(urlToCheck);
            }
            QUnit.start();
            $(window).trigger('addlocalbinding.qunit.sakai');
        };

        /**
         * Run the test
         */

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            checkFormatting();
        } else {
            $(window).bind('ready.qunit.sakai', function() {
                checkFormatting();
            });
        }
    }
);
