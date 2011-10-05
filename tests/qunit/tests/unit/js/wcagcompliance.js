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

    require.ready(function() {

    module("WCAG 2.0 Compliance - 1.1.1 Non-text Content / Text Alternatives");

    var checkElements = function($elt, callback){
        $.each($elt.find("a"), function(i, elt) {
            ok($(elt).attr("title") || $(elt).text() || $(elt).find("*").text() || ($(elt).html() === "<!-- -->") || $(elt).find("img").attr("alt"), "A tag has text or children that have text: " + $("<div/>").html(elt).html());
            if ($(elt).attr("title") && ($(elt).text() || $(elt).find("*").text())){
                if ($.trim($(elt).attr("title")) === $.trim($(elt).text()) || $.trim($(elt).attr("title")) === $.trim($(elt).find("*").text())){
                    ok(false, "A tag has duplicate text and title attribute: " + $("<div/>").html(elt).html());        
                }
            }
        });

        $.each($elt.find("img"), function(i, elt) {
            ok($(elt).attr("alt") || $(elt).prev('img').attr("src") === $(elt).attr("src"), "IMG tag has ALT attribute:" + $("<div/>").html(elt).html());
        });

        $.each($elt.find("applet"), function(i, elt) {
            ok($(elt).attr("alt"), "APPLET tag has ALT attribute: " + $("<div/>").html(elt).html());
        });

        $.each($elt.find("object"), function(i, elt) {
            ok($(elt).children().length > 0, "OBJECT tag has contents: " + $("<div/>").html(elt).html());
        });

        $.each($elt.find("area"), function(i, elt) {
            ok($(elt).attr("alt"), "AREA tag has ALT attribute: " + $("<div/>").html(elt).html());
        });

        $.each($elt.find("abbr"), function(i, elt) {
            ok($(elt).attr("title"), "ABBR tag has TITLE attribute: " + $("<div/>").html(elt).html());
        });

        $.each($elt.find("button"), function(i, elt) {
            ok($(elt).attr("title") || $(elt).text() || $(elt).find("*").text() || ($(elt).html() === "<!-- -->"), "BUTTON tag has text or children that have text: " + $("<div/>").html(elt).html());
        });

        $.each($elt.find("textarea"), function(i, elt) {
            // ignore the tinymce editor textarea
            if ($(elt).attr("id") !== "elm1") {
                ok($(elt).attr("title") || $(elt).attr("placeholder"), "TEXTAREA tag has TITLE or PLACEHOLDER attribute: " + $("<div/>").html(elt).html());
            }
        });

        $.each($elt.find("div"), function(i, elt) {
            var divHtml = $(elt).html();
            if (divHtml.substr(0, 5) === "<!--\n" && divHtml.substr(divHtml.length - 4, divHtml.length) === "\n-->") {
                // this is a javascript template, check the elements in the template
                var templateData = divHtml.substr(5, divHtml.length - 4);
                var div = document.createElement('div');
                div.innerHTML = templateData;
                checkElements($(div), false);
            }
        });

        if ($.isFunction(callback)) {
            callback();
        }
    };

    /**
     * Check HTML pages and test for WCAG compliance
     */
    var testWCAGCompliance = function(){

        // First, run a test on static markup to ensure the testing is working properly
        test("TEST - Embedded link text", function() {
            checkElements($("#qunit-fixture"));
        });

        for (var j = 0; j < sakai_global.qunit.allHtmlFiles.length; j++) {
            var urlToCheck = sakai_global.qunit.allHtmlFiles[j];
            (function(url){
                asyncTest(url, function() {
                    $.ajax({
                        url: url,
                        success: function(data){
                            var div = document.createElement('div');
                            div.innerHTML = data;
                            $(div).find("script").remove();
                            $(div).find("link").remove();
                            $(div).find("meta").remove();
                            $(div).find("title").remove();
                            checkElements($(div), function() {
                                start();
                            });
                        }
                    });
                });
            })(urlToCheck);
        }
        QUnit.start();
    };

    /**
     * Run the test
     */

    if (sakai_global.qunit && sakai_global.qunit.ready) {
        testWCAGCompliance();
    } else {
        $(window).bind("ready.qunit.sakai", function() {
            testWCAGCompliance();
        });
    }

    });
});
