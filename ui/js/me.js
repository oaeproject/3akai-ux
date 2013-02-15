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

    // Redirect the user back to the landing page if he is not logged in
    if (oae.data.me.anon) {
        oae.api.util.redirect().redirectToLogin();
    }

    // Set the browser title
    oae.api.util.setBrowserTitle(oae.data.me.displayName);

    // TODO: Replace this with more effective page configuration
    var privdata = {
        'structure0': {
            'dashboard': {
                '_order': 0,
                '_ref': 'id94325454432',
                '_title': oae.api.i18n.translate('__MSG__MY_DASHBOARD__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id94325454432',
                    '_title': oae.api.i18n.translate('__MSG__MY_DASHBOARD__')
                }
            }
        },
        'id94325454432': {
            'rows': [
                {
                    'id': 'id453223',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id7646542',
                                    'type': 'activity'
                                }
                            ]
                        }
                    ]
                }
            ],
            'id7646542': {
                'principalId': oae.data.me.id
            }
        }
    };

    // TODO: Replace this with more effective page configuration
    var pubdata = {
        'structure0': {
            'profile': {
                '_order': 0,
                '_ref': 'id12940812409',
                '_title': oae.api.i18n.translate('__MSG__MY_PROFILE__'),
                'basic': {
                    '_order': 0,
                    '_ref': 'id12940812409',
                    '_title': oae.api.i18n.translate('__MSG__PROFILE_BASIC_LABEL__')
                },
                'aboutme': {
                    '_order': 0,
                    '_ref': 'id209875202349',
                    '_title': oae.api.i18n.translate('__MSG__PROFILE_ABOUTME_LABEL__')
                },
                'publiciations': {
                    '_order': 0,
                    '_ref': 'id018942094517',
                    '_title': oae.api.i18n.translate('__MSG__PROFILE_PUBLICATIONS_LABEL__')
                }
            },
            'library': {
                '_order': 0,
                '_ref': 'id7646345443',
                '_title': oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id7646345443',
                    '_title': oae.api.i18n.translate('__MSG__MY_LIBRARY__')
                }
            },
            'memberships': {
                '_order': 0,
                '_ref': 'id934093203',
                '_title': oae.api.i18n.translate('__MSG__MY_MEMBERSHIPS__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id934093203',
                    '_title': oae.api.i18n.translate('__MSG__MY_MEMBERSHIPS__')
                }
            }
        },
        'id12940812409' : {
            'rows': [
                {
                    'id': 'id87829108921',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id130841987897',
                                    'type': 'displayprofilesection'
                                }
                            ]
                        }
                    ]
                }
            ],
            'id130841987897': {
                'user': oae.data.me,
                'sectionName': 'basic'
            }
        },
        'id209875202349' : {
            'rows': [
                {
                    'id': 'id28937529847',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id2938402384',
                                    'type': 'displayprofilesection'
                                }
                            ]
                        }
                    ]
                }
            ],
            'id2938402384': {
                'user': oae.data.me,
                'sectionName': 'aboutme'
            }
        },
        'id018942094517' : {
            'rows': [
                {
                    'id': 'id9827598274983',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id98237498237492834',
                                    'type': 'displayprofilesection'
                                }
                            ]
                        }
                    ]
                }
            ],
            'id98237498237492834': {
                'user': oae.data.me,
                'sectionName': 'publications'
            }
        },
        'id7646345443': {
            'rows': [
                {
                    'id': 'id60540540432',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id6335742432',
                                    'type': 'library'
                                }
                            ]
                        }
                    ]
                }
            ],
            'id6335742432': {
                'principalId': oae.data.me.id,
                'canManage': true
            }
        },
        'id934093203': {
            'rows': [
                {
                    'id': 'id134235452',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id56436534',
                                    'type': 'memberships'
                                }
                            ]
                        }
                    ]
                }
            ],
            'id56436534': {
                'principalId': oae.data.me.id,
                'canManage': true
            }
        }
    };

    /**
     * Render the user's profile picture and name
     */
    var renderEntity = function() {
        oae.api.util.renderTemplate($('#oae_entity_template'), null, $('#oae_entity_container'));
    };

    /**
     * Set up the left hand navigation with the provided structure
     */
    var setUpNavigation = function() {
        $(window).on('lhnav.ready', function() {
            $(window).trigger('lhnav.init', [pubdata, privdata, {}]);
        });  
    };

    var switchViewMode = function(el) {
        $('.oae-search-listview-options > div:visible').removeClass('selected');
        $(el).addClass('selected');
    };

    $(document).on('click', '.search_view_grid', function() {
        switchViewMode(this);
        $('.oae-list:visible').addClass('grid');
        $('.oae-list:visible').removeClass('expandedlist');
    });

    $(document).on('click', '.search_view_expandedlist', function() {
        switchViewMode(this);
        $('.oae-list:visible').removeClass('grid');
        $('.oae-list:visible').addClass('expandedlist');
    });

    $(document).on('click', '.search_view_list', function() {
        switchViewMode(this);
        $('.oae-list:visible').removeClass('expandedlist');
        $('.oae-list:visible').removeClass('grid');
    });

    $(document).on('click', '.oae-list-item-right', function() {
        $(this).parent().toggleClass('active');
    });

    $(document).on('click', '.oae-entity-picture', function() {
        $('body').trigger('init.changepic.sakai', {'type': 'user', 'data': oae.data.me});
    });

    renderEntity();
    setUpNavigation();
});
