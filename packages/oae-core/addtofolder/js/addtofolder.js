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

define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that will keep track of the element that triggered the add to folder modal
        var $trigger = null;

        // Variable that will keep track of the current page context
        var contextProfile = null;

        // Variable that will keep track of the items to add to a folder
        var selectedItems = [];

        // Variable that will be used to keep track of the infinite scroll instances
        var foldersInfinityScroll = false;
        var groupsInfinityScroll = false;

        /**
         * Add the selected content items to the selected folder
         */
        var setUpAddToFolder = function() {
            $('#addtofolder-form', $rootel).on('submit', function() {
                // Disable the `Add` button
                $('#addtofolder-add', $rootel).prop('disabled', true);

                // Extract the selected folder
                var $visibleList = $('.tab-pane.active', $rootel);
                var $selectedFolder = $('input[type=radio]:checked', $visibleList);
                var selectedFolderId = $selectedFolder.val();
                var selectedFolderProfilePath = $selectedFolder.attr('data-profilePath');
                var selectedFolderDisplayName = $selectedFolder.closest('.oae-listitem').find('h3').text();

                // Add  the selected content items to the selected folder
                oae.api.folder.addToFolder(selectedFolderId, _.pluck(selectedItems, 'id'), function(err) {
                    // Show a notification and close the modal
                    var data = {
                        'err': err,
                        'folderDisplayName': selectedFolderDisplayName,
                        'folderProfilePath': selectedFolderProfilePath,
                        'selectedItems': selectedItems
                    };

                    var notificationTitle = oae.api.util.template().render($('#addtofolder-notification-title-template', $rootel), data);
                    var notificationBody = oae.api.util.template().render($('#addtofolder-notification-body-template', $rootel), data);
                    oae.api.util.notification(notificationTitle, notificationBody, data.err ? 'error': 'success');

                    // Deselect all list items and disable list option buttons
                    $(document).trigger('oae.list.deselectall');

                    // Close the modal
                    $('#addtofolder-modal', $rootel).modal('hide');
                });

                // Avoid default form submit behavior
                return false;
            });
        };

        /**
         * Initialize a new infinite scroll container that lists the folders in a user's or group's library
         *
         * @param  {String}         [contextId]         User or group id for which to list the folders. Defaults to the current user
         */
        var setUpFolders = function(contextId) {
            // Disable the previous infinite scroll
            if (foldersInfinityScroll) {
                foldersInfinityScroll.kill();
            }

            // Default to `My Library` when no context id has been provided
            contextId = contextId || oae.data.me.id;
            var url = '/api/folder/library/' + contextId;

            // Set up the infinite scroll instance
            var $visibleList = $('.tab-pane.active', $rootel);
            foldersInfinityScroll = $('.oae-list.addtofolder-folder-list', $visibleList).infiniteScroll(url, {
                'limit': 8
            }, '#addtofolder-folders-template', {
                'scrollContainer': $('.addtofolder-scrollcontainer', $visibleList),
                'postProcessor': function(data) {
                    data.displayOptions = {
                        'addLink': false
                    };
                    return data;
                },
                'emptyListProcessor': function() {
                    oae.api.util.template().render($('#addtofolder-folders-noresults-template', $rootel), {
                        'context': contextId
                    }, $('.oae-list.addtofolder-folder-list', $visibleList));
                }
            });
        };

        /**
         * Initialize a new infinite scroll container that lists the groups the current user is a member of
         */
        var setUpGroups = function() {
            // Show the container that will list the groups the current user is a member of
            $('#addtofolder-group-list-container', $rootel).hide();
            $('#addtofolder-mygroups-list-container', $rootel).show();

            // Disable the `Add` button
            $('#addtofolder-add', $rootel).prop('disabled', true);

            // Don't reload the groups when they've already been loaded
            if (groupsInfinityScroll) {
                return;
            }

            var url = '/api/user/' + oae.data.me.id + '/memberships';

            // Set up the infinite scroll instance
            groupsInfinityScroll = $('#addtofolder-mygroups-list', $rootel).infiniteScroll(url, {
                'limit': 8
            }, '#addtofolder-groups-template', {
                'scrollContainer': $('#addtofolder-mygroups-list-container', $rootel),
                'postProcessor': function(data) {
                    data.displayOptions = {
                        'addLink': false
                    };
                    return data;
                },
                'emptyListProcessor': function() {
                    oae.api.util.template().render($('#addtofolder-groups-noresults-template', $rootel), null, $('#addtofolder-mygroups-list', $rootel));
                }
            });
        };

        /**
         * Allow folders in the folder list to be selected. Each folder has a hidden associated radio
         * button that will be used to determine the selected folder. This will also deal with keyboard
         * accessibility considerations
         */
        var setUpSelectFolder = function() {
            // When the selected folder changes because of a selection change in the underlying
            // radio button, a selection style is applied to the selected folder
            $('#addtofolder-form', $rootel).on('change', function() {
                var $visibleList = $('.tab-pane.active', $rootel);
                // Remove the selected style from the previously selected folder
                $('.oae-pill', $visibleList).removeClass('oae-pill-active');
                $('label', $visibleList).removeClass('oae-focus');
                // Apply the selected style to the selected folder. We also apply the focus style
                // to this item to make up for the fact that the radio button behind the folder is
                // the element that actually has focus
                var $selectedFolder = $('input[type=radio]:checked', $visibleList);
                $selectedFolder.closest('.oae-pill').addClass('oae-pill-active');
                $selectedFolder.closest('label').addClass('oae-focus');
                // In Chrome, changing the selected radio button using the arrow keys and therefore
                // changing the focussed radio button is not sufficient to make Chrome scroll to the
                // selected folder. Therefore, we need to programmatically remove focus from the radio
                // button and set it back. However, this only works across all browsers when the focus
                // is removed first and then added back in a separate tick
                $selectedFolder.blur();
                setTimeout(function() {
                    $selectedFolder.focus();
                }, 0);
                // Enable the `Add` button as a folder has now been selected
                $('#addtofolder-add', $rootel).prop('disabled', false);
                $selectedFolder.focus();
            });

            // When the user tabs to the list of folders and no folders are selected yet, we select
            // the first folder in the list. This will then allow the user to use the standard radio
            // button keyboard controls to modify the selected folder
            $rootel.on('focusin', '#addtofolder-form input[type=radio]', function(ev) {
                var $visibleList = $('.tab-pane.active', $rootel);
                if ($('.oae-pill-active', $visibleList).length === 0) {
                    // Select the first folder in the list
                    $('input[type=radio]', $visibleList).first().click();
                }
            });
        };

        /**
         * Show the folders of the specified group
         *
         * @param  {String}     groupId         The id of the group for which the folders should be loaded
         */
        var setUpGroupFolders = function(groupId) {
            // Activate the groups tab
            activateTab('mygroups');

            // Ensure that the folders and metadata from the previously selected group
            // are not showing
            $('#addtofolder-group-back-container', $rootel).empty();
            $('#addtofolder-group-list', $rootel).empty();

            // Show the container that will list the folders of the selected group
            $('#addtofolder-mygroups-list-container', $rootel).hide();
            $('#addtofolder-group-list-container', $rootel).show();

            // Load the group profile for the selected group, so the link back to the
            // list of `My Groups` can be generated
            oae.api.group.getGroup(groupId, function(err, group) {
                oae.api.util.template().render($('#addtofolder-group-back-template', $rootel), {
                    'group': group,
                    'displayOptions': {
                        'addLink': false
                    }
                }, $('#addtofolder-group-back-container', $rootel));
                // Load the folders for the selected group
                setUpFolders(groupId);
            });
        };

        /**
         * Activate the specified tab and display the corresponding content
         *
         * @param  {String}     tab         The tab that should be activated. This can be `mylibrary` or `mygroups`
         */
        var activateTab = function(tab) {
            // Disable the `Add` button
            $('#addtofolder-add', $rootel).prop('disabled', true);

            // Make the appropriate tab active and show the corresponding list
            $('.nav.nav-tabs > li', $rootel).removeClass('active');
            $('.tab-content > .tab-pane', $rootel).removeClass('active');
            $('#addtofolder-tab-' + tab, $rootel).addClass('active');
            $('#addtofolder-' + tab, $rootel).addClass('active');
        };

        /**
         * Open the selected tab. This will either be the list of folders in the current user's library
         * or the list of groups that the current user is a member of.
         *
         * @param  {String}     tab         The tab that should be opened. This can be `mylibrary` or `mygroups`
         */
        var openTab = function(tab) {
            // Activate the appropriate tab
            activateTab(tab);

            // Load the tab content
            if (tab === 'mylibrary') {
                setUpFolders();
            } else {
                setUpGroups();
            }
        };

        /**
         * Determine whether or not the add to folder widget is triggered for an individual content item or for
         * a number of selected content items in a list. In case it has been triggered by an individual content
         * item, we expect to find a `data-id` attribute on the element. If the `data-id` attribute cannot be
         * found, we assume that the selected items from a list are being added to a folder
         */
        var getContext = function() {
            // Get the page context
            $(document).on('oae.context.send.addtofolder', function(ev, data) {
                contextProfile = data;

                // If an individual item is added to a folder, we expect to find the data-id attribute
                if ($trigger.attr('data-id')) {
                    selectedItems = [{
                        'id': $trigger.attr('data-id'),
                        'resourceSubType': $trigger.attr('data-resourceSubType')
                    }];
                    finishGetContext();
                } else {
                    // Get the list selection
                    $(document).on('oae.list.sendSelection.addtofolder', function(ev, data) {
                        selectedItems = data.results;
                        finishGetContext();
                    });
                    $(document).trigger('oae.list.getSelection', 'addtofolder');
                }
            });
            $(document).trigger('oae.context.get', 'addtofolder');
        };

        /**
         * Show the initial folder list based on the current context. When the current context is a group that is
         * managed by the current user, the folders in the group library are listed by default. Otherwise, the
         * folders in the user's library will always be listed by default
         */
        var finishGetContext = function() {
            if (contextProfile.resourceType === 'group' && contextProfile.isManager) {
                setUpGroupFolders(contextProfile.id);
            } else {
                openTab('mylibrary');
            }
        };

        /**
         * Add the different event bindings
         */
        var addBinding = function() {
            // Load the correct list when a tab is clicked
            $('a[data-toggle="tab"]', $rootel).on('shown.bs.tab', function(ev) {
                openTab($(ev.target).attr('data-type'));
            });

            // Load the folders of a group when a group is clicked
            $rootel.on('click', '#addtofolder-mygroups-list a', function() {
                var selectedGroup = $(this).attr('data-id');
                setUpGroupFolders(selectedGroup);
                // Avoid default click behavior
                return false;
            });

            // Show the list of groups the current user is a member of when
            // `Back to My Groups` is clicked
            $('#addtofolder-group-back-container', $rootel).on('click', function() {
                setUpGroups();
                // Avoid default click behavior
                return false;
            });
        };

        /**
         * Initialize the add to folder modal dialog
         */
        var setUpAddToFolderModal = function() {
            $(document).on('click', '.oae-trigger-addtofolder', function() {
                $trigger = $(this);
                $('#addtofolder-modal', $rootel).modal({
                    'backdrop': 'static'
                });
                getContext();
            });
        };

        addBinding();
        setUpAddToFolder();
        setUpSelectFolder();
        setUpAddToFolderModal();

    };
});
