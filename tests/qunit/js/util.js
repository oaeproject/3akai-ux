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

    QUnit.config.autostart = false;

    /**
     * Takes in a stringified bundle and transforms it JSON
     * @param  {String}   Bundle that has been read and passed as a String
     */
    var changeToJSON = function(input) {
        var json = {};
        var inputLine = input.split(/\n/);
        var i;
        $.each(inputLine, function(i, line) {
            if (line) {
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
     * @param  {[type]}   widgetData [description]
     * @param  {Function} callback   [description]
     *
     * @return {[type]}              [description]
     */
    var loadWidgetCSS = exports.loadWidgetCSS = function(widgetData, callback) {
        var widgetsToDo = 0;

        var getCSS = function(widget) {
            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/css/' + widget.id + '.css',
                success: function(data) {
                    widget.css = data;
                    widgetsToDo++;
                    if (widgetsToDo !== _.keys(widgetData).length) {
                        getCSS(widgetData[_.keys(widgetData)[widgetsToDo]]);
                    } else {
                        callback(widgetData);
                    }
                },
                error: function() {
                    widget.css = '';
                    widgetsToDo++;
                    if (widgetsToDo !== _.keys(widgetData).length) {
                        getCSS(widgetData[_.keys(widgetData)[widgetsToDo]]);
                    } else {
                        callback(widgetData);
                    }
                }
            });
        };

        getCSS(widgetData[_.keys(widgetData)[0]]);
    };

    /**
     * [ description]
     *
     * @param  {[type]}   htmlData [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var loadMainCSS = exports.loadMainCSS = function(cssData, callback) {
        var cssToDo = 0;

        var getCSS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/' + filename + '.css',
                success: function(data) {
                    cssData[filename] = data;
                    cssToDo++;
                    if (cssToDo === _.keys(cssData).length) {
                        callback(cssData);
                    }
                }
            });
        };

        $.each(cssData, function(i) {
            getCSS(i);
        });
    };

    /**
     * [ description]
     *
     * @param  {[type]}   htmlData [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var loadSharedCSS = exports.loadSharedCSS = function(cssData, callback) {
        var cssToDo = 0;

        var getCSS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/shared/oae/css/' + filename + '.css',
                success: function(data) {
                    cssData[filename] = data;
                    cssToDo++;
                    if (cssToDo === _.keys(cssData).length) {
                        callback(cssData);
                    }
                }
            });
        };

        $.each(cssData, function(i) {
            getCSS(i);
        });
    };


    /**
     * [ description]
     *
     * @param  {[type]}   widgetData [description]
     * @param  {Function} callback   [description]
     *
     * @return {[type]}              [description]
     */
    var loadWidgetJS = exports.loadWidgetJS = function(widgetData, callback) {
        var widgetsToDo = 0;

        var getJS = function(widget) {
            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/js/' + widget.id + '.js',
                success: function(data) {
                    widget.js = data;
                    widgetsToDo++;
                    if (widgetsToDo !== _.keys(widgetData).length) {
                        getJS(widgetData[_.keys(widgetData)[widgetsToDo]]);
                    } else {
                        callback(widgetData);
                    }
                }
            });
        };

        getJS(widgetData[_.keys(widgetData)[0]]);
    };

    /**
     * [ description]
     *
     * @param  {[type]}   htmlData [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var loadMainJS = exports.loadMainJS = function(jsData, callback) {
        var jsToDo = 0;

        var getJS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/' + filename + '.js',
                success: function(data) {
                    jsData[filename] = data;
                    jsToDo++;
                    if (jsToDo === _.keys(jsData).length) {
                        callback(jsData);
                    }
                }
            });
        };

        $.each(jsData, function(i) {
            getJS(i);
        });
    };

    /**
     * [ description]
     *
     * @param  {[type]}   htmlData [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var loadAPIJS = exports.loadAPIJS = function(jsData, callback) {
        var jsToDo = 0;

        var getJS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/shared/oae/api/' + filename + '.js',
                success: function(data) {
                    jsData[filename] = data;
                    jsToDo++;
                    if (jsToDo === _.keys(jsData).length) {
                        callback(jsData);
                    }
                }
            });
        };

        $.each(jsData, function(i) {
            getJS(i);
        });
    };

    /**
     * [ description]
     *
     * @param  {[type]}   widgetData [description]
     * @param  {Function} callback   [description]
     *
     * @return {[type]}              [description]
     */
    var loadWidgetHTML = exports.loadWidgetHTML = function(widgetData, callback) {
        var widgetsToDo = 0;

        var getHTML = function(widget) {
            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/' + widget.id + '.html',
                success: function(data) {
                    widget.html = data;
                    widgetsToDo++;
                    if (widgetsToDo !== _.keys(widgetData).length) {
                        getHTML(widgetData[_.keys(widgetData)[widgetsToDo]]);
                    } else {
                        callback(widgetData);
                    }
                }
            });
        };

        getHTML(widgetData[_.keys(widgetData)[0]]);
    };

    /**
     * [ description]
     *
     * @param  {[type]}   htmlData [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    var loadMainHTML = exports.loadMainHTML = function(htmlData, callback) {
        var htmlToDo = 0;

        var getHTML = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/ui/' + filename + '.html',
                success: function(data) {
                    htmlData[filename] = data;
                    htmlToDo++;
                    if (htmlToDo === _.keys(htmlData).length) {
                        callback(htmlData);
                    }
                }
            });
        };

        $.each(htmlData, function(i) {
            getHTML(i);
        });
    };

    /**
     * [ description]
     *
     * @param  {[type]}   macroHTML [description]
     * @param  {Function} callback  [description]
     *
     * @return {[type]}             [description]
     */
    var loadMacroHTML = exports.loadMacroHTML = function(macroHTML, callback) {
        var htmlToDo = 0;

        var getHTML = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/shared/oae/macros/' + filename + '.html',
                success: function(data) {
                    macroHTML[filename] = data;
                    htmlToDo++;
                    if (htmlToDo === _.keys(macroHTML).length) {
                        callback(macroHTML);
                    }
                }
            });
        };

        $.each(macroHTML, function(i) {
            getHTML(i);
        });
    };

     /**
      * Retrieves the bundle files from widgets
      *
      * @param  {[type]}   widgetData [description]
      * @param  {Function} callback   [description]
      *
      * @return {[type]}              [description]
      */
    var loadWidgetBundles = exports.loadWidgetBundles = function(widgetData, callback) {
        var widgetsToDo = 0;

        /**
         * Gets the bundles for a widget
         */
        var getBundles = function(widget) {
            //console.log(widgetBundle);
            var bundlesToDo = 0;

            /**
             * Gets the individual bundles in a widget
             */
            var getBundle = function(key) {
                $.ajax({
                    dataType: 'text',
                    url: '/node_modules/oae-core/' + widget.id + '/bundles/' + key + '.properties',
                    success: function(data) {
                        widget.i18n[key] = changeToJSON(data);
                        bundlesToDo++;
                        if (bundlesToDo === _.keys(widget.i18n).length) {
                            widgetsToDo++;
                            if (widgetsToDo !== _.keys(widgetData).length) {
                                // If the next widget has no i18n properties, skip to the next until we get one that
                                // does have properties files or we run out of widgets
                                if ($.isEmptyObject(widgetData[_.keys(widgetData)[widgetsToDo]].i18n)) {
                                    while ($.isEmptyObject(widgetData[_.keys(widgetData)[widgetsToDo]].i18n)) {
                                        widgetsToDo++;
                                    }
                                }
                                getBundles(widgetData[_.keys(widgetData)[widgetsToDo]]);
                            } else {
                                callback(widgetData);
                            }
                        }
                    }
                });
            };

            $.each(widget.i18n, function(i, bundle) {
                getBundle(i);
            });
        };

        getBundles(widgetData[_.keys(widgetData)[0]]);
    };

    /**
     * [ description]
     *
     * @param  {[type]}   bundleData [description]
     * @param  {Function} callback   [description]
     *
     * @return {[type]}              [description]
     */
    var loadMainBundles = exports.loadMainBundles = function(bundleData, callback) {
        var bundlesToDo = 0;

        /**
         * Gets a global bundle
         */
        var getBundle = function(key) {
            $.ajax({
                dataType: 'text',
                url: '/ui/bundles/' + key + '.properties',
                success: function(data) {
                    bundleData[key] = changeToJSON(data);
                    bundlesToDo++;
                    if (bundlesToDo === _.keys(bundleData).length) {
                        callback(bundleData);
                    }
                }
            });
        };

        $.each(bundleData, function(i) {
            getBundle(i);
        });
    };

    /**
     * Loads the widget data
     */
    var loadWidgets = exports.loadWidgets = function(callback) {
        $.ajax({
            url: '/api/ui/widgets',
            dataType: 'json',
            success: function(data) {
                // Caches the widget data (i18n, html and css)
                var widgetData = {};

                // Create an object per widget
                $.each(data, function(i, widget) {
                    widgetData[i] = {
                        'id': i,
                        'html': null,
                        'i18n': {},
                        'js': null
                    };

                    // Create an i18n object in the widget i18n property per bundle in the widget
                    if (widget.i18n) {
                        $.each(widget.i18n, function(ii, bundle) {
                            widgetData[i].i18n[ii] = null;
                        });
                    }
                });

                var mainBundles = {
                    'ca_ES': null,
                    'de_DE': null,
                    'default': null,
                    'en_GB': null,
                    'en_US': null,
                    'es_ES': null,
                    'fr_FR': null,
                    'it_IT': null,
                    'nl_NL': null,
                    'ru_RU': null,
                    'zh_CN': null
                };

                var mainHTML = {
                    'shared/oae/errors/accessdenied': null,
                    'shared/oae/errors/maintenance': null,
                    'shared/oae/errors/noscript': null,
                    'shared/oae/errors/notfound': null,
                    'shared/oae/errors/unavailable': null,
                    'content': null,
                    'discussion': null,
                    'group': null,
                    'index': null,
                    'me': null,
                    'search': null,
                    'user': null
                };

                var macroHTML = {
                    'activity': null,
                    'autosuggest': null,
                    'list': null
                };

                var mainJS = {
                    'shared/oae/errors/js/accessdenied': null,
                    'ui/js/content': null,
                    'ui/js/discussion': null,
                    'ui/js/group': null,
                    'ui/js/index': null,
                    'ui/js/me': null,
                    'shared/oae/errors/js/notfound': null,
                    'ui/js/search': null,
                    'shared/oae/errors/js/unavailable': null,
                    'ui/js/user': null
                };

                var apiJS = {
                    'oae.api.authentication': null,
                    'oae.api.content': null,
                    'oae.api.i18n': null,
                    'oae.api.profile': null,
                    'oae.api.widget': null,
                    'oae.api.comment': null,
                    'oae.api.discussion': null,
                    'oae.api': null,
                    'oae.api.user': null,
                    'oae.bootstrap': null,
                    'oae.api.config': null,
                    'oae.api.group': null,
                    'oae.api.l10n': null,
                    'oae.api.util': null,
                    'oae.core': null
                };

                var mainCSS = {
                    'ui/css/oae.discussion': null,
                    'shared/oae/errors/css/oae.error': null,
                    'ui/css/oae.index': null,
                    'shared/oae/errors/css/oae.noscript': null,
                    'ui/css/oae.search': null
                };

                var sharedCSS = {
                    'oae.base': null,
                    'oae.components': null,
                    'oae.core': null,
                    'oae.skin.static': null
                };

                // Load the main bundles
                loadMainBundles(mainBundles, function(mainBundles) {
                    // Load the widget bundles
                    loadWidgetBundles(widgetData, function(widgetData) {
                        // Load the main HTML
                        loadMainHTML(mainHTML, function(mainHTML) {
                            // Load the macro HTML
                            loadMacroHTML(macroHTML, function(macroHTML) {
                                // Load the widget HTML
                                loadWidgetHTML(widgetData, function(widgetData) {
                                    // Load the widget JavaScript
                                    loadWidgetJS(widgetData, function(widgetData) {
                                        // Load the main JS
                                        loadMainJS(mainJS, function(mainJS) {
                                            // Load the main CSS
                                            loadMainCSS(mainCSS, function(mainCSS) {
                                                // Load the shared CSS
                                                loadSharedCSS(sharedCSS, function(sharedCSS) {
                                                    // Load the widget CSS
                                                    loadWidgetCSS(widgetData, function(widgetData) {
                                                        // Load the API JS
                                                        loadAPIJS(apiJS, function(apiJS) {
                                                            console.log({
                                                                'widgetData': widgetData,
                                                                'mainBundles': mainBundles,
                                                                'mainHTML': mainHTML,
                                                                'macroHTML': macroHTML,
                                                                'mainJS': mainJS,
                                                                'apiJS': apiJS,
                                                                'mainCSS': mainCSS,
                                                                'sharedCSS': sharedCSS
                                                            });
                                                            callback({
                                                                'widgetData': widgetData,
                                                                'mainBundles': mainBundles,
                                                                'mainHTML': mainHTML,
                                                                'macroHTML': macroHTML,
                                                                'mainJS': mainJS,
                                                                'apiJS': apiJS,
                                                                'mainCSS': mainCSS,
                                                                'sharedCSS': sharedCSS
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
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
