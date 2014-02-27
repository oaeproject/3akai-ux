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

require(['jquery', 'oae.core'], function($, oae) {

    // Get the group id from the URL. The expected URL is `/group/<tenantId>/<resourceId>`.
    // The group id will then be `g:<tenantId>:<resourceId>`
    var groupId = 'g:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested group's profile
    var groupProfile = null;
    // Variable used to cache the group's base URL
    var baseUrl = '/group/' + $.url().segment(2) + '/' + $.url().segment(3);


    //////////////////////////////////
    // GROUP PROFILE INITIALIZATION //
    //////////////////////////////////

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
            // Set up the context event exchange
            setUpContext();

            // When the current user is not a member and the group is private and joinable, we show the join screen
            if (!groupProfile.isMember && groupProfile.visibility === 'private' && groupProfile.canJoin) {
                $('#group-join-view').show();
            } else {
                // Render the navigation
                setUpNavigation();
                // Set up the group push notifications to update this group profile on the fly
                setUpPushNotifications();
            }

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

        // Only show the create and upload clips to group members
        if (groupProfile.isMember) {
            $('#group-member-actions').show();
        // Show the join clip to non-members when the group is joinable
        } else if (!groupProfile.isMember && groupProfile.canJoin) {
            $('#group-join-actions').show();
        }
    };

    /**
     * Set up the left hand navigation with the group space page structure
     */
    var setUpNavigation = function() {
        // Structure that will be used to construct the left hand navigation
        var lhNavigation = [];
        // Only show the recent activity to group members
        if (groupProfile.isMember) {
            lhNavigation.push({
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
                                    'context': groupProfile,
                                    'canManage': groupProfile.isManager
                                }
                            }
                        ]
                    }
                ]
            });
        }
        lhNavigation.push(
            {
                'id': 'library',
                'title': oae.api.i18n.translate('__MSG__LIBRARY__'),
                'icon': 'icon-briefcase',
                'layout': [
                    {
                        'width': 'span12',
                        'widgets': [
                            {
                                'id': 'contentlibrary',
                                'settings': {
                                    'context': groupProfile,
                                    'canAdd': groupProfile.isMember,
                                    'canManage': groupProfile.isManager
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'discussions',
                'title': oae.api.i18n.translate('__MSG__DISCUSSIONS__'),
                'icon': 'icon-comments',
                'layout': [
                    {
                        'width': 'span12',
                        'widgets': [
                            {
                                'id': 'discussionslibrary',
                                'settings': {
                                    'context': groupProfile,
                                    'canAdd': groupProfile.isMember,
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
                                'id': 'members',
                                'settings': {
                                    'context': groupProfile,
                                    'canManage': groupProfile.isManager
                                }
                            }
                        ]
                    }
                ]
            }
        );

        $(window).trigger('oae.trigger.lhnavigation', [lhNavigation, baseUrl]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavigation, baseUrl]);
        });
    };

    /**
     * Subscribe to group activity push notifications, allowing for updating the group profile when changes to the group
     * are made by a different user after the initial page load
     */
    var setUpPushNotifications = function() {
        oae.api.push.subscribe(groupId, 'activity', groupProfile.signature, 'internal', false, function(activity) {
            var supportedActivities = ['group-update', 'group-update-visibility'];
            // Only respond to push notifications caused by other users
            if (activity.actor.id !== oae.data.me.id && _.contains(supportedActivities, activity['oae:activityType'])) {
                activity.object.canJoin = groupProfile.canJoin;
                activity.object.isManager = groupProfile.isManager;
                activity.object.isMember = groupProfile.isMember;

                groupProfile = activity.object;
                setUpClip();
            }
        });
    };


    ///////////////////
    // MANAGE ACCESS //
    ///////////////////

    /**
     * Creates the widgetData object to send to the manageaccess widget that contains all
     * variable values needed by the widget.
     *
     * @return {Object}    The widgetData to be passed into the manageaccess widget
     * @see manageaccess#initManageAccess
     */
    var getManageAccessData = function() {
        return {
            'contextProfile': groupProfile,
            'messages': {
                'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__GROUP_ACCESS_COULD_NOT_BE_UPDATED__'),
                'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__GROUP_ACCESS_NOT_UPDATED__'),
                'accessUpdatedBody': oae.api.i18n.translate('__MSG__GROUP_ACCESS_SUCCESSFULLY_UPDATED__'),
                'accessUpdatedTitle': oae.api.i18n.translate('__MSG__GROUP_ACCESS_UPDATED__'),
                'membersTitle': oae.api.i18n.translate('__MSG__GROUP_MEMBERS__'),
                'private': oae.api.i18n.translate('__MSG__PARTICIPANTS_ONLY__'),
                'loggedin': oae.api.util.security().encodeForHTML(groupProfile.tenant.displayName),
                'public': oae.api.i18n.translate('__MSG__PUBLIC__'),
                'privateDescription': oae.api.i18n.translate('__MSG__GROUP_PRIVATE_DESCRIPTION_PRESENT__'),
                'loggedinDescription': oae.api.i18n.translate('__MSG__GROUP_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(groupProfile.tenant.displayName)}),
                'publicDescription': oae.api.i18n.translate('__MSG__GROUP_PUBLIC_DESCRIPTION_PRESENT__')
            },
            'roles': {
                'member': oae.api.i18n.translate('__MSG__MEMBER__'),
                'manager': oae.api.i18n.translate('__MSG__MANAGER__')
            },
            'api': {
                'getMembersURL': '/api/group/' + groupProfile.id + '/members',
                'setMembers': oae.api.group.updateMembers,
                'setVisibility': oae.api.group.updateGroup
            }
        };
    };

    /**
     * Triggers the manageaccess widget and passes in context data
     */
    $(document).on('click', '.group-trigger-manageaccess', function() {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Triggers the manageaccess widget in `add members` view and passes in context data
     */
    $(document).on('click', '.group-trigger-manageaccess-add', function() {
        $(document).trigger('oae.trigger.manageaccess-add', getManageAccessData());
    });

    /**
     * Re-render the group's clip when the permissions have been updated.
     */
    $(document).on('oae.manageaccess.done', function(ev) {
        setUpClip();
    });


    ////////////////////////////
    // CHANGE PROFILE PICTURE //
    ////////////////////////////

    /**
     * Cache the updated group picture after it has been changed
     */
    $(document).on('oae.changepic.update', function(ev, data) {
        groupProfile.picture = data.picture;
    });


    ////////////////
    // JOIN GROUP //
    ////////////////

    /**
     * Join the current group.
     * If successful, a notification will be displayed and the page will be reloaded after 2 seconds.
     */
    $('.group-join').on('click', function() {
        // Disable the join buttons
        $('.group-join').prop('disabled', true);

        // Join the group
        oae.api.group.joinGroup(groupProfile.id, function(err) {
            if (!err) {
                // Show a success notification
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__GROUP_JOINED__'),
                    oae.api.i18n.translate('__MSG__GROUP_JOIN_SUCCESS__')
                );

                // Reload the page after 2 seconds to re-render the group as a member
                setTimeout(function() {
                    document.location.reload();
                }, 2000);
            } else {
                // Show a failure notification
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__GROUP_JOIN_FAILED__'),
                    oae.api.i18n.translate('__MSG__GROUP_NOT_JOINED__'),
                    'error'
                );

                // Re-enable the join buttons.
                $('.group-join').prop('disabled', false);
            }
        });
    });


    ////////////////
    // EDIT GROUP //
    ////////////////

    $(document).on('oae.editgroup.done', function(ev, data) {
        groupProfile = data;
        setUpClip();
    });

    getGroupProfile();

});
