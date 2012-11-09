/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

require(['jquery','sakai/sakai.api.core'], function($, sakai) {

    sakai_global.search = function() {
        var worldsOrderIncrement = 3;
        var searchButton = '#form .s3d-search-button';
        var searchInput = '#form .s3d-search-inputfield';
        var searchUrl = sakai.config.URL.SEARCH_URL;
        var pubdata = {
            'structure0': {
                'all': {
                    '_ref': 'id9574379429432',
                    '_order': 0,
                    '_title': sakai.api.i18n.getValueForKey('ALL_TYPES'),
                    '_url': searchUrl,
                    'main': {
                        '_ref': 'id9574379429432',
                        '_order': 0,
                        '_title': sakai.api.i18n.getValueForKey('ALL_TYPES'),
                        '_url': searchUrl
                    }
                },
                'content': {
                    '_ref': 'id6573920372',
                    '_order': 1,
                    '_title': sakai.api.i18n.getValueForKey('CONTENT'),
                    '_url': searchUrl,
                    'main': {
                        '_ref': 'id6573920372',
                        '_order': 0,
                        '_title': sakai.api.i18n.getValueForKey('CONTENT'),
                        '_url': searchUrl
                    }
                },
                'people': {
                    '_title': sakai.api.i18n.getValueForKey('PEOPLE'),
                    '_ref': 'id49294509202',
                    '_order': 2,
                    '_url': searchUrl,
                    'main': {
                        '_ref': 'id49294509202',
                        '_order': 0,
                        '_title': sakai.api.i18n.getValueForKey('PEOPLE'),
                        '_url': searchUrl
                    }
                }
            },
            'id9574379429432': {
                'rows': [
                    {
                        'id': 'id4382631',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id8403845',
                                        'type': 'searchall'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            'id6573920372': {
                'rows': [
                    {
                        'id': 'id1813095',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id9436392',
                                        'type': 'searchcontent'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            'id49294509202': {
                'rows': [
                    {
                        'id': 'id152530',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id1187051',
                                        'type': 'searchpeople'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };

        /**
         * Generate the left hand navigation
         * @param {Boolean} success Whether the ajax call was successful
         * @param {Object} pubdata The public data, necessary to construct the left hand navigation
         */
        var generateNav = function(success, pubdata) {
            if (success) {
                $(window).trigger('lhnav.init', [pubdata, {}, {}]);
            } else {
                debug.error('search.js - Can\'t generate the left hand navigation');
            }
        };

        /**
         * Fetch the templates
         * @param {Function} callback Callback function
         */
        var fetchTemplates = function(callback) {
            sakai.api.Util.getTemplates(function(success, templates) {
                if (success) {
                    for (var c = 0; c < templates.length; c++) {
                        var category = templates[c];
                        var refId = sakai.api.Util.generateWidgetId();
                        var title = sakai.api.i18n.getValueForKey(category.titlePlural);
                        pubdata.structure0[category.id] = {
                            '_title': title,
                            '_ref': refId,
                            '_order': (c + worldsOrderIncrement),
                            '_url': searchUrl,
                            'main': {
                                '_ref': refId,
                                '_order': 0,
                                '_title': title,
                                '_url': searchUrl
                            }
                        };
                        var searchWidgetId = sakai.api.Util.generateWidgetId();
                        pubdata[refId] = {
                            'rows': [
                                {
                                    'id': sakai.api.Util.generateWidgetId(),
                                    'columns': [
                                        {
                                            'width': 1,
                                            'elements': [
                                                {
                                                    'id': searchWidgetId,
                                                    'type': 'searchgroups'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        };
                        pubdata[refId][searchWidgetId] = {
                            'category': category.id
                        };

                    }
                } else {
                    debug.error('Could not get the group templates');
                }
                if ($.isFunction(callback)) {
                    callback(success, pubdata);
                }
            });
        };

        var fireSearch = function() {
            $.bbq.pushState({
                'q': $(searchInput).val(),
                'refine': $.bbq.getState('refine')
            }, 0);
        };

        ///////////////////
        // Event binding //
        ///////////////////

        var eventBinding = function() {
            $(searchInput).on('keydown', function(ev) {
                if (ev.keyCode === 13) {
                    fireSearch();
                }
            });

            $(searchButton).on('click', function(ev) {
                fireSearch();
            });
        };

        var renderEntity = function() {
            $(window).trigger('sakai.entity.init', ['search']);
        };

        $(window).on('sakai.entity.ready', function() {
            renderEntity();
        });

        $(window).on('lhnav.ready', function() {
            fetchTemplates(generateNav);
        });

        renderEntity();
        eventBinding();

    };

    sakai.api.Widgets.Container.registerForLoad('search');
});
