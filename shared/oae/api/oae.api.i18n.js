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

define(['exports', 'jquery', 'oae.api.config', 'oae.api.util', 'jquery.properties-parser', 'jquery.timeago', 'jquery.validate'], function(exports, $, configAPI, utilAPI) {

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

            // Add translations for the current user's language to all jQuery plugins
            // that generate strings seen by end-users
            translateJqueryPlugins();
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
            // Only parse the core bundle for the current user's language if it exists
            if (data[bundlesToLoad[1]]) {
                bundles.core[locale] = $.parseProperties(data[bundlesToLoad[1]]);
            }
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
     * Provide translations for the current user's language for all jQuery plugins
     * that generate strings seen by end-users
     *
     * @api private
     */
    var translateJqueryPlugins = function() {
        // Translate the jquery.timeago.js plugin
        $.timeago.settings.strings = {
            'prefixAgo': translate('__MSG__JQUERY_TIMEAGO_PREFIXAGO__'),
            'prefixFromNow': translate('__MSG__JQUERY_TIMEAGO_PREFIXFROMNOW__'),
            'suffixAgo': translate('__MSG__JQUERY_TIMEAGO_SUFFIXAGO__'),
            'suffixFromNow': translate('__MSG__JQUERY_TIMEAGO_SUFFIXFROMNOW__'),
            'seconds': translate('__MSG__JQUERY_TIMEAGO_SECONDS__'),
            'minute': translate('__MSG__JQUERY_TIMEAGO_MINUTE__'),
            'minutes': translate('__MSG__JQUERY_TIMEAGO_MINUTES__'),
            'hour': translate('__MSG__JQUERY_TIMEAGO_HOUR__'),
            'hours': translate('__MSG__JQUERY_TIMEAGO_HOURS__'),
            'day': translate('__MSG__JQUERY_TIMEAGO_DAY__'),
            'days': translate('__MSG__JQUERY_TIMEAGO_DAYS__'),
            'month': translate('__MSG__JQUERY_TIMEAGO_MONTH__'),
            'months': translate('__MSG__JQUERY_TIMEAGO_MONTHS__'),
            'year': translate('__MSG__JQUERY_TIMEAGO_YEAR__'),
            'years': translate('__MSG__JQUERY_TIMEAGO_YEARS__')
        };

        // Translate the jquery.validate.js plugin		
        $.validator.messages = {
            'creditcard': translate('__MSG__PLEASE_ENTER_A_VALID_CREDIT_CARD_NUMBER__'),
            'date': translate('__MSG__PLEASE_ENTER_A_VALID_DATE__'),
            'dateISO': translate('__MSG__PLEASE_ENTER_A_VALID_DATE_ISO__'),
            'digits': translate('__MSG__PLEASE_ENTER_ONLY_DIGITS__'),
            'email': translate('__MSG__PLEASE_ENTER_A_VALID_EMAIL_ADDRESS__'),
            'equalTo': translate('__MSG__PLEASE_ENTER_THE_SAME_VALUE_AGAIN__'),
            'max': 'Please enter a value less than or equal to {0}.', // func
            'maxlength': 'Please enter no more than {0} characters.', // func
            'min': 'Please enter a value greater than or equal to {0}.', // func
            'minlength': 'Please enter at least {0} characters.', // func
            'nospaces': translate('__MSG__NO_SPACES_ARE_ALLOWED__'),
            'number': translate('__MSG__PLEASE_ENTER_A_VALID_NUMBER__'),
            'prependhttp': translate('__MSG__PLEASE_PREPEND_HTTP__'),
            'range': 'Please enter a value between {0} and {1}.', // func
            'rangelength': 'Please enter a value between {0} and {1} characters long.', // func
            'remote': translate('__MSG__PLEASE_FIX_THIS_FIELD__'),
            'required': translate('__MSG__THIS_FIELD_IS_REQUIRED__'),
            'topnavigation-failed-attempt': translate('__MSG__INVALID_USERNAME_OR_PASSWORD__'),
            'url': translate('__MSG__PLEASE_ENTER_A_VALID_URL__')
        };

        console.log($.validator.messages);
        console.log('- - - - - - - - - - - - ');
    };

    /**
     * Function that will translate a string by replacing all of the internationalization key by its translated value. This
     * original string can be a single internationalization key, or can contain multiple internationalization keys. Parts of
     * the string that are not internationalization keys will remain unchanged. Internationalization keys are identified by
     * the following format: `__MSG__KEY__`
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
            if (bundles.core[locale] && bundles.core[locale][i18nkey] !== undefined) {
                return bundles.core[locale][i18nkey];
            // Check the widget's default bundle
            } else if (bundles.core['default'] && bundles.core['default'][i18nkey] !== undefined) {
                return bundles.core['default'][i18nkey];
            }
            // If the key hasn't been found, we return as is
            console.error('No translation could be found for ' + match);
            return match;
        });
        return input;
    };

});
