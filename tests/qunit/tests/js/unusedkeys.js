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

    module("Unused Translation Keys");

    /**
     * Escapes provided string so that regexp metacharacters in it are used as literal characters.
     *
     * @param  {String}    str    The string that will be escaped so it can be used as a regular expression
     * @return {String}           The escaped string
     */
    var escapeRegExp = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    /**
     * Initializes the Untranslated Keys module and executes the tests
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var unusedTranslationKeysTest = function(testData) {
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
                                var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                var used = regex.test(mainHTML);
                                if (used) {
                                    keyUsed = true;
                                }
                            });
                            // Check if the key is used in the widget HTML or JavaScript files
                            $.each(testData.widgetData, function(widgetID, widget) {
                                var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                var used = regex.test(widget.html) || regex.test(widget.js);
                                if (used) {
                                    keyUsed = true;
                                }
                            });

                            // Check if key is used in the main JS files
                            $.each(testData.mainJS, function(mainJSPath, mainJS) {
                                var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                var used = regex.test(mainJS);
                                if (used) {
                                    keyUsed = true;
                                }
                            });

                            // Check if key is used in the API files
                            $.each(testData.apiJS, function(apiJSPath, apiJS) {
                                var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                var used = regex.test(apiJS);
                                if (used) {
                                    keyUsed = true;
                                }
                            });

                            // Check if key is used in the OAE plugin files
                            $.each(testData.oaePlugins, function(oaePluginPath, oaePlugin) {
                                var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                var used = regex.test(oaePlugin);
                                if (used) {
                                    keyUsed = true;
                                }
                            });

                            if (keyUsed) {
                                ok(true, '\'' + key + '\' in \'' + mainBundleKey + '.properties\' is used.');
                            } else {
                                ok(false, '\'' + key + '\' in \'' + mainBundleKey + '.properties\' is not being used.');
                            }
                        }
                    });
                } else {
                    ok(true, 'No keys in \'' + mainBundleKey + '\'.');
                }
            });
        });

        // Check if keys in widgets are being used
        $.each(testData.widgetData, function(widgetID, widget) {
            test(widgetID, function() {
                if (widget.i18n && _.keys(widget.i18n).length) {
                    $.each(widget.i18n, function(bundleKey, bundle) {
                        if (_.keys(bundle).length) {
                            $.each(bundle, function(key, value) {
                                if (value) {
                                    var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                    var used = regex.test(widget.html) || regex.test(widget.js);
                                    if (used) {
                                        ok(true, key + ' in \'' + widgetID + ' - ' + bundleKey + '.properties\' is used.');
                                    } else {
                                        ok(false, key + ' in \'' + widgetID + ' - ' + bundleKey + '.properties\' is not being used.');
                                    }
                                }
                            });
                        } else {
                            ok(true, '\'' + widgetID + '\' does does not have any keys in \'' + bundleKey + '.properties\'.');
                        }
                    });
                } else {
                    ok(true, '\'' + widgetID + '\' does does not have any bundles.');
                }
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Load up QUnit
    QUnit.load();

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(unusedTranslationKeysTest);
});
