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

    // Variable used to cache the discussion's base URL
    var baseUrl = '/discussion/' + $.url().segment(2) + '/' + $.url().segment(3);

    // Variable used to cache the requested discussion profile
    var discussionProfile = null;

    /**
     * Set up the left hand navigation with the discussion space page structure.
     * The discussion left hand navigation item will not be shown to the user and
     * is only used to load the discussion topic
     */
    var setUpNavigation = function() {
        var lhNavPages = [{
            'id': 'discussion',
            'title': discussionProfile.displayName,
            'icon': 'fa-comments',
            'closeNav': true,
            'class': 'hide',
            'layout': [
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'discussion',
                            'settings': discussionProfile
                        }
                    ]
                },
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'comments'
                        }
                    ]
                }
            ]
        }];

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], baseUrl]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], baseUrl]);
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
            // Render the entity information
            setUpClip();
            // Set up the page
            setUpNavigation();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
            // Set up the discussion push notifications
            setUpPushNotifications();
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
     * Render the discussion clip
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#discussion-clip-template'), {
            'discussion': discussionProfile,
            'displayOptions': {
                'addLink': false
            }
        }, $('#discussion-clip-container'));
    };

    /**
     * Subscribe to discussion activity push notifications, allowing for updating the discussion profile when changes to the discussion
     * are made by a different user after the initial page load
     */
    var setUpPushNotifications = function() {
        oae.api.push.subscribe(discussionId, 'activity', discussionProfile.signature, 'internal', false, false, function(activities) {
            // The `activity` stream pushes out activities on routing so it's always
            // safe to just pick the first item from the `activities` array
            var activity = activities[0];

            var supportedActivities = ['discussion-update', 'discussion-update-visibility'];
            // Only respond to push notifications caused by other users
            if (activity.actor.id !== oae.data.me.id && _.contains(supportedActivities, activity['oae:activityType'])) {
                activity.object.canShare = discussionProfile.canShare;
                activity.object.canPost = discussionProfile.canPost;
                activity.object.isManager = discussionProfile.isManager;

                // Trigger an edit discussion event so the UI can update itself where appropriate
                $(document).trigger('oae.editdiscussion.done', activity.object);
            }
        });
    };


    ///////////////////
    // MANAGE ACCESS //
    ///////////////////

    /**
     * Create the widgetData object to send to the manageaccess widget that contains all
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
            'defaultRole': 'member',
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
     * Trigger the manageaccess widget and pass in context data
     */
    $(document).on('click', '.discussion-trigger-manageaccess', function() {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Trigger the manageaccess widget in `add members` view and pass in context data
     */
    $(document).on('click', '.discussion-trigger-manageaccess-add', function() {
        $(document).trigger('oae.trigger.manageaccess-add', getManageAccessData());
    });

    /**
     * Re-render the discussion's clip when the permissions have been updated
     */
    $(document).on('oae.manageaccess.done', setUpClip);


    /////////////////////
    // EDIT DISCUSSION //
    /////////////////////

    /**
     * Refresh the discussion topic by emptying the existing discussion topic container and
     * rendering a new one
     */
    var refreshDiscussionTopic = function() {
        // Empty the preview container
        var $widgetContainer = $('#lhnavigation-widget-discussion');
        $widgetContainer.empty();

        // Insert the new updated discussion widget
        oae.api.widget.insertWidget('discussion', null, $widgetContainer, null, discussionProfile);
    };

    /**
     * Refresh the discussion profile by updating the clips and discussion topic
     *
     * @param  {Discussion}        updatedDiscussion          Discussion profile of the updated discussion item
     */
    var refreshDiscussionProfile = function(updatedDiscussion) {
        // Cache the discussion profile data
        discussionProfile = updatedDiscussion;
        // Refresh the discussion topic
        refreshDiscussionTopic();
        // Refresh the clip
        setUpClip();
    };

    // Catch the event sent out when the discussion has been updated
    $(document).on('oae.editdiscussion.done', function(ev, updatedDiscussion) {
        refreshDiscussionProfile(updatedDiscussion);
    });

    getDiscussionProfile();

});
