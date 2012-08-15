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
 * specific language governing permissions and limitations under the License.
 */

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.mylibrary
     *
     * @class mylibrary
     *
     * @description
     * Widget that lists all of the content items that live inside of a given
     * library
     *
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.mylibrary = function(tuid, showSettings, widgetData, state) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var mylibrary = {  // global data for mylibrary widget
            sortBy: '_lastModified',
            sortOrder: 'desc',
            isOwnerViewing: false,
            default_search_text: '',
            userArray: [],
            contextId: false,
            infinityScroll: false,
            widgetShown: true,
            listStyle: 'list'
        };

        // DOM jQuery Objects
        var $rootel = $('#' + tuid);  // unique container for each widget instance
        var $mylibrary_check = $('.mylibrary_check', $rootel);
        var $mylibrary_items = $('#mylibrary_items', $rootel);
        var $mylibrary_check_all = $('#mylibrary_select_checkbox', $rootel);
        var $mylibrary_remove = $('#mylibrary_remove', $rootel);
        var $mylibrary_addto = $('#mylibrary_addpeople_button', $rootel);
        var $mylibrary_share = $('#mylibrary_content_share', $rootel);
        var $mylibrary_sortby = $('#mylibrary_sortby', $rootel);
        var $mylibrary_livefilter = $('#mylibrary_livefilter', $rootel);
        var $mylibrary_livefilter_container = $('#mylibrary_livefilter_container', $rootel);
        var $mylibrary_sortarea = $('#mylibrary_sortarea', $rootel);
        var $mylibrary_empty = $('#mylibrary_empty', $rootel);
        var $mylibrary_admin_actions = $('#mylibrary_admin_actions', $rootel);
        var mylibrary_remove_icon = '.mylibrary_remove_icon'
        var $mylibrary_search_button = $('#mylibrary_search_button', $rootel);
        var $mylibrary_result_count = $('.s3d-search-result-count', $rootel);
        var $mylibrary_show_grid = $('.s3d-listview-grid', $rootel);
        var $mylibrary_show_list = $('.s3d-listview-list', $rootel);
        var $mylibraryAddContentOverlay = $('.sakai_add_content_overlay', $rootel);

        var currentGroup = false;

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Get personalized text for the given message bundle key based on
         * whether this library is owned by the viewer, or belongs to someone else.
         * The message should contain a '${firstname}' variable to replace with
         * and be located in this widget's properties files.
         *
         * @param {String} bundleKey The message bundle key
         */
        var getPersonalizedText = function(bundleKey) {
            if (currentGroup) {
                return sakai.api.i18n.getValueForKey(
                    bundleKey, 'mylibrary').replace(/\$\{firstname\}/gi,
                        currentGroup.properties['sakai:group-title']);
            } else if (mylibrary.isOwnerViewing) {
                return sakai.api.i18n.getValueForKey(
                    bundleKey, 'mylibrary').replace(/\$\{firstname\}/gi,
                        sakai.api.i18n.getValueForKey('YOUR').toLowerCase());
            } else {
                return sakai.api.i18n.getValueForKey(bundleKey, 'mylibrary').replace(/\$\{firstname\}/gi, sakai.api.User.getFirstName(sakai_global.profile.main.data) + '\'s');
            }
        };

        /**
         * Bring all of the topbar items (search, checkbox, etc.) back into its original state
         */
        var resetView = function() {
            $mylibrary_result_count.hide();
            $mylibrary_check_all.removeAttr('checked');
            $mylibrary_remove.attr('disabled', 'disabled');
            $mylibrary_addto.attr('disabled', 'disabled');
            $mylibrary_share.attr('disabled', 'disabled');
            $('#mylibrary_title_bar').show();
        };

        /**
         * Show or hide the controls on the top of the library (search box, sort, etc.)
         * @param {Object} show    True when you want to show the controls, false when
         *                         you want to hide the controls
         */
        var showHideTopControls = function(show) {
            if (show) {
                if (mylibrary.isOwnerViewing) {
                    $mylibrary_remove.show();
                    $mylibrary_admin_actions.show();
                    $mylibraryAddContentOverlay.show();
                }
                $('.s3d-page-header-top-row', $rootel).show();
                $mylibrary_livefilter_container.show();
                $mylibrary_sortarea.show();
            } else {
                $('.s3d-page-header-top-row', $rootel).hide();
                $mylibrary_admin_actions.hide();
                $mylibrary_livefilter_container.hide();
                $mylibrary_sortarea.hide();
            }
        };

        /**
         * Renders library title
         * @param {String} contextName The name to render
         * @param {Boolean} isGroup Flag if this is a groups library or not
         */
        var renderLibraryTitle = function(contextName, isGroup) {
            sakai.api.Util.TemplateRenderer('mylibrary_title_template', {
                isMe: mylibrary.isOwnerViewing,
                isGroup: isGroup,
                user: contextName
            }, $('#mylibrary_title_container', $rootel));
        };

        /////////////////////////////
        // Deal with empty library //
        /////////////////////////////

        /**
         * Function that manages how a library with no content items is handled. In this case,
         * the items container will be hidden and a 'no items' container will be shown depending
         * on what the current context of the library is
         */
        var handleEmptyLibrary = function() {
            resetView();
            $mylibrary_items.hide();
            var query = $mylibrary_livefilter.val();
            // We only show the controls when there is a search query.
            // All other scenarios with no items don't show the top controls
            if (!query) {
                showHideTopControls(false);
            } else {
                showHideTopControls(true);
            }
            // Determine the state of the current user in the current library
            var mode = 'user_me';
            if (sakai_global.profile && mylibrary.contextId !== sakai.data.me.user.userid) {
                mode = 'user_other';
            } else if (!sakai_global.profile && (mylibrary.isOwnerViewing || mylibrary.isMemberViewing)) {
                mode = 'group_manager_member';
            } else if (!sakai_global.profile) {
                mode = 'group';
            }
            $mylibrary_empty.html(sakai.api.Util.TemplateRenderer('mylibrary_empty_template', {
                mode: mode,
                query: query
            }));

            $mylibrary_empty.show();
        };

        ////////////////////
        // Load a library //
        ////////////////////

        /**
         * Load the items of the current library and start an infinite scroll on
         * them
         */
        var showLibraryContent = function() {
            resetView();
            var query = $mylibrary_livefilter.val();
            // Disable the previous infinite scroll
            if (mylibrary.infinityScroll) {
                mylibrary.infinityScroll.kill();
            }
            // Set up the infinite scroll for the list of items in the library
            var sortOrder = mylibrary.sortOrder;
            if (mylibrary.sortOrder === 'modified') {
                sortOrder = 'desc';
            }
            mylibrary.infinityScroll = $mylibrary_items.infinitescroll(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER, {
                userid: mylibrary.contextId,
                sortOn: mylibrary.sortBy,
                sortOrder: sortOrder,
                q: query
            }, function(items, total) {
                if (total && query && query !== '*') {
                    $mylibrary_result_count.show();
                    var resultLabel = sakai.api.i18n.getValueForKey('RESULTS');
                    if (total === 1) {
                        resultLabel = sakai.api.i18n.getValueForKey('RESULT');
                    }
                    $mylibrary_result_count.children('.s3d-search-result-count-label').text(resultLabel);
                    $mylibrary_result_count.children('.s3d-search-result-count-count').text(total);
                }
                if (!sakai.data.me.user.anon) {
                    if (total !== 0) {
                        $('.s3d-page-header-top-row', $rootel).show();
                        $('.s3d-page-header-bottom-row', $rootel).show();
                    } else {
                        $('.s3d-page-header-bottom-row', $rootel).hide();
                    }
                } else {
                    if (total !== 0) {
                        $('.s3d-page-header-top-row', $rootel).show();
                    }
                }
                return sakai.api.Util.TemplateRenderer('mylibrary_items_template', {
                    'items': items,
                    'sakai': sakai,
                    'isMe': mylibrary.isOwnerViewing
                });
            }, handleEmptyLibrary, sakai.config.URL.INFINITE_LOADING_ICON, handleLibraryItems, function() {
                // Initialize content draggable
                sakai.api.Util.Draggable.setupDraggable({}, $mylibrary_items);
            }, sakai.api.Content.getNewList(mylibrary.contextId));
        };

        ////////////////////
        // State handling //
        ////////////////////

        /**
         * Deal with changed state in the library. This can be triggered when
         * a search was initiated, sort was changed, etc.
         */
        var handleHashChange = function(e) {
            var ls = $.bbq.getState('ls') || 'list';
            $('.s3d-listview-options', $rootel).find('div').removeClass('selected');
            if (ls === 'list') {
                $('#mylibrary_items', $rootel).removeClass('s3d-search-results-grid');
                $mylibrary_show_list.addClass('selected');
                $mylibrary_show_list.children().addClass('selected');
                mylibrary.listStyle = 'list';
            } else if (ls === 'grid') {
                $('#mylibrary_items', $rootel).addClass('s3d-search-results-grid');
                $('.s3d-listview-options', $rootel).find('div').removeClass('selected');
                $mylibrary_show_grid.addClass('selected');
                $mylibrary_show_grid.children().addClass('selected');
                mylibrary.listStyle = 'grid';
            }

            if (mylibrary.widgetShown) {
                // Set the sort states
                var parameters = $.bbq.getState();
                mylibrary.sortOrder = parameters.lso || 'modified';
                mylibrary.sortBy = parameters.lsb || '_lastModified';
                $mylibrary_livefilter.val(parameters.lq || '');
                $mylibrary_sortby.val(mylibrary.sortOrder);
                showLibraryContent();
            }
        };

        ////////////////////
        // Search library //
        ////////////////////

        /**
         * Search the current library. This function will extract the query
         * from the search box directly.
         */
        var doSearch = function() {
            var q = $.trim($mylibrary_livefilter.val());
            if (q) {
                $.bbq.pushState({ 'lq': q });
            } else {
                $.bbq.removeState('lq');
            }
        };

        var updateButtonData = function() {
            var shareIdArr = [];
            var addToIdArr = [];
            var addToTitleArr = [];
            $.each($('.mylibrary_check:checked:visible', $rootel), function(i, checked) {
                addToIdArr.push($(checked).attr('data-entityid'));
                addToTitleArr.push($(checked).attr('data-entityname'));
                shareIdArr.push($(checked).attr('data-entityid'));
                if (!$(checked).attr('data-canshare-error')) {
                    $(checked).attr('data-canshare-error', 'true');
                }
            });
            $mylibrary_share.attr('data-entityid', shareIdArr);
            $mylibrary_addto.attr('data-entityid', addToIdArr);
            $mylibrary_addto.attr('data-entityname', addToTitleArr);
            if (!shareIdArr.length) {
                $mylibrary_share.attr('disabled', 'disabled');
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var addBinding = function() {
            /**
             * Enable/disable the remove selected button depending on whether
             * any items in the library are checked
             */
            $rootel.on('change', '.mylibrary_check', function(ev) {
                if ($(this).is(':checked')) {
                    $mylibrary_remove.removeAttr('disabled');
                    $mylibrary_addto.removeAttr('disabled');
                    $mylibrary_share.removeAttr('disabled');
                } else if (!$('.mylibrary_check:checked', $rootel).length) {
                    $mylibrary_remove.attr('disabled', 'disabled');
                    $mylibrary_addto.attr('disabled', 'disabled');
                    $mylibrary_share.attr('disabled', 'disabled');
                }
                updateButtonData();
            });

            /**
             * Check/uncheck all loaded items in the library
             */
            $mylibrary_check_all.change(function(ev) {
                if ($(this).is(':checked')) {
                    $('.mylibrary_check').attr('checked', 'checked');
                    $mylibrary_remove.removeAttr('disabled');
                    $mylibrary_addto.removeAttr('disabled');
                    $mylibrary_share.removeAttr('disabled');
                } else {
                    $('.mylibrary_check').removeAttr('checked');
                    $mylibrary_remove.attr('disabled', 'disabled');
                    $mylibrary_addto.attr('disabled', 'disabled');
                    $mylibrary_share.attr('disabled', 'disabled');
                }
                updateButtonData();
            });

            /**
             * Gather all selected library items and initiate the
             * deletecontent widget
             */
            $mylibrary_remove.click(function(ev) {
                var $checked = $('.mylibrary_check:checked:visible', $rootel);
                if ($checked.length) {
                    var paths = [];
                    var collectionPaths = [];
                    $checked.each(function() {
                        paths.push($(this).attr('data-entityid'));
                        if ($checked.attr('data-type') === 'x-sakai/collection') {
                            collectionPaths.push($(this).attr('data-entityid'));
                        }
                    });
                    $(document).trigger('init.deletecontent.sakai', [{
                        paths: paths,
                        context: mylibrary.contextId
                    }, function(success) {
                        if (success) {
                            resetView();
                            $(window).trigger('lhnav.updateCount', ['library', -(paths.length)]);
                            mylibrary.infinityScroll.removeItems(paths);
                            if (collectionPaths.length) {
                                $(document).trigger('sakai.mylibrary.deletedCollections', {
                                    items: collectionPaths
                                });
                            }
                        }
                    }]);
                }
            });

            /**
             * Called when clicking the remove icon next to an individual content
             * item
             */
            $rootel.on('click', mylibrary_remove_icon, function(ev) {
                if ($(this).attr('data-entityid')) {
                    var paths = [];
                    var collection = false;
                    if ($(this).attr('data-type') === 'x-sakai/collection') {
                        collection = true;
                    }
                    paths.push($(this).attr('data-entityid'));
                    $(document).trigger('init.deletecontent.sakai', [{
                        paths: paths,
                        context: mylibrary.contextId
                    }, function(success) {
                        if (success) {
                            resetView();
                            $(window).trigger('lhnav.updateCount', ['library', -(paths.length)]);
                            if (collection) {
                                $(document).trigger('sakai.mylibrary.deletedCollections', {
                                    items: paths
                                });
                            }
                            mylibrary.infinityScroll.removeItems(paths);
                        }
                    }]);
                }
            });

            /**
             * Reload the library list based on the newly selected
             * sort option
             */
            $mylibrary_sortby.change(function(ev) {
                var query = $.trim($mylibrary_livefilter.val());
                var sortSelection = $(this).val();
                if (sortSelection === 'desc') {
                    mylibrary.sortOrder = 'desc';
                    mylibrary.sortBy = 'filename';
                } else if (sortSelection === 'asc') {
                    mylibrary.sortOrder = 'asc';
                    mylibrary.sortBy = 'filename';
                } else {
                    mylibrary.sortOrder = 'modified';
                    mylibrary.sortBy = '_lastModified';
                }
                $.bbq.pushState({'lsb': mylibrary.sortBy, 'lso': mylibrary.sortOrder, 'lq': query});
            });

            /**
             * Initiate a library search when the enter key is pressed
             */
            $mylibrary_livefilter.keyup(function(ev) {
                if (ev.keyCode === 13) {
                    doSearch();
                }
                return false;
            });

            /**
             * Initiate a search when the search button next to the search
             * field is pressed
             */
            $mylibrary_search_button.click(doSearch);

            /**
             * An event to listen from the worldsettings dialog so that we can refresh the title if it's been changed.
             * @param {String} title     New group name
             */
            $(window).on('updatedTitle.worldsettings.sakai', function(e, title) {
                renderLibraryTitle(title, true);
            });

            /**
             * Listen for newly the newly added content or newly saved content
             * @param {Object} data        Object that contains the new library items
             * @param {Object} library     Context id of the library the content has been added to
             */
            $(document).on('done.newaddcontent.sakai', function(e, data, library) {
                if (library === mylibrary.contextId || mylibrary.contextId === sakai.data.me.user.userid) {
                    mylibrary.infinityScroll.prependItems(data);
                }
            });

            /**
             * Keep track as to whether the current library widget is visible or not. If the
             * widget is not visible, it's not necessary to respond to hash change events.
             */
            $(window).on(tuid + '.shown.sakai', function(e, shown) {
                mylibrary.widgetShown = shown;
            });
            /**
             * Bind to hash changes in the URL
             */
            $(window).on('hashchange', handleHashChange);

            $mylibrary_show_list.click(function() {
                $.bbq.pushState({'ls': 'list'});
            });

            $mylibrary_show_grid.click(function() {
                $.bbq.pushState({'ls': 'grid'});
            });
        };

        ////////////////////////////////////////////
        // Data retrieval and rendering functions //
        ////////////////////////////////////////////

        /**
         * Process library item results from the server
         */
        var handleLibraryItems = function(results, callback) {
            sakai.api.Content.prepareContentForRender(results, sakai.data.me, function(contentResults) {
                if (contentResults.length > 0) {
                    callback(contentResults);
                    showHideTopControls(true);
                    $mylibrary_empty.hide();
                    $mylibrary_items.show();
                } else {
                    callback([]);
                }
            });
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var initGroupLibrary = function() {
            sakai.api.Server.loadJSON('/system/userManager/group/' +  mylibrary.contextId + '.json', function(success, data) {
                if (success) {
                    currentGroup = data;
                    var contextName = sakai.api.Util.Security.safeOutput(currentGroup.properties['sakai:group-title']);
                    mylibrary.isOwnerViewing = sakai.api.Groups.isCurrentUserAManager(currentGroup.properties['sakai:group-id'], sakai.data.me, currentGroup.properties);
                    mylibrary.isMemberViewing = sakai.api.Groups.isCurrentUserAMember(currentGroup.properties['sakai:group-id'], sakai.data.me);
                    finishInit(contextName, true);
                }
            });
        };

        var initUserLibrary = function() {
            mylibrary.contextId = sakai_global.profile.main.data.userid;
            var contextName = sakai.api.User.getFirstName(sakai_global.profile.main.data);
            if (mylibrary.contextId === sakai.data.me.user.userid) {
                mylibrary.isOwnerViewing = true;
            }
            finishInit(contextName, false);
        };

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function() {
            mylibrary.contextId = '';

            // We embed the deletecontent widget, so make sure it's loaded
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid, false);

            if (widgetData && widgetData.mylibrary) {
                mylibrary.contextId = widgetData.mylibrary.groupid;
                initGroupLibrary();
            } else if (sakai_global.group && sakai_global.group.groupId) {
                mylibrary.contextId = sakai_global.group.groupId;
                initGroupLibrary();
            } else {
                initUserLibrary();
            }
        };

        /**
         * Additional set-up of the widget
         */
        var finishInit = function(contextName, isGroup) {
            if (mylibrary.contextId) {
                mylibrary.default_search_text = getPersonalizedText('SEARCH_YOUR_LIBRARY');
                mylibrary.currentPagenum = 1;
                mylibrary.listStyle = $.bbq.getState('ls') || 'list';
                handleHashChange(null, true);
                renderLibraryTitle(contextName, isGroup);
            } else {
                debug.warn('No user found for My Library');
            }
            addBinding();
        };

        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('mylibrary');
});
