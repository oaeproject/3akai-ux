/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
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

require(['jquery','oae.core'], function($, oae) {


    /////////////////////
    // ANONYMOUS USERS //
    /////////////////////

    /**
     * Set up the left hand navigation for anonymous users. For
     * these users, `index.html` is the tenant landing page,
     * which is rendered by the tenantlandingpage widget
     */
    var setUpAnonNavigation = function() {
        var lhNavPages = [{
            'id': 'content',
            'title': '__MSG__WELCOME__',
            'closeNav': true,
            'class': 'hide',
            'layout': [
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'tenantlandingpage'
                        }
                    ]
                }
            ]
        }];

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], '/']);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], '/']);
        });
    };


    /////////////////////
    // LOGGED IN USERS //
    /////////////////////

    /**
     * Set up the callbacks that handle queries from other widgets for the page context
     * and other actions that might change the page content
     */
    var setUpEventHandling = function() {

        // The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
        // to get hold of the current context (i.e. current user's profile). In the first case, a
        // `oae.context.send` event will be sent out as a broadcast to all widgets listening
        // for the context event. In the second case, a `oae.context.send.<widgetname>` event
        // will be sent out and will only be caught by that particular widget. In case the widget
        // has put in its context request before the profile was loaded, we also broadcast it
        // out straight away.
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, oae.data.me);
            } else {
                $(document).trigger('oae.context.send', oae.data.me);
            }
        });
        $(document).trigger('oae.context.send', oae.data.me);

        // Cache the updated profile picture after it has been changed
        $(document).on('oae.changepic.update', function(ev, data) {
            oae.data.me.picture = data.picture;
        });

        // Re-render the me clip when the user profile has been updated. The updated
        // user object will be passed into the event
        $(document).on('oae.editprofile.done', function(ev, data) {
            $.extend(oae.data.me, data);
            setUpClip();
        });

    };

    /**
     * Render the clips
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#me-clip-template'), {
            'displayOptions': {
                'addVisibilityIcon': false,
                'addLink': false
            }
        }, $('#me-clip-container'));
    };

    /**
     * Meeting
     */
    var setUpMeeting = function() {
        activateMeeting = oae.api.config.getValue('oae-jitsi', 'server', 'host');
        if (activateMeeting) {
            oae.api.util.template().render($('#activate-meeting-template'), {
            }, $('#activate-meeting-container'));
        }
    };

    /**
     * Set up the left hand navigation with the me space page structure
     */
    var setUpNavigation = function() {

        // Structure that will be used to construct the left hand navigation actions
        var lhNavActions = [{
            'icon': 'fa-cloud-upload',
            'title': oae.api.i18n.translate('__MSG__UPLOAD__'),
            'closeNav': true,
            'class': 'oae-trigger-upload'
        },
        {
            'icon': 'fa-plus-circle',
            'title': oae.api.i18n.translate('__MSG__CREATE__'),
            'children': [
                {
                    'icon': 'fa-group',
                    'title': oae.api.i18n.translate('__MSG__GROUP__'),
                    'closeNav': true,
                    'class': 'oae-trigger-creategroup'
                },
                {
                    'icon': 'fa-folder-open',
                    'title': oae.api.i18n.translate('__MSG__FOLDER__'),
                    'closeNav': true,
                    'class': 'oae-trigger-createfolder'
                },
                {
                    'icon': 'fa-link',
                    'title': oae.api.i18n.translate('__MSG__LINK__'),
                    'closeNav': true,
                    'class': 'oae-trigger-createlink'
                },
                {
                    'icon': 'fa-pencil-square-o',
                    'title': oae.api.i18n.translate('__MSG__DOCUMENT__'),
                    'closeNav': true,
                    'class': 'oae-trigger-createcollabdoc'
                },
                {
                    'icon': 'fa-comments',
                    'title': oae.api.i18n.translate('__MSG__DISCUSSION__'),
                    'closeNav': true,
                    'class': 'oae-trigger-creatediscussion'
                }
            ]
        }];

        // Structure that will be used to construct the left hand navigation pages
        var lhNavPages = [
            {
                'id': 'dashboard',
                'title': oae.api.i18n.translate('__MSG__RECENT_ACTIVITY__'),
                'icon': 'fa-tachometer',
                'closeNav': true,
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'activity',
                                'settings': {
                                    'context': oae.data.me,
                                    'canManage': true
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'library',
                'title': oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
                'icon': 'fa-briefcase',
                'closeNav': true,
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'contentlibrary',
                                'settings': {
                                    'context': oae.data.me,
                                    'canManage': true
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'discussions',
                'title': oae.api.i18n.translate('__MSG__MY_DISCUSSIONS__'),
                'icon': 'fa-comments',
                'closeNav': true,
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'discussionslibrary',
                                'settings': {
                                    'context': oae.data.me,
                                    'canManage': true
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'groups',
                'title': oae.api.i18n.translate('__MSG__MY_GROUPS__'),
                'icon': 'fa-group',
                'closeNav': true,
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'memberships',
                                'settings': {
                                    'context': oae.data.me,
                                    'canManage': true
                                }
                            }
                        ]
                    }
                ]
            },
            {
                'id': 'network',
                'title': oae.api.i18n.translate('__MSG__MY_NETWORK__'),
                'icon': 'fa-random',
                'closeNav': true,
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'network',
                                'settings': {
                                    'context': oae.data.me,
                                    'canManage': true
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        // If Jitsi config has a value, then display meetings on navigation and on the left hand navigation pages
        activateMeeting = oae.api.config.getValue('oae-jitsi', 'server', 'host');
        if (activateMeeting) {
            lhNavActions[1].children.push({
                'icon': 'fa-video-camera',
                'title': oae.api.i18n.translate('__MSG__MEETING__'),
                'closeNav': true,
                'class': 'oae-trigger-createmeeting-jitsi'
            });

            lhNavPages.push({
                'id': 'meetings-jitsi',
                'title': oae.api.i18n.translate('__MSG__MY_MEETINGS__'),
                'icon': 'fa-video-camera',
                'closeNav': true,
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'name': 'meetings-jitsi-library',
                                'settings': {
                                    'context': oae.data.me,
                                    'canManage': true
                                }
                            }
                        ]
                    }
                ]
            });
        }

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, '/']);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, '/']);
        });
    };

    /**
     * Show the `preferences` widget if appropriate
     */
    var showPreferences = function() {
        if (oae.api.util.url().attr('query') === 'emailpreferences') {
            $(document).trigger('oae.trigger.preferences');
        }
    };


    ////////////////////////
    // GENERAL PAGE SETUP //
    ////////////////////////

    // The basic index page varies based on whether the user
    // has logged in or not. When the user is authenticated, their personal
    // space will be loaded. When the user is anonymous, the tenant landing
    // page will be shown.

    if (oae.data.me.anon) {

        // Add classes to trigger appropriate styling changes
        $('body').addClass('oae-index-anon');
        $('.oae-main-content').addClass('oae-branding-container');

        // For anonmous users, the page is static, so all
        // we do is set up the navigation. That will load
        // the page content
        setUpAnonNavigation();

    } else {

        // For logged in users, we have to handle various events
        // that trigger updates to the page content
        setUpEventHandling();

        // Logged in users also have clips and left-hand navigation
        setUpClip();
        setUpMeeting();
        setUpNavigation();

        // Show user preferences if, e.g., it's deep-linked via the URL
        showPreferences();

    }
});
