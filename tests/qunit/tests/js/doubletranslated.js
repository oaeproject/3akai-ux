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

        module("Double Translation Keys");

        /**
         * Initializes the double tranlsated keys test module
         *
         * @param  {Object}   widgetData    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var doubleTranslationKeysTest = function(widgetData) {
            // Store each key in an object, if the same key is added twice it's considered a duplicate
            var keys = {};
            test('default.properties', function() {
                $.each(widgetData.mainBundles['default'], function(keyName, mainKey) {
                    if (keys[keyName]) {
                        // The key exists already, test fails
                        QUnit.ok(false, keyName + ' already exists in the global bundles');
                    } else {
                        keys[keyName] = 'default global' ;
                        QUnit.ok(true, keyName + ' isn\'t used in any other widgets or in the default bundles');
                    }
                });
            });

            $.each(widgetData.widgetData, function(i, widget) {
                test(widget.id, function() {
                    if (widget.i18n && widget.i18n['default']) {
                        $.each(widget.i18n, function(ii, widgetBundle) {
                            $.each(widgetBundle, function(keyName, widgetKey) {
                                if (keys[keyName] && keys[keyName] === 'default global') {
                                    // The key exists already, test fails
                                    QUnit.ok(false, keyName + ' in ' + ii + ' already exists in the ' + keys[keyName] + ' bundle');
                                } else {
                                    keys[keyName] = ii + ' ' + widget.id;
                                    QUnit.ok(true, keyName + ' isn\'t used in any other widgets or in the default bundles');
                                }
                            });
                        });
                    } else {
                        QUnit.ok(true, 'This widget has no i18n keys');
                    }
                });
            });
        };

        util.loadWidgets(doubleTranslationKeysTest);

        QUnit.load();
        QUnit.start();
    }
);
