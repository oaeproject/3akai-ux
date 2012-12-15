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

    //  Get the user id from the URL. The expected URL is /user/<userId>
    var userId = document.location.pathname.split('/').pop();
    if (!userId) {
        oae.api.util.redirect().redirectToLogin();
    }

    // Redirect to /me if the requested user is the currently logged in user
    if (userId === oae.data.me.userId) {
        document.location = '/me';
    }

    // Variable used to cache the requested user's profile
    var userProfile = null;

    // TODO: Replace this with more effective page configuration
    var pubdata = {
        'structure0': {
            'library': {
                '_order': 0,
                '_ref': 'id90384303',
                '_title': oae.api.i18n.translate('__MSG__LIBRARY__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id90384303',
                    '_title': oae.api.i18n.translate('__MSG__LIBRARY__')
                }
            },
            'memberships': {
                '_order': 0,
                '_ref': 'id79683054',
                '_title': oae.api.i18n.translate('__MSG__MEMBERSHIPS__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id79683054',
                    '_title': oae.api.i18n.translate('__MSG__MEMBERSHIPS__')
                }
            }
        },
        'id90384303': {
            'rows': [
                {
                    'id': 'id4325634',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id65324322',
                                    'type': 'library'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        'id79683054': {
            'rows': [
                {
                    'id': 'id34356454',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id8571283901',
                                    'type': 'memberships'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    /**
     * Get the user's basic profile and set up the screen. If the user
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getUserProfile = function() {
        oae.api.user.getUser(userId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().redirectTo404();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().redirectTo403();
            }

            userProfile = profile;
            renderEntity();
            setUpNavigation();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * Render the user's profile picture and name
     */
    var renderEntity = function() {
        oae.api.util.renderTemplate($('#oae_entity_template'), userProfile, $('#oae_entity_container'));
    };

    /**
     * Set up the left hand navigation with the provided structure
     */
    var setUpNavigation = function() {
        // Only render the left hand navigation if the user's profile
        // has already been retrieved
        if (userProfile) {
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        }
    };

    // List to the left hand navigation ready event for navigation rendering
    $(window).on('lhnav.ready', setUpNavigation);  

    getUserProfile();

});
