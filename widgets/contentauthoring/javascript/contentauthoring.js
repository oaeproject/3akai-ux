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
require(['jquery', 'underscore', 'sakai/sakai.api.core', 'jquery-ui'], function($, _, sakai) {

    /**
     * @name sakai.contentauthoring
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentauthoring = function(tuid, showSettings, widgetData) {

        // Element cache
        var $rootel = $('#' + tuid);
        var $pageRootEl = false;

        // Configuration variables
        var MINIMUM_COLUMN_SIZE = 0.10;
        var DEFAULT_WIDGET_SETTINGS_WIDTH = 650;
        var CONCURRENT_EDITING_INTERVAL = 5000;

        // Help variables
        var pagesCache = {};
        var currentPageShown = {};
        var storePath = false;
        var isDragging = false;
        var editInterval = false;
        var uniqueModifierId = sakai.api.Util.generateWidgetId();
        var pageTitle = '';

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Check whether the current page is shown in edit mode
         * or view mode. True will be returned when the page is in
         * edit mode. False will be returned when the page is in
         * view mode
         */
        var isInEditMode = function() {
            return $rootel.hasClass('contentauthoring_edit_mode');
        };

        /**
         * Check whether the current user can edit the current page. The user
         * can't edit the page if he doesn't have permission or if the page
         * is non-editable
         */
        var canEditCurrentPage = function() {
            return (currentPageShown.canEdit && !currentPageShown.nonEditable);
        };

        /**
         * Returns an array of widget ids for all of the widgets that are
         * embedded in the current page
         */
        var getWidgetList = function() {
            var widgetIDs = [];
            for (var r = 0; r < currentPageShown.content.rows.length; r++) {
                for (var c = 0; c < currentPageShown.content.rows[r].columns.length; c++) {
                    for (var e = 0; e < currentPageShown.content.rows[r].columns[c].elements.length; e++) {
                        widgetIDs.push(currentPageShown.content.rows[r].columns[c].elements[e]);
                    }
                }
            }
            return widgetIDs;
        };

        /**
         * Removes highlight zones when not dragging in edit mode
         */
        var checkRemoveHighlight = function() {
            if (isInEditMode() && !isDragging) {
                $('.contentauthoring_row_reorder_highlight,.contentauthoring_cell_reorder_highlight').remove();
            }
        };

        /*
         * Generate a drag helper that will be used to drag around when dragging a row or
         * a widget (instead of the actual element). Using a drag helper prevents
         */
        var generateDragHelper = function(ev, ui) {
            var $el = $('<div/>');
            $el.css('width', ui.width() + 'px');
            $el.css('height', ui.height() + 'px');
            $el.addClass('contentauthoring_reorder_placeholder');
            return $el;
        };

        /////////////////////
        // TINYMCE RELATED //
        /////////////////////

        /**
         * De-initialize all of the tinyMCE editors in a given container. This is necessary
         * when dragging or moving an element that contains a tinyMCE editor
         * @param {jQuery} $container   Container in which to de-initialize tinyMCE
         */
        var killTinyMCEInstances = function($container) {
            $container.find('.tinyMCE').each(function() {
                tinyMCE.execCommand('mceRemoveControl', false, $(this).attr('id'));
            });
        };

        /**
         * Initialize all of the tinyMCE declarations inside of a given container. This
         * needs to be called after dragging or moving an element containing a tinyMCE editor.
         * @param {jQuery} $container   Container in which to initialize tinyMCE
         */
        var initializeTinyMCEInstances = function($container) {
            $container.find('.tinyMCE').each(function() {
                tinyMCE.execCommand('mceAddControl', true, $(this).attr('id'));
                tinyMCEInstanceFix();
            });
        };

        /**
         * Fix for https://jira.sakaiproject.org/browse/SAKIII-4878
         * This fix makes sure that the text edit controls aren't re-initialized
         * when dragging or moving an htmlblock widget
         */
        var tinyMCEInstanceFix = function() {
            $('.htmlblock_widget', $rootel).find('.mceExternalToolbar').hide();
            $.each($('#inserterbar_widget .mceAction', $rootel).children('.mceColorPreview'), function(i, color) {
                if (i > 0) {
                    $(color).hide();
                }
            });
        };

        /**
         * Hide the tinyMCE toolbar
         */
        var hideTinyMCEFormatBar = function() {
            $('#inserterbar_tinymce_container', $rootel).hide();
        };

        ////////////////////
        ////////////////////
        // ROW MANAGEMENT //
        ////////////////////
        ////////////////////

        ////////////////////
        // ROW REORDERING //
        ////////////////////

        /**
         * Make the rows inside of the current page re-orderable
         */
        var makeRowsReorderable = function() {
            $('#contentauthoring_widget_container', $pageRootEl).sortable({
                handle: '.contentauthoring_row_handle',
                placeholder: 'contentauthoring_row_reorder_highlight',
                opacity: 0.4,
                helper: generateDragHelper,
                start: function(ev, ui) {
                    hideTinyMCEFormatBar();
                    killTinyMCEInstances($(ui.item));
                    isDragging = true;
                    $('.contentauthoring_row_handle_container', $rootel).css('visibility', 'hidden');
                    $('.contentauthoring_cell_element_actions', $rootel).hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui) {
                    initializeTinyMCEInstances($(ui.item));
                    $(this).sortable('refresh');
                    isDragging = false;
                    storeCurrentPageLayout();
                }
            });
            setRowHover();
        };

        ///////////////
        // ROW HOVER //
        ///////////////

        var setRowHoverIn = function(e, $container) {
            var $el = $(this);
            if ($container) {
                $el = $container;
            }
            // Only show the hover state when we are in edit mode and we are not dragging an element
            if (isInEditMode() && !isDragging) {
                $('.contentauthoring_row_handle_container', $el).css('visibility', 'visible');
            }
        };

        var setRowHoverOut = function(e, $container) {
            var $el = $(this);
            if ($container) {
                $el = $container;
            }
            $('.contentauthoring_row_handle_container', $el).css('visibility', 'hidden');
        };

        /**
         * Set the onhover and onhoverout functions for each row. When hovering over a
         * row, the edit row menu will be shown. When hovering out of it, it will be
         * hidden
         */
        var setRowHover = function() {
            $('.contentauthoring_row_container', $rootel).off('hover');
            $('.contentauthoring_row_container', $rootel).hover(setRowHoverIn, setRowHoverOut);
        };

        //////////////////////
        // ADDING A NEW ROW //
        //////////////////////

        /**
         * Returns the HTML for a new and empty row
         */
        var generateNewRow = function() {
            // Create an empty row
            var newRow = {
                'id': sakai.api.Util.generateWidgetId(),
                'template': 'row',
                'sakai': sakai,
                'columns': [
                    {
                        'width': 1,
                        'elements': [
                            {
                                'dummytext': true
                            }
                        ]
                    }
                ]
            };
            newRow.template = 'row';
            newRow.sakai = sakai;
            // Return the row HTML
            return sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', newRow, false, false);
        };

        //////////////////////
        // ROW CONTEXT MENU //
        //////////////////////

        // Variable that keeps track of the rowid for which the contextmenu
        // is currently displaying
        var rowToChange = false;

        /**
         * Hide the edit row dropdown
         */
        var hideEditRowMenu = function() {
            rowToChange = false;
            $('#contentauthoring_row_menu', $rootel).hide();
            $('.contentauthoring_row_handle_container', $rootel).removeClass('selected');
        };

        /**
         * Show the edit row dropdown (if it is not already open).
         * @param {Object} ev   jQuery event object
         */
        var showEditRowMenu = function(ev) {
            var currentRow = $(this).attr('data-row-id');
            // If the clicked row is the same as the row that is already open, we
            // hide the menu
            if (currentRow === rowToChange) {
                hideEditRowMenu();
            } else {
                // If there is more than 1 row on the screen, we can show the 'Remove row' option
                // If there is only 1 row, we should hide that option
                var show = ($('.contentauthoring_row', $('#' + currentPageShown.ref)).length > 1);
                $('#contentauthoring_row_menu_remove', $rootel).parent('li').toggle(show);
                $(this).parents('.contentauthoring_row_handle_container').addClass('selected');
                var $rowMenu = $('#contentauthoring_row_menu', $rootel);
                $rowMenu.css({
                    'left': $(this).parent().position().left + 'px',
                    'top': ($(this).parent().position().top + 7) + 'px'
                }).show();
                $rowMenu.find('button:visible:first').focus();
                rowToChange = currentRow;
                checkColumnsUsed($(this).parents('.contentauthoring_row_container'));
            }
        };

        /**
         * Matches the number of columns to the 'columncount' data attribute on list items
         * that indicates how many are used and puts a black check icon in front of the list item
         * @param {jQuery} element jQuery object with classname 'contentauthoring_row_container'
         *                         that is the parent element of all columns
         */
        var checkColumnsUsed = function(element) {
            var numColumns = $(element).find('.contentauthoring_cell.ui-resizable').length;
            var $menuItems = $('#contentauthoring_row_menu ul li', $rootel);
            $.each($menuItems, function(i, item) {
                var $item = $(item);
                $item.find('.s3d-action-icon').removeClass('s3d-black-check-icon');
                if ($item.data('columncount') === numColumns) {
                    $item.find('.s3d-action-icon').addClass('s3d-black-check-icon');
                }
            });
        };

        /**
         * Remove the currently selected row
         * @param {Object} ev   jQuery event object
         */
        var removeRow = function(ev) {
            var $row = $('.contentauthoring_row_container[data-row-id="' + rowToChange + '"]', $rootel);
            hideEditRowMenu();
            killTinyMCEInstances($row);
            $row.remove();
            storeCurrentPageLayout();
        };

        /**
         * Insert a new row into the current page
         * @param {Boolean} insertBefore     Whether or not to insert the new row before the current one or
         *                                   after the current one
         */
        var addRow = function(insertBefore) {
            var $row = $('.contentauthoring_row_container[data-row-id="' + rowToChange + '"]', $rootel);
            hideEditRowMenu();
            if (insertBefore) {
                $row.before(generateNewRow());
            } else {
                $row.after(generateNewRow());
            }
            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath + '/');
            setPageEditActions();
            updateColumnHandles();
            storeCurrentPageLayout();
        };

        ///////////////////////
        ///////////////////////
        // COLUMN MANAGEMENT //
        ///////////////////////
        ///////////////////////

        /////////////////////
        // COLUMN RESIZING //
        /////////////////////

        //
        var currentSizes = [];

        /**
         * Returns an array of relative widths for all of the columns in a given row
         * @param {jQuery} $row     jQuery element representing row for which to get the widths
         *                          of its columns
         */
        var getColumnWidths = function($row) {
            var totalWidth = $('#contentauthoring_widget_container', $pageRootEl).width();
            var $cells = $('.contentauthoring_cell', $row);
            var widths = [];
            // Variable to track the remaining width
            var lastWidth = 1;
            for (var i = 0; i < $cells.length; i++) {
                // We give the last column the remaining width
                if (i === $cells.length - 1) {
                    widths.push(lastWidth);
                // We give each column a relative width rather than
                // an absolute one
                } else {
                    lastWidth -= $($cells[i]).width() / totalWidth;
                    widths.push($($cells[i]).width() / totalWidth);
                }
            }
            return widths;
        };

        /**
         * Make all of the columns in the current page resizable
         */
        var makeColumnsResizable = function() {
            $(window).trigger('resize.contentauthoring.sakai');
            $('.contentauthoring_cell', $rootel).resizable({
                handles: {
                    'e': '.contentauthoring_cell_handle,.contentauthoring_cell_handle_grab'
                },
                disabled: false,
                helper: 'ui-resizable-helper',
                start: function(event, ui) {
                    hideTinyMCEFormatBar();
                    sakai.api.Util.Draggable.setIFrameFix();
                    isDragging = true;
                    var $row = $(this).parent();
                    currentSizes = getColumnWidths($row);
                },
                stop: function(ev, ui) {
                    sakai.api.Util.Draggable.removeIFrameFix();
                    isDragging = false;
                    var $row = $(this).parent();
                    recalculateColumnWidths(ui, $row, $(this), currentSizes);
                    setRowHeight($row);
                    $(window).trigger('resize.contentauthoring.sakai');
                    storeCurrentPageLayout();
                }
            });
        };

        /**
         * Recalculate the widths of all the columns in a row after having resized a column. This
         * makes sure that each of the columns has sufficient width, ratios between the non-dragged
         * columns are preserved, etc.
         * @param {Object} ui             jQuery ui object
         * @param {jQuery} $row           jQuery element representing the row we're calculating
         *                                widths for
         * @param {jQuery} $resizedCell   jQuery element representing the column that's being resized
         * @param {Array} currentSizes    The arrray containing the current column widths, used
         *                                to preserve the column width ratios
         */
        var recalculateColumnWidths = function(ui, $row, $resizedCell, currentSizes) {
            var totalRowWidth = $('#contentauthoring_widget_container', $pageRootEl).width();
            var newColumnWidth = (ui.size.width + 12) / totalRowWidth;
            var oldColumnWidth = ui.originalSize.width / totalRowWidth;

            var rowId = $row.attr('data-row-id');
            var $cells = $('.contentauthoring_cell', $row);

            var hasFoundResizedCell = false;

            var totalWidth = 0;
            var numberOfColumns = $cells.length;
            for (var i = 0; i < $cells.length; i++) {
                var currentColumnWidth = 0;
                if ($($cells[i]).is($resizedCell)) {
                    // New percentage based width
                    if (newColumnWidth < MINIMUM_COLUMN_SIZE) {
                        currentColumnWidth = MINIMUM_COLUMN_SIZE;
                    } else if (totalWidth + newColumnWidth + ((numberOfColumns - i - 1) * MINIMUM_COLUMN_SIZE) > 1) {
                        currentColumnWidth = 1 - totalWidth - ((numberOfColumns - i - 1) * MINIMUM_COLUMN_SIZE);
                    } else {
                        currentColumnWidth = newColumnWidth;
                    }
                    $($cells[i]).css('width', currentColumnWidth * 100 + '%');
                    hasFoundResizedCell = true;
                } else if (hasFoundResizedCell) {
                    // New percentage based width
                    if (numberOfColumns - i === 1) {
                        // This is the final cell, fill it up
                        currentColumnWidth = 1 - totalWidth;
                    } else {
                        // There are 2 more cells
                        // Does the 2nd have enough space after pulling in the 1st?
                        if (1 - (totalWidth + currentSizes[i]) > MINIMUM_COLUMN_SIZE) {
                            currentColumnWidth = currentSizes[i];
                            $($cells[i + 1]).css('width', (1 - totalWidth - currentSizes[i]) * 100 + '%');
                        // Shrink the fist to its maximum size
                        // Make the second its minumum size
                        } else {
                            currentColumnWidth = 1 - totalWidth - MINIMUM_COLUMN_SIZE;
                            $($cells[i + 1]).css('width', MINIMUM_COLUMN_SIZE * 100 + '%');
                        }
                    }
                    $($cells[i]).css('width', currentColumnWidth * 100 + '%');
                    hasFoundResizedCell = false;
                }
                totalWidth += currentColumnWidth;
            }
        };

        /**
         * Sets the height of a row to the heighest column
         * @param {jQuery} $row jQuery object with class '.contentauthoring_table_row.contentauthoring_cell_container_row'
         *                      used to search for child cells that can contain content
         */
        var setRowHeight = function($row) {
            var cells = $('.contentauthoring_cell_content', $row);
            var setDefaultHeight = true;
            $.each(cells, function(index, cell) {
                // Default the height of the cell to auto to avoid that cells stay larger than they should
                $('.contentauthoring_cell_content', $row).css('height', 'auto');
                // Remove whitespace since jQuery :empty selector doesn't ignore it
                var html = $(cell).html().replace(/\s+/, '');
                if (html.length || $(html).hasClass('contentauthoring_dummy_element')) {
                    // There is some content in the row so no default height but the cell height should be considered
                    setDefaultHeight = false;
                }
            });

            if (setDefaultHeight) {
                // No content in the row, set default height
                $('.contentauthoring_cell_content', $row).css('height', 25);
            } else {
                // Some cells have content
                // if row is part of the pageviewer than equalheights doesn't need to be set
                if (!$('.contentauthoring_cell_content', $row).parents('.pageviewer_widget').length) {
                    $('.contentauthoring_cell_content', $row).equalHeightColumns();
                }
            }
        };

        /**
         * Update the height of all column drag handles in all columns of
         * all rows
         */
        var updateColumnHeights = function() {
            var $rows = $('.contentauthoring_row_container');
            for (var r = 0; r < $rows.length; r++) {
                var $columns = $('.contentauthoring_cell', $($rows[r]));
                var $lastColumn = $($columns[$columns.length - 1]);
                $('.contentauthoring_cell_handle', $lastColumn).hide();
                setRowHeight($($rows[r]));
            }
        };

        /**
         * Updates column handles and sends out a resize event
         */
        var updateColumnHandles = function() {
            $('.contentauthoring_cell_handle', $rootel).show();
            $(window).trigger('resize.contentauthoring.sakai');
            updateColumnHeights();
        };

        /**
         * Every time an image is loaded, we adjust the height of the columns of the row
         */
        var imageLoaded = function(ev, image) {
            setRowHeight($(image).parents('.contentauthoring_table_row.contentauthoring_cell_container_row'));
        };

        /**
         * We listen for HTML changes in the page to catch new iamges being
         * loaded, as we need to adjust the row height when this happens
         * @param {Object} changedHTML      The HTML that has been added or removed
         */
        $rootel.contentChange(function(changedHTML) {
            if (isInEditMode()) {
                $(changedHTML).find('img:visible').each(function(i, item) {
                    imageLoaded({}, $(item));
                    $(item).load(function(ev) {
                        imageLoaded(ev, $(ev.currentTarget));
                    });
                });
                updateColumnHeights();
            }
        });

        ////////////////////
        // ADDING COLUMNS //
        ////////////////////

        /**
         * Given a row, add one or more columns to it, preserving the original ratios
         * @param {jQuery} $row             Row in which we're adding columns
         * @param {Integer} totalColumns    Total of columns we need in the row
         */
        var addColumns = function($row, totalColumns) {
            var widths = getColumnWidths($row);
            var $cells = $('.contentauthoring_cell', $row);
            var newColumnWidth = 1 / totalColumns;
            for (var i = widths.length; i < totalColumns; i++) {
                $('.contentauthoring_cell_container_row', $row).append(sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                    'template': 'column',
                    'column': {
                        'width': newColumnWidth,
                        'elements': []
                    },
                    'sakai': sakai
                }, false, false));
            }
            // Assign each of the columns their new width
            for (var w = 0; w < widths.length; w++) {
                var columnWidth = widths[w] * (1 - (newColumnWidth * (totalColumns - widths.length))) * 100 + '%';
                $($cells[w]).css('width', columnWidth);
            }
            setPageEditActions();
            updateColumnHandles();
            storeCurrentPageLayout();
        };

        //////////////////////
        // REMOVING COLUMNS //
        //////////////////////

        /**
         * Given a row, remove one or more columns from it, preserving the original ratios
         * @param {jQuery} $row             Row in which we're adding columns
         * @param {Integer} totalColumns    Total of columns we need in the row
         */
        var removeColumns = function($row, totalColumns) {
            var widths = getColumnWidths($row);
            var remainingWidth = 1;
            var $cells = $('.contentauthoring_cell', $row);
            $row.find('.contentauthoring_dummy_element').remove();
            // Append the content of the columns that will be removed to the last
            // column that will be retained
            for (var i = totalColumns; i < $cells.length; i++) {
                var $cell = $($cells[i]);
                // De- and re-initialize tinyMCE to avoid errors
                killTinyMCEInstances($cell);
                var $cellcontent = $('.contentauthoring_cell_content', $cell).children();
                initializeTinyMCEInstances($('.contentauthoring_cell_content', $($cells[totalColumns - 1])).append($cellcontent));
                $cell.remove();
                remainingWidth -= widths[i];
            }
            for (var l = 0; l < totalColumns; l++) {
                $($cells[l]).css('width', (widths[l] / remainingWidth) * 100 + '%');
            }
            checkColumnsEmpty();
            updateColumnHandles();
            storeCurrentPageLayout();
        };

        //////////////////////////////
        // CHANGE NUMBER OF COLUMNS //
        //////////////////////////////

        /**
         * Change the number of columns in the currently selected row
         * @param {Integer} number   Number of columns the row should get (1-3)
         */
        var changeNumberOfColumns = function(number) {
            var $row = $('.contentauthoring_row_container[data-row-id="' + rowToChange + '"]', $rootel);
            var $cells = $('.contentauthoring_cell', $row);
            if ($cells.length > number) {
                removeColumns($row, number);
            } else if ($cells.length < number) {
                addColumns($row, number);
            }
            hideEditRowMenu();
            setPageEditActions();
            tinyMCEInstanceFix();
            setRowHeight($row);
        };

        //////////////////////////////
        // EMPTY COLUMN PLACEHOLDER //
        //////////////////////////////

        /**
         * Check whether any of the columns in the current page are empty (i.e., they have no widgets
         * inside of them). If so, we add the placeholder widget
         */
        var checkColumnsEmpty = function() {
            $.each($('.contentauthoring_cell_content', $('#contentauthoring_widget', $rootel)), function(i, cellcontainer) {
                if (!$(cellcontainer).find('.contentauthoring_cell_element').length) {
                    if (!$(cellcontainer).find('.contentauthoring_dummy_element').length) {
                        var dummy = $(sakai.api.Util.TemplateRenderer('contentauthoring_dummy_element_template', {}));
                        $(cellcontainer).append(dummy);
                    }
                } else {
                    $(cellcontainer).find('.contentauthoring_dummy_element').remove();
                }
            });
        };


        ///////////////////////
        ///////////////////////
        // WIDGET MANAGEMENT //
        ///////////////////////
        ///////////////////////

        ///////////////////////
        // WIDGET REORDERING //
        ///////////////////////

        /**
         * Make the widgets reorderable across all rows and columns
         */
        var reorderWidgets = function() {
            $('.contentauthoring_cell_content', $rootel).sortable({
                connectWith: '.contentauthoring_cell_content',
                ghost: true,
                handle: '.contentauthoring_row_handle',
                placeholder: 'contentauthoring_cell_reorder_highlight',
                opacity: 0.4,
                tolerance: 'pointer',
                helper: generateDragHelper,
                start: startWidgetOrdering,
                stop: stopWidgetOrdering
            });
        };

        /**
         * Executed when the dragging action starts. At this point, we
         * de-initialize the tinyMCE instances in the dragged widget
         * @param {Object} event     jQuery event object
         * @param {Object} ui        jQuery ui object
         */
        var startWidgetOrdering = function(event, ui) {
            hideTinyMCEFormatBar();
            killTinyMCEInstances($(ui.item));
            sakai.api.Util.Draggable.setIFrameFix();
            isDragging = true;
            $('.contentauthoring_row_handle_container', $rootel).css('visibility', 'hidden');
            $('.contentauthoring_cell_element_actions', $rootel).hide();
            hideEditRowMenu();
        };

        /**
         * Executed when the dragging action stops. At this point, we
         * re-initialize the tinyMCE instance and remove the dummy element
         * if we drop inside of an empty column
         * @param {Object} event     jQuery event object
         * @param {Object} ui        jQuery ui object
         */
        var stopWidgetOrdering = function(event, ui) {
            initializeTinyMCEInstances($(ui.item));
            sakai.api.Util.Draggable.removeIFrameFix();
            $(this).sortable('refresh');
            isDragging = false;
            $('.contentauthoring_dummy_element', $(this)).remove();
            // If we've dragged in a piece of content
            if ($(ui.item).attr('data-contentId') || $(ui.item).attr('data-collectionId')) {
                addExistingElement(event, ui);
            // If we've dragged in a widget
            } else if ($(ui.item).hasClass('inserterbar_widget_draggable')) {
                addNewWidget(event, $(ui.item));
            }
            checkColumnsEmpty();
            storeCurrentPageLayout();
        };

        //////////////////
        // WIDGET HOVER //
        //////////////////

        var showEditCellMenuHoverIn = function(e, $container) {
            var $el = $(this);
            if ($container) {
                $el = $container;
            }
            // Only show the hover state when we are in edit mode and we are not dragging an element
            if (isInEditMode() && !isDragging) {
                $('.contentauthoring_cell_element_actions', $el).css('left', $el.position().left + 'px');
                $('.contentauthoring_cell_element_actions', $el).css('top', ($el.position().top + 1) + 'px');
                $('.contentauthoring_cell_element_actions', $el).show();
                $('.contentauthoring_cell_element_hover', $rootel).removeClass('contentauthoring_cell_element_hover');
                $el.addClass('contentauthoring_cell_element_hover');
            }
        };

        var showEditCellMenuHoverOut = function(e, $container) {
            var $el = $(this);
            if ($container) {
                $el = $container;
            }
            $('.contentauthoring_cell_element_actions', $rootel).hide();
            $el.removeClass('contentauthoring_cell_element_hover');
        };

        /**
         * Show the widget context menu when hovering over the widget and hide it when
         * hovering out of the widget
         */
        var showEditCellMenu = function() {
            $('.contentauthoring_cell_element', $rootel).off('hover').hover(showEditCellMenuHoverIn, showEditCellMenuHoverOut);
        };

        ///////////////////
        // REMOVE WIDGET //
        ///////////////////

        /**
         * Remove a widget from the page
         * @param {Object} ev   jQuery event object
         */
        var removeWidget = function(ev) {
            var $cell = $(this).parents('.contentauthoring_cell_element');
            var $row = $cell.parents('.contentauthoring_table_row.contentauthoring_cell_container_row');
            killTinyMCEInstances($cell);
            if ($(this).parents('.contentauthoring_cell_content').children('.contentauthoring_cell_element').length > 1) {
                $cell.remove();
            } else {
                var dummy = $(sakai.api.Util.TemplateRenderer('contentauthoring_dummy_element_template', {}));
                $cell.replaceWith(dummy);
            }
            setRowHeight($row);
            storeCurrentPageLayout();
        };

        ////////////////////
        // ADD NEW WIDGET //
        ////////////////////

        /**
         * When double clicking or entering in the inserterbar, we add in a temporary
         * placeholder in the last row of the page, which will then be picked up by the
         * addNewWidget function
         * @param {String} type     Name of the widget we are adding
         */
        var addNewWidgetPlaceholder = function(type) {
            hideTinyMCEFormatBar();
            var $lastRow = $('.contentauthoring_row', $rootel).last().find('.contentauthoring_table_row.contentauthoring_cell_container_row');
            var $element = $('<div />').attr('data-element-type', type);
            $lastRow.find('.contentauthoring_cell_content:last').append($element);
            addNewWidget(null, $element);
        };

        /**
         * Add a new widget to the page after dropping it into its place
         * @param {Object} event            jQuery event object
         * @param {jQuery} $addedElement    Element that was dragged into the page
         */
        var addNewWidget = function(event, $addedElement) {
            var type = $addedElement.attr('data-element-type');
            // Generate unique id
            var id = sakai.api.Util.generateWidgetId();
            // Replace item
            var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                'id': id,
                'type': type,
                'template': 'cell',
                'settingsoverridden': false,
                'sakai': sakai
            });
            $addedElement.replaceWith($(element));
            if (sakai.widgets[type].hasSettings) {
                // Load edit mode
                isEditingNewElement = true;
                showEditWidgetMode(id, type);
            } else {
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath + '/');
            }
            checkColumnsEmpty();
            setPageEditActions();
            storeCurrentPageLayout();
        };

        //////////////////////////
        // WIDGET SETTINGS VIEW //
        //////////////////////////

        var isEditingNewElement = false;
        var currentlyEditing = false;

        /**
         * Show the modal dialog edit mode for a widget
         * @param {String} id       Unique id of the widget
         * @param {String} type     Name of the widget
         */
        var showEditWidgetMode = function(id, type) {
            currentlyEditing = id;
            $('#contentauthoring_widget_content', $rootel).html('');
            // If the widget exists
            if (sakai.widgets[type]) {
                var widgetSettingsWidth = sakai.widgets[type].settingsWidth || DEFAULT_WIDGET_SETTINGS_WIDTH;
                $('#contentauthoring_widget_settings_content', $rootel).html('<div id="widget_' + type + '_' + id + '" class="widget_inline"/>');
                $('#contentauthoring_widget_settings_title', $rootel).html(sakai.api.Widgets.getWidgetTitle(sakai.widgets[type].id));
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget_settings_content', true, storePath + '/');
                $('#contentauthoring_widget_settings', $rootel).css({
                    'width': widgetSettingsWidth + 'px',
                    'margin-left': -(widgetSettingsWidth / 2) + 'px',
                    'top': ($(window).scrollTop() + 50) + 'px'
                });
                sakai.api.Util.Modal.open($('#contentauthoring_widget_settings', $rootel));
            }
        };

        /**
         * Handle the click on the settings button for a widget
         * @param {Object} ev   jQuery event object
         */
        var editWidgetMode = function(ev) {
            var id = $(this).attr('data-element-id');
            var type = $(this).attr('data-element-type');
            isEditingNewElement = false;
            showEditWidgetMode(id, type);
        };

        /**
         * Global function that will be executed when the Cancel button is
         * clicked in one of the widgets. This will remove the settings
         * overlay.
         */
        sakai_global.contentauthoring.widgetCancel = function() {
            if (isEditingNewElement) {
                $('.contentauthoring_cell_element #' + currentlyEditing, $rootel).parent().remove();
                checkColumnsEmpty();
            }
            isEditingNewElement = false;
            sakai.api.Util.Modal.close($('#contentauthoring_widget_settings'));
            // Remove the widget from the settings overlay
            $('#contentauthoring_widget_content').html('');
            storeCurrentPageLayout();
        };

        /**
         * Global function that will be executed when the Save button is
         * clicked in one of the widgets. This will remove the settings
         * overlay and insert/update the widget's view mode
         */
        sakai_global.contentauthoring.widgetFinish = function() {
            isEditingNewElement = false;
            // Remove the widget from the settings overlay
            $('#contentauthoring_widget_content').html('');
            var $parent = $('.contentauthoring_cell_element #' + currentlyEditing, $rootel).parent();
            $('.contentauthoring_cell_element #' + currentlyEditing, $rootel).remove();
            // Construct the widget
            $parent.append('<div id="widget_' + $parent.attr('data-element-type') + '_' + currentlyEditing + '" class="widget_inline"></div>');
            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath + '/');
            sakai.api.Util.Modal.close($('#contentauthoring_widget_settings'));
            updateColumnHandles();
        };

        // Register the global functions
        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.contentauthoring.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.contentauthoring.widgetCancel);

        /**
         * Initialize the widget settings overlay, which will be used
         * for the settings view of the widgets that have a settings
         * view
         */
        sakai.api.Util.Modal.setup($('#contentauthoring_widget_settings', $rootel), {
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: function(hash) {
                sakai_global.contentauthoring.widgetCancel();
                hash.w.hide();
                hash.o.remove();
            }
        });

        //////////////////
        //////////////////
        // PAGE ACTIONS //
        //////////////////
        //////////////////

        //////////////////
        // PAGE LOADING //
        //////////////////

        /**
         * When the left hand navigation asks for a new page to be rendered, this function will
         * be called
         * @param {Object} _currentPageShown    Object representing the current page
         * @param {Boolean} putInEditMode       Whether or not to put the page into edit mode after
         *                                      rendering. This will be used for new pages
         */
        var processNewPage = function(_currentPageShown, putInEditMode) {
            // If the current page is in edit mode, we take it back
            // into view mode
            if (isInEditMode() && currentPageShown) {
                cancelEditPage(false, true);
            }
            // Check whether this page has already been loaded
            if (currentPageShown && !_currentPageShown.isVersionHistory) {
                pagesCache[currentPageShown.ref] = $.extend(true, {}, currentPageShown);
            }
            currentPageShown = pagesCache[_currentPageShown.ref] || _currentPageShown;
            // Don't cache in version history mode
            if (currentPageShown.isVersionHistory) {
                currentPageShown = _currentPageShown;
            }
            renderPage(currentPageShown);
            // Put the page into edit mode
            if (putInEditMode) {
                editPage();
            }
        };

        /**
         * SAKIII-5647 When you're using world templates, sometimes the
         * items within rows are strings when they should be objects.
         * This makes versions work again
         * @param {Object} rows The rows object that you want to convert
         */
        var convertRows = function(rows) {
            if (rows && $.isArray(rows)) {
                for (var i = 0; i < rows.length; i++) {
                    if (typeof rows[i] === 'string') {
                        rows[i] = $.parseJSON(rows[i]);
                    }
                }
            }
        };

        /**
         * Render a page, including its full layout and all of the widgets that live inside of it
         * @param {Object} currentPageShown     Object representing the current page
         * @param {Boolean} requiresRefresh     Whether or not the page should be fully reloaded (if it
         *                                      has already been loaded), or whether it can be served
         *                                      from cache
         * @param {Boolean} preEdit             If we should just re-render the page before an edit
         */
        var renderPage = function(currentPageShown, requiresRefresh, preEdit) {
            $pageRootEl = $('#' + currentPageShown.ref, $rootel);
            $('#' + currentPageShown.ref + '_previewversion').remove();
            if (!currentPageShown.isVersionHistory && !preEdit) {
                // Bring the page back to view mode
                exitEditMode();
                $(window).trigger('render.contentauthoring.sakai');
            }
            // Hide the revision history dialog
            if ($('#versions_container').is(':visible') && !currentPageShown.isVersionHistory) {
                $('.versions_widget').hide();
            }
            sakai.api.Widgets.nofityWidgetShown('#contentauthoring_widget > div:visible', false);
            $('#contentauthoring_widget > div:visible', $rootel).hide();
            // Set the path where widgets should be storing their widget data
            storePath = currentPageShown.pageSavePath + '/' + currentPageShown.saveRef;
            // If the page hasn't been loaded before, or we need a refresh after cancelling the
            // page edit, we create a div container for the page
            if ($pageRootEl.length === 0 || requiresRefresh || currentPageShown.isVersionHistory) {
                if (requiresRefresh || currentPageShown.isVersionHistory) {
                    killTinyMCEInstances($pageRootEl);
                    // Remove the old one in case this is caused by a cancel changes option
                    $pageRootEl.remove();
                }
                // Create the new element
                $pageRootEl = $('<div />').attr('id', currentPageShown.ref).attr('data-sakai-container-id', currentPageShown.path);
                // Add element to the DOM
                $('#contentauthoring_widget', $rootel).append($pageRootEl);
                convertRows(currentPageShown.content.rows);
                var pageStructure = $.extend(true, {}, currentPageShown.content);
                pageStructure.template = 'all';
                pageStructure.sakai = sakai;
                $pageRootEl.html(sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', pageStructure, false, false));
                sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, storePath + '/', currentPageShown.content);
            // If the page has been loaded before, we can just show it again
            } else {
                $pageRootEl.show();
                sakai.api.Widgets.nofityWidgetShown('#' + currentPageShown.ref, true);
            }

            // Determine whether or not to show the empty page placeholder
            determineEmptyPage(currentPageShown);

            // Shwow the edit page bar if I have edit permissions on this page
            if (canEditCurrentPage() && !currentPageShown.isVersionHistory) {
                $('#contentauthoring_inserterbar_container', $rootel).html(sakai.api.Util.TemplateRenderer('contentauthoring_inserterbar_template', {}));
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_inserterbar_container', false);
            }
            $('#contentauthoring_inserterbar_container', $rootel).toggle(canEditCurrentPage());

            //SAKIII-5248
            $(window).trigger('position.inserter.sakai');
            updateColumnHeights();
        };

        ///////////////////
        // PAGE EDITTING //
        ///////////////////

        /**
         * Sets the interval between two posts that mark a page as currently being edited
         */
        var setEditInterval = function() {
            editInterval = setInterval(markAsEditing, CONCURRENT_EDITING_INTERVAL);
        };

        /**
         * Executes a POST to indicate that the current page is being edited
         * Used to avoid concurrent editing of the page
         */
        var markAsEditing = function() {
            var editingContent = {};
            editingContent[currentPageShown.saveRef] = {
                'editing': {
                    'time': sakai.api.Util.Datetime.getCurrentGMTTime(),
                    'sakai:modifierid': uniqueModifierId
                }
            };
            sakai.api.Server.saveJSON(currentPageShown.pageSavePath, editingContent);
        };

        /**
         * Set some elements as tabbable for keyboard navigation when editing
         * @return {Boolean} true To set the tabindex
         *                   false To remove the tabindex
         */
        var setTabbableElements = function(set) {
            var tabbableElements = '.contentauthoring_cell_element, .contentauthoring_cell, .contentauthoring_row';
            if (set) {
                $(tabbableElements, $rootel).attr('tabindex', '0');
            } else {
                $(tabbableElements, $rootel).removeAttr('tabindex');
            }
        };

        /**
         * Set up the page so rows are re-orderable, columns are resizable,
         * widgets can be re-ordered and all hover states
         */
        var setPageEditActions = function() {
            makeRowsReorderable();
            makeColumnsResizable();
            reorderWidgets();
            showEditCellMenu();
            setTabbableElements(true);
            sakai.api.Util.hideOnClickOut('#contentauthoring_row_menu', '.contentauthoring_row_edit', function() {
                rowToChange = false;
                hideEditRowMenu();
            });
        };

        var prevModification = false;

        /**
         * Put the page into edit mode
         */
        var editPage = function() {
            sakai.api.Util.progressIndicator.showProgressIndicator(
                sakai.api.i18n.getValueForKey('PROCESSING_YOUR_PAGE', 'contentauthoring'),
                sakai.api.i18n.getValueForKey('PROCESSING_PAGE_TO_EDIT', 'contentauthoring'));
            $rootel.off('click', '#inserterbar_action_edit_page', editPage);
            sakai.api.Content.checkSafeToEdit(currentPageShown.pageSavePath + '/' + currentPageShown.saveRef, uniqueModifierId, function(success, data) {
                if (data.safeToEdit) {
                    // Update the content based on the current state of the document
                    if (prevModification !== data._lastModified && currentPageShown.content._lastModified < data._lastModified) {
                        prevModification = data._lastModified;
                        currentPageShown.content.rows = data.rows;
                        $.each(data, function(key, obj) {
                            if (key.substring(0,2) === 'id') {
                                currentPageShown.content[key] = obj;
                            }
                        });
                        renderPage(currentPageShown, true, true);
                        sakai.api.Util.notification.show(
                            sakai.api.i18n.getValueForKey('EDITED', 'contentauthoring'),
                            sakai.api.User.getDisplayName(data.editor) + ' ' +
                            sakai.api.i18n.getValueForKey('THIS_PAGE_HAS_BEEN_EDITED', 'contentauthoring')
                        );
                        sakai.api.Util.progressIndicator.hideProgressIndicator();
                        addEditButtonBinding();
                    } else {
                        // Update page title
                        pageTitle = document.title;
                        document.title = pageTitle.replace(sakai.api.i18n.getValueForKey(sakai.config.PageTitles.prefix),
                            sakai.api.i18n.getValueForKey(sakai.config.PageTitles.prefix) + ' ' + sakai.api.i18n.getValueForKey('EDITING') + ' ');

                        setEditInterval();
                        $(window).trigger('edit.contentauthoring.sakai');
                        $('.contentauthoring_empty_content', $rootel).remove();
                        $('#contentauthoring_widget_container', $pageRootEl).show();
                        $rootel.addClass('contentauthoring_edit_mode');
                        markAsEditing();
                        setPageEditActions();
                        updateColumnHandles();
                        checkAutoSave(data);
                    }
                } else {
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                    sakai.api.Util.notification.show(
                        sakai.api.i18n.getValueForKey('CONCURRENT_EDITING', 'contentauthoring'),
                        sakai.api.User.getDisplayName(data.editor) + ' ' +
                        sakai.api.i18n.getValueForKey('IS_CURRENTLY_EDITING', 'contentauthoring')
                    );
                    addEditButtonBinding();
                }
            });
            return false;
        };

        //////////////////////
        // PAGE SERIALIZING //
        //////////////////////

        var parseColumn = function($elts, column) {
            var widgetIds = [];
            // Loop through all of the widgets in the column
            $.each($elts, function(i, elt) {
                var $element = $(elt);
                var element = {
                    type: $element.attr('data-element-type'),
                    id: $element.attr('data-element-id')
                };
                column.elements.push(element);
                widgetIds.push(element.id);
            });
            return {
                'widgetIds': widgetIds,
                'column': column
            };
        };

        /**
         * Serialize the current page layout (rows, columns, widgets), so it can
         * be stored back
         */
        var getCurrentPageLayout = function() {
            var rows = [];
            var widgetIds = [];
            // Loop through all of the rows on the page
            $('.contentauthoring_row_container', $pageRootEl).each(function(rindex, rowEl) {
                var $row = $(rowEl);
                var row = {
                    id: $row.attr('data-row-id'),
                    columns: []
                };
                var columnWidths = getColumnWidths($row);
                // Loop through all of the columns in the row
                for (var i = 0; i < columnWidths.length; i++) {
                    var $elts = $('.contentauthoring_cell_element', $('.contentauthoring_cell', $row).get(i));
                    var column = {
                        width: columnWidths[i],
                        elements: []
                    };
                    var parsed = parseColumn($elts, column);
                    row.columns.push(parsed.column);
                    widgetIds = widgetIds.concat(parsed.widgetIds);
                }
                rows.push(row);
            });
            return {
                'rows': rows,
                'widgetIds': widgetIds
            };
        };

        ////////////////////////////
        // EMPTY PAGE PLACEHOLDER //
        ////////////////////////////

        /**
         * Checks for empty htmlblock widgets and returns a Boolean
         * @return {Boolean} false if the htmlblock widget is not empty
         *                   true if the htmlblock widget is empty
         */
        var checkHTMLBlockEmpty = function(currentPageShown, element) {
            if (currentPageShown.content[element.id] &&
                currentPageShown.content[element.id].htmlblock &&
                ($.trim($(currentPageShown.content[element.id].htmlblock.content).text()) ||
                $(currentPageShown.content[element.id].htmlblock.content).html())) {
                return false;
            }
            return true;
        };

        /**
         * Determines if a page is empty by checking its content
         * Shows a default image when no content is present in the page
         * Empty content = empty rows and rows with empty html blocks
         * @param {Object} currentPageShown Object containing data for the current page
         */
        var determineEmptyPage = function(currentPageShown) {
            // emptyPageElements checks for empty rows
            var emptyPageElements = true;
            // emptyPageElementContents checks for empty tinyMCe instances
            var emptyPageElementContents = true;

            // Check for empty rows, if a row with content or (empty) tinyMCE is detected emptyPageElements will be set to false
            // emptyPageElements will later be overridden if the tinymce instances don't have any content after all
            $.each(currentPageShown.content.rows, function(rowIndex, row) {
                $.each(row.columns, function(columnIndex, column) {
                    if (column.elements && column.elements.length) {
                        $.each(column.elements, function(elIndex, element) {
                            // Check designed to look at specific storage types
                            if (element.type === 'htmlblock') {
                                // Returns false if not empty, true if empty
                                emptyPageElements = checkHTMLBlockEmpty(currentPageShown, element);
                            } else {
                                emptyPageElements = false;
                            }
                            // If false returned there must be content and the page should be rendered
                            return emptyPageElements;
                        });
                        return emptyPageElements;
                    }
                    return emptyPageElements;
                });
                return emptyPageElements;
            });

            // If the page is empty show the illustration
            showPlaceholder(emptyPageElements);
        };

        /**
         * Determine whether the current page is completely empty after editting
         * it. If so, the empty page placeholder will be shown
         */
        var determineEmptyAfterSave = function() {
            var cellElements = $('#' + currentPageShown.ref + ' .contentauthoring_cell_element', $rootel);
            var containsText = false;
            $.each(cellElements, function(index, el) {
                if (sakai.api.Util.determineEmptyContent($(el).html())) {
                    containsText = true;
                }
            });
            showPlaceholder(!containsText);
        };

        /**
         * Show or hide the empty page placeholder
         * @param {Boolean} show    True if the placeholder needs to be shown, false
         *                          if it needs to be hidden
         */
        var showPlaceholder = function(show) {
            if (show) {
                sakai.api.Util.TemplateRenderer('contentauthoring_no_content_template', {
                    'canEdit': currentPageShown.canEdit
                }, $('#contentauthoring_no_content_container', $rootel));
            }
            $('#contentauthoring_widget_container', $pageRootEl).toggle(!show);
            $('#contentauthoring_no_content_container', $rootel).toggle(show);
        };

        /////////////////////
        /////////////////////
        // PAGE MANAGEMENT //
        /////////////////////
        /////////////////////

        /**
         * Put the page into view mode
         * @param {Boolean} wasEditing True if we're actually exiting edit mode
         */
        var exitEditMode = function(wasEditing) {
            // Revert the page title
            if (pageTitle && wasEditing) {
                document.title = pageTitle;
            }

            clearInterval(editInterval);
            // Alert the inserter bar that it should go back into view mode
            $(window).trigger('render.contentauthoring.sakai');
            // Take the widget back into view mode
            $rootel.removeClass('contentauthoring_edit_mode');
            $('.contentauthoring_cell_content', $rootel).sortable('destroy');
            updateColumnHeights();
            $('.contentauthoring_cell', $rootel).resizable('option', 'disabled', true);
            setTabbableElements(false);
        };

        /**
         * After changing between view mode (permanent URL) and edit mode (autosave URL),
         * we need to update these URLs in the widget loader
         */
        var updateWidgetURLs = function() {
            // Get the widgets in this page and change their widget storing URL
            var widgets = getWidgetList();
            $.each(widgets, function(index, widget) {
                if (sakai.api.Widgets.widgetLoader.widgets[widget.id]) {
                    sakai.api.Widgets.widgetLoader.widgets[widget.id].placement = storePath + '/' + widget.id + '/' + widget.type;
                }
            });
        };

        ///////////////
        // SAVE PAGE //
        ///////////////

        /**
         * Store an editted page
         */
        var savePage = function() {
            sakai.api.Util.progressIndicator.showProgressIndicator(
                sakai.api.i18n.getValueForKey('SAVING_YOUR_PAGE', 'contentauthoring'),
                sakai.api.i18n.getValueForKey('PROCESSING_PAGE', 'contentauthoring'));

            // Alert the widgets that they should be storing their widget data
            $(window).trigger('save.contentauthoring.sakai');
            // Generate the new row / column structure
            var pageLayout = getCurrentPageLayout();

            exitEditMode(true);
            // Determine whether or not to show the empty page placeholder
            determineEmptyAfterSave();

            checkPageReadyToSave(pageLayout.rows, pageLayout.widgetIds);
        };

        /**
         * Check all of the widgets in the current page to see whether they have finished their
         * widget data saving. If so, we can continue to saving the entire page
         * @param {Array} rows          Array of rows in the page with its layout and widgets
         * @param {Array} widgetIds     Array of widget ids for all the widgets in the current page
         */
        var checkPageReadyToSave = function(rows, widgetIds) {
            var isStillStoringWidgetData = false;
            $.each(widgetIds, function(index, widgetId) {
                if (sakai.api.Widgets.widgetLoader.widgets[widgetId] && sakai.api.Widgets.widgetLoader.widgets[widgetId].isStoringWidgetData) {
                    isStillStoringWidgetData = true;
                }
            });
            if (isStillStoringWidgetData) {
                setTimeout(function() {
                    checkPageReadyToSave(rows, widgetIds);
                }, 100);
            } else {
                // Update the currentPage variable
                currentPageShown.content = {};
                currentPageShown.content.rows = rows;
                $.each(widgetIds, function(key, item) {
                    var widgetInfo = sakai.api.Widgets.widgetLoader.widgets[item];
                    currentPageShown.content[item] = (widgetInfo && widgetInfo.widgetData) ? $.extend(true, {}, widgetInfo.widgetData) : false;
                });
                savePageData(rows, widgetIds);
            }
        };

        /**
         * Save the page by moving the autosaved page to the main page. We also version the page
         */
        var savePageData = function() {
            var saveErrorNotification = function(errorText) {
                sakai.api.Util.notification.show(
                    sakai.api.i18n.getValueForKey('AN_ERROR_HAS_OCCURRED'),
                    sakai.api.i18n.getValueForKey('AN_ERROR_OCCURED_SAVING', 'contentauthoring') + ' ' + errorText,
                    sakai.api.Util.notification.type.ERROR, true);
            };

            var oldStorePath = storePath;
            storePath = currentPageShown.pageSavePath + '/' + currentPageShown.saveRef;
            updateWidgetURLs();

            sakai.api.Server.loadJSON(oldStorePath, function(success, data) {
                var errorMsg = '';
                if (success && data) {
                    data = sakai.api.Server.removeServerCreatedObjects(data, ['_']);
                    delete data.version;

                    var batchRequests = [];
                    batchRequests.push({
                        'url': oldStorePath,
                        'method': 'POST',
                        'parameters': {
                            'version': JSON.stringify(data)
                        }
                    });
                    batchRequests.push({
                        'url': oldStorePath,
                        'method': 'POST',
                        'parameters': {
                            // SAKIII-5486
                            ':operation': 'publish-sakaidoc-page',
                            ':dest': storePath,
                            ':replace': true
                        }
                    });
                    batchRequests.push({
                        'url': storePath + '.save.json',
                        'method': 'POST'
                    });
                    batchRequests.push({
                        'url': currentPageShown.pageSavePath,
                        'method': 'POST',
                        'parameters': {
                            'sakai:forceupdate': true
                        }
                    });
                    sakai.api.Server.batch(batchRequests, function(success, data) {
                        var saveSuccessful = true;
                        if (data && data.results) {
                            // each response status code should be 200 for a successful save
                            if (data.results[0] && (!data.results[0].success || data.results[0].status !== 200) ||
                                data.results[1] && (!data.results[1].success || data.results[1].status !== 200) ||
                                data.results[2] && (!data.results[2].success || data.results[2].status !== 200)) {
                                saveSuccessful = false;
                                if (data.results[0].status === 403 || data.results[1].status === 403) {
                                    errorMsg = sakai.api.i18n.getValueForKey('AN_ERROR_OCCURED_403', 'contentauthoring');
                                }
                            }
                        }
                        addEditButtonBinding();
                        if (success && saveSuccessful) {
                            $(window).trigger('update.versions.sakai', currentPageShown);
                        } else {
                            saveErrorNotification(errorMsg);
                            currentPageShown.canEdit = false;
                            $('#contentauthoring_inserterbar_container', $rootel).hide();
                        }
                        sakai.api.Util.progressIndicator.hideProgressIndicator();
                    });
                } else {
                    if (data && data.status === 404) {
                        errorMsg = sakai.api.i18n.getValueForKey('AN_ERROR_OCCURED_404', 'contentauthoring');
                    }
                    saveErrorNotification(errorMsg);
                    currentPageShown.canEdit = false;
                    $('#contentauthoring_inserterbar_container', $rootel).hide();
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            });
        };

        /**
         * Save the current page
         */
        var storeCurrentPageLayout = function() {
            var pageLayout = getCurrentPageLayout().rows;
            sakai.api.Server.saveJSON(storePath + '/rows/', pageLayout, null, true);
        };

        /////////////////
        // CANCEL PAGE //
        /////////////////

        /**
         * This is called when the cancel button is clicked in the inserterbar. At that
         * point, the page is reset to its initial point.
         * @param {Boolean} retainAutoSave      Set to true if the autosave needs to be retained.
         *                                      This is used when navigating away from a page in edit mode.
         */
        var cancelEditPage = function(e, retainAutoSave) {
            exitEditMode(true);
            if (!retainAutoSave) {
                // Delete the autosaved current page
                $.ajax({
                    'url': storePath,
                    'type': 'POST',
                    'data': {
                       ':operation': 'delete'
                    }
                });
            }
            // Store the page in the main location
            storePath = currentPageShown.pageSavePath + '/' + currentPageShown.saveRef;

            // Reset the widget data in the widgetloader
            $.each(currentPageShown.content, function(key, item) {
                if (key.substring(0,1) !== '_' && key !== 'rows' && sakai.api.Widgets.widgetLoader.widgets[key]) {
                    sakai.api.Widgets.widgetLoader.widgets[key].widgetData = item;
                }
            });
            updateWidgetURLs();
            renderPage(currentPageShown, true);
            addEditButtonBinding();
        };

        //////////////
        // AUTOSAVE //
        //////////////

        /**
         * Initialize the autosave dialog
         */
        sakai.api.Util.Modal.setup('#autosave_dialog', {
            modal: true,
            overlay: 20,
            toTop: true
        });

        /**
         * Check whether an autosaved version is present. This would happen when
         * a user left the page during editing
         * @param {Object} pageData Data for the page currently edited
         */
        var checkAutoSave = function(pageData) {
            // Check whether there is an autosaved version
            storePath = currentPageShown.pageSavePath + '/tmp_' + currentPageShown.saveRef;
            sakai.api.Server.loadJSON(storePath, function(success, autoSaveData) {
                // Clean up both versions
                pageData = sakai.api.Server.removeServerCreatedObjects(pageData, ['_']);
                autoSaveData = sakai.api.Server.removeServerCreatedObjects(autoSaveData, ['_']);

                // Remove unncesessary properties for the comparison
                var tmpPageData = $.extend(true, {}, pageData);
                var tmpAutosaveData = $.extend(true, {}, autoSaveData);
                delete tmpPageData.editing;
                delete tmpPageData.editor;
                delete tmpPageData.version;
                delete tmpPageData.safeToEdit;
                delete tmpAutosaveData.editing;
                delete tmpAutosaveData.editor;
                delete tmpAutosaveData.version;
                delete tmpAutosaveData.safeToEdit;

                // Only show the restore overlay if there is an autosave version and the
                // page content has changed
                if (!success || _.isEqual(tmpPageData, tmpAutosaveData) ||
                        !tmpAutosaveData.rows) {
                    makeTempCopy(pageData);
                } else {
                    showRestoreAutoSaveDialog(pageData, autoSaveData);
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            });
        };

        /**
         * Show the overlay that offers the user the ability to restore
         * an autosaved version
         * @param {Object} pageData         Object containing the current page
         * @param {Object} autoSaveData     Object containing the autosaved page
         */
        var showRestoreAutoSaveDialog = function(pageData, autoSaveData) {
            sakai.api.Util.Modal.open($('#autosave_dialog'));
            $('#autosave_keep').off('click').on('click', function() {
                cancelRestoreAutoSave(pageData);
            });
            $('#autosave_revert').off('click').on('click', function() {
                restoreAutoSave(autoSaveData);
            });
        };

        /**
         * This is executed when a user decides not to restore
         * an autosaved version
         * @param {Object} pageData     Object containing the current page
         */
        var cancelRestoreAutoSave = function(pageData) {
            makeTempCopy(pageData);
            sakai.api.Util.Modal.close('#autosave_dialog');
        };

        /**
         * Put the autosaved version into the current page edit mode
         * @param {Object} autoSaveData     Object containing the autosaved page
         */
        var restoreAutoSave = function(autoSaveData) {
            killTinyMCEInstances($pageRootEl);
            var pageStructure = $.extend(true, {}, autoSaveData);
            pageStructure.template = 'all';
            pageStructure.sakai = sakai;
            $pageRootEl.html(sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', pageStructure, false, false));
            sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, storePath + '/', autoSaveData);
            setPageEditActions();
            updateColumnHandles();
            sakai.api.Util.Modal.close('#autosave_dialog');
        };

        /**
         * Make a temporary copy of the current page. This temporary copy will be
         * used to autosave into.
         * @param {Object} data     Page object to make a temporary copy of
         */
        var makeTempCopy = function(data) {

            // Make temporary copy
            sakai.api.Server.copy({
                destination: currentPageShown.pageSavePath + '/tmp_' + currentPageShown.saveRef,
                source: currentPageShown.pageSavePath + '/' + currentPageShown.saveRef,
                replace: true
            }, function() {
                sakai.api.Util.progressIndicator.hideProgressIndicator();
            });

            // Get the widgets in this page and change their save URL
            updateWidgetURLs();
        };

        ///////////////////
        ///////////////////
        // EVENT BINDING //
        ///////////////////
        ///////////////////

        /**
         * Add click handler to the edit button
         */
        var addEditButtonBinding = function() {
            $rootel.on('click', '#inserterbar_action_edit_page', editPage);
        };

        ////////////////////
        // PAGE RENDERING //
        ////////////////////

        // Render a page
        $(window).on('showpage.contentauthoring.sakai', function(ev, _currentPageShown) {
            processNewPage(_currentPageShown, false);
            // scroll to the top of content if it is off screen
            if ($(window).scrollTop() > $rootel.offset().top) {
                $(window).scrollTop($rootel.offset().top);
            }
        });

        // Render a page and put it in edit mode
        $(window).on('editpage.contentauthoring.sakai', function(ev, _currentPageShown) {
            processNewPage(_currentPageShown, true);
        });

        // Revision history
        $(document).on('click', '#inserterbar_action_revision_history', function() {
            $(window).trigger('init.versions.sakai', currentPageShown);
        });

        // Edit page button
        addEditButtonBinding();

        ///////////////////
        // EDIT ROW MENU //
        ///////////////////

        // Edit row button
        $rootel.on('click', '.contentauthoring_row_edit', showEditRowMenu);

        // Remove row button
        $rootel.on('click', '#contentauthoring_row_menu_remove', removeRow);

        // Add row sub menu open
        $rootel.on('focus', '#contentauthoring_row_menu_add', function() {
            $(this).parent().addClass('contentauthoring_addrow_menu_open');
        });

        // Add row sub menu close
        $rootel.on('keyup', '#contentauthoring_row_menu', function() {
            // Don't close menu if focus is on the add row button, or inside the menu
            if (!$('.s3d-dropdown-hassubnav ul button:focus, #contentauthoring_row_menu_add:focus', $(this)).length) {
                $(this).find('.contentauthoring_addrow_menu_open').removeClass('contentauthoring_addrow_menu_open');
            }
        });

        // Add row above button
        $rootel.on('click', '#contentauthoring_row_menu_add, #contentauthoring_row_menu_add_above', function() {
            addRow(true);
        });

        // Add row below button
        $rootel.on('click', '#contentauthoring_row_menu_add_below', function() {
            addRow(false);
        });

        // Change the number of columns to 1
        $rootel.on('click', '#contentauthoring_row_menu_one', function() {
            changeNumberOfColumns(1);
        });

        // Change the number of columns to 2
        $rootel.on('click', '#contentauthoring_row_menu_two', function() {
            changeNumberOfColumns(2);
        });

        // Change the number of columns to 3
        $rootel.on('click', '#contentauthoring_row_menu_three', function() {
            changeNumberOfColumns(3);
        });

        //////////////////
        // KEYBOARD NAV //
        //////////////////

        // cell options
        $rootel.on('keyup', '.contentauthoring_row', function(e) {
            var $container = $(this).parent();
            if (isInEditMode() && (!$container.find('.contentauthoring_row_handle_container').is(':visible') || $container.find('.contentauthoring_row_handle_container').css('visibility') === 'hidden') &&
                $(this).is(':focus') && e.which === $.ui.keyCode.TAB) {
                $('.contentauthoring_row_handle_container', $rootel).css('visibility', 'hidden');
                setRowHoverIn(false, $container);
                $container.find('.contentauthoring_row_handle_container').find('button:visible:first').focus();
            }
        });
        $rootel.on('focus', '.contentauthoring_row_handle_container button', function() {
            hideEditRowMenu();
        });

        // row options
        $rootel.on('keyup', '.contentauthoring_cell_element', function(e) {
            if (e.which === $.ui.keyCode.TAB) {
                showEditCellMenuHoverIn(false, $(this));
            }
        });
        $rootel.on('keydown', '.contentauthoring_cell_element', function(e) {
            if ($('.contentauthoring_cell_element_actions button:last:focus', $(this)).length &&
                e.which === $.ui.keyCode.TAB && !e.shiftKey) {
                $('.contentauthoring_cell_element_actions', $rootel).hide();
            } else if ($(this).is(':focus') && e.which === $.ui.keyCode.TAB && e.shiftKey) {
                showEditCellMenuHoverOut(false, $(this));
            }
        });

        // Insert the default text widget if enter is pressed on a cell
        $rootel.on('keydown', '.contentauthoring_cell', function(e) {
            var $cell = $(this);
            if (isInEditMode() && $cell.is(':focus') && e.which === $.ui.keyCode.ENTER) {
                var $textWidget = $rootel.find('a.inserterbar_text_widget').clone();
                $cell.find('.contentauthoring_cell_content').append($textWidget);
                addNewWidget(null, $textWidget);
            }
        });

        // Change the default filler text to indicate the user can hit enter and begin typing
        $rootel.on('focus', '.contentauthoring_cell', function(e) {
            var $cell = $(this);
            if (isInEditMode() && $cell.is(':focus')) {
                var $dummyEl = $cell.find('.contentauthoring_dummy_element');
                $dummyEl.children('.contentauthoring_dummy_element_dbclick').hide();
                $dummyEl.children('.contentauthoring_dummy_element_enter').show();
            }
        });
        $rootel.on('blur', '.contentauthoring_cell', function(e) {
            var $cell = $(this);
            if (isInEditMode()) {
                var $dummyEl = $cell.find('.contentauthoring_dummy_element');
                $dummyEl.children('.contentauthoring_dummy_element_dbclick').show();
                $dummyEl.children('.contentauthoring_dummy_element_enter').hide();
            }
        });

        /////////////////
        // EDIT WIDGET //
        /////////////////

        // Remove a widget
        $rootel.on('click', '.contentauthoring_cell_element_action_x', removeWidget);

        // Doubleclick on the empty row element
        $rootel.on('dblclick', '.contentauthoring_dummy_element', function(ev) {
            var $el = $(this).attr('data-element-type', 'htmlblock');
            addNewWidget(null, $el);
        });

        // Remove stuck hover highlights
        $rootel.on('mouseout', checkRemoveHighlight);

        // Edit a widget
        $rootel.on('click', '.contentauthoring_cell_element_action_e', editWidgetMode);

        // Close widget settings
        $('#contentauthoring_widget_settings', $rootel).on('click', '.s3d-dialog-close', sakai_global.contentauthoring.widgetCancel);

        /////////////////////////
        // INSERTERBAR ACTIONS //
        /////////////////////////

        // Hitting enter after tabbing to the inserterbar
        $rootel.on('keyup', '.inserterbar_widget_draggable', function(ev) {
            if (ev.which === $.ui.keyCode.ENTER) {
                addNewWidgetPlaceholder($(this).attr('data-element-type'));
            }
        });

        // Clicking on the inserterbar
        $rootel.on('click', '.inserterbar_widget_draggable', function(ev) {
            addNewWidgetPlaceholder($(this).attr('data-element-type'));
        });

        // Save the page
        $rootel.on('click', '#inserterbar_save_edit_page', savePage);

        // Cancel editing the page
        $rootel.on('click', '#inserterbar_cancel_edit_page', cancelEditPage);

        // Called when the inserterbar starts dragging an element, at this point
        // no hovers should be shown
        $(window).on('startdrag.contentauthoring.sakai', function() {
            isDragging = true;
        });

        // Called when the inserterbar stops dragging an element, at this point
        // the hovers should be shown again
        $(window).on('stopdrag.contentauthoring.sakai', function() {
            isDragging = false;
        });

        /////////////
        // HEIGHTS //
        /////////////

        // Called when an element on the page has the potential of changing the
        // height of the column handles
        $(window).on('updateheight.contentauthoring.sakai', updateColumnHeights);

        ////////////////////
        ////////////////////
        // INITIALIZATION //
        ////////////////////
        ////////////////////

        // Load the widgets inside of the content authoring widget (inserterbar, etc.)
        sakai.api.Widgets.widgetLoader.insertWidgets('s3d-page-main-content');

        // Set the contentauthoring ready variable to let the left hand navigation know it can render pages
        sakai_global.contentauthoring.ready = true;
        $(window).trigger('ready.contentauthoring.sakai');





        // This requires API-ifying

        ////////////////////////////
        ////////////////////////////
        // EXTERNAL DRAG AND DROP //
        ////////////////////////////
        ////////////////////////////

        // Upload external content variables
        var externalFilesUploaded = 0;
        var externalFilesToUpload = 0;
        var filesUploaded = [];
        var uploadError = false;

        // Un-highlight on drag leaving drop zone.
        $rootel.on('dragleave dragexit', '.contentauthoring_cell_element', function(ev) {
            $('.contentauthoring_row_reorder_highlight.external_content', $rootel).remove();
            return false;
        });

        // Decide whether the thing dragged in is welcome.
        $rootel.on('dragover', '.contentauthoring_cell_element, .contentauthoring_cell_content, .contentauthoring_row_reorder_highlight', function(ev) {
            if (!$(this).hasClass('contentauthoring_row_reorder_highlight')) {
                if (!$('.contentauthoring_row_reorder_highlight.external_content').length) {
                    $('.contentauthoring_row_reorder_highlight.external_content', $rootel).remove();
                    $(this).append($('<div class="contentauthoring_row_reorder_highlight external_content"></div>'));
                }
            }
            return false;
        });

        // Handle the final drop
        $rootel.on('drop', '.contentauthoring_cell_element, .contentauthoring_cell_content', function(ev) {
            if (isInEditMode()) {
                ev.preventDefault();
                $('.contentauthoring_row_reorder_highlight.external_content', $rootel).remove();
                addExternal(ev, $(this));
            }
            return false;
        });

        //////////////////////////
        // Add existing element //
        //////////////////////////

        var addExistingElement = function(ev, ui) {
            // Generate unique id
            var id = sakai.api.Util.generateWidgetId();

            // Construct post for new embed content
            var contentData = {
                'layout':'single',
                'embedmethod':'original',
                'items': {
                    '__array__0__':'/p/' + ($(ui.item).attr('data-contentId') || $(ui.item).attr('data-collectionId'))
                },
                'title': '',
                'description': '',
                'details': false,
                'download': false,
                'name': false,
                'sakai:indexed-fields':'title,description',
                'sling:resourceType':'sakai/widget-data'
            };

            sakai.api.Server.saveJSON(storePath + '/' + id + '/' + 'embedcontent', contentData, function() {
                var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                    'id': id,
                    'type': 'embedcontent',
                    'template': 'cell',
                    'settingsoverridden': true,
                    'sakai': sakai
                });
                $(ui.item).replaceWith($(element));
                checkColumnsEmpty();
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath + '/');
                checkColumnsEmpty();
                setPageEditActions();
                storeCurrentPageLayout();
                sakai.api.Util.progressIndicator.hideProgressIndicator();
            });
        };

        /////////////////////////////////
        // Add a new element: external //
        /////////////////////////////////

        /**
         * Checks if all dropped files have been uploaded
         * @param {Array} fileArray     Array of files that were uploaded
         * @param {Object} $el          jQuery object on which the link was dropped
         */
        var checkAllExternalFilesUploaded = function(filesUploaded, $el) {
            externalFilesUploaded++;
            if (externalFilesUploaded === externalFilesToUpload) {
                externalFilesUploaded = 0;
                externalFilesToUpload = 0;
                var files = [];
                // Add paths to the array used to set permissions
                $.each(filesUploaded, function(index, item) {
                    files.push(item._path);
                });
                if (files.length) {
                    sakai.api.Content.setFilePermissionsAsParent(files, currentPageShown.savePath, function(success) {
                        // Embed the link in the page
                        var id = sakai.api.Util.generateWidgetId();

                        // Construct post for new embed content
                        var contentData = {
                            'layout':'single',
                            'embedmethod':'original',
                            'items': {},
                            'title': '',
                            'description': '',
                            'details': false,
                            'download': false,
                            'name': false,
                            'sakai:indexed-fields':'title,description',
                            'sling:resourceType':'sakai/widget-data'
                        };
                        if (files.length > 1) {
                            contentData.layout = 'vertical';
                            contentData.embedmethod = 'thumbnail';
                            contentData.name = true;
                        }
                        $.each(filesUploaded, function(index, item) {
                            contentData['items']['__array__' + index + '__'] = '/p/' + item._path;
                        });
                        sakai.api.Server.saveJSON(storePath + '/' + id + '/' + 'embedcontent', contentData, function() {
                            filesUploaded = [];
                            var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                                'id': id,
                                'type': 'embedcontent',
                                'template': 'cell',
                                'settingsoverridden': true,
                                'sakai': sakai
                            });
                            if ($el.hasClass('contentauthoring_cell_element')) {
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            checkColumnsEmpty();
                            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath + '/');
                            setPageEditActions();
                            storeCurrentPageLayout();
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                            if (uploadError) {
                                sakai.api.Util.notification.show(
                                    sakai.api.i18n.getValueForKey('DRAG_AND_DROP_ERROR', 'contentauthoring'),
                                    sakai.api.i18n.getValueForKey('ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR', 'contentauthoring'));
                            }
                        }, true);
                    });
                } else {
                    if (uploadError) {
                        sakai.api.Util.notification.show(
                            sakai.api.i18n.getValueForKey('DRAG_AND_DROP_ERROR', 'contentauthoring'),
                            sakai.api.i18n.getValueForKey('ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR', 'contentauthoring'));
                    }
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            }
        };

        /**
         * Handles drag and drop from the desktop
         * @param {Object} files    Contains the drag and drop file data
         * @param {Object} $el      Element on which the files where dropped
         */
        var uploadExternalFiles = function(files, $el) {
            uploadError = false;
            filesUploaded = [];
            externalFilesToUpload = files.length;
            $.each(files, function(index, file) {
                if (file.size > 0) {
                    var xhReq = new XMLHttpRequest();
                    xhReq.open('POST', '/system/pool/createfile', false);
                    var formData = new FormData();
                    formData.append('enctype', 'multipart/form-data');
                    formData.append('filename', file.name);
                    formData.append('file', file);
                    formData.append('_charset_', 'utf-8');
                    xhReq.send(formData);
                    if (xhReq.status === 201) {
                        filesUploaded.push($.parseJSON(xhReq.responseText)[file.name].item);
                        checkAllExternalFilesUploaded(filesUploaded, $el);
                    } else {
                        checkAllExternalFilesUploaded(filesUploaded, $el);
                    }
                } else {
                    uploadError = true;
                    checkAllExternalFilesUploaded(filesUploaded, $el);
                }
            });
        };

        /**
        * Uploads the dropped link to the system
        * @param {String} link  Link that was dropped
        * @param {Object} $el   jQuery object on which the link was dropped
        */
        var uploadExternalLink = function(link, $el) {
            var preview = sakai.api.Content.getPreviewUrl(link);
            link = {
                'sakai:pooled-content-url': link,
                'mimeType': 'x-sakai/link',
                'sakai:preview-url': preview.url,
                'sakai:preview-type': preview.type,
                'sakai:preview-avatar': preview.avatar,
                'sakai:pooled-content-file-name': link
            };

            $.ajax({
                url: '/system/pool/createfile',
                data: link,
                type: 'POST',
                dataType: 'JSON',
                success: function(data) {
                    var files = [];
                    $.each(data, function(index, item) {
                        files.push(item.poolId);
                    });
                    sakai.api.Content.setFilePermissionsAsParent(files, currentPageShown.savePath, function(success) {
                        // Embed the link in the page
                        var id = sakai.api.Util.generateWidgetId();

                        // Construct post for new embed content
                        var linkData = {
                            'layout':'single',
                            'embedmethod':'original',
                            'title': '',
                            'description': '',
                            'items': {
                                '__array__0__':'/p/' + data._contentItem.poolId
                            },
                            'details':false,
                            'download':false,
                            'name': link,
                            'sakai:indexed-fields':'title,description',
                            'sling:resourceType':'sakai/widget-data'
                        };
                        sakai.api.Server.saveJSON(storePath + '/' + id + '/' + 'embedcontent', linkData, function() {
                            var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                                'id': id,
                                'type': 'embedcontent',
                                'template': 'cell',
                                'settingsoverridden': true,
                                'sakai': sakai
                            });
                            if ($el.hasClass('contentauthoring_cell_element')) {
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            checkColumnsEmpty();
                            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath + '/');
                            setPageEditActions();
                            storeCurrentPageLayout();
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                        }, true);
                    });
                },
                error: function() {
                    debug.error('An error has occured whilst trying to save the link');
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            });
        };

        /**
         * Test if a string is a URL
         * @param {String} text A string of text to test
         * @return {Boolean} returns true if the string of text is a url
         */
         var isUrl = function(text) {
             if (text.indexOf('\n') < 0) {
                 // Contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                 var regEx = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+\|,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+\|,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+\|,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+\|,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+\|,;=]|:|@)|\/|\?)*)?$/i;
                 return regEx.test(text);
             }
             return false;
         };

        /**
        * @param {object} ev    Drop event
        * @param {Object} $el   jQuery object containing the element on which the external content was dropped
        */
        var addExternal = function(ev, $el) {
            var content = false;
            var contentType = 'link';
            var dt = ev.originalEvent.dataTransfer;
            var validURL = false;
            var text = dt.getData('Text');
            if (text && isUrl(text)) {
                validURL = text.indexOf(sakai.config.SakaiDomain.substring(7, sakai.config.SakaiDomain.length)) < 0 ||
                           text.indexOf(sakai.config.SakaiDomain) < 0;
            }
            if (dt.files.length) {
                // We only support browsers that have XMLHttpRequest Level 2
                if (!window.FormData) {
                    return false;
                }
                sakai.api.Util.progressIndicator.showProgressIndicator(
                    sakai.api.i18n.getValueForKey('INSERTING_YOUR_EXTERNAL_CONTENT', 'contentauthoring'),
                    sakai.api.i18n.getValueForKey('PROCESSING_UPLOAD'));
                contentType = 'file';
                content = dt.files;
                uploadExternalFiles(content, $el);
            } else if (validURL) {
                sakai.api.Util.progressIndicator.showProgressIndicator(
                    sakai.api.i18n.getValueForKey('INSERTING_YOUR_EXTERNAL_CONTENT', 'contentauthoring'),
                    sakai.api.i18n.getValueForKey('PROCESSING_UPLOAD'));
                content = text;
                uploadExternalLink(content, $el);
            }
        };
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('contentauthoring');
});
