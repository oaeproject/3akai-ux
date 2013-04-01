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
define(['jquery'], function($) {
    /**
     * Function that passes true/false to a provided callback function
     * based on whether the me page is available.
     *
     * Currently it does a direct call to '/api/me' instead of using the
     * oae.api.user getMe function because requiring 'oae.core' results in an
     * infinite loop of redirects.
     */
    var checkServerAvailable = function () {
        $.ajax({
            'url': '/api/me',
            'success': function() {
                document.location = '/me';
            }
        });
    };

    checkServerAvailable();
    setInterval(checkServerAvailable, 60000);
});
