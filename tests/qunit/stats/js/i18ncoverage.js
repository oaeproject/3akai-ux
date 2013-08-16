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

    module('i18n coverage');

    /**
     * Generates an overview of the i18n coverage for the widget bundles
     *
     * @param  {Object}   widgetData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var checkWidgetBundles = function(widgetData) {
        // Loop over all the widgets to test each one
        $.each(widgetData.widgetData, function(widgetID, widget) {
            if (widget.i18n) {
                // Check how many keys aren't translated in each bundle by looking at what's in the default bundle
                var totalDefaultKeys = _.keys(widget.i18n['default']).length;
                var defaultBundle = widget.i18n['default'];

                // Loop all widget bundles and verify that all keys that are in the default bundle are also present in the other bundles.
                $.each(widget.i18n, function(bundleID, widgetBundle) {
                    if (bundleID !== 'default') {
                        asyncTest(widget.id + ' - ' + bundleID + '.properties', function() {
                            var keysTranslated = 0;
                            // Keep count of how many keys are translated in the bundle
                            $.each(defaultBundle, function(defaultKey) {
                                if (widgetBundle[defaultKey] !== undefined) {
                                    keysTranslated++;
                                } else {
                                    ok(false, defaultKey + ' has no translation in ' + widget.id + ' - ' + bundleID);
                                }
                            });
                            if (keysTranslated === totalDefaultKeys) {
                                ok(true, '100% coverage for ' + widget.id + ' - ' + bundleID);
                            } else {
                                ok(false, ((keysTranslated / totalDefaultKeys) * 100).toFixed(2) + '% coverage for ' + widget.id + ' - ' + bundleID + ', ' + (totalDefaultKeys - keysTranslated) + ' keys missing.');
                            }
                            start();
                        });
                    }
                });
            }
        });
    };

    /**
     * Generates an overview of the i18n coverage for the main bundles
     *
     * @param  {Object}   widgetData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var checkMainBundles = function(widgetData) {
        // Check how many keys aren't translated in each bundle by looking at what's in the default bundle
        var totalDefaultKeys = 0;
        var defaultBundle = null;

        // Get the total default keys and cache the default bundle for use later
        $.each(widgetData.mainBundles, function(bundlePath, bundle) {
            if (bundlePath.split('/').pop() === 'default.properties') {
                totalDefaultKeys = _.keys(bundle).length;
                defaultBundle = bundle;
            }
        });

        // Loop all main bundles and verify that all keys that are in the default bundle are also present in the other bundles.
        $.each(widgetData.mainBundles, function(bundlePath, mainBundle) {
            if (bundlePath.split('/').pop() !== 'default.properties') {
                asyncTest(bundlePath + '.properties', function() {
                    var keysTranslated = 0;
                    // Keep count of how many keys are translated in the bundle
                    $.each(defaultBundle, function(defaultKey) {
                        if (mainBundle[defaultKey] !== undefined) {
                            keysTranslated++;
                        } else {
                            ok(false, defaultKey + ' has no translation in ' + bundlePath);
                        }
                    });
                    if (keysTranslated === totalDefaultKeys) {
                        ok(true, '100% coverage for ' + bundlePath);
                    } else {
                        ok(false, ((keysTranslated / totalDefaultKeys) * 100).toFixed(2) + '% coverage for ' + bundlePath + ', ' + (totalDefaultKeys - keysTranslated) + ' keys missing.');
                    }
                    start();
                });
            }
        });
    };

    util.loadTestData(function(widgetData) {
        checkMainBundles(widgetData);
        checkWidgetBundles(widgetData);
    });

    QUnit.load();
    QUnit.start();
});
