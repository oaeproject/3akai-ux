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

    module("Double Translation Keys");

    /**
     * For each widget, check if a key is already defined in one of the core bundles or in another widget. In this
     * case, they should be consolidated in a central place
     *
     * @param {Object}    testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var doubleTranslationKeysTest = function(testData) {
        var mainKeys = {};
        var widgetKeys = {};

        // Collect all of the keys used in the main bundles and keep track of the languages
        // in which they are available
        $.each(testData.mainBundles, function(mainBundleKey, mainBundle) {
            $.each(mainBundle, function(key, value) {
                mainKeys[key] = mainKeys[key] || [];
                mainKeys[key].push(mainBundleKey);
            });
        });

        // Collect all of the keys used in the widget bundles and keep track of which widgets
        // and which languages inside of those widgets they're being used in
        $.each(testData.widgetData, function(widgetId, widget) {
            if (widget.i18n) {
                $.each(widget.i18n, function(widgetBundleKey, widgetBundle) {
                    $.each(widgetBundle, function(i18nKey, i18nValue) {
                        widgetKeys[i18nKey] = widgetKeys[i18nKey] || {};
                        widgetKeys[i18nKey][widgetBundleKey] = widgetKeys[i18nKey][widgetBundleKey] || [];
                        widgetKeys[i18nKey][widgetBundleKey].push(widgetId);
                    });
                });
            }
        });

        $.each(testData.widgetData, function(widgetId, widget) {
            test(widget.id, function() {
                if (widget.i18n) {
                    // Loop over all bundles in the widget
                    $.each(widget.i18n, function(widgetBundleKey, widgetBundle) {
                        // Loop over all keys in the bundle
                        $.each(widgetBundle, function(i18nKey, i18nValue) {

                            // Check if the widget key is already defined in the main bundle
                            if (mainKeys[i18nKey] && _.contains(mainKeys[i18nKey], widgetBundleKey)) {
                                // Key already exists in the main bundle
                                ok(false, i18nKey + ' already exists in main bundle ' + widgetBundleKey);
                            } else {
                                // Key doesn't exist yet in the main bundle
                                ok(true, i18nKey + ' doesn\'t exist yet in the main bundles');
                            }

                            // Check if the widget key is already defined in other widget bundles. We expect the collected
                            // object to have at least 1 record for the current widget. When there is more than 1 record, the
                            // key is being in multiple widgets
                            if (widgetKeys[i18nKey][widgetBundleKey].length > 1) {
                                // Key is used in a different widget bundle
                                ok(false, i18nKey + ' is also being used in ' + _.without(widgetKeys[i18nKey][widgetBundleKey], widgetId) + ' - ' + widgetBundleKey);
                            } else {
                                // Key isn't used in a different widget bundle
                                ok(true, i18nKey + ' is not being used in a different widget');
                            }
                        });
                    });
                }  else {
                    ok(true, '\'' + widgetId + '\' does not have any bundles');
                }
            });
        });

        // Start consuming tests again.
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(doubleTranslationKeysTest);
});
