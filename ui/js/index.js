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

    var defaultStructure = {
        'blocks': [
            {
                'type': 'search',
                'width': {
                    'xs': 12,
                    'sm': 12,
                    'md': 12,
                    'lg': 12
                }
            },
            {
                'type': 'video',
                'width': {
                    'xs': 12,
                    'sm': 12,
                    'md': 8,
                    'lg': 8
                },
                'settings': {
                    'minHeight': 290,
                    'placeholder': '/ui/img/index-video-bg.png',
                    'url': 'https://www.youtube.com/watch?v=cfiM87Y0pWw',
                }
            },
            {
                'type': 'text',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 4,
                    'lg': 4
                },
                'settings': {
                    'colors': {
                        'background': 'transparent',
                        'title': '#FFF',
                        'text': '#FFF'
                    },
                    'text': '# Supporting academic collaboration \n A powerful new way for students and faculty to create knowledge, collaborate and connect with the world. '
                }
            },
            {
                'type': 'iconText',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 4,
                    'lg': 4
                },
                'settings': {
                    'colors': {
                        'background': '#FFF',
                        'title': '#4D9DCF',
                        'text': '#333'
                    },
                    'icon': 'fa-pencil-square-o',
                    'text': '#### Authoring Experiences \n Rich, compelling interactive content authoring providing students and faculty with a modern content creation tool for today\'s digital world.'
                }
            },
            {
                'type': 'iconText',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 4,
                    'lg': 4
                },
                'settings': {
                    'colors': {
                        'background': '#424242',
                        'title': '#FFF',
                        'text': '#FFF'
                    },
                    'icon': 'fa-comments',
                    'text': '#### Channels of Communication \n Participating in discussions and feedback within personalized networks of resources and people, furthers learning as project teams collaborate and communicate.'
                }
            },
            {
                'type': 'iconText',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 4,
                    'lg': 4
                },
                'settings': {
                    'colors': {
                        'background': '#EFEEEB',
                        'title': '#424242',
                        'text': '#424242'
                    },
                    'icon': 'fa-cloud-download',
                    'text': '#### Access to Content \n Expanded access to learning and research materials better connects library services and resources with teaching and research within and between institutions.'
                }
            }
        ]
    };

    /**
     * Render the tenant landing page using the configured modules
     *
     * @param  {Object}         pageStructure           Object describing the responsive page structure and the configuration for all its modules
     */
    var renderPage = function(pageStructure) {
        // Render the page structure and all of its modules
        oae.api.util.template().render($('#index-page-template'), pageStructure, $('#index-page-container'));

        // As titles are hidden inside of Markdown content, apply the title color to all headers
        // after all Markdown content has been converted to HTML
        $.each(pageStructure.blocks, function(blockIndex, block) {
            if (block.settings && block.settings.colors && block.settings.colors.title) {
                $('.index-block-' + blockIndex + ' :header').css('color', block.settings.colors.title);
            }
        });

        // TODO
        repositionVideoPlay();
    };

    /**
     * Set up the search forms. When the form is submitted, the user will be
     * redirected to the search page using the entered search query
     */
    var setUpSearch = function() {
        $(document).on('submit', '.index-search-form', function() {
            var query = $.trim($('.index-search-query', $(this)).val());
            // Remove all hash characters from the search query. History.js expects to be in
            // full control of the URL hash and adding one  into the URL ourself would interfere with that
            // @see https://github.com/oaeproject/3akai-ux/issues/3872
            query = query.replace(/#/g, '');
            window.location = '/search/' + oae.api.util.security().encodeForURL(query);
            return false;
        });
    };

    /**
     * Set up the videos in the configured page structure. A video will show a placeholder image to
     * start off with, which will be replaced by the video when the play button is clicked
     */
    var setUpVideo = function() {
        $('.index-video-launch').on('click', function() {
            var $videoContainer = $(this).parent();
            var url = $(this).attr('data-url');
            if (url.indexOf('youtube') !== -1) {
                var youtubeId = $.url(url).param('v');
                url = '//www.youtube.com/embed/' + youtubeId + '?rel=0&autoplay=1&showinfo=0&modestbranding=1';
            } else {
                url = url.replace(/http[s]?:/, '');
            }


            console.log(url);
            oae.api.util.template().render($('#index-video-template'), {
                'videoURL': url
            }, $videoContainer);
            // TODO
            repositionVideoPlay();
        });
    };

    /**
     * TODO
     */
    var repositionVideoPlay = function() {
        var $videos = $('.index-block-video.index-block-video');
        if ($videos.length) {
            var visible = false;
            $videos.each(function(videoIndex, video) {
                var $video = $(video);
                var height = $video.closest('.index-row').height();
                if (height) {
                    $video.css('height', height  + 'px');
                    visible = true;
                }
            });
            if (!visible) {
                setTimeout(repositionVideoPlay, 100);
            }
        }
    };

    $(window).on('resize', repositionVideoPlay);

    renderPage(defaultStructure);
    setUpSearch();
    setUpVideo();

});
