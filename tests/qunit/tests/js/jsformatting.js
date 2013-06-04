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

        module("JavaScript Formatting");

        var doRegexTest = function(jsFile, regex, testString) {
            // remove comments from file to test
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
                    errorString = errorString + '\n\nLine: ' + matchLine + '\nString:\n' + match + '';
                }
            }

            if (pass) {
                ok(true, testString);
            } else {
                ok(false, testString + ', ' + count + ' error(s): ' + errorString);
            }
        }

        var checkJs = function(jsFile) {
            // test for double quotes in strings
            var regex = /(?!\'.*)\".*\"(?!.*')/gm;
            var testString = 'Double quotes should only be used within single quotes';
            doRegexTest(jsFile, regex, testString);

            // test function declarations
            var regex = /^\s*function\s.*/gm;
            var testString = 'Use \"var <functionName> = function() {\"';
            doRegexTest(jsFile, regex, testString);

            // test opening braces
            regex = /\)\s*$(\n|\r)^\s*\{.*/gm;
            testString = 'Put opening braces on the same line as the statement';
            doRegexTest(jsFile, regex, testString);

            // test spaces before opening brace
            regex = /.+\)(\s{0}|\s{2,})\{/gm;
            testString = 'Use exactly one space before an opening brace';
            doRegexTest(jsFile, regex, testString);

            // test no spaces after opening brace
            regex = /.*\).*\{( |\t)+(\n|\r)/gm;
            testString = 'Don\'t put whitespace after an opening brace';
            doRegexTest(jsFile, regex, testString);

            // test no spaces after closing braces
            regex = /.*\}( |\t)+(\n|\r)/gm;
            testString = 'Don\'t put whitespace after a closing brace';
            doRegexTest(jsFile, regex, testString);

            // test literal notation
            regex = /new\s+(Object|Array|Number|String|Boolean).*/gm;
            testString = 'Use literal notation';
            doRegexTest(jsFile, regex, testString);

            regex = /[^=!]==[^=]/gm;
            testString = 'Use \"===\" instead of \"==\"';
            doRegexTest(jsFile, regex, testString);

            regex = /!=[^=]/gm;
            testString = 'Use \"!==\" instead of \"!=\"';
            doRegexTest(jsFile, regex, testString);

            regex = /^\s*const\s/gm;
            testString = 'Use \"var <ALLCAPS>\" instead of \"const\"';
            doRegexTest(jsFile, regex, testString);

            regex = /\.(live|die|bind|unbind)\(/gm;
            testString = 'Use \".on()\" and \".off()\" to attach event handlers';
            doRegexTest(jsFile, regex, testString);

            regex = /\.prototype\./gm;
            testString = 'Do not extend prototypes';
            doRegexTest(jsFile, regex, testString);

            regex = /(^|\s)(Object\.(freeze|preventExtensions|seal)|eval|((?!['"].*)(with)(?!.*['"])))(\s|$)/gm;
            testString = 'Avoid using Object.freeze, Object.preventExtensions, Object.seal, with, eval';
            doRegexTest(jsFile, regex, testString);

            regex = /(^|\s)typeof(\s|$)/gm;
            testString = 'Use jquery or underscore for type checking';
            doRegexTest(jsFile, regex, testString);

        };

        var makeJSFormattingTest = function(filename) {
            asyncTest(filename, function() {
                $.ajax({
                    dataType: 'text',
                    url: filename,
                    success: function(data) {
                        checkJs(data);
                        start();
                    }, error: function() {
                        QUnit.ok(true, 'This widget does not have a JavaScript file associated to it.');
                        start();
                    }
                });
            });
        };

        /**
         * Initializes the JavaScript Formatting module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var jsFormattingTest = function(widgets) {
            QUnit.load();

            // Test the widget JavaScript files
            $.each(widgets, function(i, widget) {
                makeJSFormattingTest('/node_modules/oae-core/' + widget.id + '/js/' + widget.id + '.js');
            });

            // Test the core JavaScript files
            var coreJS = ['oae.api.authentication',
                          'oae.api.config',
                          'oae.api.content',
                          'oae.api.group',
                          'oae.api.i18n',
                          'oae.api',
                          'oae.api.l10n',
                          'oae.api.profile',
                          'oae.api.user',
                          'oae.api.util',
                          'oae.api.widget',
                          'oae.bootstrap',
                          'oae.core'];
            $.each(coreJS, function(ii, coreJSFile) {
                makeJSFormattingTest('/shared/oae/api/' + coreJSFile + '.js');
            });
        };

        util.loadWidgets(jsFormattingTest);
    }
);
