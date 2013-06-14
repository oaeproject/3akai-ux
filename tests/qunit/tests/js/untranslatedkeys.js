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

require(['jquery', 'oae.core', '../js/util.js', 'qunitjs'], function($, oae, util) {

        module("Untranslated Keys");

        var regex = new RegExp('__MSG__(.*?)__', 'gm');

        var cachedWidgets = '';

        /**
         * Checks whether all the keys found in the HTML string have a translation
         *
         * @param {String} data HTML string to check for untranslated keys
         */
        var checkKeys = function(widgetData, html, isWidget) {
            if (regex.test(html)) {
                regex = new RegExp('__MSG__(.*?)__', 'gm');
                while (regex.test(html)) {
                    // Get the key from the match
                    var key = RegExp.lastMatch;
                    key = key.substring(7, key.length - 2);

                    // Checks if the key has been found at least in one of the i18n files.
                    var hasi18n = false;

                    // If we're checking a widget check the widget bundles first
                    if (isWidget) {
                        // Check if the widget has i18n bundles
                        if (_.keys(widgetData.widgetData[isWidget].i18n).length) {
                            // For each bundle in the widget, check if it's available
                            $.each(widgetData.widgetData[isWidget].i18n, function(i, widgetBundle) {
                                if (widgetBundle[key]) {
                                    hasi18n = true;
                                }
                            });
                        }
                    }

                    // If the widget bundle has no translation or the check is not for a widget, check the main bundles
                    if (!hasi18n) {
                        $.each(widgetData.mainBundles, function(i, mainBundle) {
                            if (mainBundle[key]) {
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
         * Initializes the Untranslated Keys module
         *
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var untranslatedKeysTest = function(widgetData) {
            // Test the widget HTML files for untranslated keys
            $.each(widgetData.widgetData, function(i, widget) {
                asyncTest(i + '.html', function() {
                    checkKeys(widgetData, widget.html, widget.id);
                    start();
                });
            });

            // Test the core HTML files for untranslated keys
            $.each(widgetData.mainHTML, function(ii, mainHTML) {
                asyncTest(ii + '.html', function() {
                    checkKeys(widgetData, mainHTML, false);
                    start();
                });
            });

            // Test the macro HTML files for untranslated keys
            $.each(widgetData.macroHTML, function(iii, macroHTML) {
                asyncTest(iii + '.html', function() {
                    checkKeys(widgetData, macroHTML, false);
                    start();
                });
            });

            // Test the widget JS files for untranslated keys
            $.each(widgetData.widgetData, function(j, widget) {
                asyncTest(j + '.js', function() {
                    checkKeys(widgetData, widget.js, widget.id);
                    start();
                });
            });

            // Test the main JS files for untranslated keys
            $.each(widgetData.mainJS, function(jj, mainJS) {
                asyncTest(jj + '.js', function() {
                    checkKeys(widgetData, mainJS, false);
                    start();
                });
            });

            // Test the API files for untranslated keys
            $.each(widgetData.apiJS, function(jjj, apiJS) {
                asyncTest(jjj + '.js', function() {
                    checkKeys(widgetData, apiJS, false);
                    start();
                });
            });

        };

        util.loadWidgets(untranslatedKeysTest);

        QUnit.load();
        QUnit.start();
    }
);
