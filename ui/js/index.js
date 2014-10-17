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
                    'url': 'https://www.youtube.com/watch?v=cfiM87Y0pWw'
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
            /* {
                'type': 'image',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 4,
                    'lg': 4
                },
                'settings': {
                    'minHeight': 250,
                    'url': 'http://upload.wikimedia.org/wikipedia/commons/f/f4/Cambridge_Peterhouse_OldCourt.JPG'
                }
            }, */
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
            // TODO: Insert real video URL
            // TODO: Do HTTP/HTTPS replacements
            oae.api.util.template().render($('#index-video-template'), {
                'videoURL': '//www.youtube.com/embed/cfiM87Y0pWw?rel=0&autoplay=1&showinfo=0&modestbranding=1'
            }, $videoContainer);
        });
    };

    /**
     * Set up the product video and play it. On mobile devices the video won't automatically
     * play because of restrictions.
     */
    //var setUpProductVideo = function() {
    //    $('#index-video-launch').on('click', function() {
    //        oae.api.util.template().render($('#index-video-template'), null, $('#index-video-container'));
    //    });
    //};

    renderPage(defaultStructure);
    setUpSearch();
    setUpVideo();

});
