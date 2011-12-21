require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../tests/qunit/js/qunit.js",
    "../../../../tests/qunit/js/sakai_qunit_lib.js",
    "../../../../tests/qunit/js/dev.js",
    "../../../../tests/qunit/js/devwidgets.js"
    ],
    function($, sakai) {

    require(["misc/domReady!"], function(doc) {
        module("Unused Keys");

        var regex = new RegExp("__MSG__(.*?)__", "gm");
        var keylist = {};
        var keylistwidgets = {};
        var ignorekeys = ["description", "name"];

        /**
         * Check if the keys are actually used
         */
        var checkKeysUsed = function(htmldata, javascript, callback, widget) {

            var completekey;

            for(var i in keylistwidgets[widget.name]){
                if(keylistwidgets[widget.name].hasOwnProperty(i)) {
                    completekey = "__MSG__" + i + "__";

                    if (htmldata.indexOf(completekey) >= 0 || javascript.indexOf(i) >= 1) {
                        ok(true, "The following key is used: " + i);
                        keylistwidgets[widget.name][i]++;
                    } else {
                        ok(false, "The following key isn't used: " + i);
                    }
                }
            }

            callback();
        }

        /**
        * Grabs the widget's default bundle
        *
        * @param {String} widgetname The name of the widget
        * @param {Function} callback Callback function, called with a boolean for if the widget
        *                            has a bundle or not
        */
        var getWidgetInfo = function(widgetname, callback) {
            var bundle = false;
            if ($.isPlainObject(sakai.widgets[widgetname].i18n)) {
                if (sakai.widgets[widgetname].i18n["default"]){
                    bundle = sakai.widgets[widgetname].i18n["default"];
                }
            }
            if (bundle && bundle.bundle) {
                $.ajax({
                     url: bundle.bundle,
                     success: function(data){
                         sakai.api.i18n.data.widgets[widgetname] = sakai.api.i18n.data.widgets[widgetname] || {};
                         sakai.api.i18n.data.widgets[widgetname]["default"] = sakai.api.i18n.changeToJSON(data);
                         if ($.isFunction(callback)) {
                             callback(true);
                         }
                     }
                });
            } else {
                if ($.isFunction(callback)) {
                     callback(false);
                }
            }
        };

        /**
         * Add the keys for the widget default bundle to the keylist object
         * @param {String} widgetname The name of the widget
         */
        var addWidgetKeys = function(widgetname) {
            keylistwidgets[widgetname] = {};
            for (var i in sakai.api.i18n.data.widgets[widgetname]["default"]){
                if (sakai.api.i18n.data.widgets[widgetname]["default"].hasOwnProperty(i) && i && i.substring(0,1) !== "#" && $.inArray(i, ignorekeys) === -1 ){
                    keylistwidgets[widgetname][i] = 0;
                }
            }
        }

        /**
         * Get all the widget keys
         * @param {Object} widget The widget object (contains name, html URL & js URL)
         */
        var getAllWidgetKeys = function(widget){
                asyncTest(widget.name, function() {
                $.when(
                    $.ajax({url: widget.html, dataType: "text"}),
                    $.ajax({url: widget.js, dataType: "text"})
                ).then(function(htmldata, javascript) {
                    if(htmldata[1] === "success", javascript[1] === "success"){
                        getWidgetInfo(widget.name, function(){
                            addWidgetKeys(widget.name);
                            checkKeysUsed(htmldata[0], javascript[0], function() {
                                start();
                            }, widget);
                        });
                    }
                });
            });
        }

        /**
         * Add all the keys from the default language bundle & all the widgets
         */
        var addAllKeys = function() {

            // Add the default language bundle keys
            for (var i in sakai.api.i18n.data.defaultBundle){
                if (sakai.api.i18n.data.defaultBundle.hasOwnProperty(i)  && i && i.substring(0,1) !== "#"){
                    keylist[i] = 0;
                }
            }

            QUnit.start();

            // Add the widget bundle languages
            for (var z=0,y=sakai_global.qunit.widgets.length; z<y; z++) {
                getAllWidgetKeys(sakai_global.qunit.widgets[z]);
            }

        }

        var startTest = function() {
            if (sakai.api.i18n.done) {
                addAllKeys();
            } else {
                $(window).bind("done.i18n.sakai", function() {
                    addAllKeys();
                });
            }
        };

        /**
        * Run the test
        */
        if (sakai_global.qunit && sakai_global.qunit.ready) {
            startTest();
        } else {
            $(window).bind("ready.qunit.sakai", function() {
                startTest();
            });
        }

    });

});
