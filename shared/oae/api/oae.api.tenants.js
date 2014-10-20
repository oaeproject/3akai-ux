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

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Get the list of tenants
     *
     * @param  {Function}    callback          Standard callback function
     * @param  {Object}      callback.err      Error object containing error code and error message
     */
    var getTenants = exports.getTenants = function(callback) {
        $.ajax({
            'url': '/api/tenants',
            success: function(data) {
                callback(null, data);
            },
            error: function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
