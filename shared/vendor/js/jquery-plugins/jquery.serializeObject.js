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

(function($) {

    /**
     * Extend jQuery to include a serializeObject function which uses $.serializeArray to serialize a form and
     * its values and then creates an object from that array
     *
     * http://stackoverflow.com/questions/1184624/serialize-form-to-json-with-jquery
     *
     * It can be used as following:
     *
     * ```
     * var values = $(form).serializeObject();
     * ```
     *
     * @param  {Boolean}    includeEmpty    Whether or not to include fields that have an empty value
     * @return {Object}                     JSON Object where the keys represent the names of all of the form fields and the values represent their value
     */
    $.fn.serializeObject = function(includeEmpty) {
        var o = {};
        var a = this.serializeArray();
        includeEmpty = includeEmpty === false ? false : true;
        $.each(a, function() {
            // In case the field id already exist (e.g. list of checkboxes), we treat
            // it as an array
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                if (includeEmpty || $.trim(this.value) !== '') {
                    o[this.name].push(this.value || '');
                }
            } else {
                if (includeEmpty || $.trim(this.value) !== '') {
                    o[this.name] = this.value || '';
                }
            }
        });
        return o;
    };
})($);
