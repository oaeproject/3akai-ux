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

    // If the user already has a verified email address, we simply redirect them to the /me page
    if (oae.data.me.email && oae.data.me.emailVerified) {
        return oae.api.util.redirect().me();
    }

    // Verify the email address
    var token = $.url().param('token');
    oae.api.user.verifyEmail(token, function(err) {
        if (err) {
            $('#emailverification-failure').show();
            return;
        }

        // Show a confirmation message
        $('#emailverification-success').show();

        // Give the user some time to read the message and redirect them to /me
        setTimeout(oae.api.util.redirect().me, 5000);
    });
});
