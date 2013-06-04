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

        /**
         * Retrieves the HTML on provided path and adds it to a string
         * @param  {String[]}    htmlPaths    An Array of paths to files containing HTML
         * @param  {Function}    callback     Function executed after all HTML content has been read
         */
        var getWidgetHTML = function(htmlPaths, callback) {
            var html = '';
            var toDo = 0;

            var getHTML = function(filename) {
                $.ajax({
                    dataType: 'text',
                    url: filename,
                    success: function(data) {
                        html+=data;
                        toDo++;
                        if (toDo !== htmlPaths.length) {
                            getHTML(htmlPaths[toDo]);
                        } else {
                            callback(html);
                        }
                    }
                });
            };

            getHTML(htmlPaths[toDo]);
        };

        /**
         * Initializes the Untranslated Keys module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var unusedTranslationKeysTest = function() {
            var htmlPaths = [];

            // Test the widget HTML files
            $.each(cachedWidgets, function(i, widget) {
                if (widget.id !== 'default bundle') {
                    htmlPaths.push('/node_modules/oae-core/' + widget.id + '/' + widget.id + '.html');
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
                htmlPaths.push('/ui/' + coreHTMLFile + '.html');
            });

            getWidgetHTML(htmlPaths, function(html) {
                $.each(cachedWidgets, function(i, widget) {
                    asyncTest(widget.id, function() {
                        $.each(widget.i18n.default, function(key, value) {
                            if (key) {
                                var regex = new RegExp('__MSG__' + key + '__', 'gm');
                                var used = regex.test(html);
                                if (used) {
                                    ok(true, key + ' in \'' + widget.id + '\' is used.');
                                } else {
                                    ok(false, key + ' in \'' + widget.id + '\' is not being used.');
                                }
                            }
                        });
                        start();
                    });
                });
            });
        };

        util.loadWidgets(function(widgets) {
            util.loadWidgetBundles(widgets, function(widgetBundles) {
                cachedWidgets = widgetBundles;
                unusedTranslationKeysTest();
            });
        });

        QUnit.load();
    }
);
