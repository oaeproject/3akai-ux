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

require(['jquery', 'oae.core', '/tests/qunit/js/util.js'], function($, oae, util) {

    module("Untranslated Keys");

    var regex = new RegExp('__MSG__(.*?)__', 'gm');

    /**
     * Checks whether all the keys found in the HTML string have a translation
     *
     * @param  {Object}     testData     The testdata containing all files to be tested (html, css, js, properties)
     * @param  {String}     html         The HTML to check for keys that don't have a translation
     * @param  {Boolean}    widgetID     null if not a widget, has widgetID if a widget is checked
     */
    var checkKeys = function(testData, html, widgetID) {
        if (regex.test(html)) {
            regex = new RegExp('__MSG__(.*?)__', 'gm');
            while (regex.test(html)) {
                // Get the key from the match
                var key = RegExp.lastMatch;
                key = key.substring(7, key.length - 2);

                // Checks if the key has been found at least in one of the i18n files.
                var hasi18n = false;

                // If we're checking a widget check the widget bundles first
                if (widgetID) {
                    // Check if the widget has i18n bundles
                    if (_.keys(testData.widgetData[widgetID].i18n).length) {
                        // For each bundle in the widget, check if it's available
                        $.each(testData.widgetData[widgetID].i18n, function(i, widgetBundle) {
                            if (widgetBundle[key] !== undefined) {
                                hasi18n = true;
                            }
                        });
                    }
                }

                // If the widget bundle has no translation or the check is not for a widget, check the main bundles
                if (!hasi18n) {
                    $.each(testData.mainBundles, function(i, mainBundle) {
                        if (mainBundle[key] !== undefined) {
                            hasi18n = true;
                        }
                    });
                }

                // If the key has been translated send an ok
                if (hasi18n) {
                    ok(true, '\'' + key + '\' is translated.');
                } else {
                    ok(false, '\'' + key + '\' is not translated.');
                }
            }
        } else {
            ok(true, 'No keys to be translated.');
        }
    };

    /**
     * Initializes the untranslated Keys module
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var untranslatedKeysTest = function(testData) {
        // Test the widget HTML files for untranslated keys
        $.each(testData.widgetData, function(i, widget) {
            test(i, function() {
                checkKeys(testData, widget.html, widget.id);
            });
        });

        // Test the core HTML and macro files for untranslated keys
        $.each(testData.mainHTML, function(ii, mainHTML) {
            test(ii, function() {
                checkKeys(testData, mainHTML, null);
            });
        });

        // Test the widget JS files for untranslated keys
        $.each(testData.widgetData, function(j, widget) {
            test(j, function() {
                checkKeys(testData, widget.js, widget.id);
            });
        });

        // Test the main JS files for untranslated keys
        $.each(testData.mainJS, function(jj, mainJS) {
            test(jj, function() {
                checkKeys(testData, mainJS, null);
            });
        });

        // Test the API files for untranslated keys
        $.each(testData.apiJS, function(jjj, apiJS) {
            test(jjj, function() {
                checkKeys(testData, apiJS, null);
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Load up QUnit
    QUnit.load();

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(untranslatedKeysTest);
});
