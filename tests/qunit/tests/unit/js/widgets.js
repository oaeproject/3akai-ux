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

        var widgetProperties = [{
            'name': 'hasSettings',
            'type': 'boolean'
        }, {
            'name': 'height',
            'type': 'number'
        }, {
            'name': 'i18n',
            'type': 'object'
        }, {
            'name': 'id',
            'required': true,
            'type': 'string'
        }, {
            'name': 'iframe',
            'type': 'boolean'
        }, {
            'name': 'img',
            'type': 'string'
        }, {
            'name': 'imghover',
            'type': 'string'
        }, {
            'name': 'multipleinstance',
            'type': 'string'
        }, {
            'name': 'personalportal',
            'type': 'boolean'
        }, {
            'name': 'showinsidebar',
            'type': 'boolean'
        }, {
            'name': 'scrolling',
            'type': 'boolean'
        }, {
            'name': 'trigger',
            'type': 'object'
        }, {
            'name': 'url',
            'required': true,
            'type': 'string'
        }, {
            'name': 'deletable',
            'type': 'boolean'
        }, {
            'name': 'subNameInfoContent',
            'type': 'string'
        }, {
            'name': 'enabled',
            'type': 'boolean',
            'required': true
        }, {
            'name': 'type',
            'type': 'string',
            'required': true
        }, {
            'name': 'settingsWidth',
            'type': 'number'
        }, {
            'name': 'defaultLat',
            'type': 'number'
        }, {
            'name': 'defaultLng',
            'type': 'number'
        }, {
            'name': 'defaultZoom',
            'type': 'number'
        }, {
            'name': 'indexFields',
            'type': 'object'
        }, {
            'name': 'sakaidocs',
            'type': 'boolean'
        }, {
            'name': 'hashParams',
            'type': 'object'
        }, {
            'name': 'defaultConfiguration',
            'type': 'object'
        }];


        var checkWidgetVariable = function() {
            module('Widgets - Core');

            test('The Widget variable exists', function() {
                same(typeof sakai.widgets, 'object', 'the sakai.widgets variable exists');
            });
        };

        var checkWidgetProperties = function(widgetObject, callback) {
            var propertiesCount = widgetProperties.length-1;
            while (propertiesCount > -1) {
                // Check if the required properties are set on each widget object
                // if not, check if the non-required property is in the right datatype (boolean/string/...)
                if (widgetProperties[propertiesCount].required || (!widgetProperties[propertiesCount].required && widgetObject[widgetProperties[propertiesCount].name])) {
                    same(typeof widgetObject[widgetProperties[propertiesCount].name], widgetProperties[propertiesCount].type, 'Type of property ' + widgetProperties[propertiesCount].name);
                }
                propertiesCount--;
            }

            // Check if the widget object contains properties that aren't in the properties object
            for(var j in widgetObject) {
                if (widgetObject.hasOwnProperty(j)) {

                    var count = 0;
                    propertiesCount = widgetProperties.length-1;

                    // Run over
                    while (propertiesCount > -1) {
                        if (widgetProperties[propertiesCount].name === j) {
                            count++;
                            break;
                        }
                        propertiesCount--;
                    }
                    ok(count === 1, 'Property "' + j + '" is a valid property');
                }
            }
            callback();
        };

        var makeWidgetPropertiesTest = function(widgetObj) {
            asyncTest(widgetObj.id, function() {
                checkWidgetProperties(widgetObj, function() {
                    start();
                });
            });
        };

        var testWidgetProperties = function() {
            module('Widgets - Valid Properties');
            for (var i in sakai.widgets) {
                if (sakai.widgets.hasOwnProperty(i)) {
                    var widgetObject = sakai.widgets[i];
                    makeWidgetPropertiesTest(widgetObject);
                }
            }
        };


        var getWidgetProperties = function(widgetObject) {
            var properties = ['url', 'img', 'i18n'];
            var subproperties = [];
            for (var j = 0, k = properties.length; j < k; j++) {
                var property = properties[j];
                if (widgetObject[property] && !widgetObject.iframe) {
                    if (typeof widgetObject[property] === 'object') {
                        for (var n in widgetObject[property]) {
                            if (widgetObject[property].hasOwnProperty(n)) {
                                subproperties.push({
                                    'name':property,
                                    'url':widgetObject[property][n].bundle
                                });
                                if (!widgetObject[property][n].bundle) {
                                    alert(JSON.stringify(widgetObject));
                                }
                                debug.log('Error ===> ' + widgetObject[property][n].bundle);
                            }
                        }
                    } else {
                        subproperties.push({
                            'name':property,
                            'url':widgetObject[property]
                        });
                    }
                }
            }
            return subproperties;
        };

        var makePropertiesTest = function(propertyURL, propertyName, last, callback) {
            $.ajax({
                url: propertyURL,
                complete: function(xhr, status) {
                    ok(status === 'success', propertyURL + ' on the ' + propertyName);
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            });
        };

        var testAllProperties = function(subproperties, widgetName, callback) {
            for (var l = 0, m = subproperties.length; l < m; l++) {
                makePropertiesTest(subproperties[l].url, subproperties[l].name, false, callback);
            }
        };

        var makeWidgetURLTest = function(widgetName, subprops) {
            asyncTest(widgetName, subprops.length, function() {
                 var counter = 0;
                 testAllProperties(subprops, widgetName, function() {
                     counter++;
                     if (counter === subprops.length) {
                         start();
                     }
                 });
            });
        };

        var testWidgetURLs = function() {
            module('Widgets - URLs in Config file');
            for (var i in sakai.widgets) {
                if (sakai.widgets.hasOwnProperty(i)) {
                    var theWidget = sakai.widgets[i];
                    var subproperties = getWidgetProperties(theWidget);
                    if (subproperties.length > 0) {
                        makeWidgetURLTest(theWidget.id, subproperties);
                    }
                }
            }
        };

        var testWidgets = function() {
            checkWidgetVariable();
            testWidgetProperties();
            testWidgetURLs();
            QUnit.start();
            $(window).trigger('addlocalbinding.qunit.sakai');
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            testWidgets();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                testWidgets();
            });
        }

    }
);
