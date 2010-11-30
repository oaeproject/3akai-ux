$(function() {



var widgetProperties = [{
    "name": "ca",
    "type": "boolean"
}, {
    "name": "description",
    "type": "string"
}, {
    "name": "hasSettings",
    "type": "boolean"
}, {
    "name": "height",
    "type": "number"
}, {
    "name": "i18n",
    "type": "object"
}, {
    "name": "id",
    "required": true,
    "type": "string"
}, {
    "name": "iframe",
    "type": "boolean"
}, {
    "name": "img",
    "type": "string"
}, {
    "name": "multipleinstance",
    "type": "string"
}, {
    "name": "name",
    "type": "string"
}, {
    "name": "personalportal",
    "type": "boolean"
}, {
    "name": "showinmedia",
    "type": "boolean"
}, {
    "name": "showinsakaigoodies",
    "type": "boolean"
}, {
    "name": "showinsidebar",
    "type": "boolean"
}, {
    "name": "scrolling",
    "type": "boolean"
}, {
    "name": "siteportal",
    "type": "boolean"
}, {
    "name": "url",
    "required": true,
    "type": "string"
}, {
    "name": "groupdashboard",
    "type": "boolean"
}, {
    "name": "grouppages",
    "type": "boolean"
}, {
    "name": "userdashboard",
    "type": "boolean"
}, {
    "name": "userpages",
    "type": "boolean"
}, {
    "name": "deletable",
    "type": "boolean"
}, {
    "name": "subNameInfoContent",
    "type": "string"
}, {
    "name": "enabled",
    "type": "boolean",
    "required": true
}, {
    "name": "type",
    "type": "string",
    "required": true
}];


var checkWidgetVariable = function() {
    module("Widgets - Core");

    test("The Widget variable exists", function(){
        same(typeof sakai.widgets.widgets, "object", "the sakai.widgets.widgets variable exists");
    });
};

var checkWidgetProperties = function(widgetObject, callback) {
    var propertiesCount = widgetProperties.length;
    while (propertiesCount--){
        // Check if the required properties are set on each widget object
        // if not, check if the non-required property is in the right datatype (boolean/string/...)
        if(widgetProperties[propertiesCount].required || (!widgetProperties[propertiesCount].required && widgetObject[widgetProperties[propertiesCount].name])){
            same(typeof widgetObject[widgetProperties[propertiesCount].name], widgetProperties[propertiesCount].type, "Type of property " + widgetProperties[propertiesCount].name);
        }
    }

    // Check if the widget object contains properties that aren't in the properties object
    for(var j in widgetObject) {
        if(widgetObject.hasOwnProperty(j)){

            var count = 0;
            propertiesCount = widgetProperties.length;

            // Run over
            while (propertiesCount--){
                if(widgetProperties[propertiesCount].name === j){
                    count++;
                    break;
                }
            }
            ok(count === 1, "Property '" + j + "' is a valid property");
        }
    }
    callback();
};

var testWidgetProperties = function() {
    module("Widgets - Valid Properties");
    for (var i in sakai.widgets.widgets) {
        if (sakai.widgets.widgets.hasOwnProperty(i)) {
            var widgetObject = sakai.widgets.widgets[i];
            (function(widgetObj) {
                stop();
                asyncTest(widgetObj.id, function() {
                    checkWidgetProperties(widgetObj, function() {
                        start();
                    });
                });
            })(widgetObject);
        }  
    }
};


var getWidgetProperties = function(widgetObject) {
    var properties = ["url", "img", "i18n"];
    var subproperties = [];
    for (var j = 0, k = properties.length; j < k; j++) {
        var property = properties[j];
        if (widgetObject[property] && !widgetObject.iframe) {
            if (typeof widgetObject[property] === "object") {
                for (var n in widgetObject[property]) {
                    if (widgetObject[property].hasOwnProperty(n)) {
                        subproperties.push({
                            "name":property,
                            "url":widgetObject[property][n]
                        });
                    }
                }
            } else {
                subproperties.push({
                    "name":property,
                    "url":widgetObject[property]
                });
            }
        }
    }
    return subproperties;
};

var testAllProperties = function(subproperties, widgetName, callback) {
    for (var l = 0, m = subproperties.length; l < m; l++) {
        (function(propertyURL, propertyName, last) {
            $.ajax({
                url: propertyURL,
                async: false,
                complete: function(xhr, status) {
                    ok(status === "success", propertyURL + " on the " + propertyName);
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            });
        })(subproperties[l].url, subproperties[l].name);
    }
};

var testWidgetURLs = function() {
    module("Widgets - URLs in Config file");
    for (var i in sakai.widgets.widgets) {
        if (sakai.widgets.widgets.hasOwnProperty(i)) {
            var theWidget = sakai.widgets.widgets[i];
            var subproperties = getWidgetProperties(theWidget);
            if (subproperties.length > 0) {
                (function(widgetName, subprops) {
                    asyncTest(widgetName, subprops.length, function() {
                        var counter = 0;
                         testAllProperties(subprops, widgetName, function() {
                             counter++;
                             if (counter === subprops.length) {
                                 start();
                             }
                         });
                    });
                })(theWidget.id, subproperties);  
            }
        }
    }
};

var testWidgets = function() {
    checkWidgetVariable();
    testWidgetProperties();
    testWidgetURLs();
    QUnit.start();
};

if (sakai.qunit && sakai.qunit.ready) {
    testWidgets();
} else {
    $(window).bind("sakai-qunit-ready", function() {
        testWidgets();
    });
}


});
