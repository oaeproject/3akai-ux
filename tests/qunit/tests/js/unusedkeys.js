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

    module("Unused Translation Keys");

    /**
     * Escapes provided string so that regexp metacharacters in it are used as literal characters.
     *     e.g. `test?(string)` becomes `test\?\(string\)`
     *
     * @param  {String}    input    The string that will be escaped so it can be used as a regular expression
     * @return {String}             The escaped string
     */
    var escapeRegExp = function(input) {
      return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    /**
     * Initialize the Unused Keys test
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var unusedTranslationKeysTest = function(testData) {

        /**
         * Run a regular expression test on the provided file.
         *
         * @param  {String}    filePath    The path of the file to test
         * @param  {String}    testFile    The file to test
         * @param  {String}    key         The i18n key to test for
         * @return {Boolean}               `true` if there was a match, `false` otherwise
         */
        var runTest = function(filePath, testFile, key) {
            var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
            if (regex.test(testFile)) {
                return true;
            }
            return false;
        };

        // Loop over all main bundles
        $.each(testData.mainBundles, function(mainBundleKey, mainBundle) {
            test(mainBundleKey, function() {
                if (mainBundle && _.keys(mainBundle).length) {
                    // For each key in the main bundle, check if it's used in a widget or main HTML file
                    $.each(mainBundle, function(key, value) {
                        if (key) {
                            var keyUsed = false;

                            // Check if key is used in the main HTML or macro files
                            $.each(testData.mainHTML, function(mainHTMLPath, mainHTML) {
                                keyUsed = runTest(mainHTMLPath, mainHTML, key) || keyUsed;
                            });

                            // Check if the key is used in the widget HTML or JavaScript files
                            $.each(testData.widgetData, function(widgetId, widget) {
                                keyUsed = runTest(widgetId, widget.html, key) || keyUsed;
                                $.each(widget.js, function(widgetJSIndex, widgetJS) {
                                    keyUsed = runTest(widgetId, widgetJS, key) || keyUsed;
                                });
                            });

                            // Check if key is used in the main JS files
                            $.each(testData.mainJS, function(mainJSPath, mainJS) {
                                keyUsed = runTest(mainJSPath, mainJS, key) || keyUsed;
                            });

                            // Check if key is used in the API files
                            $.each(testData.apiJS, function(apiJSPath, apiJS) {
                                keyUsed = runTest(apiJSPath, apiJS, key) || keyUsed;
                            });

                            // Check if key is used in the OAE plugin files
                            $.each(testData.oaePlugins, function(oaePluginPath, oaePlugin) {
                                keyUsed = runTest(oaePluginPath, oaePlugin, key) || keyUsed;
                            });

                            if (keyUsed) {
                                ok(true, '\'' + key + '\' in \'' + mainBundleKey + '\' is used');
                            } else {
                                ok(false, '\'' + key + '\' in \'' + mainBundleKey + '\' is not being used');
                            }
                        }
                    });
                } else {
                    ok(true, 'No keys in \'' + mainBundleKey + '\'');
                }
            });
        });

        // Check if keys in widgets are being used
        $.each(testData.widgetData, function(widgetId, widget) {
            $.each(widget.js, function(widgetJSIndex, widgetJS) {
                test(widgetJSIndex, function() {
                    if (widget.i18n && _.keys(widget.i18n).length) {
                        $.each(widget.i18n, function(bundleKey, bundle) {
                            if (_.keys(bundle).length) {
                                $.each(bundle, function(i18nKey, i18nValue) {
                                    if (i18nValue) {
                                        var htmlUsed = runTest(widgetId, widget.html, i18nKey);
                                        var jsUsed = runTest(widgetId, widgetJS, i18nKey);
                                        if (htmlUsed || jsUsed) {
                                            ok(true, i18nKey + ' in \'' + widgetId + ' - ' + bundleKey + '\' is used');
                                        } else {
                                            ok(false, i18nKey + ' in \'' + widgetId + ' - ' + bundleKey + '\' is not being used');
                                        }
                                    }
                                });
                            } else {
                                ok(true, '\'' + widgetId + '\' does does not have any keys in \'' + bundleKey + '\'');
                            }
                        });
                    } else {
                        ok(true, '\'' + widgetId + '\' does does not have any bundles');
                    }
                });
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(unusedTranslationKeysTest);
});
