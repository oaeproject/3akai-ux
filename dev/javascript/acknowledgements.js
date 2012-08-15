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

    sakai_global.acknowledgements = function() {

        // Set the end year of the copyright statement
        var year = new Date().getFullYear();
        $('.acknowledgements_copyright_year').text(year);

        var pubdata = {
            'structure0': {
                'featured': {
                    '_ref': 'id1',
                    '_title': 'Featured',
                    '_order': 0,
                    'main': {
                        '_ref': 'id2',
                        '_order': 0,
                        '_title': 'Featured'
                    }
                },
                'ui': {
                    '_ref': 'id2',
                    '_title': 'UI Technologies',
                    '_order': 1,
                    'main': {
                        '_ref': 'id2',
                        '_order': 0,
                        '_title': 'UI Technologies'
                    }
                },
                'nakamura': {
                    '_title': 'Back-end Technologies',
                    '_ref': 'id3',
                    '_order': 2,
                    'main': {
                        '_ref': 'id3',
                        '_order': 0,
                        '_title': 'Back-end Technologies'
                    }
                }
            },
            'id1': {
                'rows': [
                    {
                        'id': 'id2414417',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [{
                                    'type': 'htmlblock',
                                    'id': 'id4'
                                }]
                            }
                        ]
                    }
                ],
                'id4': {
                    'htmlblock': {
                        'content': $('#acknowledgements_featured').html()
                    }
                }
            },
            'id2': {
                'rows': [
                    {
                        'id': 'id3562190',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [{
                                    'type': 'htmlblock',
                                    'id': 'id5'
                                }]
                            }
                        ]
                    }
                ],
                'id5': {
                    'htmlblock': {
                        'content': $('#acknowledgements_uitech').html()
                    }
                }
            },
            'id3': {
                'rows': [
                    {
                        'id': 'id6521849',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [{
                                    'type': 'htmlblock',
                                    'id': 'id6'
                                }]
                            }
                        ]
                    }
                ],
                'id6': {
                    'htmlblock': {
                        'content': $('#acknowledgements_backendtech').html()
                    }
                }
            }
        };

        var generateNav = function() {
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        };

        var renderEntity = function() {
            $(window).trigger('sakai.entity.init', ['acknowledgements']);
        };

        $(window).on('lhnav.ready', function() {
            generateNav();
        });

        $(window).on('sakai.entity.ready', function() {
            renderEntity();
        });

        generateNav();
        renderEntity();

    };

    sakai.api.Widgets.Container.registerForLoad('acknowledgements');
});
