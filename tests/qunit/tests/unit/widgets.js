module("Widgets - Core");

(function(){

test("The Widget variable exists", function(){
    same(typeof Widgets, "object", "the Widgets variable exists");

    same(typeof Widgets.widgets, "object", "the Widgets.widgets variable exists");
});

module("Widgets - Valid Properties");

(function() {

    // Properties
    var properties = [{
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
    for (var i in Widgets.widgets) {
        (function(i) {
            if (Widgets.widgets.hasOwnProperty(i)) {
                var widgetObject = Widgets.widgets[i];
                test(i, function() {
                    var propertiesCount = properties.length;
                    while (propertiesCount--){
                        // Check if the required properties are set on each widget object
                        // if not, check if the non-required property is in the right datatype (boolean/string/...)
                        if(properties[propertiesCount].required || (!properties[propertiesCount].required) && widgetObject[properties[propertiesCount].name]){
                            same(typeof widgetObject[properties[propertiesCount].name], properties[propertiesCount].type, "Type of property " + properties[propertiesCount].name);
                        }
                    }

                    // Check if the widget object contains properties that aren't in the properties object
                    for(var j in widgetObject){
                        if(widgetObject.hasOwnProperty(j)){

                            var count = 0;
                            propertiesCount = properties.length;

                            // Run over
                            while (propertiesCount--){
                                if(properties[propertiesCount].name === j){
                                    count++;
                                    break;
                                }
                            }
                            ok(count === 1, "Property '" + j + "' is a valid property");
                        }
                    }
                });
            }
        })(i);
    }
})();

module("Widgets - URLs in Config file");

(function() {

    for (var i in Widgets.widgets) {
        (function(i) {
            if (Widgets.widgets.hasOwnProperty(i)) {
                var widgetObject = Widgets.widgets[i];
                asyncTest(i, function(){
                    stop();
                    var properties = ["url", "img", "i18n"];
                    for (var j = 0, k = properties.length; j < k; j++) {

                        if (widgetObject[properties[j]] && !widgetObject.iframe) {

                            var subproperties = [];

                            if (typeof widgetObject[properties[j]] === "object") {
                                for (var n in widgetObject[properties[j]]) {
                                    if (widgetObject[properties[j]].hasOwnProperty(n)) {
                                        subproperties.push({
                                            "name":properties[j],
                                            "url":widgetObject[properties[j]][n]
                                        });
                                    }
                                }
                            } else {
                                subproperties.push({
                                    "name":properties[j],
                                    "url":widgetObject[properties[j]]
                                });
                            }

                            for (var l = 0, m = subproperties.length; l < m; l++) {
                                $.ajax({
                                    async: false,
                                    url: subproperties[l].url,
                                    complete: function(xhr, status) {
                                        ok(status === "success", "The URL " + subproperties[l].url + " for the " + subproperties[l].name + " property on the " + widgetObject.id + " widget is valid");
                                        start();
                                    }
                                });
                            }

                        }
                    }
                });
            }
        })(i);
    }
})();

})();