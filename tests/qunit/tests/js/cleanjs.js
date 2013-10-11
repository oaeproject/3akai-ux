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

require(['oae.core', '/tests/qunit/js/util.js', 'jquery', '/shared/vendor/js/jshint.js'], function(oae, util) {

    module("Clean JavaScript");

    var consoleregex = new RegExp(/console\.(?:log|debug|trace)/g);
    var alertregex = new RegExp(/alert\([.\s\S]*\)/g);

    /**
     * Checks for console.log('') statements in the code
     *
     * @param  {String}   jsFile        The contents of the file in the form of a string
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
     * Checks for alert() statements in the code
     *
     * @param  {String}   jsFile    The contents of the file in the form of a string
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
     * Runs the file through JSHint
     *
     * @param  {String}     jsFile        The contents of the file in the form of a string
     */
    var JSHintfile = function(jsFile) {
        var result = JSHINT(jsFile, {
            'eqeqeq': true, // use === and !== instead of == and !=
            'sub': true // ignore dot notation recommendations - ie ['userid'] should be .userid
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
     * Initializes the clean JS Test module
     *
     * @param  {Object}   testData    Object containing the manifests of all widgets in node_modules/oae-core.
     */
    var cleanJSTest = function(testData) {

        /**
         * Tests the given jsFile for `console.log` and `alert` and runs the file through JSHint.
         *
         * @param  {[type]}    testTitle    The title of the test
         * @param  {[type]}    jsFile       The contents of the file in the form of a string
         */
        var runTest = function(testTitle, jsFile) {
            test(testTitle, function() {
                checkForConsoleLog(jsFile, testTitle);
                checkForAlert(jsFile);
                JSHintfile(jsFile);
            });
        };

        // Check the widgets for clean javascript
        $.each(testData.widgetData, function(widgetId, widget) {
            runTest(widget.id, widget.js);
        });

        // Check the API for clean javascript
        $.each(testData.apiJS, runTest);

        // Check the main JavaScript files for clean javascript
        $.each(testData.mainJS, runTest);

        // Check the OAE plugins JavaScript files for clean javascript
        $.each(testData.oaePlugins, runTest);

        // Start consuming tests again
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(cleanJSTest);
});
