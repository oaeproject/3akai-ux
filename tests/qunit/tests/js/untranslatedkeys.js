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
         * @param {String} data HTML string to check for untranslated keys
         */
        var checkKeys = function(data, widget, callback) {
            if (regex.test(data)) {
                while (regex.test(data)) {
                    var key = RegExp.lastMatch;
                    key = key.substring(7, key.length - 2);
                    if (widget) {
                        $.each(cachedWidgets, function(i, w) {
                            if (w.id === widget) {
                                if (w.i18n.default[key]) {
                                    ok(true, key + ' translated in the \'' + widget + '\' widget bundle.');
                                } else if (cachedWidgets[cachedWidgets.length - 1].i18n.default[key]) {
                                    ok(true, key + ' translated in the default bundle.');
                                } else {
                                    ok(false, key + ' in \'' + widget + '\' not translated.');
                                }
                            }
                        });
                    } else {
                        if (cachedWidgets[cachedWidgets.length - 1].i18n.default[key]) {
                            ok(true, key + ' translated in the default bundle.');
                        } else {
                            ok(false, key + ' in \'' + widget + '\' not translated.');
                        }
                    }
                }
            } else {
                ok(true, 'No keys in this file.');
            }
            callback();
        };

        var makeUntranslatedKeysTest = function(filename, widget) {
            asyncTest(filename, function() {
                var widgetId = '';
                if (widget && widget.id) {
                    widgetId = widget.id;
                }
                $.ajax({
                    dataType: 'text',
                    url: filename,
                    success: function(data) {
                        checkKeys(data, widgetId, function() {
                            start();
                        });
                    }
                });
            });
        };

        /**
         * Initializes the Untranslated Keys module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var untranslatedKeysTest = function() {

            // Test the widget HTML files
            $.each(cachedWidgets, function(i, widget) {
                if (widget.id !== 'default bundle') {
                    makeUntranslatedKeysTest('/node_modules/oae-core/' + widget.id + '/' + widget.id + '.html', widget);
                }
            });

            // Test the core HTML files
            var coreHTML = ['errors/accessdenied',
                            'errors/notfound',
                            'content',
                            'group',
                            'index',
                            'me',
                            'search',
                            'user'];
            $.each(coreHTML, function(ii, coreHTMLFile) {
                makeUntranslatedKeysTest('/ui/' + coreHTMLFile + '.html');
            });
        };

        util.loadWidgets(function(widgets) {
            util.loadWidgetBundles(widgets, function(widgetBundles) {
                cachedWidgets = widgetBundles;
                untranslatedKeysTest();
            });
        });

        QUnit.load();
    }
);
