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

    // Get the content id from the URL. The expected URL is `/content/<tenantId>/<resourceId>`.
    // The content id will then be `c:<tenantId>:<resourceId>`
    var contentId = 'c:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested content profile
    var contentProfile = null;

    /**
     * Renders the content preview.
     */
    var setUpContentPreview = function() {
        // Remove the old preview widget
        $('#content-preview-container').html('');
        // Based on the content type, insert a new preview widget and pass in the updated content profile data
        if (contentProfile.resourceSubType === 'file') {
            oae.api.widget.insertWidget('filepreview', null, $('#content-preview-container'), null, contentProfile);
        } else if (contentProfile.resourceSubType === 'link') {
            oae.api.widget.insertWidget('linkpreview', null, $('#content-preview-container'), null, contentProfile);
        } else if (contentProfile.resourceSubType === 'collabdoc') {
            oae.api.widget.insertWidget('etherpad', null, $('#content-preview-container'), null, contentProfile);
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
            setUpContentPreview();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * Refresh the content's basic profile and update widgets that need the updated information.
     *
     * @param  {Object}         ev                      jQuery event object
     * @param  {Content}        updatedContent          Content profile of the updated content item
     */
    var refreshContentProfile = function(ev, updatedContent) {
        // Cache the content profile data
        contentProfile = updatedContent;
        // Re-render the entity information
        setUpClip();
        // Show the content preview
        setUpContentPreview();
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

    // Catches an event sent out when the content has been updated. This can be either when
    // a new version has been uploaded or the preview has finished generating.
    $(document).on('oae.content.update', refreshContentProfile);

    /**
     * Render the content's clip, containing the thumbnail, display name as well as the
     * content's admin options
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#content-clip-template'), {'content': contentProfile}, $('#content-clip-container'));
    };

    getContentProfile();

});
