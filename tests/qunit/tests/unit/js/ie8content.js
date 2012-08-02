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

    module('IE8 Content Test');

    var checkElements = function($elt, callback) {

        var firstNodeText = $.trim($elt.children(':first').text());

        // remove hidden divs
        var $html = $('<div></div>').append($elt
            .clone()
            .children()
            .filter(function(index) {
                return !($(this).is('div') && $(this).css('display') === 'none');
            })
            .remove());

        // check for input, button, img tags or text that will render in IE8
        var text = $.trim($html.text());
        var img = $html.find('img').length;
        var input = $html.find('input').length;
        var button = $html.find('button').length;
        var placeholderIndex = $elt.text().indexOf('__MSG__IE_PLACEHOLDER__');

        ok(text || firstNodeText || img || input || button || (placeholderIndex >= 0), 'Content: ' + text);

        if ($.isFunction(callback)) {
            callback();
        }
    };

    /**
     * Check HTML pages and test for IE8 Content
     */
    var testIE8Content = function() {

        // First, run a test on static markup to ensure the testing is working properly
        test('TEST - IE8 Placeholder', function() {
            checkElements($('#qunit-fixture'));
        });

        for (var j = 0; j < sakai_global.qunit.widgets.length; j++) {
            var urlToCheck = sakai_global.qunit.widgets[j].html;
            (function(url) {
                asyncTest(url, function() {
                    $.ajax({
                        url: url,
                        success: function(data) {
                            var div = document.createElement('div');
                            div.innerHTML = data;
                            $(div).find('script').remove();
                            $(div).find('link').remove();
                            $(div).find('meta').remove();
                            $(div).find('title').remove();
                            checkElements($(div), function() {
                                start();
                            });
                        }
                    });
                });
            })(urlToCheck);
        }
        $(window).trigger('addlocalbinding.qunit.sakai');
    };

    /**
     * Run the test
     */

    if (sakai_global.qunit && sakai_global.qunit.ready) {
        testIE8Content();
    } else {
        $(window).on('ready.qunit.sakai', function() {
            testIE8Content();
        });
    }

});
