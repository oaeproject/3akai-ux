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
require(['jquery', 'sakai/sakai.api.core', 'jquery-ui'], function($, sakai) {

    /**
     * @name sakai.contentauthoring
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentauthoring = function (tuid, showSettings, widgetData) {

        // Element cache
        var $rootel = $('#' + tuid);
        var $pageRootEl = false;

        // Configuration variables
        var MINIMUM_COLUMN_SIZE = 0.10;
        var DEFAULT_WIDGET_SETTINGS_WIDTH = 650;

        // Help variables
        var pagesCache = {};
        var currentPageShown = {};
        var storePath = false;
        var isDragging = false;

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
                tinyMCE.execCommand( 'mceAddControl', true, $(this).attr('id'));
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
                helper: function(ev, ui) {
                    var $el = $('<div/>');
                    $el.css('width', ui.width() + 'px');
                    $el.css('height', ui.height() + 'px');
                    $el.addClass('contentauthoring_reorder_placeholder');
                    return $el;
                },
                start: function(ev, ui) {
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

        /**
         * Set the onhover and onhoverout functions for each row. When hovering over a
         * row, the edit row menu will be shown. When hovering out of it, it will be
         * hidden
         */
        var setRowHover = function() {
            $('.contentauthoring_row_container', $rootel).unbind('hover');
            $('.contentauthoring_row_container', $rootel).hover(function() {
                // Only show the hover state when we are in edit mode and we are not dragging an element
                if (isInEditMode() && !isDragging) {
                    $('.contentauthoring_row_handle_container', $(this)).css('visibility', 'visible');
                }
            }, function() {
                $('.contentauthoring_row_handle_container', $(this)).css('visibility', 'hidden');
            });
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
                if($('.contentauthoring_row', $('#' + currentPageShown.ref)).length > 1) {
                    $('#contentauthoring_row_menu_remove', $rootel).parent('li').show();
                } else {
                    $('#contentauthoring_row_menu_remove', $rootel).parent('li').hide();
                }
                $($(this).parents('.contentauthoring_row_handle_container')).addClass('selected');
                $('#contentauthoring_row_menu', $rootel).css('left', $(this).parent().position().left + 'px');
                $('#contentauthoring_row_menu', $rootel).css('top', ($(this).parent().position().top + 7) + 'px');
                $('#contentauthoring_row_menu', $rootel).show();
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
                if($item.data('columncount') === numColumns) {
                    $item.find('.s3d-action-icon').addClass('s3d-black-check-icon');
                }
            });
        };

        /**
         * Remove the currently selected row
         * @param {Object} ev   jQuery event object
         */
        var removeRow = function(ev) {
            var $row = $('.contentauthoring_row_container[data-row-id=\'' + rowToChange + '\']', $rootel);
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
            var $row = $('.contentauthoring_row_container[data-row-id=\'' + rowToChange + '\']', $rootel);
            hideEditRowMenu();
            if (insertBefore) {
                $row.before(generateNewRow());
            } else {
                $row.after(generateNewRow());
            }
            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath);
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
         * 
         * @param {Object} $row
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
         * 
         */
        var makeColumnsResizable = function() {
            $(window).trigger('resize.contentauthoring.sakai');
            $('.contentauthoring_cell', $rootel).resizable({
                handles: {
                    'e': '.contentauthoring_cell_handle,.contentauthoring_cell_handle_grab'
                },
                helper: 'ui-resizable-helper',
                start: function(event, ui) {
                    sakai.api.Util.Draggable.setIFrameFix();
                    isDragging = true;
                    var $row = $(this).parent();
                    currentSizes = getColumnWidths($row);
                },
                stop: function(ev, ui) {
                    sakai.api.Util.Draggable.removeIFrameFix();
                    isDragging = false;
                    recalculateColumnWidths(ui, $(this).parent(), currentSizes);
                    $(window).trigger('resize.contentauthoring.sakai');
                    setRowHeight($row);
                    storeCurrentPageLayout();
                }
            });
        };

        /**
         * 
         * @param {Object} ui
         * @param {Object} $row
         * @param {Object} currentSizes
         */
        var recalculateColumnWidths = function(ui, $row, currentSizes) {
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
                if ($($cells[i]).is($(this))) {
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
         * @param {Object} $row jQuery object with class '.contentauthoring_table_row.contentauthoring_cell_container_row'
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
                if (html.length) {
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
                    $('.contentauthoring_cell_content', $row).equalHeights();
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

        var imageLoaded = function(ev, image) {
            setRowHeight($(image).parents('.contentauthoring_table_row.contentauthoring_cell_container_row'));
        };

        /**
         * 
         * @param {Object} changedHTML
         */
        $rootel.contentChange(function(changedHTML) {
            $.each($(changedHTML).find('img:visible'), function(i, item) {
                imageLoaded({}, $(item));
                $(item).load(function(ev) {
                    imageLoaded(ev, $(ev.currentTarget));
                });
            });
        });

        ////////////////////
        // ADDING COLUMNS //
        ////////////////////

        /**
         * 
         * @param {Object} $row
         * @param {Object} totalColumns
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
                $($cells[w]).css('width', widths[w] * (1 - (newColumnWidth * (totalColumns - widths.length))) * 100 + '%');
            }
            setPageEditActions();
            updateColumnHandles();
            storeCurrentPageLayout();
        };

        //////////////////////
        // REMOVING COLUMNS //
        //////////////////////

        /**
         * 
         * @param {Object} $row
         * @param {Object} lastColumn
         */
        var removeColumns = function($row, lastColumn) {
            var widths = getColumnWidths($row);
            var remainingWidth = 1;
            var $cells = $('.contentauthoring_cell', $row);
            $row.find('.contentauthoring_dummy_element').remove();
            // Append the content of the columns that will be removed to the last
            // column that will be retained
            for (var i = lastColumn + 1; i < $cells.length; i++) {
                var $cell = $($cells[i]);
                // De- and re-initialize tinyMCE to avoid errors
                killTinyMCEInstances($cell);
                var $cellcontent = $('.contentauthoring_cell_content', $cell).children();
                initializeTinyMCEInstances($('.contentauthoring_cell_content', $($cells[lastColumn])).append($cellcontent));
                $cell.remove();
                remainingWidth -= widths[i];
            }
            for (var l = 0; l <= lastColumn; l++) {
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
         * 
         * @param {Object} number
         */
        var changeNumberOfColumns = function(number) {
            var $row = $('.contentauthoring_row_container[data-row-id=\'' + rowToChange + '\']', $rootel);
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
         * 
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
         * 
         */
        var reorderWidgets = function() {
            $('.contentauthoring_cell_content', $rootel).sortable({
                connectWith: '.contentauthoring_cell_content',
                ghost: true,
                handle: '.contentauthoring_row_handle',
                placeholder: 'contentauthoring_cell_reorder_highlight',
                opacity: 0.4,
                helper: function(ev, ui) {
                    var $el = $('<div/>');
                    $el.css('width', ui.width() + 'px');
                    $el.css('height', ui.height() + 'px');
                    $el.addClass('contentauthoring_reorder_placeholder');
                    return $el;
                },
                start: function(event, ui) {
                    killTinyMCEInstances($(ui.item));
                    sakai.api.Util.Draggable.setIFrameFix();
                    isDragging = true;
                    $('.contentauthoring_row_handle_container', $rootel).css('visibility', 'hidden');
                    $('.contentauthoring_cell_element_actions', $rootel).hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui) {
                    initializeTinyMCEInstances($(ui.item));
                    sakai.api.Util.Draggable.removeIFrameFix();
                    $(this).sortable('refresh');
                    isDragging = false;
                    $('.contentauthoring_dummy_element', $(this)).remove();
                    // If we've dragged in a piece of content
                    if ($(ui.item).data('contentId') || $(ui.item).data('collectionId')) {
                        addExistingElement(event, ui);  
                    // If we've dragged in a widget
                    } else if ($(ui.item).hasClass("inserterbar_widget_draggable")) {
                        addNewWidget(event, $(ui.item));
                    }
                    storeCurrentPageLayout();
                }
            });
        };

        //////////////////
        // WIDGET HOVER //
        //////////////////

        /**
         * 
         */
        var showEditCellMenu = function() {
            $('.contentauthoring_cell_element', $rootel).unbind('hover');
            $('.contentauthoring_cell_element', $rootel).hover(function() {
                // Only show the hover state when we are in edit mode and we are not dragging an element
                if (isInEditMode() && !isDragging) {
                    $('.contentauthoring_cell_element_actions', $(this)).css('left', $(this).position().left + 'px');
                    $('.contentauthoring_cell_element_actions', $(this)).css('top', ($(this).position().top + 1) + 'px');
                    $('.contentauthoring_cell_element_actions', $(this)).show();
                    $(this).addClass('contentauthoring_cell_element_hover');
                }
            }, function(ev, ui) {
                $('.contentauthoring_cell_element_actions', $rootel).hide();
                $(this).removeClass('contentauthoring_cell_element_hover');
            });
        };

        ///////////////////
        // REMOVE WIDGET //
        ///////////////////

        /**
         * 
         * @param {Object} ev
         */
        var removeWidget = function(ev) {
            var $cell = $(this).parents('.contentauthoring_cell_element');
            var $row = $cell.parents('.contentauthoring_table_row.contentauthoring_cell_container_row');
            killTinyMCEInstances($cell);
            if($(this).parents('.contentauthoring_cell_content').children('.contentauthoring_cell_element').length > 1) {
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
         * 
         * @param {Object} type
         */
        var addNewWidgetPlaceholder = function(type) {
            var $lastRow = $('.contentauthoring_row', $rootel).last().find('.contentauthoring_table_row.contentauthoring_cell_container_row');
            var $element = $('<div />').attr('data-element-type', type);
            $lastRow.find('.contentauthoring_cell_content:last').append($element);
            addNewWidget(null, $element);
        };

        /**
         * 
         * @param {Object} event
         * @param {Object} $addedElement
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
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath);
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
         * 
         */
        $('#contentauthoring_widget_settings', $rootel).jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: sakai_global.contentauthoring.widgetCancel
        });

        /**
         * 
         * @param {Object} id
         * @param {Object} type
         */
        var showEditWidgetMode = function(id, type) {
            currentlyEditing = id;
            $('#contentauthoring_widget_content', $rootel).html('');
            // If the widget exists
            if (sakai.widgets[type]) {
                var widgetSettingsWidth = sakai.widgets[type].settingsWidth || DEFAULT_WIDGET_SETTINGS_WIDTH;
                $('#contentauthoring_widget_settings_content', $rootel).html('<div id="widget_' + type + '_' + id + '" class="widget_inline"/>');
                $('#contentauthoring_widget_settings_title', $rootel).html(sakai.api.Widgets.getWidgetTitle(sakai.widgets[type].id));
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget_settings_content', true, storePath);
                $('#contentauthoring_widget_settings', $rootel).css({
                    'width': widgetSettingsWidth + 'px',
                    'margin-left': -(widgetSettingsWidth / 2) + 'px',
                    'top': ($(window).scrollTop() + 50) + 'px'
                }).jqmShow();
            }
        };

        /**
         * 
         * @param {Object} ev
         */
        var editWidgetMode = function(ev) {
            var id = $(this).attr('data-element-id');
            var type = $(this).attr('data-element-type');
            isEditingNewElement = false;
            showEditWidgetMode(id, type);
        };

        /**
         * 
         */
        sakai_global.contentauthoring.widgetCancel = function() {
            if (isEditingNewElement) {
                $('.contentauthoring_cell_element #' + currentlyEditing, $rootel).parent().remove();
                checkColumnsEmpty();
            }
            isEditingNewElement = false;
            $('#contentauthoring_widget_settings').jqmHide();
            // Remove the widget from the settings overlay
            $('#contentauthoring_widget_content').html('');
        };

        /**
         * 
         */
        sakai_global.contentauthoring.widgetFinish = function() {
            isEditingNewElement = false;
            // Remove the widget from the settings overlay
            $('#contentauthoring_widget_content').html('');
            var $parent = $('.contentauthoring_cell_element #' + currentlyEditing, $rootel).parent();
            $('.contentauthoring_cell_element #' + currentlyEditing, $rootel).remove();
            // Construct the widget
            $parent.append('<div id="widget_' + $parent.attr('data-element-type') + '_' + currentlyEditing + '" class="widget_inline"></div>');
            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath);
            $('#contentauthoring_widget_settings').jqmHide();
            updateAllColumnHandles();
        };

        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.contentauthoring.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.contentauthoring.widgetCancel);

        //////////////////
        //////////////////
        // PAGE ACTIONS //
        //////////////////
        //////////////////

        //////////////////
        // PAGE LOADING //
        //////////////////

        /**
         * 
         * @param {Object} _currentPageShown
         * @param {Object} putInEditMode
         */
        var processNewPage = function(_currentPageShown, putInEditMode) {
            // If the current page is in edit mode, we take it back
            // into view mode
            if (isInEditMode() && currentPageShown) {
                cancelEditPage();
            }
            // Check whether this page has already been loaded
            if (currentPageShown) {
                pagesCache[currentPageShown.ref] = $.extend(true, {}, currentPageShown);
            }
            currentPageShown = pagesCache[_currentPageShown.ref] || _currentPageShown;
            renderPage(currentPageShown);
            // Put the page into edit mode
            if (putInEditMode) {
                editPage();
            }
        };

        /**
         * 
         * @param {Object} currentPageShown
         * @param {Object} requiresRefresh
         */
        var renderPage = function(currentPageShown, requiresRefresh) {
            // Bring the page back to view mode
            exitEditMode();
            $pageRootEl = $('#' + currentPageShown.ref, $rootel);
            showAddPageControls(currentPageShown.addArea);
            // Hide the revision history dialog
            if($('#versions_container').is(':visible')) {
                $('#inserterbar_action_revision_history').trigger('click');
            }
            sakai.api.Widgets.nofityWidgetShown('#contentauthoring_widget > div:visible', false);
            $('#contentauthoring_widget > div:visible', $rootel).hide();
            // Set the path where widgets should be storing their widget data
            storePath = currentPageShown.pageSavePath + '/' + currentPageShown.saveRef + '/';
            // If the page hasn't been loaded before, or we need a refresh after cancelling the
            // page edit, we create a div container for the page
            if ($pageRootEl.length === 0 || requiresRefresh) {
                if (requiresRefresh) {
                    killTinyMCEInstances($pageRootEl);
                    // Remove the old one in case this is caused by a cancel changes option
                    $pageRootEl.remove();
                }
                // Create the new element
                $pageRootEl = $('<div>').attr('id', currentPageShown.ref);
                // Add element to the DOM
                $('#contentauthoring_widget', $rootel).append($pageRootEl);
                var pageStructure = $.extend(true, {}, currentPageShown.content);
                pageStructure.template = 'all';
                pageStructure.sakai = sakai;
                $pageRootEl.html(sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', pageStructure, false, false));
                sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, storePath, currentPageShown.content);
            // If the page has been loaded before, we can just show it again
            } else {
                $pageRootEl.show();
                sakai.api.Widgets.nofityWidgetShown('#' + currentPageShown.ref, true);
            }

            // Determine whether or not to show the empty page placeholder
            determineEmptyPage(currentPageShown);

            // Shwow the edit page bar if I have edit permissions on this page
            if (canEditCurrentPage()) {
                $('#contentauthoring_inserterbar_container', $rootel).show();
            } else {
                $('#contentauthoring_inserterbar_container', $rootel).hide();
            }
        };

        ///////////////////
        // PAGE EDITTING //
        ///////////////////

        /**
         * 
         */
        var setPageEditActions = function() {
            makeRowsReorderable();
            makeColumnsResizable();
            reorderWidgets();
            showEditCellMenu();
            sakai.api.Util.hideOnClickOut('#contentauthoring_row_menu', '.contentauthoring_row_edit', function() {
                rowToChange = false;
                hideEditRowMenu();
            });
        };

        /**
         * 
         */
        var editPage = function() {
            $(window).trigger('edit.contentauthoring.sakai');
            $('.contentauthoring_empty_content', $rootel).remove();
            $('#contentauthoring_widget_container', $pageRootEl).show();
            $rootel.addClass('contentauthoring_edit_mode');
            setPageEditActions();
            updateColumnHandles();
            checkAutoSave();
        };

        //////////////////////
        // PAGE SERIALIZING //
        //////////////////////

        /**
         * 
         */
        var getCurrentPageLayout = function() {
            var rows = [];
            var widgetIds = [];
            // Loop through all of the rows on the page
            $('.contentauthoring_row_container', $pageRootEl).each(function(rindex, $row) {
                $row = $($row);
                var row = {};
                row.id = $row.attr('data-row-id');
                row.columns = [];
                var columnWidths = getColumnWidths($row);
                // Loop through all of the columns in the row
                for (var i = 0; i < columnWidths.length; i++) {
                    var column = {};
                    column.width = columnWidths[i];
                    column.elements = [];
                    // Loop through all of the widgets in the column
                    $.each($('.contentauthoring_cell_element', $($('.contentauthoring_cell', $row).get(i))), function(eindex, $element) {
                        $element = $($element);
                        var element = {};
                        element.type = $element.attr('data-element-type');
                        element.id = $element.attr('data-element-id');
                        column.elements.push(element);
                        widgetIds.push(element.id);
                    });
                    row.columns.push(column);
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
         *
         * @return {Boolean} false if the htmlblock widget is not empty
         *                   true if the htmlblock widget is empty
         */
        var checkHTMLBlockEmpty = function(currentPageShown, element) {
            if (currentPageShown.content[element.id] &&
                currentPageShown.content[element.id].htmlblock &&
                $.trim($(currentPageShown.content[element.id].htmlblock.content).text())) {
                return false;
            }
            return true;
        };

        /**
         * Determines if a page is empty by checking its content
         * Shows a default image when no content is present in the page
         * Empty content = empty rows and rows with empty html blocks
         *
         * @param currentPageShown {Object} Object containing data for the current page
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
                    if(column.elements.length) {
                        $.each(column.elements, function(elIndex, element) {
                            // Check designed to look at specific storage types
                            if(element.type === 'htmlblock') {
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
         * 
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
         * 
         * @param {Object} show
         */
        var showPlaceholder = function(show) {
            if (show) {
                $('#contentauthoring_widget_container', $pageRootEl).hide();
                sakai.api.Util.TemplateRenderer('contentauthoring_no_content_template', {
                    'canEdit': currentPageShown.canEdit
                }, $('#contentauthoring_no_content_container', $rootel));
                $('#contentauthoring_no_content_container', $rootel).show();
            } else {
                $('#contentauthoring_no_content_container', $rootel).hide();
                $('#contentauthoring_widget_container', $pageRootEl).show();
            }
        }

        /////////////////////
        /////////////////////
        // PAGE MANAGEMENT //
        /////////////////////
        /////////////////////

        /**
         * 
         */
        var exitEditMode = function() {
            // Alert the inserter bar that it should go back into view mode
            $(window).trigger('render.contentauthoring.sakai');
            // Take the widget back into view mode
            $rootel.removeClass('contentauthoring_edit_mode');
            $('.contentauthoring_cell_content', $rootel).sortable('destroy');
        };

        /**
         * 
         */
        var updateWidgetURLs = function() {
            // Get the widgets in this page and change their widget storing URL
            var widgets = getWidgetList();
            for (var w in widgets) {
                if (widgets.hasOwnProperty(w) && sakai.api.Widgets.widgetLoader.widgets[widgets[w].id]) {
                    sakai.api.Widgets.widgetLoader.widgets[widgets[w].id].placement = storePath + widgets[w].id + '/' + widgets[w].type + '/';
                }
            }
        };

        ///////////////
        // SAVE PAGE //
        ///////////////

        /**
         * 
         */
        var savePage = function() {
            // Alert the widgets that they should be storing their widget data
            $(window).trigger('save.contentauthoring.sakai');
            // Generate the new row / column structure
            var pageLayout = getCurrentPageLayout();

            exitEditMode();
            // Determine whether or not to show the empty page placeholder
            determineEmptyAfterSave();

            checkPageReadyToSave(pageLayout.rows, pageLayout.widgetIds);

            // Update the currentPage variable
            currentPageShown.content = {};
            currentPageShown.content.rows = pageLayout.rows;
            $.each(pageLayout.widgetIds, function(key, item) {
                var widgetInfo = sakai.api.Widgets.widgetLoader.widgets[item];
                currentPageShown.content[item] = (widgetInfo && widgetInfo.widgetData) ? $.extend({}, true, widgetInfo.widgetData) : false;
            });
        };

        /**
         * 
         * @param {Object} rows
         * @param {Object} widgetIds
         */
        var checkPageReadyToSave = function(rows, widgetIds) {
            var isStillStoringWidgetData = false;
            $.each(widgetIds, function(index, widgetId) {
                if (sakai.api.Widgets.widgetLoader.widgets[widgetId] && sakai.api.Widgets.widgetLoader.widgets[widgetId].isStoringWidgetData) {
                    isStillStoringWidgetData = true;
                }
            });
            if (isStillStoringWidgetData) {
                setTimeout(checkPageReadyToSave, 100, rows, widgetIds);
            } else {
                savePageData(rows, widgetIds);
            }
        };

        /**
         * 
         * @param {Object} rows
         * @param {Object} widgetIds
         */
        var savePageData = function(rows, widgetIds) {
            // Get the current saved data
            sakai.api.Server.loadJSON(storePath, function(success, data) {
                $.ajax({
                    'url': storePath,
                    'type': 'POST',
                    'data': {
                       ':operation': 'delete'
                    }
                });
                // Store the page in the main location
                storePath = currentPageShown.pageSavePath + '/' + currentPageShown.saveRef;
                updateWidgetURLs();
                data.rows = rows;
                // Save the page data
                sakai.api.Server.saveJSON(storePath, data, function() {
                    // Create a new version of the page
                    var versionToStore = sakai.api.Server.removeServerCreatedObjects(data, ['_']);
                    $.ajax({
                        url: storePath + '.save.json',
                        type: 'POST'
                    });
                }, true);
            });
        };

        /**
         * 
         */
        var storeCurrentPageLayout = function() {
            var pageLayout = getCurrentPageLayout().rows;
            sakai.api.Server.saveJSON(storePath + 'rows/', pageLayout, null, true);
        };

        /////////////////
        // CANCEL PAGE //
        /////////////////

        /**
         * 
         */
        var cancelEditPage = function() {
            exitEditMode();
            // Delete the autosaved current page
            $.ajax({
                'url': storePath,
                'type': 'POST',
                'data': {
                   ':operation': 'delete'
                }
            });
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
        };

        //////////////
        // AUTOSAVE //
        //////////////

        /**
         * Initialize the autosave dialog
         */
        $('#autosave_dialog').jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

        /**
         * 
         */
        var checkAutoSave = function() {
            // Cache the current page
            sakai.api.Server.loadJSON(storePath, function(success, pageData) {
                // Check whether there is an autosaved version
                storePath = currentPageShown.pageSavePath + '/tmp_' + currentPageShown.saveRef + '/';
                sakai.api.Server.loadJSON(storePath, function(success2, autoSaveData) {
                    // Clean up both versions
                    pageData = sakai.api.Server.removeServerCreatedObjects(pageData, ['_']);
                    autoSaveData = sakai.api.Server.removeServerCreatedObjects(autoSaveData, ['_']);
                    // Only show the restore overlay if there is an autosave version and the
                    // page content has changed
                    if (!success2 || $.toJSON(pageData) === $.toJSON(autoSaveData)) {
                        makeTempCopy(pageData);
                    } else {
                        showRestoreAutoSaveDialog(pageData, autoSaveData);
                    }
                });
            });
        };

        /**
         * 
         * @param {Object} pageData
         */
        var showRestoreAutoSaveDialog = function(pageData, autoSaveData) {
            sakai.api.Util.bindDialogFocus($('#autosave_dialog'));
            $('#autosave_dialog').jqmShow();
            $('#autosave_keep').unbind('click');
            $('#autosave_keep').bind('click', function() {
                cancelRestoreAutoSave(pageData);
            });
            $('#autosave_revert').unbind('click');
            $('#autosave_revert').bind('click', function() {
                restoreAutoSave(autoSaveData);
            });
        };

        /**
         * 
         * @param {Object} pageData
         */
        var cancelRestoreAutoSave = function(pageData) {
            makeTempCopy(pageData);
            $('#autosave_dialog').jqmHide();
        };

        /**
         * 
         * @param {Object} pageData
         */
        var restoreAutoSave = function(autoSaveData) {
            killTinyMCEInstances($pageRootEl);
            var pageStructure = $.extend(true, {}, autoSaveData);
            pageStructure.template = 'all';
            pageStructure.sakai = sakai;
            $pageRootEl.html(sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', pageStructure, false, false));
            sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, storePath, autoSaveData);
            setPageEditActions();
            updateColumnHandles();
            $('#autosave_dialog').jqmHide();
        };

        /**
         * 
         * @param {Object} data
         */
        var makeTempCopy = function(data) {
            // Make temporary copy 
            sakai.api.Server.saveJSON(storePath, data, null, true);
            // Get the widgets in this page and change their save URL
            updateWidgetURLs();
        };

        /////////////////////////
        /////////////////////////
        // DOCUMENT MANAGEMENT //
        /////////////////////////
        /////////////////////////

        //////////////////////
        // ADDING NEW PAGES //
        //////////////////////

        /**
         * 
         * @param {Object} isWorld
         */
        var showAddPageControls = function(isWorld) {
            if (isWorld) {
                $('#inserterbar_action_add_page_container', $rootel).hide();
                $('#inserterbar_action_add_area_page_container', $rootel).show();
            } else {
                $('#inserterbar_action_add_area_page_container', $rootel).hide();
                $('#inserterbar_action_add_page_container', $rootel).show();
            }
        };

        ///////////////////
        ///////////////////
        // EVENT BINDING //
        ///////////////////
        ///////////////////

        ////////////////////
        // PAGE RENDERING //
        ////////////////////

        //
        $(window).bind('showpage.contentauthoring.sakai', function(ev, _currentPageShown) {
            processNewPage(_currentPageShown, false);
        });

        //
        $(window).bind('editpage.contentauthoring.sakai', function(ev, _currentPageShown) {
            processNewPage(_currentPageShown, true);
        });

        //
        $('#inserterbar_action_edit_page', $rootel).live('click', editPage);

        ///////////////////
        // EDIT ROW MENU //
        ///////////////////

        //
        $('.contentauthoring_row_edit', $rootel).live('click', showEditRowMenu);

        //
        $('#contentauthoring_row_menu_remove', $rootel).live('click', removeRow);

        //
        $('#contentauthoring_row_menu_add_above', $rootel).live('click', function() {
            addRow(true);
        });

        //
        $('#contentauthoring_row_menu_add_below', $rootel).live('click', function() {
            addRow(false);
        });

        //
        $('#contentauthoring_row_menu_one', $rootel).live('click', function() {
            changeNumberOfColumns(1);
        });

        //
        $('#contentauthoring_row_menu_two', $rootel).live('click', function() {
            changeNumberOfColumns(2);
        });

        //
        $('#contentauthoring_row_menu_three', $rootel).live('click', function() {
            changeNumberOfColumns(3);
        });

        /////////////////
        // EDIT WIDGET //
        /////////////////

        //
        $('.contentauthoring_cell_element_action_x', $rootel).live('click', removeWidget);

        //
        $('.contentauthoring_dummy_element', $rootel).live('dblclick', function(ev) {
            var $el = $(this).attr('data-element-type', 'htmlblock');
            addNewWidget(null, $el);
        });

        //
        $('.contentauthoring_cell_element_action_e', $rootel).live('click', editWidgetMode);

        /////////////////////////
        // INSERTERBAR ACTIONS //
        /////////////////////////

        //
        $('.inserterbar_widget_draggable', $rootel).live('keyup', function(ev) {
            if (ev.which === $.ui.keyCode.ENTER) {
                addNewWidgetPlaceholder(ev, $(this).attr('data-element-type'));
            }
        });

        //
        $('.inserterbar_widget_draggable', $rootel).live('dblclick', function(ev) {
            addNewWidgetPlaceholder($(this).attr('data-element-type'));
        });

        //
        $('#inserterbar_save_edit_page', $rootel).live('click', savePage);

        //
        $('#inserterbar_cancel_edit_page', $rootel).live('click', cancelEditPage);

        //
        $(window).bind('startdrag.contentauthoring.sakai', function() {
            isDragging = true;
        });

        //
        $(window).bind('stopdrag.contentauthoring.sakai', function() {
            isDragging = false;
        });

        /////////////
        // HEIGHTS //
        /////////////

        //
        $(window).bind('updateheight.contentauthoring.sakai', updateColumnHeights);

        ////////////////////
        ////////////////////
        // INITIALIZATION //
        ////////////////////
        ////////////////////

        // Load the widgets inside of the content authoring widget (inserterbar, etc.)
        sakai.api.Widgets.widgetLoader.insertWidgets('s3d-page-main-content');

        // Notify the lefthand navigation widget that this widget has been fully loaded,
        // so it can send over its first page to load
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
        $('.contentauthoring_cell_element', $rootel).live('dragleave', function(ev) {
            $('.contentauthoring_row_reorder_highlight.external_content', $rootel).remove();
            return false;
        });

        // Decide whether the thing dragged in is welcome.
        $('.contentauthoring_cell_element, .contentauthoring_cell_content, .contentauthoring_row_reorder_highlight', $rootel).live('dragover', function(ev) {
            $('.contentauthoring_row_reorder_highlight.external_content', $rootel).remove();
            if($(this).hasClass('contentauthoring_cell_element')) {
                $(this).after($('<div class="contentauthoring_row_reorder_highlight external_content"></div>'));
            } else {
                $(this).append($('<div class="contentauthoring_row_reorder_highlight external_content"></div>'));
            }
            return false;
        });

        // Handle the final drop
        $('.contentauthoring_cell_element, .contentauthoring_cell_content', $rootel).live('drop', function(ev) {
            if (isInEditMode()) {
                ev.preventDefault();
                $('.contentauthoring_row_reorder_highlight.external_content', $rootel).remove();
                var dt = ev.originalEvent.dataTransfer;
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
                    '__array__0__':'/p/' + ($(ui.item).data('contentId') || $(ui.item).data('collectionId'))
                },
                'title': '',
                'description': '',
                'details': false,
                'download': false,
                'name': false,
                'sakai:indexed-fields':'title,description',
                'sling:resourceType':'sakai/widget-data'
            };

            sakai.api.Server.saveJSON(storePath + id + '/' + 'embedcontent', contentData, function() {
                var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                    'id': id,
                    'type': 'embedcontent',
                    'template': 'cell',
                    'settingsoverridden': true,
                    'sakai': sakai
                });
                $(ui.item).replaceWith($(element));
                checkColumnsEmpty();
                sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath);
                checkColumnsEmpty();
                setPageEditActions();
                sakai.api.Util.progressIndicator.hideProgressIndicator();
            });
        };

        /////////////////////////////////
        // Add a new element: external //
        /////////////////////////////////

        /**
         * Checks if all dropped files have been uploaded
         * @param fileArray {Array}  Array of files that were uploaded
         * @param $el       {Object} jQuery object on which the link was dropped
         */
        var checkAllExternalFilesUploaded = function(filesUploaded, $el) {
            externalFilesUploaded++;
            if(externalFilesUploaded === externalFilesToUpload) {
                externalFilesUploaded = 0;
                externalFilesToUpload = 0;
                var files = [];
                // Add paths to the array used to set permissions
                $.each(filesUploaded, function(index, item) {
                    files.push(item._path);
                });
                if(files.length) {
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
                        if(files.length > 1) {
                            contentData.layout = 'vertical';
                            contentData.embedmethod = 'thumbnail';
                            contentData.name = true;
                        }
                        $.each(filesUploaded, function(index, item) {
                            contentData['items']['__array__' + index + '__'] = '/p/' + item._path;
                        });
                        sakai.api.Server.saveJSON(storePath + id + '/' + 'embedcontent', contentData, function() {
                            filesUploaded = [];
                            var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                                'id': id,
                                'type': 'embedcontent',
                                'template': 'cell',
                                'settingsoverridden': true,
                                'sakai': sakai
                            });
                            if($el.hasClass('contentauthoring_cell_element')) {
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            checkColumnsEmpty();
                            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath);
                            setPageEditActions();
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
         * @param files {Object} Contains the drag and drop file data
         * @param $el   {Object} Element on which the files where dropped
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
                    xhReq.send(formData);
                    if (xhReq.status == 201) {
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
        * @param link {String} Link that was dropped
        * @param $el  {Object} jQuery object on which the link was dropped
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
                        sakai.api.Server.saveJSON(storePath + id + '/' + 'embedcontent', linkData, function() {
                            var element = sakai.api.Util.TemplateRenderer('contentauthoring_widget_template', {
                                'id': id,
                                'type': 'embedcontent',
                                'template': 'cell',
                                'settingsoverridden': true,
                                'sakai': sakai
                            });
                            if($el.hasClass('contentauthoring_cell_element')) {
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            checkColumnsEmpty();
                            sakai.api.Widgets.widgetLoader.insertWidgets('contentauthoring_widget', false, storePath);
                            setPageEditActions();
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                        }, true);
                    });
                },
                error: function() {
                    debug.log('error!');
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            });
        };

        /**
        * @param ev  {object} Drop event
        * @param $el {Object} jQuery object containing the element on which the external content was dropped
        */
        var addExternal = function(ev, $el) {
            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('INSERTING_YOUR_EXTERNAL_CONTENT', 'contentauthoring'), sakai.api.i18n.getValueForKey('PROCESSING'));
            var content = false;
            var contentType = 'link';
            var dt = ev.originalEvent.dataTransfer;
            if(dt.files.length) {
                contentType = 'file';
                content = dt.files;
                uploadExternalFiles(content, $el);
            } else {
                content = dt.getData('Text');
                uploadExternalLink(content, $el);
            }
        };


    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('contentauthoring');
});
