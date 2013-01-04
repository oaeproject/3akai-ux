/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
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
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

        var testURL = '/~admin/public/test123';

        var SaveDataEscapingTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            asyncTest('Ensure escapedHTML is returned correctly', function() {
                var xssString = '<script>alert(\'xss\');</script>';
                var escapedString = sakai.api.Security.escapeHTML(xssString);
                var data = {'name': escapedString};
                sakai.api.Server.saveJSON(testURL, data, function(success, data) {
                    sakai.api.Server.loadJSON(testURL, function(success, data) {
                        equal(escapedString, data.name, 'The escaped string returned as it was saved');
                        start();
                    });
                });
            });
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            SaveDataEscapingTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                SaveDataEscapingTest();
            });
        }

    }
);