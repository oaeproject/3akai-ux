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

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.inserter
     *
     * @class inserter
     *
     * @description
     * The inserter makes it possible to insert content from your library and
     * enhances the content authoring experience.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.inserter = function (tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);
        var hasInitialised = false;
        var libraryData = [];
        var library = false;
        var infinityContentScroll = false;
        var infinityCollectionScroll = false;
        var contentListDisplayed = [];
        var prevQ = '';
        var inCollection = false;
        var filesToUpload = [];
        var focusCreateNew = false;
        var contentToAdd = [];
        var topMargin = sakai.config.enableBranding ? $('.branding_widget').height() + 50 : 50;
        var $dropTarget = false;
        var numberOfItemsDropped = 0;
        var itemsDropped = [];
        widgetPos = {
            'left': 15,
            'top': topMargin
        };

        // UI Elements
        var inserterToggle = '.inserter_toggle';
        var inserterCollectionContentSearch = '#inserter_collection_content_search';
        var $inserterMimetypeFilter = $('#inserter_mimetype_filter', $rootel);
        var inserterCreateCollectionInput = '#inserter_create_collection_input';
        var topnavToggle = '#topnavigation_container .inserter_toggle';
        var inserterAllCollectionsButton = '#inserter_all_collections_button';
        var inserterMimetypeFilter = '#inserter_mimetype_filter';

        // Containers
        var $inserterWidget = $('.inserter_widget', $rootel);
        var $inserterHeader = $('#inserter_header', $rootel);
        var $inserterHeaderTitleContainer = $('#inserter_header_title_container', $rootel);
        var $inserterInitContainer = $('#inserter_init_container', $rootel);
        var $inserterCollectionInfiniteScrollContainer = $('#inserter_collection_infinitescroll_container', $rootel);
        var $inserterCollectionInfiniteScrollContainerList = '#inserter_collection_infinitescroll_container ul';
        var $inserterCollectionContentContainer = $('#inserter_collection_content_container', $rootel);
        var $inserterCollectionItemsList = $('.inserter_collections_top_container ul', $rootel);
        var $inserterCollectionItemsListItem = $('.inserter_collections_top_container ul li', $rootel);
        var $inserterContentInfiniteScrollContainerList = $('#inserter_content_infinitescroll_container ul', $rootel);
        var $inserterContentInfiniteScrollContainer = $('#inserter_content_infinitescroll_container', $rootel);
        var $inserterNoResultsContainer = $('#inserter_no_results_container', $rootel);

        // Templates
        var inserterHeaderTemplate = 'inserter_header_title_template';
        var inserterInitTemplate = 'inserter_init_template';
        var inserterCollectionContentTemplate = 'inserter_collection_content_template';
        var inserterNoResultsTemplate = 'inserter_no_results_template';


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Opens/closes the inserter
         */
        var toggleInserter = function() {
            $inserterWidget.fadeToggle(250);
            $(topnavToggle).toggleClass('inserter_toggle_active');
            if (!hasInitialised) {
                doInit();
                hasInitialised = true;
            } else if (focusCreateNew) {
                $(inserterCreateCollectionInput).focus();
            }
            refreshWidget();
        };

        /**
         * Search through the list based on the title of the document
         * @param {Object} ev Event object from search input field keyup action
         */
        var searchCollection = function(ev) {
            if ((ev.keyCode === $.ui.keyCode.ENTER || $(ev.target).hasClass('s3d-search-button')) && prevQ !== $.trim($(inserterCollectionContentSearch, $rootel).val())) {
                prevQ = $.trim($(inserterCollectionContentSearch, $rootel).val());
                showCollection(contentListDisplayed);
            }
        };

        /**
         * Disables/Enables the header input and select elements
         * @param {Boolean} disable True or false depending on if the search should be enabled or not
         */
        var disableEnableHeader = function(disable) {
            if (disable) {
                $(inserterCollectionContentSearch, $rootel).attr('disabled', 'true');
                $(inserterCollectionContentSearch).next().attr('disabled', 'true');
                $inserterMimetypeFilter.attr('disabled', 'true');
            } else {
                $(inserterCollectionContentSearch, $rootel).removeAttr('disabled');
                $(inserterCollectionContentSearch).next().removeAttr('disabled');
                $inserterMimetypeFilter.removeAttr('disabled');
            }
        };

        /**
         * Renders the header for each context
         * @param {String} context if context is 'library' the library header will be rendered, other header has collection title.
         * @param {Object} item Object containing the data of the collection to be shown
         */
        var renderHeader = function(context, item) {
            sakai.data.me.user.properties.contentCount = sakai.data.me.user.properties.contentCount || 0;
            $inserterHeaderTitleContainer.css('opacity', 0);
            sakai.api.Util.TemplateRenderer(inserterHeaderTemplate, {
                'context': context,
                'item': item,
                'librarycount': sakai.data.me.user.properties.contentCount,
                'sakai': sakai
            }, $inserterHeaderTitleContainer);
            $inserterHeaderTitleContainer.animate({
                'opacity': 1
            }, 400);
        };

        /**
         * Kills off the infinite scroll instances on the page
         */
        var killInfiniteScroll = function() {
            libraryData = [];
            if (infinityContentScroll) {
                infinityContentScroll.kill();
                infinityContentScroll = false;
            }
            if (infinityCollectionScroll) {
                infinityCollectionScroll.kill();
                infinityCollectionScroll = false;
            }
        };

        /**
         * Reset the UI to the initial state
         */
        var refreshWidget = function() {
            killInfiniteScroll();
            inCollection = false;
            disableEnableHeader(false);
            renderHeader('init');
            library = false;
            $(inserterCollectionContentSearch, $rootel).val('');
            $inserterMimetypeFilter.val($('options:first', $inserterMimetypeFilter).val());
            animateUIElements('reset');
            doInit();
        };

        /**
         * Animate different UI elements according to the context of the widget
         * @param {String} context Context the widget is in
         */
        var animateUIElements = function(context) {
            switch (context) {
                case 'reset':
                    $inserterCollectionContentContainer.animate({
                        'opacity': 0
                    }, 400, function() {
                        $inserterCollectionContentContainer.hide();
                        $inserterInitContainer.show();
                        $inserterInitContainer.animate({
                            'opacity': 1
                        }, 400);
                    });
                    break;
                case 'results':
                    $inserterInitContainer.animate({
                        'opacity': 0
                    }, 400, function() {
                        $inserterInitContainer.hide();
                        $inserterCollectionContentContainer.show();
                        $inserterCollectionContentContainer.animate({
                            'opacity': 1
                        }, 400);
                    });
                    break;
            }
        };

        /**
         * Process library item results from the server
         * @param {Object} results Results fetched by the infinite scroller
         * @param {Function} callback callback executed in the infinite scroller
         */
        var handleLibraryItems = function (results, callback) {
            sakai.api.Content.prepareContentForRender(results, sakai.data.me, function(contentResults) {
                $.each(sakai.data.me.groups, function(index, group) {
                    $.each(contentResults, function(i, item) {
                        if (group['sakai:category'] === 'collection' && group.groupid === 'c-' + item._path) {
                            item.counts = {
                                contentCount: group.counts.contentCount
                            };
                            libraryData.push(item);
                        }
                    });
                });
                callback(contentResults);
            });
        };

        /**
         * Reduces the count of items in the library, depends on amount of deleted items
         * @param {Object} ev Event sent out by the deletecontent widget after deletion of content is completed
         * @param {Array} deletedContent Array of IDs that were deleted from the library
         */
        var removeFromCollectionCount = function(ev, deletedContent) {
            sakai.data.me.user.properties.contentCount -= deletedContent.length;
            var $libraryCountEl = $('#inserter_init_container ul li[data-collection-id="library"] .inserter_item_count_container', $rootel);
            $libraryCountEl.text(sakai.data.me.user.properties.contentCount);
        };

        /**
         * Adds to the count of items in the collection's library
         * @param {String} collectionId The id of the collection to increase the count of (cached variable)
         * @param {int} amount Total amount of dropped items to add to the count
         * @param {Boolean} inLibrary Indicates if the dropped content is already in the personal library
         */
        var addToCollectionCount = function(collectionId, amount, inLibrary) {
            // If no content was uploaded previously, initialize contentCount variable
            sakai.data.me.user.properties.contentCount = sakai.data.me.user.properties.contentCount || 0;

            // If content was not in library yet, update counts for the library
            if (!inLibrary) {
                sakai.data.me.user.properties.contentCount += amount;
                // Display library the counts in the UI
                var $libraryCountEl = $('#inserter_init_container ul li[data-collection-id="library"] .inserter_item_count_container', $rootel);
                $libraryCountEl.text(sakai.data.me.user.properties.contentCount);
                // Update the left hand nav library count
                $(window).trigger('lhnav.updateCount', ['library', amount, true]);
            }

            // We need to update collection variables if that is where it was dropped
            if (collectionId !== 'library' && sakai.data.me.user.userid !== collectionId) {
                $.each(sakai.data.me.groups, function(index, group) {
                    if (group['sakai:category'] === 'collection' && group.groupid === 'c-' + collectionId) {
                        // Display the collection counts in the UI
                        var $collectionCountEl = $('#inserter_init_container ul li[data-collection-id="' + collectionId + '"] .inserter_item_count_container', $rootel);
                        $collectionCountEl.text(group.counts.contentCount + amount);

                        // Update the header of a collection if necessary
                        if (inCollection) {
                            $('#inserter_header_itemcount > #inserter_header_itemcount_count', $rootel).text(
                                group.counts.contentCount + amount);
                        }
                    }
                });
                $.each(libraryData, function(i, item) {
                    if (item._path === collectionId) {
                        item.counts.contentCount += amount;
                    }
                });
            } else {
                // Update the header of the library if necessary
                if (inCollection) {
                    $('#inserter_header_itemcount > #inserter_header_itemcount_count', $rootel).text(
                        sakai.data.me.user.properties.contentCount);
                }
            }
        };

        /**
         * Creates a new, empty, collections with the given name and opens it in the inserter
         * @param {String} title Title to give to the new collection
         */
        var createNewCollection = function(title) {
            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('CREATING_YOUR_COLLECTION', 'inserter'), sakai.api.i18n.getValueForKey('WONT_BE_LONG', 'inserter'));
            title = title || sakai.api.i18n.getValueForKey('UNTITLED_COLLECTION', 'inserter');
            var permissions = 'public';
            sakai.api.Content.Collections.createCollection(title, '', permissions, [], contentToAdd, [], function() {
                contentToAdd = [];
                $(window).trigger('sakai.collections.created');
                sakai.api.Util.progressIndicator.hideProgressIndicator();
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('COLLECTION_CREATED'), sakai.api.i18n.getValueForKey('COLLECTION_CREATED_LONG'));
                $(inserterCreateCollectionInput, $rootel).val('');
                $(window).trigger('sakai.mylibrary.createdCollections', {
                    items: ['newcollection']
                });
                addToCollectionCount('library', 1, false);
                // Update the left hand nav library count
                $(window).trigger('lhnav.updateCount', ['library', 1, true]);
            });
        };

        /**
         * Adds validation to the form that creates a new collection
         */
        var validateNewCollectionForm = function() {
            var validateOpts = {
                messages: {
                    inserter_create_collection_input: {
                        required: sakai.api.i18n.getValueForKey('PROVIDE_A_TITLE_FOR_THE_NEW_COLLECTION', 'inserter')
                    }
                },
                submitHandler: function(form, validator) {
                    createNewCollection($.trim($(inserterCreateCollectionInput, $rootel).val()));
                    return false;
                }
            };
            sakai.api.Util.Forms.validate($('#inserter_create_collection_form', $rootel), validateOpts, false);
        };

        /**
         * Executed when a collection is clicked in the list
         * Shows that collection (library or other collection)
         * @param {Object} ev Click event generated by clicking a collection list item
         */
        var collectionClicked = function(ev) {
            if (!inCollection) {
                animateUIElements('results');
                var idToShow = $(this).attr('data-collection-id');
                if (idToShow === 'library') {
                    renderHeader('items', idToShow);
                    showCollection(idToShow);
                } else {
                    $.each(libraryData, function(i, item) {
                        if (item._path === idToShow) {
                            renderHeader('items', item);
                            showCollection(item);
                        }
                    });
                }
            }
        };


        ////////////////////////////
        // Drag and drop handling //
        ////////////////////////////

        /**
         * Add a batch of dropped items to a given collection
         * @param {String} collectionId ID of the collection to add the items to
         * @param {Array} collectedCollections Array of collected collection IDs
         * @param {Array} collectedContent Array of collected content IDs
         */
        var addDroppedToIndependentCollection = function(collectionId, collectedCollections, collectedContent) {
            // Add dropped content to the collection
            sakai.api.Content.Collections.addToCollection(collectionId, collectedContent, function() {
                // Share the collections that were dropped
                sakai.api.Content.Collections.shareCollection(collectedCollections,
                    sakai.api.Content.Collections.getCollectionGroupId(collectionId), false, function() {
                    // Count was updated in the addToCollection API function
                    // but needs to be reflected in the widget
                    $.each(libraryData, function(i, item) {
                        if (item._path === collectionId) {
                            item.counts.contentCount += collectedContent.length;
                        }
                    });
                    addToCollectionCount(collectionId, 0, true);
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                    if (inCollection) {
                        $.each(sakai.data.me.groups, function(index, item) {
                            if (item['sakai:category'] === 'collection' &&
                                !item['sakai:pseudoGroup'] &&
                                item['sakai:group-id'] === 'c-' + collectionId) {
                                contentListDisplayed = item;
                                contentListDisplayed._path = collectionId;
                            }
                        });
                        showCollection(contentListDisplayed);
                    } else {
                        animateUIElements('reset');
                    }
                });
            });
        };

        /**
         * Add a batch of dropped items to my library
         * @param {String} collectionId ID of the collection to add the items to
         * @param {Array} collectedCollections Array of collected collection IDs
         * @param {Array} collectedContent Array of collected content IDs
         */
        var addDroppedToMyLibrary = function(collectionId, collectedCollections, collectedContent) {
            $.each(collectedCollections, function(i, collection) {
                sakai.api.Content.addToLibrary(collection, sakai.data.me.user.userid, false, function() {
                    addToCollectionCount(collectionId, 1, false);
                });
            });
            $.each(collectedContent, function(i, content) {
                sakai.api.Content.addToLibrary(content, sakai.data.me.user.userid, false, function() {
                    addToCollectionCount(collectionId, 1, false);
                });
            });
            if (inCollection) {
                showCollection(contentListDisplayed);
            }
            sakai.api.Util.progressIndicator.hideProgressIndicator();
        };

        /**
         * Add a dropped content item to the collection (used for drag and drop inside of window, not from desktop)
         * @param {Object} ev Event fired by dropping a content item onto the list
         * @param {Object} data The data received from the event
         * @param {Object} target jQuery object indicating the drop target
         */
        var addDroppedToCollection = function(ev, data, target) {
            var collectionId = target.attr('data-collection-id');
            var collectedContent = [];
            var collectedCollections = [];
            $.each(data, function(index, item) {
                if (item.collection) {
                    collectedCollections.push(item.entityid);
                } else {
                    collectedContent.push(item.entityid);
                }
            });
            if (collectedContent.length + collectedCollections.length > 0) {
                sakai.api.Util.progressIndicator.showProgressIndicator(
                    sakai.api.i18n.getValueForKey('UPLOADING_CONTENT_ADDING_TO_COLLECTION', 'inserter'),
                    sakai.api.i18n.getValueForKey('WONT_BE_LONG', 'inserter'));
                // If the collection the content was added to is not the user's library
                // share the content with that collection
                // If it is the library execute different API functions
                if (collectionId !== 'library' && collectionId !== sakai.data.me.user.userid) {
                    addDroppedToIndependentCollection(collectionId, collectedCollections, collectedContent);
                } else {
                    addDroppedToMyLibrary(collectionId, collectedCollections, collectedContent);
                }
            }
        };

        /**
         * Upload a set of files dropped onto the inserter lists
         * @param {String} collectionId the ID of the collection to associate the content with
         * @param {String} permissions Permissions for the newly uploaded content (default to public)
         * @param {Array} itemsDropped Array of files dropped on the inserter
         */
        var setDataOnDropped = function(collectionId, permissions, itemsDropped) {
            var batchRequests = [];
            var itemIDs = [];
            $.each(itemsDropped, function(index, item) {
                var splitOnDot = item.item['sakai:pooled-content-file-name'].split('.');
                // Set initial version
                batchRequests.push({
                    'url': '/p/' + item.poolId + '.save.json',
                    'method': 'POST'
                });
                batchRequests.push({
                    'url': '/p/' + item.poolId,
                    'method': 'POST',
                    'parameters': {
                        'sakai:permissions': permissions,
                        'sakai:copyright': 'creativecommons',
                        'sakai:allowcomments': 'true',
                        'sakai:showcomments': 'true',
                        'sakai:fileextension': splitOnDot[splitOnDot.length -1]
                    }
                });

                itemIDs.push(item.poolId);
                item.hashpath = item.poolId;
                item.permissions = permissions;
            });
            sakai.api.Server.batch(batchRequests, function(success, response) {
                // Set the correct file permissions
                sakai.api.Content.setFilePermissions(itemsDropped, function() {
                    // Add it to the collection
                    if (collectionId !== 'library') {
                        sakai.api.Content.Collections.addToCollection(collectionId, itemIDs, function() {
                            addToCollectionCount(collectionId, itemsDropped.length, false);
                            if (inCollection) {
                                showCollection(contentListDisplayed);
                            }
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                        });
                    } else {
                        addToCollectionCount(collectionId, itemsDropped.length, false);
                        if (inCollection) {
                            showCollection(contentListDisplayed);
                        }
                        sakai.api.Util.progressIndicator.hideProgressIndicator();
                    }
                });
            });
        };

        /**
         * Handles dropping items and applying the fileupload functionality
         */
        var addDnDToElements = function() {
            // Initialize drag and drop from desktop
            $('#inserter_collector', $rootel).fileupload({
                url: '/system/pool/createfile',
                drop: function(ev, data) {
                    $dropTarget = $(ev.currentTarget);
                    var error = false;
                    $.each(data.files, function(index, file) {
                        if (file.size > 0) {
                            numberOfItemsDropped++;
                        } else {
                            error = true;
                        }
                    });
                    if (error) {
                        sakai.api.Util.notification.show(
                            sakai.api.i18n.getValueForKey('DRAG_AND_DROP_ERROR', 'inserter'),
                            sakai.api.i18n.getValueForKey('ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR', 'inserter'));
                    }
                    if (numberOfItemsDropped) {
                        sakai.api.Util.progressIndicator.showProgressIndicator(
                            sakai.api.i18n.getValueForKey('UPLOADING_CONTENT_ADDING_TO_COLLECTION', 'inserter'),
                            sakai.api.i18n.getValueForKey('WONT_BE_LONG', 'inserter'));
                    }
                },
                dropZone: $('#inserter_collector ul li,#inserter_collector .s3d-no-results-container', $rootel),
                done: function(ev, data) {
                    var result = $.parseJSON(data.result);
                    itemsDropped.push(result[data.files[0].name]);
                    if (itemsDropped.length && itemsDropped.length === numberOfItemsDropped) {
                        var collectionId = $dropTarget.attr('data-collection-id');
                        setDataOnDropped(collectionId, 'public', itemsDropped);
                        numberOfItemsDropped = 0;
                        itemsDropped = [];
                    }
                }
            });
        };


        ////////////////////////
        // Infinite scrolling //
        ////////////////////////

        /**
         * Processes an empty infinite scroll list and displays the appropriate message
         */
        var emptyCollectionList = function() {
            var mimetype = $inserterMimetypeFilter.val() || '';
            disableEnableHeader(!$.trim($(inserterCollectionContentSearch, $rootel).val()) && !mimetype);
            var query = $.trim($(inserterCollectionContentSearch, $rootel).val());
            var libraryId = false;
            if (!contentListDisplayed.length) {
                libraryId = sakai.data.me.user.userid;
            }
            if (!$inserterMimetypeFilter.val() || query) {
                sakai.api.Util.TemplateRenderer(inserterNoResultsTemplate, {
                    'search': query,
                    'collection': libraryId || sakai.api.Content.Collections.getCollectionGroupId(contentListDisplayed).replace('c-', '')
                }, $inserterNoResultsContainer);
                $inserterNoResultsContainer.show();
            } else {
                query = $.trim($(inserterCollectionContentSearch, $rootel).val());
                sakai.api.Util.TemplateRenderer(inserterNoResultsTemplate, {
                    'search': 'mimetypesearch',
                    'collection': libraryId || sakai.api.Content.Collections.getCollectionGroupId(contentListDisplayed).replace('c-', '')
                }, $inserterNoResultsContainer);
                $inserterNoResultsContainer.show();
            }
            sakai.api.Util.Droppable.setupDroppable({
                'scope': 'content'
            }, $inserterNoResultsContainer);
            addDnDToElements();
        };

        /**
         * Function executed after the infinite scroll list has been rendered
         * Makes list elements drag and droppable
         */
        var collectionListPostRender = function() {
            // post renderer
            $inserterNoResultsContainer.hide();
            sakai.api.Util.Draggable.setupDraggable({
                connectToSortable: '.contentauthoring_cell_content'
            }, $inserterContentInfiniteScrollContainerList);
            sakai.api.Util.Droppable.setupDroppable({
                scope: 'content'
            }, $inserterContentInfiniteScrollContainerList);
            addDnDToElements();
            animateUIElements('results');
        };

        /**
         * Show the collection of items
         * @param {Object} item Contains data about the collection to be loaded
         */
        var showCollection = function(item) {
            inCollection = true;
            var query = $.trim($(inserterCollectionContentSearch, $rootel).val()) || '*';
            var mimetype = $inserterMimetypeFilter.val() || '';

            var params = {
                sortOn: '_lastModified',
                sortOrder: 'desc',
                q: query,
                mimetype: mimetype
            };
            if (item === 'library' || library) {
                library = true;
                params.userid = sakai.data.me.user.userid;
            } else {
                library = false;
                contentListDisplayed = item._path || item;
                params.userid = sakai.api.Content.Collections.getCollectionGroupId(contentListDisplayed);
            }

            // Disable the previous infinite scroll
            killInfiniteScroll();
            infinityContentScroll = $inserterCollectionItemsList.infinitescroll(
                sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                params,
                function(items, total) {
                    disableEnableHeader(false);
                    return sakai.api.Util.TemplateRenderer(inserterCollectionContentTemplate, {
                        items: items,
                        collection: params.userid.replace('c-', ''),
                        sakai: sakai
                    });
                },
                emptyCollectionList,
                sakai.config.URL.INFINITE_LOADING_ICON,
                handleLibraryItems,
                collectionListPostRender,
                sakai.api.Content.getNewList(contentListDisplayed),
                false,
                $inserterContentInfiniteScrollContainer
            );
        };

        /**
         * Fetch the user's library and render an infinite scroll
         */
        var fetchLibrary = function() {
            var params = {
                sortOn: '_lastModified',
                sortOrder: 'desc',
                q: '',
                mimetype: 'x-sakai/collection'
            };
            // Disable the previous infinite scroll
            killInfiniteScroll();
            infinityCollectionScroll = $inserterCollectionInfiniteScrollContainerList.infinitescroll(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER, params, function(items, total) {
                // render
                return sakai.api.Util.TemplateRenderer(inserterInitTemplate, {
                    collections: items,
                    sakai: sakai
                });
            }, function() {
                // empty list processor
            }, sakai.config.URL.INFINITE_LOADING_ICON, handleLibraryItems, function() {
                // post renderer
                animateUIElements('reset');
                sakai.api.Util.Draggable.setupDraggable({
                    connectToSortable: '.contentauthoring_cell_content'
                }, $inserterInitContainer);
                sakai.api.Util.Droppable.setupDroppable({
                    scope: 'content'
                }, $inserterInitContainer);
                addDnDToElements();
            }, function() {
                sakai.api.Content.getNewList(contentListDisplayed);
            }, function() {
                // initial callback
            }, $inserterCollectionInfiniteScrollContainer);
        };

        /**
         * Opens the inserter and focuses the new collection input
         * @param {ev} ev Event catched that opens the inserter
         * @param {data} data Contains content items to be associated with the new collection
         */
        var openAddNewCollection = function(ev, data) {
            focusCreateNew = true;
            contentToAdd = data;
            if (!$inserterWidget.is(':visible')) {
                toggleInserter();
            } else {
                renderHeader('init');
                animateUIElements('reset');
                inCollection = false;
                $(inserterCreateCollectionInput).focus();
            }
        };

        /**
         * Checks the position of the inserter on scroll and adjusts if necessary
         */
        var checkInserterPosition = function() {
            if ($(window).scrollTop() <= topMargin && $inserterWidget.offset().top < topMargin) {
                $inserterWidget.animate({
                    'top': topMargin
                }, 200);
            }
        };


        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Add binding to various elements of the widget
         */
        var addBinding = function() {
            $(window).on('click', '#subnavigation_add_collection_link', openAddNewCollection);
            $(window).on('create.collections.sakai', openAddNewCollection);
            $(window).on('done.deletecontent.sakai', removeFromCollectionCount);
            $(window).on('done.newaddcontent.sakai', function() {
                addToCollectionCount('library', 0, false);
            });
            $(window).on('sakai.mylibrary.deletedCollections', function(ev, data) {
                if (infinityCollectionScroll) {
                    infinityCollectionScroll.removeItems(data.items);
                }
            });
            $(window).on('start.drag.sakai', function() {
                if (!$inserterWidget.is(':visible')) {
                    toggleInserter();
                }
            });
            $(window).on('click', inserterToggle, toggleInserter);
            $inserterCollectionInfiniteScrollContainer.on('click', 'li', collectionClicked);
            $inserterCollectionContentContainer.on('click', inserterAllCollectionsButton, refreshWidget);
            $inserterCollectionContentContainer.on('keyup', inserterCollectionContentSearch, searchCollection);
            $inserterCollectionContentContainer.on('click', '.s3d-search-button', searchCollection);
            $inserterCollectionContentContainer.on('change', inserterMimetypeFilter, function() {
                showCollection(contentListDisplayed);
            });
            $(window).off('sakai.collections.created').on('sakai.collections.created', refreshWidget);
            $(window).off('sakai.inserter.dropevent').on('sakai.inserter.dropevent', addDroppedToCollection);
            $(window).off('scroll').on('scroll', checkInserterPosition);
        };

        /**
         * Initialize the inserter widget
         */
        var doInit = function() {
            $inserterCollectionContentContainer.hide();
            $inserterWidget.css('top', topMargin);
            $inserterWidget.draggable({
                cancel: 'div#inserter_collector',
                stop: function(ev) {
                    // Calculate the position of the widget and reset its position when
                    // it goes out of bounds
                    var elOffset = $(ev.target).offset();
                    var wHeight = $(window).height();
                    var wWidth = $(window).width();
                    var iHeight= $inserterWidget.height();
                    var iWidth = $inserterWidget.width();
                    var borderMargin = 15;
                    if (elOffset) {
                        // Overlaps left window border
                        if (elOffset.left <= 0) {
                            $inserterWidget.css('left', borderMargin);
                        }
                        // Overlaps right window border
                        if (elOffset.left > wWidth - iWidth) {
                            $inserterWidget.css('left', wWidth - iWidth - borderMargin);
                        }
                        // Overlaps top window border or topnavigation
                        if (elOffset.top < topMargin) {
                            $inserterWidget.css('top', topMargin);
                        }
                        // Overlaps bottom window border
                        if (elOffset.top > $(window).scrollTop() + wHeight - iHeight) {
                            $inserterWidget.css('top', wHeight - iHeight - borderMargin);
                        }
                        // Store new position
                        widgetPos = {
                            'left': $inserterWidget.css('left'),
                            'top': $inserterWidget.css('top')
                        };
                    } else {
                        $inserterWidget.css({
                            'left': widgetPos.left,
                            'top': widgetPos.top
                        });
                    }
                }
            });
            renderHeader('init');
            sakai.api.Util.TemplateRenderer('inserter_init_prescroll_template', {
                sakai: sakai
            }, $inserterCollectionInfiniteScrollContainer);
            $inserterCollectionInfiniteScrollContainerList = $($inserterCollectionInfiniteScrollContainerList, $rootel);
            validateNewCollectionForm();
            fetchLibrary();
            if (focusCreateNew) {
                $(inserterCreateCollectionInput).focus();
            }
        };

        addBinding();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('inserter');
});