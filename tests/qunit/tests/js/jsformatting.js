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

    module("JavaScript Formatting");

    /**
     * Test the CSS against a provided regular expression
     *
     * @param  {String}    path           The path to the `jsFile`
     * @param  {String}    jsFile         The actual content that should be tested
     * @param  {Object}    regex          The regular expression to test the JavaScript against
     * @param  {String}    description    The description of the test
     */
    var doRegexTest = function(path, jsFile, regex, description) {
        // Remove comments from file to test
        var testFile = jsFile.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
        var match = '';
        var pass = true;
        var errorString = '';
        var count = 0;

        if (regex.test(testFile)) {
            while ((match = regex.exec(jsFile)) !== null) {
                var beforeMatch = jsFile.substring(0, match.index);
                var matchLine = beforeMatch.split(/\n/).length;
                count++;
                pass = false;
                errorString = errorString + '\n\nPath: ' + path + '\nLine: ' + matchLine + '\nString:\n' + match + '';
            }
        }

        if (pass) {
            ok(true, description);
        } else {
            ok(false, description + ', ' + count + ' error(s): ' + errorString);
        }
    };

    /**
     * Prepares several regexes to test the JavaScript against and executes the test
     *
     * @param  {String}    path      The path to the `jsFile`
     * @param  {String}    jsFile    The actual content that should be tested
     */
    var checkJs = function(path, jsFile) {
        // Ignore files that are provided by other vendors
        if (/\/shared\/vendor\//.test(path)) {
            expect(0);
            return;
        }

        var regex = /(?!\'.*)\".*\"(?!.*')/gm;
        var description = 'Double quotes should only be used within single quotes';
        doRegexTest(path, jsFile, regex, description);

        regex = /^\s*function\s.*/gm;
        description = 'Use \"var <functionName> = function() {\"';
        doRegexTest(path, jsFile, regex, description);

        regex = /\)\s*$(\n|\r)^\s*\{.*/gm;
        description = 'Put opening braces on the same line as the statement';
        doRegexTest(path, jsFile, regex, description);

        regex = /.+\)(\s{0}|\s{2,})\{/gm;
        description = 'Use exactly one space before an opening brace';
        doRegexTest(path, jsFile, regex, description);

        regex = /.*\).*\{( |\t)+(\n|\r)/gm;
        description = 'Don\'t put whitespace after an opening brace';
        doRegexTest(path, jsFile, regex, description);

        regex = /.*\}( |\t)+(\n|\r)/gm;
        description = 'Don\'t put whitespace after a closing brace';
        doRegexTest(path, jsFile, regex, description);

        regex = /new\s+(Object|Array|Number|String|Boolean).*/gm;
        description = 'Use literal notation';
        doRegexTest(path, jsFile, regex, description);

        regex = /[^=!]==[^=]/gm;
        description = 'Use \"===\" instead of \"==\"';
        doRegexTest(path, jsFile, regex, description);

        regex = /!=[^=]/gm;
        description = 'Use \"!==\" instead of \"!=\"';
        doRegexTest(path, jsFile, regex, description);

        regex = /^\s*const\s/gm;
        description = 'Use \"var <ALLCAPS>\" instead of \"const\"';
        doRegexTest(path, jsFile, regex, description);

        regex = /\.(live|die|bind|unbind)\(/gm;
        description = 'Use \".on()\" and \".off()\" to attach event handlers';
        doRegexTest(path, jsFile, regex, description);

        regex = /\.prototype\..*=/gm;
        description = 'Do not extend prototypes';
        doRegexTest(path, jsFile, regex, description);

        regex = /(^|\s)(Object\.(freeze|preventExtensions|seal)|eval|((?!['"].*)(with)(?!.*['"])))(\s|$)/gm;
        description = 'Avoid using Object.freeze, Object.preventExtensions, Object.seal, with, eval';
        doRegexTest(path, jsFile, regex, description);

        regex = /(^|\s)typeof(\s|$)/gm;
        description = 'Use jquery or underscore for type checking';
        doRegexTest(path, jsFile, regex, description);
    };

    /**
     * Initializes the JavaScript Formatting module
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var jsFormattingTest = function(testData) {
        // Test that the main JavaScript files are properly formatted
        $.each(testData.mainJS, function(mainJSPath, mainJS) {
            test(mainJSPath, function() {
                checkJs(mainJSPath, mainJS);
            });
        });

        // Test that the API JavaScript files are properly formatted
        $.each(testData.apiJS, function(mainApiJSPath, apiJS) {
            test(mainApiJSPath, function() {
                checkJs(mainApiJSPath, apiJS);
            });
        });

        // Test that the OAE specific plugin files are properly formatted
        $.each(testData.oaePlugins, function(oaePluginJSPath, oaePluginJS) {
            test(oaePluginJSPath, function() {
                checkJs(oaePluginJSPath, oaePluginJS);
            });
        });

        // Test that the widget JavaScript files are properly formatted
        $.each(testData.widgetData, function(widgetJSPath, widget) {
            test(widgetJSPath + ' - widget', function() {
                checkJs(widgetJSPath + ' - widget', widget.js);
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Load up QUnit
    QUnit.load();

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(jsFormattingTest);
});
