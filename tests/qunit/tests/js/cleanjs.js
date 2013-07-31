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

require(['oae.core', '/tests/qunit/js/util.js', 'qunitjs', 'jquery', '/shared/vendor/js/jshint.js'], function(oae, util) {

        module("Clean JavaScript");

        var consoleregex = new RegExp(/console\.(?:log|warn|error|debug|trace)/g);
        var alertregex = new RegExp(/alert\([.\s\S]*\)/g);

        /**
         * Checks for console.log('') statements in the code
         *
         * @param  {String}   file        The contents of the file in the form of a string
         */
        var checkForConsoleLog = function(file) {
            var matches = consoleregex.exec(file);
            if (matches && matches.length) {
                $.each(matches, function() {
                    ok(false, 'Found console.(log|warn|error|debug|trace)');
                });
            } else {
                ok(true, 'No console.(log|warn|error|debug|trace) calls');
            }
        };

        /**
         * Checks for alert() statements in the code
         *
         * @param  {String}   file    The contents of the file in the form of a string
         */
        var checkForAlert = function(file) {
            var matches = alertregex.exec(file);
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
         * @param  {String}     file        The contents of the file in the form of a string
         * @param  {Function}   callback    Function executed after checking for JSHint errors is complete
         */
        var JSHintfile = function(data, callback) {
            var result = JSHINT(data, {
                // http://www.jshint.com/options/
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
            callback();
        };

        /**
         * Initializes the clean JS Test module
         *
         * @param  {Object}   widgetData    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var cleanJSTest = function(widgetData) {
            // Check the widgets for clean javascript
            $.each(widgetData.widgetData, function(widgetID, widget) {
                asyncTest(widget.id, function() {
                    checkForConsoleLog(widget.js, widget.id);
                    checkForAlert(widget.js);
                    JSHintfile(widget.js, function() {
                        start();
                    });
                });
            });

            // Check the API for clean javascript
            $.each(widgetData.apiJS, function(apiPath, apiJS) {
                asyncTest(apiPath, function() {
                    checkForAlert(apiJS);
                    JSHintfile(apiJS, function() {
                        start();
                    });
                });
            });

            // Check the main JavaScript files for clean javascript
            $.each(widgetData.mainJS, function(jsPath, mainJS) {
                asyncTest(jsPath, function() {
                    checkForConsoleLog(mainJS, jsPath);
                    checkForAlert(mainJS);
                    JSHintfile(mainJS, function() {
                        start();
                    });
                });
            });

            // Check the OAE plugins JavaScript files for clean javascript
            $.each(widgetData.oaePlugins, function(jsPath, oaePlugin) {
                asyncTest(jsPath, function() {
                    checkForConsoleLog(oaePlugin, jsPath);
                    checkForAlert(oaePlugin);
                    JSHintfile(oaePlugin, function() {
                        start();
                    });
                });
            });
        };

        util.loadTestData(cleanJSTest);

        QUnit.load();
    }
);
