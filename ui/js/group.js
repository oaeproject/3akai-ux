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

require(['jquery', 'oae/api/oae.core'], function($, oae) {

    //  Get the group id from the URL. The expected URL is /group/<groupId>
    var groupId = document.location.pathname.split('/').pop();
    if (!groupId) {
        oae.api.util.redirect().redirectToLogin();
    }
    
    // Variable used to cache the requested user's profile
    var groupProfile = null;
    
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
            ]
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
            ]
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
            ]
        }
    };

    /**
     * Get the group's basic profile and set up the screen. If the groups
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getGroupProfile = function() {
        oae.api.group.getGroup(groupId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().redirectTo404();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().redirectTo403();
            }

            groupProfile = profile;
            renderEntity();
            setUpNavigation();
            // Set the browser title
            oae.api.util.setBrowserTitle(groupProfile.name);
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };
    
    /**
     * Render the group's profile picture and name
     */
    var renderEntity = function() {
        oae.api.util.renderTemplate($('#oae_entity_template'), groupProfile, $('#oae_entity_container'));
    };
    
    /**
     * Set up the left hand navigation with the provided structure
     */
    var setUpNavigation = function() {
        // Only render the left hand navigation if the group's profile
        // has already been retrieved
        if (groupProfile) {
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        }
    };

    // List to the left hand navigation ready event for navigation rendering
    $(window).on('lhnav.ready', setUpNavigation);  

    getGroupProfile();

});
