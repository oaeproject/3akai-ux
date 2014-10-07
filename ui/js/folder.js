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

    // Get the folder id from the URL. The expected URL is `/folder/<tenantId>/<resourceId>`.
    // The folder id will then be `f:<tenantId>:<resourceId>`
    var folderId = 'f:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the folder's base URL
    var baseUrl = '/folder/' + $.url().segment(2) + '/' + $.url().segment(3);

    // Variable used to cache the requested folder profile
    var folderProfile = null;

    // Variable used to cache the visibility of the folder profile
    var visibility = null;

    /**
     * Set up the left hand navigation with the folder space page structure.
     * The folder left hand navigation item will not be shown to the user and
     * is only used to load the correct content preview widget
     */
    var setUpNavigation = function() {
        var lhNavActions = [];

        if (folderProfile.canAddItem) {
            lhNavActions.push({
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
                    }
                ]
            });
        }

        var lhNavPages = [{
            'id': 'folder',
            'title': folderProfile.displayName,
            'icon': 'fa-folder-open',
            'closeNav': true,
            'class': 'hide',
            'layout': [
                {
                    'width': 'col-md-12',
                    'widgets': [
                        {
                            'name': 'folderlibrary',
                            'settings': {
                                'context': folderProfile,
                                'canManage': folderProfile.canManage
                            }
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

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, baseUrl]);
        $(window).on('oae.ready.lhnavigation', function() {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, lhNavActions, baseUrl]);
        });
    };


    ///////////////////////////////////
    // FOLDER PROFILE INITIALIZATION //
    ///////////////////////////////////

    /**
     * Get the folder's basic profile and set up the screen. If the folder
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getFolderProfile = function() {
        oae.api.folder.getFolder(folderId, function(err, profile) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }

            // Cache the folder profile data
            folderProfile = profile;

            // Cache the visibility of the folder to allow changes to the visibility to be detected
            visibility = folderProfile.visibility;

            // Render the entity information and actions
            setUpClips();
            // Set up the page
            setUpNavigation();
            // Set up the context event exchange
            setUpContext();
            // We can now unhide the page
            oae.api.util.showPage();
            // Setup the push notifications to update the folder on the fly
            setUpPushNotifications();
        });
    };

    /**
     * Render the folder's clips
     */
    var setUpClips = function() {
        oae.api.util.template().render($('#folder-clip-template'), {
            'folder': folderProfile,
            'displayOptions': {
                'addLink': false
            }
        }, $('#folder-clip-container'));
        // Only show the upload and create clips to users that are able to add items to the folder
        if (folderProfile.canAddItem) {
            $('#folder-manager-actions').show();
        // Hide the left hand navigation toggle from the folderlibrary widget when the user is not able
        // to add items to the current folder
        } else {
            $('html').addClass('folder-non-manager');
        }
    };

    /**
     * The `oae.context.get` or `oae.context.get.<widgetname>` event can be sent by widgets
     * to get hold of the current context (i.e. folder profile). In the first case, a
     * `oae.context.send` event will be sent out as a broadcast to all widgets listening
     * for the context event. In the second case, a `oae.context.send.<widgetname>` event
     * will be sent out and will only be caught by that particular widget. In case the widget
     * has put in its context request before the profile was loaded, we also broadcast it out straight away.
     */
    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, folderProfile);
            } else {
                $(document).trigger('oae.context.send', folderProfile);
            }
        });
        $(document).trigger('oae.context.send', folderProfile);
    };

    /**
     * Subscribe to folder activity push notifications, allowing for updating the folder when changes to the folder
     * are made by a different user after the initial page load
     */
    var setUpPushNotifications = function() {
        oae.api.push.subscribe(folderId, 'activity', folderProfile.signature, 'internal', false, false, function(activities) {
            // The `activity` stream pushes out activities on routing so it's always
            // safe to just pick the first item from the `activities` array
            var activity = activities[0];

            var supportedActivities = ['folder-update', 'folder-update-visibility'];
            // Only respond to push notifications caused by other users
            if (activity.actor.id !== oae.data.me.id && _.contains(supportedActivities, activity['oae:activityType'])) {
                var folderObj = activity.object;
                folderObj.canAddItem = folderProfile.canAddItem;
                folderObj.canManage = folderProfile.canManage;
                folderObj.canShare = folderProfile.canShare;

                // Cache the updated content profile
                folderProfile = folderObj;

                // Re-render the clips
                setUpClips();
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
            'contextProfile': folderProfile,
            'messages': {
                'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__FOLDER_ACCESS_COULD_NOT_BE_UPDATED__'),
                'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__FOLDER_ACCESS_NOT_UPDATED__'),
                'accessUpdatedBody': oae.api.i18n.translate('__MSG__FOLDER_ACCESS_SUCCESSFULLY_UPDATED__'),
                'accessUpdatedTitle': oae.api.i18n.translate('__MSG__FOLDER_ACCESS_UPDATED__'),
                'membersTitle': oae.api.i18n.translate('__MSG__SHARE_WITH__'),
                'private': oae.api.i18n.translate('__MSG__PRIVATE__'),
                'loggedin': oae.api.util.security().encodeForHTML(folderProfile.tenant.displayName),
                'public': oae.api.i18n.translate('__MSG__PUBLIC__'),
                'privateDescription': oae.api.i18n.translate('__MSG__FOLDER_PRIVATE_DESCRIPTION__'),
                'loggedinDescription': oae.api.i18n.translate('__MSG__FOLDER_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(folderProfile.tenant.displayName)}),
                'publicDescription': oae.api.i18n.translate('__MSG__FOLDER_PUBLIC_DESCRIPTION__')
            },
            'defaultRole': 'viewer',
            'roles': {
                'viewer': oae.api.i18n.translate('__MSG__CAN_VIEW__'),
                'manager': oae.api.i18n.translate('__MSG__CAN_MANAGE__')
            },
            'api': {
                'getMembersURL': '/api/folder/'+ folderProfile.id + '/members',
                'setMembers': oae.api.folder.updateMembers,
                'setVisibility': oae.api.folder.updateFolder
            }
        };
    };

    /**
     * Trigger the manageaccess widget and pass in context data
     */
    $(document).on('click', '.folder-trigger-manageaccess', function() {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Trigger the manageaccess widget in `add members` view and pass in context data
     */
    $(document).on('click', '.folder-trigger-manageaccess-add', function() {
        $(document).trigger('oae.trigger.manageaccess-add', getManageAccessData());
    });

    /**
     * Re-render the folder's clip when the permissions have been updated. When the folder visibility has been
     * changed, offer an opportunity to update the visibility of the items in the folder as well
     */
    $(document).on('oae.manageaccess.done', function() {
        if (visibility !== folderProfile.visibility && $('#folderlibrary-widget .oae-list li[data-id]').length > 0) {
            $(document).trigger('oae.trigger.foldercontentvisibility', folderProfile);
            // Update the cached visibility
            visibility = folderProfile.visibility;
        }
        setUpClips();
    });


    //////////////////
    // EDIT DETAILS //
    //////////////////

    /**
     * Re-render the folder's clip when the details have been updated
     */
    $(document).on('oae.editfolder.done', function(ev, updatedFolderProfile) {
        folderProfile = updatedFolderProfile;
        setUpClips();
    });


    getFolderProfile();

});
