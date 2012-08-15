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
require(['jquery', 'sakai/sakai.api.core', 'jquery-pager'], function($, sakai) {

    /**
     * @name sakai_global.collectionviewer
     *
     * @class collectionviewer
     *
     * @description
     * Displays a collection through a variety of options
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.collectionviewer = function(tuid, showSettings, widgetData) {


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        var $rootel = $('#' + tuid);
        var $body = $('body');
        var collectionviewer = {
            listStyle: 'carousel',
            sortOn: '_lastModified',
            sortOrder: 'desc',
            total: 0,
            page: 1,
            contextId : false,
            tuidls: tuid + '-ls',
            tuidso: tuid + '-so'
        };
        var collectionData = [];
        var carouselInitialized = false;
        var fetchCollectionData = false;
        var initialload = true;
        var carouselSize = $body.hasClass('has_nav') ? 9 : 12;
        var widgetWidth = $rootel.width();
        if (widgetWidth < 300) {
            carouselSize = $body.hasClass('has_nav') ? 2 : 3;
        } else if (widgetWidth < 700) {
            carouselSize = $body.hasClass('has_nav') ? 3 : 5;
        }

        var listSize = 15;
        // previewsAllowed makes sure recursive embedding is not allowed
        var previewsAllowed = true;
        // pagePreviewDisabled disables page previews inside of collection viewers inside of a sakai doc
        var pagePreviewDisabled = true;

        // containers
        var $collectionviewerCarouselLoading = $('#collectionviewer_carousel_loading', $rootel);
        var $collectionviewerCarouselContainer = $('#collectionviewer_carousel_container', $rootel);
        var $collectionviewerExpandedContentContainer = $('#collectionviewer_expanded_content_container', $rootel);
        var $collectionviewerGridListContainer = $('#collectionviewer_grid_list_container', $rootel);


        /////////////////////////
        // RENDERING FUNCTIONS //
        /////////////////////////

        /**
         * Checks the format of a collectionId and returns the pool ID
         * @return {String} collectionId returns the collectionID as a String
         */
        var getCollectionId = function(collectionId) {
            if (collectionId.substring(0,2) === 'c-') {
                return sakai.api.Content.Collections.getCollectionPoolId(collectionId);
            } else {
                return collectionId;
            }
        };

        // CAROUSEL //
        /**
         * Adds binding for the carousel actions and buttons
         */
        var carouselBinding = function(carousel) {
            $('#collectionviewer_newer', $rootel).on('click',function() {
                carousel.prev();
                $(this).focus();
            });
            $('#collectionviewer_older', $rootel).on('click',function() {
                $(this).focus();
                carousel.next();
            });
            $('#collectionviewer_oldest', $rootel).on('click',function() {
                $(this).focus();
                carousel.scroll(carousel.size() || 0);
            });
            $('#collectionviewer_newest', $rootel).on('click',function() {
                $(this).focus();
                carousel.scroll(0);
            });
            $rootel.keyup(function(e) {
                if (e.which === $.ui.keyCode.LEFT) {
                    carousel.prev();
                }else if (e.which === $.ui.keyCode.RIGHT) {
                    carousel.next();
                }
            });
            if (carousel.size()) {
                var $selectedItem =  $('.collectionviewer_carousel_item[data-item-id="' + $.bbq.getState('item') + '"]', $rootel);
                if ($.bbq.getState('item') && $selectedItem.length) {
                    $selectedItem.click();
                } else{
                    loadCollectionItem($('.collectionviewer_carousel_item:first', $rootel).attr('data-item-id'));
                }
            }
        };

        /**
        * Renders the carousel on the page and initializes it
        */
        var renderCarousel = function() {
            sakai.api.Util.TemplateRenderer('collectionviewer_carousel_template', {
                data: collectionData,
                sakai: sakai,
                collectionName: getCollectionName(),
                collectionId: getCollectionId(collectionviewer.contextId),
                isEditor: sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId)
            }, $collectionviewerCarouselContainer);
            $('#collectionviewer_finish_editing_collection_button', $rootel).hide();
            if (sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId)) {
                $('#collectionviewer_edit_collection_button', $rootel).show();
            }
            $collectionviewerCarouselContainer.animate({
                height: 'toggle',
                opacity: 'toggle'
            }, 500);
            $collectionviewerExpandedContentContainer.animate({
                height: 'toggle',
                opacity: 'toggle'
            }, 500);
            $('.collectionviewer_controls', $rootel).hide();
            if (collectionData.length) {
                var totalItems = 0;
                $.each(collectionData, function(index, item) {
                    if (item) {
                        totalItems += item.length;
                    }
                });
                var jcarouselOptions = {
                    animation: 'slow',
                    easing: 'swing',
                    scroll: carouselSize,
                    start: 0,
                    initCallback: carouselBinding,
                    itemFallbackDimension: 123
                };
                if (totalItems > carouselSize) {
                    $('.collectionviewer_controls', $rootel).show();
                    if ($.bbq.getState('item')) {
                        jcarouselOptions.start = parseInt($('.collectionviewer_carousel_item[data-item-id="' + $.bbq.getState('item') + '"]', $rootel).attr('data-arr-index'), 10);
                    }
                }
                $('#collectionviewer_carousel', $rootel).jcarousel(jcarouselOptions);
            }
        };

        /**
         * Renders the items for a selected item in the carousel
         * @param {String} pageIndex index of the page you're currently on in the collection viewer
         * @param {String} selectedIndex index of the selected item in the carousel
         */
        var renderItemsForSelected = function(pageIndex, selectedIndex) {
            if (!isNaN(pageIndex)) {
                var selectedData = collectionData[pageIndex][selectedIndex];
                var width = parseInt($collectionviewerExpandedContentContainer.width(), 10) / 2.5 - 50;
                if (selectedData._mimeType === 'x-sakai/collection') {
                    getCollectionData('c-' + selectedData._path, false, function(data) {
                        if (data.results.fetchMultipleUserDataInWidget) {
                            delete data.results.fetchMultipleUserDataInWidget;
                        }
                        selectedData.collectionItems = data.results;
                        sakai.api.Util.TemplateRenderer('collectionviewer_list_item_template', {
                            data: selectedData,
                            sakai: sakai,
                            collectionName: getCollectionName(),
                            collectionId: getCollectionId(collectionviewer.contextId),
                            isEditor: sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId),
                            titleWidth: width,
                            pagePreviewDisabled: pagePreviewDisabled
                        }, $('#collectionviewer_expanded_content_container', $rootel));
                        if (previewsAllowed) {
                            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
                        }
                    });
                } else {
                    sakai.api.Util.TemplateRenderer('collectionviewer_list_item_template', {
                        data: selectedData,
                        sakai: sakai,
                        collectionName: getCollectionName(),
                        collectionId: getCollectionId(collectionviewer.contextId),
                        isEditor: sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId),
                        titleWidth: width,
                        pagePreviewDisabled: pagePreviewDisabled
                    }, $('#collectionviewer_expanded_content_container', $rootel));
                    if (previewsAllowed) {
                        sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
                    }
                }
            }
        };

        /**
         * Renders the edit mode for the collection
         */
        var renderEditMode = function() {
            hideContainers();
            renderGridOrList(false, true);
        };

        /**
         * Renders grid or list view for the collection
         * @param {Boolean} grid True if grid view should be rendered, false render list view
         * @param {Boolean} editMode True if the widget is in edit mode
         */
        var renderGridOrList = function(grid, editMode) {
            if (sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId)) {
                if (editMode) {
                    $('#collectionviewer_edit_collection_button', $rootel).hide();
                    $('#collectionviewer_finish_editing_collection_button', $rootel).show();
                } else {
                    $('#collectionviewer_finish_editing_collection_button', $rootel).hide();
                    $('#collectionviewer_edit_collection_button', $rootel).show();
                }
            }
            var pageNumber = collectionviewer.page - 1;
            sakai.api.Util.TemplateRenderer('collectionviewer_grid_or_list_template', {
                items: collectionData[pageNumber],
                sakai: sakai,
                grid: grid,
                editMode: editMode,
                collectionName: getCollectionName(),
                collectionId: getCollectionId(collectionviewer.contextId),
                isEditor: sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId)
            }, $collectionviewerGridListContainer);
            $collectionviewerGridListContainer.show();
            var pageCount = Math.ceil(collectionviewer.total / listSize);
            if (pageCount > 1) {
                $('#collectionviewer_paging', $rootel).show();
                $('#collectionviewer_paging', $rootel).pager({
                    pagenumber: parseInt(collectionviewer.page, 10),
                    pagecount: Math.ceil(collectionviewer.total / listSize),
                    buttonClickCallback: function(page) {
                        fetchCollectionData = false;
                        collectionviewer.page = parseInt(page, 10);
                        $.bbq.pushState({'lp': collectionviewer.page});
                    }
                });
            } else {
                $('#collectionviewer_paging', $rootel).hide();
            }
        };


        ///////////////////////
        // UTILITY FUNCTIONS //
        ///////////////////////

        /**
         * Hides the main containers
         */
        var hideContainers = function() {
            $collectionviewerCarouselLoading.hide();
            $collectionviewerCarouselContainer.hide();
            $collectionviewerExpandedContentContainer.hide();
            $collectionviewerGridListContainer.hide();
        };

        /**
         * Toggles list/grid view buttons
         */
        var toggleButtons = function(listStyle) {
            $('#collectionviewer_' + listStyle + '_view,#collectionviewer_' + listStyle + '_view > div', $rootel).addClass('selected');
        };

        /**
         * Renders the appropriate view for the widget
         */
        var showData = function() {
            hideContainers();
            switch (collectionviewer.listStyle) {
                case 'carousel':
                    renderCarousel();
                    break;
                case 'grid':
                    renderGridOrList(true);
                    break;
                case 'edit':
                    renderEditMode();
                    break;
                case 'list':
                    renderGridOrList(false);
                    break;
            }
        };

        /**
         * Gets the profile data for multiple users
         * @param {Object} data Object containing data for the user profiles to look up
         * @param {Function} callback Function to be executed on retrieval of the user profiles
         */
        var getMultipleUserData = function(data, callback) {
            var usersToFetch = [];
            $.each(data.results, function(i, user) {
                if (user['sakai:pool-content-created-for']) {
                    usersToFetch.push(user['sakai:pool-content-created-for']);
                }
            });

            sakai.api.User.getMultipleUsers(usersToFetch, function(fetchedUsers) {
                $.each(data.results, function(index, item) {
                    var userid = item['sakai:pool-content-created-for'];
                    if (userid && fetchedUsers[userid]) {
                        var displayName = sakai.api.User.getDisplayName(fetchedUsers[userid]);
                        data.results[index].ownerId = userid;
                        data.results[index].ownerDisplayName = displayName;
                        data.results[index].ownerDisplayNameShort = sakai.api.Util.applyThreeDots(displayName, 580, {
                            max_rows: 1,
                            whole_word: false
                        }, 's3d-bold', true);
                        data.results[index].ownerDisplayNameShorter = sakai.api.Util.applyThreeDots(displayName, 180, {
                            max_rows: 1,
                            whole_word: false
                        }, 's3d-bold', true);
                    }
                });
                if ($.isFunction(callback)) {
                    callback();
                }
            }, false);
        };

        /**
         * Retrieves the basic data for items in a collection
         * @param {String} userid ID of the collection to retrieve data for, if empty cache will be checked for ID
         * @param {Boolean} refresh Reloads the collection interface if set to true
         * @param {Function} callback Function executed after the data has been retrieved
         * @param {Boolean} cache If we use cache or not
         */
        var getCollectionData = function(userid, refresh, callback, _cache) {
            var cache = _cache === false ? false : true;
            toggleButtons(collectionviewer.listStyle);
            if (refresh) {
                collectionviewer.page = $.bbq.getState('lp') || 1;
                collectionData = [];
            }
            var id;
            if (userid) {
                id = userid;
            } else if (collectionviewer.contextId.substring(0, 2) === 'c-') {
                id = collectionviewer.contextId;
            } else {
                id = 'c-' + collectionviewer.contextId;
            }
            var data = {
                sortOn: 'filename',
                sortOrder: collectionviewer.sortOrder,
                userid: id,
                items: 15,
                page: (collectionviewer.page - 1)
            };
            if (collectionviewer.sortOrder === 'modified') {
                data.sortOrder = 'desc';
                data.sortOn = '_lastModified';
            }
            if (collectionviewer.listStyle === 'carousel') {
                data.items = 1000;
                data.page = 0;
            }
            if (!refresh && !$.isFunction(callback)) {
                $collectionviewerCarouselLoading.show();
            }
            $.ajax({
                url: sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                data: data,
                cache: cache,
                success: function(data) {
                    var width = parseInt($rootel.width(), 10);
                    var widthOptions = {
                        titleWidth: width - 150,
                        descriptionWidth: width - 55,
                        displayNameWidth: width - 150
                    };
                    if ($.isFunction(callback)) {
                        getMultipleUserData(data, function() {
                            data.results.fetchMultipleUserDataInWidget = true;
                            sakai.api.Content.prepareContentForRender(data.results, sakai.data.me, function(parsedContent) {
                                callback(data);
                            }, widthOptions);
                        });
                    } else {
                        $('#collectionviewer_add_content_button > div', $rootel).text(data.total);
                        collectionviewer.total = data.total;
                        if (data.results && data.results.length) {
                            getMultipleUserData(data, function() {
                                data.results.fetchMultipleUserDataInWidget = true;
                                sakai.api.Content.prepareContentForRender(data.results, sakai.data.me, function(parsedContent) {
                                    collectionData[(collectionviewer.page - 1)] = parsedContent;
                                    showData();
                                }, widthOptions);
                            });
                        } else {
                            showData();
                        }
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    $collectionviewerCarouselLoading.hide();
                }
            });
        };

        /**
         * Show comments for an item
         */
        var showComments = function() {
            if ($('.collectionviewer_collection_item_comments', $rootel).is(':visible')) {
                $('.collectionviewer_collection_item_comments', $rootel).animate({
                    height: 'toggle',
                    opacity: 'toggle'
                }, 500);
            } else if ($rootel.is(':visible')) {
                var $selectedItem = $('.collectionviewer_carousel_item.selected', $rootel);
                var contentProfile = {
                    data: collectionData[parseInt($selectedItem.attr('data-page-index'), 10)][parseInt($selectedItem.attr('data-arr-index'),10)]
                };
                $(window).trigger('start.collectioncomments.sakai', contentProfile);
                $('.collectionviewer_collection_item_comments', $rootel).animate({
                    height: 'toggle',
                    opacity: 'toggle'
                }, 500);
            }
        };

        /**
         * Switch the listview when necessary and load the items within that listview
         * @param {Boolean} cache If we use cache or not
         */
        var switchListView = function(cache) {
            collectionviewer.listStyle = $.bbq.getState(collectionviewer.tuidls) || 'carousel';
            collectionviewer.page = $.bbq.getState('lp') || 1;
            $('.s3d-listview-options', $rootel).children('.selected').children().removeClass('selected');
            $('.s3d-listview-options', $rootel).children('.selected').removeClass('selected');
            getCollectionData(false, false, false, cache);
        };

        /**
         * Loads the preview for a collection item
         * @param {Object} item Object containing data for the item to show a preview for
         */
        var loadCollectionItem = function(item) {
            var $element = $('.collectionviewer_carousel_item[data-item-id=' + item + ']', $rootel);
            $('.collectionviewer_carousel_item', $rootel).removeClass('selected');
            $element.addClass('selected');
            $('.collectionviewer_widget', $rootel).off('start.collectioncontentpreview.sakai');
            renderItemsForSelected(parseInt($element.attr('data-page-index'), 10), parseInt($element.attr('data-arr-index'), 10));
        };

        /**
         * Handle what you need to do when the hash has changed
         */
        var handleHashChange = function() {
            // This will be empty when you switch a listview, so we should trigger that function instead
            if (!$.bbq.getState('item')) {
                hideContainers();
                switchListView();
                return;
            }
            loadCollectionItem($.bbq.getState('item'));
        };

        /**
         * Enables/disables editor buttons
         */
        var checkEditingEnabled = function() {
            if ($('.collectionviewer_check:checked:visible', $rootel).length) {
                $('#collections_remove_button', $rootel).removeAttr('disabled');
                $('#collections_savecontent_button', $rootel).removeAttr('disabled');
            } else {
                $('#collections_remove_button', $rootel).attr('disabled', true);
                $('#collections_savecontent_button', $rootel).attr('disabled', true);
                $('#collectionviewer_select_all', $rootel).removeAttr('checked');
            }
            updateButtonData();
        };

        /**
         * Brings data on buttons up to date
         */
        var updateButtonData = function() {
            var idArr = [];
            var titleArr = [];
            $('.collectionviewer_check:checked:visible', $rootel).each(function(i, item) {
                idArr.push($(item).attr('data-entityid'));
                titleArr.push($(item).attr('data-entityname'));
                if ($(item).attr('data-canshare') !== 'true' && !$(item).attr('data-canshare-error')) {
                    $(item).attr('data-canshare-error', 'true');
                }
            });
            $('#collections_savecontent_button', $rootel).attr('data-entityid', idArr);
            $('#collections_savecontent_button', $rootel).attr('data-entityname', titleArr);
        };

        /**
         * Refreshes the collection viewer widget
         */
        var refreshCollection = function() {
            var pageNumber = collectionviewer.page - 1;
            getCollectionData('', true, function(data) {
                collectionviewer.listStyle = $.bbq.getState(collectionviewer.tuidls) || 'list';
                $('#collectionviewer_add_content_button > div', $rootel).text(data.total);
                collectionviewer.total = data.total;
                if (data.results.length) {
                    collectionData[pageNumber] = data.results;
                } else {
                    delete collectionData[pageNumber];
                }
                renderGridOrList(false, true);
                sakai.api.Util.progressIndicator.hideProgressIndicator();
            });
        };

        /**
         * Initializes the widget preview
         * @param {String} which Can be 'collectioncontentpreview' or 'pageviewer' depending
         *                 on the context of the preview
         */
        var doStart = function(which) {
            if ($rootel.is(':visible')) {
                var arrIndex1 = 0;
                if ($('.collectionviewer_carousel_item.selected', $rootel).length) {
                    arrIndex1 = parseInt($('.collectionviewer_carousel_item.selected', $rootel).attr('data-page-index'), 10);
                }
                var arrIndex2 = 0;
                if ($('.collectionviewer_carousel_item.selected', $rootel).length) {
                    arrIndex2 = parseInt($('.collectionviewer_carousel_item.selected', $rootel).attr('data-arr-index'), 10);
                }
                if (which === 'collectioncontentpreview' && collectionviewer.listStyle === 'carousel') {
                    if (collectionData.length && collectionData[arrIndex1] && collectionData[arrIndex1][arrIndex2]) {
                        $('.collectionviewer_widget', $rootel).trigger('start.collectioncontentpreview.sakai', collectionData[arrIndex1][arrIndex2]);
                        $('.collectionviewer_collection_item_preview', $rootel).show();
                    }
                } else if (which === 'pageviewer') {
                    if (collectionData.length && collectionData[arrIndex1] && collectionData[arrIndex1][arrIndex2]) {
                        $(window).trigger('start.pageviewer.sakai', collectionData[arrIndex1][arrIndex2]);
                    }
                }
            }
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Add binding to various elements and events.
         */
        var addBinding = function() {

            $rootel.on('click', '#collectionviewer_carousel_view, #collectionviewer_grid_view, #collectionviewer_list_view, #collectionviewer_edit_collection_button', function() {
                var state = {};
                state[collectionviewer.tuidls] = $(this).data('liststyle') || 'carousel';
                state.item = '';
                $.bbq.pushState(state);
            });

            // Carousel bindings
            $rootel.on('click', '.collectionviewer_carousel_item', function() {
                if ($(this).hasClass('selected')) {
                    return;
                }
                if (collectionviewer.listStyle === 'carousel') {
                    $.bbq.pushState({'item': $(this).attr('data-item-id')});
                    fetchCollectionData = false;
                }
                if (initialload) {
                    initialload = false;
                    handleHashChange();
                }
            });

            $rootel.on('click', '.collectionviewer_comments_button', showComments);

            $rootel.on('ready.collectioncontentpreview.sakai', '.collectionviewer_widget', function() {
                doStart('collectioncontentpreview');
            });

            $rootel.on('change', '#collectionviewer_sortby', function() {
                var sortSelection = $(this).val();
                var state = {
                    item: ''
                };
                if (sortSelection === 'desc') {
                    collectionviewer.sortOrder = 'desc';
                    state[collectionviewer.tuidso] = 'desc';
                    $.bbq.pushState(state);
                } else if (sortSelection === 'asc') {
                    collectionviewer.sortOrder = 'asc';
                    state[collectionviewer.tuidso] = 'asc';
                    $.bbq.pushState(state);
                } else {
                    collectionviewer.sortOrder = 'modified';
                    state[collectionviewer.tuidso] = 'modified';
                    $.bbq.pushState(state);
                }
            });

            $rootel.on('click', '.collectionviewer_collection_item_comments #contentcomments_postComment', function() {
                collectionData[parseInt($('.collectionviewer_carousel_item.selected', $rootel).attr('data-page-index'),10)][parseInt($('.collectionviewer_carousel_item.selected', $rootel).attr('data-arr-index'), 10)].numComments++;
                $('.collectionviewer_comments_count', $rootel).text(collectionData[parseInt($('.collectionviewer_carousel_item.selected', $rootel).attr('data-page-index'), 10)][parseInt($('.collectionviewer_carousel_item.selected', $rootel).attr('data-arr-index'), 10)].numComments);
            });

            $rootel.on('click', '#collectionviewer_finish_editing_collection_button', function() {
                $('#collectionviewer_expanded_content_container').empty();
                $(this).hide();
                $('#collectionviewer_edit_collection_button', $rootel).show();
                var state = {};
                state[collectionviewer.tuidls] = 'carousel';
                $.bbq.pushState(state);
            });

            $rootel.on('click', '#collectionviewer_select_all', function() {
                if ($(this).is(':checked')) {
                    $('.collectionviewer_check:visible', $rootel).attr('checked', true);
                } else{
                    $('.collectionviewer_check:visible', $rootel).removeAttr('checked');
                }
                checkEditingEnabled();
            });

            $rootel.on('change', '.collectionviewer_check', checkEditingEnabled);

            $rootel.on('click', '#collections_remove_button', function() {
                var $checked = $('.collectionviewer_check:checked:visible', $rootel);
                if ($checked.length) {
                    var paths = [];
                    $checked.each(function() {
                        paths.push($(this).attr('id').split('collectionviewer_check_')[1]);
                    });
                    $(document).trigger('init.deletecontent.sakai', [{
                        paths: paths,
                        context: collectionviewer.contextId
                    }, function(success) {
                        sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('REMOVING_CONTENT_FROM_COLLECTION', 'collectionviewer'), sakai.api.i18n.getValueForKey('PROCESSING_COLLECTION', 'collectionviewer'));
                        $('.collectionviewer_check:checked:visible', $rootel).parents('li:not(.contentauthoring_row_container)').hide('slow');
                        setTimeout(refreshCollection, 500);
                    }]);
                }
            });

            $rootel.on('click', '.collectionviewer_remove_icon', function() {
                var $itemToRemove = $(this);
                var toRemoveId = $itemToRemove.attr('data-entityid');
                $(document).trigger('init.deletecontent.sakai', [{
                    paths: [toRemoveId],
                    context: collectionviewer.contextId
                }, function(success) {
                    $itemToRemove.parents('li:not(.contentauthoring_row_container)').hide('slow');
                    setTimeout(refreshCollection, 500);
                }]);
            });

            $('.collectionviewer_widget', $rootel).on('click', '#collectionviewer_expanded_content_container .s3d-search-result .share_trigger_click, #collectionviewer_expanded_content_container .s3d-search-result .savecontent_trigger', function() {
                $(this).parents('.s3d-search-result').addClass('hovered');
            });

            $(window).on('hashchange', handleHashChange);

            $(window).on('ready.pageviewer.sakai', function() {
                doStart('pageviewer');
            });

            $(document).on('done.newaddcontent.sakai', function(ev, data) {
                setTimeout(function() {
                    switchListView(false);
                }, 1000);
            });

            $(window).on('hiding.newsharecontent.sakai hiding.savecontent.sakai', function() {
                $('#collectionviewer_expanded_content_container .s3d-search-result.hovered', $rootel).removeClass('hovered');
            });

        };

        /**
         * Returns the name of the collection that's displayed
         */
        var getCollectionName = function() {
            return collectionviewer.collectionName;
        };

        /**
        * Decides if the pagepreview widget should be rendered on a page
        * @param {String} id id of the page/group
        */
        var decidePagePreviewDisabled = function(id) {
            if (sakai_global &&
                sakai_global.content_profile &&
                sakai_global.content_profile.content_data &&
                id === sakai_global.content_profile.content_data.data._path) {
                    pagePreviewDisabled = false;
            }
        };

        /**
         * Initialize the widget by adding bindings to elements and gathering collection information
         */
        var doInit = function() {
            collectionviewer.listStyle = $.bbq.getState(collectionviewer.tuidls) || 'carousel';
            collectionviewer.sortOrder = $.bbq.getState(collectionviewer.tuidso) || 'modified';
            var ref = '';
            if (widgetData.data && widgetData.data._path) {
                collectionviewer.contextId = widgetData.data._path;
                if (widgetData.data.structure0) {
                    ref = $.parseJSON(widgetData.data.structure0).main._ref;
                }
                decidePagePreviewDisabled(collectionviewer.contextId);
            } else {
                collectionviewer.contextId = widgetData.collectionviewer.groupid;
                decidePagePreviewDisabled(collectionviewer.contextId.slice(2, collectionviewer.contextId.length));
            }
            if ($rootel.parents('.pageviewer_widget').length) {
                previewsAllowed = false;
            }
            $('.collectionviewer_widget', $rootel).show();
            if (sakai.api.Content.Collections.canCurrentUserEditCollection(collectionviewer.contextId)) {
                $('#collectionviewer_header_container #collectionviewer_add_content_button', $rootel).show();
                $('#collectionviewer_header_container #collectionviewer_edit_collection_button', $rootel).show();
                $('#collectionviewer_finish_editing_collection_button', $rootel).hide();
            }

            $('#content_profile_sakaidoc_container', $rootel).addClass('collections');
            $('#collectionviewer_sortby', $rootel).val(collectionviewer.sortOrder);

            if (sakai_global && sakai_global.content_profile && sakai_global.content_profile.content_data) {
                if (widgetData.data && widgetData.data['sakai:pooled-content-file-name']) {
                    collectionviewer.collectionName = widgetData.data['sakai:pooled-content-file-name'];
                } else {
                    collectionviewer.collectionName = sakai_global.content_profile.content_data.data['sakai:pooled-content-file-name'];
                }
                switchListView();
            // Retrieve the name of the collection as we're not in a content profile page
            } else {
                $.ajax({
                    url: '/p/' + collectionviewer.contextId + '.json',
                    success: function(data) {
                        collectionviewer.collectionName = data['sakai:pooled-content-file-name'];
                        switchListView();
                    }
                });
            }
            addBinding();
        };

        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('collectionviewer');
});
