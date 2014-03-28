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

require(['jquery','oae.core'], function($, oae) {

    // Redirect the user back to the landing page if he is not logged in
    if (oae.data.me.anon) {
        oae.api.util.redirect().login();
    }

    // Variable used to cache the current page's base URL
    var baseUrl = '/me';

    // Set the browser title
    oae.api.util.setBrowserTitle(oae.data.me.displayName);

    // Structure that will be used to construct the left hand navigation actions
    var lhNavActions = [{
        'icon': 'icon-cloud-upload',
        'title': oae.api.i18n.translate('__MSG__UPLOAD__'),
        'closeNav': true,
        'class': 'oae-trigger-upload'
    },
    {
        'icon': 'icon-plus-sign',
        'title': oae.api.i18n.translate('__MSG__CREATE__'),
        'children': [
            {
                'icon': 'icon-group',
                'title': oae.api.i18n.translate('__MSG__GROUP__'),
                'closeNav': true,
                'class': 'oae-trigger-creategroup'
            },
            {
                'icon': 'icon-link',
                'title': oae.api.i18n.translate('__MSG__LINK__'),
                'closeNav': true,
                'class': 'oae-trigger-createlink'
            },
            {
                'icon': 'icon-edit',
                'title': oae.api.i18n.translate('__MSG__DOCUMENT__'),
                'closeNav': true,
                'class': 'oae-trigger-createcollabdoc'
            },
            {
                'icon': 'icon-comments',
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
            'icon': 'icon-dashboard',
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
            'icon': 'icon-briefcase',
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
            'icon': 'icon-comments',
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
            'icon': 'icon-group',
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
            'icon': 'icon-random',
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

    /**
     * Set up the left hand navigation with the me space page structure
     */
    var setUpNavigation = function() {
        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, baseUrl]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, baseUrl]);
        });
    };

    /**
     * Render the user's clip, containing the profile picture, display name as well as the
     * user's admin options
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#me-clip-template'), null, $('#me-clip-container'));
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (i.e. current user's profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    $(document).on('oae.context.get', function(ev, widgetId) {
        if (widgetId) {
            $(document).trigger('oae.context.send.' + widgetId, oae.data.me);
        } else {
            $(document).trigger('oae.context.send', oae.data.me);
        }
    });
    $(document).trigger('oae.context.send', oae.data.me);


    ////////////////////////////
    // CHANGE PROFILE PICTURE //
    ////////////////////////////

    /**
     * Cache the updated profile picture after it has been changed
     */
    $(document).on('oae.changepic.update', function(ev, data) {
        oae.data.me.picture = data.picture;
    });


    //////////////////
    // EDIT PROFILE //
    //////////////////

    /**
     * Re-render the me clip when the user profile has been updated. The updated
     * me object will be passed into the event
     */
    $(document).on('oae.editprofile.done', function(ev, data) {
        oae.data.me = data;
        setUpClip();
    });


    setUpClip();
    setUpNavigation();

});
