/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'oae.core', '/tests/qunit/js/util.js'], function($, oae, util) {

    module('WCAG 2.0 Compliance - 1.1.1 Non-text Content / Text Alternatives');

    /**
     * Check elements for WCAG 2.0 compliance
     *
     * @param  {Object}      $el         The element to check
     * @param  {Function}    callback    Standard callback function
     */
    var checkElements = function($el, callback) {
        // If there are no elements that need to be checked we show a success message in the end
        var needsChecking = false;

        /**
         * All links should have text in it or in its children
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H30
         */
        $.each($el.find('a'), function(i, el) {
            needsChecking = true;
            ok($(el).attr('title') || $(el).text() || $(el).find('*').text() || ($(el).html() === '<!-- -->') || $(el).find('img').attr('alt'), 'A tag has text or children that have text: ' + $('<div/>').html(el).html());
        });

        /**
         * All buttons should have text in it or in its children
         * @see http://www.w3.org/TR/UNDERSTANDING-WCAG20/text-equiv-all.html
         */
        $.each($el.find('button'), function(i, el) {
            needsChecking = true;
            ok(!($(el).attr('title') && $(el).text() && !$.trim($(el).text())) && ($(el).attr('title') || $(el).find('img').attr('alt') || $.trim($(el).text()) || $.trim($(el).find('*').text()) || ($(el).html() === '<!-- -->')), 'BUTTON tag has text or children that have text: ' + $('<div/>').html(el).html());
        });

        /**
         * All images should have an `alt` attribute
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H37
         */
        $.each($el.find('img'), function(i, el) {
            needsChecking = true;
            var parentTitle = false;
            if ($(el).parent().attr('title') && $(el).parent().attr('title').length) {
                parentTitle = true;
            }
            ok($(el).attr('alt') || $(el).prev('img').attr('src') === $(el).attr('src') || parentTitle, 'IMG tag has ALT attribute:' + $('<div/>').html(el).html());
        });

        /**
         * All input fields of type image should have an `alt` attribute
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H37
         */
        $.each($el.find('input[type="image"]'), function(i, el) {
            needsChecking = true;
            ok($(el).attr('alt'), 'INPUT img type tag has ALT attribute:' + $('<div/>').html(el).html());
        });

        /**
         * All `applet` tags should have an `alt` attribute
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H35
         */
        $.each($el.find('applet'), function(i, el) {
            needsChecking = true;
            ok($(el).attr('alt'), 'APPLET tag has ALT attribute: ' + $('<div/>').html(el).html());
        });

        /**
         * All `object` tags should not be empty
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H53
         */
        $.each($el.find('object'), function(i, el) {
            needsChecking = true;
            ok($(el).children().length > 0, 'OBJECT tag has contents: ' + $('<div/>').html(el).html());
        });

        /**
         * All `area` tags should have an `alt` attribute
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H24
         */
        $.each($el.find('area'), function(i, el) {
            needsChecking = true;
            ok($(el).attr('alt'), 'AREA tag has ALT attribute: ' + $('<div/>').html(el).html());
        });

        /**
         * All `abbr` tags should have a `title` attribute
         * @see http://www.w3.org/TR/WCAG-TECHS/H28.html
         */
        $.each($el.find('abbr'), function(i, el) {
            needsChecking = true;
            ok($(el).attr('title'), 'ABBR tag has TITLE attribute: ' + $('<div/>').html(el).html());
        });

        /**
         * Every `textarea` element should have a label or a `title` attribute and no `alt` attribute
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H44
         */
        $.each($el.find('textarea'), function(i, el) {
            needsChecking = true;
            // Check if textarea has an attached label element, otherwise it needs a title attribute
            var hasLabel = false;
            if ($(el).attr('id')) {
                var textareaId = $(el).attr('id');
                $.each($el.find('label'), function(j, label) {
                    if ($(label).attr('for') === textareaId) {
                        hasLabel = true;
                    }
                });
            }

            ok($(el).attr('title') || hasLabel, 'TEXTAREA tag has TITLE attribute or LABEL element: ' + $('<div/>').html(el).html());
            ok(!$(el).attr('alt'), 'TEXTAREA tag does not have ALT attribute: ' + $('<div/>').html(el).html());
        });

        /**
         * All `input` and `select` tags should not have an `alt` attribute
         * @see http://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/H44
         */
        $.each($el.find('input, select'), function(i, el) {
            needsChecking = true;
            ok(!$(el).attr('alt'), 'INPUT/SELECT tag does not have ALT attribute: ' + $('<div/>').html(el).html());
        });

        // If a `div` element is handled and it contains a template the HTML of the template needs to be checked
        $.each($el.find('div'), function(i, el) {
            var divHtml = $(el).html();
            if (divHtml.substr(0, 4) === '<!--' && divHtml.substr(divHtml.length - 3, divHtml.length) === '-->') {
                needsChecking = true;
                // This is a javascript template, check the elements in the template
                var templateData = divHtml.substring(5, divHtml.length - 4);

                // We need to empty out the SRC since otherwise we'll get unnecessary error messages
                // These messages appear since the browser wants to load the actual image (e.g. src='{test.img}')
                templateData = templateData.replace(/src='(.+?)'/g, 'src=""');
                var div = document.createElement('div');
                div.innerHTML = templateData;
                checkElements($(div), false);
            }
        });

        if (!needsChecking) {
            ok(true, 'No elements need checking');
        }
        if ($.isFunction(callback)) {
            callback();
        }
    };

    /**
     * Check HTML for WCAG compliance
     *
     * @param  {Object}    testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var testWCAGCompliance = function(testData) {
        // Check the WCAG compliance of widgets
        $.each(testData.widgetData, function(widgetId, widget) {
            test(widget.id, function() {
                var $widget = $('<div>').html(widget.html);
                checkElements($widget);
            });
        });

        // Check the WCAG compliance of the main HTML and macro files
        $.each(testData.mainHTML, function(mainHTMLPath, mainHTML) {
            test(mainHTMLPath, function() {
                var $main = $('<div>').html(mainHTML);
                checkElements($main);
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(testWCAGCompliance);
});
