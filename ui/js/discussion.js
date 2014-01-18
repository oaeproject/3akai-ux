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

    // Get the discussion id from the URL. The expected URL is `/discussion/<tenantId>/<resourceId>`.
    // The discussion id will then be `d:<tenantId>:<resourceId>`
    var discussionId = 'd:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested discussion profile
    var discussionProfile = null;

    /**
     * Set up the left hand navigation with the content space page structure
     */
    var setUpNavigation = function() {
        var lhNavigation = [
            {
                'id': 'discussion',
                'default': true,
                'title': oae.api.i18n.translate('__MSG__DISCUSSION__'),
                'icon': 'icon-comments',
                'class': 'hide',
                'layout': [
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'id': 'discussion',
                                'settings': discussionProfile
                            }
                        ]
                    },
                    {
                        'width': 'col-md-12',
                        'widgets': [
                            {
                                'id': 'comments'
                            }
                        ]
                    }
                ]
            }
        ];

        if (!oae.data.me.anon) {
            lhNavigation.push({
                'icon': 'icon-comments',
                'title': oae.api.i18n.translate('__MSG__COMMENT__'),
                'trigger': 'oae.trigger.comment.focus',
                'class': 'oae-lhnavigation-border hidden-md hidden-lg'
            },
            {
                'icon': 'icon-share',
                'title': oae.api.i18n.translate('__MSG__SHARE__'),
                'trigger': 'oae.trigger.share',
                'class': 'oae-lhnavigation-border oae-trigger-share hidden-md hidden-lg',
                'data': {
                    'data-id': discussionProfile.id,
                    'data-resourcetype': discussionProfile.resourceType,
                    'data-resourcesubtype': discussionProfile.resourceSubType
                }
            });
        }

        // If the user is anonymous the discussion profile has no navigation
        var hasNav = !oae.data.me.anon;

        $(window).trigger('oae.trigger.lhnavigation', [lhNavigation, null, hasNav]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavigation, null, hasNav]);
        });
    };


    ///////////////////////////////////////
    // DISCUSSION PROFILE INITIALIZATION //
    ///////////////////////////////////////

    /**
     * Get the discussion's basic profile and set up the screen. If the discussion
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getDiscussionProfile = function() {
        oae.api.discussion.getDiscussion(discussionId, function(err, profile) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }

            // Cache the discussion profile data
            discussionProfile = profile;
            // Set the browser title
            oae.api.util.setBrowserTitle(discussionProfile.displayName);
            // Render the entity information
            setUpClips();
            // Render the navigation
            setUpNavigation();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (i.e. discussion profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, discussionProfile);
            } else {
                $(document).trigger('oae.context.send', discussionProfile);
            }
        });
        $(document).trigger('oae.context.send', discussionProfile);
    };

    /**
     * Render the discussion's clip, containing the thumbnail, display name as well as the
     * discussion's admin options. Also render the share and comment actions clips.
     */
    var setUpClips = function() {
        oae.api.util.template().render($('#discussion-clip-template'), {'discussion': discussionProfile}, $('#discussion-clip-container'));
        // Only show the actions to logged in users
        if (!oae.data.me.anon) {
            oae.api.util.template().render($('#discussion-actions-clip-template'), {'discussion': discussionProfile}, $('#discussion-actions-clip-container'));
        }
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
            'contextProfile': discussionProfile,
            'messages': {
                'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__DISCUSSION_ACCESS_COULD_NOT_BE_UPDATED__'),
                'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__DISCUSSION_ACCESS_NOT_UPDATED__'),
                'accessUpdatedBody': oae.api.i18n.translate('__MSG__DISCUSSION_ACCESS_SUCCESSFULLY_UPDATED__'),
                'accessUpdatedTitle': oae.api.i18n.translate('__MSG__DISCUSSION_ACCESS_UPDATED__'),
                'membersTitle': oae.api.i18n.translate('__MSG__SHARE_WITH__'),
                'private': oae.api.i18n.translate('__MSG__PRIVATE__'),
                'loggedin': oae.api.util.security().encodeForHTML(discussionProfile.tenant.displayName),
                'public': oae.api.i18n.translate('__MSG__PUBLIC__'),
                'privateDescription': oae.api.i18n.translate('__MSG__DISCUSSION_PRIVATE_DESCRIPTION__'),
                'loggedinDescription': oae.api.i18n.translate('__MSG__DISCUSSION_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(discussionProfile.tenant.displayName)}),
                'publicDescription': oae.api.i18n.translate('__MSG__DISCUSSION_PUBLIC_DESCRIPTION__')
            },
            'roles': {
                'member': oae.api.i18n.translate('__MSG__CAN_VIEW__'),
                'manager': oae.api.i18n.translate('__MSG__CAN_MANAGE__')
            },
            'api': {
                'getMembersURL': '/api/discussion/'+ discussionProfile.id + '/members',
                'setMembers': oae.api.discussion.updateMembers,
                'setVisibility': oae.api.discussion.updateDiscussion
            }
        };
    };

    /**
     * Triggers the manageaccess widget and passes in context data
     */
    $(document).on('click', '.discussion-trigger-manageaccess', function() {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Re-render the discussion's clip when the permissions have been updated.
     */
    $(document).on('oae.manageaccess.done', function(ev) {
        setUpClips();
    });


    /////////////////////
    // EDIT DISCUSSION //
    /////////////////////

    /**
     * Re-render the discussion's clip and topic when the title or topic have been updated.
     */
    $(document).on('oae.editdiscussion.done', function(ev, data) {
        discussionProfile = data;
        setUpClips();
        setUpTopic();
    });


    getDiscussionProfile();

});
