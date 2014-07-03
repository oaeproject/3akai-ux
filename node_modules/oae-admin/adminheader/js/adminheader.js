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

define(['jquery', 'oae.core'], function($, oae) {

    return function(uid) {

        // The widget container
        var $rootel = $('#' + uid);

        /**
         * Render the administration UI header
         *
         * @param  {Tenant}    currentContext    Tenant object representing the tenant for which the administration UI is currently being shown
         */
        var renderAdminHeader = function(currentContext) {
            oae.api.util.template().render($('#adminheader-template', $rootel), {
                'context': currentContext
            }, $('#adminheader-container', $rootel));
        };

        /**
         * Initialize the adminheader widget
         */
        var setUpAdminHeader = function() {
            $(document).on('oae.context.send.adminheader', function(ev, data) {
                renderAdminHeader(data.currentContext);
            });

            $(document).trigger('oae.context.get', 'adminheader');
        };

        setUpAdminHeader();
    };
});
