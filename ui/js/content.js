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

require(['jquery','oae.core'], function($, oae) {

    //  Get the content id from the URL. The expected URL is `/content/<contentId>`
    var contentId = $.url().segment(2);
    if (!contentId) {
        oae.api.util.redirect().login();
    }

    // Variable used to cache the requested content profile
    var contentProfile = null;

    /**
     * Renders the content preview.
     */
    var setUpContentProfilePreview = function() {
        // Remove the old preview widget
        $('#content_preview_container').html('');
        // Insert a new preview widget and pass in the updated content profile data
        oae.api.widget.insertWidget('contentpreview', null, $('#content_preview_container'), null, contentProfile);
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
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }

            // Cache the content profile data
            contentProfile = profile;
            // Set the browser title
            oae.api.util.setBrowserTitle(contentProfile.displayName);
            // Render the entity information
            setUpClip();
            // Show the content preview
            setUpContentProfilePreview();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * Refresh the content's basic profile and update widgets that need the updated information.
     */
    var refreshContentProfile = function() {
        oae.api.content.getContent(contentId, function(err, profile) {
            // Cache the content profile data
            contentProfile = profile;
            // Show the content preview
            setUpContentProfilePreview();
        });
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets 
     * to get hold of the current context (i.e. content profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, contentProfile);
            } else {
                $(document).trigger('oae.context.send', contentProfile);
            }
        });
        $(document).trigger('oae.context.send', contentProfile);
    };

    // Catches the `upload new version complete` event and refreshes the content profile
    $(document).on('oae.uploadnewversion.complete', refreshContentProfile);

    /**
     * Render the content's clip, containing the thumbnail, display name as well as the
     * content's admin options
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#content-clip-template'), {'content': contentProfile}, $('#content-clip-container'));
    };

    getContentProfile();

});
