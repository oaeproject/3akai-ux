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

define(['exports', 'jquery', 'qunitjs'], function(exports, $) {

    var tests = [];
    var testResults = {};
    var currentTest = false;

    /**
     * Takes in a stringified bundle and transforms it JSON
     * @param  {String}   Bundle that has been read and passed as a String
     */
    var changeToJSON = function(input) {
        var json = {};
        var inputLine = input.split(/\n/);
        var i;
        $.each(inputLine, function(i, line) {
            // IE 8 i has indexof as well which breaks the page.
            if (inputLine.hasOwnProperty(i)) {
                var keyValuePair = inputLine[i].split(/\=/);
                var key = $.trim(keyValuePair.shift());
                var value = $.trim(keyValuePair.join('='));
                json[key] = value;
            }
        });
        return json;
    };


    /**
     * [ description]
     *
     * @param  {[type]}   widgets  [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var loadWidgetHTML = exports.loadWidgetHTML = function(widgets, callback) {
        var widgetsToDo = 0;
        var widgetHTML = [];
        $.each(widgets, function(i, widget) {
            var widgetObj = {'id': widget.id, 'src': widget.src};
            widgetHTML.push(widgetObj);
        });

        var getHTML = function(widget) {
            var htmlToDo = 0;

            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/' + widget.src,
                success: function(data) {
                    widgetHTML[widgetsToDo].html = data;
                    widgetsToDo++;
                    if (widgetsToDo !== widgetHTML.length) {
                        getHTML(widgetHTML[widgetsToDo]);
                    } else {
                        callback(widgetHTML);
                    }
                }
            });
        };

        getHTML(widgetHTML[0]);
    };

    /**
     * Retrieves the bundle files from widgets
     */
    var loadWidgetBundles = exports.loadWidgetBundles = function(widgets, callback) {
        var widgetsToDo = 0;
        var widgetBundles = [];
        $.each(widgets, function(i, widget) {
            var widgetObj = {'id': widget.id, 'bundles': []};
            if (widget.i18n) {
                $.each(widget.i18n, function(i, bundle) {
                    if (i === 'default') {
                        widgetObj.bundles.push(i);
                    }
                });
                widgetBundles.push(widgetObj);
            }
        });

        /**
         * Gets the bundles for a widget
         */
        var getBundles = function(widgetBundle) {
            var bundlesToDo = 0;

            /**
             * Gets the individual bundles in a widget
             */
            var getBundle = function() {
                $.ajax({
                    dataType: 'text',
                    url: '/node_modules/oae-core/' + widgetBundle.id + '/bundles/default.properties',
                    success: function(data) {
                        widgetBundles[widgetsToDo].i18n = widgetBundles[widgetsToDo].i18n || [];
                        widgetBundles[widgetsToDo].i18n['default'] = changeToJSON(data);
                        bundlesToDo++;
                        if (bundlesToDo === widgetBundle.bundles.length) {
                            widgetsToDo++;
                            if (widgetsToDo !== widgetBundles.length) {
                                getBundles(widgetBundles[widgetsToDo]);
                            } else {
                                $.ajax({
                                    dataType: 'text',
                                    url: '/ui/bundles/default.properties',
                                    success: function(data) {
                                        widgetBundles[widgetsToDo] = {};
                                        widgetBundles[widgetsToDo].i18n = {};
                                        widgetBundles[widgetsToDo].id = 'default bundle';
                                        widgetBundles[widgetsToDo].i18n['default'] = changeToJSON(data);
                                        callback(widgetBundles);
                                    }
                                });
                            }
                        } else {
                            getBundle();
                        }
                    }
                });
            };

            getBundle();
        };

        getBundles(widgetBundles[0]);
    };

    /**
     * Loads the widget manifests
     */
    var loadWidgets = exports.loadWidgets = function(callback) {
        $.ajax({
            url: '/api/ui/widgets',
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    };

    /**
     * QUnit calls this function when it has completed all of its tests
     * We simply define the function and it gets called
     */
    QUnit.done = function(completed) {
        var location = window.location.href.split('/');
        location = location[location.length-1];
        testDone({
            'url': location,
            'failed': completed.failed,
            'passed': completed.passed,
            'total': completed.total
        });
    };

    var testDone = function(results) {
        parent.$(parent.document).trigger('tests.qunit.done', results);
    };

    /**
     * Run an individual test
     *
     * @param {Object} test The test to run, should be in format
     * {url:'tests/mytest.html', title: 'My Test'}
     */
    var runTest = function(test) {
        currentTest = test;
        var $iframe = $('<iframe/>');
        $('#tests-run-all-container').append($iframe);
        $iframe.attr('src', test.url);
        startTime = new Date();
    };

    /**
     * runAllTests populates the tests array with any link in the index.html file
     * that contains a test class. It will then kick off the first test.
     */
    var runAllTests = function() {

        $(document).off('tests.qunit.done').on('tests.qunit.done', function(ev, results) {
            testResults[results.url] = testResults[results.url] || {};
            $.extend(testResults[results.url], results);
            if (tests.length) {
                runTest(tests.pop());
            }
        });

        var $tests = $('a.test');
        $.each($tests, function(i, val) {
            tests.push({
                'url': $(val).attr('href'),
                'title': $(val).text()
            });
        });

        tests.reverse();

        $('#tests-run-all-container').empty();

        runTest(tests.pop());
    };

    $(document).on('click', '#tests_run_all', runAllTests);

});
