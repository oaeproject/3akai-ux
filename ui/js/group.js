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
    var groupId = $.url().segment(2);
    if (!groupId) {
        oae.api.util.redirect().login();
    }

    // Variable used to cache the requested group's profile
    var groupProfile = null;
    // Variable used to cache the group's base URL
    var baseUrl = '/group/' + groupId;

    /**
     * Get the group's basic profile and set up the screen. If the group
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

            // Cache the group profile data
            groupProfile = profile;
            // Set the browser title
            oae.api.util.setBrowserTitle(groupProfile.displayName);
            // Render the entity information
            setUpClip();
            // Render the navigation
            setUpNavigation();
            // Set up the context event exchange
            setUpContext();
        });
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (i.e. group profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, groupProfile);
            } else {
                $(document).trigger('oae.context.send', groupProfile);
            }
        });
        $(document).trigger('oae.context.send', groupProfile);
    };

    /**
     * Render the group's clip, containing the profile picture, display name as well as the
     * group's admin options
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#group-clip-template'), {'group': groupProfile}, $('#group-clip-container'));

        // Only show the create and upload clips to managers
        if (groupProfile.isManager) {
            $('#group-manager-actions').show();
        // Show the viewer actions if the user is logged in, not a manager and the group is joinable
        } else if (!oae.data.me.anon && !groupProfile.isMember && groupProfile.joinable === 'yes') {
            $('#group-viewer-actions').show();
        }
    };

    /**
     * Set up the left hand navigation with the group space page structure
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
                        'width': 'span12',
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

    $('#group-viewer-actions-join button').on('click', function() {
        // Join the group
        oae.api.group.joinGroup(groupProfile.id, function(err) {
            if (!err) {
                // Show a success notification
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__GROUP_JOINED__'),
                    oae.api.i18n.translate('__MSG__GROUP_SUCCESSFULLY_JOINED__')
                );

                // Reload the page after 2 seconds to rerender the group as a member
                setTimeout(function() {
                    document.location.reload();
                }, 2000);
            } else {
                // Show a failure notification
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__GROUP_JOIN_FAILED__'),
                    oae.api.i18n.translate('__MSG__GROUP_COULD_NOT_BE_JOINED__'),
                    'error'
                );
            }
        });
    });

    /**
     * Re-render the group's clip when a new profile picture has been uploaded. The updated
     * group profile will be passed into the event
     */
    $(document).on('oae.changepic.finished', function(ev, data) {
        // TODO: Remove this once https://github.com/sakaiproject/Hilary/issues/506 is fixed
        data.isManager = groupProfile.isManager;
        data.isMember = groupProfile.isMember;

        groupProfile = data;
        setUpClip();
    });

    getGroupProfile();

});
