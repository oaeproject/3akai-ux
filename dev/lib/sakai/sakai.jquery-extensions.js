/*
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
 */
///////////////////////////
// jQuery AJAX extention //
///////////////////////////

require(['jquery'], function(jQuery) {

/**
 * Extend jQuery to include a serializeObject function
 * which uses $.serializeArray to serialize the form
 * and then creates an object from that array
 *
 * http://stackoverflow.com/questions/1184624/serialize-form-to-json-with-jquery
 */
(function($) {
    $.fn.serializeObject = function( includeEmpty ) {
        var o = {};
        var a = this.serializeArray();
        includeEmpty = includeEmpty === false ? false : true;
        $.each(a, function() {
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
})(jQuery);

/**
 * Make caching the default behavior for $.getScript
 */
jQuery.ajaxSetup({
    'cache': true
});

/**
 * Make sure that arrays passed in as arguments are properly encoded
 */
jQuery.ajaxSettings.traditional = true;

});
