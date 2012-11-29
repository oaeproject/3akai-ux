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

define(['exports'], function(exports) {
    
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
    var translate = exports.translate = function(input, widgetName) {};

});