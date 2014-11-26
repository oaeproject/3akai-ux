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
    oae.api.util.setBrowserTitle('__MSG__WELCOME__');

    /**
     * Render the configured tenant landing page
     */
    var renderLandingPage = function() {
        $.ajax({
            'url': '/api/tenant/landingPage',
            'success': function(blocks) {
                // Render the landing page structure and all of its blocks
                oae.api.util.template().render($('#index-page-template'), {'blocks': blocks}, $('#index-page-container'));

                // As titles are hidden inside of Markdown content, apply the title color to all headers
                // after all Markdown content has been converted to HTML
                $.each(blocks, function(blockIndex, block) {
                    if (block.titleColor) {
                        $('.index-block-' + blockIndex).filter(':header').css('color', block.titleColor);
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
        $(document).on('submit', '.index-search-form', function() {
            var query = $.trim($('.index-search-query', $(this)).val());
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
        $('.index-video-launch').on('click', function() {
            var $videoContainer = $(this).parent();
            var url = $(this).attr('data-url');
            // Detect YouTube videos and automatically play them when the play button is clicked
            if (url.indexOf('youtube') !== -1) {
                var youtubeId = $.url(url).param('v');
                url = '//www.youtube.com/embed/' + youtubeId + '?rel=0&autoplay=1&showinfo=0&modestbranding=1';
            // Other videos are embedded as is
            } else {
                url = url.replace(/http[s]?:/, '');
            }

            // Render the video
            oae.api.util.template().render($('#index-video-template'), {'videoURL': url}, $videoContainer);
        });
    };

    /**
     * Position the video play button to ensure that it's vertically centered within the video placeholder.
     * Because the different blocks on the same row are always equally high, there is unforunately no cross-browser
     * CSS-only solution for this
     */
    var repositionPlayVideo = function() {
        // Reposition the play button for all videos
        var $videos = $('.index-block-video');
        if ($videos.length) {
            var visible = false;
            $videos.each(function(videoIndex, video) {
                var $video = $(video);
                var height = $video.closest('.index-row').height();
                if (height) {
                    // Make the play button as high as its container, so it centers vertically
                    $video.css('height', height  + 'px');
                    // The play button is hidden initially to avoid the button from jumping
                    // when it is repositioned
                    $video.show();
                    visible = true;
                }
            });
            // If none of the videos are currently visible, the page is still in the process
            // of loading and heights cannot be calculated. Try again later
            if (!visible) {
                setTimeout(repositionPlayVideo, 100);
            }
        }
    };

    renderLandingPage();
    setUpSearch();

});
