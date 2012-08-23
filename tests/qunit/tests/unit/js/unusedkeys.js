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
        var batchSections = {};
        var batchURLs = [];
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
         * Add a URL to the complete list of batch URLs
         * @param {String} url The URL that we are adding
         */
        var addToBatchURLs = function(url, section) {
            batchURLs.push({
                'url': url,
                'method': 'GET'
            });
            if (!batchSections[section]) {
                batchSections[section] = [];
            }
            batchSections[section].push(url);
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
         * Perform the batch request.
         */
        var performBatchRequest = function() {
            sakai.api.Server.batch(batchURLs, function(success, data) {
                if (success && data && data.results) {
                    processBatchRequest(data.results);
                }
            });
        };

        /**
         * Add the JS and HTML files for widgets to the batch request
         */
        var addWidgetFiles = function() {
            for (var z=0,y=sakai_global.qunit.widgets.length; z<y; z++) {
                addToBatchURLs(sakai_global.qunit.widgets[z].html, 'widgethtml');
                addToBatchURLs(sakai_global.qunit.widgets[z].js, 'widgetjs');
            }
        };

        /**
         * Add the JS and HTML files for core dev files to the batch request
         */
        var addCoreFiles = function() {
            // Add all the core HTML files
            for (var i=0,j=sakai_global.qunit.devHtmlFiles.length; i<j; i++) {
                addToBatchURLs(sakai_global.qunit.devHtmlFiles[i], 'devhtml');
            }

            // Add all the core JS files
            for (var a=0,b=sakai_global.qunit.devJsFiles.length; a<b; a++) {
                addToBatchURLs(sakai_global.qunit.devJsFiles[a], 'devjs');
            }
        };

        /**
         * Add the widget bundles to the batch request
         */
        var addWidgetBundles = function() {
            for (var i in sakai.widgets) {
                if (sakai.widgets.hasOwnProperty(i) && sakai.widgets[i].i18n) {
                    for (var j in sakai.widgets[i].i18n) {
                        if (sakai.widgets[i].i18n.hasOwnProperty(j) && sakai.widgets[i].i18n[j].bundle) {
                            addToBatchURLs(sakai.widgets[i].i18n[j].bundle , 'widgetbundle');
                        }
                    }
                }
            }
        };

        /**
         * Filter the default language bundles
         * @param data {Object} The object we get back from the server
         */
        var filterDefaultBundles = function(data) {
            for (var bundle in data) {
                if (data.hasOwnProperty(bundle) && bundle.substr(-11) === '.properties') {
                    addToBatchURLs(devBundleURL + '/' + bundle, 'devbundle');
                }
            }
        };

        /**
         * Get all the dev bundles.
         * If this succeeds, start building the batch request and actually perform it
         */
        var getDevBundles = function() {
            $.ajax({
                url: '/dev/bundle.1.json',
                dataType: 'json',
                success: function(data) {
                    filterDefaultBundles(data);
                    addWidgetBundles();
                    addCoreFiles();
                    addWidgetFiles();
                    performBatchRequest();
                }
            });
        };

        /**
         * Start the actual test
         */
        var startTest = function() {
            if (sakai.api.i18n.done) {
                getDevBundles();
            } else {
                $(window).on('done.i18n.sakai', function() {
                    getDevBundles();
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
