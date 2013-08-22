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

define(['exports', 'jquery', 'oae.core', 'jquery.properties-parser'], function(exports, $, oae) {

    var tests = [];
    var testResults = {};
    var currentTest = false;

    // By default, QUnit runs tests when load event is triggered on the window.
    // We're loading tests asynchronsly and set this property to false, then call QUnit.start() once everything is loaded. 
    QUnit.config.autostart = false;

    /**
     * Loads the widget JS through a batch request
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetJS = exports.loadWidgetJS = function(testData, callback) {
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
     * Load the main JS files through a batch request
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainJS = exports.loadMainJS = function(testData, callback) {
        var paths = [];
        $.each(testData.mainHTML, function(i, mainHTML) {
            var $html = $('<div></div>').html(mainHTML);
            var $scripts = $html.find('script');
            $.each($scripts, function(ii, script) {
                paths.push($(script).attr('src'));
                paths.push($(script).attr('data-loadmodule'));
                paths.push($(script).attr('data-main'));
            });
        });

        oae.api.util.staticBatch($.unique(paths), function(err, data) {
            $.each(data, function(i, js) {
                testData.mainJS[i] = js;
            });
            callback(testData);
        });
    };

    /**
     * Load the API JS files through a batch request
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadAPIJS = exports.loadAPIJS = function(testData, callback) {
        // Create array of paths to request
        var paths = [];
        $.each(testData.apiJS, function(i) {
            paths.push(i);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, js) {
                testData.apiJS[i] = js;
            });
            callback(testData);
        });
    };

    /**
     * Load the OAE specific plugin JS files through a batch request
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadOAEPlugins = exports.loadOAEPlugins = function(testData, callback) {
        // Create array of paths to request
        var paths = [];
        $.each(testData.oaePlugins, function(i) {
            paths.push(i);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(i, js) {
                testData.oaePlugins[i] = js;
            });
            callback(testData);
        });
    };

    /**
     * Loads the widget CSS through a batch request
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetCSS = exports.loadWidgetCSS = function(testData, callback) {
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
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainCSS = exports.loadMainCSS = function(testData, callback) {
        var paths = [];
        $.each(testData.mainCSS, function(cssPath) {
            paths.push(cssPath);
        });

        $.each(testData.mainHTML, function(htmlPath, mainHTML) {
            var $html = $('<div></div>').html(mainHTML);
            var $links = $html.find('link');
            $.each($links, function(ii, link) {
                paths.push($(link).attr('href'));
            });
        });

        oae.api.util.staticBatch($.unique(paths), function(err, data) {
            $.each(data, function(i, css) {
                testData.mainCSS[i] = css;
            });
            callback(testData);
        });
    };

    /**
     * Load the widget html through a batch request
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetHTML = exports.loadWidgetHTML = function(testData, callback) {
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
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainHTML = exports.loadMainHTML = function(testData, callback) {
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
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadWidgetBundles = exports.loadWidgetBundles = function(testData, callback) {

        /**
         * Executes a batch request for widget bundles and parses them
         *
         * @param  {String[]]}   paths       Array of paths to widget bundle files
         * @param  {Function}    _callback   Standard callback function
         */
        var doBatchRequest = function(paths, _callback) {
            oae.api.util.staticBatch(paths, function(err, data) {
                // For each bundle, extract the widget and bundle name and parse the properties
                $.each(data, function(i, bundle) {
                    var splitPath = i.split('/');
                    var widgetName = splitPath[splitPath.length - 3];
                    var bundleName = splitPath.pop().split('.')[0];

                    // Some bundle files are empty though, so do a check
                    if (bundle) {
                        testData.widgetData[widgetName].i18n[bundleName] = $.parseProperties(bundle);
                    } else {
                        testData.widgetData[widgetName].i18n[bundleName] = {};
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
                });
            }
        });

        var startGettingData = function() {
            if (paths.length === 0) {
                callback(testData);
            } else {
                var pathsToRetrieve = paths.splice(0, 100);
                doBatchRequest(pathsToRetrieve, startGettingData);
            }
        };

        startGettingData();
    };

    /**
     * Loads the main bundle files
     *
     * @param  {Object}      testData      The testdata containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback      Standard callback function
     */
    var loadMainBundles = exports.loadMainBundles = function(testData, callback) {
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
     * Loads the widget data
     */
    var loadTestData = exports.loadTestData = function(callback) {
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
            'apiJS': {
                '/shared/oae/api/oae.api.authentication.js': null,
                '/shared/oae/api/oae.api.comment.js': null,
                '/shared/oae/api/oae.api.config.js': null,
                '/shared/oae/api/oae.api.content.js': null,
                '/shared/oae/api/oae.api.discussion.js': null,
                '/shared/oae/api/oae.api.group.js': null,
                '/shared/oae/api/oae.api.i18n.js': null,
                '/shared/oae/api/oae.api.js': null,
                '/shared/oae/api/oae.api.l10n.js': null,
                '/shared/oae/api/oae.api.profile.js': null,
                '/shared/oae/api/oae.api.user.js': null,
                '/shared/oae/api/oae.api.util.js': null,
                '/shared/oae/api/oae.api.widget.js': null,
                '/shared/oae/api/oae.bootstrap.js': null,
                '/shared/oae/api/oae.core.js': null,
            },
            'oaePlugins': {
                '/shared/oae/js/bootstrap-plugins/bootstrap.modal.js': null,
                '/shared/oae/js/jquery-plugins/jquery.browse-focus.js': null,
                '/shared/oae/js/jquery-plugins/jquery.clip.js': null,
                '/shared/oae/js/jquery-plugins/jquery.dnd-upload.js': null,
                '/shared/oae/js/jquery-plugins/jquery.infinitescroll.js': null,
                '/shared/oae/js/jquery-plugins/jquery.jeditable-focus.js': null,
                '/shared/oae/js/jquery-plugins/jquery.list-options.js': null,
            },
            'mainJS': {},
            'mainCSS': {
                '/shared/oae/css/oae.base.css': null,
                '/shared/oae/css/oae.components.css': null,
                '/shared/oae/css/oae.core.css': null,
                '/shared/oae/css/oae.skin.static.css': null
            }
        };

        // Load widget test data
        loadWidgetBundles(testData, function(testData) {
            loadWidgetHTML(testData, function(testData) {
                loadWidgetCSS(testData, function(testData) {
                    loadWidgetJS(testData, function(testData) {
                        // Load main test data
                        loadMainBundles(testData, function(testData) {
                            loadMainHTML(testData, function(testData) {
                                loadMainCSS(testData, function(testData) {
                                    loadMainJS(testData, function(testData) {
                                        loadAPIJS(testData, function(testData) {
                                            loadOAEPlugins(testData, function(testData) {
                                                callback(testData);
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
    };
});
