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

        module("i18n Coverage");

        /**
         * Generates an overview of the test coverage
         *
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var i18nCoverageTest = function(widgetData) {
            // Check how many keys aren't translated in each bundle by looking at what's in the default bundle
            var totalDefaultKeys = _.keys(widgetData.mainBundles['default']).length;
            $.each(widgetData.mainBundles, function(i, mainBundle) {
                if (i !== 'default') {
                    asyncTest(i + '.properties', function() {
                        var keysFound = 0;
                        $.each(widgetData.mainBundles['default'], function(ii, defaultKey) {
                            if (mainBundle[ii]) {
                                keysFound++;
                            }
                        });
                        if (keysFound === totalDefaultKeys) {
                            ok(true, '100% coverage for ' + i + '.properties');
                        } else {
                            console.log((keysFound / totalDefaultKeys) * 100);
                            ok(false, ((keysFound / totalDefaultKeys) * 100).toFixed(2) + '% coverage for ' + i + '.properties, ' + (totalDefaultKeys - keysFound) + ' keys missing.');
                        }
                        start();
                    });
                }
            });

        };

        util.loadWidgets(i18nCoverageTest);

        QUnit.load();
        QUnit.start();
    }
);
