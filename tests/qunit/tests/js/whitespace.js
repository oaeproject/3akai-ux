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

    module("Whitespace in Translation Keys");

    /**
     * Test a language bundle for erroneous whitespace in the translation keys
     *
     * @param  {String}    bundlePath           The path to the i18n bundle
     * @param  {Object}    bundle               The keys and translations in the i18n bundle
     */
    var checkWhitespace = function(bundlePath, bundle) {
        $.each(bundle, function(i18nKey, i18nValue) {
            // Check if the translation has repeated whitespace
            var whitespaceRegex = /\s{2,}/g;
            if (whitespaceRegex.test(i18nValue)) {
                ok(false, i18nKey + ' has a double whitespace in bundle ' + bundlePath);
            } else {
                ok(true, i18nKey + ' has no double whitespace in bundle ' + bundlePath);
            }
        });
    };

    /**
     * Initialize the whitespace translation keys test
     *
     * @param {Object}    testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var whitespaceTest = function(testData) {
        // Test the main bundles for erroneous whitespace
        $.each(testData.mainBundles, function(mainBundlePath, mainBundle) {
            test(mainBundlePath, function() {
                checkWhitespace(mainBundlePath, mainBundle);
            });
        });

        // Test the email bundles for erroneous whitespace
        $.each(testData.emailBundles, function(emailBundlePath, emailBundle) {
            test(emailBundlePath, function() {
                checkWhitespace(emailBundlePath, emailBundle);
            });
        });

        // Test the widget bundles for erroneous whitespace
        $.each(testData.widgetData, function(widgetId, widget) {
            if (widget.i18n) {
                test(widgetId, function() {
                    $.each(widget.i18n, function(widgetBundleKey, widgetBundle) {
                        checkWhitespace(widgetBundleKey, widgetBundle);
                    });
                });
            }
        });

        // Start consuming tests again.
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(whitespaceTest);
});
