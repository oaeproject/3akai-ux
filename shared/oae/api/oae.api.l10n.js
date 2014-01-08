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

define(['exports', 'jquery', 'underscore', 'oae.api.config', 'globalize'], function(exports, $, _, configAPI) {

    /**
     * Initialize all localization functionality by loading the correct culture file.
     *
     * @param  {String}     [locale]      The current user's locale. If this has not been provided, the system's default locale will be used.
     * @param  {Function}   callback      Standard callback function
     * @param  {Object}     callback.err  Error object containing error code and message
     * @api private
     */
    var init = exports.init = function(locale, callback) {
        // Set the locale to be the default one if not provided
        var defaultLocale = configAPI.getValue('oae-principals', 'user', 'defaultLanguage');
        locale = locale || defaultLocale;

        // If the current user's language is the debug language, we fall back to the default locale for localization
        if (locale === 'debug') {
            locale = defaultLocale;
        }

        // The globalization plugin we use expects the locale string to be in the 'en-GB',
        // rather than the 'en_GB' format
        locale = locale.replace('_', '-');

        // Load the appropriate culture file
        require(['/shared/vendor/js/l10n/cultures/globalize.culture.' + locale + '.js'], function() {
            // Do the actual initialization of the culture
            Globalize.culture(locale);
            callback();
        });
    };

    /**
     * Utility function that will make sure that a passed in date is a valid Date object. If desired, this function
     * will also adjust the date to the timezone set in the user's account preferences
     *
     * @param  {Date|Number}    date        Javascript date object or milliseconds since epoch that needs to be converted into a date
     * @param  {Boolean}        [localize]  Whether or not the date should be adjusted to the user's timezone. By default, the date will be adjusted to the user's timezone
     * @return {Date}                       Parsed date object, adjusted to the current user's timezone if desired
     * @api private
     */
    var parseDate = function(date, localize) {
        // If a millisecond since epoch has been provided, we convert it to a date
        if (_.isNumber(date)) {
            date = new Date(date);
        } else if (_.isString(date)) {
            date = new Date(parseInt(date, 10));
        }

        // Adjust the date to the user's timezone
        if (localize !== false) {
            var locale = require('oae.core').data.me.locale;
            if (locale) {
                // The offset represent the number of hours offset between GMT and the user's timezone
                var offset = locale.timezone.offset;
                date.setTime(date.getTime() + (offset * 60 * 60 * 1000));
            }
        }
        return date;
    };

    /**
     * Function that will take a date and convert it into a localized date only string, conforming with
     * the conventions for the user's current locale.
     *
     * e.g. 2/20/2012
     *
     * @param  {Date|Number}    date        Javascript date object or milliseconds since epoch that needs to be converted into a localized date string
     * @return {String}                     Converted localized date
     * @throws {Error}                      Error thrown when no date has been provided
     */
    var transformDate = exports.transformDate = function(date) {
        if (!date) {
            throw new Error('A date must be provided');
        }
        // Make sure that we are working with a valid date adjusted to the user's timezone
        date = parseDate(date);
        // Convert the date to a localized date string
        return Globalize.format(date, 'd');
    };

    /**
     * Function that will take a date and convert it into a localized date and time string, conforming with
     * the conventions for the user's current locale.
     *
     * e.g. 2/20/2012 3:35 PM or Monday, February 20, 2012 3:35 PM
     *
     * @param  {Date|Number}    date        Javascript date object or milliseconds since epoch that needs to be converted into a localized date string
     * @param  {Boolean}        useShort    Whether or not to use the short version (2/20/2012 3:35 PM) or the long version (Monday, February 20, 2012 3:35 PM). By default, the long version will be used
     * @return {String}                     Converted localized date and time
     * @throws {Error}                      Error thrown when no date has been provided
     */
    var transformDateTime = exports.transformDateTime = function(date, useShort) {
        if (!date) {
            throw new Error('A date must be provided');
        }
        // Make sure that we are working with a valid date adjusted to the user's timezone
        date = parseDate(date);
        // Convert the date to a localized date and time string
        if (useShort) {
            return Globalize.format(date, 'd') + ' ' + Globalize.format(date, 't');
        } else {
            return Globalize.format(date, 'D') + ' ' + Globalize.format(date, 't');
        }
    };

    /**
     * Function that will take a number and convert it into a localized number with correct punctuations,
     * conforming with the conventions for the user's current locale.
     *
     * e.g. 10.000.000,442
     *
     * @param  {Number}        number           Number that needs to be converted into a localized number
     * @param  {Number}        decimalPlaces    The maximum number of decimal places that should be used. If this is not provided, all of them will be returned
     * @return {String}                         Converted localized number
     * @throws {Error}                          Error thrown when no number has been provided
     */
    var transformNumber = exports.transformNumber = function(number, decimalPlaces) {
        if (!_.isNumber(number)) {
            throw new Error('A valid number must be provided');
        }
        // When a certain number of decimal places is required, we pass in n<Number of decimal places>
        return Globalize.format(number, decimalPlaces !== null ? 'n' + decimalPlaces : 'n');
    };

    /**
     * Function that will take a date and convert it into a localized time ago string.
     * The user's locale does not come into play in this since we're expressing how long ago something happened.
     *
     * @param  {Date|Number}    date        Javascript date object or milliseconds since epoch that needs to be converted into a time ago string
     * @return {String}                     Converted localized time ago string
     * @throws {Error}                      Error thrown when no date has been provided
     */
    var timeAgo = exports.timeAgo = function(date) {
        if (!date) {
            throw new Error('A date must be provided');
        }
        // Make sure that we are working with a valid date. The timeago plugin uses the browsers
        // timezone for time comparisons by relying on `new Date()` to get the current time. This
        // means that the provided date does not need to be localized to the user's timezone, as
        // it can then simply compare the current time and the date we pass in.
        date = parseDate(date, false);
        return $.timeago(date);
    };
});
