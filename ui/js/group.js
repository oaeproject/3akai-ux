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

// TODO: Remove this once we have a better way of sharing data
var sakai_global = sakai_global || {};

require(['jquery', 'oae/api/oae.core'], function($, oae) {

    //  Get the group id from the URL. The expected URL is /group/<groupId>
    var groupId = document.location.pathname.split('/').pop();
    if (!groupId) {
        oae.api.util.redirect().redirectToLogin();
    }

    /**
     * Get the group's basic profile and set up the screen. If the groups
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getGroupdata = function() {
        oae.api.group.getGroup(groupId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().redirectTo404();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().redirectTo403();
            }

            sakai_global.group = profile;
            renderEntity();
            setUpNavigation();
            // Set the browser title
            oae.api.util.setBrowserTitle(sakai_global.group.name);
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };
    
    /**
     * Render the group's profile picture and name
     */
    var renderEntity = function() {
        oae.api.util.renderTemplate($('#oae_entity_template'), sakai_global.group, $('#oae_entity_container'));
        $('#entity_group_permissions').on('click', function() {
            $('body').trigger('init.grouppermissions.sakai');
        });
    };
    
    /**
     * Set up the left hand navigation with the provided structure
     */
    var setUpNavigation = function() {
        // Only render the left hand navigation if the group's profile
        // has already been retrieved
        if (sakai_global.group) {
            // TODO: Replace this with more effective page configuration
            var pubdata = {
                'structure0': {
                    'activity': {
                        '_order': 0,
                        '_ref': 'id52052932',
                        '_title': oae.api.i18n.translate('__MSG__RECENT_ACTIVITY__'),
                        'main': {
                            '_order': 0,
                            '_ref': 'id52052932',
                            '_title': oae.api.i18n.translate('__MSG__RECENT_ACTIVITY__')
                        }
                    },
                    'library': {
                        '_order': 1,
                        '_ref': 'id88785643',
                        '_title': oae.api.i18n.translate('__MSG__LIBRARY__'),
                        'main': {
                            '_order': 0,
                            '_ref': 'id88785643',
                            '_title': oae.api.i18n.translate('__MSG__LIBRARY__')
                        }
                    },
                    'memberships': {
                        '_order': 2,
                        '_ref': 'id1234354657',
                        '_title': oae.api.i18n.translate('__MSG__MEMBERS__'),
                        'main': {
                            '_order': 0,
                            '_ref': 'id1234354657',
                            '_title': oae.api.i18n.translate('__MSG__MEMBERS__')
                        }
                    }
                },
                'id52052932': {
                    'rows': [
                        {
                            'id': 'id6535423',
                            'columns': [
                                {
                                    'width': 1,
                                    'elements': [
                                        {
                                            'id': 'id5244321',
                                            'type': 'activity'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    'id5244321': {
                        'principalId': sakai_global.group.id
                    }
                },
                'id88785643': {
                    'rows': [
                        {
                            'id': 'id54243241',
                            'columns': [
                                {
                                    'width': 1,
                                    'elements': [
                                        {
                                            'id': 'id032184831',
                                            'type': 'library'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    'id032184831': {
                        'principalId': sakai_global.group.id,
                        'canManage': sakai_global.group.isManager
                    }
                },
                'id1234354657': {
                    'rows': [
                        {
                            'id': 'id49343902',
                            'columns': [
                                {
                                    'width': 1,
                                    'elements': [
                                        {
                                            'id': 'id7184318',
                                            'type': 'participants'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    'id7184318': {
                        'principalId': sakai_global.group.id,
                        'canManage': sakai_global.group.isManager
                    }
                }
            };
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        }
    };

    var switchViewMode = function(el) {
        $('.oae-search-listview-options .oae-action-icon').removeClass('selected');
        $(el).children('div').addClass('selected');
    };

    var setUpViewMode = function() {
        $(document).on('click', '.search_view_grid', function() {
            switchViewMode(this);
            $('.oae-list').addClass('grid');
            $('.oae-list').removeClass('expandedlist');
        });

        $(document).on('click', '.search_view_expandedlist', function() {
            switchViewMode(this);
            $('.oae-list').removeClass('grid');
            $('.oae-list').addClass('expandedlist');
        });

        $(document).on('click', '.search_view_list', function() {
            switchViewMode(this);
            $('.oae-list').removeClass('expandedlist');
            $('.oae-list').removeClass('grid');
        });

        $(document).on('click', '.oae-list-item-right', function() {
            $(this).parent().toggleClass('active');
        });
    };

    // List to the left hand navigation ready event for navigation rendering
    $(window).on('lhnav.ready', setUpNavigation);  

    getGroupdata();
    setUpViewMode();

});
