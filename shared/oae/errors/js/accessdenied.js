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

    // Set up the back button
    $('#error-back-btn').click(function(){
        parent.history.go(-2);
        return false;
    });

    if (oae.data.me.anon) {
        // Display the sign in button
        $('#error-signin-container').show();

        // Pass on the click of the error-signin button to the topnav sign in action
        $(document).on('click', '#error-signin', function() {
            $('.topnavigation-signin-action').click();
            return false;
        });
    }

});
