require(
    [
        'jquery',
        'oae.core',
        'qunitjs',
        '../js/util.js',
        '../js/jshint.js'
    ], function($, oae) {

        module("Double Translation Keys");

        var changeToJSON = function(input) {
            var json = {};
            var inputLine = input.split(/\n/);
            var i;
            for (i in inputLine) {
                // IE 8 i has indexof as well which breaks the page.
                if (inputLine.hasOwnProperty(i)) {
                    var keyValuePair = inputLine[i].split(/\=/);
                    var key = $.trim(keyValuePair.shift());
                    var value = $.trim(keyValuePair.join('='));
                    json[key] = value;
                }
            }
            return json;
        }

        /**
         * Retrieves the bundle files from widgets
         */
        var getWidgetBundles = function(widgetBundles, callback) {
            var widgetsToDo = 0;

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

        var checkForDoubleKey = function(widgetBundles, widgetId, key) {
            var doubleKeys = [];
            $.each(widgetBundles, function(i, widget) {
                if (widget.id !== widgetId) {
                    $.each(widget.i18n['default'], function(iii, keyToCheck) {
                        if (key === iii) {
                            doubleKeys.push(key + ' in ' + widget.id);
                        }
                    });
                }
            });
            if (doubleKeys.length) {
                QUnit.ok(false, 'Double keys found: ' + doubleKeys.join(', '));
            } else {
                QUnit.ok(true, 'The key isn\'t used in any other widgets or in the defaultbundle');
            }
        };

        /**
         * Initializes the clean JS Test module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var doubleTranslationKeysTest = function(widgets) {
            QUnit.load();

            var widgetBundles = [];
            $.each(widgets, function(i, widget) {
                var widgetObj = {'id': widget.id, 'bundles': []};
                $.each(widget.i18n, function(i, bundle) {
                    if (i === 'default') {
                        widgetObj.bundles.push(i);
                    }
                });
                widgetBundles.push(widgetObj);
            });

            getWidgetBundles(widgetBundles, function(widgetBundles) {
                $.each(widgetBundles, function(i, widget) {
                    if (widget.id) {
                        QUnit.test(widget.id, function() {
                            $.each(widget.i18n['default'], function(iii, keyToCheck) {
                                if (iii) {
                                    checkForDoubleKey(widgetBundles, widget.id, iii);
                                }
                            });
                        });
                    }
                });
            });
        };

        $(window).on('widgetsdone.qunit.oae', function(ev, widgets) {
            doubleTranslationKeysTest(widgets);
        });
    }
);
