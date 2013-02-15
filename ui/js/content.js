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

// TODO: Remove this once we have a better way of sharing data
var sakai_global = sakai_global || {};

require(['jquery','oae.core'], function($, oae) {

    //  Get the content id from the URL. The expected URL is /content/<groupId>
    var contentId = document.location.pathname.split('/').pop();
    if (!contentId) {
        oae.api.util.redirect().redirectToLogin();
    }

    // Variable used to cache the requested content profile
    var contentProfile = null;

    /**
     * Get the content's basic profile and set up the screen. If the content
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getContentProfile = function() {
        oae.api.content.getContent(contentId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().redirectTo404();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().redirectTo403();
            }

            contentProfile = profile;

            // TODO: Remove this
            sakai_global.contentProfile = contentProfile;
            $(window).trigger('ready.content.oae');

            // Render the entity information
            renderEntity();

            // Insert the preview
            oae.api.widget.insertWidget('contentpreview', null, $('#content_preview_container'), null, contentProfile);
            // Set the browser title
            oae.api.util.setBrowserTitle(contentProfile.displayName);
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * Render the content's profile picture and name
     */
    var renderEntity = function() {
        oae.api.util.renderTemplate($('#oae_entity_template'), contentProfile, $('#oae_entity_container'));

        // Share button.
        $('#entity_content_permissions').on('click', function() {
            $('body').trigger('init.contentpermissions.sakai', { 'content': contentProfile });
        });
    };

    getContentProfile();

});
