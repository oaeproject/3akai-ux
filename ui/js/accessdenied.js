/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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

require(['jquery','oae.core'], function($, oae) {

    // Set the page title
    oae.api.util.setBrowserTitle('__MSG__ACCESS_DENIED__');

    if (oae.data.me.anon) {
        // Show the sign in button if the user is not logged in
        $('#error-signin').removeClass('hide');
        // Trigger the sign in dropdown when the users clicks the sign in button
        $(document).on('click', '#error-signin', function(ev) {
            $('#topnavigation-signin').click();
            return false;
        });
    }

});
