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

    //  Get the content id from the URL. The expected URL is `/content/<contentId>`
    var contentId = $.url().segment(2);
    if (!contentId) {
        oae.api.util.redirect().login();
    }

    // Variable used to cache the requested content profile
    var contentProfile = null;

    /**
     * Shows or keeps hidden actions for the content profile
     */
    var showActions = function() {
        // If the resourceSubType is `file` a revision can be uploaded
        if (contentProfile.resourceSubType === 'file' && contentProfile.isManager) {
            $('li .oae-trigger-uploadnewversion').show();
        }
    };

    /**
     * Get the content's basic profile and set up the screen. If the content
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getContentProfile = function() {
        oae.api.content.getContent(contentId, function(err, profile) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                    return;
                } else {
                    oae.api.util.redirect().notfound();
                    return;
                }
            }

            contentProfile = profile;

            // TODO: Remove this
            sakai_global.contentProfile = contentProfile;
            $(window).trigger('ready.content.oae');

            // Set the browser title
            oae.api.util.setBrowserTitle(contentProfile.displayName);
            // Render the entity information
            setUpClip();
            // Show or keep certain actions hidden
            showActions();

            // Insert the preview
            oae.api.widget.insertWidget('contentpreview', null, $('#content_preview_container'), null, contentProfile);

            // Set up context communication
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * The `oae.context.get` event can be sent by widgets to get hold off the current
     * context (i.e. content profile), which will be send as a `oae.context.send` event. 
     * In case the widget has put in its context request before the profile was loaded,
     * we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function() {
            $(document).trigger('oae.context.send', contentProfile);
        });
        $(document).trigger('oae.context.send', contentProfile);
    };

    /**
     * Refresh the content's basic profile and update widgets that need the updated information.
     */
    var refreshContentProfile = function() {
        oae.api.content.getContent(contentId, function(err, profile) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                    return;
                } else {
                    oae.api.util.redirect().notfound();
                    return;
                }
            }

            contentProfile = profile;

            // TODO: Remove this
            sakai_global.contentProfile = contentProfile;

            // Refresh the preview
            $('#content_preview_container').html('');
            oae.api.widget.insertWidget('contentpreview', null, $('#content_preview_container'), null, contentProfile);
        });
    };

    // Catches the `upload new version complete` event and refreshes the content profile
    $(document).on('oae-uploadnewversion-complete', refreshContentProfile);

    /**
     * Render the content's clip, containing the thumbnail, display name as well as the
     * content's admin options
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#content-clip-template'), {'content': contentProfile}, $('#content-clip-container'));
    };

    getContentProfile();

});
