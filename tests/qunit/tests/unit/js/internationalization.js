$(function() {

module("Internationalization");

// attributes to test for
var attrs = ["alt", "title"];

// the regexes
var alpha = new RegExp("^(.*)[a-zA-z](.*)+$");
var regex = new RegExp("__MSG__(.*?)__");
var templateRegex = new RegExp("^(.*?)(\\$*){(.*?)}(.*?)+$");
var templateStartAlphaRegex = new RegExp("^([a-zA-z]+)(\\$*){(.*?)}+$");
var templateMiddleAlphaRegex = new RegExp("^(\\$*){(.*?)}([a-zA-z]+)(\\$*){(.*?)}+$");
var templateEndAlphaRegex = new RegExp("^(\\$*){(.*?)}([a-zA-z])+$");
// from jquery validate, modified to optionally allow (https?|ftp)://
var urlRegex = new RegExp(/^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);

/**
 * Test a string to make sure it is not a plain-text, non-internationalized string
 *
 * @param {String} str the string to test
 * @return {Boolean} true if the string is internationalized or a number, false otherwise
 */
var testString = function(str) {
    return (
                (
                    regex.test(str) ||
                    (
                        templateRegex(str) &&
                        !(
                            regex.test(str) ||
                            templateStartAlphaRegex.test(str) ||
                            templateEndAlphaRegex.test(str) ||
                            templateMiddleAlphaRegex.test(str)
                        )
                    )
                ) ||
                // allow numbers to be non-internationalized
                !alpha.test(str) ||
                urlRegex.test(str)
            );
};

/**
 * Check the element against the global array of attributes for internationalized strings
 *
 * @param {jQuery} $elt The element to check for attributes (and all its children)
 */
var checkAttrs = function($elt) {
    $.each(attrs, function(i, val) {
        // grab any element with the attribute, and filter out any empties
        $.each($elt.find("[" + val + "]").filter(function(index) {
            if (typeof $(this).attr(val) === "string") {
                return $.trim($(this).attr(val)) !== "";
            } else {
                return false;
            }

        }), function(j,elt) {
            var attrText = $.trim($(elt).attr(val));
            var pass = testString(attrText);
            ok(pass, val.toUpperCase() + " Text: " + attrText);
        });
    });
};

/**
 * Check the element's text for internationalized strings
 *
 * @param {jQuery} $elt The element to check (and all its children)
 */
var checkElements = function($elt){
    // check all elements with no children that have text, filtering out any empties (post-trim)
    $.each($elt.find("*:not(:empty)").filter(function(index){
        return $(this).children().length === 0 && $.trim($(this).text()) !== "";
    }), function(i,elt) {
        var tagText = $.trim($(elt).text());
        var pass = testString(tagText);
        ok(pass, "String: " + tagText);
    });
};

/**
 * Get all the i18n keys in the given element, both attributes and element text
 *
 * @param {jQuery} $elt The element to get all the keys from (and all its children)
 * @return {Array} an array of the keys in the element
 */
var getAllKeys = function($elt) {
    var keys = [];
    $.each($elt.find("*:not(:empty)").filter(function(index){
        return $(this).children().length === 0 && $.trim($(this).text()) !== "";
    }), function(i,elt) {
        var tagText = $.trim($(elt).text());
        var pass = testString(tagText);
        if (pass && !(!alpha.test(tagText) || urlRegex.test(tagText)) && $.inArray(tagText, keys) === -1) {
            keys.push(regex.exec(tagText)[0].replace("__MSG__", "").replace("__", ""));
        }
    });
    $.each(attrs, function(i, val) {
        $.each($elt.find("*[" + val + "]").filter(function(index) {
            if (typeof $(this).attr(val) === "string") {
                return $.trim($(this).attr(val)) !== "";
            } else {
                return false;
            }
        }), function(j,elt) {
            var attrText = $.trim($(elt).attr(val));
            var pass = testString(attrText);
            if (pass && !(!alpha.test(attrText) || urlRegex.test(attrText)) && $.inArray(attrText, keys) === -1) {
                keys.push(regex.exec(attrText)[0].replace("__MSG__", "").replace("__", ""));
            }
        });
    });
    return keys;
};

/**
 * Checks i18n keys from core HTML files for their presence in the default bundle
 *
 * @param {jQuery} $elt The element to check for valid translated keys (and all its children)
 */
var checkKeys = function($elt, callback) {
    var keys = getAllKeys($elt);
    for (var i=0,j=keys.length;i<j;i++) {
        ok(sakai.data.i18n.defaultBundle[keys[i]], "Default value exists for " + keys[i]);
    }
    callback();
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
    if ($.isPlainObject(sakai.widgets.widgets[widgetname].i18n)) {
        if (sakai.widgets.widgets[widgetname].i18n["default"]){
            bundle = sakai.widgets.widgets[widgetname].i18n["default"];
        }
    }
    if (bundle) {
        $.ajax({
            url: bundle,
            async: false,
            cache: false,
            success: function(data){
                sakai.data.i18n.widgets[widgetname] = sakai.data.i18n.widgets[widgetname] || {};
                sakai.data.i18n.widgets[widgetname]["default"] = sakai.data.i18n.changeToJSON(data);
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
 * Checks i18n keys from widget files for their presence in the widget's default bundle
 *
 * @param {jQuery} $elt The element to check for valid translated keys (and all its children)
 * @param {Object} widget The widget object as created in sakai_qunit_lib
 * @param {Function} callback function to call when complete
 */
var checkWidgetKeys = function($elt, widget, callback) {
    var keys = getAllKeys($elt);
    getWidgetInfo(widget.name, function(hasBundles) {
        for (var i=0,j=keys.length;i<j;i++) {
            if (hasBundles) {
                ok(sakai.api.i18n.Widgets.getValueForKey(widget.name, null, keys[i]), "Default value exists for " + keys[i]);
            } else {
                ok(sakai.data.i18n.defaultBundle[keys[i]], "Default value exists for " + keys[i]);
            }
        }
        if ($.isFunction(callback)) {
            callback();
        }
    });
};

/**
 * Check HTML pages and test for hard coded english
 */
var testInternationalization = function(){

    // First, run a few tests to verify that the testing is working
    // these should all pass
    test("TEST - i18n key nested inside elements in an A tag", 2, function() {
        checkElements($("#qunit-fixture"));
    });

    test("TEST - alt and title attributes", 2,  function() {
        checkAttrs($("#qunit-fixture"));
    });

    test("TEST - chceking for missing value", 2,  function() {
        ok(sakai.data.i18n.defaultBundle["ABOUT"], "Testing for a default value for ABOUT");
        ok(!sakai.data.i18n.defaultBundle["ABOUT123456"], "Testing for a missing value for ABOUT123456");
    });

    // Check all the core HTML files
    for (var i=0,j=sakai.qunit.devHtmlFiles.length; i<j; i++) {
        var urlToCheck = sakai.qunit.devHtmlFiles[i];
        (function(url) {
            asyncTest(url, function() {
                $.ajax({
                    url: url,
                    async: false,
                    success: function(data){
                        var div = document.createElement('div');
                        div.innerHTML = data;
                        checkElements($(div));
                        checkAttrs($(div));
                        checkKeys($(div), function() {
                            start();
                        });
                    }
                });
            });
        })(urlToCheck);
    }

    // Check all the widgets
    for (var z=0,y=sakai.qunit.widgets.length; z<y; z++) {
        var widgetURLToCheck = sakai.qunit.widgets[z].html;
        var widgetObject = sakai.qunit.widgets[z];
        (function(url, widget) {
            $.ajax({
                url: url,
                async: false,
                success: function(data){
                    var div = document.createElement('div');
                    div.innerHTML = data;
                    asyncTest(url, function() {
                        checkElements($(div));
                        checkAttrs($(div));
                        checkWidgetKeys($(div), widget, function() {
                            start();
                        });
                    });
                }
            });
        })(widgetURLToCheck, widgetObject);
    }
    QUnit.start();

};

/**
 * Run the test
 */
if (sakai.qunit && sakai.qunit.ready) {
    testInternationalization();
} else {
    $(window).bind("sakai-qunit-ready", function() {
        testInternationalization();
    });
}


});