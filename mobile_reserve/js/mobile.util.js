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

define(['exports', 'jquery', 'oae.core'], function(exports, $, oae) {

    // Properties
    var $helper =  $('#oae-mobile-template-helper');

    /**
     * Renders the page template
     * @param {String}      url                 Path to the page template
     * @param {Function}    callback            Callback function
     */
    exports.renderPageTemplate = function(url, callback) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
                var template = document.createElement('div');
                template.innerHTML = oae.api.i18n.translate(data);
                $($helper).append(template);
                callback();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                callback(textStatus);
            }
        });
    };

});
