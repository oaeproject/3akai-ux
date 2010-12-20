/**
 *
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */

/**
 * @class l10n
 *
 * @description
 * Localisation related functions for general page content, widget
 * content and UI elements This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Language localisation
 */
sakai.api.l10n = sakai.api.l10n || {};

/**
 * Get the current logged in user's locale
 *
 * @return {String} The user's locale string in XXX format
 */
sakai.api.l10n.getUserLocale = function() {

};

sakai.api.l10n.getUserDefaultLocale = function() {
    var ret = sakai.config.defaultLanguage;
    // Get the browser language preference - IE uses userLanguage, all other browsers user language
    var locale = navigator.language ? navigator.language : navigator.userLanguage;
    if (locale) {
        var split = locale.split("-");
        if (split.length > 1) {
            split[1] = split[1].toUpperCase();
            var langs = sakai.config.Languages;
            // Loop over all the available languages - if the user's browser language preference matches
            // then set their locale to that so they don't have to set it manually
            for (var i=0,j=langs.length; i<j; i++) {
                if (langs[i].language === split[0] && langs[i].country === split[1]) {
                    ret = split[0] + "_" + split[1];
                    break;
                }
            }
        }
    }
    return ret;
};

/**
 * Parse a date string into a date object and adjust that date to the timezone
 * set by the current user.
 * @param {Object} dateString    date to parse in the format 2010-10-06T14:45:54+01:00
 */
sakai.api.l10n.parseDateString = function(dateString){
    var d = new Date();
    d.setFullYear(parseInt(dateString.substring(0,4),10));
    d.setMonth(parseInt(dateString.substring(5,7),10) - 1);
    d.setDate(parseInt(dateString.substring(8,10),10));
    d.setHours(parseInt(dateString.substring(11,13),10));
    d.setMinutes(parseInt(dateString.substring(14,16),10));
    d.setSeconds(parseInt(dateString.substring(17,19),10));
    // Localization
    if (!isNaN((parseInt(dateString.substring(19,22),10)))){
        d.setTime(d.getTime() - (parseInt(dateString.substring(19,22),10)*60*60*1000));
    }
    if (sakai.data.me.user.locale) {
        d.setTime(d.getTime() + sakai.data.me.user.locale.timezone.GMT * 60 * 60 * 1000);
    }
    return d;
};

/**
 * Function that will take in a date object and will transform that
 * date object into a date only string
 * @param {Date} date
 *  JavaScript date object that we would like to transform in a
 *  date string
 * @return {String} Localized fomatted date string
 */
sakai.api.l10n.transformDate = function(date){
    return Globalization.format(date, 'd');
};

/**
 * Function that will take in a date object and will transform that
 * date object into a time only string
 * @param {Date} date
 *  JavaScript date object that we would like to transform in a
 *  time string
 * @return {String} Localized fomatted time string
 */
sakai.api.l10n.transformTime = function(date){
    return Globalization.format(date, 't');
};

/**
 * Function that will take in a date object and will transform that
 * date object into a date and time string
 * @param {Date} date
 *  JavaScript date object that we would like to transform in a
 *  date and time string
 * @return {String} Localized fomatted date and time string
 */
sakai.api.l10n.transformDateTime = function(date){
    return Globalization.format(date, 'F');
};

/**
 * Function to transform a date into a long date time string
 * eg. Saturday, November 20, 2010 (for en_US)
 * @param {Date} date
 * @return {String} localized string
 */
sakai.api.l10n.transformDateTimeLong = function(date) {
    return Globalization.format(date, "D");
};

/**
 * Function to transform a date into a short date time string
 * eg. 11/20/2010 5:12 PM (for en_US)
 * @param {Date} date
 * @return {String} localized string
 */
sakai.api.l10n.transformDateTimeShort = function(date) {
    return Globalization.format(date, "d") + " " + Globalization.format(date, "t");
};

/**
 * Function to localize a number including decimal places
 * @param {Number} num a number
 * @param {Integer} decimalplaces the number of decimal places to use
 * @return {Number} the number formatted
 */
sakai.api.l10n.transformDecimal = function(num, decimalplaces) {
    return Globalization.format(num, "n" + decimalplaces);
};

/**
 * Function that will take in a date object and will transform that
 * date object into a GMT date object. This should always be done before
 * we try to save a date back to a file or the database. The timezone
 * we are currently in will be determined from our timezone set in the
 * personal preferences page
 * @param {Date} date
 *  JavaScript date object that we would like to transform in a
 *  GMT date object
 * @return {Date}
 *  Date object, that will have transformed the given date and time into
 *  GMT date and time
 */
sakai.api.l10ntoGMT = function(date){
    date.setHours(date.getHours() - sakai.data.me.user.locale.timezone.GMT);
    return date;
};

/**
 * Function that will take in a GMT date object and will transform that
 * date object into a local date object. This should always be done after
 * we load a date back from a file or the database. The timezone
 * we are currently in will be determined from our timezone set in the
 * personal preferences page
 * @param {Date} date
 *  JavaScript GMT date object that we would like to transform to a local date object
 * @return {Date}
 *  Date object, that will have transformed the given GMT date and time into
 *  a local date and time
 */
sakai.api.l10n.fromGMT = function(date){
    date.setHours(date.getHours() + sakai.data.me.user.locale.timezone.GMT);
    return date;
};

/**
 * Function that will take in a JavaScript Number and will transform it into
 * a localised number string that complies with decimal points and character used as separator
 * as specified in the config file
 * @param {Number} number
 * Number we want to localise (eg 10000000.442)
 * @return {String}
 * Localised string of the number given to this function (eg "10.000.000,442")
 */
sakai.api.l10n.transformNumber = function(number){
    return Globalization.format(number, "n");
};

sakai.api.l10n.getDateFormatString = function() {
    var pattern = Globalization.culture.calendar.patterns.d;
    var split = pattern.split("/");
    for (var i=0, j=split.length; i<j; i++) {
        if (split[i] === "m" || split[i] === "M") {
            split[i] = "mm";
        } else if (split[i] === "d" || split[i] === "D") {
            split[i] = "dd";
        }
    }
    return split.join("/").toUpperCase();
};
