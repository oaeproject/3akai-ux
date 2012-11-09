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
     * @name sakai_global.pageviewer
     *
     * @class pageviewer
     *
     * @description
     * The page viewer widget shows a Sakai Doc in a simplified way with
     * a custom left hand navigation and no sublevel items
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.pageviewer = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);
        var docPath = '';
        var tempDocData = {};
        var tempItem = false;
        var docData = {};
        var storePath = '';
        var selectedPage = '';

        // Containers
        var $pageViewerContentContainer = $('#pageviewer_content_container', $rootel);
        var $pageViewerLHNavContainer = $('#pageviewer_lhnav_container', $rootel);

        // Templates
        var pageViewerContentTemplate = 'pageviewer_content_template';
        var pageViewerLHNavTemplate = 'pageviewer_lhnav_template';


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Check whether any of the columns in the current page are empty (i.e., they have no widgets
         * inside of them). If so, we add the placeholder widget
         */
        var checkColumnsEmpty = function() {
            var hasContent = false;
            $.each($('.contentauthoring_cell_content:visible', $rootel), function(i, cellcontainer) {
                if ($(cellcontainer).find('.contentauthoring_cell_element').length) {
                    hasContent = true;
                }
            });
            if (!hasContent) {
                $(sakai.api.Util.TemplateRenderer('pageviewer_dummy_element_template', {}, $pageViewerContentContainer));
            }
        };

        /**
         * Renders the page in the widget
         */
        var renderContainer = function() {
            // Check to see that we're not recursively embedding this page
            if (sakai.api.Widgets.isRecursivelyEmbedded($rootel, docPath, tempItem._ref)) {
                return;
            }
            $('.pageviewer_widget', $rootel).show();
            sakai.api.Util.TemplateRenderer(pageViewerContentTemplate, {
                data: docData,
                selectedPage: selectedPage
            }, $pageViewerContentContainer);
            sakai.api.Widgets.widgetLoader.insertWidgets('pageviewer_content_container', false, storePath, false);
            sakai.api.Util.renderMath($pageViewerContentContainer);
            checkColumnsEmpty();
        };

        /**
         * Renders the left hand navigation in the pageviewer widget
         */
        var renderNavigation = function() {
            sakai.api.Util.TemplateRenderer(pageViewerLHNavTemplate, {
                data: docData,
                selectedPage: selectedPage
            }, $pageViewerLHNavContainer, false);

            $pageViewerLHNavContainer.show();

            $('.pageviewer_lhnav_item button', $rootel).on('click', selectPage);
            $('.pageviewer_lhnav_item:first button', $rootel).click();
        };

        /**
         * Parse cells in a column in a row on a page
         * @param {Object} cellIndex Index of the cell
         * @param {Object} cell data for a cell in a column
         */
        var parseCells = function(cellIndex, cell) {
            if ($.isPlainObject(cell)) {
                if (tempDocData[tempItem._ref][cell.id]) {
                    docData[tempItem._ref][cell.id] = {};
                    var cellData = tempDocData[tempItem._ref][cell.id][cell.type];
                    if (cell.type !== 'htmlblock' && cell.type !== 'pagetitle') {
                        docData[tempItem._ref][cell.id][cell.type] = {
                            'embedmethod': cellData.embedmethod,
                            'sakai:indexed-fields': cellData['sakai:indexed-fields'],
                            'download': cellData.download,
                            'title': cellData.title,
                            'details': cellData.details,
                            'description': cellData.description,
                            'name': cellData.name,
                            'layout': cellData.layout,
                            'items': {}
                        };
                        if (cellData.items) {
                            $.each(cellData.items, function(itemsIndex, cellItem) {
                                docData[tempItem._ref][cell.id][cell.type].items[itemsIndex] = cellItem;
                            });
                        }
                    } else {
                        docData[tempItem._ref][cell.id][cell.type] = {
                            'content': cellData.content
                        };
                    }
                }
            }
        };

        /**
         * Parse columns in a row on a page
         * @param {Object} columnIndex Index of the column
         * @param {Object} column data for a column
         */
        var parseColumns = function(columnIndex, column) {
            if ($.isPlainObject(column)) {
                $.each(column.elements, parseCells);
            }
        };

        /**
         * Parse rows on a page
         * @param {Object} rowIndex Index of the row
         * @param {Object} row data for a row
         */
        var parseRows = function(rowIndex, row) {
            if ($.isPlainObject(row)) {
                $.each(row.columns, parseColumns);
            }
        };

        /**
         * Parses the document structure before sending it to the renderer
         */
        var parseStructure = function() {
            var json = $.parseJSON(tempDocData.structure0);
            var pageCount = 0;
            $.each(json, function(index, item) {
                if ($.isPlainObject(item)) {
                    tempItem = item;
                    if (!selectedPage) {
                        selectedPage = tempItem._ref;
                    }
                    docData[tempItem._ref] = {};
                    docData[tempItem._ref].pageTitle = item._title;
                    docData[tempItem._ref]['rows'] = tempDocData[tempItem._ref].rows;
                    storePath = 'p/' + docPath + '/' + tempItem._ref + '/';

                    // Go through rows, columns and cells and extract any content
                    $.each(docData[tempItem._ref]['rows'], parseRows);

                    pageCount++;
                }
            });
            docData.template = 'all';

            // Render the pages and navigation in the widget
            if (pageCount > 1) {
                renderNavigation();
            } else {
                renderContainer();
            }
        };

        /**
         * Selects a page from the left hand navigation
         */
        var selectPage = function() {
            $rootel.find('.tinyMCE').each(function() {
                tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
            });
            var $li = $(this).parent();
            $('.pageviewer_lhnav_item', $rootel).removeClass('selected');
            $li.addClass('selected');
            selectedPage = $li.attr('data-index');
            storePath = 'p/' + docPath + '/' + selectedPage + '/';
            renderContainer();
        };

        /**
         * Fetches the page content
         */
        var fetchPages = function() {
            sakai.api.Server.loadJSON('/p/' + docPath + '.infinity.json', function(success, data) {
                tempDocData = data;
                parseStructure();
            });
        };


        //////////////////////////////
        // Initialization functions //
        //////////////////////////////

        /**
         * Initializes the pageviewer widget
         */
        var doInit = function() {
            fetchPages();
        };

        $(window).off('start.pageviewer.sakai').on('start.pageviewer.sakai', function(ev, data) {
            docPath = data.id;
            doInit();
        });

        $(window).trigger('ready.pageviewer.sakai');

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('pageviewer');
});
