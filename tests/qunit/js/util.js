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

define(['exports', 'jquery', 'underscore', 'oae.core', 'jquery.properties-parser'], function(exports, $, _, oae) {

    // By default, QUnit runs tests when the load event is triggered on the window.
    // We're loading tests asynchronsly and therefore set this property to false, then call QUnit.start() once everything is loaded.
    QUnit.config.autostart = false;

    /**
     * Filter all vendor files so they can be excluded from testing
     *
     * @param  {String[]}    paths    Array of file paths to check for exclusion
     * @return {String[]}             List of files from which the vendor files have been filtered
     */
    var filterVendorFiles = function(paths) {
        return _.filter(paths, function(path) {
            return (path && path.indexOf('/shared/vendor') !== 0);
        });
    };

    /**
     * Load the widget JavaScript through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadWidgetJS = function(testData, callback) {
        var paths = {};

        $.each(testData.widgetData, function(widgetName, widget) {
            testData.widgetData[widgetName].js = {};

            var $html = $('<div/>').html(widget.html);
            var $scripts = $html.find('script');
            $.each($scripts, function(scriptIndex, script) {
                var jsPath = $(script).attr('src');
                // Only look at the widget JS files, not at libraries
                if (jsPath.indexOf('js') === 0) {
                    paths['/node_modules/' + widget.path + jsPath] = widgetName;
                }
            });
        });

        oae.api.util.staticBatch(_.keys(paths), function(err, data) {
            $.each(data, function(widgetJSPath, widgetJS) {
                // Get the ID of the widget from the path dictionary
                var widgetName = paths[widgetJSPath];
                // Add the widget JS to the widget's JS object
                testData.widgetData[widgetName].js[widgetJSPath] = widgetJS;
            });

            callback(testData);
        });
    };

    /**
     * Load the main JavaScript files through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadMainJS = exports.loadMainJS = function(testData, callback) {
        var paths = [];
        $.each(testData.mainHTML, function(htmlIndex, mainHTML) {
            var $html = $('<div/>').html(mainHTML);
            var $scripts = $html.find('script');
            $.each($scripts, function(scriptIndex, script) {
                paths.push($(script).attr('src'));
                paths.push($(script).attr('data-loadmodule'));
                paths.push($(script).attr('data-main'));
            });
        });

        paths = filterVendorFiles(paths);

        oae.api.util.staticBatch($.unique(paths), function(err, data) {
            $.each(data, function(jsIndex, js) {
                testData.mainJS[jsIndex] = js;
            });
            callback(testData);
        });
    };

    /**
     * Load the API JavaScript files through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadAPIJS = function(testData, callback) {
        var paths = [];
        $.each(testData.apiJS, function(jsIndex) {
            paths.push(jsIndex);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(jsIndex, js) {
                testData.apiJS[jsIndex] = js;
            });
            callback(testData);
        });
    };

    /**
     * Load the OAE specific plugin JavaScript files through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadOAEPlugins = function(testData, callback) {
        var paths = [];
        $.each(testData.oaePlugins, function(pluginIndex) {
            paths.push(pluginIndex);
        });

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(jsIndex, js) {
                testData.oaePlugins[jsIndex] = js;
            });
            callback(testData);
        });
    };

    /**
     * Loads the widget CSS through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadWidgetCSS = function(testData, callback) {
        // Parse the HTML files and extract the CSS files
        var paths = {};

        $.each(testData.widgetData, function(widgetName, widget) {
            testData.widgetData[widgetName].css = {};

            var $html = $('<div/>').html(widget.html);
            var $links = $html.find('link');
            $.each($links, function(linkIndex, link) {
                var cssPath = $(link).attr('href');
                // Only look at the widget CSS files, not at libraries
                if (cssPath.indexOf('css') === 0) {
                    paths['/node_modules/' + widget.path + cssPath] = widgetName;
                }
            });
        });

        oae.api.util.staticBatch(_.keys(paths), function(err, data) {
            $.each(data, function(cssIndex, css) {
                // Get the ID of the widget by looking at the directory the files are stored in
                var widgetName = paths[cssIndex];
                // Add the widget CSS to the widget's CSS object
                testData.widgetData[widgetName].css[cssIndex] = css;
            });
            callback(testData);
        });
    };

    /**
     * Load the main CSS files through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadMainCSS = function(testData, callback) {
        var paths = _.keys(testData.mainCSS);

        $.each(testData.mainHTML, function(htmlPath, mainHTML) {
            var $html = $('<div/>').html(mainHTML);
            var $links = $html.find('link');
            $.each($links, function(linkIndex, link) {
                paths.push($(link).attr('href'));
            });
        });

        paths = filterVendorFiles(paths);

        oae.api.util.staticBatch($.unique(paths), function(err, data) {
            $.each(data, function(cssIndex, css) {
                testData.mainCSS[cssIndex] = css;
            });
            callback(testData);
        });
    };

    /**
     * Load the widget HTML through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadWidgetHTML = function(testData, callback) {
        var paths = {};

        $.each(testData.widgetData, function(widgetIndex, widget) {
            paths['/node_modules/' + widget.path + widget.src] = widget.id;
        });

        oae.api.util.staticBatch(_.keys(paths), function(err, data) {
            $.each(data, function(htmlIndex, html) {
                var widgetName = paths[htmlIndex];
                testData.widgetData[widgetName].html = html;
            });
            callback(testData);
        });
    };

    /**
     * Load the widget HTML through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadMainHTML = function(testData, callback) {
        var paths = _.keys(testData.mainHTML);

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(htmlIndex, html) {
                testData.mainHTML[htmlIndex] = html;
            });
            callback(testData);
        });
    };

    /**
     * Loads and parses all widget bundles through batch requests
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadWidgetBundles = function(testData, callback) {

        var paths = [];
        $.each(testData.widgetData, function(widgetIndex, widget) {
            if (widget.i18n) {
                $.each(widget.i18n, function(bundleIndex, bundle) {
                    paths.push('/node_modules/' + widget.path + bundle);
                });
            }
        });

        /**
         * Execute a batch request per 100 widget bundles to avoid large GET requests and parse them
         *
         * @param  {String[]]}   paths       Array of paths to widget bundle files
         */
        var retrieveWidgetBundles = function(paths) {
            var pathsToRetrieve = paths.splice(0, 100);
            oae.api.util.staticBatch(pathsToRetrieve, function(err, data) {
                // For each bundle, extract the widget and bundle name and parse the properties
                $.each(data, function(bundleIndex, bundle) {
                    var splitPath = bundleIndex.split('/');
                    var widgetName = splitPath[splitPath.length - 3];
                    var bundleName = splitPath.pop().split('.')[0];

                    if (bundle) {
                        testData.widgetData[widgetName].i18n[bundleName] = $.parseProperties(bundle);
                    } else {
                        testData.widgetData[widgetName].i18n[bundleName] = {};
                    }
                });

                if (paths.length === 0) {
                    callback(testData);
                } else {
                    retrieveWidgetBundles(paths);
                }
            });
        };

        retrieveWidgetBundles(paths);
    };

    /**
     * Load the main bundles through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadMainBundles = function(testData, callback) {
        var paths = _.keys(testData.mainBundles);

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(bundleIndex, bundle) {
                testData.mainBundles[bundleIndex] = $.parseProperties(bundle);
            });
            callback(testData);
        });
    };

    /**
     * Load the email bundles through a batch request
     *
     * @param  {Object}      testData               The test data containing all files to be tested (html, css, js, properties)
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.testData      The test data containing all files to be tested (html, css, js, properties)
     */
    var loadEmailBundles = function(testData, callback) {
        var paths = _.keys(testData.emailBundles);

        oae.api.util.staticBatch(paths, function(err, data) {
            $.each(data, function(bundleIndex, bundle) {
                testData.emailBundles[bundleIndex] = $.parseProperties(bundle);
            });
            callback(testData);
        });
    };

    /**
     * Load the HTML, bundles, JavaScript and CSS for all core code and all widgets
     */
    var loadTestData = exports.loadTestData = function(callback) {
        var testData = {
            'widgetData': oae.api.widget.getWidgetManifests(),
            'emailBundles': {
                '/shared/oae/bundles/email/de_DE.properties': null,
                '/shared/oae/bundles/email/default.properties': null,
                '/shared/oae/bundles/email/es_ES.properties': null,
                '/shared/oae/bundles/email/fr_FR.properties': null,
                '/shared/oae/bundles/email/nl_NL.properties': null,
                '/shared/oae/bundles/email/pl_PL.properties': null
            },
            'mainBundles': {
                '/shared/oae/bundles/ui/af_ZA.properties': null,
                '/shared/oae/bundles/ui/ca_ES.properties': null,
                '/shared/oae/bundles/ui/de_DE.properties': null,
                '/shared/oae/bundles/ui/default.properties': null,
                '/shared/oae/bundles/ui/es_ES.properties': null,
                '/shared/oae/bundles/ui/fr_FR.properties': null,
                '/shared/oae/bundles/ui/hi_IN.properties': null,
                '/shared/oae/bundles/ui/it_IT.properties': null,
                '/shared/oae/bundles/ui/nl_NL.properties': null,
                '/shared/oae/bundles/ui/pl_PL.properties': null,
                '/shared/oae/bundles/ui/pt_BR.properties': null,
                '/shared/oae/bundles/ui/pt_PT.properties': null,
                '/shared/oae/bundles/ui/ru_RU.properties': null,
                '/shared/oae/bundles/ui/sv_SE.properties': null,
                '/shared/oae/bundles/ui/tr_TR.properties': null,
                '/shared/oae/bundles/ui/val_ES.properties': null,
                '/shared/oae/bundles/ui/zh_CN.properties': null
            },
            'mainHTML': {
                '/admin/index.html': null,
                '/docs/index.html': null,
                '/shared/oae/errors/accessdenied.html': null,
                '/shared/oae/errors/noscript.html': null,
                '/shared/oae/errors/notfound.html': null,
                '/shared/oae/errors/servermaintenance.html': null,
                '/shared/oae/errors/unavailable.html': null,
                '/shared/oae/macros/auth.html': null,
                '/shared/oae/macros/autosuggest.html': null,
                '/shared/oae/macros/header.html': null,
                '/shared/oae/macros/list.html': null,
                '/ui/content.html': null,
                '/ui/discussion.html': null,
                '/ui/folder.html': null,
                '/ui/group.html': null,
                '/ui/index.html': null,
                '/ui/search.html': null,
                '/ui/signup.html': null,
                '/ui/user.html': null
            },
            'apiJS': {
                '/shared/oae/api/oae.api.admin.js': null,
                '/shared/oae/api/oae.api.authentication.js': null,
                '/shared/oae/api/oae.api.comment.js': null,
                '/shared/oae/api/oae.api.config.js': null,
                '/shared/oae/api/oae.api.content.js': null,
                '/shared/oae/api/oae.api.discussion.js': null,
                '/shared/oae/api/oae.api.folder.js': null,
                '/shared/oae/api/oae.api.follow.js': null,
                '/shared/oae/api/oae.api.group.js': null,
                '/shared/oae/api/oae.api.i18n.js': null,
                '/shared/oae/api/oae.api.js': null,
                '/shared/oae/api/oae.api.l10n.js': null,
                '/shared/oae/api/oae.api.meetup.js': null,
                '/shared/oae/api/oae.api.push.js': null,
                '/shared/oae/api/oae.api.user.js': null,
                '/shared/oae/api/oae.api.util.js': null,
                '/shared/oae/api/oae.api.widget.js': null,
                '/shared/oae/api/oae.bootstrap.js': null,
                '/shared/oae/api/oae.core.js': null,
            },
            'oaePlugins': {
                '/shared/oae/js/activityadapter.js': null,
                '/shared/oae/js/bootstrap-plugins/bootstrap.focus.js': null,
                '/shared/oae/js/bootstrap-plugins/bootstrap.modal.js': null,
                '/shared/oae/js/jquery-plugins/jquery.browse-focus.js': null,
                '/shared/oae/js/jquery-plugins/jquery.clip.js': null,
                '/shared/oae/js/jquery-plugins/jquery.dnd-upload.js': null,
                '/shared/oae/js/jquery-plugins/jquery.infinitescroll.js': null,
                '/shared/oae/js/jquery-plugins/jquery.jeditable-focus.js': null,
                '/shared/oae/js/jquery-plugins/jquery.list.js': null,
                '/shared/oae/js/jquery-plugins/jquery.responsive.js': null,
                '/shared/oae/js/jquery-plugins/jquery.update-picture.js': null,
                '/shared/oae/js/mimetypes.js': null
            },
            'mainJS': {},
            'mainCSS': {
                '/shared/oae/css/oae.base.css': null,
                '/shared/oae/css/oae.components.css': null,
                '/shared/oae/css/oae.core.css': null,
                '/shared/oae/css/oae.skin.static.css': null,
                '/ui/css/oae.content.css': null,
                '/ui/css/oae.discussion.css': null,
                '/ui/css/oae.folder.css': null,
                '/ui/css/oae.group.css': null,
                '/ui/css/oae.index.css': null,
                '/ui/css/oae.search.css': null,
                '/ui/css/oae.signup.css': null
            }
        };

        // Load widget test data
        loadWidgetBundles(testData, function(testData) {
            loadWidgetHTML(testData, function(testData) {
                loadWidgetCSS(testData, function(testData) {
                    loadWidgetJS(testData, function(testData) {
                        // Load email bundles
                        loadEmailBundles(testData, function(testData) {
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
        });
    };
});
