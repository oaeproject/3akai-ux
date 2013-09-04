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

require(['jquery', 'oae.core', '/tests/qunit/js/util.js'], function($, oae, util) {

    module("CSS Formatting");

    /**
     * Test the CSS against a provided regular expression
     *
     * @param  {String}    cssFile        The CSS file to test
     * @param  {Object}    regex          The regular expression to test the CSS against
     * @param  {String}    description    The description of the test
     */
    var doRegexTest = function(cssFile, regex, description) {
        // Remove comments from file to test
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
            ok(true, description);
        } else {
            ok(false, description + ', ' + count + ' error(s): ' + errorString);
        }
    };

    /**
     * Prepares several regexes to test the CSS against and executes the test
     *
     * @param  {String}    cssFile    The CSS file to be tested
     */
    var checkCSS = function(cssFile) {
        // Test space before brace character
        var regex = /[a-zA-Z0-9]+\{/gm;
        var description = 'Use space before opening brace';
        doRegexTest(cssFile, regex, description);

        // Test opening brace is on selector line
        regex = /^\s*\{/gm;
        description = 'Put opening brace on selector line';
        doRegexTest(cssFile, regex, description);

        // Test expression is on a new line
        regex = /\{.+/gm;
        description = 'Put expression on a new line';
        doRegexTest(cssFile, regex, description);

        // Test close brace is on a new line
        regex = /\S+\}/gm;
        description = 'Put close brace on a new line';
        doRegexTest(cssFile, regex, description);

        // Test expression has space after colon
        regex = /(\{|;)\s*\n\s+[\S]+:[\S]+/gm;
        description = 'Put space after expression colon';
        doRegexTest(cssFile, regex, description);

        // Test expression is indented
        regex = /(\{|;)\s*\n[a-z-A-Z0-9]+/gm;
        description = 'Indent expression 4 spaces';
        doRegexTest(cssFile, regex, description);
    };

    /**
     * Initializes the CSS Formatting module
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var cssFormattingTest = function(testData) {
        // Test that the main and UI CSS files are properly formatted
        $.each(testData.mainCSS, function(mainCSSPath, mainCSS) {
            test(mainCSSPath, function() {
                if (mainCSS) {
                    checkCSS(mainCSS);
                } else {
                    ok(true, mainCSSPath + ' has no CSS to check.');
                }
            });
        });

        // Test that the widget CSS files are properly formatted
        $.each(testData.widgetData, function(widgetCSSPath, widget) {
            test(widgetCSSPath, function() {
                if (widget.css) {
                    checkCSS(widget.css);
                } else {
                    ok(true, widgetCSSPath + ' has no CSS to check.');
                }
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Load up QUnit
    QUnit.load();

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(cssFormattingTest);
});
