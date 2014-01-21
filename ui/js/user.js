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

    // Get the user id from the URL. The expected URL is `/user/<tenantId>/<resourceId>`.
    // The user id will then be `u:<tenantId>:<resourceId>`
    var userId = 'u:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Redirect to /me if the requested user is the currently logged in user
    if (userId === oae.data.me.id) {
        window.location = '/me';
    }

    // Variable used to cache the requested user's profile
    var userProfile = null;
    // Variable used to cache the user's base URL
    var baseUrl = '/user/' + $.url().segment(2) + '/' + $.url().segment(3);

    /**
     * Get the user's basic profile and set up the screen. If the user
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getUserProfile = function() {
        oae.api.user.getUser(userId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().notfound();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().accessdenied();
            }

            // Cache the user profile data
            userProfile = profile;
            // Set the browser title
            oae.api.util.setBrowserTitle(userProfile.displayName);
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
     * to get hold of the current context (i.e. user profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, userProfile);
            } else {
                $(document).trigger('oae.context.send', userProfile);
            }
        });
        $(document).trigger('oae.context.send', userProfile);
    };

    /**
     * Render the user's clip, containing the profile picture, display name and affiliation
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#user-clip-left-template'), {'user': userProfile}, $('#user-clip-left-container'));
        oae.api.util.template().render($('#user-clip-right-template'), {'user': userProfile}, $('#user-clip-right-container'));
    };

    /**
     * Set up the left hand navigation with the user space page structure
     */
    var setUpNavigation = function() {
        // Structure that will be used to construct the left hand navigation
        var lhNavigation = [
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
                                    'context': userProfile
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
                                    'context': userProfile
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'groups',
                'title': oae.api.i18n.translate('__MSG__GROUPS__'),
                'icon': 'icon-group',
                'layout': [
                    {
                        'width': 'span12',
                        'widgets': [
                            {
                                'id': 'memberships',
                                'settings': {
                                    'context': userProfile
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'network',
                'title': oae.api.i18n.translate('__MSG__NETWORK__'),
                'icon': 'icon-random',
                'layout': [
                    {
                        'width': 'span12',
                        'widgets': [
                            {
                                'id': 'network',
                                'settings': {
                                    'context': userProfile
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


    /////////////////
    // FOLLOW USER //
    /////////////////

    /**
     * Follow the user when the `follow` button is clicked
     */
    $(document).on('click', '#user-follow', function() {
        oae.api.follow.follow(userProfile.id, function(err) {
            if (!err) {
                // Show a success notification
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__FOLLOWING_SUCCEEDED__'),
                    oae.api.i18n.translate('__MSG__FOLLOWING_YOU_ARE_NOW_FOLLOWING__', null, {
                        'displayName': userProfile.displayName
                    })
                );
                $('#user-follow-actions').hide();
            } else {
                // Show an error notification
                oae.api.util.notification(
                    oae.api.i18n.translate('__MSG__FOLLOWING_FAILED__'),
                    oae.api.i18n.translate('__MSG__FOLLOWING_COULD_NOT_FOLLOW__', null, {
                        'displayName': userProfile.displayName
                    }),
                    'error'
                );
            }
        });
    });

    getUserProfile();

});
