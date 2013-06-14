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

        module("Unused Translation Keys");

        var cachedWidgets = {
            'html': null,
            'js': null,
            'i18n': null
        };

        /**
         * Escaps a regular string meant for regular expression testing
         *
         * @param  {String}    str    The string that will be used as a regular expression
         */
        var escapeRegExp = function(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        };

        /**
         * Initializes the Untranslated Keys module and executes the tests
         *
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var unusedTranslationKeysTest = function(widgetData) {
            // Loop over all main bundles
            $.each(widgetData.mainBundles, function(i, mainBundle) {
                asyncTest(i, function() {
                    if (_.keys(mainBundle).length) {
                        // For each key in the main bundle, check if it's used in a widget or main HTML file
                        $.each(mainBundle, function(key, value) {
                            if (key) {
                                var keyUsed = false;

                                // Check if key is used in the main HTML files
                                $.each(widgetData.mainHTML, function(ii, mainHTML) {
                                    var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                    var used = regex.test(mainHTML);
                                    if (used) {
                                        keyUsed = true;
                                    }
                                });

                                // Check if key is used in the main macro HTML files
                                $.each(widgetData.macroHTML, function(iii, mainMacroHTML) {
                                    var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                    var used = regex.test(mainMacroHTML);
                                    if (used) {
                                        keyUsed = true;
                                    }
                                });

                                // Check if the key is used in the widget HTML or JavaScript files
                                $.each(widgetData.widgetData, function(iiii, widget) {
                                    var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                    var used = regex.test(widget.html) || regex.test(widget.js);
                                    if (used) {
                                        keyUsed = true;
                                    }
                                });

                                // Check if key is used in the main JS files
                                $.each(widgetData.mainJS, function(iii, mainJS) {
                                    var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                    var used = regex.test(mainJS);
                                    if (used) {
                                        keyUsed = true;
                                    }
                                });

                                // Check if key is used in the API files
                                $.each(widgetData.apiJS, function(iii, apiJS) {
                                    var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                    var used = regex.test(apiJS);
                                    if (used) {
                                        keyUsed = true;
                                    }
                                });

                                if (keyUsed) {
                                    ok(true, '\'' + key + '\' in \'' + i + '.properties\' is used.');
                                } else {
                                    ok(false, '\'' + key + '\' in \'' + i + '.properties\' is not being used.');
                                }
                            }
                        });
                    } else {
                        ok(true, 'No keys in \'' + i + '\'.');
                    }
                    start();
                });
            });

            // Check if keys in widgets are being used
            $.each(widgetData.widgetData, function(ii, widget) {
                asyncTest(ii, function() {
                    if (_.keys(widget.i18n).length) {
                        $.each(widget.i18n, function(iii, bundle) {
                            if (_.keys(bundle).length) {
                                $.each(bundle, function(key, value) {
                                    if (value) {
                                        var regex = new RegExp(escapeRegExp('__MSG__' + key + '__', 'gm'));
                                        var used = regex.test(widget.html) || regex.test(widget.js);
                                        if (used) {
                                            ok(true, key + ' in \'' + ii + ' ' + iii + '.properties\' is used.');
                                        } else {
                                            ok(false, key + ' in \'' + ii + ' ' + iii + '.properties\' is not being used.');
                                        }
                                    }
                                });
                            } else {
                                ok(true, '\'' + ii + '\' does does not have any keys in \'' + iii + '.properties\'.');
                            }
                        });
                    } else {
                        ok(true, '\'' + ii + '\' does does not have any bundles.');
                    }
                    start();
                });
            });
        };

        util.loadWidgets(unusedTranslationKeysTest);

        QUnit.load();
        QUnit.start();
    }
);
