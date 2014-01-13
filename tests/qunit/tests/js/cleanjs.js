/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['oae.core', '/tests/qunit/js/util.js', 'jquery', '/shared/vendor/js/jshint.js'], function(oae, util) {

    module("Clean JavaScript");

    // Regular expression that will be used to check for console.log, console.debug and console.trace statements
    var consoleregex = new RegExp(/console\.(?:log|debug|trace)/g);
    // Regular expression that will be used to check fro alert statements
    var alertregex = new RegExp(/alert\([.\s\S]*\)/g);

    /**
     * Check for console statements in the code
     *
     * @param  {String}   jsFile        The contents of a JavaScript file
     */
    var checkForConsoleLog = function(jsFile) {
        var matches = consoleregex.exec(jsFile);
        if (matches && matches.length) {
            $.each(matches, function() {
                ok(false, 'Found console.(log|debug|trace)');
            });
        } else {
            ok(true, 'No console.(log|debug|trace) calls');
        }
    };

    /**
     * Check for alert statements in the code
     *
     * @param  {String}   jsFile        The contents of a JavaScript file
     */
    var checkForAlert = function(jsFile) {
        var matches = alertregex.exec(jsFile);
        if (matches && matches.length) {
            $.each(matches, function() {
                ok(false, 'Found alert()');
            });
        } else {
            ok(true, 'No alert() found');
        }
    };

    /**
     * Run a JavaScript file through JSHint
     *
     * @param  {String}     jsFile        The contents of a JavaScript file
     */
    var JSHintfile = function(jsFile) {
        var result = JSHINT(jsFile, {
            'eqeqeq': true, // use === and !== instead of == and !=
            'sub': true     // ignore dot notation recommendations - ie ['userid'] should be .userid
        });
        if (result) {
            ok(result, 'JSHint clean');
        } else {
            $.each(JSHINT.errors, function(i) {
                var error = JSHINT.errors[i];
                if (error) {
                    ok(false, 'JSHint error on line ' + error.line + ' character ' + error.character + ': ' + error.reason + ', ' + error.evidence);
                }
            });
        }
    };

    /**
     * Initialize the clean JavaScript test
     *
     * @param  {Object}   testData    The test data containing all files to be tested (html, css, js, properties)
     */
    var cleanJSTest = function(testData) {

        /**
         * Test a JavaScript file for console and alert statements and run the file through JSHint
         *
         * @param  {String}    testTitle    The title of the test
         * @param  {String}    jsFile       The contents of a JavaScript file
         */
        var runTest = function(testTitle, jsFile) {
            test(testTitle, function() {
                checkForConsoleLog(jsFile);
                checkForAlert(jsFile);
                JSHintfile(jsFile);
            });
        };

        // Check the widgets for clean JavaScript
        $.each(testData.widgetData, function(widgetId, widget) {
            $.each(widget.js, function(widgetJSIndex, widgetJS) {
                runTest(widgetJSIndex, widgetJS);
            });
        });

        // Check the API for clean JavaScript
        $.each(testData.apiJS, runTest);

        // Check the main JavaScript files for clean JavaScript
        $.each(testData.mainJS, runTest);

        // Check the OAE plugins JavaScript files for clean JavaScript
        $.each(testData.oaePlugins, runTest);

        // Start consuming tests again
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(cleanJSTest);
});
