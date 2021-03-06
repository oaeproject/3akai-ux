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
        $rootel = $('#' + uid);

        /**
         * Obsolete for now
         * var feedbackEnabled = oae.api.config.getValue('oae-uservoice', 'general', 'enabled');
         */

        // Render the footer
        oae.api.util.template().render($('#footer-template', $rootel), {
            'instance': {
                'name': oae.api.config.getValue('oae-tenants', 'instance', 'instanceName'),
                'URL': oae.api.config.getValue('oae-tenants', 'instance', 'instanceURL')
            },
            'hostingOrganization': {
                'name': oae.api.config.getValue('oae-tenants', 'instance', 'hostingOrganization'),
                'URL': oae.api.config.getValue('oae-tenants', 'instance', 'hostingOrganizationURL')
            },
            'feedbackEnabled': false,
            'termsAndConditionsEnabled': oae.api.config.getValue('oae-principals', 'termsAndConditions', 'enabled')
        }, $('#footer-container', $rootel));

    };
});
