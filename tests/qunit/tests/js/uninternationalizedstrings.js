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

require(['jquery', 'oae.core', '../js/util.js', 'qunitjs'], function($, oae, util) {

        module("Uninternationalized Strings");

        // attributes to test for
        var attrs = ['alt', 'title'];

        var alpha = new RegExp('^(.*)[a-zA-z](.*)+$');
        var regex = new RegExp('__MSG__(.*?)__');
        var templateRegex = new RegExp('^(.*?)(\\$*) {(.*?)}(.*?)+$');
        var templateMiddleAlphaRegex = new RegExp('^(\\$*) {(.*?)}([a-zA-z]+)(\\$*) {(.*?)}+$');
        var templateEndAlphaRegex = new RegExp('^(\\$*) {(.*?)}([a-zA-z])+$');
        // from jquery validate, modified to optionally allow (https?|ftp)://
        var urlRegex = new RegExp(/^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
        var requireRegex = new RegExp('require\((.*?)\)');

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
                                 templateRegex.test(str) &&
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
                         urlRegex.test(str) ||
                         requireRegex.test(str)
                     );
         };

        /**
         * Checks i18n keys from core HTML files for their presence in the default bundle
         *
         * @param {jQuery} $elt The element to check for valid translated keys (and all its children)
         */
        var checkKeys = function($elt, callback) {
            var keys = getAllKeys($elt);
            for (var i=0,j=keys.length;i<j;i++) {
                ok(sakai.api.i18n.data.defaultBundle[keys[i]], 'Default value exists for ' + keys[i]);
            }
            callback();
        };

        /**
         * Check the element against the global array of attributes for internationalized strings
         *
         * @param {jQuery} $elt The element to check for attributes (and all its children)
         */
        var checkAttrs = function($elt) {
            $.each(attrs, function(i, val) {
                // grab any element with the attribute, and filter out any empties
                $.each($elt.find('[' + val + ']').filter(function(index) {
                    if (typeof $(this).attr(val) === 'string') {
                        return $.trim($(this).attr(val)) !== '';
                    } else {
                        return false;
                    }
                }), function(j,elt) {
                    var attrText = $.trim($(elt).attr(val));
                    var pass = testString(attrText);
                    ok(pass, val.toUpperCase() + ' Text: ' + attrText);
                });
            });
        };

        /**
         * Check the element's text for internationalized strings
         *
         * @param {jQuery} $elt The element to check (and all its children)
         */
        var checkElements = function($elt) {
            // check all elements with no children that have text, filtering out any empties (post-trim)
            $.each($elt.find('*:not(:empty)').filter(function(index) {
                return $(this).children().length === 0 && $.trim($(this).text()) !== '';
            }), function(i,elt) {
                var tagText = $.trim($(elt).text());
                var pass = testString(tagText);
                ok(pass, 'String: ' + tagText);
            });
        };

        var makeUninternationalizedStringsTest = function(filename) {
            $.ajax({
                url: filename,
                success: function(data) {
                    var div = document.createElement('div');
                    div.innerHTML = data;
                    asyncTest(filename, function() {
                        checkElements($(div));
                        checkAttrs($(div));
                        //checkWidgetKeys($(div), widget, function() {
                            start();
                        //});
                    });
                }
            });
        };

        /**
         * Initializes the Uninternationalized Strings module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var uninternationalizedStringsTest = function() {

            // Test the widget HTML files
            $.each(cachedWidgets, function(i, widget) {
                if (widget.id !== 'default bundle') {
                    makeUninternationalizedStringsTest('/node_modules/oae-core/' + widget.id + '/' + widget.id + '.html');
                }
            });

            // Test the core HTML files
            var coreHTML = ['errors/accessdenied',
                            'errors/notfound',
                            'content',
                            'group',
                            'index',
                            'me',
                            'search',
                            'user'];
            $.each(coreHTML, function(ii, coreHTMLFile) {
                makeUninternationalizedStringsTest('/ui/' + coreHTMLFile + '.html');
            });
        };

        util.loadWidgets(function(widgets) {
            util.loadWidgetBundles(widgets, function(widgetBundles) {
                cachedWidgets = widgetBundles;
                uninternationalizedStringsTest();
            });
        });

        QUnit.load();

    }
);
