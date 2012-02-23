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

        // UI Elements
        var $inserterTogle = $('.inserter_toggle');
        var $inserterAllCollectionsButton = $('#inserter_all_collections_button', $rootel);
        var inserterCollectionContentSearch = '#inserter_collection_content_search';
        var $inserterMimetypeFilter = $('#inserter_mimetype_filter', $rootel);
        var inserterCreateCollectionInput = '#inserter_create_collection_input';
        var topnavToggle = '#topnavigation_container .inserter_toggle';

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
            if ($(topnavToggle).hasClass('inserter_toggle_active')){
                $(topnavToggle).removeClass('inserter_toggle_active');
            } else {
                $(topnavToggle).addClass('inserter_toggle_active');
            }
            if (!hasInitialised) {
                doInit();
                hasInitialised = true;
            } else if (focusCreateNew){
                $(inserterCreateCollectionInput).focus();
            }
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
            if (disable){
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
            $inserterHeaderTitleContainer.animate({
                'opacity': 0
            }, 0, function() {
                sakai.api.Util.TemplateRenderer(inserterHeaderTemplate, {
                    'context': context,
                    'item': item,
                    'librarycount': sakai.data.me.user.properties.contentCount,
                    sakai: sakai
                }, $inserterHeaderTitleContainer);
                $inserterHeaderTitleContainer.animate({
                    'opacity': 1
                }, 400);
            });
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
            switch (context){
                case 'init':
                    $inserterWidget.animate({
                        'height': $inserterInitContainer.height() + $inserterHeader.height() + 10
                    });
                    break;
                case 'reset':
                    $inserterInitContainer.animate({
                        'margin-left': 5,
                        'opacity': 1
                    }, 400 );
                    $inserterCollectionContentContainer.animate({
                        'margin-left': 240,
                        'opacity': 0
                    }, 400 );
                    $inserterWidget.animate({
                        'height': $inserterInitContainer.height() + $inserterHeader.height() + 10
                    });
                    break;
                case 'noresults':
                    $inserterWidget.animate({
                        'height': $inserterNoResultsContainer.height() + $inserterHeader.height() + 80
                    });
                    break;
                case 'results':
                    $inserterInitContainer.animate({
                        'margin-left': -240,
                        'opacity': 0
                    }, 400 );
                    $inserterCollectionContentContainer.css('margin-left', 240);
                    $inserterCollectionContentContainer.animate({
                        'margin-left': 5,
                        'opacity': 1
                    }, 400 );
                    $inserterWidget.animate({
                        'height': $inserterCollectionContentContainer.height() + $inserterHeader.height() + 10
                    });
                    break;
            }
        };

        /**
         * Process library item results from the server
         * @param results {Object} Results fetched by the infinite scroller
         * @param callback {Function} callback executed in the infinite scroller
         */
        var handleLibraryItems = function (results, callback) {
            sakai.api.Content.prepareContentForRender(results, sakai.data.me, function(contentResults){
                $.each(sakai.data.me.groups, function(index, group){
                    $.each(contentResults, function(i, item){
                        if (group['sakai:category'] === 'collection' && group.groupid === 'c-' + item._path){
                            item.counts = {
                                contentCount: group.counts.contentCount
                            }
                            libraryData.push(item);
                        }
                    });
                });
                if (contentResults.length > 0){
                    callback(contentResults);
                } else {
                    callback([]);
                }
            });
        };

        /**
         * Adds to the count of items in the collection's library
         * @param collectionId {Object} The id of the collection to increase the count of (cached variable)
         * @param amount {int} Total amount of dropped items to add to the count
         */
        var addToCollectionCount = function(collectionId, amount) {
            var $contentCountEl = $('#inserter_init_container ul li[data-collection-id="' + collectionId + '"] .inserter_item_count_container', $rootel);
            var currentAmount = parseInt($contentCountEl.text(), 10);
            $contentCountEl.text('' + (currentAmount + amount));
            $.each(sakai.data.me.groups, function(index, group){
                if (group['sakai:category'] === 'collection' && group.groupid === 'c-' + collectionId){
                    sakai.data.me.groups[index].counts.contentCount += amount;
                    sakai.data.me.user.properties.contentCount += amount;
                }
            });
            $.each(libraryData, function(i, item){
                if (item._path === collectionId){
                    item.counts.contentCount += amount;
                }
            });
            if (inCollection){
                var count = parseInt($('#inserter_header_itemcount > span', $rootel).text());
                $('#inserter_header_itemcount > span', $rootel).text(count + amount);
            }
        };

        /**
         * Creates a new, empty, collections with the given name and opens it in the inserter
         * @param title {String} Title to give to the new collection
         */
        var createNewCollection = function(title) {
            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('CREATING_YOUR_COLLECTION', 'inserter'), sakai.api.i18n.getValueForKey('WONT_BE_LONG', 'inserter'));
            var title = title || sakai.api.i18n.getValueForKey('UNTITLED_COLLECTION', 'inserter');
            var permissions = 'public';
            sakai.api.Content.Collections.createCollection(title, '', permissions, [], [], [], function() {
                $(window).trigger('sakai.collections.created');
                sakai.api.Util.progressIndicator.hideProgressIndicator();
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('COLLECTION_CREATED'), sakai.api.i18n.getValueForKey('COLLECTION_CREATED_LONG'));
                $(inserterCreateCollectionInput, $rootel).val('');
                $(window).trigger('sakai.mylibrary.createdCollections', {
                    items: ['newcollection']
                });
            });
        };

        /**
         * Animates the UI after validation
         */
        var validationComplete = function() {
            var t = setTimeout(function() {
                animateUIElements('init');
            }, 10);
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
                submitHandler: function(form, validator){
                    createNewCollection($.trim($(inserterCreateCollectionInput, $rootel).val()));
                    validationComplete();
                    return false;
                }, invalidCallback : validationComplete
            };
            sakai.api.Util.Forms.validate($('#inserter_create_collection_form', $rootel), validateOpts, false);
        };

        /**
         * Executed when a collection is clicked in the list
         * Shows that collection (library or other collection)
         */
        var collectionClicked = function() {
            if (!inCollection){
                $inserterInitContainer.animate({
                    'opacity': 0,
                    'margin-left': -240
                }, 400 );
                var idToShow = $(this).attr('data-collection-id');
                if (idToShow === 'library'){
                    renderHeader('items', idToShow);
                    showCollection(idToShow);
                } else {
                    $.each(libraryData, function(i, item){
                        if (item._path === idToShow){
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
         * Add a dropped content item to the collection (used for drag and drop inside of window, not from desktop)
         * @param ev {Object} Event fired by dropping a content item onto the list
         * @param data {Object} The data received from the event
         * @param target {Object} jQuery object indicating the drop target
         */
        var addDroppedToCollection = function(ev, data, target) {
            var collectionId = target.attr('data-collection-id');
            var collectedContent = [];
            var collectedCollections = [];
            $.each(data, function(index, item){
                if (item.collection){
                    collectedCollections.push(item.entityid);
                } else {
                    collectedContent.push(item.entityid);
                }
            });
            if (collectedContent.length + collectedCollections.length > 0) {
                sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('UPLOADING_CONTENT_ADDING_TO_COLLECTION', 'inserter'), sakai.api.i18n.getValueForKey('WONT_BE_LONG', 'inserter'));
                if (collectionId !== 'library' && collectionId !== sakai.data.me.user.userid){
                    sakai.api.Content.Collections.addToCollection(collectionId, collectedContent, function() {
                        sakai.api.Content.Collections.shareCollection(collectedCollections, sakai.api.Content.Collections.getCollectionGroupId(collectionId), false, function() {
                            setTimeout(function() {
                                addToCollectionCount(collectionId, 1);
                                sakai.api.Util.progressIndicator.hideProgressIndicator();
                                if (inCollection){
                                    $.each(sakai.data.me.groups, function(index, item){
                                        if (item['sakai:category'] === 'collection' && !item['sakai:pseudoGroup'] && item['sakai:group-id'] === 'c-' + collectionId){
                                            contentListDisplayed = item;
                                            contentListDisplayed._path = collectionId;
                                        }
                                    });
                                    showCollection(contentListDisplayed);
                                } else {
                                    animateUIElements('reset');
                                }
                            }, 1000);
                        });
                    });
                } else {
                    $.each(collectedCollections, function(i, collection){
                        sakai.api.Content.addToLibrary(collection, sakai.data.me.user.userid, false, function() {
                            addToCollectionCount(collectionId, 1);
                        });
                    });
                    $.each(collectedContent, function(i, content){
                        sakai.api.Content.addToLibrary(content, sakai.data.me.user.userid, false, function() {
                            addToCollectionCount(collectionId, 1);
                        });
                    });
                    if (inCollection){
                        showCollection(contentListDisplayed);
                    }
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            }
        };

        /**
         * Upload a set of files dropped onto the inserter lists
         * @param collectionId {String} the ID of the collection to associate the content with
         * @param permissions {String} Permissions for the newly uploaded content (default to public)
         */
        var uploadFile = function(collectionId, permissions) {
            if (filesToUpload.length){
                var fileToUpload = filesToUpload[0];
                var splitOnDot = fileToUpload.name.split('.');
                var xhReq = new XMLHttpRequest();
                xhReq.open('POST', '/system/pool/createfile', false);
                var formData = new FormData();
                formData.append('enctype', 'multipart/form-data');
                formData.append('filename', fileToUpload.name);
                formData.append('file', fileToUpload);
                xhReq.send(formData);
                if (xhReq.status === 201){
                    var data = $.parseJSON(xhReq.responseText);
                    var poolid = data[fileToUpload.name].poolId;
                    var batchRequests = [];
                    batchRequests.push({
                        'url': '/p/' + poolid,
                        'method': 'POST',
                        'parameters': {
                            'sakai:pooled-content-file-name': fileToUpload.name,
                            'sakai:permissions': permissions,
                            'sakai:copyright': 'creativecommons',
                            'sakai:allowcomments': 'true',
                            'sakai:showcomments': 'true',
                            'sakai:fileextension': splitOnDot[splitOnDot.length - 1]
                        }
                    });

                    // Set initial version
                    batchRequests.push({
                        'url': '/p/' + poolid + '.save.json',
                        'method': 'POST'
                    });

                    sakai.api.Server.batch(batchRequests, function(success, response){
                        // Set the correct file permissions
                        sakai.api.Content.setFilePermissions([{'hashpath': poolid, 'permissions': permissions}], function() {
                            // Add it to the collection
                            if (collectionId !== 'library'){
                                sakai.api.Content.Collections.addToCollection(collectionId, poolid, function() {
                                    addToCollectionCount(collectionId, 1);
                                    filesToUpload.splice(0, 1);
                                    uploadFile(collectionId, permissions);
                                });
                            } else {
                                addToCollectionCount(collectionId, 1);
                                filesToUpload.splice(0, 1);
                                uploadFile(collectionId, permissions);
                            }
                        });
                    });
                } else {
                    filesToUpload.splice(0, 1);
                    uploadFile(collectionId, permissions);
                }
            } else {
                setTimeout(function() {
                    if (inCollection){
                        showCollection(contentListDisplayed);
                    }
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }, 500);
            }
        };

        /**
         * Handler for the drop event. Checks files for folders, gives appropriate messages and
         * sends files through to the 'uploadFile' function that uploads and associates them to collections.
         * @param ev {Object} Event fired by dropping content on the inserter list
         * @param data {Object} Object containing data associated to the dropped files
         */
        var droppedDesktopItem = function(ev, data) {
            ev.stopPropagation();
            ev.preventDefault();
            if (data.files.length){
                $('.s3d-droppable-container', $rootel).removeClass('dragover');
                var collectionid = '';
                if ($(ev.target).attr('data-collection-id') || $(ev.target).parents('.s3d-droppable-container').attr('data-collection-id')){
                    collectionid = $(ev.target).attr('data-collection-id') || $(ev.target).parents('.s3d-droppable-container').attr('data-collection-id');
                }
                var error = false;
                $.each(data.files, function (index, file) {
                    if (file.size > 0){
                        filesToUpload.push(file);
                    } else {
                        error = true;
                    }
                });
                if (error) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('DRAG_AND_DROP_ERROR', 'inserter'), sakai.api.i18n.getValueForKey('ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR', 'inserter'));
                }
                if (filesToUpload.length){
                    sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('UPLOADING_CONTENT_ADDING_TO_COLLECTION', 'inserter'), sakai.api.i18n.getValueForKey('WONT_BE_LONG', 'inserter'));
                    uploadFile(collectionid, 'public');
                }
            }
        };

        /**
         * Handles dropping items and applying the fileupload functionality
         */
        var addDnDToElements = function() {
            // Initialize drag and drop from desktop
            $('#inserter_collector', $rootel).fileupload({
                url: '/system/pool/createfile',
                drop: droppedDesktopItem,
                dropZone: $('#inserter_collector ul li,#inserter_collector .s3d-no-results-container', $rootel)
            });

        };


        ////////////////////////
        // Infinite scrolling //
        ////////////////////////

        /**
         * Show the collection of items
         * @param item {Object} Contains data about the collection to be loaded
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
            infinityContentScroll = $inserterCollectionItemsList.infinitescroll(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER, params, function(items, total){
                disableEnableHeader(false);
                // render
                return sakai.api.Util.TemplateRenderer(inserterCollectionContentTemplate, {
                    items: items,
                    collection: params.userid.replace('c-', ''),
                    sakai: sakai
                });
            }, function() {
                // empty list processor
                disableEnableHeader(!$.trim($(inserterCollectionContentSearch, $rootel).val()) && !mimetype);
                var query = $.trim($(inserterCollectionContentSearch, $rootel).val());
                if (!$inserterMimetypeFilter.val() || query){
                    sakai.api.Util.TemplateRenderer(inserterNoResultsTemplate, {
                        'search': query,
                        collection: sakai.api.Content.Collections.getCollectionGroupId(contentListDisplayed).replace('c-', '')
                    }, $inserterNoResultsContainer);
                    $inserterNoResultsContainer.show();
                } else {
                    var query = $.trim($(inserterCollectionContentSearch, $rootel).val());
                    sakai.api.Util.TemplateRenderer(inserterNoResultsTemplate, {
                        'search': 'mimetypesearch',
                        collection: sakai.api.Content.Collections.getCollectionGroupId(contentListDisplayed).replace('c-', '')
                    }, $inserterNoResultsContainer);
                    $inserterNoResultsContainer.show();
                }
                sakai.api.Util.Droppable.setupDroppable({
                    scope: 'content'
                }, $inserterNoResultsContainer);
                addDnDToElements();
                animateUIElements('noresults');
            }, sakai.config.URL.INFINITE_LOADING_ICON, handleLibraryItems, function() {
                // post renderer
                $inserterNoResultsContainer.hide();
                sakai.api.Util.Draggable.setupDraggable({
                    connectToSortable: '.contentauthoring_cell_content',
                    start: function() {
                        $('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>').css({
                            width: $(document).width() + 'px', height: $(document).height() + 'px',
                            top: '0px', left: '0px',
                            position: 'absolute', opacity: '0.001', zIndex: 100000
                        }).appendTo('body');
                    },
                    stop: function() {
                        $('div.ui-resizable-iframeFix').remove();
                    }
                }, $inserterContentInfiniteScrollContainerList);
                sakai.api.Util.Droppable.setupDroppable({
                    scope: 'content'
                }, $inserterContentInfiniteScrollContainerList);
                addDnDToElements();
                if ($inserterCollectionContentContainer.css('margin-left') !== '5px'){
                    animateUIElements('results');
                } else {
                    $inserterWidget.css({
                        'height': $inserterCollectionContentContainer.height() + $inserterHeader.height() + 10
                    });
                }
            }, sakai.api.Content.getNewList(contentListDisplayed), function() {
                // initial callback
            }, $inserterContentInfiniteScrollContainer);
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
            infinityCollectionScroll = $inserterCollectionInfiniteScrollContainerList.infinitescroll(sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER, params, function(items, total){
                // render
                return sakai.api.Util.TemplateRenderer(inserterInitTemplate, {
                    collections: items,
                    sakai: sakai
                });
            }, function() {
                // empty list processor
            }, sakai.config.URL.INFINITE_LOADING_ICON, handleLibraryItems, function() {
                // post renderer
                animateUIElements('init');
                sakai.api.Util.Draggable.setupDraggable({
                    connectToSortable: '.contentauthoring_cell_content'
                }, $inserterInitContainer);
                sakai.api.Util.Droppable.setupDroppable({
                    scope: 'content'
                }, $inserterInitContainer);
                addDnDToElements();
            }, function() {
                sakai.api.Content.getNewList(contentListDisplayed)
            }, function() {
                // initial callback
            }, $inserterCollectionInfiniteScrollContainer);
        };


        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Add binding to various elements of the widget
         */
        var addBinding = function() {
            $('#subnavigation_add_collection_link').live('click', function() {
                focusCreateNew = true;
                if (!$inserterWidget.is(':visible')) {
                    toggleInserter();
                } else {
                    renderHeader('init');
                    animateUIElements('reset');
                    inCollection = false;
                    $(inserterCreateCollectionInput).focus();
                }
            });
            $(window).bind('sakai.mylibrary.deletedCollections', function(ev, data){
                if (infinityCollectionScroll){
                    infinityCollectionScroll.removeItems(data.items);
                }
            });
            $(window).bind('start.drag.sakai', function() {
                if (!$inserterWidget.is(':visible')) {
                    toggleInserter();
                }
            });
            $inserterTogle.live('click', toggleInserter);
            $inserterCollectionItemsListItem.live('click', collectionClicked);
            $inserterAllCollectionsButton.live('click', refreshWidget);
            $(inserterCollectionContentSearch, $rootel).live('keyup', searchCollection);
            $('.s3d-search-button', $rootel).live('click', searchCollection);
            $inserterMimetypeFilter.live('change', function() {
                showCollection(contentListDisplayed);
            });
            $(window).bind('sakai.collections.created', refreshWidget);
            $(window).bind('sakai.inserter.dropevent', addDroppedToCollection);
        };

        /**
         * Initialize the inserter widget
         */
        var doInit = function() {
            $inserterInitContainer.css({
                'margin-left': 5,
                'opacity': 1
            });
            $inserterCollectionContentContainer.css({
                'margin-left': 240,
                'opacity': 0
            });
            $inserterWidget.draggable({
                cancel: 'div#inserter_collector',
                stop: function(ev){
                    elOffset = $(ev.target).offset();
                    wHeight = $(window).height();
                    wWidth = $(window).width();
                    iHeight= $inserterWidget.height();
                    iWidth = $inserterWidget.width()
                    borderMargin = 15;
                    // Overlaps left window border
                    if (elOffset && elOffset.left < 0){
                        $inserterWidget.css('left', borderMargin);
                    }
                    // Overlaps right window border
                    if (elOffset.left > wWidth - iWidth){
                        $inserterWidget.css('left', wWidth - iWidth - borderMargin);
                    }
                    // Overlaps top window border or topnavigation
                    if (elOffset && elOffset.top < 50){
                        $inserterWidget.css('top', 50);
                    }
                    // Overlaps bottom window border
                    if (elOffset.top > wHeight - iHeight){
                        $inserterWidget.css('top', wHeight - iHeight - borderMargin);
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
            if (focusCreateNew){
                $(inserterCreateCollectionInput).focus();
            }
        };

        addBinding();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('inserter');
});