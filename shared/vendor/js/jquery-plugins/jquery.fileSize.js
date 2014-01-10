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
     * Convert a
     *
     * http://blog.jbstrickler.com/2011/02/bytes-to-a-human-readable-string/
     *
     * It can be used as following:
     *
     * ```
     * var readableFileSize = $.fileSize(524231);
     * console.log(readableFileSize) => 524MB
     * ```
     *
     * @param  {Boolean}    includeEmpty    Whether or not to include fields that have an empty value
     * @return {Object}                     JSON Object where the keys represent the names of all of the form fields and the values represent their value
     */
     $.fn.fileSize = function(size) {
        var suffix = ["bytes", "KB", "MB", "GB", "TB", "PB"];
        var tier = 0;

        while (size >= 1024) {
            size = size / 1024;
            tier++;
        }

        return Math.round(size * 10) / 10 + " " + suffix[tier];
    };
})($);
