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

        var makeCSSFormattingTest = function(filename) {
            asyncTest(filename, function() {
                $.ajax({
                    dataType: 'text',
                    url: filename,
                    success: function(data) {
                        checkCss(data);
                        start();
                    }, error: function() {
                        QUnit.ok(true, 'This widget does not have a CSS file associated to it.');
                        start();
                    }
                });
            });
        };

        /**
         * Initializes the CSS Formatting module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var cssFormattingTest = function(widgets) {
            QUnit.load();

            // Test the widget CSS files
            $.each(widgets, function(i, widget) {
                makeCSSFormattingTest('/node_modules/oae-core/' + widget.id + '/css/' + widget.id + '.css');
            });

            // Test the core CSS files
            var coreCSS = ['oae.base', 'oae.components', 'oae.core', 'oae.skin', 'oae.skin.gt', 'oae.skin.gt'];
            $.each(coreCSS, function(ii, coreCSSFile) {
                makeCSSFormattingTest('/shared/oae/css/' + coreCSSFile + '.css');
            });
        };

        util.loadWidgets(cssFormattingTest);
    }
);
