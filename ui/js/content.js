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

require(['jquery', 'underscore', 'oae.core'], function($, _, oae) {

    // Get the content id from the URL. The expected URL is `/content/<tenantId>/<resourceId>`.
    // The content id will then be `c:<tenantId>:<resourceId>`
    var contentId = 'c:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested content profile
    var contentProfile = null;

    /**
     * Set up the left hand navigation with the content space page structure.
     * The content left hand navigation item will not be shown to the user and is only here to load the contentprofile.
     */
    var setUpNavigation = function() {
        var lhNavPages = [{
            'id': 'content',
            'title': oae.api.i18n.translate('__MSG__CONTENT__'),
            'icon': 'icon-comments',
            'class': 'hide',
            'layout': [
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'id': getPreviewWidgetId(),
                            'settings': contentProfile
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
        }];

        var lhNavActions = [];
        // If the user is logged in the comment and share functionality should be added
        if (!oae.data.me.anon) {
            lhNavActions.push({
                'icon': 'icon-comments',
                'title': oae.api.i18n.translate('__MSG__COMMENT__'),
                'class': 'comments-focus-new-comment'
            },
            {
                'icon': 'icon-share',
                'title': oae.api.i18n.translate('__MSG__SHARE__'),
                'class': 'oae-trigger-share',
                'data': {
                    'data-id': contentProfile.id,
                    'data-resourcetype': contentProfile.resourceType,
                    'data-resourcesubtype': contentProfile.resourceSubType
                }
            });
        }

        // If the user is anonymous the content profile has no navigation
        var hasNav = !oae.data.me.anon;

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, null, hasNav]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, null, hasNav]);
        });
    };


    ////////////////////////////////////
    // CONTENT PROFILE INITIALIZATION //
    ////////////////////////////////////

    /**
     * Get the content's basic profile and set up the screen. If the content
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getContentProfile = function() {
        oae.api.content.getContent(contentId, function(err, profile) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }

            // Cache the content profile data
            contentProfile = profile;
            // Set the browser title
            oae.api.util.setBrowserTitle(contentProfile.displayName);
            // Render the entity information and actions
            setUpClips();
            // Set up the page
            setUpNavigation();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
            // Setup the push notifications to update this content profile on the fly
            setUpPushNotifications();
        });
    };

    /**
     * Render the content's clip, containing the thumbnail, display name as well as the
     * content's admin options. Also render the share and comment actions clips.
     */
    var setUpClips = function() {
        oae.api.util.template().render($('#content-clip-template'), {'content': contentProfile}, $('#content-clip-container'));
        // Only show the actions to logged in users
        if (!oae.data.me.anon) {
            oae.api.util.template().render($('#content-actions-clip-template'), {'content': contentProfile}, $('#content-actions-clip-container'));
        }
    };

    /**
     * Get the name of the preview widget to use for the current piece of content
     */
    var getPreviewWidgetId = function() {
        // Based on the content type, return a content preview widget ID
        if (contentProfile.resourceSubType === 'file') {
            // Load document viewer when a PDF or Office document needs to be displayed
            if (contentProfile.previews && contentProfile.previews.pageCount) {
                return 'documentpreview';
            } else {
                return 'filepreview';
            }
        } else if (contentProfile.resourceSubType === 'link') {
            return 'linkpreview';
        } else if (contentProfile.resourceSubType === 'collabdoc') {
            return 'etherpad';
        }
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (i.e. content profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, contentProfile);
            } else {
                $(document).trigger('oae.context.send', contentProfile);
            }
        });
        $(document).trigger('oae.context.send', contentProfile);
    };

    /**
     * Subscribe to content activity push notifications, allowing for updating the content profile when changes to the content
     * are made by a different user after the initial page load
     */
    var setUpPushNotifications = function() {
        oae.api.push.subscribe(contentId, 'activity', contentProfile.signature, 'internal', false, function(activity) {
            var isSupportedUpdateActivity = _.contains(['content-update', 'content-update-visibility'], activity['oae:activityType']);
            var isSupportedPreviewActivity = _.contains(['content-revision', 'content-restored-revision', 'previews-finished'], activity['oae:activityType']);
            // Only respond to push notifications caused by other users
            if (activity.actor.id === oae.data.me.id) {
                return;
            // Content preview activities should not trigger a content profile update when the content item is a collaborative
            // document and the current user can manage the document. In this case, Etherpad will take care of the content preview
            } else if (isSupportedPreviewActivity && contentProfile.resourceSubType === 'collabdoc' && contentProfile.isManager) {
                return;
            // Trigger a content profile update
            } else if (isSupportedUpdateActivity || isSupportedPreviewActivity) {
                var contentObj = activity.object;
                contentObj.canShare = contentProfile.canShare;
                contentObj.isManager = contentProfile.isManager;

                $(document).trigger('oae.content.update', contentObj);
            }
        });
    };


    ////////////////////////
    // UPLOAD NEW VERSION //
    ////////////////////////

    /**
     * Refresh the content's basic profile and update widgets that need the updated information.
     *
     * @param  {Object}         ev                      jQuery event object
     * @param  {Content}        updatedContent          Content profile of the updated content item
     */
    var refreshContentProfile = function(ev, updatedContent) {
        // Cache the content profile data
        contentProfile = updatedContent;
        // Make sure the oae-page div is empty so the left hand nav reloads the content preview
        $('.oae-page').empty();
        // Refresh the content profile elements
        setUpNavigation();
        setUpClips();
    };

    // Catches an event sent out when the content has been updated. This can be either when
    // a new version has been uploaded or the preview has finished generating.
    $(document).on('oae.content.update', refreshContentProfile);


    ///////////////////
    // MANAGE ACCESS //
    ///////////////////

    /**
     * Returns the correct messages for the manage access widget based on
     * the resourceSubType of the content.
     */
    var getManageAccessMessages = function() {
        // Keeps track of messages to return
        var messages = {
            'membersTitle': oae.api.i18n.translate('__MSG__SHARE_WITH__'),
            'private': oae.api.i18n.translate('__MSG__PRIVATE__'),
            'loggedin': oae.api.util.security().encodeForHTML(contentProfile.tenant.displayName),
            'public': oae.api.i18n.translate('__MSG__PUBLIC__')
        };

        switch (contentProfile.resourceSubType) {
            case 'file':
                return _.extend(messages, {
                    'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__FILE_ACCESS_COULD_NOT_BE_UPDATED__'),
                    'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__FILE_ACCESS_NOT_UPDATED__'),
                    'accessUpdatedBody': oae.api.i18n.translate('__MSG__FILE_ACCESS_SUCCESSFULLY_UPDATED__'),
                    'accessUpdatedTitle': oae.api.i18n.translate('__MSG__FILE_ACCESS_UPDATED__'),
                    'privateDescription': oae.api.i18n.translate('__MSG__FILE_PRIVATE_DESCRIPTION__'),
                    'loggedinDescription': oae.api.i18n.translate('__MSG__FILE_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(contentProfile.tenant.displayName)}),
                    'publicDescription': oae.api.i18n.translate('__MSG__FILE_PUBLIC_DESCRIPTION__')
                });
            case 'link':
                return _.extend(messages, {
                    'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__LINK_ACCESS_COULD_NOT_BE_UPDATED__'),
                    'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__LINK_ACCESS_NOT_UPDATED__'),
                    'accessUpdatedBody': oae.api.i18n.translate('__MSG__LINK_ACCESS_SUCCESSFULLY_UPDATED__'),
                    'accessUpdatedTitle': oae.api.i18n.translate('__MSG__LINK_ACCESS_UPDATED__'),
                    'privateDescription': oae.api.i18n.translate('__MSG__LINK_PRIVATE_DESCRIPTION__'),
                    'loggedinDescription': oae.api.i18n.translate('__MSG__LINK_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(contentProfile.tenant.displayName)}),
                    'publicDescription': oae.api.i18n.translate('__MSG__LINK_PUBLIC_DESCRIPTION__')
                });
            case 'collabdoc':
                return _.extend(messages, {
                    'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__DOCUMENT_ACCESS_COULD_NOT_BE_UPDATED__'),
                    'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__DOCUMENT_ACCESS_NOT_UPDATED__'),
                    'accessUpdatedBody': oae.api.i18n.translate('__MSG__DOCUMENT_ACCESS_SUCCESSFULLY_UPDATED__'),
                    'accessUpdatedTitle': oae.api.i18n.translate('__MSG__DOCUMENT_ACCESS_UPDATED__'),
                    'privateDescription': oae.api.i18n.translate('__MSG__DOCUMENT_PRIVATE_DESCRIPTION__'),
                    'loggedinDescription': oae.api.i18n.translate('__MSG__DOCUMENT_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(contentProfile.tenant.displayName)}),
                    'publicDescription': oae.api.i18n.translate('__MSG__DOCUMENT_PUBLIC_DESCRIPTION__')
                });
        }
    };

    /**
     * Creates the widgetData object to send to the manageaccess widget that contains all
     * variable values needed by the widget.
     *
     * @return {Object}    The widgetData to be passed into the manageaccess widget
     * @see manageaccess#initManageAccess
     */
    var getManageAccessData = function() {
        return {
            'contextProfile': contentProfile,
            'messages': getManageAccessMessages(),
            'roles': {
                'viewer': oae.api.i18n.translate('__MSG__CAN_VIEW__'),
                'manager': oae.api.i18n.translate('__MSG__CAN_MANAGE__')
            },
            'api': {
                'getMembersURL': '/api/content/'+ contentProfile.id + '/members',
                'setMembers': oae.api.content.updateMembers,
                'setVisibility': oae.api.content.updateContent
            }
        };
    };

    /**
     * Triggers the manageaccess widget and passes in context data
     */
    $(document).on('click', '.content-trigger-manageaccess', function() {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Re-render the content's clip when the permissions have been updated.
     */
    $(document).on('oae.manageaccess.done', function(ev) {
        setUpClips();
    });


    ///////////////
    // REVISIONS //
    ///////////////

    $(document).on('oae.revisions.done', function(ev, restoredRevision, updatedContentProfile) {
        contentProfile = updatedContentProfile;
        // Refresh the content profile elements
        refreshContentProfile(ev, updatedContentProfile);
    });


    //////////////////
    // EDIT DETAILS //
    //////////////////

    /**
     * Re-render the content's clip when the details have been updated.
     * When the type of content is a link the content preview will be re-rendered as well.
     */
    $(document).on('oae.editcontent.done', function(ev, data) {
        if (contentProfile.resourceSubType === 'link') {
            refreshContentProfile(ev, data);
        } else {
            contentProfile = data;
            setUpClips();
        }
    });


    getContentProfile();

});
