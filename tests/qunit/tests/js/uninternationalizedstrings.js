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

    module("Uninternationalized Strings");

    // Attributes to test for untranslated strings
    var attrs = ['alt', 'title'];

    // The following regular expressions are used to verify that a string is an i18n key or an untranslated string
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
     * @param  {String}    input     The string to test
     * @return {Boolean}             True if the string is internationalized or a number, false otherwise
     */
     var testString = function(input) {
         return (
                    (
                        regex.test(input) ||
                        (
                            templateRegex.test(input) &&
                            !(
                                regex.test(input) ||
                                templateStartAlphaRegex.test(input) ||
                                templateEndAlphaRegex.test(input) ||
                                templateMiddleAlphaRegex.test(input)
                            )
                        )
                    ) ||
                    // Allow numbers to be non-internationalized
                    !alpha.test(input) ||
                    urlRegex.test(input) ||
                    requireRegex.test(input) ||
                    metaRegex.test(input)
                 );
     };

    /**
     * Check an element's attributes for uninternationalized strings
     *
     * @param  {jQuery}    $el    The element (and all of its children) for which to check the attributes for uninternationalized strings
     */
    var checkAttrs = function($el) {
        $.each(attrs, function(i, val) {
            if ($el.find('[' + val + ']').length) {
                // Grab any element with the attribute, and filter out any empties
                $.each($el.find('[' + val + ']').filter(function(index) {
                    if (typeof $(this).attr(val) === 'string') {
                        return $.trim($(this).attr(val)) !== '';
                    } else {
                        return false;
                    }
                }), function(j, el) {
                    var attrText = $.trim($(el).attr(val));
                    var pass = testString(attrText);
                    ok(pass, val.toUpperCase() + ' Text: ' + attrText);
                });
            } else {
                ok(true, 'No strings found in ' + val + ' text');
            }
        });
    };

    /**
     * Check an element's text for uninternationalized strings
     *
     * @param  {jQuery}    $el    The element (and all its children) to check for uninternationalized strings
     */
    var checkElements = function($el) {
        if ($el.find('*:not(:empty)').length) {
            // check all elements with no children that have text, filtering out any empties (post-trim)
            $.each($el.find('*:not(:empty)').filter(function(index) {
                return $(this).children().length === 0 && $.trim($(this).text()) !== '';
            }), function(i, el) {
                var tagText = $.trim($(el).text());
                var pass = testString(tagText);
                ok(pass, 'String: ' + tagText);
            });
        } else {
            ok(true, 'No strings found');
        }
    };

    /**
     * Initialize the Uninternationalized Strings test
     *
     * @param  {Object}   testData    The testdata containing all files to be tested (html, css, js, properties)
     */
    var uninternationalizedStringsTest = function(testData) {
        // Check widgets for uninternationalized strings
        $.each(testData.widgetData, function(i, widget) {
            test(widget.id, function() {
                var $widget = $('<div>').html(widget.html);
                checkElements($widget);
                checkAttrs($widget);
            });
        });

        // Check main HTML and macros for uninternationalized strings. A set of static files
        // is excluded from these checks
        var mainHTMLBlacklist = ['/shared/oae/errors/noscript.html', '/shared/oae/errors/maintenance.html', '/shared/oae/errors/unavailable.html'];
        $.each(testData.mainHTML, function(page, mainHTML) {
            // Ignore blacklisted pages
            if ($.inArray(page, mainHTMLBlacklist) > -1) {
                return;
            }

            // Test all other pages
            test(page, function() {
                var $main = $('<div>').html(mainHTML);
                checkElements($main);
                checkAttrs($main);
            });
        });

        // Start consuming tests again
        QUnit.start(2);
    };

    // Stop consuming QUnit test and load the widgets asynchronous
    QUnit.stop();
    util.loadTestData(uninternationalizedStringsTest);
});
