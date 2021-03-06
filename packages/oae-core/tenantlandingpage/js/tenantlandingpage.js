/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
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

    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        /**
         * Render the configured tenant landing page
         *
         * An unconfigured tenant landing page will use the following i18n keys:
         *
         *  - __MSG__SUPPORTING_ACADEMIC_COLLABORATION__
         *  - __MSG__A_POWERFULL_NEW_WAY_FOR_STUDENTS_AND_FACULTY_TO_CREATE_KNOWLEDGE_COLLABORATE_AND_CONNECT_WITH_THE_WORLD__
         *  - __MSG__AUTHORING_EXPERIENCE__
         *  - __MSG__RICH_COMPELLING_INTERACTIVE_CONTENT_AUTHORING__
         *  - __MSG__CHANNELS_OF_COMMUNICATION__
         *  - __MSG__PARTICIPATING_IN_DISCUSSIONS_AND_FEEDBACK_WITHIN_PERSONALIZED_NETWORKS__
         *  - __MSG__ACCESS_TO_CONTENT__
         *  - __MSG__EXPANDED_ACCESS_TO_LEARNING_AND_RESEARCH_MATERIALS_BETTER_CONNECTS_LIBRARY_SERVICES__
         *
         * We need to explicitly mention them here to prevent QUnit test failures on unused keys
         */
        var renderLandingPage = function() {
            $.ajax({
                'url': '/api/tenant/landingPage',
                'success': function(blocks) {
                    // Replace all instances of ${tenantDisplayName} in block
                    // text with the HTML-encoded display name of the current
                    // tenant
                    var encodedDisplayName = oae.api.util.security().encodeForHTML(oae.data.me.tenant.displayName);
                    $.each(blocks, function(blockIndex, block) {
                        if (!_.isString(block.text)) {
                            return;
                        }

                        block.text = block.text.replace(/\$\{tenantDisplayName\}/g, encodedDisplayName);
                    });

                    // Render the landing page structure and all of its blocks
                    oae.api.util.template().render($('#tenantlandingpage-template', $rootel), {'blocks': blocks}, $('.tenantlandingpage-widget', $rootel));

                    // As titles are hidden inside of Markdown content, apply the title color to all headers
                    // after all Markdown content has been converted to HTML
                    $.each(blocks, function(blockIndex, block) {
                        if (block.titleColor) {
                            $('.tenantlandingpage-block-' + blockIndex, $rootel).find(':header').css('color', block.titleColor);
                        }
                    });

                    // Set up the video players
                    setUpVideo();
                }
            });
        };

        /**
         * Set up the search forms. When the form is submitted, the user will be
         * redirected to the search page using the entered search query
         */
        var setUpSearch = function() {
            $rootel.on('submit', '.tenantlandingpage-search-form', function() {
                var query = $.trim($('.tenantlandingpage-search-query', $(this)).val());
                // Remove all hash characters from the search query. History.js expects to be in
                // full control of the URL hash and adding one into the URL ourself would interfere with that
                // @see https://github.com/oaeproject/3akai-ux/issues/3872
                query = query.replace(/#/g, '');
                window.location = '/search/' + oae.api.util.security().encodeForURL(query);
                return false;
            });
        };

        /**
         * Set up the videos in the configured page structure. A video will initially show a placeholder
         * image, which will be replaced by the actual video when the play button is clicked
         */
        var setUpVideo = function() {
            // Ensure that the play icon is correctly positioned at all times
            repositionPlayVideo();
            $(window).on('resize', repositionPlayVideo);

            // Replace the placeholder image with the actual video when the play button is clicked
            $('.tenantlandingpage-video-launch', $rootel).on('click', function() {
                var $videoContainer = $(this).parent();
                var url = $(this).attr('data-url');
                // Detect YouTube videos and automatically play them when the play button is clicked
                if (url.indexOf('youtube') !== -1) {
                    var youtubeId = oae.api.util.url(url).param('v');
                    url = '//www.youtube.com/embed/' + youtubeId + '?rel=0&autoplay=1&showinfo=0&modestbranding=1';
                // Other videos are embedded as is
                } else {
                    url = url.replace(/http[s]?:/, '');
                }

                // Render the video
                oae.api.util.template().render($('#tenantlandingpage-video-template', $rootel), {'videoURL': url}, $videoContainer);
            });
        };

        /**
         * Position the video play button to ensure that it's vertically centered within the video placeholder.
         * Because the different blocks on the same row are always equally high, there is unforunately no cross-browser
         * CSS-only solution for this
         */
        var repositionPlayVideo = function() {
            // Reposition the play button for all videos
            $('.tenantlandingpage-block-video', $rootel).each(function(videoIndex, video) {
                var $video = $(video);
                var height = $video.closest('.tenantlandingpage-row').height();
                if (height) {
                    // Make the play button as high as its container, so it centers vertically
                    $video.css('height', height  + 'px');
                    // The play button is hidden initially to avoid the button from jumping
                    // when it is repositioned
                    $video.show();
                }
            });
        };

        renderLandingPage();
        setUpSearch();

    };
});
