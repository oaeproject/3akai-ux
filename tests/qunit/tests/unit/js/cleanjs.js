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

require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js',
    '../../../../tests/qunit/js/jshint.js'
    ], function($, sakai) {

        module('Clean Javascript');

        var consoleregex = new RegExp(/console\.(?:log|warn|error|debug|trace)/g),
            alertregex = new RegExp(/alert\([.\s\S]*\)/g);

        var checkForConsoleLog = function(file, filename) {
            var matches = consoleregex.exec(file);
            if (filename === '/dev/lib/sakai/sakai.dependencies.js' && matches && matches.length === 1) {
                ok(true, 'Found a single console.log in sakai.dependencies.js which is the only one allowed as it is the wrapper for debug.log');
            } else if (matches && matches.length) {
                for (var i=0,j=matches.length; i<j; i++) {
                    ok(false, 'found console.(log|warn|error|debug|trace)');
                }
            } else {
                ok(true, 'No console.(log|warn|error|debug|trace) calls');
            }
        };

        var checkForAlert = function(file) {
            var matches = alertregex.exec(file);
            if (matches && matches.length) {
                for (var i=0,j=matches.length; i<j; i++) {
                    ok(false, 'found alert()');
                }
            } else {
                ok(true, 'No alert() found');
            }
        };

        var JSHintfile = function(data, callback) {
            var result = JSHINT(data, {
                // http://www.jshint.com/options/
                sub:true // ignore dot notation recommendations - ie ['userid'] should be .userid
            });
            if (result) {
                ok(result, 'JSHint clean');
            } else {
                for (var i=0,j=JSHINT.errors.length; i<j; i++) {
                    var error = JSHINT.errors[i];
                    if (error) {
                        ok(false, 'JSHint error on line ' + error.line + ' character ' + error.character + ': ' + error.reason + ', ' + error.evidence);
                    }
                }
            }
            callback();
        };

        var makeCleanJSTest = function(filename) {
            asyncTest(filename, function() {
                $.ajax({
                    dataType: 'text',
                    url: filename,
                    success: function(data) {
                        checkForConsoleLog(data, filename);
                        checkForAlert(data);
                        JSHintfile(data, function() {
                            start();
                        });
                    }
                });
            });
        };

        var cleanJSTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            QUnit.start();
            for (var i=0, j=sakai_global.qunit.allJSFiles.length; i<j; i++) {
                var file = sakai_global.qunit.allJSFiles[i];
                makeCleanJSTest(file);
            }
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            cleanJSTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                cleanJSTest();
            });
        }
    }
);
