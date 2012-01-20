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

    require(["misc/domReady!"], function(doc) {

    module("IE8 Content Test");

    var checkElements = function($elt, callback){

        var $html = $elt;
            /*.clone()
            .children()
            .filter(function(index){
                return !($(this).is("div") && $(this).css("display") === "none");
            })
            .remove();*/
        var text = $.trim($html.text());

        ok(text, "Content: " + text);

        if ($.isFunction(callback)) {
            callback();
        }
    };

    /**
     * Check HTML pages and test for WCAG compliance
     */
    var testIE8Content = function(){

        // First, run a test on static markup to ensure the testing is working properly
        test("TEST - IE8 Placeholder", function() {
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
        $(window).trigger("addlocalbinding.qunit.sakai");
    };

    /**
     * Run the test
     */

    if (sakai_global.qunit && sakai_global.qunit.ready) {
        testIE8Content();
    } else {
        $(window).bind("ready.qunit.sakai", function() {
            testIE8Content();
        });
    }

    });
});
