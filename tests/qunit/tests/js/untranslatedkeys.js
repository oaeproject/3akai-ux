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

require(['jquery', 'oae.core', '/tests/qunit/js/util.js'], function($, oae, util) {

    module("Untranslated Keys");

    var regex = new RegExp('__MSG__(.*?)__', 'gm');

    /**
     * Check whether all the keys in a provided string have at a minimum a default translation
     *
     * @param  {Object}     testData     The testdata containing all files to be tested (html, css, js, properties)
     * @param  {String}     file         The file to check for keys that don't have a translation
     * @param  {String}     [widgetId]   Id of the widget that is being checked
     */
    var checkKeys = function(testData, file, widgetId) {
        if (regex.test(file)) {
            $.each(file.split(/\n/), function(index, line) {
                // Skip commented lines
                if (!line.match(/^\s*(\/\/|\*)/)) {
                    regex = new RegExp('__MSG__(.*?)__', 'gm');
                    while (regex.test(line)) {
                        // Get the key from the match
                        var key = RegExp.$1;

                        // `(.*?)` is the key from the regex that does the actual replacement so ignore it
                        if (key === '(.*?)') {
                            continue;
                        }

                        // Check if the key has been found at least in one of the i18n files
                        var hasI18n = false;

                        // If we're checking a widget check the widget bundles first
                        if (widgetId) {
                            // Check if the widget has i18n bundles
                            if (testData.widgetData[widgetId].i18n && _.keys(testData.widgetData[widgetId].i18n).length) {
                                // For each bundle in the widget, check if it's available
                                if (testData.widgetData[widgetId].i18n['default'][key] !== undefined) {
                                    hasI18n = true;
                                }
                            }
                        }

                        // If the widget bundle has no translation or the check is not for a widget, check the main bundles
                        if (!hasI18n) {
                            $.each(testData.mainBundles, function(i, mainBundle) {
                                if (mainBundle[key] !== undefined) {
                                    hasI18n = true;
                                }
                            });
                        }

                        // If the key has been translated send an ok
                        if (hasI18n) {
                            ok(true, '\'' + key + '\' is translated');
                        } else {
                            ok(false, '\'' + key + '\' is not translated');
                        }
                    }
                }
            });
        } else {
            ok(true, 'No keys to be translated');
        }
    };

    /**
     * Initialize the Untranslated Keys test
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var untranslatedKeysTest = function(testData) {
        // Test the widget HTML files for untranslated keys
        $.each(testData.widgetData, function(widgetIndex, widget) {
            test(widgetIndex, function() {
                checkKeys(testData, widget.html, widget.id);
            });
        });

        // Test the core HTML and macro files for untranslated keys
        $.each(testData.mainHTML, function(mainHTMLIndex, mainHTML) {
            test(mainHTMLIndex, function() {
                checkKeys(testData, mainHTML, null);
            });
        });

        // Test the widget JS files for untranslated keys
        $.each(testData.widgetData, function(widgetIndex, widget) {
            $.each(widget.js, function(widgetJSIndex, widgetJS) {
                test(widgetJSIndex, function() {
                    checkKeys(testData, widget.id, widgetJSIndex);
                });
            });
        });

        // Test the main JS files for untranslated keys
        $.each(testData.mainJS, function(mainJSIndex, mainJS) {
            test(mainJSIndex, function() {
                checkKeys(testData, mainJS, null);
            });
        });

        // Test the API files for untranslated keys
        $.each(testData.apiJS, function(apiJSIndex, apiJS) {
            test(apiJSIndex, function() {
                checkKeys(testData, apiJS, null);
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(untranslatedKeysTest);
});
