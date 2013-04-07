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

require(['jquery', 'oae.core'], function($, oae) {

    //  Get the group id from the URL. The expected URL is /group/<groupId>
    var groupId = document.location.pathname.split('/')[2];
    if (!groupId) {
        oae.api.util.redirect().login();
    }

    // Variable used to cache the requested user's profile
    var groupProfile = null;
    // Variable used to cache the group's base URL
    var baseUrl = '/group/' + groupId;

    /**
     * Get the group's basic profile and set up the screen. If the groups
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getGroupProfile = function() {
        oae.api.group.getGroup(groupId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().notfound();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().accessdenied();
            }

            groupProfile = profile;
            setUpClip();
            setUpNavigation();
            // Set the browser title
            oae.api.util.setBrowserTitle(groupProfile.displayName);
        });
    };

    $(document).on('oae.context.get', function() {
        $(document).trigger('oae.context.send', groupProfile);
    });
    $(document).trigger('oae.context.send', groupProfile);

    /**
     * Render the group's clip, containing the profile picture, display name as well as the
     * group's admin options
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#group-clip-template'), {'group': groupProfile}, $('#group-clip-container'));

        // Only show the create and upload clips to managers
        if (groupProfile.isManager) {
            $('#group-actions').show();
        }
    };
    
    /**
     * Set up the left hand navigation with the me space page structure
     */
    var setUpNavigation = function() {
        // Structure that will be used to construct the left hand navigation
        var lhNavigation = [
            {
                'id': 'activity',
                'title': oae.api.i18n.translate('__MSG__RECENT_ACTIVITY__'),
                'icon': 'icon-dashboard',
                'layout': [
                    {
                        'width': 'span8',
                        'widgets': [
                            {
                                'id': 'activity',
                                'settings': {
                                    'principalId': groupProfile.id,
                                    'canManage': groupProfile.isManager
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'library',
                'title': oae.api.i18n.translate('__MSG__LIBRARY__'),
                'icon': 'icon-briefcase',
                'layout': [
                    {
                        'width': 'span12',
                        'widgets': [
                            {
                                'id': 'library',
                                'settings': {
                                    'principalId': groupProfile.id,
                                    'canManage': groupProfile.isManager
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'members',
                'title': oae.api.i18n.translate('__MSG__MEMBERS__'),
                'icon': 'icon-user',
                'layout': [
                    {
                        'width': 'span12',
                        'widgets': [
                            {
                                'id': 'participants',
                                'settings': {
                                    'principalId': groupProfile.id,
                                    'canManage': groupProfile.isManager
                                }
                            }
                        ]
                    }
                ]
            }
        ];
        $(window).trigger('oae.trigger.lhnavigation', [lhNavigation, baseUrl]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavigation, baseUrl]);
        });
    };

    getGroupProfile();

});
