/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'oae.core', '../js/util.js', 'qunitjs'], function($, oae, util) {

        module("CSS Formatting");

        var doRegexTest = function(cssFile, regex, testString) {
            // remove comments from file to test
            var testFile = cssFile.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
            var match = '';
            var pass = true;
            var errorString = '';
            var count = 0;

            if (regex.test(testFile)) {
                while ((match = regex.exec(cssFile)) !== null) {
                    var beforeMatch = cssFile.substring(0, match.index);
                    var matchLine = beforeMatch.split(/\n/).length;
                    count++;
                    pass = false;
                    errorString = errorString + '\n\nLine: ' + matchLine + '\nString:\n' + match + '';
                }
            }

            if (pass) {
                ok(true, testString);
            } else {
                ok(false, testString + ', ' + count + ' error(s): ' + errorString);
            }
        };

        var checkCSS = function(cssFile) {
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
            regex = /\S+\}/gm;
            testString = 'Put close brace on a new line';
            doRegexTest(cssFile, regex, testString);

            // test expression has space after colon
            regex = /(\{|;)\s*\n\s+[\S]+:[\S]+/gm;
            testString = 'Put space after expression colon';
            doRegexTest(cssFile, regex, testString);

            // test expression is indented
            regex = /(\{|;)\s*\n[a-z-A-Z0-9]+/gm;
            testString = 'Indent expression 4 spaces';
            doRegexTest(cssFile, regex, testString);
        };

        /**
         * Initializes the CSS Formatting module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var cssFormattingTest = function(widgetData) {
            // Test that the main CSS files are properly formatted
            $.each(widgetData.mainCSS, function(i, mainCSS) {
                asyncTest(i + '.css', function() {
                    checkCSS(mainCSS);
                    start();
                });
            });

            // Test that the shared CSS files are properly formatted
            $.each(widgetData.sharedCSS, function(ii, sharedCSS) {
                asyncTest(ii + '.css', function() {
                    checkCSS(sharedCSS);
                    start();
                });
            });

            // Test that the widget CSS files are properly formatted
            $.each(widgetData.widgetData, function(iii, widget) {
                asyncTest(iii + '.css', function() {
                    checkCSS(widget.css);
                    start();
                });
            });
        };

        util.loadWidgets(cssFormattingTest);

        QUnit.load();
        QUnit.start();
    }
);
