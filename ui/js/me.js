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

require(['jquery','oae/api/oae.core'], function($, oae) {

    // Redirect the user back to the landing page if he is not logged in
    if (oae.data.me.anon) {
        oae.api.util.redirect().redirectToLogin();
    }

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
            ]
        }
    };

    // TODO: Replace this with more effective page configuration
    var pubdata = {
        'structure0': {
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
            ]
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
            ]
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

    renderEntity();
    setUpNavigation();
});
