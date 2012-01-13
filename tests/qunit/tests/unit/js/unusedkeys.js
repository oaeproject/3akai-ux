/*global require, sakai_global, QUnit, asyncTest, module, ok, start */
require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "qunitjs/qunit",
    "../../../../tests/qunit/js/sakai_qunit_lib.js",
    "../../../../tests/qunit/js/dev.js",
    "../../../../tests/qunit/js/devwidgets.js"
    ],
    function($, sakai) {

    "use strict";

    require(["misc/domReady!"], function(doc) {
        module("Unused Keys");

        var regex = new RegExp("__MSG__(.*?)__", "gm");
        var keylist = [];
        var keylistwidgets = {};
        var ignorekeys = ["description", "name"];
        var allhtml = "";
        var alljs = "";
        var totalfiles = 0;

        /**
         * Perform the actual check
         * @private
         * @param {String} htmldata The HTML string we'll check
         * @param {String} javascript The JavaScriopt string we'll check
         * @param {String} key The key which we'll search for
         */
        var performCheck = function(htmldata, javascript, key){
            var completekey = "__MSG__" + key + "__";

            if (htmldata.indexOf(completekey) >= 0 || javascript.indexOf(key) >= 0) {
                ok(true, "The following key is used: " + key);
            } else {
                ok(false, "The following key isn't used: " + key);
            }
        };

        /**
         * Check if the keys are actually used
         * @param {String} htmldata The HTML string
         * @param {String} javascript The JavaScriopt string
         * @param {Function} callback Callback function
         * @param {Object} widget Widget object containing name, id, etc
         */
        var checkKeysUsed = function(htmldata, javascript, callback, widget) {

            for(var i in keylistwidgets[widget.name]){
                if(keylistwidgets[widget.name].hasOwnProperty(i)) {
                    performCheck(htmldata, javascript, i);
                }
            }

            callback();
        };

        /**
         * Check which keys are used in the /dev environment
         */
        var checkDevKeysUsed = function(){

            keylist.sort();

            if(totalfiles === 0) {
                for(var i=0, j=keylist.length; i<j; i++){
                    performCheck(allhtml, alljs, keylist[i]);
                }
            }

        };

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
        };

        /**
         * Add to the complete list of all the Html & Javascript
         * @param {String} htmldata The HTML as a string
         */
        var addToAllHtml = function(htmldata){
            allhtml += htmldata;
            checkDevKeysUsed();
        };

        /**
         * Add to the complete list of all the Html & Javascript
         * @param {String} javascript The JavaScript as a string
         */
        var addToAllJs = function(javascript){
            alljs += javascript;
            checkDevKeysUsed();
        };

        /**
         * Get all the widget keys
         * @param {Object} widget The widget object (contains name, html URL & js URL)
         */
        var getAllWidgetKeys = function(widget){
            asyncTest("Widget: " + widget.name, function() {
                $.when(
                    $.ajax({url: widget.html, dataType: "text"}),
                    $.ajax({url: widget.js, dataType: "text"})
                ).then(function(htmldata, javascript) {
                    if(htmldata[1] === "success" && javascript[1] === "success"){
                        getWidgetInfo(widget.name, function(){
                            addWidgetKeys(widget.name);
                            checkKeysUsed(htmldata[0], javascript[0], function() {
                                totalfiles--;
                                addToAllHtml(htmldata[0]);
                                addToAllJs(javascript[0]);
                                start();
                            }, widget);
                        });
                    }
                });
            });
        };

        /**
         * Add the html/JS as a text string to a string which contains all the html
         */
        var addDevFile = function(url, kind) {
            $.ajax({
                url: url,
                dataType: "text",
                success: function(data){
                    totalfiles--;
                    if(kind === "js"){
                        addToAllJs(data);
                    } else {
                        addToAllHtml(data);
                    }
                }
            });
        };

        /**
         * Add all the keys from the default language bundle & all the widgets
         */
        var addAllKeys = function() {

            QUnit.start();

            totalfiles = sakai_global.qunit.devHtmlFiles.length +
                         sakai_global.qunit.devJsFiles.length +
                         sakai_global.qunit.widgets.length;

            // Add the default language bundle keys
            for (var k in sakai.api.i18n.data.defaultBundle){
                if (sakai.api.i18n.data.defaultBundle.hasOwnProperty(k)  && k && k.substring(0,1) !== "#"){
                    keylist.push(k);
                }
            }

            // Add all the core HTML files
            for (var i=0,j=sakai_global.qunit.devHtmlFiles.length; i<j; i++) {
                addDevFile(sakai_global.qunit.devHtmlFiles[i], "html");
            }

            // Add all the core JS files
            for (var a=0,b=sakai_global.qunit.devJsFiles.length; a<b; a++) {
                addDevFile(sakai_global.qunit.devJsFiles[a], "js");
            }

            // Add the widget bundle languages
            for (var z=0,y=sakai_global.qunit.widgets.length; z<y; z++) {
                getAllWidgetKeys(sakai_global.qunit.widgets[z]);
            }

        };

        /**
         * Start the actual test
         */
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
        }
        else {
            $(window).bind("ready.qunit.sakai", function() {
                startTest();
            });
        }

    });

});
