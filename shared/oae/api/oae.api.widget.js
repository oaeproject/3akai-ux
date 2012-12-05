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

define(['exports', 'jquery', 'underscore', 'oae/api/oae.api.config', 'oae/api/oae.api.i18n', 'oae/api/oae.api.util'], function(exports, $, _, configAPI, i18nAPI, utilAPI) {

    // Variable that will be used to cache the widget manifests
    var manifests = null;
    // Variable that will keep track of the widget resources that have already been loaded
    var loadedWidgets = {};
    // Variable that will keep track of the current user's locale
    var locale = null;

    /**
     * Initialize all widget functionality by loading the widget manifests, detecting all
     * declared widgets in the core HTML and rendering them.
     * 
     * @param  {String}     [currentLocale]     The current user's locale. If this has not been provided, the system's default locale will be used.
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.err        Error object containing error code and message
     * @api private
     */
    var init = exports.init = function(currentLocale, callback) {
        // Set the locale to be the default one if not provided
        locale = currentLocale || configAPI.getValue('oae-principals', 'user', 'defaultLanguage');

        // Get the widget manifest files
        $.ajax({
            'url': '/api/ui/widgets',
            'success': function(data) {
                manifests = data;
                
                // Load the widgets in the core HTML
                loadWidgets(null, null, callback);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Get a widget's manifest.json file.
     * 
     * @param  {String}     widgetName      The name of the widget for which we want to retrieve the manifest
     * @return {Object}                     JSON object representing the widget's manifest file. This will be null if no widget can be found for the given widget name
     */
    var getWidgetManifest = exports.getWidgetManifest = function(widgetName) {
        if (!widgetName || !manifests[widgetName]) {
            throw new Error('A valid widget name should be provided');
        }
        return manifests[widgetName];
    };
    
    /**
     * Get a list of all of the available widgets that have certain properties in their manifest file and return their actual manifest files.
     * 
     * @param  {Object}     [properties]    JSON object that lists all of the properties and values for those properties that should be set on the widget's manifest file before it will return in the final list, so only the widgets we need are returned. If this is not provided, all widgets will be returned.
     * @return {Object}                     JSON object where the keys represent all of the available widgets and the values are the widget's manifest files.
     */
    var getWidgetManifests = exports.getWidgetManifests = function(properties) {
        if (!properties) {
            return manifests;
        }

        var filteredWidgets = {};
        $.each(manifests, function(widgetName, widget) {
            // Check that all of the properties in the properties object are set
            var isValid = true;
            $.each(properties, function(property, value) {
                if (widget[property] !== value) {
                    isValid = false;
                }
            });
            if (isValid) {
                filteredWidgets[widgetName] = widget;
            }
        });
        return filteredWidgets;
    };
    
    /**
     * Find all of the widgets declared inside of the provided container, and load them into
     * the page.
     * 
     * Widgets are declared in the following way:
     * 
     * <div id='widgetId' data-widget='widgetName' />
     * 
     * @param  {Element|String}     [$container]    HTML container in which we want to look for widgets and load them. This can either be a jQuery Element object or a jQuery selector string. If no container is provided, the body element will be used
     * @param  {Boolean}            [showSettings]  Whether or not to show the widget's settings view. If this is not set, the widget's view mode will be shown.
     * @param  {Function}           [callback]      Standard callback function executed when all widgets have finished loading and rendering
     * @param  {Object}             [callback.err]  Error containing the error code and message
     * 
     */
    var loadWidgets = exports.loadWidgets = function($container, showSettings, callback) {
        // Default callback function
        callback = callback || function() {};
        // Default to view mode if showSettings is not provided
        showSettings = showSettings || false;
        // Default to the body element if the container hasn't been provided
        if (!$container) {
            $container = $('body');
        } else if (_.isString($container)) {
            $container = $($container);
        }

        locateWidgets($container, showSettings, callback);
    };

    /**
     * Find all of the widgets declared inside of the provided container, and pass this information
     * on so all of the widget files can be loaded using a static batch get
     * 
     * @param  {Element}        $container      jQuery element representing the HTML container in which we want to look for widgets and load them.
     * @param  {Boolean}        showSettings    Whether or not to show the widget's settings view.
     * @param  {Function}       callback        Standard callback function
     * @param  {Object}         callback.err    Error containing the error code and message
     * @api private
     */
    var locateWidgets = function($container, showSettings, callback) {
        // Locate the available widgets in the container. This is done by getting
        // all tags with a `data-widget` attribute
        var widgetsToLoad = {};
        
        $('[data-widget]', $container).each(function(index, element) {
            // Generate a unique id for the widget if it doesn't have one set
            $element = $(element);
            if (!$element.attr('id')) {
                $element.attr('id', utilAPI.generateId());
            }

            // Gather the metadata for the widgets that need to be loaded
            var widgetName = $element.attr('data-widget');
            var widget = getWidgetManifest(widgetName);
            var widgetId = $element.attr('id');

            widgetsToLoad[widgetName] = widgetsToLoad[widgetName] || {};
            // TODO
            widgetsToLoad[widgetName].prefixPath = '/node_modules/' + widget.path;
            // Set the link to the HTML page
            widgetsToLoad[widgetName].html = widgetsToLoad[widgetName].prefixPath + widget.src;
            // Set the link to the default language bundle
            widgetsToLoad[widgetName].bundles = {};
            widgetsToLoad[widgetName].bundles['default'] = widgetsToLoad[widgetName].prefixPath + widget.i18n['default'].bundle;
            // Set the link to the language bundle for the user's locale
            if (widget.i18n[locale]) {
                widgetsToLoad[widgetName].bundles[locale] = widgetsToLoad[widgetName].prefixPath + widget.i18n[locale].bundle;
            }
            // Add the id of the widget to the instances that should be loaded
            widgetsToLoad[widgetName].instances = widgetsToLoad[widgetName].instances || [];
            widgetsToLoad[widgetName].instances.push(widgetId);
        });

        if (_.keys(widgetsToLoad).length === 0) {
            return callback();
        }
        loadWidgetFiles(widgetsToLoad, $container, showSettings, callback);
    };

    /**
     * Load all static files for all of the widgets that need to be loaded. This will load the widget's
     * main HTML view, as well as the default bundle and the language bundle for the current user's locale (if exists)
     * 
     * The widgetsToLoad object will have the following structure
     * 
     * ```
     * {
     *     'widgetName1': {
     *         'html': <Link to widget's main HTML view>,
     *         'bundles': {
     *             'default': <Link to widget's default language bundle>,
     *             '<userLocale>': <Link to widget's language bundle for user's locale>,
     *         },
     *         'instances': [<ids of all of the widgets of type widgetName1 that need to be loaded>]
     *     },
     *     'widgetName2': ...
     * }
     * ```
     * 
     * @param  {Object}         widgetsToLoad   JSON Object representing the widgets that should be loaded
     * @param  {Element}        $container      jQuery element representing the HTML container in which we want to look for widgets and load them.
     * @param  {Boolean}        showSettings    Whether or not to show the widget's settings view.
     * @param  {Function}       callback        Standard callback function
     * @param  {Object}         callback.err    Error containing the error code and message
     * @api private 
     */
    var loadWidgetFiles = function(widgetsToLoad, $container, showSettings, callback) {
        // Collect all static files that need to be loaded
        var files = [];
        $.each(widgetsToLoad, function(widgetName, loadData) {
            files.push(loadData.html);
            if (loadData.bundles['default']) {
                files.push(loadData.bundles['default']);
            }
            if (loadData.bundles[locale]) {
                files.push(loadData.bundles[locale]);
            }
        });
        
        $.ajax({
            'url': '/api/ui/staticBatch',
            'data': {'files': files},
            'success': function(data) {
                processWidgetFiles(data, widgetsToLoad, $container, showSettings, callback)
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

    /**
     * Process all of the retrieved static widget files so they can be cached and used for
     * widget rendering. First of all, the new language bundles will be parsed by the i18n API and
     * the HTML fragments will be translated. Next, the CSS and JS tags will be extracted and removed
     * from the HTML fragment, the CSS styles will be added to the header and the JS files will be
     * required. Finally, all of the widgets will be rendered
     * 
     * @param  {Object}         widgetFiles     JSON object containing all of the loaded static widget files. The keys are the paths to the widget file, and the value is the actual file content.
     * @param  {Object}         widgetsToLoad   JSON Object representing the widgets that should be loaded
     * @param  {Element}        $container      jQuery element representing the HTML container in which we want to look for widgets and load them.
     * @param  {Boolean}        showSettings    Whether or not to show the widget's settings view.
     * @param  {Function}       callback        Standard callback function
     * @param  {Object}         callback.err    Error containing the error code and message
     * @api private
     */
    var processWidgetFiles = function(widgetFiles, widgetsToLoad, $container, showSettings, callback) {
        $.each(widgetsToLoad, function(widgetName, loadData) {
            // Parse the new i18n bundles, if bundles are present
            if (loadData.bundles['default']) {
                i18nAPI.parseWidgetBundles(widgetName, widgetFiles[loadData.bundles['default']], loadData.bundles[locale] ? widgetFiles[loadData.bundles[locale]] : null);
                // Translate the HTML fragment
                widgetFiles[loadData.html] = i18nAPI.translate(widgetFiles[loadData.html], widgetName);
            }

            // Transform the translated HTML into a jQuery object
            var $widgetEl = $(widgetFiles[loadData.html]);

            // Extract CSS and add to body
            $widgetEl.filter('link[rel="stylesheet"]').each(function(index, cssTag) {
                var $cssTag = $(cssTag);
                $('head').append($cssTag.attr('href', widgetsToLoad[widgetName].prefixPath + $cssTag.attr('href')));
            });

            // Extract JS and require
            var jsFiles = [];
            $widgetEl.filter('script').each(function(index, jsTag) {
                jsFiles.push(widgetsToLoad[widgetName].prefixPath + $(jsTag).attr('src'));
            });

            // Extract the widget HTML without the link and script tags
            var html = $('div').html($widgetEl.filter(':not(link):not(script)')).html();

            // Cache HTML and JS
            // Load the widget instance
        });
    };

    var renderWidget = function(widgetName, $container, showSettings) {
        
    };

    /**
     * Insert a widget into a container into the provided viewmode.
     * 
     * @param  {String}             widgetName      The name of the widget we want to load into the provided container
     * @param  {String}             [widgetId]      The widget's unique id. If this is not provided, a random id wil be generated
     * @param  {Element|String}     container       HTML container in which we want to insert the widget. This can either be a jQuery Element object or a jQuery selector string.
     * @param  {Boolean}            showSettings    Whether or not to show the widget's settings view. If this is not set, the widget's view mode will be shown.
     * @param  {Function}           [callback]      Standard callback function executed when the widgets has finished loading and rendering
     * @param  {Object}             [callback.err]  Error containing the error code and message
     */
    var insertWidget = exports.insertWidget = function(widgetName, widgetId, container, showSettings, callback) {};

});