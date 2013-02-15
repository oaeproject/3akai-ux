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

define(['exports', 'jquery', 'oae.api.config', 'oae.api.util', 'jquery.properties-parser'], function(exports, $, configAPI, utilAPI) {

    // Variable that will keep track of the current user's locale
    var locale = null;
    // Variable that will cache the retrieved internationalization bundles
    var bundles = {
        'core': {},
        'widgets': {}
    };

    /**
     * Initialize all internationalization functionality by loading the core internationalization bundles
     * and translating the keys that can be found in the core HTML document.
     *
     * @param  {String}     [currentLocale]     The current user's locale. If this has not been provided, the system's default locale will be used.
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.err        Error object containing error code and message
     * @api private
     */
    var init = exports.init = function(currentLocale, callback) {
        // Set the locale to be the default one if not provided
        locale = currentLocale || configAPI.getValue('oae-principals', 'user', 'defaultLanguage');

        // If the current user's language is the debug language, we don't need to do any translations
        if (locale === 'debug') {
            return callback();
        }

        // Set the language attribute for the HTML tag
        $('html').attr('lang', locale.substr(0, 2));

        // Load the core bundles
        loadCoreBundles(function(err) {
            if (err) {
                return callback(err);
            }

            // We take the HTML from the body tag and translate this into the current user's language
            var coreHTML = $('body').html();
            var translatedHTML = translate(coreHTML);

            // We put the translated string back into the HTML. We use the old innerHTML function here because the
            // `$.html()` function will try to reload all of the JavaScript files declared in the HTML.
            $('body')[0].innerHTML = translatedHTML;
            callback();
        });
    };

    /**
     * Load the core default language bundle, as well as the core language bundle for the current user's
     * language. These bundles will be transformed into JSON objects and will be cached for use during translation
     *
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.err        Error object containing error code and message
     * @api private
     */
    var loadCoreBundles = function(callback) {
        var bundlesToLoad = ['/ui/bundles/default.properties', '/ui/bundles/' + locale + '.properties'];
        utilAPI.staticBatch(bundlesToLoad, function(err, data) {
            if (err) {
                return callback(err);
            }

            bundles.core['default'] = $.parseProperties(data[bundlesToLoad[0]]);
            bundles.core[locale] = $.parseProperties(data[bundlesToLoad[1]]);
            callback(null);
        });
    };

    /**
     * Function that will take the translation bundles for a widget and will cache them for usage by the
     * translate function
     *
     * @param  {String}     widgetName      The widget for which we have retrieved the language bundles
     * @param  {String}     defaultBundle   Content of the default translation bundle for the widget
     * @param  {String}     [localeBundle]  Content of the translation bundle for the user's locale
     * @api private
     */
    var parseWidgetBundles = exports.parseWidgetBundles = function(widgetName, defaultBundle, localeBundle) {
        bundles.widgets[widgetName] = {};
        bundles.widgets[widgetName]['default'] = $.parseProperties(defaultBundle);
        if (localeBundle) {
            bundles.widgets[widgetName][locale] = $.parseProperties(localeBundle);
        }
    };

    /**
     * Function that will translate a string by replacing all of the internationalization key by its translated value. This
     * original string can be a single internationalization key, or can contain multiple internationalization keys. Parts of
     * the string that are not internationalization keys will remain unchanged. Internationalization keys are identified by
     * the following format: __MSG__KEY__
     *
     * The translation order for the found keys is:
     *
     * - Try to find the key in the i18n bundle of the user's language for the provided widget
     * - Try to find the key in the i18n bundle of the default language for the provided widget
     * - Try to find the key in the global i18n bundle of the user's language
     * - Try to find the key in the global default i18n file
     *
     * @param  {String}     input           The text which we want to translate
     * @param  {String}     [widgetName]    Widget for which we want to use the translation bundles
     * @return {String}                     The translated text
     */
    var translate = exports.translate = function(input, widgetName) {
        // If the current user's language is the debug language, we don't need to do any translations
        if (locale === 'debug') {
            return input;
        }
        // Replace all __MSG__KEY__ instances with the appropriate translation
        input = input.replace(/__MSG__(.*?)__/gm, function(match, i18nkey) {
            if (widgetName) {
                // Check the widget's locale bundle
                if (bundles.widgets[widgetName][locale] && bundles.widgets[widgetName][locale][i18nkey]) {
                    return bundles.widgets[widgetName][locale][i18nkey];
                // Check the widget's default bundle
                } else if (bundles.widgets[widgetName]['default'] && bundles.widgets[widgetName]['default'][i18nkey]) {
                    return bundles.widgets[widgetName]['default'][i18nkey];
                }
            }
            // Check the core locale bundle
            if (bundles.core[locale] && bundles.core[locale][i18nkey]) {
                return bundles.core[locale][i18nkey];
            // Check the widget's default bundle
            } else if (bundles.core['default'] && bundles.core['default'][i18nkey]) {
                return bundles.core['default'][i18nkey];
            }
            // If the key hasn't been found, we return as is
            console.error('No translation could be found for ' + match);
            return match;
        });
        return input;
    };

});
