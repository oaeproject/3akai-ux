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

/**
 * Initialize the Youtube video. The Youtube API will call this function when the page has
 * finished downloading the JavaScript for the player API.
 */
var onYouTubeIframeAPIReady = function() {
    player = new YT.Player('index-video', {
        height: '290px',
        width: '100%',
        videoId: 'cfiM87Y0pWw',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'showinfo': 0,
            'modestbranding': 1
        },
        events: {
          'onReady': onPlayerReady
        }
    });
};

/**
 * Hide the video image and start playing the product video
 */
var playProductVideo = function() {
    $('#index-video-launch-container').hide();
    $('#index-video').show();

    // iOS doesn't support programmatic start of the video
    if (!/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
        player.playVideo();
    }
};

/**
 * Show the play button and attache the play handler. The Youtube API will call this function
 * when the video has loaded and the onReady event fires.
 */
var onPlayerReady = function() {
    $('#index-video-launch i').show(500);
    $('#index-video-launch').on('click', playProductVideo);
};

require(['jquery','oae.core', '//www.youtube.com/iframe_api'], function($, oae) {

    // Set the page title
    oae.api.util.setBrowserTitle('__MSG__WELCOME__');

    var player = null;

    /**
     * Set up the main search form. When the form is submitted, the user will be
     * redirected to the search page using the entered search query
     */
    var setUpSearch = function() {
        $(document).on('submit', '#index-search-form', function() {
            var query = $.trim($('#index-search-query', $(this)).val());
            window.location = '/search/' + oae.api.util.security().encodeForURL(query);
            return false;
        });
    };

    setUpSearch();

});
