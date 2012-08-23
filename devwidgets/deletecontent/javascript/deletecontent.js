/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

/*global, window, $ */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.deletecontent
     *
     * @class deletecontent
     *
     * @description
     * Deletecontent widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.deletecontent = function(tuid, showSettings) {

        //////////////////////
        // Global variables //
        //////////////////////

        var pathsToDelete = false;
        var contentIManage = false;
        var contentIView = false;
        var context = false;
        var callback = false;
        var contextType = false;

        ///////////////////
        // CSS Selectors //
        ///////////////////

        var $deletecontent_dialog = $('#deletecontent_dialog');

        ////////////////////////////
        // Batch request handling //
        ////////////////////////////

        /**
         * Once all requests have been collected into a batchRequest array, we can submit them as
         * a batch request
         * @param {Object} batchRequests    Array that contains all batch requests to be submitted
         * @param {Object} successMessage   Id of the dom element that contains the success message to be displayed
         */
        var sendDeletes = function(batchRequests, successMessage) {
            sakai.api.Util.progressIndicator.showProgressIndicator(
                sakai.api.i18n.getValueForKey('REMOVING_CONTENT'),
                sakai.api.i18n.getValueForKey('PROCESSING_REMOVING'));
            // Update the inserter
            $.each(collectionsToUpdate, function(collectionId, amount) {
                $.each(sakai.api.User.data.me.groups, function(index, group) {
                    if (group && group.counts && group.groupid === collectionId) {
                        group.counts.contentCount -= amount;
                        collectionId = collectionId.substring(2,collectionId.length);
                        $(window).trigger('updateCount.inserter.sakai', [collectionId, group.counts.contentCount]);
                    }
                });
            });
            sakai.api.Server.batch(batchRequests, function(success, data) {
                if (success) {
                    sakai.api.Util.notification.show($('#deletecontent_message_title').html(), $(successMessage).html());
                } else {
                    sakai.api.Util.error.show($('#deletecontent_message_title').html(), $('#deletecontent_message_error').html());
                }

                $(document).trigger('done.deletecontent.sakai', [pathsToDelete]);
                if ($.isFunction(callback)) {
                    callback(success);
                }
                sakai.api.Util.progressIndicator.hideProgressIndicator();
                sakai.api.Util.Modal.close($deletecontent_dialog);
            });
        };

        //////////////////////////////
        // Remove from library only //
        //////////////////////////////

        /**
         * Add one request for each item to be removed from the current library
         * @param {Object} batchRequests    Array to which to add the requests for removing the content
         * @param {Object} items            Content items to be removed from the current library
         */
        var processRemoveFromLibrary = function(batchRequests, items) {
            batchRequests = batchRequests || [];
            for (var i = 0; i < items.length; i++) {
                var parameters = {};
                if (sakai.api.Content.Collections.isCollection(items[i])) {
                    var groupId = sakai.api.Content.Collections.getCollectionGroupId(items[i]);
                    batchRequests.push({
                        'url': '/system/userManager/group/' + groupId + '-members.update.json',
                        'method': 'POST',
                        'parameters': {
                            ':viewer@Delete': context,
                            ':member@Delete': context
                        }
                    });
                    batchRequests.push({
                        'url': '/system/userManager/group/' + groupId + '-editors.update.json',
                        'method': 'POST',
                        'parameters': {
                            ':viewer@Delete': context,
                            ':member@Delete': context
                        }
                    });
                    batchRequests.push({
                        'url': '/system/userManager/group/' + groupId + '-managers.update.json',
                        'method': 'POST',
                        'parameters': {
                            ':viewer@Delete': context,
                            ':member@Delete': context
                        }
                    });
                } else {
                    parameters[':manager@Delete'] = context;
                    parameters[':editor@Delete'] = context;
                    parameters[':viewer@Delete'] = context;
                    batchRequests.push({
                        'url': '/p/' + items[i]['_path'] + '.members.json',
                        'method': 'POST',
                        'parameters': parameters
                    });
                }
            }
        };

        /**
         * Remove the selected items from the current library only and keep them onto the
         * system.
         */
        var removeFromLibrary = function() {
            var batchRequests = [];
            processRemoveFromLibrary(batchRequests, contentIView);
            processRemoveFromLibrary(batchRequests, contentIManage);
            sendDeletes(batchRequests, (contextType === 'collection' ? '#deletecontent_message_from_collection' : '#deletecontent_message_from_library'));
        };

        ////////////////////////////
        // Remove from the system //
        ////////////////////////////

        /**
         * Add one request for each item to delete from the system
         * @param {Object} batchRequests    Array to which to add the requests for removing the content
         * @param {Object} items            Content items to be removed from the system
         */
        var processRemoveFromSystem = function(batchRequests, items) {
            batchRequests = batchRequests || [];
            for (var i = 0; i < items.length; i++) {
                batchRequests.push({
                    'url': '/p/' + items[i]['_path'],
                    'method': 'POST',
                    'parameters': {
                        ':operation': 'delete'
                    }
                });
                // Remove the pseudoGroups associated to the collection
                var collectionGroupId = sakai.api.Content.Collections.getCollectionGroupId(items[i]);
                if (sakai.api.Content.Collections.isCollection(items[i])) {
                    batchRequests.push({
                        'url': '/system/userManager.delete.json',
                        'method': 'POST',
                        'parameters': {
                            ':applyTo': [collectionGroupId, collectionGroupId + '-members', collectionGroupId + '-managers']
                        }
                    });
                }
            }
        };

        /**
         * Remove the selected items from the system and thus from all libraries where this is being
         * used
         */
        var removeFromSystem = function() {
            // Remove content I manage from the system
            var batchRequests = [];
            processRemoveFromLibrary(batchRequests, contentIView);
            processRemoveFromSystem(batchRequests, contentIManage);
            sendDeletes(batchRequests, '#deletecontent_message_from_system');
        };

        var collectionsToUpdate = {};

        /**
         * Check whether any users or groups are either managers or viewers from
         * any of the selected content items
         */
        var checkUsedByOthers = function() {
            collectionsToUpdate = {};
            var userGroupIds = [];
            var collectionsToCheck = [];
            // Check whether any of the content I manage is managed by or
            // shared with other people
            $.each(contentIManage, function(m, contentItem) {
                if (sakai.api.Content.Collections.isCollection(contentItem)) {
                    var collectionGroupId = sakai.api.Content.Collections.getCollectionGroupId(contentItem);
                    collectionsToCheck.push(collectionGroupId + '-members');
                    collectionsToCheck.push(collectionGroupId + '-editors');
                    collectionsToCheck.push(collectionGroupId + '-managers');
                } else {
                    var managers = contentItem['sakai:pooled-content-manager'];
                    if (managers) {
                        for (var i = 0; i < managers.length; i++) {
                            if ($.inArray(managers[i], userGroupIds) === -1 && managers[i] !== sakai.data.me.user.userid &&
                            managers[i] !== context) {
                                userGroupIds.push(managers[i]);
                            }
                        }
                    }
                    var editors = contentItem['sakai:pooled-content-editor'];
                    if (editors && editors.length) {
                        $.each(editors, function(idx, editor) {
                            if ($.inArray(editor, userGroupIds) === -1 && editor !== sakai.data.me.user.userid && editor !== context) {
                                userGroupIds.push(editor);
                            }
                        });
                    }
                    var viewers = contentItem['sakai:pooled-content-viewer'];
                    if (viewers) {
                        for (var j = 0; j < viewers.length; j++) {
                            if ($.inArray(viewers[j], userGroupIds) === -1 && viewers[j] !== sakai.data.me.user.userid &&
                                viewers[j] !== context && viewers[j] !== 'everyone' && viewers[j] !== 'anonymous') {
                                userGroupIds.push(viewers[j]);
                                if (sakai.api.Content.Collections.isCollection(viewers[j])) {
                                     collectionsToUpdate[viewers[j]] = collectionsToUpdate[viewers[j]] || 0;
                                     collectionsToUpdate[viewers[j]] += 1;
                                 }
                            }
                        }
                    }
                }
            });
            if (collectionsToCheck.length > 0) {
                var batchRequest = [];
                $.each(collectionsToCheck, function(index, collectiongroup) {
                    batchRequest.push({
                        'url': '/system/userManager/group/' + collectiongroup + '.members.json',
                        'method': 'GET',
                        'parameters': {
                            items: 10000
                        }
                    });
                });
                sakai.api.Server.batch(batchRequest, function(success, data) {
                    for (var i = 0; i < data.results.length; i++) {
                        var members = $.parseJSON(data.results[i].body);
                        for (var ii = 0; ii < members.length; ii++) {
                            var member = members[ii].userid || members[ii].groupid;
                            if ($.inArray(member, userGroupIds) === -1 &&
                                member !== sakai.data.me.user.userid &&
                                member !== context) {
                                userGroupIds.push(member);
                                if (sakai.api.Content.Collections.isCollection(member)) {
                                    collectionsToUpdate[member] = collectionsToUpdate[member] || 0;
                                    collectionsToUpdate[member] += 1;
                                }
                            }
                        }
                    }
                    if (userGroupIds.length > 0) {
                        setUpUsedByOverlay(userGroupIds);
                    } else {
                        removeFromSystem();
                    }
                });
            } else {
                if (userGroupIds.length > 0) {
                    setUpUsedByOverlay(userGroupIds);
                } else {
                    removeFromSystem();
                }
            }
        };

        /**
         * When the content the user is trying to delete from the system is
         * being used by others, present an overlay that lists all of the
         * groups and users that either use or manage the content
         * @param {Object} userGroupIds    Array that contains the userids and groupids of all
         *                                 users and groups using the content
         */
        var setUpUsedByOverlay = function(userGroupIds) {
            // Show the overview screen of who else is using this
            $('#deletecontent_used_by_others_container').html('');
            $('#deletecontent_container').hide();
            $('#deletecontent_used_by_others').show();
            // Set up the buttons correctly
            hideButtons();
            $('#deletecontent_action_removefromsystem_confirm').show();
            if (context && contextType === 'collection') {
                $('#deletecontent_action_removefromcollection_only').show();
            } else if (context) {
                $('#deletecontent_action_removefromlibrary_only').show();
            }
            // Show the correct overlay title
            $('#deletecontent_main_content').hide();
            $('#deletecontent_main_confirm').show();
            // Get the profile information of who else is using it
            var batchRequests = [];
            for (var i = 0; i < userGroupIds.length; i++) {
                batchRequests.push({
                    'url': '/~' + userGroupIds[i] + '/public/authprofile.profile.json',
                    'method': 'GET'
                });
            }
            // Get profile information for each of the users and groups using
            // this content
            sakai.api.Server.batch(batchRequests, function(success, data) {
                var profileInfo = [];
                for (var i = 0; i < data.results.length; i++) {
                    if (data.results[i].success && data.results[i].status !== 404) {
                        // Process pseudoGroups
                        var profile = $.parseJSON(data.results[i].body);
                        profile.showLink = true;
                        if (sakai.api.Content.Collections.isCollection(profile)) {
                            profile.collectionid = sakai.api.Content.Collections.getCollectionPoolId(profile);
                        } else if (profile['sakai:excludeSearch'] === 'true') {
                            var splitOnDash = profile.groupid.split('-');
                            profile['sakai:group-title'] = profile['sakai:parent-group-title'] + ' (' + sakai.api.i18n.getValueForKey(profile['sakai:role-title-plural']) + ')';
                            profile.groupid = splitOnDash.splice(0, splitOnDash.length - 1).join('-');
                        }
                        profileInfo.push(profile);
                    } else {
                        var privateProfile = {
                            showLink: false
                        };
                        if (data.results[i].url.substring(0,4) === '/~c-') {
                            privateProfile.collectionid = true;
                            privateProfile['sakai:group-title'] =
                                sakai.api.i18n.getValueForKey('PRIVATE_COLLECTION', 'deletecontent');
                        } else {
                            privateProfile['sakai:group-title'] =
                                sakai.api.i18n.getValueForKey('PRIVATE_USER_GROUP', 'deletecontent');
                        }
                        profileInfo.push(privateProfile);
                    }
                }
                $('#deletecontent_used_by_others_container').html(sakai.api.Util.TemplateRenderer('deletecontent_used_by_others_template', {
                    'profiles': profileInfo,
                    'sakai': sakai
                }));
            });
        };

        ////////////////////////////
        // Remove hybrid strategy //
        ////////////////////////////

        /**
         * Check whether the users has chosen to remove the content he manages from his
         * library only or from the system. If removing from the library only, we can
         * go ahead and remove the content. If removing from the system, we want to check
         * first whether the content is being used by anyone else
         */
        var selectHybrid = function() {
            var manageOption = $('input[name="deletecontent_hybrid_options"]:checked').val();
            if (manageOption === 'libraryonly') {
                removeFromLibrary();
            } else if (manageOption === 'system') {
                checkUsedByOthers();
            }
        };

        ///////////////////
        // Overlay setup //
        ///////////////////

        /**
         * Hide all of the action buttons in the overlay
         */
        var hideButtons = function() {
            $('#deletecontent_action_removefromsystem').hide();
            $('#deletecontent_action_removefromsystem_nocontext').hide();
            $('#deletecontent_action_removefromlibrary').hide();
            $('#deletecontent_action_removefromcollection').hide();
            $('#deletecontent_action_apply').hide();
            $('#deletecontent_action_removefromsystem_confirm').hide();
            $('#deletecontent_action_removefromlibrary_only').hide();
            $('#deletecontent_action_removefromcollection_only').hide();
        };

        /**
         * Set up the delete overlay depending on the permissions I have on the content
         * about to be deleted from the overlay
         * There are 3 scenarios:
         * 1. I am a manager of some items and a viewer of others
         * 2. I am a manager of all items
         * 3. I am a viewer of all items
         * @param {Object} contentIManage    Array that contains all files about to be
         *                                   removed from the library that I manage
         * @param {Object} contentIView      Array that contains all files about to be
         *                                   removed from the library that I'm a viewer of
         */
        var setupOverlay = function(contentIManage, contentIView) {
            hideButtons();
            var template = '';
            if (contentIManage.length > 0 && contentIView.length > 0) {
                // Set up overlay for mixed permissions
                template = 'deletecontent_template_hybrid';
                $('#deletecontent_action_apply').show();
            } else if (contentIManage.length > 0) {
                // Set up overlay for full management permissions
                template = 'deletecontent_template_list';
                if (context) {
                    $('#deletecontent_action_removefromsystem').show();
                    if (contextType === 'collection') {
                        if (sakai_global.content_profile && sakai_global.content_profile.content_data) {
                            var managerCid = 'c-' + sakai_global.content_profile.content_data.data._path;
                            collectionsToUpdate[managerCid] = collectionsToUpdate[managerCid] || 0;
                            collectionsToUpdate[managerCid] += contentIManage.length;
                        }
                        $('#deletecontent_action_removefromcollection').show();
                    } else {
                        $('#deletecontent_action_removefromlibrary').show();
                    }
                // When no context/library is specified, we assume that the content is being deleted outside
                // of a library (e.g. content profile). We thus don't offer the remove from library option
                } else {
                    $('#deletecontent_action_removefromsystem_nocontext').show();
                }
            } else if (contentIView.length > 0) {
                // Set up overlay for full viewer permissions
                template = 'deletecontent_template_list';
                if (contextType === 'collection') {
                    if (sakai_global.content_profile && sakai_global.content_profile.content_data) {
                        var viewerCid = 'c-' + sakai_global.content_profile.content_data.data._path;
                        collectionsToUpdate[viewerCid] =
                            collectionsToUpdate[viewerCid] || 0;
                        collectionsToUpdate[viewerCid] += contentIView.length;
                    }
                    $('#deletecontent_action_removefromcollection').show();
                } else {
                    $('#deletecontent_action_removefromlibrary').show();
                }
            }
            $('#deletecontent_container').html(sakai.api.Util.TemplateRenderer(template, {
                'contentIManage': contentIManage,
                'contentIView': contentIView,
                'contextType': contextType,
                'sakai': sakai
            }));
        };

        /**
         * Run over the list of content items to delete and determine whether there
         * any that I manage and can thus remove from the system
         * @param {Object} contentList    Response from batch request that retrieved
         *                                metadata for all content that need to be deleted
         */
        var findContentIManage = function(contentList) {
            contentIManage = [];
            contentIView = [];
            $.each(contentList.results, function(i, contentItem) {
                var content = $.parseJSON(contentItem.body);
                var manage = sakai.api.Content.isUserAManager(content, sakai.data.me);
                if (manage) {
                    contentIManage.push(content);
                } else {
                    contentIView.push(content);
                }
            });
            setupOverlay(contentIManage, contentIView);
        };

        /**
         * Retrieve the metadata of all selected files
         * @param {Object} paths    Array that contains the paths to all
         *                          content that needs to be deleted
         */
        var getContentInfo = function(paths) {
            var batchRequest = [];
            $.each(paths, function(i, url) {
                batchRequest.push({
                    url: '/p/' + url + '.json',
                    method: 'GET'
                });
            });
            sakai.api.Server.batch(batchRequest, function(success, data) {
                if (success) {
                    findContentIManage(data);
                }
            });
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Load the delete content widget with the appropriate data
         * This function can be called from anywhere within Sakai by triggering the
         * 'init.deletecontent.sakai' event
         *
         * @param {Object} data A JSON object containing the necessary information.
         *
         * @example To delete one item:
         *     $(window).trigger('init.deletecontent.sakai', [{
         *         'path': [ '/test.jpg' ]
         *     }, callbackFn]);  // callbackFn is sent one param: success (true if delete succeeded, false otherwise)
         *
         * @example To delete multiple items:
         *     $(window).trigger('init.deletecontent.sakai', [{
         *         'path': [ '/file1.ext', '/file2.ext', '/file3.ext', '/file4.ext' ]
         *     }, callbackFn]);  // callbackFn is sent one param: success (true if delete succeeded, false otherwise)
         */
        var load = function(ev, data, _callback) {
            context = data.context;
            contextType = 'default';
            if (context && sakai.api.Content.Collections.isCollection(context)) {
                contextType = 'collection';
            }
            callback = _callback;
            pathsToDelete = data.paths;
            getContentInfo(data.paths);
            hideButtons();
            // Show the appropriate overlay title
            $('#deletecontent_main_confirm').hide();
            $('#deletecontent_main_content').show();
            // Show and clear the main container
            $('#deletecontent_container').html('');
            $('#deletecontent_container').show();
            $('#deletecontent_used_by_others').hide();
            sakai.api.Util.Modal.open($deletecontent_dialog);
        };

        /**
         * Initialize the delete content widget
         * All the functionality in here is loaded before the widget is actually rendered
         */
        var init = function() {
            // This will make the widget popup as a layover.
            sakai.api.Util.Modal.setup($deletecontent_dialog, {
                modal: true,
                toTop: true
            });
        };

        ////////////////////////////
        // Internal event binding //
        ////////////////////////////

        $('#deletecontent_action_removefromlibrary').on('click', removeFromLibrary);
        $('#deletecontent_action_removefromcollection').on('click', removeFromLibrary);
        $('#deletecontent_action_removefromsystem').on('click', checkUsedByOthers);
        $('#deletecontent_action_apply').on('click', selectHybrid);
        $('#deletecontent_action_removefromlibrary_only').on('click', removeFromLibrary);
        $('#deletecontent_action_removefromcollection_only').on('click', removeFromLibrary);
        $('#deletecontent_action_removefromsystem_confirm').on('click', removeFromSystem);
        $('#deletecontent_action_removefromsystem_nocontext').on('click', checkUsedByOthers);

        ////////////////////////////
        // External event binding //
        ////////////////////////////

        $(document).on('init.deletecontent.sakai', load);

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('deletecontent');
});
