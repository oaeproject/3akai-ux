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

/**
 * Function that will take a date and convert it into a localized date only string, conforming with
 * the conventions for the user's current locale.
 * 
 * e.g. 2/20/2012
 * 
 * @param  {Date|Number}    date        Javascript date object or milliseconds since epoch that needs to be converted into a localized date string
 * @return {String}                     Converted localized date
 */
var transformDate = module.exports.transformDate = function(date) {};

/**
 * Function that will take a date and convert it into a localized date and time string, conforming with
 * the conventions for the user's current locale.
 * 
 * e.g. 2/20/2012 3:35 PM or Monday, February 20, 2012 3:35 PM
 * 
 * @param  {Date|Number}    date        Javascript date object or milliseconds since epoch that needs to be converted into a localized date string
 * @param  {Boolean}        useShort    Whether or not to use the short version (2/20/2012 3:35 PM) or the long version (Monday, February 20, 2012 3:35 PM). By default, the long version will be used
 * @return {String}                     Converted localized date and time
 */
var transformDateTime = module.exports.transformDateTime = function(date, useShort) {};

/**
 * Function that will take a number and convert it into a localized number with correct punctuations, 
 * conforming with the conventions for the user's current locale.
 * 
 * e.g. 10.000.000,442
 * 
 * @param  {Number}        number           Number that needs to be converted into a localized number
 * @param  {Number}        decimalPlaces    The maximum number of decimal places that should be used. If this is not provided, all of them will be returned
 * @return {String}                         Converted localized number
 */
var transformNumber = module.exports.transformNumber = function(number, decimalPlaces) {};
