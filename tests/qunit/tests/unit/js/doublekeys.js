/*global require, QUnit, sakai_global */
require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'underscore',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai, _) {

    'use strict';

        QUnit.module('Double Translation Keys');

        var batchURLs = [];
        var regex = new RegExp('__MSG__(.*?)__', 'gm');
        var keylist = {};
        var ignoreKeys = ['description', 'name', 'WIDGET_TITLE'];

        /**
         * Check the key for a specific widget
         * @param {String} widgetname The name of the widget
         * @param {String} key Key that needs to be checked
         */
        var checkWidgetKey = function(widgetname, key) {
            var widgetslistwithkey = [];
            var widgetdefaultbundlekey = sakai.api.i18n.data.defaultBundle[key];
            $.each(keylist, function(i) {
                if (i !== widgetname) {
                    for (var j = 0, k = keylist[i].length; j < k; j++) {
                        if (keylist[i][j] === key) {
                            widgetslistwithkey.push(i);
                        }
                    }
                }
            });

            if (widgetslistwithkey.length === 0 && _.isUndefined(widgetdefaultbundlekey)) {
                QUnit.ok(true, 'The key "' + key + '" isn\'t used in any other widgets or in the defaultbundle');
            } else {
                var outputtext = 'The key "' + key + '" is used in';
                if (widgetslistwithkey.length !== 0) {
                    outputtext += ' the following widgets: ' + widgetslistwithkey.join(', ');
                }
                if (! _.isUndefined(widgetdefaultbundlekey)) {
                    outputtext += (widgetslistwithkey.length !== 0 ? ' &' : '') + ' the default core bundle';
                }
                QUnit.ok(false, outputtext);
            }

        };

        /**
         * Check the keys for each widget
         * @paramam {String} widgetname The name of the widget
         */
        var checkWidgetKeys = function(widgetname) {
            QUnit.test(widgetname, function() {
                keylist[widgetname] = keylist[widgetname].sort();
                for (var j = 0, k = keylist[widgetname].length; j < k; j++) {
                    checkWidgetKey(widgetname, keylist[widgetname][j]);
                }
            });
        };

        /**
         * Run over all the widgets & check their keys
         */
        var checkWidgets = function() {
            $.each(keylist, function(i) {
                checkWidgetKeys(i);
            });
        };

        /**
        * Add a key to the key list
        * @param {String} key The key which is used in a widget e.g. __MSG__TEST__
        * @param {String} widgetname The name of the widget
        */
        var addWidgetKey = function(key, widgetname) {

            // We won't add the key in certain cases: e.g. when it's empty or starts with #
            if (!key || key.substring(0,1) === '#' || $.inArray(key, ignoreKeys) !== -1) {
                return;
            }

            // Only add it once
            if ($.inArray(key, keylist[widgetname]) === -1) {
                keylist[widgetname].push(key);
            }
        };

        /**
         * Add all the keys of a widget to the keylist
         * We need to do this in order to be able to sort the elements
         * @param {Object} widgetkeys Object with all the widget keys
         * @param {String} widgetname Name of the widget
         */
        var addWidgetKeys = function(widgetkeys, widgetname) {
            // We need to add all the widget keys to an array in order to sort them
            $.each(widgetkeys, function(widgetkey) {
                addWidgetKey(widgetkey, widgetname);
            });
        };

        /**
         * Add a URL to the complete list of batch URLs
         * @param {String} url The URL that we are adding
         */
        var addToBatchURLs = function(url) {
            batchURLs.push({
                'url': url,
                'method': 'GET'
            });
        };

        /**
        * Grabs the widget's default bundle & add it to the batch request
        *
        * @param {String} widgetname The name of the widget
        */
        var addBundleToBatchURLs = function(widgetname) {
            var bundle = false;
            if ($.isPlainObject(sakai.widgets[widgetname].i18n)) {
                if (sakai.widgets[widgetname].i18n['default']) {
                    bundle = sakai.widgets[widgetname].i18n['default'];
                }
            }
            if (bundle && bundle.bundle) {
                addToBatchURLs(bundle.bundle);
            }
        };

        /**
         * Process the batch request. Add the keys from each bundle & check if they are used or not
         * @param {Object} results The results from the batch request
         */
        var processBatchRequest = function(results) {

            QUnit.start();

            for (var i = 0, j = results.length; i < j; i++) {
                var item = results[i];
                var url = item.url;
                var widgetname = url.split('/')[2];
                // Check whether it is a bundle
                if (url.substr(-11) === '.properties') {
                    // The keys for a widget
                    var widgetkeys = sakai.api.i18n.changeToJSON(item.body);
                    addWidgetKeys(widgetkeys, widgetname);
                }
            }

            checkWidgets();
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
         * Run over all the widgets + add their keys
         */
        var buildBatchRequest = function() {

            // Check all the widgets
            for (var z = 0,y = sakai_global.qunit.widgets.length; z < y; z++) {
                var widget = sakai_global.qunit.widgets[z];
                keylist[widget.name] = [];
                addBundleToBatchURLs(widget.name);
            }

            performBatchRequest();

        };

        /**
         * Start the actual tests
         */
        var startTest = function() {
            if (sakai.api.i18n.done) {
                buildBatchRequest();
            } else {
                $(window).on('done.i18n.sakai', function() {
                    buildBatchRequest();
                });
            }
        };

        /**
        * Run the test
        */
        if (sakai_global.qunit && sakai_global.qunit.ready) {
            startTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                startTest();
            });
        }

    }
);
