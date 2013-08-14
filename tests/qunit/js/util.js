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

define(['exports', 'jquery', 'oae.core', 'qunitjs', 'jquery.properties-parser'], function(exports, $, oae) {

    var tests = [];
    var testResults = {};
    var currentTest = false;

    // By default, QUnit runs tests when load event is triggered on the window.
    // We're loading tests asynchronsly and set this property to false, then call QUnit.start() once everything is loaded. 
    QUnit.config.autostart = false;

    /**
     * Loads the widget CSS files
     *
     * @param  {[type]}   widgetData [description]
     * @param  {Function} callback   [description]
     *
     * @return {[type]}              [description]
     */
    var loadWidgetCSS = exports.loadWidgetCSS = function(widgetData, callback) {
        var todo = _.keys(widgetData).length;
        var done = 0;

        var getCSS = function(widget) {
            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/css/' + widget.id + '.css',
                success: function(data) {
                    widget.css = data;
                    done++;
                    if (done !== todo) {
                        getCSS(widgetData[_.keys(widgetData)[done]]);
                    } else {
                        callback(widgetData);
                    }
                },
                error: function() {
                    widget.css = '';
                    done++;
                    if (done !== todo) {
                        getCSS(widgetData[_.keys(widgetData)[done]]);
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
        var todo = _.keys(cssData).length;
        var done = 0;

        var getCSS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/' + filename + '.css',
                success: function(data) {
                    cssData[filename] = data;
                    done++;
                    if (done === todo) {
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
        var todo = _.keys(cssData).length;
        var done = 0;

        var getCSS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/shared/oae/css/' + filename + '.css',
                success: function(data) {
                    cssData[filename] = data;
                    done++;
                    if (done === todo) {
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
        var todo = _.keys(widgetData).length;
        var done = 0;

        var getJS = function(widget) {
            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/js/' + widget.id + '.js',
                success: function(data) {
                    widget.js = data;
                    done++;
                    if (done !== todo) {
                        getJS(widgetData[_.keys(widgetData)[done]]);
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
        var todo = _.keys(jsData).length;
        var done = 0;

        var getJS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/' + filename + '.js',
                success: function(data) {
                    jsData[filename] = data;
                    done++;
                    if (done === todo) {
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
        var todo = _.keys(jsData).length;
        var done = 0;

        var getJS = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/shared/oae/api/' + filename + '.js',
                success: function(data) {
                    jsData[filename] = data;
                    done++;
                    if (done === todo) {
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
        var todo = _.keys(widgetData).length;
        var done = 0;

        var getHTML = function(widget) {
            $.ajax({
                dataType: 'text',
                url: '/node_modules/oae-core/' + widget.id + '/' + widget.id + '.html',
                success: function(data) {
                    widget.html = data;
                    done++;
                    if (done !== todo) {
                        getHTML(widgetData[_.keys(widgetData)[done]]);
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
        var todo = _.keys(htmlData).length;
        var done = 0;

        var getHTML = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/ui/' + filename + '.html',
                success: function(data) {
                    htmlData[filename] = data;
                    done++;
                    if (done === todo) {
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
        var todo = _.keys(macroHTML).length;
        var done = 0;

        var getHTML = function(filename) {
            $.ajax({
                dataType: 'text',
                url: '/shared/oae/macros/' + filename + '.html',
                success: function(data) {
                    macroHTML[filename] = data;
                    done++;
                    if (done === todo) {
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
        var widgetsToDo = _.keys(widgetData).length;
        var widgetsDone = 0;

        /**
         * Gets the bundles for a widget
         */
        var getBundles = function(widget) {
            var bundlesToDo = _.keys(widget.i18n).length;
            var bundlesDone = 0;

            /**
             * Gets the individual bundles in a widget
             */
            var getBundle = function(key) {
                $.ajax({
                    dataType: 'text',
                    url: '/node_modules/oae-core/' + widget.id + '/bundles/' + key + '.properties',
                    success: function(data) {
                        widget.i18n[key] = $.parseProperties(data);
                        bundlesDone++;
                        if (bundlesToDo === bundlesDone) {
                            widgetsDone++;
                            if (widgetsToDo !== widgetsDone) {
                                // If the next widget has no i18n properties, skip to the next until we get one that
                                // does have properties files or we run out of widgets
                                if ($.isEmptyObject(widgetData[_.keys(widgetData)[widgetsDone]].i18n)) {
                                    while ($.isEmptyObject(widgetData[_.keys(widgetData)[widgetsDone]].i18n)) {
                                        widgetsDone++;
                                    }
                                }
                                getBundles(widgetData[_.keys(widgetData)[widgetsDone]]);
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
        var todo = _.keys(bundleData).length;
        var done = 0;

        /**
         * Gets a global bundle
         */
        var getBundle = function(key) {
            $.ajax({
                dataType: 'text',
                url: '/ui/bundles/' + key + '.properties',
                success: function(data) {
                    bundleData[key] = $.parseProperties(data);
                    done++;
                    if (done === todo) {
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
     * Loads the widget JS through a batch request
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetJS2 = exports.loadWidgetJS2 = function(testData, callback) {
        var paths = [];
        $.each(testData.widgetData, function(i, widget) {
            var regex = new RegExp(/<script\s+[^>]*(src\s*=\s*(['"]).*?\2)/);
            var js = regex.exec(widget.html);
            if (js) {
                js = js[1].split('"')[1];
                paths.push('/node_modules/' + widget.path + js);
            }
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, js) {
                var widgetName = i.split('/').pop().split('.')[0];
                testData.widgetData[widgetName].js = js;
            });
            callback(testData);
        });
    };

    /**
     * Loads the widget CSS through a batch request
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetCSS2 = exports.loadWidgetCSS2 = function(testData, callback) {
        // Parse the HTML files and extract the CSS link
        var paths = [];
        $.each(testData.widgetData, function(i, widget) {
            var regex = new RegExp(/<link\s+[^>]*(href\s*=\s*(['"]).*?\2)/);
            var stylesheet = regex.exec(widget.html);
            if (stylesheet) {
                stylesheet = stylesheet[1].split('"')[1];
                paths.push('/node_modules/' + widget.path + stylesheet);
            }
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, css) {
                var widgetName = i.split('/').pop().split('.')[0];
                testData.widgetData[widgetName].css = css;
            });
            callback(testData);
        });
    };

    /**
     * Load the main CSS files through a batch request
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainCSS2 = exports.loadMainCSS = function(testData, callback) {
        callback(testData);
    };

    /**
     * Load the widget html through a batch request
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetHTML2 = exports.loadWidgetHTML2 = function(testData, callback) {
        // Create array of paths to request
        var paths = [];
        $.each(testData.widgetData, function(i, widget) {
            paths.push('/node_modules/' + widget.path + widget.src);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, html) {
                var widgetName = i.split('/').pop().split('.')[0];
                testData.widgetData[widgetName].html = html;
            });
            callback(testData);
        });
    };

    /**
     * Load the widget html through a batch request
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainHTML2 = exports.loadMainHTML2 = function(testData, callback) {
        // Create array of paths to request
        var paths = [];
        $.each(testData.mainHTML, function(i) {
            paths.push(i);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, html) {
                testData.mainHTML[i] = html;
            });
            callback(testData);
        });
    };

    /**
     * Loads and parses all widget bundles through batch requests
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetBundles2 = exports.loadWidgetBundles2 = function(testData, callback) {

        /**
         * Executes a batch request for widget bundles and parses them
         *
         * @param  {String[]]}   paths       Array of paths to widget bundle files
         * @param  {Function}    _callback   Standard callback function
         */
        var doBatchRequest = function(paths, _callback) {
            oae.api.util.staticBatch(paths, function(err, data) {
                // Loop over the results
                $.each(data, function(i, bundle) {
                    if (bundle) {
                        // For each bundle, extract the widget and bundle name and parse the properties
                        var splitPath = i.split('/');
                        var widgetName = splitPath[splitPath.length - 3];
                        var bundleName = splitPath.pop().split('.')[0];
                        testData.widgetData[widgetName].i18n[bundleName] = $.parseProperties(bundle);
                    }
                });

                if ($.isFunction(_callback)) {
                    _callback(err, data);
                }
            });
        };

        // Create an array of paths to request, group per 100 to avoid large GET requests
        var paths = [];
        $.each(testData.widgetData, function(i, widget) {
            if (widget.i18n) {
                $.each(widget.i18n, function(ii, bundle) {
                    paths.push('/node_modules/' + widget.path + bundle.bundle);
                    if (paths.length >= 100) {
                        doBatchRequest(paths);
                        paths = [];
                    }
                });
            }
        });

        // Clean up the queue, if no batch request remaining return the results
        if (paths.length) {
            doBatchRequest(paths, function(err, data) {
                callback(testData);
            });
        } else {
            callback(testData);
        }
    };

    /**
     * Loads the main bundle files
     *
     * @param  {Object}      testData      The data used in the tests
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainBundles2 = exports.loadMainBundles2 = function(testData, callback) {
        // Create array of paths to request
        var paths = [];
        $.each(testData.mainBundles, function(i) {
            paths.push(i);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, bundle) {
                testData.mainBundles[i] = $.parseProperties(bundle);
            });
            callback(testData);
        });
    };

    /**
     * Loads the widgetdata needed to kick of the tests
     */
    var loadWidgets2 = exports.loadWidgets2 = function() {
        // Gather the widget and main test data
        var testData = {
            'widgetData': oae.api.widget.getWidgetManifests(),
            'mainBundles': {
                '/ui/bundles/ca_ES.properties': null,
                '/ui/bundles/de_DE.properties': null,
                '/ui/bundles/default.properties': null,
                '/ui/bundles/en_GB.properties': null,
                '/ui/bundles/en_US.properties': null,
                '/ui/bundles/es_ES.properties': null,
                '/ui/bundles/fr_FR.properties': null,
                '/ui/bundles/it_IT.properties': null,
                '/ui/bundles/nl_NL.properties': null,
                '/ui/bundles/ru_RU.properties': null,
                '/ui/bundles/zh_CN.properties': null
            },
            'mainHTML': {
                '/shared/oae/errors/accessdenied.html': null,
                '/shared/oae/errors/maintenance.html': null,
                '/shared/oae/errors/noscript.html': null,
                '/shared/oae/errors/notfound.html': null,
                '/shared/oae/errors/unavailable.html': null,
                '/ui/content.html': null,
                '/ui/discussion.html': null,
                '/ui/group.html': null,
                '/ui/index.html': null,
                '/ui/me.html': null,
                '/ui/search.html': null,
                '/ui/user.html': null,
                '/shared/oae/macros/activity.html': null,
                '/shared/oae/macros/autosuggest.html': null,
                '/shared/oae/macros/list.html': null
            },
            'mainJS': null,
            'mainCSS': null,
        };

        // Load widget test data
        loadWidgetBundles2(testData, function(testData) {
            loadWidgetHTML2(testData, function(testData) {
                loadWidgetCSS2(testData, function(testData) {
                    loadWidgetJS2(testData, function(testData) {
                        // Load main test data
                        loadMainBundles2(testData, function(testData) {
                            loadMainHTML2(testData, function(testData) {
                                loadMainCSS2(testData, function(testData) {
                                    console.log(testData);
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    /**
     * Loads the widget data
     */
    var loadWidgets = exports.loadWidgets = function(callback) {
        loadWidgets2();
        /*$.ajax({
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
        });*/
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

    $(document).on('click', '#tests-run-all', runAllTests);

});
