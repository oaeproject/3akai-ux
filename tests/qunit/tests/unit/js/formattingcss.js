require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ], function($, sakai) {

        module('CSS formatting');

        var doRegexTest = function(cssFile, regex, testString) {
            var match = '';
            var pass = true;
            var errorString = '';
            var count = 0;

            while ((match = regex.exec(cssFile)) !== null){
                count++;
                pass = false;
                errorString = errorString + '\n' + match;
            }

            if (pass) {
                ok(true, testString);
            } else {
                ok(false, testString + ', ' + count + ' error(s): ' + errorString);
            }
        }

        var checkCss = function(cssFile) {

            // test space before brace character
            var regex = /[a-zA-Z0-9]+\{/gm;
            var testString = 'Use space before opening brace';
            doRegexTest(cssFile, regex, testString);

            // test opening brace is on selector line
            regex = /^\s*\{/gm;
            testString = 'Put opening brace on selector line';
            doRegexTest(cssFile, regex, testString);

            // test expression is on a new line
            regex = /\{.+/gm;
            testString = 'Put expression on a new line';
            doRegexTest(cssFile, regex, testString);

            // test close brace is on a new line
            regex = /.+\}/gm;
            testString = 'Put close brace on a new line';
            doRegexTest(cssFile, regex, testString);

            // test expression has space after colon
            regex = /(\{|;)\s*\n\s+[\S]+:[\S]+/gm;
            testString = 'Put space after expression colon';
            doRegexTest(cssFile, regex, testString);

            // test expression is intented
            regex = /(\{|;)\s*\n[a-z-A-Z0-9]+/gm;
            testString = 'Indent expression 4 spaces';
            doRegexTest(cssFile, regex, testString);

        };

        /**
         * Check JavaScript formatting
         */
        var checkCssFormatting = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            QUnit.start();
            for (var j = 0; j < sakai_global.qunit.allCssFiles.length; j++) {
                var urlToCheck = sakai_global.qunit.allCssFiles[j];
                (function(url) {
                    asyncTest(url, function() {
                        $.ajax({
                            dataType: 'text',
                            url: url,
                            success: function(data) {
                                // remove comments
                                data = data.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
                                checkCss(data);
                                start();
                            },
                            error: function() {
                                // the css file probably doesn't exist
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
            checkCssFormatting();
        } else {
            $(window).bind('ready.qunit.sakai', function() {
                checkCssFormatting();
            });
        }
    }
);
