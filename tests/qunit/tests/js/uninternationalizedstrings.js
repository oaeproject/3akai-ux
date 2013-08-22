/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
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

require(['jquery', 'oae.core', '/tests/qunit/js/util.js'], function($, oae, util) {

    module("Uninternationalized Strings");

    // attributes to test for
    var attrs = ['alt', 'title'];

    // Match keys with alphanumerical values
    var alpha = new RegExp('^(.*)[a-zA-z](.*)+$');
    // Match i18n messages (e.g. __MSG__I18N__)
    var regex = new RegExp('__MSG__(.*?)__');
    // Match `foo ${bleh} bar`
    var templateRegex = new RegExp('^(.*?)(\\$*){(.*?)}(.*?)+$');
    // Match `foo${bar}`
    var templateStartAlphaRegex = new RegExp('^([a-zA-z]+)(\\$*){(.*?)}+$');
    // Match `${foo}bar${bleh}`
    var templateMiddleAlphaRegex = new RegExp('^(\\$*){(.*?)}([a-zA-z]+)(\\$*){(.*?)}+$');
    // Match `${foo}bar`
    var templateEndAlphaRegex = new RegExp('^(\\$*){(.*?)}([a-zA-z])+$');
    // Match links, from jquery validate, modified to optionally allow (https?|ftp)://
    var urlRegex = new RegExp(/^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
    // Match require statements
    var requireRegex = new RegExp('require\((.*?)\)');
    // Match meta statements
    var metaRegex = new RegExp('meta\((.*?)\)');

    /**
     * Test a string to make sure it is not a plain-text, non-internationalized string
     *
     * @param   {String}    str     The string to test
     * @return  {Boolean}   true    If the string is internationalized or a number, false otherwise
     */
     var testString = function(str) {
         return (
                    (
                        regex.test(str) ||
                        (
                            templateRegex.test(str) &&
                            !(
                                regex.test(str) ||
                                templateStartAlphaRegex.test(str) ||
                                templateEndAlphaRegex.test(str) ||
                                templateMiddleAlphaRegex.test(str)
                            )
                        )
                    ) ||
                    // Allow numbers to be non-internationalized
                    !alpha.test(str) ||
                    urlRegex.test(str) ||
                    requireRegex.test(str) ||
                    metaRegex.test(str)
                 );
     };

    /**
     * Check the element against the global array of attributes for internationalized strings
     *
     * @param  {jQuery}    $elt    The element to check for attributes (and all its children)
     */
    var checkAttrs = function($elt) {
        $.each(attrs, function(i, val) {
            if ($elt.find('[' + val + ']').length) {
                // Grab any element with the attribute, and filter out any empties
                $.each($elt.find('[' + val + ']').filter(function(index) {
                    if (typeof $(this).attr(val) === 'string') {
                        return $.trim($(this).attr(val)) !== '';
                    } else {
                        return false;
                    }
                }), function(j, elt) {
                    var attrText = $.trim($(elt).attr(val));
                    var pass = testString(attrText);
                    ok(pass, val.toUpperCase() + ' Text: ' + attrText);
                });
            } else {
                ok(true, 'No strings found in ' + val + ' text');
            }
        });
    };

    /**
     * Check the element's text for internationalized strings
     *
     * @param  {jQuery}    $elt    The element to check (and all its children)
     */
    var checkElements = function($elt) {
        if ($elt.find('*:not(:empty)').length) {
            // check all elements with no children that have text, filtering out any empties (post-trim)
            $.each($elt.find('*:not(:empty)').filter(function(index) {
                //console.log($(this).children().length === 0 && $.trim($(this).text()) !== '');
                return $(this).children().length === 0 && $.trim($(this).text()) !== '';
            }), function(i,elt) {
                var tagText = $.trim($(elt).text());
                var pass = testString(tagText);
                ok(pass, 'String: ' + tagText);
            });
        } else {
            ok(true, 'No strings found');
        }
    };

    /**
     * Initializes the uninternationalized Strings module
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var uninternationalizedStringsTest = function(testData) {
        // Check widgets for uninternationalized strings
        $.each(testData.widgetData, function(i, widget) {
            test(widget.id, function() {
                var $div = $('<div></div>');
                $div.html(widget.html);
                checkElements($div);
                checkAttrs($div);
            });
        });

        // Check main HTML and macros for uninternationalized strings
        $.each(testData.mainHTML, function(page, mainHTML) {
            // Ignore error pages.
            if (/\/shared\/oae\/errors\//.test(page)) {
                return;
            }

            // Test all other pages.
            test(page, function() {
                var $div = $('<div></div>');
                $div.html(mainHTML);
                checkElements($div);
                checkAttrs($div);
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    
    // Load up QUnit
    QUnit.load();

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(uninternationalizedStringsTest);
});
