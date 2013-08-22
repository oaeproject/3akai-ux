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

    module("Double Translation Keys");

    /**
     * Checks for each widget if a key is already defined in one of the core bundles or in another widget
     *
     * @param {Object}    testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var doubleTranslationKeysTest = function(testData) {
        var widgetKeys = {}; //

        var mainKeys = {};
        $.each(testData.mainBundles, function(mainBundleKey, mainBundle) {
            $.each(mainBundle, function(key, value) {
                mainKeys[key] = mainBundleKey;
            });
        });

        // Check if widget keys are already defined in the global bundles
        $.each(testData.widgetData, function(widgetID, widget) {
            if (widget.i18n) {
                test('Widget key already defined in global bundle - ' + widget.id, function() {
                    // Loop over all bundles in the widget
                    $.each(widget.i18n, function(widgetBundleKey, widgetBundle) {
                        // Loop over all keys in the bundle
                        $.each(widgetBundle, function(i18nKey, widgetValue) {
                            // Check each global bundle to see if key is already defined
                            if (mainKeys[i18nKey]) {
                                // Key already exists in the main bundle
                                QUnit.ok(false, i18nKey + ' already exists in main bundle' + mainKeys[i18nKey]);
                            } else {
                                // Key doesn't exist yet in the main bundle
                                QUnit.ok(true, i18nKey + ' doesn\'t exist yet in the main bundles');
                            }

                            // Check if it was already defined by a previous widget
                            if (widgetKeys[i18nKey] && widgetKeys[i18nKey] !== widgetID) {
                                // Key already exists in another widget
                                QUnit.ok(false, i18nKey + ' already exists in ' + widgetKeys[i18nKey]);
                            } else {
                                // Key doesn't exist yet in the main bundle
                                QUnit.ok(true, i18nKey + ' doesn\'t exist yet in another widget');
                            }

                            widgetKeys[i18nKey] = widgetID;
                        });
                    });
                });
            }
        });

        // Start consuming tests again.
        QUnit.start(2);
    };

   // Load up QUnit
    QUnit.load();

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(doubleTranslationKeysTest);
});
