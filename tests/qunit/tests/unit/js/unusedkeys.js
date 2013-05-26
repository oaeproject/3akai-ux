/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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

/*global require, sakai_global, QUnit, asyncTest, module, ok, start */
require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

    'use strict';

        module('Unused Keys');

        var allHtml = '';
        var allJs = '';
        var allBundles = {};
        var devBundleURL = '/dev/bundle';
        var ignoreKeys = ['description', 'name'];
        var keyList = {};
        var keyListWidgets = {};
        var regex = new RegExp('__MSG__(.*?)__', 'gm');
        var widgets = {};
        var sakaiConfigStr = JSON.stringify(sakai.config);

        /**
         * Perform the actual check
         * Some keys, such as empty ones, will be filtered out before the check
         * @private
         * @param {String} htmldata The HTML string we'll check
         * @param {String} javascript The JavaScriopt string we'll check
         * @param {String} key The key which we'll search for
         */
        var performCheck = function(htmldata, javascript, key) {
            var completekey = '__MSG__' + key + '__';

            if (!key || key.substring(0,1) === '#' || $.inArray(key, ignoreKeys) !== -1) {
                return;
            }

            if (htmldata.indexOf(completekey) >= 0 || javascript.indexOf(key) >= 0 || sakaiConfigStr.indexOf(key) >= 0) {
                ok(true, 'The following key is used: ' + key);
            } else {
                ok(false, 'The following key isn\'t used: ' + key);
            }
        };

        /**
         * Perform the test for a widget.
         * It will initiate the test, run over all the keys and check every key for that widget
         * @param {String} widgetname Name of the widget
         * @param {String} language The language we are checking (e.g. en_US)
         * @param {Object} keys Object containing all the keys for a widget
         */
        var performWidgetTest = function(widgetname, language, keys) {
            QUnit.test('Widget - name:' + widgetname + ' - language:' + language, function() {
                // Each key in a bundle of a widget
                for (var i in keys) {
                    if (keys.hasOwnProperty(i)) {
                        var widget = widgets[widgetname];
                        performCheck(widget.html, widget.js, i);
                    }
                }
            });
        };

        /**
         * Perform the test for dev bundles.
         * @param {String} language The language we are checking (e.g. en_US)
         * @param {Object} keys Object containing all the keys
         */
        var performDevTest = function(language, keys) {
            QUnit.test('Dev bundle - language:' + language, function() {
                for (var i in keys) {
                    if (keys.hasOwnProperty(i)) {
                        performCheck(allHtml, allJs, i);
                    }
                }
            });
        };

        /**
         * Check which keys are used for every widget
         */
        var checkWidgetKeysUsed = function() {
            // All widgets
            for (var i in keyListWidgets) {
                if (keyListWidgets.hasOwnProperty(i)) {
                    // Each bundle per widget
                    for (var j in keyListWidgets[i]) {
                        if (keyListWidgets[i].hasOwnProperty(j)) {
                            performWidgetTest(i, j, keyListWidgets[i][j]);
                        }
                    }
                }
            }
        };

        /**
         * Check which keys are used in the /dev environment
         */
        var checkDevKeysUsed = function() {
            // All the dev languages
            for (var i in keyList) {
                if (keyList.hasOwnProperty(i)) {
                    performDevTest(i, keyList[i]);
                }
            }
        };

        /**
         * Check if the object for a certain widget exists.
         * If it doesn't, create it
         */
        var checkWidgetObject = function(widgetname) {
            if (!widgets[widgetname]) {
                widgets[widgetname] = {};
            }
        };

        /**
         * Add to the widget HTML
         * @param {String} htmldata The HTML as a string
         */
        var addToWidgetHtml = function(widgetname, htmldata) {
            checkWidgetObject(widgetname);
            widgets[widgetname].html = htmldata;
        };

        /**
         * Add to the widget JavaScript
         * @param {String} javascript The JavaScript as a string
         */
        var addToWidgetJs = function(widgetname, javascript) {
            checkWidgetObject();
            widgets[widgetname].js = javascript;
        };

        /**
         * Add to the complete list of all the HTML & Javascript
         * @param {String} htmldata The HTML as a string
         */
        var addToAllHtml = function(htmldata) {
            allHtml += htmldata;
        };

        /**
         * Add to the complete list of all the Html & Javascript
         * @param {String} javascript The JavaScript as a string
         */
        var addToAllJs = function(javascript) {
            allJs += javascript;
        };

        /**
         * Add a certain widget bundle to the keylist
         * @param {String} language The language (e.g. en_US)
         * @param {String} widgetname Name of the widget
         * @param {String} body A string containing all the keys for a widget. We'll convert this to JSON
         */
        var addWidgetBundleToKeyList = function(language, widgetname, body) {
            if (!$.isPlainObject(keyListWidgets[widgetname])) {
                keyListWidgets[widgetname] = {};
            }
            keyListWidgets[widgetname][language] = sakai.api.i18n.changeToJSON(body);
        };

        /**
         * Add a language bundle for a dev bundle to the key list
         * @param {String} language The language (e.g. en_US)
         * @param {String} body A string containing all the keys for that bundle. We'll convert this to JSON
         */
        var addDevBundleToKeyList = function(language, body) {
            keyList[language] = sakai.api.i18n.changeToJSON(body);
        };

        /**
         * Process the batch request
         * @param results {Object} The data returned from the server
         */
        var processBatchRequest = function(results) {
            QUnit.start();
            for (var i = 0, j = results.length; i < j; i++) {

                var item = results[i];
                var url = item.url;
                var language = '', widgetname = '';

                if ($.inArray(url, batchSections.devbundle) !== -1) {
                    language = url.replace(devBundleURL + '/', '').replace('.properties', '');
                    addDevBundleToKeyList(language, item.body);
                }
                if ($.inArray(url, batchSections.widgetbundle) !== -1) {
                    language = url.split('/')[4].replace('.properties', '');
                    widgetname = url.split('/')[2];
                    addWidgetBundleToKeyList(language, widgetname, item.body);
                }
                else if ($.inArray(url, batchSections.devhtml) !== -1) {
                    addToAllHtml(item.body);
                }
                else if ($.inArray(url, batchSections.devjs) !== -1) {
                    addToAllJs(item.body);
                }
                else if ($.inArray(url, batchSections.widgethtml) !== -1) {
                    widgetname = url.split('/')[2];
                    addToWidgetHtml(widgetname, item.body);
                    addToAllHtml(item.body);
                }
                else if ($.inArray(url, batchSections.widgetjs) !== -1) {
                    widgetname = url.split('/')[2];
                    addToWidgetJs(widgetname, item.body);
                    addToAllJs(item.body);
                }
            }

            checkWidgetKeysUsed();
            checkDevKeysUsed();
            $(window).trigger('addlocalbinding.qunit.sakai');
        };

        /**
         * Get all the language files.
         */
        var getBundles = function() {
            var urls = [];

            // Get all the /dev bundles.
            for (var i = 0; i < sakai.config.Languages.length; i++) {
                urls.push(sakai.config.Languages[i].bundle);
            }

            // Get all the widget bundles.
            for (var i in sakai.widgets) {
                if (sakai.widgets.hasOwnProperty(i) && sakai.widgets[i].i18n) {
                    for (var j in sakai.widgets[i].i18n) {
                        if (sakai.widgets[i].i18n.hasOwnProperty(j) && sakai.widgets[i].i18n[j].bundle) {
                            urls.push(sakai.widgets[i].i18n[j].bundle);
                        }
                    }
                }
            }

            var results = [];
            var getFiles = function(allUrls) {
                // Get'em all
                var urls = allUrls.slice(0, 40);
                allUrls.splice(0, 40);
                sakai.api.Server.staticBatch(urls, function(success, data) {
                    if (success && data && data.results) {
                        results = results.concat(data.results);
                    }

                    if (allUrls.length > 0) {
                        // Get remaining files.
                        getFiles(allUrls);
                    } else {
                        // We're done.
                        console.log(results);
                    }
                });
            };

            console.log(urls.length);
            getFiles(urls);
        };

        /**
         * Start the actual test
         */
        var startTest = function() {
            if (sakai.api.i18n.done) {
                getBundles();
            } else {
                $(window).on('done.i18n.sakai', function() {
                    getBundles();
                });
            }
        };

        /**
        * Run the test
        */
        if (sakai_global.qunit && sakai_global.qunit.ready) {
            startTest();
        }
        else {
            $(window).on('ready.qunit.sakai', function() {
                startTest();
            });
        }

    }
);
