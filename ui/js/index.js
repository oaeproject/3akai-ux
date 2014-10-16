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
                    'text': '# Supporting academic collaboration \n A powerful new way for students and faculty to create knowledge, collaborate and connect with the world'
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
                'type': 'image',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 4,
                    'lg': 4
                },
                'settings': {
                    'minHeight': 250,
                    'url': 'http://i.telegraph.co.uk/multimedia/archive/02524/cambridge_2524373b.jpg'
                }
            },
            /*{
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
            },*/
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

    var theFoldStructure = {
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
                'type': 'image',
                'width': {
                    'xs': 12,
                    'sm': 12,
                    'md': 12,
                    'lg': 12
                },
                'settings': {
                    'minHeight': 420,
                    'url': 'https://thefold.oaeproject.org/assets/thefold/branding.jpg'
                }
            },
            {
                'type': 'text',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 6,
                    'lg': 6
                },
                'settings': {
                    'text': '# The FOLD Academic Community \n Join our online academic fashion community to collaborate with students, professionals, scholars and enthusiasts around the globe'
                }
            },
            {
                'type': 'text',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 6,
                    'lg': 6
                },
                'settings': {
                    'text': '### Street trends from Paris \n See the latest Street Trends from Paris as reported by our student correspondents!'
                }
            },
            {
                'type': 'text',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 6,
                    'lg': 6
                },
                'settings': {
                    'text': '### The Future of Fashion course \n Would you like to do your own street trend reports? Consider signing up for our free The Future of Fashion Massive Open Online Course (MOOC) to learn how.'
                }
            },
            {
                'type': 'text',
                'width': {
                    'xs': 12,
                    'sm': 6,
                    'md': 6,
                    'lg': 6
                },
                'settings': {
                    'text': '### What is Fashion? \n Check out the latest student-created video "What is Fashion?"'
                }
            }
        ]
    };

    /*{
        'type': 'image',
        'width': {
            'xs': 12,
            'sm': 6,
            'md': 4,
            'lg': 4
        },
        'settings': {
            'minHeight': 250,
            'url': 'http://i.telegraph.co.uk/multimedia/archive/02524/cambridge_2524373b.jpg'
        }
    },*/

    oae.api.util.template().render($('#index-page-template'), defaultStructure, $('#index-page-container'));

    $.each(defaultStructure.blocks, function(blockIndex, block) {
        if (block.settings && block.settings.colors && block.settings.colors.title) {
            console.log($('.index-block-' + blockIndex));
            console.log($('.index-block-' + blockIndex + ' :header'));
            $('.index-block-' + blockIndex + ' :header').css('color', block.settings.colors.title);
        }
    });

    /**
     * Set up the main search form. When the form is submitted, the user will be
     * redirected to the search page using the entered search query
     */
    //var setUpSearch = function() {
    //    $(document).on('submit', '#index-search-form', function() {
    //        var query = $.trim($('#index-search-query', $(this)).val());
    //        // Remove all hash characters from the search query. History.js expects to be in
    //        // full control of the URL hash and adding one  into the URL ourself would interfere with that
    //        // @see https://github.com/oaeproject/3akai-ux/issues/3872
    //        query = query.replace(/#/g, '');
    //        window.location = '/search/' + oae.api.util.security().encodeForURL(query);
    //        return false;
    //    });
    //};

    /**
     * Set up the product video and play it. On mobile devices the video won't automatically
     * play because of restrictions.
     */
    //var setUpProductVideo = function() {
    //    $('#index-video-launch').on('click', function() {
    //        oae.api.util.template().render($('#index-video-template'), null, $('#index-video-container'));
    //    });
    //};

    /**
     * Add binding to various elements on the index page
     */
    //var addBinding = function() {
    //    $('#index-video-launch').on('click', playProductVideo);
    //};

    //setUpSearch();
    //setUpProductVideo();

});
