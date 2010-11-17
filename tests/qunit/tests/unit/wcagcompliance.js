module("WCAG 2.0 Compliance - 1.1.1 Non-text Content / Text Alternatives");

(function(){

var checkElements = function($elt){
    $.each($elt.find("img"), function(i, elt) {
        ok($(elt).attr("alt") || $(elt).prev('img').attr("src") === $(elt).attr("src"), "IMG tag has ALT attribute:" + $('<div/>').html(elt).html());
    });

    $.each($elt.find("applet"), function(i, elt) {
        ok($(elt).attr("alt"), "APPLET tag has ALT attribute: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("object"), function(i, elt) {
        ok($(elt).children().length > 0, "OBJECT tag has contents: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("area"), function(i, elt) {
        ok($(elt).attr("alt"), "AREA tag has ALT attribute: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("abbr"), function(i, elt) {
        ok($(elt).attr("title"), "ABBR tag has TITLE attribute: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("a"), function(i, elt) {
        ok($(elt).text() || $(elt).find("*").text(), "A tag has text or children that have text: " + $('<div/>').html(elt).html());
    });
};

/**
 * Check HTML pages and test for WCAG compliance
 */
var testWCAGCompliance = function(){

    // First, run a test on static markup to ensure the testing is working properly
    test("TEST - Embedded link text", function() {
        checkElements($("#qunit-fixture"));
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
                });
            }
        });
    }
};

/**
 * Run the test
 */
testWCAGCompliance();

})();