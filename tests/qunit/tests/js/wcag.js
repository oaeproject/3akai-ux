/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'oae.core', '../js/util.js', 'qunitjs'], function($, oae, util) {

    module('WCAG 2.0 Compliance - 1.1.1 Non-text Content / Text Alternatives');

    var checkElements = function($elt, callback) {
        $.each($elt.find('a'), function(i, elt) {
            if ($(elt).attr('id') !== 'topnavigation_user_options_name') {
                ok($(elt).attr('title') || $(elt).text() || $(elt).find('*').text() || ($(elt).html() === '<!-- -->') || $(elt).find('img').attr('alt'), 'A tag has text or children that have text: ' + $('<div/>').html(elt).html());
            }
            if ($(elt).attr('title') && ($(elt).text() || $(elt).find('*').text())) {
                if ($.trim($(elt).attr('title')) === $.trim($(elt).text()) || $.trim($(elt).attr('title')) === $.trim($(elt).find('*').text())) {
                    ok(false, 'A tag has duplicate text and title attribute: ' + $('<div/>').html(elt).html());
                }
            }
        });

        $.each($elt.find('button'), function(i, elt) {
            ok(!($(elt).attr('title') && $(elt).text() && !$.trim($(elt).text())) && ($(elt).attr('title') || $(elt).find('img').attr('alt') || $.trim($(elt).text()) || $.trim($(elt).find('*').text()) || ($(elt).html() === '<!-- -->')), 'BUTTON tag has text or children that have text: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('img'), function(i, elt) {
            var parentTitle = false;
            if ($(elt).parent().attr('title') && $(elt).parent().attr('title').length) {
                parentTitle = true;
            }
            ok($(elt).attr('alt') || $(elt).prev('img').attr('src') === $(elt).attr('src') || parentTitle, 'IMG tag has ALT attribute:' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('input[type="image"]'), function(i, elt) {
            ok($(elt).attr('alt'), 'INPUT img type tag has ALT attribute:' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('applet'), function(i, elt) {
            ok($(elt).attr('alt'), 'APPLET tag has ALT attribute: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('object'), function(i, elt) {
            ok($(elt).children().length > 0, 'OBJECT tag has contents: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('area'), function(i, elt) {
            ok($(elt).attr('alt'), 'AREA tag has ALT attribute: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('abbr'), function(i, elt) {
            ok($(elt).attr('title'), 'ABBR tag has TITLE attribute: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('textarea'), function(i, elt) {
            // check if textarea has an attached label element, otherwise it needs a title attribute
            var hasLabel = false;
            if ($(elt).attr('id')) {
                var textareaId = $(elt).attr('id');
                $.each($elt.find('label'), function(j, label) {
                    if ($(label).attr('for') === textareaId) {
                        hasLabel = true;
                    }
                });
            }

            ok($(elt).attr('title') || hasLabel, 'TEXTAREA tag has TITLE attribute or LABEL element: ' + $('<div/>').html(elt).html());
            ok(!$(elt).attr('alt'), 'TEXTAREA tag does not have ALT attribute: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('input, select'), function(i, elt) {
            ok(!$(elt).attr('alt'), 'INPUT/SELECT tag does not have ALT attribute: ' + $('<div/>').html(elt).html());
        });

        $.each($elt.find('div'), function(i, elt) {
            var divHtml = $(elt).html();
            if (divHtml.substr(0, 5) === '<!--\n' && divHtml.substr(divHtml.length - 4, divHtml.length) === '\n-->') {
                // this is a javascript template, check the elements in the template
                var templateData = divHtml.substring(5, divHtml.length - 4);

                // We need to empty out the SRC since otherwise we'll get unnecessary error messages
                // These messages appear since the browser wants to load the actual image (e.g. src='{test.img}')
                templateData = templateData.replace(/src='(.+?)'/g, 'src=""');
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
    var testWCAGCompliance = function(widgets) {
        $.each(widgets, function(i, widget) {
            var filename = '/node_modules/oae-core/' + widget.id + '/' + widget.id + '.html';
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
            })(filename);
        });
    };

    util.loadWidgets(function(widgets) {
        testWCAGCompliance(widgets);
    });

    QUnit.load();

});
