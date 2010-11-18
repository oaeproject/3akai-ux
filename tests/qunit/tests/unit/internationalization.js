module("Internationalization");

$(function() {

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
        $.each($elt.find("*[" + val + "]").filter(function(index) {
            return $(this).attr(val).trim() !== "";
        }), function(j,elt) {
            var attrText = $(elt).attr(val).trim();
            ok(testString(attrText) , val.toUpperCase() + " Text: " + attrText);
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
        return $(this).children().length === 0 && $(this).text().trim() !== "";
    }), function(i,elt) {
        var tagText = $(elt).text().trim();
        ok(testString(tagText) , "String: " + tagText);
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

    for (var j = 0; j < sakai.qunit.htmlFiles.length; j++) {
        var urlToCheck = sakai.qunit.htmlFiles[j];
        $.ajax({
            url: urlToCheck,
            async: false,
            success: function(data){
                var div = document.createElement('div');
                div.innerHTML = data;
                test(urlToCheck, function() {
                    checkElements($(div));
                    checkAttrs($(div));
                });
            }
        });
    }
};

/**
 * Run the test
 */
testInternationalization();

});