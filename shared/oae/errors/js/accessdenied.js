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

require(['jquery','oae.core'], function($, oae) {

    // Set the page title
    oae.api.util.setBrowserTitle('__MSG__ACCESS_DENIED__');

    if (oae.data.me.anon) {

        // When only a single external institutional authentication strategy (`cas`, `googleApps`, `shibboleth`)
        // is enabled, the Sign In button should send the user directly to the sign in page. Alternatively, the sign
        // in dropdown in the top navigation should be opened when clicking the Sign In button
        var enabledStrategies = oae.api.authentication.getEnabledStrategies();
        var singleInstitutionalAuth = null;
        if (_.keys(enabledStrategies).length === 1 && _.contains(['cas', 'googleApps', 'shibboleth'], _.keys(enabledStrategies)[0])) {
            singleInstitutionalAuth = _.values(enabledStrategies)[0];
        }

        // After signing in, the user should be redirected to the redirect target encoded in the URL
        var redirectUrl = $.url().param('url') || '/me';

        oae.api.util.template().render($('#error-signin-template'), {
            'singleInstitutionalAuth': singleInstitutionalAuth,
            'redirectUrl': redirectUrl
        }, $('#error-signin-container'));

        // When local authentication, any external non-institutional authentication strategies (`facebook`, `google`, `twitter`)
        // or more than 1 external institutional authentication strategies are enabled, the sign in dropdown in the top navigation
        // widget should be opened when clicking the `Sign In` button
        if (!singleInstitutionalAuth) {
            $(document).on('click', '#error-signin-dropdown', function() {
                $('#topnavigation-signin').click();
                return false;
            });
        }
    }

});
