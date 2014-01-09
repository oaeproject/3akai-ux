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

define(['exports', 'jquery', 'underscore', 'oae.api.config', 'oae.api.i18n', 'oae.api.util'], function(exports, $, _, configAPI, i18nAPI, utilAPI) {

    // Variable that will be used to cache the widget manifests
    var manifests = null;
    // Variable that will keep track of the widget resources that have already been loaded
    var loadedWidgets = {};
    // Variable that will keep track of the current user's locale
    var locale = null;

    /**
     * Initialize all widget functionality by loading and caching the widget manifests
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
                initOnLoadWidgets();
                registerLazyLoading();
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get a widget's manifest.json file.
     *
     * @param  {String}     widgetName      The name of the widget for which we want to retrieve the manifest
     * @return {Object}                     JSON object representing the widget's manifest file. This will be null if no widget can be found for the given widget name
     * @throws {Error}                      Error thrown when no or an invalid widget name is provided
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

    ///////////////////
    // WIDGET LOADER //
    ///////////////////

    /**
     * Add a widget declaration element to the page for all of the widgets that have identified themselves as needing to automatically
     * load on each page. This is done by adding the following to a widget's manifest.json file:
     *
     * ```
     * 'trigger': {
     *     'onLoad': true
     * }
     * ```
     *
     * Examples for widget that want to use this are Terms & Conditions widgets, etc.
     *
     * @api private
     */
    var initOnLoadWidgets = function() {
        $.each(getWidgetManifests(), function(widgetName, widget) {
            if (widget.trigger && widget.trigger.onLoad) {
                var $widget = $('<div>').attr('data-widget', widgetName);
                $('body').prepend($widget);
            }
        });
    };

    /**
     * Register all of the widgets that have identified themselves as needing to lazy load when a certain event is triggered or
     * when an element with a certain selector is clicked. This is done to make sure that widgets are only loaded when they are
     * really needed, which significantly cuts down on the initial page load time.
     *
     * A widget can be lazy loaded by declaring one or more events to which it listens. When that event is triggered, the widget
     * will be loaded and rendered. A widget can also be lazy loaded by declaring one or more jquery selectors for which it listens
     * to click events. When an element with that selector is clicked, the widget will be loaded and rendered.
     *
     * This is done by adding the following to a widget's manifest.json file:
     *
     * ```
     * 'trigger': {
     *     'events': ['oae-trigger-event1', 'oae-trigger-event2'],
     *     'selectors': ['#oae_trigger_link1', '.oae-trigger-link2']
     * }
     * ```
     */
    var registerLazyLoading = function() {
        $.each(getWidgetManifests(), function(widgetName, widget) {
            // Only register the widget for lazy loading if it isn't
            // set as an onLoad widget
            if (widget.trigger && !widget.trigger.onLoad) {

                // Convert all of the properties to an array
                widget.trigger.events = widget.trigger.events || [];
                if (_.isString(widget.trigger.events)) {
                    widget.trigger.events = [widget.trigger.events];
                }
                widget.trigger.selectors = widget.trigger.selectors || [];
                if (_.isString(widget.trigger.selectors)) {
                    widget.trigger.selectors = [widget.trigger.selectors];
                }

                var lazyLoadWidget = function(callback) {
                    // Unbind all of the events for the widget
                    $.each(widget.trigger.events, function(index, eventId) {
                        $(document).off(eventId);
                    });
                    // Also unbind the click events associated to this widget
                    $.each(widget.trigger.selectors, function(index, selector) {
                        $(document).off('click', selector);
                    });

                    // Load and render the widget
                    insertWidget(widgetName, null, null, null, null, callback);
                };

                // Bind the widget to all of the events it wants to listen to
                $.each(widget.trigger.events, function(index, eventId) {
                    $(document).on(eventId, function() {
                        // Pass all of the passed in arguments into the widget, except
                        // for the event data which will be the first parameter
                        var args = Array.prototype.slice.call(arguments).slice(1);
                        lazyLoadWidget(function() {
                            $(document).trigger(eventId, args);
                        });
                    });
                });

                // Bind the widget to all click handlers it wants to listen to
                $.each(widget.trigger.selectors, function(index, selector) {
                    $(document).on('click', selector, function(event, ui) {
                        lazyLoadWidget(function() {
                            $(event.target).trigger('click', [event, ui]);
                        });
                        return false;
                    });
                });
            }
        });
    };

    /**
     * Utility function that will be used by the widget loader to convert a relative path
     * declared somewhere in the widget into an absolute path, so it can be successfully
     * retrieved from the server. When an absolute path is passed in, it will be returned as is
     *
     * @param  {String}     url     Relative path that should be made absolute
     * @param  {String}     prefix  The absolute path that should be used to prefix the relative path with
     * @return {String}             The generated absolute path
     * @api private
     */
    var convertRelativeToAbsolutePath = function(url, prefix) {
        if (!url) {
            return null;
        } else if (!prefix) {
            return url;
        }

        // If the provided URL is already an absolute URL, we just return it
        if (url.substring(0, 1) === '/' || url.substring(0, 4) === 'http') {
            return url;
        } else {
            return prefix + url;
        }
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
     * @param  {Object}             [widgetData]    JSON object containing the data that should be passed into the widgets. The keys are the widget's unique instance ids, and the value is what will be passed into the widget with that id
     * @param  {Object}             [callback.err]  Error containing the error code and message
     */
    var loadWidgets = exports.loadWidgets = function($container, showSettings, widgetData, callback) {
        // Default callback function
        callback = callback || function() {};
        // Default to view mode if showSettings is not provided
        showSettings = showSettings || false;
        // Default to the body element if the container hasn't been provided
        $container = $container ? $($container) : $('body');
        // Default to empty widget data if no widget data has been provided
        widgetData = widgetData || {};

        locateWidgets($container, showSettings, widgetData, callback);
    };

    /**
     * Find all of the widgets declared inside of the provided container, and pass this information
     * on so all of the widget files can be loaded using a static batch get
     *
     * @param  {Element}        $container      jQuery element representing the HTML container in which we want to look for widgets and load them.
     * @param  {Boolean}        showSettings    Whether or not to show the widget's settings view.
     * @param  {Object}         widgetData      JSON object containing the data that should be passed into the widgets. The keys are the widget's unique instance ids, and the value is what will be passed into the widget with that id
     * @param  {Function}       callback        Standard callback function
     * @param  {Object}         callback.err    Error containing the error code and message
     * @api private
     */
    var locateWidgets = function($container, showSettings, widgetData, callback) {
        // Locate the available widgets in the container. This is done by getting
        // all tags with a `data-widget` attribute
        var widgetsToLoad = {};

        $('[data-widget]', $container).each(function(index, element) {
            $element = $(element);

            // Gather the metadata for the widgets that need to be loaded
            var widgetName = $element.attr('data-widget');
            var widget = getWidgetManifest(widgetName);
            var widgetId = $element.attr('id');

            // Generate a unique id for the widget if it doesn't have one set
            if (!widgetId) {
                widgetId = utilAPI.generateId();
                $element.attr('id', widgetId);
            }

            // The data-widget attribute is removed, to avoid the widget being rendered again
            $element.removeAttr('data-widget');

            // If the widget's resource have already been loaded,
            // we just render the widget
            if (loadedWidgets[widgetName]) {
                return renderWidget(widgetName, widgetId, showSettings, widgetData[widgetId]);
            }

            // The widget hasn't been loaded yet, we add to the list of widgets to load
            widgetsToLoad[widgetName] = widgetsToLoad[widgetName] || {};
            // We set the absolute path of the widget loader, which will be used to prefix all relative
            // paths used in the widget. Widgets live under the `node_modules` folder
            widgetsToLoad[widgetName].prefixPath = '/node_modules/' + widget.path;
            // Set the link to the HTML page
            widgetsToLoad[widgetName].html = convertRelativeToAbsolutePath(widget.src, widgetsToLoad[widgetName].prefixPath);
            // Set the link to the default and user locale language bundles
            widgetsToLoad[widgetName].bundles = {};
            if (widget.i18n) {
                widgetsToLoad[widgetName].bundles['default'] = widget.i18n['default'] ? convertRelativeToAbsolutePath(widget.i18n['default'], widgetsToLoad[widgetName].prefixPath) : null;
                widgetsToLoad[widgetName].bundles[locale] = widget.i18n[locale] ? convertRelativeToAbsolutePath(widget.i18n[locale], widgetsToLoad[widgetName].prefixPath) : null;
            }
            // Add the id of the widget to the instances that should be loaded for the current widget name
            widgetsToLoad[widgetName].instances = widgetsToLoad[widgetName].instances || [];
            widgetsToLoad[widgetName].instances.push(widgetId);
        });

        // We can return if no widgets have been found
        if (_.keys(widgetsToLoad).length === 0) {
            return callback();
        }
        loadWidgetFiles(widgetsToLoad, $container, showSettings, widgetData, callback);
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
     * @param  {Object}         widgetData      JSON object containing the data that should be passed into the widgets. The keys are the widget's unique instance ids, and the value is what will be passed into the widget with that id
     * @param  {Function}       callback        Standard callback function
     * @param  {Object}         callback.err    Error containing the error code and message
     * @api private
     */
    var loadWidgetFiles = function(widgetsToLoad, $container, showSettings, widgetData, callback) {
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

        utilAPI.staticBatch(files, function(err, data) {
            if (err) {
                return callback(err);
            }

            processWidgetFiles(data, widgetsToLoad, $container, showSettings, widgetData, callback);
        });
    };

    /**
     * Process all of the retrieved static widget files so they can be cached and used for
     * widget rendering. First of all, the new language bundles will be parsed by the i18n API and
     * the HTML fragments will be translated. Next, the CSS and JS tags will be extracted and removed
     * from the HTML fragment, the CSS styles will be added to the header and the JS files will be
     * required. Finally, all of the widgets will be rendered.
     *
     * NOTE: All text in a widget should be wrapped in an HTML element. Text that is not wrapped in a tag
     * will not be rendered.
     *
     * @param  {Object}         widgetFiles     JSON object containing all of the loaded static widget files. The keys are the paths to the widget file, and the value is the actual file content.
     * @param  {Object}         widgetsToLoad   JSON Object representing the widgets that should be loaded
     * @param  {Element}        $container      jQuery element representing the HTML container in which we want to look for widgets and load them.
     * @param  {Boolean}        showSettings    Whether or not to show the widget's settings view.
     * @param  {Function}       callback        Standard callback function
     * @param  {Object}         callback.err    Error containing the error code and message
     * @api private
     */
    var processWidgetFiles = function(widgetFiles, widgetsToLoad, $container, showSettings, widgetData, callback) {
        // Keep track of the number of widgets that need to be loaded
        var widgetsLoaded = 0;

        // Process the widgets for all of the widgets that need to be loaded
        $.each(widgetsToLoad, function(widgetName, loadData) {

            // Parse the new i18n bundles, if bundles are present
            var widgetHTML = widgetFiles[loadData.html];
            if (loadData.bundles['default']) {
                i18nAPI.parseWidgetBundles(widgetName, widgetFiles[loadData.bundles['default']], loadData.bundles[locale] ? widgetFiles[loadData.bundles[locale]] : null);
            }

            // Translate the HTML fragment
            widgetHTML = i18nAPI.translate(widgetHTML, widgetName);

            // We transform the translated HTML into a jQuery object. However, as this will actually load all of the
            // images in the widget HTML straight away, and the images will still have relative URLs that need conversion,
            // we replace all `img` tags to temporary `imgtmp` tags
            widgetHTML = widgetHTML.replace(/<img/ig, '<imgtmp');
            var $widgetEl = $(widgetHTML);

            // Extract all images and rewrite their path
            $widgetEl.find('imgtmp').each(function(index, imgTag) {
                var $imgTag = $(imgTag);
                $imgTag.attr('src', convertRelativeToAbsolutePath($imgTag.attr('src'), widgetsToLoad[widgetName].prefixPath));
            });

            // Extract CSS and add to head
            $widgetEl.filter('link[rel="stylesheet"]').each(function(index, cssTag) {
                var $cssTag = $(cssTag);
                $cssTag.attr('href', convertRelativeToAbsolutePath($cssTag.attr('href'), widgetsToLoad[widgetName].prefixPath));
                // We append the CSS file to the head tag. However, appending the jQuery element would not be triggering a repaint
                // on IE8 and IE9, which means that we have to append the raw element's HTML string
                $('head').append($cssTag[0].outerHTML);
            });

            // Extract JS and require
            var jsFiles = [];
            $widgetEl.filter('script').each(function(index, jsTag) {
                jsFiles.push(convertRelativeToAbsolutePath($(jsTag).attr('src'), widgetsToLoad[widgetName].prefixPath));
            });

            // Extract the widget HTML without the link and script tags
            widgetHTML = $('<div>').html($widgetEl.filter(':not(link):not(script)')).html();
            // Change the images back to `img` tags
            widgetHTML = widgetHTML.replace(/imgtmp/ig, 'img');

            // Require the JS Files
            require(jsFiles, function(widgetFunction) {
                // Cache the widget's HTML and widgetFunction
                loadedWidgets[widgetName] = {
                    'html': widgetHTML,
                    'widgetFunction': widgetFunction
                };
                // Load all of the declared instances for this widget
                for (var i = 0; i < loadData.instances.length; i++) {
                    // Render the widget instance, and pass in the widget data for the widget instance
                    renderWidget(widgetName, loadData.instances[i], showSettings, widgetData[loadData.instances[i]]);
                }
                // Check if we have finished loading all widgets
                widgetsLoaded++;
                if (widgetsLoaded === _.keys(widgetsToLoad).length) {
                    callback();
                }
            });
        });
    };

    /**
     * Render a widget instance for a widget for which all of the widget files have already been loaded. This will add
     * the widget's HTML to the widget container, and will execute the main widget function, if it exists
     *
     * @param  {String}     widgetName      The name of the widget we want to render
     * @param  {String}     widgetId        The widget's unique id. This should be the id on the widget's container
     * @param  {Boolean}    showSettings    Whether or not to show the widget's settings view.
     * @param  {Object}     widgetData      JSON object representing widget instance data that should be passed into the widget load function
     * @api private
     */
    var renderWidget = function(widgetName, widgetId, showSettings, widgetData) {
        var $container = $('#' + widgetId);
        $container.html(loadedWidgets[widgetName].html);
        // Execute the widget's main function if it's provided
        if (loadedWidgets[widgetName].widgetFunction) {
            loadedWidgets[widgetName].widgetFunction(widgetId, showSettings, widgetData);
        }
    };

    /**
     * Insert a widget into a container with the provided viewmode.
     *
     * @param  {String}             widgetName      The name of the widget we want to load into the provided container
     * @param  {String}             [widgetId]      The widget's unique id. If this is not provided, a random id wil be generated
     * @param  {Element|String}     [$container]    HTML container in which we want to insert the widget. This can either be a jQuery Element object or a jQuery selector string. If this is not provided, it will be inserted into the document's body
     * @param  {Boolean}            [showSettings]  Whether or not to show the widget's settings view. If this is not set, the widget's view mode will be shown.
     * @param  {Object}             [widgetData]    JSON object representing widget instance data that should be passed into the widget load function
     * @param  {Function}           [callback]      Standard callback function executed when the widgets has finished loading and rendering
     * @param  {Object}             [callback.err]  Error containing the error code and message
     * @throws {Error}                              Error thrown when no or an invalid widget name is provided
     */
    var insertWidget = exports.insertWidget = function(widgetName, widgetId, $container, showSettings, widgetData, callback) {
        if (!widgetName || !manifests[widgetName]) {
            throw new Error('A valid widget name should be provided');
        }

        // Default value for showSettings
        showSettings = showSettings || false;
        // Default to the body element if the container hasn't been provided
        $container = $container ? $($container) : $('body');
        // Default widget id if it hasn't been provided
        widgetId = widgetId || utilAPI.generateId();
        // Create a widget data object to pass into the widget loader
        var widgetDataToPassIn = {};
        if (widgetData) {
            widgetDataToPassIn[widgetId] = widgetData;
        }

        // Add the widget declaration to the container
        var $widget = $('<div>').attr({
            'id': widgetId,
            'data-widget': widgetName
        });
        $container.prepend($widget);
        // Load the widget
        loadWidgets($container, showSettings, widgetDataToPassIn, callback);
    };

});
