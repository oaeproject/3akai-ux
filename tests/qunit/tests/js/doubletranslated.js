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
         * Checks if there are keys in the system that are defined twice or more.
         * @param  {Array}     An Array of objects containing bundles and translations
         * @param  {String}    The widget ID of the widget that holds the key
         * @param  {String}    The key to check
         */
        var checkForDoubleKey = function(widgetBundles, widgetId, key) {
            var doubleKeys = [];
            $.each(widgetBundles, function(i, widget) {
                if (widget.id !== widgetId) {
                    $.each(widget.i18n['default'], function(iii, keyToCheck) {
                        if (key === iii) {
                            doubleKeys.push(key + ' in ' + widget.id);
                        }
                    });
                }
            });
            if (doubleKeys.length) {
                QUnit.ok(false, 'Double keys found: ' + doubleKeys.join(', '));
            } else {
                QUnit.ok(true, 'The key isn\'t used in any other widgets or in the defaultbundle');
            }
        };

        /**
         * Initializes the clean JS Test module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var doubleTranslationKeysTest = function(widgets) {
            util.loadWidgetBundles(widgets, function(widgetBundles) {
                $.each(widgetBundles, function(i, widget) {
                    if (widget.id) {
                        QUnit.test(widget.id, function() {
                            $.each(widget.i18n['default'], function(iii, keyToCheck) {
                                if (iii) {
                                    checkForDoubleKey(widgetBundles, widget.id, iii);
                                }
                            });
                        });
                    }
                });
            });
        };

        util.loadWidgets(doubleTranslationKeysTest);

        QUnit.load();
    }
);
