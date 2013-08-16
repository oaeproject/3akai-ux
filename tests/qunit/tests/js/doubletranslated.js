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

require(['jquery', 'oae.core', '/tests/qunit/js/util.js', 'qunitjs'], function($, oae, util) {

    module("Double Translation Keys");

    /**
     * Checks for each widget if a key is already defined in one of the core bundles or in another widget
     *
     * @param {Object}    testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var doubleTranslationKeysTest = function(testData) {
        var widgetKeys = {}; //
        // Check if widget keys are already defined in the global bundles
        $.each(testData.widgetData, function(widgetID, widget) {
            if (widget.i18n) {
                widgetKeys[widget.id] = {}; //
                asyncTest('Widget key already defined in global bundle - ' + widget.id, function() {
                    // Loop over all bundles in the widget
                    $.each(widget.i18n, function(widgetBundleKey, widgetBundle) {
                        widgetKeys[widget.id][widgetBundleKey] = {};
                        // Loop over all keys in the bundle
                        $.each(widgetBundle, function(widgetKey, widgetValue) {
                            widgetKeys[widget.id][widgetBundleKey][widgetKey] = widgetValue; //
                            // Check each global bundle to see if key is already defined
                            $.each(testData.mainBundles, function(mainBundleKey, mainBundle) {
                                if (mainBundle[widgetKey]) {
                                    // Key already exists in the main bundle
                                    QUnit.ok(false, widgetKey + ' already exists in ' + mainBundleKey);
                                } else {
                                    // Key doesn't exist yet in the main bundle
                                    QUnit.ok(true, widgetKey + ' doesn\'t exist yet in ' + mainBundleKey);
                                }
                            });
                        });
                    });
                    start();
                });
            }
        });

        // Check if widget keys are already defined in other widget bundles
        $.each(widgetKeys, function(widgetID, widgetBundles) {
            setTimeout(function() {
                asyncTest('Widget key already defined in other widget - ' + widgetID, function() {
                    var testDone = false;
                    // Loop over all bundles for a widget
                    $.each(widgetBundles, function(language, widgetBundle) {
                        // Loop over all keys in the widget bundle
                        $.each(widgetBundle, function(i18nkey, i18nvalue) {
                            // For this key, loop over all widgets and verify that it's not duplicated anywhere else
                            $.each(widgetKeys, function(otherWidgetID, otherWidgetBundles) {
                                $.each(otherWidgetBundles, function(otherLanguage, otherWidgetBundle) {
                                    if (widgetID !== otherWidgetID) {
                                        if (otherWidgetBundle[i18nkey]) {
                                            // fail, it's already defined somewhere else
                                            QUnit.ok(false, i18nkey + ' already exists in ' + otherWidgetID + ' - ' + otherLanguage);
                                        } else {
                                            // success, it's not defined anywhere
                                            QUnit.ok(true, i18nkey + ' doesn\'t exist in ' + otherWidgetID + ' - ' + otherLanguage);
                                        }
                                        testDone = true;
                                    }
                                });
                            });
                        });
                    });
                    if (!testDone) {
                        QUnit.ok(true, 'No tests were run for ' + widgetID);
                    }
                    start();
                });
            }, 1000);
        });
    };

    util.loadTestData(doubleTranslationKeysTest);

    QUnit.load();
    QUnit.start();
});
