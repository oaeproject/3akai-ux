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

define(['exports', 'underscore', 'oae.api.config', 'globalize'], function(exports, _, configAPI) {

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
        locale = locale || configAPI.getValue('oae-principals', 'user', 'defaultLanguage');

        // The globalization plugin we use expects the locale string to be in the 'en-GB',
        // rather than the 'en_GB' format
        locale = locale.replace('_', '-');

        // Load the appropriate culture file
        require(['/shared/vendor/js/l10n/cultures/globalize.culture.' + locale + '.js'], function() {
            // Do the actual initialization of the culture
            Globalize.culture(locale);
            callback(null);
        });
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
        // If a millisecond since epoch has been provided, we convert it to a date
        if (_.isNumber(date)) {
            date = new Date(date);
        }
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
        // If a millisecond since epoch has been provided, we convert it to a date
        if (_.isNumber(date)) {
            date = new Date(date);
        }
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
});
